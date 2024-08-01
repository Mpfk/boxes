<template>
    <div id="toaster" class="toast-container position-fixed bottom-0 start-50 translate-middle-x" style="padding-bottom: 6em;">
      <Toast v-for="(toast, index) in toasts" :key="index" :message="toast.message" :bgClass="toast.bgClass" />
    </div>
  </template>
  
  <script>
  import { toastStore } from '../utils/toastStore';
  import Toast from './Toast.vue';
  
  export default {
    name: 'Toaster',
    components: {
      Toast,
    },
    setup() {
      return {
        toasts: toastStore.toasts,
      };
    },
  }
  </script>
  
  <style scoped>
  </style>
  