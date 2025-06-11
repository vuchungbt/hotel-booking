import React, { useState } from 'react';
import { CreditCard, Banknote, Check, Shield, AlertCircle } from 'lucide-react';
import VNPayPayment from './VNPayPayment';

interface PaymentMethodSelectorProps {
  amount: number;
  orderInfo: string;
  bookingId?: string;
  selectedMethod: 'CASH_ON_CHECKIN' | 'VNPAY';
  onMethodChange: (method: 'CASH_ON_CHECKIN' | 'VNPAY') => void;
  onVNPayInitiated?: (paymentUrl: string, txnRef: string) => void;
  disabled?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  orderInfo,
  bookingId,
  selectedMethod,
  onMethodChange,
  onVNPayInitiated,
  disabled = false
}) => {
  const [showVNPayForm, setShowVNPayForm] = useState(false);

  const paymentMethods = [
    {
      id: 'CASH_ON_CHECKIN' as const,
      name: 'Thanh toán khi nhận phòng',
      description: 'Thanh toán bằng tiền mặt khi check-in tại khách sạn',
      icon: Banknote,
      color: 'green',
      available: true,
      pros: [
        'Không cần thanh toán trước',
        'Linh hoạt với thời gian thanh toán',
        'Không phí giao dịch'
      ],
      cons: [
        'Cần chuẩn bị tiền mặt',
        'Có thể hủy phòng nếu không thanh toán'
      ]
    },
    {
      id: 'VNPAY' as const,
      name: 'VNPay',
      description: 'Thanh toán online qua ví điện tử VNPay',
      icon: CreditCard,
      color: 'blue',
      available: true,
      pros: [
        'Thanh toán nhanh chóng, tiện lợi',
        'Xác nhận booking ngay lập tức',
        'Bảo mật cao với công nghệ mã hóa',
        'Hỗ trợ nhiều ngân hàng'
      ],
      cons: [
        'Cần có tài khoản ngân hàng/thẻ',
        'Phí giao dịch (nếu có)'
      ]
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleMethodSelect = (methodId: 'CASH_ON_CHECKIN' | 'VNPAY') => {
    onMethodChange(methodId);
    if (methodId === 'VNPAY') {
      setShowVNPayForm(true);
    } else {
      setShowVNPayForm(false);
    }
  };

  const handleVNPayPaymentInitiated = (paymentUrl: string, txnRef: string) => {
    onVNPayInitiated?.(paymentUrl, txnRef);
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Chọn phương thức thanh toán
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            const colorClasses = {
              green: {
                border: isSelected ? 'border-green-500' : 'border-gray-200',
                bg: isSelected ? 'bg-green-50' : 'bg-white',
                icon: isSelected ? 'text-green-600' : 'text-gray-400',
                check: 'text-green-600'
              },
              blue: {
                border: isSelected ? 'border-blue-500' : 'border-gray-200',
                bg: isSelected ? 'bg-blue-50' : 'bg-white',
                icon: isSelected ? 'text-blue-600' : 'text-gray-400',
                check: 'text-blue-600'
              }
            };
            
            const colors = colorClasses[method.color as keyof typeof colorClasses];

            return (
              <div
                key={method.id}
                className={`relative border-2 rounded-lg transition-all ${
                  disabled 
                    ? 'cursor-not-allowed opacity-60' 
                    : `cursor-pointer hover:border-gray-300 ${colors.border}`
                } ${colors.bg}`}
                onClick={() => !disabled && method.available && handleMethodSelect(method.id)}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <Icon className={`h-6 w-6 mt-1 ${colors.icon}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{method.name}</h4>
                        {isSelected && (
                          <Check className={`h-5 w-5 ${colors.check}`} />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                      
                      {/* Pros and Cons */}
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="font-medium text-green-700 mb-1">Ưu điểm:</div>
                          <ul className="space-y-1">
                            {method.pros.map((pro, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-1">•</span>
                                <span className="text-gray-600">{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <div className="font-medium text-orange-700 mb-1">Lưu ý:</div>
                          <ul className="space-y-1">
                            {method.cons.map((con, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-orange-500 mr-1">•</span>
                                <span className="text-gray-600">{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className={`absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] ${
                    method.color === 'green' ? 'border-t-green-500' : 'border-t-blue-500'
                  }`}>
                    <Check className="absolute -top-[18px] -right-[15px] h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">Tổng số tiền thanh toán</div>
            <div className="text-sm text-gray-600">{orderInfo}</div>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(amount)}
          </div>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-blue-800 mb-1">
              Thanh toán an toàn & bảo mật
            </div>
            <div className="text-blue-700">
              {selectedMethod === 'VNPAY' ? (
                <p>VNPay sử dụng công nghệ mã hóa SSL 256-bit và tuân thủ chuẩn bảo mật PCI DSS để đảm bảo thông tin thanh toán của bạn được bảo vệ tuyệt đối.</p>
              ) : (
                <p>Thanh toán trực tiếp tại khách sạn giúp bạn linh hoạt và không cần lo lắng về bảo mật thông tin trực tuyến.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VNPay Payment Form */}
      {selectedMethod === 'VNPAY' && showVNPayForm && (
        <div className="space-y-4">
          <div className="border-t pt-6">
            <VNPayPayment
              amount={amount}
              orderInfo={orderInfo}
              bookingId={bookingId}
              onPaymentInitiated={handleVNPayPaymentInitiated}
              onError={(error) => {
                console.error('VNPay payment error:', error);
              }}
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {/* Cash Payment Info */}
      {selectedMethod === 'CASH_ON_CHECKIN' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-green-800 mb-1">
                Lưu ý về thanh toán tiền mặt
              </div>
              <div className="text-green-700 space-y-1">
                <p>• Vui lòng chuẩn bị đúng số tiền {formatCurrency(amount)} khi check-in</p>
                <p>• Khách sạn có quyền hủy booking nếu không thanh toán đúng hạn</p>
                <p>• Bạn có thể thanh toán bằng tiền mặt hoặc thẻ tại khách sạn</p>
                <p>• Booking sẽ được xác nhận sau khi thanh toán thành công</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector; 