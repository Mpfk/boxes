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
  const location = ref('');
  const router = useRouter();
  const boxID = ref('');
  const list = ref<Array<Schema['Boxes']["type"]>>([]);

  // Functions
  onMounted(async () => {
    boxID.value = route.params.boxID as string;
    const response = await client.models.Boxes.get({ boxID: boxID.value, itemID: 'box_root' });
    if (response.data) {
      boxName.value = response.data.boxName || '';
      location.value = response.data.location || '';
    } else {
      console.error('Box data not found', response.errors);
      router.push('/404');
    }
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
  // fetch items when the component is mounted
  onMounted(() => {
    listContents();
  });
</script>

<template>
  <div>
    <h1>📦 {{ boxName }} <span @click="editBox">(edit)</span></h1>
    <p>{{ location }}</p>

    <h4>Contents:</h4>
    <ul>
      <li 
        v-for="item in list" 
        :key="item.itemID"
        @click="editItem(item.itemID)"
      >
        {{ item.itemName }}
      </li>
    </ul>


    <button @click="returnHome">🔙 Return Home</button>
    <button @click="addItems">📥 Add Items</button>
    <button @click="returnHome">☑️ Select Multiple</button>
  </div>
</template>