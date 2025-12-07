-- Add time tracking columns to todos table
ALTER TABLE public.todos 
ADD COLUMN estimated_time INTEGER DEFAULT NULL,
ADD COLUMN elapsed_time INTEGER DEFAULT 0,
ADD COLUMN timer_status TEXT DEFAULT 'stopped' CHECK (timer_status IN ('stopped', 'running', 'paused')),
ADD COLUMN timer_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;