import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, RefreshCw } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { blobToCanvas, canvasToBlob } from '@/utils/canvas'
import { createActivityLog } from '@/api/activityLogs'
import toast from 'react-hot-toast'

function rotateCanvas(src: HTMLCanvasElement, deg: number): HTMLCanvasElement {
  const swap = deg === 90 || deg === 270
  const dst = document.createElement('canvas')
  dst.width = swap ? src.height : src.width
  dst.height = swap ? src.width : src.height
  const ctx = dst.getContext('2d')!
  ctx.translate(dst.width / 2, dst.height / 2)
  ctx.rotate((deg * Math.PI) / 180)
  ctx.drawImage(src, -src.width / 2, -src.height / 2)
  return dst
}

function flipCanvas(src: HTMLCanvasElement, axis: 'h' | 'v'): HTMLCanvasElement {
  const dst = document.createElement('canvas')
  dst.width = src.width
  dst.height = src.height
  const ctx = dst.getContext('2d')!
  if (axis === 'h') { ctx.translate(src.width, 0); ctx.scale(-1, 1) }
  else { ctx.translate(0, src.height); ctx.scale(1, -1) }
  ctx.drawImage(src, 0, 0)
  return dst
}

const TRANSFORMS = [
  {
    label: 'Putar 90° Kanan',
    icon: RotateCw,
    fn: (c: HTMLCanvasElement) => rotateCanvas(c, 90),
    log: { degrees: 90 },
  },
  {
    label: 'Putar 90° Kiri',
    icon: RotateCcw,
    fn: (c: HTMLCanvasElement) => rotateCanvas(c, 270),
    log: { degrees: 270 },
  },
  {
    label: 'Putar 180°',
    icon: RefreshCw,
    fn: (c: HTMLCanvasElement) => rotateCanvas(c, 180),
    log: { degrees: 180 },
  },
  {
    label: 'Flip Horizontal',
    icon: FlipHorizontal,
    fn: (c: HTMLCanvasElement) => flipCanvas(c, 'h'),
    log: { flip: 'horizontal' },
  },
  {
    label: 'Flip Vertikal',
    icon: FlipVertical,
    fn: (c: HTMLCanvasElement) => flipCanvas(c, 'v'),
    log: { flip: 'vertical' },
  },
]

export function RotatePanel() {
  const { currentBlob, setResult, setIsProcessing, setMessage } = useEditorStore()

  const apply = async (
    transformFn: (src: HTMLCanvasElement) => HTMLCanvasElement,
    logMeta: Record<string, unknown>,
    label: string,
  ) => {
    if (!currentBlob) return
    setIsProcessing(true)
    setMessage(label + '...')
    try {
      const srcCanvas = await blobToCanvas(currentBlob)
      const dstCanvas = transformFn(srcCanvas)
      const blob = await canvasToBlob(dstCanvas, currentBlob.type || 'image/png')
      setResult(blob)
      createActivityLog('rotate', logMeta)
      toast.success(`${label} berhasil!`)
    } catch {
      toast.error('Gagal memproses gambar')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 leading-relaxed">
        Klik aksi untuk langsung menerapkan dan melihat hasilnya di preview.
      </p>
      <div className="space-y-2">
        {TRANSFORMS.map(({ label, icon: Icon, fn, log }) => (
          <button
            key={label}
            onClick={() => apply(fn, log, label)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900 border border-gray-800 hover:border-indigo-600/40 hover:bg-gray-800 rounded-xl text-sm text-gray-300 hover:text-gray-100 transition-all text-left group"
          >
            <Icon size={16} className="text-indigo-400 shrink-0 group-hover:rotate-12 transition-transform" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
