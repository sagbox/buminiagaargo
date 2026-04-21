import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { orderApi } from '../../api/orderApi'
import { formatRupiah, formatDate } from '../../utils/format'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import Spinner from '../../components/common/Spinner'
import { ShoppingBag } from 'lucide-react'

export default function OrderHistoryPage() {
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => orderApi.list({ page, size: 10 }),
  })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pesanan Saya</h1>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : data?.content.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada pesanan</p>
          <Link to="/products" className="btn-primary mt-4 inline-block">Mulai Belanja</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.content.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className="card p-4 block hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="text-sm text-gray-500 mb-3">
                {order.items.slice(0, 2).map(item => (
                  <p key={item.productId}>{item.productName} ×{item.quantity}</p>
                ))}
                {order.items.length > 2 && <p>+{order.items.length - 2} produk lainnya</p>}
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-400">Total Pembayaran</span>
                <span className="font-bold text-primary-700">{formatRupiah(order.totalAmount)}</span>
              </div>
            </Link>
          ))}

          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-outline text-sm px-3 py-1.5 disabled:opacity-40">← Sebelumnya</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages - 1} className="btn-outline text-sm px-3 py-1.5 disabled:opacity-40">Berikutnya →</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
