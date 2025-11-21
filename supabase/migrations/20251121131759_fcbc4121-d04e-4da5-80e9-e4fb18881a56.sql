-- Add due_date column to todos table
ALTER TABLE public.todos 
ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on due date queries
CREATE INDEX idx_todos_due_date ON public.todos(due_date) WHERE due_date IS NOT NULL;