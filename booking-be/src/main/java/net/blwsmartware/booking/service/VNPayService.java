package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.request.VNPayCreateRequest;
import net.blwsmartware.booking.dto.response.PaymentStatusResponse;
import net.blwsmartware.booking.dto.response.VNPayCallbackResponse;
import net.blwsmartware.booking.dto.response.VNPayCreateResponse;

import java.util.Map;

public interface VNPayService {
    
    /**
     * Tạo URL thanh toán VNPay
     */
    VNPayCreateResponse createPaymentUrl(VNPayCreateRequest request, String clientIp);
    
    /**
     * Xử lý callback từ VNPay (IPN)
     */
    VNPayCallbackResponse handleCallback(Map<String, String> params);
    
    /**
     * Xử lý return từ VNPay (sau khi khách hàng thanh toán xong)
     */
    Map<String, Object> handleReturn(Map<String, String> params);
    
    /**
     * Lấy thông tin trạng thái thanh toán
     */
    PaymentStatusResponse getPaymentStatus(String txnRef);
} 