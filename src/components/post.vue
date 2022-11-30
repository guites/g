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
</style>
<template>
  <v-list-item data-type="post" :id="'li_' + message.id">
    <v-container elevation="25" outlined>
      <v-row dense>
        <v-col :cols="imgExpanded ? 12 : 2">
          <v-tooltip v-if="message.imageurl" top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
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
                  @error="createVideo($event, message.id)"
                  :height="imgExpanded ? undefined : 250"
                  contain
                >
                  <template v-slot:placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="black"
                      ></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </v-btn>
            </template>
            <span v-if="imgExpanded">Colapsar</span>
            <span v-else>Expandir</span>
          </v-tooltip>
          <v-container
            style="height: 100%; user-select: none"
            fluid
            class="d-flex flex-column align-center justify-center"
            v-else
            ><p>Sem imagem!</p>
            <p>(・`ω´・)</p></v-container
          >
        </v-col>
        <v-col>
          <v-container class="secondary">
            <v-row class="ma-3" :data-message-id="message.id">
              <p class="ma-0 mr-3">
                por:
                <span class="font-weight-bold">{{ message.username }}</span>
              </p>
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    color="grey"
                    @click="replyMessage($event)"
                    :data-replyTo="message.id"
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
                >acompanhar discussão</router-link
              >
            </v-row>
            <div v-if="isHome && replyCount && replyCount > 2">
              <small>Este post possui {{ replyCount }} respostas!</small>
            </div>
            <p>
              <span>#{{ message.id }} / </span>
              <span v-if="message.subject">{{ message.subject }}</span>
              <span v-else>gchan post</span>
            </p>
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
  },
};
</script>