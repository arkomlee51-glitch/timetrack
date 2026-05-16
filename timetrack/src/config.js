// ตั้งค่าระบบ — แก้ผ่าน .env (ไม่ต้องแตะโค้ด)
// VITE_OFFICE_LAT, VITE_OFFICE_LNG, VITE_GPS_RADIUS

export const GPS_CONFIG = {
  OFFICE_LAT:   Number(import.meta.env.VITE_OFFICE_LAT   ?? 13.7563),
  OFFICE_LNG:   Number(import.meta.env.VITE_OFFICE_LNG   ?? 100.5018),
  MAX_DISTANCE: Number(import.meta.env.VITE_GPS_RADIUS   ?? 100),
}
