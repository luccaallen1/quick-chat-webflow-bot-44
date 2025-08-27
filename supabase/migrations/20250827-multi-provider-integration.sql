-- Multi-Provider Integration Support for Unipile
-- Extends existing system to support all Unipile providers

-- Update unipile_account_mappings to support all providers
ALTER TABLE public.unipile_account_mappings 
DROP CONSTRAINT IF EXISTS unipile_account_mappings_provider_check;

ALTER TABLE public.unipile_account_mappings 
ADD CONSTRAINT unipile_account_mappings_provider_check 
CHECK (provider IN (
  'GOOGLE', 
  'MICROSOFT', 
  'IMAP',
  'WHATSAPP', 
  'LINKEDIN', 
  'INSTAGRAM', 
  'MESSENGER', 
  'TWITTER', 
  'TELEGRAM'
));

-- Add provider-specific metadata
ALTER TABLE public.unipile_account_mappings 
ADD COLUMN IF NOT EXISTS provider_type TEXT DEFAULT 'calendar',
ADD COLUMN IF NOT EXISTS provider_subtype TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS capabilities TEXT[] DEFAULT '{}';

-- Update existing Google entries
UPDATE public.unipile_account_mappings 
SET provider_type = 'calendar',
    capabilities = ARRAY['calendar', 'events']
WHERE provider = 'GOOGLE';

-- Create provider configurations table
CREATE TABLE IF NOT EXISTS public.provider_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_type TEXT NOT NULL, -- 'email', 'messaging', 'calendar'
  display_name TEXT NOT NULL,
  description TEXT,
  capabilities TEXT[] DEFAULT '{}',
  connection_flow TEXT DEFAULT 'hosted_auth', -- 'hosted_auth', 'oauth', 'api_key'
  is_active BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_type)
);

-- Insert provider configurations
INSERT INTO public.provider_configurations (provider, provider_type, display_name, description, capabilities) VALUES
-- Calendar Providers
('GOOGLE', 'calendar', 'Google Calendar', 'Connect your Google Calendar for appointment booking and scheduling', ARRAY['calendar', 'events', 'freebusy']),
('MICROSOFT', 'calendar', 'Microsoft Calendar', 'Connect your Outlook/Office 365 calendar for appointment management', ARRAY['calendar', 'events', 'freebusy']),

-- Email Providers  
('GOOGLE', 'email', 'Gmail', 'Connect your Gmail for automated appointment confirmations and communications', ARRAY['email', 'send', 'receive', 'templates']),
('MICROSOFT', 'email', 'Outlook', 'Connect your Outlook email for patient communications', ARRAY['email', 'send', 'receive', 'templates']),
('IMAP', 'email', 'IMAP Email', 'Connect any IMAP-compatible email provider (FastMail, Zoho, GoDaddy, etc.)', ARRAY['email', 'send', 'receive']),

-- Messaging Providers
('WHATSAPP', 'messaging', 'WhatsApp Business', 'Connect WhatsApp Business for patient messaging and appointment reminders', ARRAY['messaging', 'send', 'receive', 'media', 'templates']),
('LINKEDIN', 'messaging', 'LinkedIn', 'Connect LinkedIn for professional networking and communications', ARRAY['messaging', 'send', 'receive', 'connections']),
('INSTAGRAM', 'messaging', 'Instagram Direct', 'Connect Instagram Direct Messages for patient outreach', ARRAY['messaging', 'send', 'receive', 'media']),
('MESSENGER', 'messaging', 'Facebook Messenger', 'Connect Facebook Messenger for patient communications', ARRAY['messaging', 'send', 'receive', 'media']),
('TWITTER', 'messaging', 'Twitter/X DMs', 'Connect Twitter Direct Messages for social media engagement', ARRAY['messaging', 'send', 'receive']),
('TELEGRAM', 'messaging', 'Telegram', 'Connect Telegram for secure patient messaging', ARRAY['messaging', 'send', 'receive', 'media', 'bots'])
ON CONFLICT (provider, provider_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  capabilities = EXCLUDED.capabilities,
  updated_at = now();

-- Create user integrations summary view
CREATE OR REPLACE VIEW public.user_integrations_summary AS
SELECT 
  u.id as user_id,
  u.email as user_email,
  COUNT(uam.id) as total_connections,
  COUNT(CASE WHEN uam.provider_type = 'calendar' THEN 1 END) as calendar_connections,
  COUNT(CASE WHEN uam.provider_type = 'email' THEN 1 END) as email_connections,
  COUNT(CASE WHEN uam.provider_type = 'messaging' THEN 1 END) as messaging_connections,
  ARRAY_AGG(
    CASE WHEN uam.status = 'connected' 
    THEN uam.provider || ':' || COALESCE(uam.provider_type, 'calendar')
    END
  ) FILTER (WHERE uam.status = 'connected') as connected_providers,
  MAX(uam.updated_at) as last_connection_update
FROM public.users u
LEFT JOIN public.unipile_account_mappings uam ON u.id::text = uam.user_identifier
GROUP BY u.id, u.email;

-- Enable RLS on new table
ALTER TABLE public.provider_configurations ENABLE ROW LEVEL SECURITY;

-- RLS policies for provider_configurations (public read)
CREATE POLICY "Provider configurations are viewable by everyone" ON public.provider_configurations
  FOR SELECT USING (true);

-- Create function to get user's connected providers
CREATE OR REPLACE FUNCTION public.get_user_connected_providers(user_uuid UUID)
RETURNS TABLE (
  provider TEXT,
  provider_type TEXT,
  display_name TEXT,
  capabilities TEXT[],
  account_id TEXT,
  status TEXT,
  email TEXT,
  connected_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uam.provider,
    COALESCE(uam.provider_type, 'calendar') as provider_type,
    pc.display_name,
    pc.capabilities,
    uam.account_id,
    uam.status,
    uam.email,
    uam.created_at as connected_at
  FROM public.unipile_account_mappings uam
  LEFT JOIN public.provider_configurations pc ON uam.provider = pc.provider 
    AND COALESCE(uam.provider_type, 'calendar') = pc.provider_type
  WHERE uam.user_identifier = user_uuid::text
    AND uam.status = 'connected'
  ORDER BY uam.created_at DESC;
END;
$$;

-- Create function to check if user has specific capability
CREATE OR REPLACE FUNCTION public.user_has_capability(user_uuid UUID, capability_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_capability BOOLEAN DEFAULT FALSE;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM public.unipile_account_mappings uam
    JOIN public.provider_configurations pc ON uam.provider = pc.provider 
      AND COALESCE(uam.provider_type, 'calendar') = pc.provider_type
    WHERE uam.user_identifier = user_uuid::text
      AND uam.status = 'connected'
      AND capability_name = ANY(pc.capabilities)
  ) INTO has_capability;
  
  RETURN has_capability;
END;
$$;