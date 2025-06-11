import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertTriangle, Home, FileText } from 'lucide-react';
import { useVNPay } from '../hooks/useVNPay';
import { VNPayReturnResult, VNPAY_RESPONSE_CODES } from '../types/vnpay';

const VNPayReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState<VNPayReturnResult | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'checking' | 'completed'>('processing');
  
  const { processReturnUrl, checkPaymentStatus, error } = useVNPay();

  useEffect(() => {
    // Process the return URL parameters
    const returnResult = processReturnUrl(searchParams);
    setResult(returnResult);
    
    if (returnResult?.txnRef) {
      // Check payment status from backend
      setPaymentStatus('checking');
      checkPaymentStatus(returnResult.txnRef).then(() => {
        setPaymentStatus('completed');
      }).catch(() => {
        setPaymentStatus('completed'); // Still complete the flow even if status check fails
      });
    } else {
      setPaymentStatus('completed');
    }
  }, [searchParams, processReturnUrl, checkPaymentStatus]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusIcon = () => {
    if (paymentStatus === 'processing' || paymentStatus === 'checking') {
      return <Clock className="h-16 w-16 text-blue-500 animate-pulse" />;
    }
    
    if (result?.success) {
      return <CheckCircle className="h-16 w-16 text-green-500" />;
    } else {
      return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    if (paymentStatus === 'processing' || paymentStatus === 'checking') {
      return 'text-blue-600';
    }
    return result?.success ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBg = () => {
    if (paymentStatus === 'processing' || paymentStatus === 'checking') {
      return 'bg-blue-50 border-blue-200';
    }
    return result?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  const getDetailedMessage = () => {
    if (paymentStatus === 'processing') {
      return 'Đang xử lý thông tin thanh toán...';
    }
    
    if (paymentStatus === 'checking') {
      return 'Đang kiểm tra trạng thái thanh toán...';
    }

    if (!result) {
      return 'Có lỗi xảy ra khi xử lý thông tin thanh toán';
    }

    return result.message;
  };

  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Đang xử lý thanh toán
          </h2>
          <p className="text-gray-600">
            Vui lòng đợi trong giây lát...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
        {/* Status Icon */}
        <div className="text-center mb-6">
          {getStatusIcon()}
        </div>

        {/* Main Status */}
        <div className="text-center mb-6">
          <h1 className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
            {result?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>
          <p className="text-gray-600">
            {getDetailedMessage()}
          </p>
        </div>

        {/* Payment Details */}
        {result && (
          <div className={`border rounded-lg p-4 mb-6 ${getStatusBg()}`}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Mã giao dịch:
                </span>
                <span className="text-sm font-mono text-gray-900">
                  {result.txnRef}
                </span>
              </div>
              
              {result.amount && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Số tiền:
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(result.amount)}
                  </span>
                </div>
              )}
              
              {result.orderInfo && (
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-700">
                    Nội dung:
                  </span>
                  <span className="text-sm text-gray-900 text-right max-w-xs">
                    {result.orderInfo}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Mã phản hồi:
                </span>
                <span className="text-sm font-mono text-gray-900">
                  {result.responseCode}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Success Actions */}
        {result?.success && (
          <div className="space-y-3 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <div className="font-medium mb-1">Thanh toán hoàn tất</div>
                  <div>Booking của bạn đã được xác nhận. Bạn sẽ nhận được email xác nhận trong vài phút tới.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Info */}
        {!result?.success && result?.responseCode && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="text-sm text-orange-800">
                <div className="font-medium mb-1">Thông tin lỗi</div>
                <div>
                  {result.responseCode === VNPAY_RESPONSE_CODES.TRANSACTION_CANCELLED && 
                    'Giao dịch đã bị hủy bởi người dùng'}
                  {result.responseCode === VNPAY_RESPONSE_CODES.INSUFFICIENT_FUNDS && 
                    'Số dư tài khoản không đủ để thực hiện giao dịch'}
                  {result.responseCode === VNPAY_RESPONSE_CODES.CARD_EXPIRED && 
                    'Thẻ đã hết hạn sử dụng'}
                  {result.responseCode === VNPAY_RESPONSE_CODES.INCORRECT_PAYMENT_INFO && 
                    'Thông tin thanh toán không chính xác'}
                  {result.responseCode === VNPAY_RESPONSE_CODES.DAILY_LIMIT_EXCEEDED && 
                    'Vượt quá hạn mức giao dịch trong ngày'}
                  {result.responseCode === VNPAY_RESPONSE_CODES.INVALID_SIGNATURE && 
                    'Lỗi xác thực thông tin'}
                  {!Object.values(VNPAY_RESPONSE_CODES).includes(result.responseCode as any) && 
                    'Giao dịch thất bại với mã lỗi: ' + result.responseCode}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error from processing */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <div className="font-medium mb-1">Lỗi xử lý</div>
                <div>{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {result?.success ? (
            <>
              {result.bookingId && (
                <Link
                  to={`/bookings/${result.bookingId}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <FileText className="h-5 w-5" />
                  <span>Xem chi tiết booking</span>
                </Link>
              )}
              <Link
                to="/"
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Về trang chủ</span>
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Thử lại thanh toán
              </button>
              <Link
                to="/"
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="h-5 w-5" />
                <span>Về trang chủ</span>
              </Link>
            </>
          )}
        </div>

        {/* Support Info */}
        <div className="text-center text-sm text-gray-500 mt-6 pt-4 border-t border-gray-200">
          Cần hỗ trợ? Liên hệ: <span className="text-blue-600">1900 6666</span>
          <br />
          Email: <span className="text-blue-600">support@booking.com</span>
        </div>
      </div>
    </div>
  );
};

export default VNPayReturn; 