import { Link } from 'react-router-dom'
import { ShoppingCart, ImageOff } from 'lucide-react'
import type { Product } from '../../types'
import { formatRupiah } from '../../utils/format'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore(s => s.addItem)
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${product.slug}` } })
      return
    }
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      productPrice: product.price,
      productImageUrl: product.primaryImageUrl,
      unit: product.unit,
      quantity: 1,
    })
  }

  return (
    <Link to={`/products/${product.slug}`} className="card group hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Image */}
      <div className="relative bg-gray-100 aspect-square overflow-hidden">
        {product.primaryImageUrl ? (
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageOff className="w-12 h-12" />
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 text-xs font-semibold px-2 py-1 rounded">Stok Habis</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {product.categoryName && (
          <span className="text-xs text-primary-600 font-medium mb-1">{product.categoryName}</span>
        )}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2 flex-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div>
            <p className="font-bold text-primary-700">{formatRupiah(product.price)}</p>
            {product.unit && <p className="text-xs text-gray-400">per {product.unit}</p>}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white p-2 rounded-lg transition-colors"
            title="Tambah ke keranjang"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}
