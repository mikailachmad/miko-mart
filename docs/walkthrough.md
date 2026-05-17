# Walkthrough — Sistem POS MikoMart

## Ringkasan

Sistem POS MikoMart telah berhasil dibangun sebagai **Pure Web Application** (HTML/CSS/JavaScript) yang berjalan sepenuhnya di browser tanpa memerlukan instalasi server. Data disimpan secara lokal menggunakan **IndexedDB** (setara SQLite untuk browser).

## Deliverable

### 📄 Dokumentasi
| Dokumen | File | Status |
|---|---|---|
| Project Charter | `project_charter.md` | ✅ Selesai |
| PRD | `prd_pos_mikomart.md` | ✅ Selesai |
| SRS (IEEE 830) | `srs_pos_mikomart.md` | ✅ Selesai |

### 💻 Kode Sumber
| File | Fungsi | LOC |
|---|---|---|
| `index.html` | Entry point, loading, font imports | ~70 |
| `css/styles.css` | Design system, dark theme, animations | ~900 |
| `js/db.js` | IndexedDB schema, CRUD, seeder | ~300 |
| `js/auth.js` | Login, RBAC, session, idle timeout | ~170 |
| `js/pos.js` | Barcode scan, cart, payment | ~350 |
| `js/products.js` | Product CRUD, categories, pagination | ~320 |
| `js/users.js` | User CRUD, toggle status, reset password | ~200 |
| `js/reports.js` | 5 report types, KPI cards, bar chart | ~300 |
| `js/receipt.js` | Receipt HTML generation, print | ~130 |
| `js/app.js` | Main controller, routing, shortcuts | ~450 |

## Screenshot Hasil

### 1. Halaman Login
![Halaman Login MikoMart POS — dark theme dengan glassmorphism](C:/Users/Mikail%20Achmad/.gemini/antigravity/brain/e72b7dd5-7bfa-4ebd-b8bf-1043237aaeb1/login_screenshot.png)

### 2. Dashboard POS (Keranjang Kosong)
![Dashboard POS Kasir — barcode scanner, keranjang, panel pembayaran](C:/Users/Mikail%20Achmad/.gemini/antigravity/brain/e72b7dd5-7bfa-4ebd-b8bf-1043237aaeb1/dashboard_screenshot.png)

### 3. Keranjang dengan 2 Produk
![Keranjang belanja berisi Indomie Goreng dan Aqua 600ml](C:/Users/Mikail%20Achmad/.gemini/antigravity/brain/e72b7dd5-7bfa-4ebd-b8bf-1043237aaeb1/cart_screenshot.png)

## Akun Demo

| Username | Password | Peran |
|---|---|---|
| `admin` | `admin123` | Admin — Kelola produk & pengguna |
| `supervisor` | `super123` | Supervisor — Lihat laporan |
| `kasir1` | `kasir123` | Kasir Budi |
| `kasir2` | `kasir123` | Kasir Sari |
| `kasir3` | `kasir123` | Kasir Andi |
| `kasir4` | `kasir123` | Kasir Dewi |

## Cara Menjalankan

1. Buka terminal/PowerShell di folder `mikomart-pos`
2. Jalankan: `python -m http.server 8080`
3. Buka browser: `http://localhost:8080`
4. Login dengan salah satu akun demo di atas

> Atau langsung double-click `index.html` di file explorer (beberapa fitur mungkin terbatas karena kebijakan CORS browser).

## Fitur yang Terverifikasi

- ✅ Login dengan autentikasi username/password
- ✅ RBAC — kasir hanya bisa akses POS, admin hanya kelola produk/user
- ✅ Scan barcode → produk otomatis muncul dari database
- ✅ Keranjang belanja — tambah, edit qty, hapus item
- ✅ Kalkulasi otomatis: subtotal, PPN 11%, grand total
- ✅ 20 produk sampel + 8 kategori + 6 pengguna tersedia
- ✅ Keyboard shortcuts (F1/F3/F5/F8/F12/Esc)
- ✅ Dark theme premium dengan glassmorphism
- ✅ Fully offline — data tersimpan di browser (IndexedDB)
