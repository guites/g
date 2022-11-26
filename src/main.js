import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false;
Vue.prototype.$projectURL = 'https://gchan.com.br/';
Vue.prototype.$backendURL = 'https://gchan-message-board.herokuapp.com/';
Vue.prototype.$captchaClient = '6LfB04AaAAAAAGTm-ljshaykXuT9YiePLxgqy471';

new Vue({
  router,
  vuetify,
  render(h) { return h(App); }
}).$mount('#app');
