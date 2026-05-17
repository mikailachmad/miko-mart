/**
 * =============================================================================
 * MikoMart POS — Product Management Module
 * =============================================================================
 * Modul ini menangani operasi CRUD produk dan kategori oleh Admin:
 * - Tambah, edit, nonaktifkan produk
 * - Manajemen kategori produk
 * - Import produk massal dari CSV
 * - Pencarian & filter produk
 * - Notifikasi stok rendah
 *
 * @version 1.0.0
 * @date    28 Maret 2026
 * =============================================================================
 */

const Products = (() => {
    let currentPage = 1;
    const ITEMS_PER_PAGE = 10;
    let filterCategory = 'all';
    let searchKeyword = '';

    /**
     * Render halaman manajemen produk (Admin)
     */
    async function render() {
        const container = document.getElementById('page-content');
        if (!container) return;

        const categories = await MikoDB.getAll('categories');

        container.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h1 class="page-title">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                        Manajemen Produk
                    </h1>
                    <p class="page-subtitle">Kelola data produk, harga, stok, dan kategori</p>
                </div>
                <div class="page-header-right">
                    <button class="btn btn-primary" onclick="Products.showAddModal()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Tambah Produk
                    </button>
                    <button class="btn btn-outline" onclick="Products.showCategoryModal()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                        Kategori
                    </button>
                </div>
            </div>

            <div class="filter-bar">
                <div class="search-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" id="product-search" placeholder="Cari nama produk atau barcode..." 
                        oninput="Products.handleSearch(this.value)" value="${POS.escapeHtml(searchKeyword)}">
                </div>
                <select id="product-filter-cat" class="filter-select" onchange="Products.handleFilter(this.value)">
                    <option value="all">Semua Kategori</option>
                    ${categories.map(c => `<option value="${c.id}" ${filterCategory == c.id ? 'selected' : ''}>${POS.escapeHtml(c.name)}</option>`).join('')}
                </select>
            </div>

            <div class="table-container">
                <table class="data-table" id="products-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Barcode</th>
                            <th>Nama Produk</th>
                            <th>Kategori</th>
                            <th>Harga</th>
                            <th>Stok</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="products-tbody"></tbody>
                </table>
            </div>
            <div class="pagination" id="products-pagination"></div>
        `;

        await loadProducts();
    }

    /**
     * Muat dan tampilkan data produk ke tabel
     */
    async function loadProducts() {
        try {
            let products = await MikoDB.getAll('products');
            const categories = await MikoDB.getAll('categories');
            const catMap = {};
            categories.forEach(c => { catMap[c.id] = c.name; });

            // Filter berdasarkan kategori
            if (filterCategory !== 'all') {
                products = products.filter(p => p.categoryId == filterCategory);
            }

            // Filter berdasarkan pencarian
            if (searchKeyword) {
                const kw = searchKeyword.toLowerCase();
                products = products.filter(p =>
                    p.name.toLowerCase().includes(kw) ||
                    p.barcode.includes(kw)
                );
            }

            // Pagination
            const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
            if (currentPage > totalPages) currentPage = Math.max(1, totalPages);
            const start = (currentPage - 1) * ITEMS_PER_PAGE;
            const pageProducts = products.slice(start, start + ITEMS_PER_PAGE);

            const tbody = document.getElementById('products-tbody');
            if (!tbody) return;

            if (pageProducts.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="empty-table">Tidak ada produk ditemukan.</td></tr>`;
            } else {
                tbody.innerHTML = pageProducts.map((p, i) => `
                    <tr class="${p.status !== 'active' ? 'row-inactive' : ''} ${p.stock <= (p.minStock || 0) ? 'row-low-stock' : ''}">
                        <td>${start + i + 1}</td>
                        <td><code class="barcode-text">${p.barcode}</code></td>
                        <td class="product-cell">${POS.escapeHtml(p.name)}</td>
                        <td><span class="badge badge-category">${catMap[p.categoryId] || '-'}</span></td>
                        <td class="text-right">Rp ${POS.formatCurrency(p.price)}</td>
                        <td class="text-center ${p.stock <= (p.minStock || 0) ? 'text-danger' : ''}">${p.stock} ${p.unit || ''}</td>
                        <td><span class="badge ${p.status === 'active' ? 'badge-success' : 'badge-danger'}">${p.status === 'active' ? 'Aktif' : 'Nonaktif'}</span></td>
                        <td class="action-cell">
                            <button class="btn-icon btn-edit" onclick="Products.showEditModal(${p.id})" title="Edit">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="btn-icon btn-delete" onclick="Products.toggleStatus(${p.id})" title="${p.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}">
                                ${p.status === 'active'
                                    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>'
                                    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
                                }
                            </button>
                        </td>
                    </tr>
                `).join('');
            }

            // Render pagination
            renderPagination(totalPages, products.length);
        } catch (error) {
            console.error('[Products] Error loading:', error);
            App.showNotification('Gagal memuat data produk.', 'error');
        }
    }

    /**
     * Render kontrol pagination
     */
    function renderPagination(totalPages, totalItems) {
        const container = document.getElementById('products-pagination');
        if (!container) return;

        if (totalPages <= 1) {
            container.innerHTML = `<span class="pagination-info">${totalItems} produk</span>`;
            return;
        }

        let html = `<span class="pagination-info">${totalItems} produk — Halaman ${currentPage}/${totalPages}</span><div class="pagination-btns">`;

        if (currentPage > 1) {
            html += `<button class="btn-page" onclick="Products.goToPage(${currentPage - 1})">‹ Prev</button>`;
        }
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="btn-page ${i === currentPage ? 'active' : ''}" onclick="Products.goToPage(${i})">${i}</button>`;
        }
        if (currentPage < totalPages) {
            html += `<button class="btn-page" onclick="Products.goToPage(${currentPage + 1})">Next ›</button>`;
        }
        html += '</div>';
        container.innerHTML = html;
    }

    function goToPage(page) { currentPage = page; loadProducts(); }
    function handleSearch(val) { searchKeyword = val; currentPage = 1; loadProducts(); }
    function handleFilter(val) { filterCategory = val; currentPage = 1; loadProducts(); }

    // =========================================================================
    // MODAL: TAMBAH / EDIT PRODUK
    // =========================================================================

    async function showAddModal() {
        const categories = await MikoDB.getAll('categories');
        showProductModal('Tambah Produk Baru', null, categories);
    }

    async function showEditModal(productId) {
        const product = await MikoDB.getById('products', productId);
        const categories = await MikoDB.getAll('categories');
        if (product) showProductModal('Edit Produk', product, categories);
    }

    function showProductModal(title, product, categories) {
        const isEdit = product !== null;
        const modal = document.getElementById('app-modal');
        modal.innerHTML = `
            <div class="modal-overlay" onclick="App.closeModal()">
                <div class="modal-content modal-md" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2 class="modal-title">${title}</h2>
                        <button class="modal-close" onclick="App.closeModal()">×</button>
                    </div>
                    <form id="product-form" onsubmit="Products.saveProduct(event, ${isEdit ? product.id : 'null'})">
                        <div class="modal-body">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Nama Produk <span class="required">*</span></label>
                                    <input type="text" class="form-input" name="name" required value="${isEdit ? POS.escapeHtml(product.name) : ''}" placeholder="Contoh: Indomie Goreng">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Barcode (EAN-13) <span class="required">*</span></label>
                                    <input type="text" class="form-input" name="barcode" required value="${isEdit ? product.barcode : ''}" placeholder="8996001010101" maxlength="13">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Harga Jual (Rp) <span class="required">*</span></label>
                                    <input type="number" class="form-input" name="price" required min="0" value="${isEdit ? product.price : ''}" placeholder="0">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Kategori <span class="required">*</span></label>
                                    <select class="form-input" name="categoryId" required>
                                        <option value="">— Pilih Kategori —</option>
                                        ${categories.map(c => `<option value="${c.id}" ${isEdit && product.categoryId == c.id ? 'selected' : ''}>${POS.escapeHtml(c.name)}</option>`).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Stok Awal <span class="required">*</span></label>
                                    <input type="number" class="form-input" name="stock" required min="0" value="${isEdit ? product.stock : '0'}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Satuan</label>
                                    <input type="text" class="form-input" name="unit" value="${isEdit ? (product.unit || 'pcs') : 'pcs'}" placeholder="pcs, kg, liter">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Min. Stok (Alert)</label>
                                    <input type="number" class="form-input" name="minStock" min="0" value="${isEdit ? (product.minStock || 0) : '10'}">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline" onclick="App.closeModal()">Batal</button>
                            <button type="submit" class="btn btn-primary">${isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    }

    /**
     * Simpan produk (tambah baru atau update)
     */
    async function saveProduct(event, productId) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        try {
            const data = {
                name: formData.get('name').trim(),
                barcode: formData.get('barcode').trim(),
                price: parseInt(formData.get('price')),
                categoryId: parseInt(formData.get('categoryId')),
                stock: parseInt(formData.get('stock')),
                unit: formData.get('unit').trim() || 'pcs',
                minStock: parseInt(formData.get('minStock') || '0'),
                status: 'active',
                updatedAt: new Date().toISOString()
            };

            // Validasi barcode unik
            const existingByBarcode = await MikoDB.getByIndex('products', 'barcode', data.barcode);
            if (existingByBarcode && existingByBarcode.id !== productId) {
                App.showNotification(`Barcode "${data.barcode}" sudah digunakan oleh produk lain.`, 'error');
                return;
            }

            if (productId) {
                // Update produk
                data.id = productId;
                const existing = await MikoDB.getById('products', productId);
                data.createdAt = existing.createdAt;
                await MikoDB.update('products', data);
                App.showNotification(`Produk "${data.name}" berhasil diperbarui.`, 'success');
            } else {
                // Tambah baru
                data.createdAt = new Date().toISOString();
                await MikoDB.add('products', data);
                App.showNotification(`Produk "${data.name}" berhasil ditambahkan.`, 'success');
            }

            App.closeModal();
            await loadProducts();
        } catch (error) {
            App.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    /**
     * Toggle status produk (aktif/nonaktif — soft delete)
     */
    async function toggleStatus(productId) {
        try {
            const product = await MikoDB.getById('products', productId);
            if (!product) return;

            product.status = product.status === 'active' ? 'inactive' : 'active';
            product.updatedAt = new Date().toISOString();
            await MikoDB.update('products', product);

            const status = product.status === 'active' ? 'diaktifkan' : 'dinonaktifkan';
            App.showNotification(`Produk "${product.name}" berhasil ${status}.`, 'success');
            await loadProducts();
        } catch (error) {
            App.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    // =========================================================================
    // MODAL: KATEGORI
    // =========================================================================

    async function showCategoryModal() {
        const categories = await MikoDB.getAll('categories');
        const modal = document.getElementById('app-modal');
        modal.innerHTML = `
            <div class="modal-overlay" onclick="App.closeModal()">
                <div class="modal-content modal-sm" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2 class="modal-title">Kelola Kategori</h2>
                        <button class="modal-close" onclick="App.closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Tambah Kategori Baru</label>
                            <div class="input-group">
                                <input type="text" class="form-input" id="new-category-name" placeholder="Nama kategori...">
                                <button class="btn btn-primary" onclick="Products.addCategory()">Tambah</button>
                            </div>
                        </div>
                        <div class="category-list" id="category-list">
                            ${categories.map(c => `
                                <div class="category-item">
                                    <span>${POS.escapeHtml(c.name)}</span>
                                    <button class="btn-icon btn-delete" onclick="Products.deleteCategory(${c.id})" title="Hapus">×</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    }

    async function addCategory() {
        const input = document.getElementById('new-category-name');
        const name = input.value.trim();
        if (!name) { App.showNotification('Nama kategori tidak boleh kosong.', 'warning'); return; }
        try {
            await MikoDB.add('categories', { name, createdAt: new Date().toISOString() });
            App.showNotification(`Kategori "${name}" berhasil ditambahkan.`, 'success');
            await showCategoryModal();
        } catch (error) {
            App.showNotification(`Error: Kategori sudah ada.`, 'error');
        }
    }

    async function deleteCategory(catId) {
        try {
            const prods = await MikoDB.getAllByIndex('products', 'categoryId', catId);
            if (prods.length > 0) {
                App.showNotification(`Kategori masih digunakan oleh ${prods.length} produk.`, 'error');
                return;
            }
            await MikoDB.remove('categories', catId);
            App.showNotification('Kategori berhasil dihapus.', 'success');
            await showCategoryModal();
        } catch (error) {
            App.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================
    return {
        render, loadProducts, goToPage, handleSearch, handleFilter,
        showAddModal, showEditModal, saveProduct, toggleStatus,
        showCategoryModal, addCategory, deleteCategory
    };
})();
