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
          <label for="imageURL">URL de uma imagem/gif/vídeo</label>
          <input v-model="message.imageURL" type="url" class="form-control"
          id="imageURL" placeholder="https://~">
          <label for='giphyURL'>ou: Busque um gif</label>
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
    <Message
    v-for="message in messages"
    v-bind:message="message"
    v-bind:auth="auth"
    v-bind:replies="message.replies"
    @replyMessage="replyMessage"
    @update="message = $event"
    v-bind:key="message.id"
    >
    </Message>
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
import Message from '../components/message.vue';

const apiURL = 'https://gchan-message-board.herokuapp.com/messages';
const repliesURL = 'https://gchan-message-board.herokuapp.com/replies';
export default {
  name: 'Home',
  components: {
    ReplyBox,
    Message,
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
    messages: [],
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
    clearMsgForm() {
      this.message.username = 'anônimo';
      this.message.subject = '';
      this.message.message = '';
      this.message.imageURL = '';
      this.message.user_id = 0;
      this.isGifBeingSearched = '';
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
      } else if (/imgur/.test(this.message.imageURL)) {
        this.message.gif_origin = 'imgur';
      } else {
        this.message.gif_origin = 'outro';
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
          const parsedResult = JSON.parse(result);
          // if (parsedResult.imageurl === '') {
          //   parsedResult.imageurl = 'nope';
          // }
          parsedResult.isNew = true;
          this.messages.unshift(parsedResult);
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
    replyMessage(reply) {
      this.messageToReplyTo = reply;
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
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
  },
};
</script>
