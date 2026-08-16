export default function ProgressBar({ current, total, label }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-dark-60 font-semibold mb-2">
        <span>{label || `Student ${Math.min(current + 1, total)} of ${total}`}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2.5 bg-border rounded-full overflow-hidden" role="progressbar" aria-valuemin="0" aria-valuemax={total} aria-valuenow={current} aria-label="Attendance progress">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
