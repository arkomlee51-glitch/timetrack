<template>
  <AppLayout>
    <div class="section-header">
      <span class="section-title">สรุปเงินเดือน — {{ monthLabel }}</span>
      <div style="display:flex;gap:8px;align-items:center">
        <input type="month" v-model="selectedMonth" class="form-input" style="width:160px"
          @change="load" :max="maxMonth" />
        <button class="btn" @click="load"><i class="ti ti-refresh" /> รีเฟรช</button>
        <button class="btn" :disabled="!rows.length"><i class="ti ti-download" /> ส่งออก Excel</button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="banner err"><i class="ti ti-alert-circle" /> {{ error }}</div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">พนักงาน</div>
        <div class="stat-value">{{ loading ? '…' : stats.total }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">เงินเดือนรวม</div>
        <div class="stat-value" style="font-size:22px">{{ loading ? '…' : fmtBaht(stats.totalBase) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">ค่า OT รวม</div>
        <div class="stat-value" style="color:var(--amber);font-size:22px">{{ loading ? '…' : fmtBaht(stats.totalOT) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">หักขาดงาน</div>
        <div class="stat-value" style="color:var(--red);font-size:22px">{{ loading ? '…' : fmtBaht(stats.totalDeduct) }}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-title">รายละเอียดพนักงาน</span></div>
      <div v-if="loading" class="loading-msg"><i class="ti ti-loader-2" /> กำลังโหลด...</div>
      <div v-else-if="!rows.length" class="loading-msg"><i class="ti ti-inbox" /> ไม่มีข้อมูลเดือนนี้</div>
      <div class="table-wrap" v-else>
        <table>
          <thead>
            <tr><th>พนักงาน</th><th>วันทำงาน</th><th>OT (ชม.)</th><th>เงินเดือน</th><th>ค่า OT</th><th>หัก</th><th>สุทธิ</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in rows" :key="p.emp_id">
              <td>
                <div class="emp-row">
                  <div class="emp-avatar" :style="avatarStyle(p.name)">{{ initials(p.name) }}</div>
                  {{ p.name }}
                </div>
              </td>
              <td>{{ p.workDays }}/{{ p.totalDays }}</td>
              <td>{{ p.otHours ?? '—' }}</td>
              <td>{{ fmtBaht(p.baseSalary) }}</td>
              <td>{{ fmtBaht(p.otPay) }}</td>
              <td style="color:var(--red)">{{ fmtBaht(p.deduction) }}</td>
              <td style="font-weight:700;color:var(--accent)">{{ fmtBaht(p.netSalary) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/AppLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { apiGetPayroll } from '../services/api'

const AVATAR_COLORS = [
  { bg:'#E1F5EE', fg:'#0F6E56' }, { bg:'#faeeda', fg:'#633806' },
  { bg:'#e6f1fb', fg:'#0c447c' }, { bg:'#eeedfe', fg:'#3c3489' },
]

const today        = new Date()
const maxMonth     = today.toISOString().slice(0, 7)
const selectedMonth = ref(maxMonth)
const loading      = ref(false)
const error        = ref('')
const rows         = ref([])

const stats = computed(() => ({
  total:       rows.value.length,
  totalBase:   rows.value.reduce((s, r) => s + (r.baseSalary ?? 0), 0),
  totalOT:     rows.value.reduce((s, r) => s + (r.otPay     ?? 0), 0),
  totalDeduct: rows.value.reduce((s, r) => s + (r.deduction ?? 0), 0),
}))

const monthLabel = computed(() => {
  const [y, m] = selectedMonth.value.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
})

async function load() {
  loading.value = true
  error.value   = ''
  try {
    const res = await apiGetPayroll(selectedMonth.value)
    rows.value = res.success ? (res.data ?? []) : []
    if (!res.success) error.value = res.message ?? 'โหลดข้อมูลไม่ได้'
  } catch (e) {
    error.value = e.message
    rows.value  = []
  } finally {
    loading.value = false
  }
}

onMounted(load)

function fmtBaht(v) {
  if (v == null) return '—'
  return '฿' + Number(v).toLocaleString('th-TH', { minimumFractionDigits: 0 })
}
function initials(name = '') {
  const p = name.trim().split(' ')
  return p.length >= 2 ? p[0][0] + p[1][0] : p[0].slice(0, 2)
}
function avatarStyle(name = '') {
  const c = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
  return { background: c.bg, color: c.fg }
}
</script>

<style scoped>
.banner{border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:13px;}
.banner.err{background:var(--red-light);color:#791f1f;border:1px solid #f09595;}
.loading-msg{text-align:center;padding:32px;color:var(--text-hint);font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;}
</style>
