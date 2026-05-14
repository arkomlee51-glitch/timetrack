<template>
  <AppLayout>
    <div class="section-header">
      <span class="section-title">ตารางกะงาน — สัปดาห์นี้</span>
      <div style="display:flex;gap:8px">
        <button class="btn sm"><i class="ti ti-chevron-left"/></button>
        <button class="btn sm">5–11 พ.ค. 2568</button>
        <button class="btn sm"><i class="ti ti-chevron-right"/></button>
      </div>
    </div>
    <div class="card">
      <div class="legend">
        <div class="leg-item"><div class="leg-dot" style="background:var(--blue-light)"/>กะเช้า</div>
        <div class="leg-item"><div class="leg-dot" style="background:var(--amber-light)"/>กะบ่าย</div>
        <div class="leg-item"><div class="leg-dot" style="background:var(--purple-light)"/>กะดึก</div>
        <div class="leg-item"><div class="leg-dot" style="background:var(--red-light)"/>OT</div>
        <div class="leg-item"><div class="leg-dot" style="background:rgba(0,0,0,0.05);border:1px solid var(--border-color)"/>หยุด</div>
      </div>
      <div class="grid-wrap">
        <div class="shift-grid">
          <div class="sh-head"/>
          <div class="sh-head" v-for="d in days" :key="d.label" :style="d.today?{color:'var(--accent)'}:{}">{{ d.label }}</div>
          <template v-for="emp in schedule" :key="emp.name">
            <div class="sh-name">{{ emp.name }}</div>
            <div v-for="(s,i) in emp.shifts" :key="i" class="sh-cell" :class="'sh-'+s">{{ LABELS[s] }}</div>
          </template>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
<script setup>
import AppLayout from '../components/AppLayout.vue'
const LABELS = { morning:'เช้า', afternoon:'บ่าย', night:'ดึก', off:'หยุด', ot:'OT' }
const days = ['จ.5','อ.6','พ.7','พฤ.8','ศ.9','ส.10','อา.11'].map((l,i)=>({label:l,today:i===3}))
const schedule = [
  { name:'สุภาพร', shifts:['morning','morning','morning','morning','morning','off','off'] },
  { name:'พิชัย',  shifts:['morning','ot','morning','morning','morning','off','off'] },
  { name:'นภา',    shifts:['afternoon','afternoon','afternoon','afternoon','afternoon','afternoon','off'] },
  { name:'กษิดิ์เดช',shifts:['night','night','night','night','off','off','night'] },
]
</script>
<style scoped>
.legend{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:16px;font-size:12px;}
.leg-item{display:flex;align-items:center;gap:5px;}
.leg-dot{width:12px;height:12px;border-radius:3px;}
.grid-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
.shift-grid{display:grid;grid-template-columns:70px repeat(7,1fr);gap:5px;min-width:480px;}
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
