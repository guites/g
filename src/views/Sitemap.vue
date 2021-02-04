<template>
  <div v-html="xmlContent"></div>
</template>
<script>
export default {
  name: 'Sitemap',
  data() {
    return {
      xmlContent: null,
      xmlError: false,
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.xmlContent = null;
      this.xmlError = false;
      fetch('https://gchan-message-board.herokuapp.com/sitemap.xml')
        .then((response) => response.text())
        // .then((str) => (new window.DOMParser()).parseFromString(str, 'text/xml'))
        .then((data) => {
          this.xmlContent = data;
        })
        .catch((err) => {
          this.xmlError = true;
          console.error(err);
        });
    },
  },
};
</script>
