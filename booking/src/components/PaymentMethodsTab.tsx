import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Plus, Edit, Trash2, Star, Check, AlertCircle, 
  Shield, Eye, EyeOff, Copy 
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface PaymentMethod {
  id: string;
  type: 'VNPAY' | 'BANK_CARD' | 'BANK_ACCOUNT';
  name: string;
  maskedNumber: string;
  bankName?: string;
  isDefault: boolean;
  expiryDate?: string;
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
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
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
        type: 'BANK_CARD',
        name: 'Visa',
        maskedNumber: '**** **** **** 1234',
        bankName: 'Vietcombank',
        isDefault: false,
        expiryDate: '12/26',
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
      case 'BANK_CARD':
        return <CreditCard className="h-6 w-6 text-green-600" />;
      case 'BANK_ACCOUNT':
        return <CreditCard className="h-6 w-6 text-purple-600" />;
      default:
        return <CreditCard className="h-6 w-6 text-gray-600" />;
    }
  };

  const getPaymentMethodColor = (type: string) => {
    switch (type) {
      case 'VNPAY':
        return 'border-blue-200 bg-blue-50';
      case 'BANK_CARD':
        return 'border-green-200 bg-green-50';
      case 'BANK_ACCOUNT':
        return 'border-purple-200 bg-purple-50';
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
    const [formData, setFormData] = useState({
      type: 'VNPAY' as const,
      name: '',
      accountInfo: '',
      bankName: '',
      expiryMonth: '',
      expiryYear: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        // Simulate API call
        const newMethod: PaymentMethod = {
          id: Date.now().toString(),
          type: formData.type,
          name: formData.name || (formData.type === 'VNPAY' ? 'VNPay Wallet' : 'Bank Card'),
          maskedNumber: formData.type === 'VNPAY' 
            ? `***${formData.accountInfo.slice(-10)}` 
            : `**** **** **** ${formData.accountInfo.slice(-4)}`,
          bankName: formData.bankName || undefined,
          isDefault: paymentMethods.length === 0,
          expiryDate: formData.expiryMonth && formData.expiryYear 
            ? `${formData.expiryMonth}/${formData.expiryYear}` 
            : undefined,
          createdAt: new Date().toISOString().split('T')[0]
        };

        setPaymentMethods(prev => [...prev, newMethod]);
        setShowAddForm(false);
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
              <option value="VNPAY">VNPay Wallet</option>
              <option value="BANK_CARD">Thẻ ngân hàng</option>
              <option value="BANK_ACCOUNT">Tài khoản ngân hàng</option>
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
              placeholder={`Ví dụ: ${formData.type === 'VNPAY' ? 'VNPay chính' : 'Thẻ Vietcombank'}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.type === 'VNPAY' ? 'Email/Số điện thoại' : 'Số thẻ/tài khoản'}
            </label>
            <input
              type="text"
              value={formData.accountInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, accountInfo: e.target.value }))}
              placeholder={formData.type === 'VNPAY' ? 'user@email.com hoặc 0901234567' : '1234 5678 9012 3456'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {formData.type !== 'VNPAY' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngân hàng
                </label>
                <select
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Chọn ngân hàng</option>
                  <option value="Vietcombank">Vietcombank</option>
                  <option value="VietinBank">VietinBank</option>
                  <option value="BIDV">BIDV</option>
                  <option value="Agribank">Agribank</option>
                  <option value="ACB">ACB</option>
                  <option value="Techcombank">Techcombank</option>
                  <option value="MB Bank">MB Bank</option>
                  <option value="VPBank">VPBank</option>
                </select>
              </div>

              {formData.type === 'BANK_CARD' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tháng hết hạn
                    </label>
                    <select
                      value={formData.expiryMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Năm hết hạn
                    </label>
                    <select
                      value={formData.expiryYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryYear: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">YY</option>
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                          {String(new Date().getFullYear() + i).slice(-2)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
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
            Quản lý các phương thức thanh toán để đặt phòng nhanh chóng
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

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-blue-800 mb-1">
              Bảo mật thông tin thanh toán
            </div>
            <div className="text-blue-700">
              <p>Tất cả thông tin thanh toán được mã hóa và bảo vệ theo tiêu chuẩn PCI DSS. 
              Chúng tôi không lưu trữ thông tin thẻ đầy đủ trên hệ thống.</p>
            </div>
          </div>
        </div>
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
                      {method.bankName && ` • ${method.bankName}`}
                      {method.expiryDate && ` • Hết hạn ${method.expiryDate}`}
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
                    onClick={() => setEditingMethod(method)}
                    disabled={loading}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
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

      {/* Usage Statistics */}
      {paymentMethods.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Thống kê sử dụng</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{paymentMethods.length}</div>
              <div className="text-gray-600">Phương thức</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {paymentMethods.filter(m => m.type === 'VNPAY').length}
              </div>
              <div className="text-gray-600">VNPay</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {paymentMethods.filter(m => m.type !== 'VNPAY').length}
              </div>
              <div className="text-gray-600">Thẻ/Tài khoản</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsTab; 