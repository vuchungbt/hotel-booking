package net.blwsmartware.booking.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VNPayCreateRequest {
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than 0")
    Long amount;
    
    @NotNull(message = "Order info is required")
    @Size(min = 1, max = 255, message = "Order info must be between 1 and 255 characters")
    String orderInfo;
    
    @Size(max = 20, message = "Bank code cannot exceed 20 characters")
    String bankCode;
    
    @Size(max = 5, message = "Language code cannot exceed 5 characters")
    String language = "vn";
    
    UUID bookingId;
} 