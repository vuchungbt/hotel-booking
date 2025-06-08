# YÊU CẦU NGHIỆP VỤ ĐẶT PHÒNG KHÁCH SẠN

## 1. BOOKING FLOW LOGIC

### Phase 1: Pre-Booking Validation
```
1. Check room availability for exact dates
2. Verify pricing is still current
3. Validate guest count vs room capacity
4. Check hotel policies (min stay, etc.)
```

### Phase 2: Guest Information Collection
```
- Primary guest full name (required)
- Email address (required, for confirmation)
- Phone number (recommended)
- Special requests (optional)
- Additional guest names (for group bookings)
```

### Phase 3: Payment Processing
```
1. Calculate final price:
   - Base room rate × nights
   - Taxes and service fees
   - Any promotional discounts
   
2. Payment methods support:
   - Credit/Debit cards
   - Bank transfer
   - Digital wallets (MoMo, ZaloPay)
   - PayPal
   
3. Payment security:
   - PCI DSS compliance
   - SSL encryption
   - Tokenization for card storage
```

### Phase 4: Booking Confirmation
```
1. Create booking record with unique ID
2. Update room inventory (reduce available count)
3. Send confirmation email với booking details
4. Generate booking voucher/QR code
5. Schedule reminder emails
```

## 2. INVENTORY MANAGEMENT

### Real-time Availability Updates
```
- Mỗi booking phải update available rooms immediately
- Handle concurrent bookings (race conditions)
- Block rooms during payment process (5-10 minutes)
- Release blocked rooms if payment fails
```

### Overbooking Prevention
```java
// Pseudocode
synchronized(roomType) {
    if (roomType.availableRooms >= requestedRooms) {
        roomType.availableRooms -= requestedRooms;
        createBooking();
    } else {
        throw new RoomNotAvailableException();
    }
}
```

## 3. BOOKING STATES & LIFECYCLE

### Booking Status Flow
```
PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT → COMPLETED
    ↓
CANCELLED (có thể cancel ở PENDING hoặc CONFIRMED)
    ↓
NO_SHOW (nếu guest không đến)
```

### Payment Status Flow
```
PENDING → PROCESSING → PAID → COMPLETED
    ↓
FAILED → RETRY (cho phép thử lại)
    ↓
REFUNDED (cho cancelled bookings)
```

## 4. CANCELLATION POLICY

### Cancellation Rules
```
- Free cancellation: 24h-48h before check-in
- Partial refund: 7 days before (charge 1 night)
- No refund: Less than 24h before check-in
- Special events: Different rules may apply
```

### Refund Processing
```
1. Calculate refund amount based on policy
2. Process refund to original payment method
3. Update booking status to CANCELLED
4. Release room inventory
5. Send cancellation confirmation
```

## 5. NOTIFICATION SYSTEM

### Email Notifications
- **Booking confirmation** (immediate)
- **Payment receipt** (after successful payment)
- **Check-in reminder** (1 day before)
- **Post-stay review request** (1 day after checkout)
- **Cancellation confirmation** (if cancelled)

### SMS Notifications (Optional)
- Booking confirmation với booking reference
- Check-in instructions và hotel contact

## 6. BUSINESS RULES VALIDATION

### Pre-booking Checks
```
- Minimum age requirement (18+ for primary guest)
- Maximum occupancy per room không vượt quá
- Blacklisted guests không được book
- Credit card verification for guarantee
```

### Rate and Availability Rules
```
- Weekend vs weekday pricing
- Seasonal rate adjustments
- Last-minute booking surcharges
- Group booking discounts (5+ rooms)
```

## 7. MISSING IN CURRENT SYSTEM

❌ **Real-time inventory locking** during booking process
❌ **Payment gateway integration** (VNPay, MoMo, etc.)
❌ **Email notification system**
❌ **Cancellation policy engine**
❌ **Rate management system** (dynamic pricing)
❌ **Guest profile management**
❌ **Booking modification** capabilities
❌ **Loyalty program integration**
❌ **Group booking handling**
❌ **Waitlist functionality** when sold out

## 8. IMPLEMENTATION PRIORITIES

### Phase 1 (Critical)
1. ✅ **Enhanced availability checking** with date ranges
2. ✅ **Payment gateway integration**
3. ✅ **Email confirmation system**
4. ✅ **Basic cancellation policies**

### Phase 2 (Important)
1. **Real-time pricing engine**
2. **Advanced booking modifications**
3. **Guest profile management**
4. **Rate management dashboard**

### Phase 3 (Nice to have)
1. **Loyalty program**
2. **Group booking tools**
3. **Waitlist system**
4. **Mobile app integration** 