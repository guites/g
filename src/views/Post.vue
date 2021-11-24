<style>
  .container h1 {
    max-width:980px;
    width:100%;
    border-bottom: 1px solid #424242;
    margin: 20px auto;
    padding:0 0 20px 0;
  }
</style>
<template>
  <section>
    <h1>Respondendo ao post #{{message.id}}</h1>
    <Message
    v-bind:message="message"
    v-bind:auth="auth"
    v-bind:replies="message.replies"
    @replyMessage="replyMessage"
    @adcQuote="adcQuote"
    @update="message = $event"
    v-bind:key="message.id"
    >
    </Message>
    <template>
      <ReplyBox
      :messageToReplyTo="this.messageToReplyTo"
      :allowedUploadVideoFormats="this.allowedUploadVideoFormats"
      :quotesToAdd="this.quotesToAdd"
      :rememberedUsername="this.rememberedUsername"
      :rememberMe="this.rememberMe"
      @closeReply="this.closeReply"
      @addReplyToThread="this.addReplyToThread"
      @updateUsername="this.updateUsername"
      @updateRememberMe="this.updateRememberMe"
      >
      </ReplyBox>
    </template>
  </section>
</template>

<script>
import ReplyBox from '../components/replybox.vue';
import Message from '../components/message.vue';


// injeção de valores via pre-rendering

if (window.__PRERENDER_INJECTED !== undefined) {
  var post_id = window.location.pathname.split('/').pop();
  document.body.innerHTML += `<p style='display: none;' id='injected_id'>${post_id}</p>`;
  document.body.innerHTML += `<p style='display: none;' id='injected_por'>${(window['__PRERENDER_INJECTED'][post_id]['por'])}</p>`;
  document.body.innerHTML += `<p style='display: none;' id='injected_title'>${(window['__PRERENDER_INJECTED'][post_id]['title'])}</p>`;
  document.body.innerHTML += `<p style='display: none;' id='injected_content'>${(window['__PRERENDER_INJECTED'][post_id]['content'])}</p>`;
  document.body.innerHTML += `<p style='display: none;' id='injected_thumbnail'>${(window['__PRERENDER_INJECTED'][post_id]['thumbnail'])}</p>`;
  document.body.innerHTML += `<p style='display: none;' id='injected_created'>${(window['__PRERENDER_INJECTED'][post_id]['created'])}</p>`;
}

export default {
  name: 'Post',
  components: {
    ReplyBox,
    Message,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    auth: {
      default: () => ({
        username: '',
        loggedIn: '',
        id: '',
      }),
      type: Object,
    },
  },
  data: () => ({
    messageURL: 'message/',
    repliesURL: 'replies',
    message: {
      username: '',
      subject: '',
      message: '',
      imageURL: '',
      user_id: 0,
      gif_origin: 'none',
    },
    replierUsername: '',
    rememberMe: 1,
    rememberedUsername: '',
    quotesToAdd: '',
    messageToReplyTo: '',
    allowedUploadVideoFormats: [
      'video/mp4',
      'video/webm',
      'video/x-matroska',
      'video/quicktime',
      'video/x-flv',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/mpeg',
    ],
  }),
  watch: {
    'replierUsername': function (newVal, oldVal) {
      this.rememberUsername();
    },
    id(val) {
        this.getThePost();
    },
  },
  beforeMount() {
    this.getThePost();
    this.setInjectedData();
  },
  mounted() {
    // loads username from localStorage
    const rememberedUsername = localStorage.getItem('gchan_username');
    if (rememberedUsername) this.replierUsername = rememberedUsername;
  },
  methods: {
    rememberUsername() {
        if (this.replierUsername !== '' && this.rememberMe) {
          localStorage.setItem('gchan_username', this.replierUsername);
        } else {
          const getUsername = localStorage.getItem('gchan_username');
          if (getUsername) {
            localStorage.removeItem('gchan_username');
          }
        }
        this.rememberedUsername = this.replierUsername;
    },
    sanitizeSingleMessage(message) {
      const sanitized = message;
      if (message.message) {
        sanitized.message = message.message.replace(/</g, '&lt;');
        sanitized.message = message.message.replace(/>/g, '&gt;');
      } else {
        sanitized.content = message.content.replace(/</g, '&lt;');
        sanitized.content = message.content.replace(/>/g, '&gt;');
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
    convertTZ(date) {
      //source: https://stackoverflow.com/a/54127122/14427854
      var date_sp = new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      var hour = ("0" + date_sp.getHours()).slice(-2);
      var min = ("0" + date_sp.getMinutes()).slice(-2);
      var day = ("0" + date_sp.getDate()).slice(-2);
      var month = ("0" + (date_sp.getMonth() + 1)).slice(-2);
      return `${hour}:${min} ${day}/${month}/${date_sp.getFullYear()}`;
    },
    filteredReps(reps) {
      for (let i = 0; i < reps.length; i++) {
        reps[i] = this.filterMessage(reps[i]);
      }
      return reps;
    },
    escapeRegExp(stringToGoIntoTheRegex) {
      // https://stackoverflow.com/a/17886301/14427854
      return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    },
    filterMessage(index) {
      const isReply = typeof index === 'object' && index !== null;
      let messageIndexForReplies;
      // const yt_rgx = /(?:https?:\/\/)?(?:m\.)?(?:www\.)?youtu\.?be(?:\.com)?\/?\S*(?:watch|embed)?(?:\S*v=|v\/|\/)([\w\-_]+)[\&\?]?([\w\_]+)?=?([\w\%]+)?&?([\w\-\_]+)?=?[\w]?/g;
      const yt_rgx = /(?:https?:\/\/)?(?:m\.)?(?:www\.)?youtu\.?be(?:\.com)?\/?\S*(?:watch|embed)?(?:\S*v=|v\/|\/)([\w\-]+)(?:[\&\?]?([\w\-]+)?=?([\w\%\-]+)?)+/g;
      const quotes_rgx = new RegExp("&gt;&gt;([0-9]{1,5}):", "g");
      let string;
      if (isReply) {
        string = index.content;
      } else {
        string = this.message.message;
      }
      const matches = string.match(yt_rgx);
      const quote_matches = string.matchAll(quotes_rgx);
      if (quote_matches !== null || matches !== null) {
        if (isReply) {
          if (index.filtered === '1') return;
          index.yt_iframes = [];
          index.filtered = 1;
        } else {
          if (this.message.filtered === '1') return;
          this.$set(this.message, 'yt_thumbnails', []);
          this.$set(this.message, 'yt_iframes', []);
          this.$set(this.message, 'filtered', '1');
        }

        if (matches !== null) {
          if (matches.length > 0) {
            for (let i = 0; i < matches.length; i += 1) {
              fetch(`https://www.youtube.com/oembed?url=${matches[i]}&format=json`)
                .then(async (response) => {
                  if (response.ok) {
                    const result = await response.json();
                    const htmlString = `[<a data-link="${matches[i]}" data-thumb="${result.thumbnail_url}" href="javascript:;" onmouseover="this.nextElementSibling.style='display:block;'" onmouseout="this.nextElementSibling.style='display:none;'" onclick="
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
                    this.closest('li').querySelector('.iframe-wrapper').innerHTML = \`<div data-checkiframe='${result.thumbnail_url}'>${result.html.replace(/"/g, '\'')}</div>\`;
                    ">mostrar</a><img class="yt-thumb" style="display:none;" src="${result.thumbnail_url}">]`;
                    const checkUrlRgx = new RegExp(this.escapeRegExp(`data-link="${matches[i]}"`));
                    if (isReply) {
                      if (!checkUrlRgx.test(index.content)) {
                        index.content = index.content.replaceAll(matches[i], htmlString);
                      }
                    } else {
                      if (!checkUrlRgx.test(this.message.message)) {
                        this.message.message = this.message.message.replaceAll(matches[i], htmlString);
                      }
                    }
                  } else {
                    let htmlString;
                    if (matches[i].startsWith('http://') || matches[i].startsWith('https://')) {
                      if (response.status === 400) {
                        htmlString = `[<a target="_blank" href="${matches[i]}" onmouseover="this.nextElementSibling.style='display:block;'" onmouseout="this.nextElementSibling.style='display:none;'">youtube?</a>]<span class="yt-warning" style="display:none;">não conseguimos verificar este link. Tenha cautela!</span>`;
                      } else if (response.status === 404) {
                        htmlString = `[<a target="_blank" href="${matches[i]}" onmouseover="this.children[0].style='display:block;'" onmouseout="this.children[0].style='display:none;'">youtube?</a>]<span class="yt-warning" style="display:none;">não conseguimos verificar este link. Tenha cautela!</span>`;
                      } else {
                        return
                      }
                      if (isReply) {
                        index.content = index.content.replace(matches[i], htmlString);
                      } else {
                        this.message.message = this.message.message.replace(matches[i], htmlString);
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
                fetch(`${this.$backendURL}reply/${reply_id}`)
                  .then((response) => {
                    if (response.ok) {
                      return response.json();
                    } else {
                      throw new Error(response.status);
                    }
                  })
                  .then((r) => {
                    const sanitizedQuoteMsg = this.sanitizeSingleMessage(r.results[0]);
                    let quote_content = sanitizedQuoteMsg.content;
                    if (quote_content.length > 250) {
                      quote_content = quote_content.substring(0, 220);
                      quote_content += '<i style="font-size: 11px;">[... resposta truncada devido ao tamanho]</i>';
                    }
                    const quote_message_id = sanitizedQuoteMsg.message_id;
                    let htmlString = `<a class="quote" href='/post/${quote_message_id}#quoted_${reply_id}'>${current_quote}</a><li class="media reply-item quote-hidden" id="quoted_hidden_${reply_id}">`;
                    if (sanitizedQuoteMsg.imageurl != '') {
                      htmlString += `<img onerror="this.src='/nao_tem_preview.jpg'; this.onerror=null;" loading="lazy" data-src="${sanitizedQuoteMsg.imageurl}" src="${sanitizedQuoteMsg.imageurl}" alt="" class="img-thumbnail">`;
                    }
                    htmlString += `<div class="align-self-center media-body"><div class="edit_tab"><p class="mt-0 mb-1">${sanitizedQuoteMsg.username}</p><button class="link link-reply">#${sanitizedQuoteMsg.id}</button></div><p class="text-content is-quoted">${quote_content}</p><small>${this.convertTZ(sanitizedQuoteMsg.created)}</small><br/></div></li>`;
                    if (isReply) {
                      index.content = index.content.replaceAll(current_quote, htmlString);
                    } else {
                      this.message.message = this.message.message.replace(current_quote, htmlString);
                    }
                  })
                  .catch((err) => {
                    console.log('resposta de id '+reply_id+' não encontrada.');
                  });
              }
            }
          }
        }
      }
      return index;
    },
    targetQuote() {
      this.$nextTick(() => {
        const checkTarget = window.location.href.split('#');
        if (checkTarget.length > 1) {
          const targetQuote = checkTarget.splice(-1)[0];
          const quoteElement = document.querySelector('#'+targetQuote);
          if (quoteElement) {
            quoteElement.scrollIntoView({top: 0, behavior: 'smooth'});
            quoteElement.classList.add('target');
            document.querySelector('body').addEventListener('click', function(e) {
              if (!e.target.classList.contains('quote')) {
                const checkTarget = document.querySelector('.target');
                if (checkTarget) {
                  checkTarget.classList.remove('target');
                }
              } else {
                // clicou num link de quote
                e.preventDefault();
                const checkTarget = e.target.href.split('#');
                if (checkTarget.length > 1) {
                  const targetQuote = checkTarget.splice(-1)[0];
                  const quoteElement = document.querySelector('#'+targetQuote);
                  if (quoteElement) {
                    quoteElement.scrollIntoView({top: 0, behavior: 'smooth'});
                    const lastTarget = document.querySelector('.target');
                    if (lastTarget) lastTarget.classList.remove('target');
                    quoteElement.classList.add('target');
                    history.replaceState(null, '', e.target.href);
                  } else {
                    window.location.href = e.target.href;
                  }
                }
              }
            });
          }
        }
      });
    },
    setInjectedData() {

      let id, por, title, content, thumbnail;

      const idEl = document.getElementById('injected_id');
      const porEl = document.getElementById('injected_por');
      const titleEl = document.getElementById('injected_title');
      const contentEl = document.getElementById('injected_content');
      const thumbnailEl = document.getElementById('injected_thumbnail');
      const createdEl = document.getElementById('injected_created');

      if (createdEl) {
        created = createEl.innerText;
        document.querySelector('#message-created').innerText = created;
      }
      if (idEl) {
        id = idEl.innerText;
        document.querySelector('.container h1').innerText = `Respondendo ao post #${id}`;
        document.querySelector('.message-id').innerText = `${id} / `;
      }
      if (porEl) {
        por = porEl.innerText;
        document.querySelector('.message-username').innerText = `por: ${por}`;
      }
      if (titleEl) {
        title = titleEl.innerText;
        document.querySelector('.message-subject').innerText = `${title}`;
        document.querySelector('meta[name=title]').setAttribute("content", `gchan: ${title}`);
        document.querySelector('meta[property="twitter:title"]').setAttribute("content", `gchan: ${title}`);
        document.querySelector('title').innerText = `gchan: ${title}`;
        document.querySelector('meta[property="og:title"]').setAttribute("content", `gchan: ${title}`);
      }
      if (contentEl) {
        content = contentEl.innerText;
        document.querySelector('.message-content').innerText = `${content}`;
        document.querySelector('meta[name=description]').setAttribute("content", `gchan: ${content.substr(0,180)}`);
        document.querySelector('meta[property="og:description"]').setAttribute("content", `gchan: ${content.substr(0,180)}`);
        document.querySelector('meta[property="twitter:description"]').setAttribute("content", `gchan: ${content.substr(0,180)}`);
      }
      if (thumbnailEl) {
        thumbnail = thumbnailEl.innerText;
        document.querySelector('.img-thumbnail').src = thumbnail;
        document.querySelector('meta[property="og:image"]').setAttribute("content", thumbnail);
        document.querySelector('meta[property="twitter:image"]').setAttribute("content", thumbnail);
      }

    },
    getThePost() {
      fetch(`${this.$backendURL}${this.messageURL}${this.id}`).then((response) => response.json())
          .then((result) => {
            if (result.results) {
              this.message = this.sanitizeSingleMessage(result.results.shift());
              fetch(`${this.$backendURL}${this.repliesURL}/${this.id}`).then((response) => response.json())
                .then((replies) => {
                  if (replies.error) {
                    return;
                  }
                  this.$set(this.message, 'replies', this.sanitizedMessages(replies));
                  this.message.replies = this.filteredReps(replies);
                  this.targetQuote();
                });
            } else {
              window.location.href = '/';
            }
          });
    },
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    sanitizeSingleMessage(message) {
      const sanitized = message;
      if (message.message) {
        sanitized.message = message.message.replace(/</g, '&lt;');
        sanitized.message = message.message.replace(/>/g, '&gt;');
      } else {
        sanitized.content = message.content.replace(/</g, '&lt;');
        sanitized.content = message.content.replace(/>/g, '&gt;');
      }
      return sanitized;
    },
    showThumbImg(e) {
      if (window.innerWidth < 767) return;
      e.target.children[0].style = 'display:block;';
    },
    hideThumbImg(e) {
      if (window.innerWidth < 767) return;
      e.target.children[0].style = 'display:none;';
    },
    replyMessage(reply) {
      this.messageToReplyTo = reply;
    },
    adcQuote(quote) {
      this.quotesToAdd = quote;
    },
    updateUsername(username) {
      this.replierUsername = username;
    },
    updateRememberMe(remember) {
      this.rememberMe = remember;
    },
    closeReply() {
      this.messageToReplyTo = '';
    },
    addReplyToThread(reply) {
      let typeCheckedReply;
      if (typeof reply === 'string') {
        typeCheckedReply = JSON.parse(reply);
      } else {
        typeCheckedReply = reply;
      }
      if (this.message.replies === undefined) this.message.replies = []; 
      this.message.replies.push(this.filterMessage(this.sanitizeSingleMessage(typeCheckedReply)));
    },
  },
};
</script>
