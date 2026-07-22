import http from './http';
import { Category, Document, DocListResp, StatsData, DownloadLog } from '../types';

// ─── 分类 ────────────────────────────────────────
export const getCategories  = () => http.get<any, { code: number; data: Category[] }>('/categories');
export const createCategory = (data: Partial<Category>) => http.post('/categories', data);
export const updateCategory = (id: number, data: Partial<Category>) => http.put(`/categories/${id}`, data);
export const deleteCategory = (id: number) => http.delete(`/categories/${id}`);
export const sortCategories = (orders: {id:number;sort_order:number}[]) =>
  http.patch('/categories/sort', { orders });

// ─── 文档 ────────────────────────────────────────
export const getDocs     = (params: Record<string, any>) =>
  http.get<any, { code: number; data: DocListResp }>('/documents', { params });
export const getDoc      = (id: number) => http.get(`/documents/${id}`);
export const getTopDocs  = () => http.get('/documents/top');
export const getRecentDocs = () => http.get('/documents/recent');
export const getTrashDocs  = () => http.get('/documents/trash');

export const uploadDoc   = (formData: FormData) =>
  http.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateDoc   = (id: number, data: Partial<Document>) => http.put(`/documents/${id}`, data);
export const deleteDoc   = (id: number) => http.delete(`/documents/${id}`);
export const restoreDoc  = (id: number) => http.post(`/documents/${id}/restore`);
export const permanentDeleteDoc = (id: number) => http.delete(`/documents/${id}/permanent`);
export const toggleTop   = (id: number) => http.patch(`/documents/${id}/top`);
export const getDocLogs  = (id: number) => http.get(`/documents/${id}/logs`);

export const downloadUrl = (id: number) => `/api/documents/${id}/download`;
export const previewUrl  = (id: number) => `/api/documents/${id}/preview`;

// ─── 统计 ────────────────────────────────────────
export const getStats = () => http.get<any, { code: number; data: StatsData }>('/stats');
export const getDownloadLogs = (params?: Record<string,any>) =>
  http.get<any, { code: number; data: { total:number; list: DownloadLog[] } }>('/stats/download-logs', { params });

// ─── 认证 ────────────────────────────────────────
export const login          = (password: string) =>
  http.post('/auth/login', { password });
export const changePassword = (oldPassword: string, newPassword: string) =>
  http.post('/auth/change-password', { oldPassword, newPassword });
