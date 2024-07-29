<script setup lang="ts">
  // Imports
  import { onMounted, ref, inject, computed } from 'vue';
  import type { Schema } from '../../amplify/data/resource';
  import { generateClient } from 'aws-amplify/data';
  import { useRouter } from 'vue-router';

  // Define the type for HotBarButton
  interface HotBarButton {
    icon: string;
    description: string;
    onClick: () => void;
    buttonClass: string;
  }

  // Vars
  const client = generateClient<Schema>();
  const router = useRouter();
  const list = ref<Array<Schema['Boxes']["type"]>>([]);
  const groupedBoxes = ref<{ [key: string]: Schema['Boxes']["type"][] }>({});
  const searchTerm = ref('');
  const setHotBarButtons = inject<((buttons: HotBarButton[]) => void)>('setHotBarButtons');

  // Functions
  function listBoxes() {
    client.models.Boxes.observeQuery().subscribe({
      next: ({ items, isSynced }) => {
        list.value = items;
        groupAndSortBoxes();
      },
    });
  }

  function groupAndSortBoxes() {
    const groups: { [key: string]: Schema['Boxes']["type"][] } = {};
    list.value.forEach(item => {
      if (!groups[item.boxID]) {
        groups[item.boxID] = [];
      }
      groups[item.boxID].push(item);
    });

    Object.keys(groups).forEach(boxID => {
      groups[boxID].sort((a, b) => (a.itemID === 'box_root' ? -1 : 1));
    });

    groupedBoxes.value = groups;
  }

  function navigateToBox(boxID: string) {
    router.push(`/box/${boxID}`);
  }

  function navigateToItem(boxID: string, itemID: string) {
    router.push(`/box/${boxID}/item/${itemID}/edit`);
  }

  function navigateToNewBox() {
    router.push('/box/new');
  }

  // Fetch boxes when the component is mounted
  onMounted(() => {
    listBoxes();
    setHotBarButtons?.([
      { icon: '+', description: 'New', buttonClass: 'btn-success', onClick: navigateToNewBox },
    ]);
  });

  // Computed property for filtered boxes
  const filteredBoxes = computed(() => {
    const flatList: Schema['Boxes']["type"][] = [];
    if (!searchTerm.value) {
      // Show only items with box_root when there is no search term
      Object.keys(groupedBoxes.value).forEach(boxID => {
        const rootItem = groupedBoxes.value[boxID].find(item => item.itemID === 'box_root');
        if (rootItem) {
          flatList.push(rootItem);
        }
      });
    } else {
      // Show all filtered items and ensure box_root items are included
      Object.keys(groupedBoxes.value).forEach(boxID => {
        const items = groupedBoxes.value[boxID];
        const rootItem = items.find(item => item.itemID === 'box_root');
        const filteredItems = items.filter(item => {
          return Object.values(item).some(val => 
            val && val.toString().toLowerCase().includes(searchTerm.value.toLowerCase())
          );
        });

        if (filteredItems.length > 0) {
          if (rootItem && !filteredItems.includes(rootItem)) {
            filteredItems.unshift(rootItem);
          }
          flatList.push(...filteredItems);
        }
      });
    }
    return flatList;
  });
</script>

<template>
  <main>
    <div class="form-group mt-5">
      <input 
        type="text" 
        class="form-control form-control-lg" 
        id="search" 
        placeholder="🔎 Search Boxes and Items" 
        v-model="searchTerm" 
      />
    </div>
    <div class="mt-5">
      <div class="list-group">
        <div 
          v-for="box in filteredBoxes" 
          :key="box.boxID" 
          class="list-group-item list-group-item-action" 
            @click="box.itemID === 'box_root' ? navigateToBox(box.boxID) : navigateToItem(box.boxID, box.itemID)"
        >
          <div class="w-100">
            <span :class="{'fw-bold': box.itemID === 'box_root', 'text-secondary': box.itemID !== 'box_root'}">
              {{ box.itemID === 'box_root' ? box.boxName : '⮑ ' + box.itemName }}
            </span>
          </div>
          <small>{{ box.location }}</small>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
