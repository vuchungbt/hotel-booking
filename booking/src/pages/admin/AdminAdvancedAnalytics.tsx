import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, Download, Filter, TrendingUp, TrendingDown, Users, Hotel, BedDouble, Star, DollarSign, RefreshCw, FileText, BarChart3, Award } from 'lucide-react';
import { hotelAPI, roomTypeAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface AnalyticsData {
  hotelStats: {
    total: number;
    active: number;
    featured: number;
    byCity: Array<{ city: string; count: number }>;
    byCountry: Array<{ country: string; count: number }>;
    byStarRating: Array<{ rating: number; count: number }>;
  };
  roomTypeStats: {
    total: number;
    byOccupancy: Array<{ occupancy: number; count: number }>;
    priceDistribution: Array<{ range: string; count: number }>;
  };
  trends: {
    hotelGrowth: Array<{ month: string; hotels: number; roomTypes: number }>;
    occupancyRate: Array<{ month: string; rate: number }>;
  };
}

const AdminAdvancedAnalytics: React.FC = () => {
  const { showToast } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Mock data for demonstration - in real app, this would come from API
  const mockAnalyticsData: AnalyticsData = {
    hotelStats: {
      total: 156,
      active: 142,
      featured: 23,
      byCity: [
        { city: 'Hồ Chí Minh', count: 45 },
        { city: 'Hà Nội', count: 38 },
        { city: 'Đà Nẵng', count: 25 },
        { city: 'Nha Trang', count: 18 },
        { city: 'Phú Quốc', count: 15 },
        { city: 'Hội An', count: 15 }
      ],
      byCountry: [
        { country: 'Việt Nam', count: 140 },
        { country: 'Thái Lan', count: 8 },
        { country: 'Singapore', count: 5 },
        { country: 'Malaysia', count: 3 }
      ],
      byStarRating: [
        { rating: 5, count: 25 },
        { rating: 4, count: 45 },
        { rating: 3, count: 52 },
        { rating: 2, count: 28 },
        { rating: 1, count: 6 }
      ]
    },
    roomTypeStats: {
      total: 487,
      byOccupancy: [
        { occupancy: 1, count: 45 },
        { occupancy: 2, count: 156 },
        { occupancy: 3, count: 98 },
        { occupancy: 4, count: 125 },
        { occupancy: 5, count: 45 },
        { occupancy: 6, count: 18 }
      ],
      priceDistribution: [
        { range: '< 500K', count: 78 },
        { range: '500K - 1M', count: 145 },
        { range: '1M - 2M', count: 156 },
        { range: '2M - 5M', count: 89 },
        { range: '> 5M', count: 19 }
      ]
    },
    trends: {
      hotelGrowth: [
        { month: 'T1', hotels: 120, roomTypes: 350 },
        { month: 'T2', hotels: 125, roomTypes: 365 },
        { month: 'T3', hotels: 132, roomTypes: 385 },
        { month: 'T4', hotels: 138, roomTypes: 410 },
        { month: 'T5', hotels: 145, roomTypes: 435 },
        { month: 'T6', hotels: 150, roomTypes: 455 },
        { month: 'T7', hotels: 152, roomTypes: 470 },
        { month: 'T8', hotels: 154, roomTypes: 480 },
        { month: 'T9', hotels: 155, roomTypes: 485 },
        { month: 'T10', hotels: 156, roomTypes: 487 }
      ],
      occupancyRate: [
        { month: 'T1', rate: 65 },
        { month: 'T2', rate: 68 },
        { month: 'T3', rate: 72 },
        { month: 'T4', rate: 75 },
        { month: 'T5', rate: 78 },
        { month: 'T6', rate: 82 },
        { month: 'T7', rate: 85 },
        { month: 'T8', rate: 83 },
        { month: 'T9', rate: 79 },
        { month: 'T10', rate: 76 }
      ]
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // In real app, fetch from API with date range
      // For now, use mock data
      setTimeout(() => {
        setAnalyticsData(mockAnalyticsData);
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      showToast('error', 'Lỗi', 'Không thể tải dữ liệu thống kê');
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExportReport = () => {
    // In real app, generate and download report
    showToast('success', 'Thành công', 'Báo cáo đã được xuất thành công');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className={`flex items-center mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="ml-1 text-sm font-medium">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin mr-2" size={24} />
          <span>Đang tải dữ liệu thống kê...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <p className="text-gray-500">Không thể tải dữ liệu thống kê</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Thống kê nâng cao</h1>
          <p className="text-gray-600 mt-1">Báo cáo chi tiết và phân tích dữ liệu hệ thống</p>
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
            onClick={handleExportReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Download size={20} className="mr-2" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Calendar size={20} className="text-gray-400" />
            <span className="font-medium text-gray-700">Khoảng thời gian:</span>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-gray-500">đến</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overview">Tổng quan</option>
              <option value="hotels">Khách sạn</option>
              <option value="roomTypes">Loại phòng</option>
              <option value="trends">Xu hướng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng khách sạn"
          value={analyticsData.hotelStats.total.toLocaleString()}
          change={8.2}
          icon={Hotel}
          color="bg-blue-500"
        />
        <StatCard
          title="Khách sạn hoạt động"
          value={analyticsData.hotelStats.active.toLocaleString()}
          change={5.4}
          icon={Hotel}
          color="bg-green-500"
        />
        <StatCard
          title="Tổng loại phòng"
          value={analyticsData.roomTypeStats.total.toLocaleString()}
          change={12.1}
          icon={BedDouble}
          color="bg-purple-500"
        />
        <StatCard
          title="Khách sạn nổi bật"
          value={analyticsData.hotelStats.featured.toLocaleString()}
          change={9.8}
          icon={Award}
          color="bg-yellow-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotel Growth Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2 text-blue-500" />
            Xu hướng tăng trưởng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.trends.hotelGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="hotels" stroke="#8884d8" strokeWidth={2} name="Khách sạn" />
              <Line type="monotone" dataKey="roomTypes" stroke="#82ca9d" strokeWidth={2} name="Loại phòng" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 size={20} className="mr-2 text-green-500" />
            Tỷ lệ lấp đầy
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData.trends.occupancyRate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ lấp đầy']} />
              <Area type="monotone" dataKey="rate" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hotels by City */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Hotel size={20} className="mr-2 text-orange-500" />
            Phân bố khách sạn theo thành phố
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.hotelStats.byCity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Star Rating Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star size={20} className="mr-2 text-yellow-500" />
            Phân bố theo hạng sao
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.hotelStats.byStarRating}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ rating, percent }) => `${rating} sao (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="rating"
              >
                {analyticsData.hotelStats.byStarRating.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Room Type by Occupancy */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users size={20} className="mr-2 text-purple-500" />
            Loại phòng theo sức chứa
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.roomTypeStats.byOccupancy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="occupancy" />
              <YAxis />
              <Tooltip formatter={(value) => [value, 'Số lượng']} />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Price Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign size={20} className="mr-2 text-green-500" />
            Phân bố giá phòng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.roomTypeStats.priceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, percent }) => `${range} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="range"
              >
                {analyticsData.roomTypeStats.priceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText size={20} className="mr-2 text-gray-500" />
          Tóm tắt thống kê
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Khách sạn</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng số:</span>
                <span className="font-medium">{analyticsData.hotelStats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đang hoạt động:</span>
                <span className="font-medium text-green-600">{analyticsData.hotelStats.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nổi bật:</span>
                <span className="font-medium text-yellow-600">{analyticsData.hotelStats.featured}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tỷ lệ hoạt động:</span>
                <span className="font-medium">
                  {Math.round((analyticsData.hotelStats.active / analyticsData.hotelStats.total) * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Loại phòng</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng số:</span>
                <span className="font-medium">{analyticsData.roomTypeStats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trung bình/khách sạn:</span>
                <span className="font-medium">
                  {Math.round(analyticsData.roomTypeStats.total / analyticsData.hotelStats.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Hiệu suất</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tỷ lệ lấp đầy TB:</span>
                <span className="font-medium">76%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tăng trưởng tháng:</span>
                <span className="font-medium text-green-600">+2.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đánh giá TB:</span>
                <span className="font-medium">4.2/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Khách sạn mới:</span>
                <span className="font-medium">+12 tháng này</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdvancedAnalytics; 