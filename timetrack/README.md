# TimeTrack — Vue.js Attendance System

## โครงสร้างไฟล์
```
src/
├── main.js              ← จุดเริ่มต้น mount Vue app
├── App.vue              ← Root component
├── style.css            ← CSS Global ทั้งหมด
│
├── router/
│   └── index.js         ← เส้นทางทุกหน้า + ป้องกันการเข้าถึง
│
├── stores/              ← State management (Pinia)
│   ├── auth.js          ← Login / Logout / currentUser
│   ├── attendance.js    ← Clock In/Out / ประวัติ
│   └── leaves.js        ← ใบลา / OT / อนุมัติ
│
├── components/
│   └── AppLayout.vue    ← Sidebar + Topbar (ใช้ร่วมทุกหน้า)
│
└── views/               ← แต่ละหน้า (1 ไฟล์ = 1 หน้า)
    ├── LoginView.vue     ← หน้า Login (Admin / Employee)
    ├── DashboardView.vue ← Dashboard แยก Role
    ├── ClockInView.vue   ← บันทึกเวลาเข้า-ออก
    ├── EmployeesView.vue ← จัดการพนักงาน (Admin)
    ├── ScheduleView.vue  ← ตารางกะงาน
    ├── LeaveView.vue     ← อนุมัติใบลา (Admin)
    ├── PayrollView.vue   ← เงินเดือน (Admin)
    ├── ReportsView.vue   ← รายงาน (Admin)
    ├── SecurityView.vue  ← Audit Log (Admin)
    ├── MyLeaveView.vue   ← ใบลาของฉัน (Employee)
    └── MyProfileView.vue ← โปรไฟล์ (Employee)
```

## วิธีใช้งาน

### ติดตั้งครั้งแรก
```bash
npm install
```

### รันในโหมด Development (แก้โค้ดแล้วเห็นผลทันที)
```bash
npm run dev
# เปิดเบราว์เซอร์ไปที่ http://localhost:5173
```

### Build สำหรับ Production
```bash
npm run build
# ไฟล์พร้อม deploy อยู่ในโฟลเดอร์ dist/
```

## บัญชีทดสอบ
| Role        | ชื่อผู้ใช้      | รหัสผ่าน  |
|-------------|----------------|-----------|
| ผู้ดูแลระบบ | สมชาย ใจดี     | admin123  |
| พนักงาน     | สุภาพร วงศ์ดี  | emp123    |

## เชื่อม Google Sheets (ขั้นตอนถัดไป)
แก้ไขไฟล์ `src/stores/auth.js` แทนที่ MOCK_USERS ด้วย fetch() ไปยัง Apps Script URL
