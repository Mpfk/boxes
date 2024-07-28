<script setup lang="ts">
import { defineEmits, defineProps, ref, watch } from 'vue';

// Props
const props = defineProps({
  initialItemName: String,
  initialQuantity: Number,
  initialNote: String
});

// Emits
const emit = defineEmits(['update']);

// Vars
const itemName = ref(props.initialItemName || '');
const quantity = ref(props.initialQuantity || 0);
const note = ref(props.initialNote || '');

watch(() => props.initialItemName, (newVal) => {
  itemName.value = newVal || '';
});

watch(() => props.initialQuantity, (newVal) => {
  quantity.value = newVal || 0;
});

watch(() => props.initialNote, (newVal) => {
  note.value = newVal || '';
});

function updateItem() {
  emit('update', { itemName: itemName.value, quantity: quantity.value, note: note.value });
}
</script>

<template>
  <div class="border rounded p-4">
    <div class="mb-3">
      <label for="itemName" class="form-label">Item Name</label>
      <input id="itemName" class="form-control" v-model="itemName" @input="updateItem" type="text" />
      <div id="nameHelp" class="form-text">Required</div>
    </div>
    <div class="mb-3">
      <label for="quantity" class="form-label">Quantity</label>
      <input id="quantity" class="form-control" v-model="quantity" @input="updateItem" type="number" />
    </div>
    <div class="mb-3">
      <label for="note" class="form-label">Note</label>
      <textarea id="note" class="form-control" v-model="note" @input="updateItem"></textarea>
    </div>
  </div>
</template>