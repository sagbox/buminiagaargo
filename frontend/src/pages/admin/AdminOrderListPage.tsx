import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { orderApi } from '../../api/orderApi'
import { formatRupiah, formatDate } from '../../utils/format'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import Spinner from '../../components/common/Spinner'
export default function AdminOrderListPage() {
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn: () => orderApi.adminList({ page, size: 20 }),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pesanan</h1>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">No. Pesanan</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Penerima</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-right px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.content.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="px-5 py-3 text-gray-600">{order.shippingName}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(order.createdAt)}</td>
                      <td className="px-5 py-3 font-semibold">{formatRupiah(order.totalAmount)}</td>
                      <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-5 py-3 text-right">
                        <Link to={`/admin/orders/${order.id}`} className="text-primary-600 hover:text-primary-700 text-xs font-medium">
                          Detail →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data?.content.length === 0 && (
                <div className="text-center py-12 text-gray-400">Belum ada pesanan</div>
              )}
            </div>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-5">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-outline text-sm px-3 py-1.5 disabled:opacity-40">← Sebelumnya</button>
              <span className="px-4 py-1.5 text-sm text-gray-600">{page + 1} / {data.totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages - 1} className="btn-outline text-sm px-3 py-1.5 disabled:opacity-40">Berikutnya →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
