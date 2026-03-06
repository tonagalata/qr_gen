/**
 * Returns the public URL that tracks a scan and redirects to the code's target.
 * Use this as the value when generating QR images and downloads so scans are counted.
 */
export function getScanUrl(codeId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/r/${codeId}`
  }
  return `/r/${codeId}`
}

/**
 * Returns the marketing-friendly short link for sharing (e.g. in emails, bios).
 * Tracks clicks using the same scan counters as the QR code.
 */
export function getShortUrl(slug: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/s/${slug}`
  }
  return `/s/${slug}`
}
