<style scoped>
.v-image >>> .v-image__image.v-image__image--contain {
  background-position: top center !important;
}
video {
  width: 100%;
}
.reply-media {
  max-height: 195px;
  max-width: 195px;
}
</style>
<template>
  <v-list-item class="ml-6" data-type="reply">
    <v-container>
      <v-card :class="`d-flex ${mediaExpanded ? 'flex-column' : ''}`">
        <img
          class="reply-media pa-3"
          v-if="reply.imageurl && mediaType == 'img'"
          alt=""
          :src="reply.imageurl"
          contain
          role="button"
          tabindex="0"
          loading="lazy"
          @error="mediaType = 'video'"
          @click="expandImage($event)"
          @keydown="expandImage($event)"
        />
        <v-btn
          v-if="reply.imageurl && mediaType === 'video' && mediaExpanded"
          style="width: 135px; margin: 5px auto"
          @click="colapseVideo()"
          plain
        >
          Colapsar
        </v-btn>
        <video
          ref="midia_video"
          class="reply-media pa-3"
          v-if="reply.imageurl && mediaType === 'video'"
          :src="reply.imageurl"
          loop
          muted
          playsinline
          autoplay
          role="button"
          tabindex="0"
          @error="mediaType = 'error'"
          @click="expandVideo($event)"
          @keydown="expandVideo($event)"
        ></video>
        <v-container
          v-if="reply.imageurl && mediaType === 'error'"
          style="height: 100%; user-select: none"
          fluid
          class="d-flex flex-column align-center justify-center reply-media"
          ><p>Erro ao carregar mídia!</p>
          <p>{{ reply.imageurl }}</p>
          <p>(・`ω´・)</p></v-container
        >
        <v-container
          style="height: 100%; user-select: none"
          fluid
          class="d-flex flex-column align-center justify-center reply-media"
          v-if="reply.imageurl == ''"
          ><p>Sem imagem!</p>
          <p>(・`ω´・)</p></v-container
        >
        <v-container :id="'quoted_' + reply.id">
          <v-row class="ma-3">
            <h4>
              {{ reply.username }}
            </h4>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  plain
                  :data-quoteid="reply.id"
                  @click="adcQuote($event)"
                  v-bind="attrs"
                  v-on="on"
                >
                  #{{ reply.id }}
                  <v-icon right>mdi-reply</v-icon>
                </v-btn>
              </template>
              <span>citar esta resposta</span>
            </v-tooltip>
          </v-row>
          <p v-html="reply.content"></p>
          <small v-if="created">{{ created }}</small>
        </v-container>
      </v-card>
    </v-container>
  </v-list-item>
</template>
<script>
export default {
  data: () => ({
    mediaExpanded: false,
    mediaType: "img",
  }),
  props: {
    reply: {
      id: Number,
      imageurl: String,
      content: String,
      username: String,
    },
    created: String,
  },
  computed: {
    isHome() {
      return this.$route.name === "Home";
    },
  },
  methods: {
    colapseVideo() {
      const video = this.$refs.midia_video;
      if (!video) return;

      video.style.maxWidth = "195px";
      video.style.maxHeight = "195px";

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
      const element = e.target;
      if (element.tagName == "IMG") {
        element.style.maxWidth = this.mediaExpanded
          ? "195px"
          : `${element.naturalWidth}px`;
        element.style.maxHeight = this.mediaExpanded
          ? "195px"
          : `${element.naturalHeight}px`;
        this.mediaExpanded = !this.mediaExpanded;
      }
    },
  },
};
</script>