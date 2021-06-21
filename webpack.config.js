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
      routes: [ '/', '/about', '/info', '/new', '/post/1026', '/post/1025', '/post/1024', '/post/1017', '/post/1020', '/post/1022', '/post/1021', '/post/1019', '/post/1018', '/post/1016', '/post/1004'],
      renderer: new Renderer({
        // The name of the property
        injectProperty: '__PRERENDER_INJECTED',
        // The values to have access to via `window.injectProperty` (the above property )
        inject:
        {
        "1004": {
          "content": "Tomate",
          "title": "Tomate idoso",
          "por": "anônimo",
          "thumbnail": "https://i.imgur.com/SsgZU1t.jpg"
        },
        "1016": {
          "content": "Uma rapidinha querido! ",
          "title": "gchan post # 1016",
          "por": "Vacilaidson",
          "thumbnail": "https://img-9gag-fun.9cache.com/photo/a9EOzmL_460svav1.mp4"
        },
        "1021": {
          "content": "Um desses e uma faca, apenas o necessário para salvar o governo americano!",
          "title": "gchan post # 1021",
          "por": "Solid Snake",
          "thumbnail": "https://img-9gag-fun.9cache.com/photo/aqjYyEP_460svav1.mp4"
        },
        "1022": {
          "content": "Alguns jovens são precipitados, gostam de fracassar antes de sairem das fraldas",
          "title": "gchan post # 1022",
          "por": "Friendzone",
          "thumbnail": "https://img-9gag-fun.9cache.com/photo/anQrz0V_460svav1.mp4"
        },
        "1026": {
          "content": "Se Arrastando",
          "title": "gchan post # 1026",
          "por": "anônimo",
          "thumbnail": "https://i.kym-cdn.com/entries/icons/facebook/000/028/015/cover3.jpg"
        },
        "1025": {
          "content": "quando o spammer indiano teve o ensino médio forte",
          "title": "gchan post # 1025",
          "por": "anônimo",
          "thumbnail": "https://i.imgur.com/izSNKAN.jpg"
        },
        "1018": {
          "content": "Mais um jovem vegano saindo do armário no churrasco do domingo em família ",
          "title": "gchan post # 1018",
          "por": "anônimo",
          "thumbnail": "https://img-9gag-fun.9cache.com/photo/a6EjZ3b_460svvp9.webm"
        },
        "1019": {
          "content": "...",
          "title": "gchan post # 1019",
          "por": "anônimo",
          "thumbnail": "https://img-9gag-fun.9cache.com/photo/aV7VgX8_460swp.webp"
        },
        "1017": {
          "content": "#SuperaJairo",
          "title": "gchan post # 1017",
          "por": "anônimo",
          "thumbnail": "https://i.imgur.com/4fhpM4v.jpg"
        },
        "1024": {
          "content": "eu dps de xingar deus e o mundo e ainda é 9:42",
          "title": "gchan post # 1024",
          "por": "gilerme",
          "thumbnail": "https://i0.wp.com/media.tumblr.com/tumblr_ls9dlqzXX81qklj8n.gif"
        },
        "1020": {
          "content": "Buraco da glória para crianças",
          "title": "gchan post # 1020",
          "por": "anônimo",
          "thumbnail": "https://img-9gag-fun.9cache.com/photo/aEpO0bx_460swp.webp"
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

