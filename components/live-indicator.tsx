export function LiveIndicator({ className = '' }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`} style={{ width: 12, height: 12 }}>
      <span
        className="live-ring absolute inset-0 rounded-full"
        style={{ background: 'var(--brand-accent)', opacity: 0.4 }}
      />
      <span
        className="live-dot relative block rounded-full"
        style={{ width: 6, height: 6, background: 'var(--brand-accent)' }}
      />
    </span>
  )
}
