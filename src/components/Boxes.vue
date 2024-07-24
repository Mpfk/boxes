<script setup lang="ts">
import '@/assets/main.css';
import { onMounted, ref } from 'vue';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';
const client = generateClient<Schema>();
// create a reactive reference to the array of boxes
const boxes = ref<Array<Schema['Boxes']["type"]>>([]);
function listBoxes() {
  client.models.Boxes.observeQuery().subscribe({
    next: ({ items, isSynced }) => {
      boxes.value = items
     },
  }); 
}
function createBox() {
  client.models.Boxes.create({
    boxID: window.prompt("Box Name")
  }).then(() => {
    // After creating a new box, update the list of boxes
    listBoxes();
  });
}
function deleteBox(id: string) {
    client.models.Boxes.delete({ id })
  }
    
// fetch boxes when the component is mounted
 onMounted(() => {
  listBoxes();
});
</script>

<template>
  <main>
    <h1>📦 Your Boxes</h1>
    <button @click="createBox">+ New Box</button>
    <ul>
      <li 
        v-for="box in boxes" 
        :key="box.id"
        @click="deleteBox(box.id)"
        >
        {{ box.boxID }}
      </li>
    </ul>
  </main>
</template>
