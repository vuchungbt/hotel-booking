// VNPay Request Types
export interface VNPayCreateRequest {
  amount: number;
  orderInfo: string;
  bankCode?: string;
  language?: string;
  bookingId?: string;
}

// VNPay Response Types
export interface VNPayCreateResponse {
  code: string;
  message: string;
  paymentUrl: string;
  txnRef: string;
}

export interface VNPayCallbackResponse {
  rspCode: string;
  message: string;
}

export interface PaymentStatusResponse {
  txnRef: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'REFUND_PENDING' | 'NO_PAYMENT' | 'CANCELLED';
  amount: number;
  responseCode?: string;
  transactionNo?: string;
  payDate?: string;
  callbackReceived?: boolean;
  bookingId?: string;
  bookingStatus?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED_BY_GUEST' | 'CANCELLED_BY_HOST';
}

// VNPay Return Types
export interface VNPayReturnResult {
  txnRef: string;
  responseCode: string;
  success: boolean;
  message: string;
  amount?: number;
  orderInfo?: string;
  bookingId?: string;
}

// VNPay API Response Types
export interface VNPayApiResponse<T> {
  code: number;
  success: boolean;
  message: string;
  result: T;
}

// VNPay Error Types
export interface VNPayError {
  code: string;
  message: string;
  details?: string;
}

// VNPay Bank Codes
export const VNPAY_BANK_CODES = {
  NCB: 'NCB',
  AGRIBANK: 'AGRIBANK', 
  SCB: 'SCB',
  SACOMBANK: 'SACOMBANK',
  EXIMBANK: 'EXIMBANK',
  MSBANK: 'MSBANK',
  NAMABANK: 'NAMABANK',
  VNMART: 'VNMART',
  VIETINBANK: 'VIETINBANK',
  VIETCOMBANK: 'VIETCOMBANK',
  HDBANK: 'HDBANK',
  DONGABANK: 'DONGABANK',
  TPBANK: 'TPBANK',
  OJB: 'OJB',
  BIDV: 'BIDV',
  TECHCOMBANK: 'TECHCOMBANK',
  VPBANK: 'VPBANK',
  MBBANK: 'MBBANK',
  ACB: 'ACB',
  OCB: 'OCB',
  IVB: 'IVB',
  VISA: 'VISA'
} as const;

export type VNPayBankCode = keyof typeof VNPAY_BANK_CODES;

// VNPay Response Codes
export const VNPAY_RESPONSE_CODES = {
  SUCCESS: '00',
  TRANSACTION_FAILED: '07',
  INVALID_SIGNATURE: '97',
  TRANSACTION_CANCELLED: '24',
  INSUFFICIENT_FUNDS: '51',
  CARD_EXPIRED: '54',
  INCORRECT_PAYMENT_INFO: '75',
  DAILY_LIMIT_EXCEEDED: '61'
} as const;

export type VNPayResponseCode = typeof VNPAY_RESPONSE_CODES[keyof typeof VNPAY_RESPONSE_CODES];

// VNPay Languages
export const VNPAY_LANGUAGES = {
  VN: 'vn',
  EN: 'en'
} as const;

export type VNPayLanguage = typeof VNPAY_LANGUAGES[keyof typeof VNPAY_LANGUAGES]; 