# USE CASE SPECIFICATION
## MikoMart Point of Sale (POS) System — Fase 3A

---

| Field | Detail |
|---|---|
| **Nama Sistem** | MikoMart Point of Sale (POS) System |
| **Nomor Dokumen** | MikoMart-UC-2026-001 |
| **Standar** | UML 2.5 + IEEE 830 |
| **Versi** | 1.0 |
| **Tanggal** | 16 April 2026 |
| **Klasifikasi** | INTERNAL — CONFIDENTIAL |

---

## 1. USE CASE DIAGRAM (SVG INTERAKTIF)

> **Panduan Warna:**
> - 🔵 **c-teal** (`#0d9488`) — Use Case Keamanan (Security)
> - 🟣 **c-purple** (`#7c3aed`) — Use Case Fungsional Kasir
> - 🟠 **c-coral** (`#e11d48`) — Use Case Admin & Supervisor
> - 🟡 **c-amber** (`#d97706`) — Use Case Owner

<div style="overflow-x:auto; background:#0f172a; padding:24px; border-radius:12px;">

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 900" width="1100" height="900" font-family="Inter, Segoe UI, sans-serif">
  <defs>
    <style>
      .actor-box { fill:#1e293b; stroke:#475569; stroke-width:1.5; rx:8; }
      .actor-label { fill:#e2e8f0; font-size:13px; font-weight:600; text-anchor:middle; }
      .uc-security { fill:#134e4a; stroke:#0d9488; stroke-width:1.5; }
      .uc-kasir { fill:#2e1065; stroke:#7c3aed; stroke-width:1.5; }
      .uc-admin { fill:#4c0519; stroke:#e11d48; stroke-width:1.5; }
      .uc-owner { fill:#451a03; stroke:#d97706; stroke-width:1.5; }
      .uc-label { fill:#f1f5f9; font-size:10.5px; text-anchor:middle; font-weight:500; }
      .boundary { fill:none; stroke:#334155; stroke-width:2; stroke-dasharray:6,4; rx:16; }
      .logo-text { fill:#38bdf8; font-size:18px; font-weight:800; }
      .section-label { fill:#64748b; font-size:11px; font-weight:700; text-anchor:middle; letter-spacing:1; }
      .include-line { stroke:#94a3b8; stroke-width:1.2; stroke-dasharray:5,3; fill:none; marker-end:url(#arrowGray); }
      .extend-line { stroke:#f59e0b; stroke-width:1.2; stroke-dasharray:5,3; fill:none; marker-end:url(#arrowAmber); }
      .assoc-line { stroke:#475569; stroke-width:1.5; fill:none; }
      .uc-text-sm { fill:#f1f5f9; font-size:9.5px; text-anchor:middle; }
    </style>
    <marker id="arrowGray" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#94a3b8"/>
    </marker>
    <marker id="arrowAmber" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#f59e0b"/>
    </marker>

    <!-- Hover effects via CSS -->
    <filter id="glow-teal">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1100" height="900" fill="#0f172a" rx="12"/>

  <!-- Title -->
  <text x="550" y="36" class="logo-text" text-anchor="middle">🛒 MikoMart POS — Use Case Diagram</text>
  <text x="550" y="55" fill="#64748b" font-size="11" text-anchor="middle">UML 2.5 | Versi 1.0 | 16 April 2026</text>

  <!-- ============ SYSTEM BOUNDARY ============ -->
  <rect x="190" y="68" width="720" height="800" class="boundary"/>
  <text x="550" y="88" class="section-label">MIKOMART POS SYSTEM</text>

  <!-- ============ SECURITY ZONE (c-teal) ============ -->
  <rect x="205" y="96" width="690" height="130" rx="10" fill="#0c2a28" stroke="#0d9488" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="550" y="112" class="section-label" fill="#0d9488">🔒 SECURITY USE CASES</text>

  <!-- UC-S01: Login -->
  <ellipse cx="310" cy="148" rx="75" ry="22" class="uc-security">
    <title>UC-S01: Login\nAktor: Semua Pengguna\nTrigger: Buka aplikasi POS</title>
  </ellipse>
  <text x="310" y="144" class="uc-label">UC-S01</text>
  <text x="310" y="157" class="uc-text-sm">Login</text>

  <!-- UC-S02: Session Management -->
  <ellipse cx="490" cy="148" rx="85" ry="22" class="uc-security">
    <title>UC-S02: Session Management\nAktor: Sistem\nTrigger: Setelah login berhasil</title>
  </ellipse>
  <text x="490" y="144" class="uc-label">UC-S02</text>
  <text x="490" y="157" class="uc-text-sm">Session Management</text>

  <!-- UC-S03: Authorization Check -->
  <ellipse cx="680" cy="148" rx="85" ry="22" class="uc-security">
    <title>UC-S03: Authorization Check\nAktor: Sistem\nTrigger: Setiap request ke endpoint terlindungi</title>
  </ellipse>
  <text x="680" y="144" class="uc-label">UC-S03</text>
  <text x="680" y="157" class="uc-text-sm">Authorization Check</text>

  <!-- UC-S04: Audit Log -->
  <ellipse cx="850" cy="148" rx="75" ry="22" class="uc-security">
    <title>UC-S04: Audit Log\nAktor: Sistem\nTrigger: Setiap aksi sensitif</title>
  </ellipse>
  <text x="850" y="144" class="uc-label">UC-S04</text>
  <text x="850" y="157" class="uc-text-sm">Audit Log</text>

  <!-- ============ KASIR USE CASES (c-purple) ============ -->
  <rect x="205" y="240" width="420" height="400" rx="10" fill="#1a0b3b" stroke="#7c3aed" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="415" y="258" class="section-label" fill="#7c3aed">🧾 KASIR</text>

  <!-- UC-F01: Proses Transaksi -->
  <ellipse cx="310" cy="296" rx="85" ry="22" class="uc-kasir">
    <title>UC-F01: Proses Transaksi POS\nAktor: Kasir, Admin, Supervisor\nTrigger: Pelanggan datang untuk membeli</title>
  </ellipse>
  <text x="310" y="292" class="uc-label">UC-F01</text>
  <text x="310" y="305" class="uc-text-sm">Proses Transaksi POS</text>

  <!-- UC-F02: Split Bill -->
  <ellipse cx="490" cy="296" rx="75" ry="22" class="uc-kasir">
    <title>UC-F02: Split Bill\nAktor: Kasir\nTrigger: Pelanggan bayar kombinasi metode</title>
  </ellipse>
  <text x="490" y="292" class="uc-label">UC-F02</text>
  <text x="490" y="305" class="uc-text-sm">Split Bill</text>

  <!-- UC-F03: Diskon & Override Harga -->
  <ellipse cx="310" cy="360" rx="85" ry="22" class="uc-kasir">
    <title>UC-F03: Diskon &amp; Override Harga\nAktor: Kasir (≤30%)\nTrigger: Kasir terapkan diskon/override saat transaksi</title>
  </ellipse>
  <text x="310" y="356" class="uc-label">UC-F03</text>
  <text x="310" y="369" class="uc-text-sm">Diskon &amp; Override Harga</text>

  <!-- UC-F04: Void & Retur -->
  <ellipse cx="490" cy="360" rx="75" ry="22" class="uc-kasir">
    <title>UC-F04: Ajukan Void &amp; Retur\nAktor: Kasir (ajukan); Supervisor/Admin (setujui)\nTrigger: Kasir minta pembatalan/retur transaksi</title>
  </ellipse>
  <text x="490" y="356" class="uc-label">UC-F04</text>
  <text x="490" y="369" class="uc-text-sm">Ajukan Void &amp; Retur</text>

  <!-- UC-F05: Payment Gateway -->
  <ellipse cx="310" cy="424" rx="85" ry="22" class="uc-kasir">
    <title>UC-F05: Proses Pembayaran Digital\nAktor: Kasir, Payment Gateway\nTrigger: Pelanggan pilih QRIS/Transfer</title>
  </ellipse>
  <text x="310" y="420" class="uc-label">UC-F05</text>
  <text x="310" y="433" class="uc-text-sm">Proses Pembayaran Digital</text>

  <!-- UC-F06: Cetak Struk -->
  <ellipse cx="490" cy="424" rx="75" ry="22" class="uc-kasir">
    <title>UC-F06: Cetak Struk\nAktor: Kasir\nTrigger: Transaksi berhasil diselesaikan</title>
  </ellipse>
  <text x="490" y="420" class="uc-label">UC-F06</text>
  <text x="490" y="433" class="uc-text-sm">Cetak Struk</text>

  <!-- UC-F07: Sinkronisasi Offline -->
  <ellipse cx="310" cy="490" rx="85" ry="22" class="uc-kasir">
    <title>UC-F07: Sinkronisasi Offline-Online\nAktor: Kasir, Sistem\nTrigger: Koneksi kembali setelah offline</title>
  </ellipse>
  <text x="310" y="486" class="uc-label">UC-F07</text>
  <text x="310" y="499" class="uc-text-sm">Sinkronisasi Offline-Online</text>

  <!-- UC-F08: Merge Konflik -->
  <ellipse cx="490" cy="490" rx="75" ry="22" class="uc-kasir">
    <title>UC-F08: Resolve Konflik Sync\nAktor: Kasir\nTrigger: Konflik ditemukan saat sinkronisasi</title>
  </ellipse>
  <text x="490" y="486" class="uc-label">UC-F08</text>
  <text x="490" y="499" class="uc-text-sm">Resolve Konflik Sync</text>

  <!-- UC-F09: Cari Produk -->
  <ellipse cx="390" cy="560" rx="80" ry="22" class="uc-kasir">
    <title>UC-F09: Cari Produk\nAktor: Kasir\nTrigger: Ketik nama/SKU atau scan barcode</title>
  </ellipse>
  <text x="390" y="556" class="uc-label">UC-F09</text>
  <text x="390" y="569" class="uc-text-sm">Cari Produk (Barcode/SKU)</text>

  <!-- ============ ADMIN/SUPERVISOR USE CASES (c-coral) ============ -->
  <rect x="640" y="240" width="260" height="400" rx="10" fill="#3b0a1a" stroke="#e11d48" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="770" y="258" class="section-label" fill="#e11d48">⚙ ADMIN / SUPERVISOR</text>

  <!-- UC-A01: Manajemen Produk -->
  <ellipse cx="770" cy="296" rx="80" ry="22" class="uc-admin">
    <title>UC-A01: Manajemen Produk\nAktor: Admin\nTrigger: Admin buka halaman produk</title>
  </ellipse>
  <text x="770" y="292" class="uc-label">UC-A01</text>
  <text x="770" y="305" class="uc-text-sm">Manajemen Produk</text>

  <!-- UC-A02: Manajemen Inventori & Restock -->
  <ellipse cx="770" cy="360" rx="80" ry="22" class="uc-admin">
    <title>UC-A02: Manajemen Inventori &amp; Restock\nAktor: Admin, Supervisor\nTrigger: Stok minimum tercapai atau PO perlu dibuat</title>
  </ellipse>
  <text x="770" y="356" class="uc-label">UC-A02</text>
  <text x="770" y="369" class="uc-text-sm">Inventori &amp; Restock</text>

  <!-- UC-A03: Kelola Pengguna -->
  <ellipse cx="770" cy="424" rx="80" ry="22" class="uc-admin">
    <title>UC-A03: Kelola Pengguna\nAktor: Admin\nTrigger: Admin buka halaman manajemen user</title>
  </ellipse>
  <text x="770" y="420" class="uc-label">UC-A03</text>
  <text x="770" y="433" class="uc-text-sm">Kelola Pengguna</text>

  <!-- UC-A04: Approve Void/Retur -->
  <ellipse cx="770" cy="490" rx="80" ry="22" class="uc-admin">
    <title>UC-A04: Approve Void &amp; Retur\nAktor: Admin, Supervisor\nTrigger: Permintaan void/retur masuk dari kasir</title>
  </ellipse>
  <text x="770" y="486" class="uc-label">UC-A04</text>
  <text x="770" y="499" class="uc-text-sm">Approve Void &amp; Retur</text>

  <!-- UC-A05: Lihat Audit Log -->
  <ellipse cx="770" cy="560" rx="80" ry="22" class="uc-admin">
    <title>UC-A05: Lihat Audit Log\nAktor: Admin, Supervisor\nTrigger: Buka halaman audit log</title>
  </ellipse>
  <text x="770" y="556" class="uc-label">UC-A05</text>
  <text x="770" y="569" class="uc-text-sm">Lihat Audit Log</text>

  <!-- ============ OWNER USE CASES (c-amber) ============ -->
  <rect x="205" y="660" width="690" height="90" rx="10" fill="#2c1500" stroke="#d97706" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="550" y="676" class="section-label" fill="#d97706">📊 OWNER</text>

  <!-- UC-O01: Lihat Laporan -->
  <ellipse cx="400" cy="720" rx="100" ry="22" class="uc-owner">
    <title>UC-O01: Lihat Rekap Laporan\nAktor: Owner, Admin, Supervisor\nTrigger: Buka halaman laporan</title>
  </ellipse>
  <text x="400" y="716" class="uc-label">UC-O01</text>
  <text x="400" y="729" class="uc-text-sm">Lihat Rekap Laporan</text>

  <!-- UC-O02: Ekspor Pajak -->
  <ellipse cx="650" cy="720" rx="100" ry="22" class="uc-owner">
    <title>UC-O02: Ekspor Data Pajak\nAktor: Owner, Admin\nTrigger: Owner/Admin pilih ekspor laporan pajak</title>
  </ellipse>
  <text x="650" y="716" class="uc-label">UC-O02</text>
  <text x="650" y="729" class="uc-text-sm">Ekspor Data Pajak (PPN)</text>

  <!-- ============ ACTORS ============ -->
  <!-- Kasir Actor -->
  <circle cx="80" cy="350" r="20" fill="none" stroke="#7c3aed" stroke-width="2"/>
  <line x1="80" y1="370" x2="80" y2="420" stroke="#7c3aed" stroke-width="2"/>
  <line x1="55" y1="390" x2="105" y2="390" stroke="#7c3aed" stroke-width="2"/>
  <line x1="80" y1="420" x2="55" y2="455" stroke="#7c3aed" stroke-width="2"/>
  <line x1="80" y1="420" x2="105" y2="455" stroke="#7c3aed" stroke-width="2"/>
  <text x="80" y="470" class="actor-label" fill="#7c3aed">Kasir</text>

  <!-- Admin Actor -->
  <circle cx="1030" cy="350" r="20" fill="none" stroke="#e11d48" stroke-width="2"/>
  <line x1="1030" y1="370" x2="1030" y2="420" stroke="#e11d48" stroke-width="2"/>
  <line x1="1005" y1="390" x2="1055" y2="390" stroke="#e11d48" stroke-width="2"/>
  <line x1="1030" y1="420" x2="1005" y2="455" stroke="#e11d48" stroke-width="2"/>
  <line x1="1030" y1="420" x2="1055" y2="455" stroke="#e11d48" stroke-width="2"/>
  <text x="1030" y="470" class="actor-label" fill="#e11d48">Admin</text>

  <!-- Owner Actor -->
  <circle cx="1030" cy="720" r="20" fill="none" stroke="#d97706" stroke-width="2"/>
  <line x1="1030" y1="740" x2="1030" y2="780" stroke="#d97706" stroke-width="2"/>
  <line x1="1005" y1="760" x2="1055" y2="760" stroke="#d97706" stroke-width="2"/>
  <line x1="1030" y1="780" x2="1005" y2="810" stroke="#d97706" stroke-width="2"/>
  <line x1="1030" y1="780" x2="1055" y2="810" stroke="#d97706" stroke-width="2"/>
  <text x="1030" y="825" class="actor-label" fill="#d97706">Owner</text>

  <!-- Payment Gateway Actor (External) -->
  <rect x="28" y="600" width="90" height="30" fill="#1e293b" stroke="#06b6d4" stroke-width="1.5" rx="6"/>
  <text x="73" y="620" fill="#06b6d4" font-size="10" text-anchor="middle">«external»</text>
  <text x="73" y="648" fill="#06b6d4" font-size="11" text-anchor="middle" font-weight="600">Payment</text>
  <text x="73" y="661" fill="#06b6d4" font-size="11" text-anchor="middle" font-weight="600">Gateway</text>

  <!-- Supervisor Actor -->
  <circle cx="1030" cy="540" r="20" fill="none" stroke="#f97316" stroke-width="2"/>
  <line x1="1030" y1="560" x2="1030" y2="600" stroke="#f97316" stroke-width="2"/>
  <line x1="1005" y1="580" x2="1055" y2="580" stroke="#f97316" stroke-width="2"/>
  <line x1="1030" y1="600" x2="1005" y2="630" stroke="#f97316" stroke-width="2"/>
  <line x1="1030" y1="600" x2="1055" y2="630" stroke="#f97316" stroke-width="2"/>
  <text x="1030" y="645" class="actor-label" fill="#f97316">Supervisor</text>

  <!-- ============ ASSOCIATION LINES ============ -->
  <!-- Kasir → UC-S01 -->
  <line x1="100" y1="345" x2="234" y2="190" class="assoc-line"/>
  <!-- Kasir → UC-F01 -->
  <line x1="100" y1="370" x2="224" y2="296" class="assoc-line"/>
  <!-- Kasir → UC-F09 -->
  <line x1="100" y1="400" x2="309" y2="560" class="assoc-line"/>

  <!-- Admin → UC-A01 -->
  <line x1="1010" y1="360" x2="852" y2="296" class="assoc-line"/>
  <!-- Admin → UC-A03 -->
  <line x1="1010" y1="380" x2="852" y2="424" class="assoc-line"/>
  <!-- Admin → UC-A04 -->
  <line x1="1010" y1="400" x2="852" y2="490" class="assoc-line"/>
  <!-- Admin → UC-O02 -->
  <line x1="1010" y1="420" x2="752" y2="720" class="assoc-line"/>

  <!-- Supervisor → UC-A02 -->
  <line x1="1010" y1="545" x2="852" y2="360" class="assoc-line"/>
  <!-- Supervisor → UC-A04 -->
  <line x1="1010" y1="555" x2="852" y2="490" class="assoc-line"/>
  <!-- Supervisor → UC-A05 -->
  <line x1="1010" y1="565" x2="852" y2="560" class="assoc-line"/>

  <!-- Owner → UC-O01 -->
  <line x1="1010" y1="720" x2="502" y2="720" class="assoc-line"/>
  <!-- Owner → UC-O02 -->
  <line x1="1010" y1="730" x2="752" y2="728" class="assoc-line"/>

  <!-- Payment Gateway → UC-F05 -->
  <line x1="118" y1="620" x2="224" y2="430" class="assoc-line" stroke="#06b6d4"/>

  <!-- ============ INCLUDE LINES (dashed gray) ============ -->
  <!-- UC-F01 →«include»→ UC-S03 -->
  <line x1="340" y1="275" x2="620" y2="165" class="include-line"/>
  <text x="490" y="210" fill="#94a3b8" font-size="9">«include»</text>

  <!-- UC-F01 →«include»→ UC-F09 -->
  <line x1="330" y1="317" x2="355" y2="538" class="include-line"/>
  <text x="300" y="430" fill="#94a3b8" font-size="9">«include»</text>

  <!-- UC-S01 →«include»→ UC-S02 -->
  <line x1="385" y1="148" x2="403" y2="148" class="include-line"/>
  <text x="394" y="143" fill="#94a3b8" font-size="9">«include»</text>

  <!-- UC-S01 →«include»→ UC-S04 -->
  <line x1="380" y1="158" x2="773" y2="158" class="include-line"/>
  <text x="580" y="168" fill="#94a3b8" font-size="9">«include»</text>

  <!-- UC-F03 →«include»→ UC-S04 -->
  <line x1="380" y1="350" x2="820" y2="160" class="include-line"/>
  <text x="650" y="265" fill="#94a3b8" font-size="9">«include»</text>

  <!-- ============ EXTEND LINES (dashed amber) ============ -->
  <!-- UC-F02 →«extend»→ UC-F01 -->
  <line x1="490" y1="274" x2="395" y2="296" class="extend-line"/>
  <text x="445" y="277" fill="#f59e0b" font-size="9">«extend»</text>

  <!-- UC-F04 →«extend»→ UC-A04 -->
  <line x1="562" y1="368" x2="688" y2="494" class="extend-line"/>
  <text x="620" y="435" fill="#f59e0b" font-size="9">«extend»</text>

  <!-- UC-F08 →«extend»→ UC-F07 -->
  <line x1="490" y1="470" x2="395" y2="490" class="extend-line"/>
  <text x="440" y="475" fill="#f59e0b" font-size="9">«extend»</text>

  <!-- Legend -->
  <rect x="210" y="785" width="680" height="70" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1"/>
  <text x="550" y="803" fill="#94a3b8" font-size="10" text-anchor="middle" font-weight="700">LEGEND</text>
  <ellipse cx="255" cy="822" rx="22" ry="9" class="uc-security"/>
  <text x="285" y="826" fill="#0d9488" font-size="10">Keamanan</text>
  <ellipse cx="370" cy="822" rx="22" ry="9" class="uc-kasir"/>
  <text x="402" y="826" fill="#7c3aed" font-size="10">Kasir</text>
  <ellipse cx="470" cy="822" rx="22" ry="9" class="uc-admin"/>
  <text x="500" y="826" fill="#e11d48" font-size="10">Admin/Supervisor</text>
  <ellipse cx="622" cy="822" rx="22" ry="9" class="uc-owner"/>
  <text x="652" y="826" fill="#d97706" font-size="10">Owner</text>
  <line x1="720" y1="822" x2="750" y2="822" class="include-line"/>
  <text x="760" y="826" fill="#94a3b8" font-size="10">«include»</text>
  <line x1="720" y1="840" x2="750" y2="840" class="extend-line"/>
  <text x="760" y="844" fill="#f59e0b" font-size="10">«extend»</text>
</svg>
```

</div>

---

## 2. DAFTAR USE CASE

| ID | Nama Use Case | Aktor Utama | Kategori | FR Mapping |
|---|---|---|---|---|
| **UC-S01** | Login | Semua Pengguna | 🔵 Security | FR-01 |
| **UC-S02** | Session Management | Sistem | 🔵 Security | FR-01.3, FR-01.6 |
| **UC-S03** | Authorization Check | Sistem | 🔵 Security | FR-02 |
| **UC-S04** | Audit Log | Sistem | 🔵 Security | FR-09 |
| **UC-F01** | Proses Transaksi POS | Kasir | 🟣 Kasir | FR-06 |
| **UC-F02** | Split Bill | Kasir | 🟣 Kasir | FR-06.3 |
| **UC-F03** | Diskon & Override Harga | Kasir | 🟣 Kasir | FR-06.4, FR-06.5 |
| **UC-F04** | Ajukan Void & Retur | Kasir | 🟣 Kasir | FR-07.1 |
| **UC-F05** | Proses Pembayaran Digital | Kasir, Payment GW | 🟣 Kasir | FR-08 |
| **UC-F06** | Cetak Struk | Kasir | 🟣 Kasir | FR-10 |
| **UC-F07** | Sinkronisasi Offline-Online | Kasir, Sistem | 🟣 Kasir | FR-12 |
| **UC-F08** | Resolve Konflik Sync | Kasir | 🟣 Kasir | FR-12.4 |
| **UC-F09** | Cari Produk (Barcode/SKU) | Kasir | 🟣 Kasir | FR-03.4 |
| **UC-A01** | Manajemen Produk | Admin | 🟠 Admin | FR-03 |
| **UC-A02** | Manajemen Inventori & Restock | Admin, Supervisor | 🟠 Admin | FR-04, FR-05 |
| **UC-A03** | Kelola Pengguna | Admin | 🟠 Admin | FR-02 |
| **UC-A04** | Approve Void & Retur | Admin, Supervisor | 🟠 Admin | FR-07.3, FR-07.4 |
| **UC-A05** | Lihat Audit Log | Admin, Supervisor | 🟠 Admin | FR-09.4 |
| **UC-O01** | Lihat Rekap Laporan | Owner, Admin, Supervisor | 🟡 Owner | FR-11 |
| **UC-O02** | Ekspor Data Pajak (PPN) | Owner, Admin | 🟡 Owner | FR-11.4 |

---

## 3. USE CASE SPECIFICATION DETAIL

---

### UC-S01: Login

| Field | Detail |
|---|---|
| **ID** | UC-S01 |
| **Nama** | Login |
| **Aktor Utama** | Kasir, Admin, Supervisor, Owner |
| **Aktor Sekunder** | Sistem (AuthService) |
| **Trigger** | Pengguna membuka aplikasi POS atau sesi telah berakhir |
| **Pre-Condition** | Aplikasi POS dapat diakses; pengguna belum login |
| **Post-Condition Sukses** | Sesi valid dibuat; pengguna diarahkan ke halaman sesuai role |
| **Post-Condition Gagal** | Pengguna tetap di halaman login; percobaan gagal dicatat |
| **FR Terkait** | FR-01.1 – FR-01.8 |

**Main Flow:**
1. Pengguna membuka halaman login
2. Pengguna memasukkan username dan password
3. Pengguna menekan tombol "Login"
4. Sistem memvalidasi input (tidak boleh kosong, panjang minimum)
5. Sistem mengambil data pengguna dari database berdasarkan username
6. Sistem memverifikasi password menggunakan bcrypt/Argon2
7. Sistem memeriksa status akun (aktif, tidak terkunci)
8. Sistem membuat JWT token dengan expiry 60 menit
9. Sistem mencatat event login berhasil di Audit Log (UC-S04)
10. Sistem mengarahkan pengguna ke dashboard sesuai role

**Alternative Flow A — Login Gagal (Kredensial Salah):**
- Langkah 6: Verifikasi gagal → tampilkan pesan generik "Username atau password salah"
- Sistem menambah counter percobaan gagal untuk akun tersebut
- Kembali ke langkah 1

**Alternative Flow B — Akun Terkunci:**
- Langkah 7: Akun terkunci terdeteksi → tampilkan pesan "Akun terkunci, coba lagi setelah 15 menit"
- Sistem mencatat event akun terkunci di Audit Log

**Exception Flow E1 — Percobaan ke-5 Gagal:**
- Sistem mengunci akun selama 15 menit
- Sistem mencatat event dalam Audit Log
- Admin dapat membuka kunci secara manual

---

### UC-S02: Session Management

| Field | Detail |
|---|---|
| **ID** | UC-S02 |
| **Nama** | Session Management |
| **Aktor Utama** | Sistem (SessionService) |
| **Trigger** | Login berhasil; interval token refresh; aksi pengguna terdeteksi |
| **Pre-Condition** | Pengguna telah login dan memiliki JWT token valid |
| **Post-Condition Sukses** | Sesi tetap aktif; token diperbarui jika perlu |
| **Post-Condition Gagal** | Sesi diakhiri; pengguna diarahkan ke halaman login |
| **FR Terkait** | FR-01.3, FR-01.6, FR-01.7 |

**Main Flow:**
1. Sistem memonitor aktivitas pengguna pada setiap request
2. Sistem memvalidasi token JWT pada setiap request (signature, expiry)
3. Jika token dalam 5 menit sebelum expired, sistem melakukan silent refresh
4. Sistem memperbarui timer inactivity setiap ada aksi pengguna
5. Jika tidak ada aktivitas selama 30 menit, sistem menginvalidasi sesi
6. Sistem menghapus token dari client-side storage
7. Sistem mencatat event session expired di Audit Log

**Alternative Flow A — Logout Manual:**
- Pengguna menekan tombol Logout
- Sistem mengirim request ke endpoint `/api/v1/auth/logout`
- Server menginvalidasi refresh token di database
- Sesi dihancurkan; pengguna diarahkan ke halaman login
- Audit Log mencatat event logout

---

### UC-S03: Authorization Check

| Field | Detail |
|---|---|
| **ID** | UC-S03 |
| **Nama** | Authorization Check |
| **Aktor Utama** | Sistem (PermissionMiddleware) |
| **Trigger** | Setiap request ke endpoint terlindungi |
| **Pre-Condition** | Request mengandung JWT token valid |
| **Post-Condition Sukses** | Request diteruskan ke handler yang sesuai |
| **Post-Condition Gagal** | Request ditolak dengan HTTP 401 atau 403 |
| **FR Terkait** | FR-02.2, FR-02.3, SEC-01.3, SEC-01.4 |

**Main Flow:**
1. Middleware menerima request yang masuk
2. Middleware mengekstrak Bearer token dari header Authorization
3. Middleware memverifikasi signature JWT
4. Middleware mengekstrak klaim: user_id, role, expiry
5. Middleware memeriksa apakah role memiliki izin untuk resource yang diminta (RBAC matrix)
6. Jika diizinkan, request diteruskan ke controller
7. Controller memproses request dan mengembalikan response

**Alternative Flow A — Token Tidak Ada / Invalid:**
- Langkah 2-3: Token tidak ditemukan atau signature tidak valid
- Sistem mengembalikan HTTP 401 Unauthorized
- Response body: `{"error": "Unauthenticated"}`

**Alternative Flow B — Role Tidak Memiliki Izin:**
- Langkah 5: Role tidak terdaftar dalam RBAC matrix untuk resource ini
- Sistem mengembalikan HTTP 403 Forbidden
- Response body: `{"error": "Insufficient permissions"}`
- Event dicatat di Security Log

---

### UC-S04: Audit Log

| Field | Detail |
|---|---|
| **ID** | UC-S04 |
| **Nama** | Audit Log (Activity Tracking) |
| **Aktor Utama** | Sistem (AuditLogObserver) |
| **Trigger** | Setiap aksi sensitif dilakukan pengguna mana pun |
| **Pre-Condition** | Aksi sensitif terjadi dalam sistem |
| **Post-Condition Sukses** | Entri audit log tersimpan permanen, tidak dapat dihapus pengguna |
| **FR Terkait** | FR-09.1 – FR-09.4 |

**Main Flow:**
1. Event aksi sensitif dipancarkan (dipicu oleh Observer/Hook)
2. AuditLogObserver menangkap event
3. Observer mengumpulkan metadata: timestamp UTC, user_id, username, role, aksi, nilai sebelum, nilai sesudah, IP address, device identifier
4. Observer memastikan data sensitif (password, token) TIDAK masuk log
5. Observer menyimpan entri sebagai JSON ke tabel audit_logs
6. Sistem mengembalikan status sukses ke handler asli

**Data Entri Audit Log:**
```json
{
  "id": "uuid-v4",
  "timestamp": "2026-04-16T15:00:00Z",
  "user_id": 3,
  "username": "kasir01",
  "role": "cashier",
  "action": "TRANSACTION_VOID_REQUESTED",
  "resource_type": "transaction",
  "resource_id": "TRX-20260416-001",
  "value_before": { "status": "completed", "total": 150000 },
  "value_after": { "status": "void_pending" },
  "reason": "Barang rusak",
  "ip_address": "192.168.1.105",
  "device_id": "tablet-kasir-01"
}
```

---

### UC-F01: Proses Transaksi POS

| Field | Detail |
|---|---|
| **ID** | UC-F01 |
| **Nama** | Proses Transaksi POS |
| **Aktor Utama** | Kasir |
| **Aktor Sekunder** | Sistem, Payment Gateway (jika digital) |
| **Trigger** | Pelanggan datang untuk melakukan pembelian |
| **Pre-Condition** | Kasir telah login; antarmuka POS terbuka; produk tersedia di stok |
| **Post-Condition Sukses** | Transaksi tersimpan; stok berkurang; struk dicetak/dihasilkan |
| **Post-Condition Gagal** | Transaksi tidak tersimpan; stok tidak berubah |
| **FR Terkait** | FR-06.1 – FR-06.9 |

**Main Flow:**
1. Kasir menekan tombol "Transaksi Baru"
2. Sistem membuat session transaksi sementara dengan nomor transaksi unik
3. Kasir mencari produk via nama/SKU/barcode (UC-F09)
4. Sistem menampilkan detail produk (nama, harga, stok tersedia)
5. Kasir memilih produk dan menentukan kuantitas
6. Sistem menambahkan item ke keranjang dan menghitung subtotal, PPN, grand total secara real-time
7. Kasir mengulang langkah 3–6 untuk setiap item
8. (Opsional) Kasir menerapkan diskon/override harga (UC-F03) → Audit Log dicatat
9. Kasir memilih metode pembayaran (Tunai / QRIS / Transfer / Kombinasi)
10. Jika tunai: Kasir memasukkan jumlah diterima → sistem menghitung kembalian
11. Jika digital: Sistem memproses via Payment Gateway (UC-F05)
12. Sistem mengkonfirmasi transaksi berhasil
13. Sistem menyimpan transaksi ke database (lokal + server jika online)
14. Sistem mengurangi stok produk secara real-time
15. Sistem menawarkan opsi cetak struk thermal atau PDF (UC-F06)
16. Sistem mencatat transaksi di Audit Log (UC-S04)

**Alternative Flow A — Offline Mode:**
- Langkah 9: Kasir hanya bisa bayar tunai saat offline
- Langkah 13: Transaksi disimpan ke SQLite lokal dengan status "pending sync"
- Sinkronisasi terjadi otomatis saat koneksi kembali (UC-F07)

**Alternative Flow B — Stok Habis:**
- Langkah 4: Sistem mendeteksi stok = 0
- Sistem menampilkan peringatan "Stok habis, produk tidak dapat ditambahkan"
- Kasir memilih produk lain

**Exception Flow E1 — Error Koneksi Saat Proses:**
- Sistem mendeteksi koneksi terputus
- Indikator status berubah ke "OFFLINE"
- Transaksi dapat dilanjutkan hanya dengan metode tunai

---

### UC-F03: Diskon & Override Harga

| Field | Detail |
|---|---|
| **ID** | UC-F03 |
| **Nama** | Diskon & Override Harga |
| **Aktor Utama** | Kasir |
| **Trigger** | Kasir menekan tombol diskon atau override selama proses transaksi |
| **Pre-Condition** | Transaksi aktif; item sudah ada di keranjang |
| **Post-Condition Sukses** | Harga/diskon diperbarui; entri audit log dibuat |
| **FR Terkait** | FR-06.4, FR-06.5, FR-06.6 |

**Main Flow:**
1. Kasir memilih item di keranjang atau total transaksi
2. Kasir menekan tombol "Diskon" atau "Ubah Harga"
3. Sistem menampilkan modal input diskon/harga baru
4. Kasir memasukkan nilai diskon (%) atau harga baru (Rp)
5. Sistem memvalidasi batas: diskon ≤ 30%; harga baru ≥ harga beli (floor price)
6. Sistem meminta tombol konfirmasi
7. Kasir mengkonfirmasi
8. Sistem menerapkan perubahan dan menghitung ulang total
9. **Sistem WAJIB mencatat ke Audit Log**: user, item, harga sebelum, harga sesudah, timestamp

**Alternative Flow A — Melebihi Batas 30%:**
- Langkah 5: Sistem menolak input
- Sistem menampilkan: "Diskon maksimum adalah 30%"
- Kasir harus mengubah nilai

---

### UC-F04 & UC-A04: Void & Retur (Two-Step Authorization)

| Field | Detail |
|---|---|
| **ID** | UC-F04 (Kasir), UC-A04 (Supervisor/Admin) |
| **Nama** | Void & Retur Transaksi (Alur Dua Langkah) |
| **Aktor Utama** | Kasir (ajukan), Supervisor / Admin (setujui) |
| **Trigger** | Kasir menemukan kesalahan transaksi atau pelanggan melakukan retur |
| **Pre-Condition** | Transaksi yang dimaksud ada dan statusnya "completed" |
| **Post-Condition Sukses** | Transaksi berstatus "voided/returned"; stok dikembalikan; audit log lengkap |
| **FR Terkait** | FR-07.1 – FR-07.6 |

**Main Flow — Langkah 1 (Kasir Mengajukan):**
1. Kasir membuka riwayat transaksi
2. Kasir memilih transaksi yang ingin di-void/retur
3. Kasir menekan tombol "Ajukan Void" / "Ajukan Retur"
4. Sistem menampilkan form alasan (wajib diisi)
5. Kasir mengisi alasan dan mengkonfirmasi pengajuan
6. Sistem mengubah status transaksi menjadi "pending_void" / "pending_return"
7. Sistem mengirim notifikasi in-app ke semua Supervisor/Admin yang sedang login
8. Audit Log mencatat pengajuan (kasir, transaksi, alasan, timestamp)

**Main Flow — Langkah 2 (Supervisor / Admin Menyetujui):**
9. Supervisor/Admin menerima notifikasi
10. Supervisor/Admin membuka antrian approval
11. Supervisor/Admin meninjau detail transaksi dan alasan kasir
12. Supervisor/Admin menekan "Setujui" atau "Tolak" beserta catatan
13. Jika disetujui: sistem mengembalikan stok; mengubah status transaksi ke "voided"/"returned"
14. Jika ditolak: status kembali ke "completed"; kasir mendapat notifikasi penolakan
15. Audit Log mencatat keputusan (supervisor/admin, keputusan, catatan, timestamp)

---

### UC-F05: Proses Pembayaran Digital (QRIS/Transfer)

| Field | Detail |
|---|---|
| **ID** | UC-F05 |
| **Nama** | Proses Pembayaran Digital |
| **Aktor Utama** | Kasir |
| **Aktor Sekunder** | Payment Gateway (Midtrans/Xendit) |
| **Trigger** | Kasir memilih metode pembayaran QRIS atau Transfer bank |
| **Pre-Condition** | Koneksi internet tersedia; merchant terdaftar di payment gateway |
| **Post-Condition Sukses** | Pembayaran terkonfirmasi; transaksi selesai |
| **Post-Condition Gagal** | Pembayaran gagal/expired; kasir dapat mencoba ulang atau ganti metode |
| **FR Terkait** | FR-08.1 – FR-08.6 |

**Main Flow:**
1. Kasir memilih "QRIS" atau "Transfer" sebagai metode bayar
2. Sistem membuat order payment ke payment gateway via API
3. Payment gateway mengembalikan payment_url / QR code data
4. Sistem menampilkan QR code kepada pelanggan di layar
5. Pelanggan melakukan scan dan pembayaran melalui aplikasi perbankan/dompet digital
6. Payment gateway mengirim webhook notifikasi status ke endpoint sistem
7. Sistem memverifikasi HMAC signature webhook
8. Jika signature valid dan status = "success": sistem mengkonfirmasi transaksi
9. Sistem melanjutkan ke langkah cetak struk (UC-F06)

**Alternative Flow A — Pembayaran Expired (> 30 detik):**
- Langkah 5-6: Tidak ada pembayaran dalam 30 detik
- Sistem menampilkan notifikasi "Pembayaran expired"
- Kasir dapat memilih: Buat QR baru (retry) atau Ganti ke metode lain
- Transaksi TIDAK dibatalkan

**Exception Flow E1 — Webhook Gagal Diverifikasi:**
- Langkah 7: HMAC tidak valid
- Sistem mengabaikan webhook dan mencatat ke Security Log
- Tidak ada perubahan status transaksi

---

### UC-A01: Manajemen Produk

| Field | Detail |
|---|---|
| **ID** | UC-A01 |
| **Nama** | Manajemen Produk & Kategori |
| **Aktor Utama** | Admin |
| **Trigger** | Admin membuka halaman manajemen produk |
| **Pre-Condition** | Admin telah login |
| **Post-Condition Sukses** | Data produk tersimpan; perubahan harga dicatat di Audit Log |
| **FR Terkait** | FR-03.1 – FR-03.5 |

**Main Flow (Create):**
1. Admin membuka halaman Produk → klik "Tambah Produk"
2. Sistem menampilkan form: nama, SKU, kategori, harga jual, harga beli, stok, stok minimum, satuan, status
3. Admin mengisi semua field wajib
4. Admin menekan "Simpan"
5. Sistem memvalidasi input (SKU unik, harga jual > 0, stok ≥ 0)
6. Sistem menyimpan produk baru ke database
7. Audit Log mencatat penambahan produk

**Alternative Flow A — Edit Harga:**
- Admin menekan "Edit" pada produk yang ada
- Mengubah harga jual
- Sistem memvalidasi dan menyimpan
- **Audit Log WAJIB mencatat**: harga lama, harga baru, admin, timestamp

---

### UC-A02: Manajemen Inventori & Restock (Purchase Order)

| Field | Detail |
|---|---|
| **ID** | UC-A02 |
| **Nama** | Manajemen Inventori & Restock |
| **Aktor Utama** | Admin, Supervisor |
| **Trigger** | Notifikasi stok minimum diterima atau kebutuhan restock manual |
| **Post-Condition Sukses** | PO dibuat; stok bertambah saat konfirmasi penerimaan |
| **FR Terkait** | FR-04.1 – FR-04.5, FR-05.1 – FR-05.4 |

**Main Flow:**
1. Sistem menampilkan notifikasi stok minimum (produk X stok ≤ batas minimum)
2. Admin/Supervisor membuka modul Pembelian → "Buat Purchase Order"
3. Admin/Supervisor memilih produk dan mengisi jumlah yang akan dibeli beserta supplier
4. Admin/Supervisor menyimpan PO dengan status "Draft"
5. Admin mengkonfirmasi PO → status berubah ke "Dikirim ke Supplier"
6. Saat barang tiba, Admin/Supervisor membuka PO → klik "Konfirmasi Penerimaan"
7. Sistem menambahkan jumlah barang ke stok produk secara otomatis
8. Status PO berubah ke "Diterima"
9. Audit Log mencatat perubahan stok

---

### UC-O01: Lihat Rekap Laporan & Ekspor Data Pajak

| Field | Detail |
|---|---|
| **ID** | UC-O01, UC-O02 |
| **Nama** | Lihat Rekap Laporan & Ekspor Data Pajak |
| **Aktor Utama** | Owner |
| **Aktor Sekunder** | Admin |
| **Trigger** | Owner/Admin membuka halaman Laporan |
| **Pre-Condition** | Pengguna login sebagai Owner atau Admin |
| **Post-Condition Sukses** | Laporan ditampilkan; file ekspor tersedia untuk diunduh |
| **FR Terkait** | FR-11.1 – FR-11.5 |

**Main Flow:**
1. Owner login dan membuka halaman Dashboard
2. Sistem menampilkan ringkasan: total penjualan hari ini, minggu ini, bulan ini
3. Owner memilih periode untuk laporan detail (harian/mingguan/bulanan)
4. Sistem menampilkan grafik penjualan, produk terlaris, total omzet
5. Owner menekan "Ekspor Laporan Pajak"
6. Sistem menampilkan form filter tanggal
7. Owner mengisi rentang tanggal dan menekan "Ekspor"
8. Sistem menghasilkan file CSV/Excel dengan data transaksi lengkap termasuk nilai PPN
9. File tersedia untuk diunduh
10. Audit Log mencatat aksi ekspor laporan pajak (siapa, kapan, rentang tanggal)

---

## 4. RINGKASAN USE CASE — RELATIONSHIP MATRIX

| UC | Login | Session | Auth | AuditLog | Trans | Split | Diskon | Void/R | Payment | Print | Sync | Produk | Inventori | User | Laporan |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Kasir** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Ajukan | ✅ | ✅ | ✅ | — | — | — | — |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Setujui | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Supervisor** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Setujui | ✅ | ✅ | ✅ | Baca | ✅ | — | ✅ |
| **Owner** | ✅ | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — | — | ✅ |

---

*Dokumen ini adalah bagian dari Fase 3A — Perancangan Sistem MikoMart POS.*

**Nomor Dokumen:** MikoMart-UC-2026-001 | **Versi:** 1.0 | **Klasifikasi:** INTERNAL — CONFIDENTIAL
