import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash, Eye, MapPin, Star, Filter, Check, X, Calendar, BedDouble, Users, Hotel as HotelIcon } from 'lucide-react';
import { Hotel } from '../../types/hotel';

const AdminHotels: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);

  // Sample hotels data with multiple room types
  const hotels: Hotel[] = [
    {
      id: '1',
      name: 'Vinpearl Resort & Spa',
      description: 'Khu nghỉ dưỡng sang trọng với view biển tuyệt đẹp',
      location: 'Nha Trang',
      address: '78 Trần Phú, Lộc Thọ, Nha Trang, Khánh Hòa',
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
          description: 'Phòng sang trọng với view biển',
          basePrice: 2500000,
          capacity: 2,
          bedType: 'King size',
          size: '45m²',
          amenities: ['Wifi', 'Minibar', 'TV'],
          images: ['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'],
          totalRooms: 10,
          availableRooms: 7,
          status: 'active'
        },
        {
          id: 'rt2',
          name: 'Premium Suite',
          description: 'Phòng suite rộng rãi',
          basePrice: 4200000,
          capacity: 4,
          bedType: 'King size + Sofa bed',
          size: '75m²',
          amenities: ['Wifi', 'Minibar', 'TV', 'Phòng khách'],
          images: ['https://images.pexels.com/photos/237371/pexels-photo-237371.jpeg'],
          totalRooms: 5,
          availableRooms: 3,
          status: 'active'
        }
      ],
      seasonalPricing: [],
      amenities: ['Wifi', 'Hồ bơi', 'Spa', 'Nhà hàng'],
      policies: {
        checkIn: '14:00',
        checkOut: '12:00',
        cancellationPolicy: 'Miễn phí hủy trước 24 giờ'
      },
      images: ['https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg'],
      status: 'active',
      createdAt: '2023-01-15',
      updatedAt: '2023-10-20'
    },
    {
      id: '2',
      name: 'Metropole Hanoi',
      description: 'Khách sạn sang trọng tại trung tâm Hà Nội',
      location: 'Hà Nội',
      address: '15 Ngô Quyền, Hoàn Kiếm, Hà Nội',
      type: 'Hotel',
      owner: {
        id: '4',
        name: 'Phạm Thị Dung',
        email: 'phamthidung@example.com',
        phone: '0987654321'
      },
      rating: 4.9,
      reviewCount: 215,
      roomTypes: [
        {
          id: 'rt3',
          name: 'Superior Room',
          description: 'Phòng cao cấp với thiết kế hiện đại',
          basePrice: 3200000,
          capacity: 2,
          bedType: 'Queen size',
          size: '40m²',
          amenities: ['Wifi', 'Minibar', 'TV', 'Điều hòa'],
          images: ['https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg'],
          totalRooms: 15,
          availableRooms: 12,
          status: 'active'
        },
        {
          id: 'rt4',
          name: 'Executive Suite',
          description: 'Phòng suite dành cho doanh nhân',
          basePrice: 5500000,
          capacity: 3,
          bedType: 'King size + Single',
          size: '80m²',
          amenities: ['Wifi', 'Minibar', 'TV', 'Phòng làm việc'],
          images: ['https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'],
          totalRooms: 7,
          availableRooms: 5,
          status: 'active'
        }
      ],
      seasonalPricing: [],
      amenities: ['Wifi', 'Nhà hàng', 'Phòng gym', 'Spa'],
      policies: {
        checkIn: '15:00',
        checkOut: '11:00',
        cancellationPolicy: 'Miễn phí hủy trước 48 giờ'
      },
      images: ['https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg'],
      status: 'active',
      createdAt: '2023-02-20',
      updatedAt: '2023-10-18'
    },
    {
      id: '3',
      name: 'Mường Thanh Luxury',
      description: 'Khách sạn cao cấp tại Đà Nẵng',
      location: 'Đà Nẵng',
      address: '270 Võ Nguyên Giáp, Mỹ An, Ngũ Hành Sơn, Đà Nẵng',
      type: 'Hotel',
      owner: {
        id: '7',
        name: 'Đỗ Văn Giang',
        email: 'dovangiang@example.com',
        phone: '0901234567'
      },
      rating: 4.5,
      reviewCount: 98,
      roomTypes: [
        {
          id: 'rt5',
          name: 'Standard Room',
          description: 'Phòng tiêu chuẩn thoải mái',
          basePrice: 1800000,
          capacity: 2,
          bedType: 'Queen size',
          size: '35m²',
          amenities: ['Wifi', 'TV', 'Điều hòa'],
          images: ['https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg'],
          totalRooms: 10,
          availableRooms: 8,
          status: 'active'
        }
      ],
      seasonalPricing: [],
      amenities: ['Wifi', 'Hồ bơi', 'Nhà hàng'],
      policies: {
        checkIn: '14:00',
        checkOut: '12:00',
        cancellationPolicy: 'Miễn phí hủy trước 24 giờ'
      },
      images: ['https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg'],
      status: 'pending',
      createdAt: '2023-03-10',
      updatedAt: '2023-10-15'
    }
  ];

  const itemsPerPage = 5;

  // Filter hotels based on search term, type, and status
  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.owner.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || hotel.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || hotel.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHotels = filteredHotels.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedHotels([]);
    } else {
      setSelectedHotels(currentHotels.map(hotel => hotel.id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleSelectHotel = (hotelId: string) => {
    if (selectedHotels.includes(hotelId)) {
      setSelectedHotels(selectedHotels.filter(id => id !== hotelId));
    } else {
      setSelectedHotels([...selectedHotels, hotelId]);
    }
  };

  const handleAddHotel = () => {
    navigate('/admin/hotels/add');
  };

  const handleEditHotel = (hotelId: string) => {
    navigate(`/admin/hotels/edit/${hotelId}`);
  };

  const handleViewHotel = (hotelId: string) => {
    navigate(`/admin/hotels/${hotelId}`);
  };

  const handleDeleteHotel = (hotelId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách sạn này?')) {
      // Handle delete logic here
      console.log('Delete hotel:', hotelId);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedHotels.length === 0) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedHotels.length} khách sạn đã chọn?`)) {
      // Handle bulk delete logic here
      console.log('Delete hotels:', selectedHotels);
      setSelectedHotels([]);
      setIsSelectAll(false);
    }
  };

  const handleApproveHotel = (hotelId: string) => {
    console.log('Approve hotel:', hotelId);
  };

  const handleRejectHotel = (hotelId: string) => {
    console.log('Reject hotel:', hotelId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Hoạt động</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Không hoạt động</span>;
      case 'suspended':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Tạm ngưng</span>;
      default:
        return null;
    }
  };

  const getPriceRange = (hotel: Hotel) => {
    if (hotel.roomTypes.length === 0) return 'N/A';
    
    const prices = hotel.roomTypes.map(rt => rt.basePrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return formatCurrency(minPrice);
    }
    
    return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
  };

  const getTotalRooms = (hotel: Hotel) => {
    return hotel.roomTypes.reduce((total, rt) => total + rt.totalRooms, 0);
  };

  const getAvailableRooms = (hotel: Hotel) => {
    return hotel.roomTypes.reduce((total, rt) => total + rt.availableRooms, 0);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Quản lý khách sạn</h1>
          <p className="text-gray-600">Quản lý thông tin khách sạn và loại phòng</p>
        </div>
        <button
          onClick={handleAddHotel}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center w-full sm:w-auto justify-center"
        >
          <Plus size={20} className="mr-2" />
          Thêm khách sạn
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tên khách sạn, địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại hình</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="Hotel">Khách sạn</option>
              <option value="Resort">Resort</option>
              <option value="Homestay">Homestay</option>
              <option value="Villa">Villa</option>
              <option value="Apartment">Căn hộ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="pending">Chờ duyệt</option>
              <option value="inactive">Không hoạt động</option>
              <option value="suspended">Tạm ngưng</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
            >
              <Filter size={20} className="mr-2" />
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedHotels.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              Đã chọn {selectedHotels.length} khách sạn
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash size={16} className="mr-1" />
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotels Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={isSelectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách sạn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chủ sở hữu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá phòng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentHotels.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedHotels.includes(hotel.id)}
                      onChange={() => handleSelectHotel(hotel.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={hotel.images[0]}
                          alt={hotel.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {hotel.location}
                        </div>
                        <div className="text-xs text-gray-400">{hotel.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{hotel.owner.name}</div>
                    <div className="text-sm text-gray-500">{hotel.owner.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <BedDouble size={16} className="mr-1" />
                      {hotel.roomTypes.length} loại phòng
                    </div>
                    <div className="text-sm text-gray-500">
                      Tổng: {getTotalRooms(hotel)} | Trống: {getAvailableRooms(hotel)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getPriceRange(hotel)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {hotel.roomTypes.length} mức giá
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star size={16} className="text-yellow-400 fill-current mr-1" />
                      <span className="text-sm font-medium text-gray-900">{hotel.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({hotel.reviewCount})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(hotel.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewHotel(hotel.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditHotel(hotel.id)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      {hotel.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveHotel(hotel.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Phê duyệt"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleRejectHotel(hotel.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Từ chối"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteHotel(hotel.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Xóa"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredHotels.length)}</span> trong{' '}
                  <span className="font-medium">{filteredHotels.length}</span> kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredHotels.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 mb-4">
            <HotelIcon size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy khách sạn</h3>
          <p className="text-gray-600 mb-4">Thử thay đổi bộ lọc hoặc thêm khách sạn mới</p>
          <button
            onClick={handleAddHotel}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm khách sạn đầu tiên
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminHotels;

