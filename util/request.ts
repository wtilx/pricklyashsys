import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ElMessage, ElLoading } from 'element-plus';

// 定义响应数据格式接口
interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 创建axios实例
const service = axios.create({
  baseURL: 'http://117.72.85.204:8990/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 加载实例
let loadingInstance: ReturnType<typeof ElLoading.service>;

// 请求拦截器
service.interceptors.request.use(
  (config: import('axios').InternalAxiosRequestConfig) => {
    // 显示加载动画
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    // 添加token
        const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    loadingInstance?.close();
    ElMessage.error('请求参数错误');
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    loadingInstance?.close();

    const { code, data, message } = response.data;

    // 处理业务错误
    if (code !== 200) {
      ElMessage.error(message || '操作失败');
      return Promise.reject(new Error(message || 'Error'));
    }

    return data;
  },
  (error: AxiosError) => {
    loadingInstance?.close();

    // 处理网络错误
    if (!error.response) {
      ElMessage.error('网络连接异常，请检查网络');
      return Promise.reject(error);
    }

    // 处理状态码错误
    const status = error.response.status;
    switch (status) {
      case 401:
        ElMessage.error('身份验证失败，请重新登录');
        // 这里可以添加跳转登录页逻辑
        break;
      case 403:
        ElMessage.error('权限不足，无法访问');
        break;
      case 404:
        ElMessage.error('请求资源不存在');
        break;
      case 500:
        ElMessage.error('服务器内部错误');
        break;
      default:
        ElMessage.error(`请求错误: ${status}`);
    }

    return Promise.reject(error);
  }
);

// 封装请求方法
const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config);
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config);
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config);
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config);
  },

  upload<T = any>(url: string, file: File, filename = 'file'): Promise<T> {
    const formData = new FormData();
    formData.append(filename, file);
    return service.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default request;