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
      routes: [ '/', '/about', '/info', '/new', '/post/1036', '/post/1039', '/post/1040', '/post/1042', '/post/1041', '/post/1038', '/post/1035', '/post/1023', '/post/1033', '/post/1037', '/post/1034'],
      renderer: new Renderer({
        // The name of the property
        injectProperty: '__PRERENDER_INJECTED',
        // The values to have access to via `window.injectProperty` (the above property )
        inject:
        {
          "1040": {
            "content": "fica a dica",
            "thumbnail": "https://i.imgur.com/w9A7lxm.jpg",
            "title": "gchan post # 1040",
            "por": "jairo"
          },
          "1037": {
            "content": "Garibaldo tá de pilantragem! ",
            "thumbnail": "https://i.imgur.com/KWzshGs.jpg",
            "title": "gchan post # 1037",
            "por": "anônimo"
          },
          "1041": {
            "content": "cliente: não consigo fechar compra no cartão de crédito\n\n\nprogramador:",
            "thumbnail": "https://s2.glbimg.com/0wY3Lla2cgM5I_v9VQtPWPct45o=/smart/e.glbimg.com/og/ed/f/original/2021/05/04/image_ReC1Zdd.png",
            "title": "gchan post # 1041",
            "por": "anônimo"
          },
          "1038": {
            "content": "depurando em produção sem read nos logs be like",
            "thumbnail": "https://i.imgur.com/AmeGSIh.jpg",
            "title": "gchan post # 1038",
            "por": "anônimo"
          },
          "1033": {
            "content": "the gado awaits",
            "thumbnail": "https://i.imgur.com/32OJW36.png",
            "title": "sry jatnara",
            "por": "anônimo"
          },
          "1042": {
            "content": "nluke",
            "thumbnail": "https://i.imgur.com/pWVYpea.jpg",
            "title": "gchan post # 1042",
            "por": "anônimo"
          },
          "1036": {
            "content": "Depois da thread do Monkiflip, uma thread para mamacos em geral...",
            "thumbnail": "https://i.imgur.com/V3fyJpq.mp4",
            "title": "gchan post # 1036",
            "por": "MLucas"
          },
          "1039": {
            "content": "o estadista cruel",
            "thumbnail": "https://img-9gag-fun.9cache.com/photo/aXoK1mP_460svvp9.mp4",
            "title": "gchan post # 1039",
            "por": "jairo"
          },
          "1023": {
            "content": "Pra ela é óbvio\nPorque ela é burra",
            "thumbnail": "https://i.imgur.com/vkeL9fD.png",
            "title": "gchan post # 1023",
            "por": "MLucas"
          },
          "1034": {
            "content": "eu: vo jogar um lolzin pegar um elo\n\na sociedade:",
            "thumbnail": "https://i.imgur.com/76l9meb.mp4",
            "title": "gchan post # 1034",
            "por": "anônimo"
          },
          "1035": {
            "content": ".",
            "thumbnail": "https://i.imgur.com/OROuUzF.jpg",
            "title": "gchan post # 1035",
            "por": "FPassa"
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

