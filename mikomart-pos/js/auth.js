/**
 * =============================================================================
 * MikoMart POS — Authentication & Authorization Module
 * =============================================================================
 * Modul ini menangani:
 * - Login/logout pengguna
 * - Session management (idle timeout 15 menit)
 * - Role-Based Access Control (RBAC): Admin, Supervisor, Kasir
 * - Activity logging (audit trail)
 *
 * @version 1.0.0
 * @date    28 Maret 2026
 * =============================================================================
 */

const Auth = (() => {
    // Session key di localStorage
    const SESSION_KEY = 'mikomart_session';
    const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 menit dalam ms
    let idleTimer = null;

    /**
     * Login pengguna dengan username dan password
     * @param {string} username
     * @param {string} password
     * @returns {Promise<Object>} Data user yang berhasil login
     * @throws {Error} Jika kredensial salah atau akun nonaktif
     */
    async function login(username, password) {
        try {
            // Cari user berdasarkan username
            const user = await MikoDB.getByIndex('users', 'username', username);

            if (!user) {
                throw new Error('Username tidak ditemukan.');
            }

            if (user.status !== 'active') {
                throw new Error('Akun Anda telah dinonaktifkan. Hubungi Admin.');
            }

            // Verifikasi password (plain text untuk demo)
            if (user.password !== password) {
                throw new Error('Password salah.');
            }

            // Simpan session
            const session = {
                userId: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
                loginAt: new Date().toISOString(),
                lastActivity: new Date().toISOString()
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));

            // Log aktivitas login
            await logActivity(user.id, 'LOGIN', `${user.name} (${user.role}) berhasil login`);

            // Mulai idle timer
            startIdleTimer();

            return session;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Logout pengguna — hapus session dan log aktivitas
     */
    async function logout() {
        try {
            const session = getSession();
            if (session) {
                await logActivity(session.userId, 'LOGOUT', `${session.name} logout`);
            }
        } catch (e) {
            // Abaikan error logging saat logout
        }
        localStorage.removeItem(SESSION_KEY);
        stopIdleTimer();
    }

    /**
     * Ambil data session aktif
     * @returns {Object|null} Data session atau null jika tidak ada
     */
    function getSession() {
        try {
            const data = localStorage.getItem(SESSION_KEY);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    }

    /**
     * Cek apakah pengguna sudah login
     * @returns {boolean}
     */
    function isLoggedIn() {
        return getSession() !== null;
    }

    /**
     * Ambil peran pengguna yang sedang login
     * @returns {string|null} 'admin', 'supervisor', 'kasir', atau null
     */
    function getRole() {
        const session = getSession();
        return session ? session.role : null;
    }

    /**
     * Cek apakah pengguna memiliki akses ke fitur tertentu
     * Matriks hak akses sesuai SRS:
     *   - Admin: kelola produk, kelola user, void, laporan, konfigurasi
     *   - Supervisor: void, laporan, ekspor
     *   - Kasir: transaksi POS
     *
     * @param {string} feature - Nama fitur yang ingin diakses
     * @returns {boolean}
     */
    function hasAccess(feature) {
        const role = getRole();
        if (!role) return false;

        const accessMatrix = {
            admin: ['products', 'users', 'void', 'reports', 'config', 'tax', 'dashboard_admin'],
            supervisor: ['void', 'reports', 'export', 'dashboard_supervisor'],
            kasir: ['pos', 'dashboard_kasir']
        };

        return (accessMatrix[role] || []).includes(feature);
    }

    // =========================================================================
    // IDLE TIMEOUT MANAGEMENT
    // =========================================================================

    /**
     * Mulai timer idle — auto-logout setelah 15 menit tanpa aktivitas
     */
    function startIdleTimer() {
        stopIdleTimer();
        resetIdleTimer();

        // Event listener untuk mendeteksi aktivitas pengguna
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
            document.addEventListener(event, resetIdleTimer, { passive: true });
        });
    }

    /**
     * Reset timer idle — dipanggil setiap kali ada aktivitas pengguna
     */
    function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);

        // Update last activity di session
        const session = getSession();
        if (session) {
            session.lastActivity = new Date().toISOString();
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }

        idleTimer = setTimeout(async () => {
            // Auto-logout karena idle
            await logout();
            if (typeof App !== 'undefined' && App.showLogin) {
                App.showLogin();
                App.showNotification('Sesi Anda telah berakhir karena tidak ada aktivitas selama 15 menit.', 'warning');
            }
        }, IDLE_TIMEOUT);
    }

    /**
     * Hentikan timer idle
     */
    function stopIdleTimer() {
        if (idleTimer) {
            clearTimeout(idleTimer);
            idleTimer = null;
        }
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
            document.removeEventListener(event, resetIdleTimer);
        });
    }

    // =========================================================================
    // ACTIVITY LOGGING
    // =========================================================================

    /**
     * Catat aktivitas pengguna ke audit trail
     * @param {number} userId - ID pengguna
     * @param {string} action - Jenis aksi (LOGIN, LOGOUT, TRANSACTION, dll)
     * @param {string} details - Detail aksi
     */
    async function logActivity(userId, action, details) {
        try {
            await MikoDB.add('activity_logs', {
                userId: userId,
                action: action,
                details: details,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('[Auth] Gagal mencatat aktivitas:', error);
        }
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================
    return {
        login,
        logout,
        getSession,
        isLoggedIn,
        getRole,
        hasAccess,
        logActivity,
        startIdleTimer
    };
})();
