import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { orderApi } from '../../api/orderApi'
import { formatRupiah, formatDate } from '../../utils/format'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import Spinner from '../../components/common/Spinner'
import { ChevronLeft } from 'lucide-react'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.get(id!),
    enabled: !!id,
  })

  if (isLoading) return <div className="flex justify-center py-24"><Spinner /></div>
  if (!order) return <div className="text-center py-24 text-gray-500">Pesanan tidak ditemukan</div>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-sm text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Items */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Produk Dipesan</h2>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.productId} className="flex gap-3">
              {item.productImageUrl ? (
                <img src={item.productImageUrl} alt={item.productName} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.productName}</p>
                <p className="text-xs text-gray-500">{formatRupiah(item.productPrice)} × {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900 flex-shrink-0">{formatRupiah(item.subtotal)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatRupiah(order.subtotal)}</span></div>
          <div className="flex justify-between text-gray-500"><span>Ongkir</span><span>{formatRupiah(order.shippingCost)}</span></div>
          <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
            <span>Total</span><span className="text-primary-700">{formatRupiah(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Informasi Pengiriman</h2>
        <dl className="space-y-1 text-sm">
          <div className="flex gap-2"><dt className="text-gray-400 w-28 flex-shrink-0">Penerima</dt><dd className="text-gray-700">{order.shippingName}</dd></div>
          <div className="flex gap-2"><dt className="text-gray-400 w-28 flex-shrink-0">Telepon</dt><dd className="text-gray-700">{order.shippingPhone}</dd></div>
          <div className="flex gap-2"><dt className="text-gray-400 w-28 flex-shrink-0">Alamat</dt><dd className="text-gray-700">{order.shippingAddress}</dd></div>
          {order.notes && <div className="flex gap-2"><dt className="text-gray-400 w-28 flex-shrink-0">Catatan</dt><dd className="text-gray-700">{order.notes}</dd></div>}
        </dl>
      </div>

      {order.status === 'PENDING_PAYMENT' && (
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate(`/payment/${order.id}`, { state: { order } })}
            className="btn-primary"
          >
            Bayar Sekarang
          </button>
        </div>
      )}
    </div>
  )
}
