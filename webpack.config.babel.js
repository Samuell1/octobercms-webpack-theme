import path from 'path'
import webpack from 'webpack'
import WebpackBar from 'webpackbar'
import CssoWebpackPlugin from 'csso-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CleanWebpackPlugin from 'clean-webpack-plugin'
import UglifyJSPlugin from 'uglifyjs-webpack-plugin'
import FixStyleOnlyEntriesPlugin from 'webpack-fix-style-only-entries'
import ManifestPlugin from 'webpack-manifest-plugin'

const NODE_ENV = process.env.NODE_ENV || 'production'

const resolve = (dir) => path.join(__dirname, dir)

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
    path: resolve('assets/compiled/'),
    publicPath: NODE_ENV === 'development' ? '/themes/dr/assets/compiled/' : 'https://cdn.mypage.com/assets/compiled/',
    filename: '[contenthash].js',
  },
  devtool: NODE_ENV === 'development' ? 'source-map' : false,
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.vue'],
    alias: {
      modules: resolve('assets/js/modules/'),
    }
  },
  context: resolve('/'),
  plugins: [
    new WebpackBar(),
    new ManifestPlugin(),
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
              path: `${__dirname}/postcss.config.js`,
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
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'compiled/images/',
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
