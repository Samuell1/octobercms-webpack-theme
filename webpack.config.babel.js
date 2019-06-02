import path from 'path'
import webpack from 'webpack'
import WebpackBar from 'webpackbar'
import CssoWebpackPlugin from 'csso-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CleanWebpackPlugin from 'clean-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import FixStyleOnlyEntriesPlugin from 'webpack-fix-style-only-entries'
import WebpackAssetsManifest from 'webpack-assets-manifest'

const NODE_ENV = process.env.NODE_ENV || 'production'
const isDev = NODE_ENV === 'development'

const resolve = (dir) => path.join(__dirname, dir)

const THEME_FOLDER = 'http://localhost:8080/themes/THEME_NAME'
const CDN_LINK = 'https://cdn.mydomain.com/assets/'
const OUTPUT_FOLDER = 'build/'

const globalPublicPath = THEME_FOLDER + '/assets/' + OUTPUT_FOLDER

const config = {
  mode: NODE_ENV,
  entry: {
    // global
    app: './js/app.js',

    // fonts
    fonts: './scss/fonts.scss',

    // separate packages
    lazysizes: './js/lazysizes.js',

    // separate pages
    shop: './js/page/shop.js',
    basket: './js/page/basket.js',
    product: './js/page/product.js',
  },
  output: {
    path: resolve('assets/' + OUTPUT_FOLDER),
    publicPath: isDev ? globalPublicPath : CDN_LINK + OUTPUT_FOLDER,
    filename: isDev ? '[name].js' : '[contenthash].js',
  },
  devServer: {
    hot: true,
    inline: true,
    host: 'localhost',
    port: 8080,
    contentBase: path.join(__dirname, 'assets'),
    disableHostCheck: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
  devtool: isDev ? 'source-map' : false,
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.vue'],
    alias: {
      // Define custom modules
      modules: resolve('assets/js/modules/'),
    }
  },
  context: resolve('/assets'),
  plugins: [
    new WebpackBar(),
    new WebpackAssetsManifest({
      publicPath: true,
      writeToDisk: true
    }),
    new FixStyleOnlyEntriesPlugin(),
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: ['**/*', '!.gitignore'], }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV),
      },
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
    new MiniCssExtractPlugin({
      filename: isDev ? '[name].css' : '[contenthash].css',
      chunkFilename: isDev ? '[id].css' : '[id].[hash].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
        ],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDev,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDev,
              config: {
                path: resolve('postcss.config.js'),
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDev,
            },
          },
        ]
      },
      {
        test: /\.(png|jpe?g|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8000,
            name: isDev ? '[name].[ext]' : '[name]-[hash:3].[ext]',
            outputPath: 'images',
          },
        }],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            limit: 8000,
            outputPath: 'fonts',
          }
        }]
      }
    ],
  },
  optimization: {
    minimize: NODE_ENV === 'production',
    minimizer: [
      new TerserPlugin({
        sourceMap: isDev,
      })
    ],
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'common',
          minChunks: 1,
          chunks: 'async',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true
        },
        vendor: {
          test: /node_modules/,
          chunks: "initial",
          name: "vendor",
          priority: 10,
          enforce: true
        }
      }
    },
    runtimeChunk: 'single'
  },
}

if (!isDev) {
  config.plugins.push(new CssoWebpackPlugin())
} else {
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
}

export default config
