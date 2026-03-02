import { Link } from 'react-router-dom'
import { QrCode, ScanSearch, RefreshCw, FolderOpen, BarChart3, Download, ChevronRight } from 'lucide-react'

const features = [
  {
    title: 'Create in seconds',
    description: 'Generate a QR code for any URL. Add a name, set the destination, and download or share. No design skills needed.',
    icon: QrCode,
  },
  {
    title: 'Track every scan',
    description: 'Each scan is counted and timestamped. See total scans, unique visitors (via cookie), and last scan time per code.',
    icon: ScanSearch,
  },
  {
    title: 'Redirect without reprinting',
    description: 'Change where your QR code points anytime. Printed codes keep working while you update the target URL in the dashboard.',
    icon: RefreshCw,
  },
  {
    title: 'Organize with collections',
    description: 'Group codes by campaign, location, or client. Filter and manage at scale from one place.',
    icon: FolderOpen,
  },
  {
    title: 'Analytics & insights',
    description: 'View scans over time, top-performing codes, and simple charts. Export or use the data to improve campaigns.',
    icon: BarChart3,
  },
  {
    title: 'Download & share',
    description: 'Download QR images as PNG for print or digital. Share the tracking link so others can scan and you capture the data.',
    icon: Download,
  },
]

export function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Everything you need for QR campaigns
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-sm text-[--color-text-muted]">
          From creation to analytics, QR Studio keeps it simple and powerful.
        </p>
      </div>
      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon
          return (
            <div
              key={f.title}
              className="rounded-2xl border border-[--color-border-subtle] bg-white/90 p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[--color-accent-soft] text-[--color-accent-strong]">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h2>
              <p className="mt-2 text-sm text-[--color-text-muted]">{f.description}</p>
            </div>
          )
        })}
      </div>
      <div className="mt-16 text-center">
        <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
          Get started free
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>
    </div>
  )
}
