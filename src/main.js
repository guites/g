import Vue from 'vue';
import Vuex from 'vuex';
import App from './App.vue';
import router from './router';

Vue.use(Vuex);
Vue.config.productionTip = false;

const store = new Vuex.Store();

new Vue({
  router,
  store,
  render(h) { return h(App); },
  created () {
    if (sessionStorage.redirect) {
      const redirect = sessionStorage.redirect;
      delete sessionStorage.redirect;
      this.$router.push(redirect);
    }
  }
}).$mount('#app');
