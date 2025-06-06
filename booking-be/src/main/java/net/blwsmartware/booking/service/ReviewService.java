package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.request.ReviewCreateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.ReviewResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ReviewService {
    
    // Admin operations
    DataResponse<ReviewResponse> getAllReviews(Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<ReviewResponse> getAllReviewsWithFilters(
            UUID hotelId, UUID userId, Integer rating, Boolean isApproved, Boolean isVerified,
            Integer pageNumber, Integer pageSize, String sortBy);
    ReviewResponse getReviewById(UUID id);
    void deleteReview(UUID id);
    ReviewResponse approveReview(UUID id);
    ReviewResponse disapproveReview(UUID id);
    ReviewResponse verifyReview(UUID id);
    
    // Hotel-specific operations
    DataResponse<ReviewResponse> getReviewsByHotel(UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<ReviewResponse> getApprovedReviewsByHotel(UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<ReviewResponse> getVerifiedReviewsByHotel(UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy);
    
    // User operations
    ReviewResponse createReview(ReviewCreateRequest request);
    ReviewResponse updateReview(UUID id, ReviewCreateRequest request);
    DataResponse<ReviewResponse> getMyReviews(Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<ReviewResponse> getReviewsByUser(UUID userId, Integer pageNumber, Integer pageSize, String sortBy);
    
    // Search and filter operations
    DataResponse<ReviewResponse> getReviewsByRating(Integer rating, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<ReviewResponse> searchReviews(String keyword, Integer pageNumber, Integer pageSize, String sortBy);
    
    // Statistics
    Long getTotalReviewsCount();
    Long getApprovedReviewsCount();
    Long getVerifiedReviewsCount();
    Long getReviewsCountByHotel(UUID hotelId);
    Long getReviewsCountByUser(UUID userId);
    Double getAverageRatingByHotel(UUID hotelId);
    
    // Validation methods
    boolean hasUserReviewedHotel(UUID userId, UUID hotelId);
    boolean canUserReviewHotel(UUID userId, UUID hotelId);
} 