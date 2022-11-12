/*
 * @Author: DWP
 * @Date: 2021-10-14 14:54:12
 * @LastEditors: DWP
 * @LastEditTime: 2021-10-15 15:11:16
 */
import axios from 'axios';
import Qs from 'qs';

const instance = axios.create();

instance.defaults = {
  ...instance.defaults,
  headers: {
    ...instance.defaults.headers,
    'Content-Type': 'multipart-data',
  },
  transformResponse: (data, headers) => {
    const contentType = headers['Content-Type'];

    if (contentType === 'application/x-www-form-urlencoded') return Qs.stringify(data);

    return data;
  },
};

instance.interceptors.response.use((response) => response.data);

export default instance;
