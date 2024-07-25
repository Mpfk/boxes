<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { generateClient } from 'aws-amplify/data';
  import type { Schema } from '../../amplify/data/resource';
  import BoxForm from './BoxForm.vue';

  // Vars
  const client = generateClient<Schema>();
  const router = useRouter();
  const boxName = ref('');
  const location = ref('');

  function updateBoxName(value: string) {
    boxName.value = value;
  }

  function updateLocation(value: string) {
    location.value = value;
  }

  async function saveBox() {
    const boxID = Math.random().toString(36).substring(2, 8); // Generate a random 6-character string

    try {
      await client.models.Boxes.create({
        boxID: boxID,
        itemID: 'box_root',
        boxName: boxName.value,
        location: location.value
      });
      console.log('Box created successfully:', boxName.value, boxID);
      router.push(`/box/${boxID}`);
    } catch (error) {
      console.error('Error creating box:', error);
    }
  }

  function goBack() {
    router.push('/');
  }
</script>

<template>
  <div>
    <h1>+ New Box</h1>
    <BoxForm :boxName="boxName" :location="location" @update="updateBoxName" @updateLocation="updateLocation" />
    <div class="control-group">
      <button @click="goBack">🔙 Back</button>
      <button @click="saveBox">💾 Save</button>
    </div>
  </div>
</template>

<style scoped>
/* Add any required styles here */
</style>
