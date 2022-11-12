/*
 * @Author: DWP
 * @Date: 2021-10-08 16:59:27
 * @LastEditors: DWP
 * @LastEditTime: 2021-10-19 11:01:54
 */
const { merge } = require('webpack-merge');
const common = require('./webpack.config');

module.exports = merge(common, {
  mode: 'production',
  output: {
    publicPath: './', // 静态资源CDN地址
  },
  devtool: 'cheap-module-source-map',
});
