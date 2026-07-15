import { useState, useEffect } from 'react'
import { useEditorStore } from '@/store/editorStore'

function useObjectUrl(blob: Blob | null): string {
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (!blob) { setUrl(''); return }
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])

  return url
}

export function ImagePreview() {
  const { currentBlob, resultBlob } = useEditorStore()
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    setShowResult(!!resultBlob)
  }, [resultBlob])

  const displayBlob = showResult && resultBlob ? resultBlob : currentBlob
  const url = useObjectUrl(displayBlob)

  if (!url) return null

  return (
    <div
      className="relative flex-1 min-h-0 rounded-xl overflow-hidden"
      style={{
        // Inline style agar tidak bergantung pada Tailwind class generation
        backgroundImage: 'repeating-conic-gradient(#1f2937 0% 25%, #374151 0% 50%)',
        backgroundSize: '20px 20px',
      }}
    >
      {/*
        absolute inset-0 → mengisi parent sepenuhnya (tidak bergantung pada flex height propagation)
        object-fit: contain → gambar di-scale + di-center otomatis dalam kotak
        — ini cara paling reliable untuk center gambar di container ukuran bebas
      */}
      <img
        src={url}
        alt="Preview gambar"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />

      {resultBlob && (
        <div className="absolute top-3 right-3 flex bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-lg p-1 gap-1 border border-gray-300 shadow-sm dark:border-gray-800 dark:shadow-none">
          <button
            onClick={() => setShowResult(false)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              !showResult
                ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Sebelum
          </button>
          <button
            onClick={() => setShowResult(true)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              showResult
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Sesudah
          </button>
        </div>
      )}
    </div>
  )
}
