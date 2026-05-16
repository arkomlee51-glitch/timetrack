// ============================================================
//  stores/attendance.js
// ============================================================
import { defineStore }   from 'pinia'
import { ref, computed } from 'vue'
import { apiClockIn, apiClockOut, apiGetAttendance } from '../services/api'
import { useAuthStore } from './auth'

const PAGE_SIZE = 10

export const useAttendanceStore = defineStore('attendance', () => {

  // ── State ──────────────────────────────────────────────────
  const clockedIn   = ref(false)
  const records     = ref([])
  const todayRecord = ref(null)
  const loading     = ref(false)
  const error       = ref('')

  // ── Pagination state ────────────────────────────────────────
  const currentPage = ref(1)
  const totalCount  = ref(0)
  const totalPages  = computed(() => Math.max(1, Math.ceil(totalCount.value / PAGE_SIZE)))

  // ── Actions ────────────────────────────────────────────────

  /** ดึงประวัติหน้าที่ต้องการ
   *  @param {number} page        - หน้าที่ต้องการ (default 1)
   *  @param {string} targetMonth - 'YYYY-MM' (default เดือนปัจจุบัน)
   */
  async function fetchRecords(page = 1, targetMonth = null) {
    const auth  = useAuthStore()
    const month = targetMonth ?? new Date().toISOString().slice(0, 7)
    loading.value     = true
    error.value       = ''
    currentPage.value = page
    try {
      const data = await apiGetAttendance(auth.currentUser.id, month, page, PAGE_SIZE)
      if (data.success) {
        records.value    = (data.data ?? []).map(mapRecord)
        totalCount.value = data.total ?? records.value.length

        // todayRecord และ clockedIn อัพเดตจากหน้าแรกเท่านั้น
        if (page === 1) {
          const first = records.value[0] ?? null
          const isToday = first && isDateToday(first._rawDate)
          todayRecord.value = isToday ? first : null
          clockedIn.value   = isToday && first.clockIn !== '—' && first.clockOut === '—'
        }
      } else {
        error.value = data.message || 'โหลดข้อมูลไม่ได้'
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /** กดเข้างาน */
  async function clockInAction() {
    const auth = useAuthStore()
    error.value = ''
    try {
      const data = await apiClockIn(auth.currentUser.id)
      if (data.success) {
        clockedIn.value = true
        await fetchRecords(1)
      } else {
        error.value = data.message
      }
    } catch (err) {
      error.value = err.message
    }
  }

  /** กดออกงาน */
  async function clockOutAction() {
    const auth = useAuthStore()
    error.value = ''
    try {
      const data = await apiClockOut(auth.currentUser.id)
      if (data.success) {
        clockedIn.value = false
        await fetchRecords(currentPage.value)
      } else {
        error.value = data.message
      }
    } catch (err) {
      error.value = err.message
    }
  }

  // ── Helpers ────────────────────────────────────────────────
  function mapRecord(r) {
    return {
      _rawDate:   r.date,
      date:       formatDate(r.date),
      clockIn:    r.clock_in  || '—',
      clockOut:   r.clock_out || '—',
      total:      calcTotal(r.clock_in, r.clock_out),
      ot:         r.ot_hours > 0 ? r.ot_hours + ' ชม.' : '—',
      status:     getStatus(r),
      statusText: getStatusText(r),
    }
  }

  function isDateToday(dateStr) {
    if (!dateStr) return false
    const d = new Date(dateStr)
    const t = new Date()
    return d.getFullYear() === t.getFullYear()
      && d.getMonth()      === t.getMonth()
      && d.getDate()       === t.getDate()
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'2-digit' })
  }

  function calcTotal(inTime, outTime) {
    if (!inTime || !outTime) return '—'
    const [ih, im] = inTime.split(':').map(Number)
    const [oh, om] = outTime.split(':').map(Number)
    const mins = (oh * 60 + om) - (ih * 60 + im)
    if (mins <= 0) return '—'
    return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`
  }

  function getStatus(r) {
    if (!r.clock_in)  return 'danger'
    if (!r.clock_out) return 'info'
    const [h, m] = r.clock_in.split(':').map(Number)
    if (h > 8 || (h === 8 && m > 5)) return 'warning'
    return 'success'
  }

  function getStatusText(r) {
    return { info:'กำลังทำงาน', success:'ปกติ', warning:'มาสาย', danger:'ขาดงาน' }[getStatus(r)]
  }

  return {
    clockedIn, records, todayRecord, loading, error,
    currentPage, totalCount, totalPages,
    fetchRecords, clockInAction, clockOutAction,
  }
})
