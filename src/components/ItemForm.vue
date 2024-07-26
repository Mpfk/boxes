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
  <div class="border rounded p-4">
    <div class="mb-3">
      <label for="itemName" class="form-label">Item Name</label>
      <input id="itemName" class="form-control" v-model="itemName" @input="updateItemName" type="text" />
      <div id="nameHelp" class="form-text">Required</div>
    </div>
  </div>
</template>

<style scoped>
/* Add any required styles here */
</style>
