import { Crop, Scaling, Eraser, FileImage, ArrowUpDown, RotateCw } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import type { ToolName } from '@/types/editor'
import { cn } from '@/utils/cn'

const tools: { name: ToolName; icon: typeof Crop; label: string }[] = [
  { name: 'crop', icon: Crop, label: 'Crop' },
  { name: 'resize', icon: Scaling, label: 'Resize' },
  { name: 'remove-background', icon: Eraser, label: 'Remove BG' },
  { name: 'reformat', icon: FileImage, label: 'Reformat' },
  { name: 'upscale', icon: ArrowUpDown, label: 'Scale' },
  { name: 'rotate', icon: RotateCw, label: 'Rotate' },
]

export function ToolSelector() {
  const { activeTool, setActiveTool, isProcessing } = useEditorStore()

  return (
    <div className="grid grid-cols-3 gap-1">
      {tools.map(({ name, icon: Icon, label }) => (
        <button
          key={name}
          onClick={() => setActiveTool(name)}
          disabled={isProcessing}
          className={cn(
            'flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg text-xs font-medium transition-colors',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            activeTool === name
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800',
          )}
        >
          <Icon size={17} />
          <span className="text-[10px] leading-none">{label}</span>
        </button>
      ))}
    </div>
  )
}
