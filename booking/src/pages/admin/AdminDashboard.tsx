import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Hotel, BookOpen, Settings, Star, BarChart2, Tag } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Tổng người dùng', value: '1,234', icon: Users },
    { label: 'Tổng khách sạn', value: '567', icon: Hotel },
    { label: 'Tổng đặt phòng', value: '8,901', icon: BookOpen },
  ];

  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Bảng điều khiển quản trị</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm sm:text-base text-gray-500">{stat.label}</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-2">{stat.value}</h3>
                </div>
                <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <ManagementCard
          title="Quản lý người dùng"
          description="Quản lý tài khoản và phân quyền người dùng"
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/users')}
        />
        <ManagementCard
          title="Quản lý khách sạn"
          description="Quản lý danh sách và thông tin khách sạn"
          icon={<Hotel className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/hotels')}
        />
        <ManagementCard
          title="Quản lý đặt phòng"
          description="Xem và quản lý các đơn đặt phòng"
          icon={<BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/bookings')}
        />
        <ManagementCard
          title="Quản lý đánh giá"
          description="Duyệt và quản lý đánh giá của người dùng"
          icon={<Star className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/reviews')}
        />
        <ManagementCard
          title="Thống kê & Phân tích"
          description="Xem báo cáo và thống kê hệ thống"
          icon={<BarChart2 className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/analytics')}
        />
        <ManagementCard
          title="Quản lý khuyến mãi"
          description="Tạo và quản lý các mã khuyến mãi"
          icon={<Tag className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/promotions')}
        />
        <ManagementCard
          title="Cài đặt hệ thống"
          description="Cấu hình các thiết lập hệ thống"
          icon={<Settings className="h-5 w-5 sm:h-6 sm:w-6" />}
          onClick={() => navigate('/admin/settings')}
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
}

const ManagementCard: React.FC<ManagementCardProps> = ({
  title,
  description,
  icon,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-left transition-all hover:shadow-lg hover:scale-105"
    >
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
          {icon}
        </div>
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-sm sm:text-base text-gray-600">{description}</p>
    </button>
  );
};

export default AdminDashboard;

