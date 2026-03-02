import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

const faqs = [
  {
    q: 'What is a dynamic QR code?',
    a: 'A dynamic QR code points to a short redirect URL we host. When someone scans it, we count the scan and send them to your chosen destination. You can change that destination anytime without changing the printed code.',
  },
  {
    q: 'How are scans tracked?',
    a: 'Each scan hits our redirect URL first. We increment total scans and, when the visitor hasn\'t been counted before (using a cookie), we count a unique scan. We then redirect the user to your target URL.',
  },
  {
    q: 'Can I change where the QR code points?',
    a: 'Yes. Edit the code in the dashboard and set a new target URL. All existing printed or shared QR codes will redirect to the new URL on the next scan.',
  },
  {
    q: 'What file formats can I download?',
    a: 'You can download each QR code as a PNG image (e.g. 256×256 or 512×512) for print or digital use.',
  },
  {
    q: 'Is there an API?',
    a: 'API access is available on higher plans for creating and managing codes programmatically.',
  },
]

export function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[--color-accent-soft] text-[--color-accent-strong]">
          <HelpCircle className="h-6 w-6" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Frequently asked questions
          </h1>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            Quick answers about QR Studio and dynamic QR codes.
          </p>
        </div>
      </div>
      <div className="mt-10 space-y-2">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[--color-border-subtle] bg-white/90 shadow-sm"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-slate-900"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {faq.q}
              {openIndex === i ? (
                <ChevronUp className="h-4 w-4 text-[--color-text-muted]" strokeWidth={2} />
              ) : (
                <ChevronDown className="h-4 w-4 text-[--color-text-muted]" strokeWidth={2} />
              )}
            </button>
            {openIndex === i && (
              <p className="border-t border-[--color-border-subtle] px-5 py-4 text-sm text-[--color-text-muted]">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link to="/signup" className="btn-primary">
          Get started
        </Link>
      </div>
    </div>
  )
}
