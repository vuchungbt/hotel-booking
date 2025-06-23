-- Fix Commission Calculation
-- Reset và tính lại commission đúng

-- 1. Reset tất cả commission về 0
UPDATE hotels 
SET commission_earned = 0, total_revenue = 0
WHERE commission_earned IS NOT NULL OR total_revenue IS NOT NULL;

-- 2. Tính lại commission cho từng hotel dựa trên bookings đã thanh toán
UPDATE hotels h
SET commission_earned = (
    SELECT COALESCE(SUM(b.total_amount * h.commission_rate / 100), 0)
    FROM bookings b
    WHERE b.hotel_id = h.id 
    AND b.payment_status = 'PAID'
);

-- 3. Kiểm tra kết quả sau khi fix
SELECT 
    h.name as hotel_name,
    h.commission_rate,
    COUNT(b.id) as paid_bookings,
    SUM(b.total_amount) as gross_revenue,
    (SUM(b.total_amount) * h.commission_rate / 100) as calculated_commission,
    h.commission_earned as stored_commission,
    CASE 
        WHEN h.commission_earned = (SUM(b.total_amount) * h.commission_rate / 100) 
        THEN 'CORRECT' 
        ELSE 'INCORRECT' 
    END as status
FROM hotels h
LEFT JOIN bookings b ON h.id = b.hotel_id AND b.payment_status = 'PAID'
GROUP BY h.id, h.name, h.commission_rate, h.commission_earned
ORDER BY h.name;

-- 4. Tổng kết sau khi fix
SELECT 
    'Total System Revenue' as metric,
    SUM(b.total_amount) as amount
FROM bookings b
WHERE b.payment_status = 'PAID'
UNION ALL
SELECT 
    'Total Commission (should be 15%)' as metric,
    SUM(h.commission_earned) as amount
FROM hotels h
UNION ALL
SELECT 
    'Expected Commission (15% of system revenue)' as metric,
    (SELECT SUM(b.total_amount) * 0.15 FROM bookings b WHERE b.payment_status = 'PAID') as amount; 