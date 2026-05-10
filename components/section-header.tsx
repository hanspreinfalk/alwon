import type { ReactNode } from 'react'

interface SectionHeaderProps {
  /** Optional. Old API used numbers like "01"; ignored now but kept so existing call sites don't break. */
  number?: string
  /** The section title — shown in friendly sentence case. */
  title: string
  /** Optional subtitle / helper line under the title. */
  description?: string
  /** Optional right-side action (link/button). */
  action?: ReactNode
}

/**
 * Section header. Was previously the very technical
 *   ● 01 / LIVE EVENT STREAM
 * Now reads as a plain sentence:
 *   What's happening now
 *   Live activity from your stores · View all →
 */
export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  // Format ALL CAPS titles back to sentence case so older call sites
  // ("LIVE EVENT STREAM") still render nicely without per-page edits.
  const display =
    title === title.toUpperCase()
      ? title.charAt(0) + title.slice(1).toLowerCase()
      : title

  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <h2
          className="text-sm font-semibold leading-snug"
          style={{ color: 'var(--fg)' }}
        >
          {display}
        </h2>
        {description && (
          <p
            className="text-xs mt-0.5"
            style={{ color: 'var(--fg-muted)' }}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <div
          className="text-xs shrink-0"
          style={{ color: 'var(--fg-muted)' }}
        >
          {action}
        </div>
      )}
    </div>
  )
}
