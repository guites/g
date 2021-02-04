<template>
  <div class="about">
    <h1>informações gerais.</h1>
    <section id="cookies">
      <div id="cookies-text">
        <p>o <b>gchan</b> usa o
        <a href="https://twitter.com/googleanalytics" target="_blank"
        rel="noreferrer">google analytics</a>
        para contabilizar os acessos e as ações mais frequentes realizadas no site.<br/>
        a ideia é estimar o que os usuários fazem em quais horários
        como forma de feedback para melhorar.<br/>
        Fique à vontade para bloquear a coleta dos dados.
        </p>
        <p>você pode alterar suas preferências abaixo.</p>
        <form>
          <h2>Sobre o envio de dados anônimos de uso:</h2>
          <select name="cookie-consent" id="cookie-consent"
          @change="selectCookieConsent($event)" v-model="cookie_consent_computed">
            <option value="true">aceito a coleta de dados</option>
            <option value="false">recuso a coleta de dados</option>
          </select>
        </form>
      </div>
    </section>
    <!-- <section id="register">
      <h3 v-if="!auth.loggedIn">Criar uma conta</h3>
      <h3 v-if="auth.loggedIn">Bem vindo, {{auth.username}}</h3>
      <form v-if="!auth.loggedIn" v-on:submit.prevent="register($event)">
        <label for="name">nome</label>
        <input type="text" name="name" id="name" v-model="name" required>
        <label for="email">email</label>
        <input type="email" name="email" id="email" v-model="email" required>
        <label for="password">senha</label>
        <input type="password" name="password" id="password" v-model="password" required>
        <div class="checkbox-wrapper">
          <input @change="showPassword()" type="checkbox" name="mostrar-senha" id="mostrar-senha">
          <label for="mostrar-senha">mostrar senha</label>
        </div>
        <input type="submit" value="Enviar">
      </form>
      <div class="flash" :class="signUpFlash.type" v-if="signUpFlash.header">
        <button class='flash-btn' type="button" v-on:click="signUpFlash.header = ''">x</button>
        <strong>{{signUpFlash.header}}</strong>
        {{signUpFlash.text}}
        <a :href="signUpFlash.link">{{signUpFlash.message}}</a>
      </div>
    </section> -->
  </div>
</template>
<script>
export default {
  name: 'Info',
  props: {
    auth: {
      default: () => ({
        username: '',
        loggedIn: '',
      }),
      type: Object,
    },
  },
  data: () => ({
    SERVERurl: 'http://localhost:5000',
    show_pwd_checked: '',
    name: '',
    email: '',
    password: '',
    signUpFlash: {
      type: '',
      header: '',
      text: '',
      message: '',
    },
  }),
  mounted() {
  },
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
    showPassword() {
      const pwdField = document.querySelector('#password');
      const type = pwdField.getAttribute('type');
      if (type === 'password') {
        pwdField.setAttribute('type', 'text');
      } else {
        pwdField.setAttribute('type', 'password');
      }
    },
    register(e) {
      fetch(`${this.SERVERurl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `name=${this.name}&email=${this.email}&password=${this.password}`,
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data) {
            this.signUpFlash.type = 'error';
            this.signUpFlash.header = 'Oh não!';
            this.signUpFlash.link = '#contact';
            this.signUpFlash.text = 'Ocorreu um erro ao realizar seu cadastro.\nAtualize a página ou \n';
            this.signUpFlash.message = 'entre em contato.';
          } else if (data === 'success') {
            e.target.reset();
            this.signUpFlash.type = 'success';
            this.signUpFlash.header = 'Bem vindo!';
            // this.signUpFlash.link = '/';
            this.signUpFlash.text = `Cadastro realizado com sucesso, ${this.username}!\nRealizando login...\n`;
            this.signUpFlash.message = 'Aguarde...';
            this.login();
          } else {
            console.log(data);
          }
        });
    },
    async login() {
      fetch(`${this.SERVERurl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: `email=${this.email}&password=${this.password}`,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.id && data.name && data.email && data.password) {
            this.auth.loggedIn = true;
            this.auth.username = data.name;
            this.signUpFlash.type = 'success';
            this.signUpFlash.header = 'Parabéns!';
            this.signUpFlash.link = '/';
            this.signUpFlash.text = 'Login realizado com sucesso!\nVocê já pode postar.\n';
            this.signUpFlash.message = 'Ir para as postagens!';
            this.username = '';
            this.password = '';
          } else if (data.message) {
            this.signUpFlash.type = 'error';
            this.signUpFlash.header = 'Oh não!';
            this.signUpFlash.text = `${data.message}\nTente novamente!\n`;
          }
        });
    },
  },
};
</script>
