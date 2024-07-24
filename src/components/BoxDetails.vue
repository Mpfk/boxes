<template>
  <div>
    <h2>📝 Box Contents</h2>
    <h1>{{ boxName }}</h1>
    <!-- Placeholder for more items -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const route = useRoute();
const client = generateClient<Schema>();
const boxName = ref('');

onMounted(async () => {
  const boxID = route.params.boxID as string;
  const response = await client.models.Boxes.get({ id: boxID });
  // Assuming the structure includes a data property
  if (response.data) {
    boxName.value = response.data.boxName || '';
  } else {
    console.error('Box data not found', response.errors);
    // Handle the case where data is not available, e.g., display an error message
  }
});
</script>