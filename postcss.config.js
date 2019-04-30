module.exports = {
  ident: 'postcss',
  syntax: 'postcss-scss',
  plugins: {
    'postcss-smart-import': {
      addDependencyTo: require('webpack')
    },
    'postcss-url': {
      url: 'rebase',
    },
    'postcss-nested': {},
    'postcss-preset-env': {
      stage: 3,
    },
    autoprefixer: {},
    cssnano: {
      preset: [
        'default',
        {
          discardComments: {
            removeAll: true
          }
        }
      ]
    }
  },
};
