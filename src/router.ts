// Imports
import { createRouter, createWebHistory } from 'vue-router';
import Boxes from './components/Boxes.vue';
import BoxNew from './components/BoxNew.vue';
import BoxDetails from './components/BoxDetails.vue';
import BoxEdit from './components/BoxEdit.vue';
import ItemNew from './components/ItemNew.vue';
import ItemEdit from './components/ItemEdit.vue';
import NotFound from './components/NotFound.vue';

// Vars
const routes = [
  { path: '/', component: Boxes },
  { path: '/box/new', component: BoxNew, props: true },
  { path: '/box/:boxID', component: BoxDetails, props: true },
  { path: '/box/:boxID/edit', component: BoxEdit, props: true },
  { path: '/box/:boxID/fill', component: ItemNew, props: true },
  { path: '/box/:boxID/item/:itemID/edit', component: ItemEdit, props: true },
  { path: '/:notFound(.*)', component: NotFound },
  { path: '/404', component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;