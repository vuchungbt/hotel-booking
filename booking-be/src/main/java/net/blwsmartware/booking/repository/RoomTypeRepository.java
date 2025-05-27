package net.blwsmartware.booking.repository;

import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.entity.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, UUID> {
    
    // Find room types by hotel
    Page<RoomType> findByHotel(Hotel hotel, Pageable pageable);
    List<RoomType> findByHotel(Hotel hotel);
    
    // Find room types by hotel ID
    Page<RoomType> findByHotelId(UUID hotelId, Pageable pageable);
    List<RoomType> findByHotelId(UUID hotelId);
    
    // Find active room types
    Page<RoomType> findByIsActiveTrue(Pageable pageable);
    List<RoomType> findByIsActiveTrue();
    
    // Find active room types by hotel
    Page<RoomType> findByHotelAndIsActiveTrue(Hotel hotel, Pageable pageable);
    List<RoomType> findByHotelAndIsActiveTrue(Hotel hotel);
    
    // Find room types by hotel ID and active status
    Page<RoomType> findByHotelIdAndIsActiveTrue(UUID hotelId, Pageable pageable);
    List<RoomType> findByHotelIdAndIsActiveTrue(UUID hotelId);
    
    // Find room types by max occupancy
    Page<RoomType> findByMaxOccupancyGreaterThanEqual(Integer minOccupancy, Pageable pageable);
    List<RoomType> findByMaxOccupancyGreaterThanEqual(Integer minOccupancy);
    
    // Find room types by price range
    Page<RoomType> findByPricePerNightBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    List<RoomType> findByPricePerNightBetween(BigDecimal minPrice, BigDecimal maxPrice);
    
    // Find available room types (where availableRooms > 0)
    @Query("SELECT rt FROM RoomType rt WHERE rt.availableRooms > 0 AND rt.isActive = true")
    Page<RoomType> findAvailableRoomTypes(Pageable pageable);
    
    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.id = :hotelId AND rt.availableRooms > 0 AND rt.isActive = true")
    Page<RoomType> findAvailableRoomTypesByHotel(@Param("hotelId") UUID hotelId, Pageable pageable);
    
    // Find room types by hotel ID and active status with available rooms
    Page<RoomType> findByHotelIdAndIsActiveTrueAndAvailableRoomsGreaterThan(UUID hotelId, Integer availableRooms, Pageable pageable);
    List<RoomType> findByHotelIdAndIsActiveTrueAndAvailableRoomsGreaterThan(UUID hotelId, Integer availableRooms);
    
    // Find active room types with available rooms
    Page<RoomType> findByIsActiveTrueAndAvailableRoomsGreaterThan(Integer availableRooms, Pageable pageable);
    List<RoomType> findByIsActiveTrueAndAvailableRoomsGreaterThan(Integer availableRooms);
    
    // Search room types by name
    @Query("SELECT rt FROM RoomType rt WHERE LOWER(rt.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<RoomType> searchByName(@Param("keyword") String keyword, Pageable pageable);
    
    // Search room types by name or description
    @Query("SELECT rt FROM RoomType rt WHERE " +
           "LOWER(rt.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(rt.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<RoomType> searchByNameOrDescription(@Param("keyword") String keyword, Pageable pageable);
    
    // Find room types with filters
    @Query("SELECT rt FROM RoomType rt WHERE " +
           "(:hotelId IS NULL OR rt.hotel.id = :hotelId) AND " +
           "(:isActive IS NULL OR rt.isActive = :isActive) AND " +
           "(:minOccupancy IS NULL OR rt.maxOccupancy >= :minOccupancy) AND " +
           "(:maxOccupancy IS NULL OR rt.maxOccupancy <= :maxOccupancy) AND " +
           "(:minPrice IS NULL OR rt.pricePerNight >= :minPrice) AND " +
           "(:maxPrice IS NULL OR rt.pricePerNight <= :maxPrice)")
    Page<RoomType> findWithFilters(@Param("hotelId") UUID hotelId,
                                  @Param("isActive") Boolean isActive,
                                  @Param("minOccupancy") Integer minOccupancy,
                                  @Param("maxOccupancy") Integer maxOccupancy,
                                  @Param("minPrice") BigDecimal minPrice,
                                  @Param("maxPrice") BigDecimal maxPrice,
                                  Pageable pageable);
    
    // Count room types by hotel
    long countByHotel(Hotel hotel);
    long countByHotelId(UUID hotelId);
    
    // Count active room types by hotel
    long countByHotelAndIsActiveTrue(Hotel hotel);
    long countByHotelIdAndIsActiveTrue(UUID hotelId);
    
    // Count active room types
    long countByIsActiveTrue();
    
    // Check if room type name exists for hotel (for validation)
    boolean existsByNameAndHotel(String name, Hotel hotel);
    boolean existsByNameAndHotelId(String name, UUID hotelId);
    
    // Get total and available rooms for hotel
    @Query("SELECT SUM(rt.totalRooms) FROM RoomType rt WHERE rt.hotel.id = :hotelId AND rt.isActive = true")
    Long getTotalRoomsByHotel(@Param("hotelId") UUID hotelId);
    
    @Query("SELECT SUM(rt.availableRooms) FROM RoomType rt WHERE rt.hotel.id = :hotelId AND rt.isActive = true")
    Long getAvailableRoomsByHotel(@Param("hotelId") UUID hotelId);
    
    // Get price range for hotel
    @Query("SELECT MIN(rt.pricePerNight) FROM RoomType rt WHERE rt.hotel.id = :hotelId AND rt.isActive = true")
    BigDecimal getMinPriceByHotel(@Param("hotelId") UUID hotelId);
    
    @Query("SELECT MAX(rt.pricePerNight) FROM RoomType rt WHERE rt.hotel.id = :hotelId AND rt.isActive = true")
    BigDecimal getMaxPriceByHotel(@Param("hotelId") UUID hotelId);
} 