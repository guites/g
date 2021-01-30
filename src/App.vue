<template>
  <div id="app">
   <header>
        <div class="inner-header">
            <nav>
                <ul>
                    <li><h1>gchan</h1><img src="@/assets/sham.png" alt="gchan logo"></li>
                    <li v-if="!isHome"><a href='/'>mensagens</a></li>
                    <li v-if="!isInfo"><a href='/#/info'>informações</a></li>
                    <!-- <li>
                      <button v-if="!auth.loggedIn" v-on:click="janitor=!janitor">login</button>
                      <button v-if="auth.loggedIn" v-on:click="logOut()">logout</button>
                    </li> -->
                </ul>
            </nav>
            <!-- <form>
                <label for='search'>Busque:</label>
                <input type='text' name='search' placeholder='assunto/mensagem' required>
                <button type='sumit'>pesquisar</button>
            </form> -->
        </div>
        <!-- <transition name="fadeForm">
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
                <button type="button" class='img-wrapper' title="Informações"
                v-on:click="showOptions=!showOptions">
                  <img src="@/assets/information.png" alt="Registro/Alterar senha">
                </button>
                <a href='/#/info' v-if="isHome && showOptions && !this.auth.loggedIn">
                  criar conta
                </a>
                <button v-if="isInfo && showOptions && !this.auth.loggedIn"
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
        </transition> -->
        <div v-if="marquee"
        class="marquee">
          <p v-on:click="marqueeInput=!marqueeInput">⌨</p>
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
// import Home from '@/views/Home.vue';
const marqueeURL = 'http://localhost:5000/marquee';
export default {
  name: 'App',
  // components: {
  //   Home,
  // },
  data: () => ({
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
    SERVERurl: 'http://localhost:5000',
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
            this.loginFlash.link = '/';
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
    showMarqueeOpts() {
      document.querySelector('.marquee').classList.toggle('has-opts');
      // e.target.classList.toggle('has-opts');
    },
    clearMarqueeForm() {
      this.marqueeMessage.content = '';
      this.marqueeMessage.has_url = '';
      this.marqueeMessage.href = '';
    },
    addMarquee() {
      console.log('lol?');
      const submitButton = document.querySelector('#marqueeForm input[type="submit"]');
      submitButton.disabled = true;
      fetch(marqueeURL, {
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
    this.checkCookies();
    fetch(marqueeURL).then((response) => response.json()).then((result) => {
      this.marquees = result.results;
    });
    // this.handleMarqueeResize();
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
