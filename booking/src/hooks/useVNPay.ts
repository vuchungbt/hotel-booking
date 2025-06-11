import { useState, useCallback } from 'react';
import { vnpayAPI } from '../services/api';
import { 
  VNPayCreateRequest, 
  VNPayCreateResponse, 
  PaymentStatusResponse,
  VNPayReturnResult,
  VNPAY_RESPONSE_CODES 
} from '../types/vnpay';

interface UseVNPayReturn {
  // States
  isLoading: boolean;
  error: string | null;
  paymentUrl: string | null;
  paymentStatus: PaymentStatusResponse | null;
  
  // Actions
  createPayment: (data: VNPayCreateRequest) => Promise<VNPayCreateResponse | null>;
  checkPaymentStatus: (txnRef: string) => Promise<PaymentStatusResponse | null>;
  processReturnUrl: (urlParams: URLSearchParams) => VNPayReturnResult | null;
  reset: () => void;
}

export const useVNPay = (): UseVNPayReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);

  const createPayment = useCallback(async (data: VNPayCreateRequest): Promise<VNPayCreateResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await vnpayAPI.createPayment(data);
      
      if (response.data.success) {
        const result = response.data.result;
        setPaymentUrl(result.paymentUrl);
        return result;
      } else {
        setError(response.data.message || 'Tạo thanh toán thất bại');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkPaymentStatus = useCallback(async (txnRef: string): Promise<PaymentStatusResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await vnpayAPI.getPaymentStatus(txnRef);
      
      if (response.data.success) {
        const result = response.data.result;
        setPaymentStatus(result);
        return result;
      } else {
        setError(response.data.message || 'Không thể lấy trạng thái thanh toán');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi kiểm tra trạng thái thanh toán';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processReturnUrl = useCallback((urlParams: URLSearchParams): VNPayReturnResult | null => {
    try {
      const txnRef = urlParams.get('vnp_TxnRef');
      const responseCode = urlParams.get('vnp_ResponseCode');
      const amount = urlParams.get('vnp_Amount');
      const orderInfo = urlParams.get('vnp_OrderInfo');
      
      if (!txnRef || !responseCode) {
        setError('Thông tin trả về từ VNPay không hợp lệ');
        return null;
      }

      const success = responseCode === VNPAY_RESPONSE_CODES.SUCCESS;
      let message = '';
      
      switch (responseCode) {
        case VNPAY_RESPONSE_CODES.SUCCESS:
          message = 'Thanh toán thành công';
          break;
        case VNPAY_RESPONSE_CODES.TRANSACTION_CANCELLED:
          message = 'Giao dịch đã bị hủy';
          break;
        case VNPAY_RESPONSE_CODES.INSUFFICIENT_FUNDS:
          message = 'Số dư tài khoản không đủ';
          break;
        case VNPAY_RESPONSE_CODES.CARD_EXPIRED:
          message = 'Thẻ đã hết hạn';
          break;
        case VNPAY_RESPONSE_CODES.INCORRECT_PAYMENT_INFO:
          message = 'Thông tin thanh toán không chính xác';
          break;
        case VNPAY_RESPONSE_CODES.DAILY_LIMIT_EXCEEDED:
          message = 'Vượt quá hạn mức giao dịch hàng ngày';
          break;
        default:
          message = 'Thanh toán thất bại';
      }

      const result: VNPayReturnResult = {
        txnRef,
        responseCode,
        success,
        message,
        amount: amount ? parseInt(amount) / 100 : undefined, // Convert from đồng back to VND
        orderInfo: orderInfo || undefined
      };

      if (!success) {
        setError(message);
      }

      return result;
    } catch (err) {
      setError('Có lỗi xảy ra khi xử lý kết quả thanh toán');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setPaymentUrl(null);
    setPaymentStatus(null);
  }, []);

  return {
    // States
    isLoading,
    error,
    paymentUrl,
    paymentStatus,
    
    // Actions
    createPayment,
    checkPaymentStatus,
    processReturnUrl,
    reset
  };
}; 