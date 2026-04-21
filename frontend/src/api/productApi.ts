import axiosClient from './axiosClient'
import type { Category, Page, Product } from '../types'

export const productApi = {
  list: (params?: { categoryId?: string; search?: string; page?: number; size?: number }) =>
    axiosClient.get<Page<Product>>('/api/products', { params }).then(r => r.data),

  getBySlug: (slug: string) =>
    axiosClient.get<Product>(`/api/products/${slug}`).then(r => r.data),

  listCategories: () =>
    axiosClient.get<Category[]>('/api/categories').then(r => r.data),

  // Admin
  adminList: (params?: { search?: string; page?: number; size?: number }) =>
    axiosClient.get<Page<Product>>('/api/admin/products', { params }).then(r => r.data),

  create: (data: object) =>
    axiosClient.post<Product>('/api/admin/products', data).then(r => r.data),

  update: (id: string, data: object) =>
    axiosClient.put<Product>(`/api/admin/products/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    axiosClient.delete(`/api/admin/products/${id}`),

  uploadImage: (id: string, file: File, isPrimary = false) => {
    const form = new FormData()
    form.append('file', file)
    form.append('isPrimary', String(isPrimary))
    return axiosClient.post<Product>(`/api/admin/products/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },

  deleteImage: (productId: string, imageId: string) =>
    axiosClient.delete(`/api/admin/products/${productId}/images/${imageId}`),

  createCategory: (data: { name: string; description?: string }) =>
    axiosClient.post<Category>('/api/admin/categories', data).then(r => r.data),
}
