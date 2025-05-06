import toast from 'react-hot-toast';

export const showToast = {
  success: (message) => {
    return toast.success(message, {
      duration: 2000,
    });
  },
  error: (message) => {
    return toast.error(message, {
      duration: 2000,
    });
  },
  loading: (message) => {
    return toast.loading(message);
  },
  custom: (message, options = {}) => {
    return toast(message, options);
  },
  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};
