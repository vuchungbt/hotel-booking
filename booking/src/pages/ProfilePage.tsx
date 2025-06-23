import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Key, Save, BookOpen, Calendar, Gift, CreditCard, 
  MapPin, Clock, CheckCircle, AlertCircle, Copy, Trash2, Plus,
  Phone, Camera, Edit, Star, Eye, EyeOff, Shield, Crown, Wallet,
  DollarSign, ArrowDownLeft, ArrowUpRight, Send, Receipt
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { userAPI, ProfileUpdateRequest, PasswordUpdateRequest } from '../services/api';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [hostRequestLoading, setHostRequestLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const { user, fetchUserInfo } = useAuth();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    dateOfBirth: '',
    address: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Wallet related state
  const [walletData, setWalletData] = useState({
    balance: 0,
    transactions: [] as any[],
    bankAccount: {
      bankName: '',
      accountNumber: '',
      accountName: '',
      branch: ''
    }
  });

  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    note: ''
  });

  const [isEditingBank, setIsEditingBank] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.tel || '',
        dateOfBirth: user.dob || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      showToast('error', 'Lỗi', 'Vui lòng nhập họ và tên');
      return false;
    }
    
    if (!formData.username.trim()) {
      showToast('error', 'Lỗi', 'Vui lòng nhập tên đăng nhập');
      return false;
    }

    return true;
  };

  const validatePasswordForm = (): boolean => {
    if (!passwordData.currentPassword) {
      showToast('error', 'Error', 'Please enter current password');
      return false;
    }
    
    if (!passwordData.newPassword) {
      showToast('error', 'Error', 'Please enter new password');
      return false;
    }
    
    if (passwordData.newPassword.length < 8) {
      showToast('error', 'Error', 'New password must be at least 8 characters');
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('error', 'Error', 'Password confirmation does not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }

    setLoading(true);
    
    try {
      const updateData: ProfileUpdateRequest = {
        name: formData.name,
        username: formData.username,
        email: user.email, // Use original email (cannot be changed)
        tel: formData.phone,
        address: formData.address,
        dob: formData.dateOfBirth
      };

      await userAPI.updateMyProfile(updateData);
      
      // Refresh user info
      await fetchUserInfo();
      
      showToast('success', 'Success', 'Information has been updated successfully!');
      setIsEditing(false);
      
    } catch (error: any) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while updating information';
      showToast('error', 'Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm() || !user) {
      return;
    }

    setPasswordLoading(true);
    
    try {
      const passwordUpdateData: PasswordUpdateRequest = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };

      await userAPI.updateMyPassword(passwordUpdateData);
      
      showToast('success', 'Success', 'Password has been changed successfully!');
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error: any) {
      console.error('Update password error:', error);
      const errorMessage = error.response?.data?.message || 'An error occurred while changing password';
      showToast('error', 'Lỗi', errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.tel || '',
        dateOfBirth: user.dob || '',
        address: user.address || ''
      });
    }
    setIsEditing(false);
  };

  const handleHostRequest = async () => {
    if (!user) return;

    setHostRequestLoading(true);
    try {
      await userAPI.requestHost();
      await fetchUserInfo(); // Refresh user info
              showToast('success', 'Success', 'Host request has been sent successfully!');
    } catch (error: any) {
      console.error('Host request error:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu';
      showToast('error', 'Lỗi', errorMessage);
    } finally {
      setHostRequestLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const tabs = [
    { id: 'profile', label: 'Personal Information', icon: User },
    { id: 'password', label: 'Change Password', icon: Key }, 
    { id: 'wallet', label: 'Số dư thanh toán', icon: Wallet },
    { id: 'vouchers', label: 'Mã giảm giá', icon: Gift },
    { id: 'payment', label: 'Phương thức thanh toán', icon: CreditCard },
    { id: 'roles', label: 'Quản lý vai trò', icon: Shield }, 
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
          {user?.createAt && (
            <p className="text-sm text-gray-400">
              Thành viên từ {formatDate(user.createAt)}
            </p>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={true}
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              {user && (
                <div className="flex items-center text-sm">
                  {user.emailVerified ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Email đã được xác nhận
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Email chưa được xác nhận
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên đăng nhập *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={!isEditing}
                required
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

        <div className="flex justify-end space-x-4">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
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

  const renderPasswordTab = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Lưu ý bảo mật</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Mật khẩu mới phải có ít nhất 8 ký tự và nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu hiện tại *
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu mới *
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Xác nhận mật khẩu mới *
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            {passwordLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang cập nhật...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                Đổi mật khẩu
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderWalletTab = () => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        minimumFractionDigits: 0
      }).format(amount);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const handleBankAccountSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setWalletLoading(true);
      
      try {
        // API call to save bank account
        // await userAPI.saveBankAccount(walletData.bankAccount);
        
        showToast('success', 'Thành công', 'Thông tin tài khoản ngân hàng đã được lưu');
        setIsEditingBank(false);
      } catch (error: any) {
        console.error('Save bank account error:', error);
        showToast('error', 'Lỗi', 'Không thể lưu thông tin tài khoản ngân hàng');
      } finally {
        setWalletLoading(false);
      }
    };

    const handleWithdrawSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!withdrawalData.amount || parseFloat(withdrawalData.amount) <= 0) {
        showToast('error', 'Lỗi', 'Vui lòng nhập số tiền hợp lệ');
        return;
      }
      
      if (parseFloat(withdrawalData.amount) > walletData.balance) {
        showToast('error', 'Lỗi', 'Số dư không đủ để thực hiện giao dịch');
        return;
      }

      if (!walletData.bankAccount.accountNumber) {
        showToast('error', 'Lỗi', 'Vui lòng thêm thông tin tài khoản ngân hàng trước');
        return;
      }

      setWithdrawLoading(true);
      
      try {
        // API call to request withdrawal
        // await userAPI.requestWithdrawal({
        //   amount: parseFloat(withdrawalData.amount),
        //   note: withdrawalData.note
        // });
        
        showToast('success', 'Thành công', 'Yêu cầu rút tiền đã được gửi');
        setShowWithdrawForm(false);
        setWithdrawalData({ amount: '', note: '' });
        
        // Refresh wallet data
        // fetchWalletData();
      } catch (error: any) {
        console.error('Withdrawal request error:', error);
        showToast('error', 'Lỗi', 'Không thể gửi yêu cầu rút tiền');
      } finally {
        setWithdrawLoading(false);
      }
    };

    // Sample data - replace with API call
    const sampleTransactions = [
      {
        id: 'TXN-001',
        type: 'refund',
        amount: 500000,
        description: 'Hoàn tiền booking #BK-123',
        status: 'completed',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'TXN-002',
        type: 'withdrawal',
        amount: -200000,
        description: 'Rút tiền về tài khoản VCB',
        status: 'pending',
        createdAt: '2024-01-12T14:20:00Z'
      },
      {
        id: 'TXN-003',
        type: 'refund',
        amount: 750000,
        description: 'Hoàn tiền booking #BK-098',
        status: 'completed',
        createdAt: '2024-01-10T09:15:00Z'
      }
    ];

    return (
      <div className="space-y-6">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Số dư hiện tại</p>
                <p className="text-3xl font-bold">{formatCurrency(walletData.balance || 1050000)}</p>
                <p className="text-blue-100 text-xs mt-1">Có thể rút: {formatCurrency(walletData.balance || 1050000)}</p>
              </div>
              <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
                <Wallet size={32} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin tài khoản</h3>
              <button
                onClick={() => setIsEditingBank(true)}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                <Edit size={16} />
              </button>
            </div>
            
            {walletData.bankAccount.accountNumber ? (
              <div className="space-y-2">
                <p className="text-sm"><strong>Ngân hàng:</strong> {walletData.bankAccount.bankName || 'Vietcombank'}</p>
                <p className="text-sm"><strong>Số tài khoản:</strong> {walletData.bankAccount.accountNumber || '****1234'}</p>
                <p className="text-sm"><strong>Chủ tài khoản:</strong> {walletData.bankAccount.accountName || user?.name}</p>
                <p className="text-sm"><strong>Chi nhánh:</strong> {walletData.bankAccount.branch || 'TP. Hồ Chí Minh'}</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-3">Chưa có thông tin tài khoản ngân hàng</p>
                <button
                  onClick={() => setIsEditingBank(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Thêm tài khoản
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setShowWithdrawForm(true)}
            disabled={!walletData.bankAccount.accountNumber && walletData.balance === 0}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send size={20} className="mr-2" />
            Yêu cầu rút tiền
          </button>
        </div>

        {/* Bank Account Form Modal */}
        {isEditingBank && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Thông tin tài khoản ngân hàng</h3>
              <form onSubmit={handleBankAccountSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên ngân hàng</label>
                  <select
                    value={walletData.bankAccount.bankName}
                    onChange={(e) => setWalletData(prev => ({
                      ...prev,
                      bankAccount: { ...prev.bankAccount, bankName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Chọn ngân hàng</option>
                    <option value="Vietcombank">Vietcombank</option>
                    <option value="BIDV">BIDV</option>
                    <option value="VietinBank">VietinBank</option>
                    <option value="Agribank">Agribank</option>
                    <option value="Techcombank">Techcombank</option>
                    <option value="MB Bank">MB Bank</option>
                    <option value="VPBank">VPBank</option>
                    <option value="ACB">ACB</option>
                    <option value="Sacombank">Sacombank</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
                  <input
                    type="text"
                    value={walletData.bankAccount.accountNumber}
                    onChange={(e) => setWalletData(prev => ({
                      ...prev,
                      bankAccount: { ...prev.bankAccount, accountNumber: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ tài khoản</label>
                  <input
                    type="text"
                    value={walletData.bankAccount.accountName}
                    onChange={(e) => setWalletData(prev => ({
                      ...prev,
                      bankAccount: { ...prev.bankAccount, accountName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh</label>
                  <input
                    type="text"
                    value={walletData.bankAccount.branch}
                    onChange={(e) => setWalletData(prev => ({
                      ...prev,
                      bankAccount: { ...prev.bankAccount, branch: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingBank(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={walletLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {walletLoading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Withdrawal Form Modal */}
        {showWithdrawForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Yêu cầu rút tiền</h3>
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền rút</label>
                  <input
                    type="number"
                    value={withdrawalData.amount}
                    onChange={(e) => setWithdrawalData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập số tiền"
                    min="10000"
                    max={walletData.balance || 1050000}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Số dư khả dụng: {formatCurrency(walletData.balance || 1050000)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tùy chọn)</label>
                  <textarea
                    value={withdrawalData.note}
                    onChange={(e) => setWithdrawalData(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Nhập ghi chú cho giao dịch..."
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Thông tin chuyển khoản:</strong><br/>
                    {walletData.bankAccount.bankName || 'Vietcombank'} - {walletData.bankAccount.accountNumber || '****1234'}<br/>
                    {walletData.bankAccount.accountName || user?.name}
                  </p>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={withdrawLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {withdrawLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Receipt size={20} className="mr-2" />
            Lịch sử giao dịch
          </h3>
          
          <div className="space-y-3">
            {sampleTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'refund' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {transaction.type === 'refund' ? (
                      <ArrowDownLeft size={16} className="text-green-600" />
                    ) : (
                      <ArrowUpRight size={16} className="text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : transaction.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status === 'completed' ? 'Hoàn thành' : 
                     transaction.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {sampleTransactions.length === 0 && (
            <div className="text-center py-8">
              <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Chưa có giao dịch nào</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRolesTab = () => {
    // Get user's current role
    const userRole = user?.roles && user.roles.length > 0 ? user.roles[0].name : null;
    const hasHostRole = userRole === 'HOST';
    const hasAdminRole = userRole === 'ADMIN';
    
    return (
      <div className="space-y-6">
        {/* Current Roles */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-600" />
            Vai trò hiện tại
          </h3>
          
          <div className="space-y-3">
            {user?.roles && user.roles.length > 0 ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    user.roles[0].name === 'ADMIN' ? 'bg-red-500' :
                    user.roles[0].name === 'HOST' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <span className="font-medium text-gray-900">
                      {user.roles[0].name === 'ADMIN' ? 'Administrator' :
                       user.roles[0].name === 'HOST' ? 'Hotel Owner' :
                       user.roles[0].name === 'USER' ? 'Người dùng' : user.roles[0].name}
                    </span>
                    <p className="text-sm text-gray-500">{user.roles[0].description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.roles[0].name === 'ADMIN' ? 'bg-red-100 text-red-800' :
                  user.roles[0].name === 'HOST' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  Đã kích hoạt
                </span>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Chưa có vai trò nào được gán</p>
            )}
          </div>
        </div>

        {/* Role Permissions Info */}
        {userRole && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Quyền hạn của vai trò {userRole}
            </h3>
            
            <div className="space-y-3">
              {userRole === 'ADMIN' && (
                <div className="text-gray-700">
                  <h4 className="font-medium mb-2 text-red-600">Quyền Administrator (Toàn quyền):</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Quản lý tất cả người dùng và phân quyền</li>
                    <li>Quản lý tất cả khách sạn và phòng</li>
                    <li>Xem và quản lý tất cả booking</li>
                    <li>Quản lý hệ thống và cài đặt</li>
                    <li>Xem báo cáo và thống kê toàn hệ thống</li>
                    <li>Tất cả quyền của HOST và USER</li>
                  </ul>
                </div>
              )}
              
              {userRole === 'HOST' && (
                <div className="text-gray-700">
                  <h4 className="font-medium mb-2 text-green-600">Quyền Hotel Owner:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Đăng tải và quản lý khách sạn của bạn</li>
                    <li>Tạo và quản lý các loại phòng</li>
                    <li>Nhận và quản lý booking từ khách hàng</li>
                    <li>Xem thống kê doanh thu và báo cáo</li>
                    <li>Nhận hoa hồng từ mỗi booking thành công</li>
                    <li>Tất cả quyền của USER</li>
                  </ul>
                </div>
              )}
              
              {userRole === 'USER' && (
                <div className="text-gray-700">
                  <h4 className="font-medium mb-2 text-blue-600">Quyền User:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Tìm kiếm và đặt phòng khách sạn</li>
                    <li>Quản lý booking cá nhân</li>
                    <li>Viết và quản lý đánh giá</li>
                    <li>Cập nhật thông tin cá nhân</li>
                    <li>Sử dụng voucher giảm giá</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Host Request Section */}
        {!hasHostRole && !hasAdminRole && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Crown className="h-5 w-5 mr-2 text-amber-600" />
              Become a Host
            </h3>
            
            <div className="space-y-4">
              <div className="text-gray-700">
                <h4 className="font-medium mb-2">Benefits of becoming a Host:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Upload and manage your own hotels</li>
                  <li>Receive and manage bookings from customers</li>
                  <li>Tạo và quản lý các loại phòng khác nhau</li>
                  <li>Xem thống kê doanh thu và báo cáo chi tiết</li>
                  <li>Nhận hoa hồng từ mỗi booking thành công</li>
                </ul>
              </div>

              <div className="border-t border-blue-200 pt-4">
                {user?.hostRequested ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-amber-600">
                      <Clock className="h-5 w-5 mr-2" />
                      <span className="font-medium">Yêu cầu đang chờ phê duyệt</span>
                    </div>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                      Chờ duyệt
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleHostRequest}
                    disabled={hostRequestLoading}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    {hostRequestLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Đang gửi yêu cầu...
                      </>
                    ) : (
                      <>
                        <Crown className="h-5 w-5 mr-2" />
                        Send Host Request
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin Role Info */}
        {hasAdminRole && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-600" />
              Quyền Quản trị viên
            </h3>
            <p className="text-gray-700">
              Bạn có quyền quản trị toàn bộ hệ thống. Vui lòng sử dụng quyền này một cách có trách nhiệm.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderOtherTabs = () => (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <BookOpen size={48} className="mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Tính năng đang phát triển</h3>
      <p className="text-gray-500">Tab này sẽ được hoàn thiện trong phiên bản tiếp theo.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tài khoản của tôi</h1>
                      <p className="text-gray-600 mt-2">Manage your personal information and activities</p>
        </div>

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
            {activeTab === 'password' && renderPasswordTab()}
            {activeTab === 'wallet' && renderWalletTab()}
            {activeTab === 'roles' && renderRolesTab()}
            {activeTab !== 'profile' && activeTab !== 'password' && activeTab !== 'wallet' && activeTab !== 'roles' && renderOtherTabs()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 