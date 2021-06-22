<template>
  <div>
     <section class="create-thread">
      <form @submit.prevent="addMessage()">
        <div v-if="error" class='alert-error'>
          <span v-on:click="error=''">x</span>
          <h4>Erro!</h4>
          <p>{{error}}</p>
       </div>
        <div class="form-group">
          <label for="username">Usuário</label>
          <input type="text" class="form-control" id="username"
          aria-describedby="usernameHelp"
          placeholder="anônimo"
          v-model="message.username"
          maxlength=30
          required
          @focus="clearName($event)"
          @focusout="checkForName($event)"
          >
          <small v-if="auth.id" id="usernameHelp" class="form-text text-muted">
            anonimato é para os fracos
          </small>
          <small v-else id="usernameHelp" class="form-text text-muted">
            {{smallUsernamePhrase}}
          </small>
        </div>
        <div class="form-group">
          <div class="form-subject">
            <label for="tem-assunto">colocar assunto?</label>
            <input type="checkbox" name="tem-assunto"
            id="tem-assunto" @change="toggleSubject">
          </div>
          <input v-model="message.subject" type="text" class="form-control"
          id="subject" placeholder="assunto"
          v-if="this.hasSubject === true"
          maxlength=50
          required>
        </div>
        <div class="form-group">
          <label for="message">Mensagem</label>
          <textarea v-model="message.message" class="form-control" id="message" rows="5"
          placeholder="mensagem"
          required maxlength=250>
          </textarea>
        </div>
        <div class="form-group">
          <label for="imageURL" v-if="!this.optUpload">
            URL da imagem/gif/vídeo</label>
          <input v-model="message.imageURL" type="url" class="form-control"
          id="imageURL" placeholder="https://~"
          :readonly="this.optUpload === true"
          :disabled="this.$route.query.mediaUrl"
          >
        </div>
        <button type="submit" class="btn btn-primary">Enviar</button>
    </form>
    <div v-if="this.$route.query.mediaUrl" class="imagePreview">
      <img v-if="this.$route.query.type === 'image'" :src="this.$route.query.mediaUrl"
      id="imageToUpload"
      alt="pré-visualização de imagem para upload">
      <div class="video-wrap"
      v-else-if="this.$route.query.type === 'video'">
        <video
        id="videoToUpload"
        :src="this.$route.query.mediaUrl"
        autoplay="true"
        loop="true"
        muted="true"
        playsinline="true"
        class="videoPreview"
        >
        </video>
        <button @click="toggleAudioOnClick" type="button" class="volume">
          <img src="@/assets/volume-off.png" alt="Volume">
        </button>
      </div>
      <p v-else>Formato não suportado! ::(</p>
    </div>
    </section>
  </div>
</template>

<script>
// The .bind method from Prototype.js 
if (!Function.prototype.bind) { // check if native implementation available
  Function.prototype.bind = function(){ 
    var fn = this, args = Array.prototype.slice.call(arguments),
        object = args.shift(); 
    return function(){ 
      return fn.apply(object, 
        args.concat(Array.prototype.slice.call(arguments))); 
    }; 
  };
}
export default {
  name: 'Home',
  props: {
    auth: {
      default: () => ({
        username: '',
        loggedIn: '',
        id: '',
      }),
      type: Object,
    },
  },
  data: () => ({
    apiURL: 'messages/',
    optUpload: '',
    messages: [],
    replyObserver: null,
    messageToReplyTo: '',
    quotesToAdd: '',
    gifsPerPage: 4,
    currPage: 1,
    numPages: 5,
    error: '',
    apiRoute: 'giphy',
    isGifBeingSearched: '',
    emptyGifResults: '',
    hasPag: '',
    gifs: [],
    hasSubject: false,
    message: {
      username: 'anônimo',
      subject: '',
      message: '',
      imageURL: '',
      user_id: 0,
      gif_origin: 'none',
    },
    isPreviewing: '',
    allowedUploadVideoFormats: [
      'video/mp4',
      'video/webm',
      'video/x-matroska',
      'video/quicktime',
      'video/x-flv',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/mpeg',
    ],
    offset: 0,
    messagesBatchSize: 15,
  }),
  computed: {
    smallUsernamePhrase() {
      const phrases = [
        { quote: 'o que é que há, pois, num nome?', reference: 'https://pt.wikipedia.org/wiki/William_Shakespeare' },
        { quote: 'remember: no use for a name', reference: 'https://www.youtube.com/watch?v=mEdd1NHnwIE' },
        { quote: 'o homem é menos ele mesmo quando fala de sua pessoa', reference: 'https://pt.wikipedia.org/wiki/Oscar_Wilde' },
        { quote: 'o anonimato é a fama do futuro', reference: 'https://pt.wikipedia.org/wiki/John_Boyle' },
        { quote: 'a vingança nunca é plena, mata a alma e a envenena', reference: 'https://pt.wikiquote.org/wiki/Seu_Madruga' },
        { quote: 'Ski-bi dibby dib yo da dub dub', reference: 'https://www.youtube.com/watch?v=Hy8kmNEo1i8' },
        { quote: 'Baby don\'t hurt me', reference: 'watsalov' },
      ];
      return phrases[Math.floor((phrases.length * Math.random()))].quote;
    },
  },
  mounted() {
    if (this.$route.query.mediaUrl) {
      this.message.imageURL = this.$route.query.mediaUrl;
    }
  },
  methods: {
    hasAudio(video) {
      return video.mozHasAudio
      || Boolean(video.webkitAudioDecodedByteCount)
      || Boolean(video.audioTracks && video.audioTracks.length);
    },
    toggleAudioOnClick(e) {
      const clickedOn = e.target;
      let video;
      let audioImg;
      if (clickedOn.tagName === 'BUTTON') {
        video = clickedOn.previousElementSibling;
        audioImg = clickedOn.children.shift();
      } else if (clickedOn.tagName === 'IMG') {
        video = clickedOn.parentElement.previousElementSibling;
        audioImg = clickedOn;
      }
      console.log(video);
      video.muted = !video.muted;
      if (video.muted) {
        audioImg.src = './volume-off.png';
      } else {
        audioImg.src = './volume-high.png';
      }
    },
    toggleSubject() {
      this.hasSubject = !this.hasSubject;
    },
    clearName(e) {
      if (e.target.value === 'anônimo') {
        e.target.value = '';
      }
    },
    checkForName(e) {
      if (e.target.value === '') {
        e.target.value = 'anônimo';
      }
    },
    isMyPost() {
      return true;
    },
    addMessage() {
      grecaptcha.ready(() => {
        grecaptcha.execute('6LfB04AaAAAAAGTm-ljshaykXuT9YiePLxgqy471', {action: 'post'}).then((token) => token)
        .then((token) => {
          this.message.recaptcha_token = token;
          const submitButton = document.querySelector('.create-thread > form > button[type=submit]');
          submitButton.disabled = true;
          if (this.auth.username) {
            this.message.username = this.auth.username;
            this.message.user_id = parseInt(this.auth.id, 10);
          }
          if (/giphy/.test(this.message.imageURL)) {
            this.message.gif_origin = 'giphy';
          } else if (/gfycat/.test(this.message.imageURL)) {
            this.message.gif_origin = 'gfycat';
          } else if (/tenor/.test(this.message.imageURL)) {
            this.message.gif_origin = 'tenor';
          } else if (/imgur/.test(this.message.imageURL)) {
            this.message.gif_origin = 'imgur';
          } else {
            this.message.gif_origin = 'outro';
          }
          fetch(`${this.$backendURL}${this.apiURL}`, {
            method: 'POST',
            body: JSON.stringify(this.message),
            headers: {
              'content-type': 'application/json',
            },
          }).then((response) => response.json()).then((result) => {
            if (result.details) {
              const error = result.details.map((detail) => detail.message).join('.');
              this.error = error;
            } else if (result.error) {
              if (result.origin === 'psql') {
                if (result.code === '23505') {
                  this.error = 'Mensagem duplicada!\ngit gud e altere algum dos campos antes de enviar ᕦ(ò_óˇ)ᕤ';
                }
              }
            } else {
              window.location.href = '/';
            }
            submitButton.disabled = false;
          });
        });
      });
    },
    createVideo(target) {
      const image = target.target;
      const video = document.createElement('video');
      video.classList.add('img-thumbnail');
      video.src = image.src;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      image.parentElement.insertBefore(video, image);
      image.style.display = 'none';
      image.error = null;
      video.addEventListener('click', (e) => {
        this.fullSize(e);
      });
      video.onerror = function test(e) {
        e.target.parentElement.querySelector('.img-thumbnail').src = 'http://via.placeholder.com/300?text=erro ao carregar url  :(';
      };
    },
    preventVideo(target) {
      const image = target.target;
      const prevSibling = image.previousElementSibling;
      if (prevSibling) {
        if (prevSibling.tagName === 'VIDEO') {
          image.previousElementSibling.remove();
          image.style.display = 'initial';
        }
      }
    },
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    readAsDataURL(file, img) {
      return new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = function () {
          const setImg = img;
          setImg.src = fileReader.result;
          return resolve(
            {
              data: fileReader.result, name: file.name, size: file.size, type: file.type,
            },
          );
        };
        fileReader.readAsDataURL(file);
      });
    },
  },
};
</script>
