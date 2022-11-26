<template>
  <v-app>
    <AppBar></AppBar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import "@/assets/css/styles.css";
import AppBar from "./components/appbar.vue";
export default {
  name: "App",
  components: {
    AppBar,
  },
  data: () => ({
    productionHost: "gchan.com.br",
  }),
  computed: {
    isProduction() {
      return window.location.host === this.productionHost;
    },
  },
  methods: {
    loadCaptchaV3() {
      const captchaScript = document.createElement("script");
      captchaScript.src = `https://www.google.com/recaptcha/api.js?render=${this.$captchaClient}`;
      document.head.appendChild(captchaScript);
    },
  },
  mounted() {
    if (this.isProduction) {
      if (window.location.protocol !== "https:") {
        //  force redirect to https
        return (window.location.protocol = "https:");
      }
      this.loadCaptchaV3();
    }
  },
};
</script>
