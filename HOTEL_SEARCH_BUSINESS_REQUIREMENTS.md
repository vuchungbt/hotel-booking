# YÊU CẦU NGHIỆP VỤ TÌM KIẾM KHÁCH SẠN

## 1. SEARCH CRITERIA CORE (Bắt buộc)

### Primary Search Fields
- **Location** (Thành phố/Khu vực): Tìm kiếm theo địa điểm
- **Check-in Date**: Ngày nhận phòng
- **Check-out Date**: Ngày trả phòng  
- **Guests**: Số lượng khách
- **Rooms**: Số phòng cần đặt

### Advanced Filters
- **Price Range**: Khoảng giá theo ngày
- **Star Rating**: Hạng sao khách sạn
- **Amenities**: Tiện ích (WiFi, Pool, Spa, etc.)
- **Property Type**: Loại hình (Hotel, Resort, Villa)
- **Distance**: Khoảng cách từ trung tâm/điểm quan tâm

## 2. SEARCH PROCESSING LOGIC

### Step 1: Input Validation
```
- Check-in >= Today
- Check-out > Check-in  
- Guests >= 1, <= Max allowed
- Location không empty
```

### Step 2: Availability Check
```
FOR each hotel in location:
  FOR each room type in hotel:
    IF room có đủ capacity cho guests:
      IF có available rooms trong date range:
        INCLUDE in results
```

### Step 3: Real-time Pricing
```
- Calculate price cho number of nights
- Apply seasonal pricing rules
- Include taxes and fees
- Show total cost
```

### Step 4: Sorting Options
- **Price**: Thấp -> Cao, Cao -> Thấp
- **Rating**: Cao -> Thấp
- **Distance**: Gần -> Xa
- **Popularity**: Phổ biến nhất

## 3. SEARCH RESULTS DISPLAY

### Hotel Card Information
- Hotel name, star rating, location
- **Lowest available price** for date range
- Main amenities (top 3-4)
- Guest rating và số reviews
- **"Book Now"** CTA with price

### Advanced Features
- **Map view** with hotel locations
- **Comparison tool** để so sánh hotels
- **Save favorites** cho logged users
- **Recently viewed** hotels

## 4. PERFORMANCE REQUIREMENTS

- Search results < 3 seconds
- Support 1000+ concurrent searches
- Cache popular searches for 15 minutes
- Elasticsearch for advanced search (nếu có)

## 5. MISSING IN CURRENT SYSTEM

❌ **Date-based availability filtering**
❌ **Real-time pricing calculation**  
❌ **Advanced location search** (nearby areas)
❌ **Search result caching**
❌ **Auto-suggestions** for locations
❌ **Map integration**
❌ **Mobile-optimized search** 