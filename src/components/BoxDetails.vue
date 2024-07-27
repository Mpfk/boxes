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

  // Vars
  const route = useRoute();
  const client = generateClient<Schema>();
  const boxName = ref('');
  const location = ref('');
  const router = useRouter();
  const boxID = ref('');
  const list = ref<Array<Schema['Boxes']["type"]>>([]);
  const setHotBarButtons = inject<(buttons: HotBarButton[]) => void>('setHotBarButtons')!;

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
      { icon: '✓', description: 'Multi', buttonClass: 'btn-info', onClick: returnHome }
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
        @click="editItem(item.itemID)"
      >
        <div class="w-100">
          <span class="fw-bold">{{ item.itemName }}</span>
        </div>
        <small>{{ item.itemName }}</small>
      </button>
    </div>
  </div>
</template>
