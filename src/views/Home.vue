<template>
  <div>
     <section @click="removeWarning($event)" class="create-thread">
      <form @submit.prevent="addMessage()">
        <h2 @click="focusMessage()" id="poste-no-gchan">Poste no gchan</h2>
        <div v-if="warning.message" :class="'alert ' + warning.type">
          <span v-on:click="warning.message=''">x</span>
          <h4></h4>
          <p>{{warning.message}}</p>
       </div>
        <div class="form-group">
          <div style="display: flex;">
            <label for="username">
              Nome <small>[opcional]</small>
            </label>
            <div v-if="message.username !== ''" class="form-subject">
              <label for="remember-me"><small>lembrar meu nome</small></label>
              <input type="checkbox" name="remember-me"
              id="remember-me" checked="checked" v-model="rememberMe">
            </div>
          </div>
          <input type="text" class="form-control" id="username"
          aria-describedby="usernameHelp"
          placeholder="anônimo"
          v-model="message.username"
          maxlength=30
          >
          <small v-if="message.username !== ''" id="usernameHelp" class="form-text text-muted">
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
        <div class="form-group media-type-radios" >
          <div>
            <input @change="mediaType" type="radio" id="upload-media" name="media-type" value="upload-media" checked>
            <label for="upload-media">Enviar arquivo</label>
          </div>
          <div>
            <input @change="mediaType" type="radio" id="link-media" name="media-type" value="link-media">
            <label for="link-media">Colocar URL</label>
          </div>
          <div>
            <input @change="mediaType" type="radio" id="search-media" name="media-type" value="search-media">
            <label for="search-media">Buscar gif</label>
          </div>
        </div>
          <div v-if="media_type == 'upload-media'" class="form-group">
            <label for="uploadIMG">
              envie uma imagem, gif ou vídeo
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
            <div v-if="media_type == 'link-media'" class="form-group">
              <label for="imageURL" v-if="!this.optUpload">
                digite a URL de uma imagem, gif ou vídeo</label>
              <label for="imageURL" class='upload-concluido'
              v-else>Upload Concluído!</label>
              <input style="width: 100%;" v-model="message.imageURL" type="url" class="form-control"
              id="imageURL" placeholder="https://~"
              :readonly="this.optUpload === true"
              >
            </div>
            <div v-if="media_type == 'search-media'" class="searchgifstuffs">
              <label v-if='!this.optUpload' for='giphyURL'>digite algum termo no campo abaixo!</label>
              <input v-if='!this.optUpload'
              @keyup="setGifSearchText($event)"
              @touchend="setGifSearchText($event)"
              v-model="message.giphyURL" type="text"
              class="form-control" id="giphyURL" placeholder="cats">
              <input style="visibility: hidden;" v-model="message.imageURL" type="url" class="form-control" id="imageURL" readonly>
              <Gifbox
              v-bind:gifSearch="gifSearch"
              v-bind:imageURL="message.imageURL"
              @gifIsBeingSearched="gifIsBeingSearched"
              @setGifAsImageURL="setGifAsImageURL"
              v-if="screenSize <= 979"
              ></Gifbox>
              <div v-if='!this.optUpload' class="gif-search-toggle" data-toggle="buttons">
                <input v-model="gifSearch.gif_origin" class="gif-type" type="radio" name="options" id="option_giphy"
                autocomplete="off" checked value="giphy">
                <label for ='option_giphy' class="btn btn-primary">
                  Giphy
                </label>
                <input v-model="gifSearch.gif_origin" class="gif-type" type="radio" name="options" id="option_gfycat"
                autocomplete="off" value="gfycat">
                <label for='option_gfycat' class="btn btn-primary">
                  gfycat
                </label>
              </div>
            </div>
        <button type="submit" :disabled="uploadStatus == 'loading'" :class="[uploadStatus === 'loading' ? 'disabled' : '', 'btn btn-primary create-post']">Postar</button>
    </form>
    <div v-if="isPreviewing" class="imagePreview">
      <div style="width: 100%; align-items: center; display: flex; justify-content: space-between;">
        <p v-if="uploadStatus == 'loading'" class="info">Aguarde...</p>
        <p v-if="uploadStatus == 'success'" class="success">Upload concluído!</p>
        <p v-if="uploadStatus == 'error'" class="error">Erro ao realizar o upload!</p>
        <button type='button' v-if='this.optUpload'
        :class="[uploadStatus === 'loading' ? 'disabled' : '']"
        :disabled="uploadStatus == 'loading'"
        @click="removeUpload($event)">
          Remover arquivo
        </button>
      </div>
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
    </div>
    <Gifbox
    v-bind:gifSearch="gifSearch"
    v-bind:imageURL="message.imageURL"
    @gifIsBeingSearched="gifIsBeingSearched"
    @setGifAsImageURL="setGifAsImageURL"
    v-if="screenSize > 979"
    ></Gifbox>
    </section>
    <Message
    v-for="message in messages"
    v-bind:message="message"
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
      :quotesToAdd="this.quotesToAdd"
      :rememberedUsername="this.rememberedUsername"
      :rememberMe="this.rememberMe"
      @closeReply="this.closeReply"
      @addReplyToThread="this.addReplyToThread"
      @updateUsername="this.updateUsername"
      @updateRememberMe="this.updateRememberMe"
      >
      </ReplyBox>
    </template>
    <div v-if="scrollIsOver" id="scroll-is-over">
      <h3>Acabou!</h3>
      <p>ヾ( ￣O￣)ツ</p>
      <p>Você viu todos os posts... que tal <button @click="focusMessage()">compartilhar alguma coisa</button>?</p>
    </div>
  </div>
</template>

<script>
import ReplyBox from '../components/replybox.vue';
import Message from '../components/message.vue';
import Gifbox from '../components/gifbox.vue';

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
    Gifbox
  },
  data: () => ({
    apiURL: `messages`,
    repliesURL: 'replies',
    imgurURLimg: 'imgur/images',
    imgurURLgif: 'imgur/images',
    imgurURLupload: 'imgur/videos',
    optUpload: '',
    messages: [],
    replyObserver: null,
    messageToReplyTo: '',
    quotesToAdd: '',
    warning: {
      type: '',
      message: '',
    },
    gifSearch: {
      gif_origin: 'giphy',
      isBeingSearched: '',
      gifsPerPage: 4,
      numPages: 5,
      value: '',
    },
    screenSize: '',
    hasSubject: false,
    media_type: 'upload-media',
    message: {
      username: '',
      subject: '',
      message: '',
      imageURL: '',
      user_id: 0,
      gif_origin: 'none',
    },
    rememberMe: 1,
    rememberedUsername: '',
    isPreviewing: '',
    uploadStatus: '',
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
    scrollIsOver: false,
  }),
  watch: {
      'message.username': function (newVal, oldVal) {
        this.rememberUsername();
      },
      'gifSearch.isBeingSearched': function(newVal, oldVal) {
        if (newVal !== '') {
          this.isPreviewing = '';
        }
      },
    isPreviewing(val) {
      if (val !== '') {
        this.gifSearch.isBeingSearched = '';
      }
    },
  },
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
        { quote: 'Pode entrar armado no gchan?', reference: 'jairinho' },
      ];
      return phrases[Math.floor((phrases.length * Math.random()))].quote;
    },
  },
  mounted() {
    const mouseActions = ['mouseover', 'mouseout', 'click'];
    mouseActions.forEach((ev) => {
      document.querySelector('body').addEventListener(ev, function(e) {
        if (e.target.className == 'quote') {
          if (ev == mouseActions[2]) {
            if (window.innerWidth < 767) {
              const redirectFlag = e.target.getAttribute('data-redirect');
              if (!redirectFlag) {
                const checkQuoteRedirect = document.querySelector('[data-redirect]');
                if (checkQuoteRedirect) delete checkQuoteRedirect.dataset.redirect;
                e.target.setAttribute('data-redirect', 1);
                e.preventDefault();
              }
            } else {
              return;
            }
          }
          const quoted_reply_id = e.target.href.split('#').splice(-1)[0];
          const reply_id = quoted_reply_id.split('_').splice(-1)[0];
          const replyBox = e.target.closest('ul').querySelector(`#${quoted_reply_id}`);
          if (replyBox) {
            if (ev == 'mouseover' || ev == mouseActions[2]) {
              replyBox.classList.add('target');
            } else {
              replyBox.classList.remove('target');
            }
          } else {
            const quote_preview = e.target.parentElement.querySelector(`#quoted_hidden_${reply_id}`);
            if (ev == 'mouseover' || ev == mouseActions[2]) {
              quote_preview.classList.add('show');
            } else {
              quote_preview.classList.remove('show');
            }
          }
        } else {
          if (ev == mouseActions[2] && window.innerWidth < 767) {
            const checkQuotePreview = document.querySelector('.quote-hidden.show');
            if (checkQuotePreview) checkQuotePreview.classList.remove('show');
            const checkQuoteTarget = document.querySelector('.target');
            if (checkQuoteTarget) checkQuoteTarget.classList.remove('target');
            const checkQuoteRedirect = document.querySelector('[data-redirect]');
            if (checkQuoteRedirect) delete checkQuoteRedirect.dataset.redirect;
          }
        }
      });
    });
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
    fetch(`${this.$backendURL}${this.apiURL}?offset=${this.offset}`).then((response) => response.json())
      .then((result) => {
        this.messages = this.sanitizedMessages(result.results);
      })
      .then(() => {
        document.querySelectorAll('.list-unstyled li.media')
          .forEach((li, index) => {
            this.replyObserver.observe(li);
            if (index === this.messagesBatchSize - 1) {
              this.offset += 15;
              li.setAttribute('data-offset', this.offset);
              this.lazyLoadObserver.observe(li);
            }
          });
      });
    this.screenSize = window.innerWidth;
    window.addEventListener('resize', this.onResize);
    // loads username from localStorage
    const rememberedUsername = localStorage.getItem('gchan_username');
    if (rememberedUsername) this.message.username = rememberedUsername;
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    rememberUsername() {
        if (this.message.username !== '' && this.rememberMe) {
          localStorage.setItem('gchan_username', this.message.username);
        } else {
          const getUsername = localStorage.getItem('gchan_username');
          if (getUsername) {
            localStorage.removeItem('gchan_username');
          }
        }
        this.rememberedUsername = this.message.username;
    },
    setGifSearchText(e) {
      this.gifSearch.value = e.target.value;
    },
    onResize(event) {
      this.screenSize = event.target.innerWidth;
    },
    mediaType() {
      const type = document.querySelector('input[name="media-type"]:checked');
      this.media_type = type.value;
      if (this.media_type == 'search-media') {
        window.setTimeout(() => {
          const inputText = document.querySelector('#giphyURL');
          if (inputText) {
            inputText.focus();
          }
        }, 300);
      }
    },
    focusMessage() {
      document.querySelector('#message').focus();
    },
    convertTZ(date) {
      //source: https://stackoverflow.com/a/54127122/14427854
      var date_sp = new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      var hour = ("0" + date_sp.getHours()).slice(-2);
      var min = ("0" + date_sp.getMinutes()).slice(-2);
      var day = ("0" + date_sp.getDate()).slice(-2);
      var month = ("0" + (date_sp.getMonth() + 1)).slice(-2);
      return `${hour}:${min} ${day}/${month}/${date_sp.getFullYear()}`;
    },
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
        sanitized.push(this.sanitizeSingleMessage(message));
      });
      return sanitized;
    },
    escapeRegExp(stringToGoIntoTheRegex) {
      // https://stackoverflow.com/a/17886301/14427854
      return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    },
    async filterMessage(index) {
      const isReply = typeof index === 'object' && index !== null;
      let replyIndex;
      let messageIndexForReplies;
      const yt_rgx = /(?:https?:\/\/)?(?:m\.)?(?:www\.)?youtu\.?be(?:\.com)?\/?\S*(?:watch|embed)?(?:\S*v=|v\/|\/)([\w\-]+)(?:[\&\?]?([\w\-]+)?=?([\w\%\-]+)?)+/g;
      const quotes_rgx = new RegExp("&gt;&gt;([0-9]{1,5}):", "g");
      const instagram_rgx = /(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am|instagr.com)\/p\/([\w-]+)[\/?\?\S]+/g;
      // se for um objeto, estou passando uma reply como argumento da função
      let string;
      if (isReply) {
        string = index.content;
      } else {
        string = this.messages[index].message;
      }
      const matches = string.match(yt_rgx);
      const quote_matches = string.matchAll(quotes_rgx);
      const instagram_matches = string.matchAll(instagram_rgx);

      if (quote_matches === null && matches === null && instagram_matches === null) {
        return;
      }

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
      // TODO: repeated links break the mostrar/esconder functionality

      // filtra links de posts do instagram
      if (instagram_matches !== null) {
        for (const instagram_match of instagram_matches) {
          const match_url = instagram_match[0];
          const post_hash = instagram_match[1];
          const htmlString = `https://instagram.com/p/${post_hash}[<a data-insta-link="${post_hash}" href="javascript:;" onclick="
          this.childNodes[0].textContent == 'mostrar' ? this.childNodes[0].textContent = 'esconder' : this.childNodes[0].textContent = 'mostrar';
          const current_li = this.closest('li');
          // seleciona, se existir, o iframe que estiver carregado
          const current_frame = current_li.querySelector('div[data-check-instagram-frame] iframe');
          if (current_frame) {
            const div_data_checkiframe = current_frame.parentElement.getAttribute('data-check-instagram-frame');
            if( div_data_checkiframe == '${post_hash}') {
              current_frame.remove();
              return;
            } else {
              const atag_to_current_frame = current_li.querySelector(\`a[data-insta-link='\${div_data_checkiframe}']\`);
              atag_to_current_frame.childNodes[0].textContent = 'mostrar';
            }
            current_frame.remove();
          }
          this.closest('li').querySelector('.iframe-wrapper').innerHTML = \`<div data-check-instagram-frame='${post_hash}'><iframe src='https://www.instagram.com/p/${post_hash}/embed' width='320' height='480' frameborder='0' scrolling='auto' allowtransparency='true'></iframe></div>\`;
          ">mostrar</a>]`;
          const checkUrlRgx = new RegExp(this.escapeRegExp(`data-insta-link="${post_hash}"`));
          if (isReply) {
            if (!checkUrlRgx.test(this.messages[messageIndexForReplies].replies[replyIndex].content)) {
              this.messages[messageIndexForReplies].replies[replyIndex].content = this.messages[messageIndexForReplies].replies[replyIndex].content.replaceAll(match_url, htmlString);
            }
          } else {
            if (!checkUrlRgx.test(this.messages[index].message)) {
              this.messages[index].message = this.messages[index].message.replaceAll(match_url, htmlString);
            }
          }
        }
      }

      // filtra links do youtube
      if (matches !== null && matches.length > 0) {
        for (let i = 0; i < matches.length; i += 1) {
          fetch(`https://www.youtube.com/oembed?url=${matches[i]}&format=json`)
            .then(async (response) => {
              if (response.ok) {
                const result = await response.json();
                const htmlString = `[<a data-link="${matches[i]}" data-thumb="${result.thumbnail_url}" href="javascript:;" onmouseover="this.nextElementSibling.style='display:block;'" onmouseout="this.nextElementSibling.style='display:none;'" onclick="
                this.childNodes[0].textContent == 'mostrar' ? this.childNodes[0].textContent = 'esconder' : this.childNodes[0].textContent = 'mostrar';
                const current_li = this.closest('li');
                // seleciona, se existir, o iframe que estiver carregado
                const current_frame = current_li.querySelector('iframe');
                if (current_frame) {
                  const div_data_checkiframe = current_frame.parentElement.getAttribute('data-checkiframe');
                  if( div_data_checkiframe == '${result.thumbnail_url}') {
                    current_frame.remove();
                    return;
                  } else {
                    const atag_to_current_frame = current_li.querySelector(\`a[data-thumb='\${div_data_checkiframe}']\`);
                    atag_to_current_frame.childNodes[0].textContent = 'mostrar';
                  }
                  current_frame.remove();
                }
                this.closest('li').querySelector('.iframe-wrapper').innerHTML = \`<div data-checkiframe='${result.thumbnail_url}'>${result.html.replace(/"/g, '\'')}</div>\`;
                ">mostrar</a><img class="yt-thumb" style="display:none;" src="${result.thumbnail_url}">]`;
                const checkUrlRgx = new RegExp(this.escapeRegExp(`data-link="${matches[i]}"`));
                if (isReply) {
                  if (!checkUrlRgx.test(this.messages[messageIndexForReplies].replies[replyIndex].content)) {
                    this.messages[messageIndexForReplies].replies[replyIndex].content = this.messages[messageIndexForReplies].replies[replyIndex].content.replaceAll(matches[i], htmlString);
                  }
                } else {
                  if (!checkUrlRgx.test(this.messages[index].message)) {
                    this.messages[index].message = this.messages[index].message.replaceAll(matches[i], htmlString);
                  }
                }
              } else {
                let htmlString;
                if (matches[i].startsWith('http://') || matches[i].startsWith('https://')) {
                  if (response.status === 400) {
                    htmlString = `[<a target="_blank" href="${matches[i]}" onmouseover="this.nextElementSibling.style='display:block;'" onmouseout="this.nextElementSibling.style='display:none;'">youtube?</a>]<span class="yt-warning" style="display:none;">não conseguimos verificar este link. Tenha cautela!</span>`;
                  } else if (response.status === 404) {
                    htmlString = `[<a target="_blank" href="${matches[i]}" onmouseover="this.children[0].style='display:block;'" onmouseout="this.children[0].style='display:none;'">youtube?</a>]<span class="yt-warning" style="display:none;">não conseguimos verificar este link. Tenha cautela!</span>`;
                  } else {
                    return
                  }
                  if (isReply) {
                    this.messages[messageIndexForReplies].replies[replyIndex].content = this.messages[messageIndexForReplies].replies[replyIndex].content.replace(matches[i], htmlString);
                  } else {
                    this.messages[index].message = this.messages[index].message.replace(matches[i], htmlString);
                  }
                } else {
                  return;
                }
              }
            });
        }
      }

      // filtra menção a outras respostas
      if (isReply) {
        if (quote_matches != null) {
          for (const quote_match of quote_matches) {
            const current_quote = quote_match[0];
            const reply_id = quote_match[1];
            if (reply_id) {
              fetch(`${this.$backendURL}replies/${reply_id}`)
                .then((response) => {
                  if (response.ok) {
                    return response.json();
                  } else {
                    throw new Error(response.status);
                  }
                })
                .then((r) => {
                  const sanitizedQuoteMsg = this.sanitizeSingleMessage(r.results[0]);
                  let quote_content = sanitizedQuoteMsg.content;
                  if (quote_content.length > 250) {
                    quote_content = quote_content.substring(0, 220);
                    quote_content += '<i style="font-size: 11px;">[... resposta truncada devido ao tamanho]</i>';
                  }
                  const quote_message_id = sanitizedQuoteMsg.message_id;
                  let htmlString = `<a class="quote" href='/post/${quote_message_id}#quoted_${reply_id}'>${current_quote}</a><li class="media reply-item quote-hidden" id="quoted_hidden_${reply_id}">`;
                  if (sanitizedQuoteMsg.imageurl != '') {
                    htmlString += `<img onerror="this.src='/nao_tem_preview.jpg'; this.onerror=null;" loading="lazy" data-src="${sanitizedQuoteMsg.imageurl}" src="${sanitizedQuoteMsg.imageurl}" alt="" class="img-thumbnail">`;
                  }
                  htmlString += `<div class="align-self-center media-body"><div class="edit_tab"><p class="mt-0 mb-1">${sanitizedQuoteMsg.username}</p><button class="link link-reply">#${sanitizedQuoteMsg.id}</button></div><p class="text-content is-quoted">${quote_content}</p><small>${this.convertTZ(sanitizedQuoteMsg.created)}</small><br/></div></li>`;
                  if (isReply) {
                    this.messages[messageIndexForReplies].replies[replyIndex].content = this.messages[messageIndexForReplies].replies[replyIndex].content.replaceAll(current_quote, htmlString);
                  } else {
                    this.messages[index].message = this.messages[index].message.replace(current_quote, htmlString);
                  }
                })
                .catch((err) => {
                  console.log('resposta de id '+reply_id+' não encontrada.');
                });
            }
          }
        }
      }
    },
    setNextBatch(entries) {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        this.lazyLoadObserver.unobserve(entry.target);
        fetch(`${this.$backendURL}${this.apiURL}?offset=${this.offset}`).then((response) => response.json())
          .then((result) => {
            if (!result.results) return;
            this.messages = this.messages.concat(this.sanitizedMessages(result.results));
          })
          .then(() => {
            const messages = document.querySelector('div.container').children;
            for (let i = 0; i < this.messagesBatchSize; i += 1) {
              if (!messages[i + this.offset]) {
                this.scrollIsOver = true;
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
    clearMsgForm() {
      if (!this.rememberMe) {
        this.message.username = '';
      }
      this.message.subject = '';
      this.message.message = '';
      this.message.imageURL = '';
      this.message.user_id = 0;
      this.message.recaptcha_token = '';
      this.isPreviewing = '';
      this.gifSearch.isBeingSearched = '';
      const uploadIMG = document.querySelector('#uploadIMG');
      if (uploadIMG) {
        uploadIMG.value = '';
      }
      this.optUpload = '';
    },
    removeWarning(e) {
      if (e.target.classList.contains('alert') || e.target.closest('.alert')) {
        // caso clicar no popup, só fecha se for no Xzinho
        return;
      }
      if (this.warning.message != '' && this.warning.type != 'alert-info') {
        this.warning.message = '';
      }
    },
    addMessage() {
      const submitButton = document.querySelector('.create-thread > form > button[type=submit]');
      submitButton.disabled = true;
      submitButton.classList.add('disabled');
      this.warning.message = "Enviando, aguarde...";
      this.warning.type = "alert-info";
      grecaptcha.ready(() => {
        grecaptcha.execute(this.$captchaClient, {action: 'post'}).then((token) => token)
        .then((token) => {
          this.message.recaptcha_token = token;
          fetch(`${this.$backendURL}${this.apiURL}`, {
            method: 'POST',
            body: JSON.stringify(this.message),
            headers: {
              'content-type': 'application/json',
            },
          }).then((response) => response.json()).then((result) => {
            if (result.details) {
              const error = result.details.map((detail) => detail.message).join('.');
              this.warning.message = error;
              this.warning.type = 'alert-error';
            } else if (result.error) {
              if (result.origin === 'psql') {
                if (result.code === '23505') {
                  this.warning.message = 'Mensagem duplicada!\ngit gud e altere algum dos campos antes de enviar ᕦ(ò_óˇ)ᕤ';
                  this.warning.type = 'alert-error';
                }
              }
            } else {
              this.warning.message = 'Post enviado!';
              this.warning.type = 'alert-success';
              this.messages.unshift(this.sanitizeSingleMessage(result));
              this.filterMessage(0);
              this.clearMsgForm();
            }
            submitButton.disabled = false;
            submitButton.classList.remove('disabled');
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
    gifIsBeingSearched(isIt) {
      this.gifSearch.isBeingSearched = isIt;
    },
    setGifAsImageURL(imageURL) {
      this.message.imageURL = imageURL;
    },
    replyMessage(reply) {
      this.messageToReplyTo = reply;
    },
    adcQuote(quote) {
      this.quotesToAdd = quote;
    },
    updateUsername(username) {
      this.message.username = username;
    },
    updateRememberMe(remember) {
      this.rememberMe = remember;
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
      this.filterMessage(this.sanitizeSingleMessage(typeCheckedReply));
    },
    onElementObserved(entries) {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        this.replyObserver.unobserve(entry.target);
        const postId = entry.target.id.replace('li_', '');
        const msgIndex = this.messages.findIndex((el) => parseInt(el.id, 10)
          === parseInt(postId, 10));
        this.filterMessage(msgIndex);
        fetch(`${this.$backendURL}${this.apiURL}/${postId}/${this.repliesURL}`).then((response) => response.json())
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
      const imgPreviewWrapper = document.querySelector('.imagePreview');
      const mediaInUse = imgPreviewWrapper.querySelector('img,video');
      mediaInUse.classList.add('uploading');
      //const submitButton = document.querySelector('.create-thread > form > button[type=submit]');
      //submitButton.disabled = true;
      //submitButton.classList.add('disabled');

      let postURL;
      const formData = new FormData();
      if (kind === 'image') {
        formData.append('file', arquivo);
        postURL = `${this.$backendURL}${this.imgurURLgif}`;
      } else {
        formData.append('file', arquivo);
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
          if (result.status === 200
          && result.success === true) {
            this.message.imageURL = result.data.link;
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
            const removeBtn = imgPreviewWrapper.querySelector('button');
            removeBtn.setAttribute('data-deletehash', result.data.deletehash);
          } else if (result.status === 500 && result.success === false) {
            this.warning.message = `
              Erro no servidor de upload! :(\n
              Tente subir sua imagem em outro lugar\n
              e poste usando o link!\n
              (https://postimages.org/,\n
              https://imgur.com/upload,\n
              https://giphy.com/upload,\n etc)
              `;
            this.warning.type = 'alert-error';
            this.isPreviewing = '';
          } else {
            this.warning.message = `
              Aceitamos apenas imagens no formato\n
              JPEG, PNG, GIF, APNG e TIFF!
            `;
            this.warning.type = 'alert-error';
            this.isPreviewing = '';
          }
          //submitButton.disabled = false;
          //submitButton.classList.remove('disabled');
          this.uploadStatus = 'success';
        })
        .catch((error) => {
          this.uploadStatus = 'error';
          console.log('error', error);
        });
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
      this.uploadStatus = 'loading';
      let imagePreviewDiv;
      const file = e.target.files[0];
      const input = document.querySelector('#uploadIMG');
      if (file.type.startsWith('image/')) {
        this.isPreviewing = 'image';
        await this.sleep(100);
        imagePreviewDiv = document.querySelector('.imagePreview');
        await this.readAsDataURL(file, imagePreviewDiv.querySelector('img'));
        await this.uploadToImgur('image', file);
      } else if (file.type.startsWith('video/')) {
        if (this.allowedUploadVideoFormats.includes(file.type)) {
          this.isPreviewing = 'video';
          await this.sleep(100);
          imagePreviewDiv = document.querySelector('.imagePreview');
          const objUrl = URL.createObjectURL(file);
          imagePreviewDiv.children[0].src = objUrl;
          await this.uploadToImgur('video', file);
        } else {
          this.uploadStatus = 'error';
          this.warning.message = `
            Formato de vídeo não aceito!\n
            Funciona apenas com os formatos abaixo:\n
            ${this.allowedUploadVideoFormats.join(', ')}
          `;
          this.warning.type = 'alert-error';
          input.value = '';
        }
      } else {
        this.warning.message = `
          Aceitamos apenas imagens,\n
          gifs e vídeos!
        `;
        this.warning.type = 'alert-error';
        input.value = '';
      }
    },
    removeUpload(e) {
      this.uploadStatus = 'loading';
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
            this.uploadStatus = '';
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
