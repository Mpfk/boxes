<script setup lang="ts">
  // Imports
  import { onMounted, ref, inject } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { generateClient } from 'aws-amplify/data';
  import type { Schema } from '../../amplify/data/resource';

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
  const route = useRoute();
  const client = generateClient<Schema>();
  const boxName = ref('');
  const location = ref('');
  const router = useRouter();
  const boxID = ref('');
  const list = ref<Array<Schema['Boxes']["type"]>>([]);
  const setHotBarButtons = inject<(buttons: HotBarButton[]) => void>('setHotBarButtons')!;
  const multiOn = ref(false);
  const multiSelected = ref<Array<string>>([]);
  const multiMovePrompted = ref(false);
  const availableBoxes = ref<Array<Schema['Boxes']["type"]>>([]);
  const addToast = inject<(options: ToastOptions) => void>('addToast')!;

  // Functions
  onMounted(async () => {
    boxID.value = route.params.boxID as string;
    const response = await client.models.Boxes.get({ boxID: boxID.value, itemID: 'box_root' });
    if (response.data) {
      boxName.value = response.data.boxName || '';
      location.value = response.data.location || '';
      listContents();
    } else {
      console.error('Box data not found', response.errors);
      router.push('/404');
    }
    setHotBarButtons([
      { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: returnHome },
      { icon: '✎', description: 'Edit', buttonClass: 'btn-secondary', onClick: editBox },
      { icon: '+', description: 'Fill', buttonClass: 'btn-success', onClick: addItems },
      { icon: '✓', description: 'Multi', buttonClass: 'btn-secondary', onClick: enableMulti }
    ]);
  });

  function returnHome() {
    router.push('/');
  }

  function editBox() {
    router.push(`/box/${route.params.boxID}/edit`);
  }

  function addItems() {
    router.push(`/box/${route.params.boxID}/fill`);
  }

  function editItem(itemID: string) {
    router.push(`/box/${boxID.value}/item/${itemID}/edit`);
  }

  function listContents() {
    client.models.Boxes.observeQuery({ filter: { boxID: { eq: boxID.value }, itemID: { ne: 'box_root' } } }).subscribe({
      next: ({ items, isSynced }) => {
        list.value = items;
      },
    });
  }

  function enableMulti() {
    multiOn.value = true;
    setHotBarButtons([
      { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: returnHome },
      { icon: '⤤', description: 'Move', buttonClass: 'btn-info', onClick: multiMoveConfirm },
      { icon: '♽', description: 'Delete', buttonClass: 'btn-danger', onClick: multiDelete },
      { icon: 'X', description: 'Cancel', buttonClass: 'btn-secondary', onClick: disableMulti }
    ]);
    console.log('Enable Multi');
  }

  function multiSelect(itemID: string) {
    if (multiSelected.value.includes(itemID)) {
      multiSelected.value = multiSelected.value.filter((id) => id !== itemID);     
    } else {
      multiSelected.value = [...multiSelected.value, itemID];
    }
  }

  async function multiMoveConfirm() {
    console.log('Confirm Items');
    try {
      client.models.Boxes.observeQuery({ filter: { itemID: { eq: 'box_root' } } }).subscribe({
        next: ({ items, isSynced }) => {
          availableBoxes.value = items;
        },
      }); 
      multiMovePrompted.value = true;
      setHotBarButtons([
        { icon: 'X', description: 'Cancel', buttonClass: 'btn-warning', onClick: multiMoveCancel },
        { icon: '✓', description: 'Confirm', buttonClass: 'btn-success', onClick: multiMove }
      ]);
    } catch (error) {
      console.error('Error loading boxes: ', error);
    }
  }

  function multiMoveCancel() {
    multiMovePrompted.value = false;
    disableMulti();
    setHotBarButtons([
      { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: returnHome },
      { icon: '✎', description: 'Edit', buttonClass: 'btn-secondary', onClick: editBox },
      { icon: '+', description: 'Fill', buttonClass: 'btn-success', onClick: addItems },
      { icon: '✓', description: 'Multi', buttonClass: 'btn-secondary', onClick: enableMulti }
    ]);
  }

  async function multiMove() {
    console.log('Move Items');
    try {
      for (const itemID of multiSelected.value) {
        console.log('Move Item', itemID);
        const newBoxID = (document.getElementById('box-select') as HTMLSelectElement).value;
        try {
          // Create a new item in the newBoxID with the same data as the old item
          await client.models.Boxes.create({
            boxID: newBoxID,
            itemID,
            itemName: list.value.find((item) => item.itemID === itemID)?.itemName || '',
          });
          // Delete the old item
          await client.models.Boxes.delete({ boxID: boxID.value, itemID });
        } catch (error) {
          console.error('Error moving item', error);
        }
        console.log('Item moved successfully');
      }
      addToast({
        message: 'Items moved successfully.',
        bgClass: 'text-bg-success',
      });
      disableMulti();
      multiMovePrompted.value = false;
    } catch (error) {
      console.error('Error moving items', error);
      addToast({
        message: 'Error moving items.',
        bgClass: 'text-bg-danger',
      });
      multiMovePrompted.value = false;
    }
  }

  async function multiDelete() {
    console.log('Delete Items');
    try {
      for (const itemID of multiSelected.value) {
        console.log('Delete Item', itemID);
        await client.models.Boxes.delete({ boxID: boxID.value, itemID });
      }
      disableMulti();
      addToast({
        message: 'Items removed successfully.',
        bgClass: 'text-bg-success',
      });
    } catch (error) {
      console.error('Error deleting items', error);
      addToast({
        message: 'Error deleting items.',
        bgClass: 'text-bg-danger',
      });
    }
  }

  function disableMulti() {
    multiSelected.value = [];
    multiOn.value = false;
    listContents();
    setHotBarButtons([
      { icon: '←', description: 'Back', buttonClass: 'btn-warning', onClick: returnHome },
      { icon: '✎', description: 'Edit', buttonClass: 'btn-secondary', onClick: editBox },
      { icon: '+', description: 'Fill', buttonClass: 'btn-success', onClick: addItems },
      { icon: '✓', description: 'Multi', buttonClass: 'btn-secondary', onClick: enableMulti }
    ]);
    console.log('Disable Multi');
  }

</script>

<template>
  <div>
    <div class="mt-5 mb-3 text-center fw-bold fs-3">{{ boxName }}</div>
    <div class="text-center mb-4">{{ location }}</div>

    <div class="mt-2 mb-2 text-center fw-bold fs-5">Items</div>
    <!-- Item List -->
    <div class="list-group" v-if="!multiMovePrompted">
      <button 
        class="list-group-item list-group-item-action"
        v-for="item in list" 
        :key="item.itemID"
        :class="multiSelected.includes(item.itemID) ? 'list-group-item-warning' : ''"
        @click="multiOn ? multiSelect(item.itemID) : editItem(item.itemID)"
      >
        <div class="w-100">
          <span class="fw-bold">{{ item.itemName }}</span>
        </div>
        <small>{{ item.itemName }}</small>
      </button>
    </div>
    <!-- Move Items prompt -->
    <div class="mt-5 rounded border p-4" v-if="multiMovePrompted">
      <label for="box-select" class="form-label">Move to box:</label>
      <select id="box-select" class="form-select">
        <option v-for="box in availableBoxes" :key="box.boxID" :value="box.boxID">{{ box.boxName }}</option>
      </select>
    </div>
  </div>
</template>
