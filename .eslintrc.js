/*
 * @Author: DWP
 * @Date: 2021-10-14 16:46:30
 * @LastEditors: DWP
 * @LastEditTime: 2021-10-15 18:24:22
 */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'no-loop-func': [0],
    'no-nested-ternary': [0],
    'no-plusplus': [0],
  },
};
