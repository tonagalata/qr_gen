import { Link } from 'react-router-dom'
import { QrCode, RefreshCw, BarChart3, Share2, BookOpen, ExternalLink } from 'lucide-react'

const sections = [
  {
    icon: QrCode,
    title: 'What is a dynamic QR code?',
    body: 'A dynamic QR code points to a short redirect URL hosted by QR Studio. When someone scans it, they hit our server first—we record the scan—then we send them to your chosen destination (your menu, website, Wi‑Fi page, etc.). The code itself never changes; only the destination you set in the dashboard does.',
  },
  {
    icon: RefreshCw,
    title: 'Change the destination anytime',
    body: 'With static QR codes, the URL is fixed in the image. If you need to change where it goes, you have to reprint. With dynamic codes, you edit the target URL in your dashboard and every existing scan—on print, posters, or screens—starts redirecting to the new link. No reprint required.',
  },
  {
    icon: BarChart3,
    title: 'Track every scan',
    body: 'Because each scan goes through our redirect, we can count total scans, estimate unique visitors (via a cookie), and record the last scan time per code. Use the Analytics page to see which codes perform best and how traffic changes over time.',
  },
  {
    icon: Share2,
    title: 'One code, many uses',
    body: 'Use the same dynamic code on menus, flyers, table tents, and social. Update the link for seasonal promos, new events, or A/B tests without changing the printed or shared image.',
  },
]

const externalResource = {
  label: 'Wikipedia: QR code',
  url: 'https://en.wikipedia.org/wiki/QR_code',
  description: 'General background on QR codes and how they work.',
}

export function LearnPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[--color-accent-soft] text-[--color-accent-strong]">
          <BookOpen className="h-6 w-6" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Learn about dynamic QR codes
          </h1>
          <p className="mt-2 text-sm text-[--color-text-muted]">
            How they work and why they’re better for campaigns.
          </p>
        </div>
      </div>

      <div className="mt-12 space-y-10">
        {sections.map(({ icon: Icon, title, body }) => (
          <section key={title} className="rounded-2xl border border-[--color-border-subtle] bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[--color-accent-soft] text-[--color-accent-strong]">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[--color-text-muted]">{body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-dashed border-[--color-border-subtle] bg-[--color-surface-soft]/50 p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-[--color-text-muted]">
          Further reading
        </p>
        <a
          href={externalResource.url}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 flex items-center gap-2 text-sm font-medium text-[--color-accent] hover:underline"
        >
          {externalResource.label}
          <ExternalLink className="h-4 w-4" strokeWidth={2} />
        </a>
        <p className="mt-1 text-xs text-[--color-text-muted]">{externalResource.description}</p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
          Get started with QR Studio
        </Link>
        <Link to="/dashboard" className="btn-ghost inline-flex items-center gap-2">
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
