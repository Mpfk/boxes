<template>
    <div>
      <button class="btn btn-primary" @click="handleGenerateLabels" :disabled="generating">
        <span v-if="generating" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Generate Labels
      </button>
    </div>
  </template>
  
  <script lang="ts">
    import { ref, defineComponent, inject } from 'vue';
    import { generateLabels } from '../../utils/generateLabels';
    import type { Toast } from '../../utils/toastStore';
  
    const addToast = inject<(toast: Toast) => void>('addToast'); // Specify the type for addToast
  
    export default defineComponent({
      name: 'GenerateLabels',
      setup() {
        const generating = ref(false);
  
        const handleGenerateLabels = async () => {
          generating.value = true;
          try {
            await generateLabels();
            addToast?.({
              message: 'Labels generated successfully.',
              bgClass: 'text-bg-success',
            });
          } catch (error) {
            console.error('Error generating labels:', error);
            addToast?.({
              message: 'An error occurred while generating the labels.',
              bgClass: 'text-bg-danger',
            });
          } finally {
            generating.value = false;
          }
        };
  
        return {
          generating,
          handleGenerateLabels
        };
      }
    });
  </script>
  
  <style scoped>
  /* Add any necessary styling here */
  </style>  