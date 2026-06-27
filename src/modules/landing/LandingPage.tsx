import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ImageIcon, Crop, Scaling, Eraser, FileImage, ArrowUpDown,
  Shield, Zap, Gift, Menu, X, ChevronDown, ChevronUp,
  Star, Lock, Cpu, Layers,
} from 'lucide-react'

// ── Editor Mockup ─────────────────────────────────────────────────────────────

function EditorMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute -inset-4 rounded-3xl blur-2xl" style={{ background: 'rgba(79,70,229,0.2)' }} />
      <div className="relative bg-gray-900 border border-gray-700/60 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-950 border-b border-gray-800">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
          <div className="flex-1 ml-2 h-4 bg-gray-800 rounded-md" />
        </div>
        {/* Editor body */}
        <div className="flex" style={{ height: 220 }}>
          {/* Image area */}
          <div
            className="flex-1 flex items-center justify-center relative"
            style={{
              backgroundImage: 'repeating-conic-gradient(#1f2937 0% 25%, #374151 0% 50%)',
              backgroundSize: '16px 16px',
            }}
          >
            <div
              className="w-28 h-28 rounded-xl border-2 border-dashed border-indigo-500/40 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.5))' }}
            >
              <ImageIcon size={36} className="text-indigo-300/60" />
            </div>
            <div className="absolute top-3 right-3 flex gap-1.5">
              <span className="px-2 py-0.5 bg-gray-800/90 border border-gray-700 rounded text-[10px] text-gray-400">Sebelum</span>
              <span className="px-2 py-0.5 bg-indigo-600/80 rounded text-[10px] text-white">Sesudah</span>
            </div>
          </div>
          {/* Tool panel */}
          <div className="w-36 border-l border-gray-800 p-2.5 flex flex-col gap-2">
            <div className="grid grid-cols-5 gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-7 rounded-md ${i === 1 ? 'bg-indigo-600/50 border border-indigo-500/40' : 'bg-gray-800'}`} />
              ))}
            </div>
            <div className="mt-1 space-y-1.5">
              <div className="h-2 bg-gray-800 rounded" style={{ width: '75%' }} />
              <div className="h-2 bg-gray-800 rounded" style={{ width: '55%' }} />
              <div className="flex gap-1 mt-2">
                {[0, 1, 2].map((i) => <div key={i} className="h-5 bg-gray-800 rounded flex-1" />)}
              </div>
              <div className="h-2 bg-indigo-600/30 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
            <div className="mt-auto h-7 bg-indigo-600/70 rounded-lg flex items-center justify-center">
              <div className="h-1.5 w-16 bg-white/30 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Crop,
    title: 'Crop',
    desc: 'Potong gambar dengan rasio bebas atau preset: 1:1, 16:9, 4:3, 3:2.',
    iconColor: '#a78bfa',
    iconBg: 'rgba(139,92,246,0.15)',
    hoverBorder: '#7c3aed40',
  },
  {
    icon: Scaling,
    title: 'Resize',
    desc: 'Ubah dimensi gambar dengan algoritma lanczos berkualitas tinggi.',
    iconColor: '#60a5fa',
    iconBg: 'rgba(96,165,250,0.15)',
    hoverBorder: '#2563eb40',
  },
  {
    icon: Eraser,
    title: 'Remove BG',
    desc: 'Hapus background otomatis via AI — gambarmu tidak keluar dari browser.',
    iconColor: '#34d399',
    iconBg: 'rgba(52,211,153,0.15)',
    hoverBorder: '#05966940',
  },
  {
    icon: FileImage,
    title: 'Reformat',
    desc: 'Konversi ke JPEG, PNG, atau WebP dengan kontrol kualitas output.',
    iconColor: '#fbbf24',
    iconBg: 'rgba(251,191,36,0.15)',
    hoverBorder: '#d9770640',
  },
  {
    icon: ArrowUpDown,
    title: 'Upscale / Downscale',
    desc: 'Perbesar hingga 4× atau perkecil gambar — tanpa kehilangan detail.',
    iconColor: '#818cf8',
    iconBg: 'rgba(129,140,248,0.15)',
    hoverBorder: '#4f46e540',
  },
]

const stats = [
  { icon: Layers, value: '5', label: 'Tool Edit' },
  { icon: Lock, value: '0 KB', label: 'Data Dikirim' },
  { icon: Cpu, value: 'AI', label: 'Remove Background' },
  { icon: Gift, value: '100%', label: 'Gratis' },
]

const steps = [
  { num: '01', title: 'Upload Gambar', desc: 'Drag & drop atau klik — pilih file JPEG, PNG, WebP, GIF, sampai 30 MB.' },
  { num: '02', title: 'Pilih Tool & Edit', desc: 'Sesuaikan crop, resize, background, format, atau skala sesuai kebutuhan.' },
  { num: '03', title: 'Download Hasil', desc: 'Gambar siap pakai tersimpan langsung ke perangkatmu dalam hitungan detik.' },
]

const testimonials = [
  {
    name: 'Rizky A.',
    role: 'Desainer Grafis',
    avatar: 'R',
    color: '#4f46e5',
    text: 'Akhirnya bisa hapus background tanpa Photoshop! AI-nya akurat dan yang paling penting gratis. Sekarang workflow saya jauh lebih cepat.',
    stars: 5,
  },
  {
    name: 'Sari W.',
    role: 'Fotografer',
    avatar: 'S',
    color: '#7c3aed',
    text: 'Crop dan resize langsung di browser tanpa perlu install apapun. Simpel, cepat, dan hasilnya bersih. Cocok banget buat kebutuhan sehari-hari.',
    stars: 5,
  },
  {
    name: 'Budi H.',
    role: 'Content Creator',
    avatar: 'B',
    color: '#0891b2',
    text: 'Remove background-nya benar-benar jalan di browser, bukan di server. Privasi terjaga dan gratis. Ini yang selama ini aku cari!',
    stars: 5,
  },
]

const faqs = [
  {
    q: 'Apakah gambar saya aman dan privat?',
    a: 'Ya, 100% aman. Semua proses — termasuk AI remove background — terjadi sepenuhnya di browser dan perangkatmu. Gambarmu tidak pernah dikirim ke server manapun.',
  },
  {
    q: 'Apakah perlu install aplikasi atau plugin?',
    a: 'Tidak perlu. Imegedit berjalan langsung di browser modern (Chrome, Firefox, Safari, Edge). Tidak ada download, tidak ada instalasi.',
  },
  {
    q: 'Format gambar apa saja yang didukung?',
    a: 'Imegedit mendukung input JPEG, PNG, WebP, GIF, dan BMP hingga 30 MB. Output bisa ke JPEG, PNG, atau WebP dengan kontrol kualitas.',
  },
  {
    q: 'Apakah benar-benar gratis selamanya?',
    a: 'Ya, semua fitur — crop, resize, remove background, reformat, dan upscale — tersedia gratis tanpa batas. Tidak perlu kartu kredit.',
  },
  {
    q: 'Mengapa perlu daftar akun?',
    a: 'Akun digunakan untuk menyimpan riwayat aktivitas editmu. Proses editing tetap terjadi di browser tanpa server — akun hanya untuk log dan manajemen sesi.',
  },
]

// ── Components ────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-900 transition-colors"
      >
        <span className="font-medium text-gray-200 text-sm pr-4">{q}</span>
        {open ? (
          <ChevronUp size={16} className="text-indigo-400 shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-500 shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed border-t border-gray-800 pt-3">
          {a}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-900">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="text-indigo-500" size={22} />
            <span className="font-bold text-lg text-gray-100">Imegedit</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/login" className="px-4 py-1.5 text-sm text-gray-400 hover:text-gray-100 transition-colors">
              Masuk
            </Link>
            <Link to="/register" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
              Daftar Gratis
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="sm:hidden p-2 text-gray-400 hover:text-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-800 bg-gray-950">
            <div className="px-5 py-3 space-y-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-900 rounded-lg transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-center"
              >
                Daftar Gratis
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero — single column, selalu center di semua ukuran layar ── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600/15 border border-indigo-600/30 rounded-full text-indigo-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            100% berjalan di browser — gambarmu aman
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-100 leading-tight mb-5">
            Edit gambar{' '}
            <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              profesional
            </span>
            <br />langsung di browser
          </h1>

          <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-xl mx-auto">
            Crop, resize, hapus background, reformat, dan upscale gambar — semua gratis, semua privat, langsung download hasilnya.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link to="/register" className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm text-center" style={{ boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}>
              Mulai Edit Gratis →
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-xl transition-colors text-sm text-center">
              Sudah punya akun
            </Link>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { icon: Shield, label: 'Tanpa upload ke server' },
              { icon: Zap, label: 'Proses instan' },
              { icon: Gift, label: 'Gratis selamanya' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-gray-500">
                <Icon size={14} className="text-indigo-500 shrink-0" />
                {label}
              </div>
            ))}
          </div>

          {/* Mockup — selalu visible, centered, di bawah teks */}
          <div className="mt-12 max-w-lg mx-auto">
            <EditorMockup />
          </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <Icon size={18} className="text-indigo-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-100 mb-0.5">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-3">5 Tool lengkap</h2>
          <p className="text-gray-500">Semua yang kamu butuhkan, tanpa instalasi apapun</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition-all group cursor-default"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: f.iconBg }}
              >
                <f.icon size={20} style={{ color: f.iconColor }} />
              </div>
              <h3 className="font-semibold text-gray-100 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-3">Cara pakai</h2>
          <p className="text-gray-500">3 langkah, selesai dalam hitungan detik</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.num} className="relative text-center">
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-5 left-[60%] w-[40%] border-t-2 border-dashed border-gray-800" />
              )}
              <div className="w-12 h-12 rounded-full bg-indigo-600/20 border-2 border-indigo-600/40 flex items-center justify-center mx-auto mb-4 relative z-10" style={{ background: '#030712' }}>
                <span className="text-indigo-400 font-bold text-sm">{s.num}</span>
              </div>
              <h3 className="font-semibold text-gray-200 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-3">Apa kata mereka</h2>
          <p className="text-gray-500">Digunakan oleh desainer, fotografer, dan kreator konten</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4">
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              {/* Quote */}
              <p className="text-sm text-gray-400 leading-relaxed flex-1">"{t.text}"</p>
              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Privacy ── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-20">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-emerald-500/15 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="text-emerald-400" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-100 mb-3">Privasi 100%</h2>
          <p className="text-gray-400 leading-relaxed max-w-lg mx-auto mb-6">
            Semua proses editing — termasuk AI remove background — terjadi sepenuhnya di perangkatmu.
            Gambar <strong className="text-gray-300">tidak pernah</strong> dikirim ke server manapun.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Tidak ada upload', 'Tidak ada cloud storage', 'Tidak ada tracking gambar'].map((t) => (
              <span key={t} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                ✓ {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-5 sm:px-8 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-3">Pertanyaan umum</h2>
          <p className="text-gray-500">Ada yang ingin kamu tanyakan?</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-2xl mx-auto px-5 sm:px-8 pb-24 text-center">
        <div className="bg-gray-900 border border-indigo-600/20 rounded-2xl p-10" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(109,40,217,0.08))' }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-3">
            Siap mulai mengedit?
          </h2>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">
            Gratis, tanpa kartu kredit, tanpa batas fitur. Mulai dalam 30 detik.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors text-base"
            style={{ boxShadow: '0 8px 24px rgba(79,70,229,0.35)' }}
          >
            Buat Akun Gratis →
          </Link>
          <p className="text-xs text-gray-600 mt-4">Sudah punya akun? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Masuk di sini</Link></p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-900">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="text-indigo-500" size={20} />
                <span className="font-bold text-gray-100">Imegedit</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Editor gambar berbasis browser. Privat, gratis, dan instan — tanpa upload ke server.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Menu</p>
              <div className="space-y-2">
                {[
                  { to: '/register', label: 'Daftar Gratis' },
                  { to: '/login', label: 'Masuk' },
                  { to: '/app/editor', label: 'Editor' },
                ].map((l) => (
                  <Link key={l.to} to={l.to} className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Fitur</p>
              <div className="space-y-2">
                {['Crop', 'Resize', 'Remove Background', 'Reformat', 'Upscale'].map((f) => (
                  <p key={f} className="text-sm text-gray-500">{f}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>© 2026 Imegedit. Dibuat dengan ❤ — semua proses di perangkatmu.</p>
            <div className="flex gap-4">
              <span>Privasi terjaga</span>
              <span>·</span>
              <span>Tanpa upload</span>
              <span>·</span>
              <span>Open source</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
