-- Create table to track usage statistics
CREATE TABLE public.usage_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_type TEXT NOT NULL CHECK (stat_type IN ('generation', 'like', 'dislike', 'copy')),
  postal_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert stats (anonymous tracking)
CREATE POLICY "Anyone can insert usage stats" 
ON public.usage_stats 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read stats (for displaying counts)
CREATE POLICY "Anyone can read usage stats" 
ON public.usage_stats 
FOR SELECT 
USING (true);

-- Create indexes for faster counting
CREATE INDEX idx_usage_stats_type ON public.usage_stats(stat_type);
CREATE INDEX idx_usage_stats_created ON public.usage_stats(created_at);