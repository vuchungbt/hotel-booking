package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.enums.BookingStatus;
import net.blwsmartware.booking.enums.PaymentStatus;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentStatusResponse {
    
    String txnRef;
    PaymentStatus paymentStatus;
    BigDecimal amount;
    String responseCode;
    String transactionNo;
    String payDate;
    Boolean callbackReceived;
    UUID bookingId;
    BookingStatus bookingStatus;
} 