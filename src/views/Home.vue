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
          <label for="uploadIMG">
            Envie uma imagem/gif/vídeo
            <span
            title="Erros podem ocorrer ¯\_(ツ)_/¯"
            class='badge beta'>
              BETA
            </span>
          </label>
          <input type="file" name="uploadIMG" id="uploadIMG"
          :disabled="this.optUpload === true"
          @change="handleUpload($event)">
        </div>
        <div class="form-group">
          <label for="imageURL" v-if="!this.optUpload">
            ou: digite a URL de uma imagem/gif/vídeo</label>
          <label for="imageURL" class='upload-concluido'
          v-else>Upload Concluído!</label>
          <input v-model="message.imageURL" type="url" class="form-control"
          id="imageURL" placeholder="https://~"
          :readonly="this.optUpload === true"
          >
          <transition name="fade">
            <div class="searchgifstuffs">
              <label v-if='!this.optUpload' for='giphyURL'>ou: Busque um gif</label>
              <input v-if='!this.optUpload'
              v-on:keyup="searchGif" v-model="message.giphyURL" type="text"
              class="form-control" id="giphyURL" placeholder="cats">
              <div v-if='!this.optUpload' class="gif-search-toggle" data-toggle="buttons">
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
          </transition>
        </div>
        <button type="submit" class="btn btn-primary">Enviar</button>
    </form>
    <div v-if="isPreviewing" class="imagePreview">
      <button type='button' v-if='this.optUpload'
      @click="removeUpload($event)">Cancelar</button>
      <img v-if="isPreviewing === 'image'" src="" id="imageToUpload"
      alt="pré-visualização de imagem para upload">
      <video v-else-if="isPreviewing === 'video'"
      id="videoToUpload"
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
    </div>
    </section>
    <Message
    v-for="message in messages"
    v-bind:message="message"
    v-bind:auth="auth"
    v-bind:replies="message.replies"
    v-bind:replyCount="message.replyCount"
    @replyMessage="replyMessage"
    @adcQuote="adcQuote"
    @update="message = $event"
    v-bind:key="message.id"
    >
    </Message>
    <template>
      <ReplyBox
      :messageToReplyTo="this.messageToReplyTo"
      :allowedUploadVideoFormats="this.allowedUploadVideoFormats"
      @closeReply="this.closeReply"
      @addReplyToThread="this.addReplyToThread"
      :quotesToAdd="this.quotesToAdd"
      >
      </ReplyBox>
    </template>
  </div>
</template>

<script>
import ReplyBox from '../components/replybox.vue';
import Message from '../components/message.vue';

function showThumbImg(e) {
  if (window.innerWidth < 767) return;
  e.target.children[0].style = 'display:block;';
}
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
};
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
    apiURL: `messages/`,
    repliesURL: 'replies',
    imgurURLimg: 'imgupload',
    imgurURLgif: 'gifupload',
    imgurURLupload: 'videoupload',
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
      username: '',
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
        { quote: 'a vingança nunca é plena, mata a alma e a envenena', reference: 'https://pt.wikiquote.org/wiki/Seu_Madruga' },
        { quote: 'Ski-bi dibby dib yo da dub dub', reference: 'https://www.youtube.com/watch?v=Hy8kmNEo1i8' },
        { quote: 'Baby don\'t hurt me', reference: 'watsalov' },
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
    this.lazyLoadObserver = new IntersectionObserver(
      this.setNextBatch,
      {
        threshold: 0,
      },
    );
    fetch(`${this.$backendURL}${this.apiURL}${this.offset}`).then((response) => response.json())
      .then((result) => {
        this.messages = this.sanitizedMessages(result.results);
      })
      .then(() => {
        document.querySelectorAll('.list-unstyled li.media')
          .forEach((li, index) => {
            this.replyObserver.observe(li);
            if (index === this.messagesBatchSize - 1) {
              this.offset += 15;
              console.log(this.offset);
              li.setAttribute('data-offset', this.offset);
              this.lazyLoadObserver.observe(li);
            }
          });
      });
  },
  methods: {
    sanitizeSingleMessage(message) {
      const sanitized = message;
      if (message.message) {
        sanitized.message = message.message.replace(/</g, '&lt;');
        sanitized.message = message.message.replace(/>/g, '&gt;');
      } else {
        sanitized.content = message.content.replace(/</g, '&lt;');
        sanitized.content = message.content.replace(/>/g, '&gt;');
      }
      return sanitized;
    },
    sanitizedMessages(messagesArray) {
      // transforma todas as < e > em texto
      const sanitized = [];
      messagesArray.forEach((message) => {
        const thisIterationMsg = message;
        if (message.message) {
          thisIterationMsg.message = message.message.replace(/</g, '&lt;');
          thisIterationMsg.message = message.message.replace(/>/g, '&gt;');
        } else {
          thisIterationMsg.content = message.content.replace(/</g, '&lt;');
          thisIterationMsg.content = message.content.replace(/>/g, '&gt;');
        }
        sanitized.push(thisIterationMsg);
      });
      return sanitized;
    },
    async filterMessage(index) {
      const isReply = typeof index === 'object' && index !== null;
      let replyIndex;
      let messageIndexForReplies;
      const yt_rgx = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)[\&\?]?([\w\_]+)?=?([\w\%]+)?&?([\w\-\_]+)?=?[\w]?/g;
      // se for um objeto, estou passando uma reply como argumento da função
      let string;
      if (isReply) {
        string = index.content;
      } else {
        string = this.messages[index].message;
      }
      const matches = string.match(yt_rgx);
      if (matches !== null) {
        if (matches.length > 0) {
          if (isReply) {
            messageIndexForReplies = this.messages.findIndex((el) => parseInt(el.id, 10)
            === parseInt(index.message_id, 10));
            replyIndex = this.messages[messageIndexForReplies].replies.findIndex((el) => parseInt(el.id, 10) === parseInt(index.id, 10));
            if (this.messages[messageIndexForReplies].replies[replyIndex].filtered === '1') return;
            this.$set(this.messages[messageIndexForReplies].replies[replyIndex], 'yt_iframes', []);
            this.$set(this.messages[messageIndexForReplies].replies[replyIndex], 'filtered', '1');
          } else {
            if (this.messages[index].filtered === '1') return;
            this.$set(this.messages[index], 'yt_thumbnails', []);
            this.$set(this.messages[index], 'yt_iframes', []);
            this.$set(this.messages[index], 'filtered', '1');
          }
          for (let i = 0; i < matches.length; i += 1) {
            fetch(`https://www.youtube.com/oembed?url=${matches[i]}&format=json`)
              .then(async (response) => {
                if (response.ok) {
                  const result = await response.json();
                  const htmlString = `[<a data-link="${matches[i]}" data-thumb="${result.thumbnail_url}" href="javascript:;" onmouseover="this.children[0].style='display:block;'" onmouseout="this.children[0].style='display:none;'" onclick="
                  this.childNodes[0].textContent == 'mostrar' ? this.childNodes[0].textContent = 'esconder' : this.childNodes[0].textContent = 'mostrar';
                  const current_li = this.closest('li');
                  // seleciona, se existir, o iframe que estiver carregado
                  const current_frame = current_li.querySelector('iframe');
                  if (current_frame) {
                    const div_data_checkiframe = current_frame.parentElement.getAttribute('data-checkiframe');
                    if( div_data_checkiframe == '${result.thumbnail_url}') {
                      console.log('matches');
                      current_frame.remove();
                      return;
                    } else {
                      const atag_to_current_frame = current_li.querySelector(\`a[data-thumb='\${div_data_checkiframe}']\`);
                      atag_to_current_frame.childNodes[0].textContent = 'mostrar';
                    }
                    current_frame.remove();
                  }
                  this.closest('li').querySelector('.iframe-wrapper').innerHTML = \`<div data-checkiframe='${result.thumbnail_url}'>${result.html.replace(/"/g, '\'')}</div>\`;
                  ">mostrar<img class="yt-thumb" style="display:none;" src="${result.thumbnail_url}"></a>]`;
                  if (isReply) {
                    this.messages[messageIndexForReplies].replies[replyIndex].content = this.messages[messageIndexForReplies].replies[replyIndex].content.replace(matches[i], htmlString);
                  } else {
                    this.messages[index].message = this.messages[index].message
                      .replace(matches[i], htmlString);
                  }
                } else {
                  let htmlString;
                  if (matches[i].startsWith('http://') || matches[i].startsWith('https://')) {
                    if (response.status === 400) {
                      htmlString = `[<a target="_blank" href="${matches[i]}" onmouseover="this.children[0].style='display:block;'" onmouseout="this.children[0].style='display:none;'">youtube?<span style="display:none;">não conseguimos verificar este link. Tenha cautela!</span></a>]`;
                    } else if (response.status === 404) {
                      htmlString = `[<a target="_blank" href="${matches[i]}" onmouseover="this.children[0].style='display:block;'" onmouseout="this.children[0].style='display:none;'">youtube?<span style="display:none;">não conseguimos verificar este link. Tenha cautela!</span></a>]`;
                    } else {
                      return
                    }
                    if (isReply) {
                      this.messages[messageIndexForReplies].replies[replyIndex].content = this.messages[messageIndexForReplies].replies[replyIndex].content.replace(matches[i], htmlString);
                    } else {
                      this.messages[index].message = this.messages[index].message
                        .replace(matches[i], htmlString);
                    }
                  } else {
                    return
                  }
                }
              });
          }
        }
      }
      const insta_rgx = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)[\&\?]?([\w\_]+)?=?([\w\%]+)?&?([\w\-\_]+)?=?[\w]?/g;

    },
    adjustYtIframe() {

    },
    setNextBatch(entries) {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        this.lazyLoadObserver.unobserve(entry.target);
        fetch(`${this.$backendURL}${this.apiURL}${this.offset}`).then((response) => response.json())
          .then((result) => {
            if (!result.results) return;
            this.messages = this.messages.concat(this.sanitizedMessages(result.results));
          })
          .then(() => {
            const messages = document.querySelector('div.container').children;
            for (let i = 0; i < this.messagesBatchSize; i += 1) {
              if (!messages[i + this.offset]) {
                console.log('chegou no fim! yey');
                return;
              }
               this.replyObserver.observe(messages[i + this.offset].children[0]);
              if (i === this.messagesBatchSize - 1) {
                this.lazyLoadObserver.observe(messages[i + this.offset].children[0]);
                this.offset += 15;
                messages[i].setAttribute('data-offset', this.offset);
              }
            }
          });
      });
    },
    toggleSubject() {
      this.hasSubject = !this.hasSubject;
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
      this.message.recaptcha_token = '';
      this.isPreviewing = '';
      this.isGifBeingSearched = '';
      document.querySelector('#uploadIMG').value = '';
      this.optUpload = '';
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
              this.error = '';
              const parsedResult = JSON.parse(result);
              parsedResult.isNew = true;
              this.messages.unshift(this.sanitizeSingleMessage(parsedResult));
              this.clearMsgForm();
            }
            submitButton.disabled = false;
          });
        });
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
    adcQuote(quote) {
      this.quotesToAdd = quote;
    },
    closeReply() {
      this.messageToReplyTo = '';
      this.quotesToAdd = '';
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
      this.messages[msgIndex].replies.push(this.sanitizeSingleMessage(typeCheckedReply));
    },
    onElementObserved(entries) {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        this.replyObserver.unobserve(entry.target);
        const postId = entry.target.id.replace('li_', '');
        const msgIndex = this.messages.findIndex((el) => parseInt(el.id, 10)
          === parseInt(postId, 10));
        this.filterMessage(msgIndex);
        fetch(`${this.$backendURL}${this.repliesURL}/${postId}`).then((response) => response.json())
          .then((replies) => {
            if (replies.error) {
              return;
            }
            this.$set(this.messages[msgIndex], 'replyCount', replies.length);
            if (replies.length > 2) {
              this.$set(this.messages[msgIndex], 'replies', this.sanitizedMessages(replies.slice(Math.max(replies.length - 2, 1))));
            } else {
              this.$set(this.messages[msgIndex], 'replies', this.sanitizedMessages(replies));
            }
            this.messages[msgIndex].replies.forEach((rep) => {
              this.filterMessage(rep);
            });
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
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    async uploadToImgur(kind, arquivo) {
      document.querySelector('.imagePreview').children[0].classList.add('uploading');
      const submitButton = document.querySelector('.create-thread > form > button[type=submit]');
      submitButton.disabled = true;
      // blank line
      let postURL;
      const formData = new FormData();
      if (kind === 'image') {
        if (true) {
        // if (arquivo.type === 'image/gif') {
          formData.append('image', arquivo);
          postURL = `${this.$backendURL}${this.imgurURLgif}`;
        } else {
          const file = document.querySelector('#imageToUpload').src;
          const base64result = file.split(',')[1];
          postURL = `${this.$backendURL}${this.imgurURLimg}`;
          formData.append('image', base64result);
        }
      } else {
        formData.append('video', arquivo);
        postURL = `${this.$backendURL}${this.imgurURLupload}`;
      }
      const requestOptions = {
        method: 'POST',
        body: formData,
        redirect: 'follow',
      };
      fetch(postURL, requestOptions)
        .then((response) => response.json())
        .then(async (result) => {
          const mediaDiv = document.querySelector('.imagePreview');
          const mediaInUse = mediaDiv.children[0];
          if (result.status === 200
          && result.success === true) {
            this.message.imageURL = result.data.link;
            this.gif_origin = 'imgur';
            // remove a pesquisa por gifs
            this.optUpload = true;
            await this.sleep(100);
            if (result.data.type.startsWith('video/')) {
              mediaInUse.innerHTML = `
                <source src="${result.data.link}"
                type="${result.data.type}">
              `;
            } else {
              mediaInUse.src = result.data.link;
            }
            mediaInUse.classList.remove('uploading');
            const removeBtn = mediaDiv.querySelector('button');
            removeBtn.setAttribute('data-deletehash', result.data.deletehash);
          } else if (result.status === 500 && result.success === false) {
            this.error = `
              Erro no servidor de upload! :(\n
              Tente subir sua imagem em outro lugar\n
              e poste usando o link!\n
              (https://postimages.org/,\n
              https://imgur.com/upload,\n
              https://giphy.com/upload,\n etc)
              `;
            this.isPreviewing = '';
          } else {
            this.error = `
              Aceitamos apenas imagens no formato\n
              JPEG, PNG, GIF, APNG e TIFF!
            `;
            this.isPreviewing = '';
          }
          submitButton.disabled = false;
        })
        .catch((error) => console.log('error', error));
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
    async handleUpload(e) {
      let imagePreviewDiv;
      const file = e.target.files[0];
      const input = document.querySelector('#uploadIMG');
      if (file.type.startsWith('image/')) {
        this.isPreviewing = 'image';
        await this.sleep(100);
        imagePreviewDiv = document.querySelector('.imagePreview');
        await this.readAsDataURL(file, imagePreviewDiv.children[0]);
        await this.uploadToImgur('image', file);
      } else if (file.type.startsWith('video/')) {
        if (this.allowedUploadVideoFormats.includes(file.type)) {
          this.isPreviewing = 'video';
          await this.sleep(100);
          imagePreviewDiv = document.querySelector('.imagePreview');
          // await this.readAsDataURL(file, imagePreviewDiv.children[0]);
          const objUrl = URL.createObjectURL(file);
          imagePreviewDiv.children[0].src = objUrl;
          await this.uploadToImgur('video', file);
        } else {
          this.error = `
            Formato de vídeo não aceito!\n
            Funciona apenas com os formatos abaixo:\n
            ${this.allowedUploadVideoFormats.join(', ')}
          `;
          input.value = '';
        }
      } else {
        this.error = `
          Aceitamos apenas imagens,\n
          gifs e vídeos!
        `;
        input.value = '';
      }
    },
    removeUpload(e) {
      const deleteHash = e.target.getAttribute('data-deletehash').trim();
      fetch(`${this.$backendURL}imgur/${deleteHash}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Client-ID 3435e574a9859d1',
        },
        redirect: 'follow',
      })
        .then((response) => response.json())
        .then((r) => {
          if (r.data === true && r.success === true) {
            this.optUpload = false;
            this.isPreviewing = '';
            this.message.imageURL = '';
            document.querySelector('input[name=uploadIMG]').value = '';
          }
        });
    },
  },
};
</script>
