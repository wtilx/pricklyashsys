import request from '../../util/request';

// 账号密码登录
export const userApi = {
  //账号密码登录 /api/front/login/pepper
  login: (data) => request.post('/api/front/login/pepper', data),
  //获取登录凭证  /api/front/user
  getPepper: () => request.get(' /api/front/user'),
}

// 文件上传 API
export const uploadApi = {
  // 上传单个文件
  uploadFile(file, onProgress) {
    const formData = new FormData()
    formData.append('model', '')
    formData.append('multipart', file)
    formData.append('pid', '')

    return request.post('/api/front/user/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    })
  },
}

// 项目相关 API
export const projectApi = {
  // 创建项目列表
  createProjects(data) {
    return request.post('/api/front/project/create', data)
  },
  // 后台分页列表 /api/front/project/adminList
  getAdvertisementAdminList(params) {
    return request.get(`/api/front/project/adminList?limit=${params.limit}&page=${params.page}&auditStatus=${params.auditStatus}&title=${params.title}&status=${params.status}`)
  },
  // 分页列表
  getProjects(params) {
    return request.get(`/api/front/project/list?limit=${params.limit}&page=${params.page}`)
  },
  //我发布的项目列表 
  getmyProjects(params) {
    return request.get(`/api/front/project/my/list?limit=${params.limit}&page=${params.page}`)
  },
  //我的报名列表 /api/front/project/enrollment/my
  getmyEnrollment(params) {
    return request.get(`/api/front/project/enrollment/my?limit=${params.limit}&page=${params.page}`)
  },
  //项目报名 /api/front/project/enroll
  enrollProject(data) {
    return request.post(`/api/front/project/enroll`, data)
  },
  //删除项目 /api/front/project/delete/{id}
  deleteProject(id) {
    return request.delete(`/api/front/project/delete/${id}`)
  },
  // 编辑项目 /api/front/project/update/{id}
  updateProject(id, data) {
    return request.post(`/api/front/project/update/${id}`, data)
  },
  //根据审核状态获取我的项目列表 /api/front/project/my/list/audit/{auditStatus}
  getmyProjectAudit(params) {
    return request.get(`/api/front/project/my/list/audit/${params.auditStatus}?limit=${params.limit}&page=${params.page}`)
  },
  // 项目统计/api/front/project/statistics
  getProjectStatistics(data) {
    return request.post(`/api/front/project/statistics`, data)
  },
  // 项目审核 /api/front/project/audit/{id}
  auditProject(id, data) {
    return request.post(`/api/front/project/audit/${id}?auditStatus=${data.auditStatus}`)
  },
  // /api/front/project/user/ranking
  getProjectRanking(params) {
    return request.get(`/api/front/project/user/ranking?limit=${params.limit}&page=${params.page}`)
  },
  // /api/front/project/detail/{id}
  getProjectDetail(id) {
    return request.get(`/api/front/project/detail?id=${id}`)
  }
}
// 活动相关 API
export const eventApi = {
  //分页列表 /api/front/activity/list
  getEventList(params) {
    return request.get(`/api/front/activity/list?limit=${params.limit}&page=${params.page}`)
  },
  // 获取我的活动列表
  getEvents(params) {
    return request.get(`/api/front/activity/my/list?limit=${params.limit}&page=${params.page}`)
  },
  // 根据审核状态获取我的活动列表
  getEventsAudit(params) {
    return request.get(`/api/front/activity/my/list/audit/${params.auditStatus}?limit=${params.limit}&page=${params.page}`)
  },
  // 创建活动
  createEvent(data) {
    return request.post('/api/front/activity/create', data)
  },
  // 更新活动
  updateEvent(id, data) {
    return request.post(`/api/front/activity/update/${id}`, data)
  },
  // 删除活动
  deleteEvent(id) {
    return request.delete(`/api/front/activity/delete/${id}`)
  },
  // 报名活动
  listenrollEvent() {
    return request.get(`/api/front/activity/enrollment/list`)
  },
  // 我的报名活动
  myenrollEvent() {
    return request.get(`/api/front/activity/enrollment/my`)
  },
  //活动详情 /api/front/activity/detail/{id}
  getEventdetail(id) {
    return request.get(`/api/front/activity/detail?id=${id}`)
  },
  // 活动报名 /api/front/activity/enrollment
  enrollEvent(data) {
    return request.post(`/api/front/activity/enroll`, data)
  },
  // /api/front/activity/audit/{id}
  auditEvent(id, data) {
    return request.post(`/api/front/activity/audit/${id}?auditStatus=${data.auditStatus}`)
  }
}
// 话题相关 API
export const topicApi = {
  // 获取话题列表 /api/front/topic/list
  getTopics(uid) {
    return request.get(`/api/front/topic/list/${uid}`)
  },
  // 分页话题列表 /api/front/topic/list/page
  getTopicPage(params) {
    return request.get(`/api/front/topic/list?limit=${params.limit}&page=${params.page}`)
  },
  // 创建话题
  createTopic(data) {
    return request.post('/api/front/topic/create', data)
  },
  // 更新话题
  updateTopic(id) {
    return request.post(`/api/front/topic/update/${id}`)
  },
  // 删除话题
  deleteTopic(id) {
    return request.delete(`/api/front/topic/delete/${id}`)
  },
  // 详情
  infoTopic(params) {
    return request.get(`/api/front/topic/info?id=${params.id}`)
  },
  // 评论话题
  commTopic(data) {
    return request.post(`/api/front/topic/comment`, data)
  },
  // 点赞评论
  likecomm(commentId) {
    return request.post(`/api/front/topic/comment/like/${commentId}`)
  },
  // 取消点赞评论
  unlikecomm(commentId) {
    return request.post(`/api/front/topic/comment/unlike/${commentId}`)
  },
  // /api/front/topic/like/{id}
  likeTopic(id) {
    return request.post(`/api/front/topic/like/${id}`)
  },
  // /api/front/topic/unlike/{id}
  unlikeTopic(id) {
    return request.post(`/api/front/topic/unlike/${id}`)
  },

}
// 课程相关 API
export const courseApi = {
  // 获取课程列表
  getCourses(params) {
    return request.get(`/api/front/course/list?type=${params.type}&limit=${params.limit}&page=${params.page}`)
  },
  //创建课程 /api/front/course/create
  createCourse(data) {
    return request.post(`/api/front/course/create`, data)
  },
  // 删除课程 /api/front/course/delete/{id}
  deleteCourse(id) {
    return request.delete(`/api/front/course/delete/${id}`)
  },
  //根据审核状态获取我的课程列表 /api/front/course/my/list/audit/{auditStatus}
  getmyCourseAudit(params) {
    return request.get(`/api/front/course/my/list/audit/${params.auditStatus}?limit=${params.limit}&page=${params.page}`)
  },
  //我创建的课程列表 /api/front/course/my/list
  getmyCourse() {
    return request.get(`/api/front/course/my/list`)
  },
  // 更新课程 /api/front/course/update/{id}
  updateCourse(id, data) {
    return request.post(`/api/front/course/update/${id}`, data)
  },
  // 审核课程 /api/front/course/audit/{id}
  auditCourse(id, data) {
    return request.post(`/api/front/course/audit/${id}?auditStatus=${data.auditStatus}`)
  },
  //课程详情 /api/front/course/detail
  getCourseDetail(id) {
    return request.get(`/api/front/course/detail?id=${id}`)
  },

}
// 广告相关 API
export const advertisementApi = {
  // 获取广告列表
  getAdvertisements(params) {
    return request.get(`/api/front/advertisement/list?limit=${params.limit}&page=${params.page}`)
  },

  //广告位详情 /api/front/advertisement/detail/{id}
  getAdvertisementDetail(id) {
    return request.get(`/api/front/advertisement/detail/${id}`)
  },
  // 创建广告
  createAdvertisement(data) {
    return request.post('/api/front/advertisement/create', data)
  },
  // 更新广告
  updateAdvertisement(id, data) {
    return request.post(`/api/front/advertisement/update/${id}`, data)
  },
  // 删除广告/api/front/advertisement/delete/{id}
  deleteAdvertisement(id) {
    return request.delete(`/api/front/advertisement/delete/${id}`)
  }

}