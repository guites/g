<style>
    .inner-header { flex-wrap: wrap; }
    #searchbar {
      width: 100%;
      display:flex;
      border: 1px solid #444;
      padding: 25px;
      border-radius: 4px;
      border-bottom: none;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
      background-color: #222;
    }
    #searchbar ul li div small { display: initial; font-size:small; }
    #searchbar ul {
      max-width:460px;
      width:100%;
    }
  #searchbar ul .search-list-title {
    border-bottom: 2px solid #444;
    padding-bottom: 10px;
    margin-bottom: 10px;
    display: block;
    width: 100%;
    max-width: 200px;
  }
    #searchbar ul li {
      display:block;
      min-height:60px;
    }
    #searchbar ul li div {
      width:initial;
      min-height:60px;
    }
    #searchbar ul li img {
      width: 120px; height: 60px;
      object-fit: cover; object-position: top;
      float:left;
    }
    #searchbar ul li img.search_placeholder{
      object-fit: cover;
      width:32px;
      height:32px;
    }
    #searchbar ul li:hover {
        border: 2px solid #222;
        cursor: pointer;
        border-radius: 4px;
        background-color: #b9b9b9;
        color: #222;
    }
    a.nostyle:link {
        text-decoration: inherit;
        color: inherit;
        display: contents;
    }
    a.nostyle:visited {
        text-decoration: inherit;
        color: inherit;
        display: contents;
    }
    @media only screen and (max-width: 767px) {
      #searchbar {
        flex-direction:column;
      }
      #searchbar ul:nth-child(1) {
        margin-bottom:25px;
      }
    }
</style>
<template>
  <div id="searchbar" v-if="q != ''">
  <!-- (posts.results.length > 0 || replies.results.length > 0) && -->
  <ul>
    <strong class="search-list-title">POSTS</strong>
    <p v-if="posts.aviso" style="text-decoration:underline;">{{posts.aviso}}</p>
    <a v-for="post in posts.results" :key="post.id" class="nostyle" :href="'/#/post/' + post.id">
    <li>
    <img v-if="post.imageurl" @error="setPlaceholder($event)" :src="post.imageurl">
    <img v-else class="search_placeholder" src="@/assets/sham.png">
    <div>
        <strong v-if="post.subject">{{post.subject}}</strong>
        <strong v-else>gchan post #{{post.id}}</strong>
        <small> em {{post.created}}</small>
        <p>{{post.message}}</p>
    </div>
    </li>
    </a>
    <p v-if="(posts.results.length <= 0) && posts.aviso == ''">Nenhum post encontrado! :(</p>
  </ul>
  <ul>
    <strong class="search-list-title">RESPOSTAS</strong>
    <p v-if="replies.aviso" style="text-decoration:underline;">{{replies.aviso }}</p>
    <a v-for="reply in replies.results" :key="reply.id" class="nostyle" :href="'/#/post/' + reply.message_id">
    <li>
    <img v-if="reply.imageurl" @error="setPlaceholder($event)" :src="reply.imageurl">
    <img v-else class="search_placeholder" src="@/assets/sham.png">
    <div>
        <strong v-if="reply.username">por {{reply.username}}</strong>
        <small> em {{reply.created}}</small>
        <p>{{reply.content}}</p>
    </div>
    </li>
    </a>
    <p v-if="replies.results.length <= 0 && replies.aviso == ''">Nenhuma resposta encontrada! :(</p>
  </ul>
  </div>
</template>

<script>
export default {
    name: 'SearchBar',
    props: ['q'],
    data: () => ({
      maxResults: 5,
      posts: {
        results_index: [],
        results: [],
        aviso: '',
        search_url: 'http://localhost:5000/search-posts?q=',
        db_url: 'http://localhost:5000/message/',
      },
      replies: {
        results_index: [],
        results: [],
        aviso: '',
        search_url: 'http://localhost:5000/search-replies?q=',
        db_url: 'http://localhost:5000/reply/',
      },
    }),
    methods: {
      setPlaceholder(e) {
        e.target.src = require('@/assets/sham.png');
        e.target.classList.add('search_placeholder');
      },
      search(collection, q) {
        if (q == '') {
          this[collection]['results_index'] = [];
          this[collection]['results'] = [];
          return;
        }
        fetch(`${this[collection]['search_url']}${q}`).then(
          (response) => {
            if (!response.ok) {
              throw new Error(response.status);
            }
            return response.json()
            }).then((result) => {
          if (result.length <= 0) {
            this[collection]['aviso'] = '';
            this[collection]['results_index'] = [];
            this[collection]['results'] = [];
           //  this[collection]['results'].pop();
           //  this[collection]['results_index'].pop();
            return;
          }
          result.forEach(r => {
            const id = parseInt(r.split(':').pop(), 10);
            if (isNaN(id)) return;
            fetch(`${this[collection]['db_url']}${id}`).then((response) => response.json()).then((result) => {
                if(this[collection]['results'].length >= this.maxResults) { 
                    this[collection]['results'].pop();
                    this[collection]['results_index'].pop();
                }
                let filtered;
                if (collection == 'posts') {
                  filtered = (({ created, id, imageurl, message, subject, username }) => ({created, id, imageurl, message, subject, username}))(result.results[0]);
                } else if (collection == 'replies') {
                  filtered = (({ created, id, imageurl, content, message_id, username }) => ({created, id, imageurl, content, message_id, username}))(result.results[0]);
                }
                filtered.created = new Date(filtered.created).toLocaleDateString('pt-BR');
                if (this[collection]['results_index'].includes(filtered.id)) {
                    const duplicated_pos = this[collection]['results_index'].indexOf(filtered.id);
                    this[collection]['results_index'].splice(duplicated_pos, 1);
                    this[collection]['results'].splice(duplicated_pos, 1);
                }
                this[collection]['results_index'].unshift(filtered.id);
                this[collection]['results'].unshift(filtered);
            });
          });
        })
        .catch((err) => {
          if(err.message == '503') {
            this[collection]['aviso'] = 'Busca indisponível! Faça um post reclamando.';
          }
        });
      },
    },
    watch: {
        q(val) {
          this.search('posts', val);
          this.search('replies', val);
        },
    },
};
</script>
