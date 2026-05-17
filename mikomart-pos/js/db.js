/**
 * =============================================================================
 * MikoMart POS — Database Module (IndexedDB)
 * =============================================================================
 * Modul ini menangani semua operasi database menggunakan IndexedDB browser.
 * IndexedDB dipilih karena mendukung operasi offline penuh, menyimpan data
 * secara persisten di browser, dan mampu menangani volume data besar.
 *
 * Schema (Object Stores):
 *   - users        : Akun pengguna (Admin, Supervisor, Kasir)
 *   - categories   : Kategori produk
 *   - products     : Data produk (barcode, harga, stok)
 *   - transactions : Riwayat transaksi penjualan
 *   - tax_config   : Konfigurasi tarif pajak (PPN)
 *   - activity_logs: Audit trail aktivitas pengguna
 *
 * @version 1.0.0
 * @date    28 Maret 2026
 * =============================================================================
 */

const MikoDB = (() => {
    // Nama dan versi database
    const DB_NAME = 'MikoMartPOS';
    const DB_VERSION = 1;
    let db = null;

    /**
     * Inisialisasi database — buat schema jika belum ada.
     * Dipanggil saat aplikasi pertama kali dimuat.
     * @returns {Promise<IDBDatabase>} Instance database
     */
    function init() {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                // Event: upgrade diperlukan (pertama kali / versi berubah)
                request.onupgradeneeded = (event) => {
                    const database = event.target.result;

                    // --- Object Store: users ---
                    if (!database.objectStoreNames.contains('users')) {
                        const userStore = database.createObjectStore('users', {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                        userStore.createIndex('username', 'username', { unique: true });
                        userStore.createIndex('role', 'role', { unique: false });
                        userStore.createIndex('status', 'status', { unique: false });
                    }

                    // --- Object Store: categories ---
                    if (!database.objectStoreNames.contains('categories')) {
                        const catStore = database.createObjectStore('categories', {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                        catStore.createIndex('name', 'name', { unique: true });
                    }

                    // --- Object Store: products ---
                    if (!database.objectStoreNames.contains('products')) {
                        const prodStore = database.createObjectStore('products', {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                        prodStore.createIndex('barcode', 'barcode', { unique: true });
                        prodStore.createIndex('name', 'name', { unique: false });
                        prodStore.createIndex('categoryId', 'categoryId', { unique: false });
                        prodStore.createIndex('status', 'status', { unique: false });
                    }

                    // --- Object Store: transactions ---
                    if (!database.objectStoreNames.contains('transactions')) {
                        const txStore = database.createObjectStore('transactions', {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                        txStore.createIndex('transactionNumber', 'transactionNumber', { unique: true });
                        txStore.createIndex('date', 'date', { unique: false });
                        txStore.createIndex('cashierId', 'cashierId', { unique: false });
                    }

                    // --- Object Store: tax_config ---
                    if (!database.objectStoreNames.contains('tax_config')) {
                        database.createObjectStore('tax_config', {
                            keyPath: 'id'
                        });
                    }

                    // --- Object Store: activity_logs ---
                    if (!database.objectStoreNames.contains('activity_logs')) {
                        const logStore = database.createObjectStore('activity_logs', {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                        logStore.createIndex('userId', 'userId', { unique: false });
                        logStore.createIndex('action', 'action', { unique: false });
                        logStore.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                };

                request.onsuccess = (event) => {
                    db = event.target.result;
                    resolve(db);
                };

                request.onerror = (event) => {
                    reject(new Error(`Gagal membuka database: ${event.target.error}`));
                };
            } catch (error) {
                reject(new Error(`IndexedDB tidak tersedia: ${error.message}`));
            }
        });
    }

    // =========================================================================
    // GENERIC CRUD OPERATIONS
    // =========================================================================

    /**
     * Tambah record ke object store
     * @param {string} storeName - Nama object store
     * @param {Object} data - Data yang akan disimpan
     * @returns {Promise<number>} ID record yang baru dibuat
     */
    function add(storeName, data) {
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(storeName, 'readwrite');
                const store = tx.objectStore(storeName);
                const request = store.add(data);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(new Error(`Gagal menambah data ke ${storeName}: ${request.error}`));
            } catch (error) {
                reject(new Error(`Error transaksi DB: ${error.message}`));
            }
        });
    }

    /**
     * Update record di object store
     * @param {string} storeName - Nama object store
     * @param {Object} data - Data lengkap (harus include keyPath/id)
     * @returns {Promise<number>} ID record yang diupdate
     */
    function update(storeName, data) {
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(storeName, 'readwrite');
                const store = tx.objectStore(storeName);
                const request = store.put(data);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(new Error(`Gagal mengupdate data di ${storeName}: ${request.error}`));
            } catch (error) {
                reject(new Error(`Error transaksi DB: ${error.message}`));
            }
        });
    }

    /**
     * Ambil record berdasarkan ID
     * @param {string} storeName - Nama object store
     * @param {number} id - ID record
     * @returns {Promise<Object|undefined>} Record atau undefined
     */
    function getById(storeName, id) {
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(new Error(`Gagal mengambil data dari ${storeName}: ${request.error}`));
            } catch (error) {
                reject(new Error(`Error transaksi DB: ${error.message}`));
            }
        });
    }

    /**
     * Ambil record berdasarkan index
     * @param {string} storeName - Nama object store
     * @param {string} indexName - Nama index
     * @param {*} value - Nilai yang dicari
     * @returns {Promise<Object|undefined>} Record pertama yang cocok
     */
    function getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                const index = store.index(indexName);
                const request = index.get(value);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(new Error(`Gagal mencari di index ${indexName}: ${request.error}`));
            } catch (error) {
                reject(new Error(`Error transaksi DB: ${error.message}`));
            }
        });
    }

    /**
     * Ambil semua record dari object store
     * @param {string} storeName - Nama object store
     * @returns {Promise<Array>} Array of records
     */
    function getAll(storeName) {
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(new Error(`Gagal mengambil semua data dari ${storeName}: ${request.error}`));
            } catch (error) {
                reject(new Error(`Error transaksi DB: ${error.message}`));
            }
        });
    }

    /**
     * Ambil semua record berdasarkan index value
     * @param {string} storeName - Nama object store
     * @param {string} indexName - Nama index
     * @param {*} value - Nilai yang dicari
     * @returns {Promise<Array>} Array of records yang cocok
     */
    function getAllByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                const index = store.index(indexName);
                const request = index.getAll(value);
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(new Error(`Gagal mencari semua di index ${indexName}: ${request.error}`));
            } catch (error) {
                reject(new Error(`Error transaksi DB: ${error.message}`));
            }
        });
    }

    /**
     * Hapus record berdasarkan ID
     * @param {string} storeName - Nama object store
     * @param {number} id - ID record
     * @returns {Promise<void>}
     */
    function remove(storeName, id) {
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(storeName, 'readwrite');
                const store = tx.objectStore(storeName);
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(new Error(`Gagal menghapus data dari ${storeName}: ${request.error}`));
            } catch (error) {
                reject(new Error(`Error transaksi DB: ${error.message}`));
            }
        });
    }

    /**
     * Hitung jumlah record di object store
     * @param {string} storeName - Nama object store
     * @returns {Promise<number>}
     */
    function count(storeName) {
        return new Promise((resolve, reject) => {
            try {
                const tx = db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                const request = store.count();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(new Error(`Gagal menghitung record: ${request.error}`));
            } catch (error) {
                reject(new Error(`Error transaksi DB: ${error.message}`));
            }
        });
    }

    // =========================================================================
    // SEED DATA — Data Awal
    // =========================================================================

    /**
     * Seed data awal ke database (hanya jika kosong).
     * Mencakup: admin default, kategori, produk sampel, konfigurasi pajak.
     */
    async function seed() {
        try {
            // --- Seed Admin Default ---
            const userCount = await count('users');
            if (userCount === 0) {
                const defaultUsers = [
                    {
                        name: 'Administrator',
                        username: 'admin',
                        password: 'admin123', // Disimpan plain untuk demo; produksi harus hash
                        role: 'admin',
                        status: 'active',
                        createdAt: new Date().toISOString()
                    },
                    {
                        name: 'Supervisor Utama',
                        username: 'supervisor',
                        password: 'super123',
                        role: 'supervisor',
                        status: 'active',
                        createdAt: new Date().toISOString()
                    },
                    {
                        name: 'Kasir Budi',
                        username: 'kasir1',
                        password: 'kasir123',
                        role: 'kasir',
                        status: 'active',
                        createdAt: new Date().toISOString()
                    },
                    {
                        name: 'Kasir Sari',
                        username: 'kasir2',
                        password: 'kasir123',
                        role: 'kasir',
                        status: 'active',
                        createdAt: new Date().toISOString()
                    },
                    {
                        name: 'Kasir Andi',
                        username: 'kasir3',
                        password: 'kasir123',
                        role: 'kasir',
                        status: 'active',
                        createdAt: new Date().toISOString()
                    },
                    {
                        name: 'Kasir Dewi',
                        username: 'kasir4',
                        password: 'kasir123',
                        role: 'kasir',
                        status: 'active',
                        createdAt: new Date().toISOString()
                    }
                ];
                for (const user of defaultUsers) {
                    await add('users', user);
                }
            }

            // --- Seed Kategori ---
            const catCount = await count('categories');
            if (catCount === 0) {
                const categories = [
                    { name: 'Makanan', createdAt: new Date().toISOString() },
                    { name: 'Minuman', createdAt: new Date().toISOString() },
                    { name: 'Peralatan Rumah', createdAt: new Date().toISOString() },
                    { name: 'Toiletries', createdAt: new Date().toISOString() },
                    { name: 'Snack & Cemilan', createdAt: new Date().toISOString() },
                    { name: 'Bumbu Dapur', createdAt: new Date().toISOString() },
                    { name: 'Susu & Dairy', createdAt: new Date().toISOString() },
                    { name: 'Frozen Food', createdAt: new Date().toISOString() }
                ];
                for (const cat of categories) {
                    await add('categories', cat);
                }
            }

            // --- Seed Produk Sampel ---
            const prodCount = await count('products');
            if (prodCount === 0) {
                const products = [
                    { name: 'Indomie Goreng', barcode: '8996001010101', price: 3000, categoryId: 1, stock: 500, unit: 'pcs', minStock: 50, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Indomie Kuah Soto', barcode: '8996001010102', price: 3000, categoryId: 1, stock: 400, unit: 'pcs', minStock: 50, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Beras Cap Jago 5kg', barcode: '8996001020101', price: 70000, categoryId: 1, stock: 100, unit: 'pcs', minStock: 10, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Minyak Bimoli 2L', barcode: '8996001020201', price: 38000, categoryId: 6, stock: 80, unit: 'pcs', minStock: 10, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Gula Pasir 1kg', barcode: '8996001020301', price: 15000, categoryId: 6, stock: 120, unit: 'pcs', minStock: 15, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Aqua 600ml', barcode: '8996001030101', price: 4000, categoryId: 2, stock: 600, unit: 'pcs', minStock: 100, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Aqua 1.5L', barcode: '8996001030102', price: 6000, categoryId: 2, stock: 300, unit: 'pcs', minStock: 50, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Teh Botol Sosro 450ml', barcode: '8996001030201', price: 5000, categoryId: 2, stock: 400, unit: 'pcs', minStock: 50, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Coca Cola 390ml', barcode: '8996001030301', price: 7000, categoryId: 2, stock: 200, unit: 'pcs', minStock: 30, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Sabun Lifebuoy 100g', barcode: '8996001040101', price: 5500, categoryId: 4, stock: 150, unit: 'pcs', minStock: 20, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Shampo Pantene 160ml', barcode: '8996001040201', price: 25000, categoryId: 4, stock: 80, unit: 'pcs', minStock: 10, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Pasta Gigi Pepsodent 120g', barcode: '8996001040301', price: 12000, categoryId: 4, stock: 100, unit: 'pcs', minStock: 15, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Chitato 68g', barcode: '8996001050101', price: 11000, categoryId: 5, stock: 200, unit: 'pcs', minStock: 30, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Oreo 133g', barcode: '8996001050201', price: 12500, categoryId: 5, stock: 150, unit: 'pcs', minStock: 20, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Susu Ultra Milk 1L', barcode: '8996001070101', price: 18000, categoryId: 7, stock: 100, unit: 'pcs', minStock: 15, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Keju Kraft Singles 10pcs', barcode: '8996001070201', price: 28000, categoryId: 7, stock: 60, unit: 'pcs', minStock: 8, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Nugget Fiesta 500g', barcode: '8996001080101', price: 42000, categoryId: 8, stock: 50, unit: 'pcs', minStock: 8, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Sosis So Nice 6pcs', barcode: '8996001080201', price: 15000, categoryId: 8, stock: 100, unit: 'pcs', minStock: 15, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Sapu Ijuk', barcode: '8996001030401', price: 25000, categoryId: 3, stock: 30, unit: 'pcs', minStock: 5, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                    { name: 'Ember Plastik 20L', barcode: '8996001030501', price: 35000, categoryId: 3, stock: 25, unit: 'pcs', minStock: 5, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                ];
                for (const prod of products) {
                    await add('products', prod);
                }
            }

            // --- Seed Tax Config ---
            const taxCount = await count('tax_config');
            if (taxCount === 0) {
                await add('tax_config', {
                    id: 1,
                    rate: 11, // PPN 11%
                    updatedAt: new Date().toISOString()
                });
            }

            console.log('[MikoDB] Seed data selesai.');
        } catch (error) {
            console.error('[MikoDB] Error saat seeding:', error);
        }
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================
    return {
        init,
        seed,
        add,
        update,
        getById,
        getByIndex,
        getAll,
        getAllByIndex,
        remove,
        count
    };
})();
