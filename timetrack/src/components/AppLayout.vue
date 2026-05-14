<!-- components/AppLayout.vue — Layout หลัก: Sidebar + Topbar + <slot> -->
<template>
  <!-- Overlay มือถือ -->
  <div v-if="sidebarOpen" class="overlay" @click="sidebarOpen = false" />

  <div class="wrap">
    <!-- ── SIDEBAR ── -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-logo">
        <div class="logo-mark">
          <div class="logo-icon"><i class="ti ti-clock" /></div>
          <div>
            <div class="logo-text">TimeTrack</div>
            <div class="logo-sub">Attendance System</div>
          </div>
        </div>
      </div>

      <nav>
        <template v-for="menu in menus" :key="menu.path">
          <div v-if="menu.section" class="nav-section">{{ menu.section }}</div>
          <router-link
            :to="menu.path"
            class="nav-item"
            active-class="active"
            @click="sidebarOpen = false"
          >
            <i :class="['ti', menu.icon]" />
            {{ menu.label }}
            <span v-if="menu.badge && leavesStore.pendingCount > 0" class="nav-badge">
              {{ leavesStore.pendingCount }}
            </span>
          </router-link>
        </template>
      </nav>

      <div class="sidebar-bottom">
        <div class="user-row">
          <div class="avatar" :class="auth.currentUser.avatarClass">
            {{ auth.currentUser.initials }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ auth.currentUser.name }}</div>
            <div class="user-role">
              {{ auth.currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : auth.currentUser.dept }}
            </div>
          </div>
          <i class="ti ti-logout logout-icon" @click="handleLogout" title="ออกจากระบบ" />
        </div>
      </div>
    </aside>

    <!-- ── MAIN ── -->
    <div class="main">
      <!-- Topbar -->
      <header class="topbar">
        <button class="mob-toggle-btn" @click="sidebarOpen = !sidebarOpen">
          <i :class="['ti', sidebarOpen ? 'ti-x' : 'ti-menu-2']" />
        </button>
        <h1 class="topbar-title">{{ pageTitle }}</h1>
        <div class="topbar-time-block">
          <div class="topbar-date">{{ dateStr }}</div>
          <div class="topbar-clock">{{ timeStr }}</div>
        </div>
        <button class="dark-btn" @click="toggleDark">
          <i :class="['ti', dark ? 'ti-sun' : 'ti-moon']" />
        </button>
        <button class="btn sm danger" @click="handleLogout">
          <i class="ti ti-logout" /> ออก
        </button>
      </header>

      <!-- Page Content -->
      <div class="content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute }                  from 'vue-router'
import { useAuthStore }                         from '../stores/auth'
import { useLeavesStore }                       from '../stores/leaves'

const auth        = useAuthStore()
const leavesStore = useLeavesStore()
const router      = useRouter()
const route       = useRoute()

// ── Dark mode ──
const dark = ref(false)
function toggleDark() {
  dark.value = !dark.value
  document.body.classList.toggle('dark', dark.value)
}

// ── Sidebar ──
const sidebarOpen = ref(false)

// ── Clock ──
const now = ref(new Date())
let timer
onMounted(()  => { timer = setInterval(() => (now.value = new Date()), 1000) })
onUnmounted(() => clearInterval(timer))
const timeStr = computed(() => now.value.toLocaleTimeString('th-TH'))
const dateStr = computed(() =>
  now.value.toLocaleDateString('th-TH', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
)

// ── Menus ──
const ADMIN_MENUS = [
  { path:'/dashboard', label:'Dashboard',       icon:'ti-layout-dashboard', section:'หน้าหลัก' },
  { path:'/clockin',   label:'บันทึกเวลา',      icon:'ti-clock-check',      section:'' },
  { path:'/employees', label:'พนักงาน',          icon:'ti-users',            section:'บริหาร' },
  { path:'/schedule',  label:'ตารางกะงาน',      icon:'ti-calendar-time',    section:'' },
  { path:'/leave',     label:'ลา / OT',          icon:'ti-beach',            badge: true, section:'' },
  { path:'/payroll',   label:'เงินเดือน',        icon:'ti-cash',             section:'ข้อมูล' },
  { path:'/reports',   label:'รายงาน',           icon:'ti-chart-bar',        section:'' },
  { path:'/security',  label:'ความปลอดภัย',     icon:'ti-shield-check',     section:'' },
]
const EMP_MENUS = [
  { path:'/dashboard', label:'Dashboard',       icon:'ti-layout-dashboard', section:'หน้าหลัก' },
  { path:'/clockin',   label:'บันทึกเวลา',      icon:'ti-clock-check',      section:'' },
  { path:'/myleave',   label:'ใบลาของฉัน',      icon:'ti-beach',            section:'ตัวเอง' },
  { path:'/myprofile', label:'โปรไฟล์',          icon:'ti-user',             section:'' },
  { path:'/schedule',  label:'ตารางกะงาน',      icon:'ti-calendar-time',    section:'' },
]
const menus = computed(() =>
  auth.currentUser?.role === 'admin' ? ADMIN_MENUS : EMP_MENUS
)

// ── Page title จาก route ──
const PAGE_TITLES = {
  '/dashboard': 'Dashboard ภาพรวม', '/clockin': 'บันทึกเวลาเข้า-ออกงาน',
  '/employees': 'รายชื่อพนักงาน',   '/schedule': 'ตารางกะงาน',
  '/leave':     'ใบลา / OT',        '/payroll':  'เงินเดือน',
  '/reports':   'รายงาน',           '/security': 'ความปลอดภัย',
  '/myleave':   'ใบลาของฉัน',       '/myprofile':'โปรไฟล์',
}
const pageTitle = computed(() => PAGE_TITLES[route.path] || 'TimeTrack')

// ── Logout ──
function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35);
  z-index: 80;
}
.wrap { display: flex; min-height: 100vh; }

/* Sidebar */
.sidebar {
  width: var(--sidebar-w); background: var(--card-bg);
  backdrop-filter: blur(15px); border-right: 1px solid var(--border-color);
  display: flex; flex-direction: column;
  position: sticky; top: 0; height: 100vh; z-index: 90;
}
.sidebar-logo { padding: 24px 20px 16px; }
.logo-mark { display: flex; align-items: center; gap: 10px; }
.logo-icon { width: 34px; height: 34px; background: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; }
.logo-text { font-weight: 700; font-size: 16px; }
.logo-sub  { font-size: 10px; color: var(--text-hint); }

nav { flex: 1; padding: 8px 12px; overflow-y: auto; }
.nav-section { font-size: 10px; font-weight: 700; color: var(--text-hint); text-transform: uppercase; letter-spacing: 1px; padding: 16px 10px 6px; }
.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 11px 14px;
  border-radius: 13px; cursor: pointer; font-size: 13.5px; font-weight: 500;
  color: var(--text-muted); text-decoration: none;
  transition: all 0.2s; margin-bottom: 3px;
}
.nav-item:hover { background: rgba(29,158,117,0.06); color: var(--accent); transform: translateX(4px); }
.nav-item.active { background: var(--accent); color: #fff; box-shadow: 0 6px 18px rgba(29,158,117,0.28); }
.nav-badge {
  margin-left: auto; background: var(--red-light); color: var(--red);
  font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 10px;
}
.nav-item.active .nav-badge { background: rgba(255,255,255,0.25); color: #fff; }

.sidebar-bottom { padding: 12px; border-top: 1px solid var(--border-color); }
.user-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 12px; }
.avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.av-admin { background: var(--purple-light); color: #3c3489; }
.av-emp   { background: var(--blue-light);   color: #0c447c; }
.user-info { flex: 1; min-width: 0; }
.user-name { font-size: 13px; font-weight: 600; }
.user-role { font-size: 10px; color: var(--text-hint); }
.logout-icon { font-size: 15px; color: var(--text-hint); cursor: pointer; }

/* Main */
.main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.topbar {
  padding: 16px 28px; display: flex; align-items: center; gap: 14px;
  background: rgba(244,247,251,0.75); backdrop-filter: blur(10px);
  position: sticky; top: 0; z-index: 50; border-bottom: 1px solid var(--border-color);
}
body.dark .topbar { background: rgba(15,23,42,0.75); }
.topbar-title { font-size: 19px; font-weight: 700; flex: 1; }
.topbar-time-block { text-align: right; font-size: 12px; }
.topbar-date  { color: var(--text-muted); }
.topbar-clock { color: var(--accent); font-weight: 700; font-variant-numeric: tabular-nums; }
.dark-btn {
  padding: 8px; border-radius: 10px; border: 1.5px solid var(--border-color);
  background: transparent; cursor: pointer; color: var(--text-main); font-size: 18px; display: inline-flex;
}
.content { padding: 24px 28px; }

/* Mobile */
@media (max-width: 700px) {
  .sidebar { position: fixed; left: -270px; top: 0; height: 100%; transition: left 0.28s cubic-bezier(0.4,0,0.2,1); box-shadow: none; }
  .sidebar.open { left: 0; box-shadow: 4px 0 24px rgba(0,0,0,0.13); }
  .topbar { padding: 12px 16px; gap: 10px; }
  .topbar-title { font-size: 16px; }
  .topbar-time-block { display: none; }
  .content { padding: 16px; }
}
</style>
