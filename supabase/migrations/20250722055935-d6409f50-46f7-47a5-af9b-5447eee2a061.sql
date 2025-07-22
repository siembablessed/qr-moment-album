-- Add policy for guests to view approved photos from active events
CREATE POLICY "Guests can view approved photos from active events" 
ON public.event_photos 
FOR SELECT 
USING (
  is_approved = true 
  AND EXISTS (
    SELECT 1 
    FROM events 
    WHERE events.id = event_photos.event_id 
    AND events.is_active = true
  )
);