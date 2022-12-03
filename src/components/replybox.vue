<style>
#replybox-header {
  user-select: none;
  cursor: grab;
}
body.is-dragging {
  cursor: grabbing;
}
body.is-dragging #replybox-header {
  cursor: grabbing;
}
</style>  
<template>
  <v-dialog v-model="isOpen" max-width="290">
    <v-card ref="replybox">
      <v-container
        id="replybox-header"
        class="d-flex justify-space-between"
        @mousedown="dragMouseDown"
        ref="dragSpan"
        ><h3>responder ao post #{{ messageToReplyTo }}</h3>
        <v-btn @click="this.closeReply"> <v-icon> mdi-close </v-icon></v-btn>
      </v-container>
      <v-divider> </v-divider>
      <v-container v-if="!checkPreview">
        <v-form
          ref="replyform"
          id="replyForm"
          @submit.prevent="addReply($event)"
        >
          <v-text-field
            :messages="
              replyMessage.username
                ? 'anonimato é para os fracos'
                : 'o anonimato é a fama do futuro'
            "
            v-model="replyMessage.username"
            label="Nome"
          >
          </v-text-field>
          <v-textarea
            :rules="messageRules"
            label="Mensagem"
            v-model="replyMessage.content"
            ref="messageField"
            autofocus
          >
            <template #label>
              Mensagem <span class="red--text"><strong> *</strong></span>
            </template>
          </v-textarea>
          <v-container>
            <v-file-input
              v-if="!isTypingUrl"
              v-model="uploadfilename"
              label="Envie uma imagem, gif ou vídeo"
              outlined
              dense
              prepend-inner-icon="mdi-paperclip"
              prepend-icon=""
              :clearable="false"
              @change="handleUpload($event)"
              id="replyIMG"
              name="replyIMG"
              :messages="['Ou arraste um arquivo para cá']"
            >
              <v-icon
                v-if="uploadfilename"
                slot="append"
                @click="removeUpload()"
              >
                mdi-close
              </v-icon>
            </v-file-input>
            <v-text-field
              v-if="isTypingUrl"
              label="Digite a URL de uma imagem, gif ou vídeo"
              placeholder="https://i.imgur.com/BTNIDBR.gif"
              type="url"
              v-model="typingUrl"
              dense
              outlined
              prepend-inner-icon="mdi-lead-pencil"
              id="input_url"
              name="input_url"
              v-on:blur="previewFromUrl($event)"
            >
            </v-text-field>
            <transition>
              <v-btn
                v-if="isTypingUrl"
                :disabled="this.isUploading"
                :class="[
                  isUploading ? 'disabled' : '',
                  'mobile-only cancel-url',
                ]"
                v-on:click="setTypingInput()"
                type="button"
              >
                <v-icon left> mdi-swap-horizontal </v-icon>
                Enviar arquivo
              </v-btn>
              <v-btn
                v-if="!isTypingUrl && !isPreviewing"
                :disabled="this.isUploading"
                :class="[isUploading ? 'disabled' : '', 'mobile-only']"
                v-on:click="setTypingInput()"
                type="button"
              >
                <v-icon left> mdi-swap-horizontal </v-icon>
                Digitar URL
              </v-btn>
              <v-btn
                v-if="isPreviewing"
                :disabled="this.isUploading"
                type="button"
                @click="visualizePreview()"
              >
                Visualizar preview
              </v-btn>
            </transition>
          </v-container>
          <v-container class="d-flex justify-end">
            <v-btn
              id="submitReply"
              type="submit"
              :disabled="isUploading"
              :class="[
                isUploading ? 'disabled' : '',
                'btn btn-primary create-post',
              ]"
            >
              Postar
            </v-btn>
          </v-container>
        </v-form>
      </v-container>
      <v-container v-if="checkPreview">
        <v-img
          @load="validateTypedUrl()"
          @error="setVideoSrc()"
          v-if="isPreviewing === 'image'"
          :src="isPreviewingSrc"
        />
        <video
          style="width: 100%"
          v-if="isPreviewing === 'video'"
          :src="isPreviewingSrc"
          @play="validateTypedUrl()"
          @error="videoErrorCallback()"
          autoplay="true"
          controls
          loop="true"
          muted="true"
          playsinline="true"
        ></video>
        <v-container class="form-group row justify-center">
          <v-btn
            plain
            :disabled="this.isUploading"
            type="button"
            @click="removeUpload()"
          >
            Cancelar
          </v-btn>
          <v-btn
            plain
            color="primary"
            :disabled="this.isUploading"
            type="button"
            @click="visualizePreview()"
          >
            Confirmar
          </v-btn>
        </v-container>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ReplyBox",
  props: [
    "show",
    "messageToReplyTo",
    "allowedVideoFormats",
    "quotesToAdd",
    "rememberedUsername",
    "rememberMe",
  ],
  data: () => ({
    replyTo: {
      message_id: "",
    },
    positions: {
      clientX: undefined,
      clientY: undefined,
      movementX: 0,
      movementY: 0,
      boundsFlag: "",
      boundsHorzFlag: "",
      boundsVertFlag: "",
      dragging: false,
    },
    replyMessage: {
      username: "",
      content: "",
      imageURL: "",
      message_id: "",
      user_id: 0,
      recaptcha_token: "",
    },
    replyRememberMe: 1,
    warning: {
      type: "",
      message: "",
      preventClose: false,
    },
    uploadDeleteHash: "",
    isUploading: false,
    isPreviewing: "",
    isPreviewingSrc: "",
    checkPreview: "",
    isTypingUrl: false,
    typingUrl: "",
    typedMediaIsValid: false,
    messageRules: [(v) => !!v || "Escreva sua resposta!"],
    uploadfilename: null,
  }),
  watch: {
    rememberMe(newVal, oldVal) {
      if (newVal != oldVal) {
        this.replyRememberMe = newVal;
      }
    },
    replyRememberMe(newVal, oldVal) {
      this.$emit("updateRememberMe", newVal);
    },
    "replyMessage.username": function (newVal, oldVal) {
      this.$emit("updateUsername", newVal);
    },
    rememberedUsername() {
      this.replyMessage.username = this.rememberedUsername;
    },
    quotesToAdd(val) {
      if (val !== "") {
        let replyTextArea = document.querySelector(
          "#replybox textarea#message"
        );
        if (!replyTextArea) {
          const liToQuote = document.querySelector(`[data-quoteid="${val}"]`);
          const replyToId = liToQuote
            .closest("ul")
            .children[0].id.replace("li_", "");
          document.querySelector(`[data-replyto="${replyToId}"]`).click();
          setTimeout(() => {
            replyTextArea = document.querySelector(
              "#replybox textarea#message"
            );
            this.replyMessage.content += `>>${val}: `;
            replyTextArea.focus();
          }, 200);
        } else {
          replyTextArea.value += `>>${val}: `;
          replyTextArea.focus();
        }
      }
    },
    show() {
      this.$nextTick(() => {
        // prevents replyBox form from opening up with validation errors
        this.$refs.replyform.resetValidation();
        // resets replyBox position to center of screen
        this.centerReplybox();
      });
    },
  },
  methods: {
    videoErrorCallback() {
      this.checkPreview = false;
      this.isPreviewing = "";
      this.warning.type = "alert-error";
      this.warning.message =
        "Não conseguimos verificar sua URL! Certifique-se de que ela se trata de uma imagem, gif ou vídeo.";
    },
    setVideoSrc() {
      // when this function is called, url given couldnt generate an img tag
      this.isPreviewing = "video";
    },
    validateTypedUrl() {
      if (this.typingUrl !== "") {
        this.typedMediaIsValid = true;
      }
    },
    previewFromUrl(e) {
      const inputUrl = e.target;
      if (this.typingUrl !== "") {
        inputUrl.setCustomValidity("");
        if (inputUrl.checkValidity()) {
          this.visualizePreview();
          this.isPreviewing = "image";
          this.isPreviewingSrc = this.typingUrl;
        }
      }
    },
    setTypingInput() {
      this.isTypingUrl = !this.isTypingUrl;
      if (this.isTypingUrl) {
        setTimeout(() => {
          const input_url = document.querySelector("#input_url");
          if (input_url) {
            input_url.focus();
          }
        }, 100);
      }
    },
    removeUpload() {
      if (this.uploadDeleteHash) {
        // if image was uploaded
        this.isUploading = true;
        fetch(`${this.$backendURL}imgur/${this.uploadDeleteHash}`, {
          method: "DELETE",
          headers: {
            Authorization: "Client-ID 3435e574a9859d1",
          },
          redirect: "follow",
        })
          .then((response) => response.json())
          .then((r) => {
            if (r.data === true && r.success === true) {
              this.replyMessage.imageURL = "";
              this.isUploading = false;
              this.isPreviewing = "";
              this.isPreviewingSrc = "";
              this.uploadDeleteHash = "";
              this.checkPreview = "";
            }
          });
      } else {
        this.typedMediaIsValid = false;
        this.typingUrl = "";
        this.isPreviewing = "";
        this.checkPreview = "";
      }
      this.uploadfilename = null;
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
      const spanRect = event.target
        .closest(".v-dialog.v-dialog--active")
        .getBoundingClientRect();
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
      if (!this.positions.dragging) return;
      const replyBox = document.querySelector(".v-dialog.v-dialog--active");
      document.body.classList.add("is-dragging");
      const replyBoxPos = replyBox.getBoundingClientRect();
      if (!(replyBoxPos.top > 0)) this.positions.boundsVertFlag = "top";
      if (!(replyBoxPos.top < window.innerHeight - replyBoxPos.height)) {
        this.positions.boundsVertFlag = "bottom";
      }
      if (!(replyBoxPos.left > 0)) this.positions.boundsHorzFlag = "left";
      if (!(replyBoxPos.left < window.innerWidth - replyBoxPos.width))
        this.positions.boundsHorzFlag = "right";
      //  tem que ser dois verificadores separados
      if (this.positions.boundsHorzFlag === "") {
        replyBox.style.left = `${event.clientX - this.positions.clickedLeft}px`;
        // VERIFICAR APÓS SETAR OS VALORES DEIXA MAIS FLUIDO !!
        if (replyBox.getBoundingClientRect().left < 0) {
          replyBox.style.left = "1px";
        } else if (replyBox.getBoundingClientRect().left > window.innerWidth) {
          replyBox.style.left = `${window.innerWidth - 1}px`;
        }
        // TEM QUE TRAVAR AS DIMENSÕES ISOLADAMENTE !!
      } else {
        switch (this.positions.boundsHorzFlag) {
          case "left":
            if (event.clientX > replyBoxPos.width / 3) {
              if (!(this.positions.clickedLeft > replyBoxPos.width / 3 - 50)) {
                this.positions.clickedLeft = replyBoxPos.width / 3 - 50;
              }
              this.positions.boundsHorzFlag = "";
            } else {
              replyBox.style.left = "1px";
            }
            break;
          case "right":
            if (event.clientX < window.innerWidth - replyBoxPos.width / 2) {
              this.positions.clickedLeft = 0.5 * replyBoxPos.width + 50;
              this.positions.boundsHorzFlag = "";
            } else {
              replyBox.style.left = `${
                window.innerWidth - replyBoxPos.width - 1
              }px`;
            }
            break;
          default:
            this.positions.boundsHorzFlag = "";
        }
      }
      if (this.positions.boundsVertFlag === "") {
        replyBox.style.top = `${event.clientY - this.positions.clickedTop}px`;
      } else {
        switch (this.positions.boundsVertFlag) {
          case "top":
            if (event.clientY > 25) {
              this.positions.boundsVertFlag = "";
            } else {
              replyBox.style.top = "1px";
            }
            break;
          case "bottom":
            if (event.clientY < window.innerHeight - replyBoxPos.height) {
              this.positions.boundsVertFlag = "";
            } else {
              replyBox.style.top = `${
                window.innerHeight - replyBoxPos.height - 1
              }px`;
            }
            break;
          default:
            this.positions.boundsVertFlag = "";
        }
      }
    },
    closeDragElement() {
      this.positions.dragging = false;
      document.onmouseup = null;
      document.onmousemove = null;
      document.body.classList.remove("is-dragging");
    },
    centerReplybox() {
      const spanRect = document
        .querySelector("#replybox-header")
        .closest(".v-dialog.v-dialog--active");
      if (spanRect) {
        spanRect.style.position = "absolute";
        spanRect.style.top = "";
        spanRect.style.left = "";
        spanRect.style.transition = "none";
        spanRect.style.margin = "0px";
      }
    },
    isInSpan(event) {
      const dragSpanPos = this.$refs.dragSpan.getBoundingClientRect();
      if (
        event.clientX > dragSpanPos.left &&
        event.clientX < dragSpanPos.right &&
        event.clientY > dragSpanPos.top &&
        event.clientY < dragSpanPos.bottom
      ) {
        return true;
      }
      return false;
    },
    isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      );
    },
    closeReply() {
      this.$emit("closeReply");
    },
    addReplyToThread(reply) {
      this.$emit("addReplyToThread", reply);
    },
    clearReplyForm() {
      this.replyMessage.message_id = "";
      if (!this.rememberMe) {
        this.replyMessage.username = "";
      }
      this.replyMessage.content = "";
      this.replyMessage.imageURL = "";
      this.replyMessage.user_id = 0;
      this.isUploading = false;
      this.isPreviewing = "";
      this.isPreviewingSrc = "";
      this.uploadDeleteHash = "";
      this.typingUrl = "";
      this.isTypingUrl = "";
      this.uploadfilename = null;
    },
    async addReply(e) {
      if (this.isTypingUrl) {
        // user checked that wants to type an url
        if (!this.typedMediaIsValid) {
          // user didnt fill url input or url didnt generate preview correctly
          // TODO: show error feedback
          return;
        }
        this.replyMessage.imageURL = this.typingUrl;
      }
      this.isUploading = true;
      this.replyMessage.recaptcha_token = this.isProduction
        ? await this.recaptchaCall("reply")
        : "";
      this.replyMessage.message_id = this.messageToReplyTo;
      const response = await fetch(`${this.$backendURL}replies`, {
        method: "POST",
        body: JSON.stringify(this.replyMessage),
        headers: {
          "content-type": "application/json",
        },
      });
      if (!response.ok) {
        // TODO: show error feedback, handle different error codes, etc
      }
      const result = await response.json();
      const parseResult = result;
      if (parseResult.details) {
        const error = parseResult.details
          .map((detail) => detail.message)
          .join(".");
        this.warning.message = error;
        this.warning.type = "alert-error";
      } else if (parseResult.error) {
        if (parseResult.origin === "psql") {
          if (parseResult.code === "23505") {
            this.warning.message =
              "Mensagem duplicada!\ngit gud e altere algum dos campos antes de enviar ᕦ(ò_óˇ)ᕤ";
            this.warning.type = "error";
          }
        }
      } else {
        this.warning.message = "";
        // aqui tem que disponibilizar o conteúdo do reply na Home.vue
        this.addReplyToThread(parseResult);
        this.clearReplyForm();
        this.closeReply();
      }
      this.isUploading = false;
    },
    async handleUpload(file) {
      if (!file) return;
      this.isUploading = true;
      if (file.type.startsWith("image/")) {
        await this.uploadToImgur("image", file);
        return;
      }

      if (file.type.startsWith("video/")) {
        if (!this.allowedVideoFormats.includes(file.type)) return;
        await this.uploadToImgur("video", file);
        return;
      }
    },
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    async postImgGif(formData, url) {
      this.isUploading = true;
      return fetch(url, {
        method: "POST",
        body: formData,
        redirect: "follow",
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.status === 200 && result.success === true) {
            this.replyMessage.imageURL = result.data.link;
            this.isUploading = false;
            this.isPreviewing = "image";
            this.isPreviewingSrc = result.data.link;
            this.uploadDeleteHash = result.data.deletehash;
          } else if (result.status === 500 && result.success === false) {
            this.warning.type = "alert-error";
            this.warning.message = `
              Erro no servidor de upload! :(\n
              Tente subir sua imagem em outro lugar\n
              e poste usando o link!\n
              (https://postimages.org/,\n
              https://imgur.com/upload,\n
              https://giphy.com/upload,\n etc)
              `;
          } else {
            this.warning.type = "alert-error";
            this.warning.message = `
              Aceitamos apenas imagens no formato\n
              JPEG, PNG, GIF, APNG e TIFF!
              `;
          }
          this.isUploading = false;
        });
    },
    async uploadToImgur(kind, file) {
      this.uploadfilename = file;
      const postURL =
        kind === "image"
          ? `${this.$backendURL}imgur/images`
          : `${this.$backendURL}imgur/videos`;

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(postURL, {
        method: "POST",
        body: formData,
        redirect: "follow",
      });

      if (!response.ok) {
        this.uploadStatus = "error";
        // TODO: prevent image/video preview on upload error
        return;
      }

      let result = await response.json();

      if (result.status === 200 && result.success === true) {
        this.isUploading = false;
        this.isPreviewing = kind;
        this.isPreviewingSrc = result.data.link;
        this.replyMessage.imageURL = result.data.link;
        // prevents user from messing with the URL value after upload to imgur is complete
        await this.sleep(100);
        // TODO: set a maximum timeout to avoid getting user stuck waiting forever
        while (result.data.processing.status !== "completed") {
          await new Promise(async () => {
            setTimeout(async () => {
              result = await fetch(
                `${this.$backendURL}imgur/${result.data.id}`
              );
            }, 100);
          });
        }
        this.uploadStatus = "success";
        return;
      }

      if (result.status === 500 && result.status.success === false) {
        // TODO: handle errors!
        return;
      }
    },
  },
  computed: {
    isOpen: {
      get() {
        return this.show;
      },
      set(_) {
        this.$emit("closeReply");
      },
    },
  },
};
</script>
