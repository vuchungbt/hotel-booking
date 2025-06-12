package net.blwsmartware.booking.service;

import net.blwsmartware.booking.dto.request.BookingCreateRequest;
import net.blwsmartware.booking.dto.request.BookingUpdateRequest;
import net.blwsmartware.booking.dto.request.CancellationRequest;
import net.blwsmartware.booking.dto.response.BookingResponse;
import net.blwsmartware.booking.dto.response.DataResponse;
import net.blwsmartware.booking.enums.BookingStatus;
import net.blwsmartware.booking.enums.PaymentStatus;

import java.time.LocalDate;
import java.util.UUID;

public interface BookingService {

    BookingResponse createBooking(BookingCreateRequest request);

    DataResponse<BookingResponse> getMyBookings(Integer pageNumber, Integer pageSize, String sortBy);
    BookingResponse getMyBookingById(UUID bookingId);
    BookingResponse updateMyBooking(UUID bookingId, BookingUpdateRequest request);
    BookingResponse cancelMyBooking(UUID bookingId, String reason);
    DataResponse<BookingResponse> getHostBookings(String status, String paymentStatus, 
                                                  Integer pageNumber, Integer pageSize, String sortBy);
    BookingResponse getHostBookingById(UUID bookingId);
    BookingResponse updateHostBooking(UUID bookingId, BookingUpdateRequest request);
    BookingResponse confirmBooking(UUID bookingId);
    BookingResponse cancelBooking(UUID bookingId, String reason);
    BookingResponse completeBooking(UUID bookingId);
    BookingResponse confirmPayment(UUID bookingId);
    BookingResponse processCancellation(UUID bookingId, CancellationRequest request);
    DataResponse<BookingResponse> getBookingsByHotel(UUID hotelId, String status, 
                                                     Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<BookingResponse> getAllBookings(String status, String paymentStatus, 
                                                 Integer pageNumber, Integer pageSize, String sortBy);
    BookingResponse getBookingById(UUID bookingId);
    BookingResponse updateBooking(UUID bookingId, BookingUpdateRequest request);
    void deleteBooking(UUID bookingId);
    DataResponse<BookingResponse> searchBookings(String keyword, Integer pageNumber, Integer pageSize, String sortBy);
    DataResponse<BookingResponse> getBookingsByDateRange(LocalDate startDate, LocalDate endDate, 
                                                         Integer pageNumber, Integer pageSize, String sortBy);
    Long getTotalBookingsCount();
    Long getBookingsCountByStatus(BookingStatus status);
    Long getBookingsCountByPaymentStatus(PaymentStatus paymentStatus);
    Long getHostBookingsCount();
    Long getHostBookingsCountByStatus(BookingStatus status);
    // ===== UTILITY METHODS =====
    boolean isRoomAvailable(UUID roomTypeId, LocalDate checkInDate, LocalDate checkOutDate);
    boolean isRoomAvailable(UUID roomTypeId, LocalDate checkInDate, LocalDate checkOutDate, UUID excludeBookingId);
    String generateBookingReference();
} 