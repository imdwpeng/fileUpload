/*
 * @Author: DWP
 * @Date: 2021-10-08 16:59:27
 * @LastEditors: DWP
 * @LastEditTime: 2021-10-18 15:45:54
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
    clean: true, // 每次构建清除dist包
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/index.html'),
      filename: 'index.html', // output file
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './node_modules/spark-md5/spark-md5.min.js'),
          to: path.resolve(__dirname, './dist/spark-md5.min.js'),
        },
        {
          from: path.resolve(__dirname, './src/hash.js'),
          to: path.resolve(__dirname, './dist/hash.js'),
        },
      ],
    }),
  ],
};
