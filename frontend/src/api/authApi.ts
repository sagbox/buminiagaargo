import axiosClient from './axiosClient'
import type { AuthResponse } from '../types'

export const authApi = {
  register: (data: { email: string; password: string; fullName: string; phone?: string }) =>
    axiosClient.post<AuthResponse>('/api/auth/register', data).then(r => r.data),

  login: (data: { email: string; password: string }) =>
    axiosClient.post<AuthResponse>('/api/auth/login', data).then(r => r.data),

  refresh: (refreshToken: string) =>
    axiosClient.post<AuthResponse>('/api/auth/refresh', { refreshToken }).then(r => r.data),
}
