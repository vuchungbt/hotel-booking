import React, { useState } from 'react';
import { AlertCircle, CreditCard, Shield, Clock } from 'lucide-react';
import { useVNPay } from '../hooks/useVNPay';
import { 
  VNPayCreateRequest, 
  VNPAY_BANK_CODES, 
  VNPayBankCode, 
  VNPAY_LANGUAGES 
} from '../types/vnpay';

interface VNPayPaymentProps {
  amount: number;
  orderInfo: string;
  bookingId?: string;
  onPaymentInitiated?: (paymentUrl: string, txnRef: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

const VNPayPayment: React.FC<VNPayPaymentProps> = ({
  amount,
  orderInfo,
  bookingId,
  onPaymentInitiated,
  onError,
  disabled = false
}) => {
  const [selectedBank, setSelectedBank] = useState<VNPayBankCode | ''>('');
  const [language, setLanguage] = useState<'vn' | 'en'>('vn');
  
  const { createPayment, isLoading, error } = useVNPay();

  // Bank options with Vietnamese names
  const bankOptions = [
    { code: '', name: 'Chọn ngân hàng (tùy chọn)', logo: '' },
    { code: 'VIETCOMBANK' as VNPayBankCode, name: 'Vietcombank', logo: '🏦' },
    { code: 'TECHCOMBANK' as VNPayBankCode, name: 'Techcombank', logo: '🏦' },
    { code: 'BIDV' as VNPayBankCode, name: 'BIDV', logo: '🏦' },
    { code: 'VIETINBANK' as VNPayBankCode, name: 'VietinBank', logo: '🏦' },
    { code: 'VPBANK' as VNPayBankCode, name: 'VPBank', logo: '🏦' },
    { code: 'MBBANK' as VNPayBankCode, name: 'MBBank', logo: '🏦' },
    { code: 'ACB' as VNPayBankCode, name: 'ACB', logo: '🏦' },
    { code: 'OCB' as VNPayBankCode, name: 'OCB', logo: '🏦' },
    { code: 'SACOMBANK' as VNPayBankCode, name: 'Sacombank', logo: '🏦' },
    { code: 'AGRIBANK' as VNPayBankCode, name: 'Agribank', logo: '🏦' },
    { code: 'VISA' as VNPayBankCode, name: 'Thẻ VISA/Mastercard', logo: '💳' }
  ];

  const handlePayment = async () => {
    const paymentData: VNPayCreateRequest = {
      amount,
      orderInfo,
      bankCode: selectedBank || undefined,
      language,
      bookingId
    };

    console.log('Creating VNPay payment with data:', paymentData);
    const result = await createPayment(paymentData);
    console.log('VNPay payment result:', result);
    
    if (result) {
      console.log('Redirecting to VNPay URL:', result.paymentUrl);
      onPaymentInitiated?.(result.paymentUrl, result.txnRef);
      // Redirect to VNPay
      window.location.href = result.paymentUrl;
    } else if (error) {
      console.error('VNPay payment error:', error);
      onError?.(error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <CreditCard className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Thanh toán VNPay
          </h3>
          <p className="text-sm text-gray-600">
            Thanh toán an toàn qua cổng VNPay
          </p>
        </div>
      </div>

      {/* Payment Amount */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Số tiền thanh toán:</span>
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(amount)}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {orderInfo}
        </div>
      </div>

      {/* Bank Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn ngân hàng (tùy chọn)
        </label>
        <select
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value as VNPayBankCode | '')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled || isLoading}
        >
          {bankOptions.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.logo} {bank.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Nếu không chọn, bạn có thể chọn ngân hàng trên trang VNPay
        </p>
      </div>

      {/* Language Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ngôn ngữ
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="vn"
              checked={language === 'vn'}
              onChange={(e) => setLanguage(e.target.value as 'vn' | 'en')}
              className="mr-2"
              disabled={disabled || isLoading}
            />
            Tiếng Việt
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="en"
              checked={language === 'en'}
              onChange={(e) => setLanguage(e.target.value as 'vn' | 'en')}
              className="mr-2"
              disabled={disabled || isLoading}
            />
            English
          </label>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-green-800 mb-1">
              Thanh toán an toàn & bảo mật
            </div>
            <ul className="text-green-700 space-y-1">
              <li>• Được bảo vệ bởi SSL 256-bit</li>
              <li>• Tuân thủ chuẩn bảo mật PCI DSS</li>
              <li>• Không lưu trữ thông tin thẻ</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">Lưu ý quan trọng:</div>
            <ul className="space-y-1">
              <li>• Phiên thanh toán có hiệu lực trong 15 phút</li>
              <li>• Sau khi thanh toán thành công, booking sẽ được xác nhận tự động</li>
              <li>• Vui lòng không đóng trình duyệt trong quá trình thanh toán</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div className="text-sm text-red-800">
              <div className="font-medium">Có lỗi xảy ra:</div>
              <div>{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={disabled || isLoading || amount <= 0}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          disabled || isLoading || amount <= 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Đang xử lý...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Thanh toán {formatCurrency(amount)}</span>
          </div>
        )}
      </button>

      {/* Support Info */}
      <div className="text-center text-sm text-gray-500 mt-4">
        Hỗ trợ 24/7: <span className="text-blue-600">1900 6666</span>
      </div>
    </div>
  );
};

export default VNPayPayment; 