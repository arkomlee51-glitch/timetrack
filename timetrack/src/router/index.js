// router/index.js — กำหนดเส้นทางของแต่ละหน้า
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Lazy-load components (โหลดเฉพาะเมื่อต้องการ → เว็บโหลดไวขึ้น)
const LoginView     = () => import('../views/LoginView.vue')
const DashboardView = () => import('../views/DashboardView.vue')
const ClockInView   = () => import('../views/ClockInView.vue')
const EmployeesView = () => import('../views/EmployeesView.vue')
const ScheduleView  = () => import('../views/ScheduleView.vue')
const LeaveView     = () => import('../views/LeaveView.vue')
const PayrollView   = () => import('../views/PayrollView.vue')
const ReportsView   = () => import('../views/ReportsView.vue')
const SecurityView  = () => import('../views/SecurityView.vue')
const MyLeaveView   = () => import('../views/MyLeaveView.vue')
const MyProfileView = () => import('../views/MyProfileView.vue')

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: LoginView, meta: { public: true } },

  // หน้าที่ทุก role เข้าได้
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/clockin',   component: ClockInView,   meta: { requiresAuth: true } },
  { path: '/schedule',  component: ScheduleView,  meta: { requiresAuth: true } },

  // เฉพาะ Admin
  { path: '/employees', component: EmployeesView, meta: { requiresAuth: true, adminOnly: true } },
  { path: '/leave',     component: LeaveView,     meta: { requiresAuth: true, adminOnly: true } },
  { path: '/payroll',   component: PayrollView,   meta: { requiresAuth: true, adminOnly: true } },
  { path: '/reports',   component: ReportsView,   meta: { requiresAuth: true, adminOnly: true } },
  { path: '/security',  component: SecurityView,  meta: { requiresAuth: true, adminOnly: true } },

  // เฉพาะ Employee
  { path: '/myleave',   component: MyLeaveView,   meta: { requiresAuth: true } },
  { path: '/myprofile', component: MyProfileView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHashHistory(), // ใช้ hash mode → ไม่ต้องตั้งค่า server
  routes,
})

// ── Navigation Guard — ตรวจ login ก่อนเข้าทุกหน้า ──
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn()) return '/login'
  if (to.meta.adminOnly   && !auth.isAdmin())     return '/dashboard'
  if (to.path === '/login' && auth.isLoggedIn())  return '/dashboard'
})

export default router
