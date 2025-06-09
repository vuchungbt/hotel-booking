import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, Users, CreditCard, MessageSquare, MapPin, Clock, Star,
  ChevronLeft, ChevronRight, Check, User, Mail, Phone, AlertCircle, LogIn, Banknote, Smartphone
} from 'lucide-react';
import { bookingAPI, BookingCreateRequest, HotelResponse, RoomTypeResponse } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface EnhancedBookingFormProps {
  hotel: HotelResponse;
  roomType: RoomTypeResponse;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  onSuccess?: (bookingId: string) => void;
}
 
interface StepData {
  step: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

const EnhancedBookingForm: React.FC<EnhancedBookingFormProps> = ({
  hotel,
  roomType,
  checkInDate,
  checkOutDate,
  guests,
  onSuccess
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const [formData, setFormData] = useState<BookingCreateRequest>({
    hotelId: hotel.id,
    roomTypeId: roomType.id,
    guestName: user?.name || '',
    guestEmail: user?.email || '',
    guestPhone: user?.tel || '',
    checkInDate,
    checkOutDate,
    guests,
    totalAmount: 0,
    paymentMethod: 'CASH_ON_CHECKIN',
    specialRequests: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Calculate number of nights and total amount
  const numberOfNights = Math.ceil(
    (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  useEffect(() => {
    const totalAmount = numberOfNights * roomType.pricePerNight;
    setFormData(prev => ({ ...prev, totalAmount }));
  }, [numberOfNights, roomType.pricePerNight]);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        guestName: user.name || '',
        guestEmail: user.email || '',
        guestPhone: user.tel || ''
      }));
    }
  }, [user]);

  // Steps configuration
  const steps: StepData[] = [
    {
      step: 1,
      title: 'Review Booking',
      description: 'Confirm your selection',
      isCompleted: currentStep > 1,
      isActive: currentStep === 1
    },
    {
      step: 2,
      title: 'Guest Information',
      description: 'Enter your details',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2
    },
    {
      step: 3,
      title: 'Payment Method',
      description: 'Choose payment option',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3
    },
    {
      step: 4,
      title: 'Confirmation',
      description: 'Review and confirm',
      isCompleted: false,
      isActive: currentStep === 4
    }
  ];

  // Check room availability
  useEffect(() => {
    const checkAvailability = async () => {
      setIsChecking(true);
      try {
        const response = await bookingAPI.checkRoomAvailability(
          roomType.id,
          checkInDate,
          checkOutDate
        );
        setIsAvailable(response.data.result);
      } catch (error) {
        console.error('Error checking availability:', error);
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, [roomType.id, checkInDate, checkOutDate]);

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 2) {
      // Check if user is logged in
      if (!user) {
        return false; // Cannot proceed without login
      }

      if (!formData.guestName.trim()) {
        newErrors.guestName = 'Guest name is required';
      } else if (formData.guestName.length < 2) {
        newErrors.guestName = 'Guest name must be at least 2 characters';
      }

      if (!formData.guestEmail.trim()) {
        newErrors.guestEmail = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
        newErrors.guestEmail = 'Invalid email format';
      }

      if (formData.guestPhone && !/^[+]?[0-9\s\-\(\)]{10,15}$/.test(formData.guestPhone)) {
        newErrors.guestPhone = 'Invalid phone number format';
      }
    }

    if (currentStep === 3 && !formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: keyof BookingCreateRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep() || !isAvailable) return;

    setLoading(true);
    try {
      const response = await bookingAPI.createBooking(formData);
      const bookingId = response.data.result.id;
      
      if (onSuccess) {
        onSuccess(bookingId);
      } else {
        navigate(`/bookings/confirmation/${bookingId}`);
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      console.log('Full error response:', error.response?.data);
      
      // Check for booking conflict by error code, HTTP status, or message
      const errorCode = error.response?.data?.code;
      const httpStatus = error.response?.status;
      const errorMessage = error.response?.data?.message || '';
      
      if (errorCode === 5016 || // BOOKING_CONFLICT_DETECTED code
          httpStatus === 409 || // HTTP CONFLICT status
          errorMessage.includes('Booking conflict detected') || 
          errorMessage.includes('overlapping bookings') ||
          errorMessage.includes('conflict detected with existing reservations')) {
        alert('Booking existed');
      } else {
        const fallbackMessage = errorMessage || 'Booking failed';
        alert(fallbackMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isChecking) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Checking availability...</span>
        </div>
      </div>
    );
  }

  if (isAvailable === false) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <div className="text-red-500 text-xl font-semibold mb-2">
            Room Not Available
          </div>
          <p className="text-gray-600 mb-6">
            Sorry, this room type is not available for the selected dates.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back & Choose Different Dates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    step.isCompleted
                      ? 'bg-green-500 text-white'
                      : step.isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.isCompleted ? <Check className="h-5 w-5" /> : step.step}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    step.isActive ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  step.isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {/* Step 1: Review Booking */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Review Your Booking</h2>
            
            {/* Hotel & Room Summary */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start space-x-6">
                <img
                  src={roomType.imageUrl || hotel.imageUrl || '/default-hotel.jpg'}
                  alt={roomType.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{hotel.name}</h3>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {hotel.address}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    {hotel.starRating} Star Hotel
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-800 font-semibold">{roomType.name}</div>
                    <div className="text-blue-600 text-sm">
                      Max occupancy: {roomType.maxOccupancy} guests • {roomType.bedType}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Booking Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">{formatDate(checkInDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">{formatDate(checkOutDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights:</span>
                    <span className="font-medium">{numberOfNights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{guests}</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                  Price Breakdown
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {formatCurrency(roomType.pricePerNight)} × {numberOfNights} nights
                    </span>
                    <span className="font-medium">{formatCurrency(formData.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes & fees:</span>
                    <span className="font-medium">Included</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(formData.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Guest Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Guest Information</h2>
            <p className="text-gray-600">
              {user 
                ? 'Your account information will be used for this booking.' 
                : 'Please log in to continue with your booking.'}
            </p>

            {!user ? (
              // Not logged in - show login prompt
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <LogIn className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Đăng nhập để tiếp tục đặt phòng
                </h3>
                <p className="text-gray-600 mb-4">
                  Bạn cần đăng nhập để hoàn tất việc đặt phòng và quản lý đặt phòng của mình.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                  >
                    <User className="h-5 w-5 mr-2" />
                    Tạo tài khoản mới
                  </Link>
                </div>
              </div>
            ) : (
              // Logged in - show user info
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">
                      Logged in as {user.name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => handleInputChange('guestName', e.target.value)}
                      disabled={true}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      placeholder="Enter your full name"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Information from your account
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.guestEmail}
                      onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                      disabled={true}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      placeholder="Enter your email address"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Booking confirmation will be sent to this email
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number {formData.guestPhone ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="tel"
                    value={formData.guestPhone}
                    onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                    disabled={!!user.tel}
                    className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                      user.tel 
                        ? 'border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed'
                        : `focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.guestPhone ? 'border-red-500' : 'border-gray-300'
                          }`
                    }`}
                    placeholder={user.tel ? "Phone from account" : "Enter your phone number"}
                  />
                  {errors.guestPhone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.guestPhone}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {user.tel 
                      ? 'Phone number from your account'
                      : 'For urgent booking updates and hotel contact'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="h-4 w-4 inline mr-1" />
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Any special requests? (e.g., early check-in, room preferences, dietary requirements)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Special requests cannot be guaranteed but we'll do our best to accommodate them
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 3: Payment Method */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
            <p className="text-gray-600">Choose how you'd like to pay for your booking.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  value: 'VNPAY', 
                  label: 'VNPay', 
                  desc: 'Thanh toán qua ví điện tử VNPay (Sắp ra mắt)',
                  icon: 'smartphone',
                  color: 'text-blue-600',
                  disabled: true
                },
                { 
                  value: 'CASH_ON_CHECKIN', 
                  label: 'Thanh toán khi đặt phòng', 
                  desc: 'Thanh toán bằng tiền mặt khi nhận phòng',
                  icon: 'banknote',
                  color: 'text-green-600',
                  disabled: false
                }
              ].map((method) => (
                <label
                  key={method.value}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    method.disabled 
                      ? 'cursor-not-allowed bg-gray-50 border-gray-200 opacity-60'
                      : `cursor-pointer ${
                          formData.paymentMethod === method.value
                            ? method.value === 'VNPAY' 
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={formData.paymentMethod === method.value}
                    onChange={(e) => !method.disabled && handleInputChange('paymentMethod', e.target.value)}
                    disabled={method.disabled}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    {method.icon === 'smartphone' ? (
                      <Smartphone className={`h-5 w-5 mr-3 ${
                        method.disabled 
                          ? 'text-gray-400' 
                          : formData.paymentMethod === method.value ? method.color : 'text-gray-400'
                      }`} />
                    ) : (
                      <Banknote className={`h-5 w-5 mr-3 ${
                        method.disabled 
                          ? 'text-gray-400' 
                          : formData.paymentMethod === method.value ? method.color : 'text-gray-400'
                      }`} />
                    )}
                    <div className="flex-1">
                      <div className={`font-medium ${method.disabled ? 'text-gray-400' : ''}`}>
                        {method.label}
                      </div>
                      <div className="text-sm text-gray-500">{method.desc}</div>
                    </div>
                    {formData.paymentMethod === method.value && !method.disabled && (
                      <Check className={`h-5 w-5 ml-3 ${method.color}`} />
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Check className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-blue-800">Phương thức thanh toán an toàn</h4>
                  <div className="text-blue-700 text-sm mt-1">
                    {formData.paymentMethod === 'VNPAY' ? (
                      <p>VNPay sử dụng công nghệ bảo mật tiên tiến để đảm bảo giao dịch an toàn. Thanh toán nhanh chóng và bảo mật.</p>
                    ) : (
                      <p>Bạn có thể thanh toán bằng tiền mặt khi nhận phòng tại khách sạn. Vui lòng chuẩn bị đúng số tiền.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Confirm Your Booking</h2>
            <p className="text-gray-600">Please review all details before confirming your booking.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Guest Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Name:</span> {formData.guestName}</div>
                    <div><span className="text-gray-600">Email:</span> {formData.guestEmail}</div>
                    {formData.guestPhone && (
                      <div><span className="text-gray-600">Phone:</span> {formData.guestPhone}</div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Payment Method</h4>
                  <div className="text-sm">
                    {formData.paymentMethod === 'VNPAY' ? 'VNPay' : 
                     formData.paymentMethod === 'CASH_ON_CHECKIN' ? 'Thanh toán khi đặt phòng' : 
                     'Thanh toán khi đặt phòng'}
                  </div>
                </div>

                {formData.specialRequests && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Special Requests</h4>
                    <div className="text-sm text-gray-600">{formData.specialRequests}</div>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-600">Hotel:</span> {hotel.name}</div>
                  <div><span className="text-gray-600">Room:</span> {roomType.name}</div>
                  <div><span className="text-gray-600">Check-in:</span> {formatDate(checkInDate)}</div>
                  <div><span className="text-gray-600">Check-out:</span> {formatDate(checkOutDate)}</div>
                  <div><span className="text-gray-600">Guests:</span> {guests}</div>
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount:</span>
                      <span className="text-blue-600">{formatCurrency(formData.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-800">Important Notice</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    By confirming this booking, you agree to the hotel's cancellation policy and terms of service. 
                    Please ensure all information is correct as changes may incur additional fees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          onClick={currentStep === 1 ? () => navigate(-1) : handleBack}
          className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </button>

        {currentStep < 4 ? (
          <button
            onClick={handleNext}
            disabled={currentStep === 2 && !user}
            className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
              currentStep === 2 && !user
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Continue
            <ChevronRight className="h-4 w-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirm Booking
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default EnhancedBookingForm; 