import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Star, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { hotelAPI, HotelFilterParams, HotelResponse } from '../services/api';

interface FiltersState {
  priceRange: string;
  rating: string;
  amenities: string[];
}

interface PaginationInfo {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

const HotelsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<FiltersState>({
    priceRange: searchParams.get('priceRange') || 'all',
    rating: searchParams.get('rating') || 'all',
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || []
  });

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(
    searchParams.get('location') || 
    searchParams.get('city') || // Handle city parameter from homepage
    ''
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'name');
  
  // Handle additional search parameters from homepage
  const [checkInDate, setCheckInDate] = useState(searchParams.get('checkIn') || '');
  const [checkOutDate, setCheckOutDate] = useState(searchParams.get('checkOut') || '');
  const [guestCount, setGuestCount] = useState(parseInt(searchParams.get('guests') || '2'));
  
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableAmenities, setAvailableAmenities] = useState<string[]>([]);
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    pageNumber: parseInt(searchParams.get('page') || '0'),
    pageSize: 12,
    totalElements: 0,
    totalPages: 0
  });

  // Fetch hotels data
  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filter parameters
      const filterParams: HotelFilterParams = {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        sortBy: sortBy,
        isActive: true, // Only show active hotels
      };

      // Add price filter
      if (filters.priceRange !== 'all') {
        const [min, max] = filters.priceRange.split('-');
        filterParams.minPrice = parseInt(min);
        if (max && max !== '+') {
          filterParams.maxPrice = parseInt(max);
        }
      }

      // Add rating filter
      if (filters.rating !== 'all') {
        filterParams.starRating = parseInt(filters.rating);
      }

      // Add city filter - prioritize location over searchTerm for city search
      const cityFilter = location.trim() || searchTerm.trim();
      if (cityFilter) {
        filterParams.city = cityFilter;
      }

      // Add amenities filter
      if (filters.amenities.length > 0) {
        filterParams.amenities = filters.amenities.join(',');
      }

      let response;

      // Use new unified search API with filters
      if (searchTerm.trim() || location.trim() || filters.amenities.length > 0 || 
          filters.priceRange !== 'all' || filters.rating !== 'all') {
        // Use the existing filter params with city already set
        const searchParams = { ...filterParams };
        
        // Try the new search with filters endpoint first
        try {
          response = await hotelAPI.searchHotelsWithFilters(searchParams);
        } catch (error) {
          // Fallback to admin filters if new endpoint doesn't exist
          console.warn('New search endpoint not available, using fallback');
          response = await hotelAPI.getAdminHotelsWithFilters(filterParams);
        }
      } else {
        // Get active hotels with filters
        response = await hotelAPI.getAdminHotelsWithFilters(filterParams);
      }

      if (response.data.success) {
        const result = response.data.result;
        setHotels(result.content || []);
        setPagination(prev => ({
          ...prev,
          totalElements: result.totalElements || 0,
          totalPages: result.totalPages || 0
        }));
      } else {
        setError('Unable to load hotel list');
      }
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Update URL params
  const updateURLParams = () => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('search', searchTerm);
    if (location) params.set('location', location);
    if (filters.priceRange !== 'all') params.set('priceRange', filters.priceRange);
    if (filters.rating !== 'all') params.set('rating', filters.rating);
    if (filters.amenities.length > 0) params.set('amenities', filters.amenities.join(','));
    if (sortBy !== 'name') params.set('sortBy', sortBy);
    if (pagination.pageNumber > 0) params.set('page', pagination.pageNumber.toString());
    
    // Keep homepage search parameters for reference
    if (checkInDate) params.set('checkIn', checkInDate);
    if (checkOutDate) params.set('checkOut', checkOutDate);
    if (guestCount !== 2) params.set('guests', guestCount.toString());

    setSearchParams(params);
  };

  // Handle search
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
    updateURLParams();
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, pageNumber: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
  };

  // Format price
  const formatPrice = (price: number | undefined) => {
    if (!price) return 'Contact';
    return price.toLocaleString('vi-VN') + 'đ';
  };

  // Render stars
  const renderStars = (rating: number | undefined) => {
    if (!rating) return null;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Get image URL with fallback
  const getImageUrl = (imageUrl?: string) => {
    return imageUrl || 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg';
  };

  // Fetch available amenities
  const fetchAmenities = async () => {
    try {
      const response = await hotelAPI.getAvailableAmenities();
      if (response.data.success) {
        setAvailableAmenities(response.data.result || []);
      } else {
        // Fallback to default amenities if API fails
        setAvailableAmenities(['Hồ bơi', 'Spa', 'Phòng gym', 'Nhà hàng', 'Bar', 'WiFi miễn phí']);
      }
    } catch (err) {
      console.warn('Failed to fetch amenities, using defaults');
      setAvailableAmenities(['Hồ bơi', 'Spa', 'Phòng gym', 'Nhà hàng', 'Bar', 'WiFi miễn phí']);
    }
  };

  // Effects
  useEffect(() => {
    fetchAmenities(); // Fetch amenities on component mount
    fetchHotels();
  }, [pagination.pageNumber, sortBy]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      updateURLParams();
      fetchHotels();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, location, filters]);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="w-full h-48 bg-gray-300"></div>
          <div className="p-6">
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-3 w-2/3"></div>
            <div className="h-4 bg-gray-300 rounded mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-300 rounded w-20"></div>
              <div className="h-10 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="text-center">
                          <h1 className="text-4xl font-bold mb-4">Hotels & Resorts</h1>
                <p className="text-xl text-blue-100">
                  Explore thousands of amazing hotels across Vietnam
                </p>
        </div>
      </div>

      {/* Search Summary from Homepage */}
      {(location || checkInDate || checkOutDate || guestCount !== 2) && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <Search size={18} />
                              <span className="font-medium">Your search:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {location && (
                <span className="inline-flex items-center bg-white text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                  📍 {location}
                </span>
              )}
              {checkInDate && checkOutDate && (
                <span className="inline-flex items-center bg-white text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                  📅 {new Date(checkInDate).toLocaleDateString('vi-VN')} - {new Date(checkOutDate).toLocaleDateString('vi-VN')}
                </span>
              )}
              {checkInDate && !checkOutDate && (
                <span className="inline-flex items-center bg-white text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                  📅 Từ {new Date(checkInDate).toLocaleDateString('vi-VN')}
                </span>
              )}
              {guestCount !== 2 && (
                <span className="inline-flex items-center bg-white text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                  👥 {guestCount} khách
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="bg-white shadow-md py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                                        placeholder="Search hotels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
            <button 
              onClick={handleSearch}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
                                  Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filter</h3>
                <Filter size={20} className="text-gray-500" />
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-gray-700">Price Range</h4>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange({priceRange: e.target.value})}
                >
                  <option value="all">All</option>
                  <option value="0-1000000">Under 1 million</option>
                  <option value="1000000-2000000">1 - 2 million</option>
                  <option value="2000000-5000000">2 - 5 million</option>
                  <option value="5000000-+">Over 5 million</option>
                </select>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-gray-700">Rating</h4>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.rating}
                  onChange={(e) => handleFilterChange({rating: e.target.value})}
                >
                  <option value="all">All</option>
                  <option value="5">5 stars</option>
                  <option value="4">4 stars or higher</option>
                  <option value="3">3 stars or higher</option>
                </select>
              </div>

              {/* Amenities */}
              <div>
                <h4 className="font-medium mb-3 text-gray-700">Amenities</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {availableAmenities.map((amenity) => (
                    <label key={amenity} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        checked={filters.amenities.includes(amenity)}
                        onChange={(e) => {
                          const newAmenities = e.target.checked
                            ? [...filters.amenities, amenity]
                            : filters.amenities.filter(a => a !== amenity);
                          handleFilterChange({amenities: newAmenities});
                        }}
                      />
                      <span className="ml-3 text-gray-700">{amenity}</span>
                    </label>
                  ))}
                  {availableAmenities.length === 0 && (
                    <div className="text-gray-500 text-sm">Loading amenities...</div>
                  )}
                </div>
                {filters.amenities.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm text-gray-600 mb-2">Selected ({filters.amenities.length}):</div>
                    <div className="flex flex-wrap gap-1">
                      {filters.amenities.map((amenity) => (
                        <span 
                          key={amenity}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {amenity}
                          <button
                            onClick={() => {
                              const newAmenities = filters.amenities.filter(a => a !== amenity);
                              handleFilterChange({amenities: newAmenities});
                            }}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hotel List */}
          <div className="lg:w-3/4">
            {/* Header and Sort */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {loading ? 'Loading...' : `Found ${pagination.totalElements} hotels`}
              </h2>
              <select 
                className="p-2 border border-gray-300 rounded-lg"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="name">Sort by name</option>
                <option value="pricePerNight">Sort by price</option>
                <option value="starRating">Sort by rating</option>
                <option value="createdAt">Sort by date</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Hotels Grid */}
            {loading ? (
              <LoadingSkeleton />
            ) : hotels.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No hotels found</div>
                <p className="text-gray-400">Please try changing your filters or search keywords</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                        src={getImageUrl(hotel.imageUrl)}
                      alt={hotel.name}
                      className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg';
                        }}
                    />
                      {hotel.featured && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}
                    <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full shadow-md">
                      <div className="flex items-center">
                          {hotel.starRating ? (
                            <>
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm font-medium">{hotel.starRating}</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">No rating</span>
                          )}
                      </div>
                    </div>
                    
                    {/* City Badge - Below Star Rating */}
                    {hotel.city && (
                      <div className="absolute top-12 right-4 bg-white bg-opacity-90 px-2 py-1 rounded-full shadow-sm">
                        <span className="text-xs text-gray-600">📍 {hotel.city}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 line-clamp-1">{hotel.name}</h3>
                    <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{hotel.address}</span>
                    </div>
                      {hotel.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{hotel.description}</p>
                      )}
                      
                      {/* Rating and Reviews - Always show */}
                      <div className="flex items-center mb-3">
                        {hotel.averageRating && hotel.averageRating > 0 ? (
                          <>
                            <div className="flex items-center mr-2">
                              {renderStars(Math.round(hotel.averageRating))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {hotel.averageRating.toFixed(1)} ({hotel.totalReviews || 0} reviews)
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">
                              No reviews
                          </span>
                        )}
                      </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                            {formatPrice(hotel.pricePerNight)}
                        </span>
                          {hotel.pricePerNight && (
                        <span className="text-gray-500 text-sm ml-1">/night</span>
                          )}
                      </div>
                        <Link
                          to={`/hotels/${hotel.id}`}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                        View details
                        </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            {/* Pagination */}
            {!loading && hotels.length > 0 && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    disabled={pagination.pageNumber === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <ChevronLeft size={16} className="mr-1" />
                  Previous
                </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(0, Math.min(pagination.pageNumber - 2, pagination.totalPages - 5)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg ${
                          pageNum === pagination.pageNumber
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum + 1}
                </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    disabled={pagination.pageNumber >= pagination.totalPages - 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                        Next
                    <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelsPage;
