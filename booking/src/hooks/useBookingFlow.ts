import { useState, useCallback } from 'react';
import { BookingCreateRequest } from '../services/api';

export interface BookingFlowStep {
  step: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  isValid?: boolean;
}

export interface BookingFlowState {
  currentStep: number;
  formData: Partial<BookingCreateRequest>;
  errors: Record<string, string>;
  touchedFields: Record<string, boolean>;
  isLoading: boolean;
}

export interface BookingFlowActions {
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: <K extends keyof BookingCreateRequest>(field: K, value: BookingCreateRequest[K]) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  setTouched: (field: string, touched?: boolean) => void;
  setLoading: (loading: boolean) => void;
  validateStep: (step: number) => boolean;
  resetForm: () => void;
}

const initialFormData: Partial<BookingCreateRequest> = {
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  paymentMethod: 'CREDIT_CARD',
  specialRequests: ''
};

const totalSteps = 4;

export const useBookingFlow = (
  initialData?: Partial<BookingCreateRequest>
): [BookingFlowState, BookingFlowActions] => {
  const [state, setState] = useState<BookingFlowState>({
    currentStep: 1,
    formData: { ...initialFormData, ...initialData },
    errors: {},
    touchedFields: {},
    isLoading: false
  });

  const setCurrentStep = useCallback((step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(1, Math.min(step, totalSteps))
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, totalSteps)
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1)
    }));
  }, []);

  const updateFormData = useCallback(<K extends keyof BookingCreateRequest>(
    field: K,
    value: BookingCreateRequest[K]
  ) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      touchedFields: { ...prev.touchedFields, [field]: true }
    }));
  }, []);

  const setError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error }
    }));
  }, []);

  const clearError = useCallback((field: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: '' }
    }));
  }, []);

  const setTouched = useCallback((field: string, touched: boolean = true) => {
    setState(prev => ({
      ...prev,
      touchedFields: { ...prev.touchedFields, [field]: touched }
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const { formData } = state;
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        // Step 1: Review - no validation needed
        break;

      case 2:
        // Step 2: Guest Information
        if (!formData.guestName?.trim()) {
          newErrors.guestName = 'Guest name is required';
        } else if (formData.guestName.length < 2) {
          newErrors.guestName = 'Guest name must be at least 2 characters';
        }

        if (!formData.guestEmail?.trim()) {
          newErrors.guestEmail = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
          newErrors.guestEmail = 'Please enter a valid email address';
        }

        if (formData.guestPhone && !/^[+]?[0-9\s\-\(\)]{10,15}$/.test(formData.guestPhone)) {
          newErrors.guestPhone = 'Please enter a valid phone number';
        }
        break;

      case 3:
        // Step 3: Payment Method
        if (!formData.paymentMethod) {
          newErrors.paymentMethod = 'Please select a payment method';
        }
        break;

      case 4:
        // Step 4: Final validation (all previous steps)
        return validateStep(2) && validateStep(3);
    }

    setState(prev => ({ ...prev, errors: newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [state]);

  const resetForm = useCallback(() => {
    setState({
      currentStep: 1,
      formData: { ...initialFormData, ...initialData },
      errors: {},
      touchedFields: {},
      isLoading: false
    });
  }, [initialData]);

  const actions: BookingFlowActions = {
    setCurrentStep,
    nextStep,
    prevStep,
    updateFormData,
    setError,
    clearError,
    setTouched,
    setLoading,
    validateStep,
    resetForm
  };

  return [state, actions];
};

// Helper function to get step configuration
export const getStepConfig = (currentStep: number): BookingFlowStep[] => [
  {
    step: 1,
    title: 'Review Booking',
    description: 'Confirm your selection',
    isCompleted: currentStep > 1,
    isActive: currentStep === 1
  },
  {
    step: 2,
    title: 'Guest Information',
    description: 'Enter your details',
    isCompleted: currentStep > 2,
    isActive: currentStep === 2
  },
  {
    step: 3,
    title: 'Payment Method',
    description: 'Choose payment option',
    isCompleted: currentStep > 3,
    isActive: currentStep === 3
  },
  {
    step: 4,
    title: 'Confirmation',
    description: 'Review and confirm',
    isCompleted: false,
    isActive: currentStep === 4
  }
];

// Validation rules
export const validationRules = {
  guestName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
    message: 'Please enter a valid name (letters and spaces only)'
  },
  guestEmail: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  guestPhone: {
    required: false,
    pattern: /^[+]?[0-9\s\-\(\)]{10,15}$/,
    message: 'Please enter a valid phone number'
  },
  paymentMethod: {
    required: true,
    message: 'Please select a payment method'
  }
};

// Field labels for error messages
export const fieldLabels = {
  guestName: 'Guest Name',
  guestEmail: 'Email Address',
  guestPhone: 'Phone Number',
  paymentMethod: 'Payment Method',
  specialRequests: 'Special Requests'
};

export default useBookingFlow; 