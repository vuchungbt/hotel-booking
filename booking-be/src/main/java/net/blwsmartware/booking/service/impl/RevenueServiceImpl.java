package net.blwsmartware.booking.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import net.blwsmartware.booking.dto.response.*;
import net.blwsmartware.booking.entity.Booking;
import net.blwsmartware.booking.entity.Hotel;
import net.blwsmartware.booking.enums.ErrorResponse;
import net.blwsmartware.booking.enums.PaymentStatus;
import net.blwsmartware.booking.exception.AppRuntimeException;
import net.blwsmartware.booking.repository.BookingRepository;
import net.blwsmartware.booking.repository.HotelRepository;
import net.blwsmartware.booking.service.RevenueService;
import net.blwsmartware.booking.util.DataResponseUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RevenueServiceImpl implements RevenueService {

    BookingRepository bookingRepository;
    HotelRepository hotelRepository;

    @Override
    @Transactional
    public void updateHotelRevenue(UUID bookingId) {
        log.info("Updating hotel revenue for booking: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.BOOKING_NOT_FOUND));
        
        // Chỉ cập nhật revenue khi booking đã được thanh toán
        if (booking.getPaymentStatus() != PaymentStatus.PAID) {
            log.warn("Booking {} is not paid, skipping revenue update", bookingId);
            return;
        }
        
        Hotel hotel = booking.getHotel();
        BigDecimal bookingAmount = booking.getTotalAmount();
        BigDecimal commissionRate = hotel.getCommissionRate();
        
        // Tính commission cho booking này
        BigDecimal commissionAmount = bookingAmount
                .multiply(commissionRate)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        // Cộng commission vào tổng commission của hotel
        BigDecimal currentCommission = hotel.getCommissionEarned() != null ? hotel.getCommissionEarned() : BigDecimal.ZERO;
        hotel.setCommissionEarned(currentCommission.add(commissionAmount));
        
        hotelRepository.save(hotel);
        
        log.info("Added commission {} VND for booking {} to hotel {} (total: {} VND)", 
                commissionAmount, bookingId, hotel.getName(), hotel.getCommissionEarned());
    }

    @Override
    @Transactional
    public void recalculateHotelRevenue(UUID hotelId) {
        log.info("Recalculating hotel revenue for hotel: {}", hotelId);
        
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        // Lấy tất cả bookings đã thanh toán của hotel
        BigDecimal totalGrossRevenue = bookingRepository.getTotalRevenueByHotel(hotelId);
        if (totalGrossRevenue == null) totalGrossRevenue = BigDecimal.ZERO;
        
        BigDecimal commissionRate = hotel.getCommissionRate();
        
        // Tính toán tổng hoa hồng
        BigDecimal totalCommission = totalGrossRevenue
                .multiply(commissionRate)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        // Chỉ cập nhật commission, không lưu totalRevenue nữa
        hotel.setCommissionEarned(totalCommission);
        
        hotelRepository.save(hotel);
        
        log.info("Recalculated hotel {} commission: {} VND from gross revenue: {} VND (rate: {}%)", 
                hotel.getName(), totalCommission, totalGrossRevenue, commissionRate);
    }

    @Override
    public RevenueStatsResponse getRevenueStats(LocalDate startDate, LocalDate endDate) {
        log.info("Getting revenue stats from {} to {}", startDate, endDate);
        
        if (startDate == null || endDate == null) {
            // Default to current month
            YearMonth currentMonth = YearMonth.now();
            startDate = currentMonth.atDay(1);
            endDate = currentMonth.atEndOfMonth();
        }
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        
        // Tổng doanh thu hệ thống = tổng tất cả booking đã thanh toán
        BigDecimal totalSystemRevenue = bookingRepository.getTotalRevenue();
        if (totalSystemRevenue == null) totalSystemRevenue = BigDecimal.ZERO;
        
        // Tổng hoa hồng đã kiếm được từ tất cả khách sạn
        BigDecimal totalCommissionRevenue = hotelRepository.getTotalCommissionEarned();
        if (totalCommissionRevenue == null) totalCommissionRevenue = BigDecimal.ZERO;
        
        // Thống kê khác
        Long totalHotels = hotelRepository.countByIsActiveTrue();
        Long totalBookings = bookingRepository.countByPaymentStatus(PaymentStatus.PAID);
        
        BigDecimal averageCommissionRate = hotelRepository.getAverageCommissionRate()
                .orElse(BigDecimal.valueOf(15.00));
        
        // Tính growth so với tháng trước (simplified)
        BigDecimal monthlyGrowth = BigDecimal.valueOf(12.5); // Placeholder
        
        return RevenueStatsResponse.builder()
                .totalRevenue(totalSystemRevenue)
                .totalCommissionRevenue(totalCommissionRevenue)
                .totalHotels(totalHotels)
                .totalBookings(totalBookings)
                .averageCommissionRate(averageCommissionRate)
                .monthlyGrowth(monthlyGrowth)
                .build();
    }

    @Override
    public RevenuePageResponse getRevenueData(String search, String status, String dateRange, 
                                              LocalDate startDate, LocalDate endDate,
                                              int page, int size, String sort, String direction) {
        log.info("Getting revenue data - search: {}, status: {}, dateRange: {}", search, status, dateRange);
        
        // Process date range
        if ("this-month".equals(dateRange)) {
            YearMonth currentMonth = YearMonth.now();
            startDate = currentMonth.atDay(1);
            endDate = currentMonth.atEndOfMonth();
        } else if ("last-month".equals(dateRange)) {
            YearMonth lastMonth = YearMonth.now().minusMonths(1);
            startDate = lastMonth.atDay(1);
            endDate = lastMonth.atEndOfMonth();
        }
        // Add more date range logic as needed
        
        // Create pageable
        Sort.Direction sortDirection = "ASC".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        // Process status filter
        Boolean isActive = null;
        if ("active".equals(status)) {
            isActive = true;
        } else if ("inactive".equals(status)) {
            isActive = false;
        }
        
        // Get hotels with filters
        Page<Hotel> hotelPage = hotelRepository.findHotelsForRevenue(search, isActive, pageable);
        
        // Convert to HotelRevenueResponse
        List<HotelRevenueResponse> hotelRevenueList = new ArrayList<>();
        
        for (Hotel hotel : hotelPage.getContent()) {
            // Get booking stats for this hotel
            Long totalBookings = bookingRepository.countPaidBookingsByHotel(hotel.getId());
            
            // Tính tổng doanh thu gốc (trước khi trừ hoa hồng) từ bookings
            BigDecimal totalGrossRevenue = bookingRepository.getTotalRevenueByHotel(hotel.getId());
            if (totalGrossRevenue == null) totalGrossRevenue = BigDecimal.ZERO;
            
            // Lấy commission đã lưu trong DB
            BigDecimal commissionEarned = hotel.getCommissionEarned() != null ? hotel.getCommissionEarned() : BigDecimal.ZERO;
            
            // Tính doanh thu ròng = tổng doanh thu - hoa hồng
            BigDecimal netRevenue = totalGrossRevenue.subtract(commissionEarned);
            
            LocalDateTime lastBookingDate = bookingRepository.findLastBookingDateByHotel(hotel.getId()).orElse(null);
            
            HotelRevenueResponse hotelRevenue = HotelRevenueResponse.builder()
                    .id(hotel.getId())
                    .hotelName(hotel.getName())
                    .ownerName(hotel.getOwner().getName())
                    .totalBookings(totalBookings)
                    .totalRevenue(totalGrossRevenue)  // Tổng doanh thu gốc từ bookings
                    .commissionRate(hotel.getCommissionRate())
                    .commissionAmount(commissionEarned)  // Hoa hồng đã lưu trong DB
                    .netRevenue(netRevenue)           // Tính lại: gross - commission
                    .city(hotel.getCity())
                    .country(hotel.getCountry())
                    .lastBookingDate(lastBookingDate)
                    .status(hotel.isActive() ? "active" : "inactive")
                    .build();
            
            hotelRevenueList.add(hotelRevenue);
        }
        
        // Get stats
        RevenueStatsResponse stats = getRevenueStats(startDate, endDate);
        
        return RevenuePageResponse.builder()
                .stats(stats)
                .hotels(hotelRevenueList)
                .currentPage(page)
                .totalPages(hotelPage.getTotalPages())
                .totalElements(hotelPage.getTotalElements())
                .pageSize(size)
                .build();
    }

    @Override
    public BigDecimal getHotelRevenue(UUID hotelId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        
        return bookingRepository.getTotalRevenueByHotelAndDateRange(hotelId, startDateTime, endDateTime);
    }

    @Override
    public BigDecimal getHotelCommissionEarned(UUID hotelId, LocalDate startDate, LocalDate endDate) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new AppRuntimeException(ErrorResponse.HOTEL_NOT_FOUND));
        
        BigDecimal revenue = getHotelRevenue(hotelId, startDate, endDate);
        BigDecimal commissionRate = hotel.getCommissionRate();
        
        return revenue.multiply(commissionRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }
} 