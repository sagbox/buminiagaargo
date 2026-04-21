import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { formatRupiah } from '../../utils/format'

const SHIPPING_COST = 15000

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore()
  const totalPrice = useCartStore(s => s.totalPrice())
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Keranjang kosong</h2>
        <p className="text-gray-400 mb-6">Belum ada produk di keranjang Anda</p>
        <Link to="/products" className="btn-primary">Mulai Belanja</Link>
      </div>
    )
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    navigate('/checkout')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.productId} className="card p-4 flex gap-4">
              {item.productImageUrl ? (
                <img src={item.productImageUrl} alt={item.productName} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{item.productName}</h3>
                <p className="text-primary-700 font-semibold text-sm">{formatRupiah(item.productPrice)}</p>
                {item.unit && <p className="text-xs text-gray-400">per {item.unit}</p>}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button onClick={() => removeItem(item.productId)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden text-sm">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100">−</button>
                  <span className="px-3 py-1 border-x border-gray-300 font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100">+</button>
                </div>
                <p className="text-sm font-semibold text-gray-700">{formatRupiah(item.productPrice * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatRupiah(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Ongkos Kirim</span>
              <span>{formatRupiah(SHIPPING_COST)}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span className="text-primary-700">{formatRupiah(totalPrice + SHIPPING_COST)}</span>
            </div>
          </div>
          <button onClick={handleCheckout} className="btn-primary w-full">
            {isAuthenticated ? 'Lanjut ke Checkout' : 'Masuk untuk Checkout'}
          </button>
        </div>
      </div>
    </div>
  )
}
