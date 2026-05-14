<!-- views/EmployeesView.vue -->
<template>
  <AppLayout>

    <!-- ── Header ── -->
    <div class="section-header">
      <span class="section-title">รายชื่อพนักงานทั้งหมด</span>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <input v-model="search" class="form-input" placeholder="ค้นหาชื่อ..." style="width:160px"/>
        <select v-model="deptFilter" class="form-input" style="width:130px">
          <option value="">ทุกแผนก</option>
          <option v-for="d in depts" :key="d">{{ d }}</option>
        </select>
        <!-- ปุ่มนี้เปิด Modal เพิ่มพนักงาน -->
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
      <div class="table-wrap" v-else>
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
            <tr v-if="!filtered.length">
              <td colspan="7" class="loading-msg">ไม่พบข้อมูล</td>
            </tr>
            <tr v-for="e in filtered" :key="e.id">
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
                <!-- ปุ่มแก้ไข — เปิด Modal พร้อมข้อมูลพนักงานคนนั้น -->
                <button class="btn sm" @click="openEdit(e)">
                  <i class="ti ti-edit" /> แก้ไข
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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
          <button class="close-btn" @click="closeModal">
            <i class="ti ti-x" />
          </button>
        </div>

        <!-- Modal Body — Form -->
        <div class="modal-body">

          <!-- แสดงเฉพาะตอนเพิ่มใหม่ -->
          <div v-if="!isEditMode" class="notice info" style="margin-bottom:16px">
            <i class="ti ti-info-circle" />
            รหัสพนักงานจะถูกสร้างอัตโนมัติโดยระบบ
          </div>

          <div class="form-row-2">
            <!-- Username (สำหรับ Login) -->
            <div>
              <label class="form-label">Username <span class="required">*</span></label>
              <input v-model="form.userName" class="form-input"
                placeholder="เช่น kanya"
                :disabled="isEditMode"/>
              <!-- ปิดแก้ username ตอน edit เพราะใช้ login -->
              <div v-if="isEditMode" class="hint">ไม่สามารถเปลี่ยน Username ได้</div>
            </div>

            <!-- ชื่อ-นามสกุล -->
            <div>
              <label class="form-label">ชื่อ-นามสกุล <span class="required">*</span></label>
              <input v-model="form.name" class="form-input" placeholder="เช่น กัญญา เพราะสนัด"/>
            </div>
          </div>

          <div class="form-row-2">
            <!-- รหัสผ่าน -->
            <div>
              <label class="form-label">
                รหัสผ่าน
                <span v-if="isEditMode" class="hint-inline">(เว้นว่างถ้าไม่เปลี่ยน)</span>
                <span v-else class="required">*</span>
              </label>
              <div style="position:relative">
                <input v-model="form.password" :type="showPwd?'text':'password'"
                  class="form-input" placeholder="••••••••"/>
                <i :class="['ti', showPwd?'ti-eye-off':'ti-eye']"
                  style="position:absolute;right:12px;top:50%;transform:translateY(-50%);cursor:pointer;color:var(--text-hint)"
                  @click="showPwd=!showPwd"/>
              </div>
            </div>

            <!-- Role -->
            <div>
              <label class="form-label">Role <span class="required">*</span></label>
              <select v-model="form.role" class="form-input">
                <option value="employee">employee — พนักงานทั่วไป</option>
                <option value="admin">admin — ผู้ดูแลระบบ</option>
              </select>
            </div>
          </div>

          <div class="form-row-2">
            <!-- แผนก -->
            <div>
              <label class="form-label">แผนก <span class="required">*</span></label>
              <input v-model="form.dept" class="form-input" placeholder="เช่น IT, HR, การตลาด"/>
            </div>

            <!-- กะงาน -->
            <div>
              <label class="form-label">กะงาน <span class="required">*</span></label>
              <select v-model="form.shift" class="form-input">
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
          <button class="btn" @click="closeModal">ยกเลิก</button>
          <button class="btn primary" :disabled="saving" @click="handleSubmit">
            <i class="ti" :class="saving ? 'ti-loader-2' : (isEditMode ? 'ti-device-floppy' : 'ti-user-plus')" />
            {{ saving ? 'กำลังบันทึก...' : (isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มพนักงาน') }}
          </button>
        </div>

      </div>
    </div>

  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/AppLayout.vue'
import { ref, computed, onMounted, reactive } from 'vue'
import { apiGetEmployees, apiAddEmployee }     from '../services/api'

// ── ข้อมูลตาราง ──────────────────────────────────────────────
const employees  = ref([])
const loading    = ref(false)
const error      = ref('')
const success    = ref('')
const search     = ref('')
const deptFilter = ref('')

// ── Modal state ───────────────────────────────────────────────
const showModal  = ref(false)
const isEditMode = ref(false)
const saving     = ref(false)
const formError  = ref('')
const showPwd    = ref(false)

// ── Form data ─────────────────────────────────────────────────
const EMPTY_FORM = { userName:'', name:'', password:'', role:'employee', dept:'', shift:'เช้า' }
const form = reactive({ ...EMPTY_FORM })

// ── โหลดรายชื่อพนักงานเมื่อเปิดหน้า ─────────────────────────
onMounted(loadEmployees)

async function loadEmployees() {
  loading.value = true
  error.value   = ''
  try {
    const data = await apiGetEmployees()
    if (data.success) employees.value = data.data
    else error.value = data.message || 'โหลดข้อมูลไม่ได้'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// ── Filter / computed ─────────────────────────────────────────
const depts = computed(() =>
  [...new Set(employees.value.map(e => e.dept).filter(Boolean))]
)
const filtered = computed(() =>
  employees.value.filter(e =>
    (!search.value     || e.name?.includes(search.value) || e.userName?.includes(search.value)) &&
    (!deptFilter.value || e.dept === deptFilter.value)
  )
)

// ── เปิด Modal เพิ่มใหม่ ──────────────────────────────────────
function openAdd() {
  isEditMode.value = false
  formError.value  = ''
  showPwd.value    = false
  Object.assign(form, EMPTY_FORM)
  showModal.value  = true
}

// ── เปิด Modal แก้ไข ─────────────────────────────────────────
// NOTE: apiUpdateEmployee ยังไม่มีใน Apps Script
// → ดูหัวข้อ "สิ่งที่ต้องเพิ่มใน Apps Script" ด้านล่าง
function openEdit(emp) {
  isEditMode.value = true
  formError.value  = ''
  showPwd.value    = false
  Object.assign(form, {
    userName: emp.userName || '',
    name:     emp.name     || '',
    password: '',           // เว้นว่าง — ไม่แสดงรหัสผ่านเดิม
    role:     emp.role     || 'employee',
    dept:     emp.dept     || '',
    shift:    emp.shift    || 'เช้า',
    _id:      emp.id,       // เก็บ id ไว้ส่งไป API ตอน update
  })
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  formError.value = ''
}

// ── Validate ──────────────────────────────────────────────────
function validate() {
  if (!form.userName.trim()) return 'กรุณาใส่ Username'
  if (!form.name.trim())     return 'กรุณาใส่ชื่อ-นามสกุล'
  if (!isEditMode.value && !form.password.trim()) return 'กรุณาใส่รหัสผ่าน'
  if (!form.dept.trim())     return 'กรุณาใส่แผนก'
  return ''
}

// ── Submit ────────────────────────────────────────────────────
async function handleSubmit() {
  formError.value = validate()
  if (formError.value) return

  saving.value = true
  success.value = ''
  try {
    if (isEditMode.value) {
      // ── แก้ไข — เรียก apiUpdateEmployee (ต้องเพิ่มใน Apps Script)
      // const data = await apiUpdateEmployee({ ...form })
      // ยังไม่มี function นี้ → แสดงข้อความชั่วคราว
      formError.value = 'ฟังก์ชัน updateEmployee ยังไม่ได้เพิ่มใน Apps Script\n(ดูคำแนะนำใน README)'
      saving.value = false
      return
    } else {
      // ── เพิ่มใหม่ — เรียก apiAddEmployee
      const data = await apiAddEmployee({
        userName: form.userName.trim(),
        name:     form.name.trim(),
        password: form.password.trim(),
        role:     form.role,
        dept:     form.dept.trim(),
        shift:    form.shift,
      })
      if (data.success) {
        success.value = `เพิ่มพนักงาน "${form.name}" สำเร็จ! รหัส: ${data.id}`
        closeModal()
        await loadEmployees()   // รีโหลดตาราง
        setTimeout(() => success.value = '', 4000)
      } else {
        formError.value = data.message || 'เกิดข้อผิดพลาด'
      }
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
/* ── Banner ── */
.banner{border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:13px;}
.banner.err{background:var(--red-light);color:#791f1f;border:1px solid #f09595;}
.banner.ok {background:var(--accent-light);color:var(--accent-dark);border:1px solid var(--accent-mid);}

.loading-msg{text-align:center;padding:32px;color:var(--text-hint);font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;}

/* ── Modal Overlay ── */
.modal-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,0.45);
  z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;
}

/* ── Modal Box ── */
.modal{
  background:var(--card-bg);border-radius:20px;width:100%;max-width:560px;
  box-shadow:0 24px 60px rgba(0,0,0,0.18);
  display:flex;flex-direction:column;max-height:90vh;overflow:hidden;
}

.modal-header{
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 24px;border-bottom:1px solid var(--border-color);
}
.modal-title{font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;}
.close-btn{
  width:32px;height:32px;border-radius:8px;border:none;
  background:var(--color-background-secondary,rgba(0,0,0,0.05));
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  font-size:17px;color:var(--text-muted);transition:background 0.2s;
}
.close-btn:hover{background:var(--red-light);color:var(--red);}

.modal-body{padding:24px;overflow-y:auto;}
.modal-footer{
  display:flex;justify-content:flex-end;gap:10px;
  padding:16px 24px;border-top:1px solid var(--border-color);
}

/* ── Form helpers ── */
.required{color:var(--red);margin-left:2px;}
.hint{font-size:11px;color:var(--text-hint);margin-top:4px;}
.hint-inline{font-size:11px;color:var(--text-hint);font-weight:400;}
.notice.info{background:var(--blue-light);color:#0c447c;border:1px solid #b5d4f4;border-radius:10px;padding:10px 14px;font-size:12px;display:flex;align-items:center;gap:8px;}

/* ── Responsive ── */
@media(max-width:600px){
  .modal{border-radius:16px 16px 0 0;position:fixed;bottom:0;left:0;right:0;max-width:100%;}
  .modal-overlay{align-items:flex-end;padding:0;}
}
</style>
