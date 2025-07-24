
-- Create a table for demo requests
CREATE TABLE public.demo_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  purpose_of_chatbot TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to the demo_requests table
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to insert demo requests (public form)
CREATE POLICY "Anyone can submit demo requests" 
  ON public.demo_requests 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that prevents public reading of demo requests (admin only)
CREATE POLICY "No public access to demo requests" 
  ON public.demo_requests 
  FOR SELECT 
  USING (false);
