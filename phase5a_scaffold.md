# PROJECT SCAFFOLD
## MikoMart Point of Sale (POS) System — Fase 5A

---

| Field | Detail |
|---|---|
| **Nama Sistem** | MikoMart Point of Sale (POS) System |
| **Nomor Dokumen** | MikoMart-IMPL-2026-001 |
| **Fase** | 5A — Project Scaffold |
| **Stack** | PHP 8.2 + Laravel 11 · React 18 + TypeScript · Node.js 18 · SQLite/MySQL |
| **Tanggal** | 17 April 2026 |

---

## 1. .gitignore

```gitignore
# =============================================
# MIKOMART POS — .gitignore
# Laravel + React + Node.js + SQLite
# =============================================

# === ENV FILES (WAJIB TIDAK DI-COMMIT) ===
.env
.env.development
.env.staging
.env.production
.env.local
*.env

# Hanya .env.example yang boleh di-commit
!.env.example

# === LARAVEL ===
/vendor/
/node_modules/
/public/hot
/public/storage
/storage/*.key
/storage/app/private/
/storage/logs/
/storage/framework/cache/
/storage/framework/sessions/
/storage/framework/testing/
/storage/framework/views/
bootstrap/cache/*.php
!bootstrap/cache/.gitkeep

# === REACT / VITE ===
/frontend/node_modules/
/frontend/dist/
/frontend/.vite/
/frontend/coverage/

# === NODE.JS (WebSocket Service) ===
/ws-server/node_modules/
/ws-server/dist/

# === SQLITE (LOCAL DATABASE — WAJIB TIDAK DI-COMMIT) ===
*.sqlite
*.sqlite3
*.db
*.db-wal
*.db-shm
database/database.sqlite

# === GENERATED FILES ===
/public/build/
/public/mix-manifest.json

# === TEST ARTIFACTS ===
.phpunit.result.cache
coverage/
*.coverage

# === IDE & OS ===
.idea/
.vscode/
*.swp
*.swo
.DS_Store
Thumbs.db
desktop.ini

# === SECURITY ===
*.pem
*.key
*.p12
*.pfx
/certs/

# === LOGS ===
*.log
npm-debug.log*
yarn-error.log

# === BUILD ARTIFACTS ===
*.zip
*.tar.gz
/releases/
```

---

## 2. .env.example (Template — Boleh Di-commit)

```ini
# =============================================
# MIKOMART POS — ENVIRONMENT CONFIGURATION
# TEMPLATE: Copy ke .env dan isi nilainya.
# JANGAN PERNAH COMMIT FILE .env ASLI KE GIT!
# =============================================

APP_NAME="MikoMart POS"
APP_ENV=local                  # local | development | staging | production
APP_KEY=                       # Isi dengan: php artisan key:generate
APP_DEBUG=true                 # WAJIB false di staging & production
APP_URL=http://localhost:8000
APP_VERSION=1.0.0

# ─────────── FRONTEND ───────────
FRONTEND_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000/api/v1

# ─────────── DATABASE SERVER (MySQL) ───────────
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mikomart_pos
DB_USERNAME=mikomart_app
DB_PASSWORD=

# ─────────── DATABASE LOKAL (SQLite per Kasir) ───────────
SQLITE_DATABASE_PATH=/absolute/path/to/mikomart_local.sqlite
SQLITE_ENCRYPTION_KEY=         # 32+ karakter; simpan di password manager

# ─────────── AUTH & JWT ───────────
JWT_SECRET=                    # 64+ karakter random: openssl rand -hex 32
JWT_EXPIRY_MINUTES=60
JWT_INACTIVITY_TIMEOUT_MINUTES=30

# ─────────── REDIS ───────────
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=
REDIS_PORT=6379
REDIS_DB=0

# ─────────── QUEUE ───────────
QUEUE_CONNECTION=redis         # sync | redis | database
QUEUE_FAILED_DRIVER=database

# ─────────── PAYMENT GATEWAY (Midtrans) ───────────
MIDTRANS_SERVER_KEY=           # RAHASIAKAN — dari dashboard.midtrans.com
MIDTRANS_CLIENT_KEY=           # RAHASIAKAN
MIDTRANS_IS_PRODUCTION=false   # false = sandbox
MIDTRANS_WEBHOOK_SECRET=       # Untuk HMAC-SHA512 verifikasi

# ─────────── PAYMENT GATEWAY (Xendit — alternatif) ───────────
XENDIT_SECRET_KEY=             # RAHASIAKAN
XENDIT_CALLBACK_TOKEN=         # Untuk verifikasi webhook

# ─────────── OBSERVABILITY ───────────
LOG_CHANNEL=json               # json | stack | single
LOG_LEVEL=debug                # debug | info | warning | error | critical
LOG_DAYS=30

# ─────────── MAIL ───────────
MAIL_MAILER=log                # log (dev) | smtp (staging/prod)
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@mikomart.local
MAIL_FROM_NAME="${APP_NAME}"

# ─────────── NODE.JS WEBSOCKET ───────────
WS_SERVER_URL=http://localhost:3001
WS_SECRET=                     # Shared secret antara Laravel & Node.js WS

# ─────────── STORE SETTINGS (via DB, bukan .env) ───────────
# STORE_NPWP — disimpan di store_settings table (encrypted AES-256)
# STORE_NAME — disimpan di store_settings table
# STORE_TAX_RATE — disimpan di store_settings table (default: 11%)
```

---

## 3. .env.development

```ini
# MIKOMART POS — DEVELOPMENT ENVIRONMENT
# ⚠️ JANGAN COMMIT FILE INI — sudah di .gitignore

APP_NAME="MikoMart POS [DEV]"
APP_ENV=development
APP_KEY=base64:GENERATED_BY_ARTISAN_KEY_GENERATE
APP_DEBUG=true
APP_URL=http://localhost:8000
APP_VERSION=1.0.0-dev

FRONTEND_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:8000/api/v1

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mikomart_dev
DB_USERNAME=root
DB_PASSWORD=

SQLITE_DATABASE_PATH=/var/www/mikomart/database/kasir_local.sqlite
SQLITE_ENCRYPTION_KEY=dev-encryption-key-32-chars-here

JWT_SECRET=dev-jwt-secret-please-change-in-production-or-staging
JWT_EXPIRY_MINUTES=120
JWT_INACTIVITY_TIMEOUT_MINUTES=60

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=
REDIS_PORT=6379

QUEUE_CONNECTION=sync

# === PAYMENT GATEWAY — SANDBOX ===
MIDTRANS_SERVER_KEY=SB-Mid-server-XXXXXXXXXXXXXXXXXXXXXXXX
MIDTRANS_CLIENT_KEY=SB-Mid-client-XXXXXXXXXXXXXXXXXXXXXXXX
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_WEBHOOK_SECRET=sandbox-webhook-secret

LOG_CHANNEL=stack
LOG_LEVEL=debug
LOG_DAYS=7

MAIL_MAILER=log
```

---

## 4. .env.staging

```ini
# MIKOMART POS — STAGING ENVIRONMENT
# ⚠️ JANGAN COMMIT FILE INI

APP_NAME="MikoMart POS [STAGING]"
APP_ENV=staging
APP_KEY=base64:STAGING_KEY_GENERATED_SECURELY
APP_DEBUG=false
APP_URL=https://staging.mikomart.local
APP_VERSION=1.0.0-rc

FRONTEND_URL=https://staging.mikomart.local
VITE_API_BASE_URL=https://staging.mikomart.local/api/v1

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mikomart_staging
DB_USERNAME=mikomart_staging_user
DB_PASSWORD=STAGING_STRONG_PASSWORD_HERE

SQLITE_DATABASE_PATH=/var/www/mikomart-staging/database/kasir_local.sqlite
SQLITE_ENCRYPTION_KEY=STAGING_ENCRYPTION_KEY_32_CHARS

JWT_SECRET=STAGING_JWT_SECRET_64_CHARS_RANDOM
JWT_EXPIRY_MINUTES=60
JWT_INACTIVITY_TIMEOUT_MINUTES=30

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=STAGING_REDIS_PASSWORD
REDIS_PORT=6379

QUEUE_CONNECTION=redis

# === PAYMENT GATEWAY — SANDBOX ===
MIDTRANS_SERVER_KEY=SB-Mid-server-XXXXXXXXX
MIDTRANS_CLIENT_KEY=SB-Mid-client-XXXXXXXXX
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_WEBHOOK_SECRET=STAGING_WEBHOOK_SECRET

LOG_CHANNEL=json
LOG_LEVEL=info
LOG_DAYS=14

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
```

---

## 5. AppServiceProvider — Password Hashing Argon2id

```php
<?php
// app/Providers/AppServiceProvider.php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Hash;
use Illuminate\Hashing\ArgonHasher;
use Illuminate\Support\Facades\URL;

/**
 * Application Service Provider
 * Konfigurasi global: hashing, URL, model binding.
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Ganti hasher default menjadi Argon2id (lebih aman dari bcrypt)
        $this->app->singleton('hash', function ($app) {
            return new Argon2IdHasher($app['config']['hashing'] ?? []);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Force HTTPS di non-local environment
        if (!$this->app->environment('local', 'development')) {
            URL::forceScheme('https');
        }

        // Konfigurasi Argon2id
        Hash::setRounds(config('hashing.argon.memory', 65536));
    }
}
```

```php
<?php
// app/Hashing/Argon2IdHasher.php

namespace App\Hashing;

use Illuminate\Hashing\ArgonHasher;

/**
 * Custom Argon2id Hasher
 * Lebih aman dari Argon2i karena resistant terhadap side-channel attacks
 */
class Argon2IdHasher extends ArgonHasher
{
    /**
     * Hash password menggunakan Argon2id algorithm.
     *
     * @param  string  $value  Password plaintext
     * @param  array   $options  Override options (memory, time, threads)
     * @return string  Password hash
     *
     * @throws \RuntimeException Jika Argon2id tidak tersedia di PHP
     */
    public function make(#[\SensitiveParameter] string $value, array $options = []): string
    {
        // Argon2id = gabungan keunggulan Argon2i dan Argon2d
        $hash = password_hash($value, PASSWORD_ARGON2ID, [
            'memory_cost' => $options['memory'] ?? config('hashing.argon.memory', 65536), // 64MB
            'time_cost'   => $options['time'] ?? config('hashing.argon.time', 4),
            'threads'     => $options['threads'] ?? config('hashing.argon.threads', 2),
        ]);

        if ($hash === false) {
            throw new \RuntimeException('Argon2id hashing tidak didukung oleh PHP build ini.');
        }

        return $hash;
    }

    /**
     * Verifikasi password menggunakan timing-safe comparison.
     *
     * @param  string  $value  Password plaintext
     * @param  string  $hashedValue  Hash dari database
     * @return bool
     */
    public function check(
        #[\SensitiveParameter] string $value,
        string $hashedValue,
        array $options = []
    ): bool {
        return password_verify($value, $hashedValue);
    }
}
```

---

## 6. Structured Logging (JSON Format — Monolog)

### 6.1 Custom JSON Formatter

```php
<?php
// app/Logging/JsonFormatter.php

namespace App\Logging;

use Monolog\Formatter\JsonFormatter as MonologJsonFormatter;
use Monolog\LogRecord;

/**
 * JSON Log Formatter untuk structured logging.
 *
 * Format setiap log entry:
 * {
 *   "timestamp": "2026-04-17T00:30:00.000Z",
 *   "level": "INFO",
 *   "channel": "app",
 *   "message": "...",
 *   "context": { ... }
 * }
 *
 * KEAMANAN: Tidak pernah log password, token, NPWP, atau data PII.
 */
class JsonFormatter extends MonologJsonFormatter
{
    /**
     * Daftar kata kunci field yang WAJIB tidak masuk log.
     * Jika ditemukan, nilainya diganti dengan [REDACTED].
     */
    private const SENSITIVE_KEYS = [
        'password', 'password_hash', 'token', 'access_token',
        'refresh_token', 'secret', 'api_key', 'server_key',
        'npwp', 'credit_card', 'card_number', 'cvv',
        'signature', 'webhook_secret',
    ];

    /**
     * Format log record menjadi JSON yang bersih dan aman.
     *
     * @param  LogRecord  $record
     * @return string  JSON string
     */
    public function format(LogRecord $record): string
    {
        $data = [
            'timestamp'   => $record->datetime->format('Y-m-d\TH:i:s.v\Z'),
            'level'       => $record->level->getName(),
            'channel'     => $record->channel,
            'message'     => $record->message,
            'context'     => $this->sanitize($record->context),
            'environment' => config('app.env'),
            'app_version' => config('app.version', '1.0.0'),
        ];

        return json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
    }

    /**
     * Hapus field sensitif dari context sebelum di-log.
     *
     * @param  array  $data
     * @return array  Data yang sudah dibersihkan
     */
    private function sanitize(array $data): array
    {
        foreach ($data as $key => $value) {
            if (in_array(strtolower((string)$key), self::SENSITIVE_KEYS, true)) {
                $data[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $data[$key] = $this->sanitize($value);
            }
        }
        return $data;
    }
}
```

### 6.2 Logging Config

```php
<?php
// config/logging.php (bagian yang relevan)

return [
    'default' => env('LOG_CHANNEL', 'json'),

    'channels' => [
        // Channel JSON untuk production & staging
        'json' => [
            'driver'    => 'daily',
            'path'      => storage_path('logs/mikomart.log'),
            'level'     => env('LOG_LEVEL', 'info'),
            'days'      => env('LOG_DAYS', 30),
            'formatter' => \App\Logging\JsonFormatter::class,
        ],

        // Channel terpisah untuk Audit Log (append-only)
        'audit' => [
            'driver'    => 'daily',
            'path'      => storage_path('logs/audit.log'),
            'level'     => 'info',
            'days'      => 90, // Audit log disimpan lebih lama
            'formatter' => \App\Logging\JsonFormatter::class,
            'permission'=> 0640, // Hanya owner & group yang bisa baca
        ],

        // Stack untuk development (human-readable + json)
        'stack' => [
            'driver'   => 'stack',
            'channels' => ['single', 'json'],
        ],

        'single' => [
            'driver'    => 'single',
            'path'      => storage_path('logs/laravel.log'),
            'level'     => 'debug',
        ],
    ],
];
```

### 6.3 LogService — Centralized Logging

```php
<?php
// app/Services/LogService.php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

/**
 * Centralized Structured Logging Service
 *
 * Semua log WAJIB melalui service ini untuk memastikan:
 * 1. Format konsisten (JSON)
 * 2. Field keamanan (tidak pernah log password/token)
 * 3. Context lengkap (user_id, device_id, ip, action)
 */
class LogService
{
    /**
     * Log informasi operasional umum.
     *
     * @param  string  $message  Pesan log
     * @param  array   $context  Data tambahan (tidak boleh berisi PII sensitif)
     * @return void
     */
    public static function info(string $message, array $context = []): void
    {
        Log::channel('json')->info($message, self::buildContext($context));
    }

    /**
     * Log peringatan (kondisi tidak normal tapi tidak fatal).
     *
     * @param  string  $message
     * @param  array   $context
     * @return void
     */
    public static function warning(string $message, array $context = []): void
    {
        Log::channel('json')->warning($message, self::buildContext($context));
    }

    /**
     * Log error (kondisi yang menyebabkan kegagalan).
     *
     * @param  string      $message
     * @param  array       $context
     * @param  \Throwable  $exception  Exception yang terjadi (opsional)
     * @return void
     */
    public static function error(
        string $message,
        array $context = [],
        ?\Throwable $exception = null
    ): void {
        $ctx = self::buildContext($context);

        if ($exception !== null) {
            // KEAMANAN: Hanya log pesan exception, BUKAN full stack trace di production
            $ctx['exception'] = [
                'class'   => get_class($exception),
                'message' => $exception->getMessage(),
                'file'    => config('app.debug') ? $exception->getFile() : '[hidden]',
                'line'    => config('app.debug') ? $exception->getLine() : '[hidden]',
            ];
        }

        Log::channel('json')->error($message, $ctx);
    }

    /**
     * Log aksi audit (immutable business event log).
     * Digunakan untuk: login, transaksi, void, perubahan harga, dll.
     *
     * @param  string  $action   SCREAMING_SNAKE_CASE action code
     * @param  array   $context  Harus mengandung: user_id, resource_type (opsional: resource_id, value_before, value_after)
     * @return void
     */
    public static function audit(string $action, array $context = []): void
    {
        $auditContext = array_merge(self::buildContext($context), [
            'action'    => strtoupper($action),
            'audit'     => true,  // Flag untuk pembedaan di log aggregator
        ]);

        Log::channel('audit')->info("AUDIT: {$action}", $auditContext);
    }

    /**
     * Log security event (login gagal, unauthorized access, signature invalid).
     *
     * @param  string  $event    Nama event keamanan
     * @param  array   $context
     * @return void
     */
    public static function security(string $event, array $context = []): void
    {
        $ctx = array_merge(self::buildContext($context), [
            'security_event' => true,
            'event_name'     => $event,
        ]);

        Log::channel('json')->warning("SECURITY: {$event}", $ctx);
    }

    /**
     * Build context dasar yang selalu disertakan di setiap log.
     * Mengambil informasi dari request yang sedang berjalan (jika ada).
     *
     * @param  array  $additional  Context tambahan dari caller
     * @return array  Context lengkap
     */
    private static function buildContext(array $additional = []): array
    {
        $base = [
            'request_id' => request()->header('X-Request-ID', uniqid('req_', true)),
            'ip_address' => request()->ip(),
            'user_agent' => substr((string) request()->userAgent(), 0, 200),
        ];

        // Tambahkan info user jika sudah terautentikasi
        if (auth()->check()) {
            $base['user_id']   = auth()->id();
            $base['role']      = auth()->user()->role?->name;
            $base['device_id'] = auth()->user()->device_id;
            // KEAMANAN: TIDAK log username atau full_name di sini — itu PII
        }

        return array_merge($base, $additional);
    }
}
```

---

## 7. Health Check Endpoint

### 7.1 HealthCheckController

```php
<?php
// app/Http/Controllers/Api/V1/HealthCheckController.php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\LogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

/**
 * Health Check Controller
 *
 * Endpoint: GET /api/v1/health
 * Response: HTTP 200 jika semua komponen sehat, HTTP 503 jika ada yang gagal.
 *
 * Digunakan oleh:
 * - Load balancer (Nginx upstream check)
 * - CI/CD pipeline (post-deployment verification)
 * - Monitoring system
 *
 * KEAMANAN: Tidak mengembalikan data sensitif (credential, config detail).
 */
class HealthCheckController extends Controller
{
    /**
     * Jalankan semua health check dan kembalikan status sistem.
     *
     * @return JsonResponse  HTTP 200 (healthy) atau HTTP 503 (degraded/unhealthy)
     */
    public function check(): JsonResponse
    {
        $checks = [];
        $overallHealthy = true;
        $startTime = microtime(true);

        // === CHECK 1: Database Server ===
        $checks['database'] = $this->checkDatabase();

        // === CHECK 2: Redis Cache ===
        $checks['cache'] = $this->checkRedis();

        // === CHECK 3: Queue Worker ===
        $checks['queue'] = $this->checkQueue();

        // === CHECK 4: File Storage ===
        $checks['storage'] = $this->checkStorage();

        // === CHECK 5: Payment Gateway ===
        $checks['payment_gateway'] = $this->checkPaymentGateway();

        // Tentukan status overall
        foreach ($checks as $check) {
            if ($check['status'] === 'fail') {
                $overallHealthy = false;
                break;
            }
        }

        $statusCode = $overallHealthy ? 200 : 503;
        $responseTime = round((microtime(true) - $startTime) * 1000, 2);

        $response = [
            'status'        => $overallHealthy ? 'healthy' : 'degraded',
            'timestamp'     => now()->toIso8601ZuluString(),
            'app_version'   => config('app.version', '1.0.0'),
            'environment'   => config('app.env'),
            'response_time' => "{$responseTime}ms",
            'checks'        => $checks,
        ];

        // Log health check jika ada komponen yang gagal
        if (!$overallHealthy) {
            LogService::warning('HEALTH_CHECK_DEGRADED', [
                'failed_checks' => array_keys(
                    array_filter($checks, fn($c) => $c['status'] === 'fail')
                ),
            ]);
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Cek koneksi database MySQL/SQLite.
     *
     * @return array{status: string, latency_ms: float|null, error: string|null}
     */
    private function checkDatabase(): array
    {
        try {
            $start = microtime(true);
            DB::select('SELECT 1');
            $latency = round((microtime(true) - $start) * 1000, 2);

            return [
                'status'     => 'ok',
                'latency_ms' => $latency,
                'driver'     => config('database.default'),
            ];
        } catch (\Throwable $e) {
            return [
                'status' => 'fail',
                'error'  => 'Database tidak dapat dihubungi',
            ];
        }
    }

    /**
     * Cek koneksi Redis untuk cache dan queue.
     *
     * @return array
     */
    private function checkRedis(): array
    {
        try {
            $start = microtime(true);
            Cache::put('health_check_probe', 1, 5);
            $latency = round((microtime(true) - $start) * 1000, 2);
            Cache::forget('health_check_probe');

            return ['status' => 'ok', 'latency_ms' => $latency];
        } catch (\Throwable $e) {
            return ['status' => 'fail', 'error' => 'Redis tidak dapat dihubungi'];
        }
    }

    /**
     * Cek apakah queue worker sedang berjalan.
     *
     * @return array
     */
    private function checkQueue(): array
    {
        try {
            $size = Queue::size('default');
            $status = $size > 1000 ? 'warn' : 'ok';

            return [
                'status'      => $status,
                'queue_size'  => $size,
                'driver'      => config('queue.default'),
            ];
        } catch (\Throwable $e) {
            return ['status' => 'warn', 'error' => 'Tidak dapat cek ukuran queue'];
        }
    }

    /**
     * Cek akses ke file storage.
     *
     * @return array
     */
    private function checkStorage(): array
    {
        try {
            Storage::disk('local')->put('.health', now()->toIso8601String());
            Storage::disk('local')->delete('.health');

            return ['status' => 'ok', 'disk' => 'local'];
        } catch (\Throwable $e) {
            return ['status' => 'fail', 'error' => 'Storage tidak dapat ditulis'];
        }
    }

    /**
     * Cek keterjangkauan payment gateway (simple ping).
     *
     * @return array
     */
    private function checkPaymentGateway(): array
    {
        try {
            // Hanya cek reachability, TIDAK kirim actual request transaksi
            $isProd  = config('services.midtrans.is_production', false);
            $baseUrl = $isProd
                ? 'https://api.midtrans.com'
                : 'https://api.sandbox.midtrans.com';

            $start    = microtime(true);
            $response = \Http::timeout(5)->get("{$baseUrl}/v2/ping");
            $latency  = round((microtime(true) - $start) * 1000, 2);

            return [
                'status'     => $response->successful() ? 'ok' : 'warn',
                'latency_ms' => $latency,
                'mode'       => $isProd ? 'production' : 'sandbox',
            ];
        } catch (\Throwable $e) {
            // Gateway tidak reachable — operasi tunai masih bisa jalan
            return [
                'status' => 'warn',
                'error'  => 'Payment gateway tidak terjangkau (fallback tunai tersedia)',
            ];
        }
    }
}
```

### 7.2 Route Registration

```php
<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\HealthCheckController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\TransactionController;
use App\Http\Controllers\Api\V1\VoidController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SyncController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\WebhookController;

/*
|--------------------------------------------------------------------------
| API Routes — MikoMart POS System
| Version: v1 | Base: /api/v1/
|--------------------------------------------------------------------------
*/

// === PUBLIC ROUTES (No auth required) ===
Route::prefix('v1')->group(function () {

    // Health Check — tidak perlu auth
    Route::get('/health', [HealthCheckController::class, 'check'])
        ->name('health.check');

    // Authentication
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:20,1')  // 20 req/menit per IP
            ->name('login');
    });

    // Webhook (dilindungi HMAC, bukan JWT)
    Route::post('/webhooks/payment', [WebhookController::class, 'payment'])
        ->middleware('webhook.hmac')
        ->name('webhooks.payment');
});

// === AUTHENTICATED ROUTES ===
Route::prefix('v1')
    ->middleware(['auth:sanctum', 'activity.timeout'])
    ->name('api.v1.')
    ->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('/auth/me', [AuthController::class, 'me'])->name('auth.me');

    // Products (semua role bisa GET, hanya admin yang bisa write)
    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');
        Route::get('/{id}', [ProductController::class, 'show'])->name('show');

        Route::middleware('rbac:admin')->group(function () {
            Route::post('/', [ProductController::class, 'store'])->name('store');
            Route::patch('/{id}', [ProductController::class, 'update'])->name('update');
            Route::delete('/{id}', [ProductController::class, 'destroy'])->name('destroy');
        });
    });

    // Transactions
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
        Route::get('/{id}', [TransactionController::class, 'show'])->name('show');
        Route::get('/{id}/receipt', [TransactionController::class, 'receipt'])->name('receipt');

        Route::middleware('rbac:cashier,admin')->group(function () {
            Route::post('/', [TransactionController::class, 'store'])
                ->middleware('idempotency')
                ->name('store');
        });
    });

    // Voids
    Route::prefix('voids')->name('voids.')->group(function () {
        Route::get('/', [VoidController::class, 'index'])
            ->middleware('rbac:admin,supervisor')
            ->name('index');

        Route::post('/', [VoidController::class, 'store'])
            ->middleware('rbac:cashier,admin,supervisor')
            ->name('store');

        Route::middleware('rbac:admin,supervisor')->group(function () {
            Route::post('/{id}/approve', [VoidController::class, 'approve'])->name('approve');
            Route::post('/{id}/reject', [VoidController::class, 'reject'])->name('reject');
        });
    });

    // Reports
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::middleware('rbac:admin,supervisor,owner')->group(function () {
            Route::get('/dashboard', [ReportController::class, 'dashboard'])->name('dashboard');
        });
        Route::middleware('rbac:admin,owner')->group(function () {
            Route::get('/daily', [ReportController::class, 'daily'])->name('daily');
            Route::post('/export', [ReportController::class, 'export'])
                ->middleware('throttle:10,1')
                ->name('export');
        });
    });

    // Sync
    Route::prefix('sync')->name('sync.')->group(function () {
        Route::post('/push', [SyncController::class, 'push'])
            ->middleware('rbac:cashier')
            ->name('push');
        Route::get('/status', [SyncController::class, 'status'])->name('status');
        Route::post('/conflict/resolve', [SyncController::class, 'resolveConflict'])
            ->middleware('rbac:cashier,admin,supervisor')
            ->name('conflict.resolve');
    });

    // Users
    Route::prefix('users')->middleware('rbac:admin')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::patch('/{id}', [UserController::class, 'update'])->name('update');
    });
});
```

---

## 8. HTTP Kernel — Middleware Stack

```php
<?php
// bootstrap/app.php (Laravel 11 style)

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\RbacMiddleware;
use App\Http\Middleware\ActivityTimeoutMiddleware;
use App\Http\Middleware\IdempotencyMiddleware;
use App\Http\Middleware\WebhookHmacMiddleware;
use App\Http\Middleware\SecurityHeadersMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Global middleware (semua request)
        $middleware->append(SecurityHeadersMiddleware::class);

        // API middleware group
        $middleware->api(append: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Named middleware aliases
        $middleware->alias([
            'rbac'             => RbacMiddleware::class,
            'activity.timeout' => ActivityTimeoutMiddleware::class,
            'idempotency'      => IdempotencyMiddleware::class,
            'webhook.hmac'     => WebhookHmacMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Custom exception handler — mengembalikan JSON yang aman (tanpa stack trace di production)
        $exceptions->renderable(function (\Throwable $e, $request) {
            if ($request->wantsJson() || $request->is('api/*')) {
                return app(\App\Exceptions\ApiExceptionHandler::class)->render($request, $e);
            }
        });
    })->create();
```

---

*Dokumen ini adalah bagian dari Fase 5A — Project Scaffold MikoMart POS System.*

**Nomor Dokumen:** MikoMart-IMPL-2026-001 | **Versi:** 1.0 | **Klasifikasi:** INTERNAL — CONFIDENTIAL
