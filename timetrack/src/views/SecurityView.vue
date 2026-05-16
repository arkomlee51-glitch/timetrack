<template>
  <AppLayout>
    <div class="section-header">
      <span class="section-title">ความปลอดภัย & Audit Log</span>
      <button class="btn" @click="load"><i class="ti ti-refresh" /> รีเฟรช</button>
    </div>

    <div v-if="error" class="banner err"><i class="ti ti-alert-circle" /> {{ error }}</div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">เข้าระบบวันนี้</div>
        <div class="stat-value">{{ loading ? '…' : (secStats.loginToday ?? '—') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Login ล้มเหลว</div>
        <div class="stat-value" style="color:var(--red)">{{ loading ? '…' : (secStats.loginFailed ?? '—') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">IP ผิดปกติ</div>
        <div class="stat-value" style="color:var(--amber)">{{ loading ? '…' : (secStats.suspiciousIP ?? '—') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">2FA เปิดใช้</div>
        <div class="stat-value" style="color:var(--accent)">{{ loading ? '…' : (secStats.twoFAEnabled != null ? secStats.twoFAEnabled + '%' : '—') }}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Audit Log ล่าสุด</span>
        <span class="page-info" v-if="totalPages > 1">หน้า {{ currentPage }} / {{ totalPages }}</span>
      </div>

      <div v-if="loading" class="loading-msg"><i class="ti ti-loader-2" /> กำลังโหลด...</div>
      <div v-else-if="!logs.length" class="loading-msg"><i class="ti ti-inbox" /> ไม่มีข้อมูล</div>
      <div class="table-wrap" v-else>
        <table>
          <thead>
            <tr><th>เวลา</th><th>ผู้ใช้</th><th>การกระทำ</th><th>IP</th><th>ผล</th></tr>
          </thead>
          <tbody>
            <tr v-for="a in pagedLogs" :key="a.time + a.user">
              <td style="font-family:monospace;color:var(--text-muted)">{{ a.time }}</td>
              <td>{{ a.user }}</td>
              <td>{{ a.action }}</td>
              <td style="font-family:monospace;color:var(--text-hint)">{{ a.ip }}</td>
              <td><span class="badge" :class="a.result">{{ RESULT[a.result] ?? a.result }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button class="btn sm" :disabled="currentPage === 1" @click="currentPage--">
          <i class="ti ti-chevron-left" />
        </button>
        <button
          v-for="p in pageNumbers" :key="p"
          class="btn sm" :class="{ primary: p === currentPage }"
          @click="currentPage = p">{{ p }}</button>
        <button class="btn sm" :disabled="currentPage === totalPages" @click="currentPage++">
          <i class="ti ti-chevron-right" />
        </button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/AppLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { apiGetAuditLog } from '../services/api'

const RESULT   = { success:'สำเร็จ', danger:'บล็อก', info:'ดำเนินการ' }
const PAGE_SIZE = 10

const loading   = ref(false)
const error     = ref('')
const logs      = ref([])
const secStats  = ref({})
const currentPage = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(logs.value.length / PAGE_SIZE)))
const pagedLogs  = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return logs.value.slice(start, start + PAGE_SIZE)
})
const pageNumbers = computed(() => {
  const total = totalPages.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const cur = currentPage.value
  const pages = new Set([1, total, cur, cur - 1, cur + 1].filter(p => p >= 1 && p <= total))
  return [...pages].sort((a, b) => a - b)
})

async function load() {
  loading.value   = true
  error.value     = ''
  currentPage.value = 1
  try {
    const res = await apiGetAuditLog({ page: 1, pageSize: 200 })
    if (res.success && res.data) {
      secStats.value = res.data.stats ?? {}
      logs.value     = res.data.logs  ?? []
    } else {
      error.value = res.message ?? 'โหลดข้อมูลไม่ได้'
    }
  } catch (e) {
    error.value = e.message
    logs.value  = []
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
.page-info{font-size:12px;color:var(--text-hint);}
.pagination{display:flex;gap:6px;justify-content:center;padding:16px 0 4px;flex-wrap:wrap;}
</style>
