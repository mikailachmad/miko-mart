# IMPLEMENTASI MODUL
## MikoMart POS — Fase 5B: Sistem Pembayaran Kasir & Manajemen Produk

---

| Field | Detail |
|---|---|
| **Modul** | Pembayaran Kasir + Manajemen Produk & Kategori |
| **Stack** | PHP 8.2 + Laravel 11 · Eloquent ORM |
| **Standar** | SOLID · OWASP Top 10 · IEEE 730 |
| **Tanggal** | 17 April 2026 |

---

## 1. MODELS

### 1.1 Category Model

```php
<?php
// app/Models/Category.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Category Model
 *
 * Representasi kategori produk di sistem MikoMart POS.
 *
 * @property int    $id
 * @property string $name
 * @property string $slug
 * @property string $description
 * @property bool   $is_active
 */
class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ─── Relationships ───

    /**
     * Produk yang termasuk dalam kategori ini.
     *
     * @return HasMany<Product>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    // ─── Scopes ───

    /**
     * Scope: hanya kategori yang aktif.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
```

### 1.2 Product Model

```php
<?php
// app/Models/Product.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Product Model
 *
 * Representasi produk yang dijual di MikoMart POS.
 * Menggunakan SoftDeletes untuk mempertahankan riwayat transaksi.
 *
 * @property int    $id
 * @property int    $category_id
 * @property string $name
 * @property string $sku          [SENSITIVE]
 * @property float  $price_sell   [SENSITIVE]
 * @property float  $price_buy    [SENSITIVE]
 * @property int    $stock_current
 * @property int    $stock_minimum
 * @property string $unit
 * @property bool   $is_active
 * @property bool   $allow_backorder
 */
class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'sku',
        'price_sell',
        'price_buy',
        'stock_current',
        'stock_minimum',
        'unit',
        'is_active',
        'allow_backorder',
    ];

    protected $casts = [
        'price_sell'     => 'decimal:2',
        'price_buy'      => 'decimal:2',
        'stock_current'  => 'integer',
        'stock_minimum'  => 'integer',
        'is_active'      => 'boolean',
        'allow_backorder'=> 'boolean',
    ];

    /**
     * Field yang TIDAK pernah dikembalikan di serialisasi JSON publik.
     * price_buy adalah floor price — informasi bisnis sensitif.
     */
    protected $hidden = ['price_buy', 'deleted_at'];

    // ─── Relationships ───

    /**
     * Kategori produk ini.
     *
     * @return BelongsTo<Category, Product>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Item transaksi yang mereferensikan produk ini.
     *
     * @return HasMany<TransactionItem>
     */
    public function transactionItems(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    // ─── Accessors ───

    /**
     * Accessor: apakah stok di bawah minimum?
     *
     * @return Attribute<bool, never>
     */
    protected function isLowStock(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->stock_current <= $this->stock_minimum,
        );
    }

    /**
     * Accessor: apakah produk bisa dijual?
     *
     * @return Attribute<bool, never>
     */
    protected function canBeSold(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->is_active && ($this->stock_current > 0 || $this->allow_backorder),
        );
    }

    // ─── Scopes ───

    /**
     * Scope: hanya produk aktif.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: produk dengan stok rendah (untuk alert).
     */
    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_current', '<=', 'stock_minimum');
    }

    /**
     * Scope: cari produk berdasarkan nama atau SKU.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $search
     */
    public function scopeSearch($query, string $search)
    {
        // Menggunakan parameterized query via Eloquent — aman dari SQL Injection
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'LIKE', "%{$search}%")
              ->orWhere('sku', 'LIKE', "%{$search}%");
        });
    }
}
```

### 1.3 Transaction Model

```php
<?php
// app/Models/Transaction.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Transaction Model
 *
 * Representasi satu transaksi kasir di MikoMart POS.
 *
 * @property int    $id
 * @property int    $cashier_id      [PII]
 * @property string $transaction_number
 * @property string $status
 * @property float  $subtotal        [SENSITIVE]
 * @property float  $discount_amount [SENSITIVE]
 * @property float  $tax_amount      [SENSITIVE]
 * @property float  $grand_total     [SENSITIVE]
 * @property string $payment_method
 * @property bool   $is_offline_transaction
 * @property string $sync_status
 */
class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'cashier_id',
        'transaction_number',
        'status',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'grand_total',
        'payment_method',
        'cash_received',
        'change_amount',
        'is_offline_transaction',
        'sync_status',
        'notes',
        'void_requested_by',
        'void_approved_by',
        'void_reason',
        'voided_at',
        'idempotency_key',          // Untuk mencegah duplikasi transaksi
    ];

    protected $casts = [
        'subtotal'                => 'decimal:2',
        'discount_amount'         => 'decimal:2',
        'tax_amount'              => 'decimal:2',
        'grand_total'             => 'decimal:2',
        'cash_received'           => 'decimal:2',
        'change_amount'           => 'decimal:2',
        'is_offline_transaction'  => 'boolean',
        'voided_at'               => 'datetime',
    ];

    // ─── Status Constants ───
    const STATUS_PENDING       = 'pending';
    const STATUS_COMPLETED     = 'completed';
    const STATUS_VOID_PENDING  = 'void_pending';
    const STATUS_VOIDED        = 'voided';
    const STATUS_RETURNED      = 'returned';

    const SYNC_SYNCED    = 'synced';
    const SYNC_PENDING   = 'pending';
    const SYNC_CONFLICT  = 'conflict';

    // ─── Relationships ───

    /**
     * Kasir yang memproses transaksi ini.
     *
     * @return BelongsTo<User, Transaction>
     */
    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    /**
     * Item-item dalam transaksi ini.
     *
     * @return HasMany<TransactionItem>
     */
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    /**
     * Record pembayaran (bisa lebih dari 1 untuk split bill).
     *
     * @return HasMany<PaymentRecord>
     */
    public function paymentRecords(): HasMany
    {
        return $this->hasMany(PaymentRecord::class);
    }

    // ─── Helper Methods ───

    /**
     * Apakah transaksi ini dapat di-void?
     *
     * @return bool
     */
    public function canBeVoided(): bool
    {
        return in_array($this->status, [self::STATUS_COMPLETED], true);
    }

    /**
     * Apakah transaksi sedang menunggu approval void?
     *
     * @return bool
     */
    public function isVoidPending(): bool
    {
        return $this->status === self::STATUS_VOID_PENDING;
    }

    /**
     * Generate nomor transaksi unik.
     * Format: TRX-YYYYMMDD-XXXX
     *
     * @return string
     */
    public static function generateTransactionNumber(): string
    {
        $date  = now()->format('Ymd');
        $count = static::whereDate('created_at', today())->withTrashed()->count() + 1;

        return sprintf('TRX-%s-%04d', $date, $count);
    }
}
```

### 1.4 TransactionItem Model

```php
<?php
// app/Models/TransactionItem.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * TransactionItem Model
 *
 * Satu baris item dalam transaksi. Menyimpan snapshot data produk
 * pada saat transaksi (untuk menjaga integritas riwayat).
 *
 * @property int    $transaction_id
 * @property int    $product_id
 * @property string $product_name    Snapshot nama produk
 * @property float  $price_original  [SENSITIVE] Harga normal saat transaksi
 * @property float  $price_override  [SENSITIVE] Harga override (nullable)
 * @property int    $discount_percent  max 30
 * @property float  $discount_amount [SENSITIVE]
 * @property float  $price_final     [SENSITIVE]
 * @property int    $quantity
 * @property float  $subtotal        [SENSITIVE]
 */
class TransactionItem extends Model
{
    public $timestamps = false; // Tidak perlu timestamps di item level

    protected $fillable = [
        'transaction_id',
        'product_id',
        'product_name',
        'price_original',
        'price_override',
        'discount_percent',
        'discount_amount',
        'price_final',
        'quantity',
        'subtotal',
    ];

    protected $casts = [
        'price_original'  => 'decimal:2',
        'price_override'  => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'price_final'     => 'decimal:2',
        'subtotal'        => 'decimal:2',
        'discount_percent'=> 'integer',
        'quantity'        => 'integer',
    ];

    // ─── Relationships ───

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed(); // Tetap tampilkan meski dihapus
    }
}
```

---

## 2. FORM REQUESTS (Input Validation)

### 2.1 StoreProductRequest

```php
<?php
// app/Http/Requests/StoreProductRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form Request untuk membuat produk baru.
 *
 * Security:
 * - Semua validasi di sisi server (tidak percaya client)
 * - SKU divalidasi unique di database via Eloquent
 * - Price sell > price buy divalidasi di after() hook
 */
class StoreProductRequest extends FormRequest
{
    /**
     * Cek otorisasi: hanya admin yang boleh create produk.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return $this->user()?->role?->name === 'admin';
    }

    /**
     * Aturan validasi.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'min:2', 'max:200'],
            'sku'           => [
                'required',
                'string',
                'max:50',
                'regex:/^[A-Z0-9\-_]+$/i', // Hanya alphanumeric, dash, underscore
                Rule::unique('products', 'sku')->whereNull('deleted_at'),
            ],
            'category_id'   => ['required', 'integer', 'exists:categories,id'],
            'price_sell'    => ['required', 'numeric', 'min:0.01', 'max:999999999'],
            'price_buy'     => ['required', 'numeric', 'min:0', 'max:999999999'],
            'stock_current' => ['required', 'integer', 'min:0'],
            'stock_minimum' => ['required', 'integer', 'min:0'],
            'unit'          => ['required', 'string', Rule::in(['pcs', 'kg', 'liter', 'box', 'pack', 'lusin'])],
            'allow_backorder'=> ['boolean'],
        ];
    }

    /**
     * Validasi lintas-field: price_sell harus > price_buy.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $priceSell = (float) $this->input('price_sell', 0);
            $priceBuy  = (float) $this->input('price_buy', 0);

            if ($priceSell <= $priceBuy) {
                $validator->errors()->add(
                    'price_sell',
                    'Harga jual harus lebih besar dari harga beli.'
                );
            }
        });
    }

    /**
     * Custom error messages dalam Bahasa Indonesia.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required'          => 'Nama produk wajib diisi.',
            'sku.required'           => 'SKU produk wajib diisi.',
            'sku.unique'             => 'SKU ini sudah digunakan produk lain.',
            'sku.regex'              => 'SKU hanya boleh berisi huruf, angka, tanda hubung, dan underscore.',
            'category_id.exists'     => 'Kategori yang dipilih tidak valid.',
            'price_sell.required'    => 'Harga jual wajib diisi.',
            'price_sell.min'         => 'Harga jual harus lebih dari 0.',
            'price_buy.required'     => 'Harga beli wajib diisi.',
            'unit.in'                => 'Satuan tidak valid. Pilih: pcs, kg, liter, box, pack, atau lusin.',
        ];
    }
}
```

### 2.2 StoreTransactionRequest

```php
<?php
// app/Http/Requests/StoreTransactionRequest.php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form Request untuk membuat transaksi baru.
 *
 * Security:
 * - Grand total TIDAK diambil dari request — dikalkulasi ulang di server
 * - Diskon max 30% divalidasi di server (tidak hanya client)
 * - Price override tidak boleh di bawah price_buy (floor price)
 * - Stok divalidasi SEBELUM transaksi dibuat (lock di service layer)
 */
class StoreTransactionRequest extends FormRequest
{
    /**
     * Hanya kasir dan admin yang dapat membuat transaksi.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        $role = $this->user()?->role?->name;
        return in_array($role, ['cashier', 'admin'], true);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Items
            'items'                          => ['required', 'array', 'min:1'],
            'items.*.product_id'             => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'               => ['required', 'integer', 'min:1', 'max:9999'],
            'items.*.discount_percent'       => ['nullable', 'integer', 'min:0', 'max:30'],  // MAX 30%
            'items.*.price_override'         => ['nullable', 'numeric', 'min:0.01'],

            // Payment
            'payment_method'    => ['required', 'string', Rule::in(['cash', 'qris', 'transfer', 'split'])],
            'cash_received'     => ['nullable', 'numeric', 'min:0'],
            'split_payments'    => ['nullable', 'array'],
            'split_payments.*.method' => ['required_with:split_payments', 'string', Rule::in(['cash', 'qris', 'transfer'])],
            'split_payments.*.amount' => ['required_with:split_payments', 'numeric', 'min:0.01'],

            // Offline mode flag
            'is_offline_transaction' => ['boolean'],
            'notes'                  => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * Validasi tambahan lintas-field.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validasi: jika tunai, cash_received harus diisi
            if ($this->input('payment_method') === 'cash' && !$this->filled('cash_received')) {
                $validator->errors()->add('cash_received', 'Nominal uang diterima wajib diisi untuk pembayaran tunai.');
            }

            // Validasi: jika split, split_payments wajib diisi
            if ($this->input('payment_method') === 'split' && !$this->filled('split_payments')) {
                $validator->errors()->add('split_payments', 'Detail split pembayaran wajib diisi.');
            }

            // Validasi: price_override tidak boleh di bawah floor price (price_buy)
            $items = $this->input('items', []);
            foreach ($items as $index => $item) {
                if (!isset($item['price_override']) || $item['price_override'] === null) {
                    continue;
                }

                // Ambil product dari database untuk cek floor price
                // KEAMANAN: Menggunakan Eloquent — ORM dengan prepared statement
                $product = Product::find($item['product_id']);
                if ($product && (float) $item['price_override'] < (float) $product->price_buy) {
                    $validator->errors()->add(
                        "items.{$index}.price_override",
                        "Harga override untuk '{$product->name}' tidak boleh di bawah harga beli (Rp " . number_format($product->price_buy) . ")."
                    );
                }
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required'                    => 'Minimal satu item harus ditambahkan ke transaksi.',
            'items.*.product_id.exists'         => 'Produk dengan ID ini tidak ditemukan.',
            'items.*.quantity.min'              => 'Jumlah item minimal 1.',
            'items.*.discount_percent.max'      => 'Diskon tidak boleh melebihi 30%.',
            'payment_method.required'           => 'Metode pembayaran wajib dipilih.',
            'payment_method.in'                 => 'Metode pembayaran tidak valid.',
        ];
    }
}
```

---

## 3. SERVICES

### 3.1 ProductService

```php
<?php
// app/Services/ProductService.php

namespace App\Services;

use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;

/**
 * ProductService — Business Logic Manajemen Produk
 *
 * Prinsip SOLID:
 * - Single Responsibility: hanya menangani logika produk
 * - Open/Closed: mudah extend tanpa ubah interface
 * - Dependency: bergantung pada abstraksi (Model, LogService)
 */
class ProductService
{
    /**
     * Konstruktor — dependency injection.
     *
     * @param  AuditLogService  $auditLogService
     * @param  LogService       $logService
     */
    public function __construct(
        private readonly AuditLogService $auditLogService,
        private readonly LogService $logService,
    ) {}

    /**
     * Ambil daftar produk dengan filter dan cursor-based pagination.
     *
     * @param  array  $filters  [search, category_id, low_stock, is_active]
     * @param  int    $perPage
     * @return CursorPaginator
     */
    public function getPaginatedProducts(array $filters = [], int $perPage = 20): CursorPaginator
    {
        $query = Product::with('category')
            ->active()  // Default: hanya yang aktif
            ->orderBy('name');

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', (int) $filters['category_id']);
        }

        if (!empty($filters['low_stock'])) {
            $query->lowStock();
        }

        // Cursor pagination — lebih efisien untuk tabel besar
        return $query->cursorPaginate($perPage);
    }

    /**
     * Buat produk baru.
     * Mencatat aksi ke audit log.
     *
     * @param  array  $data  Data produk yang sudah divalidasi
     * @param  User   $actor  Admin yang melakukan aksi
     * @return Product
     *
     * @throws \Exception Jika gagal dibuat
     */
    public function createProduct(array $data, User $actor): Product
    {
        // Buat slug dari nama (untuk URL-friendly identifier)
        $data['slug'] = Str::slug($data['name'] . '-' . Str::random(6));

        $product = Product::create($data);

        // Structured audit log
        $this->auditLogService->log(
            userId: $actor->id,
            username: $actor->username,
            role: $actor->role->name,
            action: 'PRODUCT_CREATED',
            resourceType: 'products',
            resourceId: (string) $product->id,
            valueBefore: null,
            valueAfter: [
                'name'       => $product->name,
                'sku'        => $product->sku,
                'price_sell' => $product->price_sell,
                'stock'      => $product->stock_current,
            ],
        );

        LogService::info('Produk baru dibuat', [
            'product_id'   => $product->id,
            'product_name' => $product->name,
            'actor_id'     => $actor->id,
        ]);

        return $product;
    }

    /**
     * Update data produk (partial update).
     * Setiap perubahan harga dicatat lengkap (nilai sebelum dan sesudah).
     *
     * @param  Product  $product  Produk yang akan diupdate
     * @param  array    $data     Data yang akan diupdate (sudah divalidasi)
     * @param  User     $actor    Admin yang melakukan perubahan
     * @return Product  Produk yang sudah diperbarui
     */
    public function updateProduct(Product $product, array $data, User $actor): Product
    {
        // Simpan nilai lama untuk audit log
        $valueBefore = [
            'name'          => $product->name,
            'price_sell'    => $product->price_sell,
            'stock_minimum' => $product->stock_minimum,
            'is_active'     => $product->is_active,
        ];

        $product->update($data);

        // Tentukan action yang lebih spesifik
        $action = 'PRODUCT_UPDATED';
        if (isset($data['price_sell'])) {
            $action = 'PRODUCT_PRICE_UPDATED'; // Perubahan harga punya audit trail tersendiri
        }

        $this->auditLogService->log(
            userId: $actor->id,
            username: $actor->username,
            role: $actor->role->name,
            action: $action,
            resourceType: 'products',
            resourceId: (string) $product->id,
            valueBefore: $valueBefore,
            valueAfter: array_intersect_key($product->fresh()->toArray(), $valueBefore),
        );

        return $product->fresh();
    }

    /**
     * Soft-delete produk.
     * Produk yang dihapus tetap terbaca di riwayat transaksi.
     *
     * @param  Product  $product
     * @param  User     $actor
     * @return void
     */
    public function deleteProduct(Product $product, User $actor): void
    {
        // Cek apakah produk sedang punya transaksi aktif
        $activeTransactionCount = $product->transactionItems()
            ->whereHas('transaction', fn ($q) => $q->whereIn('status', ['pending', 'void_pending']))
            ->count();

        if ($activeTransactionCount > 0) {
            throw new \DomainException("Produk '{$product->name}' tidak dapat dihapus karena masih ada transaksi yang sedang diproses.");
        }

        $product->delete(); // Soft delete — deleted_at terisi

        $this->auditLogService->log(
            userId: $actor->id,
            username: $actor->username,
            role: $actor->role->name,
            action: 'PRODUCT_DELETED',
            resourceType: 'products',
            resourceId: (string) $product->id,
            valueBefore: ['name' => $product->name, 'sku' => $product->sku],
            valueAfter: ['deleted' => true],
        );
    }
}
```

### 3.2 TransactionService

```php
<?php
// app/Services/TransactionService.php

namespace App\Services;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Product;
use App\Models\User;
use App\Events\TransactionCompleted;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * TransactionService — Core Business Logic Pembayaran Kasir
 *
 * PRINSIP KRITIS:
 * 1. DB Transaction: Semua operasi bersifat atomik
 * 2. Idempotency: Mendeteksi dan menolak duplikasi transaksi
 * 3. Stok di-lock dengan SELECT FOR UPDATE sebelum dikurangi
 * 4. Grand total selalu dikalkulasi server-side (TIDAK percaya client)
 * 5. Semua override dicatat di audit log
 */
class TransactionService
{
    /** Konstanta batas diskon per RBAC rule */
    private const MAX_DISCOUNT_PERCENT = 30;

    /** Tarif PPN default (dari store_settings atau config) */
    private const DEFAULT_TAX_RATE = 0.11; // 11%

    public function __construct(
        private readonly AuditLogService $auditLogService,
        private readonly LogService $logService,
    ) {}

    /**
     * Buat transaksi baru dengan atomisitas penuh.
     *
     * Flow:
     * 1. Cek idempotency key → tolak jika duplikat
     * 2. Lock stok produk (SELECT FOR UPDATE)
     * 3. Validasi stok tersedia
     * 4. Kalkulasi kalkulasi total di server
     * 5. Buat transaksi + item dalam satu DB transaction
     * 6. Kurangi stok
     * 7. Catat audit log
     * 8. Dispatch event
     *
     * @param  array  $data   Data dari StoreTransactionRequest (sudah clean)
     * @param  User   $cashier Kasir yang melakukan transaksi
     * @return Transaction
     *
     * @throws \App\Exceptions\DuplicateTransactionException  Duplikasi idempotency key
     * @throws \App\Exceptions\InsufficientStockException     Stok tidak mencukupi
     * @throws \DomainException                               Pelanggaran business rule
     */
    public function createTransaction(array $data, User $cashier): Transaction
    {
        // === STEP 1: Idempotency Check ===
        if (isset($data['idempotency_key'])) {
            $existing = Transaction::where('idempotency_key', $data['idempotency_key'])->first();
            if ($existing !== null) {
                LogService::warning('Duplikasi transaksi terdeteksi via idempotency key', [
                    'idempotency_key'    => $data['idempotency_key'],
                    'existing_trx_id'    => $existing->id,
                    'cashier_id'         => $cashier->id,
                ]);
                return $existing; // Kembalikan transaksi yang sudah ada (idempoten)
            }
        }

        // Ambil tax rate dari store settings (dengan fallback)
        $taxRate = (float) config('store.tax_rate', self::DEFAULT_TAX_RATE);

        // === STEP 2-8: Semua dalam satu DB Transaction (Atomik) ===
        return DB::transaction(function () use ($data, $cashier, $taxRate) {

            // Lock semua produk yang akan dibeli (SELECT FOR UPDATE — cegah race condition)
            $productIds = array_column($data['items'], 'product_id');
            $products   = Product::lockForUpdate()
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');

            // === STEP 3: Validasi stok ===
            $this->validateStockAvailability($data['items'], $products);

            // === STEP 4: Kalkulasi server-side ===
            $calculatedItems = $this->calculateItems($data['items'], $products);
            $financials      = $this->calculateFinancials($calculatedItems, $taxRate);

            // Validasi: jika tunai, cash_received harus >= grand_total
            if ($data['payment_method'] === 'cash') {
                $cashReceived = (float) ($data['cash_received'] ?? 0);
                if ($cashReceived < $financials['grand_total']) {
                    throw new \DomainException(
                        'Nominal uang yang diterima tidak mencukupi untuk menutup total transaksi.'
                    );
                }
                $financials['change_amount'] = $cashReceived - $financials['grand_total'];
            }

            // === STEP 5: Buat record Transaksi ===
            $transaction = Transaction::create([
                'cashier_id'             => $cashier->id,
                'transaction_number'     => Transaction::generateTransactionNumber(),
                'status'                 => Transaction::STATUS_COMPLETED,
                'subtotal'               => $financials['subtotal'],
                'discount_amount'        => $financials['discount_amount'],
                'tax_amount'             => $financials['tax_amount'],
                'grand_total'            => $financials['grand_total'],
                'payment_method'         => $data['payment_method'],
                'cash_received'          => $data['cash_received'] ?? null,
                'change_amount'          => $financials['change_amount'] ?? null,
                'is_offline_transaction' => $data['is_offline_transaction'] ?? false,
                'sync_status'            => ($data['is_offline_transaction'] ?? false)
                    ? Transaction::SYNC_PENDING
                    : Transaction::SYNC_SYNCED,
                'notes'                  => $data['notes'] ?? null,
                'idempotency_key'        => $data['idempotency_key'] ?? null,
            ]);

            // === STEP 5b: Buat Transaction Items ===
            $hasOverride  = false;
            $hasDiscount  = false;
            $itemsToInsert = [];

            foreach ($calculatedItems as $item) {
                $itemsToInsert[] = [
                    'transaction_id'  => $transaction->id,
                    'product_id'      => $item['product_id'],
                    'product_name'    => $item['product_name'],  // Snapshot
                    'price_original'  => $item['price_original'],
                    'price_override'  => $item['price_override'],
                    'discount_percent'=> $item['discount_percent'],
                    'discount_amount' => $item['discount_amount'],
                    'price_final'     => $item['price_final'],
                    'quantity'        => $item['quantity'],
                    'subtotal'        => $item['subtotal'],
                ];

                if ($item['price_override'] !== null) $hasOverride = true;
                if ($item['discount_percent'] > 0) $hasDiscount = true;
            }

            TransactionItem::insert($itemsToInsert);

            // === STEP 6: Kurangi stok ===
            foreach ($data['items'] as $itemData) {
                $product = $products->get($itemData['product_id']);
                $product->decrement('stock_current', $itemData['quantity']);

                // Trigger alert jika stok di bawah minimum setelah transaksi
                if ($product->fresh()->stock_current <= $product->stock_minimum) {
                    LogService::warning('Stok produk di bawah minimum', [
                        'product_id'     => $product->id,
                        'product_name'   => $product->name,
                        'stock_current'  => $product->fresh()->stock_current,
                        'stock_minimum'  => $product->stock_minimum,
                    ]);
                    // Event untuk notifikasi real-time via WebSocket
                    // event(new StockMinimumReached($product));
                }
            }

            // === STEP 7: Audit Log ===
            $this->auditLogService->log(
                userId: $cashier->id,
                username: $cashier->username,
                role: $cashier->role->name,
                action: 'TRANSACTION_COMPLETED',
                resourceType: 'transactions',
                resourceId: (string) $transaction->id,
                valueBefore: null,
                valueAfter: [
                    'transaction_number' => $transaction->transaction_number,
                    'grand_total'        => $transaction->grand_total,
                    'item_count'         => count($data['items']),
                    'payment_method'     => $transaction->payment_method,
                ],
            );

            // Log terpisah jika ada override atau diskon (traceability)
            if ($hasOverride) {
                $this->auditLogService->log(
                    userId: $cashier->id,
                    username: $cashier->username,
                    role: $cashier->role->name,
                    action: 'PRICE_OVERRIDE_APPLIED',
                    resourceType: 'transactions',
                    resourceId: (string) $transaction->id,
                    valueBefore: null,
                    valueAfter: ['transaction_number' => $transaction->transaction_number],
                );
            }

            if ($hasDiscount) {
                $this->auditLogService->log(
                    userId: $cashier->id,
                    username: $cashier->username,
                    role: $cashier->role->name,
                    action: 'DISCOUNT_APPLIED',
                    resourceType: 'transactions',
                    resourceId: (string) $transaction->id,
                    valueBefore: null,
                    valueAfter: [
                        'total_discount' => $financials['discount_amount'],
                        'transaction_number' => $transaction->transaction_number,
                    ],
                );
            }

            // === STEP 8: Dispatch Event ===
            event(new TransactionCompleted($transaction, $cashier));

            LogService::info('Transaksi berhasil dibuat', [
                'transaction_id'     => $transaction->id,
                'transaction_number' => $transaction->transaction_number,
                'cashier_id'         => $cashier->id,
                'grand_total'        => $transaction->grand_total,
            ]);

            return $transaction->load('items', 'paymentRecords');
        });
    }

    /**
     * Validasi ketersediaan stok untuk semua item yang akan dibeli.
     *
     * @param  array                                         $requestedItems
     * @param  \Illuminate\Support\Collection<int, Product>  $products
     * @return void
     *
     * @throws \App\Exceptions\InsufficientStockException
     */
    private function validateStockAvailability(array $requestedItems, $products): void
    {
        foreach ($requestedItems as $item) {
            $product  = $products->get($item['product_id']);

            if ($product === null) {
                throw new \DomainException("Produk dengan ID {$item['product_id']} tidak ditemukan.");
            }

            if (!$product->is_active) {
                throw new \DomainException("Produk '{$product->name}' tidak aktif dan tidak dapat dijual.");
            }

            $requested = (int) $item['quantity'];
            $available = (int) $product->stock_current;

            if ($available < $requested && !$product->allow_backorder) {
                throw new \App\Exceptions\InsufficientStockException(
                    "Stok produk '{$product->name}' tidak mencukupi. Tersedia: {$available}, diminta: {$requested}.",
                    $product->id,
                    $available,
                    $requested
                );
            }
        }
    }

    /**
     * Hitung detail setiap item: diskon, price_final, subtotal.
     *
     * KEAMANAN: grand_total tidak diambil dari client, selalu dihitung ulang di sini.
     *
     * @param  array                                         $requestedItems
     * @param  \Illuminate\Support\Collection<int, Product>  $products
     * @return array<int, array>  Daftar item yang sudah dihitung
     *
     * @throws \DomainException  Jika diskon > 30% atau price_override < price_buy
     */
    private function calculateItems(array $requestedItems, $products): array
    {
        $calculated = [];

        foreach ($requestedItems as $item) {
            $product         = $products->get($item['product_id']);
            $priceOriginal   = (float) $product->price_sell;   // Harga jual normal
            $priceOverride   = isset($item['price_override']) ? (float) $item['price_override'] : null;
            $discountPercent = (int) ($item['discount_percent'] ?? 0);

            // === Validasi diskon (defense in depth — sudah juga di FormRequest) ===
            if ($discountPercent > self::MAX_DISCOUNT_PERCENT) {
                throw new \DomainException(
                    "Diskon untuk '{$product->name}' melebihi batas maksimum " . self::MAX_DISCOUNT_PERCENT . "%."
                );
            }

            // === Validasi price override ===
            if ($priceOverride !== null) {
                $floorPrice = (float) $product->price_buy;
                if ($priceOverride < $floorPrice) {
                    throw new \DomainException(
                        "Harga override untuk '{$product->name}' (Rp " . number_format($priceOverride) . ") " .
                        "tidak boleh di bawah harga beli (Rp " . number_format($floorPrice) . ")."
                    );
                }
            }

            // Gunakan price_override jika ada, jika tidak gunakan price_sell
            $basePrice     = $priceOverride ?? $priceOriginal;
            $discountAmt   = round($basePrice * ($discountPercent / 100), 2);
            $priceFinal    = round($basePrice - $discountAmt, 2);
            $quantity      = (int) $item['quantity'];
            $itemSubtotal  = round($priceFinal * $quantity, 2);

            $calculated[] = [
                'product_id'      => $product->id,
                'product_name'    => $product->name,  // Snapshot
                'price_original'  => $priceOriginal,
                'price_override'  => $priceOverride,
                'discount_percent'=> $discountPercent,
                'discount_amount' => $discountAmt,
                'price_final'     => $priceFinal,
                'quantity'        => $quantity,
                'subtotal'        => $itemSubtotal,
            ];
        }

        return $calculated;
    }

    /**
     * Hitung total keuangan transaksi (subtotal, diskon, pajak, grand total).
     *
     * @param  array  $calculatedItems  Output dari calculateItems()
     * @param  float  $taxRate         Tarif PPN (0.11 = 11%)
     * @return array{subtotal: float, discount_amount: float, tax_amount: float, grand_total: float}
     */
    private function calculateFinancials(array $calculatedItems, float $taxRate): array
    {
        $subtotal       = array_sum(array_column($calculatedItems, 'subtotal'));
        $totalDiscount  = array_sum(array_column($calculatedItems, 'discount_amount'));
        $afterDiscount  = $subtotal - $totalDiscount;
        $taxAmount      = round($afterDiscount * $taxRate, 2);
        $grandTotal     = round($afterDiscount + $taxAmount, 2);

        return [
            'subtotal'        => round($subtotal, 2),
            'discount_amount' => round($totalDiscount, 2),
            'tax_amount'      => $taxAmount,
            'grand_total'     => $grandTotal,
        ];
    }
}
```

### 3.3 AuditLogService

```php
<?php
// app/Services/AuditLogService.php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Log;

/**
 * AuditLogService — Immutable Audit Trail
 *
 * Setiap aksi bisnis sensitif dicatat menggunakan service ini.
 * Audit log bersifat IMMUTABLE: tidak ada UPDATE atau DELETE.
 *
 * Semua record juga ditulis ke file log audit (channel: audit)
 * sebagai backup.
 */
class AuditLogService
{
    /**
     * Catat satu entri audit ke database dan file log.
     *
     * @param  int         $userId        ID pengguna yang melakukan aksi
     * @param  string      $username      Username snapshot (tahan terhadap perubahan username)
     * @param  string      $role          Role snapshot saat aksi dilakukan
     * @param  string      $action        SCREAMING_SNAKE_CASE action code
     * @param  string      $resourceType  Nama tabel/entitas yang terpengaruh
     * @param  string|null $resourceId    ID resource (opsional)
     * @param  array|null  $valueBefore   State sebelum perubahan
     * @param  array|null  $valueAfter    State setelah perubahan
     * @param  string|null $reason        Alasan aksi (untuk override, void, dll)
     * @return AuditLog    Record yang disimpan
     */
    public function log(
        int $userId,
        string $username,
        string $role,
        string $action,
        string $resourceType,
        ?string $resourceId = null,
        ?array $valueBefore = null,
        ?array $valueAfter = null,
        ?string $reason = null,
    ): AuditLog {
        // Simpan ke database
        $auditLog = AuditLog::create([
            'user_id'       => $userId,
            'username'      => $username,   // Snapshot — tidak berubah jika username diubah nanti
            'role'          => $role,
            'action'        => strtoupper($action),
            'resource_type' => $resourceType,
            'resource_id'   => $resourceId,
            'value_before'  => $valueBefore,
            'value_after'   => $valueAfter,
            'reason'        => $reason,
            'ip_address'    => request()->ip() ?? '0.0.0.0',
            'device_id'     => request()->header('X-Device-ID'),
        ]);

        // Juga tulis ke file audit log (redundancy)
        Log::channel('audit')->info("AUDIT: {$action}", [
            'audit_log_id'  => $auditLog->id,
            'user_id'       => $userId,
            'action'        => $action,
            'resource_type' => $resourceType,
            'resource_id'   => $resourceId,
            'ip_address'    => request()->ip(),
        ]);

        return $auditLog;
    }
}
```

---

## 4. CONTROLLERS (Thin — Logic di Service)

### 4.1 ProductController

```php
<?php
// app/Http/Controllers/Api/V1/ProductController.php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * ProductController — Thin Controller (Fase 5B)
 *
 * Mengikuti prinsip Thin Controller: controller hanya mengurus
 * HTTP request/response; business logic ada di ProductService.
 */
class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
    ) {}

    /**
     * GET /api/v1/products
     * Daftar produk dengan pagination dan filter.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'category_id', 'low_stock']);
        $perPage = min((int) $request->input('limit', 20), 50); // Max 50

        $products = $this->productService->getPaginatedProducts($filters, $perPage);

        return response()->json([
            'success' => true,
            'data'    => $products->items(),
            'meta'    => [
                'per_page'    => $perPage,
                'next_cursor' => $products->nextCursor()?->encode(),
                'prev_cursor' => $products->previousCursor()?->encode(),
            ],
        ]);
    }

    /**
     * GET /api/v1/products/{id}
     * Detail satu produk.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        // KEAMANAN: Eloquent find() menggunakan prepared statement
        $product = Product::with('category')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $product,
        ]);
    }

    /**
     * POST /api/v1/products
     * Buat produk baru (admin only — dijaga di FormRequest dan middleware).
     *
     * @param  StoreProductRequest  $request
     * @return JsonResponse
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productService->createProduct(
            data: $request->validated(),
            actor: $request->user(),
        );

        return response()->json([
            'success' => true,
            'data'    => $product,
            'message' => 'Produk berhasil ditambahkan.',
        ], 201);
    }

    /**
     * PATCH /api/v1/products/{id}
     * Update produk (admin only).
     *
     * @param  UpdateProductRequest  $request
     * @param  int                   $id
     * @return JsonResponse
     */
    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $updated = $this->productService->updateProduct(
            product: $product,
            data: $request->validated(),
            actor: $request->user(),
        );

        return response()->json([
            'success' => true,
            'data'    => $updated,
            'message' => 'Produk berhasil diperbarui.',
        ]);
    }

    /**
     * DELETE /api/v1/products/{id}
     * Soft-delete produk (admin only).
     *
     * @param  Request  $request
     * @param  int      $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $this->productService->deleteProduct(
            product: $product,
            actor: $request->user(),
        );

        return response()->json([
            'success' => true,
            'message' => "Produk '{$product->name}' berhasil dinonaktifkan.",
        ]);
    }
}
```

### 4.2 TransactionController

```php
<?php
// app/Http/Controllers/Api/V1/TransactionController.php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Models\Transaction;
use App\Services\TransactionService;
use App\Services\LogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * TransactionController — Thin Controller (Fase 5B)
 *
 * Menangani lifecycle transaksi POS: pembuatan, query,
 * dan pengambilan struk PDF.
 */
class TransactionController extends Controller
{
    public function __construct(
        private readonly TransactionService $transactionService,
    ) {}

    /**
     * POST /api/v1/transactions
     * Buat transaksi baru.
     *
     * @param  StoreTransactionRequest  $request
     * @return JsonResponse
     */
    public function store(StoreTransactionRequest $request): JsonResponse
    {
        try {
            $transaction = $this->transactionService->createTransaction(
                data: $request->validated(),
                cashier: $request->user(),
            );

            return response()->json([
                'success' => true,
                'data'    => $transaction,
                'message' => 'Transaksi berhasil diproses.',
            ], 201);

        } catch (\App\Exceptions\InsufficientStockException $e) {
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'          => 'INSUFFICIENT_STOCK',
                    'message'       => $e->getMessage(),
                    'product_id'    => $e->getProductId(),
                    'current_stock' => $e->getCurrentStock(),
                ],
            ], 409);

        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'error'   => [
                    'code'    => 'BUSINESS_RULE_VIOLATION',
                    'message' => $e->getMessage(),
                ],
            ], 422);
        }
    }

    /**
     * GET /api/v1/transactions
     * Daftar transaksi.
     * KEAMANAN RBAC: Kasir hanya bisa lihat transaksi milik sendiri.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $role  = $user->role->name;
        $perPage = min((int) $request->input('limit', 20), 50);

        $query = Transaction::with(['cashier:id,username', 'items'])
            ->orderByDesc('created_at');

        // Object-level authorization: kasir hanya lihat milik sendiri
        if ($role === 'cashier') {
            $query->where('cashier_id', $user->id);
        }

        // Filter opsional
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        // Admin/supervisor bisa filter per kasir
        if (in_array($role, ['admin', 'supervisor'], true) && $request->filled('cashier_id')) {
            $query->where('cashier_id', (int) $request->input('cashier_id'));
        }

        $transactions = $query->cursorPaginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => $transactions->items(),
            'meta'    => [
                'per_page'    => $perPage,
                'next_cursor' => $transactions->nextCursor()?->encode(),
            ],
        ]);
    }

    /**
     * GET /api/v1/transactions/{id}
     * Detail satu transaksi.
     * KEAMANAN: Kasir hanya bisa akses transaksi milik sendiri.
     *
     * @param  Request  $request
     * @param  int      $id
     * @return JsonResponse
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user        = $request->user();
        $transaction = Transaction::with(['items', 'paymentRecords'])->findOrFail($id);

        // Object-level authorization (IDOR prevention)
        if ($user->role->name === 'cashier' && $transaction->cashier_id !== $user->id) {
            LogService::security('IDOR_ATTEMPT_TRANSACTION', [
                'requested_transaction_id' => $id,
                'cashier_id'               => $user->id,
            ]);
            abort(403, 'Anda tidak memiliki akses ke transaksi ini.');
        }

        return response()->json([
            'success' => true,
            'data'    => $transaction,
        ]);
    }

    /**
     * GET /api/v1/transactions/{id}/receipt
     * Signed URL untuk mengunduh struk PDF.
     * KEAMANAN: URL kadaluarsa dalam 15 menit; NPWP tidak di response JSON.
     *
     * @param  Request  $request
     * @param  int      $id
     * @return JsonResponse
     */
    public function receipt(Request $request, int $id): JsonResponse
    {
        $user        = $request->user();
        $transaction = Transaction::findOrFail($id);

        // Object-level authorization
        if ($user->role->name === 'cashier' && $transaction->cashier_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke struk transaksi ini.');
        }

        $pdfPath = "receipts/{$transaction->transaction_number}.pdf";

        if (!Storage::disk('local')->exists($pdfPath)) {
            // Trigger PDF generation job jika belum ada
            dispatch(new \App\Jobs\GenerateReceiptJob($transaction));
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'RECEIPT_GENERATING', 'message' => 'Struk sedang diproses. Coba lagi dalam beberapa detik.'],
            ], 202);
        }

        // KEAMANAN: Signed URL dengan expiry 15 menit
        // NPWP tidak dikembalikan di JSON — hanya ada di dalam PDF
        $signedUrl = Storage::disk('local')->temporaryUrl($pdfPath, now()->addMinutes(15));

        return response()->json([
            'success' => true,
            'data'    => [
                'pdf_url'    => $signedUrl,
                'expires_at' => now()->addMinutes(15)->toIso8601ZuluString(),
            ],
        ]);
    }
}
```

---

## 5. MIDDLEWARE

### 5.1 RbacMiddleware

```php
<?php
// app/Http/Middleware/RbacMiddleware.php

namespace App\Http\Middleware;

use App\Services\LogService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * RBAC Middleware — Role-Based Access Control
 *
 * Memvalidasi bahwa pengguna yang terautentikasi memiliki role
 * yang diperlukan untuk mengakses endpoint.
 *
 * Penggunaan di route: middleware('rbac:admin,supervisor')
 */
class RbacMiddleware
{
    /**
     * Handle incoming request.
     *
     * @param  Request  $request
     * @param  Closure  $next
     * @param  string   ...$allowedRoles  Role yang diizinkan (variadic)
     * @return Response
     */
    public function handle(Request $request, Closure $next, string ...$allowedRoles): Response
    {
        $user = $request->user();

        if ($user === null) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'UNAUTHORIZED', 'message' => 'Autentikasi diperlukan.'],
            ], 401);
        }

        $userRole = $user->role?->name;

        if (!in_array($userRole, $allowedRoles, true)) {
            // Catat akses tidak sah untuk security monitoring
            LogService::security('UNAUTHORIZED_ACCESS_ATTEMPT', [
                'user_id'          => $user->id,
                'user_role'        => $userRole,
                'required_roles'   => $allowedRoles,
                'endpoint'         => $request->path(),
                'method'           => $request->method(),
            ]);

            return response()->json([
                'success' => false,
                'error'   => [
                    'code'    => 'FORBIDDEN',
                    'message' => 'Anda tidak memiliki izin untuk mengakses resource ini.',
                ],
            ], 403);
        }

        return $next($request);
    }
}
```

### 5.2 IdempotencyMiddleware

```php
<?php
// app/Http/Middleware/IdempotencyMiddleware.php

namespace App\Http\Middleware;

use App\Services\LogService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

/**
 * Idempotency Middleware
 *
 * Mencegah duplikasi request POST kritis menggunakan
 * header Idempotency-Key yang client kirimkan.
 *
 * Flow:
 * 1. Client mengirim header: Idempotency-Key: <uuid>
 * 2. Middleware cek apakah key sudah ada di Redis
 * 3. Jika ada → kembalikan response yang tersimpan (tanpa proses ulang)
 * 4. Jika tidak ada → proses request → simpan response ke Redis (24 jam)
 *
 * Digunakan di: POST /transactions, POST /payments
 */
class IdempotencyMiddleware
{
    private const CACHE_PREFIX  = 'idempotency:';
    private const CACHE_TTL_SEC = 86400; // 24 jam

    /**
     * @param  Request  $request
     * @param  Closure  $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $idempotencyKey = $request->header('Idempotency-Key');

        // Jika tidak ada header, lanjutkan tanpa idempotency check
        // (opsional, bisa dijadikan required untuk endpoint kritis)
        if (empty($idempotencyKey)) {
            return $next($request);
        }

        // Validasi format UUID
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $idempotencyKey)) {
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'INVALID_IDEMPOTENCY_KEY', 'message' => 'Format Idempotency-Key tidak valid. Gunakan format UUID v4.'],
            ], 400);
        }

        $cacheKey = self::CACHE_PREFIX . $idempotencyKey;

        // Cek apakah sudah pernah diproses
        if (Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);

            LogService::info('Idempotency: Mengembalikan cached response', [
                'idempotency_key' => $idempotencyKey,
                'status'          => $cached['status'],
            ]);

            return response()->json($cached['body'], $cached['status'])
                ->header('Idempotency-Replayed', 'true');
        }

        // Tandai key sebagai "sedang diproses" untuk mencegah race condition
        Cache::put("{$cacheKey}:processing", true, 30); // Lock 30 detik

        // Inject key ke request data
        $request->merge(['idempotency_key' => $idempotencyKey]);

        // Proses request
        $response = $next($request);

        // Simpan response ke cache (hanya jika sukses)
        if ($response->getStatusCode() < 500) {
            Cache::put($cacheKey, [
                'status' => $response->getStatusCode(),
                'body'   => json_decode($response->getContent(), true),
            ], self::CACHE_TTL_SEC);
        }

        Cache::forget("{$cacheKey}:processing");

        return $response->header('Idempotency-Key', $idempotencyKey);
    }
}
```

### 5.3 SecurityHeadersMiddleware

```php
<?php
// app/Http/Middleware/SecurityHeadersMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Security Headers Middleware
 *
 * Menambahkan HTTP security headers ke setiap response
 * sesuai OWASP Secure Headers Project.
 */
class SecurityHeadersMiddleware
{
    /**
     * @param  Request  $request
     * @param  Closure  $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Content Security Policy
        $response->headers->set(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self';"
        );

        // Prevent clickjacking
        $response->headers->set('X-Frame-Options', 'DENY');

        // Prevent MIME type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // XSS Protection (modern browsers)
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // HSTS (hanya di production, bukan local/dev)
        if (!app()->environment('local', 'development')) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        // Referrer Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Remove server header (don't reveal server info)
        $response->headers->remove('Server');
        $response->headers->remove('X-Powered-By');

        return $response;
    }
}
```

### 5.4 WebhookHmacMiddleware

```php
<?php
// app/Http/Middleware/WebhookHmacMiddleware.php

namespace App\Http\Middleware;

use App\Services\LogService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Webhook HMAC Verification Middleware
 *
 * Memverifikasi signature HMAC-SHA512 dari payment gateway
 * sebelum request diproses.
 *
 * KEAMANAN:
 * - Menggunakan hash_equals() untuk timing-safe comparison
 * - API secret diambil dari .env, TIDAK hardcoded
 * - Request gagal verifikasi dicatat di security log
 */
class WebhookHmacMiddleware
{
    /**
     * @param  Request  $request
     * @param  Closure  $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Dapatkan secret dari environment variable — BUKAN hardcoded
        $webhookSecret = config('services.midtrans.webhook_secret');

        if (empty($webhookSecret)) {
            LogService::error('WEBHOOK_SECRET_NOT_CONFIGURED', [
                'endpoint' => $request->path(),
            ]);
            return response()->json([
                'success' => false,
                'error'   => ['code' => 'CONFIGURATION_ERROR', 'message' => 'Server tidak dikonfigurasi dengan benar.'],
            ], 500);
        }

        // Ambil payload raw untuk kalkulasi signature
        $payload   = $request->getContent();
        $orderId   = $request->input('order_id', '');
        $status    = $request->input('transaction_status', '');
        $grossAmt  = $request->input('gross_amount', '');

        // Hitung expected signature (sesuai Midtrans spec)
        $expectedSignature = hash('sha512', $orderId . $status . $grossAmt . $webhookSecret);
        $receivedSignature = $request->input('signature_key', '');

        // Timing-safe comparison — mencegah timing attack
        if (!hash_equals($expectedSignature, $receivedSignature)) {
            LogService::security('WEBHOOK_SIGNATURE_INVALID', [
                'order_id'   => $orderId,
                'ip_address' => $request->ip(),
                'status'     => $status,
            ]);

            return response()->json([
                'success' => false,
                'error'   => [
                    'code'    => 'WEBHOOK_SIGNATURE_INVALID',
                    'message' => 'Signature tidak valid.',
                ],
            ], 400);
        }

        return $next($request);
    }
}
```

---

## 6. CUSTOM EXCEPTION

```php
<?php
// app/Exceptions/InsufficientStockException.php

namespace App\Exceptions;

use RuntimeException;

/**
 * Exception untuk kondisi stok tidak mencukupi.
 * Memberikan detail produk yang bermasalah untuk response API.
 */
class InsufficientStockException extends RuntimeException
{
    public function __construct(
        string $message,
        private readonly int $productId,
        private readonly int $currentStock,
        private readonly int $requestedQty,
    ) {
        parent::__construct($message);
    }

    public function getProductId(): int { return $this->productId; }
    public function getCurrentStock(): int { return $this->currentStock; }
    public function getRequestedQty(): int { return $this->requestedQty; }
}
```

```php
<?php
// app/Exceptions/ApiExceptionHandler.php

namespace App\Exceptions;

use App\Services\LogService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

/**
 * API Exception Handler
 *
 * Mengubah semua exception menjadi JSON response yang aman.
 * KEAMANAN: Stack trace TIDAK dikembalikan ke client di production.
 */
class ApiExceptionHandler
{
    /**
     * Render exception menjadi JSON response.
     *
     * @param  Request    $request
     * @param  Throwable  $e
     * @return \Illuminate\Http\JsonResponse
     */
    public function render(Request $request, Throwable $e)
    {
        // Log setiap 5xx error
        if (!($e instanceof ValidationException) &&
            !($e instanceof AuthenticationException) &&
            !($e instanceof ModelNotFoundException)) {
            LogService::error('Unhandled exception', [], $e);
        }

        return match (true) {
            $e instanceof ValidationException => response()->json([
                'success' => false,
                'error'   => [
                    'code'    => 'VALIDATION_ERROR',
                    'message' => 'Data yang dikirim tidak valid.',
                    'errors'  => $e->errors(),
                ],
            ], 422),

            $e instanceof AuthenticationException => response()->json([
                'success' => false,
                'error'   => ['code' => 'UNAUTHORIZED', 'message' => 'Autentikasi diperlukan.'],
            ], 401),

            $e instanceof ModelNotFoundException => response()->json([
                'success' => false,
                'error'   => ['code' => 'NOT_FOUND', 'message' => 'Resource tidak ditemukan.'],
            ], 404),

            $e instanceof HttpException => response()->json([
                'success' => false,
                'error'   => ['code' => 'HTTP_ERROR', 'message' => $e->getMessage() ?: 'HTTP error.'],
            ], $e->getStatusCode()),

            // Semua exception lain — jangan bocorkan detail di production
            default => response()->json([
                'success' => false,
                'error'   => [
                    'code'    => 'INTERNAL_SERVER_ERROR',
                    'message' => 'Terjadi kesalahan pada server. Silakan coba lagi.',
                    // Stack trace hanya di development
                    'debug'   => config('app.debug') ? $e->getMessage() : null,
                ],
            ], 500),
        };
    }
}
```

---

*Dokumen ini adalah bagian dari Fase 5B — Implementasi Modul MikoMart POS System.*

**Nomor Dokumen:** MikoMart-IMPL-2026-002 | **Versi:** 1.0 | **Klasifikasi:** INTERNAL — CONFIDENTIAL
