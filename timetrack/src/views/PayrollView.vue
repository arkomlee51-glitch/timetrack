<template>
  <AppLayout>
    <div class="section-header">
      <span class="section-title">สรุปเงินเดือน — พ.ค. 2568</span>
      <button class="btn"><i class="ti ti-download" /> ส่งออก Excel</button>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">พนักงาน</div><div class="stat-value">124</div></div>
      <div class="stat-card"><div class="stat-label">เงินเดือนรวม</div><div class="stat-value" style="font-size:22px">฿4.82M</div></div>
      <div class="stat-card"><div class="stat-label">ค่า OT รวม</div><div class="stat-value" style="color:var(--amber);font-size:22px">฿82,500</div></div>
      <div class="stat-card"><div class="stat-label">หักขาดงาน</div><div class="stat-value" style="color:var(--red);font-size:22px">฿12,000</div></div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">รายละเอียดพนักงาน</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>พนักงาน</th><th>วันทำงาน</th><th>OT</th><th>เงินเดือน</th><th>ค่า OT</th><th>หัก</th><th>สุทธิ</th></tr></thead>
          <tbody>
            <tr v-for="p in payroll" :key="p.name">
              <td><div class="emp-row"><div class="emp-avatar" :style="{background:p.bg,color:p.fg}">{{p.initials}}</div>{{p.name}}</div></td>
              <td>{{p.days}}</td><td>{{p.ot}}</td><td>{{p.base}}</td><td>{{p.otPay}}</td><td>{{p.deduct}}</td>
              <td style="font-weight:700;color:var(--accent)">{{p.net}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
<script setup>
import AppLayout from '../components/AppLayout.vue'
const payroll = [
  {name:'สุภาพร',initials:'สภ',bg:'#E1F5EE',fg:'#0F6E56',days:'22/22',ot:'4 ชม.',base:'฿55,000',otPay:'฿1,833',deduct:'฿0',      net:'฿56,833'},
  {name:'พิชัย', initials:'พช',bg:'#faeeda',fg:'#633806',days:'22/22',ot:'8 ชม.',base:'฿48,000',otPay:'฿3,200',deduct:'฿500',    net:'฿50,700'},
  {name:'วิชัย', initials:'วช',bg:'#e6f1fb',fg:'#0c447c',days:'20/22',ot:'—',     base:'฿42,000',otPay:'฿0',    deduct:'฿3,818',  net:'฿38,182'},
]
</script>
