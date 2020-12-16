const path = require('path');
const webpack = require('webpack');
const paths = require('../config/paths');
const custom = require('../config/webpack.config.dev.js');


module.exports = {
  webpackFinal: (baseConfig, env, defaultConfig)  => {
    baseConfig.devServer = {
      hot: true
    };
    baseConfig.devtool = 'inline-source-map';
    baseConfig.watchOptions = {
      poll: true
    };

    baseConfig.module.rules = baseConfig.module.rules.filter(
    rule => rule.test.toString() !== '/\\.css$/'
    );

    baseConfig.module.rules.push({
       test: /\.(scss|css|sass)$/,
       loaders: [
         'style-loader',
         'css-loader',
         {
           loader: 'sass-loader',
           options: {
             sourceMap: true,
           },
         },
       ],
    });

    baseConfig.resolve.extensions.push('.scss');

    baseConfig.resolve.alias = {

      // Support React Native Web
      // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
      'react-native': 'react-native-web',
      '@Components': path.resolve(__dirname, '../src/js/components/'),
      'Components': path.resolve(__dirname, '../src/js/components/'),
      'Mutations': path.resolve(__dirname, '../src/js/mutations/'),
      'Results': path.resolve(__dirname, '../results/'),
      'Queries': path.resolve(__dirname, '../src/js/queries/'),
      'Subscriptions': path.resolve(__dirname, '../src/js/subscriptions/'),
      'JS': path.resolve(__dirname, '../src/js/'),
      'Submodules': path.resolve(__dirname, '../submodules/'),
      'Images': path.resolve(__dirname, '../src/images/'),
      'Styles': path.resolve(__dirname, '../src/css/'),
      'Fonts': path.resolve(__dirname, '../src/fonts/'),
      'Node': path.resolve(__dirname, '../node_modules'),

    };
    return baseConfig;
  },
  stories: ['../stories', '../src/js/**/*.stories.js', '../src/js/**/*.stories.jsx'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-storysource',
    '@storybook/addon-a11y',
    '@storybook/addon-jest',
  ],
};
