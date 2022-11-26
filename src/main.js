import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false;
Vue.prototype.$projectURL = 'http://localhost:8080/';
Vue.prototype.$backendURL = 'http://localhost:4450/';
Vue.prototype.$captchaClient = '6LfB04AaAAAAAGTm-ljshaykXuT9YiePLxgqy471';
Vue.prototype.$productionURL = 'gchan.com.br';
Vue.prototype.$messages = 'messages';

new Vue({
  router,
  vuetify,
  render(h) { return h(App); }
}).$mount('#app');
