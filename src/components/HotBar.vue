<template>
  <nav :class="['navbar fixed-bottom bg-body-tertiary', { 'center-single-button': buttons.length === 1 }]">
    <CircleButton 
      v-for="(button, index) in buttons" 
      :key="index" 
      :icon="button.icon"
      :description="button.description"
      :buttonClass="button.buttonClass"
      @click="button.onClick"
      class="hotbar-button"
    />
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CircleButton from './CircleButton.vue';

interface HotBarButton {
  icon: string;
  description: string;
  onClick: () => void;
  buttonClass: string;
}

const props = defineProps<{
  buttons: HotBarButton[];
}>();

const isSingleButton = computed(() => props.buttons.length === 1);
</script>

<style scoped>
.center-single-button {
  display: flex;
  justify-content: center;
}
</style>