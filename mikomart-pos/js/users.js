/**
 * =============================================================================
 * MikoMart POS — User Management Module
 * =============================================================================
 * Modul manajemen pengguna oleh Admin:
 * - CRUD akun pengguna (Admin, Supervisor, Kasir)
 * - Nonaktifkan akun (soft delete)
 * - Reset password
 *
 * @version 1.0.0
 * @date    28 Maret 2026
 * =============================================================================
 */

const Users = (() => {

    /**
     * Render halaman manajemen pengguna
     */
    async function render() {
        const container = document.getElementById('page-content');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header">
                <div class="page-header-left">
                    <h1 class="page-title">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                        Manajemen Pengguna
                    </h1>
                    <p class="page-subtitle">Kelola akun Admin, Supervisor, dan Kasir</p>
                </div>
                <div class="page-header-right">
                    <button class="btn btn-primary" onclick="Users.showAddModal()">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Tambah Pengguna
                    </button>
                </div>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Lengkap</th>
                            <th>Username</th>
                            <th>Peran</th>
                            <th>Status</th>
                            <th>Terdaftar</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="users-tbody"></tbody>
                </table>
            </div>
        `;

        await loadUsers();
    }

    /**
     * Muat data pengguna ke tabel
     */
    async function loadUsers() {
        try {
            const users = await MikoDB.getAll('users');
            const tbody = document.getElementById('users-tbody');
            if (!tbody) return;

            const roleLabels = { admin: 'Admin', supervisor: 'Supervisor', kasir: 'Kasir' };
            const roleBadges = { admin: 'badge-admin', supervisor: 'badge-supervisor', kasir: 'badge-kasir' };

            tbody.innerHTML = users.map((u, i) => `
                <tr class="${u.status !== 'active' ? 'row-inactive' : ''}">
                    <td>${i + 1}</td>
                    <td><strong>${POS.escapeHtml(u.name)}</strong></td>
                    <td><code>${POS.escapeHtml(u.username)}</code></td>
                    <td><span class="badge ${roleBadges[u.role] || ''}">${roleLabels[u.role] || u.role}</span></td>
                    <td><span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}">${u.status === 'active' ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td>${new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                    <td class="action-cell">
                        <button class="btn-icon btn-edit" onclick="Users.showEditModal(${u.id})" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn-icon" onclick="Users.resetPassword(${u.id})" title="Reset Password">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                        </button>
                        <button class="btn-icon btn-delete" onclick="Users.toggleStatus(${u.id})" title="${u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}">
                            ${u.status === 'active'
                                ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>'
                                : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
                            }
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            App.showNotification('Gagal memuat data pengguna.', 'error');
        }
    }

    /**
     * Tampilkan modal tambah pengguna
     */
    function showAddModal() {
        showUserModal('Tambah Pengguna Baru', null);
    }

    async function showEditModal(userId) {
        const user = await MikoDB.getById('users', userId);
        if (user) showUserModal('Edit Pengguna', user);
    }

    function showUserModal(title, user) {
        const isEdit = user !== null;
        const modal = document.getElementById('app-modal');
        modal.innerHTML = `
            <div class="modal-overlay" onclick="App.closeModal()">
                <div class="modal-content modal-sm" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2 class="modal-title">${title}</h2>
                        <button class="modal-close" onclick="App.closeModal()">×</button>
                    </div>
                    <form id="user-form" onsubmit="Users.saveUser(event, ${isEdit ? user.id : 'null'})">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Nama Lengkap <span class="required">*</span></label>
                                <input type="text" class="form-input" name="name" required value="${isEdit ? POS.escapeHtml(user.name) : ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Username <span class="required">*</span></label>
                                <input type="text" class="form-input" name="username" required value="${isEdit ? POS.escapeHtml(user.username) : ''}" ${isEdit ? 'readonly' : ''}>
                            </div>
                            ${!isEdit ? `
                            <div class="form-group">
                                <label class="form-label">Password <span class="required">*</span></label>
                                <input type="password" class="form-input" name="password" required minlength="6" placeholder="Minimal 6 karakter">
                            </div>` : ''}
                            <div class="form-group">
                                <label class="form-label">Peran <span class="required">*</span></label>
                                <select class="form-input" name="role" required>
                                    <option value="kasir" ${isEdit && user.role === 'kasir' ? 'selected' : ''}>Kasir</option>
                                    <option value="supervisor" ${isEdit && user.role === 'supervisor' ? 'selected' : ''}>Supervisor</option>
                                    <option value="admin" ${isEdit && user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline" onclick="App.closeModal()">Batal</button>
                            <button type="submit" class="btn btn-primary">${isEdit ? 'Simpan' : 'Tambah'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    }

    async function saveUser(event, userId) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        try {
            if (userId) {
                // Update
                const user = await MikoDB.getById('users', userId);
                user.name = formData.get('name').trim();
                user.role = formData.get('role');
                await MikoDB.update('users', user);
                App.showNotification(`Pengguna "${user.name}" berhasil diperbarui.`, 'success');
            } else {
                // Tambah baru
                const username = formData.get('username').trim();
                const existing = await MikoDB.getByIndex('users', 'username', username);
                if (existing) {
                    App.showNotification(`Username "${username}" sudah digunakan.`, 'error');
                    return;
                }
                await MikoDB.add('users', {
                    name: formData.get('name').trim(),
                    username: username,
                    password: formData.get('password'),
                    role: formData.get('role'),
                    status: 'active',
                    createdAt: new Date().toISOString()
                });
                App.showNotification('Pengguna berhasil ditambahkan.', 'success');
            }
            App.closeModal();
            await loadUsers();
        } catch (error) {
            App.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    async function toggleStatus(userId) {
        try {
            const session = Auth.getSession();
            if (session.userId === userId) {
                App.showNotification('Tidak dapat menonaktifkan akun Anda sendiri.', 'error');
                return;
            }
            const user = await MikoDB.getById('users', userId);
            user.status = user.status === 'active' ? 'inactive' : 'active';
            await MikoDB.update('users', user);
            App.showNotification(`Akun "${user.name}" berhasil ${user.status === 'active' ? 'diaktifkan' : 'dinonaktifkan'}.`, 'success');
            await loadUsers();
        } catch (error) {
            App.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    async function resetPassword(userId) {
        const newPass = prompt('Masukkan password baru (min. 6 karakter):');
        if (!newPass || newPass.length < 6) {
            if (newPass !== null) App.showNotification('Password minimal 6 karakter.', 'error');
            return;
        }
        try {
            const user = await MikoDB.getById('users', userId);
            user.password = newPass;
            await MikoDB.update('users', user);
            App.showNotification(`Password "${user.name}" berhasil direset.`, 'success');
        } catch (error) {
            App.showNotification(`Error: ${error.message}`, 'error');
        }
    }

    return { render, loadUsers, showAddModal, showEditModal, saveUser, toggleStatus, resetPassword };
})();
