import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Info from '../views/Info.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component() {
      return import(/* webpackChunkName: "about" */ '../views/About.vue');
    },
  },
  {
    path: '/info',
    name: 'Info',
    component: Info,
  },
];

const router = new VueRouter({
  // mode: 'history',
  routes,
});

export default router;
