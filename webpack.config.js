path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
const PrerenderSPAPlugin = require('prerender-spa-plugin')
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.resolve('src'),
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: false,
  },
  devtool: '#eval-source-map',
  plugins: [
    new VueLoaderPlugin(),
  ]
}
if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new HtmlWebpackPlugin({
      title: 'PRODUCTION prerender-spa-plugin',
      template: 'index.html',
      filename: path.resolve(__dirname, 'dist/index.html'),
      favicon: 'favicon.ico'
    }),
    new PrerenderSPAPlugin({
      staticDir: path.join(__dirname, 'dist'),
      routes: ['/', '/about', '/info', '/new', '/post/632', '/post/993', '/post/992', '/post/991', '/post/990', '/post/978', '/post/988', '/post/987', '/post/986', '/post/984', '/post/985', '/post/982', '/post/983', '/post/981', '/post/980', '/post/979', '/post/977', '/post/923', '/post/948', '/post/976', '/post/888', '/post/975', '/post/974', '/post/973', '/post/972', '/post/717', '/post/971', '/post/970', '/post/969', '/post/968', '/post/967'],
      renderer: new Renderer({
        // The name of the property
        injectProperty: '__PRERENDER_INJECTED',
        // The values to have access to via `window.injectProperty` (the above property )
        inject:
        {
  "987": {
    "thumbnail": "https://media.tenor.com/images/b690c54a0eae8afbdf812b02f49c3fc9/tenor.gif",
    "por": "anônimo",
    "title": "gchan post # 987",
    "content": "'conversei com o comercial, sabe, aquele bate e volta'\n\no bate e volta:"
  },
  "983": {
    "thumbnail": "",
    "por": "Jael",
    "title": "gchan post # 983",
    "content": "Eae"
  },
  "976": {
    "thumbnail": "https://i.imgur.com/4LwuoAr.jpg",
    "por": "anônimo",
    "title": "gchan post # 976",
    "content": "isolation"
  },
  "632": {
    "thumbnail": "https://i.imgur.com/kQxCzbG.mp4",
    "por": "anônimo",
    "title": "gchan post # 632",
    "content": "dica: como economizar na mensalidade do treino\n*pode acarretar em 2 a 5 anos de clausura"
  },
  "985": {
    "thumbnail": "https://i.imgur.com/hwGDAny.jpg",
    "por": "anônimo",
    "title": "ciclone passando de boas",
    "content": "fica meu telhado, por favor não se vá"
  },
  "980": {
    "thumbnail": "https://i.imgur.com/hvpSIuZ.png",
    "por": "anônimo",
    "title": "aplicações seguras",
    "content": "safety"
  },
  "992": {
    "thumbnail": "http://deeperintomovies.net/journal/image11/roadkill5.jpg",
    "por": "anônimo",
    "title": "gchan post # 992",
    "content": "canada"
  },
  "972": {
    "thumbnail": "https://i.ytimg.com/vi/E3eN-kdPouc/sddefault.jpg",
    "por": "anônimo",
    "title": "os true neutral com o sofrimento alheio",
    "content": "eu: pedindo uma ajuda sobre uma tarefa q pode muito bem me custar a tarde interna\n\npessoas que eu achei que teriam empatia com a minha dor: https://www.youtube.com/watch?v=ussCHoQttyQ"
  },
  "888": {
    "thumbnail": "https://raw.githubusercontent.com/Kos-M/GogsThemes/master/img/screenShots/file.png",
    "por": "jairo",
    "title": "gchan post # 888",
    "content": "petição para o MLucas instalar o tema escuro no repositório\n\nlink da petição: http://chng.it/4LhRVNcf"
  },
  "973": {
    "thumbnail": "https://i.imgur.com/W1hagSw.png",
    "por": "It4chi_uc",
    "title": "gchan post # 973",
    "content": "oni chan"
  },
  "991": {
    "thumbnail": "https://i.imgur.com/MyfGcxw.png",
    "por": "anônimo",
    "title": "véspera de feriado",
    "content": "boa jazz-feira camaradas"
  },
  "981": {
    "thumbnail": "https://i.imgur.com/iJ2or4l.png",
    "por": "anônimo",
    "title": "gchan post # 981",
    "content": "quando o trabalho  te da sinais"
  },
  "990": {
    "thumbnail": "https://i.giphy.com/media/jp2KXzsPtoKFG/giphy.gif",
    "por": "anônimo",
    "title": "slackin",
    "content": "oi mundo"
  },
  "988": {
    "thumbnail": "https://i.imgur.com/C9OXJjl.gif",
    "por": "anônimo",
    "title": "gchan post # 988",
    "content": "Kkkkj"
  },
  "969": {
    "thumbnail": "https://i.imgflip.com/59922q.jpg",
    "por": "MLucas",
    "title": "gchan post # 969",
    "content": "'Como assim, entra no setor aqui com uma demanda nova do cliente pra fazer, não é bem assim... tem que ter tempo pra fazer, encaixar na agenda, testar....'\n\nEnfim, a hipocrisia"
  },
  "968": {
    "thumbnail": "",
    "por": "anônimo",
    "title": "gchan post # 968",
    "content": "Anime\n"
  },
  "982": {
    "thumbnail": "https://media3.giphy.com/media/ZB3IAId94nJj07ZzUf/giphy.webp?cid=12057471o7365xxaksanio01d46cld99f2h1icvwlr8sbjjl&rid=giphy.webp&ct=g",
    "por": "anônimo",
    "title": "gchan post # 982",
    "content": "Hi"
  },
  "970": {
    "thumbnail": "https://i.imgur.com/AGnek5K.gif",
    "por": "sidnnw",
    "title": "gchan post # 970",
    "content": "Aceita\n"
  },
  "971": {
    "thumbnail": "http://i1.ytimg.com/vi/8JI2sn6cm8o/hqdefault.jpg",
    "por": "anônimo",
    "title": "gchan post # 971",
    "content": "cagar de jaqueta não é tão ruim, discutão"
  },
  "975": {
    "thumbnail": "https://i.imgur.com/sMtDEKH.jpg",
    "por": "o instanciador",
    "title": "gchan post # 975",
    "content": " seguirei instanciando, macaco-senpai"
  },
  "979": {
    "thumbnail": "https://i.imgur.com/HxeKJDB.png",
    "por": "anônimo",
    "title": "qnd o youtube acha sua playlist",
    "content": "thx algoritimo"
  },
  "984": {
    "thumbnail": "https://i.imgur.com/9cwf8ZG.gif",
    "por": "anônimo",
    "title": "gchan post # 984",
    "content": "Google"
  },
  "993": {
    "thumbnail": "https://i.kym-cdn.com/entries/icons/mobile/000/022/310/isleep.jpg",
    "por": "anônimo",
    "title": "funcionário novo na firma",
    "content": "hm"
  },
  "967": {
    "thumbnail": "https://media2.giphy.com/media/4QxQgWZHbeYwM/giphy.webp?cid=12057471opnl8a57jfgas6wx6787gzdo0qdn4ew4a4lyi8o1&rid=giphy.webp&ct=g",
    "por": "anônimo",
    "title": "gchan post # 967",
    "content": "anime"
  },
  "986": {
    "thumbnail": "",
    "por": "Vingames26",
    "title": "gchan post # 986",
    "content": "Zero two?\n"
  },
  "948": {
    "thumbnail": "https://i.imgur.com/vI2JOfu.jpg",
    "por": "anônimo",
    "title": "gchan post # 948",
    "content": "40 patacas para a glória"
  },
  "923": {
    "thumbnail": "",
    "por": "Charline",
    "title": "gchan post # 923",
    "content": "Excelentíssimo, por gentileza telegram! :)"
  },
  "717": {
    "thumbnail": "https://i.imgur.com/Ey5AgGl.jpg",
    "por": "anônimo",
    "title": "gchan post # 717",
    "content": "não seje cuzao, adote o dexter"
  },
  "978": {
    "thumbnail": "https://i.imgur.com/BwlOFZ8.jpg",
    "por": "Tardígrado Cosmonauta ",
    "title": "gchan post # 978",
    "content": "❤❤❤\n\nhttps://www.uol.com.br/tilt/noticias/redacao/2021/05/21/tardigrados-sao-disparados-de-arma-em-teste-de-resistencia-a-impactos.htm"
  },
  "977": {
    "thumbnail": "https://i.imgur.com/TyCIzun.jpg",
    "por": "anônimo",
    "title": "gchan post # 977",
    "content": "H3ntai"
  },
  "974": {
    "thumbnail": "https://imagez.tmz.com/image/c9/1by1/2017/07/28/c95fef52c65d52c7b265c162b9671229_xl.jpg",
    "por": "anônimo",
    "title": "Gomorrah (2008)",
    "content": "Boa noite gurizada, aqui vai a recomendação de filme do dia: https://www.imdb.com/title/tt0929425/\n\n\nPra quem sempre quis saber como é o cidade de deus italiano, tá na mão. "
  }
}
      })
    })
  ])
} else {
  // NODE_ENV === 'development'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"development"'
      }
    }),
    new HtmlWebpackPlugin({
      title: 'DEVELOPMENT prerender-spa-plugin',
      template: 'index.html',
      filename: 'index.html',
      favicon: 'favicon.ico'
    }),
  ])
}

