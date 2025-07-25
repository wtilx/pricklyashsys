import request from '../util/request';

// 认证相关接口
export const authApi = {
  login: (credentials) => request.post('/auth/login', credentials),
  logout: () => request.post('/auth/logout'),
  refreshToken: () => request.post('/auth/refresh-token'),
  getCaptcha: () => request.get('/auth/captcha')
};

// 用户相关接口
export const userApi = {
  getCurrentUser: () => request.get('/users/current'),
  getUserList: (params) => request.get('/users', { params }),
  getUserDetail: (id) => request.get(`/users/${id}`),
  createUser: (data) => request.post('/users', data),
  updateUser: (id, data) => request.put(`/users/${id}`, data),
  deleteUser: (id) => request.delete(`/users/${id}`),
  updatePassword: (data) => request.post('/users/password', data)
};

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
  getCategories: () => request.get('/courses/categories')
};

// 项目相关接口
export const projectApi = {
  getList: (params) => request.get('/projects', { params }),
  getDetail: (id) => request.get(`/projects/${id}`),
  create: (data) => request.post('/projects', data),
  update: (id, data) => request.put(`/projects/${id}`, data),
  delete: (id) => request.delete(`/projects/${id}`),
  getStatistics: () => request.get('/projects/statistics')
};

// 活动相关接口
export const activityApi = {
  getList: (params) => request.get('/activities', { params }),
  getDetail: (id) => request.get(`/activities/${id}`),
  create: (data) => request.post('/activities', data),
  update: (id, data) => request.put(`/activities/${id}`, data),
  delete: (id) => request.delete(`/activities/${id}`),
  joinActivity: (id) => request.post(`/activities/${id}/join`)
};

// 内容相关接口
export const contentApi = {
  getArticles: (params) => request.get('/content/articles', { params }),
  getArticleDetail: (id) => request.get(`/content/articles/${id}`),
  createArticle: (data) => request.post('/content/articles', data),
  updateArticle: (id, data) => request.put(`/content/articles/${id}`, data),
  deleteArticle: (id) => request.delete(`/content/articles/${id}`),
  getCategories: () => request.get('/content/categories')
};

// 交互相关接口
export const interactionApi = {
  getComments: (params) => request.get('/interactions/comments', { params }),
  createComment: (data) => request.post('/interactions/comments', data),
  deleteComment: (id) => request.delete(`/interactions/comments/${id}`),
  getLikes: (params) => request.get('/interactions/likes', { params }),
  likeContent: (data) => request.post('/interactions/likes', data),
  cancelLike: (id) => request.delete(`/interactions/likes/${id}`)
};

// 统计相关接口
export const statisticsApi = {
  getDashboardData: () => request.get('/statistics/dashboard'),
  getUserStatistics: () => request.get('/statistics/users'),
  getContentStatistics: () => request.get('/statistics/content'),
  getInteractionStatistics: () => request.get('/statistics/interactions')
};