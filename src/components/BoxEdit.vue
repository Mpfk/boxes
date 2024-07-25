<script setup lang="ts">
  // Imports
  import { onMounted, ref, watch } from 'vue';
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
    }
  }

  function discardChanges() {
    if (originalData.value) {
      boxData.value = { ...originalData.value };
      formKey.value++; // Increment key to force re-render of BoxForm
      formChanged.value = false;
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
        formChanged.value = false;
        originalData.value = { ...boxData.value }; // Update original data
      } catch (error) {
        console.error('Error saving changes', error);
      }
    }
  }

  async function emptyBox() {
    // Show a confirmation dialog before emptying the box
    if (!confirm(`Are you sure you want to empty this box? It's contents will be deleted.`)) {
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
        router.push('/');
      } catch (error) {
        console.error('Error deleting box', error);
      }
    }
  }  

  function goBack() {
    router.push(`/box/${boxID.value}`);
  }
</script>

<template>
  <div>
    <h1>📝 Edit Box</h1>
    <!-- Details Component Here (Name Field, Location Field) -->
    <BoxForm :key="formKey" :boxName="boxData?.boxName ?? ''" :location="boxData?.location ?? ''" @update="handleInputChanged" @inputChanged="handleInputChanged" />
    <div class="control-group">
      <button v-if="!formChanged" @click="goBack">🔙 Back</button>
      <button v-if="!formChanged && itemCount > 0" @click="emptyBox">❌ Empty Box</button>
      <button v-if="!formChanged && itemCount === 0" @click="deleteBox">♻️ Delete Box</button>
      
      <button v-if="formChanged" @click="discardChanges">⌫ Discard Changes</button>
      <button v-if="formChanged" @click="saveChanges">💾 Save Changes</button>
    </div>
  </div>
</template>

<style scoped>
/* Add any required styles here */
</style>
