<template>
  <section>
    <Message
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
      :allowedUploadVideoFormats="this.allowedUploadVideoFormats"
      @closeReply="this.closeReply"
      @addReplyToThread="this.addReplyToThread"
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
          this.message = result.results.shift();
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
          content: `https://gchan.com.br/#/post/${this.message.id}`,
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
          content: 'https://gchan.com.br',
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
