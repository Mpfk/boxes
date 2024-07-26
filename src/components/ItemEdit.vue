<script setup lang="ts">
  import { onMounted, ref, watch, inject } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { generateClient } from 'aws-amplify/data';
  import type { Schema } from '../../amplify/data/resource';
  import ItemForm from './ItemForm.vue';

  // Vars
  const route = useRoute();
  const router = useRouter();
  const client = generateClient<Schema>();
  const boxID = ref('');
  const itemID = ref('');
  const itemData = ref<Schema['Boxes']['type'] | null>(null);
  const originalData = ref<Schema['Boxes']['type'] | null>(null);
  const formChanged = ref(false);
  const setHotBarButtons = inject('setHotBarButtons');
  const addToast = inject('addToast');

  // Load item data
  onMounted(async () => {
    boxID.value = route.params.boxID as string;
    itemID.value = route.params.itemID as string;
    const response = await client.models.Boxes.get({ boxID: boxID.value, itemID: itemID.value });
    if (response.data) {
      itemData.value = response.data;
      originalData.value = { ...response.data }; // Store original data
      setHotBarButtons([
        { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack},
        { icon: '♽', description: 'Delete', buttonClass: 'btn-danger', onClick: deleteItem}
      ]);
    } else {
      console.error('Item data not found', response.errors);
      router.push('/404');
    }
  });

  function updateItemName(value: string) {
    if (itemData.value) {
      itemData.value.itemName = value;
    }
  }

  watch(() => itemData.value, (newVal, oldVal) => {
    formChanged.value = JSON.stringify(newVal) !== JSON.stringify(originalData.value);
    setHotBarButtons([
        { icon: '⌫', description: 'Cancel', buttonClass: 'btn-warning', onClick: discardChanges},
        { icon: '✓', description: 'Save', buttonClass: 'btn-success', onClick: saveChanges}
      ]);
  }, { deep: true });

  function discardChanges() {
    if (originalData.value) {
      itemData.value = { ...originalData.value };
      formChanged.value = false;
    }
    setHotBarButtons([
      { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack},
      { icon: '♽', description: 'Delete', buttonClass: 'btn-danger', onClick: deleteItem}
    ]);
  }

  async function saveChanges() {
    if (itemData.value) {
      try {
        await client.models.Boxes.update({
          boxID: itemData.value.boxID,
          itemID: itemData.value.itemID,
          itemName: itemData.value.itemName,
        });
        formChanged.value = false;
        originalData.value = { ...itemData.value }; // Update original data
        console.log('Changes saved successfully');
        addToast({
          message: 'Item updated successfully!',
          bgClass: 'text-bg-success',
        });
        setHotBarButtons([
          { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack},
          { icon: '♽', description: 'Delete', buttonClass: 'btn-danger', onClick: deleteItem}
        ]);
      } catch (error) {
        console.error('Error saving changes', error);
      }
    }
  }

  async function deleteItem() {
    if (itemData.value) {
      try {
        await client.models.Boxes.delete({
          boxID: itemData.value.boxID,
          itemID: itemData.value.itemID,
        });
        console.log('Item deleted successfully');
        router.push(`/box/${boxID.value}`);
        addToast({
          message: 'Item deleted successfully!',
          bgClass: 'text-bg-success',
        });
      } catch (error) {
        console.error('Error deleting item', error);
      }
    }
  }

  function goBack() {
    router.push(`/box/${boxID.value}`);
  }
</script>

<template>
  <div>
    <div class="mt-5 mb-3 text-center fw-bold fs-3">Edit <code>{{ itemData?.itemName }}</code> item</div>
    <ItemForm :initialItemName="itemData?.itemName ?? ''" @update="updateItemName" />
    <div class="control-group">
      <button @click="goBack">🔙 Back</button>
      <button @click="discardChanges" v-if="formChanged">⌫ Discard Changes</button>
      <button @click="saveChanges" :disabled="!formChanged">💾 Save Changes</button>
      <button @click="deleteItem">🗑️ Delete Item</button>
    </div>
  </div>
</template>

<style scoped>
/* Add any required styles here */
</style>
