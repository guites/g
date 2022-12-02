<template>
  <v-app-bar app>
    <v-toolbar-title>
      <h1>gchan</h1>
    </v-toolbar-title>
    <v-tooltip v-model="imgTooltip" right>
      <template v-slot:activator="{ on, attrs }">
        <router-link
          @focus.native="imgTooltip = true"
          @blur.native="imgTooltip = false"
          class="text-decoration-none d-flex align-center ma-4"
          to="/"
        >
          <v-img
            round
            v-bind="attrs"
            v-on="on"
            alt="gchan logo"
            class="shrink rounded"
            contain
            src="@/assets/sham-48.png"
            width="32"
            style="border: 2px solid #a4a4a4"
          />
        </router-link>
      </template>
      <span v-if="$route.name === 'Home'">Bem vindo ao gchan!</span>
      <span v-else>Voltar pra home</span>
    </v-tooltip>
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
  data: () => ({
    imgTooltip: false,
  }),
};
</script>