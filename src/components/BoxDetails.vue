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
      { icon: '⤤', description: 'Move', buttonClass: 'btn-info', onClick: addItems },
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

  async function multiMove() {
    console.log('Move Items');
    for (const itemID of multiSelected.value) {
      console.log('Move Item', itemID);

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
      { icon: '+', description: 'Fill', buttonClass: 'btn-success', onClick: addItems },
      { icon: '✓', description: 'Multi', buttonClass: 'btn-secondary', onClick: enableMulti }
    ]);
    console.log('Disable Multi');
  }

</script>

<template>
  <div>
    <div class="mt-5 mb-3 text-center fw-bold fs-3">{{ boxName }}</div>

    <span @click="editBox">(edit)</span>
    <p>{{ location }}</p>

    <div class="mt-2 mb-2 text-center fw-bold fs-5">Items</div>
    <!-- Item List -->
    <div class="list-group">
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
  </div>
</template>
