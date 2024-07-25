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

  function createBox() {
    const boxName = window.prompt("Box Name");
    const boxID = Math.random().toString(36).substring(2, 8); // Generate a random 6-character string

    client.models.Boxes.create({
      boxID: boxID,
      itemID: 'box_root',
      boxName: boxName // Assign the prompted value to boxName attribute
    }).then(() => {
      // After creating a new box, update the list of boxes
      listBoxes();
    });
  }

  function navigateToBox(boxID: string) {
    router.push(`/box/${boxID}`);
  }

  //function deleteBox(id: string) {
  //    client.models.Boxes.delete({ boxID })
  //  }
      
  // fetch boxes when the component is mounted
  onMounted(() => {
    listBoxes();
  });
</script>

<template>
  <main>
    <h1>📦 Boxes</h1>
    <button @click="createBox">+ New Box</button>
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
