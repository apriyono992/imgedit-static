import { createPortal } from 'react-dom'
import { useEditorStore } from '@/store/editorStore'
import { Spinner } from '@/components/ui/Spinner'

export function ProcessingOverlay() {
  const { isProcessing, processingProgress, processingMessage } = useEditorStore()

  if (!isProcessing) return null

  const hasProgress = processingProgress > 0 && processingProgress < 100

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/85 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-80 text-center shadow-2xl">
        <Spinner size="lg" className="mx-auto mb-5" />
        <p className="text-gray-200 font-semibold mb-1">
          {processingMessage || 'Memproses gambar...'}
        </p>
        {hasProgress ? (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Progress</span>
              <span>{processingProgress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">Hanya download sekali, lalu tersimpan di browser</p>
          </div>
        ) : (
          <p className="text-xs text-gray-600 mt-1">Mohon tunggu sebentar</p>
        )}
      </div>
    </div>,
    document.body,
  )
}
