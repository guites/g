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
      routes: ['/', '/about', '/info', '/new', '/post/1050', '/post/1049', '/post/1048', '/post/1047', '/post/1043', '/post/1046', '/post/1045', '/post/1044', '/post/1013', '/post/1015', '/post/1014', '/post/1012', '/post/1010', '/post/1003', '/post/1011', '/post/1009', '/post/1005', '/post/1008', '/post/1007', '/post/1006', '/post/86', '/post/1002', '/post/1001', '/post/1000', '/post/999', '/post/998', '/post/994', '/post/997', '/post/996', '/post/995', '/post/902'],
      renderer: new Renderer({
        // The name of the property
        injectProperty: '__PRERENDER_INJECTED',
        // The values to have access to via `window.injectProperty` (the above property )
        inject:
        {
          "1044": {
            "thumbnail": "https://i.imgur.com/w7oqdml.jpg",
            "title": "gchan post # 1044",
            "por": "anônimo",
            "content": "vai uma carga de html pre processado ai chefia?"
          },
          "998": {
            "thumbnail": "https://i.imgur.com/tBKVlbq.png",
            "title": "gchan post # 998",
            "por": "anônimo",
            "content": "google"
          },
          "1008": {
            "thumbnail": "https://i.imgur.com/nbLYgUF.gif",
            "title": "gchan post # 1008",
            "por": "anônimo",
            "content": "puta q pariu a docmentação do cakephp é muito boa"
          },
          "902": {
            "thumbnail": "https://i.imgur.com/Z8Byp6V.png",
            "title": "gchan post # 902",
            "por": "anônimo",
            "content": ","
          },
          "1011": {
            "thumbnail": "https://i.imgur.com/HvLS763.jpg",
            "title": "gchan post # 1011",
            "por": "anônimo",
            "content": "so queria  meu abrigo da adidas"
          },
          "1010": {
            "thumbnail": "https://olhaopapo.files.wordpress.com/2013/04/dovemc_cabelos.jpg",
            "title": "gchan post # 1010",
            "por": "MLucas",
            "content": "'Seu cabelo está divino'"
          },
          "1049": {
            "thumbnail": "",
            "title": "gchan post # 1049",
            "por": "garen trator",
            "content": "voce pode jogar de garen, voce gosta dele é facil matar as pessoas com ele :3"
          },
          "1045": {
            "thumbnail": "https://i.imgur.com/tQQteEr.jpg",
            "title": "gchan post # 1045",
            "por": "jairo",
            "content": "salve @Guilherme"
          },
          "994": {
            "thumbnail": "https://i.imgur.com/9hrbyAV.jpg",
            "title": "gchan post # 994",
            "por": "anônimo",
            "content": "Prioridades meus caros! "
          },
          "997": {
            "thumbnail": "https://i.imgur.com/KFleatX.jpg",
            "title": "gchan post # 997",
            "por": "anônimo",
            "content": "vida imita arte?"
          },
          "1047": {
            "thumbnail": "https://thumbs.gfycat.com/InnocentNiceIsabellinewheatear-size_restricted.gif",
            "title": "'tu é o lider do setor agora, cara'",
            "por": "anônimo",
            "content": "o chapéu do lider:"
          },
          "1050": {
            "thumbnail": "https://i.imgur.com/H1T6xH7.jpg",
            "title": "gchan post # 1050",
            "por": "jairo",
            "content": "kkkkk quem nunca"
          },
          "1000": {
            "thumbnail": "",
            "title": "gchan post # 1000",
            "por": "anônimo",
            "content": "kjn"
          },
          "1012": {
            "thumbnail": "https://animasso.com.br/wp-content/uploads/2018/07/3b7785b8dffa28b9a9c335f3689c8f6c97c9e9e2_hq.gif",
            "title": "majin boo magro",
            "por": "anônimo",
            "content": "tapa na cara de quem me julgou"
          },
          "996": {
            "thumbnail": "https://i.imgur.com/DL6tckg.jpg",
            "title": "gchan post # 996",
            "por": "anônimo",
            "content": "uma profissão que ganhe bem sem depressão crônica, por favor"
          },
          "1046": {
            "thumbnail": "https://i.imgur.com/TVTW33R.jpg",
            "title": "gchan post # 1046",
            "por": "Uma pessoa",
            "content": "Se você não passou por isso não ande comigo "
          },
          "1015": {
            "thumbnail": "https://i.imgur.com/C6DhYeA.jpg",
            "title": "gchan post # 1015",
            "por": "anônimo",
            "content": "O Guilherme no dia de hoje"
          },
          "1007": {
            "thumbnail": "",
            "title": "primeira sessão no psicologo be like",
            "por": "anônimo",
            "content": "https://www.youtube.com/watch?v=5PdXIHGvMpk"
          },
          "1009": {
            "thumbnail": "https://i.imgur.com/MxHlFAR.jpg",
            "title": "gchan post # 1009",
            "por": "jairo",
            "content": "humilde"
          },
          "1005": {
            "thumbnail": "https://i.imgur.com/tpyeypJ.jpg",
            "title": "gchan post # 1005",
            "por": "Charline",
            "content": "Mais um gatinho por gentileza! "
          },
          "1014": {
            "thumbnail": "https://i.pinimg.com/originals/61/3d/95/613d95c547dfbd0d5201bd03a263bf28.jpg",
            "title": "slackin",
            "por": "anônimo",
            "content": "jantara o filosofo"
          },
          "1043": {
            "thumbnail": "https://www.youtube.com/watch?v=yjNcXPtNQdE",
            "title": "gchan post # 1043",
            "por": "cabelo",
            "content": "lyrics:\nburgir\n\nhttps://www.youtube.com/watch?v=yjNcXPtNQdE"
          },
          "1002": {
            "thumbnail": "https://media.giphy.com/media/wf1rHZThrEGZ2/giphy.gif",
            "title": "pessoa normal: ai meu deus",
            "por": "anônimo",
            "content": "ateistas num raio de 3km:"
          },
          "995": {
            "thumbnail": "https://bocadoinferno.com.br/wp-content/uploads/2014/07/Suspiria-1977-7.jpg",
            "title": "slackin",
            "por": "anônimo",
            "content": "filminho"
          },
          "1003": {
            "thumbnail": "https://filmvibes.files.wordpress.com/2018/09/tumblr_paz5jwt34q1w0ecy6o2_r1_540.gif",
            "title": "gchan post # 1003",
            "por": "anônimo",
            "content": "eu indo cagar 11:38 e vendo q alguem deixou um pacote de trakinas com 3 bolacha dentro"
          },
          "1013": {
            "thumbnail": "https://i.pinimg.com/originals/61/3d/95/613d95c547dfbd0d5201bd03a263bf28.jpg",
            "title": "gchan post # 1013",
            "por": "anônimo",
            "content": "fani"
          },
          "1001": {
            "thumbnail": "",
            "title": "gchan post # 1001",
            "por": "karolinaprezzi",
            "content": "ugv"
          },
          "1006": {
            "thumbnail": "https://conteudo.imguol.com.br/c/noticias/64/2018/09/06/6set2018---jair-bolsonaro-psl-candidato-a-presidente-e-carregado-apos-ser-atingido-por-um-objeto-durante-ato-em-juiz-de-fora-1536262195499_615x300.png",
            "title": "gchan post # 1006",
            "por": "anônimo",
            "content": "Vi um pacote de crem craquer jogado no asfalto hj tô assim até agr"
          },
          "1048": {
            "thumbnail": "",
            "title": "gchan post # 1048",
            "por": "jairo",
            "content": "O jairo não me deixa ser o jairo"
          },
          "86": {
            "thumbnail": "https://thumbs.gfycat.com/BlackandwhiteSpeedyGhostshrimp.webp",
            "title": "qnd o pedido nao subiu no tiny",
            "por": "Anonymous",
            "content": "\nbad"
          },
          "999": {
            "thumbnail": "",
            "title": "gchan post # 999",
            "por": "anônimo",
            "content": "aasdfghjbvc google"
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

