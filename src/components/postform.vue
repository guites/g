<template>
  <form @click="removeWarning($event)" @submit.prevent="addMessage()">
    <h2 id="poste-no-gchan">Poste no gchan</h2>
    <div v-if="warning.message" :class="'alert ' + warning.type">
      <span v-on:click="warning.message = ''">x</span>
      <h4></h4>
      <p>{{ warning.message }}</p>
    </div>
    <v-text-field v-model="message.username" label="Nome"> </v-text-field>
    <v-text-field v-model="message.subject" label="Assunto"> </v-text-field>
    <v-textarea label="Mensagem" v-model="message.message"></v-textarea>
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
    <div v-if="media_type == 'upload-media'" class="form-group">
      <label for="uploadIMG">
        envie uma imagem, gif ou vídeo
        <span title="Erros podem ocorrer ¯\_(ツ)_/¯" class="badge beta">
          BETA
        </span>
      </label>
      <input
        type="file"
        name="uploadIMG"
        id="uploadIMG"
        :disabled="this.optUpload === true"
        @change="handleUpload($event)"
      />
    </div>
    <div v-if="media_type == 'link-media'" class="form-group">
      <label for="imageURL" v-if="!this.optUpload">
        digite a URL de uma imagem, gif ou vídeo</label
      >
      <label for="imageURL" class="upload-concluido" v-else
        >Upload Concluído!</label
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
          Erro ao realizar o upload!
        </p>
        <button
          type="button"
          v-if="this.optUpload"
          :class="[uploadStatus === 'loading' ? 'disabled' : '']"
          :disabled="uploadStatus == 'loading'"
          @click="removeUpload($event)"
        >
          Remover arquivo
        </button>
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
  </form>
</template>
<script>
import Gifbox from "./gifbox.vue";
export default {
  name: "PostForm",
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
    async handleUpload(e) {
      this.uploadStatus = "loading";
      let imagePreviewDiv;
      const file = e.target.files[0];
      const input = document.querySelector("#uploadIMG");
      if (file.type.startsWith("image/")) {
        this.isPreviewing = "image";
        await this.sleep(100);
        imagePreviewDiv = document.querySelector(".imagePreview");
        await this.readAsDataURL(file, imagePreviewDiv.querySelector("img"));
        await this.uploadToImgur("image", file);
      } else if (file.type.startsWith("video/")) {
        if (this.allowedUploadVideoFormats.includes(file.type)) {
          this.isPreviewing = "video";
          await this.sleep(100);
          imagePreviewDiv = document.querySelector(".imagePreview");
          const objUrl = URL.createObjectURL(file);
          imagePreviewDiv.children[0].src = objUrl;
          await this.uploadToImgur("video", file);
        } else {
          this.uploadStatus = "error";
          this.warning.message = `
            Formato de vídeo não aceito!\n
            Funciona apenas com os formatos abaixo:\n
            ${this.allowedUploadVideoFormats.join(", ")}
          `;
          this.warning.type = "alert-error";
          input.value = "";
        }
      } else {
        this.warning.message = `
          Aceitamos apenas imagens,\n
          gifs e vídeos!
        `;
        this.warning.type = "alert-error";
        input.value = "";
      }
    },
    removeUpload(e) {
      this.uploadStatus = "loading";
      const deleteHash = e.target.getAttribute("data-deletehash").trim();
      fetch(`${this.$backendURL}imgur/${deleteHash}`, {
        method: "DELETE",
        headers: {
          Authorization: "Client-ID 3435e574a9859d1",
        },
        redirect: "follow",
      })
        .then((response) => response.json())
        .then((r) => {
          if (r.data === true && r.success === true) {
            this.uploadStatus = "";
            this.optUpload = false;
            this.isPreviewing = "";
            this.message.imageURL = "";
            document.querySelector("input[name=uploadIMG]").value = "";
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
      //const submitButton = document.querySelector('.create-thread > form > button[type=submit]');
      //submitButton.disabled = true;
      //submitButton.classList.add('disabled');

      let postURL;
      const formData = new FormData();
      if (kind === "image") {
        formData.append("image", arquivo);
        postURL = `${this.$backendURL}${this.imgurURLgif}`;
      } else {
        formData.append("video", arquivo);
        postURL = `${this.$backendURL}${this.imgurURLupload}`;
      }
      const requestOptions = {
        method: "POST",
        body: formData,
        redirect: "follow",
      };
      fetch(postURL, requestOptions)
        .then((response) => response.json())
        .then(async (result) => {
          if (result.status === 200 && result.success === true) {
            this.message.imageURL = result.data.link;
            // remove a pesquisa por gifs
            this.optUpload = true;
            await this.sleep(100);
            if (result.data.type.startsWith("video/")) {
              mediaInUse.innerHTML = `
                <source src="${result.data.link}"
                type="${result.data.type}">
              `;
            } else {
              mediaInUse.src = result.data.link;
            }
            mediaInUse.classList.remove("uploading");
            const removeBtn = imgPreviewWrapper.querySelector("button");
            removeBtn.setAttribute("data-deletehash", result.data.deletehash);
          } else if (result.status === 500 && result.success === false) {
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
          //submitButton.disabled = false;
          //submitButton.classList.remove('disabled');
          this.uploadStatus = "success";
        })
        .catch((error) => {
          this.uploadStatus = "error";
          console.log("error", error);
        });
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