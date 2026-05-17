# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## MikoMart Point of Sale (POS) System
### Berdasarkan Standar IEEE 830

---

| Field | Detail |
|---|---|
| **Nama Sistem** | MikoMart Point of Sale (POS) System |
| **Nomor Dokumen** | MikoMart-SRS-2026-001 |
| **Versi** | 1.0 — Draft |
| **Tanggal** | 16 April 2026 |
| **Status** | Draft — Menunggu Review |
| **Klasifikasi** | INTERNAL — CONFIDENTIAL |

---

## DAFTAR ISI

1. Pendahuluan
2. Deskripsi Umum Sistem
3. Kebutuhan Fungsional (FR)
4. Kebutuhan Non-Fungsional (NFR)
5. Kebutuhan Keamanan
6. Kebutuhan Antarmuka
7. Batasan Desain & Implementasi
8. Matriks Keterlacakan Kebutuhan

---

## 1. PENDAHULUAN

### 1.1 Tujuan Dokumen

Dokumen ini mendefinisikan kebutuhan perangkat lunak sistem MikoMart POS secara lengkap, terstruktur, dan dapat diverifikasi. Dokumen ini menjadi acuan tunggal bagi tim pengembang, QA, dan stakeholder dalam seluruh siklus hidup pengembangan perangkat lunak (SDLC).

### 1.2 Ruang Lingkup Sistem

**MikoMart POS** adalah sistem kasir berbasis web offline-first yang mendukung:
- Manajemen transaksi penjualan multi-metode pembayaran
- Manajemen inventori dan restock real-time
- Role-Based Access Control (RBAC) dengan 4 tingkatan akses
- Integrasi payment gateway (QRIS)
- Pencetakan struk fisik (thermal) dan digital (PDF)
- Audit log komprehensif dan ekspor laporan pajak

### 1.3 Definisi, Akronim, dan Singkatan

| Term | Definisi |
|---|---|
| **POS** | Point of Sale — sistem kasir digital |
| **RBAC** | Role-Based Access Control — kontrol akses berbasis peran |
| **FR** | Functional Requirement — kebutuhan fungsional |
| **NFR** | Non-Functional Requirement — kebutuhan non-fungsional |
| **SLA** | Service Level Agreement — perjanjian tingkat layanan |
| **QRIS** | Quick Response Code Indonesian Standard — standar pembayaran QR code Indonesia |
| **PII** | Personally Identifiable Information — data pribadi yang dapat mengidentifikasi individu |
| **NPWP** | Nomor Pokok Wajib Pajak |
| **PPN** | Pajak Pertambahan Nilai |
| **ESC/POS** | Epson Standard Code for POS Printers — protokol thermal printer |
| **WAL** | Write-Ahead Logging — mode SQLite untuk keandalan data |
| **RTO** | Recovery Time Objective — target waktu pemulihan |
| **RPO** | Recovery Point Objective — target titik pemulihan data |
| **Override** | Perubahan harga/diskon secara manual oleh kasir |
| **Void** | Pembatalan transaksi yang sudah diproses |
| **Split bill** | Pemecahan total tagihan ke beberapa metode pembayaran |

### 1.4 Referensi

- IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications
- ISO/IEC 25010:2011: Systems and Software Quality Requirements and Evaluation
- OWASP Top 10 2021: Web Application Security Risks
- Peraturan DJP tentang retensi dokumen pajak
- ESC/POS Command Reference (Epson Corporation)
- Midtrans/Xendit API Documentation v2

### 1.5 Ikhtisar Dokumen

Bagian 2 menjelaskan konteks dan karakteristik umum sistem. Bagian 3–5 mendefinisikan kebutuhan fungsional, non-fungsional, dan keamanan. Bagian 6–8 mencakup kebutuhan antarmuka, batasan, dan matriks keterlacakan.

---

## 2. DESKRIPSI UMUM SISTEM

### 2.1 Perspektif Produk

MikoMart POS adalah sistem standalone berbasis web yang beroperasi secara offline-first. Setiap terminal kasir menyimpan data lokal menggunakan SQLite dan melakukan sinkronisasi dengan server pusat (Laravel backend) ketika koneksi internet tersedia. Sistem ini bukan bagian dari sistem yang sudah ada — ini adalah implementasi baru.

```
┌──────────────────────────────────────────────────────────┐
│                   ARSITEKTUR TINGKAT TINGGI               │
├──────────────────────────────────────────────────────────┤
│  [Tablet Kasir]      [Tablet Kasir]   [Tablet Kasir]    │
│   React SPA +         React SPA +      React SPA +       │
│   SQLite Local        SQLite Local     SQLite Local       │
│        │                   │                │             │
│        └───────────────────┼────────────────┘             │
│                            │ LAN/WLAN                      │
│                    ┌───────▼────────┐                     │
│                    │  Laravel API   │                     │
│                    │  (PHP 8.x)     │                     │
│                    │  Node.js RT    │                     │
│                    └───────┬────────┘                     │
│                            │                              │
│              ┌─────────────┼──────────────┐              │
│              │             │              │               │
│    [Payment Gateway]  [SQLite/DB]  [PDF Generator]       │
│    (Midtrans/Xendit)  (Server)     (Receipt Service)     │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Fungsi Utama Sistem

1. Autentikasi dan manajemen sesi pengguna
2. Transaksi penjualan dengan multi-metode pembayaran dan split bill
3. Manajemen produk dan kategori
4. Manajemen inventori real-time dengan notifikasi stok minimum
5. Modul pembelian dan restock
6. Pembayaran digital via QRIS/payment gateway
7. Pencetakan struk fisik (thermal) dan digital (PDF)
8. Void dan retur transaksi
9. Manajemen diskon dan override harga dengan batas per role
10. Audit log dan activity tracking
11. Laporan transaksi dan ekspor data pajak
12. Sinkronisasi data offline-to-online

### 2.3 Kelas Pengguna dan Karakteristik

| Role | Jumlah | Karakteristik | Hak Akses Utama |
|---|---|---|---|
| **Admin** | 1 | Pengelola sistem, teknis | Full access: konfigurasi harga, diskon, produk, user management |
| **Supervisor** | 1–2 | Pengawas operasional | Monitor transaksi, laporan harian, inventori; tidak bisa ubah harga |
| **Kasir** | 4 (aktif) | Operator transaksi harian | Transaksi POS, void, retur, diskon ≤ 30%, cetak struk |
| **Owner** | 1 | Pemilik bisnis | Read-only: laporan rekap, ekspor pajak, dashboard bisnis |

### 2.4 Lingkungan Operasional

| Komponen | Spesifikasi |
|---|---|
| **Perangkat Kasir** | Tablet touchscreen dengan browser Chrome/Edge terbaru |
| **Backend Server** | PHP 8.2+, Node.js 18+, dapat dijalankan di server lokal toko |
| **Database Lokal** | SQLite 3.x (mode WAL aktif) |
| **Database Server** | SQLite / MySQL (server pusat) |
| **Thermal Printer** | Kompatibel ESC/POS (EPSON, Star Micronics) |
| **Jaringan** | LAN/WLAN internal toko; internet untuk sinkronisasi & payment |
| **Browser** | Google Chrome 110+ / Microsoft Edge 110+ |

### 2.5 Batasan Desain dan Implementasi

- Sistem HARUS berfungsi tanpa internet (offline mode) untuk transaksi tunai
- Semua credential disimpan di environment variable (`.env`), tidak ada hardcoded secret
- Database lokal SQLite harus dienkripsi untuk data sensitif
- Semua komunikasi API menggunakan HTTPS (TLS 1.2 minimum)
- Maximum 4 session kasir aktif bersamaan

### 2.6 Asumsi dan Ketergantungan

- Merchant account aktif di Midtrans atau Xendit tersedia sebelum go-live
- Thermal printer telah terpasang dan dapat diakses melalui USB/network
- Perangkat kasir memiliki penyimpanan lokal minimal 2 GB untuk SQLite
- Pengguna memiliki literasi digital dasar

---

## 3. KEBUTUHAN FUNGSIONAL (FUNCTIONAL REQUIREMENTS)

> **Konvensi Prioritas:**
> - **[P1]** = Must Have (wajib ada di rilis pertama)
> - **[P2]** = Should Have (penting, bisa menyusul sprint berikutnya)
> - **[P3]** = Nice to Have (opsional)

---

### FR-01: MODUL AUTENTIKASI & SESI

**FR-01.1** `[P1]` Sistem HARUS menyediakan halaman login dengan field username dan password.

**FR-01.2** `[P1]` Sistem HARUS memverifikasi kredensial pengguna terhadap database menggunakan bcrypt/Argon2 (tidak boleh plain-text atau MD5).

**FR-01.3** `[P1]` Sistem HARUS membuat session token (JWT atau session cookie HttpOnly) setelah login berhasil.

**FR-01.4** `[P1]` Sistem HARUS menampilkan pesan error generik saat login gagal ("Username atau password salah") tanpa mengungkap detail penyebab spesifik.

**FR-01.5** `[P1]` Sistem HARUS mengunci akun setelah **5 kali percobaan login gagal berturut-turut** selama minimal 15 menit.

**FR-01.6** `[P1]` Sistem HARUS mengakhiri sesi otomatis setelah **30 menit tidak aktif** (inactivity timeout).

**FR-01.7** `[P1]` Sistem HARUS menyediakan fungsi logout yang menginvalidasi sesi di server.

**FR-01.8** `[P2]` Sistem HARUS mendukung reset password oleh Admin (bukan self-service via email, karena environment toko).

---

### FR-02: MANAJEMEN PERAN (RBAC)

**FR-02.1** `[P1]` Sistem HARUS mengimplementasikan 4 role: **Admin**, **Supervisor**, **Kasir**, **Owner**.

**FR-02.2** `[P1]` Setiap endpoint API dan halaman UI HARUS memverifikasi role pengguna sebelum memberikan akses.

**FR-02.3** `[P1]` Matriks akses RBAC yang berlaku:

| Fitur | Admin | Supervisor | Kasir | Owner |
|---|:---:|:---:|:---:|:---:|
| Kelola pengguna | ✅ | ❌ | ❌ | ❌ |
| Ubah harga produk | ✅ | ❌ | ❌ | ❌ |
| Ubah konfigurasi diskon | ✅ | ❌ | ❌ | ❌ |
| Tambah/edit produk | ✅ | ✅ | ❌ | ❌ |
| Kelola inventori & restock | ✅ | ✅ | ❌ | ❌ |
| Proses transaksi | ✅ | ✅ | ✅ | ❌ |
| Ajukan void & retur | ✅ | ✅ | ✅ | ❌ |
| Setujui / konfirmasi void & retur | ✅ | ✅ | ❌ | ❌ |
| Beri diskon manual (≤30%) | ✅ | ✅ | ✅ | ❌ |
| Override harga | ✅ | ❌ | ✅ | ❌ |
| Lihat laporan | ✅ | ✅ | ❌ | ✅ |
| Ekspor laporan pajak | ✅ | ❌ | ❌ | ✅ |
| Lihat audit log | ✅ | ✅ | ❌ | ❌ |

**FR-02.4** `[P1]` Sistem HARUS mencatat setiap aksi sensitif (lihat bagian FR-09: Audit Log).

---

### FR-03: MANAJEMEN PRODUK & KATEGORI

**FR-03.1** `[P1]` Sistem HARUS menyediakan CRUD (Create, Read, Update, Delete) produk untuk Admin.

**FR-03.2** `[P1]` Setiap produk HARUS memiliki atribut: nama, kode SKU, kategori, harga jual, harga beli, stok saat ini, stok minimum, satuan, dan status aktif/nonaktif.

**FR-03.3** `[P1]` Admin HARUS dapat mengatur harga jual produk secara individual.

**FR-03.4** `[P1]` Sistem HARUS mendukung pencarian produk berdasarkan nama dan kode SKU (dengan barcode scanner atau input manual touchscreen).

**FR-03.5** `[P2]` Sistem HARUS mendukung import produk bulk via file CSV/Excel.

---

### FR-04: MODUL INVENTORI REAL-TIME

**FR-04.1** `[P1]` Stok produk HARUS berkurang secara otomatis dan real-time setiap kali transaksi penjualan berhasil diselesaikan.

**FR-04.2** `[P1]` Jika transaksi dilakukan dalam mode offline, stok HARUS dikurangi di database lokal dan diperbarui ke server saat sinkronisasi.

**FR-04.3** `[P1]` Sistem HARUS menampilkan notifikasi/peringatan kepada Admin dan Supervisor ketika stok produk mencapai atau di bawah **stok minimum** yang telah dikonfigurasi.

**FR-04.4** `[P1]` Sistem HARUS mencegah transaksi produk dengan stok = 0, kecuali Admin mengaktifkan mode backorder untuk produk tertentu.

**FR-04.5** `[P2]` Sistem HARUS menyediakan halaman riwayat pergerakan stok (stock movement history) per produk.

---

### FR-05: MODUL PEMBELIAN & RESTOCK

**FR-05.1** `[P1]` Sistem HARUS menyediakan form pembuatan Purchase Order (PO) yang dapat diisi oleh Admin atau Supervisor.

**FR-05.2** `[P1]` Setelah barang diterima, Admin/Supervisor HARUS dapat mengkonfirmasi penerimaan barang yang akan menambah stok secara otomatis.

**FR-05.3** `[P1]` Sistem HARUS menyimpan riwayat setiap PO beserta status (Draft, Dikirim ke Supplier, Diterima, Dibatalkan).

**FR-05.4** `[P2]` Sistem HARUS mendukung pencatatan data supplier (nama, kontak, alamat).

---

### FR-06: MODUL TRANSAKSI POS

**FR-06.1** `[P1]` Kasir HARUS dapat memulai transaksi baru dan menambahkan produk ke keranjang belanja via pencarian nama/SKU atau scan barcode.

**FR-06.2** `[P1]` Sistem HARUS menampilkan subtotal, total diskon, PPN (jika berlaku), dan grand total secara real-time saat item ditambahkan/diubah.

**FR-06.3** `[P1]` Sistem HARUS mendukung **split bill**: satu transaksi dapat dibayar dengan kombinasi beberapa metode pembayaran (tunai, QRIS, transfer bank).

**FR-06.4** `[P1]` Kasir HARUS dapat memberikan **diskon manual** pada item individual atau total transaksi, dengan batas maksimum **30% dari nilai yang berlaku**.

**FR-06.5** `[P1]` Kasir HARUS dapat melakukan **override harga** pada item individual, dengan batas bahwa harga tidak boleh lebih rendah dari harga beli (floor price), kecuali Admin mengizinkan.

**FR-06.6** `[P1]` Setiap pemberian diskon manual dan override harga HARUS **otomatis tercatat di audit log** (FR-09).

**FR-06.7** `[P1]` Sistem HARUS menghitung kembalian uang tunai secara otomatis berdasarkan nominal yang dibayarkan kasir.

**FR-06.8** `[P1]` Setelah transaksi berhasil, sistem HARUS otomatis menawarkan opsi: cetak struk thermal atau ekspor PDF.

**FR-06.9** `[P1]` Sistem HARUS dapat beroperasi saat offline — transaksi tunai dapat diselesaikan tanpa koneksi internet.

---

### FR-07: VOID & RETUR TRANSAKSI

> ⚠️ **Keputusan Final Stakeholder (Rev. 1.1):** Void dan retur memerlukan **otorisasi dua langkah** untuk mencegah penyalahgunaan. Kasir hanya dapat *mengajukan* permintaan; Supervisor atau Admin yang *mengkonfirmasi*.

**FR-07.1** `[P1]` Kasir HARUS dapat **mengajukan permintaan void** atau **retur transaksi** yang sudah diproses, dengan mengisi alasan yang wajib.

**FR-07.2** `[P1]` Permintaan void/retur dari kasir akan masuk ke antrian **approval Supervisor atau Admin**. Sistem HARUS menampilkan notifikasi in-app kepada Supervisor/Admin yang sedang login.

**FR-07.3** `[P1]` Supervisor atau Admin HARUS dapat **menyetujui atau menolak** permintaan void/retur beserta catatan keputusan.

**FR-07.4** `[P1]` Void/retur hanya menjadi efektif (stok dikembalikan, laporan diperbarui) setelah **Supervisor atau Admin menyetujui**.

**FR-07.5** `[P1]` Jika tidak ada Supervisor/Admin online, Supervisor/Admin HARUS dapat menyetujui melalui antarmuka yang sama segera setelah login.

**FR-07.6** `[P1]` Setiap langkah (pengajuan kasir, keputusan Supervisor/Admin) HARUS tercatat lengkap di **audit log** beserta: identitas masing-masing, timestamp, alasan, dan nilai transaksi.

**FR-07.7** `[P2]` Untuk transaksi yang dibayar via payment gateway (QRIS), proses refund ke pelanggan harus dimulai melalui dashboard payment gateway (di luar sistem ini pada versi pertama).

---

### FR-08: INTEGRASI PAYMENT GATEWAY

**FR-08.1** `[P1]` Sistem HARUS terintegrasi langsung dengan payment gateway (Midtrans atau Xendit) untuk menerima pembayaran QRIS dan transfer bank.

**FR-08.2** `[P1]` Sistem HARUS menampilkan QR code pembayaran kepada pelanggan dan menunggu konfirmasi pembayaran secara real-time via webhook.

**FR-08.3** `[P1]` Sistem HARUS menangani status pembayaran: **Pending**, **Success**, **Failed**, **Expired**.

**FR-08.4** `[P1]` Jika pembayaran digital gagal atau expired, sistem HARUS memberikan opsi mengulang atau mengganti metode pembayaran tanpa membatalkan seluruh transaksi.

**FR-08.5** `[P1]` Sistem HARUS memverifikasi **signature/HMAC** setiap webhook yang masuk dari payment gateway sebelum memproses perubahan status.

**FR-08.6** `[P1]` API key dan Secret key payment gateway HARUS disimpan di environment variable (`.env`), tidak boleh di-hardcode di source code.

---

### FR-09: AUDIT LOG & ACTIVITY TRACKING

**FR-09.1** `[P1]` Sistem HARUS mencatat setiap aksi berikut di audit log:

| Kategori | Aksi yang Dicatat |
|---|---|
| Autentikasi | Login berhasil, login gagal, logout, akun terkunci |
| Transaksi | Transaksi baru, void, retur |
| Diskon & Override | Setiap pemberian diskon manual, setiap override harga |
| Produk | Tambah, edit, hapus produk; perubahan harga |
| Inventori | Perubahan stok manual, konfirmasi penerimaan PO |
| Pengguna | Tambah, edit, hapus pengguna; reset password |
| Laporan | Ekspor laporan pajak, akses laporan sensitif |

**FR-09.2** `[P1]` Setiap entri audit log HARUS memuat: timestamp (UTC), user_id, username, role, aksi, nilai sebelum, nilai sesudah (untuk perubahan data), IP address, dan device identifier.

**FR-09.3** `[P1]` Audit log HARUS disimpan minimal **30 hari terakhir** dan tidak boleh dapat dihapus oleh siapapun kecuali melalui proses otomatis sistem (purge terjadwal).

**FR-09.4** `[P1]` Audit log hanya dapat **dibaca** oleh Admin dan Supervisor melalui antarmuka yang disediakan sistem.

---

### FR-10: STRUK & RECEIPT

**FR-10.1** `[P1]` Sistem HARUS mendukung cetak struk fisik ke **thermal printer** yang terhubung (USB/network) menggunakan protokol ESC/POS.

**FR-10.2** `[P1]` Struk fisik HARUS memuat: nama toko, NPWP toko, nomor transaksi, tanggal & waktu, daftar item (nama, qty, harga, diskon), subtotal, PPN, grand total, metode pembayaran, jumlah bayar, kembalian, dan nama kasir.

**FR-10.3** `[P1]` Sistem HARUS dapat menghasilkan **struk digital dalam format PDF** (tersimpan di server dan dapat diunduh).

**FR-10.4** `[P2]` Sistem HARUS dapat mencetak ulang struk transaksi yang sudah selesai dari riwayat transaksi.

---

### FR-11: LAPORAN & EKSPOR

**FR-11.1** `[P1]` Sistem HARUS menyediakan **dashboard laporan** yang dapat diakses oleh Admin, Supervisor, dan Owner.

**FR-11.2** `[P1]` Laporan HARUS mencakup: ringkasan penjualan harian/mingguan/bulanan, total pendapatan, produk terlaris, perbandingan periode.

**FR-11.3** `[P1]` Owner HARUS dapat mengakses rekap laporan transaksi tanpa hak mengubah data apapun.

**FR-11.4** `[P1]` Sistem HARUS menyediakan fitur **ekspor data transaksi** untuk keperluan audit pajak (PPN) dalam format CSV dan/atau Excel, yang memuat: nomor transaksi, tanggal, item, harga satuan, jumlah, subtotal, nilai PPN, grand total.

**FR-11.5** `[P2]` Sistem HARUS menyediakan filter ekspor berdasarkan rentang tanggal.

---

### FR-12: SINKRONISASI OFFLINE-ONLINE

**FR-12.1** `[P1]` Sistem HARUS menyimpan semua data transaksi yang terjadi saat offline ke SQLite lokal dengan status **"pending sync"**.

**FR-12.2** `[P1]` Begitu koneksi internet terdeteksi kembali, sistem HARUS **otomatis memulai proses sinkronisasi** data pending ke server.

**FR-12.3** `[P1]` Sinkronisasi HARUS menggunakan **timestamp transaksi** sebagai dasar urutan sync (first-created-first-synced).

**FR-12.4** `[P1]` Jika terjadi konflik data (e.g., stok produk yang sama diubah oleh 2 kasir secara offline), sistem HARUS:
  - Mencatat konflik tersebut di **conflict log** secara otomatis
  - Menampilkan notifikasi kepada kasir yang login dengan **peringatan jelas** tentang risiko perubahan stok
  - Menampilkan **UI perbandingan data** (nilai lama vs. nilai baru dari masing-masing kasir) agar keputusan merge dapat dibuat dengan informasi yang cukup
  - Kasir memiliki otoritas merge; setiap keputusan merge HARUS dicatat di conflict log beserta identitas kasir yang memutuskan
  - Sistem HARUS mengirimkan notifikasi ringkasan merge ke Supervisor/Admin setelah proses selesai sebagai bentuk oversight

**FR-12.5** `[P1]` Sistem HARUS menampilkan **indikator status koneksi** yang jelas di antarmuka kasir (Online/Offline/Syncing).

---

## 4. KEBUTUHAN NON-FUNGSIONAL (NFR)

### NFR-01: Performa

| ID | Kebutuhan | Target |
|---|---|---|
| NFR-01.1 | Waktu pemrosesan transaksi end-to-end | ≤ 10 detik (P95) |
| NFR-01.2 | Waktu cetak struk thermal setelah konfirmasi | ≤ 5 detik |
| NFR-01.3 | Waktu load halaman POS utama | ≤ 3 detik (jaringan LAN normal) |
| NFR-01.4 | Waktu pencarian produk (autocomplete) | ≤ 1 detik setelah ketik ≥ 2 karakter |
| NFR-01.5 | Throughput transaksi | ≥ 4 transaksi bersamaan (4 kasir aktif) |
| NFR-01.6 | Kapasitas transaksi harian | Normal: 300 / Peak: 500 transaksi/hari |

### NFR-02: Ketersediaan (Availability)

| ID | Kebutuhan | Target |
|---|---|---|
| NFR-02.1 | Uptime sistem (server) | ≥ 99.5% per bulan |
| NFR-02.2 | Ketersediaan mode offline | 100% (tidak bergantung server untuk transaksi tunai) |
| NFR-02.3 | Maintenance window terencana | Maksimum 2 jam/bulan, di luar jam operasional toko |

### NFR-03: Keandalan (Reliability)

| ID | Kebutuhan | Target |
|---|---|---|
| NFR-03.1 | Error rate transaksi | < 0.5% dari total transaksi |
| NFR-03.2 | Data loss saat power failure | ≤ 1 transaksi terakhir (SQLite WAL mode) |
| NFR-03.3 | Keberhasilan sinkronisasi data offline | ≥ 99.9% berhasil disinkronkan |

### NFR-04: Kegunaan (Usability)

| ID | Kebutuhan | Target |
|---|---|---|
| NFR-04.1 | Antarmuka touchscreen-optimized | Semua elemen interaktif ≥ 44×44px |
| NFR-04.2 | Waktu onboarding kasir baru | Kasir baru dapat memproses transaksi dasar setelah ≤ 30 menit pelatihan |
| NFR-04.3 | Dukungan bahasa | Bahasa Indonesia sebagai bahasa utama |

### NFR-05: Skalabilitas

| ID | Kebutuhan | Target |
|---|---|---|
| NFR-05.1 | Jumlah kasir aktif bersamaan | Dirancang untuk 4, dapat diperluas hingga 8 tanpa re-arsitektur |
| NFR-05.2 | Kapasitas data historis | Mampu menyimpan 2 tahun data transaksi (estimasi 365.000 transaksi) |

### NFR-06: Pemeliharaan (Maintainability)

| ID | Kebutuhan | Target |
|---|---|---|
| NFR-06.1 | Test coverage | ≥ 80% untuk unit test pada business logic kritis |
| NFR-06.2 | Dokumentasi API | OpenAPI 3.0, up-to-date dengan setiap rilis |
| NFR-06.3 | Structured logging | Setiap operasi penting menghasilkan log terstruktur (JSON) |

---

## 5. KEBUTUHAN KEAMANAN (SECURITY REQUIREMENTS)

> Berbasis OWASP Top 10 2021 dan prinsip Security by Design.

### SEC-01: Autentikasi & Otorisasi (OWASP A01, A07)

**SEC-01.1** `[P1]` Password HARUS di-hash menggunakan **bcrypt** (cost factor ≥ 12) atau **Argon2id** sebelum disimpan.

**SEC-01.2** `[P1]` Token JWT HARUS memiliki expiry ≤ 60 menit dan HARUS diperbarui (refresh) secara silent.

**SEC-01.3** `[P1]` Setiap request API HARUS menyertakan token otentikasi yang valid; request tanpa token atau dengan token expired HARUS ditolak dengan HTTP 401.

**SEC-01.4** `[P1]` Setiap endpoint HARUS memverifikasi role pengguna; akses tidak terotorisasi HARUS ditolak dengan HTTP 403.

**SEC-01.5** `[P1]` Sistem HARUS mengimplementasikan **account lockout** setelah 5 login gagal (lihat FR-01.5).

### SEC-02: Perlindungan Data (OWASP A02, A04)

**SEC-02.1** `[P1]` Semua komunikasi antara klien-server HARUS menggunakan **HTTPS (TLS 1.2+)**; HTTP plain tidak boleh diizinkan.

**SEC-02.2** `[P1]` Database SQLite lokal yang menyimpan data sensitif PII HARUS dienkripsi menggunakan **SQLCipher** atau mekanisme enkripsi setara.

**SEC-02.3** `[P1]` API key, secret key payment gateway, dan credential database HARUS hanya disimpan di file **.env** dan tidak boleh masuk ke version control (tambahkan ke `.gitignore`).

**SEC-02.4** `[P1]` Cookie session HARUS memiliki flag **HttpOnly**, **Secure**, dan **SameSite=Strict**.

**SEC-02.5** `[P1]` Data NPWP toko HARUS diperlakukan sebagai data sensitif dan hanya boleh ditampilkan di struk/laporan, bukan di log atau response API umum.

### SEC-03: Validasi Input (OWASP A03)

**SEC-03.1** `[P1]` Semua input dari pengguna HARUS divalidasi di sisi **server** (client-side validation hanya sebagai UX, bukan keamanan).

**SEC-03.2** `[P1]` Semua query database HARUS menggunakan **prepared statements** atau ORM (Eloquent/Sequelize); query string building manual tidak diizinkan.

**SEC-03.3** `[P1]` Output data ke HTML HARUS di-**escape** dengan benar untuk mencegah XSS.

**SEC-03.4** `[P1]` Upload file (jika ada) HARUS divalidasi tipe dan ukurannya; file yang diupload HARUS disimpan di luar web root.

### SEC-04: Keamanan Konfigurasi (OWASP A05)

**SEC-04.1** `[P1]` Environment production HARUS menonaktifkan **debug mode** dan stack trace di response API.

**SEC-04.2** `[P1]** Response header HARUS menyertakan: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Content-Security-Policy`.

**SEC-04.3** `[P1]` Sistem HARUS mengimplementasikan **CORS** yang hanya mengizinkan origin yang terdaftar.

### SEC-05: Proteksi Webhook (OWASP A08)

**SEC-05.1** `[P1]` Setiap webhook dari payment gateway HARUS diverifikasi menggunakan **HMAC signature** yang diberikan provider; webhook tanpa signature valid HARUS diabaikan.

**SEC-05.2** `[P1]` Endpoint webhook HARUS menerapkan **idempotency** — event yang sama tidak boleh diproses dua kali.

### SEC-06: Logging Keamanan (OWASP A09)

**SEC-06.1** `[P1]` Sistem HARUS mencatat semua event keamanan: login gagal, akun terkunci, akses tidak terotorisasi, perubahan data sensitif.

**SEC-06.2** `[P1]` Log keamanan TIDAK BOLEH memuat password, token, atau data kartu pembayaran.

**SEC-06.3** `[P1]` Log HARUS disimpan dalam format terstruktur (JSON) dengan timestamp UTC.

---

## 6. KEBUTUHAN ANTARMUKA

### 6.1 Antarmuka Pengguna (UI)
- Aplikasi SPA berbasis React, dioptimalkan untuk tablet touchscreen
- Mendukung resolusi minimum 768×1024 px (landscape dan portrait)
- Skema warna yang kontras untuk kondisi pencahayaan toko yang bervariasi
- Semua elemen interaktif minimum 44×44 px (touch target WCAG 2.1)

### 6.2 Antarmuka Hardware
- Thermal printer via WebUSB API atau koneksi jaringan (TCP/IP port 9100)
- Barcode scanner via USB HID (tersimulasi sebagai keyboard input)
- Cash drawer (opsional) via thermal printer kick-out command (ESC/POS)

### 6.3 Antarmuka Perangkat Lunak
- **Payment Gateway API**: Midtrans / Xendit REST API v2
- **PDF Generator**: Library server-side (e.g., DomPDF untuk Laravel atau Puppeteer untuk Node.js)
- **SQLite Sync**: Custom sync protocol via REST API dengan conflict detection

### 6.4 Antarmuka Komunikasi
- Protokol: HTTPS (REST API)
- Format data: JSON (application/json)
- Autentikasi API: Bearer token (JWT)
- Real-time: WebSocket atau Server-Sent Events untuk notifikasi status pembayaran

---

## 7. BATASAN DESAIN & IMPLEMENTASI

| Batasan | Keterangan |
|---|---|
| Bahasa Backend | PHP 8.2+ (Laravel 11.x), Node.js 18+ |
| Frontend | React 18+, TypeScript direkomendasikan |
| Database | SQLite 3.x (lokal), MySQL/PostgreSQL (server) |
| Arsitektur API | RESTful, versioned (/api/v1/) |
| Tidak ada hardcoded secret | Semua secret via .env |
| Lisensi | Semua dependency harus open-source atau berlisensi komersial yang sah |
| Ukuran bundle frontend | Maksimum 5 MB (gzipped) untuk performa offline |

---

## 8. MATRIKS KETERLACAKAN KEBUTUHAN (RTM)

| FR ID | Deskripsi Singkat | Modul Kode | Test Case ID | Status |
|---|---|---|---|---|
| FR-01 | Autentikasi & Sesi | AuthController | TC-AUTH-01..08 | 📋 Planned |
| FR-02 | RBAC | PermissionMiddleware | TC-RBAC-01..10 | 📋 Planned |
| FR-03 | Manajemen Produk | ProductController | TC-PROD-01..06 | 📋 Planned |
| FR-04 | Inventori Real-time | InventoryService | TC-INV-01..05 | 📋 Planned |
| FR-05 | Pembelian & Restock | PurchaseController | TC-PO-01..04 | 📋 Planned |
| FR-06 | Transaksi POS | TransactionController | TC-TRX-01..10 | 📋 Planned |
| FR-07 | Void & Retur | VoidReturnService | TC-VR-01..05 | 📋 Planned |
| FR-08 | Payment Gateway | PaymentGatewayService | TC-PAY-01..07 | 📋 Planned |
| FR-09 | Audit Log | AuditLogObserver | TC-LOG-01..05 | 📋 Planned |
| FR-10 | Struk & Receipt | ReceiptService | TC-REC-01..04 | 📋 Planned |
| FR-11 | Laporan & Ekspor | ReportController | TC-REP-01..05 | 📋 Planned |
| FR-12 | Sinkronisasi Offline | SyncService | TC-SYNC-01..06 | 📋 Planned |

---

*Dokumen ini akan diperbarui seiring perkembangan proyek. Setiap perubahan kebutuhan harus melalui proses Change Control formal.*

**Nomor Dokumen:** MikoMart-SRS-2026-001 | **Versi:** 1.0 | **Klasifikasi:** INTERNAL — CONFIDENTIAL
