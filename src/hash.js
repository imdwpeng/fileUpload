/*
 * @Author: DWP
 * @Date: 2021-10-18 15:45:14
 * @LastEditors: DWP
 * @LastEditTime: 2022-11-25 21:54:52
 */
self.importScripts('/spark-md5.min.js');

// 生成文件hash值
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

    self.postMessage({ hash });
  };
};
