import { blobToCanvas } from './canvas'

// pica uses CommonJS export — dynamic import handles interop at runtime
async function getPica() {
  const mod = await import('pica')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PicaFn = (mod as unknown as { default: () => any }).default
  return PicaFn()
}

export async function picaResize(
  srcBlob: Blob,
  targetW: number,
  targetH: number,
  mimeType = 'image/png',
  quality = 0.92,
): Promise<Blob> {
  const srcCanvas = await blobToCanvas(srcBlob)
  const dst = document.createElement('canvas')
  dst.width = targetW
  dst.height = targetH

  const p = await getPica()
  await p.resize(srcCanvas, dst, { quality: 3, alpha: true })
  return p.toBlob(dst, mimeType, quality) as Promise<Blob>
}
