import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash, Eye, Filter, Check, X, RefreshCw, ToggleLeft, ToggleRight, BedDouble, Users, DollarSign, Hotel as HotelIcon } from 'lucide-react';
import { roomTypeAPI, hotelAPI, RoomTypeResponse, HotelResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface ApiResponse {
  code: number;
  success: boolean;
  message: string;
  result: {
    content: RoomTypeResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

const AdminRoomTypes: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hotelFilter, setHotelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>();
  const [minOccupancy, setMinOccupancy] = useState<number | undefined>();
  const [maxOccupancy, setMaxOccupancy] = useState<number | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 10;

  // Fetch room types from API
  const fetchRoomTypes = async (page = 0, size = itemsPerPage, sortBy = 'createdAt') => {
    try {
      setLoading(true);
      
      // Build filter params
      const filterParams: any = {
        pageNumber: page,
        pageSize: size,
        sortBy
      };

      if (hotelFilter) filterParams.hotelId = hotelFilter;
      if (statusFilter !== undefined) filterParams.isActive = statusFilter;
      if (minOccupancy !== undefined) filterParams.minOccupancy = minOccupancy;
      if (maxOccupancy !== undefined) filterParams.maxOccupancy = maxOccupancy;
      if (minPrice !== undefined) filterParams.minPrice = minPrice;
      if (maxPrice !== undefined) filterParams.maxPrice = maxPrice;

      let response;
      if (searchTerm) {
        response = await roomTypeAPI.searchRoomTypes(searchTerm, page, size, sortBy);
      } else if (Object.keys(filterParams).length > 3) { // More than just pagination params
        response = await roomTypeAPI.getAllRoomTypesWithFilters(filterParams);
      } else {
        response = await roomTypeAPI.getAllRoomTypes(page, size, sortBy);
      }

      const data = response.data as ApiResponse;
      
      if (data.success) {
        setRoomTypes(data.result.content);
        setTotalPages(data.result.totalPages);
        setTotalElements(data.result.totalElements);
        setCurrentPage(data.result.number);
      } else {
        showToast('error', 'Lỗi', data.message || 'Không thể tải danh sách loại phòng');
      }
    } catch (error: any) {
      console.error('Error fetching room types:', error);
      showToast('error', 'Lỗi', 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch hotels for filter dropdown
  const fetchHotels = async () => {
    try {
      const response = await hotelAPI.getAllHotels(0, 100, 'name');
      const data = response.data as any;
      if (data.success) {
        setHotels(data.result.content);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
    fetchHotels();
  }, [searchTerm, hotelFilter, statusFilter, minOccupancy, maxOccupancy, minPrice, maxPrice]);

  const handleRefresh = () => {
    fetchRoomTypes(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchRoomTypes(page);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedRoomTypes([]);
    } else {
      setSelectedRoomTypes(roomTypes.map(roomType => roomType.id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleSelectRoomType = (roomTypeId: string) => {
    if (selectedRoomTypes.includes(roomTypeId)) {
      setSelectedRoomTypes(selectedRoomTypes.filter(id => id !== roomTypeId));
    } else {
      setSelectedRoomTypes([...selectedRoomTypes, roomTypeId]);
    }
  };

  const handleAddRoomType = () => {
    navigate('/admin/room-types/add');
  };

  const handleEditRoomType = (roomTypeId: string) => {
    navigate(`/admin/room-types/edit/${roomTypeId}`);
  };

  const handleViewRoomType = (roomTypeId: string) => {
    navigate(`/admin/room-types/${roomTypeId}`);
  };

  const handleDeleteRoomType = async (roomTypeId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa loại phòng này?')) {
      try {
        setActionLoading(roomTypeId);
        await roomTypeAPI.deleteRoomType(roomTypeId);
        showToast('success', 'Thành công', 'Đã xóa loại phòng');
        fetchRoomTypes(currentPage);
      } catch (error: any) {
        console.error('Error deleting room type:', error);
        showToast('error', 'Lỗi', 'Không thể xóa loại phòng');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRoomTypes.length === 0) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedRoomTypes.length} loại phòng đã chọn?`)) {
      try {
        setActionLoading('bulk-delete');
        await Promise.all(selectedRoomTypes.map(id => roomTypeAPI.deleteRoomType(id)));
        showToast('success', 'Thành công', `Đã xóa ${selectedRoomTypes.length} loại phòng`);
        setSelectedRoomTypes([]);
        setIsSelectAll(false);
        fetchRoomTypes(currentPage);
      } catch (error: any) {
        console.error('Error deleting room types:', error);
        showToast('error', 'Lỗi', 'Không thể xóa một số loại phòng');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleToggleStatus = async (roomTypeId: string) => {
    try {
      setActionLoading(roomTypeId);
      await roomTypeAPI.toggleRoomTypeStatus(roomTypeId);
      showToast('success', 'Thành công', 'Đã cập nhật trạng thái loại phòng');
      fetchRoomTypes(currentPage);
    } catch (error: any) {
      console.error('Error toggling room type status:', error);
      showToast('error', 'Lỗi', 'Không thể cập nhật trạng thái loại phòng');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? (
          <>
            <Check size={12} className="mr-1" />
            Hoạt động
          </>
        ) : (
          <>
            <X size={12} className="mr-1" />
            Tạm dừng
          </>
        )}
      </span>
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setHotelFilter('');
    setStatusFilter(undefined);
    setMinOccupancy(undefined);
    setMaxOccupancy(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setCurrentPage(0);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            i === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i + 1}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <button
            onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{currentPage * itemsPerPage + 1}</span> đến{' '}
              <span className="font-medium">
                {Math.min((currentPage + 1) * itemsPerPage, totalElements)}
              </span>{' '}
              trong tổng số <span className="font-medium">{totalElements}</span> kết quả
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {pages}
              <button
                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Quản lý loại phòng</h1>
          <p className="text-gray-600 mt-1">Quản lý các loại phòng trong hệ thống</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button
            onClick={handleAddRoomType}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Plus size={20} className="mr-2" />
            Thêm loại phòng
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm loại phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter size={20} className="mr-2" />
              Bộ lọc
            </button>
            {(hotelFilter || statusFilter !== undefined || minOccupancy || maxOccupancy || minPrice || maxPrice) && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Hotel Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khách sạn</label>
                <select
                  value={hotelFilter}
                  onChange={(e) => setHotelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả khách sạn</option>
                  {hotels.map(hotel => (
                    <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={statusFilter === undefined ? '' : statusFilter.toString()}
                  onChange={(e) => setStatusFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tất cả</option>
                  <option value="true">Hoạt động</option>
                  <option value="false">Tạm dừng</option>
                </select>
              </div>

              {/* Occupancy Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa tối thiểu</label>
                <input
                  type="number"
                  placeholder="Từ"
                  value={minOccupancy || ''}
                  onChange={(e) => setMinOccupancy(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa tối đa</label>
                <input
                  type="number"
                  placeholder="Đến"
                  value={maxOccupancy || ''}
                  onChange={(e) => setMaxOccupancy(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="10"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá từ (VND)</label>
                <input
                  type="number"
                  placeholder="Giá tối thiểu"
                  value={minPrice || ''}
                  onChange={(e) => setMinPrice(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedRoomTypes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              Đã chọn {selectedRoomTypes.length} loại phòng
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleDeleteSelected}
                disabled={actionLoading === 'bulk-delete'}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Trash size={16} className="mr-2" />
                {actionLoading === 'bulk-delete' ? 'Đang xóa...' : 'Xóa đã chọn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Types Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isSelectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại phòng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách sạn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sức chứa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá/đêm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phòng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="animate-spin mr-2" size={20} />
                      Đang tải...
                    </div>
                  </td>
                </tr>
              ) : roomTypes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy loại phòng nào
                  </td>
                </tr>
              ) : (
                roomTypes.map((roomType) => (
                  <tr key={roomType.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRoomTypes.includes(roomType.id)}
                        onChange={() => handleSelectRoomType(roomType.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {roomType.imageUrl ? (
                          <img
                            src={roomType.imageUrl}
                            alt={roomType.name}
                            className="h-12 w-12 rounded-lg object-cover mr-4"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                            <BedDouble size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{roomType.name}</div>
                          {roomType.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {roomType.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <HotelIcon size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{roomType.hotelName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Users size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{roomType.maxOccupancy} người</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <DollarSign size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(roomType.pricePerNight)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>Tổng: {roomType.totalRooms}</div>
                        <div className="text-green-600">Trống: {roomType.availableRooms}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(roomType.isActive)}
                        <button
                          onClick={() => handleToggleStatus(roomType.id)}
                          disabled={actionLoading === roomType.id}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {roomType.isActive ? (
                            <ToggleRight size={20} className="text-green-500" />
                          ) : (
                            <ToggleLeft size={20} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(roomType.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewRoomType(roomType.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditRoomType(roomType.id)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRoomType(roomType.id)}
                          disabled={actionLoading === roomType.id}
                          className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                          title="Xóa"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && renderPagination()}
      </div>
    </div>
  );
};

export default AdminRoomTypes; 