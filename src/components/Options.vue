<script setup lang="ts">
  // Imports
  import { onMounted, ref, inject, computed } from 'vue';
  import type { Schema } from '../../amplify/data/resource';
  import { generateClient } from 'aws-amplify/data';
  import { useRouter } from 'vue-router';

  // Interface
  interface HotBarButton {
    icon: string;
    description: string;
    buttonClass: string;
    onClick: () => void;
  }
  interface ToastOptions {
    message: string;
    bgClass: string;
  }

  // Vars
  const client = generateClient<Schema>();
  const router = useRouter();
  const setHotBarButtons = inject<(buttons: HotBarButton[]) => void>('setHotBarButtons')!;
  const addToast = inject<(options: ToastOptions) => void>('addToast')!;


  // Functions
  onMounted(async () => {
    setHotBarButtons([
      { icon: '⌂', description: 'Home', buttonClass: 'btn-warning', onClick: returnHome },
    ]);
  });

  function returnHome() {
    router.push('/');
  }


</script>

<template>
  <main>
    <div class="mt-5 mb-3 text-center fw-bold fs-3">Options</div>

    <div class="fw-bold fs-6 mt-3">Download Inventory</div>
    <div class="list-group">
      <!-- Boxes & QRs -->
      <div class="list-group-item d-flex align-items-center justify-content-between">
        <p style="margin: 0">Box List + QR Codes PDF</p>
        <button class="btn btn-secondary">Download</button>
      </div>
      <!-- Full Inventory -->
      <div class="list-group-item d-flex align-items-center justify-content-between">
        <p style="margin: 0">Full Inventory PDF</p>
        <button class="btn btn-secondary">Download</button>
      </div>
      <!-- Import Data -->
      <div class="list-group-item d-flex align-items-center justify-content-between">
        <p style="margin: 0">Label Maker CSV</p>
        <button class="btn btn-secondary">Download</button>
      </div>
    </div>


    <div class="fw-bold fs-6 mt-3">Manage Data</div>
    <div class="list-group">
      <!-- Export Data -->
      <div class="list-group-item d-flex align-items-center justify-content-between">
        <p style="margin: 0">Export Data</p>
        <button class="btn btn-secondary">Download</button>
      </div>
      <!-- Import Data -->
      <div class="list-group-item d-flex align-items-center justify-content-between">
        <p style="margin: 0">Import Data</p>
        <button class="btn btn-secondary">Upload</button>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
