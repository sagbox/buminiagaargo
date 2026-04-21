import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productApi } from '../../api/productApi'
import { ChevronLeft, Upload, X } from 'lucide-react'
import Spinner from '../../components/common/Spinner'

const schema = z.object({
  name: z.string().min(2, 'Nama wajib diisi'),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  price: z.string().transform(v => parseFloat(v) || 0),
  stock: z.string().transform(v => parseInt(v) || 0),
  unit: z.string().optional(),
  isActive: z.boolean(),
})

type FormInput = {
  name: string
  categoryId?: string
  description?: string
  price: string
  stock: string
  unit?: string
  isActive: boolean
}
type FormData = {
  name: string
  categoryId?: string
  description?: string
  price: number
  stock: number
  unit?: string
  isActive: boolean
}

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = id !== 'new' && !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [uploadingImg, setUploadingImg] = useState(false)
  const [serverError, setServerError] = useState('')

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: productApi.listCategories })

  const { data: product, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => productApi.adminList({ size: 1 }).then(() => {
      // We need product by id — use admin list and find it
      return productApi.adminList({ size: 100 }).then(p => p.content.find(x => x.id === id))
    }),
    enabled: isEdit,
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInput>({
    resolver: zodResolver(schema) as never,
    defaultValues: { isActive: true, stock: '0', price: '' },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        categoryId: product.categoryId || '',
        description: product.description || '',
        price: String(product.price),
        stock: String(product.stock),
        unit: product.unit || '',
        isActive: product.isActive,
      })
    }
  }, [product, reset])

  const createMutation = useMutation({
    mutationFn: (data: FormData) => productApi.create(data),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      navigate(`/admin/products/${p.id}/edit`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => productApi.update(id!, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setServerError('')
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data)
      } else {
        await createMutation.mutateAsync(data)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setServerError(msg || 'Terjadi kesalahan')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id || id === 'new') return
    setUploadingImg(true)
    try {
      await productApi.uploadImage(id, file, product?.images.length === 0)
      qc.invalidateQueries({ queryKey: ['admin-product', id] })
      qc.invalidateQueries({ queryKey: ['admin-products'] })
    } finally {
      setUploadingImg(false)
      e.target.value = ''
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!id) return
    await productApi.deleteImage(id, imageId)
    qc.invalidateQueries({ queryKey: ['admin-product', id] })
  }

  if (isEdit && isLoading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div>
      <button onClick={() => navigate('/admin/products')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ChevronLeft className="w-4 h-4" /> Kembali
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 card p-6">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{serverError}</div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk *</label>
              <input {...register('name')} className="input-field" placeholder="Pupuk Urea 50kg" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                <input {...register('price')} type="number" className="input-field" placeholder="50000" />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                <input {...register('unit')} className="input-field" placeholder="kg, liter, sachet..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok *</label>
                <input {...register('stock')} type="number" className="input-field" />
                {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select {...register('categoryId')} className="input-field">
                  <option value="">Pilih kategori</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea {...register('description')} rows={4} className="input-field resize-none" placeholder="Deskripsi produk..." />
            </div>

            <div className="flex items-center gap-3">
              <input {...register('isActive')} type="checkbox" id="isActive" className="w-4 h-4 accent-primary-600" />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Produk aktif (tampil di katalog)</label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat Produk'}
              </button>
              <button type="button" onClick={() => navigate('/admin/products')} className="btn-outline">Batal</button>
            </div>
          </form>
        </div>

        {/* Images */}
        <div className="card p-5 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Gambar Produk</h2>
          {!isEdit ? (
            <p className="text-sm text-gray-400">Simpan produk terlebih dahulu untuk menambah gambar</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {product?.images.map(img => (
                  <div key={img.id} className="relative group">
                    <img src={img.url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                    {img.isPrimary && (
                      <span className="absolute top-1 left-1 bg-primary-600 text-white text-xs px-1.5 py-0.5 rounded">Utama</span>
                    )}
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <label className={`flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-primary-400 transition-colors ${uploadingImg ? 'opacity-50' : ''}`}>
                {uploadingImg ? <Spinner className="w-6 h-6" /> : <Upload className="w-6 h-6 text-gray-400" />}
                <span className="text-sm text-gray-500">{uploadingImg ? 'Mengunggah...' : 'Klik untuk upload gambar'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
