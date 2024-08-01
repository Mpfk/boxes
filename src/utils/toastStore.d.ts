// src/utils/toastStore.d.ts
import { Ref } from 'vue';

interface Toast {
  message: string;
  bgClass?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Ref<Toast[]>;
  addToast: (toast: Toast) => void;
  removeToast: (toast: Toast) => void;
}

export const toastStore: ToastStore;