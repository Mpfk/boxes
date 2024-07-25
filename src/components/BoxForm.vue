<script setup lang="ts">
    // Imports
    import { defineEmits, defineProps, ref, watch } from 'vue';

    // Props
    const props = defineProps({
        boxName: String,
        location: String,
    });

    // Vars
    const emit = defineEmits(['update', 'inputChanged']);
    const boxName = ref(props.boxName || '');
    const location = ref(props.location || '');

    // Watch for prop changes to update local state
    watch(() => props.boxName, (newVal) => {
        boxName.value = newVal || '';
    });

    watch(() => props.location, (newVal) => {
        location.value = newVal || '';
    });

    // Functions
    function submitForm() {
        emit('update', { boxName: boxName.value, location: location.value });
    }

    function handleInput() {
        emit('inputChanged', { boxName: boxName.value, location: location.value });
    }
</script>

<template>
  <form @submit.prevent="submitForm">
    <div>
      <label for="boxName">Box Name:</label>
      <input id="boxName" v-model="boxName" @input="handleInput" type="text" required />
    </div>
    <div>
      <label for="location">Location:</label>
      <input id="location" v-model="location" @input="handleInput" type="text" required />
    </div>
  </form>
</template>

<style scoped>
</style>