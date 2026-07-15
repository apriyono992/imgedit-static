import { useState, useRef } from 'react'
import { Eraser, CheckCircle2, Palette, ImagePlus } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { blobToImageElement, canvasToBlob } from '@/utils/canvas'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { cn } from '@/utils/cn'

type BgType = 'transparent' | 'color' | 'image'

export function RemoveBgPanel() {
  const { currentBlob, setResult, setIsProcessing, setProgress, setMessage } = useEditorStore()
  const [removed, setRemoved] = useState(false)
  const [bgType, setBgType] = useState<BgType>('transparent')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [bgFile, setBgFile] = useState<File | null>(null)

  // Simpan transparent PNG di ref agar tidak terpengaruh saat resultBlob diganti oleh changeBg
  const transparentBlobRef = useRef<Blob | null>(null)

  const handleRemoveBg = async () => {
    if (!currentBlob) return
    setIsProcessing(true)
    setProgress(0)
    setMessage('Mempersiapkan model AI...')
    try {
      const { removeBackground } = await import('@imgly/background-removal')
      const result = await removeBackground(currentBlob, {
        progress: (key: string, current: number, total: number) => {
          const pct = Math.min(99, Math.round((current / total) * 100))
          setProgress(pct)
          setMessage(key.includes('fetch') ? 'Mengunduh model AI...' : 'Memproses gambar...')
        },
      })
      // Simpan transparent PNG di ref — bukan di store, agar tidak overwrite saat changeBg
      transparentBlobRef.current = result
      setResult(result)
      setRemoved(true)
      setProgress(100)
      toast.success('Background berhasil dihapus!')
    } catch {
      toast.error('Gagal menghapus background. Coba lagi.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleChangeBg = async () => {
    // Gunakan ref — bukan resultBlob dari store (yang bisa sudah berisi hasil composite sebelumnya)
    const fgBlob = transparentBlobRef.current
    if (!fgBlob) return
    setIsProcessing(true)
    setMessage('Menerapkan background...')
    try {
      const fgImg = await blobToImageElement(fgBlob)
      const canvas = document.createElement('canvas')
      canvas.width = fgImg.naturalWidth
      canvas.height = fgImg.naturalHeight
      const ctx = canvas.getContext('2d')!

      if (bgType === 'color') {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else if (bgType === 'image' && bgFile) {
        const bgImg = await blobToImageElement(new Blob([bgFile], { type: bgFile.type }))
        const scale = Math.max(canvas.width / bgImg.naturalWidth, canvas.height / bgImg.naturalHeight)
        const w = bgImg.naturalWidth * scale
        const h = bgImg.naturalHeight * scale
        ctx.drawImage(bgImg, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
      }

      ctx.drawImage(fgImg, 0, 0)
      const mime = bgType === 'transparent' ? 'image/png' : 'image/jpeg'
      const blob = await canvasToBlob(canvas, mime, 0.92)
      setResult(blob)
      toast.success('Background berhasil diganti!')
    } catch {
      toast.error('Gagal mengganti background')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setRemoved(false)
    setBgType('transparent')
    transparentBlobRef.current = null
  }

  return (
    <div className="space-y-4">
      {!removed ? (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-xs text-gray-500 leading-relaxed">
            <p className="text-gray-400 font-medium mb-1">Model AI berjalan di browser</p>
            <p>Gambarmu tidak dikirim ke server. Model diunduh sekali ~15 MB lalu tersimpan di browser.</p>
          </div>
          <Button
            onClick={handleRemoveBg}
            leftIcon={<Eraser size={14} />}
            className="w-full"
          >
            Hapus Background
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5">
            <CheckCircle2 size={16} />
            Background berhasil dihapus
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 mb-2.5">Ganti Background (opsional)</p>
            <div className="space-y-2">
              {(
                [
                  { val: 'transparent', label: 'Transparan (PNG)', icon: null },
                  { val: 'color', label: 'Warna Solid', icon: Palette },
                  { val: 'image', label: 'Gambar Baru', icon: ImagePlus },
                ] as const
              ).map(({ val, label, icon: Icon }) => (
                <button
                  key={val}
                  onClick={() => setBgType(val)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors text-left',
                    bgType === val
                      ? 'bg-indigo-600/20 border-indigo-600/40 text-indigo-300'
                      : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300',
                  )}
                >
                  {Icon && <Icon size={15} />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {bgType === 'color' && (
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-400">Warna:</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-9 h-9 rounded-lg border border-gray-700 bg-transparent cursor-pointer p-0.5"
              />
              <span className="text-xs text-gray-500 font-mono">{bgColor.toUpperCase()}</span>
            </div>
          )}

          {bgType === 'image' && (
            <div>
              <input
                type="file"
                accept="image/*"
                id="bg-file-input"
                className="hidden"
                onChange={(e) => setBgFile(e.target.files?.[0] ?? null)}
              />
              <label
                htmlFor="bg-file-input"
                className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-gray-700 rounded-lg text-sm text-gray-500 hover:border-gray-600 hover:text-gray-400 cursor-pointer transition-colors"
              >
                <ImagePlus size={15} />
                {bgFile ? bgFile.name : 'Pilih gambar background'}
              </label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {bgType !== 'transparent' && (
              <Button
                onClick={handleChangeBg}
                disabled={bgType === 'image' && !bgFile}
                className="col-span-2"
              >
                Terapkan Background
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className={bgType === 'transparent' ? 'col-span-2' : ''}
            >
              Hapus Ulang
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
