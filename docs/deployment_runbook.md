# DEPLOYMENT DOCUMENT & OPERATIONAL RUNBOOK
## MikoMart Point of Sale (POS) System — Fase 6B

---

| Field | Detail |
|---|---|
| **Nama Sistem** | MikoMart Point of Sale (POS) System |
| **Nomor Dokumen** | MikoMart-DEPLOY-2026-001 |
| **Versi** | 1.0 |
| **Target Go-Live** | [Diisi setelah UAT sign-off] |
| **Deployment Lead** | DevOps Engineer |
| **Approval Required** | QA Lead + Project Manager |
| **Klasifikasi** | INTERNAL — CONFIDENTIAL |

---

## 1. PRE-DEPLOYMENT CHECKLIST

> ✅ = selesai | ❌ = belum / gagal | N/A = tidak berlaku
> **WAJIB semua item ✅ sebelum deployment dimulai.**

---

### 1.1 Infrastructure & Environment

| # | Item | PIC | Status | Catatan |
|---|---|---|---|---|
| INF-01 | Server production siap dan dapat diakses via SSH | DevOps | [ ] | — |
| INF-02 | SSL/TLS certificate valid (tidak expired < 30 hari) | DevOps | [ ] | `openssl s_client -connect api.mikomart.local:443 -servername api.mikomart.local` |
| INF-03 | Nginx/reverse proxy dikonfigurasi dan berjalan | DevOps | [ ] | — |
| INF-04 | MySQL 8.x production instance berjalan | DevOps | [ ] | — |
| INF-05 | Redis berjalan dan dapat diakses | DevOps | [ ] | `redis-cli ping` → PONG |
| INF-06 | Node.js WebSocket server siap | DevOps | [ ] | — |
| INF-07 | Queue worker (Horizon/Supervisor) terkonfigurasi | DevOps | [ ] | — |
| INF-08 | Storage direktori punya permission yang benar (775) | DevOps | [ ] | `ls -la storage/ && ls -la bootstrap/cache/` |

---

### 1.2 Security Checklist

| # | Item | PIC | Status | Catatan |
|---|---|---|---|---|
| SEC-01 | `.env` production tidak mengandung `APP_DEBUG=true` | DevOps | [ ] | `grep APP_DEBUG .env` → harus `false` |
| SEC-02 | `APP_KEY` production unik dan aman (bukan dev key) | DevOps | [ ] | |
| SEC-03 | `JWT_SECRET` production ≥ 64 karakter random | DevOps | [ ] | `cat .env \| grep JWT_SECRET \| wc -c` |
| SEC-04 | Midtrans/Xendit menggunakan production key (bukan sandbox) | DevOps | [ ] | `grep MIDTRANS_IS_PRODUCTION .env` → `true` |
| SEC-05 | SQLite `SQLITE_ENCRYPTION_KEY` berbeda dari dev/staging | DevOps | [ ] | |
| SEC-06 | OWASP ZAP scan terakhir: 0 High/Critical findings | QA Lead | [ ] | Tanggal scan: __________ |
| SEC-07 | Firewall: hanya port 80, 443, 22 (IP whitelist) yang terbuka | DevOps | [ ] | |
| SEC-08 | Akun default database TIDAK digunakan (`root` disabled) | DevOps | [ ] | |
| SEC-09 | File `.env`, `.git`, `storage/` tidak dapat diakses dari web | DevOps | [ ] | `curl -I https://api.mikomart.local/.env` → 403 |
| SEC-10 | HMAC webhook secret dikonfigurasi dan berbeda dari staging | DevOps | [ ] | |

---

### 1.3 Database

| # | Item | PIC | Status | Catatan |
|---|---|---|---|---|
| DB-01 | **Backup database production diambil dan diverifikasi** | DevOps | [ ] | Format: `mikomart_prod_backup_YYYYMMDD_HHMMSS.sql.gz` |
| DB-02 | Backup dapat direstorasi (uji di environment clone) | DevOps | [ ] | Wajib diverifikasi sebelum deployment |
| DB-03 | Migration siap dijalankan dan sudah diuji di staging | Lead Dev | [ ] | `php artisan migrate:status` di staging = semua Applied |
| DB-04 | Setiap migration memiliki fungsi `down()` yang valid | Lead Dev | [ ] | |
| DB-05 | Expand-contract pattern diterapkan (tidak ada breaking migration) | Lead Dev | [ ] | |
| DB-06 | Koneksi database dari Laravel ke MySQL terverifikasi | DevOps | [ ] | `php artisan tinker --execute="DB::connection()->getPdo();"` |

---

### 1.4 Application Build

| # | Item | PIC | Status | Catatan |
|---|---|---|---|---|
| APP-01 | Branch `main` sudah di-merge dari semua perubahan yang direncanakan | Lead Dev | [ ] | `git log --oneline -5` |
| APP-02 | Semua unit test **PASS** (`vendor/bin/pest` = 100%) | QA Lead | [ ] | Coverage report tersedia |
| APP-03 | Test coverage ≥ 80% | QA Lead | [ ] | |
| APP-04 | `composer install --no-dev --optimize-autoloader` berhasil | DevOps | [ ] | Tidak ada error |
| APP-05 | `npm run build` berhasil; assets di `/public/build/` | DevOps | [ ] | |
| APP-06 | `php artisan config:cache`, `route:cache`, `view:cache` berhasil | DevOps | [ ] | |
| APP-07 | Health check endpoint GET /api/v1/health → 200 OK di staging | DevOps | [ ] | |
| APP-08 | UAT sign-off diterima (form ditandatangani) | QA Lead | [ ] | Tanggal: __________ |
| APP-09 | Changelog di CHANGELOG.md diperbarui | Lead Dev | [ ] | |
| APP-10 | Git tag versi dibuat (`v1.0.0`) | Lead Dev | [ ] | `git tag -a v1.0.0 -m "Go-live release"` |

---

### 1.5 Monitoring & Observability

| # | Item | PIC | Status | Catatan |
|---|---|---|---|---|
| MON-01 | Dashboard monitoring aktif dan menampilkan data | DevOps | [ ] | |
| MON-02 | Alert CPU > 80% dikonfigurasi | DevOps | [ ] | |
| MON-03 | Alert Memory > 85% dikonfigurasi | DevOps | [ ] | |
| MON-04 | Alert Error rate > 1% dikonfigurasi | DevOps | [ ] | |
| MON-05 | Alert Disk usage > 80% dikonfigurasi | DevOps | [ ] | |
| MON-06 | Log aggregation berjalan (file audit.log dibaca) | DevOps | [ ] | |
| MON-07 | On-call rotation terkonfigurasi dan kontak valid | PM | [ ] | |

---

### 1.6 Communication

| # | Item | PIC | Status | Catatan |
|---|---|---|---|---|
| COM-01 | Stakeholder diberitahu jadwal and maintenance window | PM | [ ] | |
| COM-02 | Rollback plan dikomunikasikan ke seluruh tim | PM | [ ] | |
| COM-03 | Tim support disiapkan selama H+3 go-live | PM | [ ] | |

---

## 2. DEPLOYMENT PROCEDURE

> **Maintenance Window:** 22.00 – 01.00 WIB (di luar jam operasional)
> **Total Estimasi Waktu:** 45–60 menit

```bash
# ══════════════════════════════════════════
# DEPLOYMENT SCRIPT — MikoMart POS v1.0.0
# Jalankan sebagai: www-data atau deploy user
# ══════════════════════════════════════════

# STEP 1: Catat waktu mulai
echo "=== DEPLOYMENT DIMULAI: $(date) ==="
DEPLOY_LOG="/var/log/mikomart/deployments/deploy_$(date +%Y%m%d_%H%M%S).log"

# STEP 2: Aktifkan maintenance mode
php artisan down --message="MikoMart sedang dalam pemeliharaan. Akan kembali dalam 45 menit." \
  --retry=300
echo "[$(date)] Maintenance mode: ON" >> $DEPLOY_LOG

# STEP 3: BACKUP DATABASE (wajib sebelum migration)
DB_BACKUP_FILE="mikomart_prod_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
mysqldump -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE} | gzip > /backups/${DB_BACKUP_FILE}
echo "[$(date)] Database backup: ${DB_BACKUP_FILE}" >> $DEPLOY_LOG

# Verifikasi backup tidak kosong
if [ ! -s "/backups/${DB_BACKUP_FILE}" ]; then
    echo "ERROR: Backup kosong! Deployment dibatalkan."
    php artisan up
    exit 1
fi

# STEP 4: Pull kode terbaru
git fetch origin
git checkout main
git pull origin main
git log --oneline -3 >> $DEPLOY_LOG
echo "[$(date)] Code pulled: $(git rev-parse --short HEAD)" >> $DEPLOY_LOG

# STEP 5: Install dependencies (production only)
composer install --no-dev --optimize-autoloader --no-interaction
echo "[$(date)] Composer install: DONE" >> $DEPLOY_LOG

# STEP 6: Build frontend assets
npm ci --only=production
npm run build
echo "[$(date)] Frontend build: DONE" >> $DEPLOY_LOG

# STEP 7: Jalankan migration database
# Expand-contract: migration harus backward-compatible
php artisan migrate --force
echo "[$(date)] Migration: DONE" >> $DEPLOY_LOG

# STEP 8: Clear dan rebuild cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
echo "[$(date)] Cache rebuilt: DONE" >> $DEPLOY_LOG

# STEP 9: Storage link (jika belum)
php artisan storage:link

# STEP 10: Restart queue worker
sudo supervisorctl restart mikomart-worker:*
echo "[$(date)] Queue worker restarted" >> $DEPLOY_LOG

# STEP 11: Nonaktifkan maintenance mode
php artisan up
echo "[$(date)] Maintenance mode: OFF" >> $DEPLOY_LOG

# STEP 12: Smoke Test — verifikasi health check
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.mikomart.local/api/v1/health)
if [ "$HEALTH_STATUS" != "200" ]; then
    echo "ERROR: Health check gagal (HTTP ${HEALTH_STATUS})! Mulai rollback..."
    # → Trigger Rollback Tier 1 (lihat Bagian 3)
    exit 1
fi
echo "[$(date)] Health check: OK (HTTP 200)" >> $DEPLOY_LOG
echo "=== DEPLOYMENT SELESAI: $(date) ===" >> $DEPLOY_LOG
echo "✅ Deployment berhasil! Versi: $(git describe --tags)"
```

---

## 3. ROLLBACK PROCEDURE

### KAPAN ROLLBACK DILAKUKAN?

```
Kondisi WAJIB Rollback (tanpa diskusi):
✗ Health check /api/v1/health mengembalikan 503 selama > 5 menit
✗ Error rate transaksi > 5% setelah live
✗ Data integrity issue (transaksi tidak tersimpan, stok negatif)
✗ Security breach terdeteksi

Kondisi DISKUSI DULU sebelum Rollback:
⚠ Performance degradasi (response time P95 > 15 detik)
⚠ Salah satu komponen health check "warn"
⚠ Bug High yang belum ada workaround
```

---

### 3.1 Rollback Tier 1 — Kode Saja (< 15 menit)

> Gunakan jika: bug ada di kode; TIDAK ada perubahan schema database

```bash
# TIER 1 ROLLBACK — Kode saja
echo "=== ROLLBACK TIER 1 DIMULAI: $(date) ==="

# 1. Aktifkan maintenance mode
php artisan down

# 2. Rollback ke commit/tag sebelumnya
git checkout tags/v0.9.x  # Ganti dengan versi sebelumnya

# 3. Reinstall dependencies versi lama
composer install --no-dev --optimize-autoloader --no-interaction

# 4. Rebuild frontend
npm ci && npm run build

# 5. Clear cache
php artisan config:clear && php artisan route:clear
php artisan config:cache && php artisan route:cache

# 6. Restart services
sudo supervisorctl restart mikomart-worker:*

# 7. Aktifkan kembali
php artisan up

# 8. Verifikasi
curl -s https://api.mikomart.local/api/v1/health | python3 -m json.tool
echo "=== ROLLBACK TIER 1 SELESAI: $(date) ==="
```

---

### 3.2 Rollback Tier 2 — Kode + Database (< 30 menit)

> Gunakan jika: ada migration yang perlu di-revert (hanya migration yang tidak merusak data)

```bash
# TIER 2 ROLLBACK — Kode + Migration
echo "=== ROLLBACK TIER 2 DIMULAI: $(date) ==="

# 1. Aktifkan maintenance mode  
php artisan down

# 2. ROLLBACK MIGRATION
# Verifikasi dulu berapa banyak yang perlu di-rollback
php artisan migrate:status

# Rollback 1 batch terakhir
php artisan migrate:rollback --step=1

# Verifikasi status setelah rollback
php artisan migrate:status

# 3. Rollback kode
git checkout tags/v0.9.x
composer install --no-dev --optimize-autoloader

# 4. Rebuild cache
php artisan config:cache && php artisan route:cache

# 5. Aktifkan kembali
php artisan up

# 6. Health check
HEALTH=$(curl -s https://api.mikomart.local/api/v1/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['status'])")
echo "Health status: ${HEALTH}"
echo "=== ROLLBACK TIER 2 SELESAI: $(date) ==="
```

---

### 3.3 Rollback Tier 3 — Full Database Restore (< 60 menit)

> **TERAKHIR DIGUNAKAN!** Hanya jika data corrupt atau Tier 1/2 gagal.
> **PERHATIAN:** Transaksi yang dilakukan SETELAH backup akan HILANG.

```bash
# TIER 3 ROLLBACK — Full DB Restore dari Backup
echo "=== ROLLBACK TIER 3 DIMULAI: $(date) ===" 
echo "⚠️ PERINGATAN: Data setelah backup akan hilang!"

# 1. Konfirmasi dengan PM sebelum lanjut
read -p "Ketik 'CONFIRM_RESTORE' untuk melanjutkan: " CONFIRM
if [ "$CONFIRM" != "CONFIRM_RESTORE" ]; then
    echo "Rollback dibatalkan."
    exit 0
fi

# 2. Aktifkan maintenance mode
php artisan down

# 3. Identifikasi file backup terakhir
BACKUP_FILE=$(ls -t /backups/mikomart_prod_backup_*.sql.gz | head -1)
echo "Restore dari: ${BACKUP_FILE}"

# 4. Drop dan recreate database (HATI-HATI!)
mysql -u ${DB_USERNAME} -p${DB_PASSWORD} -e "DROP DATABASE IF EXISTS ${DB_DATABASE}; CREATE DATABASE ${DB_DATABASE};"

# 5. Restore backup
gunzip < "${BACKUP_FILE}" | mysql -u ${DB_USERNAME} -p${DB_PASSWORD} ${DB_DATABASE}
echo "Database restored dari: ${BACKUP_FILE}"

# 6. Rollback kode ke versi sebelumnya
git checkout tags/v0.9.x
composer install --no-dev --optimize-autoloader
php artisan config:cache && php artisan route:cache

# 7. Aktifkan kembali
php artisan up

# 8. Verifikasi
curl -s https://api.mikomart.local/api/v1/health
echo "=== ROLLBACK TIER 3 SELESAI: $(date) ==="
echo "PENTING: Laporkan ke PM — data dari rentang waktu deployment mungkin hilang."
```

---

## 4. RUNBOOK OPERASIONAL

### 4.1 Troubleshooting — HIGH CPU Usage

**Gejala:** CPU > 80% selama > 5 menit

**Diagnosa:**
```bash
# Cek proses yang paling banyak makan CPU
top -b -n 1 | head -20

# Cek query MySQL yang berjalan lama
mysql -u${DB_USER} -p${DB_PASS} -e "SHOW PROCESSLIST;" | grep -v Sleep

# Cek queue workers
sudo supervisorctl status mikomart-worker:*

# Cek log Laravel untuk exception loop
tail -100 storage/logs/mikomart.log | grep '"level":"ERROR"'
```

**Tindakan:**
```bash
# 1. Jika ada query runaway
mysql -e "KILL QUERY <process_id>;"

# 2. Jika ada worker loop
sudo supervisorctl restart mikomart-worker:*

# 3. Jika tidak ada yang jelas, scale horizontal sementara
# atau aktifkan rate limiting lebih ketat di Nginx
```

---

### 4.2 Troubleshooting — Memory Leak

**Gejala:** Memory usage terus naik, tidak kembali normal setelah request selesai

**Diagnosa:**
```bash
# Pantau memory real-time
watch -n 5 'free -h && echo "---" && php-fpm8.2-memory: $(cat /proc/$(pgrep php-fpm)/status | grep VmRSS)'

# Cek apakah ada Tinker atau artisan berjalan tanpa henti
ps aux | grep artisan
```

**Tindakan:**
```bash
# 1. Restart PHP-FPM
sudo systemctl restart php8.2-fpm

# 2. Restart queue workers
sudo supervisorctl restart mikomart-worker:*

# 3. Clear Laravel cache
php artisan cache:clear
php artisan config:clear

# 4. Jika berulang: cek OpCache settings
php -r "echo opcache_get_configuration()['directives']['opcache.memory_consumption'];"
```

---

### 4.3 Troubleshooting — Database Connection Pool Exhausted

**Gejala:** Error `SQLSTATE[HY000] [1040] Too many connections`

**Diagnosa:**
```bash
# Cek jumlah koneksi aktif
mysql -e "SHOW STATUS WHERE Variable_name = 'Threads_connected';"
mysql -e "SHOW STATUS WHERE Variable_name = 'Max_used_connections';"

# Cek limit konfigurasi
mysql -e "SHOW VARIABLES LIKE 'max_connections';"
```

**Tindakan:**
```bash
# 1. Kill koneksi Sleep yang terlalu lama
mysql -e "SHOW PROCESSLIST;" | awk '{if ($6 > 60) print "KILL "$1";"}' | mysql

# 2. Sementara naikkan limit (jika darurat)
mysql -e "SET GLOBAL max_connections = 500;"

# 3. Jangka panjang: Konfigurasi connection pooling via PgBouncer/ProxySQL
```

---

### 4.4 Troubleshooting — Payment Gateway Down

**Gejala:** Health check mengembalikan `payment_gateway: warn`; kasir tidak bisa proses QRIS/Transfer

**Tindakan:**
1. **Verifikasi status gateway:** Cek https://status.midtrans.com atau https://status.xendit.co
2. **Mode fallback tunai:** Umumkan ke kasir bahwa pembayaran non-tunai tidak tersedia sementara
3. **Catat mulai downtime** untuk klaim SLA ke payment gateway
4. **Pantau health check** setiap 5 menit hingga recovery
5. **Recovery:** Setelah gateway kembali, verifikasi transaksi yang tertahan diproses ulang

---

### 4.5 Troubleshooting — Sync Conflict Spike

**Gejala:** Banyak transaksi dengan `sync_status: conflict`; kasir mendapat notifikasi konflik berulang

**Diagnosa:**
```bash
# Cek jumlah konflik aktif
php artisan tinker --execute="echo App\Models\SyncConflictLog::where('status', 'pending')->count();"

# Cek log sinkronisasi
grep '"action":"SYNC_CONFLICT"' storage/logs/audit.log | tail -20
```

**Tindakan:**
1. Identifikasi kasir dengan konflik terbanyak
2. Hubungi kasir tersebut; minta resolve konflik via UI
3. Jika ada bug di sync service, aktifkan hotfix procedure

---

### 4.6 Troubleshooting — Security Event Terdeteksi

**Gejala:** Log menunjukkan `"security_event": true` berulang dari IP yang sama

**Diagnosa:**
```bash
# Cek IP mencurigakan
grep '"security_event":true' storage/logs/mikomart.log | \
  python3 -c "import sys,json; [print(json.loads(l).get('ip_address')) for l in sys.stdin]" | \
  sort | uniq -c | sort -rn | head -10
```

**Tindakan:**
```bash
# 1. Block IP di Nginx (segera/darurat)
echo "deny <suspicious_ip>;" >> /etc/nginx/conf.d/blocklist.conf
nginx -s reload

# 2. Periksa apakah ada akun yang dikompromis
grep '"event_name":"UNAUTHORIZED_ACCESS_ATTEMPT"' storage/logs/mikomart.log | \
  grep '"user_id"' | head -20

# 3. Jika akun dikompromis: force logout + reset password via admin panel
```

---

### 4.7 Troubleshooting — Disk Storage Penuh

**Gejala:** Alert disk usage > 90%; aplikasi tidak bisa tulis log atau file

**Diagnosa:**
```bash
df -h
du -sh /var/www/mikomart/storage/* | sort -rh | head -10
```

**Tindakan:**
```bash
# 1. Hapus log lama (> 30 hari)
find /var/www/mikomart/storage/logs/ -name "*.log" -mtime +30 -delete

# 2. Compress file PDF struk lama (> 7 hari)
find /var/www/mikomart/storage/receipts/ -name "*.pdf" -mtime +7 -exec gzip {} \;

# 3. Clear expired cache
php artisan cache:clear

# 4. Hapus session file lama
php artisan session:flush

# 5. Jangka panjang: setup log rotation otomatis
```

---

### 4.8 Troubleshooting — Kasir Tidak Bisa Login

**Gejala:** Kasir melaporkan tidak bisa login; password benar

**Diagnosa:**
```bash
# Cek apakah akun terkunci
php artisan tinker --execute="
  \$user = App\Models\User::where('username', 'kasir01')->first();
  echo 'Status: ' . \$user->status . PHP_EOL;
  echo 'Failed attempts: ' . \$user->failed_login_attempts . PHP_EOL;
"
```

**Tindakan:**
```bash
# 1. Reset lockout via artisan (jika terkunci brute-force)
php artisan auth:unlock kasir01

# 2. Reset password jika diperlukan
php artisan user:reset-password kasir01 --notify

# 3. Cek error log terbaru
grep '"username":"kasir01"' storage/logs/mikomart.log | tail -5

# 4. Verifikasi JWT_SECRET tidak berubah (token invalidasi massal)
php artisan tinker --execute="echo config('auth.jwt_secret_hash')[0:8];"
```

---

## 5. MONITORING METRICS DASHBOARD

### 5.1 Metrik yang Dipantau

| Metrik | SLO Target | Warning | Critical | Action |
|---|---|---|---|---|
| **API Response P95** | ≤ 10 detik | > 8 detik | > 15 detik | Cek query slow log |
| **Error Rate Transaksi** | < 0.5% | > 0.5% | > 2% | Cek 5xx log; rollback kandidat |
| **CPU Usage** | < 70% | > 80% | > 95% | Scale atau kill runaway process |
| **Memory Usage** | < 70% | > 85% | > 95% | Restart PHP-FPM; cek memory leak |
| **Disk Usage** | < 70% | > 80% | > 90% | Cleanup log lama |
| **Active DB Connections** | < 80% max | > 70% max | > 90% max | Kill sleep connections |
| **Queue Depth** | < 1000 | > 500 | > 2000 | Scale queue workers |
| **Pending Sync** | < 50 | > 100 | > 500 | Cek SyncService; koneksi kasir |
| **Uptime** | ≥ 99.5% | < 99.5% | < 99% | Eskalasi ke DevOps |
| **Health Check Status** | 200 OK | 503 degraded | 503 fail | Immediate investigation |
| **Audit Log Write Rate** | Normal | Naik 3× | Naik 10× | Investigasi security event |
| **Payment Gateway Latency** | < 5 detik | > 5 detik | Timeout | Aktifkan mode tunai-only |

### 5.2 Dashboard Query (contoh untuk Grafana/CloudWatch)

```bash
# Transaksi per menit (real-time)
SELECT COUNT(*) as trx_per_minute
FROM transactions
WHERE created_at >= NOW() - INTERVAL 1 MINUTE
  AND status = 'completed';

# Error rate 5 menit terakhir
SELECT
  COUNT(*) as total_requests,
  SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) as errors,
  ROUND(SUM(CASE WHEN status_code >= 500 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as error_rate_pct
FROM request_logs
WHERE created_at >= NOW() - INTERVAL 5 MINUTE;

# Sync yang masih pending per kasir
SELECT cashier_id, COUNT(*) as pending_count
FROM transactions
WHERE sync_status = 'pending'
GROUP BY cashier_id
ORDER BY pending_count DESC;
```

---

## 6. POST-DEPLOYMENT MONITORING CHECKLIST

### T+0 (Segera Setelah Deploy Live)

| # | Check | Metode | Status |
|---|---|---|---|
| PD-01 | Health check endpoint | `curl https://api.mikomart.local/api/v1/health` → HTTP 200 | [ ] |
| PD-02 | Login kasir berhasil | Buka UI; login manual | [ ] |
| PD-03 | Buat 1 transaksi uji (tunai kecil) | Eksekusi manual di staging clone | [ ] |
| PD-04 | Verifikasi stok berkurang setelah transaksi uji | Periksa di admin dashboard | [ ] |
| PD-05 | Error rate di log = 0% | `grep '"level":"ERROR"' storage/logs/mikomart.log \| wc -l` = 0 | [ ] |
| PD-06 | Queue worker aktif | `sudo supervisorctl status` | [ ] |
| PD-07 | Audit log berjalan | Cek `/storage/logs/audit.log` ada entry baru | [ ] |

### T+1 Jam (1 Jam Setelah Go-Live)

| # | Check | Target | Status |
|---|---|---|---|
| PD-08 | API Response P95 | ≤ 10 detik | [ ] |
| PD-09 | Error rate keseluruhan | < 0.5% | [ ] |
| PD-10 | CPU & Memory stabil | CPU < 70%; Mem < 70% | [ ] |
| PD-11 | Transaksi real berhasil dicatat | Periksa database | [ ] |
| PD-12 | Tidak ada laporan kasir tidak bisa login | Konfirmasi dengan tim kasir | [ ] |

### T+24 Jam (Satu Hari Setelah Go-Live)

| # | Check | Target | Status |
|---|---|---|---|
| PD-13 | Total transaksi hari pertama tercatat lengkap | Cocokkan dengan laporan manual kasir | [ ] |
| PD-14 | Sinkronisasi offline selesai | `sync_status != 'pending'` untuk semua transaksi kemarin | [ ] |
| PD-15 | Tidak ada bug Critical/High terbaru | Periksa bug tracker | [ ] |
| PD-16 | Disk usage tidak naik drastis | < 60% | [ ] |
| PD-17 | Laporan harian Owner dapat dibuka | Test di UI Owner | [ ] |

### T+7 Hari (Satu Minggu Setelah Go-Live)

| # | Check | Target | Status |
|---|---|---|---|
| PD-18 | Uptime 7 hari | ≥ 99.5% | [ ] |
| PD-19 | Tidak ada Memory leak | Memory stabil setiap hari | [ ] |
| PD-20 | SLO compliance | Semua SLO terpenuhi | [ ] |
| PD-21 | Laporan bulanan Owner tersedia (jika sudah akhir bulan) | Test akses laporan bulanan | [ ] |
| PD-22 | Tech Debt Sprint 2 dimulai | TD-001, TD-004, TD-009, TD-011 | [ ] |

---

## 7. ON-CALL ESCALATION MATRIX

| Severity | Response Time | Notify | Eskalasi Ke |
|---|---|---|---|
| P1 — System Down | < 15 menit | DevOps on-call | PM + Tech Lead |
| P2 — Performance Degraded | < 1 jam | DevOps on-call | Tech Lead |
| P3 — Feature Bug | < 4 jam | Lead Developer | PM |
| P4 — Cosmetic | Next business day | Developer | — |

```
On-Call Contact (Ganti dengan data aktual):
DevOps: +62-xxx-xxxx-xxxx (WhatsApp)
Tech Lead: +62-xxx-xxxx-xxxx
PM: +62-xxx-xxxx-xxxx
```

---

*Dokumen ini adalah bagian dari Fase 6B — Deployment & Runbook MikoMart POS System.*

**Nomor Dokumen:** MikoMart-DEPLOY-2026-001 | **Versi:** 1.0 | **Klasifikasi:** INTERNAL — CONFIDENTIAL
