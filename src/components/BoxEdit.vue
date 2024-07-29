<script setup lang="ts">
  // Imports
  import { onMounted, ref, watch, inject } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { generateClient } from 'aws-amplify/data';
  import type { Schema } from '../../amplify/data/resource';
  import BoxForm from './BoxForm.vue';

  // Interfaces
  interface BoxItem {
    boxID: string;
    itemID: string;
    boxName: string | null;
    itemName: string | null;
    location: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
  }

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
  const route = useRoute();
  const router = useRouter();
  const boxID = ref('');
  const client = generateClient<Schema>();
  const boxData = ref<BoxItem | null>(null); // Variable to store the box_root item
  const originalData = ref<BoxItem | null>(null); // Variable to store the original box_root item
  const items = ref<BoxItem[]>([]); // Variable to store other items
  const itemCount = ref(0);
  const formChanged = ref(false);
  const formKey = ref(0); // Key to force re-render of BoxForm
  const setHotBarButtons = inject<(buttons: HotBarButton[]) => void>('setHotBarButtons')!;
  const addToast = inject<(options: ToastOptions) => void>('addToast')!;

  // Functions
  onMounted(async () => {
    boxID.value = route.params.boxID as string;
    const response = await client.models.Boxes.observeQuery({ filter: { boxID: { eq: boxID.value } } }).subscribe({
      next: ({ items: fetchedItems }) => {
        items.value = fetchedItems.filter(item => item.itemID !== 'box_root');
        const rootItem = fetchedItems.find(item => item.itemID === 'box_root');
        if (rootItem) {
          boxData.value = rootItem;
          originalData.value = { ...rootItem }; // Store original data
          itemCount.value = items.value.length;
          if (itemCount.value === 0) {
            setHotBarButtons([
              { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
              { icon: '♽', description: 'Delete', buttonClass: 'btn-danger', onClick: deleteBox }
            ]);
          } else {
            setHotBarButtons([
              { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
              { icon: 'X', description: 'Empty', buttonClass: 'btn-danger', onClick: emptyBox }
            ]);
          }
        } else {
          console.error('Box root item not found');
          router.push('/404');
        }
      },
      error: (err) => {
        console.error('Error fetching items', err);
        router.push('/404');
      }
    });
  });

  function handleInputChanged(data: { boxName: string; location: string }) {
    if (boxData.value) {
      boxData.value.boxName = data.boxName;
      boxData.value.location = data.location;
      formChanged.value = true;
      setHotBarButtons([
        { icon: '⌫', description: 'Cancel', buttonClass: 'btn-warning', onClick: discardChanges },
        { icon: '✓', description: 'Update', buttonClass: 'btn-success', onClick: saveChanges }
      ]);
    }
  }

  function discardChanges() {
    if (originalData.value) {
      boxData.value = { ...originalData.value };
      formKey.value++; // Increment key to force re-render of BoxForm
      formChanged.value = false;
      if (itemCount.value === 0) {
        setHotBarButtons([
          { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
          { icon: '♽', description: 'Delete', buttonClass: 'btn-danger', onClick: deleteBox }
        ]);
      } else {
        setHotBarButtons([
          { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
          { icon: 'X', description: 'Empty', buttonClass: 'btn-danger', onClick: emptyBox }
        ]);
      }
    }
  }

  async function saveChanges() {
    if (boxData.value) {
      try {
        console.log('Saving changes:', boxData.value); // Log data being saved
        await client.models.Boxes.update({
          boxID: boxData.value.boxID,
          itemID: 'box_root',
          boxName: boxData.value.boxName,
          location: boxData.value.location
        });
        console.log('Changes saved successfully');
        addToast({
          message: 'Box updated successfully!',
          bgClass: 'text-bg-success',
        });
        formChanged.value = false;
        originalData.value = { ...boxData.value }; // Update original data
      } catch (error) {
        console.error('Error saving changes', error);
      }
    }
  }

  async function emptyBox() {
    // Show a confirmation dialog before emptying the box
    if (!window.confirm(`Are you sure you want to empty this box? It's contents will be deleted.`)) {
      return;
    } else {
      try {
        console.log('Emptying box with items:', items.value); // Log items being deleted
        for (const item of items.value) {
          await client.models.Boxes.delete({ boxID: item.boxID, itemID: item.itemID });
          console.log(`Deleted item: ${item.itemID}`);
        }
        items.value = [];
        itemCount.value = 0;
        console.log('Box emptied successfully');
        addToast({
          message: 'Box emptied successfully!',
          bgClass: 'text-bg-success',
        });
        setHotBarButtons([
          { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
          { icon: 'X', description: 'Empty', buttonClass: 'btn-danger', onClick: emptyBox }
        ]);
      } catch (error) {
        console.error('Error emptying box', error);
      }
    }
  }

  async function deleteBox() {
    if (items.value.length > 0) {
      console.error('Cannot delete box. Items still present in the box.');
      return;
    }
    if (boxData.value) {
      try {
        console.log('Deleting box:', boxData.value); // Log data being deleted
        await client.models.Boxes.delete({ boxID: boxData.value.boxID, itemID: 'box_root' });
        console.log('Box deleted successfully');
        addToast({
          message: 'Box deleted successfully!',
          bgClass: 'text-bg-success',
        });
        router.push('/');
      } catch (error) {
        console.error('Error deleting box', error);
        addToast({
          message: 'Error deleting box. Please reload and try again.',
          bgClass: 'text-bg-danger',
        });
      }
    }
  }

  function goBack() {
    router.push(`/box/${boxID.value}`);
  }
</script>

<template>
  <div>
    <div class="mt-5 mb-3 text-center fw-bold fs-3">Edit <code>{{ boxData?.boxName }}</code> box</div>
    <BoxForm :key="formKey" :boxName="boxData?.boxName ?? ''" :location="boxData?.location ?? ''" @update="handleInputChanged" @inputChanged="handleInputChanged" />
  </div>
</template>

<style scoped>
/* Add any required styles here */
</style>