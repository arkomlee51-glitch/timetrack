// ============================================================
//  stores/auth.js
//  สิ่งที่เปลี่ยน: ลบ MOCK_USERS ออก → เรียก apiLogin() จริง
// ============================================================
import { defineStore } from 'pinia'
import { ref }         from 'vue'
import { apiLogin }    from '../services/api'

export const useAuthStore = defineStore('auth', () => {

  // ── State ──────────────────────────────────────────────────
  const currentUser  = ref(null)
  const loginError   = ref('')
  const loginLoading = ref(false)

  // ── Actions ────────────────────────────────────────────────
  async function login(username, password, role) {
    loginError.value   = ''
    loginLoading.value = true

    try {
      // ▼ เรียก Google Sheets API จริง (แทนที่ MOCK_USERS เดิม)
      const data = await apiLogin(username, password, role)

      if (data.success) {
        // data.user มาจาก Apps Script: { id, name, role, dept, shift }
        // เพิ่ม initials + avatarClass ฝั่ง client
        currentUser.value = {
          ...data.user,
          initials:    makeInitials(data.user.name),
          avatarClass: data.user.role === 'admin' ? 'av-admin' : 'av-emp',
        }
        return true
      } else {
        loginError.value = data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        return false
      }
    } catch (err) {
      // Network error หรือ Apps Script ล้มเหลว
      loginError.value = `เชื่อมต่อ API ไม่ได้: ${err.message}`
      return false
    } finally {
      loginLoading.value = false
    }
  }

  function logout() {
    currentUser.value = null
    loginError.value  = ''
  }

  // ── Helpers ────────────────────────────────────────────────
  // สร้างอักษรย่อจากชื่อภาษาไทย เช่น "สมชาย ใจดี" → "สม"
  function makeInitials(name = '') {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return parts[0][0] + parts[1][0]
    return parts[0].slice(0, 2)
  }

  // ── Getters ────────────────────────────────────────────────
  const isAdmin    = () => currentUser.value?.role === 'admin'
  const isLoggedIn = () => !!currentUser.value

  return { currentUser, loginError, loginLoading, login, logout, isAdmin, isLoggedIn }
})
