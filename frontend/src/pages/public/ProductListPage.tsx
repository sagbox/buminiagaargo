import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { productApi } from '../../api/productApi'
import ProductCard from '../../components/product/ProductCard'
import Spinner from '../../components/common/Spinner'

export default function ProductListPage() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [page, setPage] = useState(0)
  const [inputVal, setInputVal] = useState('')

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productApi.listCategories(),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search, categoryId, page }],
    queryFn: () => productApi.list({
      search: search || undefined,
      categoryId: categoryId || undefined,
      page,
      size: 12,
    }),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(inputVal)
    setPage(0)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Katalog Produk</h1>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Cari produk..."
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">Cari</button>
        </form>

        <select
          value={categoryId}
          onChange={e => { setCategoryId(e.target.value); setPage(0) }}
          className="input-field sm:w-48"
        >
          <option value="">Semua Kategori</option>
          {categories?.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : data?.content.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Produk tidak ditemukan</p>
          <p className="text-sm mt-1">Coba kata kunci lain atau hapus filter</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.content.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
                className="btn-outline disabled:opacity-40 text-sm px-3 py-1.5"
              >
                ← Sebelumnya
              </button>
              <span className="px-4 py-1.5 text-sm text-gray-600">
                {page + 1} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.totalPages - 1}
                className="btn-outline disabled:opacity-40 text-sm px-3 py-1.5"
              >
                Berikutnya →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
