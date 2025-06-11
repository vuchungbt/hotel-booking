import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, RefreshCw, ArrowLeft, Receipt, AlertTriangle } from 'lucide-react';
import { vnpayAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface PaymentResult {
  success: boolean;
  bookingId?: string;
  transactionNo?: string;
  amount?: number;
  message: string;
  errorCode?: string;
  paymentUrl?: string;
  txnRef?: string;
}

const PaymentReturnPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    handlePaymentReturn();
  }, [location.search]);

  const handlePaymentReturn = async () => {
    setLoading(true);
    
    try {
      const urlParams = new URLSearchParams(location.search);
      const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
      const vnp_TxnRef = urlParams.get('vnp_TxnRef');
      const vnp_TransactionNo = urlParams.get('vnp_TransactionNo');
      const vnp_Amount = urlParams.get('vnp_Amount');

      // Get pending payment info from localStorage
      const pendingPaymentStr = localStorage.getItem('pendingPayment');
      let pendingPayment = null;
      
      if (pendingPaymentStr) {
        try {
          pendingPayment = JSON.parse(pendingPaymentStr);
        } catch (error) {
          console.error('Error parsing pending payment:', error);
        }
      }

      if (!vnp_ResponseCode || !vnp_TxnRef) {
        setPaymentResult({
          success: false,
          message: 'Thông tin thanh toán không hợp lệ. Vui lòng thử lại.',
          errorCode: 'INVALID_PARAMS'
        });
        return;
      }

      // Process VNPay return
      const response = await vnpayAPI.getReturnResult(new URLSearchParams(location.search));
      
      if (response.data.success) {
        const result: PaymentResult = {
          success: true,
          bookingId: pendingPayment?.bookingData?.id || 'unknown',
          transactionNo: vnp_TransactionNo || undefined,
          amount: vnp_Amount ? parseInt(vnp_Amount) / 100 : pendingPayment?.bookingData?.totalAmount,
          message: 'Thanh toán thành công! Đặt phòng của bạn đã được xác nhận.',
          txnRef: vnp_TxnRef || undefined
        };
        
        setPaymentResult(result);
        
        // Clear pending payment info
        localStorage.removeItem('pendingPayment');
        
        // Show success toast
        showToast('success', 'Thành công', 'Thanh toán đã được xử lý thành công!');
        
        // Create booking if payment successful and we have pending data
        if (pendingPayment?.bookingData) {
          try {
            // Here you would create the actual booking
            console.log('Creating booking with data:', pendingPayment.bookingData);
          } catch (bookingError) {
            console.error('Error creating booking:', bookingError);
          }
        }
        
      } else {
        const errorMessage = getErrorMessage(vnp_ResponseCode);
        setPaymentResult({
          success: false,
          message: errorMessage,
          errorCode: vnp_ResponseCode,
          txnRef: vnp_TxnRef || undefined
        });
        
        showToast('error', 'Thanh toán thất bại', errorMessage);
      }
      
    } catch (error: any) {
      console.error('Payment return error:', error);
      setPaymentResult({
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại.',
        errorCode: 'PROCESSING_ERROR'
      });
      
      showToast('error', 'Lỗi', 'Không thể xử lý kết quả thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (responseCode: string | null): string => {
    switch (responseCode) {
      case '00':
        return 'Giao dịch thành công';
      case '07':
        return 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).';
      case '09':
        return 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.';
      case '10':
        return 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần';
      case '11':
        return 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.';
      case '12':
        return 'Thẻ/Tài khoản của khách hàng bị khóa.';
      case '13':
        return 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.';
      case '24':
        return 'Khách hàng hủy giao dịch';
      case '51':
        return 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.';
      case '65':
        return 'Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.';
      case '75':
        return 'Ngân hàng thanh toán đang bảo trì.';
      case '79':
        return 'KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch';
      case '70':
        return 'Sai chữ ký (Signature không hợp lệ). Vui lòng liên hệ hỗ trợ kỹ thuật.';
      case '99':
        return 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)';
      default:
        return 'Giao dịch không thành công. Vui lòng thử lại sau.';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      handlePaymentReturn();
    } else {
      showToast('warning', 'Cảnh báo', 'Đã thử lại quá nhiều lần. Vui lòng liên hệ hỗ trợ.');
    }
  };

  const handleGoToBookings = () => {
    navigate('/my-bookings');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    navigate('/contact', { 
      state: { 
        subject: 'Vấn đề thanh toán',
        message: `Tôi gặp vấn đề với giao dịch: ${paymentResult?.txnRef || 'N/A'}`
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang xử lý thanh toán...</h2>
          <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-8 text-center ${
            paymentResult?.success ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="mb-4">
              {paymentResult?.success ? (
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              )}
            </div>
            
            <h1 className={`text-2xl font-bold mb-2 ${
              paymentResult?.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {paymentResult?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
            </h1>
            
            <p className={`text-lg ${
              paymentResult?.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {paymentResult?.message}
            </p>
          </div>

          {/* Payment Details */}
          <div className="px-6 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết giao dịch</h3>
            
            <div className="space-y-3">
              {paymentResult?.txnRef && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <span className="font-medium text-gray-900">{paymentResult.txnRef}</span>
                </div>
              )}
              
              {paymentResult?.transactionNo && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Mã GD Ngân hàng:</span>
                  <span className="font-medium text-gray-900">{paymentResult.transactionNo}</span>
                </div>
              )}
              
              {paymentResult?.amount && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(paymentResult.amount)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Thời gian:</span>
                <span className="font-medium text-gray-900">
                  {new Date().toLocaleString('vi-VN')}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`font-medium px-3 py-1 rounded-full text-sm ${
                  paymentResult?.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {paymentResult?.success ? 'Thành công' : 'Thất bại'}
                </span>
              </div>
            </div>
          </div>

          {/* Error Details */}
          {!paymentResult?.success && paymentResult?.errorCode && (
            <div className="px-6 pb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">
                      Thông tin lỗi
                    </h4>
                    <p className="text-yellow-700 text-sm">
                      Mã lỗi: {paymentResult.errorCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              {paymentResult?.success ? (
                <>
                  <button
                    onClick={handleGoToBookings}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Xem đặt phòng
                  </button>
                  <button
                    onClick={handleGoToHome}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Về trang chủ
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleRetry}
                    disabled={retryCount >= 3}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Thử lại ({3 - retryCount})
                  </button>
                  <button
                    onClick={handleContactSupport}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Liên hệ hỗ trợ
                  </button>
                  <button
                    onClick={handleGoToHome}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Về trang chủ
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {paymentResult?.success && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Bước tiếp theo</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Bạn sẽ nhận được email xác nhận đặt phòng trong vài phút tới</li>
              <li>• Kiểm tra thông tin booking trong mục "Đặt phòng của tôi"</li>
              <li>• Liên hệ khách sạn trực tiếp nếu cần thay đổi thông tin</li>
              <li>• Xuất trình email xác nhận khi check-in</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReturnPage; 