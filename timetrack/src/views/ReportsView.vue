<template>
  <AppLayout>
    <div class="section-header">
      <span class="section-title">รายงานและสถิติ</span>
      <div style="display:flex;gap:8px">
        <select class="form-input" style="width:130px;padding:9px 14px"><option>เดือนนี้</option><option>ไตรมาส</option><option>ปีนี้</option></select>
        <button class="btn"><i class="ti ti-download" /> ส่งออก</button>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">อัตราการมา</div><div class="stat-value" style="color:var(--accent)">94.2%</div><div class="stat-sub up">+1.3%</div></div>
      <div class="stat-card"><div class="stat-label">อัตราการสาย</div><div class="stat-value" style="color:var(--amber)">5.8%</div><div class="stat-sub down">-0.5%</div></div>
      <div class="stat-card"><div class="stat-label">OT รวม</div><div class="stat-value">328</div><div class="stat-sub">ชั่วโมง</div></div>
      <div class="stat-card"><div class="stat-label">วันลาเฉลี่ย</div><div class="stat-value">1.4</div><div class="stat-sub">วัน/คน/เดือน</div></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">อัตรามาทำงาน รายแผนก</span></div>
        <div class="report-bar-wrap">
          <div class="report-bar-row" v-for="r in deptBars" :key="r.label">
            <div class="report-bar-label">{{r.label}}</div>
            <div class="report-bar-track"><div class="report-bar-fill" :style="{width:r.pct+'%',background:r.color}"/></div>
            <div class="report-bar-val">{{r.pct}}%</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">สาเหตุการลา</span></div>
        <div class="report-bar-wrap">
          <div class="report-bar-row" v-for="r in leaveBars" :key="r.label">
            <div class="report-bar-label">{{r.label}}</div>
            <div class="report-bar-track"><div class="report-bar-fill" :style="{width:r.pct+'%',background:r.color}"/></div>
            <div class="report-bar-val">{{r.pct}}%</div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
<script setup>
import AppLayout from '../components/AppLayout.vue'
const deptBars  = [{label:'IT',pct:96,color:'var(--accent)'},{label:'การตลาด',pct:92,color:'var(--blue)'},{label:'บัญชี',pct:94,color:'var(--purple)'},{label:'HR',pct:98,color:'var(--accent-mid)'},{label:'Operations',pct:91,color:'var(--amber)'}]
const leaveBars = [{label:'ป่วย',pct:45,color:'var(--blue)'},{label:'พักร้อน',pct:30,color:'var(--accent)'},{label:'กิจส่วนตัว',pct:15,color:'var(--purple)'},{label:'อื่นๆ',pct:10,color:'var(--amber)'}]
</script>
