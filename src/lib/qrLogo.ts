import QRCode from 'qrcode'

/** Fraction of the QR code's width the logo (including its white pad) occupies. */
const LOGO_SCALE = 0.24

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load logo image'))
    img.src = src
  })
}

/**
 * Renders a QR code to a PNG data URL, optionally compositing a logo image
 * in the center on a white rounded pad. Uses high error correction so the
 * code stays scannable with the center obscured.
 */
export async function renderQrDataUrl(value: string, size: number, logoDataUrl?: string | null): Promise<string> {
  const canvas = document.createElement('canvas')
  await QRCode.toCanvas(canvas, value, {
    width: size,
    margin: 1,
    errorCorrectionLevel: logoDataUrl ? 'H' : 'M',
  })

  if (logoDataUrl) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const logo = await loadImage(logoDataUrl)
      const padSize = size * LOGO_SCALE
      const padX = (size - padSize) / 2
      const padY = (size - padSize) / 2
      const radius = padSize * 0.16

      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.moveTo(padX + radius, padY)
      ctx.arcTo(padX + padSize, padY, padX + padSize, padY + padSize, radius)
      ctx.arcTo(padX + padSize, padY + padSize, padX, padY + padSize, radius)
      ctx.arcTo(padX, padY + padSize, padX, padY, radius)
      ctx.arcTo(padX, padY, padX + padSize, padY, radius)
      ctx.closePath()
      ctx.fill()

      const logoSize = padSize * 0.82
      const logoX = (size - logoSize) / 2
      const logoY = (size - logoSize) / 2
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
    }
  }

  return canvas.toDataURL('image/png')
}

/** Reads a File (image or SVG) and normalizes it to a square PNG data URL capped at maxDim. */
export async function fileToLogoDataUrl(file: File, maxDim = 240): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })

  const img = await loadImage(rawDataUrl)
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || maxDim, img.naturalHeight || maxDim))
  const w = Math.round((img.naturalWidth || maxDim) * scale)
  const h = Math.round((img.naturalHeight || maxDim) * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(img, 0, 0, w, h)

  return canvas.toDataURL('image/png')
}
