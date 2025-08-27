-- Add Google Calendar credentials to users table
ALTER TABLE public.users ADD COLUMN google_access_token TEXT;
ALTER TABLE public.users ADD COLUMN google_refresh_token TEXT;
ALTER TABLE public.users ADD COLUMN google_token_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN google_calendar_connected BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN google_email TEXT;

-- Create a separate table for storing encrypted Google credentials
CREATE TABLE public.google_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  google_email TEXT,
  calendar_list TEXT, -- JSON string of available calendars
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- One credential set per user
);

-- Enable RLS on google_credentials table
ALTER TABLE public.google_credentials ENABLE ROW LEVEL SECURITY;

-- Google credentials policies
CREATE POLICY "Users can read their own google credentials" 
  ON public.google_credentials 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own google credentials" 
  ON public.google_credentials 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own google credentials" 
  ON public.google_credentials 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own google credentials" 
  ON public.google_credentials 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger for updated_at on google_credentials
CREATE TRIGGER update_google_credentials_updated_at 
  BEFORE UPDATE ON public.google_credentials 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Function to update user's google calendar connected status
CREATE OR REPLACE FUNCTION public.update_user_google_status()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.users 
    SET google_calendar_connected = TRUE,
        google_email = NEW.google_email,
        updated_at = now()
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users 
    SET google_calendar_connected = FALSE,
        google_email = NULL,
        updated_at = now()
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language plpgsql security definer set search_path = public;

-- Trigger to update user status when google credentials change
CREATE TRIGGER on_google_credentials_change
  AFTER INSERT OR UPDATE OR DELETE ON public.google_credentials
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_google_status();