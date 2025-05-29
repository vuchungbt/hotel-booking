package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.request.HotelCreateRequest;
import net.blwsmartware.booking.dto.request.HotelUpdateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.HotelResponse;
import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.exception.AppException;
import net.blwsmartware.booking.exception.ErrorCode;
import net.blwsmartware.booking.mapper.HotelMapper;
import net.blwsmartware.booking.repository.HotelRepository;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.service.HotelService;
import net.blwsmartware.booking.util.DataResponseUtils;
import net.blwsmartware.booking.validator.IsAdmin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class HotelServiceImpl implements HotelService {
    
    HotelRepository hotelRepository;
    UserRepository userRepository;
    HotelMapper hotelMapper;
    
    @Override
    @IsAdmin
    public DataResponse<HotelResponse> getAllHotels(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting all hotels with pagination: page={}, size={}, sortBy={}", pageNumber, pageSize, sortBy);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findAll(pageable);
        
        // Debug: Log raw entities from database
        log.info("=== DATABASE ENTITIES DEBUG ===");
        log.info("Total hotels from DB: {}", hotelPage.getContent().size());
        hotelPage.getContent().forEach((hotel) -> {
            log.info("DB Hotel: {}", hotel.getName());
            log.info("  - ID: {}", hotel.getId());
            log.info("  - isActive: {} (type: {})", hotel.isActive(), hotel.isActive() ? "true" : "false");
            log.info("  - isFeatured: {} (type: {})", hotel.isFeatured(), hotel.isFeatured() ? "true" : "false");
        });
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        // Debug: Log mapped responses
        log.info("=== MAPPED RESPONSES DEBUG ===");
        log.info("Total hotel responses: {}", hotelResponses.size());
        hotelResponses.forEach((response) -> {
            log.info("Response : {}", response.getName());
            log.info("  - ID: {}", response.getId());
            log.info("  - isActive: {} (type: {})", response.isActive(), response.isActive() ? "true" : "false");
            log.info("  - isFeatured: {} (type: {})", response.isFeatured(), response.isFeatured() ? "true" : "false");
        });
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    @IsAdmin
    public DataResponse<HotelResponse> getAllHotelsWithFilters(
            String city, String country, Integer starRating, Boolean isActive, Boolean isFeatured,
            BigDecimal minPrice, BigDecimal maxPrice, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting hotels with filters - city: {}, country: {}, stars: {}, active: {}, featured: {}", 
                city, country, starRating, isActive, isFeatured);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findWithFilters(
                city, country, starRating, isActive, isFeatured, minPrice, maxPrice, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public HotelResponse getHotelById(UUID id) {
        log.info("Getting hotel by ID: {}", id);
        
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
        
        return hotelMapper.toResponse(hotel);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public HotelResponse createHotel(HotelCreateRequest request) {
        log.info("Creating new hotel: {}", request.getName());
        
        // Determine owner - use provided ownerId or current user
        User owner;
        if (request.getOwnerId() != null) {
            owner = userRepository.findById(request.getOwnerId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        } else {
            // Use current user as owner if ownerId is not provided
            owner = getCurrentUser();
        }
        
        // Check if hotel name already exists in the same city
        if (hotelRepository.existsByNameAndCity(request.getName(), request.getCity())) {
            throw new AppException(ErrorCode.HOTEL_NAME_ALREADY_EXISTS);
        }
        
        // Convert request to entity
        Hotel hotel = hotelMapper.toEntity(request);
        hotel.setOwner(owner);
        hotel.setCreatedBy(getCurrentUserId());
        hotel.setUpdatedBy(getCurrentUserId());
        
        // Save hotel
        Hotel savedHotel = hotelRepository.save(hotel);
        
        return hotelMapper.toResponse(savedHotel);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public HotelResponse updateHotel(UUID id, HotelUpdateRequest request) {
        log.info("Updating hotel: {}", id);

        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        // Check if new name conflicts with existing hotels in the same city
        if (request.getName() != null && !request.getName().equals(hotel.getName())) {
            String city = request.getCity() != null ? request.getCity() : hotel.getCity();
            if (hotelRepository.existsByNameAndCity(request.getName(), city)) {
                throw new AppException(ErrorCode.HOTEL_NAME_ALREADY_EXISTS);
            }
        }
        log.info("hotel.isActive: {}", hotel.isActive());
        log.info("hotel.isFeatured: {}", hotel.isFeatured());
        log.info("request.isActive: {}", request.isActive());
        log.info("request.isFeatured: {}", request.isFeatured());

        // Update hotel
        hotelMapper.updateEntity(hotel, request);

        log.info("Updated");
        log.info("hotel.isActive: {}", hotel.isActive());
        log.info("hotel.isFeatured: {}", hotel.isFeatured());

        hotel.setUpdatedBy(getCurrentUserId());

        Hotel updatedHotel = hotelRepository.save(hotel);

        return hotelMapper.toResponse(updatedHotel);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public void deleteHotel(UUID id) {
        log.info("Deleting hotel: {}", id);
        
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
        
        // TODO: Check if hotel has any bookings when booking entity is implemented
        // For now, we'll allow deletion
        
        hotelRepository.delete(hotel);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public HotelResponse toggleHotelStatus(UUID id) {
        log.info("Toggling hotel status: {}", id);
        
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
        
        // Debug: Before toggle
        log.info("=== TOGGLE STATUS DEBUG ===");
        log.info("Before toggle - Hotel: {} (ID: {})", hotel.getName(), hotel.getId());
        log.info("  - Current isActive: {}", hotel.isActive());
        log.info("  - Current isFeatured: {}", hotel.isFeatured());
        
        hotel.setActive(!hotel.isActive());
        hotel.setUpdatedBy(getCurrentUserId());
        
        // Debug: After toggle, before save
        log.info("After toggle - Hotel: {} (ID: {})", hotel.getName(), hotel.getId());
        log.info("  - New isActive: {}", hotel.isActive());
        log.info("  - New isFeatured: {}", hotel.isFeatured());
        
        Hotel updatedHotel = hotelRepository.save(hotel);
        
        // Debug: After save
        log.info("After save - Hotel: {} (ID: {})", updatedHotel.getName(), updatedHotel.getId());
        log.info("  - Saved isActive: {}", updatedHotel.isActive());
        log.info("  - Saved isFeatured: {}", updatedHotel.isFeatured());
        
        HotelResponse response = hotelMapper.toResponse(updatedHotel);
        
        // Debug: Final response
        log.info("Final response - Hotel: {} (ID: {})", response.getName(), response.getId());
        log.info("  - Response isActive: {}", response.isActive());
        log.info("  - Response isFeatured: {}", response.isFeatured());
        
        return response;
    }
    
    @Override
    @IsAdmin
    @Transactional
    public HotelResponse toggleFeaturedStatus(UUID id) {
        log.info("Toggling hotel featured status: {}", id);
        
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
        
        hotel.setFeatured(!hotel.isFeatured());
        hotel.setUpdatedBy(getCurrentUserId());
        
        Hotel updatedHotel = hotelRepository.save(hotel);
        
        return hotelMapper.toResponse(updatedHotel);
    }
    
    @Override
    public DataResponse<HotelResponse> searchHotels(String keyword, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Searching hotels with keyword: {}", keyword);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.searchByNameOrCityOrCountry(keyword, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public DataResponse<HotelResponse> getHotelsByCity(String city, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting hotels by city: {}", city);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findByCity(city, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public DataResponse<HotelResponse> getHotelsByCountry(String country, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting hotels by country: {}", country);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findByCountry(country, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public DataResponse<HotelResponse> getHotelsByStarRating(Integer starRating, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting hotels by star rating: {}", starRating);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findByStarRating(starRating, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public DataResponse<HotelResponse> getActiveHotels(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting active hotels");
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findByIsActiveTrue(pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public DataResponse<HotelResponse> getFeaturedHotels(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting featured hotels");
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findByIsFeaturedTrue(pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public DataResponse<HotelResponse> getHotelsByOwner(UUID ownerId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting hotels by owner: {}", ownerId);
        
        // Validate owner exists
        userRepository.findById(ownerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findByOwnerId(ownerId, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponseWithoutRelations)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public DataResponse<HotelResponse> getMyHotels(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting current user's hotels");
        
        UUID currentUserId = getCurrentUserId();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findByOwnerId(currentUserId, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponseWithoutRelations)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    public DataResponse<HotelResponse> getHotelsNearLocation(
            Double latitude, Double longitude, Double radiusKm, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting hotels near location: lat={}, lng={}, radius={}km", latitude, longitude, radiusKm);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Hotel> hotelPage = hotelRepository.findNearLocation(latitude, longitude, radiusKm, pageable);
        
        List<HotelResponse> hotelResponses = hotelPage.getContent().stream()
                .map(hotelMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(hotelPage, hotelResponses);
    }
    
    @Override
    @IsAdmin
    public Long getTotalHotelsCount() {
        return hotelRepository.count();
    }
    
    @Override
    @IsAdmin
    public Long getActiveHotelsCount() {
        return hotelRepository.countByIsActiveTrue();
    }
    
    @Override
    @IsAdmin
    public Long getFeaturedHotelsCount() {
        return hotelRepository.countByIsFeaturedTrue();
    }
    
    @Override
    @IsAdmin
    public Long getHotelsCountByOwner(UUID ownerId) {
        // Validate owner exists
        userRepository.findById(ownerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        return hotelRepository.countByOwnerId(ownerId);
    }
    
    @Override
    public boolean isHotelNameExistsInCity(String name, String city) {
        return hotelRepository.existsByNameAndCity(name, city);
    }
    
    // Helper methods
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();
        return userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
    
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString(authentication.getName());
    }
} 