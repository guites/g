<style>
    .text-warning { color: #f39c12; }
    .text-success { color: #00bc8c; }
    .inner-header { flex-wrap: wrap; }
    #searchbar {
      width: 100%;
      display:flex;
      flex-direction: column;
      border: 1px solid #444;
      padding: 25px;
      border-radius: 4px;
      background-color: #222;
      margin-bottom:5px;
    }

    #searchbar #searchbar-header { width: 100%; }
    #searchbar #searchbar-header p { border-bottom: 2px solid #444; padding:5px; margin: 5px 5px 15px; }

    #searchbar #searchbar-lists { display: flex; }
    #searchbar #searchbar-lists ul {max-width:460px;width:100%;}
    #searchbar #searchbar-lists ul li {
      display:block;
      min-height:60px;
      border: 2px solid transparent;
      background-color: transparent;
      transition: all 100ms;
    }
    #searchbar #searchbar-lists ul li div {
      width:initial;
      min-height:60px;
    }
    #searchbar #searchbar-lists ul li div small { display: initial; font-size:small; }
    #searchbar #searchbar-lists ul .search-list-title {
      border-bottom: 2px solid #444;
      padding-bottom: 10px;
      margin-bottom: 10px;
      display: block;
      width: 100%;
      max-width: 200px;
    }
    #searchbar #searchbar-lists ul li img {
      width: 120px; height: 60px;
      object-fit: cover; object-position: top;
      float:left;
    }
    #searchbar #searchbar-lists ul li img.search_placeholder{
      object-fit: cover;
      width:32px;
      height:32px;
    }
    #searchbar #searchbar-lists ul li:hover {
        border-color: #222;
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
      #searchbar #searchbar-lists {
        flex-direction:column;
      }
      #searchbar #searchbar-lists ul:nth-child(1) {
        margin-bottom:25px;
      }
    }
</style>
<template>
  <div id="searchbar" v-if="q != ''">
  <div id="searchbar-header"><p><span :class=posts.aviso_class id="searchbar-aviso-posts">{{posts.aviso}}</span> &#10574; <span :class=replies.aviso_class id="searchbar-aviso-replies">{{replies.aviso}}</span></p></div>
  <div id="searchbar-lists">
  <ul>
    <strong class="search-list-title">POSTS</strong>
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
    <p v-if="(posts.results.length <= 0)">Nenhum post encontrado! :(</p>
  </ul>
  <ul>
    <strong class="search-list-title">RESPOSTAS</strong>
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
    <p v-if="replies.results.length <= 0">Nenhuma resposta encontrada! :(</p>
  </ul>
  </div>
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
        aviso_class: '',
        search_url: 'https://gchan-message-board.herokuapp.com/search-posts?q=',
        db_url: 'https://gchan-message-board.herokuapp.com/message/',
        name: 'post'
      },
      replies: {
        results_index: [],
        results: [],
        aviso: '',
        aviso_class: '',
        search_url: 'https://gchan-message-board.herokuapp.com/search-replies?q=',
        db_url: 'https://gchan-message-board.herokuapp.com/reply/',
        name: 'reply'
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
              if (result.error && result.code == 'no results') {
                this[collection]['aviso'] = `nenhum ${this[collection]['name']} encontrado`;
                this[collection]['aviso_class'] = 'text-warning';
                this[collection]['results_index'] = [];
                this[collection]['results'] = [];
                return;
              }
              const plural = result.results.length > 1 ? 's' : '';
              this[collection]['aviso'] = `${result.results.length} novo${plural} ${this[collection]['name']}${plural} encontrado${plural}`;
              this[collection]['aviso_class'] = 'text-success';
          result.results.forEach(r => {
            if(this[collection]['results'].length >= this.maxResults) { 
                this[collection]['results'].pop();
                this[collection]['results_index'].pop();
            }
            let filtered;
            if (collection == 'posts') {
              filtered = (({ created, id, imageurl, message, subject, username }) => ({created, id, imageurl, message, subject, username}))(r);
            } else if (collection == 'replies') {
              filtered = (({ created, id, imageurl, content, message_id, username }) => ({created, id, imageurl, content, message_id, username}))(r);
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
