import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Hotel, BookOpen, Settings, Star, BarChart2, Tag, RefreshCw, TrendingUp, Award, CheckCircle, BedDouble } from 'lucide-react';
import { adminAPI, AdminDashboardResponse } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [stats, setStats] = useState<AdminDashboardResponse>({
    totalHotels: 0,
    activeHotels: 0,
    inactiveHotels: 0,
    featuredHotels: 0,
    totalRoomTypes: 0,
    activeRoomTypes: 0,
    inactiveRoomTypes: 0,
    totalReviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    verifiedReviews: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const response = await adminAPI.getDashboard();
      if (response.data.success) {
        setStats(response.data.result);
      } else {
        throw new Error('Failed to fetch dashboard stats');
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      showToast('error', 'Lỗi', 'Không thể tải thống kê dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleRefresh = () => {
    fetchDashboardStats();
  };

  const dashboardStats = [
    { 
      label: 'Tổng người dùng', 
      value: stats.totalUsers.toLocaleString(), 
      icon: Users,
      color: 'blue',
      description: 'Tổng số người dùng đã đăng ký'
    },
    { 
      label: 'Tổng khách sạn', 
      value: stats.totalHotels.toLocaleString(), 
      icon: Hotel,
      color: 'green',
      description: 'Tổng số khách sạn trong hệ thống'
    },
    { 
      label: 'Khách sạn hoạt động', 
      value: stats.activeHotels.toLocaleString(), 
      icon: CheckCircle,
      color: 'emerald',
      description: 'Số khách sạn đang hoạt động'
    },
    { 
      label: 'Khách sạn nổi bật', 
      value: stats.featuredHotels.toLocaleString(), 
      icon: Award,
      color: 'yellow',
      description: 'Số khách sạn được đánh dấu nổi bật'
    },
    { 
      label: 'Tổng loại phòng', 
      value: stats.totalRoomTypes.toLocaleString(), 
      icon: BedDouble,
      color: 'indigo',
      description: 'Tổng số loại phòng trong hệ thống'
    },
    { 
      label: 'Loại phòng hoạt động', 
      value: stats.activeRoomTypes.toLocaleString(), 
      icon: CheckCircle,
      color: 'teal',
      description: 'Số loại phòng đang hoạt động'
    },
    { 
      label: 'Tổng đánh giá', 
      value: stats.totalReviews.toLocaleString(), 
      icon: Star,
      color: 'orange',
      description: 'Tổng số đánh giá từ khách hàng'
    },
    { 
      label: 'Đánh giá đã duyệt', 
      value: stats.approvedReviews.toLocaleString(), 
      icon: CheckCircle,
      color: 'purple',
      description: 'Số đánh giá đã được phê duyệt'
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
      teal: { bg: 'bg-teal-50', text: 'text-teal-600', icon: 'text-teal-500' }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Bảng điều khiển quản trị</h1>
          <p className="text-gray-600 mt-1">Tổng quan hệ thống quản lý khách sạn</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
        >
          <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color);
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${colors.bg}`}>
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{stat.label}</p>
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

      {/* Quick Stats Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp size={20} className="mr-2 text-blue-500" />
          Tóm tắt nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalHotels > 0 ? Math.round((stats.activeHotels / stats.totalHotels) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Tỷ lệ khách sạn hoạt động</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.totalHotels > 0 ? Math.round((stats.featuredHotels / stats.totalHotels) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Tỷ lệ khách sạn nổi bật</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.totalRoomTypes > 0 ? Math.round((stats.activeRoomTypes / stats.totalRoomTypes) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Tỷ lệ loại phòng hoạt động</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalReviews && stats.totalHotels > 0 ? Math.round(stats.totalReviews / stats.totalHotels) : 0}
            </div>
            <div className="text-sm text-gray-600">Đánh giá trung bình/khách sạn</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalReviews && stats.totalHotels > 0 ? Math.round(stats.approvedReviews / stats.totalHotels) : 0}
            </div>
            <div className="text-sm text-gray-600">Đánh giá đã duyệt/khách sạn</div>
          </div>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <ManagementCard
          title="Quản lý người dùng"
          description="Quản lý tài khoản và phân quyền người dùng"
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/users')}
          stats={`${stats.totalUsers.toLocaleString()} người dùng`}
        />
        <ManagementCard
          title="Quản lý khách sạn"
          description="Quản lý danh sách và thông tin khách sạn"
          icon={<Hotel className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/hotels')}
          stats={`${stats.totalHotels.toLocaleString()} khách sạn`}
        />
        <ManagementCard
          title="Quản lý loại phòng"
          description="Quản lý các loại phòng và cấu hình"
          icon={<BedDouble className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/room-types')}
          stats={`${stats.totalRoomTypes.toLocaleString()} loại phòng`}
        />
        <ManagementCard
          title="Quản lý đặt phòng"
          description="Xem và quản lý các đơn đặt phòng"
          icon={<BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/bookings')}
          stats={`${stats.totalReviews.toLocaleString()} đánh giá`}
        />
        <ManagementCard
          title="Quản lý đánh giá"
          description="Duyệt và quản lý đánh giá của người dùng"
          icon={<Star className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/reviews')}
          stats={`${stats.totalReviews.toLocaleString()} đánh giá`}
        />
        <ManagementCard
          title="Thống kê & Phân tích"
          description="Xem báo cáo và thống kê hệ thống"
          icon={<BarChart2 className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/analytics')}
          stats="Báo cáo chi tiết"
        />
        <ManagementCard
          title="Phân tích nâng cao"
          description="Biểu đồ và thống kê chi tiết hệ thống"
          icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/advanced-analytics')}
          stats="Phân tích sâu"
        />
        <ManagementCard
          title="Quản lý khuyến mãi"
          description="Tạo và quản lý các mã khuyến mãi"
          icon={<Tag className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/promotions')}
          stats="Mã khuyến mãi"
        />
        <ManagementCard
          title="Cài đặt hệ thống"
          description="Cấu hình các thiết lập hệ thống"
          icon={<Settings className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/settings')}
          stats="Cấu hình"
        />
      </div>
    </div>
  );
};

interface ManagementCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  stats?: string;
}

const ManagementCard: React.FC<ManagementCardProps> = ({
  title,
  description,
  icon,
  onClick,
  stats
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 text-left transition-all hover:shadow-md hover:border-blue-200 group"
    >
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 group-hover:bg-blue-200 transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold group-hover:text-blue-600 transition-colors">{title}</h3>
          {stats && (
            <p className="text-sm text-blue-600 font-medium">{stats}</p>
          )}
        </div>
      </div>
      <p className="text-sm sm:text-base text-gray-600">{description}</p>
    </button>
  );
};

export default AdminDashboard;

