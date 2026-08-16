import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStudentsStore } from '../../store/studentsStore'
import { useAttendanceStore } from '../../store/attendanceStore'
import PageHeader from '../../components/layout/PageHeader'
import ProgressBar from '../../components/ui/ProgressBar'
import Button from '../../components/ui/Button'
import { showToast } from '../../components/ui/Toast'
import { clearDraft, loadDraft, saveDraft, checkpointDraft } from '../../lib/attendanceDraft'
import { supabase } from '../../lib/supabase'
import { Undo2, Check, X, Cloud, WifiOff, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TakingPage() {
  const { subjectId } = useParams(); const navigate = useNavigate()
  const { students, fetchStudents } = useStudentsStore()
  const { currentSession, createSession, completeSession, resumeSession, clearCurrentSession, fetchRecords } = useAttendanceStore()
  const [index, setIndex] = useState(0), [statusMap, setStatusMap] = useState({}), [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [online, setOnline] = useState(navigator.onLine), [lastAction, setLastAction] = useState(null), [synced, setSynced] = useState(false)

  useEffect(() => {
    const connection = () => setOnline(navigator.onLine); window.addEventListener('online', connection); window.addEventListener('offline', connection)
    return () => { window.removeEventListener('online', connection); window.removeEventListener('offline', connection) }
  }, [])
  useEffect(() => {
    const init = async () => {
      let roster = students; if (!roster.length) { await fetchStudents(); roster = useStudentsStore.getState().students }
      if (!roster.length) { showToast('Add students before starting attendance.', 'error'); navigate('/students'); return }
      try {
        let active = currentSession?.subject_id === subjectId && !currentSession.completed ? currentSession : await createSession(subjectId, roster.length)
        setSession(active); resumeSession(active)
        const draft = loadDraft(active.id); let map = draft?.statusMap || {}
        if (!draft) { await fetchRecords(active.id); map = Object.fromEntries(useAttendanceStore.getState().records.filter(r => r.session_id === active.id).map(r => [r.student_id, r.status])) }
        setStatusMap(map); const next = roster.findIndex(student => !map[student.id]); setIndex(next < 0 ? roster.length : next)
      } catch (error) { showToast(error.message || 'Could not start attendance.', 'error'); navigate('/classes') } finally { setLoading(false) }
    }; init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId])
  const persist = useCallback((map) => { if (session) saveDraft(session.id, { subjectId, statusMap: map }) }, [session, subjectId])
  useEffect(() => {
    if (!session || !online || !Object.keys(statusMap).length) return
    setSynced(false)
    const timer = window.setTimeout(async () => { try { await checkpointDraft(session.id, statusMap, supabase); setSynced(true) } catch { setSynced(false) } }, 1200)
    return () => window.clearTimeout(timer)
  }, [session, statusMap, online])
  const marked = Object.keys(statusMap).length, present = Object.values(statusMap).filter(v => v === 'present').length, absent = marked - present, current = students[index]
  const mark = useCallback((status) => {
    if (!session || !current || saving) return
    const map = { ...statusMap, [current.id]: status }; setStatusMap(map); persist(map); setLastAction({ student: current, status }); navigator.vibrate?.(12)
    setIndex(value => value >= students.length - 1 ? students.length : value + 1)
  }, [session, current, saving, statusMap, persist, students.length])
  const undo = useCallback(() => {
    if (!lastAction || saving) return
    const map = { ...statusMap }; delete map[lastAction.student.id]; setStatusMap(map); persist(map); setIndex(value => Math.max(0, value - 1)); setLastAction(null); navigator.vibrate?.(8)
  }, [lastAction, saving, statusMap, persist])
  const finish = async () => {
    if (!session || saving) return; setSaving(true); persist(statusMap)
    try { await completeSession(session.id, Object.entries(statusMap).filter(([, value]) => value === 'absent').map(([id]) => id)); clearDraft(session.id); clearCurrentSession(); navigate(`/summary/${session.id}`) }
    catch { showToast(online ? 'Could not save yet. Your work remains safe on this device.' : 'Offline — your attendance is safely saved on this device.', 'error') } finally { setSaving(false) }
  }
  useEffect(() => { const keys = (event) => { if (event.target.matches('input, textarea, select')) return; if (event.key.toLowerCase() === 'p') mark('present'); if (event.key.toLowerCase() === 'a') mark('absent'); if (event.key.toLowerCase() === 'u') undo() }; window.addEventListener('keydown', keys); return () => window.removeEventListener('keydown', keys) })
  if (loading) return <div className="min-h-[100dvh] grid place-items-center bg-surface-bg"><div className="text-dark-60 animate-pulse">Preparing your class…</div></div>
  if (!current) return <div className="min-h-[100dvh] bg-surface-bg"><PageHeader title="Ready to finish" backTo="/classes" /><main className="max-w-md mx-auto px-4 pt-8"><section className="premium-card p-6 text-center"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-status-success-light text-status-success"><Check size={28}/></div><p className="subtle-label">Attendance complete</p><h1 className="mt-2 text-2xl font-bold text-dark">{students.length} students marked</h1><div className="mt-6 grid grid-cols-3 divide-x divide-border rounded-xl bg-surface-muted py-3"><div><b className="text-lg text-status-success">{present}</b><p className="text-xs text-dark-60">Present</p></div><div><b className="text-lg text-status-error">{absent}</b><p className="text-xs text-dark-60">Absent</p></div><div><b className="text-lg text-dark">{students.length ? Math.round(present / students.length * 100) : 0}%</b><p className="text-xs text-dark-60">Rate</p></div></div><Button size="giant" className="mt-6 w-full" onClick={finish} disabled={saving}>{saving ? 'Saving…' : 'Save & view report'}</Button><button onClick={undo} className="mt-4 min-h-11 text-sm font-semibold text-dark-60"><RotateCcw size={16} className="mr-1 inline"/>Edit last student</button></section></main></div>
  return <div className="min-h-[100dvh] bg-surface-bg pb-[calc(152px+env(safe-area-inset-bottom))]"><PageHeader title="Take attendance" backTo="/classes"/><main className="mx-auto w-full max-w-lg px-4 pt-5"><div className="flex items-center gap-3"><div className="min-w-0 flex-1"><ProgressBar current={marked} total={students.length}/></div><button onClick={undo} disabled={!lastAction} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-muted text-dark disabled:opacity-35" aria-label="Undo last mark"><Undo2 size={19}/></button></div><div className="mt-3 flex justify-between text-xs font-medium"><span className="text-status-success">{present} present</span><span className="text-status-error">{absent} absent</span><span className="text-dark-60">{students.length-marked} left</span></div><AnimatePresence mode="wait"><motion.article key={current.id} drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, info) => info.offset.x > 90 ? mark('present') : info.offset.x < -90 ? mark('absent') : undefined} initial={{opacity:0,y:10,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:.98}} transition={{duration:.18}} className="premium-card mt-6 min-h-[230px] p-6 flex flex-col justify-center text-center select-none"><p className="subtle-label">Roll number</p><div className="mt-2 break-words text-[clamp(2rem,9vw,3.25rem)] font-bold tracking-[-.04em] text-dark">{current.roll_number}</div><div className="mx-auto my-5 h-px w-12 bg-border"/><p className="text-[clamp(1.15rem,5vw,1.5rem)] font-semibold leading-snug text-dark break-words">{current.name}</p><p className="mt-4 text-xs text-dark-60">Swipe or use the buttons below</p></motion.article></AnimatePresence><div className="mt-4 flex justify-center"><span className="inline-flex items-center gap-1.5 text-xs text-dark-60">{online ? <Cloud size={14}/> : <WifiOff size={14}/>}{online ? (synced ? 'Synced' : 'Saving in background…') : 'Offline · saved on this device'}</span></div></main><div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-card/[.97] px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-xl"><div className="mx-auto grid max-w-lg grid-cols-2 gap-3"><Button variant="danger" size="giant" onClick={() => mark('absent')} className="h-16 rounded-2xl text-base"><X size={22} className="mr-2"/>Absent</Button><Button variant="success" size="giant" onClick={() => mark('present')} className="h-16 rounded-2xl text-base"><Check size={22} className="mr-2"/>Present</Button></div></div></div>
}
