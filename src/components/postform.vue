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
    <v-btn type="submit" :class="['btn btn-primary create-post']">
      Postar
    </v-btn>
  </v-form>
</template>
<script>
export default {
  name: "PostForm",
  props: ["allowedVideoFormats", "removeUploadSignal"],
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
          input.value = "";
          return;
        }

        await this.sleep(100);
        // previewVideoFromFile(file);
        await this.uploadToImgur("video", file);
        return;
      }

      input.value = "";
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
    async uploadToImgur(kind, file) {
      this.$emit("showMediaPreview", {
        status: "uploading",
        mediaType: kind,
        upload: {},
        removeUploadSignal: false,
      });

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
        this.$emit("showMediaPreview", {
          status: "error",
          mediaType: kind,
          upload: {},
          removeUploadSignal: false,
        });
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
        this.$emit("showMediaPreview", {
          status: "success",
          mediaType: kind,
          upload: this.upload,
          removeUploadSignal: false,
        });
        return;
      }

      if (this.upload.status === 500 && this.upload.success === false) {
        this.$emit("showMediaPreview", {
          status: "error",
          mediaType: kind,
          upload: {},
          removeUploadSignal: false,
        });
        return;
      }
      this.$emit("showMediaPreview", {
        status: "error",
        mediaType: kind,
        upload: {},
        removeUploadSignal: false,
      });
    },
    removeUpload() {
      this.$emit("showMediaPreview", {
        status: "uploading",
        mediaType: "",
        upload: {},
        removeUploadSignal: false,
      });
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
            this.uploadfilename = null;
            this.$emit("showMediaPreview", {
              status: "",
              mediaUrl: "",
              mediaType: "",
              upload: {},
              removeUploadSignal: false,
            });
          }
        });
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
    removeUploadSignal: function (newVal, oldVal) {
      if (newVal) this.removeUpload();
    },
  },
  mounted() {
    const rememberedUsername = localStorage.getItem("gchan_username");
    if (rememberedUsername) this.message.username = rememberedUsername;
  },
};
</script>