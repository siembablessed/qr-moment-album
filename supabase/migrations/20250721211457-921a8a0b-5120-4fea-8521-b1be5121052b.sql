-- Allow anyone to view basic info for active events (needed for guest access)
CREATE POLICY "Anyone can view active events basic info" 
ON public.events 
FOR SELECT 
USING (is_active = true);