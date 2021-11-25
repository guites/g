<template>
  <div ref="replybox" id="replybox" v-if="messageToReplyTo">
    <div v-if="warning.message" :class="'alert ' + warning.type">
      <span v-on:click="warning.message=''">x</span>
      <h4></h4>
      <p>{{warning.message}}</p>
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
    <form v-if="!checkPreview" id="replyForm" @submit.prevent="addReply($event)">
      <div class="form-group">
        <div style="display: flex; align-items: center;">
          <label for="username">Usuário</label>
          <div v-if="rememberedUsername" class="form-subject" style="margin-left: 15px;">
            <label for="remember-me-reply"><small>lembrar meu nome</small></label>
            <input type="checkbox" name="remember-me-reply"
            id="remember-me-reply" v-model="replyRememberMe" checked="checked">
          </div>
        </div>
        <input type="text" class="form-control" id="username"
        aria-describedby="usernameHelp"
        placeholder="anônimo"
        v-model="replyMessage.username"
        maxlength=30>
      </div>
      <div class="form-group">
        <label for="message">Mensagem</label>
        <textarea class="form-control" id="message" rows="5"
        v-model="replyMessage.content"
        maxlength=1000
        required>
        </textarea>
      </div>
      <p v-if="isUploading" class="info">Aguarde...</p>
      <div v-if="!isPreviewing" class="form-group row">
        <button :disabled="this.isUploading !== ''" 
          :class="[isUploading !== '' ? 'disabled' : '', 'mobile-only']"
          type="button" @click="toggleInputFile($event);">
          Enviar arquivo
          <input type="file" name="replyIMG" id="replyIMG" @change="handleUpload($event)">
        </button>
        <button :disabled="this.isUploading !== ''" 
          :class="[isUploading !== '' ? 'disabled' : '', 'mobile-only']"
          type="button">Buscar gif</button>
        <button :disabled="this.isUploading !== ''" 
          :class="[isUploading !== '' ? 'disabled' : '', 'mobile-only']"
          type="button">Digitar URL</button>
      </div>
      <div v-if="isPreviewing" class="form-group">
        <p v-if="(isPreviewing === 'image' || isPreviewing === 'video') && !isUploading" class="success">Upload concluído!</p>
        <p v-if="isPreviewing === 'gif'" class="success">Gif selecionado!</p>
        <p v-if="isPreviewing === 'url'" class="success">URL carregada!</p>
        <div class="form-group row justify-center">
          <button 
            :disabled="this.isUploading !== ''"
            :class="[isUploading !== '' ? 'disabled' : '', 'mobile-only']"
            type="button" @click="visualizePreview()">Visualizar preview</button>
          <!-- <button
            :disabled="this.isUploading !== ''"
            :class="[isUploading !== '' ? 'disabled' : '', 'mobile-only ml-15']"
            type="button" @click="removeUpload()">Remover</button> -->
        </div>
      </div>
      <!-- <div class="form-group">
        <label for="replyIMG">
          Envie uma imagem/gif/vídeo
          <span
          title="Erros podem ocorrer ¯\_(ツ)_/¯"
          class='badge beta'>
            BETA
          </span>
        </label>
        <input type="file" name="replyIMG" id="replyIMG"
        :disabled="this.optUpload === true"
        @change="handleUpload($event)">
      </div>
      <div class="form-group">
        <label for="imageURL" v-if="!this.optUpload">
          ou: digite a URL de uma imagem/gif/vídeo</label>
        <label for="imageURL" class='upload-concluido'
        v-else>Upload Concluído!</label>
        <input v-model="replyMessage.imageURL" type="url" class="form-control"
        id="imageURL" placeholder="https://~"
        :readonly="this.optUpload === true"
        >
      </div> -->
      <button id="submitReply" type="submit" class="btn btn-primary">Enviar resposta</button>
    </form>
    <div v-if="checkPreview" class="previewImg">
      <img v-if="isPreviewing === 'image'" :src="isPreviewingSrc">
      <video v-if="isPreviewing === 'video'"
      id="videoToUpload"
      :src="isPreviewingSrc"
      autoplay="true"
      loop="true"
      muted="true"
      playsinline="true"></video>
      <div class="form-group row justify-center">
        <button 
          :disabled="this.isUploading !== ''"
          :class="[isUploading !== '' ? 'disabled' : '', 'mobile-only']"
          type="button" @click="visualizePreview()">Confirmar</button>
        <button 
          :disabled="this.isUploading !== ''"
          :class="[isUploading !== '' ? 'disabled' : '', 'mobile-only ml-15']"
          type="button" @click="removeUpload()" >Remover</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReplyBox',
  props: [
    'messageToReplyTo',
    'allowedUploadVideoFormats',
    'quotesToAdd',
    'rememberedUsername',
    'rememberMe'
  ],
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
      username: '',
      content: '',
      imageURL: '',
      message_id: '',
      user_id: 0,
      recaptcha_token: ''
    },
    replyRememberMe: 1,
    warning: {
      type: '',
      message: '',
    },
    optUpload: false,
    uploadDeleteHash: '',
    isUploading: '',
    isPreviewing: '',
    isPreviewingSrc: '',
    checkPreview: '',
  }),
  watch: {
    rememberMe(newVal, oldVal) {
      if (newVal != oldVal) {
        this.replyRememberMe = newVal;
      }
    },
    replyRememberMe(newVal, oldVal) {
      this.$emit('updateRememberMe', newVal);
    },
    'replyMessage.username': function(newVal, oldVal) {
      this.$emit('updateUsername', newVal);
    },
    rememberedUsername() {
      this.replyMessage.username = this.rememberedUsername;
    },
    messageToReplyTo(val) {
      if (val !== '') {
        setTimeout(() => document.querySelector('#replyForm #message').focus(), 100);
      }
    },
    quotesToAdd(val) {
      if (val !== '') {
        let replyTextArea = document.querySelector('#replybox textarea#message');
        if (!replyTextArea) {
          const liToQuote = document.querySelector(`[data-quoteid="${val}"]`);
          const replyToId = liToQuote.closest('ul').children[0].id.replace('li_', '');
          document.querySelector(`[data-replyto="${replyToId}"]`).click();
          setTimeout(() => {
            replyTextArea = document.querySelector('#replybox textarea#message');
            this.replyMessage.content += `>>${val}: `;
            replyTextArea.focus();
          }, 200);
        } else {
          replyTextArea.value += `>>${val}: `;
          replyTextArea.focus();
        }
      }
    },
  },
  methods: {
    removeUpload() {
      if (this.uploadDeleteHash) {
        this.isUploading = true;
        fetch(`${this.$backendURL}imgur/${this.uploadDeleteHash}`, {
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
              this.isPreviewingSrc = '';
              this.checkPreview = '';
              this.replyMessage.imageURL = '';
              this.isUploading = '';
            }
          });
      }
    },
    visualizePreview() {
      this.checkPreview = !this.checkPreview;
    },
    toggleInputFile(e) {
      const inputFile = e.target.querySelector('input[type="file"]');
      if (inputFile) {
        inputFile.click();
      }
    },
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
      this.$emit('addReplyToThread', reply);
    },
    clearReplyForm() {
      this.replyMessage.message_id = '';
      if (!this.rememberMe) {
        this.replyMessage.username = '';
      }
      this.replyMessage.content = '';
      this.replyMessage.imageURL = '';
      this.replyMessage.user_id = 0;
      this.optUpload = false;
      this.isUploading = '';
      this.isPreviewing = '';
      this.isPreviewingSrc = '';
      this.uploadDeleteHash = '';
    },
    addReply(e) {
      const submitButton = document.getElementById('submitReply');
      submitButton.classList.add('disabled');
      submitButton.disabled = true;
      this.warning.message = "Enviando, aguarde...";
      this.warning.type = 'alert-info';
      grecaptcha.ready(() => {
        grecaptcha.execute(this.$captchaClient, { action: 'reply' }).then((token) => token)
          .then((token) => {
            this.replyMessage.recaptcha_token = token;
            this.replyMessage.message_id = this.messageToReplyTo;
            fetch(`${this.$backendURL}replies`, {
              method: 'POST',
              body: JSON.stringify(this.replyMessage),
              headers: {
                'content-type': 'application/json',
              },
            }).then((response) => response.json()).then((result) => {
              const parseResult = result;
              if (parseResult.details) {
                const error = parseResult.details.map((detail) => detail.message).join('.');
                this.warning.message = error;
                this.warning.type = 'alert-error';
              } else if (parseResult.error) {
                if (parseResult.origin === 'psql') {
                  if (parseResult.code === '23505') {
                    this.warning.message = 'Mensagem duplicada!\ngit gud e altere algum dos campos antes de enviar ᕦ(ò_óˇ)ᕤ';
                    this.warning.type = 'error';
                  }
                }
              } else {
                this.warning.message = '';
                // aqui tem que disponibilizar o conteúdo do reply na Home.vue
                this.addReplyToThread(parseResult);
                this.clearReplyForm();
                this.closeReply();
              }
              submitButton.classList.remove('disabled');
              submitButton.disabled = false;
            });
          });
      });
    },
    async handleUpload(e) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        await this.uploadToImgur('image', file);
      } else if (file.type.startsWith('video/')) {
        if (this.allowedUploadVideoFormats.includes(file.type)) {
          await this.uploadToImgur('video', file);
        } else {
          this.warning.type = 'alert-error';
          this.warning.message = `Formato de vídeo não aceito! Funciona apenas com os formatos abaixo: ${this.allowedUploadVideoFormats.join(', ')}`;
        }
      } else {
        this.warning.message = `Aceitamos apenas imagens, gifs e vídeos!`;
        this.warning.type = 'alert-error';
      }
    },
    async postImgGif(formData, url) {
      const submitButton = document.querySelector('#replyForm button');
      this.isUploading = true;
      return fetch(url, {
        method: 'POST',
        body: formData,
        redirect: 'follow',
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.status === 200 && result.success === true) {
            this.replyMessage.imageURL = result.data.link;
            // trava o input file e deixa o campo de URL como read only
            this.optUpload = true;
            this.isUploading = '';
            this.isPreviewing = 'image';
            this.isPreviewingSrc = result.data.link;
            this.uploadDeleteHash = result.data.deletehash;
          } else if (result.status === 500 && result.success === false) {
            this.warning.type = 'alert-error';
            this.warning.message = `
              Erro no servidor de upload! :(\n
              Tente subir sua imagem em outro lugar\n
              e poste usando o link!\n
              (https://postimages.org/,\n
              https://imgur.com/upload,\n
              https://giphy.com/upload,\n etc)
              `;
          } else {
            this.warning.type = 'alert-error';
            this.warning.message = `
              Aceitamos apenas imagens no formato\n
              JPEG, PNG, GIF, APNG e TIFF!
              `;
          }
          // libera o botão de enviar
          submitButton.disabled = false;
        });
    },
    async uploadToImgur(kind, file) {
      const submitButton = document.querySelector('#replyForm button');
      submitButton.disabled = true;
      // blank line
      const formData = new FormData();
      if (kind === 'image') {
        formData.append('image', file);
        await this.postImgGif(formData,`${this.$backendURL}gifupload`);
      } else {
        formData.append('video', file);
        fetch(`${this.$backendURL}videoupload`, {
          method: 'POST',
          body: formData,
          redirect: 'follow',
        })
          .then((response) => response.json())
          .then((result) => {
            if (result.status === 200 && result.success === true) {
              this.replyMessage.imageURL = result.data.link;
              // libera o botão de enviar
              submitButton.disabled = false;
              // trava o input file e deixa o campo de URL como read only
              this.optUpload = true;
            } else {
              console.log('handle video upload error');
            }
          });
      }
    },
  },
};
</script>
