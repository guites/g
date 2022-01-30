<template>
  <div style="width: 100%">
    <form id="search-form">
        <div>
          <label for="search">Pesquisar</label>
          <input v-model="searchText"
          id="search"
          name="search" type="search"
          placeholder="Pesquise no site"
          @input="showResults($event)"
          aria-label="Pesquisar">
        </div>
        <div>
          <small v-if="fetchingData">aguarde...</small>
          <div v-if="fetchingData" class="loader">carregando...</div>
        </div>
    </form>
    <div id="searchbar" v-if="searchText">
      <div id="searchbar-header">
      </div>
      <div id="searchbar-lists">
        <ul>
          <strong class="search-list-title">{{shownPosts.length}} posts <small v-if="shownReplies.length > 0">({{shownReplies.length}}) respostas</small></strong>
            <li v-for="(post, i) in shownPosts" :key="`post-${post.id}`">
              <template v-if="i <= 5">
                <img loading="lazy" v-if="post.imageurl" @click="fullSize($event)" @error="setPlaceholder($event)" :src="post.imageurl">
                <img loading="lazy" v-else class="search_placeholder" src="@/assets/sham.png">
              </template>
              <template v-else>
                <template v-if="post.imageurl">
                  <button :data-src="post.imageurl" @click="showImg($event)">
                    imagem
                  </button>
                  <img class="none" @click="fullSize($event)" @error="setPlaceholder($event)" src="/none">
                </template>
              </template>
              <div>
                  <a :href="`/post/${post.id}`" class="nostyle">
                    <strong v-if="post.subject">{{post.subject}}</strong>
                    <strong v-else>gchan post #{{post.id}}</strong>
                    <small> em {{post.created}}</small>
                    <p class="text-content">{{post.message}}</p>
                  </a>
              </div>
            </li>
            <li v-for="(reply, i) in shownReplies" :key="`reply-${reply.id}`">
              <template v-if="i <= 5">
                <img loading="lazy" v-if="reply.imageurl" @click="fullSize($event)" @error="setPlaceholder($event)" :src="reply.imageurl">
                <img loading="lazy" v-else class="search_placeholder" src="@/assets/sham.png">
              </template>
              <template v-else>
                <template v-if="reply.imageurl">
                  <button :data-src="reply.imageurl" @click="showImg($event)">
                    imagem
                  </button>
                  <img class="none" @click="fullSize($event)" @error="setPlaceholder($event)" src="/none">
                </template>
              </template>
              <div>
                  <a :href="`/post/${reply.message_id}`" class="nostyle">
                    <strong>resposta ao post #{{reply.message_id}}</strong>
                    <small> {{reply.created}}</small>
                    <p class="text-content">{{reply.content}}</p>
                  </a>
              </div>
            </li>
          <p v-if="(posts.length <= 0)">0 posts! :(</p>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'SearchBar',
    data: () => ({
      fetchingData: false,
      searchText: '',
      posts: localStorage.getItem('search-posts') ?  JSON.parse(localStorage.getItem('search-posts')) : [],
      shownPosts: [],
      replies: localStorage.getItem('search-replies') ?  JSON.parse(localStorage.getItem('search-replies')) : [],
      shownReplies: [],
      embeddedReplies: []
    }),
    methods: {
      async showResults(e) {
        const str = e.target.value.toLowerCase();
        await this.cachePosts();
        await this.cacheReplies();
        this.shownPosts = this.posts.filter((post) => post.message.toLowerCase().includes(str) || post.subject.toLowerCase().includes(str) || post.username.toLowerCase().includes(str));
        this.shownReplies = this.replies.filter((reply) => reply.content.toLowerCase().includes(str) || reply.username.toLowerCase().includes(str));
      },
      async cachePosts() {
        if (this.posts.length === 0) {
          this.fetchingData = true;
          const rawData = await fetch(`${this.$backendURL}messages`);
          const postsObj = await rawData.json();
          const filteredPosts = postsObj.results.map((post) => {
            return {
              created: post.created,
              id: post.id,
              imageurl: post.imageurl,
              message: post.message,
              subject: post.subject,
              username: post.username
            }
          });
          localStorage.setItem('search-posts', JSON.stringify(filteredPosts));
          this.posts = filteredPosts;
          this.fetchingData = false;
        }
      },
      async cacheReplies() {
        if (this.replies.length === 0) {
          this.fetchingData = true;
          const rawData = await fetch(`${this.$backendURL}replies`);
          const repliesObj = await rawData.json();
          const filteredReplies = repliesObj.results.map((reply) => {
            return {
              created: reply.created,
              id: reply.id,
              imageurl: reply.imageurl,
              content: reply.content,
              username: reply.username,
              message_id: reply.message_id
            }
          });
          localStorage.setItem('search-replies', JSON.stringify(filteredReplies));
          this.replies = filteredReplies;
          this.fetchingData = false;
        }
      },
      setPlaceholder(e) {
        if (!e.target.src.includes('none')) {
          console.log(e.target.src);
          e.target.src = require('@/assets/sham.png');
          e.target.classList.add('search_placeholder');
        }
      },
      showImg(e) {
        const btn = e.target;
        const img = e.target.nextElementSibling;
        img.src = btn.getAttribute('data-src');
        img.className = 'fullsize';
        btn.remove();
      },
      fullSize(e) {
        if (!e.target.src.includes('none') && e.target.className !== 'search_placeholder') {
          e.target.classList.toggle('fullsize');
        }
      },
      search(collection, q) {

      },
    },
    watch: {
        q(val) {
         // filtrar o próprio json por esse valor
        },
    },
};
</script>
