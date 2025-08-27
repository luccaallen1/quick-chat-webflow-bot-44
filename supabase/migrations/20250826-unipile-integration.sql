-- Drop existing Google Calendar tables if they exist (we're switching to Unipile)
DROP TABLE IF EXISTS public.google_credentials CASCADE;

-- Remove Google Calendar columns from users table
ALTER TABLE public.users DROP COLUMN IF EXISTS google_access_token;
ALTER TABLE public.users DROP COLUMN IF EXISTS google_refresh_token;
ALTER TABLE public.users DROP COLUMN IF EXISTS google_token_expires_at;
ALTER TABLE public.users DROP COLUMN IF EXISTS google_calendar_connected;
ALTER TABLE public.users DROP COLUMN IF EXISTS google_email;

-- Create Unipile accounts table
CREATE TABLE public.unipile_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'GOOGLE',
  account_id TEXT NOT NULL, -- Unipile account ID
  status TEXT NOT NULL DEFAULT 'connected', -- connected, disconnected, credentials_error
  email TEXT, -- Provider email (e.g., Google email)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider), -- One account per provider per user
  UNIQUE(account_id) -- Unipile account_id is globally unique
);

-- Create Google calendars table for calendar selection
CREATE TABLE public.google_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  calendar_id TEXT NOT NULL, -- Google Calendar ID
  summary TEXT NOT NULL, -- Calendar name/title
  primary_calendar BOOLEAN DEFAULT FALSE,
  selected BOOLEAN DEFAULT FALSE, -- User's selected calendar for bookings
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, calendar_id) -- One entry per calendar per user
);

-- Create bookings table to track appointments
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  calendar_id TEXT NOT NULL, -- Google Calendar ID where event was created
  event_id TEXT NOT NULL, -- Google Calendar Event ID
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  patient_name TEXT NOT NULL,
  patient_email TEXT,
  patient_phone TEXT,
  source TEXT NOT NULL, -- 'web', 'sms', 'facebook', 'instagram'
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed, cancelled, rescheduled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id) -- Google Calendar Event ID is unique
);

-- Enable RLS on all tables
ALTER TABLE public.unipile_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Unipile accounts policies
CREATE POLICY "Users can read their own unipile accounts" 
  ON public.unipile_accounts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unipile accounts" 
  ON public.unipile_accounts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own unipile accounts" 
  ON public.unipile_accounts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own unipile accounts" 
  ON public.unipile_accounts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Google calendars policies
CREATE POLICY "Users can read their own google calendars" 
  ON public.google_calendars 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own google calendars" 
  ON public.google_calendars 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own google calendars" 
  ON public.google_calendars 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own google calendars" 
  ON public.google_calendars 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Users can read their own bookings" 
  ON public.bookings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" 
  ON public.bookings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
  ON public.bookings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookings" 
  ON public.bookings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_unipile_accounts_updated_at 
  BEFORE UPDATE ON public.unipile_accounts 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_google_calendars_updated_at 
  BEFORE UPDATE ON public.google_calendars 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON public.bookings 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Function to automatically set selected calendar when first calendar is added
CREATE OR REPLACE FUNCTION public.set_default_selected_calendar()
RETURNS trigger AS $$
BEGIN
  -- If this is the first calendar for this user, mark it as selected
  IF NOT EXISTS (
    SELECT 1 FROM public.google_calendars 
    WHERE user_id = NEW.user_id AND selected = TRUE
  ) THEN
    NEW.selected := TRUE;
  END IF;
  
  -- If this calendar is marked as primary, also mark it as selected
  IF NEW.primary_calendar = TRUE THEN
    -- Unselect other calendars
    UPDATE public.google_calendars 
    SET selected = FALSE 
    WHERE user_id = NEW.user_id AND id != NEW.id;
    
    NEW.selected := TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ language plpgsql security definer set search_path = public;

-- Trigger to set default selected calendar
CREATE TRIGGER on_calendar_insert_set_default
  BEFORE INSERT ON public.google_calendars
  FOR EACH ROW EXECUTE PROCEDURE public.set_default_selected_calendar();

-- Function to update user's calendar connection status
CREATE OR REPLACE FUNCTION public.update_user_calendar_status()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update users table to reflect calendar connection status
    UPDATE public.users 
    SET updated_at = now()
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users 
    SET updated_at = now()
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language plpgsql security definer set search_path = public;

-- Trigger to update user status when Unipile account changes
CREATE TRIGGER on_unipile_account_change
  AFTER INSERT OR UPDATE OR DELETE ON public.unipile_accounts
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_calendar_status();

-- Indexes for performance
CREATE INDEX idx_unipile_accounts_user_id ON public.unipile_accounts(user_id);
CREATE INDEX idx_unipile_accounts_account_id ON public.unipile_accounts(account_id);
CREATE INDEX idx_unipile_accounts_status ON public.unipile_accounts(status);

CREATE INDEX idx_google_calendars_user_id ON public.google_calendars(user_id);
CREATE INDEX idx_google_calendars_selected ON public.google_calendars(selected);

CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_event_id ON public.bookings(event_id);
CREATE INDEX idx_bookings_source ON public.bookings(source);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_start_time ON public.bookings(start_time);