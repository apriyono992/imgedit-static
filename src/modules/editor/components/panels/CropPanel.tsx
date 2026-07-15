import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { useEditorStore } from '@/store/editorStore'
import { canvasToBlob } from '@/utils/canvas'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const ASPECTS = [
  { label: 'Bebas', value: undefined },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
]

function centerAspectCrop(w: number, h: number, aspect: number): Crop {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, w, h), w, h)
}

export function CropPanel() {
  const { currentBlob, setResult, setIsProcessing } = useEditorStore()
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [aspect, setAspect] = useState<number | undefined>(undefined)
  const [imageUrl, setImageUrl] = useState('')
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!currentBlob) return
    const url = URL.createObjectURL(currentBlob)
    setImageUrl(url)
    setCrop(undefined)
    setCompletedCrop(undefined)
    return () => URL.revokeObjectURL(url)
  }, [currentBlob])

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (aspect) {
        const { width, height } = e.currentTarget
        setCrop(centerAspectCrop(width, height, aspect))
      }
    },
    [aspect],
  )

  const handleAspectChange = (val: number | undefined) => {
    setAspect(val)
    if (imgRef.current && val) {
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, val))
    } else {
      setCrop(undefined)
    }
  }

  const handleApply = async () => {
    if (!completedCrop || !imgRef.current || completedCrop.width < 1 || completedCrop.height < 1)
      return

    setIsProcessing(true)
    try {
      const img = imgRef.current
      const scaleX = img.naturalWidth / img.width
      const scaleY = img.naturalHeight / img.height

      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(completedCrop.width * scaleX)
      canvas.height = Math.floor(completedCrop.height * scaleY)

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(
        img,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height,
      )

      const blob = await canvasToBlob(canvas, currentBlob?.type || 'image/png')
      setResult(blob)
      toast.success('Crop berhasil!')
    } catch {
      toast.error('Gagal crop gambar')
    } finally {
      setIsProcessing(false)
    }
  }

  const validCrop = completedCrop && completedCrop.width > 1 && completedCrop.height > 1

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Rasio</p>
        <div className="flex flex-wrap gap-1.5">
          {ASPECTS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleAspectChange(opt.value)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium border transition-colors',
                aspect === opt.value
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-transparent border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {imageUrl && (
        <div className="rounded-lg overflow-hidden bg-gray-100 border border-gray-400 dark:bg-gray-800 dark:border-gray-700">
          <ReactCrop
            crop={crop}
            onChange={(_, pct) => setCrop(pct)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            minWidth={10}
            minHeight={10}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Crop area"
              className="max-w-full block"
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>
      )}

      {validCrop && (
        <p className="text-xs text-gray-600 dark:text-gray-500">
          Seleksi: {Math.floor(completedCrop.width)} × {Math.floor(completedCrop.height)} px
          (tampilan)
        </p>
      )}

      <Button onClick={handleApply} disabled={!validCrop} className="w-full">
        Terapkan Crop
      </Button>
    </div>
  )
}
