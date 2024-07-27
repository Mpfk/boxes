<script setup lang="ts">
  import { onMounted, ref, inject } from 'vue';
  import { useRouter } from 'vue-router';
  import { generateClient } from 'aws-amplify/data';
  import type { Schema } from '../../amplify/data/resource';
  import BoxForm from './BoxForm.vue';
  import type { Toast } from '../utils/toastStore'; // Import the Toast type

  // Define the type for HotBarButton
  interface HotBarButton {
    icon: string;
    description: string;
    onClick: () => void;
    buttonClass: string;
  }

  // Vars
  const client = generateClient<Schema>();
  const router = useRouter();
  const boxName = ref('');
  const location = ref('');
  const setHotBarButtons = inject<((buttons: HotBarButton[]) => void)>('setHotBarButtons');
  const addToast = inject<(toast: Toast) => void>('addToast'); // Specify the type for addToast

  // Functions
  onMounted(() => {
    setHotBarButtons?.([
      { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
      { icon: '✓', description: 'Create', buttonClass: 'btn-success', onClick: saveBox },
    ]);
  });

  function updateBoxName(value: string) {
    boxName.value = value;
  }

  function updateLocation(value: string) {
    location.value = value;
  }

  async function saveBox() {
    const boxID = Math.random().toString(36).substring(2, 8); // Generate a random 6-character string
    try {
      await client.models.Boxes.create({
        boxID: boxID,
        itemID: 'box_root',
        boxName: boxName.value,
        location: location.value
      });
      console.log('Box created successfully:', boxName.value, boxID);
      addToast?.({
        message: 'Box created successfully!',
        bgClass: 'text-bg-success',
      });
      router.push(`/box/${boxID}`);
    } catch (error) {
      console.error('Error creating box:', error);
      addToast?.({
        message: 'Error creating box. Please reload and try again.',
      });
    }
  }

  function goBack() {
    router.back();
  }
</script>

<template>
  <div>
    <div class="mt-5 mb-3 text-center fw-bold fs-3">New box +</div>
    <BoxForm :boxName="boxName" :location="location" @update="updateBoxName" @updateLocation="updateLocation" />
  </div>
</template>

<style scoped>
/* Add any required styles here */
</style>
