<template>
  <AppLayout>
    <div class="section-header"><span class="section-title">ความปลอดภัย & Audit Log</span></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">เข้าระบบวันนี้</div><div class="stat-value">47</div></div>
      <div class="stat-card"><div class="stat-label">Login ล้มเหลว</div><div class="stat-value" style="color:var(--red)">3</div></div>
      <div class="stat-card"><div class="stat-label">IP ผิดปกติ</div><div class="stat-value" style="color:var(--amber)">1</div></div>
      <div class="stat-card"><div class="stat-label">2FA เปิดใช้</div><div class="stat-value" style="color:var(--accent)">89%</div></div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Audit Log ล่าสุด</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>เวลา</th><th>ผู้ใช้</th><th>การกระทำ</th><th>IP</th><th>ผล</th></tr></thead>
          <tbody>
            <tr v-for="a in audit" :key="a.time">
              <td style="font-family:monospace;color:var(--text-muted)">{{a.time}}</td>
              <td>{{a.user}}</td><td>{{a.action}}</td>
              <td style="font-family:monospace;color:var(--text-hint)">{{a.ip}}</td>
              <td><span class="badge" :class="a.result">{{RESULT[a.result]}}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
<script setup>
import AppLayout from '../components/AppLayout.vue'
const RESULT = { success:'สำเร็จ', danger:'บล็อก', info:'ดำเนินการ' }
const audit = [
  {time:'13:42:01',user:'สมชาย ใจดี',   action:'อนุมัติใบลา #LV-0234',       ip:'192.168.1.10',result:'success'},
  {time:'12:05:33',user:'สุภาพร วงศ์ดี', action:'แก้ไขข้อมูลพนักงาน EMP003',ip:'192.168.1.22',result:'success'},
  {time:'11:18:44',user:'unknown',        action:'Login ล้มเหลว 3 ครั้ง',      ip:'103.21.44.5', result:'danger'},
  {time:'10:30:12',user:'นภา รักดี',     action:'Export รายงานเงินเดือน',     ip:'192.168.1.18',result:'info'},
  {time:'09:01:55',user:'สมชาย ใจดี',   action:'Login เข้าระบบ',             ip:'192.168.1.10',result:'success'},
]
</script>
