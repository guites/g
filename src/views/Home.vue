<template>
  <div>
    <!-- <h2 v-if="auth.loggedIn">HAS USERNAME PROP</h2> -->
     <section class="create-thread">
      <form @submit.prevent="addMessage()">
        <div v-if="error" class='alert-error'>
          <span v-on:click="error=''">x</span>
          <h4>Erro!</h4>
          <p>{{error}}</p>
       </div>
        <div class="form-group">
          <label for="username">Usuário</label>
          <!-- v-model="message.username" -->
          <input type="text" class="form-control" id="username"
          aria-describedby="usernameHelp" :value="username"
          placeholder="Anonymous"
          required>
          <small v-if="auth.id" id="usernameHelp" class="form-text text-muted">
            anonimato é para os fracos
          </small>
          <small v-else id="usernameHelp" class="form-text text-muted">
            remember: no use for a name
          </small>
        </div>
        <div class="form-group">
          <label for="subject">Assunto</label>
          <input v-model="message.subject" type="text" class="form-control"
          id="subject" placeholder="subject" required>
        </div>
        <div class="form-group">
          <label for="message">Mensagem</label>
          <textarea v-model="message.message" class="form-control" id="message" rows="5" required>
          </textarea>
        </div>
        <div class="form-group">
          <label for="imageURL">image URL</label>
          <input v-model="message.imageURL" type="url" class="form-control"
          id="imageURL" placeholder="https://~">
          <div class="gif-search-toggle" data-toggle="buttons">
            <input v-on:change="searchGif" type="radio" name="options" id="option1"
              autocomplete="off" checked value="giphy">
            <label for ='option1' class="btn btn-primary">Giphy</label>
            <input v-on:change="searchGif" type="radio" name="options" id="option2"
              autocomplete="off" value="gfycat">
            <label for='option2' class="btn btn-primary">gfycat</label>
          </div>
          <label for='giphy-search'>Busque um gif</label>
          <input v-on:keyup="searchGif" v-model="message.giphyURL" type="text"
          class="form-control" id="giphyURL" placeholder="cats">
        </div>
        <button type="submit" class="btn btn-primary">Enviar</button>
    </form>
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
    <div class="list-unstyled d-flex flex-column align-items-center"
    v-for="message in reversedMessages"
    :key="message._id">
      <li class="media">
        <img
        loading="lazy"
        v-if="message.imageurl"
        class="img-thumbnail"
        :data-src="message.imageurl"
        :alt="message.subject"
        :src="message.imageurl"
        @error="createVideo($event)"
        @load="preventVideo($event)"
        >
        <img
        loading="lazy"
        v-else
        class="img-thumbnail"
        src="http://via.placeholder.com/300?text=:(">
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
            <h4 class='mt-0 mb-1'>{{message.username}}</h4>
            <button type="button"
            v-if="message.user_id === auth.id"
            v-on:click="deleteMessage($event)"
            class='delete'>deletar</button>
            <button type="button"
            v-if="message.user_id === auth.id"
            v-on:click="editMessage($event)"
            class='edit'>editar</button>
            <button type="button"
            v-if="message.user_id !== auth.id"
            v-on:click="reactMessage($event)"
            class='react'>reagir</button>
            <button type="button"
            v-on:click="replyMessage($event)"
            class='reply'>responder</button>
          </div>
          <h5 class="mt-0 mb-1">{{message.subject}}</h5>
          {{message.message}}
          <br />
          <small>{{message.created}}</small><br />
          <img v-if="message.gif_origin == 'giphy'"
          alt='powered by GIPHY'
          class="gif_origin"
          src="@/assets/giphy-attr1.png">
        </div>
      </li>
              <hr>
    </div>
    <template>
      <ReplyBox>
      </ReplyBox>
    </template>

  </div>
</template>

<script>
import ReplyBox from '../components/replybox.vue';

const apiURL = 'http://localhost:5000/messages';
const handleURL = 'http://localhost:5000/';
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
      username: 'Anonymous',
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
  }),
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
    username() {
      return this.auth.username || this.message.username;
    },
  },
  mounted() {
    fetch(apiURL).then((response) => response.json()).then((result) => {
      this.messages = result.results;
    });
  },
  methods: {
    isMyPost() {
      return true;
    },
    clearMsgForm() {
      this.message.username = 'Anonymous';
      this.message.subject = '';
      this.message.message = '';
      this.message.imageURL = '';
      this.message.user_id = 0;
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
        console.log(result);
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
    replyMessage() {
      alert('babuinos babuinarão');
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
            .catch((error) => {
              console.log(error);
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
    createVideo(target) {
      const image = target.target;
      const video = document.createElement('video');
      video.src = image.src;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      image.parentElement.insertBefore(video, image);
      image.style.display = 'none';
      image.error = null;
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
  },
};
</script>
