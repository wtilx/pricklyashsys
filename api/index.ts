import request from '../util/request';

// /api/front/advertisement/create
export const createAdvertisement = (data: any) => request.post('/api/front/advertisement/create', data);
// /api/front/advertisement/delete/{id}
export const deleteAdvertisement = (id: number) => request.delete(`/api/front/advertisement/delete/${id}`);

// 课程
//课程报名列表 /api/front/course/enrollment/list
export const getCourseEnrollmentList = () => request.get('/api/front/course/enrollment/list');