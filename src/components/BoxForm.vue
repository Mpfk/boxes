<script setup lang="ts">
  import { defineEmits, defineProps, ref, watch } from 'vue';

  // Props
  const props = defineProps({
    boxName: String,
    location: String,
  });

  // Emits
  const emit = defineEmits(['update', 'updateLocation', 'inputChanged']);

  // Vars
  const boxName = ref(props.boxName || '');
  const location = ref(props.location || '');

  watch(() => props.boxName, (newVal) => {
    if (newVal !== boxName.value) {
      boxName.value = newVal || '';
    }
  });

  watch(() => props.location, (newVal) => {
    if (newVal !== location.value) {
      location.value = newVal || '';
    }
  });

  function updateBoxName() {
    emit('update', boxName.value);
    emit('inputChanged', { boxName: boxName.value, location: location.value });
  }

  function updateLocation() {
    emit('updateLocation', location.value);
    emit('inputChanged', { boxName: boxName.value, location: location.value });
  }
</script>

<template>
  <form class="border rounded p-4">
    <div class="mb-3">
      <label for="boxName" class="form-label">Box Name</label>
      <input id="boxName" class="form-control" v-model="boxName" @input="updateBoxName" type="text" required />
      <div id="nameHelp" class="form-text">Required</div>
    </div>
    <div class="mb-3">
      <label for="location" class="form-label">Location</label>
      <input id="location" class="form-control" v-model="location" @input="updateLocation" type="text" required />
    </div>
  </form>
</template>

<style scoped>
/* Add any required styles here */
</style>
