<style scoped>
video {
  width: 100%;
}
.reply-media {
  width: 100%;
  height: auto;
}
.limit-height {
  overflow: hidden;
  max-height: 375px;
}
.midia-column-mobile {
  max-width: 375px;
}
</style>
<template>
  <v-list-item data-type="post" :id="'li_' + message.id">
    <v-container>
      <v-row dense>
        <v-col
          ref="media_col"
          :cols="mediaExpanded || $vuetify.breakpoint.mobile ? 12 : 4"
          :class="midiaColumnClasses()"
        >
          <v-btn
            x-small
            :ripple="false"
            plain
            v-if="message.imageurl && !mediaExpanded && mediaType != 'error'"
            @click="expandMedia($event)"
            >{{
              isMediaOverflowing
                ? mediaType == "img"
                  ? "Imagem cortada. Clique para expandir"
                  : "Vídeo cortado. Clique para expandir"
                : "Clique para expandir"
            }}</v-btn
          >
          <img
            class="reply-media pa-3"
            ref="midia_img"
            v-if="message.imageurl && mediaType == 'img'"
            :alt="message.subject"
            :src="message.imageurl"
            contain
            role="button"
            tabindex="0"
            loading="lazy"
            @load="checkMediaOverflow"
            @error="mediaType = 'video'"
            @click="expandImage($event)"
            @keydown="expandImage($event)"
          />
          <v-btn
            v-if="message.imageurl && mediaType === 'video' && mediaExpanded"
            @click="colapseVideo()"
            plain
            block
            class="justify-start"
            :ripple="false"
          >
            Colapsar
          </v-btn>
          <video
            class="pa-3"
            ref="midia_video"
            v-if="message.imageurl && mediaType === 'video'"
            :src="message.imageurl"
            loop
            muted
            playsinline
            autoplay
            role="button"
            tabindex="0"
            @loadeddata="checkMediaOverflow"
            @error="mediaType = 'error'"
            @click="expandVideo($event)"
            @keydown="expandVideo($event)"
          ></video>
          <v-container
            v-if="message.imageurl && mediaType === 'error'"
            style="height: 100%; user-select: none"
            fluid
            class="d-flex flex-column align-center justify-center"
            ><p>Erro ao carregar mídia!</p>
            <p>{{ message.imageurl }}</p>
            <p>(・`ω´・)</p></v-container
          >
          <v-container
            style="height: 100%; user-select: none"
            fluid
            class="d-flex flex-column align-center justify-center"
            v-if="message.imageurl == ''"
            ><p>Sem imagem!</p>
            <p>(・`ω´・)</p></v-container
          >
        </v-col>
        <v-col cols="8">
          <v-container>
            <h2 v-if="message.subject">
              {{ message.subject }} <small>/ #{{ message.id }}</small>
            </h2>
            <h2 v-else>
              post <small>#{{ message.id }}</small>
            </h2>
            <v-row class="ma-3" :data-message-id="message.id">
              <h3 class="ma-0 mr-3">
                por:
                <span class="font-weight-bold">{{ message.username }}</span>
              </h3>
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    color="grey"
                    @click.stop="clickReply(message.id)"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-reply</v-icon>
                  </v-btn>
                </template>
                <span>Responder</span>
              </v-tooltip>
              <router-link
                v-if="isHome"
                class="d-flex align-center"
                :to="`/post/${message.id}`"
                >ver discussão</router-link
              >
            </v-row>
            <div v-if="isHome && replyCount && replyCount > 2">
              <small>Este post possui {{ replyCount }} respostas!</small>
            </div>
            <p v-html="message.message"></p>
            <div v-if="message.yt_iframes" ref="yt_iframes">
              <div></div>
            </div>
            <p v-if="created">
              <small>{{ created }}</small>
            </p>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </v-list-item>
</template>
<script>
export default {
  name: "Message",
  data: () => ({
    mediaExpanded: false,
    mediaType: "img",
    isMediaOverflowing: false,
  }),
  props: {
    message: {
      id: Number,
      imageurl: String,
      subject: String,
      username: String,
      message: String,
    },
    created: String,
    replyCount: Number,
  },
  computed: {
    isHome() {
      return this.$route.name === "Home";
    },
  },
  methods: {
    fullSize() {
      this.mediaExpanded = !this.mediaExpanded;
    },
    clickReply(messageId) {
      this.$emit("clickReply", messageId);
    },
    colapseVideo() {
      const video = this.$refs.midia_video;
      if (!video) return;

      video.controls = false;
      this.mediaExpanded = false;
    },
    expandVideo(e) {
      if (this.mediaExpanded) return;
      if (e instanceof KeyboardEvent && e.key !== "Enter" && e.key !== " ") {
        return;
      }
      e.preventDefault();
      const video = this.$refs.midia_video;
      if (!video) return;

      video.style.maxWidth = `${video.videoWidth}px`;
      video.style.maxHeight = `${video.videoHeight}px`;

      video.controls = true;
      this.mediaExpanded = true;
    },
    expandImage(e) {
      if (e instanceof KeyboardEvent && e.key !== "Enter" && e.key !== " ") {
        return;
      }
      e.preventDefault();
      const img = this.$refs.midia_img;
      if (!img) return;
      img.style.maxWidth = this.mediaExpanded ? "" : `${img.naturalWidth}px`;
      img.style.maxHeight = this.mediaExpanded ? "" : `${img.naturalHeight}px`;
      this.mediaExpanded = !this.mediaExpanded;
    },
    checkMediaOverflow() {
      const mediaCol = this.$refs.media_col;
      if (mediaCol) {
        this.isMediaOverflowing = mediaCol.scrollHeight > mediaCol.clientHeight;
      }
    },
    expandMedia(e) {
      const img = this.$refs.midia_img;
      if (img) {
        img.focus();
        return this.expandImage(e);
      }
      const video = this.$refs.midia_video;
      if (video) {
        video.focus();
        return this.expandVideo(e);
      }
    },
    midiaColumnClasses() {
      if (this.mediaExpanded) return "";
      let classes = "limit-height ";
      if (this.$vuetify.breakpoint.mobile) {
        classes += "midia-column-mobile";
      }
      return classes;
    },
  },
};
</script>