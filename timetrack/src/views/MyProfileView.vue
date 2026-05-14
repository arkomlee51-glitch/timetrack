<template>
  <AppLayout>
    <div class="card">
      <div class="profile-head">
        <div class="profile-av" style="background:var(--blue-light);color:#0c447c">{{ auth.currentUser.initials }}</div>
        <div>
          <h2 style="font-size:18px;font-weight:700;margin-bottom:4px">{{ auth.currentUser.name }}</h2>
          <p style="font-size:13px;color:var(--text-muted)">{{ auth.currentUser.dept }} · Senior Developer · รหัส {{ auth.currentUser.id }}</p>
          <span class="badge success" style="margin-top:6px"><i class="ti ti-circle-check"/>ปฏิบัติงานปกติ</span>
        </div>
      </div>
      <div class="form-row-2">
        <div><label class="form-label">ชื่อ-นามสกุล</label><input class="form-input" :value="auth.currentUser.name" readonly/></div>
        <div><label class="form-label">รหัสพนักงาน</label><input class="form-input" :value="auth.currentUser.id" readonly/></div>
        <div><label class="form-label">แผนก</label><input class="form-input" :value="auth.currentUser.dept" readonly/></div>
        <div><label class="form-label">กะงาน</label><input class="form-input" value="กะเช้า 08:00–17:00 น." readonly/></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">สลิปเงินเดือน — พ.ค. 2568</span><button class="btn sm"><i class="ti ti-download"/>ดาวน์โหลด</button></div>
      <div class="pay-row"><span class="pay-label">เงินเดือน</span><span>฿55,000</span></div>
      <div class="pay-row"><span class="pay-label">ค่าล่วงเวลา (4 ชม.)</span><span style="color:var(--accent)">+฿1,833</span></div>
      <div class="pay-row"><span class="pay-label">ประกันสังคม</span><span style="color:var(--red)">-฿750</span></div>
      <div class="pay-row"><span class="pay-label">ภาษีหัก ณ ที่จ่าย</span><span style="color:var(--red)">-฿2,100</span></div>
      <div class="pay-row last"><span class="pay-label">รายรับสุทธิ</span><span style="color:var(--accent);font-size:16px">฿53,983</span></div>
    </div>
  </AppLayout>
</template>
<script setup>
import AppLayout from '../components/AppLayout.vue'
import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()
</script>
<style scoped>
.profile-head{display:flex;align-items:center;gap:20px;margin-bottom:20px;}
.profile-av{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;}
.pay-row{display:flex;justify-content:space-between;padding:8px 0;font-size:13px;border-bottom:1px solid var(--border-color);}
.pay-row.last{border-bottom:none;font-weight:700;}
.pay-label{color:var(--text-muted);}
</style>
