export function blobToImageElement(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Gagal memuat gambar'))
    }
    img.src = url
  })
}

export function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  return canvas
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType = 'image/png',
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob gagal'))
      },
      mimeType,
      quality,
    )
  })
}

export async function blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  const img = await blobToImageElement(blob)
  return imageToCanvas(img)
}
