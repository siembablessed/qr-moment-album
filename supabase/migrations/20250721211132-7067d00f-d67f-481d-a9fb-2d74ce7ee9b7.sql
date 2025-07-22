-- Update existing QR codes to point to guest route instead of event route
UPDATE events 
SET qr_code_data = REPLACE(qr_code_data, '/event/', '/guest/') 
WHERE qr_code_data LIKE '%/event/%';