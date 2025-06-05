import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, MapPin, Phone, Mail, Globe, Star, Clock, DollarSign, Image as ImageIcon, Save, ArrowLeft } from 'lucide-react';
import { hotelAPI, HotelCreateRequest } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const HostHotelAdd: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<HotelCreateRequest>({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    starRating: 1,
    checkInTime: '',
    checkOutTime: '',
    imageUrl: '',
    pricePerNight: 0,
    amenities: '',
    cancellationPolicy: '',
    petPolicy: ''
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Tên khách sạn là bắt buộc';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Tên khách sạn phải có ít nhất 2 ký tự';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Phone validation
    if (formData.phone && !/^[+]?[0-9\s\-\(\)]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    // Website validation
    if (formData.website && !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\/.*)?$/.test(formData.website)) {
      newErrors.website = 'Website không hợp lệ';
    }

    // Price validation
    if (formData.pricePerNight && formData.pricePerNight <= 0) {
      newErrors.pricePerNight = 'Giá phòng phải lớn hơn 0';
    }

    // Time validation
    if (formData.checkInTime && formData.checkOutTime) {
      if (formData.checkInTime >= formData.checkOutTime) {
        newErrors.checkOutTime = 'Giờ trả phòng phải sau giờ nhận phòng';
      }
    }

    // Image URL validation
    if (formData.imageUrl && !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(formData.imageUrl)) {
      newErrors.imageUrl = 'URL hình ảnh không hợp lệ (chỉ chấp nhận jpg, jpeg, png, gif, webp)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('error', 'Lỗi', 'Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    try {
      setLoading(true);
      const response = await hotelAPI.createMyHotel(formData);
      
      if (response.data.success) {
        showToast('success', 'Thành công', 'Đã thêm khách sạn mới');
        navigate('/host/hotels');
      } else {
        throw new Error(response.data.message || 'Không thể thêm khách sạn');
      }
    } catch (error: any) {
      console.error('Error creating hotel:', error);
      showToast('error', 'Lỗi', error.response?.data?.message || error.message || 'Không thể thêm khách sạn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/host/hotels')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">Thêm khách sạn mới</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Hotel className="mr-2" />
                Thông tin cơ bản
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên khách sạn *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thành phố
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quốc gia
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Phone className="mr-2" />
                Thông tin liên hệ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.website ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
                </div>
              </div>
            </div>

            {/* Hotel Details */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Star className="mr-2" />
                Chi tiết khách sạn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạng sao
                  </label>
                  <select
                    name="starRating"
                    value={formData.starRating}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>{rating} sao</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá mỗi đêm (VND)
                  </label>
                  <input
                    type="number"
                    name="pricePerNight"
                    min="0"
                    step="1000"
                    value={formData.pricePerNight}
                    onChange={handleInputChange}
                    placeholder="VD: 500000"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.pricePerNight ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.pricePerNight && <p className="mt-1 text-sm text-red-600">{errors.pricePerNight}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ nhận phòng
                  </label>
                  <input
                    type="time"
                    name="checkInTime"
                    value={formData.checkInTime}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.checkInTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.checkInTime && <p className="mt-1 text-sm text-red-600">{errors.checkInTime}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ trả phòng
                  </label>
                  <input
                    type="time"
                    name="checkOutTime"
                    value={formData.checkOutTime}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.checkOutTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.checkOutTime && <p className="mt-1 text-sm text-red-600">{errors.checkOutTime}</p>}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiện nghi
                </label>
                <textarea
                  name="amenities"
                  rows={3}
                  value={formData.amenities}
                  onChange={handleInputChange}
                  placeholder="VD: WiFi miễn phí, Bể bơi, Gym, Spa, Nhà hàng, Bar..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Policies */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Chính sách</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chính sách hủy phòng
                  </label>
                  <textarea
                    name="cancellationPolicy"
                    rows={3}
                    value={formData.cancellationPolicy}
                    onChange={handleInputChange}
                    placeholder="VD: Miễn phí hủy phòng trước 24 giờ..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chính sách thú cưng
                  </label>
                  <textarea
                    name="petPolicy"
                    rows={3}
                    value={formData.petPolicy}
                    onChange={handleInputChange}
                    placeholder="VD: Cho phép thú cưng với phí phụ thu..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <ImageIcon className="mr-2" />
                Hình ảnh
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL hình ảnh
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/hotel-image.jpg"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.imageUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>}
                {formData.imageUrl && !errors.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-32 h-20 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/host/hotels')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Save size={20} className="mr-2" />
                    Thêm khách sạn
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HostHotelAdd; 