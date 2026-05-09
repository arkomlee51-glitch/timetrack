// ============================================================
//  stores/attendance.js
//  สิ่งที่เปลี่ยน: clockInAction / clockOutAction เรียก API จริง
//                  เพิ่ม fetchRecords() ดึงประวัติจาก Sheets
// ============================================================
import { defineStore }  from 'pinia'
import { ref, computed } from 'vue'
import { apiClockIn, apiClockOut, apiGetAttendance } from '../services/api'
import { useAuthStore } from './auth'

export const useAttendanceStore = defineStore('attendance', () => {

  // ── State ──────────────────────────────────────────────────
  const clockedIn  = ref(false)   // สถานะปัจจุบัน
  const records    = ref([])      // ประวัติเข้า-ออก
  const loading    = ref(false)
  const error      = ref('')

  // ── Actions ────────────────────────────────────────────────

  /** ดึงประวัติเข้า-ออกงานของเดือนนี้จาก Google Sheets */
  async function fetchRecords() {
    const auth  = useAuthStore()
    const month = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
    loading.value = true
    error.value   = ''
    try {
      const data = await apiGetAttendance(auth.currentUser.id, month)
      if (data.success) {
        // แปลงข้อมูลจาก Sheets ให้ตรงกับรูปแบบที่ View ใช้
        records.value = data.data.map(r => ({
          date:       formatDate(r.date),
          clockIn:    r.clock_in  || '—',
          clockOut:   r.clock_out || '—',
          total:      calcTotal(r.clock_in, r.clock_out),
          ot:         r.ot_hours > 0 ? r.ot_hours + ' ชม.' : '—',
          status:     getStatus(r),
          statusText: getStatusText(r),
        }))
        // เช็คว่า วันนี้เข้างานแล้วหรือยัง (clock_out ยังว่าง = ยังทำงานอยู่)
        const today = records.value[0]
        clockedIn.value = today && today.clockIn !== '—' && today.clockOut === '—'
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
        await fetchRecords() // โหลดประวัติใหม่
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
        await fetchRecords() // โหลดประวัติใหม่
      } else {
        error.value = data.message
      }
    } catch (err) {
      error.value = err.message
    }
  }

  // ── Helpers ────────────────────────────────────────────────
  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'2-digit' })
  }

  function calcTotal(inTime, outTime) {
    if (!inTime || !outTime) return '—'
    const [ih, im] = inTime.split(':').map(Number)
    const [oh, om] = outTime.split(':').map(Number)
    const mins     = (oh * 60 + om) - (ih * 60 + im)
    if (mins <= 0) return '—'
    return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`
  }

  function getStatus(r) {
    if (!r.clock_out)   return 'info'     // ยังทำงานอยู่
    if (!r.clock_in)    return 'danger'   // ขาดงาน
    const [ih] = r.clock_in.split(':').map(Number)
    const [im] = r.clock_in.split(':')[1] ? [Number(r.clock_in.split(':')[1])] : [0]
    if (ih > 8 || (ih === 8 && im > 5)) return 'warning' // มาสาย (หลัง 08:05)
    return 'success'
  }

  function getStatusText(r) {
    const s = getStatus(r)
    return { info:'กำลังทำงาน', success:'ปกติ', warning:'มาสาย', danger:'ขาดงาน' }[s]
  }

  const todayRecord = computed(() => records.value[0])

  return { clockedIn, records, todayRecord, loading, error, fetchRecords, clockInAction, clockOutAction }
})
