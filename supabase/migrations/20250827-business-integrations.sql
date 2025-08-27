-- Add integration fields to bot_configurations table
-- This links integrations directly to business configurations

ALTER TABLE public.bot_configurations 
ADD COLUMN IF NOT EXISTS google_calendar_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS google_calendar_account_id TEXT,
ADD COLUMN IF NOT EXISTS google_calendar_email TEXT,
ADD COLUMN IF NOT EXISTS integration_status TEXT DEFAULT 'none', -- 'none', 'partial', 'complete'
ADD COLUMN IF NOT EXISTS connected_integrations JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_integration_sync TIMESTAMP WITH TIME ZONE;

-- Create index for faster integration queries
CREATE INDEX IF NOT EXISTS idx_bot_configurations_integration_status 
ON public.bot_configurations(integration_status);

-- Create view for business configurations with integration status
CREATE OR REPLACE VIEW public.business_with_integrations AS
SELECT 
  bc.*,
  uam.status as unipile_status,
  uam.account_id as unipile_account_id,
  uam.email as unipile_email,
  uam.provider as integration_provider,
  uam.provider_type,
  CASE 
    WHEN COUNT(uam.id) FILTER (WHERE uam.status = 'connected') > 0 THEN 'connected'
    WHEN COUNT(uam.id) FILTER (WHERE uam.status = 'credentials_error') > 0 THEN 'error'
    ELSE 'none'
  END as overall_integration_status,
  COUNT(uam.id) FILTER (WHERE uam.status = 'connected') as connected_integrations_count,
  ARRAY_AGG(
    CASE WHEN uam.status = 'connected' 
    THEN uam.provider || ':' || COALESCE(uam.provider_type, 'calendar')
    END
  ) FILTER (WHERE uam.status = 'connected') as connected_integration_list
FROM public.bot_configurations bc
LEFT JOIN public.unipile_account_mappings uam ON bc.user_id::text = uam.user_identifier
GROUP BY bc.id, bc.user_id, bc.name, bc.clinic_id, bc.clinic_name, bc.phone_number, 
         bc.operation_hours, bc.microsite_url, bc.address, bc.address_description, 
         bc.state, bc.time_zone, bc.time_zone_offset, bc.booking_link, 
         bc.available_time_slots, bc.time_intervals, bc.wellness_plan_prices, 
         bc.calendar_id, bc.booking_calendar_id, bc.clinic_email, bc.base_id, 
         bc.table_id, bc.booking_workflow, bc.plan_price, bc.created_at, bc.updated_at,
         bc.google_calendar_connected, bc.google_calendar_account_id, bc.google_calendar_email,
         bc.integration_status, bc.connected_integrations, bc.last_integration_sync,
         uam.status, uam.account_id, uam.email, uam.provider, uam.provider_type;

-- Function to sync integration status to bot configuration
CREATE OR REPLACE FUNCTION public.sync_integration_status_to_config(config_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  integration_data JSONB;
  google_calendar_data RECORD;
  integration_status_val TEXT;
BEGIN
  -- Get Google Calendar integration
  SELECT 
    uam.status,
    uam.account_id,
    uam.email
  INTO google_calendar_data
  FROM public.unipile_account_mappings uam
  WHERE uam.user_identifier = config_user_id::text
    AND uam.provider = 'GOOGLE'
    AND uam.provider_type = 'calendar'
    AND uam.status = 'connected'
  LIMIT 1;

  -- Build integration data object
  integration_data := '{}';
  
  IF google_calendar_data.status = 'connected' THEN
    integration_data := integration_data || jsonb_build_object(
      'google_calendar', jsonb_build_object(
        'connected', true,
        'account_id', google_calendar_data.account_id,
        'email', google_calendar_data.email,
        'status', google_calendar_data.status
      )
    );
    integration_status_val := 'partial'; -- Can be extended for multiple integrations
  ELSE
    integration_data := integration_data || jsonb_build_object(
      'google_calendar', jsonb_build_object(
        'connected', false
      )
    );
    integration_status_val := 'none';
  END IF;

  -- Update bot_configurations with integration status
  UPDATE public.bot_configurations 
  SET 
    google_calendar_connected = COALESCE(google_calendar_data.status = 'connected', false),
    google_calendar_account_id = google_calendar_data.account_id,
    google_calendar_email = google_calendar_data.email,
    integration_status = integration_status_val,
    connected_integrations = integration_data,
    last_integration_sync = now()
  WHERE user_id = config_user_id;
END;
$$;

-- Function to get business configuration with current integration status
CREATE OR REPLACE FUNCTION public.get_business_config_with_integrations(config_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  clinic_id TEXT,
  clinic_name TEXT,
  phone_number TEXT,
  operation_hours TEXT,
  microsite_url TEXT,
  address TEXT,
  address_description TEXT,
  state TEXT,
  time_zone TEXT,
  time_zone_offset TEXT,
  booking_link TEXT,
  available_time_slots TEXT,
  time_intervals TEXT,
  wellness_plan_prices TEXT,
  calendar_id TEXT,
  booking_calendar_id TEXT,
  clinic_email TEXT,
  base_id TEXT,
  table_id TEXT,
  booking_workflow TEXT,
  plan_price TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  integration_status TEXT,
  connected_integrations JSONB,
  google_calendar_connected BOOLEAN,
  google_calendar_account_id TEXT,
  google_calendar_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Sync latest integration status first
  PERFORM public.sync_integration_status_to_config(config_user_id);
  
  -- Return updated configuration
  RETURN QUERY
  SELECT 
    bc.id, bc.user_id, bc.name, bc.clinic_id, bc.clinic_name, bc.phone_number,
    bc.operation_hours, bc.microsite_url, bc.address, bc.address_description,
    bc.state, bc.time_zone, bc.time_zone_offset, bc.booking_link,
    bc.available_time_slots, bc.time_intervals, bc.wellness_plan_prices,
    bc.calendar_id, bc.booking_calendar_id, bc.clinic_email, bc.base_id,
    bc.table_id, bc.booking_workflow, bc.plan_price, bc.created_at, bc.updated_at,
    bc.integration_status, bc.connected_integrations, bc.google_calendar_connected,
    bc.google_calendar_account_id, bc.google_calendar_email
  FROM public.bot_configurations bc
  WHERE bc.user_id = config_user_id;
END;
$$;