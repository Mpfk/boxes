// Imports
import { createRouter, createWebHistory } from 'vue-router';
import Boxes from './components/Boxes.vue';
import BoxDetails from './components/BoxDetails.vue';
import NotFound from './components/NotFound.vue';

// Vars
const routes = [
  { path: '/', component: Boxes },
  { path: '/box/:boxID', component: BoxDetails, props: true },
  { path: '/:notFound(.*)', component: NotFound },
  { path: '/404', component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;