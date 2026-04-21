import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Sprout, Shield, Truck } from 'lucide-react'
import { productApi } from '../../api/productApi'
import ProductCard from '../../components/product/ProductCard'
import Spinner from '../../components/common/Spinner'

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productApi.list({ size: 8 }),
  })

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Solusi Pertanian Terbaik untuk{' '}
              <span className="text-primary-200">Petani Indonesia</span>
            </h1>
            <p className="text-lg text-primary-100 mb-8">
              Dapatkan pupuk, pestisida, dan benih berkualitas tinggi dengan harga terjangkau.
              Dikirim langsung ke ladang Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products" className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-2 justify-center">
                Lihat Katalog <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register" className="border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors text-center">
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Sprout, title: 'Produk Berkualitas', desc: 'Semua produk telah tersertifikasi dan terjamin kualitasnya' },
              { icon: Shield, title: 'Pembayaran Aman', desc: 'Transaksi dilindungi dengan teknologi enkripsi terkini' },
              { icon: Truck, title: 'Pengiriman Cepat', desc: 'Pengiriman ke seluruh Indonesia dengan mitra logistik terpercaya' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="bg-primary-100 p-3 rounded-xl h-fit">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Produk Unggulan</h2>
            <p className="text-gray-500 text-sm mt-1">Produk terlaris pilihan petani</p>
          </div>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.content.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
