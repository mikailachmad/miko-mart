# 🛒 MikoMart POS System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-Production_Ready-success.svg)
![Tech Stack](https://img.shields.io/badge/tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange.svg)
![Storage](https://img.shields.io/badge/storage-IndexedDB-yellow.svg)

**MikoMart POS** adalah sistem *Point of Sale* (kasir) berbasis web (*web-native*) yang dirancang dengan arsitektur **Offline-First**. Sistem ini dikembangkan sebagai pemenuhan Tugas Akhir/Proyek pada mata kuliah **Metode Rekayasa Perangkat Lunak**, dengan berpedoman pada standar industri perangkat lunak seperti **IEEE 830** (untuk spesifikasi kebutuhan) dan standar desain kualitas lainnya.

Aplikasi ini dibangun murni menggunakan teknologi web standar (HTML, CSS, JavaScript Vanilla) tanpa bergantung pada *framework* eksternal yang berat, serta memanfaatkan **IndexedDB** untuk persistensi data lokal, sehingga kasir dapat tetap beroperasi 100% meskipun koneksi internet terputus.

---

## ✨ Fitur Utama

- 🔌 **Offline-First Architecture**: Seluruh fungsionalitas utama (transaksi, perhitungan, manajemen data) berjalan secara lokal.
- 🔐 **Role-Based Access Control (RBAC)**: Pemisahan hak akses yang jelas antara **Admin**, **Supervisor**, dan **Kasir**.
- 📦 **Manajemen Produk & Inventori**: Fitur CRUD lengkap untuk mengelola katalog produk.
- 🛒 **Modul Transaksi (Kasir)**: Mendukung *barcode scanning* (EAN-13), perhitungan subtotal *real-time*, dan manajemen keranjang belanja.
- 🧾 **Kalkulasi Pajak & Struk**: Perhitungan PPN (11%) otomatis dan pembuatan struk digital (mendukung pencetakan thermal/PDF).
- 🎨 **Modern UI/UX**: Antarmuka responsif dengan desain estetika *Dark Theme* dan efek *Glassmorphism* yang elegan.
- 📊 **Laporan Terintegrasi**: Visualisasi data penjualan untuk mendukung pengambilan keputusan.

---

## 🚀 Cara Menjalankan Secara Lokal

Karena proyek ini adalah *Pure Web App*, Anda tidak perlu menginstal *dependencies* yang rumit seperti Node.js. Anda hanya perlu sebuah *web server* statis lokal.

### Prasyarat
- Komputer dengan sistem operasi Windows/macOS/Linux.
- Web Browser modern (Chrome, Edge, Firefox, atau Safari).
- Python (versi 3.x) sudah terinstal di sistem Anda (untuk menjalankan *local server*).

### Langkah-langkah

1. **Akses Website** melalui browser dengan membuka URL berikut:
   ```
   https://miko-mart.netlify.app
   ```

### 🔑 Akun Default untuk Testing (Seed Data)
Aplikasi sudah dilengkapi dengan *seed data*. Gunakan kredensial berikut untuk *login*:

| Role       | Username   | Password   | Deskripsi Akses                             |
|------------|------------|------------|---------------------------------------------|
| **Admin**  | `admin`    | `admin123` | Akses penuh (Manajemen Produk, Laporan, POS)|
| **Super**  | `super`    | `super123` | Akses Laporan Penjualan & Dashboard         |
| **Kasir**  | `kasir1`   | `kasir123` | Akses Modul Transaksi & Cetak Struk         |

---

## 📂 Struktur Direktori Proyek

Proyek ini tidak hanya berisi *source code*, tetapi juga dokumen rekayasa perangkat lunak yang ekstensif.

```text
📦 Metode Rekayasa Perangkat Lunak
├── 📁 mikomart-pos/           # 💻 Direktori Utama Source Code Aplikasi
│   ├── 📁 css/                # File styling (desain UI/UX)
│   ├── 📁 js/                 # File logika aplikasi (Vanilla JS, Revealing Module Pattern)
│   ├── 📁 database/           # Skrip inisialisasi IndexedDB
│   └── index.html             # Entry point aplikasi web
├── 📁 docs/                   # 📄 Dokumentasi proses pembuatan MikoMart
│   ├──📄 database_design.md      # Desain ERD & Kamus Data
│   ├──📄 project_charter.md      # Project Charter (Fase Inisiasi)
│   ├──📄 prd_pos_mikomart.md     # Product Requirements Document (PRD)
│   ├──📄 srs_pos_mikomart.md     # Software Requirements Specification (IEEE 830)
│   ├──📄 ui_ux_design.md         # Wireframe, Flowchart, dan Panduan Desain Antarmuka
│   ├──📄 uat_script.md           # Skenario Pengujian (User Acceptance Testing)
│   ├──📄 deployment_runbook.md   # Prosedur Deployment & Rollback
│   ├──📄 laporan_akademik_pos_mikomart.md # Laporan Akhir Proyek Akademik
```

---

## 🛠 Teknologi & Standar yang Digunakan

*   **Frontend**: HTML5, CSS3 (Custom Variables, Flexbox/Grid), JavaScript (ES6+).
*   **Database**: IndexedDB (Native Browser Storage).
*   **Arsitektur Kode**: *Revealing Module Pattern* untuk modularitas (*Auth*, *DB*, *App*).
*   **Standar Dokumentasi**: IEEE 830 (SRS), ISO/IEC 25010 (Kualitas Sistem).
*   **Diagraming**: Terintegrasi menggunakan sintaks **Mermaid** untuk rendering ERD, Use Case, Flowchart, dan Sequence Diagram.

---

## 📝 Lisensi
Proyek ini dikembangkan untuk keperluan akademik dan edukasi. Silakan merujuk pada kebijakan universitas terkait hak cipta atau gunakan untuk referensi pembelajaran rekayasa perangkat lunak.

---
*Dibuat sebagai bagian dari proyek akhir Metode Rekayasa Perangkat Lunak.*
