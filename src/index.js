/*
 * @Author: DWP
 * @Date: 2021-10-15 10:16:24
 * @LastEditors: DWP
 * @LastEditTime: 2021-10-18 17:49:59
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
        const ratio = `${parseInt((params.progress / params.total).toFixed(2) * 100, 10)}%`;
        document.getElementById('progressRatio').innerText = ratio;
        document.getElementById('progressBg').style.width = ratio;
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
