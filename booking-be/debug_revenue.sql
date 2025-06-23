-- Debug Revenue Data
-- Kiểm tra dữ liệu booking và commission

-- 1. Kiểm tra tất cả bookings đã thanh toán
SELECT 
    b.id as booking_id,
    b.total_amount,
    b.payment_status,
    h.name as hotel_name,
    h.commission_rate,
    h.commission_earned,
    h.total_revenue
FROM bookings b
JOIN hotels h ON b.hotel_id = h.id
WHERE b.payment_status = 'PAID'
ORDER BY b.created_at DESC;

-- 2. Kiểm tra tổng doanh thu từ bookings
SELECT 
    'Total System Revenue' as metric,
    SUM(b.total_amount) as amount
FROM bookings b
WHERE b.payment_status = 'PAID'
UNION ALL
SELECT 
    'Total Commission Earned' as metric,
    SUM(h.commission_earned) as amount
FROM hotels h
UNION ALL
SELECT 
    'Total Hotel Revenue (stored)' as metric,
    SUM(h.total_revenue) as amount
FROM hotels h;

-- 3. Kiểm tra chi tiết từng hotel
SELECT 
    h.id,
    h.name,
    h.commission_rate,
    h.commission_earned,
    h.total_revenue,
    COUNT(b.id) as total_bookings,
    SUM(CASE WHEN b.payment_status = 'PAID' THEN b.total_amount ELSE 0 END) as gross_revenue_from_bookings,
    SUM(CASE WHEN b.payment_status = 'PAID' THEN b.total_amount * h.commission_rate / 100 ELSE 0 END) as calculated_commission
FROM hotels h
LEFT JOIN bookings b ON h.id = b.hotel_id
GROUP BY h.id, h.name, h.commission_rate, h.commission_earned, h.total_revenue
ORDER BY h.name;

-- 4. Kiểm tra có booking nào bị tính commission sai không
SELECT 
    b.id as booking_id,
    b.total_amount,
    h.commission_rate,
    (b.total_amount * h.commission_rate / 100) as should_be_commission,
    h.commission_earned,
    b.created_at
FROM bookings b
JOIN hotels h ON b.hotel_id = h.id
WHERE b.payment_status = 'PAID'
ORDER BY b.created_at DESC; 