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
  <v-list-item class="ml-6" data-type="reply">
    <v-container>
      <v-card>
        <v-row dense>
          <v-col :cols="imgExpanded ? 12 : undefined">
            <v-tooltip
              content-class="tooltip-top"
              v-if="reply.imageurl && mediaType == 'img'"
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
                    alt=""
                    :src="reply.imageurl"
                    @error="mediaType = 'video'"
                    :max-height="imgExpanded ? undefined : 250"
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
              v-if="reply.imageurl && mediaType === 'video'"
              :src="reply.imageurl"
              autoplay
              loop
              muted
              playsinline
              controls
              @error="mediaType = 'error'"
            ></video>
            <v-container
              v-if="reply.imageurl && mediaType === 'error'"
              style="height: 100%; user-select: none"
              fluid
              class="d-flex flex-column align-center justify-center"
              ><p>Erro ao carregar mídia!</p>
              <p>{{ reply.imageurl }}</p>
              <p>(・`ω´・)</p></v-container
            >
            <v-container
              style="height: 100%; user-select: none"
              fluid
              class="d-flex flex-column align-center justify-center"
              v-if="reply.imageurl == ''"
              ><p>Sem imagem!</p>
              <p>(・`ω´・)</p></v-container
            >
          </v-col>
          <v-col cols="8">
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
              <div></div>
              <small>{{ created }}</small
              ><br />
            </v-container>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </v-list-item>
</template>
<script>
export default {
  data: () => ({
    imgExpanded: false,
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
    fullSize() {
      this.imgExpanded = !this.imgExpanded;
    },
  },
};
</script>