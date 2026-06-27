import { create } from 'zustand'
import type { ToolName } from '@/types/editor'

const MAX_HISTORY = 10

interface EditorStore {
  originalFile: File | null
  originalBlob: Blob | null
  currentBlob: Blob | null
  resultBlob: Blob | null
  history: Blob[]
  activeTool: ToolName | null
  isProcessing: boolean
  processingProgress: number
  processingMessage: string

  setFile: (file: File) => void
  setCurrentBlob: (blob: Blob) => void
  setResult: (blob: Blob) => void
  setActiveTool: (tool: ToolName | null) => void
  setIsProcessing: (v: boolean) => void
  setProgress: (v: number) => void
  setMessage: (msg: string) => void
  acceptResult: () => void
  undo: () => void
  resetToOriginal: () => void
  resetEditor: () => void
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  originalFile: null,
  originalBlob: null,
  currentBlob: null,
  resultBlob: null,
  history: [],
  activeTool: null,
  isProcessing: false,
  processingProgress: 0,
  processingMessage: '',

  setFile(file) {
    const blob = new Blob([file], { type: file.type })
    set({
      originalFile: file,
      originalBlob: blob,
      currentBlob: blob,
      resultBlob: null,
      history: [],
      activeTool: null,
    })
  },
  setCurrentBlob: (blob) => set({ currentBlob: blob }),
  setResult: (blob) => set({ resultBlob: blob }),
  setActiveTool(tool) {
    const { resultBlob, currentBlob, history, activeTool } = get()
    if (tool === activeTool) { set({ activeTool: null }); return }
    // auto-commit result sebelum pindah tool agar hasil tidak hilang
    if (resultBlob && currentBlob) {
      const next = history.slice(-(MAX_HISTORY - 1))
      set({ activeTool: tool, currentBlob: resultBlob, resultBlob: null, history: [...next, currentBlob] })
    } else {
      set({ activeTool: tool })
    }
  },
  setIsProcessing: (v) =>
    set({ isProcessing: v, ...(v ? {} : { processingMessage: '', processingProgress: 0 }) }),
  setProgress: (v) => set({ processingProgress: v }),
  setMessage: (msg) => set({ processingMessage: msg }),
  acceptResult() {
    const { resultBlob, currentBlob, history } = get()
    if (!resultBlob) return
    const next = history.slice(-(MAX_HISTORY - 1))
    set({ currentBlob: resultBlob, resultBlob: null, history: [...next, currentBlob!] })
  },
  undo() {
    const { history } = get()
    if (!history.length) return
    const prev = history[history.length - 1]
    set({ currentBlob: prev, resultBlob: null, history: history.slice(0, -1) })
  },
  resetToOriginal() {
    const { originalBlob } = get()
    if (!originalBlob) return
    set({ currentBlob: originalBlob, resultBlob: null, history: [], activeTool: null })
  },
  resetEditor: () =>
    set({
      originalFile: null,
      originalBlob: null,
      currentBlob: null,
      resultBlob: null,
      history: [],
      activeTool: null,
      isProcessing: false,
      processingProgress: 0,
      processingMessage: '',
    }),
}))
