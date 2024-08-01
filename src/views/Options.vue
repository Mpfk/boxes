<script setup lang="ts">
  // Imports
  import { onMounted, inject } from 'vue';
  import { useRouter } from 'vue-router';
  import ExportButton from '../components/buttons/ExportData.vue';
  import ImportButton from '../components/buttons/ImportData.vue';
  import DeleteButton from '../components/buttons/DeleteData.vue';

  // Interface
  interface HotBarButton {
    icon: string;
    description: string;
    buttonClass: string;
    onClick: () => void;
  }

  // Vars
  const router = useRouter();
  const setHotBarButtons = inject<(buttons: HotBarButton[]) => void>('setHotBarButtons')!;

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
        <p style="margin: 0">Box List + QR Codes<br><small class="text-secondary">Generate a PDF of all boxes.</small></p>
        <button class="btn btn-secondary disabled">Coming Soon</button>
      </div>
      <!-- Full Inventory -->
      <div class="list-group-item d-flex align-items-center justify-content-between">
        <p style="margin: 0">Full Inventory<br><small class="text-secondary">Generate a PDF of all boxes and their items.</small></p>
        <button class="btn btn-secondary disabled">Coming Soon</button>
      </div>
      <!-- Label Maker CSV -->
      <div class="list-group-item d-flex align-items-center justify-content-between">
        <p style="margin: 0">Label Maker CSV<br><small class="text-secondary">Generate a CSV file for label maker software.</small></p>
        <button class="btn btn-secondary disabled">Coming Soon</button>
      </div>
    </div>


    <div class="fw-bold fs-6 mt-3">Manage Data</div>
    <div class="list-group">
      <!-- Export Data -->
      <div class="list-group-item d-flex align-items-center justify-content-between">
        <p style="margin: 0">Export Data<br><small class="text-secondary">Generate a JSON file of all data.</small></p>
        <ExportButton />
      </div>
      <!-- Import Data -->
      <div class="list-group-item d-flex align-items-center justify-content-between">
        <p style="margin: 0">Import Data<br><small class="text-secondary">Upload a JSON file to import data.</small></p>
        <ImportButton />
      </div>
      <div class="list-group-item d-flex align-items-center justify-content-between">
        <p style="margin: 0" class="text-danger">Delete Data<br><small>Delete all boxes and their items.</small></p>
        <DeleteButton />
      </div>
    </div>
  </main>
</template>

<style scoped></style>