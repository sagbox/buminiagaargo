import axiosClient from './axiosClient'
import type { Payment } from '../types'

export const paymentApi = {
  create: (data: {
    orderId: string
    orderNumber: string
    amount: number
    buyerName: string
    buyerEmail?: string
    buyerPhone?: string
  }) => axiosClient.post<Payment>('/api/payments', data).then(r => r.data),

  getByOrderId: (orderId: string) =>
    axiosClient.get<Payment>(`/api/payments/${orderId}`).then(r => r.data),
}
