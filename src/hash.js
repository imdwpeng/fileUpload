/*
 * @Author: DWP
 * @Date: 2021-10-18 15:45:14
 * @LastEditors: DWP
 * @LastEditTime: 2021-10-18 15:45:15
 */
self.importScripts('/spark-md5.min.js');

self.onmessage = ({ data }) => {
  const { file } = data;
  const fileReader = new FileReader();

  fileReader.readAsArrayBuffer(file);
  fileReader.onload = (e) => {
    const buffer = e.target.result;
    const spark = new self.SparkMD5.ArrayBuffer();

    spark.append(buffer);

    // 生成文件名称
    const hash = spark.end();
    // 文件格式
    const suffix = /\.([0-9a-zA-Z]+)$/.exec(file.name)[1];

    self.postMessage({
      buffer,
      hash,
      suffix,
      filename: `${hash}.${suffix}`,
    });
  };
};
