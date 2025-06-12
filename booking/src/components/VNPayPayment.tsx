import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

interface VNPayPaymentProps {
  amount: number;
  orderInfo: string;
  bookingId?: string;
  onPaymentInitiated: (paymentUrl: string, txnRef: string) => void;
  onError: (error: string) => void;
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
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payment/vnpay/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          orderInfo,
          bookingId,
          language: 'vn'
        }),
      });

      const data = await response.json();
      
      if (data.code === 1000) {
        onPaymentInitiated(data.data.paymentUrl, data.data.txnRef);
        // Redirect to VNPay
        window.location.href = data.data.paymentUrl;
      } else {
        onError(data.message || 'Tạo thanh toán thất bại');
      }
    } catch (error) {
      onError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-4">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <h4 className="font-medium text-gray-900">Thanh toán VNPay</h4>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          Bạn sẽ được chuyển đến trang thanh toán VNPay để hoàn tất giao dịch.
        </div>

        <button
          onClick={handlePayment}
          disabled={disabled || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <span>Thanh toán ngay</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default VNPayPayment; 