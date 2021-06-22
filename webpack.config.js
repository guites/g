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
      routes: ['/', '/about', '/info', '/new', '/post/966', '/post/958', '/post/965', '/post/964', '/post/951', '/post/963', '/post/960', '/post/962', '/post/953', '/post/961', '/post/959', '/post/957', '/post/956', '/post/954', '/post/955', '/post/952', '/post/949', '/post/950', '/post/947', '/post/946', '/post/944', '/post/943', '/post/938', '/post/942', '/post/941', '/post/940', '/post/935', '/post/939', '/post/741', '/post/934', '/post/540'],
      renderer: new Renderer({
        // The name of the property
        injectProperty: '__PRERENDER_INJECTED',
        // The values to have access to via `window.injectProperty` (the above property )
        inject:
        {
  "955": {
    "content": "Eu conferindo minhas contas",
    "thumbnail": "https://i.imgur.com/ljvwZne.jpg",
    "title": "gchan post # 955",
    "por": "anônimo"
  },
  "942": {
    "content": "o que o google quis dizer com isso",
    "thumbnail": "https://i.imgur.com/AAmwNlb.png",
    "title": "gchan post # 942",
    "por": "anônimo"
  },
  "741": {
    "content": "sinais claros",
    "thumbnail": "https://i.imgur.com/ZdtNLRK.jpg",
    "title": "gchan post # 741",
    "por": "anônimo"
  },
  "960": {
    "content": "Aquele tesão reprimido pela pessoa que nunca passa.",
    "thumbnail": "",
    "title": "gchan post # 960",
    "por": "anônimo"
  },
  "963": {
    "content": "o absoluto estado do ''pop punk'' moderno\n\n\n",
    "thumbnail": "https://i.imgur.com/DHizmIw.jpg",
    "title": "musicas para encolher seu jeans",
    "por": "anônimo"
  },
  "540": {
    "content": "Dia mundial dos gatunos! ",
    "thumbnail": "https://i.imgur.com/z2BbrpZ.mp4",
    "title": "gchan post # 540",
    "por": "Shippo-chan"
  },
  "958": {
    "content": "Eterno",
    "thumbnail": "https://i.imgur.com/2djAPuQ.jpg",
    "title": "gchan post # 958",
    "por": "anônimo"
  },
  "962": {
    "content": "Mais alguém está ansioso pela sexta feira? ",
    "thumbnail": "",
    "title": "gchan post # 962",
    "por": "anônimo"
  },
  "938": {
    "content": "Todos estes anos assistindo produções japonesas me fazem ter certeza que esse cachorro está no meio de uma luta épica... e que está levando a pior neste momento, mas ele vai se levantar e VENCER!",
    "thumbnail": "https://pbs.twimg.com/media/E0RWB3BXoAENMQT?format=jpg&name=large",
    "title": "gchan post # 938",
    "por": "MLucas"
  },
  "935": {
    "content": "Straigh Edge Cocktail Recipes",
    "thumbnail": "https://img-9gag-fun.9cache.com/photo/azMd1EN_700bwp.webp",
    "title": "gchan post # 935",
    "por": "anônimo"
  },
  "956": {
    "content": "Sem mais.",
    "thumbnail": "https://i.imgur.com/GdNFyvS.jpg",
    "title": "gchan post # 956",
    "por": "anônimo"
  },
  "959": {
    "content": "Dica do dia, seu dentista agradece.",
    "thumbnail": "https://i.imgur.com/bjB8q4v.jpg",
    "title": "gchan post # 959",
    "por": "anônimo"
  },
  "964": {
    "content": "tô subindo umas alterações talvez a coisa fique instável por algumas horas",
    "thumbnail": "https://memegenerator.net/img/instances/71820630/our-database-is-down-for-maintenance-please-wait.jpg",
    "title": "very important",
    "por": "admeen"
  },
  "952": {
    "content": "Abençoo toda a indústria pornográfica",
    "thumbnail": "https://cdn.joke4fun.com/media/posts/00000/74kg5027jmde.jpg",
    "title": "gchan post # 952",
    "por": "Astronauta cansado"
  },
  "940": {
    "content": "Nao",
    "thumbnail": "http://g-chan.wibicode.com",
    "title": "gchan post # 940",
    "por": "Victor "
  },
  "949": {
    "content": "tutorial de como resolver os probleminhas",
    "thumbnail": "https://www.wikihow.com/images_en/thumb/6/6b/Get-Prescribed-Xanax-Step-5-Version-3.jpg/v4-460px-Get-Prescribed-Xanax-Step-5-Version-3.jpg",
    "title": "gchan post # 949",
    "por": "anônimo"
  },
  "953": {
    "content": "Frio + Café = Perfeição",
    "thumbnail": "",
    "title": "gchan post # 953",
    "por": "anônimo"
  },
  "934": {
    "content": "...",
    "thumbnail": "https://i.imgur.com/0krkBNi.jpg",
    "title": "gchan post # 934",
    "por": "anônimo"
  },
  "951": {
    "content": ".",
    "thumbnail": "https://img-9gag-fun.9cache.com/photo/aNpvKv3_460sv.mp4",
    "title": "gchan post # 951",
    "por": "anônimo"
  },
  "947": {
    "content": "gustavo  10h45\nsim\n10h45\neu vou dar uma olhada no banco (editado) \n10h45\nta com cheirinho de ser tamanho de coluna",
    "thumbnail": "https://storage.googleapis.com/sales.appinst.io/2018/02/boo-hacker.gif",
    "title": "woof",
    "por": "anônimo"
  },
  "954": {
    "content": "lembrete diário de que a era dos humanos está chegando ao fim",
    "thumbnail": "https://i.imgur.com/ouM2QtH.jpg",
    "title": "gchan post # 954",
    "por": "anônimo"
  },
  "944": {
    "content": "recebendo um não da cherosa",
    "thumbnail": "https://i.imgur.com/h5cXjTs.jpg",
    "title": "gchan post # 944",
    "por": "anônimo"
  },
  "943": {
    "content": "Vive a vida",
    "thumbnail": "https://media3.giphy.com/media/a6pzK009rlCak/giphy.webp?cid=1205747112xty6ldpq0tsxy1qwyq2qvgtu65ubyxuvibe0kz&rid=giphy.webp&ct=g",
    "title": "gchan post # 943",
    "por": "Juliagameer11"
  },
  "966": {
    "content": "'mas ela me deu oi no slack bro'",
    "thumbnail": "https://i.imgur.com/ONXxXO7.jpg",
    "title": "gchan post # 966",
    "por": "anônimo"
  },
  "957": {
    "content": "To nada",
    "thumbnail": "https://i.imgur.com/H3m2LBK.jpg",
    "title": "gchan post # 957",
    "por": "anônimo"
  },
  "946": {
    "content": "🏃🏽‍♀️",
    "thumbnail": "https://i.imgur.com/031Idds.png",
    "title": "gchan post # 946",
    "por": "anônimo"
  },
  "961": {
    "content": "Enfeitar demais as vezes estraga.",
    "thumbnail": "https://i.imgur.com/1y90S8u.jpg",
    "title": "gchan post # 961",
    "por": "anônimo"
  },
  "965": {
    "content": "claro que eu tenho",
    "thumbnail": "https://i.imgur.com/dgHkyJz.jpg",
    "title": "caralho instagram",
    "por": "anônimo"
  },
  "939": {
    "content": "9.2/10 no imdb",
    "thumbnail": "https://i.imgur.com/lSi4Lct.mp4",
    "title": "the godless father",
    "por": "anônimo"
  },
  "950": {
    "content": "Pensem numa mulher com propriedade para fala!\nIsso sim é beleza, valorizem quem usa o cérebro...\n\nhttps://www.brasil247.com/blog/3-dias-de-uma-experiencia-fracassada?fbclid=IwAR3C5zgryMDzsEd8-7vwF5szU8IrddXOjm2zMiXdp301y61_sK8Ynmrqkcc",
    "thumbnail": "https://i.imgur.com/keqvSDt.jpg",
    "title": "gchan post # 950",
    "por": "Charline"
  },
  "941": {
    "content": "isso é violência gratuita?",
    "thumbnail": "https://live.staticflickr.com/65535/50930962348_aeb5d829e1_o.jpg",
    "title": "gchan post # 941",
    "por": "anônimo"
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

