<template>
  <AppLayout>
    <div class="section-header">
      <span class="section-title">ใบลาของฉัน</span>
      <button class="btn primary"><i class="ti ti-plus" /> ยื่นใบลา</button>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-title">โควตาลาปีนี้</span></div>
        <div class="pay-row" v-for="q in quota" :key="q.label"><span class="pay-label">{{q.label}}</span><span>{{q.used}}</span><span :style="{color:q.color,fontWeight:700}">{{q.left}}</span></div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">ยื่นใบลาใหม่</span></div>
        <div style="margin-bottom:12px"><label class="form-label">ประเภทการลา</label><select class="form-input"><option>ลาพักร้อน</option><option>ลาป่วย</option><option>ลากิจ</option><option>ขอ OT</option></select></div>
        <div class="form-row-2"><div><label class="form-label">วันที่เริ่ม</label><input type="date" class="form-input"/></div><div><label class="form-label">วันที่สิ้นสุด</label><input type="date" class="form-input"/></div></div>
        <div style="margin-bottom:14px"><label class="form-label">เหตุผล</label><textarea class="form-input" rows="2" placeholder="ระบุเหตุผล..."/></div>
        <button class="btn primary" style="width:100%;justify-content:center"><i class="ti ti-send" /> ส่งคำขอ</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">ประวัติใบลา</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ประเภท</th><th>ช่วงวันที่</th><th>วัน</th><th>เหตุผล</th><th>สถานะ</th></tr></thead>
          <tbody>
            <tr><td>ลาพักร้อน</td><td>1–5 เม.ย. 2568</td><td>5</td><td>ท่องเที่ยว</td><td><span class="badge success">อนุมัติ</span></td></tr>
            <tr><td>ลาป่วย</td><td>12 มี.ค. 2568</td><td>1</td><td>ไข้</td><td><span class="badge success">อนุมัติ</span></td></tr>
            <tr><td>ลากิจ</td><td>15 พ.ค. 2568</td><td>1</td><td>ธุระส่วนตัว</td><td><span class="badge warning">รออนุมัติ</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>
<script setup>
import AppLayout from '../components/AppLayout.vue'
const quota = [
  {label:'ลาพักร้อน',used:'6/10 วัน',left:'4 วัน',color:'var(--accent)'},
  {label:'ลาป่วย',   used:'3/30 วัน',left:'27 วัน',color:'var(--accent)'},
  {label:'ลากิจ',    used:'1/3 วัน', left:'2 วัน', color:'var(--accent)'},
  {label:'OT สะสม', used:'12.5 ชม.',left:'รอจ่าย',color:'var(--amber)'},
]
</script>
<style scoped>
.pay-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-color);font-size:13px;}
.pay-row:last-child{border-bottom:none;} .pay-label{color:var(--text-muted);}
</style>
