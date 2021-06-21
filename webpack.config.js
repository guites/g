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
      routes: [ '/', '/about', '/info', '/new', '/post/1029', '/post/1031', '/post/1032', '/post/1030', '/post/1027', '/post/1028', '/post/789', '/post/458', '/post/823', '/post/945', '/post/989'],
      renderer: new Renderer({
        // The name of the property
        injectProperty: '__PRERENDER_INJECTED',
        // The values to have access to via `window.injectProperty` (the above property )
        inject: {
          "989": {
            "content": "As vezes o jovem é muito focado! ",
            "title": "gchan post # 989",
            "por": "anônimo",
            "thumbnail": "https://i.imgur.com/UshI03m.jpg"
          },
          "1029": {
            "content": "'Não é um bug, é uma 'não-implementação''\n(GARCIA, Guilherme)",
            "title": "gchan post # 1029",
            "por": "MLucas",
            "thumbnail": "https://preview.redd.it/ky9opkwv4u111.png?width=960&crop=smart&auto=webp&s=d253578480729e658979576dda10eea365edad78"
          },
          "1027": {
            "content": "tamo assombrado piazada",
            "title": "gchan post # 1027",
            "por": "anônimo",
            "thumbnail": "https://i.imgur.com/XmxxZK8.jpg"
          },
          "945": {
            "content": "O gato Goose foi invocado....\nContemplem:\nGumercindo 'Goose' Lucas\n",
            "title": "gchan post # 945",
            "por": "MLucas",
            "thumbnail": "https://i.imgur.com/luoANOU.jpg"
          },
          "1031": {
            "content": "E NÃO PODERIA ESTAR ACONTECENDO\nBAH",
            "title": "gchan post # 1031",
            "por": "anônimo",
            "thumbnail": "https://media2.giphy.com/media/EtB1yylKGGAUg/giphy.webp?cid=12057471udl59dhn1vu1tlp3dcwpry97qku67976axpf8ixe&rid=giphy.webp&ct=ghttps://media2.giphy.com/media/EtB1yylKGGAUg/giphy-preview.webp?cid=12057471udl59dhn1vu1tlp3dcwpry97qku67976axpf8ixe&rid=giphy-preview.webp&ct=g"
          },
          "1028": {
            "content": "2019, colorido",
            "title": "usuário MLucas realiza um rollback",
            "por": "anônimo",
            "thumbnail": "https://i.imgur.com/WRDe3oV.mp4"
          },
          "1030": {
            "content": "bolsominion refutado",
            "title": "gchan post # 1030",
            "por": "jairo petista",
            "thumbnail": "https://i.imgur.com/Oiv218N.png"
          },
          "1032": {
            "content": "sneaky blog da carvalho",
            "title": "tentando entender pq o site ta lento",
            "por": "anônimo",
            "thumbnail": "https://i.imgur.com/Y2khgwW.gif"
          },
          "458": {
            "content": "Treinando monki flip",
            "title": "gchan post # 458",
            "por": "MLucas",
            "thumbnail": "https://video.twimg.com/ext_tw_video/1304520174528331778/pu/vid/640x640/evhne68Q6PO3syCO.mp4"
          },
          "823": {
            "content": "fucking hACKED",
            "title": "gchan post # 823",
            "por": "anônimo",
            "thumbnail": "https://i.imgur.com/6wtoeV5.jpg"
          },
          "789": {
            "content": "TETA",
            "title": "gchan post # 789",
            "por": "anônimo",
            "thumbnail": "https://i.imgur.com/MX10ry8.jpg"
          }
        },
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

