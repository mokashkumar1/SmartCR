import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useStudentsStore } from '../../store/studentsStore'
import { useAuthStore } from '../../store/authStore'
import { Plus, AlertCircle, Zap, RotateCcw, BookOpen, Search, MoreVertical, Trash2 } from 'lucide-react'
import BottomNav from '../../components/layout/BottomNav'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { showToast } from '../../components/ui/Toast'

export default function SubjectSelectPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { subjects, fetchSubjects, addSubject, deleteSubject, currentSession, clearCurrentSession } = useAttendanceStore()
  const { students, fetchStudents } = useStudentsStore()
  
  const [newSubject, setNewSubject] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showResume, setShowResume] = useState(false)
  const [search, setSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)

  useEffect(() => {
    fetchSubjects()
    fetchStudents()
  }, [fetchSubjects, fetchStudents])

  useEffect(() => {
    if (currentSession && !currentSession.completed) {
      setShowResume(true)
    } else {
      setShowResume(false)
    }
  }, [currentSession])

  const handleAddSubject = async (e) => {
    e.preventDefault()
    if (!newSubject.trim()) return
    setLoading(true)
    try {
      await addSubject(newSubject.trim())
      setNewSubject('')
      setShowAdd(false)
      showToast('Subject added')
    } catch (err) {
      showToast(err.message || 'Failed to add subject', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSubject = (subjectId, mode = 'take') => {
    if (students.length === 0) {
      showToast('Add students first!', 'error')
      navigate('/students')
      return
    }
    if (mode === 'quick') {
      navigate(`/quick/${subjectId}`)
    } else {
      navigate(`/take/${subjectId}`)
    }
  }

  const handleResume = () => {
    if (!currentSession) return
    navigate(`/take/${currentSession.subject_id}`)
  }

  const handleDiscard = () => {
    clearCurrentSession()
    setShowResume(false)
  }

  const handleDeleteSubject = async (subject) => {
    const confirmed = window.confirm(
      `Delete "${subject.name}"?\n\nThis will also permanently delete its attendance history.`
    )
    if (!confirmed) return

    try {
      await deleteSubject(subject.id)
      setOpenMenuId(null)
      showToast('Class deleted')
    } catch (err) {
      showToast(err.message || 'Failed to delete class', 'error')
    }
  }

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(search.trim().toLowerCase())
  )

  return (
    <div className="app-shell transition-colors duration-200">
      <div className="page-wrap pt-7 pb-4 flex justify-between items-center sticky top-0 bg-surface-bg/90 backdrop-blur-xl z-10">
        <h1 className="text-2xl font-bold text-dark">Classes</h1>
        {!showAdd && (
          <button 
            onClick={() => setShowAdd(true)}
            className="text-[15px] font-semibold text-primary flex items-center bg-primary-light border border-primary/20 px-4 py-2.5 rounded-xl hover:border-primary transition-fast"
          >
            <Plus size={18} className="mr-1" /> Add
          </button>
        )}
      </div>
      <div className="page-wrap mb-5"><div className="relative"><Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-60"/><input value={search} onChange={(event) => setSearch(event.target.value)} className="input-premium h-12 pl-12 pr-4" placeholder="Search classes" aria-label="Search classes"/></div></div>

      {showResume && currentSession && (
        <div className="mx-5 mb-6 p-4 bg-status-warning-light border border-status-warning/20 rounded-lg shadow-card">
          <div className="flex items-start gap-3">
            <RotateCcw size={18} className="text-status-warning mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-status-warning font-bold">Resume session?</p>
              <p className="text-xs text-status-warning/80 mt-1">
                You have an unfinished attendance session.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="flex-1 bg-status-warning hover:bg-status-warning/90 text-white border-none" onClick={handleResume}>Resume</Button>
                <Button size="sm" variant="ghost" className="text-status-warning hover:bg-status-warning/20 border-none" onClick={handleDiscard}>Discard</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {students.length === 0 && (
        <div className="mx-5 mb-6 p-4 bg-status-error-light border border-status-error/20 rounded-lg flex items-start gap-3 shadow-card">
          <AlertCircle size={18} className="text-status-error mt-0.5 shrink-0" />
          <p className="text-sm text-status-error font-medium">You have no students. Add them before taking attendance.</p>
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAddSubject} className="px-5 mt-4 mb-6 scroll-mt-32">
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Class Name (e.g. Data Structures)"
            className="w-full h-9 px-3 bg-surface-card border border-border rounded-md text-md text-dark placeholder:text-dark-30 focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] focus:outline-none transition-fast mb-3 shadow-sm"
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1 rounded-md">Save</Button>
            <Button type="button" variant="neutral" onClick={() => setShowAdd(false)} className="flex-1 rounded-md">Cancel</Button>
          </div>
        </form>
      )}

      <div className="page-wrap space-y-4">
        {filteredSubjects.length === 0 ? (
          <EmptyState title={search ? 'No classes found' : 'No classes yet'} subtitle={search ? 'Try a different search.' : 'Add your first class to start taking attendance.'} />
        ) : (
          filteredSubjects.map((subj) => (
            <div key={subj.id} className="premium-card overflow-hidden">
              <div className="p-5 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-light p-3 rounded-xl">
                    <BookOpen size={22} className="text-primary" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-dark block">{subj.name}</span>
                    <span className="text-sm font-medium text-dark-60 block mt-0.5">{profile?.batch} - {profile?.section}</span>
                  </div>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    aria-label={`More options for ${subj.name}`}
                    aria-expanded={openMenuId === subj.id}
                    onClick={() => setOpenMenuId(openMenuId === subj.id ? null : subj.id)}
                    className="p-2 rounded-lg bg-surface-muted text-dark-60 hover:text-dark transition-fast"
                  >
                    <MoreVertical size={18}/>
                  </button>
                  {openMenuId === subj.id && (
                    <div className="absolute right-0 top-11 z-20 w-48 premium-card p-1.5 shadow-modal">
                      <button
                        type="button"
                        onClick={() => handleDeleteSubject(subj)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-status-error hover:bg-status-error-light transition-fast"
                      >
                        <Trash2 size={17} />
                        Delete class
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-5 py-4 bg-surface-muted/60 flex gap-3">
                <Button
                  size="md"
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleSelectSubject(subj.id, 'take')}
                >
                  Take Attendance
                </Button>
                <Button
                  size="md"
                  variant="neutral"
                  className="flex-1"
                  onClick={() => handleSelectSubject(subj.id, 'quick')}
                >
                  <Zap size={16} className="mr-1.5" /> Quick Mark
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}
