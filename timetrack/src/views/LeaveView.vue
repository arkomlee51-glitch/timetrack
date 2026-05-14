<!-- views/LeaveView.vue — เชื่อม API จริง -->
<template>
  <AppLayout>
    <div class="section-header">
      <span class="section-title">ใบลา / OT — รออนุมัติ</span>
      <button class="btn sm" @click="leavesStore.fetchLeaves()"><i class="ti ti-refresh" /> รีเฟรช</button>
    </div>

    <div v-if="leavesStore.error" class="err-banner">
      <i class="ti ti-alert-circle" /> {{ leavesStore.error }}
    </div>

    <div v-if="leavesStore.loading" class="loading-msg"><i class="ti ti-loader-2" /> กำลังโหลด...</div>

    <div class="grid-2" v-else>
      <div>
        <div class="sub-head">รออนุมัติ ({{ leavesStore.pending.length }})</div>
        <div class="leave-card" v-for="lv in leavesStore.pending" :key="lv.id">
          <div class="lc-head">
            <div><div class="lc-name">{{ lv.name }}</div><div class="lc-meta">{{ lv.type }} · {{ lv.dates }} ({{ lv.days }} วัน)</div></div>
            <span class="badge warning">รออนุมัติ</span>
          </div>
          <div class="lc-reason">เหตุผล: {{ lv.reason }}</div>
          <div class="lc-actions">
            <button class="btn sm primary" @click="leavesStore.approve(lv.id)"><i class="ti ti-check" /> อนุมัติ</button>
            <button class="btn sm danger"  @click="leavesStore.reject(lv.id)"><i class="ti ti-x" /> ปฏิเสธ</button>
          </div>
        </div>
        <div class="notice info" v-if="!leavesStore.pending.length && !leavesStore.loading">
          <i class="ti ti-check-circle" /> ไม่มีรายการรออนุมัติ
        </div>

        <template v-if="leavesStore.resolved.length">
          <div class="sub-head" style="margin-top:20px">ดำเนินการแล้ว</div>
          <div class="leave-card faded" v-for="lv in leavesStore.resolved" :key="lv.id">
            <div class="lc-head">
              <div><div class="lc-name">{{ lv.name }}</div><div class="lc-meta">{{ lv.type }} · {{ lv.dates }}</div></div>
              <span class="badge" :class="lv.status==='approved'?'success':'danger'">
                {{ lv.status==='approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธแล้ว' }}
              </span>
            </div>
          </div>
        </template>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">โควตาลา</span></div>
        <div class="quota-row"><span class="quota-label">ลาพักร้อน</span><span>6/10 วัน</span><span class="quota-left">4 วัน</span></div>
        <div class="quota-row"><span class="quota-label">ลาป่วย</span><span>3/30 วัน</span><span class="quota-left">27 วัน</span></div>
        <div class="quota-row"><span class="quota-label">ลากิจ</span><span>1/3 วัน</span><span class="quota-left">2 วัน</span></div>
        <div class="quota-row"><span class="quota-label">OT สะสม</span><span>12.5 ชม.</span><span style="color:var(--amber);font-weight:700">รอจ่าย</span></div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/AppLayout.vue'
import { useLeavesStore } from '../stores/leaves'
import { onMounted }      from 'vue'

const leavesStore = useLeavesStore()
onMounted(() => leavesStore.fetchLeaves())
</script>

<style scoped>
.err-banner{background:var(--red-light);color:#791f1f;border:1px solid #f09595;border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:13px;}
.loading-msg{text-align:center;padding:40px;color:var(--text-hint);font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;}
.sub-head{font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:10px;}
.leave-card{border:1px solid var(--border-color);border-radius:14px;padding:16px;margin-bottom:10px;background:var(--card-bg);}
.leave-card.faded{opacity:0.7;}
.lc-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}
.lc-name{font-size:13px;font-weight:700;}.lc-meta{font-size:11px;color:var(--text-muted);}
.lc-reason{font-size:12px;color:var(--text-hint);margin-bottom:10px;}
.lc-actions{display:flex;gap:8px;}
.quota-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-color);font-size:13px;}
.quota-row:last-child{border-bottom:none;}.quota-label{color:var(--text-muted);}.quota-left{color:var(--accent);font-weight:700;}
.notice{padding:14px 18px;border-radius:12px;font-size:13px;margin-bottom:16px;display:flex;align-items:center;gap:10px;}
.notice.info{background:var(--blue-light);color:#0c447c;border:1px solid #b5d4f4;}
</style>
