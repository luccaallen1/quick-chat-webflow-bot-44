-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot_configurations table
CREATE TABLE public.bot_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  clinic_id TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  operation_hours TEXT NOT NULL,
  microsite_url TEXT NOT NULL,
  address TEXT NOT NULL,
  address_description TEXT,
  state TEXT NOT NULL,
  time_zone TEXT NOT NULL,
  time_zone_offset TEXT NOT NULL,
  booking_link TEXT NOT NULL,
  available_time_slots TEXT NOT NULL,
  time_intervals TEXT NOT NULL,
  wellness_plan_prices TEXT NOT NULL,
  calendar_id TEXT NOT NULL,
  booking_calendar_id TEXT NOT NULL,
  clinic_email TEXT NOT NULL,
  base_id TEXT NOT NULL,
  table_id TEXT NOT NULL,
  booking_workflow TEXT NOT NULL,
  plan_price TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_configurations ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read their own data" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Bot configurations policies  
CREATE POLICY "Users can read their own configurations" 
  ON public.bot_configurations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own configurations" 
  ON public.bot_configurations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configurations" 
  ON public.bot_configurations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own configurations" 
  ON public.bot_configurations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ language plpgsql security definer set search_path = public;

-- Trigger to call the function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_bot_configurations_updated_at 
  BEFORE UPDATE ON public.bot_configurations 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();