/**
 * =============================================================================
 * MikoMart POS — Receipt / Struk Module
 * =============================================================================
 * Modul ini menghasilkan dan mencetak struk transaksi.
 * Format struk sesuai spesifikasi SRS:
 *   Header toko (nama, alamat, NPWP) → daftar item →
 *   subtotal → PPN → total → tunai → kembalian → footer
 *
 * Mendukung:
 * - Preview struk di modal
 * - Cetak via window.print() ke thermal printer
 * - Cetak ulang dari riwayat transaksi
 *
 * @version 1.0.0
 * @date    28 Maret 2026
 * =============================================================================
 */

const Receipt = (() => {

    // Informasi toko (konfigurasi)
    const STORE_INFO = {
        name: 'M I K O M A R T',
        address: 'Jl. Supermarket No. 123, Kota',
        npwp: '01.234.567.8-901.000',
        phone: '(021) 1234-5678',
        footer: 'Terima kasih telah berbelanja\ndi MikoMart! 🛒'
    };

    /**
     * Generate HTML struk transaksi
     * @param {Object} transaction - Data transaksi dari database
     * @returns {string} HTML struk
     */
    function generateReceiptHTML(transaction) {
        const date = new Date(transaction.date);
        const dateStr = date.toLocaleDateString('id-ID', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('id-ID', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        const itemsHTML = transaction.items.map(item => {
            const name = item.name.length > 22
                ? item.name.substring(0, 22) + '...'
                : item.name;
            return `
                <div class="receipt-item">
                    <span class="receipt-item-name">${POS.escapeHtml(name)}</span>
                    <div class="receipt-item-detail">
                        <span>${item.qty} x ${formatRp(item.price)}</span>
                        <span>${formatRp(item.subtotal)}</span>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="receipt" id="receipt-print-area">
                <div class="receipt-header">
                    <div class="receipt-store-name">${STORE_INFO.name}</div>
                    <div class="receipt-store-info">${STORE_INFO.address}</div>
                    <div class="receipt-store-info">NPWP: ${STORE_INFO.npwp}</div>
                </div>

                <div class="receipt-divider">=</div>

                <div class="receipt-meta">
                    <div class="receipt-meta-row">
                        <span>No. Transaksi</span>
                        <span>${transaction.transactionNumber}</span>
                    </div>
                    <div class="receipt-meta-row">
                        <span>Tanggal</span>
                        <span>${dateStr}  ${timeStr}</span>
                    </div>
                    <div class="receipt-meta-row">
                        <span>Kasir</span>
                        <span>${POS.escapeHtml(transaction.cashierName)}</span>
                    </div>
                </div>

                <div class="receipt-divider">-</div>

                <div class="receipt-items">
                    ${itemsHTML}
                </div>

                <div class="receipt-divider">-</div>

                <div class="receipt-totals">
                    <div class="receipt-total-row">
                        <span>Subtotal</span>
                        <span>${formatRp(transaction.subtotal)}</span>
                    </div>
                    <div class="receipt-total-row">
                        <span>PPN (${transaction.taxRate}%)</span>
                        <span>${formatRp(transaction.taxAmount)}</span>
                    </div>
                    <div class="receipt-divider">=</div>
                    <div class="receipt-total-row receipt-grand-total">
                        <span>TOTAL</span>
                        <span>${formatRp(transaction.grandTotal)}</span>
                    </div>
                    <div class="receipt-total-row">
                        <span>Tunai</span>
                        <span>${formatRp(transaction.cashPaid)}</span>
                    </div>
                    <div class="receipt-total-row">
                        <span>Kembalian</span>
                        <span>${formatRp(transaction.change)}</span>
                    </div>
                </div>

                <div class="receipt-divider">=</div>

                <div class="receipt-footer">
                    ${STORE_INFO.footer.split('\n').map(line => `<div>${line}</div>`).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Tampilkan preview struk di modal
     * @param {Object} transaction - Data transaksi
     */
    function showReceiptModal(transaction) {
        const modal = document.getElementById('app-modal');
        modal.innerHTML = `
            <div class="modal-overlay" onclick="App.closeModal()">
                <div class="modal-content modal-receipt" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2 class="modal-title">Struk Transaksi</h2>
                        <button class="modal-close" onclick="App.closeModal()">×</button>
                    </div>
                    <div class="modal-body receipt-modal-body">
                        ${generateReceiptHTML(transaction)}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="App.closeModal()">Tutup</button>
                        <button class="btn btn-primary" onclick="Receipt.printReceipt()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                            Cetak Struk
                        </button>
                    </div>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    }

    /**
     * Cetak struk menggunakan browser print
     */
    function printReceipt() {
        const receiptArea = document.getElementById('receipt-print-area');
        if (!receiptArea) return;

        const printWindow = window.open('', '_blank', 'width=320,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Struk MikoMart</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Courier New', monospace; font-size: 12px; padding: 8px; width: 280px; }
                    .receipt-header { text-align: center; margin-bottom: 8px; }
                    .receipt-store-name { font-size: 16px; font-weight: bold; letter-spacing: 2px; }
                    .receipt-store-info { font-size: 10px; color: #555; }
                    .receipt-divider { text-align: center; letter-spacing: 2px; overflow: hidden; color: #999; margin: 4px 0; }
                    .receipt-meta-row, .receipt-total-row { display: flex; justify-content: space-between; padding: 1px 0; }
                    .receipt-item { margin: 4px 0; }
                    .receipt-item-name { font-weight: bold; display: block; }
                    .receipt-item-detail { display: flex; justify-content: space-between; padding-left: 12px; }
                    .receipt-grand-total { font-size: 14px; font-weight: bold; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 4px 0; margin: 4px 0; }
                    .receipt-footer { text-align: center; margin-top: 8px; font-size: 11px; }
                    @media print { body { width: auto; } }
                </style>
            </head>
            <body>${receiptArea.innerHTML}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
    }

    /**
     * Format angka ke format Rupiah
     * @param {number} num
     * @returns {string}
     */
    function formatRp(num) {
        return 'Rp ' + POS.formatCurrency(num);
    }

    return {
        generateReceiptHTML,
        showReceiptModal,
        printReceipt
    };
})();
