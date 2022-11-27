<template>
  <v-form @click="removeWarning($event)" @submit.prevent="addMessage()">
    <h2 id="poste-no-gchan">Poste no gchan</h2>
    <div v-if="warning.message" :class="'alert ' + warning.type">
      <span v-on:click="warning.message = ''">x</span>
      <h4></h4>
      <p>{{ warning.message }}</p>
    </div>
    <v-text-field v-model="message.username" label="Nome"> </v-text-field>
    <v-text-field v-model="message.subject" label="Assunto"> </v-text-field>
    <v-textarea
      :rules="messageRules"
      label="Mensagem"
      v-model="message.message"
    ></v-textarea>
    <v-container class="px-0" fluid>
      <v-radio-group v-model="media_type">
        <v-radio
          label="Enviar arquivo"
          id="upload-media"
          name="media-type"
          value="upload-media"
        ></v-radio>
        <v-radio
          label="Colocar URL"
          id="link-media"
          name="media-type"
          value="link-media"
        ></v-radio>
        <v-radio
          label="Buscar gif"
          id="search-media"
          name="media-type"
          value="search-media"
        ></v-radio>
      </v-radio-group>
    </v-container>
    <v-row
      v-cloak
      @drop.prevent="handleDragAndDrop($event.dataTransfer.files[0])"
      @dragover.prevent
      v-if="media_type == 'upload-media'"
      class="form-group"
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
    <div v-if="media_type == 'link-media'" class="form-group">
      <label for="imageURL" v-if="!this.optUpload">
        digite a URL de uma imagem, gif ou vídeo</label
      >
      <input
        style="width: 100%"
        v-model="message.imageURL"
        type="url"
        class="form-control"
        id="imageURL"
        placeholder="https://~"
        :readonly="this.optUpload === true"
      />
    </div>
    <div v-if="media_type == 'search-media'" class="searchgifstuffs">
      <label v-if="!this.optUpload" for="giphyURL"
        >digite algum termo no campo abaixo!</label
      >
      <input
        v-if="!this.optUpload"
        @keyup="setGifSearchText($event)"
        @touchend="setGifSearchText($event)"
        v-model="message.giphyURL"
        type="text"
        class="form-control"
        id="giphyURL"
        placeholder="cats"
      />
      <input
        style="visibility: hidden"
        v-model="message.imageURL"
        type="url"
        class="form-control"
        id="imageURL"
        readonly
      />
      <Gifbox
        v-bind:gifSearch="gifSearch"
        v-bind:imageURL="message.imageURL"
        @gifIsBeingSearched="gifIsBeingSearched"
        @setGifAsImageURL="setGifAsImageURL"
        v-if="screenSize <= 979"
      ></Gifbox>
      <div
        v-if="!this.optUpload"
        class="gif-search-toggle"
        data-toggle="buttons"
      >
        <input
          v-model="gifSearch.gif_origin"
          class="gif-type"
          type="radio"
          name="options"
          id="option_giphy"
          autocomplete="off"
          checked
          value="giphy"
        />
        <label for="option_giphy" class="btn btn-primary"> Giphy </label>
        <input
          v-model="gifSearch.gif_origin"
          class="gif-type"
          type="radio"
          name="options"
          id="option_gfycat"
          autocomplete="off"
          value="gfycat"
        />
        <label for="option_gfycat" class="btn btn-primary"> gfycat </label>
      </div>
    </div>
    <button
      type="submit"
      :disabled="uploadStatus == 'loading'"
      :class="[
        uploadStatus === 'loading' ? 'disabled' : '',
        'btn btn-primary create-post',
      ]"
    >
      Postar
    </button>
    <div v-if="isPreviewing" class="imagePreview">
      <div
        style="
          width: 100%;
          align-items: center;
          display: flex;
          justify-content: space-between;
        "
      >
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
      </div>
      <img
        v-if="isPreviewing === 'image'"
        src=""
        id="imageToUpload"
        alt="pré-visualização de imagem para upload"
      />
      <video
        v-else-if="isPreviewing === 'video'"
        id="videoToUpload"
        src=""
        autoplay="true"
        loop="true"
        muted="true"
        playsinline="true"
      ></video>
      <p v-else>Formato não suportado! ::(</p>
    </div>
    <Gifbox
      v-bind:gifSearch="gifSearch"
      v-bind:imageURL="message.imageURL"
      @gifIsBeingSearched="gifIsBeingSearched"
      @setGifAsImageURL="setGifAsImageURL"
      v-if="screenSize > 979"
    ></Gifbox>
  </v-form>
</template>
<script>
import Gifbox from "./gifbox.vue";
export default {
  name: "PostForm",
  props: ["allowedVideoFormats"],
  components: {
    Gifbox,
  },
  data: () => ({
    message: {
      username: "",
      subject: "",
      message: "",
      imageURL: "",
      recaptcha_token: "",
    },
    messageRules: [(v) => !!v || "Fale algo pro mundo!"],
    warning: {
      type: "",
      message: "",
    },
    media_type: "upload-media",
    optUpload: "",
    uploadStatus: "",
    isPreviewing: "",
    screenSize: "",
    gifSearch: {
      gif_origin: "giphy",
      isBeingSearched: "",
      gifsPerPage: 4,
      numPages: 5,
      value: "",
    },
    upload: {},
    uploadfilename: null,
  }),
  computed: {
    isProduction() {
      return window.location.host === this.$productionURL;
    },
  },
  methods: {
    removeWarning(e) {
      if (e.target.classList.contains("alert") || e.target.closest(".alert")) {
        // caso clicar no popup, só fecha se for no Xzinho
        return;
      }
      if (this.warning.message != "" && this.warning.type != "alert-info") {
        this.warning.message = "";
      }
    },
    async recaptchaCall() {
      let recaptcha_token = "";
      grecaptcha.ready(() => {
        grecaptcha
          .execute(this.$captchaClienty, { action: "post" })
          .then((token) => {
            recaptcha_token = token;
          });
      });
      while (recaptcha_token == "") {
        await new Promise((r) => setTimeout(r, 100));
      }
      return recaptcha_token;
    },
    async addMessage() {
      const submitButton = document.querySelector(
        ".create-thread > form > button[type=submit]"
      );
      submitButton.disabled = true;
      submitButton.classList.add("disabled");
      this.warning.message = "Enviando, aguarde...";
      this.warning.type = "alert-info";
      this.message.recaptcha_token = this.isProduction
        ? await this.recaptchaCall()
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
      if (response.ok) {
        const result = await response.json();
        if (result.details) {
          const error = result.details
            .map((detail) => detail.message)
            .join(".");
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
          this.clearMsgForm();
        }
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
      let imagePreviewDiv;
      const input = document.querySelector("#uploadIMG");
      // TODO: delete previous img from imgur if user chose to upload a new one
      if (file.type.startsWith("image/")) {
        this.isPreviewing = "image";
        await this.sleep(100);
        imagePreviewDiv = document.querySelector(".imagePreview");
        await this.readAsDataURL(file, imagePreviewDiv.querySelector("img"));
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
        this.isPreviewing = "video";
        await this.sleep(100);
        imagePreviewDiv = document.querySelector(".imagePreview");
        const objUrl = URL.createObjectURL(file);
        imagePreviewDiv.children[0].src = objUrl;
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
            this.uploadStatus = "";
            this.optUpload = false;
            this.isPreviewing = "";
            this.message.imageURL = "";
            document.querySelector("input[name=uploadIMG]").value = "";
            this.upload = {};
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
      this.isPreviewing = "";
      this.gifSearch.isBeingSearched = "";
      const uploadIMG = document.querySelector("#uploadIMG");
      if (uploadIMG) {
        uploadIMG.value = "";
      }
      this.optUpload = "";
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
      this.rememberedUsername = this.message.username;
    },
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    async uploadToImgur(kind, arquivo) {
      const imgPreviewWrapper = document.querySelector(".imagePreview");
      const mediaInUse = imgPreviewWrapper.querySelector("img,video");
      mediaInUse.classList.add("uploading");

      const postURL =
        kind === "image"
          ? `${this.$backendURL}imgur/images`
          : `${this.$backendURL}imgur/videos`;

      const formData = new FormData();
      formData.append("file", arquivo);

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
        // remove a pesquisa por gifs
        this.optUpload = true;
        await this.sleep(100);

        if (this.upload.data.type.startsWith("video/")) {
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
          // TODO: add .hls and .gifv as fallback sources
          mediaInUse.innerHTML = `
                <source src="${this.upload.data.link}"
                type="${this.upload.data.type}">
              `;
        } else {
          mediaInUse.src = this.upload.data.link;
        }
        mediaInUse.classList.remove("uploading");
      } else if (this.upload.status === 500 && this.upload.success === false) {
        this.warning.message = `
              Erro no servidor de upload! :(\n
              Tente subir sua imagem em outro lugar\n
              e poste usando o link!\n
              (https://postimages.org/,\n
              https://imgur.com/upload,\n
              https://giphy.com/upload,\n etc)
              `;
        this.warning.type = "alert-error";
        this.isPreviewing = "";
      } else {
        this.warning.message = `
              Aceitamos apenas imagens no formato\n
              JPEG, PNG, GIF, APNG e TIFF!
            `;
        this.warning.type = "alert-error";
        this.isPreviewing = "";
      }

      this.uploadStatus = "success";
    },
    readAsDataURL(file, img) {
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
    onResize(event) {
      this.screenSize = event.target.innerWidth;
    },
    gifIsBeingSearched(isIt) {
      this.gifSearch.isBeingSearched = isIt;
    },
    setGifSearchText(e) {
      this.gifSearch.value = e.target.value;
    },
    setGifAsImageURL(imageURL) {
      this.message.imageURL = imageURL;
    },
  },
  watch: {
    "message.username": function (newVal, oldVal) {
      this.rememberUsername();
    },
    "gifSearch.isBeingSearched": function (newVal, oldVal) {
      if (newVal !== "") {
        this.isPreviewing = "";
      }
    },
    isPreviewing(val) {
      if (val !== "") {
        this.gifSearch.isBeingSearched = "";
      }
    },
  },
  mounted() {
    this.screenSize = window.innerWidth;
    window.addEventListener("resize", this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
};
</script>