import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, backTo, showBack = true }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-surface-bg/90 backdrop-blur-xl border-b border-border">
      <div className="flex items-center h-[72px] px-4 sm:px-6 gap-3 max-w-5xl mx-auto">
        {showBack && (
          <button
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="p-2 -ml-2 rounded-xl active:scale-90 bg-surface-muted hover:text-primary transition-all text-dark-60"
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
