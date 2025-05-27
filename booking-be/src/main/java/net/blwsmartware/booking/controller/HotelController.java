package net.blwsmartware.booking.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.constant.PagePrepare;
import net.blwsmartware.booking.dto.request.HotelCreateRequest;
import net.blwsmartware.booking.dto.request.HotelUpdateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.HotelResponse;
import net.blwsmartware.booking.dto.response.MessageResponse;
import net.blwsmartware.booking.service.HotelService;
import net.blwsmartware.booking.validator.IsAdmin;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/hotels")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class HotelController {
    
    HotelService hotelService;
    
    // Admin endpoints
    @GetMapping("/admin")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> getAllHotels(
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = PagePrepare.SORT_BY) String sortBy) {
        
        DataResponse<HotelResponse> response = hotelService.getAllHotels(pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("Hotels retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/admin/filter")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> getAllHotelsWithFilters(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) Integer starRating,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean isFeatured,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = PagePrepare.SORT_BY) String sortBy) {
        
        DataResponse<HotelResponse> response = hotelService.getAllHotelsWithFilters(
                city, country, starRating, isActive, isFeatured, minPrice, maxPrice, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("Filtered hotels retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @PostMapping("/admin")
    @IsAdmin
    public ResponseEntity<MessageResponse<HotelResponse>> createHotel(@Valid @RequestBody HotelCreateRequest request) {
        HotelResponse response = hotelService.createHotel(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<HotelResponse>builder()
                        .message("Hotel created successfully")
                        .result(response)
                        .build());
    }
    
    @PutMapping("/admin/{id}")
    @IsAdmin
    public ResponseEntity<MessageResponse<HotelResponse>> updateHotel(
            @PathVariable UUID id,
            @Valid @RequestBody HotelUpdateRequest request) {
        HotelResponse response = hotelService.updateHotel(id, request);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<HotelResponse>builder()
                        .message("Hotel updated successfully")
                        .result(response)
                        .build());
    }
    
    @DeleteMapping("/admin/{id}")
    @IsAdmin
    public ResponseEntity<?> deleteHotel(@PathVariable UUID id) {
        hotelService.deleteHotel(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.builder()
                        .message("Hotel deleted successfully")
                        .build());
    }
    
    @PutMapping("/admin/{id}/toggle-status")
    @IsAdmin
    public ResponseEntity<MessageResponse<HotelResponse>> toggleHotelStatus(@PathVariable UUID id) {
        HotelResponse response = hotelService.toggleHotelStatus(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<HotelResponse>builder()
                        .message("Hotel status toggled successfully")
                        .result(response)
                        .build());
    }
    
    @PutMapping("/admin/{id}/toggle-featured")
    @IsAdmin
    public ResponseEntity<MessageResponse<HotelResponse>> toggleFeaturedStatus(@PathVariable UUID id) {
        HotelResponse response = hotelService.toggleFeaturedStatus(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<HotelResponse>builder()
                        .message("Hotel featured status toggled successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/admin/owner/{ownerId}")
    @IsAdmin
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> getHotelsByOwner(
            @PathVariable UUID ownerId,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = PagePrepare.SORT_BY) String sortBy) {
        
        DataResponse<HotelResponse> response = hotelService.getHotelsByOwner(ownerId, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("Hotels by owner retrieved successfully")
                        .result(response)
                        .build());
    }
    
    // Statistics endpoints
    @GetMapping("/admin/stats/total")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getTotalHotelsCount() {
        Long count = hotelService.getTotalHotelsCount();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Total hotels count retrieved successfully")
                        .result(count)
                        .build());
    }
    
    @GetMapping("/admin/stats/active")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getActiveHotelsCount() {
        Long count = hotelService.getActiveHotelsCount();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Active hotels count retrieved successfully")
                        .result(count)
                        .build());
    }
    
    @GetMapping("/admin/stats/featured")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getFeaturedHotelsCount() {
        Long count = hotelService.getFeaturedHotelsCount();
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Featured hotels count retrieved successfully")
                        .result(count)
                        .build());
    }
    
    @GetMapping("/admin/stats/owner/{ownerId}")
    @IsAdmin
    public ResponseEntity<MessageResponse<Long>> getHotelsCountByOwner(@PathVariable UUID ownerId) {
        Long count = hotelService.getHotelsCountByOwner(ownerId);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<Long>builder()
                        .message("Hotels count by owner retrieved successfully")
                        .result(count)
                        .build());
    }
    
    // Public endpoints
    @GetMapping("/{id}")
    public ResponseEntity<MessageResponse<HotelResponse>> getHotelById(@PathVariable UUID id) {
        HotelResponse response = hotelService.getHotelById(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<HotelResponse>builder()
                        .message("Hotel retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> searchHotels(
            @RequestParam String keyword,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "name") String sortBy) {
        
        DataResponse<HotelResponse> response = hotelService.searchHotels(keyword, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("Hotels search completed successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/city/{city}")
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> getHotelsByCity(
            @PathVariable String city,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "name") String sortBy) {
        
        DataResponse<HotelResponse> response = hotelService.getHotelsByCity(city, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("Hotels by city retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/country/{country}")
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> getHotelsByCountry(
            @PathVariable String country,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "name") String sortBy) {
        
        DataResponse<HotelResponse> response = hotelService.getHotelsByCountry(country, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("Hotels by country retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/rating/{starRating}")
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> getHotelsByStarRating(
            @PathVariable Integer starRating,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "name") String sortBy) {
        
        DataResponse<HotelResponse> response = hotelService.getHotelsByStarRating(starRating, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("Hotels by star rating retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/active")
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> getActiveHotels(
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "name") String sortBy) {
        
        DataResponse<HotelResponse> response = hotelService.getActiveHotels(pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("Active hotels retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/featured")
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> getFeaturedHotels(
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "name") String sortBy) {
        
        DataResponse<HotelResponse> response = hotelService.getFeaturedHotels(pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("Featured hotels retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/my")
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> getMyHotels(
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = PagePrepare.SORT_BY) String sortBy) {
        
        DataResponse<HotelResponse> response = hotelService.getMyHotels(pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("My hotels retrieved successfully")
                        .result(response)
                        .build());
    }
    
    @GetMapping("/near")
    public ResponseEntity<MessageResponse<DataResponse<HotelResponse>>> getHotelsNearLocation(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10.0") Double radiusKm,
            @RequestParam(defaultValue = PagePrepare.PAGE_NUMBER) Integer pageNumber,
            @RequestParam(defaultValue = PagePrepare.PAGE_SIZE) Integer pageSize,
            @RequestParam(defaultValue = "name") String sortBy) {
        
        DataResponse<HotelResponse> response = hotelService.getHotelsNearLocation(
                latitude, longitude, radiusKm, pageNumber, pageSize, sortBy);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(MessageResponse.<DataResponse<HotelResponse>>builder()
                        .message("Hotels near location retrieved successfully")
                        .result(response)
                        .build());
    }
} 