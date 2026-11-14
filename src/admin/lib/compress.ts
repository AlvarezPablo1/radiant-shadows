/**
 * Antes de subir una imagen: la achica (no hace falta más de 1400 px) y la pasa a WebP, que pesa mucho menos
 * que PNG/JPG y mantiene la transparencia. Si el navegador no sabe generar WebP (Safari viejo) o el resultado
 * no pesa menos, se sube la original. Los GIF se dejan como están (pueden ser animados).
 */
export async function compressImage(file: File, max = 1400, quality = 0.86): Promise<File> {
  if (file.type === 'image/gif') return file
  try {
    const img = await createImageBitmap(file)
    const scale = Math.min(1, max / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', quality))
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.[a-z0-9]+$/i, '') + '.webp', { type: 'image/webp' })
  } catch {
    return file
  }
}
