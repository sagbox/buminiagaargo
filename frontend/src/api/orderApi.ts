import axiosClient from './axiosClient'
import type { DashboardSummary, Order, Page } from '../types'

export const orderApi = {
  create: (data: {
    items: Array<{ productId: string; productSlug: string; quantity: number }>
    shippingName: string
    shippingPhone: string
    shippingAddress: string
    notes?: string
  }) => axiosClient.post<Order>('/api/orders', data).then(r => r.data),

  list: (params?: { page?: number; size?: number }) =>
    axiosClient.get<Page<Order>>('/api/orders', { params }).then(r => r.data),

  get: (id: string) =>
    axiosClient.get<Order>(`/api/orders/${id}`).then(r => r.data),

  cancel: (id: string) =>
    axiosClient.put<Order>(`/api/orders/${id}/cancel`).then(r => r.data),

  // Admin
  adminList: (params?: { page?: number; size?: number }) =>
    axiosClient.get<Page<Order>>('/api/admin/orders', { params }).then(r => r.data),

  adminGet: (id: string) =>
    axiosClient.get<Order>(`/api/admin/orders/${id}`).then(r => r.data),

  adminUpdateStatus: (id: string, status: string) =>
    axiosClient.put<Order>(`/api/admin/orders/${id}/status`, { status }).then(r => r.data),

  dashboardSummary: () =>
    axiosClient.get<DashboardSummary>('/api/admin/dashboard/summary').then(r => r.data),
}
