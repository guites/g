<template>
  <ul class="list-unstyled d-flex flex-column align-items-center">
    <li class="media" :id="'li_' + message.id">
      <img
      loading="lazy"
      v-if="message.imageurl"
      class="img-thumbnail"
      :data-src="message.imageurl"
      :alt="message.subject"
      :src="message.imageurl"
      @click="fullSize($event)"
      @error="createVideo($event, message.id)"
      @load="preventVideo($event)"
      >
      <img
      loading="lazy"
      v-else
      class="img-thumbnail placeholder"
      :src="$backendURL+'placeholders'"
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
          <p class='message-username mt-0 mb-1 name'>por: {{message.username}}</p>
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
          <button type="button" class='link'
          v-if="replyCount && replyCount > 2 && isHome">
            <a :href="'/#/post/' + message.id">
              ver respostas
            </a>
          </button>
        </div>
        <div class="reply_count"
        v-if="isHome && replyCount && replyCount > 2"
        >
        <small>Este post possui {{replyCount}} respostas!</small>
        </div>
        <p class="mt-0 mb-1 subject">
          <span class="id message-id">#{{message.id}} / </span>
          <span class="message-subject" v-if="message.subject">{{message.subject}}</span>
          <span class="id message-subject" v-else>gchan post</span>
        </p>
        <p class="message-content" v-html="message.message"></p>
        <br />
        <div v-if="message.yt_iframes"
        class="iframe-wrapper"
        ref="yt_iframes">
          <div>

          </div>
        </div>
        <small>{{convertTZ(message.created)}}</small><br />
        <img v-if="message.gif_origin == 'giphy'"
        alt='powered by GIPHY'
        class="gif_origin"
        src="@/assets/giphy-attr1.png">
      </div>
    </li>
    <li class="media reply-item"
    v-for="reply of replies"
    v-bind:key="reply.id"
    >
      <img
      loading="lazy"
      v-if="reply.imageurl"
      class="img-thumbnail"
      :data-src="reply.imageurl"
      :src="reply.imageurl"
      @click="fullSize($event)"
      @error="createVideo($event, false)"
      @load="preventVideo($event)"
      alt=""
      >
      <div class="align-self-center media-body" :id="'quoted_' + reply.id">
        <div class="edit_tab">
          <p class="mt-0 mb-1">{{reply.username}}</p>
          <button type='button' class='link link-reply' :data-quoteid="reply.id"
          title='citar esta resposta'
          @click="adcQuote($event)">
            #{{reply.id}}
          </button>
        </div>
        <p class="text-content" v-html="reply.content"></p>
        <div v-if="checkContentLength(reply.content)" @click="expandContent($event)" class="reply-warning"><em>resposta truncada devido ao tamanho. clique para visualizar na íntegra.</em><button class="button-link" type="button">expandir</button></div>
          <div class="iframe-wrapper"></div>
          <small>{{convertTZ(reply.created)}}</small><br />
      </div>
    </li>
    <hr>
  </ul>
</template>
<script>
export default {
  name: 'Message',
  props: {
    message: {},
    replies: {},
    replyCount: Number,
    auth: {},
  },
  data: () => ({
    replyObserver: null,
    messageFlash: {
      type: '',
      header: '',
      text: '',
      message: '',
      messageID: '',
    },
  }),
  watch: {
    message() {
    },
  },
  methods: {
    checkContentLength(content) {
      let tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const hiddenQuotes = tempDiv.querySelectorAll('.quote-hidden');
      hiddenQuotes.forEach((quote) => {
        quote.remove();
      });
      return tempDiv.textContent.length > 250;
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
      fetch(`${this.$backendURL}${url}`, {
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
    hasAudio(video) {
      return video.mozHasAudio
      || Boolean(video.webkitAudioDecodedByteCount)
      || Boolean(video.audioTracks && video.audioTracks.length);
    },
    async createVideo(ev, isPost) {
      const image = ev.target;
      const li = isPost ? document.getElementById(`li_${isPost}`) : image.parentElement;
      const videoWrap = document.createElement('div');
      videoWrap.className = 'video-wrap';
      const video = document.createElement('video');
      video.src = image.src;
      const controls = document.createElement('button');
      controls.innerHTML = `<img src="${this.$projectURL}volume-off.png" alt="Volume">`;
      controls.className = 'volume';
      controls.type = 'button';
      video.classList.add('img-thumbnail');
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      videoWrap.appendChild(video);
      videoWrap.appendChild(controls);
      li.insertBefore(videoWrap, image);
      image.style.display = 'none';
      image.error = null;
      video.addEventListener('loadeddata', (eve) => {
        if (this.hasAudio(eve.target)) {
          controls.addEventListener('click', (e) => {
            let audioBtn;
            if (e.target.tagName === 'BUTTON') {
              [audioBtn] = e.target.children;
            } else {
              audioBtn = e.target;
            }
            video.muted = !video.muted;
            if (video.muted) {
              audioBtn.src = `${this.$projectURL}volume-off.png`;
            } else {
              audioBtn.src = `${this.$projectURL}volume-high.png`;
            }
          });
        } else {
          controls.classList.add('no-audio');
        }
      });
      video.addEventListener('click', (e) => {
        this.fullSizeDiv(e.target.parentElement);
        this.fullSize(e);
      });
      // uso de currying pra passar a this.$backendURL no
      // callback do eventListener https://stackoverflow.com/a/58675429/14427854
      function onerrorCallback(backendURL) {
        return function(e) {
          const parent = e.target.parentElement.parentElement;
          const videoWrapper = parent.querySelector('div.video-wrap');
          const showThisImg = parent.querySelector('img.img-thumbnail');
          showThisImg.src = `${backendURL}placeholders`;
          showThisImg.style.display = 'initial';
          showThisImg.classList.add('placeholder');
          showThisImg.onclick = null;
          e.target.remove();
          videoWrapper.remove();
        }
      }
      video.addEventListener('error', onerrorCallback(this.$backendURL));
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
    fullSizeDiv(div) {
      div.classList.toggle('fullsize');
    },
    fullSize(e) {
      e.target.classList.toggle('fullsize');
    },
    replyMessage(reply) {
      this.$emit('replyMessage', reply.target.getAttribute('data-replyto'));
    },
    adcQuote(quote) {
      this.$emit('adcQuote', quote.target.getAttribute('data-quoteid'));
    },
    expandContent(ev) {
      console.log(ev.target.parentElement);
      const textBlock = ev.target.parentElement.querySelector('.text-content');
      textBlock.scrollTop = 0;
      const btn = ev.target.querySelector('button');
      textBlock.classList.toggle('show-all');
      btn.textContent = btn.textContent == 'colapsar' ? 'expandir' : 'colapsar';
    },
  },
  computed: {
    isHome() {
      return this.$route.name === 'Home';
    },
    filteredReplies() {
      if (this.replies) {
        return this.replies.slice(Math.max(this.replies.length - 2, 1));
      }
      return this.replies;
    },
  },
};
</script>
