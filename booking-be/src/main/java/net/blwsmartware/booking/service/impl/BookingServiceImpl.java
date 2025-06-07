package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.request.BookingCreateRequest;
import net.blwsmartware.booking.dto.request.BookingUpdateRequest;
import net.blwsmartware.booking.dto.response.BookingResponse;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.entity.Booking;
import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.entity.RoomType;
import net.blwsmartware.booking.entity.User;
import net.blwsmartware.booking.enums.BookingStatus;
import net.blwsmartware.booking.enums.PaymentStatus;
import net.blwsmartware.booking.exception.AppException;
import net.blwsmartware.booking.exception.ErrorCode;
import net.blwsmartware.booking.mapper.BookingMapper;
import net.blwsmartware.booking.repository.BookingRepository;
import net.blwsmartware.booking.repository.HotelRepository;
import net.blwsmartware.booking.repository.RoomTypeRepository;
import net.blwsmartware.booking.repository.UserRepository;
import net.blwsmartware.booking.service.BookingService;
import net.blwsmartware.booking.util.DataResponseUtils;
import net.blwsmartware.booking.validator.IsAdmin;
import net.blwsmartware.booking.validator.IsHost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BookingServiceImpl implements BookingService {
    
    BookingRepository bookingRepository;
    HotelRepository hotelRepository;
    RoomTypeRepository roomTypeRepository;
    UserRepository userRepository;
    BookingMapper bookingMapper;
    
    // ===== GUEST OPERATIONS =====
    
    @Override
    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request) {
        log.info("Creating booking for hotel: {}, room type: {}", request.getHotelId(), request.getRoomTypeId());
        
        // 1. Validate basic booking data
        validateBookingDates(request.getCheckInDate(), request.getCheckOutDate());
        
        // 2. Get and validate hotel and room type
        Hotel hotel = getHotelById(request.getHotelId());
        RoomType roomType = getRoomTypeById(request.getRoomTypeId());
        
        // 3. Validate room type belongs to hotel
        if (!roomType.getHotel().getId().equals(hotel.getId())) {
            throw new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND);
        }
        
        // 4. Validate guest count
        if (request.getGuests() > roomType.getMaxOccupancy()) {
            throw new AppException(ErrorCode.INVALID_GUEST_COUNT);
        }
        
        // 5. Check room availability
        if (!isRoomAvailable(request.getRoomTypeId(), request.getCheckInDate(), request.getCheckOutDate())) {
            throw new AppException(ErrorCode.NO_ROOMS_AVAILABLE);
        }
        
        // 6. Get current user (if authenticated)
        User currentUser = getCurrentUser();
        
        // 7. Create booking entity
        Booking booking = bookingMapper.toEntity(request);
        booking.setHotel(hotel);
        booking.setRoomType(roomType);
        booking.setUser(currentUser);
        booking.setStatus(BookingStatus.PENDING);
        booking.setPaymentStatus(PaymentStatus.PENDING);
        booking.setBookingReference(generateBookingReference());
        
        if (currentUser != null) {
            booking.setCreatedBy(currentUser.getId());
        }
        
        // 8. Save booking
        booking = bookingRepository.save(booking);
        
        log.info("Booking created successfully with ID: {} and reference: {}", 
                booking.getId(), booking.getBookingReference());
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    public DataResponse<BookingResponse> getMyBookings(Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting user bookings");
        
        User currentUser = getCurrentUserRequired();
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Booking> bookingPage = bookingRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId(), pageable);
        
        List<BookingResponse> bookingResponses = bookingPage.getContent().stream()
                .map(bookingMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(bookingPage, bookingResponses);
    }
    
    @Override
    public BookingResponse getMyBookingById(UUID bookingId) {
        log.info("Getting user booking by ID: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @Transactional
    public BookingResponse updateMyBooking(UUID bookingId, BookingUpdateRequest request) {
        log.info("Updating user booking: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        
        // Only allow updates for pending bookings
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new AppException(ErrorCode.BOOKING_CANNOT_BE_CANCELLED);
        }
        
        // Validate dates if provided
        if (request.getCheckInDate() != null && request.getCheckOutDate() != null) {
            validateBookingDates(request.getCheckInDate(), request.getCheckOutDate());
            
            // Check availability for new dates (excluding current booking)
            if (!isRoomAvailable(booking.getRoomType().getId(), 
                               request.getCheckInDate(), request.getCheckOutDate(), bookingId)) {
                throw new AppException(ErrorCode.NO_ROOMS_AVAILABLE);
            }
        }
        
        // Validate guest count if provided
        if (request.getGuests() != null && request.getGuests() > booking.getRoomType().getMaxOccupancy()) {
            throw new AppException(ErrorCode.INVALID_GUEST_COUNT);
        }
        
        // Update booking (limited fields for users)
        if (request.getGuestName() != null) booking.setGuestName(request.getGuestName());
        if (request.getGuestEmail() != null) booking.setGuestEmail(request.getGuestEmail());
        if (request.getGuestPhone() != null) booking.setGuestPhone(request.getGuestPhone());
        if (request.getCheckInDate() != null) booking.setCheckInDate(request.getCheckInDate());
        if (request.getCheckOutDate() != null) booking.setCheckOutDate(request.getCheckOutDate());
        if (request.getGuests() != null) booking.setGuests(request.getGuests());
        if (request.getSpecialRequests() != null) booking.setSpecialRequests(request.getSpecialRequests());
        
        booking.setUpdatedBy(currentUser.getId());
        booking = bookingRepository.save(booking);
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @Transactional
    public BookingResponse cancelMyBooking(UUID bookingId, String reason) {
        log.info("Cancelling user booking: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        
        // Check if booking can be cancelled
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CANCELLED);
        }
        
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new AppException(ErrorCode.BOOKING_CANNOT_BE_CANCELLED);
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedBy(currentUser.getId());
        booking = bookingRepository.save(booking);
        
        log.info("Booking cancelled: {}", bookingId);
        
        return bookingMapper.toResponse(booking);
    }
    
    // ===== UTILITY METHODS =====
    
    private void validateBookingDates(LocalDate checkInDate, LocalDate checkOutDate) {
        LocalDate today = LocalDate.now();
        
        if (checkInDate.isBefore(today)) {
            throw new AppException(ErrorCode.CHECK_IN_DATE_PAST);
        }
        
        if (checkOutDate.isBefore(checkInDate) || checkOutDate.equals(checkInDate)) {
            throw new AppException(ErrorCode.CHECK_OUT_BEFORE_CHECK_IN);
        }
    }
    
    private Hotel getHotelById(UUID hotelId) {
        return hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
    }
    
    private RoomType getRoomTypeById(UUID roomTypeId) {
        return roomTypeRepository.findById(roomTypeId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }
    
    private User getCurrentUserRequired() {
        User user = getCurrentUser();
        if (user == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return user;
    }
    
    private UUID getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }
    
    @Override
    public boolean isRoomAvailable(UUID roomTypeId, LocalDate checkInDate, LocalDate checkOutDate) {
        return isRoomAvailable(roomTypeId, checkInDate, checkOutDate, null);
    }
    
    @Override
    public boolean isRoomAvailable(UUID roomTypeId, LocalDate checkInDate, LocalDate checkOutDate, UUID excludeBookingId) {
        RoomType roomType = getRoomTypeById(roomTypeId);
        
        Long conflictingBookings;
        if (excludeBookingId != null) {
            conflictingBookings = bookingRepository.countConflictingBookingsExcluding(
                    roomTypeId, checkInDate, checkOutDate, excludeBookingId);
        } else {
            conflictingBookings = bookingRepository.countConflictingBookings(
                    roomTypeId, checkInDate, checkOutDate);
        }
        
        return conflictingBookings < roomType.getTotalRooms();
    }
    
    @Override
    public String generateBookingReference() {
        String prefix = "BK";
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = String.format("%04d", new Random().nextInt(10000));
        
        String reference = prefix + datePart + randomPart;
        
        // Ensure uniqueness
        while (bookingRepository.existsByBookingReference(reference)) {
            randomPart = String.format("%04d", new Random().nextInt(10000));
            reference = prefix + datePart + randomPart;
        }
        
        return reference;
    }
    
    // ===== HOST OPERATIONS =====
    
    @Override
    @IsHost
    public DataResponse<BookingResponse> getHostBookings(String status, String paymentStatus, 
                                                         Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting host bookings with status: {}, paymentStatus: {}", status, paymentStatus);
        
        User currentUser = getCurrentUserRequired();
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Booking> bookingPage;
        
        if (status != null && paymentStatus != null) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            PaymentStatus paymentStatusEnum = PaymentStatus.valueOf(paymentStatus.toUpperCase());
            bookingPage = bookingRepository.findByStatusAndPaymentStatusOrderByCreatedAtDesc(
                    bookingStatus, paymentStatusEnum, pageable);
        } else if (status != null) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            bookingPage = bookingRepository.findByHotelOwnerIdAndStatusOrderByCreatedAtDesc(
                    currentUser.getId(), bookingStatus, pageable);
        } else {
            bookingPage = bookingRepository.findByHotelOwnerIdOrderByCreatedAtDesc(currentUser.getId(), pageable);
        }
        
        List<BookingResponse> bookingResponses = bookingPage.getContent().stream()
                .map(bookingMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(bookingPage, bookingResponses);
    }
    
    @Override
    @IsHost
    public BookingResponse getHostBookingById(UUID bookingId) {
        log.info("Getting host booking by ID: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndHotelOwnerId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsHost
    @Transactional
    public BookingResponse updateHostBooking(UUID bookingId, BookingUpdateRequest request) {
        log.info("Host updating booking: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndHotelOwnerId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        
        // Host can update more fields than regular users
        bookingMapper.updateEntity(booking, request);
        booking.setUpdatedBy(currentUser.getId());
        booking = bookingRepository.save(booking);
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsHost
    @Transactional
    public BookingResponse confirmBooking(UUID bookingId) {
        log.info("Confirming booking: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndHotelOwnerId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CONFIRMED);
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new AppException(ErrorCode.BOOKING_CANNOT_BE_CONFIRMED);
        }
        
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setUpdatedBy(currentUser.getId());
        booking = bookingRepository.save(booking);
        
        log.info("Booking confirmed: {}", bookingId);
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsHost
    @Transactional
    public BookingResponse cancelBooking(UUID bookingId, String reason) {
        log.info("Host cancelling booking: {} with reason: {}", bookingId, reason);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndHotelOwnerId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_CANCELLED);
        }
        
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new AppException(ErrorCode.BOOKING_CANNOT_BE_CANCELLED);
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedBy(currentUser.getId());
        booking = bookingRepository.save(booking);
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsHost
    @Transactional
    public BookingResponse completeBooking(UUID bookingId) {
        log.info("Completing booking: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findByIdAndHotelOwnerId(bookingId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new AppException(ErrorCode.BOOKING_CANNOT_BE_CONFIRMED);
        }
        
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setUpdatedBy(currentUser.getId());
        booking = bookingRepository.save(booking);
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsHost
    public DataResponse<BookingResponse> getBookingsByHotel(UUID hotelId, String status, 
                                                            Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting bookings for hotel: {} with status: {}", hotelId, status);
        
        User currentUser = getCurrentUserRequired();
        
        // Validate hotel ownership
        Hotel hotel = getHotelById(hotelId);
        if (!hotel.getOwner().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.HOTEL_ACCESS_DENIED);
        }
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Booking> bookingPage;
        
        if (status != null) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            bookingPage = bookingRepository.findByHotelIdAndStatusOrderByCreatedAtDesc(hotelId, bookingStatus, pageable);
        } else {
            bookingPage = bookingRepository.findByHotelIdOrderByCreatedAtDesc(hotelId, pageable);
        }
        
        List<BookingResponse> bookingResponses = bookingPage.getContent().stream()
                .map(bookingMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(bookingPage, bookingResponses);
    }
    
    // ===== ADMIN OPERATIONS =====
    
    @Override
    @IsAdmin
    public DataResponse<BookingResponse> getAllBookings(String status, String paymentStatus, 
                                                        Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Admin getting all bookings with status: {}, paymentStatus: {}", status, paymentStatus);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Booking> bookingPage;
        
        if (status != null && paymentStatus != null) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            PaymentStatus paymentStatusEnum = PaymentStatus.valueOf(paymentStatus.toUpperCase());
            bookingPage = bookingRepository.findByStatusAndPaymentStatusOrderByCreatedAtDesc(
                    bookingStatus, paymentStatusEnum, pageable);
        } else if (status != null) {
            BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
            bookingPage = bookingRepository.findByStatusOrderByCreatedAtDesc(bookingStatus, pageable);
        } else if (paymentStatus != null) {
            PaymentStatus paymentStatusEnum = PaymentStatus.valueOf(paymentStatus.toUpperCase());
            bookingPage = bookingRepository.findByPaymentStatusOrderByCreatedAtDesc(paymentStatusEnum, pageable);
        } else {
            bookingPage = bookingRepository.findAll(pageable);
        }
        
        List<BookingResponse> bookingResponses = bookingPage.getContent().stream()
                .map(bookingMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(bookingPage, bookingResponses);
    }
    
    @Override
    @IsAdmin
    public BookingResponse getBookingById(UUID bookingId) {
        log.info("Admin getting booking by ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public BookingResponse updateBooking(UUID bookingId, BookingUpdateRequest request) {
        log.info("Admin updating booking: {}", bookingId);
        
        User currentUser = getCurrentUserRequired();
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        
        bookingMapper.updateEntity(booking, request);
        booking.setUpdatedBy(currentUser.getId());
        booking = bookingRepository.save(booking);
        
        return bookingMapper.toResponse(booking);
    }
    
    @Override
    @IsAdmin
    @Transactional
    public void deleteBooking(UUID bookingId) {
        log.info("Admin deleting booking: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
        
        bookingRepository.delete(booking);
    }
    
    // ===== SEARCH & FILTER OPERATIONS =====
    
    @Override
    public DataResponse<BookingResponse> searchBookings(String keyword, Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Searching bookings with keyword: {}", keyword);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Booking> bookingPage = bookingRepository.searchBookings(keyword, pageable);
        
        List<BookingResponse> bookingResponses = bookingPage.getContent().stream()
                .map(bookingMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(bookingPage, bookingResponses);
    }
    
    @Override
    public DataResponse<BookingResponse> getBookingsByDateRange(LocalDate startDate, LocalDate endDate, 
                                                                Integer pageNumber, Integer pageSize, String sortBy) {
        log.info("Getting bookings by date range: {} to {}", startDate, endDate);
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(sortBy).descending());
        Page<Booking> bookingPage = bookingRepository.findByCheckInDateBetweenOrderByCreatedAtDesc(startDate, endDate, pageable);
        
        List<BookingResponse> bookingResponses = bookingPage.getContent().stream()
                .map(bookingMapper::toResponse)
                .toList();
        
        return DataResponseUtils.convertPageInfo(bookingPage, bookingResponses);
    }
    
    // ===== STATISTICS =====
    
    @Override
    @IsAdmin
    public Long getTotalBookingsCount() {
        return bookingRepository.count();
    }
    
    @Override
    @IsAdmin
    public Long getBookingsCountByStatus(BookingStatus status) {
        return bookingRepository.countByStatus(status);
    }
    
    @Override
    @IsAdmin
    public Long getBookingsCountByPaymentStatus(PaymentStatus paymentStatus) {
        return bookingRepository.countByPaymentStatus(paymentStatus);
    }
    
    @Override
    @IsHost
    public Long getHostBookingsCount() {
        User currentUser = getCurrentUserRequired();
        return bookingRepository.countByHotelOwnerId(currentUser.getId());
    }
    
    @Override
    @IsHost
    public Long getHostBookingsCountByStatus(BookingStatus status) {
        User currentUser = getCurrentUserRequired();
        return bookingRepository.countByHotelOwnerIdAndStatus(currentUser.getId(), status);
    }
} 