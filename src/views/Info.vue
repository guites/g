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
    <section id="register">
      <h3 v-if="!auth.loggedIn">Criar uma conta</h3>
      <h3 v-if="auth.loggedIn">Bem vindo, {{auth.username}}</h3>
      <form v-if="!auth.loggedIn" v-on:submit.prevent="register($event)">
        <label for="name">nick</label>
        <input type="text" minlength=4 maxlength=20 name="name" id="name" v-model="name" required>
        <label for="email">email</label>
        <input type="email" name="email" id="email" v-model="email" required>
        <label for="password">senha</label>
        <input type="password" minlength=6 name="password" id="password" v-model="password" required>
        <label for="password_confirm">confirme sua senha</label>
        <input type="password" minlength=6 name="password_confirm" id="password_confirm" v-model="password_confirm" required>
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
        <a target="_blank" :href="signUpFlash.link">{{signUpFlash.message}}</a>
      </div>
    </section>
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
    show_pwd_checked: '',
    name: '',
    email: '',
    password: '',
    password_confirm: '',
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
      const pwdField = document.querySelectorAll('#password,#password_confirm');
      pwdField.forEach((pwd) => {
        const type = pwd.getAttribute('type');
        if (type === 'password') {
          pwd.setAttribute('type', 'text');
        } else {
          pwd.setAttribute('type', 'password');
        }
      });
    },
    register(e) {
      e.preventDefault();
      const pwd = e.target.querySelector('#password');
      const pwdConfirm = e.target.querySelector('#password_confirm');
      if (pwd.value != pwdConfirm.value) {
        this.signUpFlash.type = 'error';
        this.signUpFlash.header = 'ow carai!';
        this.signUpFlash.link = 'https://guites.github.io/pwdgen/';
        this.signUpFlash.text = 'A senha não bate com a confirmação.\nVerifique plx. \n';
        this.signUpFlash.message = '(‡▼益▼)';
        return;
      }
      fetch(`${this.$backendURL}register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `name=${this.name}&email=${this.email}&password=${this.password}`,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            this.signUpFlash.type = 'error';
            this.signUpFlash.header = 'Oh não!';
            //this.signUpFlash.link = '#contact';
            this.signUpFlash.text = `Oops: ${data.error}\n`;
            this.signUpFlash.message = 'Não desista! (｀∀´)Ψ';
          } else if (data === 'success') {
            e.target.reset();
            this.signUpFlash.type = 'success';
            this.signUpFlash.header = 'Bem vindo!';
            this.signUpFlash.text = `Cadastro realizado com sucesso, ${this.username}!\nRealizando login...\n`;
            this.signUpFlash.message = 'Aguarde...';
            this.login();
          } else {
            this.signUpFlash.type = 'error';
            this.signUpFlash.header = 'Oh-oh!';
            this.signUpFlash.link = '/';
            this.signUpFlash.text = `Ocorreu algum erro bizarro no processo.`;
            this.signUpFlash.message = 'Faça um post reclamando! ٩(^ᴗ^)۶';
          }
        });
    },
    async login() {
      fetch(`${this.$backendURL}login`, {
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
