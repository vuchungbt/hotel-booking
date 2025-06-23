-- Add commission_rate_at_booking column to bookings table
-- This field will store the commission rate at the time of booking

ALTER TABLE bookings 
ADD COLUMN commission_rate_at_booking DECIMAL(5,2) DEFAULT 15.00;

-- Update existing bookings with default commission rate
UPDATE bookings 
SET commission_rate_at_booking = 15.00 
WHERE commission_rate_at_booking IS NULL;

-- Add comment to explain the field
ALTER TABLE bookings 
MODIFY COLUMN commission_rate_at_booking DECIMAL(5,2) DEFAULT 15.00 
COMMENT 'Commission rate at the time of booking creation'; 