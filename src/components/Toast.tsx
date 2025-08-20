import { toast } from 'sonner';

// Toast utility functions for consistent error handling
export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },
  
  error: (message: string) => {
    toast.error(message);
  },
  
  warning: (message: string) => {
    toast.warning(message);
  },
  
  info: (message: string) => {
    toast.info(message);
  },
  
  // API specific error messages
  apiError: (error: any, defaultMessage = 'An error occurred') => {
    const message = error?.response?.data?.message || error?.message || defaultMessage;
    toast.error(message);
  },
  
  networkError: () => {
    toast.error('Network error. Please check your connection and try again.');
  },
  
  permissionError: () => {
    toast.error('You do not have permission to perform this action.');
  },
  
  validationError: (message: string) => {
    toast.error(`Validation error: ${message}`);
  }
};

export default showToast;