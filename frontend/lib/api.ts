import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token — check localStorage (remember me) then sessionStorage (session only)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mpendae_token') ?? sessionStorage.getItem('mpendae_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAdminPage = window.location.pathname.startsWith('/admin');
      if (isAdminPage) {
        localStorage.removeItem('mpendae_token');
        localStorage.removeItem('mpendae_user');
        sessionStorage.removeItem('mpendae_token');
        sessionStorage.removeItem('mpendae_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===========================
// AUTH
// ===========================
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),
  createAdmin: (data: { email: string; name: string; password: string }) =>
    api.post('/auth/create-admin', data),
};

// ===========================
// SETTINGS
// ===========================
export const settingsApi = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data: Record<string, unknown>) => api.put('/settings', data),
  uploadLogo: (formData: FormData) =>
    api.post('/settings/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  contact: (data: { name: string; email: string; subject: string; message: string }) =>
    api.post('/settings/contact', data),
  getDashboard: () => api.get('/settings/dashboard'),
};

// ===========================
// STUDENTS
// ===========================
export const studentsApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/students', { params }),
  getOne: (id: string) => api.get(`/students/${id}`),
  getStats: () => api.get('/students/stats'),
  create: (formData: FormData) =>
    api.post('/students', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, formData: FormData) =>
    api.put(`/students/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/students/${id}`),
};

// ===========================
// TEACHERS
// ===========================
export const teachersApi = {
  getAll: (params?: Record<string, string>) => api.get('/teachers', { params }),
  getOne: (id: string) => api.get(`/teachers/${id}`),
  create: (formData: FormData) =>
    api.post('/teachers', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, formData: FormData) =>
    api.put(`/teachers/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/teachers/${id}`),
};

// ===========================
// NEWS
// ===========================
export const newsApi = {
  getPublished: (params?: Record<string, string | number>) => api.get('/news', { params }),
  getAll: (params?: Record<string, string | number>) => api.get('/news/admin/all', { params }),
  getBySlug: (slug: string) => api.get(`/news/article/${slug}`),
  create: (formData: FormData) =>
    api.post('/news', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, formData: FormData) =>
    api.put(`/news/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  togglePublish: (id: string) => api.patch(`/news/${id}/publish`),
  delete: (id: string) => api.delete(`/news/${id}`),
};

// ===========================
// GALLERY
// ===========================
export const galleryApi = {
  getAll: (params?: { album?: string }) => api.get('/gallery', { params }),
  getAlbums: () => api.get('/gallery/albums'),
  upload: (formData: FormData) =>
    api.post('/gallery', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/gallery/${id}`),
};

// ===========================
// EVENTS
// ===========================
export const eventsApi = {
  getAll: (params?: { status?: string }) => api.get('/events', { params }),
  getOne: (id: string) => api.get(`/events/${id}`),
  create: (data: Record<string, unknown>) => api.post('/events', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// ===========================
// ADMISSIONS
// ===========================
export const admissionsApi = {
  submit: (data: Record<string, unknown>) => api.post('/admissions', data),
  getAll: (params?: Record<string, string | number>) => api.get('/admissions', { params }),
  getOne: (id: string) => api.get(`/admissions/${id}`),
  getStats: () => api.get('/admissions/stats'),
  updateStatus: (id: string, data: { status: string; notes?: string }) =>
    api.patch(`/admissions/${id}/status`, data),
};

// ===========================
// ATTENDANCE
// ===========================
export const attendanceApi = {
  mark: (data: { records: Array<{ studentId: string; status: string; notes?: string }>; date: string }) =>
    api.post('/attendance/bulk', data),
  getByDate: (params: { date: string; form?: string }) => api.get('/attendance', { params }),
  getStudentAttendance: (studentId: string, params?: { startDate?: string; endDate?: string }) =>
    api.get(`/attendance/student/${studentId}`, { params }),
  getReport: (params?: { form?: string; startDate?: string; endDate?: string }) =>
    api.get('/attendance/report', { params }),
};

// ===========================
// TIMETABLES
// ===========================
export const timetableApi = {
  getAll: (params?: { form?: string }) => api.get('/timetables', { params }),
  getByForm: (form: string) => api.get(`/timetables/form/${form}`),
  upload: (formData: FormData) =>
    api.post('/timetables', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, formData: FormData) =>
    api.put(`/timetables/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/timetables/${id}`),
};

// ===========================
// MILESTONES (Historia Yetu)
// ===========================
export const milestonesApi = {
  getAll: () => api.get('/milestones'),
  create: (data: { year: string; event: string; order?: number }) => api.post('/milestones', data),
  update: (id: string, data: { year?: string; event?: string; order?: number }) => api.put(`/milestones/${id}`, data),
  delete: (id: string) => api.delete(`/milestones/${id}`),
};

const FIELD_LABELS: Record<string, string> = {
  firstName: 'Jina la Kwanza',
  lastName: 'Jina la Ukoo',
  gender: 'Jinsia',
  dateOfBirth: 'Tarehe ya Kuzaliwa',
  primarySchool: 'Shule ya Msingi',
  kcpeScore: 'Alama za PSLE/Matokeo',
  parentName: 'Jina la Mzazi/Mlezi',
  parentPhone: 'Nambari ya Simu ya Mzazi',
  parentEmail: 'Barua Pepe ya Mzazi',
  address: 'Anwani',
  name: 'Jina',
  email: 'Barua Pepe',
  subject: 'Mada',
  message: 'Ujumbe',
};

export function formatApiError(err: unknown, defaultMessage = 'Tatizo limetokea. Jaribu tena.'): string {
  if (!err || typeof err !== 'object') return defaultMessage;
  const resData = (err as { response?: { data?: { error?: string; details?: Array<{ field: string; message: string }> } } })?.response?.data;
  if (!resData) return defaultMessage;

  if (Array.isArray(resData.details) && resData.details.length > 0) {
    const list = resData.details
      .map((d) => {
        const label = FIELD_LABELS[d.field] || d.field;
        return `${label}: ${d.message}`;
      })
      .join('; ');
    return `Tafadhali rekebisha: ${list}`;
  }

  if (resData.error) {
    return resData.error;
  }

  return defaultMessage;
}

export default api;

