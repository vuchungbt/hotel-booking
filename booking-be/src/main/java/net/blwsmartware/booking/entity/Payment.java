package net.blwsmartware.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import net.blwsmartware.booking.enums.PaymentStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = true)
    Booking booking;
    
    @Column(name = "vnp_txn_ref", nullable = false, unique = true, length = 100)
    String vnpTxnRef;
    
    @Column(name = "vnp_order_info", nullable = false, length = 255)
    String vnpOrderInfo;
    
    @Column(name = "vnp_amount", nullable = false, precision = 10, scale = 2)
    BigDecimal vnpAmount;
    
    @Column(name = "vnp_response_code", length = 10)
    String vnpResponseCode;
    
    @Column(name = "vnp_transaction_no", length = 100)
    String vnpTransactionNo;
    
    @Column(name = "vnp_bank_code", length = 20)
    String vnpBankCode;
    
    @Column(name = "vnp_pay_date", length = 14)
    String vnpPayDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    PaymentStatus paymentStatus;
    
    @Column(name = "callback_received")
    Boolean callbackReceived = false;
    
    @Column(name = "gateway_response", columnDefinition = "TEXT")
    String gatewayResponse;
    
    // Audit fields
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
} 