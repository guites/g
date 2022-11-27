<template>
  <v-app-bar app>
    <div class="d-flex align-center">
      <v-toolbar-title><h1>gchan</h1></v-toolbar-title>
      <v-img
        round
        alt="Vuetify Logo"
        class="shrink mr-2 rounded"
        contain
        src="@/assets/sham-48.png"
        transition="scale-transition"
        width="32"
        style="border: 2px solid #a4a4a4"
      />
    </div>
    <v-spacer></v-spacer>
    <v-btn href="https://github.com/guites/g" target="_blank" text>
      <span class="mr-2">Source code</span>
      <v-icon>mdi-open-in-new</v-icon>
    </v-btn>
  </v-app-bar>
</template>
<script>
export default {
  name: "AppBar",
};
</script>