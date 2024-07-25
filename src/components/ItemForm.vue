<script setup lang="ts">
  import { defineEmits, defineProps, ref, watch } from 'vue';

  // Props
  const props = defineProps({
    initialItemName: String
  });

  // Emits
  const emit = defineEmits(['update']);

  // Vars
  const itemName = ref(props.initialItemName || '');

  watch(() => props.initialItemName, (newVal) => {
    itemName.value = newVal || '';
  });

  function updateItemName() {
    emit('update', itemName.value);
  }
</script>

<template>
  <div>
    <label for="itemName">Item Name:</label>
    <input id="itemName" v-model="itemName" @input="updateItemName" type="text" />
  </div>
</template>

<style scoped>
/* Add any required styles here */
</style>
