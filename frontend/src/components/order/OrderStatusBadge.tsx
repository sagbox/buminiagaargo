import type { OrderStatus } from '../../types'
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../../utils/format'

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLOR[status] || 'bg-gray-100 text-gray-700'}`}>
      {ORDER_STATUS_LABEL[status] || status}
    </span>
  )
}
