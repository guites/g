path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')
const PrerenderSPAPlugin = require('prerender-spa-plugin')
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;
const { VueLoaderPlugin } = require('vue-loader');

const fetch = require('node-fetch');
const fs = require('fs');

if (process.env.NODE_ENV === 'production') { 
  module.exports = () => {
    return fetch('https://gchan-message-board.herokuapp.com/messages')
    .then(response => response.json())
    .then((json) => {

      const myjson = {};
      const myroutes = [];
      const results = json.results;

      const sitemap_path = './docs/sitemap.txt';
      let sitemap_exists = false;

      if (fs.existsSync('./docs')) {
        if (!fs.existsSync(sitemap_path)) {
          fs.writeFileSync(sitemap_path, '', function (err) {
            if (err) throw err;
          });
          sitemap_exists = true;
        } else {
          sitemap_exists = true;
        }

      }

      let stream = null;
      if (sitemap_exists) {
        stream = fs.createWriteStream(sitemap_path, {flags:'a'});
      }

      let i = 0;
      let count_posts = 0;

      while (count_posts < 25) {
        if (results[i]) {
          var post_id = results[i].id;
          if (!fs.existsSync(`./docs/post/${post_id}`)) {
            count_posts++;
            myroutes.push(`/post/${post_id}`);
            if (results[i].subject == '') results[i].subject = `post #${post_id}`;
            myjson[`${post_id}`] = {
              "content": results[i].message,
              "thumbnail": results[i].imageurl,
              "title": results[i].subject,
              "por": results[i].username,
              "created": results[i].created
            };    
            if (sitemap_exists) {
              stream.write(`https://gchan.com.br/post/${post_id}` + "\n");
            }
          }
          i++;
        } else {
          break;
        }
      }

      if (sitemap_exists) {
        stream.end();
      }

      myroutes.push('/');
      myroutes.push('/about');
      myroutes.push('/info');
      myroutes.push('/new');

      return {
        entry: './src/main.js',
        output: {
          path: path.resolve(__dirname, './docs'),
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
        devtool: "#source-map",
        plugins: [
          new VueLoaderPlugin(),
          new webpack.DefinePlugin({
            'process.env': {
              NODE_ENV: '"production"'
            }
          }),
          new HtmlWebpackPlugin({
            title: 'PRODUCTION prerender-spa-plugin',
            template: 'index.html',
            filename: path.resolve(__dirname, 'docs/index.html'),
            favicon: 'favicon.ico'
          }),
          new PrerenderSPAPlugin({
            staticDir: path.join(__dirname, 'docs'),
            routes: myroutes,
            renderer: new Renderer({
              // The name of the property
              injectProperty: '__PRERENDER_INJECTED',
              // The values to have access to via `window.injectProperty` (the above property )
              inject: myjson
            })
          })
        ]
      }
    });
  }
} else {
  // dev
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
      host: '0.0.0.0',
    },
    devtool: '#eval-source-map',
    plugins: [
      new VueLoaderPlugin(),
    ]
  }

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

if (process.env.NODE_ENV === 'production') {


  //  module.exports.devtool = '#source-map'
  //  module.exports.plugins = (module.exports.plugins || []).concat([
  //    new webpack.DefinePlugin({
  //      'process.env': {
  //        NODE_ENV: '"production"'
  //      }
  //    }),
  //    new HtmlWebpackPlugin({
  //      title: 'PRODUCTION prerender-spa-plugin',
  //      template: 'index.html',
  //      filename: path.resolve(__dirname, 'dist/index.html'),
  //      favicon: 'favicon.ico'
  //    }),
  //    new PrerenderSPAPlugin({
  //      staticDir: path.join(__dirname, 'dist'),
  //      routes: myroutes,
  //      renderer: new Renderer({
  //        // The name of the property
  //        injectProperty: '__PRERENDER_INJECTED',
  //        // The values to have access to via `window.injectProperty` (the above property )
  //        inject: myjson
  //      })
  //    })
  //  ])
} else {
  // NODE_ENV === 'development'
 // module.exports.plugins = (module.exports.plugins || []).concat([
 //   new webpack.DefinePlugin({
 //     'process.env': {
 //       NODE_ENV: '"development"'
 //     }
 //   }),
 //   new HtmlWebpackPlugin({
 //     title: 'DEVELOPMENT prerender-spa-plugin',
 //     template: 'index.html',
 //     filename: 'index.html',
 //     favicon: 'favicon.ico'
 //   }),
 // ])
}

