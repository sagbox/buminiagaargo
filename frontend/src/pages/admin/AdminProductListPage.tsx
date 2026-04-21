import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { productApi } from '../../api/productApi'
import { formatRupiah } from '../../utils/format'
import Spinner from '../../components/common/Spinner'
import { Plus, Search, Edit, Trash2, ImageOff } from 'lucide-react'

export default function AdminProductListPage() {
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(0)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => productApi.adminList({ search: search || undefined, page, size: 20 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Hapus produk "${name}"?`)) deleteMutation.mutate(id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Produk
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(0) }} className="flex gap-2 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Cari produk..." className="input-field pl-10" />
        </div>
        <button type="submit" className="btn-primary">Cari</button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Produk</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Harga</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Stok</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.content.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {product.primaryImageUrl ? (
                        <img src={product.primaryImageUrl} alt={product.name} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ImageOff className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900 line-clamp-1">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{product.categoryName || '—'}</td>
                  <td className="px-5 py-3 font-medium">{formatRupiah(product.price)}</td>
                  <td className="px-5 py-3">
                    <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                      {product.stock} {product.unit}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/products/${product.id}/edit`} className="p-1.5 text-gray-400 hover:text-secondary-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(product.id, product.name)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data?.content.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>Tidak ada produk ditemukan</p>
            </div>
          )}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-outline text-sm px-3 py-1.5 disabled:opacity-40">← Sebelumnya</button>
          <span className="px-4 py-1.5 text-sm text-gray-600">{page + 1} / {data.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages - 1} className="btn-outline text-sm px-3 py-1.5 disabled:opacity-40">Berikutnya →</button>
        </div>
      )}
    </div>
  )
}
