import { useState, useEffect } from 'react'
import { Download, RefreshCcw, RotateCcw, Undo2, ImageOff } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { Button } from '@/components/ui/Button'
import { downloadBlob, getOutputFilename } from '@/utils/download'
import { formatBytes } from '@/utils/format'
import toast from 'react-hot-toast'

function getMimeExt(mimeType: string): string {
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/webp') return 'webp'
  if (mimeType === 'image/png') return 'png'
  return mimeType.split('/')[1] ?? 'png'
}

function useImageDimensions(blob: Blob | null) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null)
  useEffect(() => {
    if (!blob) { setDims(null); return }
    let cancelled = false
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      if (!cancelled) setDims({ w: img.naturalWidth, h: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.src = url
    return () => { cancelled = true; URL.revokeObjectURL(url) }
  }, [blob])
  return dims
}

export function ActionBar() {
  const {
    originalFile, resultBlob, activeTool, history,
    acceptResult, resetEditor, resetToOriginal, undo, setActiveTool,
  } = useEditorStore()

  const resultDims = useImageDimensions(resultBlob)
  const canUndo = history.length > 0
  const canReset = history.length > 0

  const handleDownload = () => {
    if (!resultBlob || !originalFile) return
    const ext = getMimeExt(resultBlob.type || 'image/png')
    const filename = getOutputFilename(originalFile.name, activeTool ?? 'edit', ext)
    downloadBlob(resultBlob, filename)
    toast.success('Download berhasil!')
  }

  const handleEditAgain = () => {
    acceptResult()
    setActiveTool(null)
  }

  const handleUndo = () => {
    undo()
    setActiveTool(null)
  }

  const handleResetToOriginal = () => {
    resetToOriginal()
    toast('Gambar dikembalikan ke versi asli', { icon: '↩' })
  }

  if (!resultBlob) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            leftIcon={<Undo2 size={13} />}
            title={canUndo ? `Undo ${history.length} langkah` : 'Tidak ada riwayat'}
          >
            Undo{canUndo ? ` (${history.length})` : ''}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetToOriginal}
            disabled={!canReset}
            leftIcon={<ImageOff size={13} />}
            title="Kembalikan ke gambar yang diupload"
          >
            Ke Asli
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetEditor}
          leftIcon={<RotateCcw size={13} />}
          className="w-full"
        >
          Ganti Gambar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Result info */}
      <div className="bg-white border border-gray-300 shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:shadow-none rounded-lg px-3 py-2 text-xs space-y-1">
        <div className="flex items-center justify-between text-gray-600">
          <span>Ukuran file</span>
          <span className="text-gray-800 dark:text-gray-300 font-mono">{formatBytes(resultBlob.size)}</span>
        </div>
        {resultDims && (
          <div className="flex items-center justify-between text-gray-600">
            <span>Dimensi</span>
            <span className="text-gray-800 dark:text-gray-300 font-mono">{resultDims.w} × {resultDims.h} px</span>
          </div>
        )}
      </div>

      <Button
        onClick={handleDownload}
        leftIcon={<Download size={14} />}
        className="w-full"
      >
        Download
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleEditAgain}
          leftIcon={<RefreshCcw size={13} />}
          title="Simpan hasil ini dan lanjut edit"
        >
          Edit Lagi
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleUndo}
          disabled={!canUndo}
          leftIcon={<Undo2 size={13} />}
          title={canUndo ? `Undo ${history.length} langkah` : 'Tidak ada riwayat'}
        >
          Undo{canUndo ? ` (${history.length})` : ''}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetToOriginal}
          disabled={!canReset}
          leftIcon={<ImageOff size={13} />}
          title="Kembalikan ke gambar yang diupload"
        >
          Ke Asli
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetEditor}
          leftIcon={<RotateCcw size={13} />}
        >
          Baru
        </Button>
      </div>
    </div>
  )
}
