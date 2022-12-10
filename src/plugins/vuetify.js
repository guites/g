import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
    theme: { dark: true }, // TODO: implement theme toggle
    breakpoint: {
        mobileBreakpoint: 'sm' // This is equivalent to a value of 960
    }
});
