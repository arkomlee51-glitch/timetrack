<!-- views/LoginView.vue — หน้า Login แยก Admin / Employee -->
<template>
  <div class="login-page">
    <div class="login-container">

      <!-- Left panel -->
      <div class="left-panel">
        <div class="brand">
          <div class="brand-icon"><i class="ti ti-clock" /></div>
          <div>
            <div class="brand-name">TimeTrack</div>
            <div class="brand-sub">Attendance Management System</div>
          </div>
        </div>
        <div class="hero-title">ระบบบันทึกเวลา<br>เข้า-ออกงาน</div>
        <div class="hero-sub">จัดการพนักงาน กะงาน ใบลา และเงินเดือน<br>ในที่เดียว ครบจบ ง่ายต่อการใช้งาน</div>
        <div class="features">
          <div class="feature"><div class="feat-icon"><i class="ti ti-fingerprint" /></div>บันทึกเวลาเข้า-ออกแบบเรียลไทม์</div>
          <div class="feature"><div class="feat-icon"><i class="ti ti-calendar-time" /></div>จัดตารางกะงานอัตโนมัติ</div>
          <div class="feature"><div class="feat-icon"><i class="ti ti-chart-bar" /></div>รายงานสถิติและการวิเคราะห์</div>
          <div class="feature"><div class="feat-icon"><i class="ti ti-shield-check" /></div>ระบบรักษาความปลอดภัยสูง</div>
        </div>
      </div>

      <!-- Right panel -->
      <div class="right-panel">
        <!-- Tabs -->
        <div class="tabs">
          <button :class="['tab', { active: tab === 'admin' }]" @click="tab = 'admin'">
            <i class="ti ti-shield-check" /> ผู้ดูแลระบบ
          </button>
          <button :class="['tab', { active: tab === 'employee' }]" @click="tab = 'employee'">
            <i class="ti ti-user" /> พนักงาน
          </button>
        </div>

        <h2 class="login-title">{{ tab === 'admin' ? 'เข้าสู่ระบบ — ผู้ดูแล' : 'เข้าสู่ระบบ — พนักงาน' }}</h2>
        <p class="login-sub">กรุณากรอกข้อมูลเพื่อเข้าใช้งาน TimeTrack</p>

        <!-- Form -->
        <div class="field">
          <label class="form-label">ชื่อผู้ใช้</label>
          <div class="input-wrap">
            <i class="ti ti-user field-icon" />
            <input v-model="username" class="form-input with-icon" placeholder="ชื่อพนักงาน" @keyup.enter="doLogin" />
          </div>
        </div>
        <div class="field">
          <label class="form-label">รหัสผ่าน</label>
          <div class="input-wrap">
            <i class="ti ti-lock field-icon" />
            <input v-model="password" :type="showPass ? 'text' : 'password'" class="form-input with-icon" placeholder="••••••••" @keyup.enter="doLogin" />
            <i :class="['ti', showPass ? 'ti-eye-off' : 'ti-eye', 'toggle-icon']" @click="showPass = !showPass" />
          </div>
          <p v-if="auth.loginError" class="error">{{ auth.loginError }}</p>
        </div>

        <button class="login-btn" :disabled="auth.loginLoading || !username || !password" @click="doLogin">
          <i :class="['ti', auth.loginLoading ? 'ti-loader-2' : 'ti-login']" />
          {{ auth.loginLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
        </button>

        <!-- Demo hint — แสดงเฉพาะตอน dev mode -->
        <div v-if="isDev" class="demo-box">
          <div class="demo-title">บัญชีทดสอบ (Development only)</div>
          <div class="demo-row"><span>ชื่อผู้ใช้:</span><span>{{ tab === 'admin' ? demoAdmin.user : demoEmp.user }}</span></div>
          <div class="demo-row"><span>รหัสผ่าน:</span><span>{{ tab === 'admin' ? demoAdmin.pass : demoEmp.pass }}</span></div>
          <button class="btn sm primary" style="margin-top:10px;width:100%;justify-content:center" @click="fillDemo">
            <i class="ti ti-wand" /> กรอกอัตโนมัติ
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref }        from 'vue'
import { useRouter }  from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth     = useAuthStore()
const router   = useRouter()
const tab      = ref('admin')
const username = ref('')
const password = ref('')
const showPass = ref(false)

// บัญชีทดสอบ — โหลดจาก env เท่านั้น ไม่ hardcode ในโค้ด
const isDev    = import.meta.env.DEV
const demoAdmin = { user: import.meta.env.VITE_DEMO_ADMIN_USER ?? '', pass: import.meta.env.VITE_DEMO_ADMIN_PASS ?? '' }
const demoEmp   = { user: import.meta.env.VITE_DEMO_EMP_USER   ?? '', pass: import.meta.env.VITE_DEMO_EMP_PASS  ?? '' }

async function doLogin() {
  const ok = await auth.login(username.value, password.value, tab.value)
  if (ok) router.push('/dashboard')
}
function fillDemo() {
  const demo = tab.value === 'admin' ? demoAdmin : demoEmp
  username.value = demo.user
  password.value = demo.pass
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: radial-gradient(circle at 60% 40%, #c7f0e0 0%, #e8f4ff 50%, #f4f7fb 100%); }
body.dark .login-page { background: radial-gradient(circle at 60% 40%, #0d2e22 0%, #0f172a 100%); }
.login-container { width: 100%; max-width: 920px; display: grid; grid-template-columns: 1fr 1fr; border-radius: 28px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.15); }

/* Left */
.left-panel { background: linear-gradient(145deg, #0f6e56 0%, #1d9e75 60%, #5dcaa5 100%); padding: 50px 40px; display: flex; flex-direction: column; gap: 20px; color: #fff; }
.brand { display: flex; align-items: center; gap: 14px; }
.brand-icon { width: 46px; height: 46px; background: rgba(255,255,255,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.brand-name { font-size: 22px; font-weight: 700; }
.brand-sub  { font-size: 12px; opacity: 0.75; }
.hero-title { font-size: 28px; font-weight: 700; line-height: 1.35; }
.hero-sub   { font-size: 14px; opacity: 0.8; line-height: 1.6; }
.features   { display: flex; flex-direction: column; gap: 14px; margin-top: 10px; }
.feature    { display: flex; align-items: center; gap: 12px; font-size: 13px; opacity: 0.9; }
.feat-icon  { width: 32px; height: 32px; background: rgba(255,255,255,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* Right */
.right-panel { background: var(--card-bg); padding: 50px 44px; display: flex; flex-direction: column; justify-content: center; }
.tabs { display: flex; margin-bottom: 28px; border-radius: 12px; overflow: hidden; border: 1.5px solid var(--border-color); }
.tab { flex: 1; padding: 11px; text-align: center; font-size: 13px; font-weight: 600; cursor: pointer; background: transparent; border: none; color: var(--text-muted); transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: inherit; }
.tab.active { background: var(--accent); color: #fff; }
.login-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.login-sub   { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }
.field { margin-bottom: 18px; }
.input-wrap { position: relative; }
.field-icon  { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-hint); font-size: 17px; }
.toggle-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--text-hint); font-size: 17px; cursor: pointer; }
.with-icon { padding-left: 44px !important; }
.error { font-size: 11px; color: var(--red); margin-top: 5px; }
.login-btn { width: 100%; padding: 14px; border-radius: 12px; border: none; background: var(--accent); color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; box-shadow: 0 6px 20px rgba(29,158,117,0.3); font-family: inherit; margin-bottom: 20px; }
.login-btn:hover { background: var(--accent-dark); transform: translateY(-1px); }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.demo-box { padding: 14px 16px; border-radius: 12px; background: var(--accent-light); border: 1px dashed var(--accent-mid); }
.demo-title { font-size: 12px; font-weight: 700; color: var(--accent-dark); margin-bottom: 8px; }
.demo-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: var(--text-muted); }
.demo-row span:last-child { font-weight: 600; color: var(--accent); font-family: monospace; }

@media (max-width: 700px) {
  .login-container { grid-template-columns: 1fr; margin: 16px; }
  .left-panel { display: none; }
  .right-panel { padding: 32px 24px; }
}
</style>
