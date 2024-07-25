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
  <form>
    <div>
      <label for="boxName">Box Name:</label>
      <input id="boxName" v-model="boxName" @input="updateBoxName" type="text" required />
    </div>
    <div>
      <label for="location">Location:</label>
      <input id="location" v-model="location" @input="updateLocation" type="text" required />
    </div>
  </form>
</template>

<style scoped>
/* Add any required styles here */
</style>
