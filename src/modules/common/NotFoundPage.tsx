import { Link, useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 text-center">
      <p className="text-[120px] sm:text-[160px] font-black text-gray-200 dark:text-gray-900 leading-none select-none mb-2">
        404
      </p>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Halaman tidak ditemukan</h1>
      <p className="text-gray-600 dark:text-gray-500 mb-10 max-w-sm">
        URL yang kamu akses tidak ada atau sudah dipindah ke lokasi lain.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors text-sm"
        >
          <ArrowLeft size={15} />
          Kembali
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors text-sm"
        >
          <Home size={15} />
          Beranda
        </Link>
      </div>
    </div>
  )
}
