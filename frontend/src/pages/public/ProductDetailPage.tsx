import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, ImageOff, ChevronLeft } from 'lucide-react'
import { productApi } from '../../api/productApi'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { formatRupiah } from '../../utils/format'
import Spinner from '../../components/common/Spinner'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const addItem = useCartStore(s => s.addItem)
  const { isAuthenticated } = useAuthStore()
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [added, setAdded] = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getBySlug(slug!),
    enabled: !!slug,
  })

  if (isLoading) return <div className="flex justify-center py-24"><Spinner /></div>
  if (!product) return <div className="text-center py-24 text-gray-500">Produk tidak ditemukan</div>

  const images = product.images.length > 0 ? product.images : []

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${slug}` } })
      return
    }
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productPrice: product.price,
      productImageUrl: product.primaryImageUrl,
      unit: product.unit,
      quantity: qty,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square mb-3">
            {images[activeImg] ? (
              <img src={images[activeImg].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ImageOff className="w-16 h-16" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    i === activeImg ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.categoryName && (
            <span className="text-xs text-primary-600 font-medium uppercase tracking-wide">{product.categoryName}</span>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mt-1 mb-3">{product.name}</h1>
          <p className="text-3xl font-bold text-primary-700 mb-1">{formatRupiah(product.price)}</p>
          {product.unit && <p className="text-sm text-gray-400 mb-4">per {product.unit}</p>}

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-400'}`} />
            {product.stock > 0 ? `Stok: ${product.stock} ${product.unit}` : 'Stok habis'}
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Deskripsi</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-700">Jumlah:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >−</button>
                <span className="px-4 py-2 text-sm font-semibold border-x border-gray-300">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >+</button>
              </div>
              {product.unit && <span className="text-sm text-gray-400">{product.unit}</span>}
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
              added
                ? 'bg-green-600 text-white'
                : 'btn-primary'
            } disabled:opacity-50`}
          >
            <ShoppingCart className="w-5 h-5" />
            {added ? 'Ditambahkan!' : 'Tambah ke Keranjang'}
          </button>
        </div>
      </div>
    </div>
  )
}
