import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

export const getGrades = () => api.get('/grades').then(r => r.data);
export const getSections = (gradeId) => api.get(`/grades/${gradeId}/sections`).then(r => r.data);
export const getStudents = (sectionId) => api.get(`/students/section/${sectionId}`).then(r => r.data);
export const getAttendance = (sectionId, date) => api.get(`/attendance/${sectionId}/${date}`).then(r => r.data);
export const saveAttendance = (payload) => api.post('/attendance', payload).then(r => r.data);
export const markAllAttendance = (payload) => api.patch('/attendance/mark-all', payload).then(r => r.data);
export const getDailyReport = (date) => api.get(`/reports/daily/${date}`).then(r => r.data);
export const getDailyStats = (date) => api.get(`/reports/stats/${date}`).then(r => r.data);
export const checkHealth = () => api.get('/health').then(r => r.data).catch(() => null);

export default api;
