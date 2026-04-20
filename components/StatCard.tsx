interface Props {
  label:     string
  value:     number
  formatted: string
  icon:      string
  accent:    string
}

export default function StatCard({ label, formatted, icon, accent }: Props) {
  return (
    <div
      className="rounded-xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-1 cursor-default group"
      style={{
        background: '#0F1620',
        border: '1px solid rgba(0,194,255,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.border = `1px solid ${accent}40`
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${accent}18`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(0,194,255,0.1)'
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
      }}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-base mb-3"
        style={{ background: `${accent}18` }}
      >
        {icon}
      </div>

      {/* Value */}
      <div
        className="font-display font-black text-2xl sm:text-3xl leading-none mb-1"
        style={{ color: accent }}
      >
        {formatted}
      </div>

      {/* Label */}
      <div className="text-[#8892A4] text-xs font-medium leading-tight">{label}</div>
    </div>
  )
}
