import Vue from 'vue';
import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;
Vue.prototype.$projectURL = 'https://gchan.com.br/';
Vue.prototype.$backendURL = 'https://gchan-message-board.herokuapp.com/';

new Vue({
  router,
  render(h) { return h(App); }
}).$mount('#app');
