<script setup lang="ts">
  // Imports
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { generateClient } from 'aws-amplify/data';
  import type { Schema } from '../../amplify/data/resource';
  import { useRouter } from 'vue-router';

  // Vars
  const route = useRoute();
  const client = generateClient<Schema>();
  const boxName = ref('');
  const router = useRouter();

  // Functions
  onMounted(async () => {
    const boxID = route.params.boxID as string;
    const response = await client.models.Boxes.get({ boxID: boxID });
    if (response.data) {
      boxName.value = response.data.boxName || '';
    } else {
      console.error('Box data not found', response.errors);
      router.push('/404');
    }
  });
</script>

<template>
  <div>
    <h2>📝 Box Contents</h2>
    <h1>{{ boxName }}</h1>
    <!-- Placeholder for more items -->
  </div>
</template>