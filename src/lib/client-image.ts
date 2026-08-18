const MAX_DIMENSION = 1920
const WEBP_QUALITY = 0.82

export async function compressImageForUpload(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas no soportado en este navegador')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY))
  if (!blob) throw new Error('No se pudo comprimir la imagen')

  const name = `${file.name.replace(/\.[^.]+$/, '')}.webp`
  return new File([blob], name, { type: 'image/webp' })
}
