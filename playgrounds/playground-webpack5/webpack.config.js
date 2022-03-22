const path = require('path');
const { RxjsInsightsPlugin } = require('@rxjs-insights/plugin-webpack5');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    index: './src/index.ts',
    polyfills: './src/polyfills.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [new RxjsInsightsPlugin()],
};
