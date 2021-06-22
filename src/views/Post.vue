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
  mounted() {
    this.getThePost();
    this.setInjectedData();
  },
  methods: {
    setInjectedData() {
      const id = document.getElementById('injected_id').innerText;
      const por = document.getElementById('injected_por').innerText;
      const title = document.getElementById('injected_title').innerText;
      const content = document.getElementById('injected_content').innerText;
      const thumbnail = document.getElementById('injected_thumbnail').innerText;

      document.querySelector('.message-id').innerText = id;
      document.querySelector('.message-subject').innerText = `${title}`;
      document.querySelector('.message-content').innerText = `${content}`;
      document.querySelector('.img-thumbnail').src = thumbnail;
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
                });
            } else {
              window.location.href = '/not-found';
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
      console.log(this.message);
      if (this.message.replies === undefined) this.message.replies = []; 
      this.message.replies.push(typeCheckedReply);
    },
  },
};
</script>
