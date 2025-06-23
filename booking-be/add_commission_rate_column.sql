-- Migration script để thêm commission_rate column vào hotels table
-- Thực hiện: mysql -u your_username -p your_database_name < add_commission_rate_column.sql

-- Thêm commission_rate column với default value 15.00
ALTER TABLE hotels 
ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 15.00 
COMMENT 'Tỷ lệ hoa hồng (%) - mặc định 15%';

-- Cập nhật tất cả hotels hiện có với commission_rate = 15.00 (để đảm bảo)
UPDATE hotels 
SET commission_rate = 15.00 
WHERE commission_rate IS NULL;

-- Kiểm tra kết quả
SELECT id, name, commission_rate 
FROM hotels 
LIMIT 5; 