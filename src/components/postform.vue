<template>
  <v-form
    ref="postform"
    lazy-validation
    @submit.prevent="addMessage()"
    id="postForm"
    style="width: 100%; max-width: 500px"
  >
    <h2 id="poste-no-gchan">Poste no gchan</h2>
    <v-text-field
      :messages="
        message.username
          ? 'anonimato é para os fracos'
          : 'o anonimato é a fama do futuro'
      "
      v-model="message.username"
      label="Nome"
    >
    </v-text-field>
    <v-expand-transition>
      <v-checkbox
        dense
        class="ma-0"
        v-if="message.username"
        v-model="rememberMe"
        @change="rememberUsername()"
        label="Lembrar meu nome"
      ></v-checkbox>
    </v-expand-transition>
    <v-text-field v-model="message.subject" label="Assunto"> </v-text-field>
    <v-textarea
      :rules="messageRules"
      label="Mensagem"
      v-model="message.message"
      required
      ref="messageField"
    >
      <template #label>
        Mensagem <span class="red--text"><strong> *</strong></span>
      </template>
    </v-textarea>
    <v-container class="px-0" fluid>
      <v-radio-group v-model="media_type">
        <v-radio
          label="Enviar arquivo"
          id="upload-media"
          name="media-type"
          value="upload-media"
        ></v-radio>
        <v-radio
          label="Digitar URL"
          id="link-media"
          name="media-type"
          value="link-media"
        ></v-radio>
      </v-radio-group>
    </v-container>
    <v-row
      v-if="media_type == 'upload-media'"
      v-cloak
      @drop.prevent="handleDragAndDrop($event.dataTransfer.files[0])"
      @dragover.prevent
    >
      <v-file-input
        v-model="uploadfilename"
        label="Envie uma imagem, gif ou vídeo"
        outlined
        dense
        id="uploadIMG"
        name="uploadIMG"
        @change="handleUpload($event)"
        :messages="['Ou arraste um arquivo para cá']"
        prepend-inner-icon="mdi-paperclip"
        prepend-icon=""
        class="pa-6"
        :clearable="false"
      >
        <v-icon v-if="this.upload.data" slot="append" @click="removeUpload()">
          mdi-close
        </v-icon></v-file-input
      >
    </v-row>
    <v-row v-if="media_type == 'link-media'">
      <v-text-field
        label="Digite a URL de uma imagem, gif ou vídeo"
        placeholder="https://i.imgur.com/BTNIDBR.gif"
        type="url"
        v-model="message.imageURL"
        :readonly="this.upload.data !== undefined"
        dense
        outlined
        class="pa-6"
        prepend-inner-icon="mdi-lead-pencil"
      >
      </v-text-field>
    </v-row>
    <v-btn
      type="submit"
      :disabled="uploadStatus == 'loading'"
      :class="[
        uploadStatus === 'loading' ? 'disabled' : '',
        'btn btn-primary create-post',
      ]"
    >
      Postar
    </v-btn>
    <v-container v-if="uploadStatus !== ''" id="mediaPreview">
      <v-row>
        <p v-if="uploadStatus == 'loading'" class="info">Aguarde...</p>
        <p v-if="uploadStatus == 'success'" class="success">
          Upload concluído!
        </p>
        <p v-if="uploadStatus == 'error'" class="error">
          Erro ao realizar o upload! o(〒﹏〒)o <br />Por favor, nos avise pelo
          <!-- TODO: contact info shoulnd't be hardcoded -->
          <a
            target="_blank"
            :href="`http://twitter.com/intent/tweet?url=${this.$projectURL}&text=%3CDescreva%20o%20problema%20e%20n%C3%B3s%20entraremos%20em%20contato%21%3E&via=gui_garcia67`"
            >tweeter</a
          >,
          <a target="_blank" href="https://github.com/guites/g/issues/new"
            >github</a
          >
          ou <a href="mailto:gui.garcia67@gmail.com">email</a>
        </p>
      </v-row>
      <v-row id="renderPreview"> </v-row>
    </v-container>
  </v-form>
</template>
<script>
export default {
  name: "PostForm",
  props: ["allowedVideoFormats"],
  data: () => ({
    message: {
      username: "",
      subject: "",
      message: "",
      imageURL: "",
      recaptcha_token: "",
    },
    rememberMe: true,
    messageRules: [(v) => !!v || "Fale algo pro mundo!"],
    warning: {
      type: "",
      message: "",
    },
    media_type: "upload-media",
    upload: {},
    uploadfilename: null,
    uploadStatus: "",
  }),
  computed: {
    isProduction() {
      return window.location.host === this.$productionURL;
    },
  },
  methods: {
    async addMessage() {
      const formIsValid = this.$refs.postform.validate();
      if (!formIsValid) {
        return this.$refs.messageField.focus();
      }
      const submitButton = document.querySelector(
        "#postForm button[type=submit]"
      );
      submitButton.disabled = true;
      submitButton.classList.add("disabled");
      this.warning.message = "Enviando, aguarde...";
      this.warning.type = "alert-info";
      this.message.recaptcha_token = this.isProduction
        ? await this.recaptchaCall("post")
        : "";
      const response = await fetch(`${this.$backendURL}${this.$messages}`, {
        method: "POST",
        body: JSON.stringify(this.message),
        headers: {
          "content-type": "application/json",
        },
      });
      if (!response.ok) {
        this.warning.message = "Algo deu errado (ಥ﹏ಥ)";
        this.warning.type = "alert-error";
        // TODO: handle different error codes, etc
      }
      const result = await response.json();
      if (result.details) {
        const error = result.details.map((detail) => detail.message).join(".");
        this.warning.message = error;
      } else if (result.error) {
        if (result.origin === "psql") {
          if (result.code === "23505") {
            this.warning.message =
              "Mensagem duplicada!\ngit gud e altere algum dos campos antes de enviar ᕦ(ò_óˇ)ᕤ";
            this.warning.type = "alert-error";
          }
        }
      } else {
        this.warning.message = "Post enviado!";
        this.warning.type = "alert-success";
        this.$emit("new-post", result);
        this.$refs.postform.resetValidation();
        this.clearMsgForm();
      }
      submitButton.disabled = false;
      submitButton.classList.remove("disabled");
    },
    handleDragAndDrop(file) {
      this.uploadfilename = file;
      this.handleUpload(file);
    },
    async handleUpload(file) {
      if (!file) return;
      this.uploadStatus = "loading";
      const input = document.querySelector("#uploadIMG");

      // TODO: delete previous img from imgur if user chose to upload a new one
      if (file.type.startsWith("image/")) {
        await this.sleep(100);
        // await this.previewImageFromFile(file);
        await this.uploadToImgur("image", file);
        return;
      }

      if (file.type.startsWith("video/")) {
        if (!this.allowedVideoFormats.includes(file.type)) {
          this.uploadStatus = "error";
          this.warning.message = `
            Formato de vídeo não aceito!\n
            Funciona apenas com os formatos abaixo:\n
            ${this.allowedVideoFormats.join(", ")}
          `;
          this.warning.type = "alert-error";
          input.value = "";
          return;
        }

        await this.sleep(100);
        // previewVideoFromFile(file);
        await this.uploadToImgur("video", file);
        return;
      }

      this.warning.message = `
        Aceitamos apenas imagens,\n
        gifs e vídeos!
    `;
      this.warning.type = "alert-error";
      input.value = "";
    },
    removeUpload() {
      this.uploadStatus = "loading";
      fetch(`${this.$backendURL}imgur/delete/${this.upload.data.deletehash}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((r) => {
          if (r.data === true && r.success === true) {
            this.message.imageURL = "";
            const uploadIMG = document.querySelector("#uploadIMG");
            if (uploadIMG) {
              uploadIMG.value = "";
            }
            this.upload = {};
            this.uploadStatus = "";
            this.uploadfilename = null;
          }
        });
    },
    clearMsgForm() {
      if (!this.rememberMe) {
        this.message.username = "";
      }
      this.message.subject = "";
      this.message.message = "";
      this.message.imageURL = "";
      this.message.user_id = 0;
      this.message.recaptcha_token = "";
      const uploadIMG = document.querySelector("#uploadIMG");
      if (uploadIMG) {
        uploadIMG.value = "";
      }
      this.upload = {};
      this.uploadStatus = "";
      this.uploadfilename = null;
    },
    rememberUsername() {
      if (this.message.username !== "" && this.rememberMe) {
        localStorage.setItem("gchan_username", this.message.username);
      } else {
        const getUsername = localStorage.getItem("gchan_username");
        if (getUsername) {
          localStorage.removeItem("gchan_username");
        }
      }
    },
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    renderUpload() {
      // injects either an <img> or <video> tag containing this.upload's data into the dom
      const renderPreview = document.querySelector("#renderPreview");
      const isVideo = this.upload.data.type.startsWith("video/");
      if (isVideo) {
        // TODO: add .hls and .gifv as fallback sources
        renderPreview.innerHTML = `
        <video
          src="${this.upload.data.link}"
          autoplay="true"
          controls
          loop="true"
          muted="true"
          playsinline="true"
        >
          <source src="${this.upload.data.link}" type="${this.upload.data.type}"
        </video>
        `;
        return;
      }
      renderPreview.innerHTML = `
      <img
        src="${this.upload.data.link}"
        alt="pré-visualização de imagem para upload"
      />`;
    },
    async uploadToImgur(kind, file) {
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

      const result = await response.json();

      if (result.status === 200 && result.success === true) {
        this.upload = result;
        this.message.imageURL = this.upload.data.link;
        // prevents user from messing with the URL value after upload to imgur is complete
        await this.sleep(100);
        // TODO: set a maximum timeout to avoid getting user stuck waiting forever
        while (this.upload.data.processing.status !== "completed") {
          await new Promise(async () => {
            setTimeout(async () => {
              this.upload = await fetch(
                `${this.$backendURL}imgur/${result.data.id}`
              );
            }, 100);
          });
        }
        this.uploadStatus = "success";
        this.renderUpload();
        return;
      }

      if (this.upload.status === 500 && this.upload.success === false) {
        this.warning.message = `
              Erro no servidor de upload! :(\n
              Tente subir sua imagem em outro lugar\n
              e poste usando o link!\n
              (https://postimages.org/,\n
              https://imgur.com/upload,\n
              https://giphy.com/upload,\n etc)
              `;
        this.warning.type = "alert-error";
        this.uploadStatus = "success";
        return;
      }

      this.warning.message = `
              Aceitamos apenas imagens no formato\n
              JPEG, PNG, GIF, APNG e TIFF!
            `;
      this.warning.type = "alert-error";
      this.uploadStatus = "success";
    },
    previewImageFromFile(file) {
      // this method renders the preview of an image received via file input
      const img = document.querySelector("#mediaPreview img");
      return new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = function () {
          const setImg = img;
          setImg.src = fileReader.result;
          return resolve({
            data: fileReader.result,
            name: file.name,
            size: file.size,
            type: file.type,
          });
        };
        fileReader.readAsDataURL(file);
      });
    },
    previewVideoFromFile(file) {
      // this method renders the preview of a video received via file input
      const objUrl = URL.createObjectURL(file);
      const mediaPreviewDiv = document.querySelector("#mediaPreview");
      mediaPreviewDiv.children[0].src = objUrl;
    },
  },
  watch: {
    "message.username": function (newVal, oldVal) {
      this.rememberUsername();
    },
  },
  mounted() {
    const rememberedUsername = localStorage.getItem("gchan_username");
    if (rememberedUsername) this.message.username = rememberedUsername;
  },
};
</script>