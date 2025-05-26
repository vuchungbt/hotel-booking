import React, { useState } from 'react';
import { 
  User, Mail, Key, Save, BookOpen, Calendar, Gift, CreditCard, 
  MapPin, Clock, CheckCircle, AlertCircle, Copy, Trash2, Plus,
  Phone, Camera, Edit, Star, Eye, EyeOff
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@example.com',
    phone: '0123456789',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Mock data
  const bookingHistory = [
    {
      id: 'BK001',
      hotelName: 'Khách sạn Mường Thanh Luxury',
      location: 'Hà Nội',
      checkIn: '2024-01-15',
      checkOut: '2024-01-18',
      status: 'completed',
      totalAmount: 2400000,
      rating: 5,
      image: '/api/placeholder/80/80'
    },
    {
      id: 'BK002',
      hotelName: 'Resort Vinpearl Nha Trang',
      location: 'Nha Trang',
      checkIn: '2023-12-20',
      checkOut: '2023-12-25',
      status: 'completed',
      totalAmount: 5600000,
      rating: 4,
      image: '/api/placeholder/80/80'
    },
    {
      id: 'BK003',
      hotelName: 'Hotel Nikko Saigon',
      location: 'TP.HCM',
      checkIn: '2023-11-10',
      checkOut: '2023-11-12',
      status: 'cancelled',
      totalAmount: 1800000,
      rating: null,
      image: '/api/placeholder/80/80'
    }
  ];

  const upcomingBookings = [
    {
      id: 'BK004',
      hotelName: 'Resort Vinpearl Phú Quốc',
      location: 'Phú Quốc',
      checkIn: '2024-03-10',
      checkOut: '2024-03-15',
      status: 'confirmed',
      totalAmount: 7200000,
      image: '/api/placeholder/80/80'
    },
    {
      id: 'BK005',
      hotelName: 'Khách sạn Rex Saigon',
      location: 'TP.HCM',
      checkIn: '2024-02-28',
      checkOut: '2024-03-02',
      status: 'pending',
      totalAmount: 2100000,
      image: '/api/placeholder/80/80'
    }
  ];

  const vouchers = [
    {
      id: 'VC001',
      code: 'SUMMER2024',
      title: 'Giảm 20% cho kỳ nghỉ hè',
      description: 'Áp dụng cho đặt phòng từ 2 đêm trở lên',
      discount: '20%',
      minAmount: 1000000,
      maxDiscount: 500000,
      expiryDate: '2024-08-31',
      status: 'active',
      used: false
    },
    {
      id: 'VC002',
      code: 'NEWUSER50',
      title: 'Giảm 50K cho người dùng mới',
      description: 'Chỉ áp dụng cho lần đặt đầu tiên',
      discount: '50,000 VND',
      minAmount: 500000,
      maxDiscount: 50000,
      expiryDate: '2024-12-31',
      status: 'used',
      used: true
    },
    {
      id: 'VC003',
      code: 'WEEKEND15',
      title: 'Giảm 15% cuối tuần',
      description: 'Áp dụng cho đặt phòng cuối tuần',
      discount: '15%',
      minAmount: 800000,
      maxDiscount: 300000,
      expiryDate: '2024-06-30',
      status: 'expired',
      used: false
    }
  ];

  const paymentMethods = [
    {
      id: 'PM001',
      type: 'card',
      cardNumber: '**** **** **** 1234',
      cardType: 'Visa',
      expiryDate: '12/26',
      isDefault: true,
      holderName: 'NGUYEN VAN AN'
    },
    {
      id: 'PM002',
      type: 'card',
      cardNumber: '**** **** **** 5678',
      cardType: 'Mastercard',
      expiryDate: '08/25',
      isDefault: false,
      holderName: 'NGUYEN VAN AN'
    },
    {
      id: 'PM003',
      type: 'ewallet',
      provider: 'MoMo',
      accountNumber: '0123456789',
      isDefault: false
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Thông tin đã được cập nhật thành công!');
    setIsEditing(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setMessage(`Đã sao chép mã: ${code}`);
    setTimeout(() => setMessage(''), 2000);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', text: 'Hoàn thành', icon: CheckCircle },
      confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Đã xác nhận', icon: CheckCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Chờ xác nhận', icon: Clock },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Đã hủy', icon: AlertCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} className="mr-1" />
        {config.text}
      </span>
    );
  };

  const getVoucherStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Có thể sử dụng' },
      used: { color: 'bg-gray-100 text-gray-800', text: 'Đã sử dụng' },
      expired: { color: 'bg-red-100 text-red-800', text: 'Đã hết hạn' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const tabs = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User },
    { id: 'upcoming', label: 'Đặt phòng sắp tới', icon: Calendar },
    { id: 'history', label: 'Lịch sử đặt phòng', icon: BookOpen },
    { id: 'vouchers', label: 'Mã giảm giá', icon: Gift },
    { id: 'payment', label: 'Phương thức thanh toán', icon: CreditCard }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {formData.name.charAt(0).toUpperCase()}
          </div>
          <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border hover:bg-gray-50">
            <Camera size={16} className="text-gray-600" />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{formData.name}</h2>
          <p className="text-gray-500">{formData.email}</p>
          <p className="text-sm text-gray-400">Thành viên từ tháng 1, 2023</p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày sinh
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={!isEditing}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới tính
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!isEditing}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={!isEditing}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        {isEditing && (
          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Đổi mật khẩu</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </button>
          )}
        </div>
      </form>
    </div>
  );

  const renderUpcomingTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Đặt phòng sắp tới</h2>
        <span className="text-sm text-gray-500">{upcomingBookings.length} đặt phòng</span>
      </div>

      {upcomingBookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đặt phòng nào</h3>
          <p className="mt-1 text-sm text-gray-500">Bạn chưa có đặt phòng nào sắp tới.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingBookings.map((booking) => (
            <div key={booking.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <img
                  src={booking.image}
                  alt={booking.hotelName}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{booking.hotelName}</h3>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin size={14} className="mr-1" />
                        {booking.location}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {booking.checkIn} - {booking.checkOut}
                      </p>
                      <p className="text-lg font-semibold text-blue-600 mt-2">
                        {formatCurrency(booking.totalAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(booking.status)}
                      <p className="text-xs text-gray-500 mt-2">Mã: {booking.id}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                      Xem chi tiết
                    </button>
                    <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                      Liên hệ khách sạn
                    </button>
                    {booking.status === 'pending' && (
                      <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                        Hủy đặt phòng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Lịch sử đặt phòng</h2>
        <span className="text-sm text-gray-500">{bookingHistory.length} đặt phòng</span>
      </div>

      <div className="space-y-4">
        {bookingHistory.map((booking) => (
          <div key={booking.id} className="bg-white border rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <img
                src={booking.image}
                alt={booking.hotelName}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{booking.hotelName}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin size={14} className="mr-1" />
                      {booking.location}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {booking.checkIn} - {booking.checkOut}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 mt-2">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(booking.status)}
                    <p className="text-xs text-gray-500 mt-2">Mã: {booking.id}</p>
                    {booking.rating && (
                      <div className="flex items-center mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < booking.rating! ? "text-yellow-400 fill-current" : "text-gray-300"}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">({booking.rating}/5)</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    Xem chi tiết
                  </button>
                  {booking.status === 'completed' && !booking.rating && (
                    <button className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                      Đánh giá
                    </button>
                  )}
                  {booking.status === 'completed' && (
                    <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200">
                      Đặt lại
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVouchersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Mã giảm giá của tôi</h2>
        <span className="text-sm text-gray-500">{vouchers.length} mã giảm giá</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vouchers.map((voucher) => (
          <div key={voucher.id} className={`border rounded-lg p-4 ${voucher.status === 'active' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{voucher.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{voucher.description}</p>
              </div>
              {getVoucherStatusBadge(voucher.status)}
            </div>
            
            <div className="bg-white rounded border-2 border-dashed border-gray-300 p-3 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">{voucher.code}</p>
                  <p className="text-sm text-gray-500">Giảm {voucher.discount}</p>
                </div>
                <button
                  onClick={() => copyVoucherCode(voucher.code)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  disabled={voucher.status !== 'active'}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>Đơn tối thiểu: {formatCurrency(voucher.minAmount)}</p>
              <p>Giảm tối đa: {formatCurrency(voucher.maxDiscount)}</p>
              <p>Hết hạn: {voucher.expiryDate}</p>
            </div>

            {voucher.status === 'active' && (
              <button className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                Sử dụng ngay
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Phương thức thanh toán</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Thêm mới
        </button>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                  {method.type === 'card' ? (
                    <CreditCard className="h-5 w-5 text-gray-600" />
                  ) : (
                    <div className="text-xs font-bold text-gray-600">MW</div>
                  )}
                </div>
                <div>
                  {method.type === 'card' ? (
                    <>
                      <p className="font-medium text-gray-900">
                        {method.cardType} {method.cardNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {method.holderName} • Hết hạn {method.expiryDate}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-gray-900">{method.provider}</p>
                      <p className="text-sm text-gray-500">{method.accountNumber}</p>
                    </>
                  )}
                  {method.isDefault && (
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mt-1">
                      Mặc định
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit size={16} />
                </button>
                <button className="p-2 text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
          <p className="text-gray-600 mt-2">Quản lý thông tin cá nhân và hoạt động của bạn</p>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'upcoming' && renderUpcomingTab()}
            {activeTab === 'history' && renderHistoryTab()}
            {activeTab === 'vouchers' && renderVouchersTab()}
            {activeTab === 'payment' && renderPaymentTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
