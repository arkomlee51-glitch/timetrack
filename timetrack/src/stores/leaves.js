// ============================================================
//  stores/leaves.js
//  สิ่งที่เปลี่ยน: fetch จาก Sheets จริง + approve/reject ส่งไป API
// ============================================================
import { defineStore }   from 'pinia'
import { ref, computed } from 'vue'
import { apiGetLeaves, apiApproveLeave, apiRequestLeave } from '../services/api'
import { useAuthStore }  from './auth'

export const useLeavesStore = defineStore('leaves', () => {

  // ── State ──────────────────────────────────────────────────
  const items   = ref([])
  const loading = ref(false)
  const error   = ref('')

  // ── Actions ────────────────────────────────────────────────

  /** ดึงรายการใบลาจาก Google Sheets */
  async function fetchLeaves() {
    const auth = useAuthStore()
    loading.value = true
    error.value   = ''
    try {
      // Admin → ดูทุกคน (ไม่ส่ง emp_id)
      // Employee → ดูของตัวเอง (ส่ง emp_id ของตัวเอง)
      const emp_id = auth.isAdmin() ? null : auth.currentUser.id
      const data   = await apiGetLeaves(emp_id)

      if (data.success) {
        items.value = data.data.map(l => ({
          id:     l.id,
          name:   l.emp_name || l.emp_id,   // Apps Script ควรส่งชื่อมาด้วย
          type:   l.type,
          dates:  formatRange(l.start_date, l.end_date),
          days:   calcDays(l.start_date, l.end_date),
          reason: l.reason,
          status: l.status,  // 'pending' | 'approved' | 'rejected'
        }))
      }
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  /** อนุมัติใบลา — ส่งผลไปบันทึกใน Sheets ทันที */
  async function approve(id) {
    const auth = useAuthStore()
    try {
      const data = await apiApproveLeave(id, 'approve', auth.currentUser.id)
      if (data.success) {
        // อัปเดต local state โดยไม่ต้อง fetch ใหม่ทั้งหมด
        const item = items.value.find(l => l.id === id)
        if (item) item.status = 'approved'
      }
    } catch (err) {
      error.value = err.message
    }
  }

  /** ปฏิเสธใบลา */
  async function reject(id) {
    const auth = useAuthStore()
    try {
      const data = await apiApproveLeave(id, 'reject', auth.currentUser.id)
      if (data.success) {
        const item = items.value.find(l => l.id === id)
        if (item) item.status = 'rejected'
      }
    } catch (err) {
      error.value = err.message
    }
  }

  /** ยื่นใบลาใหม่ */
  async function requestLeave(payload) {
    const auth = useAuthStore()
    error.value = ''
    try {
      const data = await apiRequestLeave({ ...payload, emp_id: auth.currentUser.id })
      if (data.success) await fetchLeaves()  // โหลดรายการใหม่
      return data.success
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  // ── Helpers ────────────────────────────────────────────────
  function formatRange(start, end) {
    if (!start) return '—'
    const s = new Date(start).toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric' })
    if (!end || start === end) return s
    const e = new Date(end).toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'numeric' })
    return `${s} – ${e}`
  }

  function calcDays(start, end) {
    if (!start || !end) return 1
    const ms = new Date(end) - new Date(start)
    return Math.max(1, Math.round(ms / 86400000) + 1)
  }

  // ── Getters ────────────────────────────────────────────────
  const pending      = computed(() => items.value.filter(l => l.status === 'pending'))
  const resolved     = computed(() => items.value.filter(l => l.status !== 'pending'))
  const pendingCount = computed(() => pending.value.length)

  return { items, loading, error, pending, resolved, pendingCount, fetchLeaves, approve, reject, requestLeave }
})
