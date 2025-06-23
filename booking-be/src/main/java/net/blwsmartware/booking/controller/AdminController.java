package net.blwsmartware.booking.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.response.AdminDashboardResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.service.*;
import net.blwsmartware.booking.validator.IsAdmin;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminController {
    
    HotelService hotelService;
    RoomTypeService roomTypeService;
    ReviewService reviewService;
    UserService userService;
    
    @GetMapping("/dashboard")
    @IsAdmin
    public ResponseEntity<MessageResponse<AdminDashboardResponse>> getDashboard() {
        log.info("Getting admin dashboard statistics");
        
        try {
            // Collect all statistics
            Long totalHotels = hotelService.getTotalHotelsCount();
            Long activeHotels = hotelService.getActiveHotelsCount();
            Long inactiveHotels = totalHotels - activeHotels;
            Long featuredHotels = hotelService.getFeaturedHotelsCount();
            
            Long totalRoomTypes = roomTypeService.getTotalRoomTypesCount();
            
            Long totalReviews = reviewService.getTotalReviewsCount();
            // For now, we'll set these as 0 since we don't have approval/verification logic implemented
            Long approvedReviews = 0L;
            Long pendingReviews = 0L;
            Long verifiedReviews = 0L;
            
            Long totalUsers = userService.getTotalUsersCount();
            
            AdminDashboardResponse dashboardResponse = AdminDashboardResponse.builder()
                    .totalHotels(totalHotels)
                    .activeHotels(activeHotels)
                    .inactiveHotels(inactiveHotels)
                    .featuredHotels(featuredHotels)
                    .totalRoomTypes(totalRoomTypes)
                    .totalReviews(totalReviews)
                    .approvedReviews(approvedReviews)
                    .pendingReviews(pendingReviews)
                    .verifiedReviews(verifiedReviews)
                    .totalUsers(totalUsers)
                    .build();
            
            log.info("Dashboard statistics collected successfully - Hotels: {}, Users: {}, Reviews: {}, RoomTypes: {}", 
                    totalHotels, totalUsers, totalReviews, totalRoomTypes);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(MessageResponse.<AdminDashboardResponse>builder()
                            .message("Dashboard statistics retrieved successfully")
                            .result(dashboardResponse)
                            .build());
            
        } catch (Exception e) {
            log.error("Error retrieving dashboard statistics", e);
            throw e;
        }
    }
} 