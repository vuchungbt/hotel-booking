package net.blwsmartware.booking.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VNPayCallbackResponse {
    
    String rspCode;
    String message;
    
    // Response code constants
    public static final String SUCCESS = "00";
    public static final String ORDER_ALREADY_CONFIRMED = "02";
    public static final String ORDER_NOT_FOUND = "01";
    public static final String INVALID_AMOUNT = "04";
    public static final String INVALID_SIGNATURE = "97";
    public static final String UNKNOWN_ERROR = "99";
} 