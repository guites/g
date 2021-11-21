<template>
  <div class='gifBoxWrapper'>
    <div v-if="!imageURL" class="gif-info">Clique na miniatura para ver o gif completo!</div>
    <div v-else class="gif-success"><p>Gif selecionado para o post!</p><a v-on:click="unselectGif($event)" href="javascript:void(0);">cancelar</a></div>
    <div v-if="emptyGifResults" class='emptyGifResults'>
      <img src="http://via.placeholder.com/480?text=nenhum gif :(" class="emptyGifResultsImg">
    </div>
    <div v-if="emptyGifResults === ''" class="gifBox">
      <div v-for="gif in uniqueGifs" :key="gif.id" class="gifBoxGif">
        <img :class="(imageURL != '')?'gif-thumb opaque':'gif-thumb'" v-on:click="selectGif"
        :data-original="gif.originalUrl" :src="gif.thumbUrl">
      </div>
      <div v-if="imageURL" v-on:click="unselectGif($event)" class="expandedGif">
        <img :src="imageURL">
      </div>
    </div>
    <div class='paginate-arrows'>
      <ul v-if='hasPag' class="pagination">
        <div>
          <li v-for="index in gifSearch.numPages" :key="index" v-on:click="paginateGif"
          class="page-item" :class="{ 'active' : currPage == index}">
            <p class="page-link">{{index}}</p>
          </li>
        </div>
      </ul>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'Gifbox',
    props: {
      gifSearch: {},
      imageURL: '',
    },
    data: () => ({
      emptyGifResults: '',
      gifs: [],
      hasPag: '',
      currPage: 1,
    }),
    methods: {
      selectGif(e) {
        const originalUrl = e.target.getAttribute('data-original');
        document.querySelector('#imageURL').value = originalUrl;
        this.$emit('setGifAsImageURL', originalUrl);
        const clickedImg = e.target;
        const lastClicked = clickedImg.closest('.gifBox').querySelector('.clicked');
        if (lastClicked) {
          lastClicked.classList.remove('clicked');
        }
        clickedImg.parentElement.classList.add('clicked');
      },
      unselectGif(e) {
        if (e.target.tagName != 'IMG') {
          document.querySelector('#imageURL').value = '';
          this.$emit('setGifAsImageURL', '');
        }
      },
      paginateGif(e) {
        this.currPage = e.target.innerText;
        this.searchGif(e);
      },
      searchGif(e) {
        let searchString;
        searchString = document.querySelector('#giphyURL').value;
        if (searchString === '') {
          this.hasPag = '';
        } else {
          this.hasPag = '1';
        }
        switch (this.gifSearch.gif_origin) {
          default:
            this.apiRoute = 'giphy';
            fetch(`https://api.giphy.com/v1/gifs/search?api_key=5KnNW5U9nJ2Xjnas3lugKxMIXVdCsrqF&q=${searchString}&limit=${this.gifSearch.gifsPerPage}&offset=${(this.currPage - 1) * this.gifSearch.gifsPerPage}`)
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
              .catch(() => {
                this.emptyGifResults = 1;
              });
            break;
          case 'gfycat':
            this.apiRoute = 'gfycat';
            fetch(`https://api.gfycat.com/v1/gfycats/search?count=${this.gifSearch.gifsPerPage * this.gifSearch.numPages}&search_text='${searchString}`)
              .then((response) => response.json())
              .then((result) => {
                const obj = result.gfycats;
                this.gfycatCursor = result.cursor;
                if (obj.length === 0) {
                  this.emptyGifResults = 1;
                } else {
                  this.emptyGifResults = '';
                }
                const startingPoint = (this.currPage - 1) * this.gifSearch.gifsPerPage;
                const endingPoint = startingPoint + this.gifSearch.gifsPerPage;
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
    },
    computed: {
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
    watch: {
      'gifSearch.value': function(newVal, oldVal) {
        this.searchGif();
      },
      'gifSearch.gif_origin': function(newVal, oldVal) {
        this.searchGif();
      }
    },
  }
</script>
