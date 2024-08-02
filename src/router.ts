// Imports
import { createRouter, createWebHistory } from 'vue-router';
const Boxes = () => import('./components/Boxes.vue');
const NotFound = () => import('./views/NotFound.vue');

// Routes
const routes = [
  { path: '/', 
    component: Boxes 
  },
  { 
    path: '/options', 
    component: () => import('./views/Options.vue') 
  },
  { 
    path: '/box/new', 
    component: () => import('./components/BoxNew.vue'), 
    props: true 
  },
  { 
    path: '/box/:boxID', 
    component: () => import('./components/BoxDetails.vue'), 
    props: true 
  },
  { 
    path: '/box/:boxID/edit', 
    component: () => import('./components/BoxEdit.vue'), 
    props: true 
  },
  { 
    path: '/box/:boxID/fill', 
    component: () => import('./components/ItemNew.vue'), 
    props: true 
  },
  { 
    path: '/box/:boxID/item/:itemID/edit', 
    component: () => import('./components/ItemEdit.vue'), 
    props: true 
  },
  { 
    path: '/:notFound(.*)', 
    component: NotFound 
  },
  { 
    path: '/404', 
    component: NotFound 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});

export default router;