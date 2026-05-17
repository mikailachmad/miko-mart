/**
 * =============================================================================
 * MikoMart POS — Reports Module
 * =============================================================================
 * Modul laporan penjualan untuk Supervisor:
 * - Laporan penjualan harian (ringkasan + detail)
 * - Laporan penjualan bulanan (tren grafik)
 * - Laporan per kasir
 * - Laporan produk terlaris
 * - Laporan pajak (PPN) bulanan
 * - Ekspor ke PDF (print)
 *
 * @version 1.0.0
 * @date    28 Maret 2026
 * =============================================================================
 */

const Reports = (() => {

    /**
     * Render halaman laporan
     */
    async function render() {
        const container = document.getElementById('page-content');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];

        container.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h1 class="page-title">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>
                        Laporan Penjualan
                    </h1>
                    <p class="page-subtitle">Analisis penjualan harian, bulanan, dan per kasir</p>
                </div>
            </div>

            <!-- KPI Cards -->
            <div class="kpi-grid" id="kpi-cards"></div>

            <!-- Tab Navigation -->
            <div class="report-tabs">
                <button class="tab-btn active" onclick="Reports.switchTab('daily', this)">📅 Harian</button>
                <button class="tab-btn" onclick="Reports.switchTab('monthly', this)">📊 Bulanan</button>
                <button class="tab-btn" onclick="Reports.switchTab('cashier', this)">👤 Per Kasir</button>
                <button class="tab-btn" onclick="Reports.switchTab('products', this)">🏆 Produk Terlaris</button>
                <button class="tab-btn" onclick="Reports.switchTab('tax', this)">🧾 Pajak (PPN)</button>
            </div>

            <!-- Filter -->
            <div class="report-filter">
                <div class="form-group">
                    <label class="form-label">Tanggal</label>
                    <input type="date" class="form-input" id="report-date" value="${today}" onchange="Reports.refreshReport()">
                </div>
                <div class="form-group" id="report-month-group">
                    <label class="form-label">Bulan</label>
                    <input type="month" class="form-input" id="report-month" value="${today.substring(0,7)}" onchange="Reports.refreshReport()">
                </div>
                <button class="btn btn-outline" onclick="Reports.exportReport()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Cetak / PDF
                </button>
            </div>

            <!-- Report Content -->
            <div class="report-content" id="report-content"></div>
        `;

        await loadKPICards();
        await showDailyReport();
    }

    let currentTab = 'daily';

    function switchTab(tab, btn) {
        currentTab = tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');

        // Show/hide date vs month filter
        const dateGroup = document.getElementById('report-date');
        const monthGroup = document.getElementById('report-month-group');
        if (dateGroup) dateGroup.parentElement.style.display = (tab === 'daily') ? 'block' : 'none';
        if (monthGroup) monthGroup.style.display = (tab !== 'daily') ? 'block' : 'none';

        refreshReport();
    }

    async function refreshReport() {
        switch(currentTab) {
            case 'daily': await showDailyReport(); break;
            case 'monthly': await showMonthlyReport(); break;
            case 'cashier': await showCashierReport(); break;
            case 'products': await showTopProducts(); break;
            case 'tax': await showTaxReport(); break;
        }
    }

    /**
     * Load KPI summary cards
     */
    async function loadKPICards() {
        const container = document.getElementById('kpi-cards');
        if (!container) return;

        const allTx = await MikoDB.getAll('transactions');
        const today = new Date().toISOString().split('T')[0];
        const todayTx = allTx.filter(t => t.date.split('T')[0] === today);

        const todayRevenue = todayTx.reduce((s, t) => s + t.grandTotal, 0);
        const todayItems = todayTx.reduce((s, t) => s + t.items.reduce((is, i) => is + i.qty, 0), 0);
        const todayTax = todayTx.reduce((s, t) => s + t.taxAmount, 0);

        container.innerHTML = `
            <div class="kpi-card kpi-transactions">
                <div class="kpi-icon">🧾</div>
                <div class="kpi-info">
                    <span class="kpi-value">${todayTx.length}</span>
                    <span class="kpi-label">Transaksi Hari Ini</span>
                </div>
            </div>
            <div class="kpi-card kpi-revenue">
                <div class="kpi-icon">💰</div>
                <div class="kpi-info">
                    <span class="kpi-value">Rp ${POS.formatCurrency(todayRevenue)}</span>
                    <span class="kpi-label">Pendapatan Hari Ini</span>
                </div>
            </div>
            <div class="kpi-card kpi-items">
                <div class="kpi-icon">📦</div>
                <div class="kpi-info">
                    <span class="kpi-value">${todayItems}</span>
                    <span class="kpi-label">Item Terjual</span>
                </div>
            </div>
            <div class="kpi-card kpi-tax">
                <div class="kpi-icon">🏛️</div>
                <div class="kpi-info">
                    <span class="kpi-value">Rp ${POS.formatCurrency(todayTax)}</span>
                    <span class="kpi-label">PPN Hari Ini</span>
                </div>
            </div>
        `;
    }

    /**
     * Laporan penjualan harian
     */
    async function showDailyReport() {
        const container = document.getElementById('report-content');
        if (!container) return;

        const dateVal = document.getElementById('report-date')?.value || new Date().toISOString().split('T')[0];
        const allTx = await MikoDB.getAll('transactions');
        const dayTx = allTx.filter(t => t.date.split('T')[0] === dateVal);

        if (dayTx.length === 0) {
            container.innerHTML = `<div class="empty-report">Tidak ada transaksi pada tanggal ${dateVal}.</div>`;
            return;
        }

        const totalRevenue = dayTx.reduce((s, t) => s + t.grandTotal, 0);
        const totalTax = dayTx.reduce((s, t) => s + t.taxAmount, 0);

        container.innerHTML = `
            <h3 class="report-title">Laporan Penjualan — ${new Date(dateVal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            <div class="report-summary">
                <span>Total Transaksi: <strong>${dayTx.length}</strong></span>
                <span>Total Pendapatan: <strong>Rp ${POS.formatCurrency(totalRevenue)}</strong></span>
                <span>Total PPN: <strong>Rp ${POS.formatCurrency(totalTax)}</strong></span>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>No</th><th>No. Transaksi</th><th>Waktu</th><th>Kasir</th><th>Items</th><th>Subtotal</th><th>PPN</th><th>Total</th></tr></thead>
                    <tbody>
                        ${dayTx.map((t, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td><code>${t.transactionNumber}</code></td>
                                <td>${new Date(t.date).toLocaleTimeString('id-ID')}</td>
                                <td>${POS.escapeHtml(t.cashierName)}</td>
                                <td>${t.items.reduce((s, it) => s + it.qty, 0)}</td>
                                <td class="text-right">Rp ${POS.formatCurrency(t.subtotal)}</td>
                                <td class="text-right">Rp ${POS.formatCurrency(t.taxAmount)}</td>
                                <td class="text-right"><strong>Rp ${POS.formatCurrency(t.grandTotal)}</strong></td>
                            </tr>
                        `).join('')}
                        <tr class="row-total">
                            <td colspan="5"><strong>TOTAL</strong></td>
                            <td class="text-right"><strong>Rp ${POS.formatCurrency(dayTx.reduce((s,t)=>s+t.subtotal,0))}</strong></td>
                            <td class="text-right"><strong>Rp ${POS.formatCurrency(totalTax)}</strong></td>
                            <td class="text-right"><strong>Rp ${POS.formatCurrency(totalRevenue)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Laporan penjualan bulanan
     */
    async function showMonthlyReport() {
        const container = document.getElementById('report-content');
        if (!container) return;

        const monthVal = document.getElementById('report-month')?.value || new Date().toISOString().substring(0,7);
        const allTx = await MikoDB.getAll('transactions');
        const monthTx = allTx.filter(t => t.date.substring(0,7) === monthVal);

        // Grupkan per hari
        const dailyMap = {};
        monthTx.forEach(t => {
            const day = t.date.split('T')[0];
            if (!dailyMap[day]) dailyMap[day] = { count: 0, revenue: 0, tax: 0 };
            dailyMap[day].count++;
            dailyMap[day].revenue += t.grandTotal;
            dailyMap[day].tax += t.taxAmount;
        });

        const days = Object.keys(dailyMap).sort();
        const totalRevenue = monthTx.reduce((s,t) => s + t.grandTotal, 0);

        // Simple bar chart using CSS
        const maxRevenue = Math.max(...Object.values(dailyMap).map(d => d.revenue), 1);

        container.innerHTML = `
            <h3 class="report-title">Laporan Bulanan — ${new Date(monthVal + '-01').toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</h3>
            <div class="report-summary">
                <span>Total Transaksi: <strong>${monthTx.length}</strong></span>
                <span>Total Pendapatan: <strong>Rp ${POS.formatCurrency(totalRevenue)}</strong></span>
                <span>Rata-rata/Hari: <strong>Rp ${POS.formatCurrency(days.length ? Math.round(totalRevenue / days.length) : 0)}</strong></span>
            </div>
            <div class="chart-container">
                <div class="bar-chart">
                    ${days.map(day => {
                        const pct = (dailyMap[day].revenue / maxRevenue * 100).toFixed(1);
                        const dayNum = day.split('-')[2];
                        return `<div class="bar-item" title="Rp ${POS.formatCurrency(dailyMap[day].revenue)}">
                            <div class="bar-fill" style="height:${pct}%"></div>
                            <span class="bar-label">${dayNum}</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>Tanggal</th><th>Jumlah Transaksi</th><th>Pendapatan</th><th>PPN</th></tr></thead>
                    <tbody>
                        ${days.map(day => `
                            <tr>
                                <td>${new Date(day).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                                <td class="text-center">${dailyMap[day].count}</td>
                                <td class="text-right">Rp ${POS.formatCurrency(dailyMap[day].revenue)}</td>
                                <td class="text-right">Rp ${POS.formatCurrency(dailyMap[day].tax)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Laporan per kasir
     */
    async function showCashierReport() {
        const container = document.getElementById('report-content');
        if (!container) return;

        const monthVal = document.getElementById('report-month')?.value || new Date().toISOString().substring(0,7);
        const allTx = await MikoDB.getAll('transactions');
        const monthTx = allTx.filter(t => t.date.substring(0,7) === monthVal);

        const cashierMap = {};
        monthTx.forEach(t => {
            if (!cashierMap[t.cashierName]) cashierMap[t.cashierName] = { count: 0, revenue: 0 };
            cashierMap[t.cashierName].count++;
            cashierMap[t.cashierName].revenue += t.grandTotal;
        });

        const cashiers = Object.entries(cashierMap).sort((a,b) => b[1].revenue - a[1].revenue);

        container.innerHTML = `
            <h3 class="report-title">Laporan Per Kasir — ${new Date(monthVal + '-01').toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</h3>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>No</th><th>Nama Kasir</th><th>Jumlah Transaksi</th><th>Total Penjualan</th><th>Rata-rata/Transaksi</th></tr></thead>
                    <tbody>
                        ${cashiers.length === 0 ? '<tr><td colspan="5" class="empty-table">Tidak ada data.</td></tr>' :
                        cashiers.map(([name, data], i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td><strong>${POS.escapeHtml(name)}</strong></td>
                                <td class="text-center">${data.count}</td>
                                <td class="text-right">Rp ${POS.formatCurrency(data.revenue)}</td>
                                <td class="text-right">Rp ${POS.formatCurrency(Math.round(data.revenue / data.count))}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Laporan produk terlaris
     */
    async function showTopProducts() {
        const container = document.getElementById('report-content');
        if (!container) return;

        const monthVal = document.getElementById('report-month')?.value || new Date().toISOString().substring(0,7);
        const allTx = await MikoDB.getAll('transactions');
        const monthTx = allTx.filter(t => t.date.substring(0,7) === monthVal);

        const productMap = {};
        monthTx.forEach(t => {
            t.items.forEach(item => {
                if (!productMap[item.name]) productMap[item.name] = { qty: 0, revenue: 0 };
                productMap[item.name].qty += item.qty;
                productMap[item.name].revenue += item.subtotal;
            });
        });

        const products = Object.entries(productMap).sort((a,b) => b[1].qty - a[1].qty).slice(0, 20);

        container.innerHTML = `
            <h3 class="report-title">Produk Terlaris — ${new Date(monthVal + '-01').toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</h3>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>Rank</th><th>Nama Produk</th><th>Qty Terjual</th><th>Total Pendapatan</th></tr></thead>
                    <tbody>
                        ${products.length === 0 ? '<tr><td colspan="4" class="empty-table">Tidak ada data.</td></tr>' :
                        products.map(([name, data], i) => `
                            <tr>
                                <td><span class="rank-badge rank-${i < 3 ? i+1 : 'other'}">${i + 1}</span></td>
                                <td><strong>${POS.escapeHtml(name)}</strong></td>
                                <td class="text-center">${data.qty}</td>
                                <td class="text-right">Rp ${POS.formatCurrency(data.revenue)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Laporan pajak (PPN) bulanan
     */
    async function showTaxReport() {
        const container = document.getElementById('report-content');
        if (!container) return;

        const monthVal = document.getElementById('report-month')?.value || new Date().toISOString().substring(0,7);
        const allTx = await MikoDB.getAll('transactions');
        const monthTx = allTx.filter(t => t.date.substring(0,7) === monthVal);

        const totalSubtotal = monthTx.reduce((s,t) => s + t.subtotal, 0);
        const totalTax = monthTx.reduce((s,t) => s + t.taxAmount, 0);
        const totalGrand = monthTx.reduce((s,t) => s + t.grandTotal, 0);

        container.innerHTML = `
            <h3 class="report-title">Laporan PPN — ${new Date(monthVal + '-01').toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</h3>
            <div class="tax-summary-grid">
                <div class="tax-card">
                    <span class="tax-card-label">Total Penjualan (DPP)</span>
                    <span class="tax-card-value">Rp ${POS.formatCurrency(totalSubtotal)}</span>
                </div>
                <div class="tax-card tax-card-highlight">
                    <span class="tax-card-label">Total PPN (11%)</span>
                    <span class="tax-card-value">Rp ${POS.formatCurrency(totalTax)}</span>
                </div>
                <div class="tax-card">
                    <span class="tax-card-label">Total Incl. Pajak</span>
                    <span class="tax-card-value">Rp ${POS.formatCurrency(totalGrand)}</span>
                </div>
                <div class="tax-card">
                    <span class="tax-card-label">Jumlah Transaksi Kena Pajak</span>
                    <span class="tax-card-value">${monthTx.length}</span>
                </div>
            </div>
        `;
    }

    /**
     * Ekspor laporan via browser print (PDF)
     */
    function exportReport() {
        window.print();
    }

    return { render, switchTab, refreshReport, exportReport };
})();
