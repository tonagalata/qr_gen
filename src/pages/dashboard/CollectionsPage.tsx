export function CollectionsPage() {
  return (
    <div className="space-y-6">
      <section className="glass-surface border border-[--color-border-subtle] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[--color-text-muted]">
              Collections
            </p>
            <p className="mt-1 text-sm text-[--color-text-muted]">
              Organize your QR codes into folders for campaigns, locations, or
              clients.
            </p>
          </div>
          <button className="btn-primary h-9 rounded-xl px-4 text-xs">
            New Collection
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {['Campaigns', 'Locations', 'Clients'].map((title, index) => (
            <div
              key={title}
              className="flex flex-col justify-between rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-[--color-border-subtle]"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {title}
                </p>
                <p className="mt-1 text-[11px] text-[--color-text-muted]">
                  {index === 0 && 'Seasonal menus, promos, and events.'}
                  {index === 1 && 'Storefront, tables, and signage.'}
                  {index === 2 && 'Client-specific QR projects and assets.'}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] text-[--color-text-muted]">
                <span>{index === 0 ? '12 codes' : index === 1 ? '8 codes' : '5 codes'}</span>
                <button className="font-medium text-[--color-accent] hover:underline">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-[--color-border-subtle] bg-[--color-surface-soft] px-5 py-6 text-center text-xs text-[--color-text-muted]">
          <p className="text-sm font-semibold text-slate-900">
            No archived collections yet
          </p>
          <p className="mt-1">
            When you archive campaigns, they&apos;ll show up here for easy
            reference without cluttering your workspace.
          </p>
        </div>
      </section>
    </div>
  )
}

