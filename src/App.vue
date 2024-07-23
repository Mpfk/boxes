<script setup lang="ts">
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import Todos from './components/Todos.vue'
</script>

<template>
  <main>
    <authenticator>
      <template v-slot="{ signOut }">
        <Todos />
        <button @click="signOut">Sign Out</button>
      </template>
    </authenticator>
  </main>
</template>

