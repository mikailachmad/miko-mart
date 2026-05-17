/**
 * =============================================================================
 * MikoMart POS — Point of Sale Transaction Module
 * =============================================================================
 * Modul ini menangani seluruh logika transaksi POS:
 * - Scan barcode → tampil produk dari database
 * - Manajemen keranjang belanja (tambah, edit qty, hapus item)
 * - Kalkulasi subtotal, PPN 11%, grand total
 * - Pembayaran tunai & hitung kembalian
 * - Simpan transaksi, kurangi stok, cetak struk
 * - Hold & recall transaksi
 *
 * @version 1.0.0
 * @date    28 Maret 2026
 * =============================================================================
 */

const POS = (() => {
    // State keranjang belanja
    let cart = [];
    let taxRate = 11; // PPN default 11%
    let heldTransactions = []; // Transaksi yang ditahan
    let currentTransactionNumber = '';

    /**
     * Inisialisasi modul POS — load tax rate dari DB
     */
    async function init() {
        try {
            const taxConfig = await MikoDB.getById('tax_config', 1);
            if (taxConfig) {
                taxRate = taxConfig.rate;
            }
            currentTransactionNumber = await generateTransactionNumber();
            cart = [];
            updateDisplay();
        } catch (error) {
            console.error('[POS] Error inisialisasi:', error);
        }
    }

    /**
     * Generate nomor transaksi unik: MKM-YYYYMMDD-NNNN
     * @returns {Promise<string>} Nomor transaksi
     */
    async function generateTransactionNumber() {
        const now = new Date();
        const dateStr = now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0');

        // Hitung transaksi hari ini
        const allTx = await MikoDB.getAll('transactions');
        const todayPrefix = `MKM-${dateStr}`;
        const todayTx = allTx.filter(t => t.transactionNumber.startsWith(todayPrefix));
        const nextNum = todayTx.length + 1;

        return `MKM-${dateStr}-${String(nextNum).padStart(4, '0')}`;
    }

    // =========================================================================
    // BARCODE SCANNING & PENCARIAN PRODUK
    // =========================================================================

    /**
     * Proses input barcode — cari produk dan tambah ke keranjang
     * Barcode scanner USB bekerja sebagai keyboard input + Enter
     * @param {string} barcode - Kode barcode produk (EAN-13)
     * @returns {Promise<Object|null>} Produk yang ditemukan atau null
     */
    async function scanBarcode(barcode) {
        try {
            if (!barcode || barcode.trim() === '') {
                throw new Error('Barcode tidak boleh kosong.');
            }

            const product = await MikoDB.getByIndex('products', 'barcode', barcode.trim());

            if (!product) {
                throw new Error(`Produk dengan barcode "${barcode}" tidak ditemukan. Gunakan pencarian manual (F1).`);
            }

            if (product.status !== 'active') {
                throw new Error(`Produk "${product.name}" sudah tidak aktif.`);
            }

            if (product.stock <= 0) {
                throw new Error(`Stok "${product.name}" habis (stok: 0).`);
            }

            addToCart(product);
            return product;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Cari produk secara manual berdasarkan nama (fallback jika barcode rusak)
     * @param {string} keyword - Kata kunci pencarian
     * @returns {Promise<Array>} Daftar produk yang cocok
     */
    async function searchProducts(keyword) {
        try {
            const allProducts = await MikoDB.getAll('products');
            const kw = keyword.toLowerCase().trim();

            return allProducts.filter(p =>
                p.status === 'active' &&
                (p.name.toLowerCase().includes(kw) ||
                 p.barcode.includes(kw))
            );
        } catch (error) {
            console.error('[POS] Error pencarian:', error);
            return [];
        }
    }

    // =========================================================================
    // MANAJEMEN KERANJANG BELANJA
    // =========================================================================

    /**
     * Tambah produk ke keranjang; jika sudah ada → increment qty
     * @param {Object} product - Data produk dari database
     * @param {number} qty - Jumlah (default: 1)
     */
    function addToCart(product, qty = 1) {
        const existingIndex = cart.findIndex(item => item.productId === product.id);

        if (existingIndex >= 0) {
            // Produk sudah ada — increment kuantitas
            const newQty = cart[existingIndex].qty + qty;

            // Validasi stok
            if (newQty > product.stock) {
                App.showNotification(`Stok "${product.name}" tidak mencukupi (tersisa: ${product.stock}).`, 'error');
                return;
            }

            cart[existingIndex].qty = newQty;
            cart[existingIndex].subtotal = newQty * cart[existingIndex].price;
        } else {
            // Produk baru — tambah ke keranjang
            if (qty > product.stock) {
                App.showNotification(`Stok "${product.name}" tidak mencukupi (tersisa: ${product.stock}).`, 'error');
                return;
            }

            cart.push({
                productId: product.id,
                barcode: product.barcode,
                name: product.name,
                price: product.price,
                qty: qty,
                subtotal: qty * product.price
            });
        }

        updateDisplay();
    }

    /**
     * Ubah kuantitas item di keranjang
     * @param {number} index - Index item dalam array cart
     * @param {number} newQty - Kuantitas baru
     */
    async function updateQuantity(index, newQty) {
        if (index < 0 || index >= cart.length) return;

        if (newQty <= 0) {
            removeFromCart(index);
            return;
        }

        // Validasi stok
        const product = await MikoDB.getById('products', cart[index].productId);
        if (product && newQty > product.stock) {
            App.showNotification(`Stok "${product.name}" tidak mencukupi (tersisa: ${product.stock}).`, 'error');
            return;
        }

        cart[index].qty = newQty;
        cart[index].subtotal = newQty * cart[index].price;
        updateDisplay();
    }

    /**
     * Hapus item dari keranjang berdasarkan index
     * @param {number} index - Index item
     */
    function removeFromCart(index) {
        if (index >= 0 && index < cart.length) {
            const removed = cart.splice(index, 1)[0];
            App.showNotification(`"${removed.name}" dihapus dari keranjang.`, 'info');
            updateDisplay();
        }
    }

    /**
     * Kosongkan seluruh keranjang
     */
    function clearCart() {
        cart = [];
        updateDisplay();
    }

    /**
     * Ambil isi keranjang saat ini
     * @returns {Array} Array item di keranjang
     */
    function getCart() {
        return [...cart];
    }

    // =========================================================================
    // KALKULASI HARGA
    // =========================================================================

    /**
     * Hitung subtotal seluruh item di keranjang
     * @returns {number} Subtotal
     */
    function calculateSubtotal() {
        return cart.reduce((sum, item) => sum + item.subtotal, 0);
    }

    /**
     * Hitung jumlah PPN
     * @returns {number} Jumlah pajak
     */
    function calculateTax() {
        return Math.round(calculateSubtotal() * taxRate / 100);
    }

    /**
     * Hitung grand total (subtotal + PPN)
     * @returns {number} Grand total
     */
    function calculateGrandTotal() {
        return calculateSubtotal() + calculateTax();
    }

    /**
     * Hitung kembalian
     * @param {number} cashPaid - Nominal uang tunai yang dibayarkan
     * @returns {number} Kembalian (negatif jika kurang)
     */
    function calculateChange(cashPaid) {
        return cashPaid - calculateGrandTotal();
    }

    // =========================================================================
    // PROSES PEMBAYARAN & SIMPAN TRANSAKSI
    // =========================================================================

    /**
     * Proses pembayaran tunai dan simpan transaksi
     * @param {number} cashPaid - Nominal tunai yang diterima dari pelanggan
     * @returns {Promise<Object>} Data transaksi yang berhasil disimpan
     */
    async function processPayment(cashPaid) {
        try {
            // Validasi keranjang tidak kosong
            if (cart.length === 0) {
                throw new Error('Keranjang belanja kosong. Scan produk terlebih dahulu.');
            }

            const grandTotal = calculateGrandTotal();

            // Validasi pembayaran cukup
            if (cashPaid < grandTotal) {
                throw new Error(`Uang tidak cukup. Total: Rp ${formatCurrency(grandTotal)}, Dibayar: Rp ${formatCurrency(cashPaid)}. Kurang: Rp ${formatCurrency(grandTotal - cashPaid)}`);
            }

            // Siapkan data transaksi
            const session = Auth.getSession();
            const transaction = {
                transactionNumber: currentTransactionNumber,
                date: new Date().toISOString(),
                cashierId: session.userId,
                cashierName: session.name,
                items: cart.map(item => ({ ...item })),
                subtotal: calculateSubtotal(),
                taxRate: taxRate,
                taxAmount: calculateTax(),
                grandTotal: grandTotal,
                cashPaid: cashPaid,
                change: cashPaid - grandTotal,
                createdAt: new Date().toISOString()
            };

            // Simpan transaksi ke database
            const txId = await MikoDB.add('transactions', transaction);
            transaction.id = txId;

            // Kurangi stok produk
            for (const item of cart) {
                const product = await MikoDB.getById('products', item.productId);
                if (product) {
                    product.stock = Math.max(0, product.stock - item.qty);
                    product.updatedAt = new Date().toISOString();
                    await MikoDB.update('products', product);
                }
            }

            // Log aktivitas
            await Auth.logActivity(
                session.userId,
                'TRANSACTION',
                `Transaksi ${transaction.transactionNumber} — Total: Rp ${formatCurrency(grandTotal)}`
            );

            // Reset keranjang dan generate nomor transaksi baru
            cart = [];
            currentTransactionNumber = await generateTransactionNumber();
            updateDisplay();

            return transaction;
        } catch (error) {
            throw error;
        }
    }

    // =========================================================================
    // HOLD & RECALL TRANSAKSI
    // =========================================================================

    /**
     * Tahan transaksi aktif (simpan sementara)
     * @returns {boolean} Berhasil atau tidak
     */
    function holdTransaction() {
        if (cart.length === 0) {
            App.showNotification('Tidak ada transaksi untuk ditahan.', 'warning');
            return false;
        }

        heldTransactions.push({
            cart: [...cart],
            transactionNumber: currentTransactionNumber,
            heldAt: new Date().toISOString()
        });

        cart = [];
        updateDisplay();
        App.showNotification(`Transaksi ditahan. (${heldTransactions.length} transaksi tertahan)`, 'info');
        return true;
    }

    /**
     * Panggil kembali transaksi yang ditahan
     * @param {number} index - Index transaksi yang ditahan
     */
    async function recallTransaction(index) {
        if (index < 0 || index >= heldTransactions.length) return;

        // Simpan keranjang saat ini jika ada
        if (cart.length > 0) {
            holdTransaction();
        }

        const held = heldTransactions.splice(index, 1)[0];
        cart = held.cart;
        currentTransactionNumber = held.transactionNumber;
        updateDisplay();
        App.showNotification('Transaksi dipanggil kembali.', 'info');
    }

    /**
     * Ambil daftar transaksi yang ditahan
     * @returns {Array}
     */
    function getHeldTransactions() {
        return [...heldTransactions];
    }

    // =========================================================================
    // UI UPDATE
    // =========================================================================

    /**
     * Update tampilan keranjang dan ringkasan pembayaran di UI
     * Dipanggil setiap kali ada perubahan pada keranjang
     */
    function updateDisplay() {
        // Update tabel keranjang
        const cartBody = document.getElementById('cart-body');
        const emptyCart = document.getElementById('empty-cart');

        if (cartBody) {
            if (cart.length === 0) {
                cartBody.innerHTML = '';
                if (emptyCart) emptyCart.style.display = 'flex';
            } else {
                if (emptyCart) emptyCart.style.display = 'none';
                cartBody.innerHTML = cart.map((item, index) => `
                    <tr class="cart-row" data-index="${index}">
                        <td class="cart-num">${index + 1}</td>
                        <td class="cart-product">
                            <span class="product-name">${escapeHtml(item.name)}</span>
                            <span class="product-barcode">${item.barcode}</span>
                        </td>
                        <td class="cart-price">Rp ${formatCurrency(item.price)}</td>
                        <td class="cart-qty">
                            <div class="qty-control">
                                <button class="qty-btn qty-minus" onclick="POS.updateQuantity(${index}, ${item.qty - 1})" title="Kurangi">−</button>
                                <input type="number" class="qty-input" value="${item.qty}" min="1"
                                    onchange="POS.updateQuantity(${index}, parseInt(this.value) || 1)"
                                    onkeydown="if(event.key==='Enter'){POS.updateQuantity(${index}, parseInt(this.value) || 1); this.blur();}">
                                <button class="qty-btn qty-plus" onclick="POS.updateQuantity(${index}, ${item.qty + 1})" title="Tambah">+</button>
                            </div>
                        </td>
                        <td class="cart-subtotal">Rp ${formatCurrency(item.subtotal)}</td>
                        <td class="cart-action">
                            <button class="btn-remove" onclick="POS.removeFromCart(${index})" title="Hapus item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6"/></svg>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }

        // Update ringkasan pembayaran
        const subtotalEl = document.getElementById('pos-subtotal');
        const taxEl = document.getElementById('pos-tax');
        const totalEl = document.getElementById('pos-total');
        const itemCountEl = document.getElementById('pos-item-count');
        const txNumEl = document.getElementById('pos-tx-number');

        if (subtotalEl) subtotalEl.textContent = `Rp ${formatCurrency(calculateSubtotal())}`;
        if (taxEl) taxEl.textContent = `Rp ${formatCurrency(calculateTax())}`;
        if (totalEl) totalEl.textContent = `Rp ${formatCurrency(calculateGrandTotal())}`;
        if (itemCountEl) itemCountEl.textContent = `${cart.reduce((s, i) => s + i.qty, 0)} item`;
        if (txNumEl) txNumEl.textContent = currentTransactionNumber;

        // Update held transaction badge
        const heldBadge = document.getElementById('held-badge');
        if (heldBadge) {
            heldBadge.textContent = heldTransactions.length;
            heldBadge.style.display = heldTransactions.length > 0 ? 'inline-flex' : 'none';
        }
    }

    // =========================================================================
    // UTILITY
    // =========================================================================

    /**
     * Format angka ke format mata uang Indonesia (titik sebagai pemisah ribuan)
     * @param {number} num - Angka
     * @returns {string} String terformat
     */
    function formatCurrency(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    /**
     * Escape HTML entities untuk mencegah XSS
     * @param {string} str - String input
     * @returns {string} String yang aman
     */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    /**
     * Ambil nomor transaksi aktif
     * @returns {string}
     */
    function getTransactionNumber() {
        return currentTransactionNumber;
    }

    /**
     * Ambil tarif pajak saat ini
     * @returns {number}
     */
    function getTaxRate() {
        return taxRate;
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================
    return {
        init,
        scanBarcode,
        searchProducts,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCart,
        calculateSubtotal,
        calculateTax,
        calculateGrandTotal,
        calculateChange,
        processPayment,
        holdTransaction,
        recallTransaction,
        getHeldTransactions,
        getTransactionNumber,
        getTaxRate,
        formatCurrency,
        escapeHtml,
        updateDisplay
    };
})();
