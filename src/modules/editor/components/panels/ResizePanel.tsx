import { useState, useEffect } from 'react'
import { Lock, LockOpen } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { picaResize } from '@/utils/picaResize'
import { createActivityLog } from '@/api/activityLogs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatBytes } from '@/utils/format'
import toast from 'react-hot-toast'

export function ResizePanel() {
  const { currentBlob, setResult, setIsProcessing } = useEditorStore()
  const [origW, setOrigW] = useState(0)
  const [origH, setOrigH] = useState(0)
  const [newW, setNewW] = useState(0)
  const [newH, setNewH] = useState(0)
  const [lock, setLock] = useState(true)

  useEffect(() => {
    if (!currentBlob) return
    let cancelled = false
    const url = URL.createObjectURL(currentBlob)
    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      setOrigW(img.naturalWidth)
      setOrigH(img.naturalHeight)
      setNewW(img.naturalWidth)
      setNewH(img.naturalHeight)
      URL.revokeObjectURL(url)
    }
    img.src = url
    return () => {
      cancelled = true
      URL.revokeObjectURL(url)
    }
  }, [currentBlob])

  const handleW = (val: number) => {
    setNewW(val)
    if (lock && origW > 0) setNewH(Math.round((val * origH) / origW))
  }

  const handleH = (val: number) => {
    setNewH(val)
    if (lock && origH > 0) setNewW(Math.round((val * origW) / origH))
  }

  const handleApply = async () => {
    if (!currentBlob || newW < 1 || newH < 1) return
    setIsProcessing(true)
    try {
      const mime = currentBlob.type || 'image/png'
      const blob = await picaResize(currentBlob, newW, newH, mime)
      setResult(blob)
      createActivityLog('resize', { originalW: origW, originalH: origH, newW, newH })
      toast.success('Resize berhasil!')
    } catch {
      toast.error('Gagal resize gambar')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      {origW > 0 && (
        <div className="text-xs text-gray-500 bg-gray-900 rounded-lg px-3 py-2 border border-gray-800">
          Original: <span className="text-gray-300 font-mono">{origW} × {origH} px</span>
          {currentBlob && <> · {formatBytes(currentBlob.size)}</>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Lebar (px)"
          type="number"
          min="1"
          max="16000"
          value={newW || ''}
          onChange={(e) => handleW(Number(e.target.value))}
        />
        <Input
          label="Tinggi (px)"
          type="number"
          min="1"
          max="16000"
          value={newH || ''}
          onChange={(e) => handleH(Number(e.target.value))}
        />
      </div>

      <button
        onClick={() => setLock((v) => !v)}
        className={`flex items-center gap-2 text-xs font-medium transition-colors ${
          lock ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-400'
        }`}
      >
        {lock ? <Lock size={13} /> : <LockOpen size={13} />}
        {lock ? 'Rasio terkunci' : 'Rasio bebas'}
      </button>

      {newW > 0 && newH > 0 && (newW !== origW || newH !== origH) && (
        <p className="text-xs text-gray-500">
          Target: <span className="text-gray-300 font-mono">{newW} × {newH} px</span>
          {newW > origW || newH > origH ? (
            <span className="ml-2 text-amber-500">↑ Upscale</span>
          ) : (
            <span className="ml-2 text-emerald-500">↓ Downscale</span>
          )}
        </p>
      )}

      <Button
        onClick={handleApply}
        disabled={newW < 1 || newH < 1 || (newW === origW && newH === origH)}
        className="w-full"
      >
        Terapkan Resize
      </Button>
    </div>
  )
}
