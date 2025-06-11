package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.configuration.VNPayConfig;
import net.blwsmartware.booking.dto.request.VNPayCreateRequest;
import net.blwsmartware.booking.dto.response.PaymentStatusResponse;
import net.blwsmartware.booking.dto.response.VNPayCallbackResponse;
import net.blwsmartware.booking.dto.response.VNPayCreateResponse;
import net.blwsmartware.booking.entity.Booking;
import net.blwsmartware.booking.entity.Payment;
import net.blwsmartware.booking.enums.BookingStatus;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.enums.PaymentStatus;
import net.blwsmartware.booking.exception.AppRuntimeException;
import net.blwsmartware.booking.repository.BookingRepository;
import net.blwsmartware.booking.repository.PaymentRepository;
import net.blwsmartware.booking.service.VNPayService;
import net.blwsmartware.booking.util.VNPayUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VNPayServiceImpl implements VNPayService {
    
    VNPayConfig vnPayConfig;
    PaymentRepository paymentRepository;
    BookingRepository bookingRepository;
    
    @Override
    @Transactional
    public VNPayCreateResponse createPaymentUrl(VNPayCreateRequest request, String clientIp) {
        try {
            // Validate booking if provided
            Booking booking = null;
            if (request.getBookingId() != null) {
                booking = bookingRepository.findById(request.getBookingId())
                        .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
                
                // Check if payment already exists
                Optional<Payment> existingPayment = paymentRepository.findByBookingId(booking.getId());
                if (existingPayment.isPresent() && 
                    existingPayment.get().getPaymentStatus() == PaymentStatus.PAID) {
                    throw new AppRuntimeException(ErrorResponse.BOOKING_ALREADY_PAID);
                }
            }
            
            // Generate transaction reference
            String txnRef = VNPayUtil.generateTxnRef();
            
            // Ensure unique transaction reference
            while (paymentRepository.existsByVnpTxnRef(txnRef)) {
                txnRef = VNPayUtil.generateTxnRef();
            }
            
            // Create payment parameters
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_Version", "2.1.0");
            params.put("vnp_Command", "pay");
            params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            // VNPay requires amount in đồng (smallest unit), so multiply by 100 if amount is in VND
            long vnpAmount = Math.round(request.getAmount() * 100);
            params.put("vnp_Amount", String.valueOf(vnpAmount));
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_TxnRef", txnRef);
            params.put("vnp_OrderInfo", request.getOrderInfo());
            params.put("vnp_OrderType", "other");
            params.put("vnp_Locale", request.getLanguage() != null ? request.getLanguage() : "vn");
            params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
            params.put("vnp_IpAddr", clientIp);
            
            // Add optional bank code
            if (request.getBankCode() != null && !request.getBankCode().isEmpty()) {
                params.put("vnp_BankCode", request.getBankCode());
            }
            
            // Create timestamp
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            formatter.setTimeZone(java.util.TimeZone.getTimeZone("GMT+7"));
            String createDate = formatter.format(new Date());
            params.put("vnp_CreateDate", createDate);
            
            // Create payment record
            Payment payment = Payment.builder()
                    .booking(booking)
                    .vnpTxnRef(txnRef)
                    .vnpOrderInfo(request.getOrderInfo())
                    .vnpAmount(BigDecimal.valueOf(request.getAmount()))
                    .paymentStatus(PaymentStatus.PENDING)
                    .callbackReceived(false)
                    .build();
            
            paymentRepository.save(payment);
            
            // Create signature
            String hashData = VNPayUtil.hashAllFields(params);
            String vnpSecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData);
            
            // Debug logs
            log.info("=== VNPay Signature Debug ===");
            log.info("Hash data: {}", hashData);
            log.info("Hash secret length: {}", vnPayConfig.getHashSecret().length());
            log.info("Generated signature: {}", vnpSecureHash);
            log.info("Parameters: {}", params);
            
            // Build payment URL
            String queryUrl = VNPayUtil.buildQueryString(params);
            String paymentUrl = vnPayConfig.getPaymentUrl() + "?" + queryUrl + "&vnp_SecureHash=" + vnpSecureHash;
            
            log.info("Created VNPay payment URL for txnRef: {}", txnRef);
            log.info("Full payment URL: {}", paymentUrl);
            
            return VNPayCreateResponse.builder()
                    .code("00")
                    .message("Success")
                    .paymentUrl(paymentUrl)
                    .txnRef(txnRef)
                    .build();
                    
        } catch (AppRuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error creating VNPay payment URL", e);
            throw new AppRuntimeException(ErrorResponse.PAYMENT_CREATION_FAILED);
        }
    }
    
    @Override
    @Transactional
    public VNPayCallbackResponse handleCallback(Map<String, String> params) {
        try {
            String vnpSecureHash = params.get("vnp_SecureHash");
            String txnRef = params.get("vnp_TxnRef");
            String responseCode = params.get("vnp_ResponseCode");
            String transactionNo = params.get("vnp_TransactionNo");
            String bankCode = params.get("vnp_BankCode");
            String payDate = params.get("vnp_PayDate");
            
            log.info("Received VNPay callback for txnRef: {}, responseCode: {}", txnRef, responseCode);
            
            // Validate signature
            if (!VNPayUtil.validateSignature(params, vnPayConfig.getHashSecret(), vnpSecureHash)) {
                log.warn("Invalid signature for txnRef: {}", txnRef);
                return VNPayCallbackResponse.builder()
                        .rspCode(VNPayCallbackResponse.INVALID_SIGNATURE)
                        .message("Invalid signature")
                        .build();
            }
            
            // Find payment
            Optional<Payment> paymentOpt = paymentRepository.findByVnpTxnRef(txnRef);
            if (paymentOpt.isEmpty()) {
                log.warn("Payment not found for txnRef: {}", txnRef);
                return VNPayCallbackResponse.builder()
                        .rspCode(VNPayCallbackResponse.ORDER_NOT_FOUND)
                        .message("Order not found")
                        .build();
            }
            
            Payment payment = paymentOpt.get();
            
            // Check if already processed
            if (payment.getCallbackReceived()) {
                log.info("Callback already processed for txnRef: {}", txnRef);
                return VNPayCallbackResponse.builder()
                        .rspCode(VNPayCallbackResponse.ORDER_ALREADY_CONFIRMED)
                        .message("Order already confirmed")
                        .build();
            }
            
            // Update payment
            payment.setVnpResponseCode(responseCode);
            payment.setVnpTransactionNo(transactionNo);
            payment.setVnpBankCode(bankCode);
            payment.setVnpPayDate(payDate);
            payment.setCallbackReceived(true);
            payment.setGatewayResponse(params.toString());
            
            // Update payment status based on response code
            if ("00".equals(responseCode)) {
                payment.setPaymentStatus(PaymentStatus.PAID);
                
                // Update booking status if exists
                if (payment.getBooking() != null) {
                    Booking booking = payment.getBooking();
                    booking.setPaymentStatus(PaymentStatus.PAID);
                    if (booking.getStatus() == BookingStatus.PENDING) {
                        booking.setStatus(BookingStatus.CONFIRMED);
                    }
                    bookingRepository.save(booking);
                }
            } else {
                payment.setPaymentStatus(PaymentStatus.FAILED);
            }
            
            paymentRepository.save(payment);
            
            log.info("Successfully processed VNPay callback for txnRef: {}", txnRef);
            
            return VNPayCallbackResponse.builder()
                    .rspCode(VNPayCallbackResponse.SUCCESS)
                    .message("Confirm Success")
                    .build();
                    
        } catch (Exception e) {
            log.error("Error processing VNPay callback", e);
            return VNPayCallbackResponse.builder()
                    .rspCode(VNPayCallbackResponse.UNKNOWN_ERROR)
                    .message("System error")
                    .build();
        }
    }
    
    @Override
    public Map<String, Object> handleReturn(Map<String, String> params) {
        String vnpSecureHash = params.get("vnp_SecureHash");
        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        
        Map<String, Object> result = new HashMap<>();
        result.put("txnRef", txnRef);
        result.put("responseCode", responseCode);
        
        // Validate signature
        if (!VNPayUtil.validateSignature(params, vnPayConfig.getHashSecret(), vnpSecureHash)) {
            result.put("success", false);
            result.put("message", "Invalid signature");
            return result;
        }
        
        // Find payment
        Optional<Payment> paymentOpt = paymentRepository.findByVnpTxnRef(txnRef);
        if (paymentOpt.isEmpty()) {
            result.put("success", false);
            result.put("message", "Payment not found");
            return result;
        }
        
        Payment payment = paymentOpt.get();
        result.put("amount", payment.getVnpAmount());
        result.put("orderInfo", payment.getVnpOrderInfo());
        
        if ("00".equals(responseCode)) {
            result.put("success", true);
            result.put("message", "Payment successful");
        } else {
            result.put("success", false);
            result.put("message", "Payment failed");
        }
        
        if (payment.getBooking() != null) {
            result.put("bookingId", payment.getBooking().getId());
        }
        
        return result;
    }
    
    @Override
    public PaymentStatusResponse getPaymentStatus(String txnRef) {
        Payment payment = paymentRepository.findByVnpTxnRef(txnRef)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.PAYMENT_NOT_FOUND));
        
        return PaymentStatusResponse.builder()
                .txnRef(payment.getVnpTxnRef())
                .paymentStatus(payment.getPaymentStatus())
                .amount(payment.getVnpAmount())
                .responseCode(payment.getVnpResponseCode())
                .transactionNo(payment.getVnpTransactionNo())
                .payDate(payment.getVnpPayDate())
                .callbackReceived(payment.getCallbackReceived())
                .bookingId(payment.getBooking() != null ? payment.getBooking().getId() : null)
                .bookingStatus(payment.getBooking() != null ? payment.getBooking().getStatus() : null)
                .build();
    }
    
    @Override
    @Transactional
    public void linkPaymentToBooking(String txnRef, UUID bookingId) {
        // Find payment by transaction reference
        Payment payment = paymentRepository.findByVnpTxnRef(txnRef)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.PAYMENT_NOT_FOUND));
        
        // Find booking by ID
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        // Link payment to booking
        payment.setBooking(booking);
        paymentRepository.save(payment);
        
        // Update booking payment status if payment is already successful
        if (payment.getPaymentStatus() == PaymentStatus.PAID) {
            booking.setPaymentStatus(PaymentStatus.PAID);
            if (booking.getStatus() == BookingStatus.PENDING) {
                booking.setStatus(BookingStatus.CONFIRMED);
            }
            bookingRepository.save(booking);
        }
        
        log.info("Successfully linked payment {} to booking {}", txnRef, bookingId);
    }
} 