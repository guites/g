<template>
  <div id="app">
   <header v-on:click="removeFlash($event)">
        <div class="inner-header">
            <nav>
                <ul>
                    <li><a href="/"><h1>gchan</h1><img src="@/assets/sham.png" alt="gchan logo"></a></li>
                    <li v-if="!isHome"><a href='/'>mensagens</a></li>
                    <li v-if="!isInfo"><a href='/#/info'>informações</a></li>
                    <li>
                      <a href='javascript:void(0)' v-if="!auth.loggedIn" v-on:click="janitor=!janitor">login</a>
                      <a href='javascript:void(0)' v-if="auth.loggedIn" v-on:click="logOut()">logout</a>
                    </li>
                </ul>
            </nav>
            <template>
                <form id="search-form" @submit.prevent="searchAction()">
                    <div>
                      <label for="search">Pesquisar</label>
                      <input v-model="searchText"
                      id="search"
                      name="search" type="search"
                      placeholder="Pesquise no site"
                      aria-label="Pesquisar">
                    </div>
                    <div>
                      <small v-if="searchText">aperte <span>&lt;enter&gt;</span>!</small>
                    </div>
                </form>
                <SearchBar :q="q">
                </SearchBar>
            </template>
        </div>
        <transition name="fadeForm">
          <div class="janitor-login" v-if="janitor">
            <form v-if="!auth.loggedIn" v-on:submit.prevent="login($event)">
              <div class="fields">
                <div class="login-wrapper">
                  <label for="janitor-login">email</label>
                  <input type="email" name="janitor-login"
                  id="janitor-login" v-model="username" required>
                </div>
                <div class="pwd-wrapper">
                  <label for="janitor-pass">senha</label>
                  <input type="password" name="janitor-pass"
                  id="janitor-pass" v-model="password" required>
                </div>
              </div>
              <div class="btns">
                <button type="submit">entrar</button>
                <button type="button" class="goto-form">recuperar senha</button>
                <a href='/#/info' v-if="isHome && !this.auth.loggedIn">
                  criar conta
                </a>
                <button v-if="isInfo && !this.auth.loggedIn"
                type="button"
                class="goto-form"
                title="ir para o formulário"
                @click="focusForm()">
                  criar conta
                </button>
              </div>
            </form>
            <div class="flash" :class="loginFlash.type" v-if="loginFlash.header">
              <button class='flash-btn' type="button" v-on:click="loginFlash.header = ''">x</button>
              <strong>{{loginFlash.header}}</strong>
              {{loginFlash.text}}
              <a :href="loginFlash.link">{{loginFlash.message}}</a>
            </div>
          </div>
        </transition>
        <div v-if="marquee"
        class="marquee">
          <p v-on:click="marqueeInput=!marqueeInput">⌨️</p>
          <span>
            <span v-for="marquee in marquees"
            :key="marquee.id"
            >
              <a v-if="marquee.has_url === 'true' || marquee.has_url === true"
              :href="marquee.href"
              target="_blank"
              rel="noreferrer"
              >
              {{marquee.content}};
              </a>
              <span v-else>
                {{marquee.content}};
              </span>
            </span>
          </span>
          <p v-on:click="marquee=!marquee">✖</p>
        </div>
        <transition name="fadeForm">
          <form id="marqueeForm"
          v-if="marqueeInput"
          @submit.prevent="addMarquee()">
            <div class="marquee-form-top">
              <input
                type="text"
                placeholder="Proibido mais de 50 chars neste fórum cristão"
                name="marqueeInput"
                v-model="marqueeMessage.content"
                required
                maxlength="50"
              >
              <input type="submit" value="Enviar">
            </div>
            <div class="marquee-form-bottom">
              <label for="marqueeCheckUrl">
                tem link?
                <input type="checkbox"
                id="marqueeCheckUrl"
                name="marqueeCheckUrl"
                v-model="marqueeMessage.has_url"
                >
              </label>
              <transition name="fade">
                <input
                type="url"
                name="marqueeUrl"
                placeholder="https://www.htmhell.dev/"
                v-model="marqueeMessage.href"
                v-if="marqueeMessage.has_url"
                required
                >
              </transition>
            </div>
            <div v-if="error" class='alert-error'>
              <span v-on:click="error=''">x</span>
              <h4>Erro!</h4>
              <p>{{error}}</p>
            </div>
          </form>
        </transition>

    </header>
    <!-- <Home :auth="this.auth"/> -->
    <router-view :auth="this.auth" class='container'/>
  </div>
</template>
<script>
//  force redirect to https
const host = 'gchan.com.br';
if (window.location.host === host && window.location.protocol !== 'https:') {
  window.location.protocol = 'https:';
}

import '@/assets/css/styles.css';
import SearchBar from './components/searchbar.vue';
export default {
  name: 'App',
  components: {
    SearchBar,
  },
  data: () => ({
    searchText: '',
    q: '',
    janitor: false,
    marquees: [],
    marquee: true,
    marqueeInput: false,
    marqueeMessage: {
      content: '',
      has_url: false,
      href: '',
    },
    error: '',
    username: '',
    password: '',
    auth: {
      loggedIn: '',
      username: '',
      id: '',
    },
    loginFlash: {
      type: '',
      header: '',
      text: '',
      message: '',
    },
  }),
  methods: {
    captchaV3() {
      const captchaScript = document.createElement('script');
      captchaScript.src = 'https://www.google.com/recaptcha/api.js?render=6LfB04AaAAAAAGTm-ljshaykXuT9YiePLxgqy471';
        document.head.appendChild(captchaScript);
    },
    searchAction() {
      this.q = this.searchText;
    },
    ajaxGtmRequest() {
      const gtmScript = document.createElement('script');
      gtmScript.type = 'text/javascript';
      const gtmCode = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-K57247W');`;
      try {
        gtmScript.appendChild(document.createTextNode(gtmCode));
        document.head.appendChild(gtmScript);
      } catch (e) {
        gtmScript.text = gtmCode;
        document.head.appendChild(gtmScript);
      }
    },
    getCookieValue(a) {
      const b = document.cookie.match(`(^|;)\\s*${a}\\s*=\\s*([^;]+)`);
      return b ? b.pop() : '';
    },
    checkCookies() {
      const consentCookie = this.getCookieValue('cookie_consent_variable');
      console.log(consentCookie);
      if (consentCookie !== '') {
        if (consentCookie === 'true') {
          this.ajaxGtmRequest();
        }
      } else {
        const date = new Date();
        const expires = new Date(date.getTime() + 365 * 24 * 60 * 60 * 1000).toGMTString();
        // default track
        document.cookie = `cookie_consent_variable=true;expires=${expires};path=/;Secure`;
        this.ajaxGtmRequest();
      }
    },
    async login(e) {
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = 'true';
      fetch(`${this.$backendURL}login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: `email=${this.username}&password=${this.password}`,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.id && data.name && data.email && data.password) {
            this.auth.loggedIn = true;
            this.auth.username = data.name;
            this.auth.id = data.id;
            this.loginFlash.type = 'success';
            this.loginFlash.header = 'Olá, ' + data.name + '!';
            this.loginFlash.link = '/';
            this.loginFlash.text = 'Seu login foi realizado!\nVocê já pode postar.\n';
            this.username = '';
            this.password = '';
          } else if (data.message) {
            this.loginFlash.type = 'error';
            this.loginFlash.header = 'Oh não!';
            this.loginFlash.text = `${data.message}\nTente novamente!\n`;
          }
          submitBtn.disabled = false;
        });
    },
    checkLogin() {
      fetch(`${this.$backendURL}login`, {
        method: 'GET',
        credentials: 'include',
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.id && data.name && data.email && data.password) {
            this.auth.loggedIn = true;
            this.auth.username = data.name;
            this.auth.id = data.id;
          } else {
            this.auth.loggedIn = '';
          }
        });
    },
    removeFlash(e) {
      if (e.target.classList.contains('flash') || e.target.closest('.flash')) {
        // caso clicar no popup, só fecha se for no Xzinho
        return;
      }
      if (this.loginFlash.header != '') {
        this.loginFlash.header = '';
      }
    },
    logOut() {
      fetch(`${this.$backendURL}logout`, {
        method: 'DELETE',
        credentials: 'include',
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.login) {
            this.auth.loggedIn = false;
            this.auth.username = '';
            this.auth.id = '';
          }
        });
    },
    showMarqueeOpts() {
      document.querySelector('.marquee').classList.toggle('has-opts');
    },
    clearMarqueeForm() {
      this.marqueeMessage.content = '';
      this.marqueeMessage.has_url = '';
      this.marqueeMessage.href = '';
    },
    addMarquee() {
      const submitButton = document.querySelector('#marqueeForm input[type="submit"]');
      submitButton.disabled = true;
      fetch(`${this.$backendURL}marquee`, {
        method: 'POST',
        body: JSON.stringify(this.marqueeMessage),
        headers: {
          'content-type': 'application/json',
        },
      }).then((response) => response.json()).then((result) => {
        console.log(result);
        if (result.error) {
          if (result.origin === 'psql') {
            if (result.code === '23505') {
              this.error = 'Aviso duplicado!\ngit gud e pense em algo novo antes de enviar ᕦ(ò_óˇ)ᕤ';
            }
          }
        } else {
          this.error = '';
          this.marqueeInput = false;
          this.marquees.unshift(JSON.parse(result));
          this.clearMarqueeForm();
        }
        submitButton.disabled = false;
      });
    },
    handleMarqueeResize() {
      const marqueeSpan = document.querySelector('.marquee > span');
      if (window.innerWidth > 979) {
        marqueeSpan.removeEventListener('click', this.showMarqueeOpts);
        marqueeSpan.addEventListener('mouseover', this.showMarqueeOpts);
        marqueeSpan.addEventListener('mouseout', this.showMarqueeOpts);
      } else {
        marqueeSpan.addEventListener('click', this.showMarqueeOpts);
        marqueeSpan.removeEventListener('mouseover', this.showMarqueeOpts);
        marqueeSpan.removeEventListener('mouseout', this.showMarqueeOpts);
      }
    },
    focusForm() {
      document.querySelector('#register form #name').focus();
    },
  },
  beforeMount() {
    this.checkLogin();
  },
  mounted() {
    this.captchaV3();
    this.checkCookies();
    fetch(`${this.$backendURL}marquee`).then((response) => response.json()).then((result) => {
      this.marquees = result.results;
    });
  },
  computed: {
    isHome() {
      return this.$route.name === 'Home';
    },
    isInfo() {
      return this.$route.name === 'Info';
    },
  },
};
</script>
