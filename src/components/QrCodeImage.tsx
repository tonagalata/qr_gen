import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface QrCodeImageProps {
  /** Content to encode (URL, text, etc.) */
  value: string
  /** Size in pixels */
  size?: number
  className?: string
  alt?: string
}

/**
 * Renders a scannable QR code image. If value is empty, shows a placeholder.
 */
export function QrCodeImage({ value, size = 128, className = '', alt = 'QR code' }: QrCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!value || !value.trim()) {
      setDataUrl(null)
      setError(false)
      return
    }
    setError(false)
    QRCode.toDataURL(value.trim(), { width: size, margin: 1 })
      .then(setDataUrl)
      .catch(() => setError(true))
  }, [value, size])

  if (error || !dataUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 ${className}`}
        style={{ width: size, height: size }}
        title={value ? 'Failed to generate QR' : 'No URL set'}
      >
        <div className="h-1/2 w-1/2 rounded-[4px] border-2 border-current" aria-hidden />
      </div>
    )
  }

  return (
    <img
      src={dataUrl}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-xl bg-white object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
