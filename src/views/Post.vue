<style>
  .container h1 {
    max-width:980px;
    width:100%;
    border-bottom: 1px solid #424242;
    margin: 20px auto;
    padding:0 0 20px 0;
  }
</style>
<template>
  <section>
    <h1>Respondendo ao post #{{message.id}}</h1>
    <Message
    v-bind:message="message"
    v-bind:auth="auth"
    v-bind:replies="message.replies"
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
  </section>
</template>

<script>
import ReplyBox from '../components/replybox.vue';
import Message from '../components/message.vue';


// injeção de valores via pre-rendering

if (window.__PRERENDER_INJECTED !== undefined) {
  var post_id = window.location.pathname.split('/').pop();
  document.body.innerHTML += `<p style='display: none;' id='injected_id'>${post_id}</p>`;
  document.body.innerHTML += `<p style='display: none;' id='injected_por'>${(window['__PRERENDER_INJECTED'][post_id]['por'])}</p>`;
  document.body.innerHTML += `<p style='display: none;' id='injected_title'>${(window['__PRERENDER_INJECTED'][post_id]['title'])}</p>`;
  document.body.innerHTML += `<p style='display: none;' id='injected_content'>${(window['__PRERENDER_INJECTED'][post_id]['content'])}</p>`;
  document.body.innerHTML += `<p style='display: none;' id='injected_thumbnail'>${(window['__PRERENDER_INJECTED'][post_id]['thumbnail'])}</p>`;
  document.body.innerHTML += `<p style='display: none;' id='injected_created'>${(window['__PRERENDER_INJECTED'][post_id]['created'])}</p>`;
}

export default {
  name: 'Post',
  components: {
    ReplyBox,
    Message,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
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
    messageURL: 'message/',
    repliesURL: 'replies',
    message: '',
    quotesToAdd: '',
    messageToReplyTo: '',
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
    id(val) {
        this.getThePost();
    },
  },
  beforeMount() {
    this.getThePost();
    this.setInjectedData();
  },
  methods: {
    targetQuote() {
      this.$nextTick(() => {
        const checkTarget = window.location.href.split('#');
        if (checkTarget.length > 1) {
          const targetQuote = checkTarget.splice(-1)[0];
          const quoteElement = document.querySelector('#'+targetQuote);
          if (quoteElement) {
            quoteElement.scrollIntoView({top: 0, behavior: 'smooth'});
            quoteElement.classList.add('target');
          }
        }
      });
    },
    setInjectedData() {

      let id, por, title, content, thumbnail;

      const idEl = document.getElementById('injected_id');
      const porEl = document.getElementById('injected_por');
      const titleEl = document.getElementById('injected_title');
      const contentEl = document.getElementById('injected_content');
      const thumbnailEl = document.getElementById('injected_thumbnail');
      const createdEl = document.getElementById('injected_created');

      if (createdEl) {
        created = createEl.innerText;
        document.querySelector('#message-created').innerText = created;
      }
      if (idEl) {
        id = idEl.innerText;
        document.querySelector('.container h1').innerText = `Respondendo ao post #${id}`;
        document.querySelector('.message-id').innerText = `${id} / `;
      }
      if (porEl) {
        por = porEl.innerText;
        document.querySelector('.message-username').innerText = `por: ${por}`;
      }
      if (titleEl) {
        title = titleEl.innerText;
        document.querySelector('.message-subject').innerText = `${title}`;
        document.querySelector('meta[name=title]').setAttribute("content", `gchan: ${title}`);
        document.querySelector('meta[property="twitter:title"]').setAttribute("content", `gchan: ${title}`);
        document.querySelector('title').innerText = `gchan: ${title}`;
        document.querySelector('meta[property="og:title"]').setAttribute("content", `gchan: ${title}`);
      }
      if (contentEl) {
        content = contentEl.innerText;
        document.querySelector('.message-content').innerText = `${content}`;
        document.querySelector('meta[name=description]').setAttribute("content", `gchan: ${content.substr(0,180)}`);
        document.querySelector('meta[property="og:description"]').setAttribute("content", `gchan: ${content.substr(0,180)}`);
        document.querySelector('meta[property="twitter:description"]').setAttribute("content", `gchan: ${content.substr(0,180)}`);
      }
      if (thumbnailEl) {
        thumbnail = thumbnailEl.innerText;
        document.querySelector('.img-thumbnail').src = thumbnail;
        document.querySelector('meta[property="og:image"]').setAttribute("content", thumbnail);
        document.querySelector('meta[property="twitter:image"]').setAttribute("content", thumbnail);
      }

    },
    getThePost() {
      fetch(`${this.$backendURL}${this.messageURL}${this.id}`).then((response) => response.json())
          .then((result) => {
            if (result.results) {
              this.message = this.sanitizeSingleMessage(result.results.shift());
              fetch(`${this.$backendURL}${this.repliesURL}/${this.id}`).then((response) => response.json())
                .then((replies) => {
                  if (replies.error) {
                    return;
                  }
                  this.$set(this.message, 'replies', replies);
                  this.targetQuote();
                });
            } else {
              window.location.href = '/';
            }
          });
    },
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
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
    showThumbImg(e) {
      if (window.innerWidth < 767) return;
      e.target.children[0].style = 'display:block;';
    },
    hideThumbImg(e) {
      if (window.innerWidth < 767) return;
      e.target.children[0].style = 'display:none;';
    },
    toggleYoutubeFrame(e) {
      const button = e.target;
      const iframeWrapper = document.querySelector(`#li_${this.message.id} .iframe-wrapper`);
      const iframe = iframeWrapper.children[0];
      if (window.innerWidth > 640) {
        iframe.width = '640';
        iframe.height = '360';
      } else {
        iframe.width = window.innerWidth * 0.95;
        iframe.height = iframe.width / 2 + 20;
      }
      iframeWrapper.classList.toggle('open');
      if (button.innerText === 'youtube:mostrar') {
        button.innerHTML = button.innerHTML.replace('youtube:mostrar', 'esconder');
      } else {
        button.innerHTML = button.innerHTML.replace('esconder', 'youtube:mostrar');
      }
    },
    replyMessage(reply) {
      this.messageToReplyTo = reply;
    },
    adcQuote(quote) {
      this.quotesToAdd = quote;
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
      if (this.message.replies === undefined) this.message.replies = []; 
      this.message.replies.push(typeCheckedReply);
    },
  },
};
</script>
