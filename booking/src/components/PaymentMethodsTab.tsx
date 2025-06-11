import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Plus, Edit, Trash2, Star, Check, AlertCircle, 
  Shield, Banknote 
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface PaymentMethod {
  id: string;
  type: 'VNPAY' | 'CASH_ON_CHECKIN';
  name: string;
  maskedNumber: string;
  isDefault: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface PaymentMethodsTabProps {
  userId?: string;
}

const PaymentMethodsTab: React.FC<PaymentMethodsTabProps> = ({ userId }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const { showToast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: '1',
        type: 'VNPAY',
        name: 'VNPay Wallet',
        maskedNumber: '***@gmail.com',
        isDefault: true,
        createdAt: '2024-01-15',
        lastUsed: '2024-01-20'
      },
      {
        id: '2',
        type: 'CASH_ON_CHECKIN',
        name: 'Thanh toán tiền mặt',
        maskedNumber: 'Tiền mặt khi nhận phòng',
        isDefault: false,
        createdAt: '2024-01-10',
        lastUsed: '2024-01-18'
      }
    ];
    setPaymentMethods(mockPaymentMethods);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'VNPAY':
        return <CreditCard className="h-6 w-6 text-blue-600" />;
      case 'CASH_ON_CHECKIN':
        return <Banknote className="h-6 w-6 text-green-600" />;
      default:
        return <CreditCard className="h-6 w-6 text-gray-600" />;
    }
  };

  const getPaymentMethodColor = (type: string) => {
    switch (type) {
      case 'VNPAY':
        return 'border-blue-200 bg-blue-50';
      case 'CASH_ON_CHECKIN':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleSetDefault = async (methodId: string) => {
    setLoading(true);
    try {
      // Update default payment method
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method.id === methodId
        }))
      );
      showToast('success', 'Thành công', 'Đã cập nhật phương thức thanh toán mặc định');
    } catch (error) {
      showToast('error', 'Lỗi', 'Không thể cập nhật phương thức thanh toán mặc định');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phương thức thanh toán này?')) {
      return;
    }

    setLoading(true);
    try {
      setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
      showToast('success', 'Thành công', 'Đã xóa phương thức thanh toán');
    } catch (error) {
      showToast('error', 'Lỗi', 'Không thể xóa phương thức thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const AddPaymentMethodForm = () => {
    const [formData, setFormData] = useState<{
      type: 'VNPAY' | 'CASH_ON_CHECKIN';
      name: string;
      accountInfo: string;
    }>({
      type: 'VNPAY',
      name: '',
      accountInfo: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        // Validate input for VNPay
        if (formData.type === 'VNPAY' && !formData.accountInfo.trim()) {
          showToast('error', 'Lỗi', 'Vui lòng nhập email hoặc số điện thoại');
          return;
        }

        // Simulate API call
        const newMethod: PaymentMethod = {
          id: Date.now().toString(),
          type: formData.type,
          name: formData.name || (formData.type === 'VNPAY' ? 'VNPay Wallet' : 'Thanh toán tiền mặt'),
          maskedNumber: formData.type === 'VNPAY' 
            ? `***${formData.accountInfo.slice(-10)}` 
            : 'Tiền mặt khi nhận phòng',
          isDefault: paymentMethods.length === 0,
          createdAt: new Date().toISOString().split('T')[0]
        };

        setPaymentMethods(prev => [...prev, newMethod]);
        setShowAddForm(false);
        setFormData({ type: 'VNPAY', name: '', accountInfo: '' });
        showToast('success', 'Thành công', 'Đã thêm phương thức thanh toán mới');
      } catch (error) {
        showToast('error', 'Lỗi', 'Không thể thêm phương thức thanh toán');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thêm phương thức thanh toán mới
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại phương thức
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="VNPAY">VNPay</option>
              <option value="CASH_ON_CHECKIN">Thanh toán tiền mặt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên hiển thị
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={`Ví dụ: ${formData.type === 'VNPAY' ? 'VNPay chính' : 'Tiền mặt'}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {formData.type === 'VNPAY' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email hoặc số điện thoại VNPay
              </label>
              <input
                type="text"
                value={formData.accountInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, accountInfo: e.target.value }))}
                placeholder="user@email.com hoặc 0901234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          )}

          {formData.type === 'CASH_ON_CHECKIN' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800 mb-1">
                    Lưu ý thanh toán tiền mặt
                  </div>
                  <div className="text-yellow-700">
                    <p>Phương thức này cho phép bạn thanh toán bằng tiền mặt trực tiếp tại khách sạn khi check-in.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang thêm...' : 'Thêm phương thức'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Phương thức thanh toán</h2>
          <p className="text-gray-600 mt-1">
            Quản lý phương thức thanh toán VNPay và tiền mặt
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm mới
        </button>
      </div>

      {/* Add Payment Method Form */}
      {showAddForm && <AddPaymentMethodForm />}

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có phương thức thanh toán
            </h3>
            <p className="text-gray-600 mb-4">
              Thêm phương thức thanh toán để đặt phòng nhanh chóng hơn
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm phương thức đầu tiên
            </button>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`border-2 rounded-lg p-4 transition-all ${
                method.isDefault 
                  ? `${getPaymentMethodColor(method.type)} border-opacity-50` 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getPaymentMethodIcon(method.type)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{method.name}</h4>
                      {method.isDefault && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          Mặc định
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {method.maskedNumber}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Thêm vào {formatDate(method.createdAt)}
                      {method.lastUsed && ` • Sử dụng lần cuối ${formatDate(method.lastUsed)}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      disabled={loading}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMethod(method.id)}
                    disabled={loading || method.isDefault}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Methods Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VNPay Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-1">
                VNPay - Thanh toán trực tuyến
              </div>
              <div className="text-blue-700 space-y-1">
                <p>• Thanh toán nhanh chóng và tiện lợi</p>
                <p>• Xác nhận booking ngay lập tức</p>
                <p>• Bảo mật cao với mã hóa SSL</p>
                <p>• Hỗ trợ nhiều ngân hàng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Banknote className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-green-800 mb-1">
                Tiền mặt - Thanh toán khi nhận phòng
              </div>
              <div className="text-green-700 space-y-1">
                <p>• Thanh toán trực tiếp tại khách sạn</p>
                <p>• Không cần thanh toán trước</p>
                <p>• Linh hoạt với thời gian</p>
                <p>• Không phí giao dịch</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      {paymentMethods.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Thống kê phương thức thanh toán</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{paymentMethods.length}</div>
              <div className="text-gray-600">Tổng phương thức</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {paymentMethods.filter(m => m.type === 'VNPAY').length}
              </div>
              <div className="text-gray-600">VNPay</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {paymentMethods.filter(m => m.type === 'CASH_ON_CHECKIN').length}
              </div>
              <div className="text-gray-600">Tiền mặt</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsTab; 