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
      showToast('error', 'Error', 'Unable to load dashboard statistics');
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
      label: 'Total Users', 
      value: stats.totalUsers.toLocaleString(), 
      icon: Users,
      color: 'blue',
      description: 'Total registered users'
    },
    { 
      label: 'Total Hotels', 
      value: stats.totalHotels.toLocaleString(), 
      icon: Hotel,
      color: 'green',
      description: 'Total hotels in the system'
    },
    { 
      label: 'Active Hotels', 
      value: stats.activeHotels.toLocaleString(), 
      icon: CheckCircle,
      color: 'emerald',
      description: 'Number of active hotels'
    },
    { 
      label: 'Inactive Hotels', 
      value: stats.inactiveHotels.toLocaleString(), 
      icon: Settings,
      color: 'red',
      description: 'Number of inactive hotels'
    },
    { 
      label: 'Featured Hotels', 
      value: stats.featuredHotels.toLocaleString(), 
      icon: Award,
      color: 'yellow',
      description: 'Number of featured hotels'
    },
    { 
      label: 'Total Room Types', 
      value: stats.totalRoomTypes.toLocaleString(), 
      icon: BedDouble,
      color: 'indigo',
      description: 'Total room types in the system'
    },
    { 
      label: 'Total Reviews', 
      value: stats.totalReviews.toLocaleString(), 
      icon: Star,
      color: 'orange',
      description: 'Total reviews from customers'
    },
    { 
      label: 'Approved Reviews', 
      value: stats.approvedReviews.toLocaleString(), 
      icon: CheckCircle,
      color: 'green',
      description: 'Number of approved reviews'
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

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
                      <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Hotel management system overview</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
        >
          <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
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
 
    </div>
  );
};

 


export default AdminDashboard;

