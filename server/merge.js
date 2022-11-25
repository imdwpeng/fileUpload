/*
 * @Author: DWP
 * @Date: 2021-10-14 11:01:54
 * @LastEditors: DWP
 * @LastEditTime: 2021-10-15 15:08:09
 */
const fs = require('fs');

const uploadDir = 'chunks';

const merge = ({
  hash,
  count,
  name,
}) => new Promise((resolve, reject) => {
  const path = `${uploadDir}/${hash}`;
  let fileList = [];

  if (!fs.existsSync(path)) return reject(new Error('hash path is not found!'));

  fileList = fs.readdirSync(path);

  if (fileList.length < count) return reject(new Error('not all slices have not been uploaded!'));

  // 切片文件排序
  fileList
    .sort((a, b) => a.split('.')[0] - b.split('.')[0])
    .forEach((item) => {
      // 添加切片至文件中
      fs.appendFileSync(`${uploadDir}/${name}`, fs.readFileSync(`${path}/${item}`));
      // 删除切片
      fs.unlinkSync(`${path}/${item}`);
    });

  // 删除切片文件夹
  fs.rmdirSync(path);

  return resolve({
    path: `${uploadDir}/${name}`,
    filename: `${name}`,
  });
});

module.exports = merge;
