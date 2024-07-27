<script setup lang="ts">
import { ref, provide } from 'vue';
import { Authenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";
import Navbar from "./components/Navbar.vue";
import HotBar from './components/HotBar.vue';
import { toastStore } from './utils/toastStore';
import Toaster from './components/Toaster.vue';

interface HotBarButton {
  icon: string;
  description: string;
  onClick: () => void;
  buttonClass: string;
}

const hotBarButtons = ref<HotBarButton[]>([]);

function setHotBarButtons(buttons: HotBarButton[]) {
  hotBarButtons.value = buttons;
}

provide('setHotBarButtons', setHotBarButtons);
provide('addToast', toastStore.addToast);
</script>
<template>
  <main>
    <authenticator>
      <template v-slot="{ signOut }">
        <Navbar/>
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-3">
              <!-- Spacer -->
            </div>
            <div class="col-12 col-md-6">
              <router-view></router-view>
            </div>
            <div class="col-md-3">
              <!-- Spacer -->
            </div> 
          </div>
          <HotBar :buttons="hotBarButtons" />
        </div>
        <Toaster />
      </template>
    </authenticator>
  </main>
</template>