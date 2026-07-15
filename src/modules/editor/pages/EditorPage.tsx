import { useEffect } from 'react'
import { useEditorStore } from '@/store/editorStore'
import { formatBytes } from '@/utils/format'
import { UploadZone } from '../components/UploadZone'
import { ImagePreview } from '../components/ImagePreview'
import { ToolSelector } from '../components/ToolSelector'
import { ActionBar } from '../components/ActionBar'
import { ProcessingOverlay } from '../components/ProcessingOverlay'
import { CropPanel } from '../components/panels/CropPanel'
import { ResizePanel } from '../components/panels/ResizePanel'
import { RemoveBgPanel } from '../components/panels/RemoveBgPanel'
import { ReformatPanel } from '../components/panels/ReformatPanel'
import { UpscalePanel } from '../components/panels/UpscalePanel'
import { RotatePanel } from '../components/panels/RotatePanel'

const TOOL_HINTS: Record<string, string> = {
  crop: 'Pilih area yang ingin dipertahankan dari gambar',
  resize: 'Ubah dimensi gambar dengan presisi',
  'remove-background': 'Hapus background otomatis via AI (model berjalan di browser)',
  reformat: 'Konversi format dan atur kualitas output',
  upscale: 'Perbesar atau perkecil gambar dengan kualitas tinggi',
  rotate: 'Putar atau balik gambar sesuai kebutuhan',
}

function ActivePanel() {
  const activeTool = useEditorStore((s) => s.activeTool)

  switch (activeTool) {
    case 'crop':              return <CropPanel />
    case 'resize':            return <ResizePanel />
    case 'remove-background': return <RemoveBgPanel />
    case 'reformat':          return <ReformatPanel />
    case 'upscale':
    case 'downscale':         return <UpscalePanel />
    case 'rotate':            return <RotatePanel />
    default:
      return (
        <div className="py-8 text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-500 text-sm">Pilih tool di atas untuk mulai edit</p>
          <div className="space-y-2 text-left">
            {Object.entries(TOOL_HINTS).map(([tool, hint]) => (
              <div key={tool} className="flex gap-2 text-xs text-gray-600 dark:text-gray-600">
                <span className="text-indigo-500 shrink-0">›</span>
                <span><span className="text-gray-800 dark:text-gray-400 capitalize">{tool.replace('-', ' ')}</span>: {hint}</span>
              </div>
            ))}
          </div>
        </div>
      )
  }
}

export function EditorPage() {
  const { currentBlob, originalFile, undo, history, isProcessing } = useEditorStore()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (isProcessing || !history.length) return
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, history, isProcessing])

  if (!currentBlob) return <UploadZone />

  return (
    <>
      <div className="editor-layout">

        {/* Atas (mobile) / Kiri (desktop): area preview gambar */}
        <div className="editor-preview">
          <div className="editor-canvas">
            <ImagePreview />
          </div>

          {originalFile && (
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-600 px-1 shrink-0">
              <span className="truncate max-w-[60%]" title={originalFile.name}>
                {originalFile.name}
              </span>
              <span>{formatBytes(originalFile.size)}</span>
            </div>
          )}
        </div>

        {/* Bawah (mobile) / Kanan (desktop): tool panel */}
        <div className="editor-sidebar">
          <div className="px-4 pt-4 pb-3 border-b border-gray-300 dark:border-gray-800 shrink-0">
            <ToolSelector />
          </div>

          <div className="overflow-auto px-4 py-4 flex-1 min-h-0">
            <ActivePanel />
          </div>

          <div className="px-4 py-3 border-t border-gray-300 dark:border-gray-800 shrink-0">
            <ActionBar />
          </div>
        </div>
      </div>

      <ProcessingOverlay />
    </>
  )
}
