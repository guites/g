<template>
  <v-list-item data-type="reply">
    <img
      loading="lazy"
      v-if="reply.imageurl"
      :data-src="reply.imageurl"
      :src="reply.imageurl"
      @click="fullSize($event)"
      @error="createVideo($event, false)"
      alt=""
    />
    <div :id="'quoted_' + reply.id">
      <div>
        <p>{{ reply.username }}</p>
        <button
          type="button"
          :data-quoteid="reply.id"
          title="citar esta resposta"
          @click="adcQuote($event)"
        >
          #{{ reply.id }}
          <img style="width: 16px" src="@/assets/reply.png" loading="lazy" />
        </button>
      </div>
      <p v-html="reply.content"></p>
      <div></div>
      <small>{{ created }}</small
      ><br />
    </div>
  </v-list-item>
</template>
<script>
export default {
  data: () => ({}),
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
};
</script>