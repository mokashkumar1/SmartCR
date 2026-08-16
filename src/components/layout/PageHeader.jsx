import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, backTo, showBack = true }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-surface-bg/[.94] backdrop-blur-xl border-b border-border">
      <div className="flex items-center min-h-[60px] pt-[env(safe-area-inset-top)] px-4 sm:px-6 gap-3 max-w-5xl mx-auto">
        {showBack && (
          <button
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="h-11 w-11 p-0 -ml-2 rounded-xl active:scale-90 bg-surface-muted hover:text-primary transition-all text-dark-60"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-dark truncate">{title}</h1>
      </div>
    </header>
  )
}
