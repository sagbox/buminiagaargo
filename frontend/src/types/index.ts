// ---- User ----
export interface User {
  userId: string
  email: string
  fullName: string
  role: 'BUYER' | 'ADMIN'
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  userId: string
  email: string
  fullName: string
  role: string
}

// ---- Product ----
export interface ProductImage {
  id: string
  url: string
  isPrimary: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock: number
  unit: string
  isActive: boolean
  categoryId: string | null
  categoryName: string | null
  primaryImageUrl: string | null
  images: ProductImage[]
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// ---- Cart ----
export interface CartItem {
  productId: string
  productSlug: string
  productName: string
  productPrice: number
  productImageUrl: string | null
  unit: string
  quantity: number
}

// ---- Order ----
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface OrderItem {
  productId: string
  productName: string
  productImageUrl: string | null
  productPrice: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  subtotal: number
  shippingCost: number
  totalAmount: number
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  notes: string | null
  items: OrderItem[]
  createdAt: string
}

// ---- Payment ----
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'REFUNDED'

export interface Payment {
  id: string
  orderId: string
  orderNumber: string
  amount: number
  status: PaymentStatus
  snapToken: string | null
  paymentType: string | null
  paidAt: string | null
  expiresAt: string | null
}

// ---- Dashboard ----
export interface DashboardSummary {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  completedOrders: number
  revenueThisMonth: number
  revenueTotal: number
}
