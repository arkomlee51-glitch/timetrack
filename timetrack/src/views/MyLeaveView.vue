<template>
  <AppLayout>

    <!-- ── Title (ไม่มีปุ่ม ยื่นใบลา ด้านบนแล้ว) ── -->
    <div class="section-header">
      <span class="section-title">ใบลาของฉัน</span>
    </div>

    <!-- Success / Error banner -->
    <div v-if="success" class="banner ok"><i class="ti ti-circle-check" /> {{ success }}</div>
    <div v-if="leavesStore.error" class="banner err"><i class="ti ti-alert-circle" /> {{ leavesStore.error }}</div>

    <div class="grid-2">

      <!-- ── โควตาลา ── -->
      <div class="card">
        <div class="card-header"><span class="card-title">โควตาลาปีนี้</span></div>
        <div class="quota-row" v-for="q in quota" :key="q.label">
          <span class="quota-label">{{ q.label }}</span>
          <span style="color:var(--text-muted)">{{ q.used }}</span>
          <span :style="{ color: q.color, fontWeight: 700 }">{{ q.left }}</span>
        </div>
      </div>

      <!-- ── ฟอร์มยื่นใบลา ── -->
      <div class="card">
        <div class="card-header"><span class="card-title">ยื่นใบลาใหม่</span></div>

        <!-- ประเภทการลา -->
        <div class="field">
          <label class="form-label">ประเภทการลา <span class="req">*</span></label>
          <select v-model="form.type" class="form-input">
            <option value="">— เลือกประเภท —</option>
            <option value="ลาพักร้อน">ลาพักร้อน</option>
            <option value="ลาป่วย">ลาป่วย</option>
            <option value="ลากิจ">ลากิจ</option>
            <option value="OT">ขอ OT</option>
          </select>
        </div>

        <!-- วันที่ -->
        <div class="form-row-2">
          <div class="field">
            <label class="form-label">วันที่เริ่ม <span class="req">*</span></label>
            <input v-model="form.start_date" type="date" class="form-input" :min="today"/>
          </div>
          <div class="field">
            <label class="form-label">วันที่สิ้นสุด <span class="req">*</span></label>
            <input v-model="form.end_date" type="date" class="form-input" :min="form.start_date || today"/>
          </div>
        </div>

        <!-- จำนวนวัน (คำนวณอัตโนมัติ) -->
        <div v-if="dayCount > 0" class="day-count">
          <i class="ti ti-calendar-stats" />
          จำนวน <strong>{{ dayCount }} วัน</strong>
        </div>

        <!-- เหตุผล -->
        <div class="field">
          <label class="form-label">เหตุผล <span class="req">*</span></label>
          <textarea
            v-model="form.reason"
            class="form-input"
            rows="3"
            placeholder="ระบุเหตุผลการลา..."
          />
        </div>

        <!-- Form error -->
        <div v-if="formError" class="banner err" style="margin-bottom:12px">
          <i class="ti ti-alert-circle" /> {{ formError }}
        </div>

        <!-- ปุ่มส่ง -->
        <button
          class="btn primary"
          style="width:100%;justify-content:center"
          :disabled="sending"
          @click="handleSubmit"
        >
          <i class="ti" :class="sending ? 'ti-loader-2' : 'ti-send'" />
          {{ sending ? 'กำลังส่ง...' : 'ส่งคำขอ' }}
        </button>
      </div>
    </div>

    <!-- ── ประวัติใบลา ── -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">ประวัติใบลา</span>
        <button class="btn sm" @click="leavesStore.fetchLeaves()">
          <i class="ti ti-refresh" /> รีเฟรช
        </button>
      </div>

      <div v-if="leavesStore.loading" class="loading-msg">
        <i class="ti ti-loader-2" /> กำลังโหลด...
      </div>
      <div class="table-wrap" v-else>
        <table>
          <thead>
            <tr><th>ประเภท</th><th>ช่วงวันที่</th><th>วัน</th><th>เหตุผล</th><th>สถานะ</th></tr>
          </thead>
          <tbody>
            <tr v-if="!leavesStore.items.length">
              <td colspan="5" class="loading-msg">ยังไม่มีประวัติใบลา</td>
            </tr>
            <tr v-for="lv in leavesStore.items" :key="lv.id">
              <td>{{ lv.type }}</td>
              <td>{{ lv.dates }}</td>
              <td>{{ lv.days }}</td>
              <td>{{ lv.reason }}</td>
              <td>
                <span class="badge" :class="STATUS_CLASS[lv.status] || 'gray'">
                  {{ STATUS_LABEL[lv.status] || lv.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/AppLayout.vue'
import { ref, reactive, computed, onMounted } from 'vue'
import { useLeavesStore } from '../stores/leaves'

const leavesStore = useLeavesStore()

// ── โหลดประวัติเมื่อเปิดหน้า ──────────────────────────────────
onMounted(() => leavesStore.fetchLeaves())

// ── สถานะ badge ───────────────────────────────────────────────
const STATUS_CLASS = { pending:'warning', approved:'success', rejected:'danger' }
const STATUS_LABEL = { pending:'รออนุมัติ', approved:'อนุมัติแล้ว', rejected:'ปฏิเสธแล้ว' }

// ── Form state ─────────────────────────────────────────────────
const EMPTY = { type:'', start_date:'', end_date:'', reason:'' }
const form      = reactive({ ...EMPTY })
const formError = ref('')
const sending   = ref(false)
const success   = ref('')

// วันนี้ (min สำหรับ date input)
const today = new Date().toISOString().slice(0, 10)

// คำนวณจำนวนวันอัตโนมัติ
const dayCount = computed(() => {
  if (!form.start_date || !form.end_date) return 0
  const ms = new Date(form.end_date) - new Date(form.start_date)
  return ms < 0 ? 0 : Math.round(ms / 86400000) + 1
})

// โควตา (static — เชื่อม API จริงได้ภายหลัง)
const quota = [
  { label:'ลาพักร้อน', used:'6/10 วัน',  left:'4 วัน',  color:'var(--accent)' },
  { label:'ลาป่วย',    used:'3/30 วัน',  left:'27 วัน', color:'var(--accent)' },
  { label:'ลากิจ',     used:'1/3 วัน',   left:'2 วัน',  color:'var(--accent)' },
  { label:'OT สะสม',  used:'12.5 ชม.', left:'รอจ่าย', color:'var(--amber)'  },
]

// ── Validate ──────────────────────────────────────────────────
function validate() {
  if (!form.type)                           return 'กรุณาเลือกประเภทการลา'
  if (!form.start_date)                     return 'กรุณาเลือกวันที่เริ่ม'
  if (!form.end_date)                       return 'กรุณาเลือกวันที่สิ้นสุด'
  if (form.end_date < form.start_date)      return 'วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่ม'
  if (!form.reason.trim())                  return 'กรุณาระบุเหตุผล'
  return ''
}

// ── Submit → เรียก leavesStore.requestLeave() ─────────────────
async function handleSubmit() {
  formError.value = validate()
  if (formError.value) return

  sending.value = true
  success.value = ''

  const ok = await leavesStore.requestLeave({
    type:       form.type,
    start_date: form.start_date,
    end_date:   form.end_date,
    reason:     form.reason.trim(),
  })

  sending.value = false

  if (ok) {
    success.value = `ส่งคำขอ "${form.type}" สำเร็จ! รอการอนุมัติจากผู้ดูแล`
    Object.assign(form, EMPTY)   // reset form
    setTimeout(() => success.value = '', 5000)
  } else {
    formError.value = leavesStore.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่'
  }
}
</script>

<style scoped>
.banner { border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; font-size: 13px; }
.banner.ok  { background: var(--accent-light); color: var(--accent-dark); border: 1px solid var(--accent-mid); }
.banner.err { background: var(--red-light); color: #791f1f; border: 1px solid #f09595; }

.quota-row  { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; }
.quota-row:last-child { border-bottom: none; }
.quota-label { color: var(--text-muted); }

.field { margin-bottom: 14px; }
.req   { color: var(--red); margin-left: 2px; }

.day-count {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--accent-dark);
  background: var(--accent-light); border-radius: 8px;
  padding: 7px 12px; margin-bottom: 14px;
}

.loading-msg { text-align: center; padding: 24px; color: var(--text-hint); font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; }
</style>
