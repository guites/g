<template>
  <div>
     <section class="create-thread">
      <form @submit.prevent="addMessage">
        <div v-if="error" class='alert-error'>
          <close v-on:click="error=''">x</close>
          <h4>Erro!</h4>
          <p>{{error}}</p>
       </div>
        <div class="form-group">
          <label for="username">Usuário</label>
          <input v-model="message.username" type="text" class="form-control" id="username"
          aria-describedby="usernameHelp" value='anon' required>
          <small id="usernameHelp" class="form-text text-muted">
            remember: no use for a name
            </small>
        </div>
        <div class="form-group">
          <label for="subject">Assunto</label>
          <input v-model="message.subject" type="subject" class="form-control"
          id="subject" placeholder="subject" required>
        </div>
        <div class="form-group">
          <label for="message">Mensagem</label>
          <textarea v-model="message.message" class="form-control" id="message" rows="5"></textarea>
        </div>
        <div class="form-group">
          <label for="imageURL">image URL</label>
          <input v-model="message.imageURL" type="url" class="form-control"
          id="imageURL" placeholder="https://~">
          <div class="gif-search-toggle" data-toggle="buttons">
            <input v-on:change="searchGif" type="radio" name="options" id="option1"
              autocomplete="off" checked value="giphy">
            <label for ='option1' class="btn btn-primary">Giphy</label>
            <input v-on:change="searchGif" type="radio" name="options" id="option2"
              autocomplete="off" value="gfycat">
            <label for='option2' class="btn btn-primary">gfycat</label>
          </div>
          <label for='giphy-search'>Busque um gif</label>
          <input v-on:keyup="searchGif" v-model="message.giphyURL" type="text"
          class="form-control" id="giphyURL" placeholder="cats">
        </div>
        <button type="submit" class="btn btn-primary">Enviar</button>
    </form>
    <div v-if="isGifBeingSearched" class='gifBoxWrapper'>
      <div v-if="emptyGifResults" class='emptyGifResults'>
        <img src="https://via.placeholder.com/480?text=nenhum gif :(" class="emptyGifResultsImg">
      </div>
      <div v-if="emptyGifResults === ''" class="gifBox">
        <div v-for="gif in uniqueGifs" :key="gif.id" class="gifBoxGif">
          <img class="gif-thumb" v-on:click="selectGif"
          :data-original="gif.originalUrl" :src="gif.thumbUrl">
        </div>
      </div>
      <div class='paginate-arrows'>
        <ul v-if='hasPag' class="pagination">
          <!-- <li v-if="this.apiRoute === 'gfycat'"
          class="page-item disabled" v-on:click="paginateGif">
            <a class="page-link" data-paginate='prev' href="#">&laquo;</a>
          </li> -->
          <div>
            <li v-for="index in numPages" :key="index" v-on:click="paginateGif"
            class="page-item" :class="{ 'active' : currPage == index}">
              <a class="page-link" href="#void">{{index}}</a>
            </li>
          </div>
          <!-- <li v-if="this.apiRoute === 'gfycat'"
          class="page-item" v-on:click="paginateGif">
            <a class="page-link" data-paginate='next' href="#">&raquo;</a>
          </li> -->
        </ul>
      </div>
    </div>

    </section>
    <div class="list-unstyled d-flex flex-column align-items-center"
    v-for="message in reversedMessages" :key="message._id">
      <li class="media">
        <img v-if="message.imageurl" class="img-thumbnail"
        :src="message.imageurl" :alt="message.subject">
        <img v-else class="img-thumbnail" src="https://via.placeholder.com/300?text=:(">
        <div class="align-self-center media-body">
          <h4 class='mt-0 mb-1'>{{message.username}}</h4>
          <h5 class="mt-0 mb-1">{{message.subject}}</h5>
          {{message.message}}
          <br />
          <small>{{message.created}}</small>
        </div>
      </li>
              <hr>
    </div>
  </div>
</template>

<script>
const apiURL = 'https://gchan-message-board.herokuapp.com/messages';
export default {
  name: 'Home',
  data: () => ({
    gifsPerPage: 4,
    currPage: 1,
    numPages: 5,
    error: '',
    apiRoute: 'giphy',
    isGifBeingSearched: '',
    emptyGifResults: '',
    hasPag: '',
    messages: [],
    gifs: [],
    message: {
      username: 'Anonymous',
      subject: '',
      message: '',
      imageURL: '',
    },
  }),
  computed: {
    reversedMessages() {
      console.log(this.messages);
      return this.messages.slice().reverse();
    },
    uniqueGifs() {
      const result = [];
      const map = new Map();
      this.gifs.forEach((el) => {
        if (!map.has(el.id)) {
          map.set(el.id, true);
          result.push({
            id: el.id,
            thumbUrl: el.thumbUrl,
            originalUrl: el.originalUrl,
          });
        }
      });
      return result;
    },
  },
  mounted() {
    fetch(apiURL).then((response) => response.json()).then((result) => {
      this.messages = result.results;
    });
    const gtmScript = document.createElement('script');
    gtmScript.type = 'text/javascript';
    const gtmCode = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K57247W');`;
    try {
      gtmScript.appendChild(document.createTextNode(gtmCode));
      document.head.appendChild(gtmScript);
    } catch (e) {
      gtmScript.text = gtmCode;
      document.head.appendChild(gtmScript);
    }
  },
  methods: {
    addMessage() {
      fetch(apiURL, {
        method: 'POST',
        body: JSON.stringify(this.message),
        headers: {
          'content-type': 'application/json',
        },
      }).then((response) => response.json()).then((result) => {
        if (result.details) {
          const error = result.details.map((detail) => detail.message).join('.');
          this.error = error;
        } else {
          this.error = '';
          this.messages.push(JSON.parse(result));
        }
      });
    },
    searchGif(e) {
      let searchString;

      if (e.target.id === 'giphyURL') {
        searchString = e.target.value;
        if (searchString === '') {
          this.isGifBeingSearched = '';
        } else {
          this.isGifBeingSearched = 1;
        }
      } else {
        searchString = document.querySelector('#giphyURL').value;
      }
      if (searchString === '') {
        this.hasPag = '';
      } else {
        this.hasPag = '1';
      }
      switch (document.querySelector("input[type='radio']:checked").value) {
        default:
          this.apiRoute = 'giphy';
          fetch(`https://api.giphy.com/v1/gifs/search?api_key=5KnNW5U9nJ2Xjnas3lugKxMIXVdCsrqF&q=${searchString}&limit=${this.gifsPerPage}&offset=${(this.currPage - 1) * this.gifsPerPage}`)
            .then((response) => response.json())
            .then((result) => {
              const obj = result.data;
              if (obj.length === 0) {
                this.emptyGifResults = 1;
              } else {
                this.emptyGifResults = '';
              }
              this.gifs = [];
              obj.forEach((el) => {
                this.gifs.push({
                  id: el.id,
                  thumbUrl: el.images.preview_webp.url,
                  originalUrl: el.images.original.webp,
                });
              });
            })
            .catch((error) => {
              console.log(error);
              this.emptyGifResults = 1;
            });
          break;
        case 'gfycat':
          this.apiRoute = 'gfycat';
          fetch(`https://api.gfycat.com/v1/gfycats/search?count=${this.gifsPerPage * this.numPages}&search_text='${searchString}`)
            .then((response) => response.json())
            .then((result) => {
              const obj = result.gfycats;
              this.gfycatCursor = result.cursor;
              if (obj.length === 0) {
                this.emptyGifResults = 1;
              } else {
                this.emptyGifResults = '';
              }
              const startingPoint = (this.currPage - 1) * this.gifsPerPage;
              const endingPoint = startingPoint + this.gifsPerPage;
              this.gifs = [];
              let counter = 0;
              obj.forEach((el) => {
                if (counter >= startingPoint && counter < endingPoint) {
                  this.gifs.push({
                    id: el.gfyId,
                    thumbUrl: el.max1mbGif,
                    originalUrl: el.webpUrl,
                  });
                }
                counter += 1;
              });
            })
            .catch((error) => {
              console.error(error);
              this.emptyGifResults = 1;
            });
          break;
      }
    },
    selectGif(e) {
      const originalUrl = e.target.getAttribute('data-original');
      document.querySelector('#imageURL').value = originalUrl;
      this.message.imageURL = originalUrl;
    },
    paginateGif(e) {
      // if (this.apiRoute === 'giphy') {
      //   this.currPage = e.target.innerText;
      // } else if (this.apiRoute === 'gfycat') {
      //   this.gfycatCursor = e.target.getAttribute('data-cursor');
      //   if (e.target.getAttribute('data-paginate') === 'next') {
      //     document.querySelectorAll('[data-paginate]')[0].setAttribute
      // ('data-cursor', e.target.getAttribute('data-cursor'));
      //   }
      // }
      this.currPage = e.target.innerText;
      this.searchGif(e);
    },
  },
};
</script>
