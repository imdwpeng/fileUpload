/*
 * @Author: DWP
 * @Date: 2021-10-15 10:34:51
 * @LastEditors: DWP
 * @LastEditTime: 2021-10-18 18:00:28
 */
import axios from './axios';
import TaskQueue from './TaskQueue';

const changeBuffer = (file) => new Promise((resolve) => {
  const work = new Worker('hash.js');
  work.postMessage({ file });
  work.onmessage = (e) => {
    resolve({ ...e.data });
  };
});

// 文件切片
const getChunks = (options = {}) => {
  const {
    file,
    hash,
    suffix,
    space,
  } = options;
  const count = Math.ceil(file.size / space);
  let index = 0;
  const chunks = [];

  while (index < count) {
    chunks.push({
      file: file.slice(index * space, (index + 1) * space),
      filename: `${hash}_${index + 1}.${suffix}`,
    });
    index += 1;
  }

  return chunks;
};

class Upload {
  constructor(props) {
    const defaultConfig = {
      url: null, // 上传url
      space: 1024 * 100, // 切片大小
      retryTime: 3, // 重新上传次数
      max: 3, // 请求并发数
      updateProgress: null, // 更新进度
      callback: null, // 上传切片结束回调
    };

    this.config = { ...defaultConfig, ...props };
    this.progress = 0;
    this.total = 0;

    // 初始化数据
    this.init = () => {
      this.progress = 0;
      this.total = 0;
    };
  }

  // 合并切片
  static chunksMerge(options = {}) {
    const {
      hash,
      count,
      name,
      url,
    } = options;

    axios.post(url, {
      hash,
      count,
      name,
    });
  }

  // 开始上传
  async startUpload(file) {
    if (!file) return;

    const self = this;

    self.init();

    self.total = file.size;

    const { hash, suffix } = await changeBuffer(file);

    // 切片
    const chunks = getChunks({
      file,
      hash,
      suffix,
      space: self.config.space,
    });

    // 发起上传请求，控制并发数
    const taskQueue = new TaskQueue({
      max: 4, // 并发数
      retry: 3, // 重试次数
      callback: (result) => {
        if (self.config.callback) {
          self.config.callback({
            result,
            hash,
            count: chunks.length,
          });
        }
      },
    });

    chunks.forEach((chunk) => {
      const form = new FormData();
      form.append('file', chunk.file);
      form.append('filename', chunk.filename);

      const task = () => axios
        .post(self.config.url, form)
        .then((res) => {
          self.progress += chunk.file.size;

          if (self.config.updateProgress) {
            self.config.updateProgress({
              progress: self.progress,
              total: self.total,
            });
          }

          return res;
        });

      taskQueue.pushTask(task);
    });
  }
}

export default Upload;