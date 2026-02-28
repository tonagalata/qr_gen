export interface QrCode {
  id: string
  name: string
  subtitle: string
  target_url: string
  status: 'active' | 'paused' | 'archived' | 'static' | 'expired'
  total_scans: number
  unique_scans: number
  last_scan_at: string | null
  created_at: string
  updated_at: string
}

export type QrCodeCreate = Pick<QrCode, 'name'> & Partial<Pick<QrCode, 'subtitle' | 'target_url' | 'status'>>
export type QrCodeUpdate = Partial<Pick<QrCode, 'name' | 'subtitle' | 'target_url' | 'status'>>
