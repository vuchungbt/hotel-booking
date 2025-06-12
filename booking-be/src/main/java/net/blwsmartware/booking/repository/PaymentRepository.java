package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.Payment;
import net.blwsmartware.booking.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    
    /**
     * Tìm payment theo VNPay transaction reference
     */
    Optional<Payment> findByVnpTxnRef(String vnpTxnRef);
    
    /**
     * Tìm payment theo VNPay transaction number
     */
    Optional<Payment> findByVnpTransactionNo(String vnpTransactionNo);
    
    /**
     * Tìm payment theo booking ID
     */
    Optional<Payment> findByBookingId(UUID bookingId);
    
    /**
     * Tìm payments theo booking IDs
     */
    List<Payment> findByBookingIdIn(List<UUID> bookingIds);
    
    /**
     * Tìm payments theo status
     */
    Page<Payment> findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus paymentStatus, Pageable pageable);
    
    /**
     * Tìm payments chưa nhận callback
     */
    List<Payment> findByCallbackReceivedFalseAndPaymentStatusOrderByCreatedAtDesc(PaymentStatus paymentStatus);
    
    /**
     * Đếm số payment theo status
     */
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentStatus = :status")
    Long countByPaymentStatus(@Param("status") PaymentStatus status);
    
    /**
     * Kiểm tra txnRef đã tồn tại chưa
     */
    boolean existsByVnpTxnRef(String vnpTxnRef);
} 