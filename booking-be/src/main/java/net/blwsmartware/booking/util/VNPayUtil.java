package net.blwsmartware.booking.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.*;

public class VNPayUtil {
    
    private VNPayUtil() {
        // Utility class
    }
    
    /**
     * Tạo mã HMAC SHA512
     */
    public static String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKeySpec);
            byte[] hashBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hash = new StringBuilder();
            for (byte b : hashBytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error creating HMAC SHA512", e);
        }
    }
    
    /**
     * Lấy địa chỉ IP từ request
     */
    public static String getIpAddress(String forwarded, String remoteAddr) {
        if (forwarded != null && !forwarded.isEmpty()) {
            return forwarded.split(",")[0].trim();
        }
        return remoteAddr != null ? remoteAddr : "127.0.0.1";
    }
    
    /**
     * Tạo mã giao dịch ngẫu nhiên
     */
    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }
    
    /**
     * Tạo mã đơn hàng với timestamp
     */
    public static String generateTxnRef() {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        return formatter.format(new Date()) + getRandomNumber(6);
    }
    
    /**
     * Tạo hash từ tất cả các fields
     */
    public static String hashAllFields(Map<String, String> fields) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        
        boolean first = true;
        for (String fieldName : fieldNames) {
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                if (!first) {
                    sb.append("&");
                }
                sb.append(fieldName);
                sb.append("=");
                sb.append(fieldValue);
                first = false;
            }
        }
        return sb.toString();
    }
    
    /**
     * Xây dựng query string từ parameters
     */
    public static String buildQueryString(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder query = new StringBuilder();
        
        boolean first = true;
        for (String fieldName : fieldNames) {
            String fieldValue = params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                if (!first) {
                    query.append('&');
                }
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));
                first = false;
            }
        }
        return query.toString();
    }
    
    /**
     * Validate VNPay response signature
     */
    public static boolean validateSignature(Map<String, String> params, String secretKey, String signature) {
        Map<String, String> validateParams = new HashMap<>(params);
        validateParams.remove("vnp_SecureHash");
        validateParams.remove("vnp_SecureHashType");
        
        String hashData = hashAllFields(validateParams);
        String calculatedSignature = hmacSHA512(secretKey, hashData);
        
        // Debug log
        System.out.println("=== VNPay Signature Validation ===");
        System.out.println("Hash data: " + hashData);
        System.out.println("Expected signature: " + signature);
        System.out.println("Calculated signature: " + calculatedSignature);
        System.out.println("Match: " + calculatedSignature.equals(signature));
        
        return calculatedSignature.equals(signature);
    }
} 