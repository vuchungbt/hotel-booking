import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, MapPin, DollarSign, Check, X, Clock, Eye, Phone, Mail, RefreshCw, BookOpen, Search } from 'lucide-react';
import { bookingAPI, BookingResponse, BookingFilterParams } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const HostBookings: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Fetch bookings from API
  const fetchBookings = async (pageNumber = 0) => {
    try {
      setLoading(pageNumber === 0);
      
      const filterParams: BookingFilterParams = {
        pageNumber,
        pageSize,
        sortBy: 'createdAt'
      };

      // Add status filter if not 'all'
      if (activeTab !== 'all') {
        filterParams.status = activeTab as 'confirmed' | 'pending' | 'cancelled' | 'completed';
      }

      const response = await bookingAPI.getHostBookings(filterParams);
      
      if (response.data.success) {
        const { content, totalElements: total, totalPages: pages, number } = response.data.result;
        setBookings(content || []);
        setTotalElements(total || 0);
        setTotalPages(pages || 0);
        setCurrentPage(number || 0);
      } else {
        throw new Error(response.data.message || 'Không thể tải danh sách đặt phòng');
      }
      
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      
      // Fallback: show empty state
      setBookings([]);
      setTotalPages(0);
      setTotalElements(0);
      setCurrentPage(0);
      
      showToast('warning', 'Thông báo', 'Chưa có đặt phòng nào hoặc dịch vụ tạm thời không khả dụng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings(currentPage);
  };

  useEffect(() => {
    fetchBookings(0);
  }, [activeTab]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã xác nhận</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Chờ xác nhận</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Đã hủy</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Đã hoàn thành</span>;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đã thanh toán</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Chờ thanh toán</span>;
      case 'refunded':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Đã hoàn tiền</span>;
      default:
        return null;
    }
  };

  // Client-side filtering for search
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (booking.bookingReference && booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleViewBooking = (id: string) => {
    navigate(`/host/bookings/${id}`);
  };

  const handleConfirmBooking = async (id: string) => {
    try {
      setActionLoading(id);
      const response = await bookingAPI.confirmBooking(id);
      
      if (response.data.success) {
        showToast('success', 'Thành công', 'Đặt phòng đã được xác nhận');
        await fetchBookings(currentPage);
      } else {
        throw new Error(response.data.message || 'Không thể xác nhận đặt phòng');
      }
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      showToast('error', 'Lỗi', error.message || 'Không thể xác nhận đặt phòng');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này không?')) {
      try {
        setActionLoading(id);
        const response = await bookingAPI.cancelBooking(id, 'Hủy bởi chủ khách sạn');
        
        if (response.data.success) {
          showToast('success', 'Thành công', 'Đặt phòng đã được hủy');
          await fetchBookings(currentPage);
        } else {
          throw new Error(response.data.message || 'Không thể hủy đặt phòng');
        }
      } catch (error: any) {
        console.error('Error cancelling booking:', error);
        showToast('error', 'Lỗi', error.message || 'Không thể hủy đặt phòng');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleCompleteBooking = async (id: string) => {
    try {
      setActionLoading(id);
      const response = await bookingAPI.completeBooking(id);
      
      if (response.data.success) {
        showToast('success', 'Thành công', 'Đặt phòng đã được đánh dấu hoàn thành');
        await fetchBookings(currentPage);
      } else {
        throw new Error(response.data.message || 'Không thể hoàn thành đặt phòng');
      }
    } catch (error: any) {
      console.error('Error completing booking:', error);
      showToast('error', 'Lỗi', error.message || 'Không thể hoàn thành đặt phòng');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchBookings(newPage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý đặt phòng</h1>
            <p className="text-gray-600 mt-1">Tổng {totalElements} đặt phòng</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Chờ xác nhận
              </button>
              <button
                onClick={() => setActiveTab('confirmed')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'confirmed'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Đã xác nhận
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Đã hoàn thành
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'cancelled'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Đã hủy
              </button>
            </nav>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khách, mã đặt phòng, khách sạn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {bookings.length === 0 ? 'Chưa có đặt phòng nào' : 'Không tìm thấy đặt phòng nào'}
            </h3>
            <p className="text-gray-600 mb-6">
              {bookings.length === 0 
                ? 'Các đặt phòng từ khách hàng sẽ hiển thị ở đây' 
                : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thông tin đặt phòng
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách hàng
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày lưu trú
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số tiền
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-blue-600">
                              {booking.bookingReference || booking.id}
                            </div>
                            <div className="text-sm text-gray-900">{booking.hotelName}</div>
                            <div className="text-sm text-gray-500">{booking.roomTypeName}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              {booking.guests} khách
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {booking.guestEmail}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {booking.guestPhone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">Nhận: {formatDate(booking.checkInDate)}</div>
                            <div className="text-sm text-gray-900">Trả: {formatDate(booking.checkOutDate)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(booking.totalAmount)}</div>
                            <div className="mt-1">{getPaymentStatusBadge(booking.paymentStatus)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewBooking(booking.id)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full"
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleConfirmBooking(booking.id)}
                                  disabled={actionLoading === booking.id}
                                  className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-full disabled:opacity-50"
                                  title="Xác nhận"
                                >
                                  {actionLoading === booking.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  disabled={actionLoading === booking.id}
                                  className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full disabled:opacity-50"
                                  title="Hủy"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => handleCompleteBooking(booking.id)}
                                disabled={actionLoading === booking.id}
                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full disabled:opacity-50"
                                title="Hoàn thành"
                              >
                                {actionLoading === booking.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : (
                                  <Clock className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 border rounded-lg ${
                      currentPage === i
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HostBookings;
