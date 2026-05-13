import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight, Sprout, Shield, Truck, Leaf, Droplets, Bug, Flower2,
  Star, Users, Package, Award, CheckCircle2,
} from 'lucide-react'
import { productApi } from '../../api/productApi'
import ProductCard from '../../components/product/ProductCard'
import Spinner from '../../components/common/Spinner'

const categories = [
  { icon: Droplets, label: 'Pupuk',     color: 'from-primary-500 to-primary-700',     slug: 'pupuk' },
  { icon: Bug,      label: 'Pestisida', color: 'from-secondary-500 to-secondary-700', slug: 'pestisida' },
  { icon: Flower2,  label: 'Benih',     color: 'from-primary-400 to-secondary-500',   slug: 'benih' },
  { icon: Leaf,     label: 'Herbisida', color: 'from-secondary-400 to-primary-500',   slug: 'herbisida' },
]

const stats = [
  { icon: Users,   value: '10K+', label: 'Petani Aktif' },
  { icon: Package, value: '500+', label: 'Produk Berkualitas' },
  { icon: Truck,   value: '34',   label: 'Provinsi Terjangkau' },
  { icon: Award,   value: '5+',   label: 'Tahun Pengalaman' },
]

const testimonials = [
  { name: 'Pak Suyadi', role: 'Petani Padi, Jawa Tengah', text: 'Pupuk dari Bumi Niaga bikin panen padi saya naik 30%. Pengiriman juga cepat sampai desa.', rating: 5 },
  { name: 'Bu Marni',   role: 'Petani Cabe, Sumut',       text: 'Harganya bersaing dan produknya asli. Sudah langganan setahun, tidak pernah kecewa.', rating: 5 },
  { name: 'Pak Rudi',   role: 'Petani Sayur, Lembang',    text: 'Benih sayurannya berkualitas tinggi. Persentase tumbuh hampir 100%, recommended!', rating: 5 },
]

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productApi.list({ size: 8 }),
  })

  return (
    <div className="w-full">
      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-700 text-white">
        <div className="absolute inset-0 bg-hero-pattern opacity-80" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl animate-float" />

        <div className="relative container-page py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Sprout className="w-4 h-4" /> Partner Terpercaya Petani Indonesia
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Solusi Pertanian Terbaik untuk{' '}
                <span className="bg-gradient-to-r from-primary-200 to-white bg-clip-text text-transparent">
                  Petani Indonesia
                </span>
              </h1>
              <p className="text-lg text-primary-50/90 mb-8 max-w-xl">
                Pupuk, pestisida, dan benih berkualitas tinggi dengan harga terjangkau.
                Dikirim langsung dari gudang ke ladang Anda.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="bg-white text-primary-700 font-semibold px-7 py-3.5 rounded-lg hover:bg-primary-50 hover:scale-[1.02] transition-all shadow-lg flex items-center gap-2 justify-center"
                >
                  Lihat Katalog <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/register"
                  className="border-2 border-white/70 text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-white/10 transition-colors text-center backdrop-blur-sm"
                >
                  Daftar Gratis
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-10 text-sm text-primary-50/90">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary-200" /> Produk Asli</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary-200" /> Harga Terbaik</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary-200" /> Pengiriman Aman</div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative hidden lg:block">
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  {categories.map(({ icon: Icon, label, color }) => (
                    <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform`}>
                      <Icon className="w-10 h-10 text-white mb-3" />
                      <p className="font-bold text-white text-lg">{label}</p>
                      <p className="text-white/80 text-xs mt-1">Kualitas Premium</p>
                    </div>
                  ))}
                </div>
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 font-bold text-sm rounded-full px-4 py-2 shadow-lg rotate-6">
                  ⭐ Terpercaya
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STATS STRIP ==================== */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-page py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="bg-primary-100 p-3 rounded-xl">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-gray-900">{value}</div>
                  <div className="text-sm text-gray-500">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className="bg-gray-50 py-16">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Kenapa Pilih Kami?</h2>
            <p className="text-gray-500 mt-2">Kami berkomitmen memberikan yang terbaik untuk petani Indonesia</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Sprout, title: 'Produk Berkualitas', desc: 'Semua produk tersertifikasi resmi dan terjamin kualitasnya. Dipilih langsung dari produsen terpercaya.' },
              { icon: Shield, title: 'Pembayaran Aman',    desc: 'Transaksi dilindungi dengan enkripsi tingkat bank. Berbagai metode pembayaran tersedia.' },
              { icon: Truck,  title: 'Pengiriman Cepat',   desc: 'Pengiriman ke seluruh Indonesia dengan mitra logistik terpercaya. Asuransi paket included.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-7 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-3.5 rounded-2xl w-fit mb-5 shadow-md">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES ==================== */}
      <section className="bg-white py-16">
        <div className="container-page">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Jelajahi Kategori</h2>
              <p className="text-gray-500 mt-2">Temukan produk yang Anda butuhkan berdasarkan kategori</p>
            </div>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
              Semua Produk <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map(({ icon: Icon, label, color, slug }) => (
              <Link
                key={slug}
                to={`/products?category=${slug}`}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-8 text-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all`}
              >
                <Icon className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold">{label}</h3>
                <p className="text-white/80 text-sm mt-1">Lihat produk →</p>
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURED PRODUCTS ==================== */}
      <section className="bg-gray-50 py-16">
        <div className="container-page">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Produk Unggulan</h2>
              <p className="text-gray-500 mt-2">Produk terlaris pilihan petani seluruh Indonesia</p>
            </div>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {data?.content.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="bg-white py-16">
        <div className="container-page">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Apa Kata Petani Kami?</h2>
            <p className="text-gray-500 mt-2">Ribuan petani sudah mempercayakan kebutuhan mereka kepada kami</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-7 hover:shadow-lg transition-shadow">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                    {t.name.charAt(t.name.indexOf(' ') + 1)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="bg-gradient-to-r from-secondary-700 via-secondary-600 to-primary-600 text-white py-16">
        <div className="container-page text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Siap Meningkatkan Hasil Panen Anda?</h2>
          <p className="text-secondary-50/90 text-lg mb-8 max-w-2xl mx-auto">
            Daftar sekarang dan dapatkan penawaran khusus untuk pembelian pertama Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-secondary-700 font-semibold px-8 py-3.5 rounded-lg hover:bg-secondary-50 hover:scale-[1.02] transition-all shadow-lg">
              Daftar Sekarang
            </Link>
            <Link to="/products" className="border-2 border-white text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors">
              Jelajahi Produk
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
