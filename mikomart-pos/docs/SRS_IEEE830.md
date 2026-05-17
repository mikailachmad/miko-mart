# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## Sistem Point of Sale (POS) MikoMart
### Berdasarkan Standar IEEE 830-1998

---

| **Atribut**         | **Detail**                                    |
|---------------------|-----------------------------------------------|
| **Nama Sistem**     | Sistem Point of Sale (POS) MikoMart           |
| **Versi Dokumen**   | 1.0 (Draft)                                   |
| **Tanggal**         | 28 Maret 2026                                 |
| **Klien**           | MikoMart (Supermarket)                        |
| **Disiapkan oleh**  | Tim Pengembang Sistem                         |
| **Standar Acuan**   | IEEE Std 830-1998                             |

---

## Riwayat Revisi

| Versi | Tanggal       | Perubahan            | Penulis        |
|-------|---------------|----------------------|----------------|
| 1.0   | 28 Maret 2026 | Dokumen awal (draft) | Tim Pengembang |

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Deskripsi Keseluruhan](#2-deskripsi-keseluruhan)
3. [Kebutuhan Fungsional](#3-kebutuhan-fungsional)
4. [Kebutuhan Non-Fungsional](#4-kebutuhan-non-fungsional)
5. [Kebutuhan Antarmuka Eksternal](#5-kebutuhan-antarmuka-eksternal)

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen Software Requirements Specification (SRS) ini bertujuan untuk mendefinisikan secara lengkap dan terstruktur seluruh kebutuhan perangkat lunak **Sistem Point of Sale (POS) MikoMart**. Dokumen ini disusun berdasarkan standar **IEEE Std 830-1998** dan ditujukan kepada:

- **Klien (MikoMart)** — sebagai acuan validasi bahwa kebutuhan bisnis telah tercakup secara utuh
- **Tim Pengembang** — sebagai panduan teknis dalam proses perancangan, implementasi, dan pengujian
- **Tim Penguji (QA)** — sebagai dasar penyusunan test case dan acceptance criteria
- **Pemangku kepentingan lainnya** — sebagai referensi komunikasi antar pihak

Dokumen ini mencakup kebutuhan fungsional, kebutuhan non-fungsional, kebutuhan antarmuka eksternal, serta batasan dan asumsi yang berlaku.

### 1.2 Ruang Lingkup Produk

**Sistem POS MikoMart** adalah aplikasi point of sale berbasis web yang dirancang untuk mengotomatisasi proses transaksi penjualan di supermarket MikoMart. Sistem ini akan:

1. **Mengeliminasi kesalahan input harga manual** melalui pemindaian barcode yang terintegrasi dengan database produk
2. **Mempercepat proses transaksi** dengan target ≤ 8 detik per pelanggan (scan pertama hingga cetak struk)
3. **Menghitung Pajak Pertambahan Nilai (PPN) secara otomatis** pada setiap transaksi
4. **Mendukung operasi offline penuh** menggunakan database SQLite lokal per workstation dengan sinkronisasi via LAN
5. **Menyediakan laporan penjualan** harian dan bulanan untuk keperluan manajemen

Sistem ini **tidak mencakup**: pembayaran non-tunai, e-commerce, aplikasi mobile, program loyalitas, dan integrasi langsung API e-Faktur (dijadwalkan untuk fase 2).

### 1.3 Definisi, Akronim, dan Singkatan

| Istilah / Akronim | Definisi                                                                     |
|--------------------|------------------------------------------------------------------------------|
| **POS**            | Point of Sale — sistem pemrosesan transaksi penjualan di titik kasir         |
| **SRS**            | Software Requirements Specification — dokumen spesifikasi kebutuhan          |
| **PPN**            | Pajak Pertambahan Nilai — pajak konsumsi 11% atas barang/jasa                |
| **PKP**            | Pengusaha Kena Pajak — entitas yang dikukuhkan untuk memungut PPN            |
| **NPWP**           | Nomor Pokok Wajib Pajak                                                      |
| **RBAC**           | Role-Based Access Control — otorisasi berbasis peran                         |
| **CRUD**           | Create, Read, Update, Delete — operasi dasar data                            |
| **LAN**            | Local Area Network — jaringan komputer lokal                                 |
| **SQLite**         | Sistem database relasional berbasis file, tanpa server terpisah              |
| **EAN-13**         | European Article Number — standar barcode internasional 13 digit             |
| **UAT**            | User Acceptance Testing — pengujian penerimaan oleh pengguna akhir           |
| **FR**             | Functional Requirement — kebutuhan fungsional                                |
| **NFR**            | Non-Functional Requirement — kebutuhan non-fungsional                        |
| **CSV**            | Comma-Separated Values — format file data tabular                            |
| **API**            | Application Programming Interface                                            |

### 1.4 Referensi

| No. | Referensi                                                                              |
|-----|----------------------------------------------------------------------------------------|
| 1   | IEEE Std 830-1998 — Recommended Practice for Software Requirements Specifications      |
| 2   | IEEE Std 1016-2009 — Software Design Descriptions                                     |
| 3   | ISO/IEC 12207:2017 — Systems and Software Engineering — Software Life Cycle Processes  |
| 4   | ISO/IEC 25010:2011 — Systems and Software Quality Requirements and Evaluation          |
| 5   | UU No. 42 Tahun 2009 — Pajak Pertambahan Nilai Barang dan Jasa                        |
| 6   | Project Charter — Sistem POS MikoMart v1.0 (28 Maret 2026)                            |
| 7   | Product Requirements Document (PRD) — Sistem POS MikoMart v1.0 (28 Maret 2026)        |

---

## 2. Deskripsi Keseluruhan

### 2.1 Perspektif Produk

Sistem POS MikoMart adalah **sistem baru yang dibangun dari nol** (*greenfield development*). Saat ini MikoMart tidak memiliki sistem informasi digital apapun; seluruh proses transaksi dilakukan secara manual.

#### 2.1.1 Arsitektur Sistem

Sistem menggunakan arsitektur **client-server lokal** dalam jaringan LAN:

```
┌──────────────────────────────────────────────────────────┐
│                    JARINGAN LAN TOKO                      │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Workstation  │  │ Workstation  │  │ Workstation  │     │
│  │   Kasir 1    │  │   Kasir 2    │  │   Kasir 3    │     │
│  │ ┌─────────┐  │  │ ┌─────────┐  │  │ ┌─────────┐  │    │
│  │ │ React   │  │  │ │ React   │  │  │ │ React   │  │    │
│  │ │Frontend │  │  │ │Frontend │  │  │ │Frontend │  │    │
│  │ ├─────────┤  │  │ ├─────────┤  │  │ ├─────────┤  │    │
│  │ │ SQLite  │  │  │ │ SQLite  │  │  │ │ SQLite  │  │    │
│  │ │ (lokal) │  │  │ │ (lokal) │  │  │ │ (lokal) │  │    │
│  │ └─────────┘  │  │ └─────────┘  │  │ └─────────┘  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                  │                  │           │
│         └──────────────────┼──────────────────┘           │
│                            │ LAN Sync                     │
│                    ┌───────┴────────┐                     │
│                    │  SERVER PUSAT   │   ┌─────────────┐  │
│                    │  (Laravel API)  │   │ Workstation  │  │
│                    │  ┌──────────┐   │   │  Kasir 4     │  │
│                    │  │ SQLite   │   │   │ (struktur    │  │
│                    │  │ (master) │   │   │  sama)       │  │
│                    │  └──────────┘   │   └─────────────┘  │
│                    │  ┌──────────┐   │                     │
│                    │  │ Node.js  │   │                     │
│                    │  │ (sync    │   │                     │
│                    │  │ service) │   │                     │
│                    │  └──────────┘   │                     │
│                    └────────────────┘                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐                      │
│  │ Admin PC     │  │ Supervisor PC│                      │
│  │ (Dashboard)  │  │ (Laporan)    │                      │
│  └──────────────┘  └──────────────┘                      │
└──────────────────────────────────────────────────────────┘
```

#### 2.1.2 Teknologi

| Komponen       | Teknologi                  | Fungsi                                    |
|----------------|----------------------------|-------------------------------------------|
| Backend API    | PHP Laravel 11             | REST API, business logic, autentikasi     |
| Frontend       | React 18 + Vite            | Antarmuka pengguna (POS, Admin, Laporan)  |
| Sync Service   | Node.js                    | Sinkronisasi data antar workstation (LAN) |
| Database       | SQLite                     | Penyimpanan data lokal & server pusat     |
| Printer        | ESC/POS protocol           | Cetak struk via thermal printer           |

### 2.2 Fungsi Produk (Ringkasan)

| No. | Modul                    | Fungsi Utama                                                  |
|-----|--------------------------|---------------------------------------------------------------|
| M1  | Manajemen Produk         | CRUD produk, barcode, harga, kategori, stok dasar             |
| M2  | Transaksi POS            | Scan barcode, keranjang, hitung total+PPN, bayar tunai, struk |
| M3  | Manajemen Pengguna       | Login, RBAC (Admin/Supervisor/Kasir), kelola akun             |
| M4  | Laporan Penjualan        | Laporan harian, bulanan, per kasir, produk terlaris           |
| M5  | Perpajakan (PPN)         | Kalkulasi PPN otomatis, info PKP pada struk, laporan pajak    |
| M6  | Offline & Sinkronisasi   | SQLite lokal, sync via LAN, conflict resolution               |

### 2.3 Karakteristik Pengguna

| Peran           | Jumlah | Kompetensi IT | Frekuensi Penggunaan | Modul yang Diakses           |
|-----------------|--------|---------------|----------------------|------------------------------|
| **Kasir**       | 4      | Dasar         | Harian (08:00-20:00) | Transaksi POS                |
| **Supervisor**  | 1-2    | Menengah      | Harian               | Laporan Penjualan, Void      |
| **Admin**       | 1      | Menengah-Tinggi| Harian/Mingguan      | Produk, Pengguna, Konfigurasi|

### 2.4 Batasan & Asumsi

#### 2.4.1 Batasan

| ID   | Batasan                                                                  |
|------|--------------------------------------------------------------------------|
| BT-1 | Metode pembayaran hanya tunai pada fase 1                                |
| BT-2 | Maksimal 4 workstation kasir aktif secara bersamaan                      |
| BT-3 | Jam operasional: 08:00–20:00 WIB                                        |
| BT-4 | Database SQLite (bukan RDBMS server seperti MySQL/PostgreSQL)            |
| BT-5 | Tidak ada koneksi internet yang dijamin — harus offline-capable          |
| BT-6 | Perangkat keras disediakan oleh klien                                    |

#### 2.4.2 Asumsi

| ID   | Asumsi                                                                   |
|------|--------------------------------------------------------------------------|
| AS-1 | Semua produk memiliki barcode standar EAN-13/UPC                         |
| AS-2 | Jaringan LAN tersedia dan menghubungkan seluruh workstation              |
| AS-3 | Barcode scanner beroperasi dalam mode keyboard (HID)                     |
| AS-4 | Data produk awal akan diinput oleh Admin sebelum go-live                 |
| AS-5 | MikoMart terdaftar sebagai PKP dengan NPWP aktif                         |
| AS-6 | Tarif PPN yang berlaku adalah 11%                                        |

---

## 3. Kebutuhan Fungsional

> **Format**: ID | Deskripsi | Prioritas | Sumber

### 3.1 Modul Manajemen Produk

| ID      | Deskripsi                                                                                                            | Prioritas | Sumber    |
|---------|----------------------------------------------------------------------------------------------------------------------|-----------|-----------|
| FR-001  | Sistem **harus** menyediakan form untuk menambahkan produk baru dengan field: nama produk, barcode (EAN-13), harga jual, kategori, stok awal, dan satuan | Must      | US-08     |
| FR-002  | Sistem **harus** memvalidasi bahwa barcode bersifat unik; menolak duplikasi dengan pesan error yang jelas             | Must      | Analisis  |
| FR-003  | Sistem **harus** memungkinkan Admin mengubah data produk (nama, harga, kategori, stok); perubahan harga berlaku real-time di semua workstation | Must      | US-09     |
| FR-004  | Sistem **harus** mendukung soft-delete produk (nonaktifkan); produk nonaktif tidak muncul di pencarian POS            | Must      | US-10     |
| FR-005  | Sistem **harus** menyediakan fitur pencarian dan filter produk berdasarkan nama, barcode, atau kategori               | Must      | Analisis  |
| FR-006  | Sistem **sebaiknya** menyediakan fitur import data produk secara massal dari file CSV dengan template yang disediakan  | Should    | US-11     |
| FR-007  | Sistem **harus** menyediakan CRUD untuk kategori produk (Makanan, Minuman, Peralatan, Toiletries, dll)                | Should    | US-12     |
| FR-008  | Sistem **harus** mengurangi stok secara otomatis saat transaksi berhasil disimpan                                     | Must      | Analisis  |
| FR-009  | Sistem **sebaiknya** menampilkan alert/notifikasi jika stok produk di bawah threshold minimum yang dikonfigurasi       | Should    | Analisis  |

### 3.2 Modul Transaksi POS

| ID      | Deskripsi                                                                                                            | Prioritas | Sumber    |
|---------|----------------------------------------------------------------------------------------------------------------------|-----------|-----------|
| FR-010  | Sistem **harus** menerima input barcode dari scanner (mode keyboard/HID) dan menampilkan informasi produk (nama, harga, qty) dalam ≤ 500ms | Must      | US-01     |
| FR-011  | Sistem **harus** menampilkan barcode yang tidak ditemukan di database dengan pesan error yang jelas dan opsi pencarian manual | Must      | Analisis  |
| FR-012  | Sistem **harus** secara otomatis menambahkan produk ke keranjang belanja setelah scan berhasil; jika produk sudah ada di keranjang, increment kuantitas +1 | Must      | US-02     |
| FR-013  | Sistem **harus** memungkinkan kasir mengubah kuantitas item di keranjang secara langsung tanpa scan ulang              | Should    | US-06     |
| FR-014  | Sistem **harus** memungkinkan kasir menghapus item individual dari keranjang atau mengosongkan seluruh keranjang       | Must      | US-05     |
| FR-015  | Sistem **harus** menghitung dan menampilkan secara real-time: Subtotal = Σ(harga × qty), PPN = 11% × Subtotal, Grand Total = Subtotal + PPN | Must      | Analisis  |
| FR-016  | Sistem **harus** menyediakan field input nominal pembayaran tunai dan menghitung kembalian secara otomatis             | Must      | US-03     |
| FR-017  | Sistem **harus** menolak penyelesaian transaksi jika nominal tunai < grand total, dengan pesan error yang jelas        | Must      | Analisis  |
| FR-018  | Sistem **harus** menyimpan record transaksi yang mencakup: nomor transaksi (auto-generate), tanggal/waktu, ID kasir, daftar item, subtotal, PPN, grand total, nominal bayar, kembalian | Must      | Analisis  |
| FR-019  | Sistem **harus** mencetak struk transaksi via thermal printer dengan format standar: header toko (nama, alamat, NPWP) → daftar item → subtotal → PPN → total → tunai → kembalian → footer | Must      | US-04     |
| FR-020  | Sistem **harus** menyediakan fitur pencarian produk manual berdasarkan nama atau kode produk sebagai fallback jika barcode tidak terbaca | Must      | US-07     |
| FR-021  | Sistem **dapat** menyediakan fitur hold (tahan) transaksi aktif dan recall (panggil kembali) untuk melayani pelanggan lain | Could     | Analisis  |
| FR-022  | Sistem **harus** menggenerate nomor transaksi unik dengan format: `MKM-YYYYMMDD-NNNN` (contoh: MKM-20260328-0001)    | Must      | Analisis  |

### 3.3 Modul Manajemen Pengguna & Autentikasi

| ID      | Deskripsi                                                                                                            | Prioritas | Sumber    |
|---------|----------------------------------------------------------------------------------------------------------------------|-----------|-----------|
| FR-023  | Sistem **harus** menyediakan halaman login dengan autentikasi username dan password                                   | Must      | US-13     |
| FR-024  | Sistem **harus** menerapkan Role-Based Access Control (RBAC) dengan 3 peran: Admin, Supervisor, Kasir                 | Must      | Analisis  |
| FR-025  | Sistem **harus** membatasi akses menu/fitur berdasarkan peran pengguna sesuai matriks hak akses                       | Must      | Analisis  |
| FR-026  | Sistem **harus** menyediakan fitur CRUD akun pengguna (Admin only) dengan field: nama, username, password, peran, status | Must      | US-13     |
| FR-027  | Sistem **harus** mendukung nonaktifkan akun pengguna (soft-delete); akun nonaktif tidak dapat login                   | Must      | US-14     |
| FR-028  | Sistem **sebaiknya** menyediakan fitur reset password oleh Admin                                                      | Should    | US-15     |
| FR-029  | Sistem **harus** mencatat log aktivitas: login, logout, dan transaksi yang diproses oleh setiap pengguna              | Must      | Analisis  |
| FR-030  | Sistem **harus** melakukan auto-logout setelah 15 menit tanpa aktivitas (idle timeout)                                | Must      | Analisis  |

### 3.4 Modul Laporan Penjualan

| ID      | Deskripsi                                                                                                            | Prioritas | Sumber    |
|---------|----------------------------------------------------------------------------------------------------------------------|-----------|-----------|
| FR-031  | Sistem **harus** menyediakan laporan penjualan harian: total transaksi, total pendapatan, jumlah item terjual, breakdown per kasir | Must      | US-16     |
| FR-032  | Sistem **sebaiknya** menyediakan laporan penjualan bulanan dengan agregasi harian dan grafik tren                     | Should    | US-17     |
| FR-033  | Sistem **sebaiknya** menyediakan laporan penjualan per kasir dalam periode tertentu untuk evaluasi kinerja             | Should    | US-18     |
| FR-034  | Sistem **dapat** menyediakan laporan produk terlaris berdasarkan volume penjualan dalam periode tertentu               | Could     | US-19     |
| FR-035  | Sistem **sebaiknya** mendukung ekspor laporan ke format PDF dan Excel (XLSX)                                          | Should    | US-20     |

### 3.5 Modul Perpajakan (PPN)

| ID      | Deskripsi                                                                                                            | Prioritas | Sumber    |
|---------|----------------------------------------------------------------------------------------------------------------------|-----------|-----------|
| FR-036  | Sistem **harus** menghitung PPN 11% secara otomatis dari subtotal setiap transaksi                                    | Must      | US-21     |
| FR-037  | Sistem **harus** menampilkan komponen PPN sebagai baris terpisah pada struk (Subtotal, PPN 11%, Total)                | Must      | US-22     |
| FR-038  | Sistem **harus** mencantumkan nama usaha, alamat, dan NPWP pada header struk sesuai ketentuan PKP                     | Must      | US-22     |
| FR-039  | Sistem **harus** menyediakan konfigurasi tarif pajak yang dapat diubah oleh Admin tanpa modifikasi kode               | Must      | Analisis  |
| FR-040  | Sistem **sebaiknya** menyediakan laporan ringkasan PPN bulanan: total PPN terkumpul, jumlah transaksi kena pajak       | Should    | US-23     |

### 3.6 Modul Offline & Sinkronisasi

| ID      | Deskripsi                                                                                                            | Prioritas | Sumber    |
|---------|----------------------------------------------------------------------------------------------------------------------|-----------|-----------|
| FR-041  | Sistem **harus** beroperasi secara penuh (semua fitur POS) tanpa koneksi internet                                     | Must      | Klarifikasi |
| FR-042  | Sistem **harus** menggunakan SQLite sebagai database lokal pada setiap workstation kasir                              | Must      | Klarifikasi |
| FR-043  | Sistem **harus** menyinkronisasi data produk dari server pusat ke semua workstation kasir melalui jaringan LAN         | Must      | Analisis  |
| FR-044  | Sistem **harus** menyinkronisasi data transaksi dari setiap workstation kasir ke server pusat melalui jaringan LAN     | Must      | Analisis  |
| FR-045  | Sistem **harus** menerapkan strategi conflict resolution: last-write-wins untuk data produk, append-only untuk transaksi | Must      | Analisis  |
| FR-046  | Sistem **harus** menampilkan status konektivitas LAN (Online/Offline) pada antarmuka kasir                            | Should    | Analisis  |

---

## 4. Kebutuhan Non-Fungsional

### 4.1 Kebutuhan Performa

| ID        | Deskripsi                                                                     | Target              |
|-----------|-------------------------------------------------------------------------------|----------------------|
| NFR-001   | Waktu respons scan barcode hingga produk ditampilkan di keranjang             | ≤ 500 ms             |
| NFR-002   | Waktu proses transaksi lengkap (scan produk pertama → cetak struk selesai)   | ≤ 8 detik            |
| NFR-003   | Sistem mendukung 4 kasir bertransaksi secara bersamaan tanpa degradasi        | 4 concurrent users   |
| NFR-004   | Waktu loading halaman dashboard/laporan                                       | ≤ 5 detik            |
| NFR-005   | Ukuran database SQLite per workstation tetap optimal                          | ≤ 500 MB / tahun     |

### 4.2 Kebutuhan Keamanan

| ID        | Deskripsi                                                                     | Detail                        |
|-----------|-------------------------------------------------------------------------------|-------------------------------|
| NFR-006   | Password pengguna disimpan menggunakan hashing algorithm yang aman            | Bcrypt (cost factor ≥ 10)     |
| NFR-007   | Setiap request API harus melalui autentikasi token                           | Laravel Sanctum / JWT         |
| NFR-008   | Otorisasi berbasis peran diterapkan pada setiap endpoint                      | RBAC middleware                |
| NFR-009   | Session timeout setelah periode idle                                          | 15 menit                      |
| NFR-010   | Sistem mencatat audit trail untuk semua aktivitas kritis                      | Login, transaksi, perubahan   |
| NFR-011   | Data transaksi tidak dapat dihapus oleh pengguna manapun (immutable log)      | Append-only transaction log   |

### 4.3 Kebutuhan Keandalan & Portabilitas

| ID        | Deskripsi                                                                     | Target                        |
|-----------|-------------------------------------------------------------------------------|-------------------------------|
| NFR-012   | Uptime selama jam operasional (08:00–20:00 WIB)                              | ≥ 99.5%                       |
| NFR-013   | Sistem berfungsi 100% saat koneksi internet tidak tersedia                    | Full offline capability       |
| NFR-014   | Recovery time setelah kegagalan/crash                                        | ≤ 5 menit                     |
| NFR-015   | Sistem berjalan pada OS Windows 10/11 (workstation kasir)                    | Cross-platform via browser    |
| NFR-016   | Sistem kompatibel dengan browser modern (Chrome, Edge, Firefox)              | 2 versi terakhir              |
| NFR-017   | Backup otomatis database SQLite                                              | Setiap akhir hari operasional |
| NFR-018   | Antarmuka kasir menggunakan Bahasa Indonesia                                 | Full localization              |

---

## 5. Kebutuhan Antarmuka Eksternal

### 5.1 Antarmuka Pengguna (User Interface)

| ID        | Deskripsi                                                                                          |
|-----------|----------------------------------------------------------------------------------------------------|
| UI-001    | Halaman login: field username, password, tombol masuk; desain sederhana dengan branding MikoMart   |
| UI-002    | Halaman POS Kasir: layout 2 kolom — kiri (daftar belanja/keranjang), kanan (ringkasan pembayaran); font besar (≥16px), tombol lebar |
| UI-003    | Halaman Manajemen Produk (Admin): tabel data produk dengan pagination, filter, search; form modal untuk CRUD |
| UI-004    | Halaman Manajemen Pengguna (Admin): tabel data pengguna dengan status aktif/nonaktif; form modal CRUD |
| UI-005    | Dashboard Laporan (Supervisor): ringkasan angka kunci (KPI cards), tabel transaksi, grafik tren penjualan |
| UI-006    | Keyboard shortcut terlihat pada label tombol di halaman POS (F1=Cari, F3=Hapus, F12=Bayar, ESC=Batal) |

### 5.2 Antarmuka Perangkat Keras (Hardware Interface)

| ID        | Perangkat              | Protokol / Standar         | Deskripsi                                              |
|-----------|------------------------|----------------------------|--------------------------------------------------------|
| HW-001    | Barcode Scanner USB    | USB HID (keyboard mode)   | Scanner mengirim karakter barcode + Enter ke field aktif |
| HW-002    | Thermal Receipt Printer| ESC/POS via USB/Serial     | Cetak struk 58mm/80mm; mendukung karakter Bahasa Indonesia |
| HW-003    | Cash Drawer (opsional) | Trigger via printer kick   | Laci kas terbuka otomatis setelah transaksi selesai     |

### 5.3 Antarmuka Perangkat Lunak (Software Interface)

| ID        | Sistem / Komponen      | Protokol                   | Deskripsi                                              |
|-----------|------------------------|----------------------------|--------------------------------------------------------|
| SW-001    | Laravel Backend API    | REST API (JSON over HTTP)  | Frontend berkomunikasi dengan backend via REST endpoint |
| SW-002    | Node.js Sync Service   | WebSocket / HTTP polling   | Sinkronisasi data real-time antar workstation via LAN  |
| SW-003    | SQLite Database        | File-based SQL             | Akses langsung via driver SQLite pada setiap workstation |

### 5.4 Antarmuka Komunikasi (Communication Interface)

| ID        | Medium                 | Protokol                   | Deskripsi                                              |
|-----------|------------------------|----------------------------|--------------------------------------------------------|
| COM-001   | Jaringan LAN           | TCP/IP                     | Komunikasi antar workstation dan server pusat           |
| COM-002   | Localhost              | HTTP (port 8000/3000)      | Frontend lokal berkomunikasi dengan backend lokal       |

---

## Glosarium

*(Lihat Bagian 1.3 — Definisi, Akronim, dan Singkatan)*

## Referensi

*(Lihat Bagian 1.4 — Referensi)*

---

> **Dokumen ini berstatus DRAFT dan memerlukan review serta persetujuan dari klien dan pemangku kepentingan sebelum digunakan sebagai acuan pengembangan.**
