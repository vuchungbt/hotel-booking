# Fix: Website Field và các Optional Fields Validation

## ✅ **Vấn đề đã giải quyết**

### 🐛 **Lỗi gốc:**
```
2025-06-07T12:36:23.342+07:00  INFO 13708 --- [booking-service] [io-8080-exec-10] 
n.b.b.e.IdentityExceptionHandler : No enum constant net.blwsmartware.booking.enums.ErrorResponse.Invalid website URL format
```

### 🔍 **Nguyên nhân:**
- Validation pattern `@Pattern` không cho phép giá trị **empty/null**
- Khi user để trống trường Website → validation fail
- Các trường khác cũng có vấn đề tương tự

## 🔧 **Các thay đổi đã thực hiện**

### **1. HotelCreateRequest.java**
```java
// ❌ Trước đây - Không cho phép empty
@Pattern(regexp = "^(https?://)?...", message = "Invalid website URL format")

// ✅ Sau khi sửa - Cho phép empty HOẶC valid URL  
@Pattern(regexp = "^$|^(https?://)?...", message = "Invalid website URL format")
```

### **2. Các trường đã được sửa:**
- ✅ **website**: `^$|^(https?://)?(www\.)?[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(/.*)?$`
- ✅ **phone**: `^$|^[+]?[0-9\s\-\(\)]{10,15}$`  
- ✅ **checkInTime**: `^$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$`
- ✅ **checkOutTime**: `^$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$`

### **3. Logic mới:**
- `^$` → Cho phép **empty string**
- `|` → Hoặc
- `^(original pattern)$` → Hoặc **valid format**

## 📋 **Files đã cập nhật**

### **Backend:**
1. ✅ `booking-be/src/main/java/net/blwsmartware/booking/dto/request/HotelCreateRequest.java`
2. ✅ `booking-be/src/main/java/net/blwsmartware/booking/dto/request/HotelUpdateRequest.java`  
3. ✅ `booking-be/API_DOCUMENTATION.md`

### **Frontend:**
- ✅ Không cần thay đổi (frontend đã handle được)

## 🎯 **Kết quả**

### **Trước khi sửa:**
- ❌ Website trống → Lỗi validation
- ❌ Phone trống → Lỗi validation  
- ❌ CheckIn/CheckOut time trống → Lỗi validation

### **Sau khi sửa:**
- ✅ Website trống → **OK**
- ✅ Website = "https://example.com" → **OK**
- ✅ Website = "invalid-url" → **Lỗi validation** (đúng)
- ✅ Phone trống → **OK**
- ✅ Phone = "+84 123 456 789" → **OK**
- ✅ CheckIn/CheckOut time trống → **OK**

## 🧪 **Test Cases**

### **Valid requests:**
```json
{
  "name": "Hotel ABC",
  "address": "123 Street",
  "website": "",           // ✅ OK - Empty
  "phone": "",             // ✅ OK - Empty  
  "checkInTime": "",       // ✅ OK - Empty
  "checkOutTime": ""       // ✅ OK - Empty
}
```

```json
{
  "name": "Hotel XYZ", 
  "address": "456 Street",
  "website": "https://hotel.com",    // ✅ OK - Valid URL
  "phone": "+84-123-456-789",        // ✅ OK - Valid phone
  "checkInTime": "14:00",            // ✅ OK - Valid time
  "checkOutTime": "12:00"            // ✅ OK - Valid time
}
```

### **Invalid requests:**
```json
{
  "name": "Hotel Invalid",
  "address": "789 Street", 
  "website": "not-a-url",           // ❌ Error - Invalid format
  "phone": "abc123",                // ❌ Error - Invalid format
  "checkInTime": "25:00"            // ❌ Error - Invalid time
}
```

## 🚀 **Deployment**

### **Cần thực hiện:**
1. ✅ **Build lại backend** với validation mới
2. ✅ **Test API** tạo hotel với website trống
3. ✅ **Deploy** lên production

### **Backwards compatibility:**
- ✅ **100% tương thích** với frontend hiện tại
- ✅ **Không breaking change** cho API consumers

---
**Status**: ✅ **RESOLVED** - Website và các optional fields giờ đây có thể để trống 