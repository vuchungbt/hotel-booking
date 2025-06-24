import React, { useEffect, useState } from 'react';
import { 
  Hotel, BookOpen, DollarSign, Star, Filter, TrendingUp,
  Award, CheckCircle, BedDouble, Percent
} from 'lucide-react';
import { hostAPI, hotelAPI, HostDashboardResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const HostDashboard: React.FC = () => {
  const { showToast } = useToast();
  
  // Dashboard stats state
  const [dashboardData, setDashboardData] = useState<HostDashboardResponse>({
    totalHotels: 0,
    activeHotels: 0,
    totalRoomTypes: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    occupancyRate: 0,
    totalReviews: 0,
    pendingBookings: 0,
    confirmedBookings: 0
  });
  
  const [loading, setLoading] = useState(true);
  
  // Date filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Revenue analytics states
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    averageBookingValue: 0,
    totalCommission: 0
  });
  
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Initialize date range on component mount
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Try to get full dashboard data first, fallback to individual API calls
      try {
        const dashboardResponse = await hostAPI.getDashboard();
        if (dashboardResponse.data.success) {
          setDashboardData(dashboardResponse.data.result);
          return;
        }
      } catch (error) {
        console.log('Full dashboard API not available, fetching individual stats...');
      }

      // Fallback: Fetch individual statistics
      const [hotelStatsResponse, myHotelsResponse] = await Promise.all([
        hotelAPI.getMyHotelsCount().catch(() => ({ data: { result: 0 } })),
        hotelAPI.getMyActiveHotelsCount().catch(() => ({ data: { result: 0 } }))
      ]);

      setDashboardData(prev => ({
        ...prev,
        totalHotels: hotelStatsResponse.data.result || 0,
        activeHotels: myHotelsResponse.data.result || 0,
        // For now, use placeholder values for booking/revenue data
        // These will be replaced when booking APIs are implemented
        totalBookings: 0,
        monthlyRevenue: 0,
        averageRating: 0,
        occupancyRate: 0,
        totalReviews: 0,
        pendingBookings: 0,
        confirmedBookings: 0
      }));

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      showToast('error', 'Error', 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics data with date range
  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true);
      
      // TODO: Replace with actual host analytics API
      // For now, use sample data
      setRevenueData({
        totalRevenue: 150000000,
        totalBookings: 45,
        averageBookingValue: 3333333,
        totalCommission: 15000000
      });
      
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      showToast('error', 'Error', 'Unable to load analytics data');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalyticsData();
    }
  }, [startDate, endDate]);

  // Handle date filter
  const handleDateFilter = () => {
    if (!startDate || !endDate) {
      showToast('warning', 'Warning', 'Please select both start date and end date');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      showToast('error', 'Error', 'Start date cannot be greater than end date');
      return;
    }
    
    fetchAnalyticsData();
    showToast('success', 'Success', `Applied filter from ${startDate} to ${endDate}`);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  // Basic stats from API
  const basicStats = [
    { 
      label: 'Total Hotels', 
      value: dashboardData.totalHotels.toString(), 
      icon: Hotel,
      color: 'blue',
      description: 'Total hotels you manage'
    },
    { 
      label: 'Active Hotels', 
      value: dashboardData.activeHotels.toString(), 
      icon: CheckCircle,
      color: 'green',
      description: 'Currently active hotels'
    },
    { 
      label: 'Room Types', 
      value: dashboardData.totalRoomTypes.toString(), 
      icon: BedDouble,
      color: 'indigo',
      description: 'Total room types available'
    },
    { 
      label: 'Total Reviews', 
      value: dashboardData.totalReviews.toString(), 
      icon: Star,
      color: 'yellow',
      description: 'Reviews from guests'
    },
    { 
      label: 'Average Rating', 
      value: dashboardData.averageRating > 0 ? dashboardData.averageRating.toFixed(1) : '0.0', 
      icon: Award,
      color: 'purple',
      description: 'Average rating score'
    },
    { 
      label: 'Occupancy Rate', 
      value: dashboardData.occupancyRate + '%', 
      icon: TrendingUp,
      color: 'orange',
      description: 'Current occupancy rate'
    }
  ];

  // Advanced analytics stats
  const advancedStats = [
    {
      label: 'Revenue',
      value: formatCurrency(revenueData.totalRevenue),
      icon: DollarSign,
      color: 'blue',
      description: `Total revenue from bookings`,
      span: 'col-span-1 sm:col-span-2'
    },
    {
      label: 'Bookings',
      value: revenueData.totalBookings.toLocaleString(),
      icon: BookOpen,
      color: 'green',
      description: `Total number of bookings`
    }, 
    {
      label: 'Avg Booking Value',
      value: formatCurrency(revenueData.averageBookingValue),
      icon: TrendingUp,
      color: 'indigo',
      description: `Average value per booking`,
      span: 'col-span-1 sm:col-span-2'
    },
    {
      label: 'Commission Paid',
      value: formatCurrency(revenueData.totalCommission),
      icon: Percent,
      color: 'purple',
      description: `Total commission paid to system`
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; icon: string } } = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
      green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
      yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', icon: 'text-yellow-500' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-500' },
      teal: { bg: 'bg-teal-50', text: 'text-teal-600', icon: 'text-teal-500' },
      red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' }
    };
    return colorMap[color] || colorMap.blue;
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

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Host Dashboard</h1>
          <p className="text-gray-600 mt-1">Hotel management and analytics overview</p>
        </div>
      </div>

      {/* Basic Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        {basicStats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color);
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <h3 className={`text-2xl font-bold ${colors.text}`}>
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stat.value
                    )}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Advanced Analytics */}
      <div className="space-y-6">
        {/* Date Range Filter */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-blue-500" />
              Revenue Analytics Filter
            </h2>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <button
                onClick={handleDateFilter}
                disabled={analyticsLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyticsLoading ? 'Loading...' : 'Apply'}
              </button>
            </div>
          </div>
          
          {/* Quick Date Filters */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700 mr-2">Quick filters:</span>
            <button
              onClick={() => {
                const today = new Date();
                const weekAgo = new Date();
                weekAgo.setDate(today.getDate() - 7);
                setStartDate(weekAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              Last 7 days
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const monthAgo = new Date();
                monthAgo.setDate(today.getDate() - 30);
                setStartDate(monthAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            >
              Last 30 days
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const quarterAgo = new Date();
                quarterAgo.setDate(today.getDate() - 90);
                setStartDate(quarterAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
            >
              Last 3 months
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const yearAgo = new Date();
                yearAgo.setFullYear(today.getFullYear() - 1);
                setStartDate(yearAgo.toISOString().split('T')[0]);
                setEndDate(today.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
            >
              Last 1 year
            </button>
          </div>
        </div>

        {/* Advanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
          {advancedStats.map((stat, index) => {
            const Icon = stat.icon;
            const colors = getColorClasses(stat.color);
            return (
              <div key={index} className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${stat.span || ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    <h3 className={`text-2xl font-bold ${colors.text}`}>{stat.value}</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Hotel Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active</span>
                <span className="text-green-600 font-medium">{dashboardData.activeHotels}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Inactive</span>
                <span className="text-red-600 font-medium">{dashboardData.totalHotels - dashboardData.activeHotels}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Room Types</span>
                <span className="text-blue-600 font-medium">{dashboardData.totalRoomTypes}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Bookings</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <span className="text-yellow-600 font-medium">{dashboardData.pendingBookings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Confirmed</span>
                <span className="text-green-600 font-medium">{dashboardData.confirmedBookings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Occupancy Rate</span>
                <span className="text-blue-600 font-medium">{dashboardData.occupancyRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Reviews</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Reviews</span>
                <span className="text-gray-900 font-medium">{dashboardData.totalReviews}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Score</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-gray-900 font-medium">
                    {dashboardData.averageRating > 0 ? dashboardData.averageRating.toFixed(1) : '0.0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Monthly Revenue
              </h3>
              {analyticsLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              )}
            </div>
            <div className="flex h-48 items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Revenue chart will be implemented with real data</p>
              </div>
            </div>
          </div>

          {/* Bookings Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                Monthly Bookings
              </h3>
              {analyticsLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
              )}
            </div>
            <div className="flex h-48 items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Bookings chart will be implemented with real data</p>
              </div>
            </div>
          </div>

          {/* Occupancy Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Hotel className="h-5 w-5 mr-2 text-purple-500" />
                Monthly Occupancy
              </h3>
              {analyticsLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
              )}
            </div>
            <div className="flex h-48 items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <Hotel className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Occupancy chart will be implemented with real data</p>
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* Dashboard Footer */}
      <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
        <p>
          Dashboard last updated: {new Date().toLocaleString()} | 
          <span className="ml-1">
            Data loaded successfully
          </span>
        </p>
        <p className="mt-1">
          Hotel Booking Management System - Host Dashboard v1.0
        </p>
      </div>
    </div>
  );
};

export default HostDashboard;
