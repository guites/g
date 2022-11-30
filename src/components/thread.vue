<template>
  <v-list class="my-6">
    <Post :message="message" :created="convertTZ(message.created)"></Post>
    <Reply
      v-for="reply of replies"
      v-bind:key="reply.id"
      :reply="reply"
      :created="convertTZ(reply.created)"
    ></Reply>
  </v-list>
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
    replyCount: Number,
  },
  data: () => ({
    replyObserver: null,
    messageFlash: {
      type: "",
      header: "",
      text: "",
      message: "",
      messageID: "",
    },
  }),
  watch: {
    message() {},
  },
  methods: {
    checkContentLength(content) {
      let tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const hiddenQuotes = tempDiv.querySelectorAll(".quote-hidden");
      hiddenQuotes.forEach((quote) => {
        quote.remove();
      });
      return tempDiv.textContent.length > 250;
    },
    convertTZ(date) {
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
    handleMessage(messageID, action, e) {
      e.target.disabled = true;
      let method;
      let body;
      let headers;
      let url;
      let finalizeFunction;
      switch (action) {
        case "delete":
          method = "DELETE";
          body = JSON.stringify("");
          headers = {
            "content-type": "text/plain",
          };
          url = `message/${messageID}`;
          finalizeFunction = (id) =>
            this.messages.filter((message) => message.id !== id);
          break;
        default:
          method = "POST";
          headers = {
            "content-type": "application/json",
          };
      }
      fetch(`${this.$backendURL}${url}`, {
        method,
        headers,
        body,
        credentials: "include",
      })
        .then((response) => response.json())
        .then((result) => {
          if (!result) {
            e.target.disabled = false;
            this.msgFlash(
              "error",
              messageID,
              "Ocorreu um erro!",
              "Tente deletar sua mensagem novamente.",
              "Atualizar a página pode resolver o problema!"
            );
          } else {
            this.messages = finalizeFunction(messageID);
          }
        });
    },
    hasAudio(video) {
      return (
        video.mozHasAudio ||
        Boolean(video.webkitAudioDecodedByteCount) ||
        Boolean(video.audioTracks && video.audioTracks.length)
      );
    },
    async createVideo(ev, isPost) {
      const image = ev.target;
      const li = isPost
        ? document.getElementById(`li_${isPost}`)
        : image.parentElement;
      const videoWrap = document.createElement("div");
      videoWrap.className = "video-wrap";
      const video = document.createElement("video");
      video.src = image.src;
      const controls = document.createElement("button");
      controls.innerHTML = `<img src="${this.$projectURL}volume-off.png" alt="Volume">`;
      controls.className = "volume";
      controls.type = "button";
      video.classList.add("img-thumbnail");
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      videoWrap.appendChild(video);
      videoWrap.appendChild(controls);
      li.insertBefore(videoWrap, image);
      image.style.display = "none";
      image.error = null;
      video.addEventListener("loadeddata", (eve) => {
        if (this.hasAudio(eve.target)) {
          controls.addEventListener("click", (e) => {
            let audioBtn;
            if (e.target.tagName === "BUTTON") {
              [audioBtn] = e.target.children;
            } else {
              audioBtn = e.target;
            }
            video.muted = !video.muted;
            if (video.muted) {
              audioBtn.src = `${this.$projectURL}volume-off.png`;
            } else {
              audioBtn.src = `${this.$projectURL}volume-high.png`;
            }
          });
        } else {
          controls.classList.add("no-audio");
        }
      });
      video.addEventListener("click", (e) => {
        this.fullSizeDiv(e.target.parentElement);
        this.fullSize(e);
      });
      // uso de currying pra passar a this.$backendURL no
      // callback do eventListener https://stackoverflow.com/a/58675429/14427854
      function onerrorCallback(backendURL) {
        return function (e) {
          const parent = e.target.parentElement.parentElement;
          const videoWrapper = parent.querySelector("div.video-wrap");
          const showThisImg = parent.querySelector("img.img-thumbnail");
          showThisImg.src = `${backendURL}placeholders`;
          showThisImg.style.display = "initial";
          showThisImg.classList.add("placeholder");
          showThisImg.onclick = null;
          e.target.remove();
          videoWrapper.remove();
        };
      }
      video.addEventListener("error", onerrorCallback(this.$backendURL));
    },
    preventVideo(imgURL) {
      return;
      // TODO: see how this dynamic is going to work since
      // we are recreating the wrapper innerHTML everytime
      const image = target.target;
      const prevSibling = image.previousElementSibling;
      if (prevSibling) {
        if (prevSibling.tagName === "VIDEO") {
          image.previousElementSibling.remove();
          image.style.display = "initial";
        }
      }
    },
    fullSizeDiv(div) {
      div.classList.toggle("fullsize");
    },
    fullSize(e) {
      e.target.closest(".v-list-item").classList.toggle("flex-column");
      e.target.closest(".v-image").classList.toggle("post-thumbnail");
    },
    replyMessage(reply) {
      this.$emit("replyMessage", reply.target.getAttribute("data-replyto"));
    },
    adcQuote(quote) {
      this.$emit("adcQuote", quote.target.getAttribute("data-quoteid"));
    },
    expandContent(ev) {
      const textBlock = ev.target.parentElement.querySelector(".text-content");
      textBlock.scrollTop = 0;
      const btn = ev.target.querySelector("button");
      textBlock.classList.toggle("show-all");
      btn.textContent = btn.textContent == "colapsar" ? "expandir" : "colapsar";
    },
  },
  computed: {
    isHome() {
      return this.$route.name === "Home";
    },
    filteredReplies() {
      if (this.replies) {
        return this.replies.slice(Math.max(this.replies.length - 2, 1));
      }
      return this.replies;
    },
  },
};
</script>
