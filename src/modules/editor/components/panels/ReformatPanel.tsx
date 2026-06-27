import { useState } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { blobToImageElement, canvasToBlob } from '@/utils/canvas'
import { createActivityLog } from '@/api/activityLogs'
import { Button } from '@/components/ui/Button'
import type { OutputFormat } from '@/types/editor'
import { formatBytes } from '@/utils/format'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const FORMATS: { mime: OutputFormat; label: string; ext: string }[] = [
  { mime: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { mime: 'image/png', label: 'PNG', ext: 'png' },
  { mime: 'image/webp', label: 'WebP', ext: 'webp' },
]

export function ReformatPanel() {
  const { currentBlob, setResult, setIsProcessing } = useEditorStore()
  const [format, setFormat] = useState<OutputFormat>('image/jpeg')
  const [quality, setQuality] = useState(0.85)

  const supportsQuality = format !== 'image/png'
  const originalFormat = currentBlob?.type ?? 'image/jpeg'

  const handleApply = async () => {
    if (!currentBlob) return
    setIsProcessing(true)
    try {
      const img = await blobToImageElement(currentBlob)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!

      // Fill white background for JPEG (no transparency)
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)
      const blob = await canvasToBlob(canvas, format, supportsQuality ? quality : 1)
      setResult(blob)
      createActivityLog('reformat', {
        from: originalFormat,
        to: format,
        quality: supportsQuality ? quality : 1,
      })
      toast.success('Reformat berhasil!')
    } catch {
      toast.error('Gagal reformat gambar')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-5">
      {currentBlob && (
        <div className="text-xs text-gray-500 bg-gray-900 rounded-lg px-3 py-2 border border-gray-800">
          Original: <span className="text-gray-300 font-mono">{originalFormat.split('/')[1].toUpperCase()}</span>
          {' '}· {formatBytes(currentBlob.size)}
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-gray-400 mb-2.5">Format Output</p>
        <div className="grid grid-cols-3 gap-2">
          {FORMATS.map((f) => (
            <button
              key={f.mime}
              onClick={() => setFormat(f.mime)}
              className={cn(
                'py-2.5 rounded-lg border text-sm font-semibold transition-colors',
                format === f.mime
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {supportsQuality && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-400">Kualitas</p>
            <span className="text-xs font-mono text-indigo-400">{Math.round(quality * 100)}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={Math.round(quality * 100)}
            onChange={(e) => setQuality(Number(e.target.value) / 100)}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>Lebih kecil</span>
            <span>Lebih tajam</span>
          </div>
        </div>
      )}

      <Button onClick={handleApply} className="w-full">
        Terapkan Reformat
      </Button>
    </div>
  )
}
