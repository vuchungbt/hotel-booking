import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailPage from './pages/HotelDetailPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import BookingDetailPage from './pages/BookingDetailPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCommissions from './pages/admin/AdminCommissions';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminInvoiceDetail from './pages/admin/AdminInvoiceDetail';
import AdminPromotions from './pages/admin/AdminPromotions';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCommissionPayments from './pages/admin/AdminCommissionPayments';
import AdminCommissionPaymentDetail from './pages/admin/AdminCommissionPaymentDetail';
import AdminCommissionPaymentCreate from './pages/admin/AdminCommissionPaymentCreate';
import AdminBookings from './pages/admin/AdminBookings';
import AdminBookingDetail from './pages/admin/AdminBookingDetail';
import AdminHotels from './pages/admin/AdminHotels';
import AdminHotelDetail from './pages/admin/AdminHotelDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';

// Host pages
import HostDashboard from './pages/host/HostDashboard';
import HostProperties from './pages/host/HostProperties';
import HostBookings from './pages/host/HostBookings';
import HostAnalytics from './pages/host/HostAnalytics';
import AddProperty from './pages/host/AddProperty';
import PropertyDetail from './pages/host/PropertyDetail';

// Layout component for public pages
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
    <Footer />
  </div>
);

// Special layout for homepage to allow full-width hero section
const HomeLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomeLayout><HomePage /></HomeLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/hotels" element={<PublicLayout><HotelsPage /></PublicLayout>} />
          <Route path="/hotels/:id" element={<PublicLayout><HotelDetailPage /></PublicLayout>} />

          {/* User routes */}
          <Route path="/profile" element={<PublicLayout><ProfilePage /></PublicLayout>} />
          <Route path="/bookings" element={<PublicLayout><BookingHistoryPage /></PublicLayout>} />
          <Route path="/bookings/:id" element={<PublicLayout><BookingDetailPage /></PublicLayout>} />

          {/* Admin routes */}
          <Route path="/admin" element={<DashboardLayout type="admin"><AdminDashboard /></DashboardLayout>} />
          <Route path="/admin/commissions" element={<DashboardLayout type="admin"><AdminCommissions /></DashboardLayout>} />
          <Route path="/admin/invoices" element={<DashboardLayout type="admin"><AdminInvoices /></DashboardLayout>} />
          <Route path="/admin/invoices/:id" element={<DashboardLayout type="admin"><AdminInvoiceDetail /></DashboardLayout>} />
          <Route path="/admin/promotions" element={<DashboardLayout type="admin"><AdminPromotions /></DashboardLayout>} />
          <Route path="/admin/analytics" element={<DashboardLayout type="admin"><AdminAnalytics /></DashboardLayout>} />
          <Route path="/admin/commission-payments" element={<DashboardLayout type="admin"><AdminCommissionPayments /></DashboardLayout>} />
          <Route path="/admin/commission-payments/:id" element={<DashboardLayout type="admin"><AdminCommissionPaymentDetail /></DashboardLayout>} />
          <Route path="/admin/commission-payments/create" element={<DashboardLayout type="admin"><AdminCommissionPaymentCreate /></DashboardLayout>} />
          <Route path="/admin/bookings" element={<DashboardLayout type="admin"><AdminBookings /></DashboardLayout>} />
          <Route path="/admin/bookings/:id" element={<DashboardLayout type="admin"><AdminBookingDetail /></DashboardLayout>} />
          <Route path="/admin/hotels" element={<DashboardLayout type="admin"><AdminHotels /></DashboardLayout>} />
          <Route path="/admin/hotels/:id" element={<DashboardLayout type="admin"><AdminHotelDetail /></DashboardLayout>} />
          <Route path="/admin/users" element={<DashboardLayout type="admin"><AdminUsers /></DashboardLayout>} />
          <Route path="/admin/reviews" element={<DashboardLayout type="admin"><AdminReviews /></DashboardLayout>} />
          <Route path="/admin/settings" element={<DashboardLayout type="admin"><AdminSettings /></DashboardLayout>} />

          {/* Host routes */}
          <Route path="/host" element={<DashboardLayout type="host"><HostDashboard /></DashboardLayout>} />
          <Route path="/host/properties" element={<DashboardLayout type="host"><HostProperties /></DashboardLayout>} />
          <Route path="/host/properties/add" element={<DashboardLayout type="host"><AddProperty /></DashboardLayout>} />
          <Route path="/host/properties/:id" element={<DashboardLayout type="host"><PropertyDetail /></DashboardLayout>} />
          <Route path="/host/bookings" element={<DashboardLayout type="host"><HostBookings /></DashboardLayout>} />
          <Route path="/host/analytics" element={<DashboardLayout type="host"><HostAnalytics /></DashboardLayout>} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
