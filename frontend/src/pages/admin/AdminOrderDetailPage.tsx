import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderApi } from '../../api/orderApi'
import { formatRupiah, formatDate } from '../../utils/format'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import Spinner from '../../components/common/Spinner'
import { ChevronLeft } from 'lucide-react'
import type { OrderStatus } from '../../types'

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PAYMENT_CONFIRMED: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => orderApi.adminGet(id!),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: (status: OrderStatus) => orderApi.adminUpdateStatus(id!, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-order', id] }),
  })

  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>
  if (!order) return <div className="text-center py-16 text-gray-500">Pesanan tidak ditemukan</div>

  const nextStatus = order.status ? NEXT_STATUS[order.status] : undefined

  return (
    <div>
      <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-sm text-gray-400 mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {nextStatus && (
            <button
              onClick={() => updateMutation.mutate(nextStatus)}
              disabled={updateMutation.isPending}
              className="btn-primary text-sm py-1.5 px-3"
            >
              {updateMutation.isPending ? 'Memproses...' : `Tandai ${nextStatus.replace('_', ' ')}`}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items + totals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Produk</h2>
            <div className="space-y-3">
              {order.items.map(item => (
                <div key={item.productId} className="flex gap-3 items-center">
                  {item.productImageUrl ? (
                    <img src={item.productImageUrl} alt={item.productName} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-gray-500">{formatRupiah(item.productPrice)} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0">{formatRupiah(item.subtotal)}</p>
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
        </div>

        {/* Shipping info */}
        <div className="card p-5 h-fit">
          <h2 className="font-semibold text-gray-900 mb-3">Pengiriman</h2>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Penerima</dt><dd className="text-gray-800 font-medium">{order.shippingName}</dd></div>
            <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Telepon</dt><dd className="text-gray-800">{order.shippingPhone}</dd></div>
            <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Alamat</dt><dd className="text-gray-800">{order.shippingAddress}</dd></div>
            {order.notes && <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Catatan</dt><dd className="text-gray-800">{order.notes}</dd></div>}
          </dl>

          {order.status === 'PENDING_PAYMENT' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => updateMutation.mutate('CANCELLED')}
                disabled={updateMutation.isPending}
                className="w-full text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Batalkan Pesanan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
