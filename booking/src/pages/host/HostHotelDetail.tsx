import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Hotel, MapPin, Phone, Mail, Globe, Star, Clock, DollarSign, Users, Edit, ArrowLeft, Plus } from 'lucide-react';
import { hotelAPI, HotelResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/format';

const HostHotelDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotel();
  }, [id]);

  const fetchHotel = async () => {
    try {
      setLoading(true);
      const response = await hotelAPI.getMyHotelById(id!);
      setHotel(response.data.result);
    } catch (error: any) {
      console.error('Error fetching hotel:', error);
      showToast('error', 'Lỗi', 'Không thể tải thông tin khách sạn');
      navigate('/host/hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleEditHotel = () => {
    navigate(`/host/hotels/edit/${id}`);
  };

  const handleAddRoomType = () => {
    navigate(`/host/room-types/add?hotelId=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin khách sạn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Không tìm thấy thông tin khách sạn</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/host/hotels')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">{hotel.name}</h1>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleAddRoomType}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Thêm loại phòng
          </button>
          <button
            onClick={handleEditHotel}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Edit size={20} className="mr-2" />
            Chỉnh sửa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Hotel className="mr-2" />
              Thông tin cơ bản
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="font-medium">Địa chỉ</p>
                  <p className="text-gray-600">{hotel.address}</p>
                  {(hotel.city || hotel.country) && (
                    <p className="text-gray-600">{[hotel.city, hotel.country].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              </div>
              {hotel.description && (
                <div>
                  <p className="font-medium">Mô tả</p>
                  <p className="text-gray-600 mt-1">{hotel.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Phone className="mr-2" />
              Thông tin liên hệ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotel.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">Số điện thoại</p>
                    <p className="text-gray-600">{hotel.phone}</p>
                  </div>
                </div>
              )}
              {hotel.email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{hotel.email}</p>
                  </div>
                </div>
              )}
              {hotel.website && (
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">Website</p>
                    <p className="text-gray-600">{hotel.website}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Policies */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Chính sách</h2>
            <div className="space-y-4">
              {hotel.cancellationPolicy && (
                <div>
                  <p className="font-medium">Chính sách hủy phòng</p>
                  <p className="text-gray-600 mt-1">{hotel.cancellationPolicy}</p>
                </div>
              )}
              {hotel.petPolicy && (
                <div>
                  <p className="font-medium">Chính sách thú cưng</p>
                  <p className="text-gray-600 mt-1">{hotel.petPolicy}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Thống kê nhanh</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  <span>Hạng sao</span>
                </div>
                <span className="font-medium">{hotel.starRating} sao</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-500 mr-2" />
                  <span>Loại phòng</span>
                </div>
                <span className="font-medium">{hotel.totalRoomTypes || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-green-500 mr-2" />
                  <span>Giá từ</span>
                </div>
                <span className="font-medium">{formatCurrency(hotel.pricePerNight || 0)}/đêm</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-purple-500 mr-2" />
                  <span>Nhận phòng</span>
                </div>
                <span className="font-medium">{hotel.checkInTime || '--:--'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-purple-500 mr-2" />
                  <span>Trả phòng</span>
                </div>
                <span className="font-medium">{hotel.checkOutTime || '--:--'}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Trạng thái</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Hoạt động</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  hotel.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {hotel.active ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Nổi bật</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  hotel.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {hotel.featured ? 'Có' : 'Không'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default HostHotelDetail; 