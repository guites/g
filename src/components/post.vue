<style scoped>
.v-image >>> .v-image__image.v-image__image--contain {
  background-position: top center !important;
}
.img_button {
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
}
.img_button >>> .v-btn__content {
  opacity: 1 !important;
}
video {
  width: 100%;
}
</style>
<template>
  <v-list-item data-type="post" :id="'li_' + message.id">
    <v-container>
      <v-row dense>
        <v-col :cols="imgExpanded ? 12 : undefined">
          <v-tooltip
            content-class="tooltip-top"
            v-if="message.imageurl && mediaType == 'img'"
            top
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                :ripple="false"
                class="img_button"
                style=""
                v-bind="attrs"
                v-on="on"
                plain
                @click="fullSize"
              >
                <v-img
                  :aspect-ratio="16 / 9"
                  :alt="message.subject"
                  :src="message.imageurl"
                  @error="mediaType = 'video'"
                  :height="imgExpanded ? undefined : 250"
                  contain
                >
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" justify="center">
                      <v-progress-circular
                        indeterminate
                        color="grey"
                      ></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </v-btn>
            </template>
            <span v-if="imgExpanded">Colapsar</span>
            <span v-else>Expandir</span>
          </v-tooltip>
          <video
            v-if="message.imageurl && mediaType === 'video'"
            :src="message.imageurl"
            autoplay
            loop
            muted
            playsinline
            controls
            @error="mediaType = 'error'"
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
            <br />
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
    imgExpanded: false,
    mediaType: "img",
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
      this.imgExpanded = !this.imgExpanded;
    },
    clickReply(messageId) {
      this.$emit("clickReply", messageId);
    },
  },
};
</script>