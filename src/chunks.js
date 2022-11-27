/*
 * @Author: DWP
 * @Date: 2021-10-18 15:45:14
 * @LastEditors: DWP
 * @LastEditTime: 2022-11-25 21:53:57
 */
// 文件切片
self.onmessage = ({ data }) => {
  const {
    file,
    hash,
    space,
  } = data;
  const count = Math.ceil(file.size / space);
  // 文件格式
  const suffix = /\.([0-9a-zA-Z]+)$/.exec(file.name)[1];
  let index = 0;
  const chunks = [];

  while (index < count) {
    chunks.push({
      file: file.slice(index * space, (index + 1) * space),
      filename: `${hash}_${index}.${suffix}`,
    });
    index += 1;
  }

  self.postMessage(chunks);
};
