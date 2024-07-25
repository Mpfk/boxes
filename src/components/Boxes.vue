<script setup lang="ts">
  // Imports
  import '@/assets/main.css';
  import { onMounted, ref } from 'vue';
  import type { Schema } from '../../amplify/data/resource';
  import { generateClient } from 'aws-amplify/data';
  import { useRouter } from 'vue-router';

  // Vars
  const client = generateClient<Schema>();
  const router = useRouter();
  const list = ref<Array<Schema['Boxes']["type"]>>([]);

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
  });
</script>

<template>
  <main>
    <h1>📦 Boxes</h1>
    <button @click="navigateToNewBox">+ New Box</button>
    <ul>
      <li 
        v-for="box in list" 
        :key="box.boxID"
        @click="box.boxID ? navigateToBox(box.boxID) : null"
      >
        {{ box.boxName }}
      </li>
    </ul>
  </main>
</template>

<style scoped>
/* Add any required styles here */
</style>
