<template>
  <AppLayout>
    <div class="section-header">
      <span class="section-title">ตารางกะงาน</span>
      <div style="display:flex;gap:8px">
        <button class="btn sm" @click="changeWeek(-1)"><i class="ti ti-chevron-left"/></button>
        <button class="btn sm" style="min-width:140px;pointer-events:none">{{ weekLabel }}</button>
        <button class="btn sm" @click="changeWeek(1)"><i class="ti ti-chevron-right"/></button>
        <button class="btn sm" @click="goToday"><i class="ti ti-calendar-today" /></button>
      </div>
    </div>

    <div v-if="error" class="banner err"><i class="ti ti-alert-circle" /> {{ error }}</div>

    <div class="card">
      <div class="legend">
        <div class="leg-item"><div class="leg-dot" style="background:var(--blue-light)"/>กะเช้า</div>
        <div class="leg-item"><div class="leg-dot" style="background:var(--amber-light)"/>กะบ่าย</div>
        <div class="leg-item"><div class="leg-dot" style="background:var(--purple-light)"/>กะดึก</div>
        <div class="leg-item"><div class="leg-dot" style="background:var(--red-light)"/>OT</div>
        <div class="leg-item"><div class="leg-dot" style="background:rgba(0,0,0,0.05);border:1px solid var(--border-color)"/>หยุด</div>
      </div>

      <div v-if="loading" class="loading-msg"><i class="ti ti-loader-2" /> กำลังโหลด...</div>
      <div v-else-if="!schedule.length" class="loading-msg"><i class="ti ti-inbox" /> ไม่มีข้อมูลสัปดาห์นี้</div>
      <div class="grid-wrap" v-else>
        <div class="shift-grid" :style="`grid-template-columns: 80px repeat(${days.length},1fr)`">
          <div class="sh-head"/>
          <div class="sh-head" v-for="d in days" :key="d.label"
            :style="d.today ? { color:'var(--accent)', fontWeight:700 } : {}">
            {{ d.label }}
          </div>
          <template v-for="emp in schedule" :key="emp.emp_id ?? emp.name">
            <div class="sh-name">{{ emp.name }}</div>
            <div v-for="(s, i) in emp.shifts" :key="i" class="sh-cell" :class="'sh-' + (s || 'off')">
              {{ LABELS[s] ?? s ?? '—' }}
            </div>
          </template>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/AppLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { apiGetSchedule } from '../services/api'

const LABELS = { morning:'เช้า', afternoon:'บ่าย', night:'ดึก', off:'หยุด', ot:'OT' }
const DAY_SHORT = ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.']

// weekOffset = 0 คือสัปดาห์ปัจจุบัน, -1 คือสัปดาห์ก่อน
const weekOffset = ref(0)
const loading    = ref(false)
const error      = ref('')
const schedule   = ref([])

// คำนวณวันจันทร์ของสัปดาห์ตาม offset
function getMondayOf(offset = 0) {
  const d   = new Date()
  const day = d.getDay() // 0=อาทิตย์
  const diff = (day === 0 ? -6 : 1 - day) + offset * 7
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toYMD(date) {
  return date.toISOString().slice(0, 10)
}

const days = computed(() => {
  const mon = getMondayOf(weekOffset.value)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(d.getDate() + i)
    const today = new Date()
    return {
      label: DAY_SHORT[d.getDay()] + d.getDate(),
      today: d.toDateString() === today.toDateString(),
    }
  })
})

const weekLabel = computed(() => {
  const mon = getMondayOf(weekOffset.value)
  const sun = new Date(mon); sun.setDate(sun.getDate() + 6)
  const fmt = d => d.toLocaleDateString('th-TH', { day:'numeric', month:'short' })
  return `${fmt(mon)} – ${fmt(sun)}`
})

async function load() {
  loading.value = true
  error.value   = ''
  const weekStart = toYMD(getMondayOf(weekOffset.value))
  try {
    const res = await apiGetSchedule(weekStart)
    if (res.success) {
      schedule.value = res.data ?? []
    } else {
      error.value    = res.message ?? 'โหลดข้อมูลไม่ได้'
      schedule.value = []
    }
  } catch (e) {
    error.value    = e.message
    schedule.value = []
  } finally {
    loading.value = false
  }
}

function changeWeek(delta) {
  weekOffset.value += delta
  load()
}

function goToday() {
  weekOffset.value = 0
  load()
}

onMounted(load)
</script>

<style scoped>
.banner{border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:13px;}
.banner.err{background:var(--red-light);color:#791f1f;border:1px solid #f09595;}
.loading-msg{text-align:center;padding:32px;color:var(--text-hint);font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;}
.legend{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:16px;font-size:12px;}
.leg-item{display:flex;align-items:center;gap:5px;}
.leg-dot{width:12px;height:12px;border-radius:3px;}
.grid-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
.shift-grid{display:grid;gap:5px;min-width:480px;}
.sh-head{font-size:10px;font-weight:700;color:var(--text-hint);padding:5px;text-align:center;text-transform:uppercase;}
.sh-name{font-size:12px;color:var(--text-main);padding:5px;display:flex;align-items:center;font-weight:500;}
.sh-cell{height:30px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;cursor:pointer;transition:transform 0.15s;}
.sh-cell:hover{transform:scale(1.05);}
.sh-morning{background:var(--blue-light);color:#0c447c;}
.sh-afternoon{background:var(--amber-light);color:#633806;}
.sh-night{background:var(--purple-light);color:#3c3489;}
.sh-off{background:rgba(0,0,0,0.04);color:var(--text-hint);}
.sh-ot{background:var(--red-light);color:#791f1f;}
</style>
