import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useStudentsStore } from '../../store/studentsStore'
import { useAttendanceStore } from '../../store/attendanceStore'
import { Settings, Users, CheckCircle2, UserRoundX, TrendingUp, AlertTriangle, ScanLine, ChevronRight, Clock3 } from 'lucide-react'
import BottomNav from '../../components/layout/BottomNav'
import Button from '../../components/ui/Button'

export default function HomePage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { students, fetchStudents } = useStudentsStore()
  const { sessions, records, fetchSessions, fetchRecords } = useAttendanceStore()

  useEffect(() => {
    const loadDashboard = async () => {
      await Promise.all([fetchStudents(), fetchSessions()])
      await fetchRecords()
    }
    loadDashboard()
  }, [fetchStudents, fetchSessions, fetchRecords])

  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  
  let totalStudents = students.length || 0
  let present = 0
  let absent = 0
  let attendancePerc = null

  const latestSession = sessions.find((session) => session.completed)
  if (latestSession) {
    const sessionRecords = records.filter((record) => record.session_id === latestSession.id)
    absent = sessionRecords.filter((record) => record.status === 'absent').length
    totalStudents = latestSession.total_students
    present = Math.max(0, totalStudents - absent)
    attendancePerc = totalStudents > 0 ? ((present / totalStudents) * 100).toFixed(1) : 0
  }

  return (
    <div className="app-shell transition-colors duration-200">
      {/* Top Bar */}
      <div className="page-wrap pt-6 pb-4 flex justify-between items-center bg-surface-bg/85 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ff4c50] to-[#d71920] flex items-center justify-center shadow-lg"><CheckCircle2 size={24} className="text-white"/></div>
          <div><p className="text-lg font-bold leading-none">Attendance</p><p className="text-[11px] text-dark-60 mt-1">by Smart<span className="text-[#8177ff]">CR</span></p></div>
        </div>
        <div className="flex gap-2">
        <button 
          className="text-dark p-2.5 transition-fast active:scale-95 bg-primary-light border border-primary/20 rounded-full"
          onClick={() => navigate('/settings')}
          aria-label="Settings"
        >
          <Settings size={24} />
        </button></div>
      </div>

      <div className="page-wrap">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark mb-1">
            Hello, {profile?.cr_name?.split(' ')[0] || 'CR'} 👋
          </h1>
          <p className="text-sm font-medium text-dark-60">
            {profile?.batch} {profile?.dept_code} - Section {profile?.section}
          </p>
        </div>

        {/* Today's Summary */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <h2 className="section-title">Today's Attendance</h2>
            <span className="text-xs font-medium text-dark-60">{formattedDate}</span>
          </div>

          <div className="premium-card p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Students */}
            <div className="bg-surface-muted p-4 rounded-xl border border-border">
              <p className="text-xs font-semibold text-dark-60 mb-1">Total Students</p>
              <div className="flex justify-between items-end">
                <h3 className="text-2xl font-bold text-dark">{totalStudents}</h3>
                <div className="bg-primary-light p-1.5 rounded-md">
                  <Users size={18} className="text-primary" />
                </div>
              </div>
            </div>

            {/* Present */}
            <div className="bg-surface-muted p-4 rounded-xl border border-border">
              <p className="text-xs font-semibold text-dark-60 mb-1">Present</p>
              <div className="flex justify-between items-end">
                <h3 className="text-2xl font-bold text-status-success">{present}</h3>
                <div className="bg-status-success-light p-1.5 rounded-md">
                  <CheckCircle2 size={18} className="text-status-success" />
                </div>
              </div>
            </div>

            {/* Absent */}
            <div className="bg-surface-muted p-4 rounded-xl border border-border">
              <p className="text-xs font-semibold text-dark-60 mb-1">Absent</p>
              <div className="flex justify-between items-end">
                <h3 className="text-2xl font-bold text-status-error">{absent}</h3>
                <div className="bg-status-error-light p-1.5 rounded-md">
                  <UserRoundX size={18} className="text-status-error" />
                </div>
              </div>
            </div>

            {/* Attendance % */}
            <div className="bg-surface-muted p-4 rounded-xl border border-border">
              <p className="text-xs font-semibold text-dark-60 mb-1">Attendance</p>
              <div className="flex justify-between items-end">
                <h3 className="text-2xl font-bold text-primary">{attendancePerc === null ? '—' : `${attendancePerc}%`}</h3>
                <div className="bg-primary-light p-1.5 rounded-md">
                  <TrendingUp size={18} className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Take Attendance Button */}
        <div className="mb-8">
          <Button 
            size="giant" 
            variant="primary"
            className="w-full"
            onClick={() => navigate('/classes')}
          >
            <ScanLine size={20} className="mr-2" /> Take Attendance
          </Button>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-dark mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {/* View History */}
            <Link to="/history" className="premium-card p-5 active:scale-[0.98] transition-fast hover:border-primary/40">
              <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center mb-5">
                <Clock3 size={22} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-dark">View History</h3>
                <p className="text-sm text-dark-60 mt-0.5">Check past attendance</p>
              </div>
              <ChevronRight size={18} className="text-primary mt-4" />
            </Link>

            {/* Low Attendance */}
            <Link to="/low-attendance" className="premium-card p-5 active:scale-[0.98] transition-fast hover:border-status-warning/40">
              <div className="w-12 h-12 bg-status-warning-light rounded-xl flex items-center justify-center mb-5">
                <AlertTriangle size={22} className="text-status-warning" />
              </div>
              <div className="flex-1">
                <h3 className="text-md font-semibold text-dark">Low Attendance</h3>
                <p className="text-sm text-dark-60 mt-0.5">Students below 75%</p>
              </div>
              <ChevronRight size={18} className="text-status-warning mt-4" />
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
