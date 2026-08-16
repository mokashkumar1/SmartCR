import { NavLink, useLocation } from 'react-router-dom'
import { Home, BookOpen, BarChart3, Users } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/classes', icon: BookOpen, label: 'Classes' },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/history', icon: BarChart3, label: 'Reports' },
]

export default function BottomNav() {
  const location = useLocation()
  // Hide on auth pages
  if (location.pathname === '/login' || location.pathname === '/setup') return null

  return (
    <nav aria-label="Primary navigation" className="fixed bottom-0 left-0 right-0 bg-surface-card/[.97] backdrop-blur-xl border-t border-border z-50 shadow-[0_-8px_24px_rgba(0,0,0,.16)] transition-colors duration-200">
      <div className="flex items-center justify-around h-[64px] max-w-3xl mx-auto relative px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.to || (tab.to !== '/' && location.pathname.startsWith(tab.to))
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center w-full min-h-[56px] h-full gap-1 transition-all group ${isActive ? 'text-primary' : 'text-dark-60 hover:text-dark'}`}
            >
              {isActive && <span className="absolute top-0 w-12 h-[3px] bg-primary rounded-b-full shadow-[0_0_14px_rgba(255,59,63,.8)]" />}
              <div className="transition-all">
                <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] transition-fast ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
