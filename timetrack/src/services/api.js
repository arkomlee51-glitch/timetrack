// ============================================================
//  src/services/api.js
//  ไฟล์กลางสำหรับติดต่อ Google Apps Script API
//  แก้แค่ไฟล์นี้ไฟล์เดียว ถ้า URL เปลี่ยน
// ============================================================

const API_URL = import.meta.env.VITE_API_URL ?? ''

// ── ฟังก์ชันหลักสำหรับส่งคำขอไปยัง API ──────────────────────
async function call(action, payload = {}) {
  if (!API_URL) throw new Error('VITE_API_URL ยังไม่ได้ตั้งค่าใน .env')
  const res = await fetch(API_URL, {
    method:  'POST',
    // Apps Script ไม่รองรับ CORS preflight → ใช้ text/plain แทน application/json
    headers: { 'Content-Type': 'text/plain' },
    body:    JSON.stringify({ action, ...payload }),
  })

  if (!res.ok) throw new Error(`HTTP error: ${res.status}`)

  const data = await res.json()
  if (data.error) throw new Error(data.error)
  return data
}

// ============================================================
//  AUTH
// ============================================================

export function apiLogin(username, password, role) {
  return call('login', { username, password, role })
}

// ============================================================
//  ATTENDANCE
// ============================================================

export function apiClockIn(emp_id) {
  return call('clockIn', { emp_id })
}

export function apiClockOut(emp_id) {
  return call('clockOut', { emp_id })
}

/** ดึงประวัติเข้า-ออกงาน รองรับ pagination
 *  @param {string} emp_id
 *  @param {string} month   - 'YYYY-MM'
 *  @param {number} page    - หน้าที่ต้องการ (เริ่มที่ 1)
 *  @param {number} pageSize - จำนวนรายการต่อหน้า
 */
export function apiGetAttendance(emp_id, month, page = 1, pageSize = 10) {
  return call('getAttendance', { emp_id, month, page, pageSize })
}

// ============================================================
//  LEAVES
// ============================================================

export function apiGetLeaves(emp_id = null) {
  return call('getLeaves', { emp_id })
}

export function apiRequestLeave(payload) {
  return call('requestLeave', payload)
}

export function apiApproveLeave(leave_id, action, approver_id) {
  return call('approveLeave', { leave_id, action, approver_id })
}

// ============================================================
//  EMPLOYEES (Admin)
// ============================================================

export function apiGetEmployees() {
  return call('getEmployees')
}

export function apiAddEmployee(payload) {
  return call('addEmployee', payload)
}

export function apiUpdateEmployee(payload) {
  return call('updateEmployee', payload)
}

export function apiDeleteEmployee(emp_id) {
  return call('deleteEmployee', { emp_id })
}

// ============================================================
//  PAYROLL (Admin)
// ============================================================

/** ดึงสรุปเงินเดือนรายเดือน month = 'YYYY-MM' */
export function apiGetPayroll(month) {
  return call('getPayroll', { month })
}

// ============================================================
//  REPORTS (Admin)
// ============================================================

/** ดึงสถิติภาพรวม period = 'month' | 'quarter' | 'year' */
export function apiGetReports(period = 'month') {
  return call('getReports', { period })
}

// ============================================================
//  AUDIT LOG / SECURITY (Admin)
// ============================================================

/** ดึง audit log  page/pageSize สำหรับ pagination */
export function apiGetAuditLog({ page = 1, pageSize = 20 } = {}) {
  return call('getAuditLog', { page, pageSize })
}

// ============================================================
//  SCHEDULE (Admin + Employee)
// ============================================================

/** ดึงตารางกะงานของสัปดาห์  weekStart = 'YYYY-MM-DD' (วันจันทร์) */
export function apiGetSchedule(weekStart) {
  return call('getSchedule', { weekStart })
}
