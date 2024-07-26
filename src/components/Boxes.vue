<script setup lang="ts">
  // Imports
  import { onMounted, ref, inject } from 'vue';
  import type { Schema } from '../../amplify/data/resource';
  import { generateClient } from 'aws-amplify/data';
  import { useRouter } from 'vue-router';

  // Vars
  const client = generateClient<Schema>();
  const router = useRouter();
  const list = ref<Array<Schema['Boxes']["type"]>>([]);
  const setHotBarButtons = inject('setHotBarButtons');

  // Functions
  function listBoxes() {
    client.models.Boxes.observeQuery({ filter: { itemID: { eq: 'box_root' } } }).subscribe({
      next: ({ items, isSynced }) => {
        list.value = items
      },
    }); 
  }

  function navigateToBox(boxID: string) {
    router.push(`/box/${boxID}`);
  }

  function navigateToNewBox() {
    router.push('/box/new');
  }

  // Fetch boxes when the component is mounted
  onMounted(() => {
    listBoxes();
    setHotBarButtons([
      { icon: '+', description: 'New', buttonClass: 'btn-success', onClick: navigateToNewBox},
    ]);
  });
</script>

<template>
  <main>
    
    <div class="form-group mt-5">
      <input type="text" class="form-control form-control-lg" id="search" placeholder="🔎 Search Boxes and Items" />
    </div>

    <div class="list-group mt-5">
      <button 
        class="list-group-item list-group-item-action"
        v-for="box in list" 
        :key="box.boxID"
        @click="box.boxID ? navigateToBox(box.boxID) : null"
      >
        <div class="w-100">
          <span class="fw-bold">{{ box.boxName }}</span>
        </div>
        <small>{{ box.location }}</small>
      </button>
    </div>
  </main>
</template>

<style scoped>
/* Add any required styles here */
</style>
