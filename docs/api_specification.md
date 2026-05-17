# API SPECIFICATION
## MikoMart Point of Sale (POS) System — Fase 4B
### Standar: OpenAPI 3.0.3 | @api-spec.md

---

| Field | Detail |
|---|---|
| **Nama Sistem** | MikoMart Point of Sale (POS) System |
| **Nomor Dokumen** | MikoMart-API-2026-001 |
| **Standar** | OpenAPI Specification 3.0.3 |
| **Base URL (Production)** | `https://api.mikomart.local/api/v1` |
| **Versi API** | v1.0.0 |
| **Tanggal** | 17 April 2026 |
| **Klasifikasi** | INTERNAL — CONFIDENTIAL |

---

## 1. VERSIONING STRATEGY

### 1.1 Skema Versi

Format: **URL Versioning** — `/api/v{major}/`

```
https://api.mikomart.local/api/v1/transactions
https://api.mikomart.local/api/v2/transactions  ← Versi baru (masa depan)
```

### 1.2 Aturan Semantic Versioning per Perubahan API

| Tipe Perubahan | Dampak | Aksi |
|---|---|---|
| Tambah field baru di response | Backward-compatible ✅ | PATCH version bump (tidak butuh versi URL baru) |
| Tambah endpoint baru | Backward-compatible ✅ | MINOR version bump |
| Ubah tipe data field yang ada | Breaking ❌ | MAJOR → `/api/v2/` |
| Hapus field dari response | Breaking ❌ | MAJOR → `/api/v2/` |
| Ubah format/nama field | Breaking ❌ | MAJOR → `/api/v2/` |
| Ubah HTTP method endpoint | Breaking ❌ | MAJOR → `/api/v2/` |
| Ubah behavior (logic bisnis) | Breaking ❌ | MAJOR → `/api/v2/` |
| Perubahan validasi (lebih ketat) | Breaking ❌ | MAJOR → `/api/v2/` |

### 1.3 Backward Compatibility Rules

```
Wajib dijaga di v1 (tidak boleh melanggar):
✅ Semua field yang ada di response tetap ada
✅ Tipe data semua field tidak berubah
✅ HTTP status code per skenario tidak berubah
✅ Endpoint yang ada tidak dihapus (hanya deprecated)
✅ Request body yang tersedia tetap diterima
```

---

## 2. DEPRECATION POLICY

### 2.1 Prosedur Deprecasi Endpoint

```
1. Tandai endpoint sebagai deprecated di dokumentasi (added: x-deprecated: true)
2. Tambahkan header Sunset di semua response endpoint deprecated
3. Beri notice period minimal 3 bulan untuk patch/minor change
4. Beri notice period minimal 6 bulan untuk major change (breaking)
5. Arahkan ke endpoint pengganti via header Link
6. Hapus endpoint setelah sunset date
```

### 2.2 Header Deprecation (RFC 8594)

```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 17 Oct 2026 23:59:59 GMT
Link: </api/v2/transactions>; rel="successor-version"
Warning: 299 - "This endpoint is deprecated. Use /api/v2/transactions instead."
```

### 2.3 Multi-Version Coexistence

```
v1 (aktif)    → Terima request, kirim Deprecation header setelah v2 rilis
v2 (aktif)    → Versi baru, fully supported
v1 (sunset)   → Hapus setelah masa notice habis; return HTTP 410 Gone
```

### 2.4 Migration Guide Template

Setiap breaking change wajib disertai migration guide:

```markdown
## Migration: v1 → v2 — Transactions Endpoint

**Breaking Change:** Field `payment_method` (string) diganti menjadi
`payment_methods` (array) untuk mendukung split bill lebih eksplisit.

### v1 (Deprecated)
GET /api/v1/transactions/{id}
Response: { "payment_method": "cash" }

### v2 (Baru)
GET /api/v2/transactions/{id}
Response: { "payment_methods": ["cash"] }

### Migration Steps
1. Update client untuk membaca `payment_methods[0]` untuk single-payment
2. Perbarui filter laporan yang bergantung pada `payment_method`
3. Sunset Date: 17 Oktober 2026
```

---

## 3. SECURITY REQUIREMENTS PER ENDPOINT

### 3.1 Skema Keamanan

```yaml
securitySchemes:
  BearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
    description: |
      JWT Token dari endpoint /auth/login.
      Format: Authorization: Bearer <token>
      Expiry: 60 menit. Inactivity timeout: 30 menit.

  ApiKeyAuth:
    type: apiKey
    in: header
    name: X-API-Key
    description: |
      Digunakan untuk komunikasi server-to-server (internal service).
      Diambil dari environment variable — tidak boleh hardcoded.
```

### 3.2 Rate Limiting Headers

Semua response menyertakan header berikut:

```http
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 247
X-RateLimit-Reset: 1713312000
```

Jika limit tercapai:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
Content-Type: application/json

{ "error": "Terlalu banyak request. Coba lagi dalam 45 detik." }
```

### 3.3 Security Matrix per Endpoint

| Endpoint | Auth Required | Role yang Diizinkan | Rate Limit |
|---|---|---|---|
| `POST /auth/login` | ❌ Tidak | — | 20 req/menit per IP |
| `POST /auth/logout` | ✅ JWT | Semua role | 50 req/menit |
| `GET /auth/me` | ✅ JWT | Semua role | 100 req/menit |
| `GET /products` | ✅ JWT | Semua role | 300 req/menit |
| `POST /products` | ✅ JWT | admin | 60 req/menit |
| `PATCH /products/{id}` | ✅ JWT | admin | 60 req/menit |
| `DELETE /products/{id}` | ✅ JWT | admin | 30 req/menit |
| `GET /products/{id}/stock` | ✅ JWT | admin, supervisor, cashier | 300 req/menit |
| `POST /transactions` | ✅ JWT | cashier, admin | 120 req/menit |
| `GET /transactions` | ✅ JWT | admin, supervisor, cashier (own only) | 200 req/menit |
| `GET /transactions/{id}` | ✅ JWT | admin, supervisor, cashier (own only) | 200 req/menit |
| `GET /transactions/{id}/receipt` | ✅ JWT | admin, supervisor, cashier (own only) | 60 req/menit |
| `POST /transactions/{id}/reprint` | ✅ JWT | cashier, admin, supervisor | 30 req/menit |
| `POST /webhooks/payment` | ✅ HMAC | — (IP Whitelist) | 200 req/menit |
| `POST /voids` | ✅ JWT | cashier, admin, supervisor | 30 req/menit |
| `GET /voids` | ✅ JWT | admin, supervisor | 100 req/menit |
| `POST /voids/{id}/approve` | ✅ JWT | admin, supervisor | 30 req/menit |
| `POST /voids/{id}/reject` | ✅ JWT | admin, supervisor | 30 req/menit |
| `GET /reports/dashboard` | ✅ JWT | admin, supervisor, owner | 60 req/menit |
| `GET /reports/daily` | ✅ JWT | admin, owner | 30 req/menit |
| `POST /reports/export` | ✅ JWT | admin, owner | 10 req/menit |
| `POST /sync/push` | ✅ JWT | cashier | 60 req/menit |
| `GET /sync/status` | ✅ JWT | cashier, admin | 120 req/menit |
| `POST /sync/conflict/resolve` | ✅ JWT | cashier, admin, supervisor | 30 req/menit |
| `GET /users` | ✅ JWT | admin | 60 req/menit |
| `POST /users` | ✅ JWT | admin | 20 req/menit |
| `PATCH /users/{id}` | ✅ JWT | admin | 30 req/menit |

---

## 4. OPENAPI 3.0.3 SPECIFICATION

```yaml
openapi: "3.0.3"

info:
  title: MikoMart POS API
  version: "1.0.0"
  description: |
    REST API untuk sistem Point of Sale MikoMart.

    **Autentikasi:** Bearer JWT — diperoleh dari `POST /auth/login`.
    **Rate Limiting:** Header `X-RateLimit-*` disertakan di setiap response.
    **Versioning:** URL-based `/api/v1/`. Lihat Deprecation Policy untuk migrasi.

    **Security Notes:**
    - Semua endpoint wajib HTTPS
    - Token JWT di-invalidate saat logout atau inactivity 30 menit
    - Webhook menggunakan HMAC-SHA512; verifikasi WAJIB di sisi server

  contact:
    name: Lead Developer MikoMart
    email: dev@mikomart.internal
  license:
    name: INTERNAL USE ONLY

servers:
  - url: https://api.mikomart.local/api/v1
    description: Production Server
  - url: https://staging.mikomart.local/api/v1
    description: Staging Server (Sandbox Payment)
  - url: http://localhost:8000/api/v1
    description: Development Server

tags:
  - name: Auth
    description: Autentikasi dan manajemen sesi
  - name: Products
    description: CRUD produk dan pengecekan stok
  - name: Transactions
    description: Pembuatan dan pengelolaan transaksi POS
  - name: Payments
    description: Integrasi payment gateway dan webhook
  - name: Voids
    description: Pengajuan dan persetujuan void/retur (two-step)
  - name: Reports
    description: Laporan penjualan dan ekspor pajak
  - name: Sync
    description: Sinkronisasi data offline-online
  - name: Users
    description: Manajemen pengguna dan RBAC

# ════════════════════════════════════════════
# PATHS
# ════════════════════════════════════════════
paths:

  # ─────────────── AUTH ───────────────

  /auth/login:
    post:
      tags: [Auth]
      summary: Login pengguna
      description: |
        Autentikasi pengguna dengan username dan password.
        Mengembalikan JWT token untuk digunakan di endpoint lain.

        **Security:**
        - Rate limit: 20 req/menit per IP
        - Account lockout setelah 5x gagal (30 menit)
        - Password divalidasi menggunakan Argon2id hashing
      operationId: authLogin
      security: []  # Public endpoint
      x-rate-limit: "20/minute per IP"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
            example:
              username: kasir01
              password: "P@ssw0rd123!"
      responses:
        '200':
          description: Login berhasil
          headers:
            Set-Cookie:
              schema:
                type: string
              description: HttpOnly cookie untuk JWT (opsional)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LoginResponse'
              example:
                success: true
                data:
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  token_type: Bearer
                  expires_at: "2026-04-17T12:00:00Z"
                  user:
                    id: 3
                    username: kasir01
                    full_name: "Ahmad Kasir"
                    role: cashier
        '401':
          $ref: '#/components/responses/Unauthorized'
        '423':
          description: Akun terkunci
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                success: false
                error:
                  code: ACCOUNT_LOCKED
                  message: "Akun terkunci karena terlalu banyak percobaan gagal."
                  locked_until: "2026-04-17T10:30:00Z"
        '429':
          $ref: '#/components/responses/TooManyRequests'
        '500':
          $ref: '#/components/responses/InternalError'

  /auth/logout:
    post:
      tags: [Auth]
      summary: Logout dan invalidasi token
      operationId: authLogout
      security:
        - BearerAuth: []
      x-rbac-roles: [admin, supervisor, cashier, owner]
      x-rate-limit: "50/minute"
      responses:
        '200':
          description: Logout berhasil; token diinvalidasi di server
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessMessage'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /auth/me:
    get:
      tags: [Auth]
      summary: Ambil profil pengguna yang sedang login
      operationId: authMe
      security:
        - BearerAuth: []
      x-rbac-roles: [admin, supervisor, cashier, owner]
      x-rate-limit: "100/minute"
      responses:
        '200':
          description: Data profil pengguna
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfileResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'

  # ─────────────── PRODUCTS ───────────────

  /products:
    get:
      tags: [Products]
      summary: Daftar produk (dengan pencarian & filter)
      operationId: productsList
      security:
        - BearerAuth: []
      x-rbac-roles: [admin, supervisor, cashier, owner]
      x-rate-limit: "300/minute"
      parameters:
        - $ref: '#/components/parameters/SearchQuery'
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
        - name: category_id
          in: query
          schema: { type: integer }
          description: Filter berdasarkan kategori
        - name: low_stock
          in: query
          schema: { type: boolean }
          description: Jika true, tampilkan hanya produk dengan stok ≤ minimum
      responses:
        '200':
          description: Daftar produk berhasil diambil
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductListResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/TooManyRequests'

    post:
      tags: [Products]
      summary: Tambah produk baru
      description: |
        **RBAC:** Hanya `admin` yang dapat menambah produk.
        Setiap pembuatan produk dicatat di audit_logs.
      operationId: productsCreate
      security:
        - BearerAuth: []
      x-rbac-roles: [admin]
      x-rate-limit: "60/minute"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProductCreateRequest'
            example:
              name: "Mie Goreng Sedap"
              sku: "MGS-001"
              category_id: 2
              price_sell: 3500
              price_buy: 2500
              stock_current: 100
              stock_minimum: 20
              unit: pcs
      responses:
        '201':
          description: Produk berhasil dibuat
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '422':
          $ref: '#/components/responses/ValidationError'

  /products/{id}:
    patch:
      tags: [Products]
      summary: Update produk (harga, stok, status)
      description: |
        **RBAC:** Hanya `admin` yang dapat mengubah data produk termasuk harga.
        `supervisor` hanya dapat melihat, tidak dapat mengubah.
        Setiap perubahan harga dicatat di audit_logs (`PRODUCT_PRICE_UPDATED`).
      operationId: productsUpdate
      security:
        - BearerAuth: []
      x-rbac-roles: [admin]
      x-rate-limit: "60/minute"
      parameters:
        - $ref: '#/components/parameters/ResourceId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProductUpdateRequest'
      responses:
        '200':
          description: Produk berhasil diupdate
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'
        '422':
          $ref: '#/components/responses/ValidationError'

    delete:
      tags: [Products]
      summary: Soft-delete produk
      operationId: productsDelete
      security:
        - BearerAuth: []
      x-rbac-roles: [admin]
      x-rate-limit: "30/minute"
      parameters:
        - $ref: '#/components/parameters/ResourceId'
      responses:
        '200':
          description: Produk berhasil dinonaktifkan (soft delete)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessMessage'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'

  # ─────────────── TRANSACTIONS ───────────────

  /transactions:
    post:
      tags: [Transactions]
      summary: Buat transaksi baru
      description: |
        **RBAC:** `cashier` dan `admin`.
        **Validasi Server:**
        - Semua `discount_percent` wajib ≤ 30%
        - `price_override` tidak boleh < `price_buy` (floor price)
        - Stok divalidasi real-time sebelum transaksi disimpan
        - `grand_total` dihitung ulang di server; nilai dari client diabaikan

        **Offline Mode:** Jika `is_offline_transaction: true`, transaksi
        disimpan lokal dan disync kemudian via `/sync/push`.
      operationId: transactionsCreate
      security:
        - BearerAuth: []
      x-rbac-roles: [cashier, admin]
      x-rate-limit: "120/minute"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TransactionCreateRequest'
            example:
              items:
                - product_id: 1
                  quantity: 3
                  discount_percent: 0
                - product_id: 5
                  quantity: 2
                  discount_percent: 20
                  price_override: null
              payment_method: cash
              cash_received: 30000
              is_offline_transaction: false
              notes: "Pelanggan membership"
      responses:
        '201':
          description: Transaksi berhasil dibuat
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TransactionResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '409':
          description: Stok tidak mencukupi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                success: false
                error:
                  code: INSUFFICIENT_STOCK
                  message: "Stok produk 'Aqua 600ml' tidak mencukupi."
                  product_id: 7
                  current_stock: 0
        '422':
          $ref: '#/components/responses/ValidationError'

    get:
      tags: [Transactions]
      summary: Daftar transaksi
      description: |
        **RBAC Object-Level:**
        - `cashier`: hanya melihat transaksi milik sendiri
        - `admin`, `supervisor`, `owner`: melihat semua transaksi
      operationId: transactionsList
      security:
        - BearerAuth: []
      x-rbac-roles: [admin, supervisor, cashier, owner]
      x-rate-limit: "200/minute"
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
        - name: date_from
          in: query
          schema: { type: string, format: date }
        - name: date_to
          in: query
          schema: { type: string, format: date }
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, completed, void_pending, voided, returned]
        - name: cashier_id
          in: query
          schema: { type: integer }
          description: Filter kasir (admin/supervisor only)
      responses:
        '200':
          description: Daftar transaksi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TransactionListResponse'

  /transactions/{id}/receipt:
    get:
      tags: [Transactions]
      summary: Dapatkan URL struk PDF
      description: |
        **RBAC Object-Level:** Kasir hanya bisa akses struk transaksi milik sendiri.
        **Security:** URL bertanda tangan (signed URL) dengan expiry 15 menit.
        NPWP toko tidak dikembalikan di JSON response — hanya ada di dalam PDF.
      operationId: getReceipt
      security:
        - BearerAuth: []
      x-rbac-roles: [admin, supervisor, cashier]
      x-rate-limit: "60/minute"
      parameters:
        - $ref: '#/components/parameters/ResourceId'
      responses:
        '200':
          description: URL struk PDF
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean, example: true }
                  data:
                    type: object
                    properties:
                      pdf_url:
                        type: string
                        example: "https://api.mikomart.local/storage/receipts/TRX-20260417-0042.pdf?sig=abc123&exp=1713223200"
                      expires_at:
                        type: string
                        format: date-time
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'

  # ─────────────── PAYMENTS & WEBHOOK ───────────────

  /payments/{transaction_id}/initiate:
    post:
      tags: [Payments]
      summary: Inisiasi pembayaran digital (QRIS/Transfer)
      description: |
        **RBAC:** `cashier`, `admin`.
        Membuat order di payment gateway (Midtrans/Xendit) dan
        mengembalikan QR code atau virtual account.
        API key gateway diambil dari environment variable — TIDAK dari request.
      operationId: paymentInitiate
      security:
        - BearerAuth: []
      x-rbac-roles: [cashier, admin]
      x-rate-limit: "60/minute"
      parameters:
        - name: transaction_id
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [method]
              properties:
                method:
                  type: string
                  enum: [qris, transfer]
      responses:
        '200':
          description: Pembayaran diinisiasi
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean }
                  data:
                    type: object
                    properties:
                      gateway_order_id: { type: string }
                      qr_code_url: { type: string, nullable: true }
                      virtual_account: { type: string, nullable: true }
                      expires_at: { type: string, format: date-time }
        '422':
          $ref: '#/components/responses/ValidationError'

  /webhooks/payment:
    post:
      tags: [Payments]
      summary: Terima webhook dari payment gateway
      description: |
        **Autentikasi:** HMAC-SHA512 signature, bukan JWT.
        **IP Whitelist:** Hanya dari IP Midtrans/Xendit yang diizinkan.
        **Idempotency:** Request dengan `gateway_transaction_id` yang sama
        hanya diproses SATU kali.

        **Verifikasi WAJIB (server-side):**
        ```
        HMAC-SHA512(server_key + order_id + status + gross_amount)
        === header X-Signature
        ```

        **Security:** Endpoint ini TIDAK memerlukan JWT.
        Diproteksi via HMAC + IP whitelist saja.
      operationId: paymentWebhook
      security: []  # No JWT — protected by HMAC + IP whitelist
      x-rate-limit: "200/minute (IP Whitelist only)"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PaymentWebhookPayload'
      responses:
        '200':
          description: Webhook diterima dan diproses
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessMessage'
        '400':
          description: HMAC signature tidak valid atau format salah
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                success: false
                error:
                  code: WEBHOOK_SIGNATURE_INVALID
                  message: "Webhook signature tidak valid."
        '409':
          description: Webhook duplikat (already processed)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessMessage'

  # ─────────────── VOIDS ───────────────

  /voids:
    post:
      tags: [Voids]
      summary: Ajukan permintaan void/retur
      description: |
        **Step 1 dari Two-Step Approval.**
        **RBAC:** `cashier`, `admin`, `supervisor` bisa mengajukan.
        Setelah pengajuan, status transaksi menjadi `void_pending`.
        Notifikasi real-time dikirim ke Supervisor/Admin via WebSocket.
        Dicatat di audit_log dengan action `TRX_VOID_REQUESTED`.
      operationId: voidCreate
      security:
        - BearerAuth: []
      x-rbac-roles: [cashier, admin, supervisor]
      x-rate-limit: "30/minute"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [transaction_id, reason]
              properties:
                transaction_id:
                  type: integer
                  description: ID transaksi yang akan di-void
                reason:
                  type: string
                  minLength: 5
                  maxLength: 500
                  description: Alasan void (wajib diisi)
            example:
              transaction_id: 39
              reason: "Barang rusak saat diterima pelanggan"
      responses:
        '201':
          description: Permintaan void berhasil diajukan
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VoidRequestResponse'
        '409':
          description: Transaksi tidak dapat di-void (status tidak valid)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                success: false
                error:
                  code: INVALID_TRANSACTION_STATUS
                  message: "Transaksi tidak dapat di-void. Status saat ini: voided"
        '422':
          $ref: '#/components/responses/ValidationError'

  /voids:
    get:
      tags: [Voids]
      summary: Daftar permintaan void pending
      description: |
        **RBAC:** `admin`, `supervisor` — untuk halaman approval queue.
      operationId: voidList
      security:
        - BearerAuth: []
      x-rbac-roles: [admin, supervisor]
      x-rate-limit: "100/minute"
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, approved, rejected]
      responses:
        '200':
          description: Daftar void request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VoidListResponse'

  /voids/{id}/approve:
    post:
      tags: [Voids]
      summary: Setujui permintaan void
      description: |
        **Step 2 dari Two-Step Approval.**
        **RBAC:** Hanya `admin` atau `supervisor`.
        **Rule:** Yang menyetujui TIDAK boleh sama dengan yang mengajukan.
        Setelah approve:
        - Stok semua item dikembalikan
        - Status transaksi menjadi `voided`
        - Audit log: `TRX_VOID_APPROVED`
        - Notifikasi ke kasir via WebSocket
      operationId: voidApprove
      security:
        - BearerAuth: []
      x-rbac-roles: [admin, supervisor]
      x-rate-limit: "30/minute"
      parameters:
        - $ref: '#/components/parameters/ResourceId'
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                notes:
                  type: string
                  maxLength: 500
                  description: Catatan approval (opsional)
      responses:
        '200':
          description: Void disetujui; stok dikembalikan
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VoidRequestResponse'
        '403':
          description: Tidak berwenang atau pengguna sama dengan yang mengajukan
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                success: false
                error:
                  code: SELF_APPROVAL_NOT_ALLOWED
                  message: "Anda tidak dapat menyetujui permintaan yang Anda ajukan sendiri."

  /voids/{id}/reject:
    post:
      tags: [Voids]
      summary: Tolak permintaan void
      description: |
        **RBAC:** `admin`, `supervisor`.
        Status transaksi kembali ke `completed`.
        Audit log: `TRX_VOID_REJECTED`.
        Notifikasi penolakan ke kasir via WebSocket.
      operationId: voidReject
      security:
        - BearerAuth: []
      x-rbac-roles: [admin, supervisor]
      x-rate-limit: "30/minute"
      parameters:
        - $ref: '#/components/parameters/ResourceId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [rejection_reason]
              properties:
                rejection_reason:
                  type: string
                  minLength: 5
                  maxLength: 500
      responses:
        '200':
          description: Void ditolak; transaksi dikembalikan ke completed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VoidRequestResponse'
        '403':
          $ref: '#/components/responses/Forbidden'

  # ─────────────── REPORTS ───────────────

  /reports/dashboard:
    get:
      tags: [Reports]
      summary: Data dashboard ringkasan (hari ini)
      description: |
        **RBAC:** `admin`, `supervisor`, `owner`.
        Mengembalikan KPI hari ini: total transaksi, pendapatan,
        produk stok rendah, void pending.
      operationId: reportsDashboard
      security:
        - BearerAuth: []
      x-rbac-roles: [admin, supervisor, owner]
      x-rate-limit: "60/minute"
      responses:
        '200':
          description: Data dashboard
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DashboardResponse'

  /reports/daily:
    get:
      tags: [Reports]
      summary: Laporan penjualan harian
      description: |
        **RBAC:** `admin`, `owner`.
        Auditable: aksi `REPORT_DAILY_VIEWED` dicatat di audit_log.
      operationId: reportsDaily
      security:
        - BearerAuth: []
      x-rbac-roles: [admin, owner]
      x-rate-limit: "30/minute"
      parameters:
        - name: date
          in: query
          required: true
          schema: { type: string, format: date }
          example: "2026-04-17"
      responses:
        '200':
          description: Laporan harian
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DailyReportResponse'

  /reports/export:
    post:
      tags: [Reports]
      summary: Ekspor laporan pajak (CSV/XLS)
      description: |
        **RBAC:** `admin`, `owner`.
        **Security:** NPWP toko disertakan di dalam file export — tidak di JSON response.
        Ekspor besar (> 1000 baris) diproses sebagai background job.
        Audit log: `REPORT_TAX_EXPORTED`.
      operationId: reportsExport
      security:
        - BearerAuth: []
      x-rbac-roles: [admin, owner]
      x-rate-limit: "10/minute"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [date_from, date_to, format]
              properties:
                date_from: { type: string, format: date }
                date_to: { type: string, format: date }
                format:
                  type: string
                  enum: [csv, xlsx]
      responses:
        '200':
          description: File siap diunduh atau job dibuat
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean }
                  data:
                    type: object
                    properties:
                      download_url: { type: string, nullable: true }
                      job_id: { type: string, nullable: true }
                      status:
                        type: string
                        enum: [ready, processing]

  # ─────────────── SYNC ───────────────

  /sync/push:
    post:
      tags: [Sync]
      summary: Push data offline ke server
      description: |
        **RBAC:** `cashier`.
        Menerima batch data transaksi yang dibuat saat offline.
        Server memvalidasi, mendeteksi konflik, dan menyimpan ke MySQL.
        Konflik akan mengembalikan status `conflict` dan mengisi conflict_logs.
      operationId: syncPush
      security:
        - BearerAuth: []
      x-rbac-roles: [cashier]
      x-rate-limit: "60/minute"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [device_id, payload]
              properties:
                device_id: { type: string }
                payload:
                  type: array
                  items:
                    $ref: '#/components/schemas/SyncPayloadItem'
                  maxItems: 50
      responses:
        '200':
          description: Sync diproses
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean }
                  data:
                    type: object
                    properties:
                      synced: { type: integer, description: "Jumlah record berhasil sync" }
                      conflicts:
                        type: array
                        items:
                          $ref: '#/components/schemas/ConflictItem'
        '422':
          $ref: '#/components/responses/ValidationError'

  /sync/conflict/resolve:
    post:
      tags: [Sync]
      summary: Resolusi konflik sinkronisasi
      description: |
        **RBAC:** `cashier` (yang mengajukan), `admin`, `supervisor`.
        Kasir memilih resolusi: `local_wins`, `server_wins`, atau `manual_merge`.
        Supervisor/Admin mendapat notifikasi untuk oversight.
      operationId: syncConflictResolve
      security:
        - BearerAuth: []
      x-rbac-roles: [cashier, admin, supervisor]
      x-rate-limit: "30/minute"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [conflict_log_id, resolution]
              properties:
                conflict_log_id: { type: integer }
                resolution:
                  type: string
                  enum: [local_wins, server_wins, manual_merge]
                merged_value:
                  type: object
                  nullable: true
                  description: Wajib diisi jika resolution = manual_merge
      responses:
        '200':
          description: Konflik berhasil diselesaikan
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessMessage'

  # ─────────────── USERS ───────────────

  /users:
    get:
      tags: [Users]
      summary: Daftar pengguna
      description: |
        **RBAC:** Hanya `admin`.
        Response TIDAK menyertakan `password_hash`.
      operationId: usersList
      security:
        - BearerAuth: []
      x-rbac-roles: [admin]
      x-rate-limit: "60/minute"
      parameters:
        - name: role
          in: query
          schema:
            type: string
            enum: [admin, supervisor, cashier, owner]
      responses:
        '200':
          description: Daftar pengguna
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserListResponse'

    post:
      tags: [Users]
      summary: Buat akun pengguna baru
      description: |
        **RBAC:** Hanya `admin`.
        Password di-hash menggunakan Argon2id.
        Audit log: `USER_CREATED`.
      operationId: usersCreate
      security:
        - BearerAuth: []
      x-rbac-roles: [admin]
      x-rate-limit: "20/minute"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCreateRequest'
      responses:
        '201':
          description: Pengguna berhasil dibuat
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '422':
          $ref: '#/components/responses/ValidationError'

# ════════════════════════════════════════════
# COMPONENTS
# ════════════════════════════════════════════
components:

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

  parameters:
    ResourceId:
      name: id
      in: path
      required: true
      schema: { type: integer, minimum: 1 }
    SearchQuery:
      name: search
      in: query
      schema: { type: string, maxLength: 100 }
      description: Cari berdasarkan nama/SKU
    PageParam:
      name: page
      in: query
      schema: { type: integer, minimum: 1, default: 1 }
    LimitParam:
      name: limit
      in: query
      schema: { type: integer, minimum: 1, maximum: 50, default: 20 }

  schemas:
    # ─── Auth ───
    LoginRequest:
      type: object
      required: [username, password]
      properties:
        username:
          type: string
          minLength: 3
          maxLength: 50
          pattern: '^[a-z0-9_]+$'
          description: Hanya lowercase alphanumeric dan underscore
        password:
          type: string
          minLength: 8
          maxLength: 128
          description: "Min 8 karakter; tidak di-log manapun"

    LoginResponse:
      type: object
      properties:
        success: { type: boolean }
        data:
          type: object
          properties:
            token: { type: string }
            token_type: { type: string, example: Bearer }
            expires_at: { type: string, format: date-time }
            user:
              $ref: '#/components/schemas/UserProfile'

    UserProfile:
      type: object
      properties:
        id: { type: integer }
        username: { type: string }
        full_name: { type: string }
        role:
          type: string
          enum: [admin, supervisor, cashier, owner]
        device_id: { type: string, nullable: true }

    UserProfileResponse:
      type: object
      properties:
        success: { type: boolean }
        data:
          $ref: '#/components/schemas/UserProfile'

    # ─── Product ───
    Product:
      type: object
      properties:
        id: { type: integer }
        name: { type: string }
        sku: { type: string }
        category_id: { type: integer }
        price_sell: { type: number, format: decimal }
        stock_current: { type: integer }
        stock_minimum: { type: integer }
        unit: { type: string }
        is_active: { type: boolean }
        is_low_stock: { type: boolean, description: "true jika stock_current <= stock_minimum" }

    ProductCreateRequest:
      type: object
      required: [name, sku, category_id, price_sell, price_buy, unit]
      properties:
        name: { type: string, maxLength: 200 }
        sku: { type: string, maxLength: 50 }
        category_id: { type: integer }
        price_sell:
          type: number
          minimum: 0.01
          description: Harus lebih besar dari price_buy
        price_buy:
          type: number
          minimum: 0
        stock_current: { type: integer, minimum: 0, default: 0 }
        stock_minimum: { type: integer, minimum: 0, default: 5 }
        unit:
          type: string
          enum: [pcs, kg, liter, box, pack, lusin]

    ProductUpdateRequest:
      type: object
      properties:
        name: { type: string, maxLength: 200 }
        price_sell: { type: number, minimum: 0.01 }
        stock_minimum: { type: integer, minimum: 0 }
        is_active: { type: boolean }

    ProductResponse:
      type: object
      properties:
        success: { type: boolean }
        data:
          $ref: '#/components/schemas/Product'

    ProductListResponse:
      type: object
      properties:
        success: { type: boolean }
        data:
          type: array
          items:
            $ref: '#/components/schemas/Product'
        meta:
          $ref: '#/components/schemas/PaginationMeta'

    # ─── Transaction ───
    TransactionItem:
      type: object
      required: [product_id, quantity]
      properties:
        product_id: { type: integer }
        quantity: { type: integer, minimum: 1 }
        discount_percent:
          type: integer
          minimum: 0
          maximum: 30
          default: 0
          description: "Server akan menolak jika > 30"
        price_override:
          type: number
          nullable: true
          description: "Override harga; harus > price_buy. Dicatat di audit log."

    TransactionCreateRequest:
      type: object
      required: [items, payment_method]
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/TransactionItem'
          minItems: 1
        payment_method:
          type: string
          enum: [cash, qris, transfer, split]
        cash_received:
          type: number
          nullable: true
          description: "Wajib jika payment_method = cash"
        split_payments:
          type: array
          nullable: true
          description: "Wajib jika payment_method = split"
          items:
            type: object
            properties:
              method: { type: string, enum: [cash, qris, transfer] }
              amount: { type: number }
        is_offline_transaction: { type: boolean, default: false }
        notes: { type: string, maxLength: 500, nullable: true }

    Transaction:
      type: object
      properties:
        id: { type: integer }
        transaction_number: { type: string, example: "TRX-20260417-0042" }
        cashier_id: { type: integer }
        status:
          type: string
          enum: [pending, completed, void_pending, voided, returned]
        subtotal: { type: number }
        discount_amount: { type: number }
        tax_amount: { type: number }
        grand_total: { type: number }
        payment_method: { type: string }
        cash_received: { type: number, nullable: true }
        change_amount: { type: number, nullable: true }
        sync_status:
          type: string
          enum: [synced, pending, conflict]
        items:
          type: array
          items:
            type: object
        created_at: { type: string, format: date-time }

    TransactionResponse:
      type: object
      properties:
        success: { type: boolean }
        data:
          $ref: '#/components/schemas/Transaction'

    TransactionListResponse:
      type: object
      properties:
        success: { type: boolean }
        data:
          type: array
          items:
            $ref: '#/components/schemas/Transaction'
        meta:
          $ref: '#/components/schemas/PaginationMeta'

    # ─── Payment Webhook ───
    PaymentWebhookPayload:
      type: object
      required: [order_id, transaction_status, gross_amount, signature_key]
      properties:
        order_id: { type: string }
        transaction_id: { type: string }
        transaction_status:
          type: string
          enum: [capture, settlement, pending, deny, cancel, expire, failure]
        gross_amount: { type: string }
        payment_type: { type: string }
        signature_key:
          type: string
          description: "HMAC-SHA512 dari server_key + order_id + status + gross_amount"
        fraud_status: { type: string, nullable: true }

    # ─── Void ───
    VoidRequest:
      type: object
      properties:
        id: { type: integer }
        transaction_id: { type: integer }
        transaction_number: { type: string }
        requested_by: { type: integer }
        approved_by: { type: integer, nullable: true }
        status:
          type: string
          enum: [pending, approved, rejected]
        reason: { type: string }
        rejection_reason: { type: string, nullable: true }
        created_at: { type: string, format: date-time }

    VoidRequestResponse:
      type: object
      properties:
        success: { type: boolean }
        data:
          $ref: '#/components/schemas/VoidRequest'

    VoidListResponse:
      type: object
      properties:
        success: { type: boolean }
        data:
          type: array
          items:
            $ref: '#/components/schemas/VoidRequest'

    # ─── Reports ───
    DashboardResponse:
      type: object
      properties:
        success: { type: boolean }
        data:
          type: object
          properties:
            today_transactions: { type: integer }
            today_revenue: { type: number }
            low_stock_count: { type: integer }
            void_pending_count: { type: integer }
            active_cashiers: { type: integer }

    DailyReportResponse:
      type: object
      properties:
        success: { type: boolean }
        data:
          type: object
          properties:
            date: { type: string, format: date }
            total_transactions: { type: integer }
            total_revenue: { type: number }
            total_discount: { type: number }
            total_tax: { type: number }
            payment_breakdown:
              type: object
              properties:
                cash: { type: number }
                qris: { type: number }
                transfer: { type: number }
                split: { type: number }

    # ─── Sync ───
    SyncPayloadItem:
      type: object
      required: [resource_type, resource_id, payload, created_at_local]
      properties:
        resource_type:
          type: string
          enum: [transaction, stock_adjustment]
        resource_id: { type: integer }
        payload: { type: object }
        created_at_local: { type: string, format: date-time }

    ConflictItem:
      type: object
      properties:
        conflict_log_id: { type: integer }
        resource_type: { type: string }
        resource_id: { type: integer }
        value_local: { type: object }
        value_server: { type: object }

    # ─── Users ───
    UserCreateRequest:
      type: object
      required: [full_name, username, password, role_id]
      properties:
        full_name: { type: string, maxLength: 100 }
        username:
          type: string
          minLength: 3
          maxLength: 50
          pattern: '^[a-z0-9_]+$'
        password:
          type: string
          minLength: 8
          description: Akan di-hash Argon2id; tidak disimpan plaintext
        role_id: { type: integer }
        device_id: { type: string, nullable: true }

    UserResponse:
      type: object
      properties:
        success: { type: boolean }
        data:
          $ref: '#/components/schemas/UserProfile'

    UserListResponse:
      type: object
      properties:
        success: { type: boolean }
        data:
          type: array
          items:
            $ref: '#/components/schemas/UserProfile'

    # ─── Common ───
    SuccessMessage:
      type: object
      properties:
        success: { type: boolean, example: true }
        message: { type: string }

    ErrorResponse:
      type: object
      properties:
        success: { type: boolean, example: false }
        error:
          type: object
          properties:
            code: { type: string, description: "SCREAMING_SNAKE_CASE error code" }
            message: { type: string, description: "Pesan error yang aman untuk ditampilkan ke user" }

    ValidationErrorResponse:
      type: object
      properties:
        success: { type: boolean, example: false }
        error:
          type: object
          properties:
            code: { type: string, example: VALIDATION_ERROR }
            message: { type: string }
            errors:
              type: object
              additionalProperties:
                type: array
                items: { type: string }
              example:
                discount_percent: ["Diskon tidak boleh melebihi 30%"]
                price_sell: ["Harga jual harus lebih besar dari harga beli"]

    PaginationMeta:
      type: object
      properties:
        current_page: { type: integer }
        per_page: { type: integer }
        total: { type: integer }
        last_page: { type: integer }
        next_cursor: { type: string, nullable: true }

  responses:
    Unauthorized:
      description: Token tidak valid, expired, atau tidak disertakan
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            success: false
            error:
              code: UNAUTHORIZED
              message: "Token tidak valid atau sudah kadaluarsa. Silakan login kembali."

    Forbidden:
      description: Akses ditolak — role tidak memiliki izin
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            success: false
            error:
              code: FORBIDDEN
              message: "Anda tidak memiliki izin untuk melakukan aksi ini."

    NotFound:
      description: Resource tidak ditemukan
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            success: false
            error:
              code: NOT_FOUND
              message: "Resource yang diminta tidak ditemukan."

    ValidationError:
      description: Validasi input gagal
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ValidationErrorResponse'

    TooManyRequests:
      description: Rate limit terlampaui
      headers:
        Retry-After:
          schema: { type: integer }
          description: Detik hingga limit reset
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            success: false
            error:
              code: RATE_LIMIT_EXCEEDED
              message: "Terlalu banyak request. Coba lagi dalam 45 detik."

    InternalError:
      description: Server error internal
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            success: false
            error:
              code: INTERNAL_SERVER_ERROR
              message: "Terjadi kesalahan pada server. Silakan coba lagi."
```

---

*Dokumen ini adalah bagian dari Fase 4B — API Specification MikoMart POS System.*

**Nomor Dokumen:** MikoMart-API-2026-001 | **Versi:** 1.0 | **Klasifikasi:** INTERNAL — CONFIDENTIAL
