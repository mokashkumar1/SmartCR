const prefix = 'smartcr:attendance-draft:'

export const draftKey = (sessionId) => `${prefix}${sessionId}`

export function loadDraft(sessionId) {
  try {
    const value = localStorage.getItem(draftKey(sessionId))
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function saveDraft(sessionId, draft) {
  try {
    localStorage.setItem(draftKey(sessionId), JSON.stringify({ ...draft, savedAt: Date.now() }))
    return true
  } catch {
    return false
  }
}

export function clearDraft(sessionId) {
  try { localStorage.removeItem(draftKey(sessionId)) } catch { /* storage can be unavailable */ }
}

// A draft remains on-device until the session is completed, even after this
// background checkpoint succeeds. That makes recovery safe on refresh/crash.
export async function checkpointDraft(sessionId, statusMap, supabase) {
  const rows = Object.entries(statusMap).map(([student_id, status]) => ({ session_id: sessionId, student_id, status }))
  if (!rows.length) return
  const { error } = await supabase.from('attendance_records').upsert(rows, { onConflict: 'session_id,student_id' })
  if (error) throw error
}
