// ============================================================
//  src/services/api.js
//  ไฟล์กลางสำหรับติดต่อ Google Apps Script API
//  แก้แค่ไฟล์นี้ไฟล์เดียว ถ้า URL เปลี่ยน
// ============================================================

const API_URL =
  'https://script.google.com/macros/s/AKfycbzB3LPmjRFgNZ_LSSL40h-LuKndVKWnrv3Z3sJmLm1L1ipsv0EhkdQ7Lv2xAWUdBHQK/exec'

// ── ฟังก์ชันหลักสำหรับส่งคำขอไปยัง API ──────────────────────
// Apps Script ต้องการ POST พร้อม action บอกว่าต้องการทำอะไร
async function call(action, payload = {}) {
  const res = await fetch(API_URL, {
    method:  'POST',
    // Apps Script ไม่รองรับ CORS preflight → ใช้ text/plain แทน application/json
    headers: { 'Content-Type': 'text/plain' },
    body:    JSON.stringify({ action, ...payload }),
  })

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`)
  }

  const data = await res.json()

  // Apps Script ส่ง { error: '...' } เมื่อเกิดข้อผิดพลาดฝั่ง server
  if (data.error) throw new Error(data.error)

  return data
}

// ============================================================
//  AUTH
// ============================================================

/** Login — ส่ง username, password, role → ได้ user object กลับ */
export function apiLogin(username, password, role) {
  return call('login', { username, password, role })
}

// ============================================================
//  ATTENDANCE
// ============================================================

/** บันทึกเวลาเข้างาน */
export function apiClockIn(emp_id) {
  return call('clockIn', { emp_id })
}

/** บันทึกเวลาออกงาน */
export function apiClockOut(emp_id) {
  return call('clockOut', { emp_id })
}

/**
 * ดึงประวัติเข้า-ออกงาน
 * @param {string} emp_id  - รหัสพนักงาน
 * @param {string} month   - รูปแบบ 'YYYY-MM' เช่น '2025-05'
 */
export function apiGetAttendance(emp_id, month) {
  return call('getAttendance', { emp_id, month })
}

// ============================================================
//  LEAVES
// ============================================================

/** ดึงรายการใบลาทั้งหมด (Admin ดูได้ทุกคน, Employee ดูของตัวเอง) */
export function apiGetLeaves(emp_id = null) {
  return call('getLeaves', { emp_id })
}

/** ส่งคำขอลางาน */
export function apiRequestLeave(payload) {
  // payload: { emp_id, type, start_date, end_date, reason }
  return call('requestLeave', payload)
}

/** อนุมัติ / ปฏิเสธใบลา (Admin เท่านั้น) */
export function apiApproveLeave(leave_id, action, approver_id) {
  // action: 'approve' | 'reject'
  return call('approveLeave', { leave_id, action, approver_id })
}

// ============================================================
//  EMPLOYEES (Admin)
// ============================================================

/** ดึงรายชื่อพนักงานทั้งหมด */
export function apiGetEmployees() {
  return call('getEmployees')
}

/** เพิ่มพนักงานใหม่ */
export function apiAddEmployee(payload) {
  // payload: { name, role, password, dept, shift }
  return call('addEmployee', payload)
}
