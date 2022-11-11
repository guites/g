<template>
  <div class="about">
    <h1>Bem-vindo ao gchan!</h1>
    <img src="@/assets/gchan_hero.jpg" alt="poste no gchan">
    <img style="display: none;" src="@/assets/volume-high.png" alt="Volume">
    <section id="cookies">
      <div id="cookies-text">
        <p>o <b>gchan</b> usa o
        <a href="https://twitter.com/googleanalytics" target="_blank"
        rel="noreferrer">google analytics</a>
        para contabilizar os acessos e as ações mais frequentes realizadas no site.<br/>
        Fique à vontade para bloquear a coleta dos dados.
        </p>
        <p>você pode alterar suas preferências abaixo.</p>
        <form>
          <select name="cookie-consent" id="cookie-consent"
          @change="selectCookieConsent($event)" v-model="cookie_consent_computed">
            <option value="true">aceito a coleta de dados</option>
            <option value="false">recuso a coleta de dados</option>
          </select>
        </form>
      </div>
    </section>
  </div>
</template>
<script>
export default {
  name: 'Info',
  computed: {
    cookie_consent_computed: {
      get() {
        const b = document.cookie.match('(^|;)\\s*cookie_consent_variable\\s*=\\s*([^;]+)');
        return b ? b.pop() : 'true';
      },
      set() {
      },
    },
  },
  methods: {
    selectCookieConsent(e) {
      const domain = window.location.hostname;
      const expires = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toGMTString();
      const cookieConsent = e.target.selectedOptions[0].value;
      if (cookieConsent === 'false') {
        const date = new Date(0).toGMTString();
        document.cookie = `_gat_UA-182341584-1=;expires=${date};domain=.${domain};path=/`;
        document.cookie = `_ga=;expires=${date};domain=.${domain};path=/`;
        document.cookie = `_gid=;expires=${date};domain=.${domain};path=/`;
      }
      document.cookie = `cookie_consent_variable=${cookieConsent};expires=${expires};path=/;Secure`;
    },
  },
};
</script>
