import path from 'path'
import webpack from 'webpack'
import WebpackBar from 'webpackbar'
import CssoWebpackPlugin from 'csso-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CleanWebpackPlugin from 'clean-webpack-plugin'
import UglifyJSPlugin from 'uglifyjs-webpack-plugin'
import FixStyleOnlyEntriesPlugin from 'webpack-fix-style-only-entries'
import WebpackAssetsManifest from 'webpack-assets-manifest'

const NODE_ENV = process.env.NODE_ENV || 'production'

const resolve = (dir) => path.join(__dirname, dir)

const THEME_FOLDER = '/themes/THEME_NAME'
const CDN_LINK = 'https://cdn.mydomain.com/assets/'
const OUTPUT_FOLDER = 'compiled/'

const config = {
  mode: NODE_ENV,
  entry: {
    // global
    app: './assets/js/app.js',
    styles: './assets/scss/app.scss',
    lazysizes: './assets/js/lazysizes.js',

    // separate pages
    shop: './assets/js/pages/shop.js',
    basket: './assets/js/pages/basket.js',
    product: './assets/js/pages/product.js',
  },
  output: {
    path: resolve('assets/' + OUTPUT_FOLDER),
    publicPath: NODE_ENV === 'development' ? THEME_FOLDER + '/assets/' + OUTPUT_FOLDER : CDN_LINK + OUTPUT_FOLDER,
    filename: '[contenthash].js',
  },
  devtool: NODE_ENV === 'development' ? 'source-map' : false,
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.vue'],
    alias: {
      // Define custom modules
      modules: resolve('assets/js/modules/'),
    }
  },
  context: resolve('/'),
  plugins: [
    new WebpackBar(),
    new WebpackAssetsManifest({
      publicPath: true,
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
      filename: '[contenthash].css',
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
      test: /\.scss$/,
      use: [
        {
          loader: 'style-loader',
          options: {
            sourceMap: NODE_ENV === 'development',
          },
        },
        {
          loader: MiniCssExtractPlugin.loader,
        },
        {
          loader: 'css-loader',
          options: {
            sourceMap: NODE_ENV === 'development',
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            sourceMap: NODE_ENV === 'development',
            config: {
              path: resolve('postcss.config.js'),
            },
          },
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: NODE_ENV === 'development',
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
          name: '[name].[ext]',
          outputPath: 'images'
        },
      }],
    },
    ],
  },
  optimization: {
    minimize: NODE_ENV === 'production',
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true,
        uglifyOptions: {
          compress: {
            inline: false
          }
        }
      })
    ],
    splitChunks: {
      cacheGroups: {
        default: false,
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
          minChunks: 2
        }
      }
    },
    runtimeChunk: false
  },
}

if (NODE_ENV === 'production') {
  config.plugins.push(new CssoWebpackPlugin())
}

export default config
