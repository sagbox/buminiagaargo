import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, Leaf } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const totalItems = useCartStore(s => s.totalItems())
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">
              Bumi Niaga <span className="text-primary-600">Agrochem</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Produk
            </Link>
            {isAuthenticated && user?.role === 'ADMIN' && (
              <Link to="/admin" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Dashboard Admin
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-gray-600">Halo, {user?.fullName.split(' ')[0]}</span>
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                  Keluar
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
                  Masuk
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-3">
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileOpen(o => !o)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          <Link to="/products" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Produk</Link>
          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link to="/admin" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Dashboard Admin</Link>
          )}
          {isAuthenticated ? (
            <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="block py-2 text-red-600 w-full text-left">Keluar</button>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Masuk</Link>
              <Link to="/register" className="block py-2 text-primary-600 font-semibold" onClick={() => setMobileOpen(false)}>Daftar</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
