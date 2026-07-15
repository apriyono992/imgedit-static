import { useState, useEffect } from 'react'
import { Lock, LockOpen, ArrowUp, ArrowDown } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { picaResize } from '@/utils/picaResize'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

type Mode = 'upscale' | 'downscale'

const UPSCALE_PRESETS = [
  { label: '1.5×', factor: 1.5 },
  { label: '2×', factor: 2 },
  { label: '3×', factor: 3 },
  { label: '4×', factor: 4 },
]

const DOWNSCALE_PRESETS = [
  { label: '75%', factor: 0.75 },
  { label: '50%', factor: 0.5 },
  { label: '25%', factor: 0.25 },
]

export function UpscalePanel() {
  const { currentBlob, setResult, setIsProcessing } = useEditorStore()
  const [mode, setMode] = useState<Mode>('upscale')
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
      setNewW(img.naturalWidth * 2)
      setNewH(img.naturalHeight * 2)
      URL.revokeObjectURL(url)
    }
    img.src = url
    return () => { cancelled = true; URL.revokeObjectURL(url) }
  }, [currentBlob])

  const applyPreset = (factor: number) => {
    setNewW(Math.round(origW * factor))
    setNewH(Math.round(origH * factor))
  }

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
      const toolName = newW > origW || newH > origH ? 'upscale' : 'downscale'
      toast.success(`${toolName === 'upscale' ? 'Upscale' : 'Downscale'} berhasil!`)
    } catch {
      toast.error('Gagal memproses gambar')
    } finally {
      setIsProcessing(false)
    }
  }

  const presets = mode === 'upscale' ? UPSCALE_PRESETS : DOWNSCALE_PRESETS

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-1.5 bg-gray-100 p-1 rounded-lg border border-gray-300 dark:bg-gray-900 dark:border-gray-800">
        {(['upscale', 'downscale'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m)
              if (origW > 0) applyPreset(m === 'upscale' ? 2 : 0.5)
            }}
            className={cn(
              'flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-colors',
              mode === m
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100 dark:shadow-none'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
            )}
          >
            {m === 'upscale' ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
            {m === 'upscale' ? 'Perbesar' : 'Perkecil'}
          </button>
        ))}
      </div>

      {/* Presets */}
      {origW > 0 && (
        <>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Preset</p>
            <div className="grid grid-cols-4 gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.factor)}
                  className="py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-0 top-1/2 border-t border-gray-200 dark:border-gray-800" />
            <span className="relative bg-gray-50 dark:bg-gray-950 px-2 text-xs text-gray-500 dark:text-gray-600 left-1/2 -translate-x-1/2 block text-center w-fit">
              atau custom
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Lebar (px)"
              type="number"
              min="1"
              max="32000"
              value={newW || ''}
              onChange={(e) => handleW(Number(e.target.value))}
            />
            <Input
              label="Tinggi (px)"
              type="number"
              min="1"
              max="32000"
              value={newH || ''}
              onChange={(e) => handleH(Number(e.target.value))}
            />
          </div>

          <button
            onClick={() => setLock((v) => !v)}
            className={`flex items-center gap-2 text-xs font-medium transition-colors ${
              lock ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-400'
            }`}
          >
            {lock ? <Lock size={13} /> : <LockOpen size={13} />}
            {lock ? 'Rasio terkunci' : 'Rasio bebas'}
          </button>

          <div className="text-xs text-gray-600 bg-white shadow-sm dark:bg-gray-900 dark:shadow-none rounded-lg px-3 py-2 border border-gray-300 dark:border-gray-800">
            <div className="flex justify-between">
              <span>Original</span>
              <span className="font-mono text-gray-800 dark:text-gray-400">{origW} × {origH}</span>
            </div>
            {newW > 0 && newH > 0 && (
              <div className="flex justify-between mt-1">
                <span>Target</span>
                <span className={`font-mono font-medium ${newW > origW ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {newW} × {newH}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      <Button
        onClick={handleApply}
        disabled={newW < 1 || newH < 1 || (newW === origW && newH === origH)}
        className="w-full"
      >
        Terapkan {mode === 'upscale' ? 'Upscale' : 'Downscale'}
      </Button>
    </div>
  )
}
