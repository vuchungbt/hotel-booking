-- Reset Commission - Simple Solution
-- Đặt lại commission về 0 và tính lại từ đầu

-- 1. Reset tất cả commission về 0
UPDATE hotels 
SET commission_earned = 0.00
WHERE commission_earned IS NOT NULL;

-- 2. Kiểm tra kết quả
SELECT 
    h.name as hotel_name,
    h.commission_rate,
    h.commission_earned,
    COUNT(b.id) as paid_bookings,
    COALESCE(SUM(b.total_amount), 0) as total_revenue_from_bookings
FROM hotels h
LEFT JOIN bookings b ON h.id = b.hotel_id AND b.payment_status = 'PAID'
GROUP BY h.id, h.name, h.commission_rate, h.commission_earned
ORDER BY h.name;

-- 3. Thông báo
SELECT 'Commission reset completed. Now test with a new booking payment to verify single calculation.' as message; 