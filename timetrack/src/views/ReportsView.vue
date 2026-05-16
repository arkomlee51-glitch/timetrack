<template>
  <AppLayout>
    <div class="section-header">
      <span class="section-title">รายงานและสถิติ</span>
      <div style="display:flex;gap:8px">
        <select v-model="period" class="form-input" style="width:130px;padding:9px 14px" @change="load">
          <option value="month">เดือนนี้</option>
          <option value="quarter">ไตรมาส</option>
          <option value="year">ปีนี้</option>
        </select>
        <button class="btn" @click="load"><i class="ti ti-refresh" /> รีเฟรช</button>
        <button class="btn"><i class="ti ti-download" /> ส่งออก</button>
      </div>
    </div>

    <div v-if="error" class="banner err"><i class="ti ti-alert-circle" /> {{ error }}</div>

    <!-- Stats cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">อัตราการมา</div>
        <div class="stat-value" style="color:var(--accent)">{{ loading ? '…' : (stats.attendanceRate ?? '—') }}{{ stats.attendanceRate != null ? '%' : '' }}</div>
        <div v-if="stats.attendanceDiff != null" class="stat-sub" :class="stats.attendanceDiff >= 0 ? 'up' : 'down'">
          {{ stats.attendanceDiff >= 0 ? '+' : '' }}{{ stats.attendanceDiff }}%
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">อัตราการสาย</div>
        <div class="stat-value" style="color:var(--amber)">{{ loading ? '…' : (stats.lateRate ?? '—') }}{{ stats.lateRate != null ? '%' : '' }}</div>
        <div v-if="stats.lateDiff != null" class="stat-sub" :class="stats.lateDiff <= 0 ? 'up' : 'down'">
          {{ stats.lateDiff >= 0 ? '+' : '' }}{{ stats.lateDiff }}%
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">OT รวม</div>
        <div class="stat-value">{{ loading ? '…' : (stats.totalOT ?? '—') }}</div>
        <div class="stat-sub">ชั่วโมง</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">วันลาเฉลี่ย</div>
        <div class="stat-value">{{ loading ? '…' : (stats.avgLeave ?? '—') }}</div>
        <div class="stat-sub">วัน/คน/เดือน</div>
      </div>
    </div>

    <div v-if="loading" class="card"><div class="loading-msg"><i class="ti ti-loader-2" /> กำลังโหลด...</div></div>

    <div v-else class="grid-2">
      <!-- Department attendance -->
      <div class="card">
        <div class="card-header"><span class="card-title">อัตรามาทำงาน รายแผนก</span></div>
        <div v-if="!deptBars.length" class="loading-msg"><i class="ti ti-inbox" /> ไม่มีข้อมูล</div>
        <div class="report-bar-wrap" v-else>
          <div class="report-bar-row" v-for="r in deptBars" :key="r.label">
            <div class="report-bar-label">{{ r.label }}</div>
            <div class="report-bar-track"><div class="report-bar-fill" :style="{width:r.pct+'%',background:r.color}"/></div>
            <div class="report-bar-val">{{ r.pct }}%</div>
          </div>
        </div>
      </div>

      <!-- Leave reasons -->
      <div class="card">
        <div class="card-header"><span class="card-title">สาเหตุการลา</span></div>
        <div v-if="!leaveBars.length" class="loading-msg"><i class="ti ti-inbox" /> ไม่มีข้อมูล</div>
        <div class="report-bar-wrap" v-else>
          <div class="report-bar-row" v-for="r in leaveBars" :key="r.label">
            <div class="report-bar-label">{{ r.label }}</div>
            <div class="report-bar-track"><div class="report-bar-fill" :style="{width:r.pct+'%',background:r.color}"/></div>
            <div class="report-bar-val">{{ r.pct }}%</div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/AppLayout.vue'
import { ref, onMounted } from 'vue'
import { apiGetReports } from '../services/api'

const BAR_COLORS = ['var(--accent)', 'var(--blue)', 'var(--purple)', 'var(--amber)', 'var(--red)']

const period   = ref('month')
const loading  = ref(false)
const error    = ref('')
const stats    = ref({})
const deptBars = ref([])
const leaveBars= ref([])

async function load() {
  loading.value = true
  error.value   = ''
  try {
    const res = await apiGetReports(period.value)
    if (res.success && res.data) {
      const d = res.data
      stats.value    = d.stats    ?? {}
      deptBars.value = (d.deptBars  ?? []).map((r, i) => ({ ...r, color: BAR_COLORS[i % BAR_COLORS.length] }))
      leaveBars.value= (d.leaveBars ?? []).map((r, i) => ({ ...r, color: BAR_COLORS[i % BAR_COLORS.length] }))
    } else {
      error.value = res.message ?? 'โหลดข้อมูลไม่ได้'
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.banner{border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:13px;}
.banner.err{background:var(--red-light);color:#791f1f;border:1px solid #f09595;}
.loading-msg{text-align:center;padding:32px;color:var(--text-hint);font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;}
.stat-sub.up{color:var(--accent);font-size:11px;} .stat-sub.down{color:var(--red);font-size:11px;} .stat-sub{font-size:11px;color:var(--text-hint);}
</style>
