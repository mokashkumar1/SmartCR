import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'

const LoginPage = lazy(() => import('./pages/Auth/LoginPage'))
const SetupPage = lazy(() => import('./pages/Auth/SetupPage'))
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage'))
const SubjectSelectPage = lazy(() => import('./pages/Attendance/SubjectSelectPage'))
const TakingPage = lazy(() => import('./pages/Attendance/TakingPage'))
const QuickMarkPage = lazy(() => import('./pages/Attendance/QuickMarkPage'))
const SummaryPage = lazy(() => import('./pages/Attendance/SummaryPage'))
const StudentsPage = lazy(() => import('./pages/Students/StudentsPage'))
const HistoryPage = lazy(() => import('./pages/History/HistoryPage'))
const SessionDetailPage = lazy(() => import('./pages/History/SessionDetailPage'))
const SubjectStatsPage = lazy(() => import('./pages/History/SubjectStatsPage'))
const LowAttendancePage = lazy(() => import('./pages/History/LowAttendancePage'))
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'))
const HomePage = lazy(() => import('./pages/Home/HomePage'))

const RouteLoader = () => (
  <div className="min-h-screen bg-surface-bg flex items-center justify-center">
    <div className="text-sm font-medium text-dark-60 animate-pulse">Loading SmartCR...</div>
  </div>
)

function App() {
  const { session, profile, initialized, initAuth } = useAuthStore()
  const { theme } = useThemeStore()
  // Local UI preview only. Production builds still require normal authentication.
  const isLocalPreview = import.meta.env.DEV

  useEffect(() => {
    initAuth()
  }, [initAuth])

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  if (!initialized) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center transition-colors duration-200">
        <div className="animate-pulse text-dark-60">Loading...</div>
      </div>
    )
  }

  // Not logged in
  if (!session && !isLocalPreview) {
    return (
      <Suspense fallback={<RouteLoader />}><Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes></Suspense>
    )
  }

  // Logged in but no profile yet
  if (!profile && !isLocalPreview) {
    return (
      <Suspense fallback={<RouteLoader />}><Routes>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes></Suspense>
    )
  }

  // Fully authenticated
  return (
    <div className="min-h-screen bg-transparent pb-20 transition-colors duration-200">
      <Suspense fallback={<RouteLoader />}><Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/classes" element={<SubjectSelectPage />} />
        <Route path="/take/:subjectId" element={<TakingPage />} />
        <Route path="/quick/:subjectId" element={<QuickMarkPage />} />
        <Route path="/summary/:sessionId" element={<SummaryPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:sessionId" element={<SessionDetailPage />} />
        <Route path="/stats/:subjectId" element={<SubjectStatsPage />} />
        <Route path="/low-attendance" element={<LowAttendancePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes></Suspense>
    </div>
  )
}

export default App
