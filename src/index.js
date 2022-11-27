/*
 * @Author: DWP
 * @Date: 2021-10-15 10:16:24
 * @LastEditors: DWP
 * @LastEditTime: 2022-11-27 20:53:31
 */
import Upload, { changeBuffer } from './Upload';
import axios from './axios';

window.onload = () => {
  const btnSuspension = document.getElementById('supspension');
  const btnContinue = document.getElementById('continue');
  const fileInputDOM = document.getElementById('fileInput');
  let upload;

  const successProgess = [];

  // 暂停
  btnSuspension.addEventListener('click', () => {
    upload.pause();
  });

  // 继续
  btnContinue.addEventListener('click', () => {
    upload.continue();
  });

  setInterval(() => {
    document.getElementById('test').innerText = Math.random();
  }, 100);

  // 开始上传
  const startUpload = (file, hash, ignoreFileList = []) => {
    const space = 1024 * 1024;
    const count = Math.ceil(file.size / space);
    // 单个进度
    const ulDom = document.getElementById('progressDetail');
    if (!ulDom.innerHTML) {
      const node = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const li = document.createElement('li');
        li.className = 'progress-item';
        node.appendChild(li);
      }
      ulDom.appendChild(node);
    }

    upload = new Upload({
      url: 'http://localhost:3000/upload',
      hash,
      space,
      ignoreFileList,
      updateProgress: (params) => {
        const {
          index, status, progress,
        } = params;

        // 总进度
        if (status) {
          const ratio = `${parseInt(progress * 100, 10)}%`;
          document.getElementById('progressRatio').innerText = ratio;
          document.getElementById('progressBg').style.width = ratio;
        }

        ulDom.childNodes[index - 1].className = status ? 'progress-item progress-success' : 'progress-item progress-fail';

        if (status) {
          successProgess.push(index);
        }
      },
      callback: (params) => {
        Upload.chunksMerge({
          hash: params.hash,
          count: params.count,
          name: file.name,
          url: 'http://localhost:3000/upload_merge',
        });
      },
    });
    upload.startUpload(file);
  };

  // 校验文件上传情况
  const checkUploadedFile = async (hash, fileName) => {
    const { fileList, isExist } = await axios.get(`http://localhost:3000/upload_already?hash=${hash}&fileName=${fileName}`);

    if (isExist) {
      document.getElementById('progressRatio').innerText = '100%';
      document.getElementById('progressBg').style.width = '100%';
      return Promise.reject();
    }

    return Promise.resolve(fileList);
  };

  fileInputDOM.addEventListener('change', () => {
    const file = fileInputDOM.files[0];
    changeBuffer(file).then((res) => {
      const { hash } = res;

      checkUploadedFile(hash, file.name).then((fileList) => {
        startUpload(file, hash, fileList);
      });
    });
  });
};
