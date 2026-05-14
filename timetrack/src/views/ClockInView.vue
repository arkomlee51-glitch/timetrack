<!-- views/ClockInView.vue — เชื่อม API จริง + ตรวจสอบพื้นที่ GPS -->
<template>
  <AppLayout>
    <!-- Error banner (API) -->
    <div v-if="att.error" class="err-banner">
      <i class="ti ti-alert-circle" /> {{ att.error }}
    </div>

    <!-- Location error banner -->
    <div v-if="locStatus === 'error'" class="warn-banner">
      <i class="ti ti-map-off" /> {{ locError }}
      <button class="btn-retry" @click="checkLocation">ตรวจสอบอีกครั้ง</button>
    </div>
    <div v-if="locStatus === 'out-range'" class="warn-banner">
      <i class="ti ti-map-pin-off" /> คุณอยู่นอกพื้นที่ที่อนุญาต (ห่างจากออฟฟิศ {{ distanceText }}) — ไม่สามารถลงเวลาได้
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="clock-display">
          <div class="clock-big">{{ timeStr }}</div>
          <div class="clock-date">{{ dateStr }}</div>
          <div>
            <span class="clock-status" :class="att.clockedIn ? 'status-in' : 'status-out'">
              <span class="dot" :class="att.clockedIn ? 'dot-in' : 'dot-out'" />
              {{ att.clockedIn ? 'กำลังทำงาน' : 'ยังไม่ได้เข้างาน' }}
            </span>
          </div>
        </div>
        <div class="clock-actions">
          <button class="btn-ci" :disabled="!canClockIn" @click="handleClockIn">
            <i class="ti" :class="att.loading ? 'ti-loader-2' : 'ti-clock-check'" />
            {{ att.loading ? 'กำลังบันทึก...' : 'เข้างาน' }}
          </button>
          <button class="btn-co" :disabled="!att.clockedIn || att.loading" @click="handleClockOut">
            <i class="ti" :class="att.loading ? 'ti-loader-2' : 'ti-clock-off'" />
            {{ att.loading ? 'กำลังบันทึก...' : 'ออกงาน' }}
          </button>
        </div>

        <!-- Location badge -->
        <div class="location" :class="'loc-' + locStatus">
          <i class="ti" :class="locIcon" />
          {{ locLabel }}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">ประวัติวันนี้</span></div>
        <div v-if="att.todayRecord" class="summary">
          <div class="sum-row"><span class="sum-label">วันที่</span><strong>{{ att.todayRecord.date }}</strong></div>
          <div class="sum-row"><span class="sum-label">เข้างาน</span><strong>{{ att.todayRecord.clockIn }}</strong></div>
          <div class="sum-row"><span class="sum-label">ออกงาน</span><strong>{{ att.todayRecord.clockOut }}</strong></div>
          <div class="sum-row"><span class="sum-label">รวม</span><strong>{{ att.todayRecord.total }}</strong></div>
          <div class="sum-row"><span class="sum-label">OT</span><strong>{{ att.todayRecord.ot }}</strong></div>
        </div>
        <div v-else-if="att.loading" class="loading-msg"><i class="ti ti-loader-2" /> กำลังโหลด...</div>
        <div v-else class="empty-msg">ยังไม่มีข้อมูลวันนี้</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">ประวัติเดือนนี้</span>
        <button class="btn sm" @click="att.fetchRecords()"><i class="ti ti-refresh" /> รีเฟรช</button>
      </div>
      <div v-if="att.loading" class="loading-msg"><i class="ti ti-loader-2" /> กำลังโหลด...</div>
      <div class="table-wrap" v-else>
        <table>
          <thead><tr><th>วันที่</th><th>เข้างาน</th><th>ออกงาน</th><th>รวม</th><th>OT</th><th>สถานะ</th></tr></thead>
          <tbody>
            <tr v-if="!att.records.length"><td colspan="6" class="empty-msg">ไม่มีข้อมูล</td></tr>
            <tr v-for="r in att.records" :key="r.date">
              <td>{{ r.date }}</td><td>{{ r.clockIn }}</td><td>{{ r.clockOut }}</td>
              <td>{{ r.total }}</td><td>{{ r.ot }}</td>
              <td><span class="badge" :class="r.status">{{ r.statusText }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/AppLayout.vue'
import { useAttendanceStore } from '../stores/attendance'
import { ref, computed, onMounted, onUnmounted } from 'vue'

// ─── พิกัดออฟฟิศ (แก้ค่าตามตำแหน่งจริง) ───────────────────────
const OFFICE_LAT    = 13.7563   // ละติจูดออฟฟิศ
const OFFICE_LNG    = 100.5018  // ลองจิจูดออฟฟิศ
const MAX_DISTANCE  = 100       // รัศมีสูงสุด (เมตร)
// ────────────────────────────────────────────────────────────────

const att = useAttendanceStore()

onMounted(() => {
  att.fetchRecords()
  checkLocation()
})

// ── นาฬิกา ──────────────────────────────────────────────────────
const now = ref(new Date())
let timer
onMounted(() => { timer = setInterval(() => (now.value = new Date()), 1000) })
onUnmounted(() => clearInterval(timer))
const timeStr = computed(() => now.value.toLocaleTimeString('th-TH'))
const dateStr = computed(() => now.value.toLocaleDateString('th-TH', { weekday:'long', day:'numeric', month:'long', year:'numeric' }))

// ── Geolocation ──────────────────────────────────────────────────
// locStatus: 'checking' | 'in-range' | 'out-range' | 'error'
const locStatus   = ref('checking')
const locError    = ref('')
const distanceM   = ref(null)

const distanceText = computed(() => {
  if (distanceM.value === null) return ''
  return distanceM.value >= 1000
    ? (distanceM.value / 1000).toFixed(1) + ' กม.'
    : Math.round(distanceM.value) + ' เมตร'
})

const locLabel = computed(() => ({
  checking:  'กำลังตรวจสอบตำแหน่ง...',
  'in-range':  `อยู่ในพื้นที่ออฟฟิศ (${distanceText.value})`,
  'out-range': `นอกพื้นที่ออฟฟิศ (${distanceText.value})`,
  error:     'ไม่สามารถตรวจสอบตำแหน่งได้',
}[locStatus.value]))

const locIcon = computed(() => ({
  checking:  'ti-loader-2',
  'in-range':  'ti-map-pin-check',
  'out-range': 'ti-map-pin-off',
  error:     'ti-map-off',
}[locStatus.value]))

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R    = 6371000
  const toRad = deg => deg * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a    = Math.sin(dLat / 2) ** 2
             + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function checkLocation() {
  if (!navigator.geolocation) {
    locStatus.value = 'error'
    locError.value  = 'เบราว์เซอร์นี้ไม่รองรับ GPS — ไม่สามารถลงเวลาได้'
    return
  }
  locStatus.value = 'checking'
  locError.value  = ''
  navigator.geolocation.getCurrentPosition(
    pos => {
      const d = haversineDistance(pos.coords.latitude, pos.coords.longitude, OFFICE_LAT, OFFICE_LNG)
      distanceM.value = d
      locStatus.value = d <= MAX_DISTANCE ? 'in-range' : 'out-range'
    },
    err => {
      locStatus.value = 'error'
      locError.value  = err.code === 1
        ? 'คุณปฏิเสธการเข้าถึงตำแหน่ง กรุณาอนุญาตใน browser settings'
        : 'ไม่สามารถรับตำแหน่ง GPS ได้ กรุณาลองใหม่'
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
  )
}

// ── ปุ่มเข้างานใช้งานได้เฉพาะเมื่ออยู่ในพื้นที่ ────────────────
const canClockIn = computed(() =>
  !att.clockedIn && !att.loading && locStatus.value === 'in-range'
)

async function handleClockIn()  { await att.clockInAction() }
async function handleClockOut() { await att.clockOutAction() }
</script>

<style scoped>
.err-banner{background:var(--red-light);color:#791f1f;border:1px solid #f09595;border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:13px;}
.warn-banner{background:#fff8e1;color:#7a5c00;border:1px solid #ffe082;border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:13px;flex-wrap:wrap;}
.btn-retry{margin-left:auto;padding:4px 12px;border-radius:8px;border:1.5px solid #ffe082;background:#fffde7;color:#7a5c00;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;}
.btn-retry:hover{background:#fff9c4;}
.clock-display{text-align:center;padding:20px 0 10px;}
.clock-big{font-size:54px;font-weight:800;letter-spacing:-2px;color:var(--accent);font-variant-numeric:tabular-nums;}
.clock-date{color:var(--text-muted);margin-top:4px;font-size:13px;}
.clock-status{display:inline-flex;align-items:center;gap:7px;padding:5px 16px;border-radius:20px;font-size:12px;font-weight:700;margin-top:10px;}
.status-in{background:var(--accent-light);color:var(--accent-dark);}
.status-out{background:rgba(0,0,0,0.06);color:var(--text-muted);}
.dot{width:7px;height:7px;border-radius:50%;}
.dot-in{background:var(--accent);} .dot-out{background:var(--text-hint);}
.clock-actions{display:flex;gap:12px;justify-content:center;padding:16px 0 8px;}
.btn-ci,.btn-co{padding:12px 24px;border-radius:11px;border:1.5px solid;font-size:14px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;font-family:inherit;transition:all 0.2s;}
.btn-ci{background:var(--accent);color:#fff;border-color:var(--accent);}
.btn-ci:disabled{opacity:0.4;cursor:not-allowed;}
.btn-co{background:var(--red-light);color:var(--red);border-color:#f09595;}
.btn-co:disabled{opacity:0.4;cursor:not-allowed;}
/* Location badge */
.location{display:flex;align-items:center;justify-content:center;gap:6px;text-align:center;font-size:12px;padding-bottom:8px;border-radius:20px;padding:4px 12px 8px;}
.loc-checking{color:var(--text-hint);}
.loc-in-range{color:#2e7d32;font-weight:600;}
.loc-out-range{color:#c62828;font-weight:600;}
.loc-error{color:#c62828;}
.summary{display:flex;flex-direction:column;gap:6px;}
.sum-row{display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px solid var(--border-color);}
.sum-row:last-child{border-bottom:none;}
.sum-label{color:var(--text-muted);}
.loading-msg,.empty-msg{text-align:center;padding:24px;color:var(--text-hint);font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;}
@media(max-width:700px){.clock-big{font-size:38px;}.clock-actions{flex-direction:column;gap:8px;}.btn-ci,.btn-co{width:100%;justify-content:center;}}
</style>
