# Backlog Riset agentic-weave

Antrean topik untuk riset harian. Setiap sesi mengambil item teratas yang belum selesai (`[ ]`) dengan prioritas tertinggi, mengerjakannya sampai tuntas atau sampai batas waktu sesi, lalu memperbarui status di sini.

**Aturan:**
- Satu sesi menghasilkan satu file `YYYY-MM-DD-NN-<slug>.md` (NN = nomor urut hari itu).
- Item yang selesai diberi `[x]` dan nama file hasilnya. Item yang baru separuh diberi `[~]` dan catatan sampai mana.
- Temuan baru yang butuh riset lanjutan ditambahkan sebagai item baru di bagian yang sesuai, jangan dikerjakan di sesi yang sama kalau di luar topik.
- Label wajib di setiap file hasil: FAKTA (dengan sumber primer), REKOMENDASI, BELUM TERVERIFIKASI.
- Utamakan dokumentasi resmi, paper, dan repo sumber. Sumber sekunder hanya pendukung.
- Tulis dalam Bahasa Indonesia, tanpa em dash, pakai "kamu".
- Sesi riset hanya menulis file. Push ke GitHub dilakukan Cendi sendiri.

Prioritas: **P1** langsung memblokir pekerjaan skill berikutnya, **P2** dibutuhkan Tahap 2, **P3** Tahap 3 atau pelengkap.

## Selesai

- [x] Riset awal anti-slop lintas domain → `2026-10-29-01-riset-awal.md`
- [x] Gap analysis isi repo commit `ebe7cfe` → `2026-10-29-02-gap-analysis.md`
- [x] Tahap 1 versi web search → `2026-10-29-03-tahap-1-websearch.md`
- [x] Tahap 1 mode Research: lintas agent, flow, konversi, token → `2026-10-29-04-tahap-1-deep.md`

## Mendesak

- [ ] **P1** Dampak ganti nama repo `anti-ai` ke `agentic-weave`: perlu tidaknya mengganti prefix skill `antiai-*` (rule ID, rujukan antar skill, nama folder harus sama dengan `name`), cara rename package npm (publish nama baru + `npm deprecate` yang lama), redirect GitHub untuk `npx skills add`, nama marketplace dan plugin Claude Code, serta nama perintah CLI. Hasil: rencana migrasi bertahap yang tidak memutus pengguna lama.

## Tahap 2: kualitas eksekusi

### Coding dan git
- [ ] **P1** `antiai-code`: katalog tell slop di kode (komentar narasi, docblock generik, over-engineering, defensive overdose, test slop, hallucinated import). Sumber: Code Slop, aislop, arXiv 2605.13280, studi lain 2025 sampai 2026. Hasil: daftar entri Tell/Why/Fix siap tulis, contoh PHP/Laravel, JS, dan WordPress.
- [ ] **P1** Label komentar (TODO/FIXME/HACK/NOTE/SECURITY/PERF): konvensi yang dipakai proyek besar, tool yang membacanya (todo-tree, eslint no-warning-comments, PHPCS), format owner dan issue.
- [ ] **P2** Git: konvensi nama branch, push gate (husky, lefthook, pre-commit), commitlint, kebijakan trailer `Co-Authored-By` untuk commit buatan AI, pilihan default `Fix:` vs Conventional Commits untuk `antiai-commit`.

### Teks dan pesan
- [ ] **P1** `lint-text.mjs` deterministik EN + ID: desain aturan, perbandingan dengan Vale, textlint, alex, proselint, write-good. Format konfigurasi, dukungan bahasa Indonesia, cara jadi pre-commit hook.
- [ ] **P2** Pesan ke klien (WhatsApp, Slack, email singkat): pola slop, register Bapak/Ibu vs kamu, panjang per kanal, struktur update progres. Resolusi konflik dengan aturan "Register Mixing" di `antiai-copywriting-id`.
- [ ] **P2** Kamus slop bahasa Indonesia lanjutan: cari studi atau korpus teks AI berbahasa Indonesia (paper ACL/arXiv, IndoNLP), daftar frasa terjemahan kaku dari pola Inggris.

### CMS dan konversi (verifikasi lanjutan)
- [ ] **P1** Elementor V4: skema JSON widget atomic (heading, paragraph, button, image, svg) dari dokumentasi developer dan contoh ekspor, Variables/Classes impor massal, Interactions V4 vs GSAP, cara menambah GSAP/Lenis lewat Custom Code, performa.
- [ ] **P1** WordPress block theme: perubahan `theme.json` v3 di WP 6.8 dan 6.9, block patterns, ACF Blocks (block.json v3), pemetaan token ke `theme.json`.
- [ ] **P2** WordPress klasik: konflik plugin cache/optimasi JS (LiteSpeed Cache, Perfmatters, WP Rocket) dengan skrip `defer`, GSAP, dan transisi Swup/Barba. Pola reinit yang aman.
- [ ] **P2** WooCommerce: ekstensibilitas Cart/Checkout block (Slot/Fill, Store API), kapan override template masih wajar, kompatibilitas HPOS untuk theme.
- [ ] **P2** Statamic 6: lokasi definisi set Replicator/Bard, Laravel Boost guideline untuk Statamic, Antlers component tag.
- [ ] **P2** Astro View Transitions: nama event lifecycle (`astro:page-load`, `astro:before-swap`) dan pola cleanup GSAP.

### Crawl dan token
- [ ] **P1** Format DTCG 2025.10 detail: daftar `colorSpace` resmi, apakah hex string diterima, tipe composite (typography, shadow, transition), validator resmi.
- [ ] **P1** Style Dictionary v4/v5 dan Terrazzo: dukungan DTCG 2025.10, output ke Tailwind v4 `@theme`, CSS variables, `theme.json`.
- [ ] **P2** Alat crawl yang belum diverifikasi: HTTrack, `wget --mirror`, SingleFile CLI, Crawl4AI, Jina Reader, Firecrawl branding, Project Wallace. Kemampuan untuk SPA, lazy load, font, dan batasannya.
- [ ] **P2** Snapshot multi-halaman: strategi crawl same-origin, deduplikasi aset, batas ukuran.
- [ ] **P2** Pola DESIGN.md (Google Stitch, Firecrawl, lainnya): struktur yang dipakai dan apa yang cocok untuk `antiai-flow`.

### Flow dan metodologi
- [ ] **P2** BMAD method, Kiro specs, Anthropic skill-creator, Impeccable workflow: artefak, gate, dan pelajaran untuk `antiai-flow`.
- [ ] **P2** Screenshot-to-code dan sejenisnya (screenshot-to-code, v0, same.dev, Bolt, Builder.io Visual Copilot, Locofy): cara kerja, keterbatasan, prompt pattern yang bisa dipinjam.

## Tahap 3: pembuktian dan skala

- [ ] **P3** Metodologi eval skill: SkillsBench (arXiv 2610.08875), desain eval dengan dan tanpa skill untuk UI, copy, dan commit. Metrik yang bisa diotomasi.
- [ ] **P3** `skills-ref` dan validator lain: cara pakai di CI, daftar skill smell dari arXiv 2607.01456 yang bisa dicek otomatis.
- [ ] **P3** Copy marketing bahasa Inggris: pola slop landing page, headline, CTA, dan sumber riset copywriting.
- [ ] **P3** Konversi ke Shopify OS 2.0, Webflow, Vue/Nuxt.
- [ ] **P3** Uji lintas agent: perbedaan perilaku pemicuan skill di Claude Code, Codex, Cursor, Grok Build, Antigravity, OpenCode, Amp, Hermes.
- [ ] **P3** MCP server untuk agentic-weave (crawl, lint, compare): spesifikasi MCP terbaru, contoh server sejenis.
- [ ] **P3** Detail CLI `npx skills add` / skills.sh: flag, lockfile, update.
- [ ] **P3** Agent yang belum terverifikasi: Zed, Junie (path global), Hermes (skill level proyek), Claude Code (baca `.agents/skills`?).

## Pemeliharaan berkala

- [ ] Setiap 30 hari: cek ulang versi library di `skills/antiai-ui/references/libraries.md` dan path skill di matriks agent. Catat perubahan di file riset baru.
