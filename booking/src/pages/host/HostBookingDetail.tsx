import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, DollarSign, Clock, ArrowLeft, Phone, Mail, Download, Check, X, AlertCircle, Star } from 'lucide-react';
import { bookingAPI, BookingResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const HostBookingDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBookingDetail(id);
    }
  }, [id]);

  const fetchBookingDetail = async (bookingId: string) => {
    try {
      setLoading(true);
      const response = await bookingAPI.getHostBookingById(bookingId);
      
      if (response.data.success) {
        setBooking(response.data.result);
      } else {
        throw new Error(response.data.message || 'Không thể tải thông tin đặt phòng');
      }
    } catch (error: any) {
      console.error('Error fetching booking detail:', error);
      showToast('error', 'Lỗi', error.message || 'Không thể tải thông tin đặt phòng');
      navigate('/host/bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'refunded':
        return 'Đã hoàn tiền';
      default:
        return status;
    }
  };

  const handleConfirmBooking = async () => {
    if (!booking || !id) return;
    
    try {
      setActionLoading('confirm');
      const response = await bookingAPI.confirmBooking(id);
      
      if (response.data.success) {
        showToast('success', 'Thành công', 'Đặt phòng đã được xác nhận');
        await fetchBookingDetail(id);
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

  const handleCancelBooking = async () => {
    if (!booking || !id) return;
    
    if (window.confirm('Bạn có chắc chắn muốn hủy đặt phòng này không?')) {
      try {
        setActionLoading('cancel');
        const response = await bookingAPI.cancelBooking(id, 'Hủy bởi chủ khách sạn');
        
        if (response.data.success) {
          showToast('success', 'Thành công', 'Đặt phòng đã được hủy');
          await fetchBookingDetail(id);
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

  const handleCompleteBooking = async () => {
    if (!booking || !id) return;
    
    try {
      setActionLoading('complete');
      const response = await bookingAPI.completeBooking(id);
      
      if (response.data.success) {
        showToast('success', 'Thành công', 'Đặt phòng đã được đánh dấu hoàn thành');
        await fetchBookingDetail(id);
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

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đặt phòng</h3>
            <p className="text-gray-600 mb-6">Đặt phòng này có thể đã bị xóa hoặc không tồn tại</p>
            <button
              onClick={() => navigate('/host/bookings')}
              className="text-blue-600 hover:text-blue-800"
            >
              Quay lại danh sách đặt phòng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/host/bookings')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại danh sách đặt phòng
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Chi tiết đặt phòng</h1>
                <p className="text-gray-600">Mã đặt phòng: {booking.bookingReference || booking.id}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Đặt ngày: {formatDate(booking.createdAt)}
                </p>
              </div>
              <div className="flex flex-col space-y-2 mt-4 md:mt-0">
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-center ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium text-center ${getPaymentStatusColor(booking.paymentStatus)}`}>
                  {getPaymentStatusText(booking.paymentStatus)}
                </span>
              </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Guest Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Thông tin khách hàng</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600">Tên khách hàng</p>
                    <p className="font-medium">{booking.guestName}</p>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>{booking.guestEmail}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-2" />
                    <span>{booking.guestPhone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{booking.guests} khách</span>
                  </div>
                </div>
              </div>

              {/* Hotel Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Thông tin khách sạn</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-600">Tên khách sạn</p>
                    <p className="font-medium">{booking.hotelName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Loại phòng</p>
                    <p className="font-medium">{booking.roomTypeName}</p>
                  </div>
                  {booking.roomName && (
                    <div>
                      <p className="text-gray-600">Tên phòng</p>
                      <p className="font-medium">{booking.roomName}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="border-t pt-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Chi tiết lưu trú</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="font-medium">Ngày nhận phòng</span>
                  </div>
                  <p className="text-lg">{formatDate(booking.checkInDate)}</p>
                </div>
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="font-medium">Ngày trả phòng</span>
                  </div>
                  <p className="text-lg">{formatDate(booking.checkOutDate)}</p>
                </div>
                <div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="font-medium">Số đêm</span>
                  </div>
                  <p className="text-lg">
                    {Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} đêm
                  </p>
                </div>
              </div>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="border-t pt-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Yêu cầu đặc biệt</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{booking.specialRequests}</p>
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="border-t pt-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Thông tin thanh toán</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {booking.paymentMethod && (
                  <div>
                    <p className="text-gray-600">Phương thức thanh toán</p>
                    <p className="font-medium">{booking.paymentMethod}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">Tổng số tiền</p>
                  <p className="font-bold text-2xl text-blue-600">{formatCurrency(booking.totalAmount)}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-6">
              <div className="flex flex-wrap gap-3">
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={actionLoading === 'confirm'}
                      className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'confirm' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Xác nhận đặt phòng
                    </button>
                    <button
                      onClick={handleCancelBooking}
                      disabled={actionLoading === 'cancel'}
                      className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'cancel' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Hủy đặt phòng
                    </button>
                  </>
                )}
                
                {booking.status === 'confirmed' && (
                  <button
                    onClick={handleCompleteBooking}
                    disabled={actionLoading === 'complete'}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'complete' ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    Hoàn thành đặt phòng
                  </button>
                )}

                <button 
                  className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  onClick={() => window.print()}
                >
                  <Download className="h-4 w-4 mr-2" />
                  In thông tin đặt phòng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostBookingDetail; 