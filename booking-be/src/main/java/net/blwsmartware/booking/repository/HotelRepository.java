package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, UUID> {
    
    // Find hotels by owner
    Page<Hotel> findByOwner(User owner, Pageable pageable);
    List<Hotel> findByOwner(User owner);
    
    // Find hotels by owner ID
    Page<Hotel> findByOwnerId(UUID ownerId, Pageable pageable);
    List<Hotel> findByOwnerId(UUID ownerId);
    
    // Find active hotels
    Page<Hotel> findByIsActiveTrue(Pageable pageable);
    List<Hotel> findByIsActiveTrue();
    
    // Find featured hotels
    Page<Hotel> findByIsFeaturedTrue(Pageable pageable);
    List<Hotel> findByIsFeaturedTrue();
    
    // Find hotels by city
    Page<Hotel> findByCity(String city, Pageable pageable);
    Page<Hotel> findByCityIgnoreCase(String city, Pageable pageable);
    List<Hotel> findByCityIgnoreCase(String city);
    
    // Find hotels by country
    Page<Hotel> findByCountry(String country, Pageable pageable);
    Page<Hotel> findByCountryIgnoreCase(String country, Pageable pageable);
    List<Hotel> findByCountryIgnoreCase(String country);
    
    // Find hotels by star rating
    Page<Hotel> findByStarRating(Integer starRating, Pageable pageable);
    List<Hotel> findByStarRating(Integer starRating);
    
    // Search hotels by name, city or country
    @Query("SELECT h FROM Hotel h WHERE " +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.address) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.country) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Hotel> searchByNameOrCityOrCountry(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT h FROM Hotel h WHERE " +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.address) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Hotel> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    // Find hotels with comprehensive filters
    @Query("SELECT h FROM Hotel h WHERE " +
           "(:city IS NULL OR LOWER(h.city) = LOWER(:city)) AND " +
           "(:country IS NULL OR LOWER(h.country) = LOWER(:country)) AND " +
           "(:starRating IS NULL OR h.starRating = :starRating) AND " +
           "(:isActive IS NULL OR h.isActive = :isActive) AND " +
           "(:isFeatured IS NULL OR h.isFeatured = :isFeatured) AND " +
           "(:minPrice IS NULL OR h.pricePerNight >= :minPrice) AND " +
           "(:maxPrice IS NULL OR h.pricePerNight <= :maxPrice)")
    Page<Hotel> findWithFilters(@Param("city") String city,
                               @Param("country") String country,
                               @Param("starRating") Integer starRating,
                               @Param("isActive") Boolean isActive,
                               @Param("isFeatured") Boolean isFeatured,
                               @Param("minPrice") BigDecimal minPrice,
                               @Param("maxPrice") BigDecimal maxPrice,
                               Pageable pageable);
    
    // Find my hotels with filters (for Host)
    @Query("SELECT h FROM Hotel h WHERE " +
           "h.owner.id = :ownerId AND " +
           "(:city IS NULL OR LOWER(h.city) = LOWER(:city)) AND " +
           "(:country IS NULL OR LOWER(h.country) = LOWER(:country)) AND " +
           "(:starRating IS NULL OR h.starRating = :starRating) AND " +
           "(:isActive IS NULL OR h.isActive = :isActive)")
    Page<Hotel> findMyHotelsWithFilters(@Param("ownerId") UUID ownerId,
                                       @Param("city") String city,
                                       @Param("country") String country,
                                       @Param("starRating") Integer starRating,
                                       @Param("isActive") Boolean isActive,
                                       Pageable pageable);
    
    // Legacy method for backward compatibility (if needed)
    @Query("SELECT h FROM Hotel h WHERE " +
           "(:isActive IS NULL OR h.isActive = :isActive) AND " +
           "(:isFeatured IS NULL OR h.isFeatured = :isFeatured) AND " +
           "(:starRating IS NULL OR h.starRating = :starRating) AND " +
           "(:city IS NULL OR LOWER(h.city) = LOWER(:city)) AND " +
           "(:ownerId IS NULL OR h.owner.id = :ownerId)")
    Page<Hotel> findWithBasicFilters(@Param("isActive") Boolean isActive,
                                    @Param("isFeatured") Boolean isFeatured,
                                    @Param("starRating") Integer starRating,
                                    @Param("city") String city,
                                    @Param("ownerId") UUID ownerId,
                                    Pageable pageable);
    
    // Find hotels near location
    @Query("SELECT h FROM Hotel h WHERE " +
           "h.latitude IS NOT NULL AND h.longitude IS NOT NULL AND " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(h.latitude)) * " +
           "cos(radians(h.longitude) - radians(:lng)) + " +
           "sin(radians(:lat)) * sin(radians(h.latitude)))) <= :radius")
    Page<Hotel> findNearLocation(@Param("lat") Double latitude,
                                @Param("lng") Double longitude,
                                @Param("radius") Double radiusKm,
                                Pageable pageable);
    
    @Query("SELECT h FROM Hotel h WHERE " +
           "h.latitude IS NOT NULL AND h.longitude IS NOT NULL AND " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(h.latitude)) * " +
           "cos(radians(h.longitude) - radians(:lng)) + " +
           "sin(radians(:lat)) * sin(radians(h.latitude)))) <= :radius")
    Page<Hotel> findByLocationWithinRadius(@Param("lat") Double latitude,
                                          @Param("lng") Double longitude,
                                          @Param("radius") Double radiusKm,
                                          Pageable pageable);
    
    // Count hotels by owner
    long countByOwner(User owner);
    long countByOwnerId(UUID ownerId);
    long countByOwnerIdAndIsActiveTrue(UUID ownerId);
    
    // Count active hotels
    long countByIsActiveTrue();
    
    // Count featured hotels
    long countByIsFeaturedTrue();
    
    // Check if hotel name exists
    boolean existsByNameAndOwner(String name, User owner);
    boolean existsByNameAndOwnerId(String name, UUID ownerId);
    boolean existsByNameAndCity(String name, String city);
    
    // Get hotel statistics
    @Query("SELECT COUNT(h) FROM Hotel h WHERE h.isActive = true")
    long countActiveHotels();
    
    @Query("SELECT COUNT(h) FROM Hotel h WHERE h.isFeatured = true")
    long countFeaturedHotels();
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.id = :hotelId AND r.isApproved = true")
    Optional<Double> getAverageRating(@Param("hotelId") UUID hotelId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.hotel.id = :hotelId AND r.isApproved = true")
    long getReviewCount(@Param("hotelId") UUID hotelId);
} 