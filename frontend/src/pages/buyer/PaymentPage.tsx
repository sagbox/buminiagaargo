import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { paymentApi } from '../../api/paymentApi'
import { useAuthStore } from '../../store/authStore'
import type { Order } from '../../types'
import { formatRupiah } from '../../utils/format'
import Spinner from '../../components/common/Spinner'

// Midtrans Snap types
declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (result: unknown) => void
        onPending: (result: unknown) => void
        onError: (result: unknown) => void
        onClose: () => void
      }) => void
    }
  }
}

export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const order = (location.state as { order?: Order })?.order

  useEffect(() => {
    if (!orderId || !order) return

    // Load Midtrans Snap script
    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '')
    script.onload = () => initPayment()
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [orderId])

  const initPayment = async () => {
    try {
      const payment = await paymentApi.create({
        orderId: orderId!,
        orderNumber: order!.orderNumber,
        amount: order!.totalAmount,
        buyerName: user?.fullName || '',
      })

      setLoading(false)

      if (payment.snapToken) {
        window.snap.pay(payment.snapToken, {
          onSuccess: () => navigate(`/orders/${orderId}`, { state: { paymentSuccess: true } }),
          onPending: () => navigate(`/orders/${orderId}`),
          onError: () => navigate(`/orders/${orderId}`),
          onClose: () => navigate(`/orders/${orderId}`),
        })
      }
    } catch {
      setError('Gagal memuat halaman pembayaran')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Spinner className="w-12 h-12" />
        <p className="text-gray-500">Memuat halaman pembayaran...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate('/orders')} className="btn-outline">Lihat Pesanan</button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="card p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Menunggu Pembayaran</h2>
        <p className="text-gray-500 text-sm mb-4">Pesanan #{order?.orderNumber}</p>
        <p className="text-2xl font-bold text-primary-700 mb-6">{formatRupiah(order?.totalAmount || 0)}</p>
        <p className="text-sm text-gray-400">Jika popup pembayaran tidak muncul, klik tombol di bawah</p>
        <button onClick={initPayment} className="btn-primary mt-4 w-full">Buka Pembayaran</button>
      </div>
    </div>
  )
}
