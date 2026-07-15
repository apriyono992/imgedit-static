import { useState, useRef } from 'react'
import { Upload, ImageIcon } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

const MAX_SIZE = 30 * 1024 * 1024 // 30 MB

export function UploadZone() {
  const { setFile } = useEditorStore()
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPEG, PNG, WebP, dsb.)')
      return
    }
    if (file.size > MAX_SIZE) {
      toast.error('Ukuran gambar maksimal 30 MB')
      return
    }
    setFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = '' // allow re-selecting same file
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="text-indigo-400" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Editor Gambar</h1>
          <p className="text-sm text-gray-600 dark:text-gray-500">Semua proses terjadi di browser — gambarmu tidak dikirim ke server</p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all',
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]'
              : 'border-gray-400 hover:border-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-900',
          )}
        >
          <Upload
            size={36}
            className={cn(
              'mx-auto mb-4 transition-colors',
              isDragging ? 'text-indigo-400' : 'text-gray-500 dark:text-gray-600',
            )}
          />
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-1.5">
            {isDragging ? 'Lepaskan gambar di sini' : 'Drag & drop gambar di sini'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-600">atau klik untuk pilih file</p>
          <p className="text-xs text-gray-500 dark:text-gray-700 mt-3">JPEG · PNG · WebP · GIF · BMP · max 30 MB</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
