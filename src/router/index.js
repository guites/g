import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Info from '../views/Info.vue';
import Post from '../views/Post.vue';
import New from '../views/New.vue';
import About from '../views/About.vue';

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
    component: About,
  },
  {
    path: '/info',
    name: 'Info',
    component: Info,
  },
  {
    path: '/post/:id',
    name: 'Post',
    component: Post,
    props: (route) => {
      const id = Number.parseInt(route.params.id, 10);
      return { id };
    },
  },
  {
    path: '/new',
    name: 'New post',
    component: New,
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

router.beforeEach((to, from, next) => {
  // Redirect if fullPath begins with a hash (ignore hashes later in path)
  if (to.fullPath.substr(0, 2) === '/#') {
    const path = to.fullPath.substr(2);
    next(path);
    return;
  }
  next();
});

export default router;
