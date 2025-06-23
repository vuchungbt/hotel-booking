-- Migration script để thêm revenue columns vào hotels table
-- Thực hiện: mysql -u your_username -p your_database_name < add_revenue_columns.sql

-- Thêm total_revenue column
ALTER TABLE hotels 
ADD COLUMN total_revenue DECIMAL(15,2) DEFAULT 0.00 
COMMENT 'Tổng doanh thu từ tất cả bookings đã thanh toán';

-- Thêm commission_earned column  
ALTER TABLE hotels 
ADD COLUMN commission_earned DECIMAL(15,2) DEFAULT 0.00 
COMMENT 'Tổng hoa hồng đã kiếm được từ bookings';

-- Cập nhật tất cả hotels hiện có với giá trị mặc định
UPDATE hotels 
SET total_revenue = 0.00, commission_earned = 0.00 
WHERE total_revenue IS NULL OR commission_earned IS NULL;

-- Kiểm tra kết quả
SELECT id, name, commission_rate, total_revenue, commission_earned 
FROM hotels 
LIMIT 5;

-- Tính toán lại revenue cho tất cả hotels dựa trên bookings đã thanh toán
-- (Tùy chọn - có thể chạy sau khi deploy code)
UPDATE hotels h 
SET total_revenue = (
    SELECT COALESCE(SUM(b.total_amount), 0) 
    FROM bookings b 
    WHERE b.hotel_id = h.id 
    AND b.payment_status = 'PAID'
),
commission_earned = (
    SELECT COALESCE(SUM(b.total_amount * h.commission_rate / 100), 0) 
    FROM bookings b 
    WHERE b.hotel_id = h.id 
    AND b.payment_status = 'PAID'
);

-- Verify revenue calculation
SELECT 
    h.name,
    h.commission_rate,
    h.total_revenue,
    h.commission_earned,
    (h.total_revenue - h.commission_earned) as net_revenue
FROM hotels h 
WHERE h.total_revenue > 0
ORDER BY h.total_revenue DESC
LIMIT 10; 