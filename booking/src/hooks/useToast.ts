import { useState, useCallback } from 'react';
import { ToastType } from '../components/ui/Toast';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const newToast: ToastData = {
      id,
      type,
      title,
      message,
      duration
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    return addToast(type, title, message, duration);
  }, [addToast]);

  const showSuccess = useCallback((
    title: string,
    message?: string,
    duration?: number
  ) => {
    return addToast('success', title, message, duration);
  }, [addToast]);

  const showError = useCallback((
    title: string,
    message?: string,
    duration?: number
  ) => {
    return addToast('error', title, message, duration);
  }, [addToast]);

  const showWarning = useCallback((
    title: string,
    message?: string,
    duration?: number
  ) => {
    return addToast('warning', title, message, duration);
  }, [addToast]);

  const showInfo = useCallback((
    title: string,
    message?: string,
    duration?: number
  ) => {
    return addToast('info', title, message, duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
}; 