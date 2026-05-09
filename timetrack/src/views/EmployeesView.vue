<!-- views/EmployeesView.vue — เชื่อม API จริง -->
<template>
  <AppLayout>
    <div class="section-header">
      <span class="section-title">รายชื่อพนักงานทั้งหมด</span>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <input v-model="search" class="form-input" placeholder="ค้นหาพนักงาน..." style="width:180px"/>
        <select v-model="deptFilter" class="form-input" style="width:130px">
          <option value="">ทุกแผนก</option>
          <option v-for="d in depts" :key="d">{{ d }}</option>
        </select>
        <button class="btn primary"><i class="ti ti-user-plus" /> เพิ่มพนักงาน</button>
      </div>
    </div>

    <div v-if="error" class="err-banner"><i class="ti ti-alert-circle" /> {{ error }}</div>

    <div class="card">
      <div v-if="loading" class="loading-msg"><i class="ti ti-loader-2" /> กำลังโหลด...</div>
      <div class="table-wrap" v-else>
        <table>
          <thead><tr><th>พนักงาน</th><th>รหัส</th><th>แผนก</th><th>ตำแหน่ง</th><th>กะ</th><th>Role</th><th></th></tr></thead>
          <tbody>
            <tr v-if="!filtered.length"><td colspan="7" class="loading-msg">ไม่พบข้อมูล</td></tr>
            <tr v-for="e in filtered" :key="e.id">
              <td>
                <div class="emp-row">
                  <div class="emp-avatar" :style="{ background: e.role==='admin'?'#eeedfe':'#e6f1fb', color: e.role==='admin'?'#3c3489':'#0c447c' }">
                    {{ makeInitials(e.name) }}
                  </div>
                  {{ e.name }}
                </div>
              </td>
              <td style="color:var(--text-muted)">{{ e.id }}</td>
              <td>{{ e.dept }}</td>
              <td>{{ e.position || '—' }}</td>
              <td><span class="badge gray">{{ e.shift || '—' }}</span></td>
              <td><span class="badge" :class="e.role==='admin'?'purple':'info'">{{ e.role }}</span></td>
              <td><button class="btn sm"><i class="ti ti-edit"/></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/AppLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { apiGetEmployees }          from '../services/api'

const employees  = ref([])
const loading    = ref(false)
const error      = ref('')
const search     = ref('')
const deptFilter = ref('')

onMounted(async () => {
  loading.value = true
  try {
    const data = await apiGetEmployees()
    if (data.success) employees.value = data.data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

const depts    = computed(() => [...new Set(employees.value.map(e => e.dept).filter(Boolean))])
const filtered = computed(() => employees.value.filter(e =>
  (!search.value     || e.name.includes(search.value)) &&
  (!deptFilter.value || e.dept === deptFilter.value)
))

function makeInitials(name = '') {
  const parts = name.trim().split(' ')
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)
}
</script>

<style scoped>
.err-banner{background:var(--red-light);color:#791f1f;border:1px solid #f09595;border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:13px;}
.loading-msg{text-align:center;padding:32px;color:var(--text-hint);font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;}
</style>
