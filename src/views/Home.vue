<template>
  <v-container>
    <v-container class="create-thread">
      <PostForm
        @new-post="addNewPost"
        :allowedVideoFormats="this.allowedVideoFormats"
      ></PostForm>
    </v-container>
    <Message
      v-for="message in messages"
      v-bind:message="message"
      v-bind:replies="message.replies"
      v-bind:replyCount="message.replyCount"
      @replyMessage="replyMessage"
      @adcQuote="adcQuote"
      @update="message = $event"
      v-bind:key="message.id"
    >
    </Message>
    <ReplyBox
      :messageToReplyTo="this.messageToReplyTo"
      :allowedVideoFormats="this.allowedVideoFormats"
      :quotesToAdd="this.quotesToAdd"
      :rememberedUsername="this.rememberedUsername"
      :rememberMe="this.rememberMe"
      @closeReply="this.closeReply"
      @addReplyToThread="this.addReplyToThread"
      @updateUsername="this.updateUsername"
      @updateRememberMe="this.updateRememberMe"
    >
    </ReplyBox>
    <div v-if="scrollIsOver" id="scroll-is-over">
      <h3>Acabou!</h3>
      <p>ヾ( ￣O￣)ツ</p>
      <p>Você viu todos os posts... que tal compartilhar alguma coisa?</p>
    </div>
  </v-container>
</template>

<script>
import PostForm from "../components/postform.vue";
import ReplyBox from "../components/replybox.vue";
import Message from "../components/message.vue";

// The .bind method from Prototype.js
if (!Function.prototype.bind) {
  // check if native implementation available
  Function.prototype.bind = function () {
    var fn = this,
      args = Array.prototype.slice.call(arguments),
      object = args.shift();
    return function () {
      return fn.apply(
        object,
        args.concat(Array.prototype.slice.call(arguments))
      );
    };
  };
}
export default {
  name: "Home",
  components: {
    ReplyBox,
    Message,
    PostForm,
  },
  data: () => ({
    apiURL: `messages`,
    repliesURL: "replies",
    messages: [],
    replyObserver: null,
    messageToReplyTo: "",
    quotesToAdd: "",
    screenSize: "",
    hasSubject: false,
    rememberMe: 1,
    rememberedUsername: "",
    offset: 0,
    messagesBatchSize: 15,
    scrollIsOver: false,
    allowedVideoFormats: [
      "video/mp4",
      "video/webm",
      "video/x-matroska",
      "video/quicktime",
      "video/x-flv",
      "video/x-msvideo",
      "video/x-ms-wmv",
      "video/mpeg",
    ],
  }),
  computed: {
    smallUsernamePhrase() {
      const phrases = [
        {
          quote: "o que é que há, pois, num nome?",
          reference: "https://pt.wikipedia.org/wiki/William_Shakespeare",
        },
        {
          quote: "remember: no use for a name",
          reference: "https://www.youtube.com/watch?v=mEdd1NHnwIE",
        },
        {
          quote: "o homem é menos ele mesmo quando fala de sua pessoa",
          reference: "https://pt.wikipedia.org/wiki/Oscar_Wilde",
        },
        {
          quote: "o anonimato é a fama do futuro",
          reference: "https://pt.wikipedia.org/wiki/John_Boyle",
        },
        {
          quote: "a vingança nunca é plena, mata a alma e a envenena",
          reference: "https://pt.wikiquote.org/wiki/Seu_Madruga",
        },
        {
          quote: "Ski-bi dibby dib yo da dub dub",
          reference: "https://www.youtube.com/watch?v=Hy8kmNEo1i8",
        },
        { quote: "Baby don't hurt me", reference: "watsalov" },
        { quote: "Pode entrar armado no gchan?", reference: "jairinho" },
      ];
      return phrases[Math.floor(phrases.length * Math.random())].quote;
    },
  },
  mounted() {
    const mouseActions = ["mouseover", "mouseout", "click"];
    mouseActions.forEach((ev) => {
      document.querySelector("body").addEventListener(ev, function (e) {
        if (e.target.className == "quote") {
          if (ev == mouseActions[2]) {
            if (window.innerWidth < 767) {
              const redirectFlag = e.target.getAttribute("data-redirect");
              if (!redirectFlag) {
                const checkQuoteRedirect =
                  document.querySelector("[data-redirect]");
                if (checkQuoteRedirect)
                  delete checkQuoteRedirect.dataset.redirect;
                e.target.setAttribute("data-redirect", 1);
                e.preventDefault();
              }
            } else {
              return;
            }
          }
          const quoted_reply_id = e.target.href.split("#").splice(-1)[0];
          const reply_id = quoted_reply_id.split("_").splice(-1)[0];
          const replyBox = e.target
            .closest("ul")
            .querySelector(`#${quoted_reply_id}`);
          if (replyBox) {
            if (ev == "mouseover" || ev == mouseActions[2]) {
              replyBox.classList.add("target");
            } else {
              replyBox.classList.remove("target");
            }
          } else {
            const quote_preview = e.target.parentElement.querySelector(
              `#quoted_hidden_${reply_id}`
            );
            if (ev == "mouseover" || ev == mouseActions[2]) {
              quote_preview.classList.add("show");
            } else {
              quote_preview.classList.remove("show");
            }
          }
        } else {
          if (ev == mouseActions[2] && window.innerWidth < 767) {
            const checkQuotePreview =
              document.querySelector(".quote-hidden.show");
            if (checkQuotePreview) checkQuotePreview.classList.remove("show");
            const checkQuoteTarget = document.querySelector(".target");
            if (checkQuoteTarget) checkQuoteTarget.classList.remove("target");
            const checkQuoteRedirect =
              document.querySelector("[data-redirect]");
            if (checkQuoteRedirect) delete checkQuoteRedirect.dataset.redirect;
          }
        }
      });
    });
    this.replyObserver = new IntersectionObserver(this.onElementObserved, {
      threshold: 0,
    });
    this.lazyLoadObserver = new IntersectionObserver(this.setNextBatch, {
      threshold: 0,
    });
    fetch(`${this.$backendURL}${this.apiURL}?offset=${this.offset}`)
      .then((response) => response.json())
      .then((result) => {
        this.messages = this.sanitizedMessages(result.results);
      })
      .then(() => {
        document
          .querySelectorAll(".list-unstyled li.media")
          .forEach((li, index) => {
            this.replyObserver.observe(li);
            if (index === this.messagesBatchSize - 1) {
              this.offset += 15;
              li.setAttribute("data-offset", this.offset);
              this.lazyLoadObserver.observe(li);
            }
          });
      });
    // loads username from localStorage
    const rememberedUsername = localStorage.getItem("gchan_username");
    // if (rememberedUsername) this.message.username = rememberedUsername;
  },
  methods: {
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
    sanitizeSingleMessage(message) {
      const sanitized = message;
      if (message.message) {
        sanitized.message = message.message.replace(/</g, "&lt;");
        sanitized.message = message.message.replace(/>/g, "&gt;");
      } else {
        sanitized.content = message.content.replace(/</g, "&lt;");
        sanitized.content = message.content.replace(/>/g, "&gt;");
      }
      return sanitized;
    },
    sanitizedMessages(messagesArray) {
      // transforma todas as < e > em texto
      const sanitized = [];
      messagesArray.forEach((message) => {
        sanitized.push(this.sanitizeSingleMessage(message));
      });
      return sanitized;
    },
    escapeRegExp(stringToGoIntoTheRegex) {
      // https://stackoverflow.com/a/17886301/14427854
      return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    },
    async filterMessage(index) {
      const isReply = typeof index === "object" && index !== null;
      let replyIndex;
      let messageIndexForReplies;
      //const yt_rgx = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)[\&\?]?([\w\_]+)?=?([\w\%]+)?&?([\w\-\_]+)?=?[\w]?/g;
      //const yt_rgx = /(?:https?:\/\/)?(?:m\.)?(?:www\.)?youtu\.?be(?:\.com)?\/?\S*(?:watch|embed)?(?:\S*v=|v\/|\/)([\w\-_]+)[\&\?]?([\w\_]+)?=?([\w\%]+)?&?([\w\-\_]+)?=?[\w]?/g;
      const yt_rgx =
        /(?:https?:\/\/)?(?:m\.)?(?:www\.)?youtu\.?be(?:\.com)?\/?\S*(?:watch|embed)?(?:\S*v=|v\/|\/)([\w\-]+)(?:[\&\?]?([\w\-]+)?=?([\w\%\-]+)?)+/g;
      const quotes_rgx = new RegExp("&gt;&gt;([0-9]{1,5}):", "g");
      // se for um objeto, estou passando uma reply como argumento da função
      let string;
      if (isReply) {
        string = index.content;
      } else {
        string = this.messages[index].message;
      }
      const matches = string.match(yt_rgx);
      const quote_matches = string.matchAll(quotes_rgx);
      if (quote_matches !== null || matches !== null) {
        if (isReply) {
          messageIndexForReplies = this.messages.findIndex(
            (el) => parseInt(el.id, 10) === parseInt(index.message_id, 10)
          );
          replyIndex = this.messages[messageIndexForReplies].replies.findIndex(
            (el) => parseInt(el.id, 10) === parseInt(index.id, 10)
          );
          if (
            this.messages[messageIndexForReplies].replies[replyIndex]
              .filtered === "1"
          )
            return;
          this.$set(
            this.messages[messageIndexForReplies].replies[replyIndex],
            "yt_iframes",
            []
          );
          this.$set(
            this.messages[messageIndexForReplies].replies[replyIndex],
            "filtered",
            "1"
          );
        } else {
          if (this.messages[index].filtered === "1") return;
          this.$set(this.messages[index], "yt_thumbnails", []);
          this.$set(this.messages[index], "yt_iframes", []);
          this.$set(this.messages[index], "filtered", "1");
        }

        // filtra links do youtube
        if (matches !== null) {
          if (matches.length > 0) {
            for (let i = 0; i < matches.length; i += 1) {
              fetch(
                `https://www.youtube.com/oembed?url=${matches[i]}&format=json`
              ).then(async (response) => {
                if (response.ok) {
                  const result = await response.json();
                  const htmlString = `[<a data-link="${
                    matches[i]
                  }" data-thumb="${
                    result.thumbnail_url
                  }" href="javascript:;" onmouseover="this.nextElementSibling.style='display:block;'" onmouseout="this.nextElementSibling.style='display:none;'" onclick="
                    this.childNodes[0].textContent == 'mostrar' ? this.childNodes[0].textContent = 'esconder' : this.childNodes[0].textContent = 'mostrar';
                    const current_li = this.closest('li');
                    // seleciona, se existir, o iframe que estiver carregado
                    const current_frame = current_li.querySelector('iframe');
                    if (current_frame) {
                      const div_data_checkiframe = current_frame.parentElement.getAttribute('data-checkiframe');
                      if( div_data_checkiframe == '${result.thumbnail_url}') {
                        current_frame.remove();
                        return;
                      } else {
                        const atag_to_current_frame = current_li.querySelector(\`a[data-thumb='\${div_data_checkiframe}']\`);
                        atag_to_current_frame.childNodes[0].textContent = 'mostrar';
                      }
                      current_frame.remove();
                    }
                    this.closest('li').querySelector('.iframe-wrapper').innerHTML = \`<div data-checkiframe='${
                      result.thumbnail_url
                    }'>${result.html.replace(/"/g, "'")}</div>\`;
                    ">mostrar</a><img class="yt-thumb" style="display:none;" src="${
                      result.thumbnail_url
                    }">]`;
                  const checkUrlRgx = new RegExp(
                    this.escapeRegExp(`data-link="${matches[i]}"`)
                  );
                  if (isReply) {
                    if (
                      !checkUrlRgx.test(
                        this.messages[messageIndexForReplies].replies[
                          replyIndex
                        ].content
                      )
                    ) {
                      this.messages[messageIndexForReplies].replies[
                        replyIndex
                      ].content = this.messages[messageIndexForReplies].replies[
                        replyIndex
                      ].content.replaceAll(matches[i], htmlString);
                    }
                  } else {
                    if (!checkUrlRgx.test(this.messages[index].message)) {
                      this.messages[index].message = this.messages[
                        index
                      ].message.replaceAll(matches[i], htmlString);
                    }
                  }
                } else {
                  let htmlString;
                  if (
                    matches[i].startsWith("http://") ||
                    matches[i].startsWith("https://")
                  ) {
                    if (response.status === 400) {
                      htmlString = `[<a target="_blank" href="${matches[i]}" onmouseover="this.nextElementSibling.style='display:block;'" onmouseout="this.nextElementSibling.style='display:none;'">youtube?</a>]<span class="yt-warning" style="display:none;">não conseguimos verificar este link. Tenha cautela!</span>`;
                    } else if (response.status === 404) {
                      htmlString = `[<a target="_blank" href="${matches[i]}" onmouseover="this.children[0].style='display:block;'" onmouseout="this.children[0].style='display:none;'">youtube?</a>]<span class="yt-warning" style="display:none;">não conseguimos verificar este link. Tenha cautela!</span>`;
                    } else {
                      return;
                    }
                    if (isReply) {
                      this.messages[messageIndexForReplies].replies[
                        replyIndex
                      ].content = this.messages[messageIndexForReplies].replies[
                        replyIndex
                      ].content.replace(matches[i], htmlString);
                    } else {
                      this.messages[index].message = this.messages[
                        index
                      ].message.replace(matches[i], htmlString);
                    }
                  } else {
                    return;
                  }
                }
              });
            }
          }
        }

        // filtra menção a outras respostas
        if (isReply) {
          if (quote_matches != null) {
            for (const quote_match of quote_matches) {
              const current_quote = quote_match[0];
              const reply_id = quote_match[1];
              if (reply_id) {
                fetch(`${this.$backendURL}replies/${reply_id}`)
                  .then((response) => {
                    if (response.ok) {
                      return response.json();
                    } else {
                      throw new Error(response.status);
                    }
                  })
                  .then((r) => {
                    const sanitizedQuoteMsg = this.sanitizeSingleMessage(
                      r.results[0]
                    );
                    let quote_content = sanitizedQuoteMsg.content;
                    if (quote_content.length > 250) {
                      quote_content = quote_content.substring(0, 220);
                      quote_content +=
                        '<i style="font-size: 11px;">[... resposta truncada devido ao tamanho]</i>';
                    }
                    const quote_message_id = sanitizedQuoteMsg.message_id;
                    let htmlString = `<a class="quote" href='/post/${quote_message_id}#quoted_${reply_id}'>${current_quote}</a><li class="media reply-item quote-hidden" id="quoted_hidden_${reply_id}">`;
                    if (sanitizedQuoteMsg.imageurl != "") {
                      htmlString += `<img onerror="this.src='/nao_tem_preview.jpg'; this.onerror=null;" loading="lazy" data-src="${sanitizedQuoteMsg.imageurl}" src="${sanitizedQuoteMsg.imageurl}" alt="" class="img-thumbnail">`;
                    }
                    htmlString += `<div class="align-self-center media-body"><div class="edit_tab"><p class="mt-0 mb-1">${
                      sanitizedQuoteMsg.username
                    }</p><button class="link link-reply">#${
                      sanitizedQuoteMsg.id
                    }</button></div><p class="text-content is-quoted">${quote_content}</p><small>${this.convertTZ(
                      sanitizedQuoteMsg.created
                    )}</small><br/></div></li>`;
                    if (isReply) {
                      this.messages[messageIndexForReplies].replies[
                        replyIndex
                      ].content = this.messages[messageIndexForReplies].replies[
                        replyIndex
                      ].content.replaceAll(current_quote, htmlString);
                    } else {
                      this.messages[index].message = this.messages[
                        index
                      ].message.replace(current_quote, htmlString);
                    }
                  })
                  .catch((err) => {
                    console.log(
                      "resposta de id " + reply_id + " não encontrada."
                    );
                  });
              }
            }
          }
        }
      }
      return;
    },
    setNextBatch(entries) {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        this.lazyLoadObserver.unobserve(entry.target);
        fetch(`${this.$backendURL}${this.apiURL}?offset=${this.offset}`)
          .then((response) => response.json())
          .then((result) => {
            if (!result.results) return;
            this.messages = this.messages.concat(
              this.sanitizedMessages(result.results)
            );
          })
          .then(() => {
            const messages = document.querySelector("div.container").children;
            for (let i = 0; i < this.messagesBatchSize; i += 1) {
              if (!messages[i + this.offset]) {
                this.scrollIsOver = true;
                return;
              }
              this.replyObserver.observe(messages[i + this.offset].children[0]);
              if (i === this.messagesBatchSize - 1) {
                this.lazyLoadObserver.observe(
                  messages[i + this.offset].children[0]
                );
                this.offset += 15;
                messages[i].setAttribute("data-offset", this.offset);
              }
            }
          });
      });
    },
    toggleSubject() {
      this.hasSubject = !this.hasSubject;
    },
    deleteMessage(e) {
      const messageID = e.target.parentElement.getAttribute("data-message-id");
      this.msgFlash(
        "error",
        messageID,
        "Deletar mensagem",
        "Tem certa que deseja deletar esta mensagem? ):",
        "ela não ofendeu ninguém"
      );
    },
    editMessage() {
      alert("o dev é burro e ainda não adicionou este método (づ´• ﹏ •`)づ");
    },
    reactMessage() {
      alert("o dev é burro e ainda não adicionou este método (づ´• ﹏ •`)づ");
    },
    replyMessage(reply) {
      this.messageToReplyTo = reply;
    },
    adcQuote(quote) {
      this.quotesToAdd = quote;
    },
    updateUsername(username) {
      this.message.username = username;
    },
    updateRememberMe(remember) {
      this.rememberMe = remember;
    },
    closeReply() {
      this.messageToReplyTo = "";
      this.quotesToAdd = "";
    },
    addReplyToThread(reply) {
      let typeCheckedReply;
      if (typeof reply === "string") {
        typeCheckedReply = JSON.parse(reply);
      } else {
        typeCheckedReply = reply;
      }
      const msgIndex = this.messages.findIndex(
        (el) =>
          parseInt(el.id, 10) === parseInt(typeCheckedReply.message_id, 10)
      );
      if (this.messages[msgIndex].replies === undefined)
        this.messages[msgIndex].replies = [];
      this.messages[msgIndex].replies.push(
        this.sanitizeSingleMessage(typeCheckedReply)
      );
      this.filterMessage(this.sanitizeSingleMessage(typeCheckedReply));
    },
    onElementObserved(entries) {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        this.replyObserver.unobserve(entry.target);
        const postId = entry.target.id.replace("li_", "");
        const msgIndex = this.messages.findIndex(
          (el) => parseInt(el.id, 10) === parseInt(postId, 10)
        );
        this.filterMessage(msgIndex);
        fetch(`${this.$backendURL}${this.apiURL}/${postId}/${this.repliesURL}`)
          .then((response) => response.json())
          .then((replies) => {
            if (replies.error) {
              return;
            }
            this.$set(this.messages[msgIndex], "replyCount", replies.length);
            if (replies.length > 2) {
              this.$set(
                this.messages[msgIndex],
                "replies",
                this.sanitizedMessages(
                  replies.slice(Math.max(replies.length - 2, 1))
                )
              );
            } else {
              this.$set(
                this.messages[msgIndex],
                "replies",
                this.sanitizedMessages(replies)
              );
            }
            this.messages[msgIndex].replies.forEach((rep) => {
              this.filterMessage(rep);
            });
          });
      });
    },
    msgFlash(type, messageID, header, text, message) {
      this.messageFlash.type = type;
      this.messageFlash.header = header;
      this.messageFlash.text = text;
      this.messageFlash.message = message;
      this.messageFlash.messageID = parseInt(messageID, 10);
    },
    fullSize(e) {
      e.target.classList.toggle("fullsize");
    },
    createVideo(target) {
      const image = target.target;
      const video = document.createElement("video");
      video.classList.add("img-thumbnail");
      video.src = image.src;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      image.parentElement.insertBefore(video, image);
      image.style.display = "none";
      image.error = null;
      video.addEventListener("click", (e) => {
        this.fullSize(e);
      });
      video.onerror = function test(e) {
        e.target.parentElement.querySelector(".img-thumbnail").src =
          "http://via.placeholder.com/300?text=erro ao carregar url  :(";
      };
    },
    preventVideo(target) {
      const image = target.target;
      const prevSibling = image.previousElementSibling;
      if (prevSibling) {
        if (prevSibling.tagName === "VIDEO") {
          image.previousElementSibling.remove();
          image.style.display = "initial";
        }
      }
    },
    addNewPost(post) {
      this.messages.unshift(this.sanitizeSingleMessage(post));
      this.filterMessage(0);
    },
  },
};
</script>
