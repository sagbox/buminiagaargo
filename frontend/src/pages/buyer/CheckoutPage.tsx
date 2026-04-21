import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { orderApi } from '../../api/orderApi'
import { formatRupiah } from '../../utils/format'
import { useState } from 'react'

const SHIPPING_COST = 15000

const schema = z.object({
  shippingName: z.string().min(2, 'Nama wajib diisi'),
  shippingPhone: z.string().min(8, 'Nomor telepon tidak valid'),
  shippingAddress: z.string().min(10, 'Alamat terlalu pendek'),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, clearCart, totalPrice } = useCartStore()
  const { user } = useAuthStore()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { shippingName: user?.fullName },
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const order = await orderApi.create({
        items: items.map(i => ({
          productId: i.productId,
          productSlug: i.productSlug,
          quantity: i.quantity,
        })),
        ...data,
      })
      clearCart()
      navigate(`/payment/${order.id}`, { state: { order } })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg || 'Gagal membuat pesanan. Coba lagi.')
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const subtotal = totalPrice()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Informasi Pengiriman</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penerima</label>
                <input {...register('shippingName')} className="input-field" />
                {errors.shippingName && <p className="text-red-500 text-xs mt-1">{errors.shippingName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                <input {...register('shippingPhone')} placeholder="08xxxxxxxxxx" className="input-field" />
                {errors.shippingPhone && <p className="text-red-500 text-xs mt-1">{errors.shippingPhone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                <textarea {...register('shippingAddress')} rows={3} placeholder="Jl. ..., RT/RW ..., Kelurahan ..., Kecamatan ..., Kota ..." className="input-field resize-none" />
                {errors.shippingAddress && <p className="text-red-500 text-xs mt-1">{errors.shippingAddress.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan <span className="text-gray-400">(opsional)</span></label>
                <textarea {...register('notes')} rows={2} placeholder="Catatan untuk penjual..." className="input-field resize-none" />
              </div>
            </form>
          </div>
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Ringkasan</h2>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between text-sm text-gray-600">
                <span className="truncate mr-2">{item.productName} ×{item.quantity}</span>
                <span className="flex-shrink-0">{formatRupiah(item.productPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Ongkir</span><span>{formatRupiah(SHIPPING_COST)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-100">
              <span>Total</span>
              <span className="text-primary-700">{formatRupiah(subtotal + SHIPPING_COST)}</span>
            </div>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="btn-primary w-full mt-4"
          >
            {isSubmitting ? 'Membuat Pesanan...' : 'Buat Pesanan & Bayar'}
          </button>
        </div>
      </div>
    </div>
  )
}
