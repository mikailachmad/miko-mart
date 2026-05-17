# Implementation Plan — Sistem POS MikoMart

## Goal

Membangun Sistem Point of Sale (POS) untuk supermarket MikoMart yang mengeliminasi kesalahan input harga manual melalui barcode scanning, mendukung operasi offline, dan menghitung PPN otomatis.

## Tech Stack

| Layer | Teknologi | Justifikasi |
|---|---|---|
| Backend API | PHP Laravel 11 | REST API, RBAC, business logic |
| Frontend | React 18 + Vite | SPA, fast UI, komponen reusable |
| Sync Service | Node.js | WebSocket sync antar workstation |
| Database | SQLite | Ringan, file-based, offline-capable |
| Styling | Vanilla CSS | Kontrol penuh, performa optimal |

## Arsitektur

```
[React Frontend] ←→ [Laravel API + SQLite] ←→ [Node.js Sync] ←→ [Workstation lain]
```

Setiap workstation menjalankan stack lengkap (Laravel + React + SQLite). Node.js sync service berjalan di server pusat untuk sinkronisasi data via LAN.

## Proposed Changes

### Phase 1: Database & Backend Foundation

#### [NEW] Database Schema (ERD)
- Tabel: `users`, `roles`, `products`, `categories`, `transactions`, `transaction_items`, `tax_configs`, `activity_logs`
- Relasi dan constraint sesuai SRS

#### [NEW] Laravel Backend (`backend/`)
- Migration files untuk semua tabel
- Model, Controller, Request validation
- API routes dengan Sanctum auth
- RBAC middleware
- Seeder untuk data awal

### Phase 2: Frontend POS

#### [NEW] React Frontend (`frontend/`)
- Halaman Login
- Halaman POS Kasir (scan, keranjang, bayar, struk)
- Dashboard Admin (produk, pengguna)
- Dashboard Supervisor (laporan)
- Komponen reusable + design system

### Phase 3: Integrasi & Fitur Lanjutan

#### [NEW] Cetak Struk
- ESC/POS format untuk thermal printer
- Preview struk di browser

#### [NEW] Sync Service (`sync-service/`)
- Node.js WebSocket server
- Sinkronisasi produk & transaksi via LAN

## Verification Plan

### Automated Tests
- `php artisan test` — unit & feature tests Laravel
- Jest — unit tests React components
- API endpoint testing via built-in test suite

### Manual Verification
- Browser testing: login flow, transaksi POS, manajemen produk
- Concurrent user simulation (4 tabs)
- Offline mode verification
