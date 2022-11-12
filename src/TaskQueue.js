/*
 * @Author: DWP
 * @Date: 2021-10-15 18:11:58
 * @LastEditors: DWP
 * @LastEditTime: 2021-10-18 18:00:11
 */
class TaskQueue {
  constructor(props = {}) {
    this.max = props.max || 4; // 最大并发数
    this.retry = props.retry || 3; // 最大重试次数
    this.running = 0; // 正在请求数
    this.queue = []; // 任务请求队列
    this.retryQueue = []; // 重试任务队列
    this.retryRunning = []; // 当前正在重试的任务队列
    this.results = []; // 请求结果
    this.callback = props.callback; // 结束回调
  }

  // 添加任务
  pushTask(task) {
    this.queue.push({
      key: `${this.queue.length + 1}`,
      task,
    });
    this.next();
  }

  // 执行任务
  next() {
    while (this.running < this.max && this.queue.length) {
      const { task, key } = this.queue.shift();

      // 占用通道
      this.running++;

      task().then((res) => {
        this.results.push({ ...res });
      }).catch(() => {
        if (!this.retryQueue[key]) {
          this.retryQueue[key] = {
            time: 0,
            task,
          };
        }
        // 累加重试次数
        this.retryQueue[key].time++;
      }).finally(() => {
        // 释放通道
        this.running--;
        this.next();
      });
    }

    // 全部任务执行完后，执行重试的任务
    if (this.running === 0) {
      this.retryNext();
    }
  }

  retryNext() {
    while (this.running < this.max && Object.keys(this.retryQueue).length) {
      const { task } = Object.values(this.retryQueue)[0];
      const key = Object.keys(this.retryQueue)[0];

      // 当前任务正在重试，则不需要再次对该任务重试
      if (this.retryRunning.includes(key)) return;
      this.retryRunning.push(key);

      // 占用通道
      this.running++;

      task().then((res) => {
        // 成功后，重试队列中去掉该任务
        delete this.retryQueue[key];
        this.results.push({ ...res });
      }).catch((err) => {
        // 累加重试次数
        this.retryQueue[key].time++;

        // 超过最大重试次数，则结束该任务
        if (this.retryQueue[key].time > this.retry) {
          delete this.retryQueue[key];
          this.results.push({ ...err });
        }
      }).finally(() => {
        // 释放通道
        this.running--;

        // 重试队列中去掉本任务
        const index = this.retryRunning.indexOf(key);
        this.retryRunning.splice(index, 1);

        this.retryNext();
      });
    }

    // 全部请求完后，执行回调函数
    if (typeof this.callback === 'function' && this.running === 0) {
      this.callback(this.results);
    }
  }
}

export default TaskQueue;
