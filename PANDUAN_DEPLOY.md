# 🚀 Panduan Deploy MMS Dashboard ke Vercel + Firebase

## Hasil akhir: link seperti https://mms-pabrik-anda.vercel.app

---

## LANGKAH 1 — Setup Firebase (database gratis)

1. Buka https://console.firebase.google.com
2. Klik **"Add project"** → masukkan nama (misal: mms-pabrik) → Continue
3. Google Analytics: boleh dimatikan → **Create project**
4. Di sidebar kiri, klik **Firestore Database**
5. Klik **"Create database"** → pilih **"Start in test mode"** → pilih region (asia-southeast1) → Enable
6. Di sidebar kiri, klik ⚙️ **Project Settings**
7. Scroll ke bawah ke bagian **"Your apps"** → klik icon **</>** (Web)
8. Daftarkan app → centang **"Also set up Firebase Hosting"** → Register app
9. **Copy nilai firebaseConfig** yang muncul (ada apiKey, projectId, dll)

---

## LANGKAH 2 — Isi konfigurasi Firebase ke kode

Buka file **`src/firebase.js`** dan ganti bagian ini:

```js
const firebaseConfig = {
  apiKey: "GANTI_INI",
  authDomain: "GANTI_INI.firebaseapp.com",
  projectId: "GANTI_INI",
  ...
};
```

Dengan nilai yang kamu copy dari Firebase Console tadi.

---

## LANGKAH 3 — Install Node.js (jika belum ada)

Download di: https://nodejs.org → pilih versi LTS → install

---

## LANGKAH 4 — Jalankan di komputer lokal (tes dulu)

Buka Terminal / Command Prompt, masuk ke folder project:

```bash
cd mms-app
npm install
npm start
```

Buka browser ke http://localhost:3000 — pastikan jalan dulu.

---

## LANGKAH 5 — Deploy ke Vercel (dapat link publik)

### Cara A: Via GitHub (Recommended — auto-deploy saat ada perubahan)

1. Buat akun di https://github.com (gratis)
2. Buat repository baru → upload semua file mms-app
3. Buka https://vercel.com → Login with GitHub
4. Klik **"New Project"** → pilih repository mms-app
5. Settings otomatis terdeteksi → klik **Deploy**
6. Tunggu 2-3 menit → **Dapat link seperti**: `https://mms-app-xyz.vercel.app`

### Cara B: Via Vercel CLI (langsung dari terminal)

```bash
npm install -g vercel
vercel
```
Ikuti petunjuk → pilih nama project → selesai!

---

## LANGKAH 6 — Custom domain (opsional)

Di Vercel dashboard → Settings → Domains → tambah domain kamu.
Misal: `maintenance.perusahaan.com`

---

## ✅ Fitur setelah deploy:
- Link bisa dibagikan ke tim dan dibuka dari HP/laptop manapun
- Data tersimpan di Firebase Firestore (cloud, gratis sampai 1GB)
- Perubahan data langsung sinkron ke semua user
- Import/Export Excel (.xlsx) tetap berfungsi

---

## ❓ Troubleshooting

**Error "Firebase not configured":**
→ Pastikan sudah mengganti semua nilai "GANTI_INI" di src/firebase.js

**Data tidak tersimpan:**
→ Cek Firebase Console → Firestore → pastikan rules masih "test mode"

**Build error:**
→ Pastikan sudah jalankan `npm install` dulu

