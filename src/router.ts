// src/router.ts
import { createRouter, createWebHistory } from 'vue-router';
import Boxes from './components/Boxes.vue';
import BoxDetails from './components/BoxDetails.vue';

const routes = [
  { path: '/', component: Boxes },
  { path: '/box/:boxID', component: BoxDetails, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;