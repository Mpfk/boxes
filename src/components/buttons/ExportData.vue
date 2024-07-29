<template>
  <div>
    <button class="btn btn-primary" @click="handleExport" :disabled="exporting">
      <span v-if="exporting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      ↓
    </button>
  </div>
</template>
  
<script lang="ts">
  import { ref, defineComponent, inject } from 'vue';
  import exportJSON from '../../utils/dataExport';
  import type { Toast } from '../../utils/toastStore';

  const addToast = inject<(toast: Toast) => void>('addToast'); // Specify the type for addToast

  export default defineComponent({
    name: 'ExportButton',
    setup() {
      const exporting = ref(false);
  
      const handleExport = async () => {
        exporting.value = true;
        try {
          await exportJSON();
        } catch (error) {
          console.error('Error exporting data:', error);
          addToast?.({
            message: 'An error occured exporting the data.',
            bgClass: 'text-bg-danger',
          });
        } finally {
          exporting.value = false;
          addToast?.({
            message: 'Data exported successfully.',
            bgClass: 'text-bg-success',
          });
        }
      };
  
      return {
        exporting,
        handleExport
      };
    }
  });
</script>