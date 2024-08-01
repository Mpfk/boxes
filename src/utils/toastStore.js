import { reactive } from 'vue';

export const toastStore = reactive({
  toasts: [],
  addToast: (toast) => {
    toastStore.toasts.push(toast);
    setTimeout(() => {
      toastStore.removeToast(toast);
    }, toast.duration || 10000); // Default duration is 5 seconds
  },
  removeToast: (toast) => {
    const index = toastStore.toasts.indexOf(toast);
    if (index !== -1) {
      toastStore.toasts.splice(index, 1);
    }
  },
});
