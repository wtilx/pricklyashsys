import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例
const service = axios.create({
  baseURL: "http://117.72.85.204:8990/",
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从localStorage直接获取token，而非通过useUserStore
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data;
    if (code === 200) {
      return data;
    } else {
      ElMessage.error(message || '操作失败');
      return Promise.reject(new Error(message || 'Error'));
    }
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const userStore = useUserStore();
      userStore.logout();
      ElMessage.error('登录已过期，请重新登录');
    } else {
      ElMessage.error(error.message || '网络异常');
    }
    return Promise.reject(error);
  }
);

// 导出请求方法
export const request = {
  get: (url, params = {}) => service.get(url, { params }),
  post: (url, data = {}) => service.post(url, data),
  put: (url, data = {}) => service.put(url, data),
  delete: (url, params = {}) => service.delete(url, { params }),
  upload: (url, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return service.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// 广告相关接口
export const advertisementApi = {
  // 获取广告列表
  getList: () => request.get('/advertisements'),
  // 获取广告详情
  getDetail: (id) => request.get(`/advertisements/${id}`),
  // 创建广告
  create: (data) => request.post('/advertisements', data),
  // 更新广告
  update: (id, data) => request.put(`/advertisements/${id}`, data),
  // 删除广告
  delete: (id) => request.delete(`/advertisements/${id}`),
  // 上传广告图片
  uploadImage: (file) => request.upload('/upload', file)
};

export default request;