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
          required>
          <small v-if="auth.id" id="usernameHelp" class="form-text text-muted">
            anonimato é para os fracos
          </small>
          <small v-else id="usernameHelp" class="form-text text-muted">
            {{smallUsernamePhrase}}
          </small>
        </div>
        <div class="form-group">
          <label for="subject">Assunto</label>
          <input v-model="message.subject" type="text" class="form-control"
          id="subject" placeholder="assunto"
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
          <label for="uploadIMG">
            Envie uma imagem/gif/vídeo
            <span
            title="Esta funcionalidade está em fase de testes! Erros podem ocorrer ¯\_(ツ)_/¯"
            class='badge beta'>
              BETA
            </span>
          </label>
          <input type="file" name="uploadIMG" id="uploadIMG" @change="handleUpload($event)">
        </div>
        <div class="form-group">
          <label for="imageURL">ou: digite a URL de uma imagem/gif/vídeo</label>
          <input v-model="message.imageURL" type="url" class="form-control"
          id="imageURL" placeholder="https://~">
          <label for='giphyURL'>ou: busque um gif</label>
          <input v-on:keyup="searchGif" v-model="message.giphyURL" type="text"
          class="form-control" id="giphyURL" placeholder="cats">
          <div class="gif-search-toggle" data-toggle="buttons">
            <input v-on:change="searchGif" type="radio" name="options" id="option1"
            autocomplete="off" checked value="giphy">
            <label for ='option1' class="btn btn-primary">
              Giphy
            </label>
            <input v-on:change="searchGif" type="radio" name="options" id="option2"
            autocomplete="off" value="gfycat">
            <label for='option2' class="btn btn-primary">
              gfycat
            </label>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Enviar</button>
    </form>
    <div v-if="isPreviewing" class="imagePreview">
      <img v-if="isPreviewing === 'image'" src="" alt="pré-visualização de imagem para upload">
      <video v-else-if="isPreviewing === 'video'"
      src=""
      autoplay="true"
      loop="true"
      muted="true"
      playsinline="true"></video>
      <p v-else>Formato não suportado! ::(</p>
      <!-- <button type="button"></button> -->
    </div>
    <div v-if="isGifBeingSearched" class='gifBoxWrapper'>
      <div v-if="emptyGifResults" class='emptyGifResults'>
        <img src="http://via.placeholder.com/480?text=nenhum gif :(" class="emptyGifResultsImg">
      </div>
      <div v-if="emptyGifResults === ''" class="gifBox">
        <div v-for="gif in uniqueGifs" :key="gif.id" class="gifBoxGif">
          <img class="gif-thumb" v-on:click="selectGif"
          :data-original="gif.originalUrl" :src="gif.thumbUrl">
        </div>
        <div class="gif-attribute">
          <a href="https://giphy.com/" v-if="this.apiRoute === 'giphy'"
          title="Visitar giphy.com" target="_blank">
            <img src="@/assets/giphy-attr.png" alt="Powered by GIPHY">
          </a>
        </div>
      </div>
      <div class='paginate-arrows'>
        <ul v-if='hasPag' class="pagination">
          <div>
            <li v-for="index in numPages" :key="index" v-on:click="paginateGif"
            class="page-item" :class="{ 'active' : currPage == index}">
              <p class="page-link">{{index}}</p>
            </li>
          </div>
        </ul>
      </div>
    </div>

    </section>
    <ul class="list-unstyled d-flex flex-column align-items-center"
    v-for="message in reversedMessages"
    :key="message._id">
      <li class="media" :id="message.id">
        <img
        loading="lazy"
        v-if="message.imageurl"
        class="img-thumbnail"
        :data-src="message.imageurl"
        :alt="message.subject"
        :src="message.imageurl"
        @click="fullSize($event)"
        @error="createVideo($event)"
        @load="preventVideo($event)"
        >
        <img
        loading="lazy"
        v-else
        class="img-thumbnail"
        src="http://via.placeholder.com/300?text=:("
        alt="post sem imagem"
        >
        <div class="align-self-center media-body">
          <div class="flash"
          :class="messageFlash.type"
          v-if="messageFlash.header && messageFlash.messageID === message.id">
            <button class='flash-btn'
            type="button"
            v-on:click="messageFlash.header = ''">x</button>
            <strong>{{messageFlash.header}}</strong>
            {{messageFlash.text}}
            <a :href="messageFlash.link">{{messageFlash.message}}</a>
            <div class="opt-btns">
              <button type="button"
              v-on:click="handleMessage(message.id,'delete',$event)">
                Deletar
              </button>
              <!-- <button type="button">pensando bem...</button> -->
            </div>
          </div>
          <div class="edit_tab" :data-message-id="message.id">
            <p class='mt-0 mb-1 name'>por: {{message.username}}</p>
            <button type="button"
            v-if="message.user_id === auth.id"
            v-on:click="deleteMessage($event)"
            class='delete'>deletar</button>
            <button type="button"
            v-if="message.user_id === auth.id"
            v-on:click="editMessage($event)"
            class='edit'>editar</button>
            <button type="button"
            v-if="message.user_id !== auth.id && false"
            v-on:click="reactMessage($event)"
            class='react'>reagir</button>
            <button type="button"
            @click="replyMessage($event)"
            :data-replyTo="message.id"
            class='reply'>responder</button>
          </div>
          <p class="mt-0 mb-1 subject">
            <span class="id">#{{message.id}} / </span>
            {{message.subject}}
          </p>
          <p>{{message.message}}</p>
          <br />
          <small>{{message.created}}</small><br />
          <img v-if="message.gif_origin == 'giphy'"
          alt='powered by GIPHY'
          class="gif_origin"
          src="@/assets/giphy-attr1.png">
        </div>
      </li>
      <li class="media reply-item"
      v-for="reply of message.replies"
      v-bind:key="reply.id"
      >
        <img
        loading="lazy"
        v-if="reply.imageurl"
        class="img-thumbnail"
        :data-src="reply.imageurl"
        :src="reply.imageurl"
        @click="fullSize($event)"
        @error="createVideo($event)"
        @load="preventVideo($event)"
        alt=""
        >
        <div class="align-self-center media-body">
          <div class="edit_tab">
            <p class="mt-0 mb-1">{{reply.username}}</p>
          </div>
            <p class="mt-0 mb-1">#{{reply.id}}</p>
            <p>{{reply.content}}</p><br />
            <small>{{reply.created}}</small><br />
        </div>
      </li>
      <hr>
    </ul>
    <template>
      <ReplyBox
      :messageToReplyTo="this.messageToReplyTo"
      @closeReply="this.closeReply"
      @addReplyToThread="this.addReplyToThread"
      >
      </ReplyBox>
    </template>
  </div>
</template>

<script>
import ReplyBox from '../components/replybox.vue';

const apiURL = 'http://localhost:5000/messages';
const repliesURL = 'http://localhost:5000/replies';
const handleURL = 'http://localhost:5000/';
const imgurURLimg = 'https://api.imgur.com/3/image';
const imgurURLupload = 'https://api.imgur.com/3/upload';
const proxyURL = 'https://infinite-shore-20037.herokuapp.com/';
export default {
  name: 'Home',
  components: {
    ReplyBox,
  },
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
    replyObserver: null,
    messageToReplyTo: '',
    gifsPerPage: 4,
    currPage: 1,
    numPages: 5,
    error: '',
    apiRoute: 'giphy',
    isGifBeingSearched: '',
    emptyGifResults: '',
    hasPag: '',
    messages: [],
    gifs: [],
    message: {
      username: 'anônimo',
      subject: '',
      message: '',
      imageURL: '',
      user_id: 0,
      gif_origin: 'none',
    },
    messageFlash: {
      type: '',
      header: '',
      text: '',
      message: '',
      messageID: '',
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
  }),
  watch: {
    isGifBeingSearched(val) {
      if (val !== '') {
        this.isPreviewing = '';
      }
    },
    isPreviewing(val) {
      if (val !== '') {
        this.isGifBeingSearched = '';
      }
    },
  },
  computed: {
    reversedMessages() {
      return this.messages.slice().reverse();
    },
    uniqueGifs() {
      const result = [];
      const map = new Map();
      this.gifs.forEach((el) => {
        if (!map.has(el.id)) {
          map.set(el.id, true);
          result.push({
            id: el.id,
            thumbUrl: el.thumbUrl,
            originalUrl: el.originalUrl,
          });
        }
      });
      return result;
    },
    // username() {
    //   return this.auth.username || this.message.username;
    // },
    smallUsernamePhrase() {
      const phrases = [
        { quote: 'o que é que há, pois, num nome?', reference: 'https://pt.wikipedia.org/wiki/William_Shakespeare' },
        { quote: 'remember: no use for a name', reference: 'https://www.youtube.com/watch?v=mEdd1NHnwIE' },
        { quote: 'o homem é menos ele mesmo quando fala de sua pessoa', reference: 'https://pt.wikipedia.org/wiki/Oscar_Wilde' },
        { quote: 'o anonimato é a fama do futuro', reference: 'https://pt.wikipedia.org/wiki/John_Boyle' },
      ];
      return phrases[Math.floor((phrases.length * Math.random()))].quote;
    },
  },
  mounted() {
    this.replyObserver = new IntersectionObserver(
      this.onElementObserved,
      {
        threshold: 0,
      },
    );
    // .forEach((li) => this.replyObserver.observe(li));
    fetch(apiURL).then((response) => response.json())
      .then((result) => {
        this.messages = result.results;
      })
      .then(() => {
        document.querySelectorAll('.list-unstyled li.media')
          .forEach((li) => this.replyObserver.observe(li));
      });
  },
  methods: {
    isMyPost() {
      return true;
    },
    clearMsgForm() {
      this.message.username = 'anônimo';
      this.message.subject = '';
      this.message.message = '';
      this.message.imageURL = '';
      this.message.user_id = 0;
      this.isPreviewing = '';
      this.isGifBeingSearched = '';
      document.querySelector('#uploadIMG').value = '';
    },
    addMessage() {
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
      }
      fetch(apiURL, {
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
          this.error = '';
          this.messages.push(JSON.parse(result));
          this.clearMsgForm();
        }
        submitButton.disabled = false;
      });
    },
    deleteMessage(e) {
      const messageID = e.target.parentElement.getAttribute('data-message-id');
      this.msgFlash('error', messageID, 'Deletar mensagem', 'Tem certa que deseja deletar esta mensagem? ):', 'ela não ofendeu ninguém');
    },
    editMessage() {
      alert('o dev é burro e ainda não adicionou este método (づ´• ﹏ •`)づ');
    },
    reactMessage() {
      alert('o dev é burro e ainda não adicionou este método (づ´• ﹏ •`)づ');
    },
    replyMessage(e) {
      this.messageToReplyTo = e.target.getAttribute('data-replyto');
    },
    closeReply() {
      this.messageToReplyTo = '';
    },
    addReplyToThread(reply) {
      let typeCheckedReply;
      if (typeof reply === 'string') {
        typeCheckedReply = JSON.parse(reply);
      } else {
        typeCheckedReply = reply;
      }
      const msgIndex = this.messages.findIndex((el) => parseInt(el.id, 10)
          === parseInt(typeCheckedReply.message_id, 10));
      if (this.messages[msgIndex].replies === undefined) this.messages[msgIndex].replies = [];
      this.messages[msgIndex].replies.push(typeCheckedReply);
    },
    onElementObserved(entries) {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        this.replyObserver.unobserve(entry.target);
        fetch(`${repliesURL}/${entry.target.id}`).then((response) => response.json())
          .then((replies) => {
            if (replies.error) {
              return;
            }
            const msgIndex = this.messages.findIndex((el) => parseInt(el.id, 10)
          === parseInt(entry.target.id, 10));
            this.$set(this.messages[msgIndex], 'replies', replies);
          });
      });
    },
    handleMessage(messageID, action, e) {
      e.target.disabled = true;
      let method;
      let body;
      let headers;
      let url;
      let finalizeFunction;
      switch (action) {
        case 'delete':
          method = 'DELETE';
          body = JSON.stringify('');
          headers = {
            'content-type': 'text/plain',
          };
          url = `message/${messageID}`;
          finalizeFunction = (id) => this.messages.filter((message) => message.id !== id);
          break;
        default:
          method = 'POST';
          headers = {
            'content-type': 'application/json',
          };
      }
      fetch(`${handleURL}${url}`, {
        method,
        headers,
        body,
        credentials: 'include',
      }).then((response) => response.json()).then((result) => {
        if (!result) {
          e.target.disabled = false;
          this.msgFlash('error', messageID, 'Ocorreu um erro!', 'Tente deletar sua mensagem novamente.', 'Atualizar a página pode resolver o problema!');
        } else {
          this.messages = finalizeFunction(messageID);
        }
      });
    },
    msgFlash(type, messageID, header, text, message) {
      this.messageFlash.type = type;
      this.messageFlash.header = header;
      this.messageFlash.text = text;
      this.messageFlash.message = message;
      this.messageFlash.messageID = parseInt(messageID, 10);
    },
    searchGif(e) {
      let searchString;

      if (e.target.id === 'giphyURL') {
        searchString = e.target.value;
        if (searchString === '') {
          this.isGifBeingSearched = '';
        } else {
          this.isGifBeingSearched = 1;
        }
      } else {
        searchString = document.querySelector('#giphyURL').value;
      }
      if (searchString === '') {
        this.hasPag = '';
      } else {
        this.hasPag = '1';
      }
      switch (document.querySelector("input[type='radio']:checked").value) {
        default:
          this.apiRoute = 'giphy';
          fetch(`https://api.giphy.com/v1/gifs/search?api_key=5KnNW5U9nJ2Xjnas3lugKxMIXVdCsrqF&q=${searchString}&limit=${this.gifsPerPage}&offset=${(this.currPage - 1) * this.gifsPerPage}`)
            .then((response) => response.json())
            .then((result) => {
              const obj = result.data;
              if (obj.length === 0) {
                this.emptyGifResults = 1;
              } else {
                this.emptyGifResults = '';
              }
              this.gifs = [];
              obj.forEach((el) => {
                this.gifs.push({
                  id: el.id,
                  thumbUrl: el.images.preview_webp.url,
                  originalUrl: el.images.original.webp,
                });
              });
            })
            .catch(() => {
              this.emptyGifResults = 1;
            });
          break;
        case 'gfycat':
          this.apiRoute = 'gfycat';
          fetch(`https://api.gfycat.com/v1/gfycats/search?count=${this.gifsPerPage * this.numPages}&search_text='${searchString}`)
            .then((response) => response.json())
            .then((result) => {
              const obj = result.gfycats;
              this.gfycatCursor = result.cursor;
              if (obj.length === 0) {
                this.emptyGifResults = 1;
              } else {
                this.emptyGifResults = '';
              }
              const startingPoint = (this.currPage - 1) * this.gifsPerPage;
              const endingPoint = startingPoint + this.gifsPerPage;
              this.gifs = [];
              let counter = 0;
              obj.forEach((el) => {
                if (counter >= startingPoint && counter < endingPoint) {
                  this.gifs.push({
                    id: el.gfyId,
                    thumbUrl: el.max1mbGif,
                    originalUrl: el.webpUrl,
                  });
                }
                counter += 1;
              });
            })
            .catch((error) => {
              console.error(error);
              this.emptyGifResults = 1;
            });
          break;
      }
    },
    selectGif(e) {
      const originalUrl = e.target.getAttribute('data-original');
      document.querySelector('#imageURL').value = originalUrl;
      this.message.imageURL = originalUrl;
    },
    paginateGif(e) {
      this.currPage = e.target.innerText;
      this.searchGif(e);
    },
    fullSize(e) {
      e.target.classList.toggle('fullsize');
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
    uploadToImgur(kind, file) {
      const formData = new FormData();
      const submitButton = document.querySelector('.create-thread > form > button[type=submit]');
      document.querySelector('.imagePreview').children[0].classList.add('uploading');
      submitButton.disabled = true;
      let postURL;
      if (kind === 'image') {
        formData.append('image', file);
        postURL = imgurURLimg;
      } else {
        formData.append('type', 'file');
        formData.append('video', file, 'video');
        postURL = proxyURL + imgurURLupload;
      }
      fetch(postURL, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: 'Client-ID 3435e574a9859d1',
        },
      }).then((response) => response.json()).then((result) => {
        if (result.status === 200 && result.success === true) {
          this.message.imageURL = result.data.link;
          this.gif_origin = 'imgur';
        }
        document.querySelector('.imagePreview').children[0].classList.remove('uploading');
        submitButton.disabled = false;
      }).catch((err) => console.log(err));
    },
    async handleUpload(e) {
      let imagePreviewDiv;
      const file = e.target.files[0];
      console.log(file);
      if (file.type.startsWith('image/')) {
        this.isPreviewing = 'image';
        setTimeout(async () => {
          imagePreviewDiv = document.querySelector('.imagePreview');
          const reader = new FileReader();
          reader.onload = (function (aImg) {
            return function (x) {
              const img = aImg;
              img.src = x.target.result;
              return img;
            };
          }(imagePreviewDiv.children[0]));
          reader.readAsDataURL(file);
          await this.uploadToImgur('image', file);
        }, 100);
      } else if (file.type.startsWith('video/')) {
        if (this.allowedUploadVideoFormats.includes(file.type)) {
          this.isPreviewing = 'video';
          setTimeout(async () => {
            imagePreviewDiv = document.querySelector('.imagePreview');
            imagePreviewDiv.children[0].src = URL.createObjectURL(file);
            imagePreviewDiv.children[0].load();
            await this.uploadToImgur('video', file);
          }, 100);
        } else {
          this.isPreviewing = 'not';
          setTimeout(() => {
            imagePreviewDiv = document.querySelector('.imagePreview');
            imagePreviewDiv.children[0].innerHTML += `<br/><ul><li>nome: ${file.name}</li><li>formato: ${file.type}</li></ul>`;
            imagePreviewDiv.children[0].innerHTML += `<br/>Formatos aceitos: ${this.allowedUploadVideoFormats.join(', ')}</ul>`;
          }, 100);
        }
      } else {
        this.isPreviewing = 'not';
        setTimeout(() => {
          imagePreviewDiv = document.querySelector('.imagePreview');
          imagePreviewDiv.children[0].innerHTML += `<br/><ul><li>nome: ${file.name}</li><li>formato: ${file.type}</li></ul>`;
        }, 100);
      }
    },
  },
};
</script>
