<template>
  <v-container class="mt-6">
    <Post
      :message="message"
      :created="convertTZ(message.created)"
      @clickReply="clickReply"
    ></Post>
    <Reply
      v-for="reply of replies"
      v-bind:key="reply.id"
      :reply="reply"
    ></Reply>
    <v-divider class="mb-6"></v-divider>
  </v-container>
</template>
<script>
import Post from "./post.vue";
import Reply from "./reply.vue";
export default {
  name: "Thread",
  components: { Post, Reply },
  props: {
    message: {},
    replies: {},
  },
  methods: {
    convertTZ(date) {
      if (!date) return "";
      //source: https://stackoverflow.com/a/54127122/14427854
      var date_sp = new Date(
        (typeof date === "string" ? new Date(date) : date).toLocaleString(
          "en-US",
          { timeZone: "America/Sao_Paulo" }
        )
      );
      var hour = ("0" + date_sp.getHours()).slice(-2);
      var min = ("0" + date_sp.getMinutes()).slice(-2);
      var day = ("0" + date_sp.getDate()).slice(-2);
      var month = ("0" + (date_sp.getMonth() + 1)).slice(-2);
      return `${hour}:${min} ${day}/${month}/${date_sp.getFullYear()}`;
    },
    clickReply(reply) {
      this.$emit("clickReply", reply);
    },
  },
};
</script>
