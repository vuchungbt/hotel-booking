package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.Payment;
import net.blwsmartware.booking.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    
    // ===== BASIC QUERIES =====
    
    /**
     * Find payment by VNPay transaction reference
     */
    Optional<Payment> findByVnpTxnRef(String vnpTxnRef);
    
    /**
     * Check if VNPay transaction reference exists
     */
    boolean existsByVnpTxnRef(String vnpTxnRef);
    
    /**
     * Find payment by booking ID
     */
    Optional<Payment> findByBookingId(UUID bookingId);
    
    /**
     * Find payments by booking ID (multiple payments possible)
     */
    List<Payment> findAllByBookingId(UUID bookingId);
    
    // ===== STATUS QUERIES =====
    
    /**
     * Find payments by status
     */
    Page<Payment> findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus paymentStatus, Pageable pageable);
    
    /**
     * Find payments by status
     */
    List<Payment> findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus paymentStatus);
    
    /**
     * Find payments with callback received
     */
    Page<Payment> findByCallbackReceivedOrderByCreatedAtDesc(Boolean callbackReceived, Pageable pageable);
    
    // ===== VNPAY SPECIFIC QUERIES =====
    
    /**
     * Find payment by VNPay transaction number
     */
    Optional<Payment> findByVnpTransactionNo(String vnpTransactionNo);
    
    /**
     * Find payments by VNPay response code
     */
    List<Payment> findByVnpResponseCodeOrderByCreatedAtDesc(String vnpResponseCode);
    
    /**
     * Find payments by bank code
     */
    List<Payment> findByVnpBankCodeOrderByCreatedAtDesc(String vnpBankCode);
    
    // ===== DATE RANGE QUERIES =====
    
    /**
     * Find payments created between dates
     */
    Page<Payment> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    /**
     * Find payments by VNPay pay date
     */
    List<Payment> findByVnpPayDateOrderByCreatedAtDesc(String vnpPayDate);
    
    // ===== STATISTICS QUERIES =====
    
    /**
     * Count payments by status
     */
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentStatus = :status")
    Long countByPaymentStatus(@Param("status") PaymentStatus status);
    
    /**
     * Calculate total amount by status
     */
    @Query("SELECT COALESCE(SUM(p.vnpAmount), 0) FROM Payment p WHERE p.paymentStatus = :status")
    BigDecimal getTotalAmountByStatus(@Param("status") PaymentStatus status);
    
    /**
     * Calculate total successful payments amount
     */
    @Query("SELECT COALESCE(SUM(p.vnpAmount), 0) FROM Payment p WHERE p.paymentStatus = 'PAID'")
    BigDecimal getTotalSuccessfulPayments();
    
    /**
     * Get monthly payment statistics
     */
    @Query("SELECT COALESCE(SUM(p.vnpAmount), 0) FROM Payment p WHERE p.paymentStatus = 'PAID' " +
           "AND YEAR(p.createdAt) = :year AND MONTH(p.createdAt) = :month")
    BigDecimal getMonthlySuccessfulPayments(@Param("year") int year, @Param("month") int month);
    
    // ===== SEARCH QUERIES =====
    
    /**
     * Search payments by transaction reference or order info
     */
    @Query("SELECT p FROM Payment p WHERE " +
           "(LOWER(p.vnpTxnRef) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.vnpOrderInfo) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.vnpTransactionNo) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY p.createdAt DESC")
    Page<Payment> searchPayments(@Param("keyword") String keyword, Pageable pageable);
    
    // ===== VALIDATION QUERIES =====
    
    /**
     * Find pending payments older than specified minutes (for cleanup/timeout)
     */
    @Query("SELECT p FROM Payment p WHERE p.paymentStatus = 'PENDING' " +
           "AND p.createdAt < :cutoffTime")
    List<Payment> findPendingPaymentsOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Find payments without callback after specified time
     */
    @Query("SELECT p FROM Payment p WHERE p.callbackReceived = false " +
           "AND p.createdAt < :cutoffTime")
    List<Payment> findPaymentsWithoutCallbackOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);
} 