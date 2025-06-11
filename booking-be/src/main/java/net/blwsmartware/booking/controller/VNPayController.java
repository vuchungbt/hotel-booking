package net.blwsmartware.booking.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.configuration.VNPayConfig;
import net.blwsmartware.booking.dto.request.VNPayCreateRequest;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.dto.response.PaymentStatusResponse;
import net.blwsmartware.booking.dto.response.VNPayCallbackResponse;
import net.blwsmartware.booking.dto.response.VNPayCreateResponse;
import net.blwsmartware.booking.service.VNPayService;
import net.blwsmartware.booking.util.VNPayUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VNPayController {
    
    VNPayService vnPayService;
    VNPayConfig vnPayConfig;
    
    /**
     * Tạo URL thanh toán VNPay
     */
    @PostMapping("/vnpay/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse<VNPayCreateResponse>> createVNPayPayment(
            @Valid @RequestBody VNPayCreateRequest request,
            HttpServletRequest httpRequest) {
        
        log.info("Creating VNPay payment for amount: {}", request.getAmount());
        
        // Get client IP
        String clientIp = VNPayUtil.getIpAddress(
                httpRequest.getHeader("X-Forwarded-For"),
                httpRequest.getRemoteAddr()
        );
        
        VNPayCreateResponse response = vnPayService.createPaymentUrl(request, clientIp);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<VNPayCreateResponse>builder()
                        .message("VNPay payment URL created successfully")
                        .result(response)
                        .build());
    }
    
    /**
     * Xử lý callback từ VNPay (IPN - Instant Payment Notification)
     * Endpoint này sẽ được VNPay gọi để thông báo kết quả thanh toán
     */
    @PostMapping("/vnpay/callback")
    public ResponseEntity<VNPayCallbackResponse> handleVNPayCallback(HttpServletRequest request) {
        log.info("Received VNPay callback");
        
        // Extract all parameters from request
        Map<String, String> params = new HashMap<>();
        Enumeration<String> parameterNames = request.getParameterNames();
        
        while (parameterNames.hasMoreElements()) {
            String paramName = parameterNames.nextElement();
            String paramValue = request.getParameter(paramName);
            params.put(paramName, paramValue);
        }
        
        log.debug("VNPay callback parameters: {}", params);
        
        VNPayCallbackResponse response = vnPayService.handleCallback(params);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response);
    }
    
    /**
     * Xử lý return từ VNPay sau khi khách hàng thanh toán
     * Endpoint này sẽ được redirect từ VNPay sau khi khách hàng hoàn tất thanh toán
     */
    @GetMapping("/vnpay/return")
    public ResponseEntity<MessageResponse<Map<String, Object>>> handleVNPayReturn(HttpServletRequest request) {
        log.info("Received VNPay return");
        
        // Extract all parameters from request
        Map<String, String> params = new HashMap<>();
        Enumeration<String> parameterNames = request.getParameterNames();
        
        while (parameterNames.hasMoreElements()) {
            String paramName = parameterNames.nextElement();
            String paramValue = request.getParameter(paramName);
            params.put(paramName, paramValue);
        }
        
        log.debug("VNPay return parameters: {}", params);
        
        Map<String, Object> result = vnPayService.handleReturn(params);
        
        String message = (Boolean) result.get("success") 
                ? "Payment processed successfully" 
                : "Payment failed";
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Map<String, Object>>builder()
                        .message(message)
                        .result(result)
                        .build());
    }
    
    /**
     * Lấy trạng thái thanh toán theo transaction reference
     */
    @GetMapping("/vnpay/status/{txnRef}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse<PaymentStatusResponse>> getPaymentStatus(
            @PathVariable String txnRef) {
        
        log.info("Getting payment status for txnRef: {}", txnRef);
        
        PaymentStatusResponse response = vnPayService.getPaymentStatus(txnRef);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<PaymentStatusResponse>builder()
                        .message("Payment status retrieved successfully")
                        .result(response)
                        .build());
    }
    
    /**
     * Liên kết payment với booking sau khi booking được tạo thành công
     */
    @PostMapping("/vnpay/link-booking")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse<String>> linkPaymentToBooking(
            @RequestParam String txnRef,
            @RequestParam UUID bookingId) {
        
        log.info("Linking payment {} to booking {}", txnRef, bookingId);
        
        vnPayService.linkPaymentToBooking(txnRef, bookingId);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<String>builder()
                        .message("Payment linked to booking successfully")
                        .result("Success")
                        .build());
    }
    
    /**
     * VNPay return redirect endpoint
     * Redirects VNPay return to frontend with all parameters
     */
    @GetMapping("/return")
    public ResponseEntity<Void> redirectVNPayReturn(HttpServletRequest request) {
        log.info("Received VNPay return redirect");
        
        // Get all parameters
        StringBuilder params = new StringBuilder();
        Enumeration<String> parameterNames = request.getParameterNames();
        
        while (parameterNames.hasMoreElements()) {
            String paramName = parameterNames.nextElement();
            String paramValue = request.getParameter(paramName);
            
            if (params.length() > 0) {
                params.append("&");
            }
            params.append(paramName).append("=").append(paramValue);
        }
        
        // Redirect to frontend
        String frontendUrl = "http://localhost:5173/payment/return?" + params.toString();
        
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(frontendUrl))
                .build();
    }
    
    /**
     * Test VNPay configuration endpoint - Public for debugging
     */
    @GetMapping("/vnpay/test-config")
    public ResponseEntity<MessageResponse<Map<String, Object>>> testVNPayConfig() {
        
        log.info("Testing VNPay configuration");
        
        Map<String, Object> config = new HashMap<>();
        config.put("tmnCode", vnPayConfig.getTmnCode());
        config.put("paymentUrl", vnPayConfig.getPaymentUrl());
        config.put("returnUrl", vnPayConfig.getReturnUrl());
        config.put("notifyUrl", vnPayConfig.getNotifyUrl());
        config.put("hashSecretExists", vnPayConfig.getHashSecret() != null && !vnPayConfig.getHashSecret().isEmpty());
        config.put("hashSecretLength", vnPayConfig.getHashSecret() != null ? vnPayConfig.getHashSecret().length() : 0);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Map<String, Object>>builder()
                        .message("VNPay configuration retrieved successfully")
                        .result(config)
                        .build());
    }
} 