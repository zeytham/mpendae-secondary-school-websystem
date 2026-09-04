// ===========================
// Mpendae School — TypeScript Types
// ===========================

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Student {
  id: string;
  regNumber: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  form: Form;
  stream?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  address?: string;
  photo?: string;
  status: StudentStatus;
  enrolledAt: string;
  createdAt: string;
}

export interface Teacher {
  id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  email: string;
  phone: string;
  department: string;
  subjects: string[];
  qualification: string;
  photo?: string;
  status: string;
  joinedAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  views: number;
  createdAt: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  imageUrl: string;
  publicId: string;
  album: string;
  description?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate?: string;
  category: string;
  status: 'UPCOMING' | 'ONGOING' | 'PAST';
  createdAt: string;
}

export interface Admission {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  primarySchool: string;
  kcpeScore: number;
  combination?: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  referenceNo: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    regNumber: string;
    form: string;
  };
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
}

export interface Timetable {
  id: string;
  title: string;
  form: Form;
  stream?: string;
  term: string;
  academicYear: string;
  fileUrl: string;
  publicId: string;
  fileType: 'PDF' | 'IMAGE';
  createdAt: string;
}

export interface SchoolSettings {
  id: string;
  schoolName: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  about?: string;
  founded: string;
  principal: string;
  nectaPassRate?: string;
  artsReelUrl?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  whatsapp?: string;
}

export interface Milestone {
  id: string;
  year: string;
  event: string;
  order: number;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface DashboardStats {
  students: number;
  teachers: number;
  pendingAdmissions: number;
  upcomingEvents: number;
  recentNews: Pick<NewsArticle, 'id' | 'title' | 'publishedAt' | 'category'>[];
  recentAdmissions: Pick<Admission, 'id' | 'firstName' | 'lastName' | 'status' | 'referenceNo' | 'createdAt'>[];
}

export type Form = 'FORM_1' | 'FORM_2' | 'FORM_3' | 'FORM_4' | 'FORM_5' | 'FORM_6';
export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED';

export const FORM_LABELS: Record<Form, string> = {
  FORM_1: 'Form I',
  FORM_2: 'Form II',
  FORM_3: 'Form III',
  FORM_4: 'Form IV',
  FORM_5: 'Form V',
  FORM_6: 'Form VI',
};

export const DEPARTMENTS = [
  'Sayansi', 'Hisabati', 'Lugha', 'Biashara', 'Sanaa na Michezo', 'Ustawi wa Jamii',
];

export const NEWS_CATEGORIES = [
  'Matokeo', 'Matangazo', 'Maendeleo', 'Michezo', 'Sherehe', 'Habari', 'Elimu',
];

export const EVENT_CATEGORIES = [
  'Sherehe', 'Mitihani', 'Michezo', 'Mkutano', 'Ziara', 'Mengine',
];
