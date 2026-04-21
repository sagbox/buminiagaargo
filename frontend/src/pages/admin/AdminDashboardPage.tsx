import { useQuery } from '@tanstack/react-query'
import { ShoppingBag, Package, Clock, CheckCircle } from 'lucide-react'
import { orderApi } from '../../api/orderApi'
import { formatRupiah } from '../../utils/format'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import Spinner from '../../components/common/Spinner'
import { Link } from 'react-router-dom'

export default function AdminDashboardPage() {
  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => orderApi.dashboardSummary(),
    refetchInterval: 30000,
  })

  const { data: recentOrders } = useQuery({
    queryKey: ['admin-orders', 0],
    queryFn: () => orderApi.adminList({ page: 0, size: 8 }),
  })

  const stats = [
    { label: 'Total Pesanan', value: summary?.totalOrders ?? 0, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { label: 'Menunggu Bayar', value: summary?.pendingOrders ?? 0, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Diproses', value: summary?.processingOrders ?? 0, icon: Package, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Selesai', value: summary?.completedOrders ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="card p-5 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
          <p className="text-primary-100 text-sm mb-1">Revenue Bulan Ini</p>
          {sumLoading ? <Spinner className="w-6 h-6 border-white border-t-transparent" /> : (
            <p className="text-3xl font-bold">{formatRupiah(summary?.revenueThisMonth ?? 0)}</p>
          )}
        </div>
        <div className="card p-5 bg-gradient-to-br from-secondary-600 to-secondary-700 text-white">
          <p className="text-secondary-100 text-sm mb-1">Total Revenue</p>
          {sumLoading ? <Spinner className="w-6 h-6 border-white border-t-transparent" /> : (
            <p className="text-3xl font-bold">{formatRupiah(summary?.revenueTotal ?? 0)}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card p-4">
              <div className={`inline-flex p-2 rounded-lg mb-3 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Pesanan Terbaru</h2>
          <Link to="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700">Lihat semua →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">No. Pesanan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Penerima</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders?.content.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link to={`/admin/orders/${order.id}`} className="font-medium text-primary-600 hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{order.shippingName}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">{formatRupiah(order.totalAmount)}</td>
                  <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
