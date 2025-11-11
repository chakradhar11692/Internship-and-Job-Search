-- Add additional columns to applications table for better tracking
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS interview_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS salary_offered INTEGER,
ADD COLUMN IF NOT EXISTS application_url TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Update status enum to include more states
ALTER TABLE public.applications 
DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE public.applications 
ADD CONSTRAINT applications_status_check 
CHECK (status IN ('Applied', 'Under Review', 'Interview Scheduled', 'Interview Completed', 'Offer Received', 'Rejected', 'Withdrawn'));

-- Create application_notes table for detailed tracking
CREATE TABLE IF NOT EXISTS public.application_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN ('general', 'interview', 'follow_up', 'offer', 'rejection')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for application_notes
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for application_notes
CREATE POLICY "Users can view notes for their applications" ON public.application_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.applications 
      WHERE applications.id = application_notes.application_id 
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert notes for their applications" ON public.application_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications 
      WHERE applications.id = application_notes.application_id 
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update notes for their applications" ON public.application_notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.applications 
      WHERE applications.id = application_notes.application_id 
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete notes for their applications" ON public.application_notes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.applications 
      WHERE applications.id = application_notes.application_id 
      AND applications.user_id = auth.uid()
    )
  );
