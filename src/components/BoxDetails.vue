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

  function addItem() {
    const itemName = window.prompt("Item Name");
    const itemID = Math.random().toString(36).substring(2, 8); // Generate a random 6-character string

    client.models.Boxes.create({
      //boxID: `${boxID}#${itemID}`,
      boxID: boxID.value,
      itemID: itemID,
      itemName: itemName,
    }).then(() => {
      console.log('Item added' + itemName + itemID);
      listContents();
    });
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
        v-for="box in list" 
        :key="box.boxID"
        @click="box.boxID ? returnHome() : null"
        >
        {{ box.itemName }}
      </li>
    </ul>


    <button @click="returnHome">🔙 Return Home</button>
    <button @click="addItem">📥 Add Items</button>
    <button @click="returnHome">☑️ Select Multiple</button>
  </div>
</template>