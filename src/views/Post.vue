<template>
  <section>
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

const messageURL = 'http://localhost:5000/message/';
const repliesURL = 'http://localhost:5000/replies';
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
  mounted() {
    fetch(`${messageURL}${this.id}`).then((response) => response.json())
      .then((result) => {
        if (result.results) {
          // this.message = result.results.shift();
          // this.filterMessage(this.message);
          this.message = this.sanitizeSingleMessage(result.results.shift());
          fetch(`${repliesURL}/${this.id}`).then((response) => response.json())
            .then((replies) => {
              if (replies.error) {
                return;
              }
              this.$set(this.message, 'replies', replies);
            });
        } else {
          window.location.href = 'http://localhost:8080/';
        }
      });
  },
  methods: {
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
    async filterMessage(message) {
      const theMessage = message;
      // eslint-disable-next-line
      // const rgx = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g;
      // const string = theMessage.message;
      // const matches = string.match(rgx);
      // console.log(matches);
      // if (matches.length > 0) {
      //   await this.sleep(100);
      //   console.log(`#li_${this.message.id} small`);
      //   const smallTag = document.querySelector(`#li_${this.message.id} small`);
      //   const pTag = document.querySelector(`#li_${this.message.id} p:not(.mt-0)`);
      //   const iframeWrapper = document.createElement('div');
      //   iframeWrapper.className = 'iframe-wrapper';
      //   const insertedNode = smallTag.parentElement.insertBefore(iframeWrapper, smallTag);
      //   matches.forEach((match) => {
      //     console.log(match);
      //     // const filteredString =
      //     // string.replace(match, `[<a data-link="${match}" href="javascript:;">youtube</a>]`);
      //     pTag.innerHTML = pTag.innerHTML.replace(match, `[<a data-link="${match}" href="javascript:;">youtube:mostrar<img class="yt-thumb" style="display:none;"></a>]`);
      //     // theMessage.message = filteredString;
      //     fetch(`https://www.youtube.com/oembed?url=${match}&format=json`)
      //       .then((response) => response.json())
      //       .then((result) => {
      //         const aTag = document.querySelector(`[data-link="${match}"]`);
      //         aTag.children[0].src = result.thumbnail_url;
      //         // aTag.setAttribute('data-thumb', result.thumbnail_url);
      //         aTag.addEventListener('mouseover', this.showThumbImg, false);
      //         aTag.addEventListener('mouseout', this.hideThumbImg, false);
      //         aTag.addEventListener('click', this.toggleYoutubeFrame, false);
      //         insertedNode.innerHTML = result.html;
      //       });
      //   });
      // }
      return theMessage;
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
  metaInfo() {
    return {
      title: this.message.subject || `gchan post ${this.message.id}`,
      meta: [
        {
          name: 'description',
          content: this.message.message,
        },
        {
          property: 'og:title',
          content: this.message.subject || `gchan post ${this.message.id}`,
        },
        {
          property: 'og:site_name',
          content: 'gchan',
        },
        {
          property: 'og:description',
          content: this.message.message,
        },
        {
          property: 'og:type',
          content: 'post',
        },
        {
          property: 'og:url',
          content: `http://localhost:8080/#/post/${this.message.id}`,
        },
        {
          property: 'og:image',
          content: this.message.imageurl,
        },
        {
          name: 'twitter:card',
          content: 'summary',
        },
        {
          name: 'twitter:site',
          content: 'http://localhost:8080',
        },
        {
          name: 'twitter:creator',
          content: '@gchan_board',
        },
        {
          name: 'twitter:description',
          content: this.message.message,
        },
        {
          name: 'twitter:title',
          content: this.message.subject || `gchan post ${this.message.id}`,
        },
        {
          name: 'twitter:image',
          content: this.message.imageurl,
        },
      ],
    };
  },
};
</script>
