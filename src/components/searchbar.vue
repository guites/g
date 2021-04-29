<style>
    .inner-header { flex-wrap: wrap; }
    #searchbar { width: 100%; }
    #searchbar ul li img { width: 120px; height: 60px; object-fit: cover; object-position: top; }
    #searchbar ul li div small { display: initial; font-size:small; }
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
</style>
<template>
  <div id="searchbar">
  <p v-if="aviso" style="text-align:center; text-decoration:underline;">Encontrados {{ aviso }} posts!</p>
  <ul>
    <li
    v-for="res in results"
    :key="res.id">
    <a class="nostyle" :href="'/#/post/' + res.id">
    <img :src="res.imageurl">
    <div>
        <strong v-if="res.subject">{{res.subject}}</strong>
        <strong v-else>gchan post #{{res.id}}</strong>
        <small> em {{res.created}}</small>
        <p>{{res.message}}</p>
    </div>
    </a>
    </li>  
  </ul>
  </div>
</template>

<script>
export default {
    name: 'SearchBar',
    props: ['q'],
    data: () => ({
      searchURL:'http://localhost:5000/search-posts?q=',
      messagesURL: 'http://localhost:5000/message/',
      maxResults: 5,
      results_index: [],
      results: [],
      relevant_ids: [],
      aviso: '',
    }),
    watch: {
        q(val) {
            if (val == '') {
                this.results_index = [];
                this.results = [];
                return;
            }
            fetch(`${this.searchURL}${val}`).then((response) => response.json()).then((result) => {
                if (result.length <= 0) {
                    this.results.pop();
                    this.results_index.pop();
                    if (this.results_index.length == 0) this.aviso = 'nenhum resultado t_t';
                    return;
                }
                result.forEach(r => {
                    const id = parseInt(r.split(':').pop(), 10);
                    if (isNaN(id)) return;
                    fetch(`${this.messagesURL}${id}`).then((response) => response.json()).then((result) => {
                        if(this.results.length >= this.maxResults) { 
                            this.results.pop();
                            this.results_index.pop();
                        }
                        const filtered = (({ created, id, imageurl, message, subject, username }) => ({created, id, imageurl, message, subject, username}))(result.results[0]);
                        filtered.created = new Date(filtered.created).toLocaleDateString('pt-BR');
                        if (this.results_index.includes(filtered.id)) {
                            const duplicated_pos = this.results_index.indexOf(filtered.id);
                            this.results_index.splice(duplicated_pos, 1);
                            this.results.splice(duplicated_pos, 1);
                        }
                        this.results_index.unshift(filtered.id);
                        this.results.unshift(filtered);
                        // this.aviso = `encontrados ${this.results_index.length} posts!`;
                    });
                });
            });
        },
        results_index(val) {
            this.aviso = val.length;
        },
        searched_ids(val) {
            const difference = val.filter(x => this.searched_ids_old.indexOf(x) === -1);
            console.log(difference);
        }
    },
};
</script>
