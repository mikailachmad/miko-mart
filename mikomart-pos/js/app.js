/**
 * =============================================================================
 * MikoMart POS — Main Application Controller
 * =============================================================================
 * Modul utama yang mengontrol:
 * - Inisialisasi aplikasi & database
 * - Routing antar halaman (Login, POS, Admin, Supervisor)
 * - Sidebar navigation
 * - Global notification system
 * - Keyboard shortcuts
 *
 * @version 1.0.0
 * @date    28 Maret 2026
 * =============================================================================
 */

const App = (() => {
    let currentPage = 'login';

    /**
     * Inisialisasi aplikasi — dipanggil saat DOM ready
     */
    async function init() {
        try {
            // Inisialisasi database
            await MikoDB.init();
            await MikoDB.seed();

            // Cek session aktif
            if (Auth.isLoggedIn()) {
                const session = Auth.getSession();
                Auth.startIdleTimer();
                showDashboard(session.role);
            } else {
                showLogin();
            }

            // Setup keyboard shortcuts global
            setupKeyboardShortcuts();

            console.log('[App] MikoMart POS berhasil diinisialisasi.');
        } catch (error) {
            console.error('[App] Gagal inisialisasi:', error);
            document.getElementById('app').innerHTML = `
                <div class="error-screen">
                    <h1>⚠️ Error</h1>
                    <p>Gagal menginisialisasi aplikasi: ${error.message}</p>
                    <p>Pastikan browser mendukung IndexedDB.</p>
                    <button onclick="location.reload()">Muat Ulang</button>
                </div>
            `;
        }
    }

    // =========================================================================
    // ROUTING & PAGE RENDERING
    // =========================================================================

    /**
     * Tampilkan halaman login
     */
    function showLogin() {
        currentPage = 'login';
        const app = document.getElementById('app');
        app.className = 'app-login';
        app.innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <div class="login-header">
                        <div class="login-logo">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="var(--primary)"/>
                                <line x1="3" y1="6" x2="21" y2="6" stroke="var(--primary)"/>
                                <path d="M16 10a4 4 0 01-8 0" stroke="var(--primary)"/>
                            </svg>
                        </div>
                        <h1 class="login-title">MikoMart</h1>
                        <p class="login-subtitle">Sistem Point of Sale</p>
                    </div>
                    <form class="login-form" onsubmit="App.handleLogin(event)">
                        <div class="form-group">
                            <label class="form-label" for="login-username">Username</label>
                            <div class="input-icon-wrapper">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                <input type="text" id="login-username" class="form-input" placeholder="Masukkan username" required autofocus>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="login-password">Password</label>
                            <div class="input-icon-wrapper">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                                <input type="password" id="login-password" class="form-input" placeholder="Masukkan password" required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary btn-login" id="login-btn">
                            Masuk
                        </button>
                        <div id="login-error" class="login-error" style="display:none"></div>
                    </form>
                    <div class="login-footer">
                        <p>Demo: <code>admin</code> / <code>admin123</code></p>
                        <p><code>kasir1</code> / <code>kasir123</code> · <code>supervisor</code> / <code>super123</code></p>
                    </div>
                </div>
                <div class="login-bg-decor"></div>
            </div>
        `;
    }

    /**
     * Handle form login
     */
    async function handleLogin(event) {
        event.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        const loginBtn = document.getElementById('login-btn');

        loginBtn.disabled = true;
        loginBtn.textContent = 'Memproses...';
        errorDiv.style.display = 'none';

        try {
            const session = await Auth.login(username, password);
            showDashboard(session.role);
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
            loginBtn.disabled = false;
            loginBtn.textContent = 'Masuk';
        }
    }

    /**
     * Tampilkan dashboard berdasarkan peran pengguna
     */
    function showDashboard(role) {
        const session = Auth.getSession();
        if (!session) { showLogin(); return; }

        const app = document.getElementById('app');
        app.className = 'app-dashboard';

        const menuItems = getMenuItems(role);

        app.innerHTML = `
            <aside class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-logo">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                        <span class="sidebar-brand">MikoMart</span>
                    </div>
                </div>
                <nav class="sidebar-nav">
                    ${menuItems.map(item => `
                        <button class="nav-item ${item.id === getDefaultPage(role) ? 'active' : ''}"
                                id="nav-${item.id}" onclick="App.navigate('${item.id}')">
                            ${item.icon}
                            <span>${item.label}</span>
                            ${item.badge ? `<span class="nav-badge" id="${item.badge}"></span>` : ''}
                        </button>
                    `).join('')}
                </nav>
                <div class="sidebar-footer">
                    <div class="user-info">
                        <div class="user-avatar">${session.name.charAt(0).toUpperCase()}</div>
                        <div class="user-details">
                            <span class="user-name">${POS.escapeHtml(session.name)}</span>
                            <span class="user-role">${session.role.charAt(0).toUpperCase() + session.role.slice(1)}</span>
                        </div>
                    </div>
                    <button class="btn-logout" onclick="App.handleLogout()" title="Keluar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    </button>
                </div>
            </aside>
            <main class="main-content">
                <header class="topbar">
                    <button class="topbar-menu-btn" onclick="App.toggleSidebar()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                    </button>
                    <div class="topbar-right">
                        <span class="topbar-status" id="topbar-status">● Offline Mode (Lokal)</span>
                        <span class="topbar-time" id="topbar-time"></span>
                    </div>
                </header>
                <div class="page-container" id="page-content">
                    <!-- Dynamic content loaded here -->
                </div>
            </main>
            <div id="app-modal" class="modal-wrapper" style="display:none"></div>
            <div id="notification-container" class="notification-container"></div>
        `;

        // Start clock
        updateClock();
        setInterval(updateClock, 1000);

        // Navigate to default page
        navigate(getDefaultPage(role));
    }

    /**
     * Dapatkan menu sidebar berdasarkan peran
     */
    function getMenuItems(role) {
        const menus = {
            kasir: [
                { id: 'pos', label: 'Transaksi POS', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>', badge: 'held-badge' }
            ],
            supervisor: [
                { id: 'reports', label: 'Laporan Penjualan', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>' }
            ],
            admin: [
                { id: 'products', label: 'Manajemen Produk', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>' },
                { id: 'users', label: 'Manajemen Pengguna', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
                { id: 'reports', label: 'Laporan Penjualan', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>' }
            ]
        };
        return menus[role] || [];
    }

    function getDefaultPage(role) {
        const defaults = { kasir: 'pos', supervisor: 'reports', admin: 'products' };
        return defaults[role] || 'pos';
    }

    /**
     * Navigasi ke halaman tertentu
     */
    async function navigate(pageId) {
        currentPage = pageId;

        // Update active nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const activeNav = document.getElementById(`nav-${pageId}`);
        if (activeNav) activeNav.classList.add('active');

        // Render halaman
        switch(pageId) {
            case 'pos':
                await renderPOSPage();
                break;
            case 'products':
                await Products.render();
                break;
            case 'users':
                await Users.render();
                break;
            case 'reports':
                await Reports.render();
                break;
        }
    }

    /**
     * Render halaman POS kasir
     */
    async function renderPOSPage() {
        const container = document.getElementById('page-content');
        if (!container) return;

        container.innerHTML = `
            <div class="pos-layout">
                <div class="pos-left">
                    <div class="pos-scan-bar">
                        <div class="scan-input-wrapper">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                                <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                            </svg>
                            <input type="text" id="barcode-input" class="scan-input" placeholder="Scan barcode atau ketik kode produk..." autofocus
                                onkeydown="if(event.key==='Enter'){App.handleBarcodeScan(); event.preventDefault();}">
                            <button class="btn btn-primary scan-btn" onclick="App.handleBarcodeScan()">Scan</button>
                        </div>
                        <div class="scan-shortcuts">
                            <kbd>F1</kbd> Cari &nbsp;
                            <kbd>F3</kbd> Hapus &nbsp;
                            <kbd>F5</kbd> Tahan &nbsp;
                            <kbd>F8</kbd> Recall &nbsp;
                            <kbd>F12</kbd> Bayar &nbsp;
                            <kbd>Esc</kbd> Batal
                        </div>
                    </div>

                    <div class="pos-cart">
                        <div class="cart-header">
                            <span class="cart-title">🛒 Keranjang Belanja</span>
                            <span class="cart-count" id="pos-item-count">0 item</span>
                        </div>
                        <div class="cart-table-wrapper">
                            <table class="cart-table">
                                <thead>
                                    <tr>
                                        <th class="th-num">#</th>
                                        <th class="th-product">Produk</th>
                                        <th class="th-price">Harga</th>
                                        <th class="th-qty">Qty</th>
                                        <th class="th-subtotal">Subtotal</th>
                                        <th class="th-action"></th>
                                    </tr>
                                </thead>
                                <tbody id="cart-body"></tbody>
                            </table>
                            <div class="cart-empty" id="empty-cart">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
                                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                                </svg>
                                <p>Keranjang kosong</p>
                                <p class="cart-empty-hint">Scan barcode produk untuk memulai transaksi</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pos-right">
                    <div class="pos-summary">
                        <div class="summary-header">
                            <span class="summary-title">💰 Pembayaran</span>
                            <span class="summary-tx-num" id="pos-tx-number"></span>
                        </div>

                        <div class="summary-rows">
                            <div class="summary-row">
                                <span>Subtotal</span>
                                <span id="pos-subtotal">Rp 0</span>
                            </div>
                            <div class="summary-row summary-tax">
                                <span>PPN (11%)</span>
                                <span id="pos-tax">Rp 0</span>
                            </div>
                            <div class="summary-divider"></div>
                            <div class="summary-row summary-grand">
                                <span>TOTAL</span>
                                <span id="pos-total">Rp 0</span>
                            </div>
                        </div>

                        <div class="payment-section">
                            <div class="form-group">
                                <label class="form-label">Tunai (Rp)</label>
                                <input type="number" id="cash-input" class="form-input cash-input" placeholder="0" min="0"
                                    oninput="App.updateChange()">
                            </div>
                            <div class="change-display" id="change-display">
                                <span class="change-label">Kembalian</span>
                                <span class="change-value" id="change-value">Rp 0</span>
                            </div>
                        </div>

                        <div class="pos-actions">
                            <button class="btn btn-success btn-pay" id="btn-pay" onclick="App.handlePayment()">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                                Bayar [F12]
                            </button>
                            <div class="pos-actions-secondary">
                                <button class="btn btn-outline btn-sm" onclick="App.handleHold()">
                                    <span id="held-badge" class="held-badge" style="display:none">0</span>
                                    ⏸ Tahan [F5]
                                </button>
                                <button class="btn btn-outline btn-sm" onclick="App.handleClearCart()">
                                    🗑 Kosongkan [Esc]
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await POS.init();

        // Focus barcode input
        setTimeout(() => {
            const input = document.getElementById('barcode-input');
            if (input) input.focus();
        }, 100);
    }

    // =========================================================================
    // EVENT HANDLERS
    // =========================================================================

    async function handleBarcodeScan() {
        const input = document.getElementById('barcode-input');
        if (!input) return;

        const barcode = input.value.trim();
        if (!barcode) return;

        try {
            await POS.scanBarcode(barcode);
            input.value = '';
            input.focus();
        } catch (error) {
            showNotification(error.message, 'error');
            input.select();
        }
    }

    function updateChange() {
        const cashInput = document.getElementById('cash-input');
        const changeValue = document.getElementById('change-value');
        const changeDisplay = document.getElementById('change-display');
        if (!cashInput || !changeValue) return;

        const cash = parseInt(cashInput.value) || 0;
        const change = POS.calculateChange(cash);

        changeValue.textContent = `Rp ${POS.formatCurrency(Math.abs(change))}`;
        if (change < 0) {
            changeDisplay.className = 'change-display change-negative';
            changeValue.textContent = `- Rp ${POS.formatCurrency(Math.abs(change))}`;
        } else {
            changeDisplay.className = 'change-display change-positive';
        }
    }

    async function handlePayment() {
        const cashInput = document.getElementById('cash-input');
        if (!cashInput) return;

        const cash = parseInt(cashInput.value) || 0;

        try {
            const transaction = await POS.processPayment(cash);
            showNotification(`Transaksi ${transaction.transactionNumber} berhasil! Kembalian: Rp ${POS.formatCurrency(transaction.change)}`, 'success');

            // Tampilkan struk
            Receipt.showReceiptModal(transaction);

            // Reset payment input
            cashInput.value = '';
            updateChange();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    function handleHold() {
        POS.holdTransaction();
    }

    function handleClearCart() {
        if (POS.getCart().length === 0) return;
        if (confirm('Kosongkan seluruh keranjang?')) {
            POS.clearCart();
            showNotification('Keranjang dikosongkan.', 'info');
        }
    }

    async function handleLogout() {
        await Auth.logout();
        showLogin();
        showNotification('Anda telah berhasil keluar.', 'success');
    }

    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('collapsed');
    }

    function closeModal() {
        const modal = document.getElementById('app-modal');
        if (modal) { modal.style.display = 'none'; modal.innerHTML = ''; }
        // Refocus barcode input if on POS page
        if (currentPage === 'pos') {
            const input = document.getElementById('barcode-input');
            if (input) input.focus();
        }
    }

    // =========================================================================
    // KEYBOARD SHORTCUTS
    // =========================================================================

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (currentPage !== 'pos') return;
            if (e.target.tagName === 'INPUT' && e.key !== 'F1' && e.key !== 'F3'
                && e.key !== 'F5' && e.key !== 'F8' && e.key !== 'F12' && e.key !== 'Escape') return;

            switch(e.key) {
                case 'F1':
                    e.preventDefault();
                    showSearchModal();
                    break;
                case 'F3':
                    e.preventDefault();
                    // Hapus item terakhir
                    const cart = POS.getCart();
                    if (cart.length > 0) POS.removeFromCart(cart.length - 1);
                    break;
                case 'F5':
                    e.preventDefault();
                    POS.holdTransaction();
                    break;
                case 'F8':
                    e.preventDefault();
                    showHeldTransactions();
                    break;
                case 'F12':
                    e.preventDefault();
                    handlePayment();
                    break;
                case 'Escape':
                    e.preventDefault();
                    const modal = document.getElementById('app-modal');
                    if (modal && modal.style.display === 'block') {
                        closeModal();
                    } else {
                        handleClearCart();
                    }
                    break;
            }
        });
    }

    /**
     * Modal pencarian produk manual (F1)
     */
    async function showSearchModal() {
        const modal = document.getElementById('app-modal');
        modal.innerHTML = `
            <div class="modal-overlay" onclick="App.closeModal()">
                <div class="modal-content modal-md" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2 class="modal-title">🔍 Cari Produk</h2>
                        <button class="modal-close" onclick="App.closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <input type="text" class="form-input" id="search-product-input"
                                placeholder="Ketik nama atau kode produk..." autofocus
                                oninput="App.handleProductSearch(this.value)">
                        </div>
                        <div class="search-results" id="search-results">
                            <p class="search-hint">Ketik minimal 2 karakter untuk mencari...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    }

    async function handleProductSearch(keyword) {
        const resultsDiv = document.getElementById('search-results');
        if (!resultsDiv) return;

        if (keyword.length < 2) {
            resultsDiv.innerHTML = '<p class="search-hint">Ketik minimal 2 karakter untuk mencari...</p>';
            return;
        }

        const products = await POS.searchProducts(keyword);

        if (products.length === 0) {
            resultsDiv.innerHTML = '<p class="search-hint">Produk tidak ditemukan.</p>';
            return;
        }

        resultsDiv.innerHTML = products.map(p => `
            <button class="search-result-item" onclick="App.selectSearchProduct(${p.id})">
                <div class="search-result-info">
                    <strong>${POS.escapeHtml(p.name)}</strong>
                    <small>${p.barcode} · Stok: ${p.stock}</small>
                </div>
                <span class="search-result-price">Rp ${POS.formatCurrency(p.price)}</span>
            </button>
        `).join('');
    }

    async function selectSearchProduct(productId) {
        const product = await MikoDB.getById('products', productId);
        if (product) {
            POS.addToCart(product);
            closeModal();
        }
    }

    /**
     * Modal transaksi ditahan (F8)
     */
    function showHeldTransactions() {
        const held = POS.getHeldTransactions();
        const modal = document.getElementById('app-modal');
        modal.innerHTML = `
            <div class="modal-overlay" onclick="App.closeModal()">
                <div class="modal-content modal-sm" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2 class="modal-title">⏸ Transaksi Ditahan (${held.length})</h2>
                        <button class="modal-close" onclick="App.closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        ${held.length === 0 ? '<p class="search-hint">Tidak ada transaksi yang ditahan.</p>' :
                        held.map((h, i) => `
                            <button class="search-result-item" onclick="POS.recallTransaction(${i}); App.closeModal();">
                                <div class="search-result-info">
                                    <strong>${h.transactionNumber}</strong>
                                    <small>${h.cart.length} item · ${new Date(h.heldAt).toLocaleTimeString('id-ID')}</small>
                                </div>
                                <span class="search-result-price">Recall →</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    }

    // =========================================================================
    // NOTIFICATION SYSTEM
    // =========================================================================

    /**
     * Tampilkan notifikasi toast
     * @param {string} message - Pesan
     * @param {string} type - 'success', 'error', 'warning', 'info'
     */
    function showNotification(message, type = 'info') {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️'
        };

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(notification);

        // Auto-remove setelah 4 detik
        setTimeout(() => {
            notification.classList.add('notification-exit');
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }

    /**
     * Update jam di topbar
     */
    function updateClock() {
        const el = document.getElementById('topbar-time');
        if (el) {
            const now = new Date();
            el.textContent = now.toLocaleTimeString('id-ID', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }) + ' WIB';
        }
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================
    return {
        init, showLogin, showDashboard, navigate, handleLogin,
        handleBarcodeScan, handlePayment, handleHold, handleClearCart, handleLogout,
        updateChange, toggleSidebar, closeModal, showNotification,
        handleProductSearch, selectSearchProduct, showSearchModal
    };
})();

// =========================================================================
// BOOTSTRAP — Mulai aplikasi saat DOM siap
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
