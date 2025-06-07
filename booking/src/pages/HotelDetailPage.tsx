import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Star, Phone, Mail, Globe, Clock, Users, 
  Wifi, Car, Utensils, Dumbbell, Waves, Coffee,
  ChevronLeft, Calendar, ArrowRight 
} from 'lucide-react';
import { hotelAPI, HotelResponse, roomTypeAPI, RoomTypeResponse, reviewAPI } from '../services/api';
import ReviewForm from '../components/ReviewForm';
import ReviewEditForm from '../components/ReviewEditForm';
import ReviewDisplay from '../components/ReviewDisplay';
import { useAuth } from '../contexts/AuthContext';

const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomTypeResponse[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'rooms' | 'reviews'>('overview');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userExistingReview, setUserExistingReview] = useState<any | null>(null);
  const [checkingUserReview, setCheckingUserReview] = useState(false);

  // Fetch hotel details
  const fetchHotelDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);

      const [hotelResponse, roomTypesResponse, reviewsResponse] = await Promise.all([
        hotelAPI.getHotelDetails(id),
        roomTypeAPI.getRoomTypesByHotel(id, 0, 20),
        reviewAPI.getReviewsByHotel(id, 0, 10).catch(() => ({ data: { result: { content: [] } } }))
      ]);

      if (hotelResponse.data.success) {
        setHotel(hotelResponse.data.result);
      } else {
        setError('Không tìm thấy thông tin khách sạn');
      }

      if (roomTypesResponse.data.success) {
        setRoomTypes(roomTypesResponse.data.result.content || []);
      }

      if (reviewsResponse.data.success) {
        setReviews(reviewsResponse.data.result.content || []);
      }

    } catch (err) {
      console.error('Error fetching hotel details:', err);
      setError('Có lỗi xảy ra khi tải thông tin khách sạn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  useEffect(() => {
    if (user && id) {
      checkUserExistingReview();
    } else {
      setUserExistingReview(null);
    }
  }, [user, id]);

  // Format price
  const formatPrice = (price: number | undefined) => {
    if (!price) return 'Liên hệ';
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Render stars
  const renderStars = (rating: number | undefined) => {
    if (!rating) return null;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const lowerAmenity = amenity.toLowerCase();
    if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet')) return <Wifi className="h-5 w-5" />;
    if (lowerAmenity.includes('parking') || lowerAmenity.includes('đỗ xe')) return <Car className="h-5 w-5" />;
    if (lowerAmenity.includes('restaurant') || lowerAmenity.includes('nhà hàng')) return <Utensils className="h-5 w-5" />;
    if (lowerAmenity.includes('gym') || lowerAmenity.includes('fitness')) return <Dumbbell className="h-5 w-5" />;
    if (lowerAmenity.includes('pool') || lowerAmenity.includes('hồ bơi')) return <Waves className="h-5 w-5" />;
    if (lowerAmenity.includes('bar') || lowerAmenity.includes('coffee')) return <Coffee className="h-5 w-5" />;
    return <Star className="h-5 w-5" />;
  };

  // Get image URL with fallback
  const getImageUrl = (imageUrl?: string) => {
    return imageUrl || 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg';
  };

  // Check if user has existing review for this hotel
  const checkUserExistingReview = async () => {
    if (!user || !id) return;
    
    try {
      setCheckingUserReview(true);
      // Get user's reviews and find one for this hotel
      const response = await reviewAPI.getMyReviews(0, 100); // Get all user reviews
      if (response.data.success) {
        const existingReview = response.data.result.content.find(
          (review: any) => review.hotelId === id
        );
        setUserExistingReview(existingReview || null);
      }
    } catch (error) {
      console.error('Error checking user existing review:', error);
      setUserExistingReview(null);
    } finally {
      setCheckingUserReview(false);
    }
  };

  // Handle review success
  const handleReviewSuccess = (reviewId: string) => {
    setShowReviewForm(false);
    setUserExistingReview(null); // Reset so we can fetch updated review
    // Refresh reviews and check user review again
    Promise.all([fetchHotelDetails(), checkUserExistingReview()]);
    alert('Đánh giá của bạn đã được gửi thành công!');
  };

  // Handle review update success
  const handleReviewUpdateSuccess = () => {
    setShowReviewForm(false);
    // Refresh reviews and user review
    Promise.all([fetchHotelDetails(), checkUserExistingReview()]);
    alert('Đánh giá của bạn đã được cập nhật!');
  };

  // Handle review delete success
  const handleReviewDeleteSuccess = () => {
    setShowReviewForm(false);
    setUserExistingReview(null); // Clear existing review
    // Refresh reviews
    fetchHotelDetails();
    alert('Đánh giá của bạn đã được xóa!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-300 rounded w-4/6"></div>
                </div>
              </div>
              <div>
                <div className="h-64 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-4">{error || 'Không tìm thấy khách sạn'}</div>
          <Link
            to="/hotels"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại danh sách khách sạn
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <Link to="/hotels" className="hover:text-blue-600">Khách sạn</Link>
            <ChevronLeft className="h-4 w-4 rotate-180" />
            <span className="text-gray-900 font-medium">{hotel.name}</span>
          </div>
              </div>
            </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
          <img
            src={getImageUrl(hotel.imageUrl)}
            alt={hotel.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg';
            }}
          />
          {hotel.featured && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Nổi bật
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hotel Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{hotel.address}</span>
                  </div>
                  {hotel.city && (
                    <div className="text-gray-600">
                      {hotel.city}{hotel.country && `, ${hotel.country}`}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {hotel.starRating && (
                    <div className="flex items-center mb-2">
                      {renderStars(hotel.starRating)}
                      <span className="ml-2 text-lg font-medium">{hotel.starRating} sao</span>
                    </div>
                  )}
                  {hotel.averageRating && (
                    <div className="text-sm text-gray-600">
                      {hotel.averageRating.toFixed(1)}/5 ({hotel.totalReviews || 0} đánh giá)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Tổng quan' },
                  { id: 'rooms', label: `Phòng (${roomTypes.length})` },
                  { id: 'reviews', label: `Đánh giá (${reviews.length})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {selectedTab === 'overview' && (
              <div className="space-y-8">
                {/* Description */}
                {hotel.description && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Mô tả</h3>
                    <p className="text-gray-700 leading-relaxed">{hotel.description}</p>
                  </div>
                )}

                {/* Amenities */}
                {hotel.amenities && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Tiện nghi</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {hotel.amenities.split(',').map((amenity, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          {getAmenityIcon(amenity.trim())}
                          <span className="ml-3 text-gray-700">{amenity.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Policies */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {hotel.cancellationPolicy && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Chính sách hủy phòng</h3>
                      <p className="text-gray-700">{hotel.cancellationPolicy}</p>
                    </div>
                  )}
                  {hotel.petPolicy && (
            <div>
                      <h3 className="text-lg font-semibold mb-3">Chính sách thú cưng</h3>
                      <p className="text-gray-700">{hotel.petPolicy}</p>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                      <div>
                  <h3 className="text-xl font-semibold mb-4">Thông tin liên hệ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotel.phone && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-600" />
                        <span className="ml-3 text-gray-700">{hotel.phone}</span>
                      </div>
                    )}
                    {hotel.email && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-600" />
                        <span className="ml-3 text-gray-700">{hotel.email}</span>
                      </div>
                    )}
                    {hotel.website && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Globe className="h-5 w-5 text-gray-600" />
                        <a 
                          href={hotel.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-3 text-blue-600 hover:underline"
                        >
                          {hotel.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'rooms' && (
              <div className="space-y-6">
                {roomTypes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có thông tin phòng
                  </div>
                ) : (
                  roomTypes.map((roomType) => (
                    <div key={roomType.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                          <img
                            src={getImageUrl(roomType.imageUrl)}
                            alt={roomType.name}
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg';
                            }}
                          />
                        </div>
                        <div className="md:w-2/3">
                          <h4 className="text-xl font-semibold mb-2">{roomType.name}</h4>
                          {roomType.description && (
                            <p className="text-gray-600 mb-4">{roomType.description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-sm text-gray-700">
                                Tối đa {roomType.maxOccupancy} người
                              </span>
                            </div>
                            {roomType.bedType && (
                              <div className="text-sm text-gray-700">
                                Loại giường: {roomType.bedType}
                              </div>
                            )}
                            {roomType.roomSize && (
                              <div className="text-sm text-gray-700">
                                Diện tích: {roomType.roomSize}m²
                              </div>
                            )}
                            <div className="text-sm text-gray-700">
                              Còn trống: {roomType.availableRooms} phòng
                            </div>
                          </div>

                          {roomType.amenities && (
                            <div className="mb-4">
                              <div className="text-xs text-gray-600 mb-2">Tiện ích phòng:</div>
                              <div className="flex flex-wrap gap-2">
                                {roomType.amenities.split(',').map((amenity, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200"
                                  >
                                    {amenity.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-2xl font-bold text-blue-600">
                                {formatPrice(roomType.pricePerNight)}
                              </span>
                              <span className="text-gray-500 text-sm ml-1">/đêm</span>
                            </div>
                            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                              Đặt phòng
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="space-y-6">
                {/* Review Form Section */}
                {user ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    {checkingUserReview ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">Đang kiểm tra đánh giá của bạn...</p>
                    </div>
                    ) : userExistingReview ? (
                      // User has existing review - show edit option
                      !showReviewForm ? (
                        <div className="text-center">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            Bạn đã đánh giá khách sạn này
                          </h4>
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-center mb-2">
                              {Array(5).fill(0).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${i < userExistingReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-600">
                                {userExistingReview.rating}/5 sao
                              </span>
                            </div>
                            {userExistingReview.comment && (
                              <p className="text-gray-700 text-sm">"{userExistingReview.comment}"</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Đánh giá vào {new Date(userExistingReview.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <button
                            onClick={() => setShowReviewForm(true)}
                            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Chỉnh sửa đánh giá
                          </button>
                    </div>
                      ) : (
                        <ReviewEditForm
                          review={{
                            id: userExistingReview.id,
                            rating: userExistingReview.rating,
                            comment: userExistingReview.comment,
                            hotelId: userExistingReview.hotelId,
                            hotelName: hotel?.name
                          }}
                          onSuccess={handleReviewUpdateSuccess}
                          onCancel={() => setShowReviewForm(false)}
                          onDelete={handleReviewDeleteSuccess}
                        />
                      )
                    ) : (
                      // User doesn't have review - show create option
                      !showReviewForm ? (
                        <div className="text-center">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            Chia sẻ trải nghiệm của bạn
                          </h4>
                          <p className="text-gray-600 mb-4">
                            Đánh giá của bạn sẽ giúp những người khác có lựa chọn tốt hơn
                          </p>
                    <button
                            onClick={() => setShowReviewForm(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Viết đánh giá
                          </button>
                        </div>
                      ) : (
                        <ReviewForm
                          hotelId={hotel?.id || ''}
                          hotelName={hotel?.name || ''}
                          onSuccess={handleReviewSuccess}
                          onCancel={() => setShowReviewForm(false)}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Đăng nhập để viết đánh giá
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Bạn cần đăng nhập để có thể chia sẻ trải nghiệm và đánh giá khách sạn
                    </p>
                    <Link
                      to="/login"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                    >
                      Đăng nhập
                    </Link>
                  </div>
                )}

                {/* Enhanced Reviews Display */}
                <ReviewDisplay 
                  reviews={reviews}
                  loading={loading}
                  showStats={true}
                  showFilters={true}
                  hotelId={hotel?.id}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Thông tin đặt phòng</h3>
              
              {/* Price */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-blue-600">
                  {formatPrice(hotel.pricePerNight)}
                </div>
                {hotel.pricePerNight && (
                  <div className="text-gray-500">mỗi đêm</div>
                )}
              </div>

              {/* Check times */}
              {(hotel.checkInTime || hotel.checkOutTime) && (
                <div className="mb-6 space-y-3">
                  {hotel.checkInTime && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        Nhận phòng: {hotel.checkInTime}
                      </span>
                    </div>
                  )}
                  {hotel.checkOutTime && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700">
                        Trả phòng: {hotel.checkOutTime}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {hotel.totalRoomTypes || 0}
                  </div>
                  <div className="text-sm text-gray-600">Loại phòng</div>
                  </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {hotel.totalRooms || 0}
                  </div>
                  <div className="text-sm text-gray-600">Tổng phòng</div>
                </div>
              </div>

              {/* Booking Button */}
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold mb-4">
                Đặt phòng ngay
              </button>
              
              <Link 
                to="/hotels"
                className="w-full block text-center border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Xem khách sạn khác
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;
