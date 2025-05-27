package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.request.HotelCreateRequest;
import net.blwsmartware.booking.dto.request.HotelUpdateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.HotelResponse;

import java.math.BigDecimal;
import java.util.UUID;

public interface HotelService {
    
    DataResponse<HotelResponse> getAllHotels(Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<HotelResponse> getAllHotelsWithFilters(
            String city, String country, Integer starRating, Boolean isActive, Boolean isFeatured,
            BigDecimal minPrice, BigDecimal maxPrice, Integer pageNumber, Integer pageSize, String sortBy);
    HotelResponse getHotelById(UUID id);
    HotelResponse createHotel(HotelCreateRequest request);
    HotelResponse updateHotel(UUID id, HotelUpdateRequest request);
    void deleteHotel(UUID id);
    HotelResponse toggleHotelStatus(UUID id);
    HotelResponse toggleFeaturedStatus(UUID id);
    
    DataResponse<HotelResponse> searchHotels(String keyword, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<HotelResponse> getHotelsByCity(String city, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<HotelResponse> getHotelsByCountry(String country, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<HotelResponse> getHotelsByStarRating(Integer starRating, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<HotelResponse> getActiveHotels(Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<HotelResponse> getFeaturedHotels(Integer pageNumber, Integer pageSize, String sortBy);

    DataResponse<HotelResponse> getHotelsByOwner(UUID ownerId, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<HotelResponse> getMyHotels(Integer pageNumber, Integer pageSize, String sortBy); // For current user

    DataResponse<HotelResponse> getHotelsNearLocation(
            Double latitude, Double longitude, Double radiusKm, Integer pageNumber, Integer pageSize, String sortBy);
    
    Long getTotalHotelsCount();
    Long getActiveHotelsCount();
    Long getFeaturedHotelsCount();
    Long getHotelsCountByOwner(UUID ownerId);
    
    boolean isHotelNameExistsInCity(String name, String city);
} 