# Gap Analysis: `cendysaputra/agentic-weave` (commit `ebe7cfe`)

> Catatan koreksi (29 Okt 2026): poin G10 soal Cursor keliru. Cursor memang membaca `.agents/skills`, jadi klaim README repo sudah benar. Lihat `2026-10-29-04-tahap-1-deep.md` bagian A2.

Review isi repo setelah dibuka public, dibandingkan dengan permintaan awal dan riset sebelumnya. Bagian ini **menggantikan** Bab 1.2 di README riset, yang waktu itu masih berupa checklist tebakan.

## Ringkasan

Repo ini jauh lebih matang dari dugaan awal. Fondasinya sudah benar: 12 skill modular, satu `antiai-core` dengan rule ID stabil (R-XX, C-X) dan Delivery Gate, format Tell / Why / Fix yang konsisten, serta workflow ATM yang terukur lewat skrip. Kekurangannya ada di cakupan, bukan kualitas. Fitur yang kamu minta tapi belum ada:

1. Konversi hasil clone ke framework/CMS (Laravel, React, WordPress, dll.)
2. Flow end-to-end yang dipahami agent mana pun (`AGENTS.md` + skill orkestrasi)
3. Coding anti-slop di level kode (komentar, over-engineering), branch, dan push gate
4. Pesan manusia-ke-klien (WhatsApp, Slack) dalam bahasa Indonesia
5. Tailwind CSS di daftar library
6. Output design token (`DESIGN.md` / `tokens.json`) dari hasil crawl

## Yang sudah kuat

| Area | Bukti di repo | Catatan |
|---|---|---|
| Arsitektur | 12 skill, `antiai-core` dimuat bersama skill lain, rule tidak pernah diduplikasi | Lebih rapi dari kebanyakan repo anti-slop publik |
| Frontmatter | Semua `name` sama dengan nama folder. `description` 215 sampai 903 karakter, di bawah batas 1024 | Lolos spesifikasi agentskills.io |
| Panjang body | Terpanjang `antiai-ui` 375 baris, sisanya di bawah 150 | Di bawah batas 500 baris |
| UI / Awwwards | Rubrik 40/30/20/10, silhouette test, signature moment, second-order defaults, Core Web Vitals, self-score | Sudah setara atau melampaui Impeccable untuk sisi prinsip |
| ATM | `snapshot-site.mjs` (copy 1 halaman + aset + manifest), `compare-build.mjs` mode `tiru` (layout/pixel similarity) dan `modifikasi` (text reuse ≤ 5%, aset byte-identik, request ke host asli, brand, similarity ≥ 90% = gagal) | Ini nilai paling unik repo kamu. Belum ada padanan publik yang mengukur originalitas seperti ini |
| Etika crawl | robots.txt dihormati default, `--ignore-robots` hanya untuk situs sendiri, larangan login/paywall, `atm/` jangan di-commit | Sudah sesuai. Copy 100% untuk riset lokal aman dengan desain ini |
| Library | `references/libraries.md` dengan versi npm per 2026-10-29, aturan "native first", "one library per job", contoh Lenis + GSAP + reduced motion | Bagus, Barba sudah ditandai sepi rilis |
| Bahasa Indonesia | `antiai-copywriting-id` (nominalisasi, "tak hanya... tetapi juga", code-switching, partikel dipertahankan) dan `antiai-ui-id` (Rupiah, format tanggal, telepon) | Bagian "What NOT to flag" mencegah over-sterilisasi |
| Distribusi | Installer `npx anti-ai-skills` ke `.claude/skills` dan `.agents/skills`, global atau per proyek, dependensi core ikut otomatis | |

## Gap terhadap permintaan

| # | Permintaan | Status | Gap |
|---|---|---|---|
| 1 | UI/UX setara Awwwards | Ada | Kecil: belum ada output design token, lihat G6 |
| 2 | Copywriter | Sebagian | Ada `copywriting-id` dan rule umum di core. Belum ada copy marketing bahasa Inggris (landing page, headline, CTA) sebagai skill tersendiri |
| 3 | Coding: comment label | **Tidak ada** | Tidak ada skill untuk kode itu sendiri: komentar yang mengulang kode, label TODO/FIXME/NOTE, over-engineering, error handling palsu |
| 3 | Coding: push label | Sebagian | `antiai-commit` dan `antiai-pr` ada. Belum ada konvensi branch, push gate (lint/build sebelum push), kebijakan trailer `Co-Authored-By` |
| 4 | Message | Sebagian | `antiai-chat` untuk balasan asisten, `antiai-email` untuk email. Belum ada pesan manusia ke klien via WhatsApp/Slack dengan register Indonesia (Bapak/Ibu vs kamu) |
| 6.1 | Copy website 100% | Ada (1 halaman) | Snapshot hanya satu URL per run. Belum ada mode multi-halaman. Motion GSAP/WebGL hilang di `index.html` (script dibuang) |
| 6.2 | Convert ke Laravel, React, dll. | **Tidak ada** | Tiru hanya bilang "rebuild in the project's own stack". Tidak ada panduan per framework |
| 6.3 | Modifikasi | Ada | Gate originalitas sudah lengkap |
| 7 | Library: Tailwind, Three, GSAP, Barba | Hampir | **Tailwind tidak ada** di `libraries.md` |
| 8 | Flow untuk agent apa pun | **Tidak ada** | Tidak ada `AGENTS.md`, tidak ada skill orkestrasi yang mengurutkan brief → riset → ATM → design → copy → build → QA → commit → handoff |
| 8 | WordPress dan CMS lain | **Tidak ada** | Nol penyebutan WordPress, Elementor, WooCommerce, ACF, Statamic |
| 9 | Codex, Claude Code, Hermes, Grok | Sebagian | Installer hanya `claude` dan `agents`. Hermes memakai `~/.hermes/skills/`. Format Grok belum diverifikasi |

## Rekomendasi per gap

### G1. Skill baru `antiai-code`

Isi yang disarankan, mengikuti format Tell / Why / Fix:

- Komentar yang mengulang kode (`// Return the user`), docblock generik di atas fungsi yang sudah bertipe
- Label komentar: `TODO(owner): ... #issue`, `FIXME:`, `HACK:`, `NOTE:`, `SECURITY:`, `PERF:`. Label hanya dipakai kalau ada tindakan atau konteks non-obvious
- Over-engineering: interface/factory untuk satu implementasi, helper hampir-duplikat
- Defensive overdose: `try/catch` yang hanya melempar ulang, guard berulang, `as any`
- Test slop: mock semua hal, assert yang tidak menguji apa pun
- Hallucinated imports dan API yang tidak ada

Sumber pola: Code Slop (AsyrafHussin, 24 rule, kebetulan PHP/Laravel + TS/React), aislop CLI, studi arXiv 2605.13280 (Excessive Complexity dan Redundant Comments sebagai masalah paling sering di kode LLM).

### G2. Perluas `antiai-commit` atau buat `antiai-git`

- Nama branch: `feat/<tiket>-<slug>`, `fix/<slug>`. Rename branch otomatis agent (`claude/...`, `cursor/...`) sebelum PR ke klien. Repo ini sendiri baru saja merge dari `claude/admiring-galileo-rccfyg`
- Push gate: lint, format, build, dan lint-slop lulus sebelum `git push`. Larangan force-push ke `main`
- Kebijakan trailer `Co-Authored-By: Claude`: pertahankan atau hapus, tulis keputusannya
- Selaraskan contoh: skill sekarang memakai `Fix: ...` (kapital) sementara C-1 juga mengizinkan Conventional Commits. Pilih satu sebagai default supaya agent tidak campur

### G3. Skill baru `antiai-convert` (+ `references/` per target)

```
skills/antiai-convert/
├── SKILL.md                 # strategi umum: normalisasi → segmentasi → data vs presentasi → token → motion → screenshot diff
└── references/
    ├── laravel-blade.md     # anonymous components, layout, Vite
    ├── statamic.md          # blueprints, fieldsets, Antlers/Blade
    ├── react-next.md        # Server Components, @gsap/react, Motion
    ├── vue-nuxt.md
    ├── astro.md
    ├── wordpress-classic.md # template-parts, ACF Flexible Content, escaping
    ├── wordpress-fse.md     # theme.json sebagai token, block patterns
    ├── elementor.md         # Global Colors/Fonts = token, Container, Custom Code
    ├── woocommerce.md       # override template vs hooks
    └── shopify.md
```

Verifikasi tiap konversi bisa memakai ulang `compare-build.mjs --mode tiru` terhadap snapshot, karena skrip itu sudah menerima URL `localhost`. Ini menyambung langsung ke workflow ATM yang sudah ada.

### G4. `AGENTS.md` di root + skill `antiai-flow`

`AGENTS.md` adalah pintu masuk untuk agent yang tidak membaca folder skill. Isinya pendek: skill mana dibaca untuk tugas apa, urutan flow, dan gate wajib.

`antiai-flow` berisi:

1. Intake brief: audiens, satu hal yang harus diingat, referensi dan anti-referensi, stack klien
2. Riset: `crawl-reference.mjs`, opsional `snapshot-site.mjs`
3. Konsep dan design token
4. Copy (`copywriting-id` atau EN)
5. Pilih stack (decision tree: custom code vs WordPress/Elementor/Woo vs Statamic)
6. Build (custom atau CMS) dengan `antiai-convert`
7. QA: Delivery Gate, checklist tiap skill, `compare-build --mode modifikasi`, Lighthouse, aksesibilitas
8. Commit, push, PR
9. Handoff ke klien (`antiai-message`)

Diagram Mermaid flow dan decision tree sudah ada di README riset Bab 11, tinggal dipindah.

### G5. Skill baru `antiai-message` (atau perluas `antiai-chat`)

`antiai-chat` saat ini menangani balasan asisten. Pesan dari tim ke klien punya pola berbeda:

- Pembuka bertele-tele ("Halo Bapak/Ibu yang terhormat, semoga dalam keadaan sehat...")
- Update progres tanpa status nyata ("Kami telah melakukan berbagai peningkatan")
- Tidak ada tenggat, aksi, atau penanggung jawab
- Panjang tidak sesuai kanal (WhatsApp: satu topik per bubble)
- Register: Bapak/Ibu vs kamu ditentukan dari profil klien

Ada ketegangan dengan `copywriting-id` bagian "Register Mixing" yang menganggap campuran Anda/kamu sebagai tanda manusia. Untuk brand copy dan pesan klien, konsistensi register biasanya lebih penting. Perjelas kapan campuran boleh dipertahankan.

### G6. Output design token dari crawl

`crawl-reference.mjs` sudah mengukur palet, type scale, radius, shadow. Tambahkan output `tokens.json` dan template `DESIGN.md` supaya hasil crawl langsung jadi input build (Tailwind theme, CSS variables, `theme.json`, Elementor Global). Pola serupa ada di Firecrawl `branding` dan skill `firecrawl-website-design-clone`.

Catatan penting: token dari referensi pihak ketiga dipakai sebagai bahan studi. Token final tetap diputuskan dari konsep proyek (R-40).

### G7. Tailwind di `libraries.md`

Tambahkan bagian "Styling": Tailwind CSS (versi dari `npm view tailwindcss version`), cara memetakan token ke theme, dan tell khusus Tailwind yang sudah disebut di skill UI (`rounded-2xl shadow-lg backdrop-blur` di semua elemen). Tambahkan juga di tabel "Starting stacks" untuk Laravel/Blade dan WordPress.

### G8. Snapshot multi-halaman dan rekaman motion

- `snapshot-site.mjs --pages N` memakai logika same-origin yang sudah ada di `crawl-reference.mjs`
- Opsi `--video` dengan Playwright `recordVideo` saat scroll, supaya koreografi GSAP/WebGL bisa dipelajari walau `index.html` tidak membawa script

### G9. Linter teks deterministik

Saat ini deteksi otomatis hanya ada di sisi UI. Tambahkan `scripts/lint-text.mjs` di `antiai-core`: em dash, spaced hyphen, emoji di heading/commit, daftar kata R-16/R-36 EN dan ID, frasa "Berikut adalah", "Semoga bermanfaat". Keluarkan exit code non-nol supaya bisa dipasang sebagai pre-commit hook.

### G10. Target agent tambahan di installer

- Tambah target `hermes` (`~/.hermes/skills/` global, `<project>/.hermes/skills/` lokal)
- README mengklaim Cursor membaca `.agents/skills`. Cursor secara resmi membaca `AGENTS.md` dan `.cursor/rules/`. Verifikasi klaim ini, atau tambahkan adapter `.cursor/rules/antiai.mdc` yang menunjuk ke skill
- Grok: format belum diverifikasi. Impeccable menyebut dukungan hook untuk Grok Build, bisa dijadikan acuan

### G11. Kebersihan repo

- **Tidak ada `.gitignore`**, padahal skill menyuruh user meng-ignore `atm/` dan `reference-crawl/`. Tambahkan untuk repo ini sendiri dan sediakan snippet untuk proyek pengguna
- Tidak ada `LICENSE`. Package dipublish ke npm tanpa lisensi berarti hak cipta penuh secara default
- Tidak ada `CHANGELOG.md`, padahal ada skill `antiai-changelog`. Dogfood
- Tidak ada eval. Minimal: beberapa brief yang sama dikerjakan dengan dan tanpa skill, bandingkan hasil `compare-build`, self-score, dan `lint-text`

### G12. Kamus Indonesia, tambahan

`antiai-copywriting-id` sudah mencakup inti. Pola yang belum ada:

- Pembuka zaman: "Di era digital yang terus berkembang ini"
- Terjemahan kaku dari pola Inggris: "mari kita selami lebih dalam" (delve), "memainkan peran penting" (plays a pivotal role), "lanskap" (landscape)
- Pasif birokratis: "telah dilakukan pengembangan"
- Hedging: "dapat membantu meningkatkan potensi"
- Superlatif kosong: "membawa ke level berikutnya", "garda terdepan"

## Prioritas

| Urutan | Pekerjaan | Alasan |
|---|---|---|
| 1 | `.gitignore`, `LICENSE`, `AGENTS.md` | Cepat, menutup risiko dan membuka akses lintas agent |
| 2 | `antiai-flow` | Inti permintaan: satu flow untuk semua agent |
| 3 | `antiai-convert` + reference WordPress/Elementor/Laravel/Statamic | Fitur yang paling sering kamu pakai di Imajiner dan belum ada sama sekali |
| 4 | `antiai-code` + perluasan git | Melengkapi permintaan coding |
| 5 | `antiai-message` | Melengkapi permintaan message |
| 6 | Token output, Tailwind, snapshot multi-halaman | Memperkuat ATM yang sudah ada |
| 7 | `lint-text.mjs`, target Hermes, eval | QA deterministik dan distribusi |

## Sumber

- Repo: https://github.com/cendysaputra/agentic-weave (dibaca langsung, commit `ebe7cfe`)
- Spesifikasi Agent Skills: https://agentskills.io/specification
- AGENTS.md: https://agents.md/
- Hermes Agent skills: https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/skills.md
- Code Slop: https://www.typingmind.com/skills/asyrafhussin-code-slop
- Studi readability kode LLM: https://arxiv.org/pdf/2605.13280
- Conventional Commits: https://www.conventionalcommits.org/en/v1.0.0/
- Firecrawl design clone skill: https://www.firecrawl.dev/blog/claude-code-design-skill
- Impeccable: https://github.com/pbakaus/impeccable
