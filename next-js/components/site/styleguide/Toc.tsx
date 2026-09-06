/* In-page table of contents for the styleguide (openspec next-design-system
 * § Visual parity surface). Plain anchors: the browser scrolls, focus lands
 * on the section (scroll-mt keeps the heading clear of the sticky header). */
export interface TocGroup {
  title: string;
  items: { id: string; label: string }[];
}

export function Toc({ groups }: { groups: TocGroup[] }) {
  return (
    <nav
      aria-label="Styleguide contents"
      className="mb-14 rounded-[18px] border border-line bg-alt p-6"
      data-tone="alt"
      data-testid="styleguide-toc"
    >
      <p
        className="mb-4 text-sm font-extrabold uppercase tracking-[0.18em] text-accent"
        data-testid="styleguide-toc-label"
      >
        On this page
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group) => (
          <div key={group.title} data-testid="styleguide-toc-group" data-group={group.title}>
            <p
              className="mb-2 font-display text-[0.95rem] uppercase text-ink"
              data-testid="styleguide-toc-group-title"
            >
              {group.title}
            </p>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {group.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#sg-${item.id}`}
                    className="text-[0.9rem] font-bold text-accent no-underline hover:underline hover:underline-offset-4"
                    data-testid="styleguide-toc-link"
                    data-section-id={item.id}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
