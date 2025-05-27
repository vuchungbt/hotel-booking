package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.request.ReviewCreateRequest;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.dto.response.ReviewResponse;
import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.entity.Review;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.exception.AppException;
import net.blwsmartware.booking.exception.ErrorCode;
import net.blwsmartware.booking.mapper.ReviewMapper;
import net.blwsmartware.booking.repository.HotelRepository;
import net.blwsmartware.booking.repository.ReviewRepository;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.service.ReviewService;
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

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ReviewServiceImpl implements ReviewService {
    
    ReviewRepository reviewRepository;
    HotelRepository hotelRepository;
    UserRepository userRepository;
    ReviewMapper reviewMapper;
    
    @Override
    @IsAdmin
    public DataResponse<ReviewResponse> getAllReviews(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting all reviews with pagination: page={}, size={}, sortBy={}", pageNumber, pageSize, sortBy);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findAll(pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    @IsAdmin
    public DataResponse<ReviewResponse> getAllReviewsWithFilters(
            UUID hotelId, UUID userId, Integer rating, Boolean isApproved, Boolean isVerified,
            Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting reviews with filters - hotel: {}, user: {}, rating: {}, approved: {}, verified: {}", 
                hotelId, userId, rating, isApproved, isVerified);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findWithFilters(
                hotelId, userId, rating, isApproved, isVerified, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    public ReviewResponse getReviewById(UUID id) {
        log.info("Getting review by ID: {}", id);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        
        return reviewMapper.toResponse(review);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public void deleteReview(UUID id) {
        log.info("Deleting review: {}", id);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        
        reviewRepository.delete(review);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public ReviewResponse approveReview(UUID id) {
        log.info("Approving review: {}", id);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        
        review.setApproved(true);
        Review updatedReview = reviewRepository.save(review);
        
        return reviewMapper.toResponse(updatedReview);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public ReviewResponse disapproveReview(UUID id) {
        log.info("Disapproving review: {}", id);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        
        review.setApproved(false);
        Review updatedReview = reviewRepository.save(review);
        
        return reviewMapper.toResponse(updatedReview);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public ReviewResponse verifyReview(UUID id) {
        log.info("Verifying review: {}", id);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        
        review.setVerified(true);
        Review updatedReview = reviewRepository.save(review);
        
        return reviewMapper.toResponse(updatedReview);
    }
    
    @Override
    public DataResponse<ReviewResponse> getReviewsByHotel(UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting reviews by hotel: {}", hotelId);
        
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findByHotelId(hotelId, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    public DataResponse<ReviewResponse> getApprovedReviewsByHotel(UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting approved reviews by hotel: {}", hotelId);
        
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findByHotelIdAndIsApprovedTrue(hotelId, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toPublicResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    public DataResponse<ReviewResponse> getVerifiedReviewsByHotel(UUID hotelId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting verified reviews by hotel: {}", hotelId);
        
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findByHotelIdAndIsVerifiedTrue(hotelId, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toPublicResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    @Transactional
    public ReviewResponse createReview(ReviewCreateRequest request) {
        log.info("Creating new review for hotel: {} by user: {}", request.getHotelId(), request.getUserId());
        
        // Get current user or use provided user ID
        User user;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        } else {
            user = getCurrentUser();
        }
        
        // Validate hotel exists
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
        
        // Check if user has already reviewed this hotel
        if (reviewRepository.existsByUserAndHotel(user, hotel)) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }
        
        // Create review
        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .hotel(hotel)
                .user(user)
                .isVerified(false)
                .isApproved(true) // Auto-approve for now
                .helpfulCount(0)
                .build();
        
        Review savedReview = reviewRepository.save(review);
        
        return reviewMapper.toResponse(savedReview);
    }
    
    @Override
    @Transactional
    public ReviewResponse updateReview(UUID id, ReviewCreateRequest request) {
        log.info("Updating review: {}", id);
        
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        
        // Check if current user owns this review
        UUID currentUserId = getCurrentUserId();
        if (!review.getUser().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        // Update review
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        
        Review updatedReview = reviewRepository.save(review);
        
        return reviewMapper.toResponse(updatedReview);
    }
    
    @Override
    public DataResponse<ReviewResponse> getMyReviews(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting my reviews");
        
        UUID currentUserId = getCurrentUserId();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findByUserId(currentUserId, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    @IsAdmin
    public DataResponse<ReviewResponse> getReviewsByUser(UUID userId, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting reviews by user: {}", userId);
        
        // Validate user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findByUserId(userId, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    public DataResponse<ReviewResponse> getReviewsByRating(Integer rating, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting reviews by rating: {}", rating);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.findByRating(rating, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toPublicResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    public DataResponse<ReviewResponse> searchReviews(String keyword, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Searching reviews with keyword: {}", keyword);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Review> reviewPage = reviewRepository.searchByComment(keyword, pageable);
        
        List<ReviewResponse> reviewResponses = reviewPage.getContent().stream()
                .map(reviewMapper::toPublicResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(reviewPage, reviewResponses);
    }
    
    @Override
    @IsAdmin
    public Long getTotalReviewsCount() {
        return reviewRepository.count();
    }
    
    @Override
    @IsAdmin
    public Long getApprovedReviewsCount() {
        return reviewRepository.countByIsApprovedTrue();
    }
    
    @Override
    @IsAdmin
    public Long getVerifiedReviewsCount() {
        return reviewRepository.countByIsVerifiedTrue();
    }
    
    @Override
    public Long getReviewsCountByHotel(UUID hotelId) {
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
        
        return reviewRepository.countByHotelId(hotelId);
    }
    
    @Override
    @IsAdmin
    public Long getReviewsCountByUser(UUID userId) {
        // Validate user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        return reviewRepository.countByUserId(userId);
    }
    
    @Override
    public Double getAverageRatingByHotel(UUID hotelId) {
        // Validate hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
        
        return reviewRepository.getAverageRatingByHotel(hotelId).orElse(0.0);
    }
    
    @Override
    public boolean hasUserReviewedHotel(UUID userId, UUID hotelId) {
        return reviewRepository.existsByUserIdAndHotelId(userId, hotelId);
    }
    
    @Override
    public boolean canUserReviewHotel(UUID userId, UUID hotelId) {
        // TODO: Implement logic to check if user has booking for this hotel
        // For now, return true if user hasn't reviewed yet
        return !hasUserReviewedHotel(userId, hotelId);
    }
    
    // Helper methods
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
    
    private UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }
} 