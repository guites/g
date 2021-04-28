<template>
  <div id="searchbar">
  <p>{{q}}</p>
  </div>
</template>

<script>
export default {
    name: 'SearchBar',
    props: ['q'],
    data: () => ({
      searchURL:'http://localhost:5000/search?q=',
      pending_search: [],
      searched_ids: [],
      searched_ids_old: [],
    }),
    watch: {
        q(val) {
            fetch(`${this.searchURL}${val}`).then((response) => response.json()).then((result) => {
                console.log(result);
                result.forEach(r => {
                    const id = r.split(':').pop();
                    
                   // if (!this.searched_ids.includes(id)) {
                   //     this.searched_ids.push(id);
                   // }
                });
            });
        },
        searched_ids(val) {
            const difference = val.filter(x => this.searched_ids_old.indexOf(x) === -1);
            console.log(difference);
        }
    },
};
</script>
