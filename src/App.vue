<template>
  <div id="app">
   <header>
        <div class="inner-header">
            <nav>
                <ul>
                    <li><p>gchan</p><img src="@/assets/sham.png"></li>
                    <li v-if="!isHome"><a href='/g'>mensagens</a></li>
                    <li v-if="!isInfo"><a href='/g#/info'>info/minha conta</a></li>
                    <li>
                      <button v-if="!auth.loggedIn" v-on:click="janitor=!janitor">login</button>
                      <button v-if="auth.loggedIn" v-on:click="logOut()">logout</button>
                    </li>
                </ul>
            </nav>
            <!-- <form>
                <label for='search'>Busque:</label>
                <input type='text' name='search' placeholder='assunto/mensagem' required>
                <button type='sumit'>pesquisar</button>
            </form> -->
        </div>
        <div class="janitor-login" v-if="janitor">
          <form v-if="!auth.loggedIn" v-on:submit.prevent="login($event)">
            <div class="fields">
              <div class="login-wrapper">
                <label for="janitor-login">email:</label>
                <input type="email" name="janitor-login"
                id="janitor-login" v-model="username" required>
              </div>
              <div class="pwd-wrapper">
                <label for="janitor-pass">pass:</label>
                <input type="password" name="janitor-pass"
                id="janitor-pass" v-model="password" required>
              </div>
            </div>
            <div class="btns">
              <button type="submit">entrar</button>
              <button type="button" v-if="showOptions">recuperar senha</button>
              <a href='/g#/info' v-if="showOptions && !this.auth.loggedIn">criar conta</a>
              <div class='img-wrapper' title="Informações"
              v-on:click="showOptions=!showOptions">
                <img src="@/assets/information.png" alt="Registro/Alterar senha">
              </div>
            </div>
          </form>
          <div class="flash" :class="loginFlash.type" v-if="loginFlash.header">
            <button class='flash-btn' type="button" v-on:click="loginFlash.header = ''">x</button>
            <strong>{{loginFlash.header}}</strong>
            {{loginFlash.text}}
            <a :href="loginFlash.link">{{loginFlash.message}}</a>
          </div>
        </div>
    </header>
    <!-- <Home :auth="this.auth"/> -->
    <router-view :auth="this.auth" class='container'/>
  </div>
</template>
<script>
// import Home from '@/views/Home.vue';

export default {
  name: 'App',
  // components: {
  //   Home,
  // },
  data: () => ({
    janitor: false,
    username: '',
    password: '',
    SERVERurl: 'https://gchan-message-board.herokuapp.com',
    showOptions: '',
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
      if (consentCookie !== '') {
        this.cookie_consent = consentCookie;
      } else {
        const date = new Date();
        const expires = new Date(date.getTime() + 365 * 24 * 60 * 60 * 1000).toGMTString();
        document.cookie = `cookie_consent_variable=true;expires=${expires}`;
        this.cookie_consent = true;
      }
      window.ua_consent = consentCookie;
      this.ajaxGtmRequest();
      return consentCookie;
    },
    async login() {
      fetch(`${this.SERVERurl}/login`, {
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
            this.loginFlash.header = 'Parabéns!';
            this.loginFlash.link = '/g';
            this.loginFlash.text = 'Login realizado com sucesso!\nVocê já pode postar.\n';
            this.username = '';
            this.password = '';
          } else if (data.message) {
            this.loginFlash.type = 'error';
            this.loginFlash.header = 'Oh não!';
            this.loginFlash.text = `${data.message}\nTente novamente!\n`;
          }
        });
    },
    checkLogin() {
      fetch(`${this.SERVERurl}/login`, {
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
    logOut() {
      fetch(`${this.SERVERurl}/logout`, {
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
  },
  beforeMount() {
    this.checkLogin();
  },
  mounted() {
    this.checkCookies();
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
