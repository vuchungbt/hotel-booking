import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash, Plus, Star, MapPin, Users, BedDouble, Calendar, DollarSign, Settings, Eye, Check, X } from 'lucide-react';
import { Hotel, RoomType, SeasonalPricing } from '../../types/hotel';

const AdminHotelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Sample hotel data with multiple room types
  const hotel: Hotel = {
    id: '1',
    name: 'Vinpearl Resort & Spa',
    description: 'Khu nghỉ dưỡng sang trọng với view biển tuyệt đẹp, đầy đủ tiện nghi cao cấp.',
    location: 'Nha Trang',
    address: '78 Trần Phú, Lộc Thọ, Nha Trang, Khánh Hòa',
    coordinates: { lat: 12.2388, lng: 109.1967 },
    type: 'Resort',
    owner: {
      id: '2',
      name: 'Trần Thị Bình',
      email: 'tranthibinh@example.com',
      phone: '0912345678'
    },
    rating: 4.8,
    reviewCount: 124,
    roomTypes: [
      {
        id: 'rt1',
        name: 'Deluxe Ocean View',
        description: 'Phòng sang trọng với view biển tuyệt đẹp',
        basePrice: 2500000,
        capacity: 2,
        bedType: 'King size',
        size: '45m²',
        amenities: ['Wifi', 'Minibar', 'TV', 'Điều hòa', 'Bồn tắm', 'Ban công'],
        images: [
          'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
          'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'
        ],
        totalRooms: 10,
        availableRooms: 7,
        status: 'active'
      },
      {
        id: 'rt2',
        name: 'Premium Suite',
        description: 'Phòng suite rộng rãi với thiết kế sang trọng',
        basePrice: 4200000,
        capacity: 4,
        bedType: 'King size + Sofa bed',
        size: '75m²',
        amenities: ['Wifi', 'Minibar', 'TV', 'Điều hòa', 'Phòng khách riêng', 'Bếp nhỏ'],
        images: [
          'https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg',
          'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg'
        ],
        totalRooms: 5,
        availableRooms: 3,
        status: 'active'
      },
      {
        id: 'rt3',
        name: 'Family Room',
        description: 'Phòng gia đình với 2 phòng ngủ riêng biệt',
        basePrice: 3500000,
        capacity: 6,
        bedType: '2 Queen size',
        size: '65m²',
        amenities: ['Wifi', 'Minibar', 'TV', 'Điều hòa', '2 phòng ngủ', 'Phòng khách'],
        images: [
          'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'
        ],
        totalRooms: 8,
        availableRooms: 5,
        status: 'active'
      },
      {
        id: 'rt4',
        name: 'Standard Room',
        description: 'Phòng tiêu chuẩn thoải mái',
        basePrice: 1800000,
        capacity: 2,
        bedType: 'Queen size',
        size: '35m²',
        amenities: ['Wifi', 'TV', 'Điều hòa', 'Minibar'],
        images: [
          'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'
        ],
        totalRooms: 15,
        availableRooms: 12,
        status: 'active'
      }
    ],
    seasonalPricing: [
      {
        id: 'sp1',
        roomTypeId: 'rt1',
        name: 'Mùa cao điểm (Hè)',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        priceMultiplier: 1.5,
        isActive: true
      },
      {
        id: 'sp2',
        roomTypeId: 'rt2',
        name: 'Mùa cao điểm (Hè)',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        priceMultiplier: 1.4,
        isActive: true
      },
      {
        id: 'sp3',
        roomTypeId: 'rt1',
        name: 'Tết Nguyên Đán',
        startDate: '2024-02-08',
        endDate: '2024-02-18',
        priceMultiplier: 2.0,
        isActive: true
      }
    ],
    amenities: ['Wifi', 'Hồ bơi', 'Spa', 'Nhà hàng', 'Phòng gym', 'Bãi đỗ xe'],
    policies: {
      checkIn: '14:00',
      checkOut: '12:00',
      cancellationPolicy: 'Miễn phí hủy trước 24 giờ',
      childPolicy: 'Trẻ em dưới 12 tuổi được miễn phí',
      petPolicy: 'Không cho phép thú cưng'
    },
    images: [
      'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
      'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg'
    ],
    status: 'active',
    createdAt: '2023-01-15',
    updatedAt: '2023-10-20'
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Hoạt động</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Không hoạt động</span>;
      case 'maintenance':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Bảo trì</span>;
      default:
        return null;
    }
  };

  const calculateSeasonalPrice = (roomType: RoomType, date: string = new Date().toISOString()) => {
    const currentDate = new Date(date);
    const applicablePricing = hotel.seasonalPricing.find(sp => 
      sp.roomTypeId === roomType.id && 
      sp.isActive &&
      new Date(sp.startDate) <= currentDate && 
      new Date(sp.endDate) >= currentDate
    );
    
    return applicablePricing 
      ? roomType.basePrice * applicablePricing.priceMultiplier
      : roomType.basePrice;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Hotel Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{hotel.name}</h2>
            <div className="flex items-center mt-2">
              <MapPin size={16} className="text-gray-500 mr-1" />
              <span className="text-gray-600">{hotel.address}</span>
            </div>
            <div className="flex items-center mt-2">
              <Star size={16} className="text-yellow-400 fill-current mr-1" />
              <span className="font-medium">{hotel.rating}</span>
              <span className="text-gray-500 ml-1">({hotel.reviewCount} đánh giá)</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/admin/hotels/edit/${hotel.id}`)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Edit size={16} className="mr-1" />
              Sửa
            </button>
            {getStatusBadge(hotel.status)}
          </div>
        </div>
        
        <p className="text-gray-700 mb-4">{hotel.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Thông tin chủ sở hữu</h4>
            <p className="text-gray-900">{hotel.owner.name}</p>
            <p className="text-gray-600">{hotel.owner.email}</p>
            <p className="text-gray-600">{hotel.owner.phone}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Chính sách</h4>
            <p className="text-gray-600">Nhận phòng: {hotel.policies.checkIn}</p>
            <p className="text-gray-600">Trả phòng: {hotel.policies.checkOut}</p>
            <p className="text-gray-600">{hotel.policies.cancellationPolicy}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Tiện nghi</h4>
            <div className="flex flex-wrap gap-1">
              {hotel.amenities.map((amenity, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Room Types Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Tổng quan loại phòng</h3>
          <button
            onClick={() => setActiveTab('rooms')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Xem chi tiết →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {hotel.roomTypes.map((roomType) => (
            <div key={roomType.id} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900">{roomType.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{roomType.capacity} khách</p>
              <p className="text-lg font-bold text-blue-600 mt-2">
                {formatCurrency(roomType.basePrice)}
              </p>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Tổng: {roomType.totalRooms}</span>
                <span>Trống: {roomType.availableRooms}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRooms = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý loại phòng</h2>
        <button
          onClick={() => navigate(`/admin/hotels/${hotel.id}/rooms/add`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Thêm loại phòng
        </button>
      </div>

      {hotel.roomTypes.map((roomType) => (
        <div key={roomType.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">{roomType.name}</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(roomType.status)}
                    <button
                      onClick={() => navigate(`/admin/hotels/${hotel.id}/rooms/edit/${roomType.id}`)}
                      className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center"
                    >
                      <Edit size={16} className="mr-1" />
                      Sửa
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mt-2">{roomType.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Thông tin cơ bản</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Sức chứa:</span> {roomType.capacity} khách</p>
                  <p><span className="text-gray-500">Giường:</span> {roomType.bedType}</p>
                  <p><span className="text-gray-500">Diện tích:</span> {roomType.size}</p>
                  <p><span className="text-gray-500">Tổng phòng:</span> {roomType.totalRooms}</p>
                  <p><span className="text-gray-500">Phòng trống:</span> {roomType.availableRooms}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Giá cả</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Giá gốc:</span> <span className="font-medium">{formatCurrency(roomType.basePrice)}</span></p>
                  <p><span className="text-gray-500">Giá hiện tại:</span> <span className="font-medium text-blue-600">{formatCurrency(calculateSeasonalPrice(roomType))}</span></p>
                  {calculateSeasonalPrice(roomType) !== roomType.basePrice && (
                    <p className="text-orange-600 text-xs">Đang áp dụng giá theo mùa</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Tiện nghi</h4>
                <div className="flex flex-wrap gap-1">
                  {roomType.amenities.slice(0, 4).map((amenity, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {amenity}
                    </span>
                  ))}
                  {roomType.amenities.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{roomType.amenities.length - 4} khác
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Hành động</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate(`/admin/hotels/${hotel.id}/rooms/${roomType.id}/availability`)}
                    className="w-full px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center text-sm"
                  >
                    <Calendar size={14} className="mr-1" />
                    Quản lý lịch
                  </button>
                  <button
                    onClick={() => navigate(`/admin/hotels/${hotel.id}/rooms/${roomType.id}/pricing`)}
                    className="w-full px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center text-sm"
                  >
                    <DollarSign size={14} className="mr-1" />
                    Quản lý giá
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý giá theo mùa</h2>
        <button
          onClick={() => navigate(`/admin/hotels/${hotel.id}/pricing/add`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Thêm giá theo mùa
        </button>
      </div>

      {hotel.seasonalPricing.map((pricing) => {
        const roomType = hotel.roomTypes.find(rt => rt.id === pricing.roomTypeId);
        if (!roomType) return null;

        return (
          <div key={pricing.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{pricing.name}</h3>
                <p className="text-gray-600">Áp dụng cho: {roomType.name}</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-gray-500">Thời gian:</span> {formatDate(pricing.startDate)} - {formatDate(pricing.endDate)}</p>
                  <p><span className="text-gray-500">Hệ số giá:</span> x{pricing.priceMultiplier}</p>
                  <p><span className="text-gray-500">Giá gốc:</span> {formatCurrency(roomType.basePrice)}</p>
                  <p><span className="text-gray-500">Giá áp dụng:</span> <span className="font-medium text-blue-600">{formatCurrency(roomType.basePrice * pricing.priceMultiplier)}</span></p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {pricing.isActive ? (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đang áp dụng</span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Không áp dụng</span>
                )}
                <button
                  onClick={() => navigate(`/admin/hotels/${hotel.id}/pricing/edit/${pricing.id}`)}
                  className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center"
                >
                  <Edit size={16} className="mr-1" />
                  Sửa
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: <Eye size={20} /> },
    { id: 'rooms', label: 'Loại phòng', icon: <BedDouble size={20} /> },
    { id: 'pricing', label: 'Giá theo mùa', icon: <DollarSign size={20} /> },
    { id: 'bookings', label: 'Đặt phòng', icon: <Calendar size={20} /> },
    { id: 'reviews', label: 'Đánh giá', icon: <Star size={20} /> },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/hotels')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Chi tiết khách sạn</h1>
            <p className="text-gray-600">Quản lý thông tin chi tiết khách sạn</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'rooms' && renderRooms()}
      {activeTab === 'pricing' && renderPricing()}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">Đặt phòng</h3>
          <p className="text-gray-600">Tính năng quản lý đặt phòng sẽ được phát triển</p>
        </div>
      )}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">Đánh giá</h3>
          <p className="text-gray-600">Tính năng quản lý đánh giá sẽ được phát triển</p>
        </div>
      )}
    </div>
  );
};

export default AdminHotelDetail; 