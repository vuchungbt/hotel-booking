package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.entity.Review;
import net.blwsmartware.booking.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    
    // Find reviews by hotel
    Page<Review> findByHotel(Hotel hotel, Pageable pageable);
    List<Review> findByHotel(Hotel hotel);
    
    // Find reviews by hotel ID
    Page<Review> findByHotelId(UUID hotelId, Pageable pageable);
    List<Review> findByHotelId(UUID hotelId);
    
    // Find reviews by user
    Page<Review> findByUser(User user, Pageable pageable);
    List<Review> findByUser(User user);
    
    // Find reviews by user ID
    Page<Review> findByUserId(UUID userId, Pageable pageable);
    List<Review> findByUserId(UUID userId);
    
    // Find approved reviews
    Page<Review> findByIsApprovedTrue(Pageable pageable);
    List<Review> findByIsApprovedTrue();
    
    // Find verified reviews
    Page<Review> findByIsVerifiedTrue(Pageable pageable);
    List<Review> findByIsVerifiedTrue();
    
    // Find approved reviews by hotel
    Page<Review> findByHotelAndIsApprovedTrue(Hotel hotel, Pageable pageable);
    List<Review> findByHotelAndIsApprovedTrue(Hotel hotel);
    
    // Find approved reviews by hotel ID
    Page<Review> findByHotelIdAndIsApprovedTrue(UUID hotelId, Pageable pageable);
    List<Review> findByHotelIdAndIsApprovedTrue(UUID hotelId);
    
    // Find verified reviews by hotel
    Page<Review> findByHotelAndIsVerifiedTrue(Hotel hotel, Pageable pageable);
    List<Review> findByHotelAndIsVerifiedTrue(Hotel hotel);
    
    // Find verified reviews by hotel ID
    Page<Review> findByHotelIdAndIsVerifiedTrue(UUID hotelId, Pageable pageable);
    List<Review> findByHotelIdAndIsVerifiedTrue(UUID hotelId);
    
    // Find reviews by rating
    Page<Review> findByRating(Integer rating, Pageable pageable);
    List<Review> findByRating(Integer rating);
    
    // Search reviews by comment
    @Query("SELECT r FROM Review r WHERE LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Review> searchByComment(@Param("keyword") String keyword, Pageable pageable);
    
    // Find reviews with filters
    @Query("SELECT r FROM Review r WHERE " +
           "(:hotelId IS NULL OR r.hotel.id = :hotelId) AND " +
           "(:userId IS NULL OR r.user.id = :userId) AND " +
           "(:rating IS NULL OR r.rating = :rating) AND " +
           "(:isApproved IS NULL OR r.isApproved = :isApproved) AND " +
           "(:isVerified IS NULL OR r.isVerified = :isVerified)")
    Page<Review> findWithFilters(@Param("hotelId") UUID hotelId,
                                @Param("userId") UUID userId,
                                @Param("rating") Integer rating,
                                @Param("isApproved") Boolean isApproved,
                                @Param("isVerified") Boolean isVerified,
                                Pageable pageable);
    
    // Check if user has reviewed hotel
    boolean existsByUserAndHotel(User user, Hotel hotel);
    boolean existsByUserIdAndHotelId(UUID userId, UUID hotelId);
    
    // Find review by user and hotel
    Optional<Review> findByUserAndHotel(User user, Hotel hotel);
    Optional<Review> findByUserIdAndHotelId(UUID userId, UUID hotelId);
    
    // Count reviews by hotel
    long countByHotel(Hotel hotel);
    long countByHotelId(UUID hotelId);
    
    // Count approved reviews by hotel
    long countByHotelAndIsApprovedTrue(Hotel hotel);
    long countByHotelIdAndIsApprovedTrue(UUID hotelId);
    
    // Count verified reviews by hotel
    long countByHotelAndIsVerifiedTrue(Hotel hotel);
    long countByHotelIdAndIsVerifiedTrue(UUID hotelId);
    
    // Count reviews by user
    long countByUser(User user);
    long countByUserId(UUID userId);
    
    // Count approved reviews
    long countByIsApprovedTrue();
    
    // Count verified reviews
    long countByIsVerifiedTrue();
    
    // Get average rating by hotel
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.id = :hotelId AND r.isApproved = true")
    Optional<Double> getAverageRatingByHotel(@Param("hotelId") UUID hotelId);
    
    // Get recent reviews by hotel (limit 5)
    @Query("SELECT r FROM Review r WHERE r.hotel.id = :hotelId AND r.isApproved = true ORDER BY r.createdAt DESC")
    List<Review> findRecentReviewsByHotel(@Param("hotelId") UUID hotelId, Pageable pageable);
} 