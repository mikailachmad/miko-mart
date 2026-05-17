# PROJECT CHARTER

---

| **Atribut**         | **Detail**                                              |
|---------------------|---------------------------------------------------------|
| **Nama Proyek**     | Sistem Point of Sale (POS) MikoMart                     |
| **Versi Dokumen**   | 1.0                                                     |
| **Tanggal**         | 28 Maret 2026                                           |
| **Klien/Lembaga**   | MikoMart (Supermarket)                                  |
| **Disiapkan oleh**  | Tim Pengembang Sistem                                   |
| **Status**          | Draft — Menunggu Persetujuan Klien                      |

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Permasalahan](#2-latar-belakang--permasalahan)
3. [Tujuan Proyek](#3-tujuan-proyek)
4. [Ruang Lingkup Proyek](#4-ruang-lingkup-proyek)
5. [Pemangku Kepentingan (Stakeholders)](#5-pemangku-kepentingan-stakeholders)
6. [Batasan & Asumsi](#6-batasan--asumsi)
7. [Milestone Utama](#7-milestone-utama)
8. [Kriteria Keberhasilan](#8-kriteria-keberhasilan)
9. [Analisis Risiko Awal](#9-analisis-risiko-awal)
10. [Persetujuan](#10-persetujuan)

---

## Riwayat Revisi

| Versi | Tanggal        | Perubahan                  | Penulis             |
|-------|----------------|----------------------------|---------------------|
| 1.0   | 28 Maret 2026  | Dokumen awal (draft)       | Tim Pengembang      |

---

## 1. Ringkasan Eksekutif

MikoMart adalah supermarket yang mengalami tantangan operasional dalam proses transaksi kasir, khususnya pada jam-jam sibuk dimana volume pelanggan membludak. Kondisi ini menyebabkan kasir rentan melakukan **kesalahan input harga secara manual**, yang berdampak pada ketidakakuratan pendapatan dan potensi kerugian finansial.

Proyek ini bertujuan membangun **Sistem Point of Sale (POS)** berbasis web yang terintegrasi dengan pemindai barcode untuk mengotomatisasi pengambilan data harga produk dari database. Sistem dirancang untuk beroperasi secara **offline-first** di jaringan lokal (LAN), mendukung **4 workstation kasir secara bersamaan**, dan menghasilkan struk transaksi yang telah memuat komponen **Pajak Pertambahan Nilai (PPN)**.

Teknologi yang digunakan meliputi **PHP Laravel** (backend API), **React** (frontend antarmuka kasir), **Node.js** (middleware & service layer), dan **SQLite** (database lokal per workstation dengan sinkronisasi).

---

## 2. Latar Belakang & Permasalahan

### 2.1 Kondisi Saat Ini (*As-Is*)

| Aspek              | Kondisi                                                        |
|--------------------|----------------------------------------------------------------|
| Proses transaksi   | Manual / semi-manual — kasir menginput harga secara manual     |
| Sumber harga       | Daftar harga cetak atau hafalan kasir                          |
| Pengelolaan produk | Belum terdigitalisasi                                          |
| Laporan penjualan  | Rekap manual di akhir shift                                    |
| Sistem eksisting   | **Tidak ada** — ini adalah sistem pertama yang dibangun        |

### 2.2 Permasalahan Utama

1. **Kesalahan input harga** saat volume pelanggan tinggi (human error)
2. **Keterlambatan proses transaksi** yang menyebabkan antrean panjang
3. **Tidak ada pencatatan penjualan real-time** untuk pengambilan keputusan
4. **Kesulitan pelacakan pajak (PPN)** secara akurat per transaksi
5. **Tidak ada kontrol stok** yang terhubung langsung dengan penjualan

---

## 3. Tujuan Proyek

### 3.1 Tujuan Umum

Membangun Sistem POS terintegrasi yang mengeliminasi kesalahan input harga manual dan meningkatkan efisiensi operasional kasir MikoMart.

### 3.2 Tujuan Khusus

| No. | Tujuan                                                                                      | Indikator Keberhasilan                                  |
|-----|---------------------------------------------------------------------------------------------|---------------------------------------------------------|
| T1  | Mengotomatisasi pengambilan harga produk melalui pemindaian barcode                         | 100% harga diambil dari database, 0% input manual       |
| T2  | Mempercepat proses transaksi per pelanggan                                                  | ≤ 8 detik dari scan pertama hingga cetak struk           |
| T3  | Menyediakan laporan penjualan harian/bulanan untuk supervisor                               | Laporan tersedia real-time via dashboard                 |
| T4  | Mencatat dan menghitung PPN secara otomatis pada setiap transaksi                           | PPN 11% tercantum pada setiap struk                      |
| T5  | Menjamin keberlangsungan operasi saat koneksi internet terputus                             | Sistem berjalan penuh secara offline (LAN/lokal)         |

---

## 4. Ruang Lingkup Proyek

### 4.1 Dalam Lingkup (*In Scope*)

| Modul                        | Deskripsi                                                         |
|------------------------------|-------------------------------------------------------------------|
| **Manajemen Produk**         | CRUD produk, barcode, harga, kategori (oleh Admin)                |
| **Transaksi POS**            | Scan barcode → tampil produk & harga → hitung total → bayar tunai → cetak struk |
| **Manajemen Pengguna**       | Login, peran (Admin, Supervisor, Kasir), hak akses                |
| **Laporan Penjualan**        | Laporan harian, bulanan, per kasir, per produk (Supervisor)       |
| **Perhitungan Pajak (PPN)**  | PPN 11% otomatis pada setiap transaksi                            |
| **Struk/Receipt**            | Cetak struk via thermal printer                                   |
| **Operasi Offline**          | SQLite lokal, sinkronisasi antar workstation via LAN              |

### 4.2 Di Luar Lingkup (*Out of Scope*) — Fase 1

| Item                                   | Keterangan                                        |
|----------------------------------------|---------------------------------------------------|
| Pembayaran non-tunai (kartu, QRIS)     | Tidak termasuk dalam fase awal                    |
| Sistem inventori/gudang lengkap        | Hanya tracking stok dasar (kurangi saat terjual)  |
| E-commerce / penjualan online          | Tidak termasuk                                    |
| Integrasi API perpajakan (e-Faktur)    | Dipersiapkan strukturnya, implementasi penuh di fase 2 |
| Aplikasi mobile                        | Tidak termasuk                                    |
| Program loyalitas / membership         | Tidak termasuk dalam fase awal                    |

---

## 5. Pemangku Kepentingan (*Stakeholders*)

| Peran              | Deskripsi                                              | Keterlibatan              |
|--------------------|--------------------------------------------------------|---------------------------|
| **Pemilik MikoMart** | Pemberi keputusan akhir, pemilik anggaran              | Persetujuan & UAT         |
| **Admin**          | Mengelola data produk, harga, dan akun pengguna        | Pengguna harian           |
| **Supervisor**     | Mengawasi operasional kasir, melihat laporan penjualan | Pengguna harian           |
| **Kasir (×4)**     | Melakukan transaksi penjualan langsung dengan pelanggan | Pengguna utama            |
| **Tim Pengembang** | Membangun, menguji, dan men-deploy sistem              | Pengembangan & pemeliharaan |

---

## 6. Batasan & Asumsi

### 6.1 Batasan (*Constraints*)

| No. | Batasan                                                                                |
|-----|----------------------------------------------------------------------------------------|
| B1  | Metode pembayaran **hanya tunai** pada fase 1                                          |
| B2  | Maksimal **4 workstation kasir** aktif secara bersamaan                                 |
| B3  | Jam operasional sistem: **08:00 – 20:00 WIB** (mengikuti jam toko)                     |
| B4  | Database menggunakan **SQLite** (ringan, tanpa server database terpisah)                |
| B5  | Setiap workstation kasir memiliki **PC + barcode scanner + thermal printer** sendiri    |

### 6.2 Asumsi (*Assumptions*)

| No. | Asumsi                                                                                 |
|-----|----------------------------------------------------------------------------------------|
| A1  | Setiap produk yang dijual **sudah memiliki barcode** standar (EAN-13 / UPC)            |
| A2  | Tersedia **jaringan LAN** yang menghubungkan seluruh workstation                       |
| A3  | Perangkat keras (PC, scanner, printer) sudah tersedia atau akan disediakan oleh klien  |
| A4  | Admin bertanggung jawab menginput data produk awal ke dalam sistem                     |
| A5  | MikoMart telah terdaftar sebagai **PKP** dan memiliki NPWP aktif                       |

---

## 7. Milestone Utama

| No. | Fase                           | Deliverable                                  | Estimasi Durasi  |
|-----|--------------------------------|----------------------------------------------|------------------|
| M1  | Dokumentasi & Perencanaan      | Project Charter, PRD, SRS, Desain Sistem     | Minggu 1–2       |
| M2  | Desain UI/UX & Arsitektur      | Wireframe, ERD, Arsitektur Sistem            | Minggu 3–4       |
| M3  | Pengembangan Core Backend      | API produk, transaksi, autentikasi           | Minggu 5–8       |
| M4  | Pengembangan Frontend POS      | Antarmuka kasir, scan barcode, cetak struk   | Minggu 9–12      |
| M5  | Integrasi & Offline Support    | Sinkronisasi SQLite, mode offline            | Minggu 13–14     |
| M6  | Pengujian (Testing)            | Unit test, integration test, UAT             | Minggu 15–16     |
| M7  | Deployment & Go-Live           | Instalasi di 4 workstation, training kasir   | Minggu 17–18     |

---

## 8. Kriteria Keberhasilan

| No. | Kriteria                                                                     | Target               |
|-----|------------------------------------------------------------------------------|-----------------------|
| K1  | Proses transaksi (scan → struk) selesai dalam waktu                          | ≤ 8 detik             |
| K2  | Tingkat kesalahan harga setelah implementasi                                 | 0% (otomatis via DB)  |
| K3  | Sistem dapat beroperasi tanpa koneksi internet                               | 100% fungsional       |
| K4  | 4 kasir dapat bertransaksi secara bersamaan tanpa konflik                    | Tanpa error/deadlock  |
| K5  | Struk transaksi mencantumkan rincian PPN dengan benar                        | 100% akurat           |
| K6  | Supervisor dapat mengakses laporan penjualan harian                          | Tersedia < 5 detik    |

---

## 9. Analisis Risiko Awal

| No. | Risiko                                        | Probabilitas | Dampak  | Mitigasi                                                  |
|-----|-----------------------------------------------|--------------|---------|-----------------------------------------------------------|
| R1  | Barcode produk tidak terbaca / rusak          | Sedang       | Sedang  | Fitur input manual barcode sebagai fallback               |
| R2  | Kegagalan sinkronisasi data antar workstation | Rendah       | Tinggi  | Mekanisme conflict resolution & retry otomatis            |
| R3  | Printer struk mengalami kerusakan             | Sedang       | Sedang  | Notifikasi error, opsi cetak ulang, log transaksi digital |
| R4  | Kasir kesulitan mengoperasikan sistem baru    | Sedang       | Sedang  | Pelatihan pengguna & UI yang sederhana/intuitif           |
| R5  | Data produk belum lengkap saat go-live        | Tinggi       | Tinggi  | Jadwalkan fase input data produk sebelum go-live          |

---

## 10. Persetujuan

| Peran                 | Nama          | Tanda Tangan | Tanggal |
|-----------------------|---------------|--------------|---------|
| Pemilik MikoMart      |               |              |         |
| Project Manager       |               |              |         |
| Lead Developer        |               |              |         |

---

> **Dokumen ini berstatus DRAFT dan memerlukan persetujuan dari seluruh pemangku kepentingan sebelum proyek memasuki fase berikutnya.**

---

## Glosarium

| Istilah    | Definisi                                                                         |
|------------|----------------------------------------------------------------------------------|
| **POS**    | Point of Sale — sistem untuk memproses transaksi penjualan di titik kasir        |
| **PPN**    | Pajak Pertambahan Nilai — pajak konsumsi sebesar 11% atas barang/jasa            |
| **PKP**    | Pengusaha Kena Pajak — wajib pajak yang telah dikukuhkan untuk memungut PPN      |
| **CRUD**   | Create, Read, Update, Delete — operasi dasar pengelolaan data                    |
| **LAN**    | Local Area Network — jaringan komputer lokal                                     |
| **SQLite** | Sistem manajemen database relasional berbasis file (tanpa server terpisah)        |
| **UAT**    | User Acceptance Testing — pengujian penerimaan oleh pengguna akhir               |
| **EAN-13** | European Article Number — standar barcode internasional 13 digit                  |

---

## Referensi

1. IEEE Std 830-1998 — IEEE Recommended Practice for Software Requirements Specifications
2. ISO/IEC 12207:2017 — Systems and Software Engineering — Software Life Cycle Processes
3. Undang-Undang No. 42 Tahun 2009 tentang Pajak Pertambahan Nilai
4. PMK No. 131 Tahun 2024 tentang Tarif PPN 12%
