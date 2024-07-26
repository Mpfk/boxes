<template>
    <div :class="['toast align-items-center border-0', bgClass]" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body text-center">
          {{ message }}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  </template>
  
  <script>
  import { onMounted } from 'vue';
  // Explicitly import Bootstrap Toast
  import { Toast as BootstrapToast } from 'bootstrap';
  
  export default {
    name: 'Toast',
    props: {
      message: {
        type: String,
        required: true
      },
      bgClass: {
        type: String,
        default: 'text-bg-primary'
      }
    },
    setup() {
      onMounted(() => {
        const toastElement = document.querySelector('.toast');
        const toastInstance = new BootstrapToast(toastElement);
        toastInstance.show();
      });
    }
  }
  </script>
  
  <style scoped></style>
  