import { Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 p-1.5 rounded-lg">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white">Bumi Niaga Agrochem</span>
            </div>
            <p className="text-sm text-gray-400">
              Solusi produk pertanian terpercaya untuk petani Indonesia.
              Kualitas terjamin, harga bersaing.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Tautan</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-primary-400 transition-colors">Katalog Produk</Link></li>
              <li><Link to="/cart" className="hover:text-primary-400 transition-colors">Keranjang</Link></li>
              <li><Link to="/orders" className="hover:text-primary-400 transition-colors">Pesanan Saya</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Hubungi Kami</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📧 info@buminiagaagrochem.id</li>
              <li>📞 (021) 1234-5678</li>
              <li>📍 Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Bumi Niaga Agrochem. Hak cipta dilindungi undang-undang.
        </div>
      </div>
    </footer>
  )
}
