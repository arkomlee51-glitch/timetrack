<!-- views/DashboardView.vue — หน้า Dashboard แยกตาม Role -->
<template>
  <AppLayout>
    <!-- Role Banner -->
    <div class="role-banner" :class="isAdmin ? 'admin' : 'emp'">
      <div class="rb-icon"><i :class="['ti', isAdmin ? 'ti-shield-check' : 'ti-user']" /></div>
      <div>
        <div class="rb-title">สวัสดี, {{ auth.currentUser.name }}</div>
        <div class="rb-sub">
          {{ isAdmin ? 'ผู้ดูแลระบบ — มีสิทธิ์เข้าถึงทุกส่วนของระบบ' : 'พนักงาน · แผนก ' + auth.currentUser.dept }}
        </div>
      </div>
    </div>

    <!-- Admin Dashboard -->
    <template v-if="isAdmin">
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-label">พนักงานทั้งหมด</div><div class="stat-value">124</div><div class="stat-sub up">+2 เดือนนี้</div></div>
        <div class="stat-card"><div class="stat-label">มาทำงานวันนี้</div><div class="stat-value" style="color:var(--accent)">108</div><div class="stat-sub">87.1%</div></div>
        <div class="stat-card"><div class="stat-label">มาสาย</div><div class="stat-value" style="color:var(--amber)">7</div><div class="stat-sub down">+2 จากเมื่อวาน</div></div>
        <div class="stat-card"><div class="stat-label">รออนุมัติ</div><div class="stat-value" style="color:var(--red)">{{ leavesStore.pendingCount }}</div><div class="stat-sub" style="color:var(--text-hint)">ใบลา / OT</div></div>
      </div>
      <div class="quick-actions">
        <div class="qa-btn" @click="$router.push('/clockin')"><div class="qa-icon" style="background:var(--accent-light)"><i class="ti ti-clock-check" style="color:#0f6e56" /></div><div class="qa-label">บันทึกเวลา</div></div>
        <div class="qa-btn" @click="$router.push('/leave')"><div class="qa-icon" style="background:var(--amber-light)"><i class="ti ti-file-plus" style="color:#854f0b" /></div><div class="qa-label">ใบลา / OT</div></div>
        <div class="qa-btn" @click="$router.push('/schedule')"><div class="qa-icon" style="background:var(--blue-light)"><i class="ti ti-calendar" style="color:#185fa5" /></div><div class="qa-label">ตารางกะ</div></div>
        <div class="qa-btn" @click="$router.push('/reports')"><div class="qa-icon" style="background:var(--purple-light)"><i class="ti ti-chart-bar" style="color:#534ab7" /></div><div class="qa-label">รายงาน</div></div>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><span class="card-title">สถิติเข้างานวันนี้</span></div>
          <div class="report-bar-wrap">
            <div class="report-bar-row"><div class="report-bar-label">มาตรงเวลา</div><div class="report-bar-track"><div class="report-bar-fill" style="width:78%;background:var(--accent)"/></div><div class="report-bar-val">97</div></div>
            <div class="report-bar-row"><div class="report-bar-label">มาสาย</div><div class="report-bar-track"><div class="report-bar-fill" style="width:6%;background:var(--amber)"/></div><div class="report-bar-val">7</div></div>
            <div class="report-bar-row"><div class="report-bar-label">ลาป่วย</div><div class="report-bar-track"><div class="report-bar-fill" style="width:5%;background:var(--blue)"/></div><div class="report-bar-val">6</div></div>
            <div class="report-bar-row"><div class="report-bar-label">ขาดงาน</div><div class="report-bar-track"><div class="report-bar-fill" style="width:4%;background:var(--red)"/></div><div class="report-bar-val">4</div></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">กิจกรรมล่าสุด</span></div>
          <div class="timeline">
            <div class="tl-item" v-for="item in activity" :key="item.text">
              <div class="tl-col"><div class="tl-dot" :style="{background:item.color}"/><div class="tl-line"/></div>
              <div class="tl-body"><div class="tl-title">{{ item.text }}</div><div class="tl-time">{{ item.time }}</div></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Employee Dashboard -->
    <template v-else>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-label">ชั่วโมงทำงานเดือนนี้</div><div class="stat-value" style="color:var(--accent)">152</div><div class="stat-sub">เป้าหมาย 176 ชม.</div></div>
        <div class="stat-card"><div class="stat-label">วันลาคงเหลือ</div><div class="stat-value">4</div><div class="stat-sub">ใช้ไปแล้ว 6 วัน</div></div>
        <div class="stat-card"><div class="stat-label">OT เดือนนี้</div><div class="stat-value" style="color:var(--amber)">12.5</div><div class="stat-sub">ชั่วโมง</div></div>
        <div class="stat-card"><div class="stat-label">มาสาย</div><div class="stat-value" style="color:var(--red)">1</div><div class="stat-sub">ครั้ง เดือนนี้</div></div>
      </div>
      <div class="notice info"><i class="ti ti-info-circle"/>กะงานวันนี้: <strong>กะเช้า 08:00–17:00 น.</strong> — เข้างานแล้วเมื่อ 08:02 น.</div>
      <div class="quick-actions" style="grid-template-columns:repeat(3,1fr)">
        <div class="qa-btn" @click="$router.push('/clockin')"><div class="qa-icon" style="background:var(--accent-light)"><i class="ti ti-clock-check" style="color:#0f6e56"/></div><div class="qa-label">บันทึกเวลา</div></div>
        <div class="qa-btn" @click="$router.push('/myleave')"><div class="qa-icon" style="background:var(--amber-light)"><i class="ti ti-file-plus" style="color:#854f0b"/></div><div class="qa-label">ขอลางาน</div></div>
        <div class="qa-btn" @click="$router.push('/myprofile')"><div class="qa-icon" style="background:var(--blue-light)"><i class="ti ti-user" style="color:#185fa5"/></div><div class="qa-label">โปรไฟล์</div></div>
      </div>
    </template>
  </AppLayout>
</template>

<script setup>
import AppLayout      from '../components/AppLayout.vue'
import { useAuthStore }   from '../stores/auth'
import { useLeavesStore } from '../stores/leaves'
import { computed }       from 'vue'

const auth        = useAuthStore()
const leavesStore = useLeavesStore()
const isAdmin     = computed(() => auth.currentUser?.role === 'admin')

const activity = [
  { text:'สุภาพร วงศ์ดี เข้างาน',     time:'08:02 น.', color:'var(--accent)' },
  { text:'พิชัย สมบูรณ์ มาสาย 15 นาที',time:'08:45 น.', color:'var(--amber)' },
  { text:'วิชัย ทองดี ส่งใบลาป่วย',   time:'09:10 น.', color:'var(--blue)'  },
  { text:'ขออนุมัติ OT — แผนก IT',     time:'10:22 น.', color:'var(--purple)'},
]
</script>

<style scoped>
.role-banner { border-radius: 16px; padding: 16px 20px; margin-bottom: 22px; display: flex; align-items: center; gap: 14px; }
.role-banner.admin { background: linear-gradient(135deg,#eeedfe,#ddd8ff); border: 1px solid #c4bef7; }
.role-banner.emp   { background: linear-gradient(135deg,#e6f1fb,#d0e8ff); border: 1px solid #b5d4f4; }
.rb-icon  { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
.admin .rb-icon { background: #7f77dd; color: #fff; }
.emp   .rb-icon { background: #378add; color: #fff; }
.rb-title { font-weight: 700; font-size: 14px; }
.rb-sub   { font-size: 12px; color: var(--text-muted); }
.quick-actions { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 18px; }
.qa-btn { background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 16px; padding: 16px 10px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; }
.qa-btn:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.qa-icon  { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 19px; }
.qa-label { font-size: 12px; color: var(--text-muted); text-align: center; font-weight: 500; }
.timeline { display: flex; flex-direction: column; gap: 0; }
.tl-item  { display: flex; gap: 10px; padding: 4px 0; }
.tl-col   { display: flex; flex-direction: column; align-items: center; width: 20px; flex-shrink: 0; }
.tl-dot   { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
.tl-line  { flex: 1; width: 1px; background: var(--border-color); margin-top: 3px; }
.tl-body  { flex: 1; padding-bottom: 10px; }
.tl-title { font-size: 13px; font-weight: 600; }
.tl-time  { font-size: 11px; color: var(--text-hint); }
.notice   { padding: 14px 18px; border-radius: 12px; font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
.notice.info { background: var(--blue-light); color: #0c447c; border: 1px solid #b5d4f4; }
@media(max-width:700px){ .quick-actions{ grid-template-columns:repeat(2,1fr); } }
</style>
