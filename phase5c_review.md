# CODE REVIEW & TECH DEBT REGISTER
## MikoMart POS — Fase 5C

---

| Field | Detail |
|---|---|
| **Nomor Dokumen** | MikoMart-IMPL-2026-003 |
| **Review Basis** | OWASP Top 10 (2021) · Prinsip SOLID |
| **Modul Diulas** | Fase 5B: ProductService, TransactionService, Middleware, Controllers |
| **Reviewer** | QA Lead + Lead Developer |
| **Tanggal** | 17 April 2026 |

---

## 1. CODE REVIEW — OWASP TOP 10 (2021)

### A01 — Broken Access Control

| Item | Temuan | Status |
|---|---|---|
| RBAC per endpoint | ✅ `RbacMiddleware` menerapkan role check sebelum controller dieksekusi | PASS |
| Object-level auth (IDOR) | ✅ Kasir hanya bisa akses transaksi milik sendiri via `cashier_id === $user->id` | PASS |
| IDOR logging | ✅ Percobaan IDOR dicatat via `LogService::security('IDOR_ATTEMPT_TRANSACTION')` | PASS |
| Void self-approval | ✅ Service layer dapat menambahkan validasi; perlu tambahkan check di `VoidService::approve()` | ⚠ PARTIAL |
| Audit log immutability | ✅ Tabel `audit_logs` tidak memiliki method `update/delete` di service | PASS |

**Catatan TD-001:** Validasi `void_requested_by !== $approver->id` ada di spesifikasi API tetapi belum diimplementasikan di `VoidService`. → **Tech Debt TD-001**

---

### A02 — Cryptographic Failures

| Item | Temuan | Status |
|---|---|---|
| Password hashing | ✅ Argon2id dengan memory 64MB, time cost 4 iterasi | PASS |
| JWT secret | ✅ Diambil dari `.env` (JWT_SECRET); tidak hardcoded | PASS |
| Webhook HMAC | ✅ HMAC-SHA512 dengan `hash_equals()` (timing-safe) | PASS |
| SQLite encryption | ✅ Konfigurasi SQLCipher via `SQLITE_ENCRYPTION_KEY` (.env) | PASS |
| Token di response | ✅ Token JWT dikembalikan di body — perlu evaluasi apakah lebih aman via HttpOnly cookie | ⚠ Noted |
| HTTPS enforcement | ✅ `URL::forceScheme('https')` di non-local environment | PASS |

**Catatan:** JWT sebaiknya dipindahkan ke HttpOnly Cookie untuk eliminasi risiko XSS. → **Tech Debt TD-002**

---

### A03 — Injection

| Item | Temuan | Status |
|---|---|---|
| SQL Injection | ✅ 100% menggunakan Eloquent ORM + Query Builder dengan prepared statements | PASS |
| Contoh safe query | ✅ `Product::where('name', 'LIKE', "%{$search}%")` — Eloquent binding | PASS |
| Raw SQL | ✅ Tidak ada `DB::statement()` atau `DB::select("... {$var} ...")` di codebase | PASS |
| Input sanitasi | ✅ FormRequest validation sebelum data masuk ke service | PASS |
| SKU regex | ✅ `/^[A-Z0-9\-_]+$/i` — membatasi karakter berbahaya di SKU | PASS |
| XSS output | ⚠ Laravel Blade auto-escape, tapi API response adalah JSON — client harus escape saat render | NOTED |

**Catatan:** Perlu enforced Content Security Policy di frontend untuk mencegah XSS. → **Tech Debt TD-003**

---

### A04 — Insecure Design

| Item | Temuan | Status |
|---|---|---|
| Race condition stok | ✅ `lockForUpdate()` mencegah overselling saat concurrent request | PASS |
| Idempotency | ✅ `IdempotencyMiddleware` mencegah duplikasi transaksi via Redis | PASS |
| Kalkulasi server-side | ✅ Grand total selalu dihitung di server; nilai dari client diabaikan | PASS |
| Floor price check | ✅ Validasi `price_override >= price_buy` ada di FormRequest DAN service (defense in depth) | PASS |
| Offline-to-online sync | ⚠ Conflict resolution ada di spesifikasi tapi `SyncService` belum diimplementasikan | NOTED |

**Catatan:** `SyncService` dan `ConflictResolutionService` belum dibuat. → **Tech Debt TD-004**

---

### A05 — Security Misconfiguration

| Item | Temuan | Status |
|---|---|---|
| Security headers | ✅ `SecurityHeadersMiddleware` menambahkan CSP, X-Frame-Options, HSTS, dll | PASS |
| APP_DEBUG | ✅ Stack trace disembunyikan di production via `ApiExceptionHandler` | PASS |
| .env di gitignore | ✅ Semua file `.env.*` dikecualikan kecuali `.env.example` | PASS |
| Server header | ✅ `Server` dan `X-Powered-By` dihapus dari response | PASS |
| Error message | ✅ Error message ke user bersifat generic; detail hanya di log | PASS |
| Default credential | ✅ Tidak ada default password di kode; semuanya via .env | PASS |

---

### A07 — Identification & Authentication Failures

| Item | Temuan | Status |
|---|---|---|
| Account lockout | ✅ Konfigurasi di throttle login; lockout setelah 5× gagal | PASS |
| Inactivity timeout | ✅ `ActivityTimeoutMiddleware` dengan JWT_INACTIVITY_TIMEOUT | PASS |
| Logout invalidasi token | ✅ Token di-invalidate di server saat logout (token blacklist via Redis) | PASS |
| Strong password policy | ⚠ `UserCreateRequest` belum memiliki aturan password kuat (min uppercase, angka, simbol) | ⚠ PARTIAL |

**Catatan:** Password validation perlu ditambahkan aturan kompleksitas. → **Tech Debt TD-005**

---

### A09 — Security Logging & Monitoring Failures

| Item | Temuan | Status |
|---|---|---|
| Audit log semua aksi sensitif | ✅ `TRANSACTION_COMPLETED`, `PRICE_OVERRIDE_APPLIED`, `DISCOUNT_APPLIED`, `PRODUCT_CREATED`, dll | PASS |
| Security event logging | ✅ `UNAUTHORIZED_ACCESS_ATTEMPT`, `IDOR_ATTEMPT_TRANSACTION`, `WEBHOOK_SIGNATURE_INVALID` | PASS |
| PII di log | ✅ `JsonFormatter::sanitize()` mereduksi field sensitif sebelum ditulis | PASS |
| Log tampering | ⚠ File audit log belum dikonfigurasi immutable (chattr +a) di server | ⚠ Noted |
| Log centralization | ⚠ Belum ada konfigurasi untuk mengirim log ke SIEM terpusat | ⚠ Noted |

**Catatan:** Log rotation dan immutability perlu dikonfigurasi di level OS. → **Tech Debt TD-006**

---

### A10 — Server-Side Request Forgery (SSRF)

| Item | Temuan | Status |
|---|---|---|
| Payment gateway URL | ✅ URL Midtrans di-hardcode di config (bukan dari user input) | PASS |
| Health check ping | ✅ URL payment gateway di health check dari config, bukan request | PASS |
| Webhook callback | ✅ Webhook HANYA menerima dari Midtrans (IP whitelist + HMAC verifikasi) | PASS |

---

## 2. CODE REVIEW — SOLID PRINCIPLES

### S — Single Responsibility Principle (SRP)

| Kelas | Tanggung Jawab | Status |
|---|---|---|
| `ProductController` | HTTP request/response saja; tidak ada business logic | ✅ PASS |
| `ProductService` | Hanya logika bisnis produk (CRUD + audit) | ✅ PASS |
| `TransactionService` | Hanya logika pembuatan transaksi dan kalkulasi | ✅ PASS |
| `AuditLogService` | Hanya menyimpan audit log | ✅ PASS |
| `LogService` | Hanya mengelola structured logging | ✅ PASS |
| `RbacMiddleware` | Hanya mengevaluasi RBAC | ✅ PASS |
| `JsonFormatter` | Hanya memformat log ke JSON + sanitasi | ✅ PASS |

**Penilaian:** Arsitektur sudah mengikuti SRP dengan baik. Thin controller dan layered service. ✅

---

### O — Open/Closed Principle (OCP)

| Aspek | Penilaian |
|---|---|
| Menambah payment method baru | `TransactionService::createTransaction()` menerima `payment_method` via data array — bisa ditambah method baru tanpa ubah signature |
| Menambah validasi baru | `FormRequest::withValidator()` mudah ditambah rule baru zonder ubah kelas lain |
| Menambah jenis laporan | `ReportController` belum ada; jika dibangun harus extend interface, bukan modify service yang ada |
| Menambah role baru | `RbacMiddleware` menerima variadic roles — tambah role baru di route tanpa ubah middleware |

**Penilaian:** OCP terpenuhi untuk komponen utama. ✅

---

### L — Liskov Substitution Principle (LSP)

| Aspek | Penilaian |
|---|---|
| `InsufficientStockException` | Bisa digunakan di mana `RuntimeException` diharapkan | ✅ |
| `Argon2IdHasher extends ArgonHasher` | Subtipe tidak mengubah interface yang ada | ✅ |
| `JsonFormatter extends MonologJsonFormatter` | Override `format()` tanpa mengubah kontrak | ✅ |

**Penilaian:** LSP terpenuhi. ✅

---

### I — Interface Segregation Principle (ISP)

| Aspek | Penilaian |
|---|---|
| `LogService` | 4 method fokus (info, warning, error, audit, security) — tidak paksa implementor method tidak perlu | ✅ |
| `AuditLogService` | Satu method `log()` dengan parameter opsional | ✅ |
| `ProductService` | Method terpecah per use case (create, update, delete, getPaginated) | ✅ |
| Catatan: | Belum ada interface/contract PHP definition untuk service — hanya concrete class | ⚠ Noted |

**Catatan:** Sebaiknya tambahkan PHP interface untuk semua Service class. → **Tech Debt TD-007**

---

### D — Dependency Inversion Principle (DIP)

| Aspek | Penilaian |
|---|---|
| `ProductController` | Menerima `ProductService` via constructor injection — tidak membuat instance langsung | ✅ |
| `TransactionService` | Menerima `AuditLogService` dan `LogService` via constructor injection | ✅ |
| Model dependencies | Model menggunakan Eloquent ORM via abstraksi (tidak direct PDO) | ✅ |
| Catatan: | Belum ada binding interface di ServiceProvider — concrete class langsung di-inject | ⚠ Noted |

**Catatan:** Bind interface di AppServiceProvider untuk memudahkan testing dengan mock. → **Tech Debt TD-008**

---

## 3. TECH DEBT REGISTER

> **Definisi:** Tech debt adalah pekerjaan teknis yang harus diselesaikan di iterasi mendatang. Semua item wajib masuk ke backlog Sprint.

| ID | Judul | Deskripsi | Kategori | Severity | Effort | Target Sprint |
|---|---|---|---|---|---|---|
| **TD-001** | Void Self-Approval Guard | Tambahkan validasi `void_requested_by !== approver_id` di `VoidService::approve()`. Saat ini hanya ada di API spec, belum di kode. | Security | 🔴 High | 0.5 hari | Sprint 2 |
| **TD-002** | JWT → HttpOnly Cookie | Pindahkan JWT dari response body ke HttpOnly Cookie untuk eliminasi risiko XSS token theft. Perlu perubahan di Auth middleware dan frontend. | Security | 🟠 Medium | 2 hari | Sprint 3 |
| **TD-003** | Frontend CSP & XSS | Konfigurasi Content Security Policy di frontend React yang diperkuat. Tambahkan DOMPurify untuk sanitasi output dinamis. | Security | 🟠 Medium | 1 hari | Sprint 3 |
| **TD-004** | SyncService Implementasi | `SyncService` dan `ConflictResolutionService` belum dibuat. Offline-to-online sync adalah fitur kritis P1 yang harus diselesaikan. | Feature | 🔴 High | 5 hari | Sprint 2 |
| **TD-005** | Password Complexity Rules | Tambahkan aturan kompleksitas password di `UserCreateRequest`: min 1 huruf besar, 1 angka, 1 simbol, min 8 karakter. Gunakan `Password::min(8)->mixedCase()->numbers()->symbols()`. | Security | 🟠 Medium | 0.5 hari | Sprint 2 |
| **TD-006** | Audit Log Immutability | Konfigurasi `chattr +a` untuk file audit.log di server (append-only). Tambahkan cron job untuk verifikasi integritas log via checksum. | Security | 🟠 Medium | 1 hari | Sprint 3 |
| **TD-007** | Service Interface Contracts | Buat PHP interface untuk semua Service class (`ProductServiceInterface`, `TransactionServiceInterface`, dll) agar mock lebih mudah di unit testing. | Maintainability | 🟡 Low | 1 hari | Sprint 4 |
| **TD-008** | DIP Binding di ServiceProvider | Daftarkan binding interface → concrete di `AppServiceProvider` untuk memenuhi DIP sepenuhnya dan memudahkan swapping implementasi. | Maintainability | 🟡 Low | 0.5 hari | Sprint 4 |
| **TD-009** | VoidService & Notifikasi | Implementasikan `VoidService` (create, approve, reject) dan WebSocket notification ke kasir via Node.js WS server. | Feature | 🔴 High | 3 hari | Sprint 2 |
| **TD-010** | ReportService & Export | Implementasikan `ReportService` dengan laporan harian, bulanan, dan ekspor pajak CSV/XLS sebagai background job (`ReportExportJob`). | Feature | 🟠 Medium | 4 hari | Sprint 3 |
| **TD-011** | Unit Test Coverage | Unit test untuk `TransactionService::calculateItems()`, `validateStockAvailability()`, dan `calculateFinancials()` belum ada. Wajib mencapai 80% coverage Gate 1. | Testing | 🔴 High | 2 hari | Sprint 2 |
| **TD-012** | Receipt PDF Generator | `GenerateReceiptJob` dan PDF template (struk) belum diimplementasikan. Thermal printer ESC/POS juga belum disiapkan. | Feature | 🟠 Medium | 3 hari | Sprint 3 |

---

## 4. RINGKASAN TEMUAN CODE REVIEW

```
OWASP Top 10 Coverage:

A01 Broken Access Control     ████████░░  PASS (1 partial → TD-001)
A02 Cryptographic Failures    █████████░  PASS (1 noted → TD-002)
A03 Injection                 ██████████  PASS ✅
A04 Insecure Design           █████████░  PASS (1 noted → TD-004)
A05 Security Misconfiguration ██████████  PASS ✅
A06 Vuln/Outdated Components  ░░░░░░░░░░  N/A (dicek di CI via composer audit)
A07 Auth Failures             █████████░  PASS (1 partial → TD-005)
A08 Software Integrity        ░░░░░░░░░░  N/A
A09 Security Logging          █████████░  PASS (1 noted → TD-006)
A10 SSRF                      ██████████  PASS ✅

SOLID Principles:
SRP ██████████  PASS ✅
OCP █████████░  PASS ✅
LSP ██████████  PASS ✅
ISP █████████░  PASS (noted → TD-007)
DIP █████████░  PASS (noted → TD-008)
```

### Distribusi Tech Debt

| Severity | Jumlah | % |
|---|---|---|
| 🔴 High (harus selesai Sprint 2) | 4 item | 33% |
| 🟠 Medium (Sprint 3) | 5 item | 42% |
| 🟡 Low (Sprint 4) | 3 item | 25% |
| **Total** | **12 item** | **100%** |

### Prioritas Tindakan Segera (Sprint 2)

```
1. [TD-001] Void Self-Approval Guard        → 0.5 hari — Security Critical
2. [TD-004] SyncService Implementasi        → 5 hari   — Feature P1
3. [TD-009] VoidService & WS Notification   → 3 hari   — Feature P1
4. [TD-011] Unit Test Coverage 80%          → 2 hari   — Gate 1 Blocker
5. [TD-005] Password Complexity             → 0.5 hari — Security Medium
```

> **Total effort Sprint 2:** ~11 hari · Dapat dikerjakan paralel oleh 2 developer

---

*Dokumen ini adalah bagian dari Fase 5C — Code Review & Tech Debt Register MikoMart POS System.*

**Nomor Dokumen:** MikoMart-IMPL-2026-003 | **Versi:** 1.0 | **Klasifikasi:** INTERNAL — CONFIDENTIAL
