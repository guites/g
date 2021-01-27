<template>
  <div ref="replybox" id="replybox" v-if="messageToReplyTo">
    <div v-if="error" class='alert-error'>
      <span v-on:click="error=''">x</span>
      <h4>Erro!</h4>
      <p>{{error}}</p>
    </div>
    <div id="replybox-head">
      <span class="noselect"
      ref="dragSpan"
      @mousedown="dragMouseDown"
      >
        responder ao post #{{messageToReplyTo}}
      </span>
      <button class="close" type="button" @click="this.closeReply">
        x
      </button>
    </div>
    <form id="replyForm" @submit.prevent="addReply()">
      <!-- <input type="hidden" name="message_id"
      v-model="replyMessage.message_id"
      :value="messageToReplyTo"> -->
      <div class="form-group">
        <label for="username">Usuário</label>
        <input type="text" class="form-control" id="username"
        aria-describedby="usernameHelp"
        placeholder="Anonymous"
        v-model="replyMessage.username"
        required>
      </div>
      <div class="form-group">
        <label for="message">Mensagem</label>
        <textarea class="form-control" id="message" rows="5"
        v-model="replyMessage.content"
        required>
        </textarea>
      </div>
      <div class="form-group">
        <label for="imageURL">image URL</label>
        <input v-model="replyMessage.imageURL" type="url" class="form-control"
        id="imageURL" placeholder="https://~">
      </div>
      <button type="submit" class="btn btn-primary">Enviar</button>
    </form>
  </div>
</template>

<script>
const replyURL = 'https://gchan-message-board.herokuapp.com/replies';
export default {
  name: 'ReplyBox',
  props: ['messageToReplyTo'],
  data: () => ({
    replyTo: {
      message_id: '',
    },
    positions: {
      clientX: undefined,
      clientY: undefined,
      movementX: 0,
      movementY: 0,
      boundsFlag: '',
      boundsHorzFlag: '',
      boundsVertFlag: '',
      dragging: false,
    },
    replyMessage: {
      username: 'Anonymous',
      content: '',
      imageURL: '',
      message_id: '',
      user_id: 0,
    },
    error: '',
  }),
  methods: {
    dragMouseDown(event) {
      event.preventDefault();
      // get the mouse cursor position at startup:
      const spanRect = event.target.getBoundingClientRect();
      this.positions.dragging = true;
      this.positions.clickedLeft = event.pageX - spanRect.left;
      this.positions.clickedTop = event.clientY - spanRect.top;
      this.positions.clientX = event.clientX;
      this.positions.clientY = event.clientY;
      document.onmousemove = this.elementDrag;
      document.onmouseup = this.closeDragElement;
    },
    elementDrag(event) {
      event.preventDefault();
      if (this.positions.dragging) {
        document.body.classList.add('isdragging');
        const replyBoxPos = this.$refs.replybox.getBoundingClientRect();
        if (!(replyBoxPos.top > 0)) this.positions.boundsVertFlag = 'top';
        if (!(replyBoxPos.top < window.innerHeight - replyBoxPos.height)) {
          this.positions.boundsVertFlag = 'bottom';
        }
        if (!(replyBoxPos.left > 0)) this.positions.boundsHorzFlag = 'left';
        if (!(replyBoxPos.left < window.innerWidth - replyBoxPos.width)) this.positions.boundsHorzFlag = 'right';
        //  tem que ser dois verificadores separados
        if (this.positions.boundsHorzFlag === '') {
          this.$refs.replybox.style.left = `${event.clientX - this.positions.clickedLeft}px`;
          // VERIFICAR APÓS SETAR OS VALORES DEIXA MAIS FLUIDO !!
          if (this.$refs.replybox.getBoundingClientRect().left < 0) {
            this.$refs.replybox.style.left = '1px';
          } else if (this.$refs.replybox.getBoundingClientRect().left > window.innerWidth) {
            this.$refs.replybox.style.left = `${window.innerWidth - 1}px`;
          }
        // TEM QUE TRAVAR AS DIMENSÕES ISOLADAMENTE !!
        } else {
          switch (this.positions.boundsHorzFlag) {
            case 'left':
              if ((event.clientX > replyBoxPos.width / 3)) {
                if (!(this.positions.clickedLeft > ((replyBoxPos.width / 3) - 50))) {
                  this.positions.clickedLeft = (replyBoxPos.width / 3) - 50;
                }
                this.positions.boundsHorzFlag = '';
              } else {
                this.$refs.replybox.style.left = '1px';
              }
              break;
            case 'right':
              if (event.clientX < window.innerWidth - replyBoxPos.width / 2) {
                this.positions.clickedLeft = (0.5 * replyBoxPos.width) + 50;
                this.positions.boundsHorzFlag = '';
              } else {
                this.$refs.replybox.style.left = `${window.innerWidth - replyBoxPos.width - 1}px`;
              }
              break;
            default:
              this.positions.boundsHorzFlag = '';
          }
        }
        if (this.positions.boundsVertFlag === '') {
          this.$refs.replybox.style.top = `${event.clientY - this.positions.clickedTop - 17}px`;
        } else {
          switch (this.positions.boundsVertFlag) {
            case 'top':
              if ((event.clientY > 25)) {
                this.positions.boundsVertFlag = '';
              } else {
                this.$refs.replybox.style.top = '1px';
              }
              break;
            case 'bottom':
              if ((event.clientY < window.innerHeight - replyBoxPos.height)) {
                this.positions.boundsVertFlag = '';
              } else {
                this.$refs.replybox.style.top = `${window.innerHeight - replyBoxPos.height - 1}px`;
              }
              break;
            default:
              this.positions.boundsVertFlag = '';
          }
        }
      }
    },
    closeDragElement() {
      this.positions.dragging = false;
      document.onmouseup = null;
      document.onmousemove = null;
      document.body.classList.remove('isdragging');
    },
    isInSpan(event) {
      const dragSpanPos = this.$refs.dragSpan.getBoundingClientRect();
      if (event.clientX > dragSpanPos.left
        && event.clientX < dragSpanPos.right
        && event.clientY > dragSpanPos.top
        && event.clientY < dragSpanPos.bottom) {
        return true;
      }
      return false;
    },
    isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0
        && rect.left >= 0
        && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },
    closeReply() {
      this.$emit('closeReply');
    },
    addReplyToThread(reply) {
      console.log(reply);
      this.$emit('addReplyToThread', reply);
    },
    clearReplyForm() {
      this.replyMessage.message_id = '';
      this.replyMessage.username = 'Anonymous';
      this.replyMessage.content = '';
      this.replyMessage.imageURL = '';
      this.replyMessage.user_id = 0;
    },
    addReply() {
      const submitButton = document.querySelector('#replybox form button[type="submit"]');
      submitButton.disabled = true;
      this.replyMessage.message_id = this.messageToReplyTo;
      fetch(replyURL, {
        method: 'POST',
        body: JSON.stringify(this.replyMessage),
        headers: {
          'content-type': 'application/json',
        },
      }).then((response) => response.json()).then((result) => {
        const parseResult = JSON.parse(result);
        if (parseResult.details) {
          const error = parseResult.details.map((detail) => detail.message).join('.');
          this.error = error;
        } else if (parseResult.error) {
          if (parseResult.origin === 'psql') {
            if (parseResult.code === '23505') {
              this.error = 'Mensagem duplicada!\ngit gud e altere algum dos campos antes de enviar ᕦ(ò_óˇ)ᕤ';
            }
          }
        } else {
          this.error = '';
          // aqui tem que disponibilizar o conteúdo do reply na Home.vue
          // this.addReplyToThread(this.replyMessage);
          this.addReplyToThread(parseResult);
          this.clearReplyForm();
          this.closeReply();
        }
        submitButton.disabled = false;
      });
    },
  },
};
</script>
