import { saveAs } from 'file-saver'

export function downloadBlob(blob: Blob, filename: string) {
  saveAs(blob, filename)
}

export function getOutputFilename(originalName: string, tool: string, ext?: string): string {
  const baseName = originalName.replace(/\.[^.]+$/, '')
  const extension = ext ?? originalName.split('.').pop() ?? 'png'
  return `${baseName}_${tool}.${extension}`
}
