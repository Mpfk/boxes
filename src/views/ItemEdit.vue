<script setup lang="ts">
  import { onMounted, ref, watch, inject } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { generateClient } from 'aws-amplify/data';
  import type { Schema } from '../../amplify/data/resource';
  import ItemForm from './ItemForm.vue';
  // Interfaces
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
  const client = generateClient<Schema>();
  const boxID = ref('');
  const itemID = ref('');
  const itemData = ref<Schema['Boxes']['type'] | null>(null);
  const originalData = ref<Schema['Boxes']['type'] | null>(null);
  const formChanged = ref(false);
  const movePrompted = ref(false);
  const availableBoxes = ref<Array<Schema['Boxes']["type"]>>([]);
  const setHotBarButtons = inject<(buttons: HotBarButton[]) => void>('setHotBarButtons')!;
  const addToast = inject<(options: ToastOptions) => void>('addToast')!;
  // Load item data
  onMounted(async () => {
    boxID.value = route.params.boxID as string;
    itemID.value = route.params.itemID as string;
    const response = await client.models.Boxes.get({ boxID: boxID.value, itemID: itemID.value });
    if (response.data) {
      itemData.value = response.data;
      originalData.value = { ...response.data }; // Store original data
      setHotBarButtons([
        { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
        { icon: '⤤', description: 'Move', buttonClass: 'btn-info', onClick: promptMove },
        { icon: '♽', description: 'Delete', buttonClass: 'btn-danger', onClick: deleteItem }
      ]);
    } else {
      console.error('Item data not found', response.errors);
      router.push('/404');
    }
  });
  function handleUpdate({ itemName, quantity, note }: { itemName?: string, quantity?: number, note?: string }) {
    if (itemData.value) {
      if (itemName !== undefined) itemData.value.itemName = itemName;
      if (quantity !== undefined) itemData.value.quantity = quantity;
      if (note !== undefined) itemData.value.note = note;
    }
  }
  watch(() => itemData.value, (newVal, oldVal) => {
    formChanged.value = JSON.stringify(newVal) !== JSON.stringify(originalData.value);
    if (formChanged.value) {
      setHotBarButtons([
        { icon: '⌫', description: 'Cancel', buttonClass: 'btn-warning', onClick: discardChanges },
        { icon: '✓', description: 'Save', buttonClass: 'btn-success', onClick: saveChanges }
      ]);
    } else {
      setHotBarButtons([
        { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
        { icon: '⤤', description: 'Move', buttonClass: 'btn-info', onClick: promptMove },
        { icon: '♽', description: 'Delete', buttonClass: 'btn-danger', onClick: deleteItem }
      ]);
    }
  }, { deep: true });
  function discardChanges() {
    if (originalData.value) {
      itemData.value = { ...originalData.value };
      formChanged.value = false;
    }
    setHotBarButtons([
      { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
      { icon: '⤤', description: 'Move', buttonClass: 'btn-info', onClick: promptMove },
      { icon: '♽', description: 'Delete', buttonClass: 'btn-danger', onClick: deleteItem }
    ]);
  }
  async function saveChanges() {
    if (itemData.value) {
      try {
        await client.models.Boxes.update({
          boxID: itemData.value.boxID,
          itemID: itemData.value.itemID,
          itemName: itemData.value.itemName,
          quantity: itemData.value.quantity,
          note: itemData.value.note,
        });
        formChanged.value = false;
        originalData.value = { ...itemData.value };
        console.log('Changes saved successfully');
        addToast({
          message: 'Item updated successfully!',
          bgClass: 'text-bg-success',
        });
        setHotBarButtons([
          { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
          { icon: '⤤', description: 'Move', buttonClass: 'btn-info', onClick: promptMove },
          { icon: '♽', description: 'Delete', buttonClass: 'btn-danger', onClick: deleteItem }
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
  async function promptMove() {
    try {
      client.models.Boxes.observeQuery({ filter: { itemID: { eq: 'box_root' } } }).subscribe({
        next: ({ items, isSynced }) => {
          availableBoxes.value = items;
        },
      }); 
      movePrompted.value = true;
      setHotBarButtons([
        { icon: 'X', description: 'Cancel', buttonClass: 'btn-warning', onClick: cancelMove },
        { icon: '✓', description: 'Confirm', buttonClass: 'btn-success', onClick: moveItem }
      ]);
    } catch (error) {
      console.error('Error loading boxes: ', error);
    }
  }
  async function moveItem() {
    const boxSelectElement = document.getElementById('box-select') as HTMLInputElement | null;
    const destBoxID = boxSelectElement?.value;
    if (itemData.value && destBoxID) {
      try {
        console.log('Attempting to move item:', {
          boxID: destBoxID,
          itemID: itemData.value.itemID,
          itemName: itemData.value.itemName,
        });
        // Step 1: Create a new item in the destination box
        const createResponse = await client.models.Boxes.create({
          boxID: destBoxID,
          itemID: itemData.value.itemID,
          itemName: itemData.value.itemName,
          quantity: itemData.value.quantity,
          note: itemData.value.note,
        });
        if (createResponse && createResponse.data) {
          console.log('Item created successfully in the new box');
          // Step 2: Delete the old item from the original box
          const deleteResponse = await client.models.Boxes.delete({
            boxID: itemData.value.boxID,
            itemID: itemData.value.itemID,
          });
          if (deleteResponse && deleteResponse.data) {
            console.log('Old item deleted successfully');
            addToast({
              message: 'Item moved successfully!',
              bgClass: 'text-bg-success',
            });
            router.push(`/box/${destBoxID}`);
          } else {
            console.error('Failed to delete old item, response:', deleteResponse);
            addToast({
              message: 'Failed to delete old item!',
              bgClass: 'text-bg-danger',
            });
          }
        } else {
          console.error('Failed to create item in the new box, response:', createResponse);
          addToast({
            message: 'Failed to create item in the new box!',
            bgClass: 'text-bg-danger',
          });
        }
      } catch (error) {
        console.error('Error moving item', error);
        addToast({
          message: 'Error moving item!',
          bgClass: 'text-bg-danger',
        });
      }
    } else {
      console.error('Destination box ID is undefined');
    }
  }
  function cancelMove() {
    movePrompted.value = false;
    setHotBarButtons([
      { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: goBack },
      { icon: '⤤', description: 'Move', buttonClass: 'btn-info', onClick: promptMove },
      { icon: '♽', description: 'Delete', buttonClass: 'btn-danger', onClick: deleteItem }
    ]);
  }
  function goBack() {
    router.push(`/box/${boxID.value}`);
  }
</script>

<template>
  <div>
    <div class="mt-5 mb-3 text-center fw-bold fs-3">Edit <code>{{ itemData?.itemName }}</code> item</div>
    <ItemForm 
      :initialItemName="itemData?.itemName ?? ''" 
      :initialQuantity="itemData?.quantity ?? 0" 
      :initialNote="itemData?.note ?? ''" 
      @update="handleUpdate" 
      v-if="!movePrompted" 
    />    
    <div class="mt-5 rounded border p-4" v-if="movePrompted">
      <label for="box-select" class="form-label">Move to box:</label>
      <select id="box-select" class="form-select">
        <option v-for="box in availableBoxes" :key="box.boxID" :value="box.boxID">{{ box.boxName }}</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
/* Add any required styles here */
</style>
