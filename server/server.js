/*
 * @Author: DWP
 * @Date: 2021-10-14 14:31:23
 * @LastEditors: DWP
 * @LastEditTime: 2022-11-25 21:47:09
 */
const fs = require('fs');
const express = require('express');
const multiparty = require('multiparty');
const bodyParser = require('body-parser');
const merge = require('./merge');

const app = express();
const chunksDir = 'chunks';

app.all('*', (req, res, next) => {
  // 设置允许跨域的域名，*代表允许任意域名跨域
  res.header('Access-Control-Allow-Origin', '*');
  // 允许的header类型
  res.header('Access-Control-Allow-Headers', 'content-type');
  // 跨域允许的请求方式
  res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS');
  if (req.method.toLowerCase() === 'options') { res.send(200); } else { next(); }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 切片上传
app.post('/upload', async (req, res) => {
  // 创建文件存放的临时目录
  if (!fs.existsSync(chunksDir)) {
    fs.mkdirSync(chunksDir);
  }

  const multipart = new multiparty.Form();

  // 文件存放
  multipart.uploadDir = chunksDir;
  multipart.parse(req, async (err, field, file) => {
    if (err) {
      console.log(err);
      return;
    }

    const [dir, filename] = field.filename[0].split('_');

    // 创建切片存放的临时目录
    if (!fs.existsSync(`${chunksDir}/${dir}`)) {
      fs.mkdirSync(`${chunksDir}/${dir}`);
    }

    fs.rename(file.file[0].path, `${chunksDir}/${dir}/${filename}`, (error) => {
      if (error) return console.log(error);

      // 模拟上传失败的情况
      if (Math.random() < 0.05) {
        return res.status(500).send({
          code: 0,
          codeText: `上传 ${field.filename} 片段失败，请重试`,
        });
      }

      return res.send({
        code: 1,
        codeText: `上传 ${field.filename} 片段成功`,
        originFilename: field.filename,
        servicePath: `${chunksDir}/${field.filename}`,
      });
    });
  });
});

// 整合切片
app.post('/upload_merge', async (req, res) => {
  const {
    hash,
    count,
    name,
  } = req.body;

  try {
    const { filename, path } = await merge({
      hash, count, name,
    });

    res.send({
      code: 0,
      codeText: '上传成功',
      filename,
      fileUrl: path,
    });
  } catch (err) {
    res.send({
      code: 1,
      codeText: err,
    });
  }
});

// 校验文件上传情况，返回已上传的切片，用于断点续传和秒传
app.get('/upload_already', async (req, res) => {
  const { hash, fileName } = req.query;
  const path = `${chunksDir}/${hash}`;
  let fileList = [];
  const isExist = fs.existsSync(`${chunksDir}/${fileName}`);

  try {
    fileList = fs.existsSync(path) ? fs.readdirSync(path) : [];
    if (fileList.length > 0) {
      fileList = fileList.map((file) => file.split('.')[0] - 0).sort((a, b) => a - b);
    }

    res.send({
      code: 0,
      codeText: '',
      fileList,
      isExist,
    });
  } catch (err) {
    res.send({
      code: 1,
      codeText: err,
    });
  }
});

app.listen(3000);
