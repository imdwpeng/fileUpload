/*
 * @Author: DWP
 * @Date: 2021-10-15 10:34:51
 * @LastEditors: DWP
 * @LastEditTime: 2022-11-25 21:47:12
 */
import axios from './axios';
import TaskQueue from './TaskQueue';

export const changeBuffer = (file) => new Promise((resolve) => {
  // 创建一个worker对象
  const work = new Worker('hash.js');

  // 向子线程发送消息，并传入文件对象和切片大小，开始计算分割切片
  work.postMessage({ file });

  // 子线程计算完成后，会将切片返回主线程
  work.onmessage = (e) => {
    resolve({ ...e.data });
  };
});

const getChunks = (params) => new Promise((resolve) => {
  const work = new Worker('chunks.js');
  work.postMessage(params);
  work.onmessage = (e) => {
    resolve(e.data);
  };
});

class Upload {
  constructor(props) {
    const defaultConfig = {
      url: null, // 上传url
      ignoreFileList: [], // 忽略已上传的切片
      space: 1024 * 100, // 切片大小
      retryTime: 3, // 重新上传次数
      max: 3, // 请求并发数
      updateProgress: null, // 更新进度
      callback: null, // 上传切片结束回调
    };

    this.config = { ...defaultConfig, ...props };
    this.successCount = 0;
    this.successProgress = [];
    this.total = 0;
    this.taskQueue = null;

    // 初始化数据
    this.init = () => {
      this.successCount = 0;
      this.successProgress = [];
      this.total = 0;
      this.taskQueue = null;
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
    const chunks = await getChunks({
      file,
      hash,
      suffix,
      space: self.config.space,
    });

    // 发起上传请求，控制并发数
    self.taskQueue = new TaskQueue({
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

    chunks.forEach((chunk, index) => {
      // 过滤掉已经上传的片段
      if (self.config.ignoreFileList.includes(index)) {
        self.successCount += 1;
        self.successProgress.push(index);
        if (self.config.updateProgress) {
          self.config.updateProgress({
            index: index + 1,
            status: true,
            progress: Number((self.successCount / chunks.length).toFixed(2)),
            size: chunks.length,
          });
        }
        return;
      }

      const form = new FormData();
      form.append('file', chunk.file);
      form.append('filename', chunk.filename);

      const task = () => axios
        .post(self.config.url, form)
        .then((res) => {
          self.successCount += 1;
          self.successProgress.push(index);
          if (self.config.updateProgress) {
            self.config.updateProgress({
              index: index + 1,
              status: true,
              progress: Number((self.successCount / chunks.length).toFixed(2)),
              size: chunks.length,
            });
          }

          return res;
        }).catch(() => {
          if (self.config.updateProgress) {
            self.config.updateProgress({
              index: index + 1,
              status: false,
              progress: Number((self.successCount / chunks.length).toFixed(2)),
              size: chunks.length,
            });
          }

          return Promise.reject();
        });

      self.taskQueue.pushTask(task);
    });
  }

  // 暂停
  pause() {
    this.taskQueue.pause();
  }

  // 继续
  continue() {
    this.taskQueue.continue();
  }
}

export default Upload;
