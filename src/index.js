/*
 * @Author: DWP
 * @Date: 2021-10-15 10:16:24
 * @LastEditors: DWP
 * @LastEditTime: 2022-11-12 20:41:28
 */
import Upload from './Upload';

window.onload = () => {
  setInterval(() => {
    document.getElementById('test').innerText = Math.random();
  }, 100);

  const fileInputDOM = document.getElementById('fileInput');

  fileInputDOM.addEventListener('change', () => {
    const file = fileInputDOM.files[0];
    const upload = new Upload({
      url: 'http://localhost:3000/upload',
      updateProgress: (params) => {
        const {
          index, status, progress, size,
        } = params;

        // 总进度
        if (status) {
          const ratio = `${parseInt(progress * 100, 10)}%`;
          document.getElementById('progressRatio').innerText = ratio;
          document.getElementById('progressBg').style.width = ratio;
        }

        // 单个进度
        const ulDom = document.getElementById('progressDetail');
        if (!ulDom.innerHTML) {
          const node = document.createDocumentFragment();
          for (let i = 0; i < size; i++) {
            const li = document.createElement('li');
            li.className = 'progress-item';
            node.appendChild(li);
          }
          ulDom.appendChild(node);
        }

        ulDom.childNodes[index - 1].className = status ? 'progress-item progress-success' : 'progress-item progress-fail';
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
  });
};
