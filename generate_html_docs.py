"""
generate_html_docs.py
Mengkonversi semua dokumen Markdown MikoMart POS menjadi halaman HTML yang rapi
untuk keperluan screenshot/presentasi.
"""

import os
import re
import glob

# ─── Konfigurasi ─────────────────────────────────────────────────────────────
BRAIN_DIR = r"C:\Users\Mikail Achmad\.gemini\antigravity\brain\4686b559-100b-4513-841d-b96482bd26bf"
OUTPUT_DIR = r"d:\Kuliah\Tugas dan Projek\Metode Rekayasa Perangkat Lunak\docs_html"

DOCS = [
    ("01_project_charter",      "project_charter.md",       "PROJECT CHARTER",              "MikoMart-PC-2026-001"),
    ("02_srs_draft",            "srs_draft.md",             "SOFTWARE REQUIREMENTS SPEC",   "MikoMart-SRS-2026-001"),
    ("03_sla_slo_baseline",     "sla_slo_baseline.md",      "SLA / SLO BASELINE",           "MikoMart-SLA-2026-001"),
    ("04_software_architecture","software_architecture.md", "SOFTWARE ARCHITECTURE (SAD)",  "MikoMart-SAD-2026-001"),
    ("05_database_design",      "database_design.md",       "DATABASE DESIGN",              "MikoMart-DB-2026-001"),
    ("06_api_specification",    "api_specification.md",     "API SPECIFICATION",            "MikoMart-API-2026-001"),
    ("07_use_case_specification","use_case_specification.md","USE CASE SPECIFICATION",      "MikoMart-UC-2026-001"),
    ("08_sqa_plan",             "sqa_plan.md",              "SQA PLAN (IEEE 730)",          "MikoMart-SQA-2026-001"),
    ("09_master_test_plan",     "master_test_plan.md",      "MASTER TEST PLAN (IEEE 829)",  "MikoMart-MTP-2026-001"),
    ("10_ui_ux_design",         "ui_ux_design.md",          "UI/UX DESIGN",                 "MikoMart-UX-2026-001"),
    ("11_uat_script",           "uat_script.md",            "UAT SCRIPT",                   "MikoMart-UAT-2026-001"),
    ("12_deployment_runbook",   "deployment_runbook.md",    "DEPLOYMENT & RUNBOOK",         "MikoMart-DEPLOY-2026-001"),
    ("13_phase5a_scaffold",     "phase5a_scaffold.md",      "PROJECT SCAFFOLD (Fase 5A)",   "MikoMart-5A-2026-001"),
    ("14_phase5b_implementation","phase5b_implementation.md","IMPLEMENTASI MODUL (Fase 5B)","MikoMart-5B-2026-001"),
    ("15_phase5c_review",       "phase5c_review.md",        "CODE REVIEW & TECH DEBT (5C)", "MikoMart-5C-2026-001"),
    ("16_project_closure_paper","project_closure_paper.md", "PROJECT CLOSURE & PAPER AKADEMIK","MikoMart-PCR-2026-001"),
]

# ─── CSS Global ──────────────────────────────────────────────────────────────
CSS = """
:root {
  --bg:#0f172a;--surface:#1e293b;--surface2:#273348;--border:#334155;
  --accent:#38bdf8;--accent2:#818cf8;--green:#34d399;--yellow:#fbbf24;
  --red:#f87171;--orange:#fb923c;--text:#f1f5f9;--muted:#94a3b8;--code-bg:#0d1117;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);line-height:1.75;font-size:15px;}
a{color:var(--accent);}

/* ── Hero ── */
.hero{background:linear-gradient(135deg,#0c1a3b 0%,#1a0b3b 50%,#0c2820 100%);
  padding:56px 40px;text-align:center;border-bottom:1px solid var(--border);position:relative;overflow:hidden;}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(56,189,248,.1) 0%,transparent 70%);}
.hero-badge{display:inline-block;background:rgba(56,189,248,.15);border:1px solid rgba(56,189,248,.4);
  color:var(--accent);padding:6px 18px;border-radius:999px;font-size:11px;font-weight:700;
  letter-spacing:1.5px;text-transform:uppercase;margin-bottom:18px;position:relative;}
.hero h1{font-size:2.6rem;font-weight:800;background:linear-gradient(135deg,#38bdf8,#818cf8);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:10px;position:relative;}
.hero h2{font-size:1.2rem;color:var(--muted);font-weight:400;position:relative;}
.hero-meta{display:flex;justify-content:center;gap:28px;margin-top:28px;flex-wrap:wrap;position:relative;}
.meta-item{text-align:center;}
.meta-label{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;}
.meta-value{font-size:13px;font-weight:600;color:var(--accent);margin-top:4px;}

/* ── Container ── */
.container{max-width:1100px;margin:0 auto;padding:44px 28px;}

/* ── Headings ── */
h1,h2,h3,h4,h5{font-weight:700;color:var(--text);margin:28px 0 14px;}
h1{font-size:2rem;color:var(--accent);}
h2{font-size:1.5rem;color:var(--accent);border-bottom:1px solid var(--border);padding-bottom:10px;}
h3{font-size:1.15rem;color:var(--accent2);}
h4{font-size:1rem;color:var(--yellow);}
p{color:var(--muted);margin-bottom:14px;}

/* ── Table ── */
table{width:100%;border-collapse:collapse;font-size:13.5px;margin:16px 0;}
th{background:var(--surface2);color:var(--muted);font-size:11px;font-weight:700;
  text-transform:uppercase;letter-spacing:1px;padding:11px 14px;text-align:left;border-bottom:2px solid var(--border);}
td{padding:11px 14px;border-bottom:1px solid rgba(51,65,85,.5);vertical-align:top;color:var(--muted);}
td strong,th strong{color:var(--accent2);}
tr:last-child td{border-bottom:none;}
tr:hover td{background:rgba(255,255,255,.02);}

/* ── Code / Pre ── */
pre,code{font-family:'JetBrains Mono','Fira Code',monospace;}
pre{background:var(--code-bg);border:1px solid var(--border);border-radius:10px;
  padding:20px;font-size:12px;color:#e2e8f0;overflow-x:auto;margin:16px 0;line-height:1.6;}
code{background:rgba(56,189,248,.1);color:var(--accent);padding:2px 7px;border-radius:4px;font-size:12px;}
pre code{background:none;color:inherit;padding:0;}

/* ── Blockquote ── */
blockquote{border-left:3px solid var(--accent);padding:12px 20px;
  background:rgba(56,189,248,.06);border-radius:0 8px 8px 0;margin:16px 0;color:var(--muted);}

/* ── Lists ── */
ul,ol{padding-left:24px;margin:10px 0;}
li{color:var(--muted);margin-bottom:6px;}

/* ── Section card ── */
.section{background:var(--surface);border:1px solid var(--border);border-radius:14px;
  padding:32px;margin-bottom:24px;}

/* ── Badges ── */
.badge{display:inline-flex;align-items:center;gap:5px;padding:2px 9px;
  border-radius:999px;font-size:11px;font-weight:700;}
.badge-green{background:rgba(52,211,153,.15);color:var(--green);border:1px solid rgba(52,211,153,.3);}
.badge-yellow{background:rgba(251,191,36,.15);color:var(--yellow);border:1px solid rgba(251,191,36,.3);}
.badge-red{background:rgba(248,113,113,.15);color:var(--red);border:1px solid rgba(248,113,113,.3);}
.badge-orange{background:rgba(251,146,60,.15);color:var(--orange);border:1px solid rgba(251,146,60,.3);}
.badge-blue{background:rgba(56,189,248,.15);color:var(--accent);border:1px solid rgba(56,189,248,.3);}

/* ── SVG wrapper ── */
.svg-wrap{overflow-x:auto;background:#0f172a;padding:20px;border-radius:12px;border:1px solid var(--border);}
.svg-wrap svg{max-width:100%;height:auto;}

/* ── Footer ── */
.footer{background:var(--surface);border-top:1px solid var(--border);padding:28px;
  text-align:center;color:var(--muted);font-size:12.5px;margin-top:40px;}
"""

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{title} — MikoMart POS</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>{css}</style>
</head>
<body>

<div class="hero">
  <div class="hero-badge">{docnum}</div>
  <h1>{title}</h1>
  <h2>MikoMart Point of Sale (POS) System</h2>
  <div class="hero-meta">
    <div class="meta-item"><div class="meta-label">Versi</div><div class="meta-value">1.0</div></div>
    <div class="meta-item"><div class="meta-label">Tanggal</div><div class="meta-value">16–17 April 2026</div></div>
    <div class="meta-item"><div class="meta-label">Status</div><div class="meta-value">Final</div></div>
    <div class="meta-item"><div class="meta-label">Klasifikasi</div><div class="meta-value">INTERNAL — CONFIDENTIAL</div></div>
  </div>
</div>

<div class="container">
{body}
</div>

<div class="footer">
  <strong>{docnum}</strong> &nbsp;|&nbsp; MikoMart POS System &nbsp;|&nbsp; Versi 1.0 &nbsp;|&nbsp; INTERNAL — CONFIDENTIAL
</div>

</body>
</html>
"""


# ─── Markdown → HTML converter (minimal) ────────────────────────────────────

def md_to_html(md: str) -> str:
    lines = md.split('\n')
    html_parts = []
    in_table = False
    in_pre = False
    pre_buf = []
    table_buf = []
    in_ul = False
    in_ol = False

    def flush_table():
        nonlocal table_buf
        if not table_buf:
            return ''
        result = '<div style="overflow-x:auto"><table>\n'
        for i, row in enumerate(table_buf):
            cells = [c.strip() for c in row.strip().strip('|').split('|')]
            if i == 0:
                result += '<thead><tr>' + ''.join(f'<th>{process_inline(c)}</th>' for c in cells) + '</tr></thead>\n<tbody>\n'
            elif re.match(r'^[\s|:\-]+$', row):
                continue  # separator row
            else:
                result += '<tr>' + ''.join(f'<td>{process_inline(c)}</td>' for c in cells) + '</tr>\n'
        result += '</tbody></table></div>\n'
        table_buf = []
        return result

    def flush_list(tag):
        return f'</{tag}>\n'

    def process_inline(text):
        # Bold
        text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
        # Italic
        text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
        # Code
        text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
        # Strikethrough
        text = re.sub(r'~~(.+?)~~', r'<del>\1</del>', text)
        # Links
        text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
        # Emoji badge shortcuts for status columns
        return text

    i = 0
    while i < len(lines):
        line = lines[i]

        # Fenced code block
        if line.startswith('```'):
            if not in_pre:
                # Flush pending table/list
                if in_table:
                    html_parts.append(flush_table())
                    in_table = False
                if in_ul:
                    html_parts.append('</ul>\n')
                    in_ul = False
                if in_ol:
                    html_parts.append('</ol>\n')
                    in_ol = False
                lang = line[3:].strip()
                in_pre = True
                pre_buf = []
                # Special: svg block — wrap in svg-wrap div
                if lang == 'svg':
                    html_parts.append('<div class="svg-wrap">\n')
            else:
                lang_hint = ''
                content = '\n'.join(pre_buf)
                if content.strip().startswith('<svg'):
                    html_parts.append(content + '\n</div>\n')
                else:
                    html_parts.append(f'<pre><code>{content}</code></pre>\n')
                in_pre = False
                pre_buf = []
            i += 1
            continue

        if in_pre:
            pre_buf.append(line)
            i += 1
            continue

        # Table row
        if line.startswith('|'):
            if in_ul:
                html_parts.append('</ul>\n')
                in_ul = False
            if in_ol:
                html_parts.append('</ol>\n')
                in_ol = False
            in_table = True
            table_buf.append(line)
            i += 1
            continue
        elif in_table:
            html_parts.append(flush_table())
            in_table = False

        # HR
        if re.match(r'^---+$', line.strip()):
            html_parts.append('<hr style="border:none;border-top:1px solid #334155;margin:28px 0;">\n')
            i += 1
            continue

        # Headings
        m = re.match(r'^(#{1,6})\s+(.+)$', line)
        if m:
            if in_ul:
                html_parts.append('</ul>\n')
                in_ul = False
            if in_ol:
                html_parts.append('</ol>\n')
                in_ol = False
            level = len(m.group(1))
            text = process_inline(m.group(2))
            html_parts.append(f'<h{level}>{text}</h{level}>\n')
            i += 1
            continue

        # Blockquote
        if line.startswith('> '):
            if in_ul:
                html_parts.append('</ul>\n')
                in_ul = False
            content = process_inline(line[2:])
            html_parts.append(f'<blockquote>{content}</blockquote>\n')
            i += 1
            continue

        # Unordered list
        m_ul = re.match(r'^(\s*)[*\-]\s+(.+)$', line)
        if m_ul:
            if in_ol:
                html_parts.append('</ol>\n')
                in_ol = False
            if not in_ul:
                html_parts.append('<ul>\n')
                in_ul = True
            content = process_inline(m_ul.group(2))
            html_parts.append(f'<li>{content}</li>\n')
            i += 1
            continue
        elif in_ul and line.strip() == '':
            html_parts.append('</ul>\n')
            in_ul = False

        # Ordered list
        m_ol = re.match(r'^\d+\.\s+(.+)$', line)
        if m_ol:
            if in_ul:
                html_parts.append('</ul>\n')
                in_ul = False
            if not in_ol:
                html_parts.append('<ol>\n')
                in_ol = True
            content = process_inline(m_ol.group(1))
            html_parts.append(f'<li>{content}</li>\n')
            i += 1
            continue
        elif in_ol and line.strip() == '':
            html_parts.append('</ol>\n')
            in_ol = False

        # Empty line
        if line.strip() == '':
            html_parts.append('<br>\n')
            i += 1
            continue

        # Paragraph
        if line.strip():
            content = process_inline(line)
            html_parts.append(f'<p>{content}</p>\n')

        i += 1

    # Flush remaining
    if in_table:
        html_parts.append(flush_table())
    if in_ul:
        html_parts.append('</ul>\n')
    if in_ol:
        html_parts.append('</ol>\n')

    return ''.join(html_parts)


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    generated = []

    for (slug, filename, title, docnum) in DOCS:
        src_path = os.path.join(BRAIN_DIR, filename)
        if not os.path.exists(src_path):
            print(f'  [SKIP] tidak ditemukan: {filename}')
            continue

        with open(src_path, 'r', encoding='utf-8') as f:
            md_content = f.read()

        body_html = md_to_html(md_content)

        html = HTML_TEMPLATE.format(
            title=title,
            docnum=docnum,
            css=CSS,
            body=body_html,
        )

        out_path = os.path.join(OUTPUT_DIR, f'{slug}.html')
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(html)

        size_kb = os.path.getsize(out_path) // 1024
        print(f'  [OK] {slug}.html  ({size_kb} KB)')
        generated.append(out_path)

    # ── Buat index.html ──────────────────────────────────────────────────────
    index_items = ''
    for (slug, filename, title, docnum) in DOCS:
        out_path = os.path.join(OUTPUT_DIR, f'{slug}.html')
        if os.path.exists(out_path):
            size_kb = os.path.getsize(out_path) // 1024
            index_items += f'''
            <a href="{slug}.html" class="doc-card">
              <div class="doc-num">{docnum}</div>
              <div class="doc-title">{title}</div>
              <div class="doc-meta">{size_kb} KB &nbsp;·&nbsp; HTML</div>
            </a>'''

    index_html = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>MikoMart POS — Daftar Dokumen</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
{CSS}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:24px;}}
.doc-card{{display:block;background:var(--surface);border:1px solid var(--border);border-radius:14px;
  padding:24px;text-decoration:none;transition:all .2s;}}
.doc-card:hover{{border-color:var(--accent);transform:translateY(-2px);box-shadow:0 8px 24px rgba(56,189,248,.1);}}
.doc-num{{font-size:11px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:1px;}}
.doc-title{{font-size:15px;font-weight:700;color:var(--text);margin:8px 0 6px;}}
.doc-meta{{font-size:12px;color:var(--muted);}}
</style>
</head>
<body>
<div class="hero">
  <div class="hero-badge">MikoMart POS System — Dokumentasi Lengkap</div>
  <h1>DAFTAR DOKUMEN PROYEK</h1>
  <h2>Seluruh Artifact Fase 2 – 6 &nbsp;|&nbsp; 16–17 April 2026</h2>
  <div class="hero-meta">
    <div class="meta-item"><div class="meta-label">Total Dokumen</div><div class="meta-value">{len(DOCS)}</div></div>
    <div class="meta-item"><div class="meta-label">Standar</div><div class="meta-value">IEEE 830 · 1016 · 829 · 730</div></div>
    <div class="meta-item"><div class="meta-label">ISO</div><div class="meta-value">25010 · 12207</div></div>
    <div class="meta-item"><div class="meta-label">Keamanan</div><div class="meta-value">OWASP Top 10</div></div>
  </div>
</div>
<div class="container">
  <div class="grid">{index_items}</div>
</div>
<div class="footer">MikoMart POS System &nbsp;|&nbsp; 16–17 April 2026 &nbsp;|&nbsp; INTERNAL — CONFIDENTIAL</div>
</body>
</html>"""

    index_path = os.path.join(OUTPUT_DIR, 'index.html')
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_html)
    print(f'\n  [+] index.html dibuat')
    print(f'\n[DONE] {len(generated)} dokumen HTML tersimpan di: {OUTPUT_DIR}')


if __name__ == '__main__':
    main()
