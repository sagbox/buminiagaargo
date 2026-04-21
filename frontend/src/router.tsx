import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AdminLayout from './components/layout/AdminLayout'

// Pages
import HomePage from './pages/public/HomePage'
import ProductListPage from './pages/public/ProductListPage'
import ProductDetailPage from './pages/public/ProductDetailPage'
import CartPage from './pages/public/CartPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import CheckoutPage from './pages/buyer/CheckoutPage'
import PaymentPage from './pages/buyer/PaymentPage'
import OrderHistoryPage from './pages/buyer/OrderHistoryPage'
import OrderDetailPage from './pages/buyer/OrderDetailPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductListPage from './pages/admin/AdminProductListPage'
import AdminProductFormPage from './pages/admin/AdminProductFormPage'
import AdminOrderListPage from './pages/admin/AdminOrderListPage'
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage'

// Layout wrapper for public pages (with Navbar + Footer)
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

// Redirect to login if not authenticated
function PrivateRoute() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

// Redirect to home if not admin
function AdminRoute() {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductListPage /> },
      { path: '/products/:slug', element: <ProductDetailPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },

      // Buyer protected routes
      {
        element: <PrivateRoute />,
        children: [
          { path: '/checkout', element: <CheckoutPage /> },
          { path: '/payment/:orderId', element: <PaymentPage /> },
          { path: '/orders', element: <OrderHistoryPage /> },
          { path: '/orders/:id', element: <OrderDetailPage /> },
        ],
      },
    ],
  },

  // Admin routes (separate layout, no public navbar/footer)
  {
    element: <AdminRoute />,
    children: [
      { path: '/admin', element: <AdminDashboardPage /> },
      { path: '/admin/products', element: <AdminProductListPage /> },
      { path: '/admin/products/:id', element: <AdminProductFormPage /> },
      { path: '/admin/orders', element: <AdminOrderListPage /> },
      { path: '/admin/orders/:id', element: <AdminOrderDetailPage /> },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
])
