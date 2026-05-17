# USER ACCEPTANCE TESTING (UAT) SCRIPT
## MikoMart Point of Sale (POS) System — Fase 6A

---

| Field | Detail |
|---|---|
| **Nama Sistem** | MikoMart Point of Sale (POS) System |
| **Nomor Dokumen** | MikoMart-UAT-2026-001 |
| **Versi** | 1.0 |
| **Tanggal UAT** | [Diisi saat sesi berlangsung] |
| **Fasilitator** | QA Lead |
| **Environment** | Staging — https://staging.mikomart.local |
| **Standar** | IEEE 829 · ISO/IEC 25010 |
| **Klasifikasi** | INTERNAL — CONFIDENTIAL |

---

## 1. INFORMASI PESERTA UAT

| Peran | Nama | Tanda Tangan | Tanggal |
|---|---|---|---|
| Owner (stakeholder utama) | _________________ | _________________ | __________ |
| Admin | _________________ | _________________ | __________ |
| Supervisor | _________________ | _________________ | __________ |
| Kasir Representatif 1 | _________________ | _________________ | __________ |
| Kasir Representatif 2 | _________________ | _________________ | __________ |
| QA Lead (Fasilitator) | _________________ | _________________ | __________ |

---

## 2. UAT OVERVIEW

### 2.1 Tujuan
Dokumen ini berisi skrip pengujian yang akan dieksekusi oleh stakeholder untuk memvalidasi bahwa sistem MikoMart POS memenuhi seluruh kebutuhan bisnis yang telah didefinisikan dalam SRS v1.1, sebelum sistem dinyatakan layak untuk go-live.

### 2.2 Cakupan Pengujian

| Modul | Jumlah Skenario | Prioritas |
|---|---|---|
| UAT-01: Autentikasi & Sesi | 5 | P1 |
| UAT-02: Transaksi POS & Pembayaran | 7 | P1 |
| UAT-03: Void & Retur (Two-Step) | 4 | P1 |
| UAT-04: Manajemen Produk & Inventori | 4 | P1 |
| UAT-05: Laporan & Ekspor Pajak | 3 | P2 |
| **Total** | **23** | |

### 2.3 Definisi Hasil Pengujian

| Hasil | Definisi |
|---|---|
| ✅ **PASS** | Sistem berperilaku persis seperti Expected Result |
| ❌ **FAIL** | Sistem berperilaku berbeda dari Expected Result; bug wajib dicatat di Defect Log |
| ⚠️ **PARTIAL** | Sebagian Expected Result terpenuhi; perlu klarifikasi |
| ⏭️ **SKIP** | Skenario dilewati (tulis alasan) |

### 2.4 Kriteria Kelulusan UAT

> UAT dinyatakan **LULUS** jika dan hanya jika semua kondisi di bawah terpenuhi:

| # | Kriteria | Threshold | Status |
|---|---|---|---|
| K1 | Semua skenario P1 berstatus PASS | 100% | [ ] |
| K2 | Tidak ada bug Critical yang belum ditutup | 0 bug Critical open | [ ] |
| K3 | Bug High yang open memiliki workaround terdokumentasi | Max 3 bug High | [ ] |
| K4 | Sign-off diterima dari Owner, Admin, dan minimal 1 Kasir | 3 tanda tangan | [ ] |
| K5 | Waktu respons eksekusi transaksi ≤ 10 detik (SLO-P-01) | Terverifikasi dalam UAT | [ ] |

---

## 3. AKUN UAT (Staging)

> ⚠️ Ubah password segera setelah UAT selesai!

| Username | Password (Staging) | Role | Keterangan |
|---|---|---|---|
| `uat_kasir01` | `UatK@s!r01` | cashier | Kasir Meja 1 |
| `uat_kasir02` | `UatK@s!r02` | cashier | Kasir Meja 2 |
| `uat_supervisor` | `UatSup@rv1sor` | supervisor | Supervisor |
| `uat_admin` | `UatAdm!n2026` | admin | Admin |
| `uat_owner` | `UatOwn@r9999` | owner | Pemilik Toko |

---

## 4. MODUL UAT-01: AUTENTIKASI & SESI

---

### UAT-01-SC01 — Login Berhasil

**Role yang menguji:** Kasir (`uat_kasir01`)
**Pre-condition:** Sistem dalam keadaan berjalan; belum login

**Langkah:**

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Buka https://staging.mikomart.local | Halaman login tampil dengan field Username & Password | __________ | [ ]✅ [ ]❌ |
| 2 | Masukkan Username: `uat_kasir01`, Password: `UatK@s!r01` | Field terisi; tombol "Masuk" aktif | __________ | [ ]✅ [ ]❌ |
| 3 | Klik tombol "Masuk" | Loading indicator tampil kurang dari 3 detik | __________ | [ ]✅ [ ]❌ |
| 4 | Observasi halaman setelah login | Diarahkan ke POS Screen; nama "uat_kasir01" tampil di sudut kanan atas; badge role "Kasir" terlihat | __________ | [ ]✅ [ ]❌ |
| 5 | Perhatikan badge status koneksi | Badge "Online" berwarna hijau tampil di header | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-01-SC02 — Login Gagal (Credential Salah)

**Role yang menguji:** Kasir (`uat_kasir01`)
**Pre-condition:** Di halaman login

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Masukkan Username: `uat_kasir01`, Password: `passwordsalah` | Field terisi | __________ | [ ]✅ [ ]❌ |
| 2 | Klik "Masuk" | Pesan error merah tampil: "Username atau password salah. Sisa percobaan: 4×" | __________ | [ ]✅ [ ]❌ |
| 3 | URL tetap di halaman login | Tidak diarahkan ke halaman manapun | __________ | [ ]✅ [ ]❌ |
| 4 | Field password dikosongkan otomatis | Field password kosong setelah error | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-01-SC03 — Account Lockout (5× Gagal)

**Role yang menguji:** Kasir

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Input password salah 5× berturut-turut | Setelah percobaan ke-5: pesan "Akun terkunci" dengan countdown 15 menit | __________ | [ ]✅ [ ]❌ |
| 2 | Coba login kembali saat terkunci | Tombol "Masuk" non-aktif; countdown masih berjalan | __________ | [ ]✅ [ ]❌ |
| 3 | Admin login dan reset lockout via menu Pengguna | Login admin berhasil; dapat menemukan menu reset lockout | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-01-SC04 — Inactivity Timeout (30 Menit)

**Role yang menguji:** Kasir

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Login berhasil sebagai kasir | Di POS Screen | __________ | [ ]✅ [ ]❌ |
| 2 | Diamkan browser tanpa aksi selama 30+ menit (simulator: minta fasilitator percepat dengan config dev) | Popup "Sesi Berakhir — Login kembali untuk melanjutkan" tampil otomatis | __________ | [ ]✅ [ ]❌ |
| 3 | Coba akses halaman POS setelah sesi habis | Diarahkan ke halaman login; tidak ada data transaksi yang hilang dari localStorage | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-01-SC05 — Logout

**Role yang menguji:** Admin

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Login sebagai `uat_admin` | Di Admin Dashboard | __________ | [ ]✅ [ ]❌ |
| 2 | Klik tombol "Keluar" di sudut kanan atas | Dialog konfirmasi: "Apakah Anda yakin ingin keluar?" | __________ | [ ]✅ [ ]❌ |
| 3 | Klik "Ya, Keluar" | Diarahkan ke halaman login; sesi terhapus | __________ | [ ]✅ [ ]❌ |
| 4 | Tekan tombol Back browser | Tetap di halaman login; tidak bisa kembali ke dashboard tanpa login ulang | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

## 5. MODUL UAT-02: TRANSAKSI POS & PEMBAYARAN

---

### UAT-02-SC01 — Transaksi Lengkap (Tunai)

**Role yang menguji:** Kasir (`uat_kasir01`)
**Pre-condition:** Login berhasil; stok Mie Goreng Sedap (SKU: MGS-001) = 50

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Di POS Screen, ketik "Mie Goreng" di kolom pencarian | Daftar produk yang mengandung kata "Mie Goreng" muncul dalam ≤ 2 detik | __________ | [ ]✅ [ ]❌ |
| 2 | Klik produk "Mie Goreng Sedap" (Rp 3.500) | Produk masuk ke keranjang; jumlah = 1; subtotal = Rp 3.500 tampil | __________ | [ ]✅ [ ]❌ |
| 3 | Tambah kuantitas menjadi 3 (klik tombol "+") | Jumlah = 3; subtotal = Rp 10.500; total di panel kanan update real-time | __________ | [ ]✅ [ ]❌ |
| 4 | Pilih metode pembayaran "Tunai" | Area input "Uang Diterima" muncul | __________ | [ ]✅ [ ]❌ |
| 5 | Input nominal Rp 20.000 | Kembalian = Rp 20.000 - (Rp 10.500 + PPN 11%) = Rp 8.345 kalkulasi benar | __________ | [ ]✅ [ ]❌ |
| 6 | Klik "Proses Pembayaran" | Konfirmasi muncul; stok MGS-001 berkurang 3 (dari 50 → 47) | __________ | [ ]✅ [ ]❌ |
| 7 | Periksa nomor transaksi | Format TRX-YYYYMMDD-XXXX tampil | __________ | [ ]✅ [ ]❌ |
| 8 | Pilih opsi "Struk PDF" | PDF struk diunduh; berisi nomor transaksi, tanggal, item, total, kembalian | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-02-SC02 — Pembayaran QRIS

**Role yang menguji:** Kasir

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Buat transaksi dengan 1 item, pilih metode "QRIS" | QR Code muncul di layar dalam ≤ 5 detik | __________ | [ ]✅ [ ]❌ |
| 2 | Observasi countdown timer | Timer 5 menit tampil; berkurang setiap detik | __________ | [ ]✅ [ ]❌ |
| 3 | (Minta fasilitator simulasikan webhook success dari sandbox) | Status berubah menjadi "Pembayaran Diterima ✓"; struk ditawarkan | __________ | [ ]✅ [ ]❌ |
| 4 | Uji skenario expired: buat QRIS baru lalu tunggu habis | Pesan "Pembayaran kadaluarsa — Pilih metode lain atau coba lagi" muncul | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-02-SC03 — Split Bill (Dua Metode)

**Role yang menguji:** Kasir

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Buat transaksi total Rp 50.000, pilih "Split Bill" | Modal split bill terbuka | __________ | [ ]✅ [ ]❌ |
| 2 | Set Tunai: Rp 30.000, QRIS: Rp 20.000 | Total split = Rp 50.000; indikator "✓ Lunas" hijau tampil | __________ | [ ]✅ [ ]❌ |
| 3 | Set Tunai: Rp 20.000, QRIS: Rp 20.000 (total hanya Rp 40.000) | Indikator "Kekurangan Rp 10.000" merah tampil; tombol konfirmasi non-aktif | __________ | [ ]✅ [ ]❌ |
| 4 | Lengkapi total ke Rp 50.000, klik konfirmasi | Transaksi berhasil | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-02-SC04 — Diskon Manual (Maks 30%)

**Role yang menguji:** Kasir

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Tambah produk ke keranjang, klik tombol "Diskon" | Modal diskon terbuka | __________ | [ ]✅ [ ]❌ |
| 2 | Input diskon 25%, klik Terapkan | Harga terpotong 25%; label diskon tampil di item; audit log tercatat | __________ | [ ]✅ [ ]❌ |
| 3 | Input diskon 31% | Pesan error: "Diskon tidak boleh melebihi 30%" | __________ | [ ]✅ [ ]❌ |
| 4 | Input diskon 30% (batas maks) | Diterima; diskon 30% diterapkan | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-02-SC05 — Override Harga

**Role yang menguji:** Kasir

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Tambah produk (Harga Beli: Rp 2.500, Harga Jual: Rp 3.500) ke keranjang; klik "Override Harga" | Modal override harga terbuka | __________ | [ ]✅ [ ]❌ |
| 2 | Input Rp 4.000 (di atas harga normal) | Override diterima; harga di keranjang berubah; audit log tersimpan | __________ | [ ]✅ [ ]❌ |
| 3 | Input Rp 2.000 (di bawah harga beli) | Error: "Harga tidak boleh di bawah harga beli (Rp 2.500)" | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-02-SC06 — Mode Offline

**Role yang menguji:** Kasir
**Pre-condition:** Fasilitator putus koneksi jaringan kasir

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Putus koneksi internet kasir (cabut kabel/matikan WiFi) | Badge header berubah menjadi "Offline — Hanya Tunai" warna merah | __________ | [ ]✅ [ ]❌ |
| 2 | Lakukan transaksi tunai Rp 10.000 | Transaksi berhasil tersimpan lokal; status "pending sync" tampil | __________ | [ ]✅ [ ]❌ |
| 3 | Sambungkan kembali koneksi internet | Badge berubah menjadi "Sinkronisasi..." (biru berkedip) | __________ | [ ]✅ [ ]❌ |
| 4 | Tunggu sync selesai (≤ 30 detik) | Badge kembali "Online"; transaksi muncul di riwayat server | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-02-SC07 — Stok Habis (Error State)

**Role yang menguji:** Kasir

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Cari produk yang stoknya 0 | Produk tampil dengan label "Stok Habis" merah; tombol tambah disabled | __________ | [ ]✅ [ ]❌ |
| 2 | Jika produk sudah di keranjang lalu stok habis (race condition) | Item di keranjang ditandai merah; tombol "Proses Pembayaran" disabled dengan pesan jelas | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

## 6. MODUL UAT-03: VOID & RETUR (TWO-STEP APPROVAL)

---

### UAT-03-SC01 — Kasir Mengajukan Void

**Role yang menguji:** Kasir → Supervisor

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Kasir buka Riwayat Transaksi; pilih transaksi "completed" | Detail transaksi tampil; tombol "Ajukan Void" tersedia | __________ | [ ]✅ [ ]❌ |
| 2 | Klik "Ajukan Void"; form muncul; klik submit tanpa mengisi alasan | Error: "Alasan void wajib diisi" | __________ | [ ]✅ [ ]❌ |
| 3 | Isi alasan "Barang rusak saat dibeli", submit | Status transaksi berubah ke "Menunggu Void"; tombol "Ajukan Void" menghilang | __________ | [ ]✅ [ ]❌ |
| 4 | Supervisor login; periksa antrian Approval Void | Void request dari kasir tampil dengan detail lengkap dan alasan | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-03-SC02 — Supervisor Menyetujui Void

**Role yang menguji:** Supervisor

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Di halaman Approval Void, klik "Setujui" pada request kasir | Dialog konfirmasi muncul | __________ | [ ]✅ [ ]❌ |
| 2 | Isi catatan "Disetujui setelah verifikasi fisik barang" | Tombol "Konfirmasi Setujui" aktif | __________ | [ ]✅ [ ]❌ |
| 3 | Klik "Konfirmasi Setujui" | Status transaksi berubah "Void"; stok produk kembali bertambah | __________ | [ ]✅ [ ]❌ |
| 4 | Periksa audit log (Admin) | Dua entri tercatat: TRX_VOID_REQUESTED (kasir) + TRX_VOID_APPROVED (supervisor) | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-03-SC03 — Supervisor Menolak Void

**Role yang menguji:** Supervisor

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Di halaman Approval Void, klik "Tolak" | Dialog penolakan dengan field alasan wajib | __________ | [ ]✅ [ ]❌ |
| 2 | Submit tanpa mengisi alasan penolakan | Error: "Alasan penolakan wajib diisi" | __________ | [ ]✅ [ ]❌ |
| 3 | Isi "Tidak sesuai kebijakan" dan konfirmasi | Status transaksi kembali "Selesai"; kasir menerima notifikasi penolakan | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-03-SC04 — Void Sudah Divoid (Error Guard)

**Role yang menguji:** Kasir

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Buka transaksi yang statusnya sudah "Void" | Tombol "Ajukan Void" tidak tampil | __________ | [ ]✅ [ ]❌ |
| 2 | Coba akses URL void request manual via API | Response HTTP 409: "Transaksi tidak dapat di-void. Status saat ini: voided" | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

## 7. MODUL UAT-04: MANAJEMEN PRODUK & INVENTORI

---

### UAT-04-SC01 — Admin Menambah Produk Baru

**Role yang menguji:** Admin (`uat_admin`)

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Masuk ke menu Produk → "Tambah Produk" | Form tambah produk terbuka | __________ | [ ]✅ [ ]❌ |
| 2 | Isi Nama: "Teh Botol 350ml", SKU: "TEH-350", Harga Beli: Rp 3.000, Harga Jual: Rp 4.000, Stok: 100, Min. Stok: 20 | Semua field terisi; tidak ada error | __________ | [ ]✅ [ ]❌ |
| 3 | Input Harga Jual: Rp 2.500 (di bawah harga beli), submit | Error: "Harga jual harus lebih besar dari harga beli" | __________ | [ ]✅ [ ]❌ |
| 4 | Perbaiki harga jual ke Rp 4.000 dan submit | Produk berhasil ditambah; muncul di daftar produk; audit log: PRODUCT_CREATED | __________ | [ ]✅ [ ]❌ |
| 5 | Kasir coba akses menu Tambah Produk | Ditolak: "Anda tidak memiliki izin" (HTTP 403 atau redirect) | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-04-SC02 — Admin Mengubah Harga Produk

**Role yang menguji:** Admin

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Buka produk "Mie Goreng Sedap"; klik "Edit" | Form edit dengan nilai saat ini tampil | __________ | [ ]✅ [ ]❌ |
| 2 | Ubah harga jual dari Rp 3.500 → Rp 3.800; simpan | Harga tersimpan; perubahan tampil di daftar produk | __________ | [ ]✅ [ ]❌ |
| 3 | Periksa Audit Log | Entry PRODUCT_PRICE_UPDATED dengan nilai sebelum (3500) dan sesudah (3800) tercatat | __________ | [ ]✅ [ ]❌ |
| 4 | Supervisor coba edit harga produk | Tombol edit tidak tampil atau aksi ditolak 403 | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-04-SC03 — Notifikasi Stok Minimum

**Role yang menguji:** Admin / Supervisor

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Fasilitator set stok "Aqua 600ml" ke angka di bawah stok minimum | — | __________ | — |
| 2 | Admin buka Dashboard | Widget "Alert Stok Minimum" menampilkan "Aqua 600ml" dengan bar merah | __________ | [ ]✅ [ ]❌ |
| 3 | Klik "Buat PO" di baris Aqua 600ml | Form Purchase Order terbuka dengan produk sudah terisi | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-04-SC04 — Konfirmasi Penerimaan Stok (Restock)

**Role yang menguji:** Admin

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Buka menu Purchase Order; buat PO untuk "Aqua 600ml" qty 50 | PO berhasil dibuat; status "pending" | __________ | [ ]✅ [ ]❌ |
| 2 | Klik "Konfirmasi Penerimaan"; input qty yang diterima 50 | Stok "Aqua 600ml" bertambah 50; alert stok minimum hilang | __________ | [ ]✅ [ ]❌ |
| 3 | Periksa riwayat transaksi stok | History penerimaan stok tercatat dengan tanggal dan qty | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

## 8. MODUL UAT-05: LAPORAN & EKSPOR PAJAK

---

### UAT-05-SC01 — Dashboard Laporan (Owner)

**Role yang menguji:** Owner (`uat_owner`)

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Login sebagai Owner | Diarahkan ke Owner Dashboard (bukan POS Screen) | __________ | [ ]✅ [ ]❌ |
| 2 | Lihat widget "Transaksi Hari Ini" | Jumlah transaksi dan total pendapatan hari ini tampil akurat | __________ | [ ]✅ [ ]❌ |
| 3 | Owner coba mengakses menu Tambah Produk | Tombol tidak ada atau aksi ditolak (Owner tidak bisa CRUD produk) | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-05-SC02 — Laporan Harian

**Role yang menguji:** Owner / Admin

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Navigasi ke Laporan → Laporan Harian; pilih tanggal hari ini | Data laporan tampil dalam ≤ 5 detik | __________ | [ ]✅ [ ]❌ |
| 2 | Periksa rincian laporan | Total transaksi, pendapatan, diskon, PPN, dan breakdown per metode bayar tampil benar | __________ | [ ]✅ [ ]❌ |
| 3 | Pilih tanggal tanpa transaksi | Pesan "Tidak ada transaksi pada tanggal ini" tampil (bukan error kosong) | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

### UAT-05-SC03 — Ekspor Laporan Pajak

**Role yang menguji:** Owner / Admin

| # | Aksi | Expected Result | Actual Result | Hasil |
|---|---|---|---|---|
| 1 | Navigasi ke Ekspor Pajak; pilih periode bulan ini; format CSV | Proses ekspor dimulai; loading indicator tampil | __________ | [ ]✅ [ ]❌ |
| 2 | Unduh file yang dihasilkan | File CSV dapat dibuka di spreadsheet; berisi kolom: nomor transaksi, tanggal, subtotal, PPN, grand total | __________ | [ ]✅ [ ]❌ |
| 3 | Periksa apakah NPWP ada di file | NPWP toko tampil di header file CSV (bukan di halaman web) | __________ | [ ]✅ [ ]❌ |
| 4 | Kasir coba akses menu Ekspor Pajak | Menu tidak tersedia atau akses ditolak 403 | __________ | [ ]✅ [ ]❌ |

**Catatan:** ________________________________________________

---

## 9. DEFECT LOG

| No. | ID Bug | Skenario | Deskripsi Bug | Severity | Status | Diselesaikan Tanggal |
|---|---|---|---|---|---|---|
| 1 | BUG-001 | __________ | __________ | Critical / High / Medium / Low | Open / Closed | __________ |
| 2 | BUG-002 | __________ | __________ | __________ | __________ | __________ |
| 3 | BUG-003 | __________ | __________ | __________ | __________ | __________ |
| 4 | BUG-004 | __________ | __________ | __________ | __________ | __________ |

---

## 10. RINGKASAN HASIL UAT

| Modul | Total Skenario | PASS | FAIL | SKIP | % Pass |
|---|---|---|---|---|---|
| UAT-01: Autentikasi | 5 | __ | __ | __ | __% |
| UAT-02: Transaksi POS | 7 | __ | __ | __ | __% |
| UAT-03: Void & Retur | 4 | __ | __ | __ | __% |
| UAT-04: Produk & Inventori | 4 | __ | __ | __ | __% |
| UAT-05: Laporan & Pajak | 3 | __ | __ | __ | __% |
| **TOTAL** | **23** | __ | __ | __ | **__%** |

---

## 11. SIGN-OFF UAT

> Dengan menandatangani dokumen ini, stakeholder menyatakan bahwa sistem MikoMart POS dinyatakan **LAYAK / TIDAK LAYAK** untuk go-live.

| Nama | Jabatan | Keputusan | Catatan | TTD | Tanggal |
|---|---|---|---|---|---|
| _________________ | Owner | LAYAK / TIDAK LAYAK | _________________ | _________________ | __________ |
| _________________ | Admin | LAYAK / TIDAK LAYAK | _________________ | _________________ | __________ |
| _________________ | Kasir Representatif | LAYAK / TIDAK LAYAK | _________________ | _________________ | __________ |
| _________________ | QA Lead | LAYAK / TIDAK LAYAK | _________________ | _________________ | __________ |

---

*Dokumen ini adalah bagian dari Fase 6A — UAT Script MikoMart POS System.*

**Nomor Dokumen:** MikoMart-UAT-2026-001 | **Versi:** 1.0 | **Klasifikasi:** INTERNAL — CONFIDENTIAL
