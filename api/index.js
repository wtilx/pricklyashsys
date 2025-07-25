import request from '../util/request';

// 广告相关接口
export const advertisementApi = {
  getList: (params) => request.get('/advertisements', { params }),
  getDetail: (id) => request.get(`/advertisements/${id}`),
  create: (data) => request.post('/advertisements', data),
  update: (id, data) => request.put(`/advertisements/${id}`, data),
  delete: (id) => request.delete(`/advertisements/${id}`),
  uploadImage: (file) => request.upload('/upload', file)
};

// 课程相关接口
export const courseApi = {
  getList: (params) => request.get('/courses', { params }),
  getDetail: (id) => request.get(`/courses/${id}`),
  create: (data) => request.post('/courses', data),
  update: (id, data) => request.put(`/courses/${id}`, data),
  delete: (id) => request.delete(`/courses/${id}`),
};