<!-- views/EmployeesView.vue -->
<template>
  <AppLayout>

    <!-- ── Header ── -->
    <div class="section-header">
      <span class="section-title">รายชื่อพนักงานทั้งหมด</span>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <input v-model="search" class="form-input" placeholder="ค้นหาชื่อ..." style="width:160px"
          @input="currentPage = 1"/>
        <select v-model="deptFilter" class="form-input" style="width:130px" @change="currentPage = 1">
          <option value="">ทุกแผนก</option>
          <option v-for="d in depts" :key="d">{{ d }}</option>
        </select>
        <button class="btn" @click="loadEmployees" :disabled="loading">
          <i class="ti" :class="loading ? 'ti-loader-2' : 'ti-refresh'" /> รีเฟรช
        </button>
        <button class="btn primary" @click="openAdd">
          <i class="ti ti-user-plus" /> เพิ่มพนักงาน
        </button>
      </div>
    </div>

    <!-- Error / Success banner -->
    <div v-if="error"   class="banner err"><i class="ti ti-alert-circle" /> {{ error }}</div>
    <div v-if="success" class="banner ok" ><i class="ti ti-circle-check" /> {{ success }}</div>

    <!-- ── ตารางพนักงาน ── -->
    <div class="card">
      <div v-if="loading" class="loading-msg"><i class="ti ti-loader-2" /> กำลังโหลด...</div>
      <div v-else>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>พนักงาน</th>
                <th>รหัส</th>
                <th>Username</th>
                <th>แผนก</th>
                <th>กะ</th>
                <th>Role</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!pagedEmployees.length">
                <td colspan="7" class="loading-msg">ไม่พบข้อมูล</td>
              </tr>
              <tr v-for="e in pagedEmployees" :key="e.id">
                <td>
                  <div class="emp-row">
                    <div class="emp-avatar"
                      :style="{ background: e.role==='admin'?'#eeedfe':'#e6f1fb',
                                color:      e.role==='admin'?'#3c3489':'#0c447c' }">
                      {{ makeInitials(e.name) }}
                    </div>
                    {{ e.name }}
                  </div>
                </td>
                <td style="color:var(--text-muted)">{{ e.id }}</td>
                <td style="color:var(--text-muted)">{{ e.userName }}</td>
                <td>{{ e.dept || '—' }}</td>
                <td><span class="badge gray">{{ e.shift || '—' }}</span></td>
                <td><span class="badge" :class="e.role==='admin'?'purple':'info'">{{ e.role }}</span></td>
                <td>
                  <button class="btn sm" @click="openEdit(e)">
                    <i class="ti ti-edit" /> แก้ไข
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <span class="page-summary">
            แสดง {{ pageStart + 1 }}–{{ Math.min(pageStart + PAGE_SIZE, filtered.length) }} จาก {{ filtered.length }} คน
          </span>
          <div class="page-btns">
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
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         MODAL — เพิ่ม / แก้ไขพนักงาน
         ══════════════════════════════════════════════ -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">

        <!-- Modal Header -->
        <div class="modal-header">
          <span class="modal-title">
            <i :class="['ti', isEditMode ? 'ti-user-edit' : 'ti-user-plus']" />
            {{ isEditMode ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่' }}
          </span>
          <button class="close-btn" @click="closeModal" :disabled="saving">
            <i class="ti ti-x" />
          </button>
        </div>

        <!-- Modal Body — Form -->
        <div class="modal-body">

          <div v-if="!isEditMode" class="notice info" style="margin-bottom:16px">
            <i class="ti ti-info-circle" />
            รหัสพนักงานจะถูกสร้างอัตโนมัติโดยระบบ
          </div>

          <div class="form-row-2">
            <div>
              <label class="form-label">Username <span class="required">*</span></label>
              <input v-model="form.userName" class="form-input"
                placeholder="เช่น kanya"
                :disabled="isEditMode || saving"/>
              <div v-if="isEditMode" class="hint">ไม่สามารถเปลี่ยน Username ได้</div>
            </div>

            <div>
              <label class="form-label">ชื่อ-นามสกุล <span class="required">*</span></label>
              <input v-model="form.name" class="form-input" placeholder="เช่น กัญญา เพราะสนัด" :disabled="saving"/>
            </div>
          </div>

          <div class="form-row-2">
            <div>
              <label class="form-label">
                รหัสผ่าน
                <span v-if="isEditMode" class="hint-inline">(เว้นว่างถ้าไม่เปลี่ยน)</span>
                <span v-else class="required">*</span>
              </label>
              <div style="position:relative">
                <input v-model="form.password" :type="showPwd?'text':'password'"
                  class="form-input" placeholder="••••••••" :disabled="saving"/>
                <i :class="['ti', showPwd?'ti-eye-off':'ti-eye']"
                  style="position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--text-hint)"
                  @click="showPwd=!showPwd"/>
              </div>
            </div>

            <div>
              <label class="form-label">Role <span class="required">*</span></label>
              <select v-model="form.role" class="form-input" :disabled="saving">
                <option value="employee">employee — พนักงานทั่วไป</option>
                <option value="admin">admin — ผู้ดูแลระบบ</option>
              </select>
            </div>
          </div>

          <div class="form-row-2">
            <div>
              <label class="form-label">แผนก <span class="required">*</span></label>
              <input v-model="form.dept" class="form-input" placeholder="เช่น IT, HR, การตลาด" :disabled="saving"/>
            </div>

            <div>
              <label class="form-label">กะงาน <span class="required">*</span></label>
              <select v-model="form.shift" class="form-input" :disabled="saving">
                <option value="เช้า">เช้า (06:00–14:00)</option>
                <option value="บ่าย">บ่าย (14:00–22:00)</option>
                <option value="ดึก">ดึก (22:00–06:00)</option>
              </select>
            </div>
          </div>

          <!-- Form error -->
          <div v-if="formError" class="banner err" style="margin-top:8px">
            <i class="ti ti-alert-circle" /> {{ formError }}
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button class="btn" @click="closeModal" :disabled="saving">ยกเลิก</button>
          <button class="btn primary" :disabled="saving" @click="handleSubmit">
            <i class="ti" :class="saving ? 'ti-loader-2 spin' : (isEditMode ? 'ti-device-floppy' : 'ti-user-plus')" />
            {{ saving ? 'กำลังบันทึก...' : (isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มพนักงาน') }}
          </button>
        </div>

      </div>
    </div>

  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/AppLayout.vue'
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { apiGetEmployees, apiAddEmployee, apiUpdateEmployee } from '../services/api'

const PAGE_SIZE = 10

// ── ข้อมูลตาราง ──────────────────────────────────────────────
const employees   = ref([])
const loading     = ref(false)
const error       = ref('')
const success     = ref('')
const search      = ref('')
const deptFilter  = ref('')
const currentPage = ref(1)

// ── Modal state ───────────────────────────────────────────────
const showModal  = ref(false)
const isEditMode = ref(false)
const saving     = ref(false)
const formError  = ref('')
const showPwd    = ref(false)

const EMPTY_FORM = { userName:'', name:'', password:'', role:'employee', dept:'', shift:'เช้า' }
const form = reactive({ ...EMPTY_FORM })

onMounted(loadEmployees)

// รีเซ็ต page เมื่อ filter เปลี่ยน
watch([search, deptFilter], () => { currentPage.value = 1 })

async function loadEmployees() {
  loading.value = true
  error.value   = ''
  try {
    const data = await apiGetEmployees()
    if (data.success) employees.value = data.data ?? []
    else error.value = data.message || 'โหลดข้อมูลไม่ได้'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// ── Filter + Pagination ───────────────────────────────────────
const depts = computed(() =>
  [...new Set(employees.value.map(e => e.dept).filter(Boolean))]
)
const filtered = computed(() =>
  employees.value.filter(e =>
    (!search.value     || e.name?.includes(search.value) || e.userName?.includes(search.value)) &&
    (!deptFilter.value || e.dept === deptFilter.value)
  )
)
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const pageStart  = computed(() => (currentPage.value - 1) * PAGE_SIZE)
const pagedEmployees = computed(() =>
  filtered.value.slice(pageStart.value, pageStart.value + PAGE_SIZE)
)
const pageNumbers = computed(() => {
  const total = totalPages.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const cur = currentPage.value
  const pages = new Set([1, total, cur, cur - 1, cur + 1].filter(p => p >= 1 && p <= total))
  return [...pages].sort((a, b) => a - b)
})

// ── Modal helpers ─────────────────────────────────────────────
function openAdd() {
  isEditMode.value = false
  formError.value  = ''
  showPwd.value    = false
  Object.assign(form, EMPTY_FORM)
  showModal.value  = true
}

function openEdit(emp) {
  isEditMode.value = true
  formError.value  = ''
  showPwd.value    = false
  Object.assign(form, {
    userName: emp.userName || '',
    name:     emp.name     || '',
    password: '',
    role:     emp.role     || 'employee',
    dept:     emp.dept     || '',
    shift:    emp.shift    || 'เช้า',
    _id:      emp.id,
  })
  showModal.value = true
}

function closeModal() {
  if (saving.value) return
  showModal.value = false
  formError.value = ''
}

function validate() {
  if (!form.userName.trim()) return 'กรุณาใส่ Username'
  if (!form.name.trim())     return 'กรุณาใส่ชื่อ-นามสกุล'
  if (!isEditMode.value && !form.password.trim()) return 'กรุณาใส่รหัสผ่าน'
  if (!form.dept.trim())     return 'กรุณาใส่แผนก'
  return ''
}

async function handleSubmit() {
  formError.value = validate()
  if (formError.value) return

  saving.value  = true
  success.value = ''
  formError.value = ''

  try {
    let data
    if (isEditMode.value) {
      const payload = {
        emp_id:   form._id,
        name:     form.name.trim(),
        role:     form.role,
        dept:     form.dept.trim(),
        shift:    form.shift,
      }
      if (form.password.trim()) payload.password = form.password.trim()
      data = await apiUpdateEmployee(payload)
    } else {
      data = await apiAddEmployee({
        userName: form.userName.trim(),
        name:     form.name.trim(),
        password: form.password.trim(),
        role:     form.role,
        dept:     form.dept.trim(),
        shift:    form.shift,
      })
    }

    if (data.success) {
      success.value = isEditMode.value
        ? `แก้ไขข้อมูล "${form.name}" สำเร็จ`
        : `เพิ่มพนักงาน "${form.name}" สำเร็จ! รหัส: ${data.id ?? ''}`
      closeModal()
      await loadEmployees()
      setTimeout(() => success.value = '', 4000)
    } else {
      formError.value = data.message || 'เกิดข้อผิดพลาด'
    }
  } catch (err) {
    formError.value = err.message
  } finally {
    saving.value = false
  }
}

function makeInitials(name = '') {
  const parts = name.trim().split(' ')
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)
}
</script>

<style scoped>
.banner{border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:13px;}
.banner.err{background:var(--red-light);color:#791f1f;border:1px solid #f09595;}
.banner.ok {background:var(--accent-light);color:var(--accent-dark);border:1px solid var(--accent-mid);}
.loading-msg{text-align:center;padding:32px;color:var(--text-hint);font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;}

/* Pagination */
.pagination{display:flex;align-items:center;justify-content:space-between;padding:14px 4px 4px;flex-wrap:wrap;gap:8px;}
.page-summary{font-size:12px;color:var(--text-hint);}
.page-btns{display:flex;gap:6px;flex-wrap:wrap;}

/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;}
.modal{background:var(--card-bg);border-radius:20px;width:100%;max-width:560px;box-shadow:0 24px 60px rgba(0,0,0,0.18);display:flex;flex-direction:column;max-height:90vh;overflow:hidden;}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--border-color);}
.modal-title{font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;}
.close-btn{width:32px;height:32px;border-radius:8px;border:none;background:var(--color-background-secondary,rgba(0,0,0,0.05));cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:17px;color:var(--text-muted);transition:background 0.2s;}
.close-btn:hover:not(:disabled){background:var(--red-light);color:var(--red);}
.close-btn:disabled{opacity:0.4;cursor:not-allowed;}
.modal-body{padding:24px;overflow-y:auto;}
.modal-footer{display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid var(--border-color);}

.required{color:var(--red);margin-left:2px;}
.hint{font-size:11px;color:var(--text-hint);margin-top:4px;}
.hint-inline{font-size:11px;color:var(--text-hint);font-weight:400;}
.notice.info{background:var(--blue-light);color:#0c447c;border:1px solid #b5d4f4;border-radius:10px;padding:10px 14px;font-size:12px;display:flex;align-items:center;gap:8px;}

@keyframes spin{to{transform:rotate(360deg)}}
.spin{display:inline-block;animation:spin 0.8s linear infinite;}

@media(max-width:600px){
  .modal{border-radius:16px 16px 0 0;position:fixed;bottom:0;left:0;right:0;max-width:100%;}
  .modal-overlay{align-items:flex-end;padding:0;}
  .pagination{flex-direction:column;align-items:flex-start;}
}
</style>
