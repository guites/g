import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Info from '../views/Info.vue';
import Post from '../views/Post.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: "gchan: um lugar para amigos"
    }
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

const DEFAULT_TITLE = 'gchan: um lugar para amigos';
router.afterEach((to, from) => {
  Vue.nextTick(() => {
    if (to.name != "Post") {
      document.title = to.meta.title || DEFAULT_TITLE;
    }
  });
})

export default router;
