# Riset: Dokumentasi yang Tidak Terasa "AI Slop" (Bahan Perluasan `antiai-docs`)

Supaya dokumentasi tidak terasa "AI slop", `antiai-docs` perlu berhenti menjadi daftar larangan gaya saja. Ia harus mewajibkan tiga hal yang bisa dicek: contoh kode yang benar-benar dijalankan, versi dan konteks yang dicantumkan, dan struktur yang mengikuti kebutuhan pembaca (Diátaxis). Pola gaya seperti emoji, buzzword, dan pembuka chat hanyalah gejala permukaan. Bukti terkuat soal kerugian nyata justru ada di isi yang tidak terverifikasi: paket halusinasi, file konteks agent yang tidak menaikkan keberhasilan tugas tetapi menaikkan biaya, dan laporan "slop" yang menghabiskan waktu maintainer.

## TL;DR

- **Masalah utama slop docs adalah isi yang tidak terverifikasi, bukan gaya.** Studi Spracklen dkk. (USENIX Security 2025) menemukan rata-rata paket halusinasi minimal 5,2% untuk model komersial dan 21,7% untuk model open-source, dengan 205.474 nama paket halusinasi unik. Evaluasi AGENTS.md oleh Gloaguen dkk. (arXiv 2602.11988) menemukan file konteks, baik buatan LLM maupun developer, umumnya tidak menaikkan keberhasilan tugas, sementara biaya inferensi naik lebih dari 20% rata-rata. Jadi skill harus menambah entri "contoh harus dijalankan", "API harus ada", dan "docs agent harus minimal dan spesifik".
- **Ganti sebagian blacklist dengan kerangka positif.** Diátaxis (empat jenis dokumen), prinsip Google developer documentation style guide (orang kedua, kalimat aktif, kondisi sebelum instruksi), PEP 257 dan WordPress PHP Documentation Standards untuk docblock, ADR ala Nygard, serta empat prinsip ISO 24495-1 (relevan, mudah ditemukan, mudah dipahami, bisa dipakai). Semuanya bisa diterjemahkan menjadi entri Tell/Why/Fix yang konkret.
- **Pecah `antiai-docs` menjadi SKILL.md ringkas (sekitar 150 sampai 250 baris) plus enam file `references/`, dan pasang Vale plus markdownlint.** Belum ada style Vale atau rule textlint resmi untuk bahasa Indonesia, jadi aturan bahasa Indonesia (Anda/kamu, "silakan", em dash, frasa stok) harus ditulis sendiri sebagai rule `existence`/`substitution` Vale atau kamus `prh` textlint.

## Daftar Isi

1. Cara membaca label
2. Temuan kunci: bukti tentang slop dokumentasi
3. Kerangka positif pengganti blacklist
4. Katalog pola slop baru (siap tulis ke SKILL.md)
5. Struktur per jenis dokumen
6. Dokumentasi berbahasa Indonesia
7. Alat otomatis dan konfigurasi awal
8. Verifikasi dan docs drift
9. Usulan struktur `antiai-docs` yang diperbarui
10. Template ringkas
11. Belum terverifikasi dan riset lanjutan

## 1. Cara Membaca Label

| Label | Arti |
|---|---|
| **[FAKTA]** | Didukung sumber primer (style guide resmi, paper, dokumentasi tool, standar) yang dibaca selama riset ini. |
| **[REKOMENDASI]** | Kesimpulan atau usulan penulis riset berdasarkan fakta. Boleh kamu tolak. |
| **[BELUM TERVERIFIKASI]** | Pengetahuan umum atau klaim dari sumber sekunder yang belum dicek ke sumber primer dalam riset ini. Jangan dikutip di SKILL.md sebelum dicek. |

Riset ini tidak mengarang versi, angka, atau kutipan. Kalau sebuah angka hanya ada di sumber sekunder, labelnya BELUM TERVERIFIKASI.

## 2. Temuan Kunci: Bukti tentang Slop Dokumentasi

### 2.1 Halusinasi API dan paket dalam contoh kode

- **[FAKTA]** Spracklen dkk. menghasilkan 576.000 sampel kode dari 16 LLM dalam dua bahasa (Python dan JavaScript). Mereka menemukan rata-rata paket halusinasi minimal 5,2% untuk model komersial dan 21,7% untuk model open-source, dengan 205.474 nama paket halusinasi unik. Paper ini terbit di USENIX Security Symposium 2025.
- **[FAKTA]** Paper yang sama menemukan JavaScript punya tingkat halusinasi paket lebih tinggi daripada Python, dan nama halusinasi sering berulang. Karena itu nama-nama tersebut bisa didaftarkan penyerang ("slopsquatting").
- **[REKOMENDASI]** Untuk docs, ini berarti setiap `npm install`, `composer require`, `pip install`, atau `wp plugin install` di README harus dicek ke registry sebelum commit. Cendi banyak memakai ekosistem npm (GSAP, Three.js, Tailwind), jadi risikonya relevan langsung.
- Sumber: arxiv.org/abs/2406.10279, usenix.org/system/files/usenixsecurity25-spracklen.pdf

### 2.2 Dokumentasi untuk agent (AGENTS.md, CLAUDE.md)

- **[FAKTA]** Gloaguen dkk. ("Evaluating AGENTS.md", arXiv 2602.11988) menguji dua setting: tugas SWE-bench dari repo populer dengan file konteks buatan LLM, dan kumpulan issue baru dari repo yang punya file konteks buatan developer. Hasilnya, file konteks umumnya tidak menaikkan keberhasilan tugas, sementara biaya inferensi naik lebih dari 20% rata-rata, baik untuk file buatan LLM maupun developer. File konteks mendorong eksplorasi lebih luas (lebih banyak tes dan penelusuran file), dan agent cenderung mematuhi instruksinya. Paper itu juga menyebut ringkasan repo (repository overview) tidak membantu, walau populer dan direkomendasikan penyedia model.
- **[FAKTA]** Kesimpulan paper itu: file konteks berguna untuk menetapkan praktik coding yang tidak standar, tetapi setiap upaya memperbaiki performa lewat file konteks harus dievaluasi dulu sebelum dipakai.
- **[FAKTA]** Studi empiris "Agent READMEs" (arXiv 2511.12884) menganalisis 2.303 file konteks agent dari 1.925 repo. File ini berevolusi seperti kode konfigurasi lewat penambahan kecil yang sering. Isi yang paling banyak: prosedur tes (75,9%), detail implementasi (70,8%), arsitektur (68,1%). Yang jarang: keamanan (14,8%) dan performa (14,5%).
- **[FAKTA]** Dokumentasi resmi Claude Code menyarankan instruksi yang konkret dan bisa diverifikasi, dengan contoh "Use 2-space indentation" sebagai pengganti "Format code properly". Batas 200 baris atau 25KB yang disebut di halaman itu berlaku untuk MEMORY.md (auto memory), bukan otomatis untuk CLAUDE.md.
- **[FAKTA]** Halaman memory Claude Code juga menargetkan CLAUDE.md di bawah 200 baris per file, karena file yang lebih panjang memakan lebih banyak konteks dan bisa menurunkan kepatuhan. Claude Code membaca AGENTS.md bila tidak ada CLAUDE.md atau CLAUDE.local.md di direktori kerja atau di atasnya; membaca AGENTS.md langsung butuh Claude Code v2.1.277 atau lebih baru.
- **[REKOMENDASI]** Slop khas docs agent: instruksi generik ("write clean code", "follow best practices"), ringkasan arsitektur yang bisa ditemukan agent sendiri, aturan yang saling bertentangan, dan file yang di-generate otomatis lalu tidak pernah diedit.
- Sumber: arxiv.org/abs/2602.11988, arxiv.org/abs/2511.12884, arxiv.org/abs/2601.20404, code.claude.com/docs/en/memory

### 2.3 Kebijakan proyek open source terhadap konten AI

| Proyek | Kebijakan | Label |
|---|---|---|
| curl | Sejak Mei 2025 melarang (ban) pelapor yang mengirim laporan keamanan "AI slop". Bug bounty resmi berhenti 31 Januari 2026 (Stenberg, 26 Januari 2026; perubahan di-merge lewat curl PR #20312). | [FAKTA] (blog Daniel Stenberg) |
| curl | April 2026: Stenberg menulis laporan slop sudah hilang, diganti laporan bagus yang hampir semuanya dibantu AI. Beban maintainer bergeser ke verifikasi laporan yang terlihat masuk akal. | [FAKTA] (dikutip The Register; posting asli di media sosial belum dibaca) |
| Gentoo | Voting Council 14 April 2024 melarang kontribusi yang dibuat dengan bantuan alat AI bahasa alami, dengan alasan hak cipta, kualitas, dan etika. | [FAKTA] (via The Register dan builtplain; wiki Gentoo belum dibaca langsung) |
| NetBSD | Kode dari LLM "presumed to be tainted" dan tidak boleh di-commit tanpa izin tertulis core. | [FAKTA] (dikutip beberapa media; commit guidelines belum dibaca langsung) |
| QEMU | Kebijakan: DECLINE kontribusi yang diyakini mengandung atau berasal dari konten AI. Ada patch v2 di qemu-devel (Mei 2026) untuk melonggarkannya. | Kebijakan lama [FAKTA]; status patch [BELUM TERVERIFIKASI] |
| OpenJDK | Kebijakan interim melarang konten model di kode, email, halaman wiki, dan issue. | [BELUM TERVERIFIKASI] (hanya sumber sekunder) |
| FreeBSD | Core sedang menyusun kebijakan "generative AI created code and documentation" (laporan status Q2 2025). | [FAKTA] (via heise) |

- **[REKOMENDASI]** Pelajaran untuk `antiai-docs`: maintainer menolak teks yang terdengar teknis tetapi tidak bisa direproduksi. Satu-satunya pertahanan yang tahan lama adalah bukti yang bisa diperiksa: perintah yang dijalankan, output nyata, dan versi yang tertulis. Kata yang lebih "manusiawi" saja tidak cukup.
- Sumber: daniel.haxx.se/blog/2026/01/26/the-end-of-the-curl-bug-bounty/, theregister.com/2024/05/18/distros_ai_code/, theregister.com/software/2026/04/06/ai-slop-got-better-so-now-maintainers-have-more-work/5223172, heise.de/en/news/FreeBSD-policy-AI-generated-source-code-No-thanks-10634141.html

### 2.4 Riset kualitas docstring buatan LLM

- **[FAKTA]** DocAgent (arXiv 2504.08725) mendefinisikan docstring yang membantu sebagai docstring yang tidak sekadar mengulang elemen kode. Docstring itu menjelaskan tujuan, konteks pemakaian, alasan desain, dan batasan.
- **[FAKTA]** RepoAgent (arXiv 2402.16667) melaporkan uji preferensi manusia. Pada repo Transformers, dokumentasi model menang 105 dari 150 perbandingan (win rate 0,70) melawan dokumentasi buatan manusia.
- **[REKOMENDASI]** Artinya, docs buatan LLM tidak otomatis lebih buruk. Masalahnya bersifat spesifik: mengulang signature, menjelaskan yang jelas, dan klaim yang tidak dicek. Skill sebaiknya menarget pola ini, bukan "nada AI" secara umum. Ini sejalan dengan R-37 (jangan over-sterilize).
- Sumber: arxiv.org/abs/2504.08725, arxiv.org/abs/2402.16667

## 3. Kerangka Positif Pengganti Blacklist

### 3.1 Diátaxis

- **[FAKTA]** Diátaxis membagi dokumentasi menjadi empat jenis yang menjawab empat kebutuhan berbeda: tutorial, how-to guide, reference, dan explanation. Dua sumbunya: tindakan vs kognisi, dan perolehan keterampilan (belajar) vs penerapan (bekerja).
- **[FAKTA]** Menurut Diátaxis, reference berisi deskripsi teknis yang akurat dan lengkap, bebas dari interpretasi. Reference melayani pengguna yang sedang bekerja.
- **[REKOMENDASI]** Entri baru "Mode Mixing": satu halaman yang mencampur tutorial, reference, dan esai adalah tanda slop paling umum di README buatan AI.
- Sumber: diataxis.fr/start-here/, diataxis.fr

### 3.2 Google developer documentation style guide

- **[FAKTA]** Halaman Highlights menyebut: gunakan orang kedua, kalimat aktif yang jelas siapa pelakunya, kondisi sebelum instruksi, teks tautan yang deskriptif, dan jangan mengumumkan fitur yang akan datang. Panduan ini juga punya halaman khusus tentang excessive claims, timeless documentation, code samples, dan API reference code comments.
- **[REKOMENDASI]** Setiap butir di atas langsung bisa jadi Fix. Contoh: "Untuk menghapus dokumen, klik Hapus" (kondisi dulu) dan bukan "Klik Hapus jika kamu ingin menghapus dokumen".
- Sumber: developers.google.com/style/highlights

### 3.3 Write the Docs: Documentation principles

- **[FAKTA]** Prinsip konten Write the Docs mencakup ARID ("Accept (some) Repetition In Documentation"), Skimmable, Exemplary (sertakan sebagian contoh dan tutorial), Consistent, dan Current. Untuk Current, prinsipnya: "Consider incorrect documentation to be worse than missing documentation."
- **[FAKTA]** Prinsip sumber mencakup Nearby (docs dekat dengan kode) dan Unique. Panduan skimmable menyebut judul harus deskriptif dan teks tautan tidak boleh "click here".
- **[REKOMENDASI]** ARID penting sebagai pengimbang. Pengulangan yang membantu (misalnya prasyarat diulang di tiap how-to) bukan slop. Yang slop adalah ringkasan yang mengulang paragraf sebelumnya tanpa menambah apa pun.
- Sumber: writethedocs.org/guide/writing/docs-principles/

### 3.4 Plain language: ISO 24495-1:2023

- **[FAKTA]** ISO 24495-1:2023 mendefinisikan plain language sebagai komunikasi yang kata, struktur, dan desainnya cukup jelas sehingga pembaca sasaran mudah menemukan, memahami, dan memakai informasinya. Ada empat prinsip: relevan, mudah ditemukan, mudah dipahami, dan bisa dipakai.
- **[FAKTA]** Pedoman Prinsip 1 meminta konten yang akurat, tidak menyesatkan, dan tidak menyembunyikan informasi yang perlu diketahui pembaca.
- **[REKOMENDASI]** Pakai empat prinsip ini sebagai urutan review: (1) apakah isi relevan untuk pembaca ini, (2) apakah bisa ditemukan lewat judul, (3) apakah bisa dipahami, (4) apakah langkahnya bisa dijalankan.
- Sumber: cdn.standards.iteh.ai/samples/78907/d194fac21d6a45f38bfcfec9657f7498/ISO-24495-1-2023.pdf

### 3.5 Kerangka lain yang diminta tetapi belum diverifikasi

- **[BELUM TERVERIFIKASI]** Microsoft Writing Style Guide, GitLab documentation style guide, Divio documentation system (cikal bakal Diátaxis), minimalism John Carroll (The Nurnberg Funnel, 1990), plainlanguage.gov, docs-as-code, dan Make a README tidak dibaca langsung dalam riset ini. Masukkan ke riset lanjutan (bagian 11).

## 4. Katalog Pola Slop Baru (Siap Tulis ke SKILL.md)

Entri di bawah belum ada di `antiai-docs` saat ini. Kolom Rule merujuk ke rule core yang ada, atau usulan rule baru dengan ID sementara `RN-x` (nomor final kamu tentukan sendiri agar tidak bentrok dengan R-XX yang sudah ada).

### 4.1 Tabel ringkas

| Nama entri | Tell | Why | Fix | Rule |
|---|---|---|---|---|
| Unrun Code Samples | Blok kode tanpa output, tanpa versi, tidak pernah dijalankan; ada `...` di tengah perintah | Contoh yang salah lebih buruk daripada tidak ada contoh (WtD: Current) | Jalankan setiap blok; tempel output nyata; tandai blok ilustratif sebagai "tidak bisa dijalankan" | R-17, usulan RN-1 Verified Examples |
| Hallucinated API/Package | Fungsi, hook, flag CLI, atau paket yang tidak ada di kode atau registry | Tingkat paket halusinasi 5,2% sampai 21,7% (Spracklen dkk.); celah slopsquatting | Cek tiap nama ke kode, `composer show`, `npm view`, atau dokumentasi resmi; tulis versi | R-17, RN-1 |
| Version-less Instructions | "Install the latest version", tanpa versi PHP/WP/Node | Instruksi kedaluwarsa diam-diam | Cantumkan versi yang diuji dan tanggal uji | C-5 |
| Signature Echo Docblock | `@param string $name The name.` atau docstring yang mengulang parameter | PEP 257 melarang docstring satu baris yang mengulang signature | Tulis yang tidak terlihat dari tipe: unit, rentang, efek samping, kapan null, hook terkait | R-31, usulan RN-2 |
| Obvious Narration | "This function gets the user" di atas `getUser()`; komentar `// loop through items` | Menambah bacaan tanpa info (DocAgent: helpfulness) | Hapus, atau ganti dengan alasan (why) | R-31, C-3 |
| Walkthrough Preamble | "This guide will walk you through...", "Di panduan ini kita akan belajar..." | Pembaca how-to datang dengan tujuan; preamble menunda langkah pertama | Mulai dengan hasil akhir plus prasyarat, lalu langkah 1 | R-36 |
| Mode Mixing | README berisi tutorial, tabel API lengkap, esai filosofi, dan FAQ sekaligus | Diátaxis: tiap jenis punya kebutuhan berbeda | Pisahkan ke file per jenis; README hanya berisi orientasi dan tautan | R-05 |
| Recap Echo | "In summary", "Kesimpulannya" di akhir halaman pendek yang mengulang poin | Bukan pengulangan yang membantu (ARID), hanya pengisi | Hapus ringkasan di halaman di bawah sekitar 1 layar; di halaman panjang, ganti dengan "Langkah berikutnya" | R-36, C-3 |
| Badge Wall | 8 lebih badge (build, coverage, downloads, license, PRs welcome) di repo internal | Badge tanpa data nyata adalah dekorasi | Simpan badge yang mewakili status nyata (CI, versi rilis); hapus sisanya | R-05, C-3 |
| Placeholder Sections | "Contributing: PRs are welcome!", "License: MIT" tanpa file LICENSE | Bagian kosong memberi sinyal palsu | Hapus atau isi dengan tautan nyata | C-3 |
| Pre-announcement | "Coming soon", "Roadmap: dark mode, AI features" | Google: jangan mengumumkan fitur yang akan datang | Pindahkan ke issue tracker | C-5, R-17 |
| False Precision | "Meningkatkan performa 40%", "kompatibel dengan semua tema" | Angka tanpa metode adalah karangan | Tulis kondisi uji, atau hapus angkanya | R-18 |
| Hedge Stack | "may potentially", "mungkin bisa saja", "biasanya umumnya" | Tidak jelas apa yang benar | Satu klaim, satu syarat: "Jika X, maka Y" | R-31 |
| Drifted Docs | Nama opsi atau field ACF di docs berbeda dengan kode | Docs salah lebih buruk daripada tidak ada | Docs di repo yang sama, review di PR yang sama, cek otomatis | usulan RN-3 Docs Near Code |
| Generic Agent Rules | "Write clean code", "Follow best practices" di AGENTS.md | Claude Code docs: instruksi harus konkret dan bisa diverifikasi | Ganti dengan perintah nyata: "Jalankan `composer test` sebelum commit" | R-31, usulan RN-4 |
| Context Bloat | AGENTS.md hasil `/init` yang dibiarkan; ringkasan arsitektur panjang | Gloaguen dkk.: file konteks umumnya tidak menaikkan keberhasilan, biaya naik lebih dari 20%, dan ringkasan repo tidak membantu | Simpan hanya hal non-standar yang tidak bisa ditemukan agent sendiri | RN-4 |
| Vague Link Text | "klik di sini", "lihat tautan ini" | Google dan WtD: teks tautan harus deskriptif | Tautkan pada nama tujuan: "lihat panduan instalasi" | R-31 |
| ADR Without Downsides | ADR hanya berisi keuntungan | Nygard: semua konsekuensi dicatat, positif, negatif, dan netral | Wajibkan minimal satu konsekuensi negatif atau trade-off | R-17, usulan RN-5 |
| Terjemahan Kaku | "Silakan klik tombol Simpan untuk menyimpan perubahan Anda" | Kata pengisi plus struktur Inggris | "Klik **Simpan**." | R-36, lihat bagian 6 |

### 4.2 Contoh buruk vs baik

**Unrun Code Samples + Version-less Instructions**

Buruk:
```bash
npm install gsap-scrolltrigger
# Then initialize it in your app
```

Baik:
````markdown
Diuji dengan Node 20 dan GSAP 3.x (cek versi di package.json).

```bash
npm install gsap
```

ScrollTrigger sudah termasuk dalam paket `gsap`, daftarkan dengan:

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
```
````

Catatan label: nama paket `gsap-scrolltrigger` di contoh buruk sengaja dipakai sebagai ilustrasi nama yang terdengar masuk akal. Fakta bahwa ScrollTrigger ada di paket `gsap` adalah **[BELUM TERVERIFIKASI]** dalam riset ini, jadi cek ke docs GSAP sebelum memakai contoh ini di SKILL.md.

**Signature Echo Docblock (PHP/WordPress)**

Buruk:
```php
/**
 * Get the price.
 *
 * @param int $product_id The product ID.
 * @return float The price.
 */
```

Baik:
```php
/**
 * Hitung harga akhir produk setelah diskon member.
 *
 * Mengembalikan harga reguler bila user belum login. Hasil di-cache
 * per request lewat wp_cache, jadi panggil ulang tidak memicu query.
 *
 * @since 1.4.0
 *
 * @param int $product_id ID produk WooCommerce.
 * @return float Harga dalam mata uang toko, belum termasuk pajak.
 */
```

**Walkthrough Preamble**

Buruk: "Dalam panduan ini, kami akan memandu Anda langkah demi langkah untuk mengonfigurasi ACF dengan mudah dan cepat."

Baik: "Hasil akhir: field `hero_title` tampil di halaman depan. Kamu butuh ACF Pro dan akses admin. 1. Buka **ACF > Field Groups**..."

**Generic Agent Rules**

Buruk:
```markdown
- Write clean, maintainable code
- Follow WordPress best practices
```

Baik:
```markdown
- Prefix semua fungsi tema dengan `imj_`.
- Jalankan `vendor/bin/phpcs --standard=WordPress` sebelum commit.
- Jangan edit `wp-content/plugins/`; plugin dikelola Composer.
```

- Sumber bagian ini: peps.python.org/pep-0257/, developer.wordpress.org/coding-standards/inline-documentation-standards/php/, developers.google.com/style/highlights, writethedocs.org/guide/writing/docs-principles/, code.claude.com/docs/en/memory, arxiv.org/abs/2406.10279, arxiv.org/abs/2602.11988

## 5. Struktur per Jenis Dokumen

### 5.1 README proyek dan README skill/package

- **[FAKTA]** standard-readme dirancang untuk library open source. Bagian wajib muncul dalam urutan tetap: Title, Short Description, Table of Contents (opsional bila README di bawah 100 baris), Install, Usage, Contributing, License. Bagian opsional: Security, Background, API, Maintainers. Ada preset remark-lint yang memeriksa urutan bagian.
- **[REKOMENDASI]** Untuk proyek klien agency (bukan library), urutan standard-readme terlalu berat. Pakai: satu kalimat apa ini, cara menjalankan lokal, cara deploy, di mana konfigurasi, siapa yang dihubungi. Template ada di bagian 10.
- **[REKOMENDASI]** README skill (folder `skills/antiai-*`): satu kalimat kapan skill dipicu, daftar file, contoh input/output nyata, batasan. Jangan menyalin isi SKILL.md.
- Slop khas: Badge Wall, Placeholder Sections, "Features" beremoji (sudah ada), Getting Started yang mengulang Install.
- Sumber: github.com/RichardLitt/standard-readme/blob/main/spec.md, github.com/RichardLitt/standard-readme-preset

### 5.2 Tutorial dan how-to

- **[FAKTA]** Diátaxis: tutorial berorientasi belajar, how-to berorientasi tujuan dan boleh mengasumsikan pembaca sudah kompeten.
- **[FAKTA]** Google style guide: kondisi sebelum instruksi, orang kedua, kalimat aktif.
- **[REKOMENDASI]** How-to: judul berupa tugas ("Menambah field ACF ke template Blade"), prasyarat, langkah bernomor satu tindakan per langkah, cara memverifikasi hasil. Tanpa preamble, tanpa sejarah.
- Sumber: diataxis.fr/start-here/, developers.google.com/style/highlights

### 5.3 API dan reference docs

- **[FAKTA]** Diátaxis: reference adalah deskripsi, bukan instruksi atau penjelasan. Google punya halaman khusus "API reference code comments" dan "Verbs in reference documents".
- **[REKOMENDASI]** Reference sebaiknya di-generate dari kode (phpDocumentor, TypeDoc) supaya tidak drift. Prosa tangan hanya untuk hal yang tidak terlihat di signature.
- Sumber: diataxis.fr/start-here/, developers.google.com/style/highlights

### 5.4 Docstring dan komentar dokumentasi

| Standar | Status dan isi kunci | Label |
|---|---|---|
| PEP 257 (Python) | Docstring satu baris berbentuk perintah ("Return..."), bukan deskripsi ("Returns..."), dan tidak boleh mengulang signature yang bisa didapat lewat introspeksi | [FAKTA] |
| WordPress PHP Documentation Standards | Skema turunan PHPDoc: Summary, Description, `@since x.x.x` (tiga digit), `@param`, `@return`. Hook (action/filter) wajib didokumentasikan. Hook duplikat cukup diberi komentar satu baris yang merujuk ke file tempat hook itu didokumentasikan | [FAKTA] |
| PSR-5 (PHPDoc) dan PSR-19 (PHPDoc tags) | Keduanya masih berstatus **Draft** di PHP-FIG, editor Chuck Burgess | [FAKTA] |
| JSDoc/TSDoc, Laravel docblock | Tidak dibaca dalam riset ini | [BELUM TERVERIFIKASI] |

- Kutipan PEP 257: one-line docstring "should NOT be a “signature” reiterating the function/method parameters".
- **[REKOMENDASI]** Aturan praktis kapan docblock berguna. Kalau PHP 8 sudah punya type hint lengkap, `@param int $id` tanpa deskripsi hanya mengulang. Docblock layak ditulis bila menambah salah satu dari: unit atau format (sen vs rupiah), rentang nilai, kapan mengembalikan null/false, efek samping (query, cache, hook yang dipicu), `@since`, atau tipe array yang tidak bisa diekspresikan PHP (`array<int, WP_Post>`). Untuk tema/plugin WordPress yang mengikuti WPCS, `@since` dan dokumentasi hook tetap wajib.
- Sumber: peps.python.org/pep-0257/, developer.wordpress.org/coding-standards/inline-documentation-standards/php/, php-fig.org/psr/

### 5.5 Architecture Decision Record (ADR)

- **[FAKTA]** Format Michael Nygard (2011): Title, Status (proposed, accepted, deprecated, superseded), Context, Decision (kalimat aktif, "We will..."), Consequences (semua konsekuensi, positif, negatif, dan netral).
- **[BELUM TERVERIFIKASI]** MADR menambah bagian seperti opsi yang dipertimbangkan dan pro/kontra per opsi. Cek ke adr.github.io/madr sebelum mengutip.
- **[REKOMENDASI]** Slop khas ADR: konteks generik ("kita butuh solusi scalable"), tidak ada alternatif yang ditolak, tidak ada konsekuensi negatif. Untuk agency, ADR berguna untuk keputusan seperti "Elementor vs Gutenberg untuk klien X" atau "Statamic flat-file vs database".
- Sumber: docs.arc42.org/tips/9-5/ (mengutip Nygard), cognitect.com/blog/2011/11/15/documenting-architecture-decisions

### 5.6 Runbook / operational docs

- **[REKOMENDASI]** Tidak ada sumber primer yang dibaca dalam riset ini. Struktur yang diusulkan: gejala, dampak, cara cek (perintah persis), langkah perbaikan, cara verifikasi pulih, eskalasi, riwayat. Slop khas: "Check the logs" tanpa path log, "restart the service" tanpa perintah, tidak ada langkah verifikasi.

### 5.7 Changelog

- **[REKOMENDASI]** Sudah ada skill terpisah. Di `antiai-docs` cukup tulis satu baris: changelog mengikuti skill changelog dan konvensi Keep a Changelog. **[BELUM TERVERIFIKASI]** Kategori Keep a Changelog (Added, Changed, Deprecated, Removed, Fixed, Security) tidak dicek ulang dalam riset ini.

### 5.8 Dokumentasi handoff ke klien agency

- **[FAKTA]** ISO 24495-1: dokumen harus bisa dipakai oleh pembaca sasaran, dengan memperhatikan literasi, latar belakang, dan pengetahuan mereka.
- **[REKOMENDASI]** Klien non-teknis mencari tugas, bukan fitur. Susun berdasarkan tugas ("Mengganti foto banner", "Menambah produk WooCommerce"), satu tugas satu halaman, label tombol ditulis persis seperti di layar (termasuk bahasa dashboard klien), screenshot dengan area yang ditandai, dan bagian "Jangan diubah" (misalnya template Elementor global, field ACF yang dipakai kode). Hindari istilah developer (slug, hook, repeater) atau jelaskan di glosarium singkat.
- **[REKOMENDASI]** Cantumkan versi WordPress, Elementor Pro, dan tanggal screenshot. Tampilan dashboard berubah antar versi, jadi screenshot tanpa tanggal adalah Drifted Docs.

### 5.9 Dokumentasi untuk AI agent

- **[FAKTA]** llms.txt adalah proposal Jeremy Howard (terbit 3 September 2024, v2 dimodifikasi 10 Agustus 2026), bukan standar resmi IETF/W3C. Format: H1 nama proyek (satu-satunya bagian wajib), blockquote ringkasan, paragraf atau daftar tanpa heading, lalu bagian H2 berisi daftar tautan `[nama](url): catatan`. Bagian H2 bernama "Optional" berisi tautan yang boleh dilewati. v2 menyarankan versi markdown tiap halaman (`page.html.md`) dan link relation `rel="describedby"`.
- **[FAKTA]** v2 menyebut Chrome Lighthouse mengaudit keberadaan llms.txt dalam pengecekan agentic browsing, dan OpenAI, Anthropic, serta Gemini menerbitkan llms.txt untuk docs developer mereka.
- **[REKOMENDASI]** Untuk AGENTS.md/CLAUDE.md di proyek Cendi: tulis manual, isi hanya perintah build/test/lint persis, konvensi non-standar (prefix fungsi, lokasi field ACF, aturan Blade), larangan spesifik, dan rujukan ke file. Jangan memuat ringkasan arsitektur yang bisa dibaca agent dari kode. Pakai satu sumber kebenaran: CLAUDE.md mengimpor AGENTS.md, bukan menyalinnya.
- Sumber: llmstxt.org, arxiv.org/abs/2602.11988, code.claude.com/docs/en/memory

## 6. Dokumentasi Berbahasa Indonesia

### 6.1 Acuan resmi

- **[FAKTA]** EYD Edisi V ditetapkan lewat Keputusan Kepala Badan Pengembangan dan Pembinaan Bahasa Nomor 0424/I/BS.00.01/2022 pada 16 Agustus 2022. EYD V menggantikan PUEBI (edisi IV, 2015) dan tersedia sebagai aplikasi web di ejaan.kemdikbud.go.id.
- **[FAKTA]** Microsoft menerbitkan Localization Style Guide untuk banyak bahasa, termasuk Indonesian.
- **[FAKTA]** Panduan gaya lokalisasi Mozilla untuk Indonesia (id) memakai "Anda" sebagai terjemahan "you", menghindari bahasa percakapan dan slang, dan merujuk istilah ke Transvision, daftar istilah internet Indonesia, Panduan Pembakuan Istilah (pelaksanaan Inpres No. 2 Tahun 2001), Microsoft terminology, dan KBBI daring. Contoh pilihan kata: "Create" menjadi "Buat", bukan "Ciptakan".
- **[FAKTA]** Panduan Mozilla itu masih merujuk "Panduan Umum Ejaan Bahasa Indonesia 2015" (PUEBI), yang sudah diganti EYD V.
- **[BELUM TERVERIFIKASI]** Pedoman Umum Pembentukan Istilah, panduan lokalisasi Google untuk Indonesia, dan panduan dokumentasi GovTech/pemerintah tidak dibaca dalam riset ini.
- Sumber: kompas.com/edu/read/2022/08/18/183321671/ubah-pedoman-ejaan-badan-bahasa-luncurkan-eyd-edisi-v, learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides, mozilla-l10n.github.io/styleguides/id/index.html

### 6.2 Keputusan "kamu" vs "Anda"

- **[FAKTA]** Mozilla (proyek formal) memilih "Anda".
- **[REKOMENDASI]** Pilihan "kamu" di repo Cendi sah, tetapi harus ditulis eksplisit di `references/docs-id.md` beserta alasannya (audiens developer, nada kolega) dan pengecualiannya. Untuk handoff ke klien korporat atau instansi, "Anda" mungkin lebih tepat. Yang slop adalah mencampur keduanya dalam satu dokumen, atau memakai "Anda" di setiap kalimat sehingga terasa seperti terjemahan mesin.

### 6.3 Pola slop khas docs berbahasa Indonesia

| Pola | Buruk | Baik | Label |
|---|---|---|---|
| "Silakan" di setiap langkah | "Silakan klik tombol Simpan." | "Klik **Simpan**." | [REKOMENDASI] |
| Pasif birokratis | "Pengaturan dapat dilakukan melalui menu Settings." | "Buka **Settings** untuk mengatur..." | [REKOMENDASI], sejalan dengan prinsip kalimat aktif Google |
| Terjemahan kata per kata | "Ini akan memungkinkan Anda untuk..." (dari "This will allow you to") | "Dengan ini kamu bisa..." atau langsung ke tindakan | [REKOMENDASI] |
| Pengisi formal | "Adapun langkah-langkahnya adalah sebagai berikut:" | "Langkah:" | [REKOMENDASI] |
| Istilah tidak konsisten | "unggah" di satu langkah, "upload" di langkah lain | Pilih satu, catat di glosarium | [REKOMENDASI] |
| Label UI diterjemahkan sendiri | "Klik Terbitkan" padahal dashboard klien berbahasa Inggris | Tulis persis label di layar: "Klik **Publish**" | [REKOMENDASI] |

### 6.4 Padanan istilah

- **[REKOMENDASI]** Aturan: (1) label UI ditulis persis seperti di layar; (2) istilah yang sudah umum dan baku dipakai dalam bentuk Indonesia (unduh, unggah, tautan, pengaturan, kata sandi); (3) istilah developer yang belum punya padanan mapan tetap dalam bahasa Inggris dan dimiringkan sesuai EYD untuk unsur asing (hook, slug, repeater, build, deploy); (4) catat semua keputusan di glosarium proyek. Cek padanan ke KBBI daring sebelum masuk glosarium.
- **[BELUM TERVERIFIKASI]** Status baku tiap padanan di KBBI tidak dicek satu per satu dalam riset ini.

## 7. Alat Otomatis dan Konfigurasi Awal

### 7.1 Ringkasan alat

| Alat | Fungsi | Dukungan bahasa Indonesia | Label |
|---|---|---|---|
| Vale | Prose linter berbasis rule YAML: existence, substitution, occurrence, conditional, capitalization, metric, spelling, script, dll. Package resmi: Google v0.7.1, Microsoft v0.15.1, write-good v0.4.1, proselint v0.3.4, alex v0.2.3, Readability v0.2.0 | Tidak ada style resmi. Spelling bisa memakai kamus Hunspell; rule regex (`existence`, `substitution`) bekerja di bahasa apa pun | [FAKTA] |
| markdownlint / markdownlint-cli2 | Lint struktur Markdown. Rule contoh: MD013 line-length, MD033 no-inline-html, MD040 fenced-code-language, MD041 first-line-heading | Tidak relevan (struktur) | [FAKTA] |
| textlint | Linter teks berbasis plugin, tanpa rule bawaan, lebih dari 100 rule | Wiki rule hanya punya bagian Global, English, Japanese, Chinese, Arabic. `textlint-rule-prh` (kamus regex) bersifat language-agnostic | [FAKTA] |
| lychee | Link checker (Rust) untuk Markdown, HTML, dll.; ada GitHub Action | Tidak relevan | [FAKTA] |
| doctest / pytest `--doctest-glob` / `cargo test` | Menjalankan contoh kode di docs | Tidak relevan | [FAKTA] |
| cspell | Spell checker kode | Tidak dicek | [BELUM TERVERIFIKASI] |

- **[FAKTA]** Vale hanya mengembalikan exit code non-zero untuk level `error`. Warning dan suggestion tidak menggagalkan CI.
- **[FAKTA]** PostHog memakai Vale untuk menegakkan gaya penulisan di seluruh situsnya, termasuk melarang em dash.
- Sumber: vale.sh/docs/topics/styles/, docs.vale.sh/topics/quickstart, vale.sh/explorer, docs.vale.sh/guides/hunspell, github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md, github.com/DavidAnson/markdownlint-cli2, github.com/textlint/textlint, github.com/textlint/textlint/wiki/collection-of-textlint-rule, github.com/azu/textlint-rule-prh, github.com/lycheeverse/lychee, posthog.com/handbook/wizard-and-docs/vale

### 7.2 Vale: konfigurasi repo `agentic-weave`

**[REKOMENDASI]** Struktur:

```text
.vale.ini
.vale/styles/AntiAI/EmDash.yml
.vale/styles/AntiAI/StockPhrases.yml
.vale/styles/AntiAI/Hedging.yml
.vale/styles/AntiAI/AndaKamu.yml
.vale/styles/AntiAI/Silakan.yml
.vale/styles/AntiAI/WalkThrough.yml
```

`.vale.ini`:

```ini
StylesPath = .vale/styles
MinAlertLevel = suggestion
Packages = Google

[*.md]
BasedOnStyles = AntiAI
Google.Passive = suggestion
Google.We = warning
Google.Exclamation = warning
Vale.Spelling = NO
```

Catatan: `Vale.Spelling = NO` karena kamus bawaan berbahasa Inggris (US) dan repo ini dwibahasa. Jalankan `vale sync` sekali untuk mengunduh package Google. Nama rule Google di atas (`Passive`, `We`, `Exclamation`) adalah **[BELUM TERVERIFIKASI]**, jadi cek daftar file di package Google setelah `vale sync`.

`EmDash.yml` (R-02):

```yaml
extends: existence
message: "Jangan pakai em dash (R-02). Pecah kalimat atau pakai titik dua/koma."
level: error
nonword: true
tokens:
  - '—'
```

`StockPhrases.yml` (R-36):

```yaml
extends: existence
message: "Frasa stok AI: '%s' (R-36). Mulai langsung dari isi."
level: warning
ignorecase: true
tokens:
  - this guide will walk you through
  - in this (?:guide|tutorial|article), (?:we|you) will
  - let's dive in
  - in today's fast-paced
  - it's worth noting that
  - dalam panduan ini,? (?:kita|kami|kamu) akan
  - mari kita (?:mulai|selami)
  - perlu diingat bahwa
```

`AndaKamu.yml` (sapaan konsisten, khusus repo ini):

```yaml
extends: substitution
message: "Repo ini memakai 'kamu', bukan '%s'."
level: error
ignorecase: false
swap:
  '\bAnda\b': kamu
```

`Silakan.yml`:

```yaml
extends: occurrence
message: "'Silakan' terlalu sering. Pakai kalimat perintah langsung."
level: suggestion
scope: text
max: 1
token: '\b[Ss]ilakan\b'
```

`Hedging.yml` (R-31):

```yaml
extends: existence
message: "Hedging bertumpuk: '%s'. Tulis satu klaim dengan satu syarat."
level: warning
ignorecase: true
tokens:
  - may potentially
  - might possibly
  - mungkin saja bisa
  - biasanya umumnya
```

**[REKOMENDASI]** Uji tiap rule dengan file fixture (contoh buruk dan baik) seperti praktik PostHog, lalu jalankan di CI. Mulai dengan level `warning` selama dua sampai tiga minggu sebelum menaikkan ke `error`, supaya tidak memblokir PR karena false positive.

### 7.3 Vale untuk proyek pengguna (klien)

**[REKOMENDASI]** Versi ringan: hanya `EmDash`, `StockPhrases`, dan `Hedging` di level `warning`, tanpa `AndaKamu`, karena proyek klien bisa memakai "Anda". Distribusikan sebagai package zip lewat key `Packages` (Vale mendukung package berupa zip yang berisi `.vale.ini` dan/atau folder styles).

### 7.4 markdownlint-cli2

`.markdownlint-cli2.jsonc` **[REKOMENDASI]**:

```jsonc
{
  "config": {
    "default": true,
    "MD013": false,
    "MD033": { "allowed_elements": ["details", "summary", "br", "kbd"] },
    "MD040": true,
    "MD041": true
  },
  "ignores": ["node_modules/**", "vendor/**"]
}
```

Alasan: MD040 memaksa bahasa di setiap blok kode, yang membantu lint dan pengujian contoh. MD013 dimatikan karena prosa satu-baris-per-paragraf lebih mudah di-diff.

### 7.5 textlint + prh untuk istilah Indonesia

`prh.yml` **[REKOMENDASI]**:

```yaml
version: 1
rules:
  - expected: unggah
    pattern: /\bupload\b/
    specs:
      - from: upload file
        to: unggah file
  - expected: kata sandi
    pattern: password
```

Catatan: pakai prh hanya untuk prosa. Label UI yang memang berbahasa Inggris harus dikecualikan, atau pakai `options: wordBoundary: true` dan tinjau manual.

## 8. Verifikasi dan Docs Drift

### 8.1 Menjalankan contoh kode

- **[FAKTA]** Python `doctest` mencari teks yang mirip sesi interaktif Python lalu menjalankannya untuk memastikan hasilnya persis seperti yang tertulis. Bisa dipakai pada file teks (`python -m doctest -v file.txt`).
- **[FAKTA]** pytest bisa menjalankan doctest di file teks lewat `--doctest-glob` (misalnya `"*.rst"`). Plugin pihak ketiga pytest-doctestplus memakai `--doctest-glob '*.md'` untuk Markdown.
- **[FAKTA]** Di Rust, `cargo test` menjalankan documentation tests secara default.
- **[REKOMENDASI]** Untuk stack PHP/JS Cendi yang tidak punya doctest bawaan: ekstrak blok kode bertanda bahasa (MD040 membantu) ke file sementara lalu jalankan `php -l` (cek sintaks) dan `node --check` di CI. Untuk perintah shell, pakai blok yang dijalankan di container CI dengan versi yang sama dengan yang tertulis di docs.

### 8.2 Tautan dan versi

- **[FAKTA]** lychee memeriksa tautan rusak di Markdown dan HTML, punya mode `--offline` untuk tautan lokal, dan tersedia sebagai GitHub Action.
- **[REKOMENDASI]** Setiap dokumen yang memuat perintah instalasi wajib punya baris "Diuji dengan: PHP x.y, WordPress x.y, Node x, tanggal". Ini penerapan langsung C-5.

### 8.3 Mencegah docs drift

- **[FAKTA]** Write the Docs: prinsip Nearby (docs dekat dengan kode yang didokumentasikan) dan Current (docs salah lebih buruk daripada tidak ada).
- **[FAKTA]** Studi Agent READMEs menemukan file konteks agent berubah lewat penambahan kecil yang sering, seperti kode konfigurasi.
- **[REKOMENDASI]** Tiga mekanisme: (1) docs di repo dan PR yang sama dengan kode; (2) template PR dengan checklist "docs diperbarui atau tidak perlu"; (3) reference di-generate dari kode, bukan ditulis tangan.

### 8.4 Checklist review dokumentasi

**[REKOMENDASI]**

1. Jenis dokumen jelas (tutorial, how-to, reference, explanation, ADR, runbook, handoff)?
2. Kalimat pertama menyatakan apa ini dan untuk siapa?
3. Setiap blok kode punya bahasa, sudah dijalankan, dan versinya tertulis?
4. Setiap nama paket, fungsi, hook, flag, dan field ada di kode atau registry?
5. Tidak ada angka tanpa sumber atau kondisi uji?
6. Tidak ada bagian kosong, placeholder, atau pengumuman fitur?
7. Teks tautan deskriptif dan lolos link checker?
8. Docblock menambah info di luar tipe?
9. Bahasa Indonesia: sapaan konsisten, label UI persis, istilah sesuai glosarium?
10. Vale dan markdownlint lolos tanpa error?

## 9. Usulan Struktur `antiai-docs` yang Diperbarui

**[REKOMENDASI]**

```text
skills/antiai-docs/
  SKILL.md                  (target 150-250 baris, batas keras < 500)
  references/
    readme.md               README proyek, README skill/package, badge, standard-readme
    docstring.md            PEP 257, WordPress PHP docs, PHPDoc/PSR-5/PSR-19 (draft), JSDoc/TSDoc
    adr.md                  Nygard, MADR, contoh keputusan agency
    runbook.md              struktur runbook, perintah persis, verifikasi
    handoff-klien.md        panduan edit konten WP/Elementor/Statamic untuk non-teknis
    agent-docs.md           AGENTS.md, CLAUDE.md, llms.txt, temuan Gloaguen dkk.
    docs-id.md              EYD V, kamu/Anda, glosarium istilah, pola slop ID
    tooling.md              Vale, markdownlint, textlint/prh, lychee, doctest
  assets/
    vale/                   .vale.ini + styles/AntiAI/*.yml
    markdownlint-cli2.jsonc
    templates/              README, README skill, ADR, runbook, handoff
```

Isi SKILL.md:

| Bagian | Isi | Alasan tetap di SKILL.md |
|---|---|---|
| Trigger dan cakupan | Kapan skill dipakai; rujukan ke skill commit/PR/changelog/error/email | Wajib dibaca setiap kali |
| Pilih jenis dokumen dulu | Tabel Diátaxis plus ADR, runbook, handoff, agent docs (1 baris per jenis, tautan ke references) | Mencegah Mode Mixing sejak awal |
| Chat Leaks (sudah ada) | Tetap | |
| Structure (sudah ada + baru) | + Mode Mixing, Badge Wall, Placeholder Sections, Recap Echo, Pre-announcement | Pola paling sering |
| Wording (sudah ada + baru) | + Walkthrough Preamble, Hedge Stack, Vague Link Text, Obvious Narration | |
| Verification (baru) | Unrun Code Samples, Hallucinated API/Package, Version-less Instructions, False Precision, Drifted Docs | Dampak terbesar menurut bukti |
| Checklist | 10 butir bagian 8.4 | |

Yang dipindah ke `references/`: semua detail per jenis dokumen, contoh panjang buruk/baik, konfigurasi tool, aturan bahasa Indonesia.

Usulan rule core baru (ID sementara):

| ID sementara | Nama | Isi singkat |
|---|---|---|
| RN-1 | Verified Examples | Contoh kode dan perintah harus dijalankan atau ditandai sebagai ilustrasi |
| RN-2 | Docs Add What Code Can't Say | Docblock/komentar hanya untuk info yang tidak terlihat dari nama dan tipe |
| RN-3 | Docs Near Code | Docs diperbarui di PR yang sama dengan perubahan perilaku |
| RN-4 | Minimal Agent Context | File untuk agent hanya berisi instruksi non-standar yang konkret dan bisa dicek |
| RN-5 | Record Trade-offs | Dokumen keputusan wajib menyebut alternatif dan konsekuensi negatif |

## 10. Template Ringkas

### 10.1 README proyek (klien agency)

```markdown
# Nama Proyek

Satu kalimat: situs apa, untuk klien siapa, stack utama.

## Menjalankan lokal
Diuji dengan: PHP x.y, WordPress x.y, Node x (tanggal).
1. Perintah persis
2. Perintah persis

## Deploy
Ke mana, oleh siapa, perintah atau pipeline.

## Konfigurasi
File dan variabel env yang penting (tanpa nilai rahasia).

## Struktur yang tidak standar
Hanya yang menyimpang dari default WordPress/Statamic.

## Kontak
Penanggung jawab teknis dan klien.
```

### 10.2 README skill

```markdown
# antiai-<nama>

Dipakai ketika: satu kalimat pemicu.

## File
- SKILL.md: aturan inti
- references/...: detail per topik

## Contoh
Input nyata -> output nyata (dipendekkan).

## Batasan
Apa yang tidak ditangani skill ini dan skill mana yang menangani.
```

### 10.3 ADR

```markdown
# ADR-NNN: Keputusan dalam satu kalimat

Status: proposed | accepted | deprecated | superseded oleh ADR-MMM
Tanggal: YYYY-MM-DD
Pengambil keputusan: nama

## Konteks
Kendala nyata: klien, anggaran, tim, teknis.

## Opsi yang dipertimbangkan
- Opsi A: alasan ditolak
- Opsi B: alasan ditolak

## Keputusan
Kita akan ...

## Konsekuensi
- Positif:
- Negatif (wajib minimal satu):
- Netral:
```

### 10.4 Runbook

```markdown
# Runbook: <gejala>

Terakhir diuji: YYYY-MM-DD

## Gejala
Apa yang terlihat (pesan error persis).

## Dampak
Siapa terdampak, seberapa parah.

## Cek
Perintah persis + output normal vs bermasalah.

## Perbaikan
Langkah bernomor, satu perintah per langkah.

## Verifikasi
Cara memastikan sudah pulih.

## Eskalasi
Siapa, kapan, lewat apa.
```

### 10.5 Panduan handoff klien

```markdown
# Panduan Mengelola Konten <Nama Situs>

Untuk: tim konten <klien>. Versi dashboard: WordPress x.y, Elementor Pro x.y.
Screenshot diambil: YYYY-MM-DD.

## Masuk ke dashboard
## Tugas yang sering
### Mengganti foto banner beranda
1. Langkah dengan label tombol persis
   [screenshot dengan area ditandai]
### Menambah produk
...
## Jangan diubah
Daftar halaman/template/field yang dipakai kode.
## Kalau ada masalah
Kontak dan info yang perlu dikirim (URL, screenshot, waktu).
## Glosarium
Istilah yang muncul di dashboard dan artinya.
```

## 11. Belum Terverifikasi dan Riset Lanjutan

| Topik | Yang perlu dicek | Label |
|---|---|---|
| Microsoft Writing Style Guide, GitLab docs style guide, Divio, minimalism Carroll, plainlanguage.gov, Make a README, docs-as-code | Aturan konkret yang bisa jadi Tell/Why/Fix | [BELUM TERVERIFIKASI] |
| JSDoc/TSDoc, Laravel docblock conventions | Konvensi resmi `@param`/`@returns`, sikap Laravel terhadap docblock vs type hint | [BELUM TERVERIFIKASI] |
| MADR | Daftar bagian versi terbaru | [BELUM TERVERIFIKASI] |
| Keep a Changelog | Kategori dan versi spesifikasi terbaru | [BELUM TERVERIFIKASI] |
| Gentoo, NetBSD, OpenJDK | Teks kebijakan primer (wiki Gentoo, commit guidelines NetBSD, pengumuman OpenJDK) | Sebagian [BELUM TERVERIFIKASI] |
| QEMU | Apakah patch pelonggaran Mei 2026 diterima | [BELUM TERVERIFIKASI] |
| Claude Code docs | Target CLAUDE.md di bawah 200 baris dan perilaku membaca AGENTS.md sudah dikonfirmasi di halaman memory resmi (lihat 2.2); pantau perubahan versi | [FAKTA], perlu dipantau |
| Pandangan Write the Docs tentang docs buatan AI | Talk/artikel komunitas 2024 sampai 2026 | Belum diriset |
| Studi kuantitatif README/docs buatan AI di GitHub | Belum ditemukan paper khusus README; bukti di atas berbasis docstring dan file konteks agent | Celah riset |
| Pedoman Umum Pembentukan Istilah, panduan lokalisasi Google/GovTech Indonesia | Aturan padanan istilah dan sapaan | [BELUM TERVERIFIKASI] |
| Microsoft Indonesian Style Guide | Isi aturan sapaan dan istilah (PDF tersedia, belum dibaca) | [BELUM TERVERIFIKASI] |
| cspell | Kamus Indonesia | [BELUM TERVERIFIKASI] |
| Kamus Hunspell Indonesia untuk Vale | Ketersediaan dan kualitas | [BELUM TERVERIFIKASI] |
| Rule Vale di atas | Diuji pada fixture; regex `\b` dan Unicode pada teks Indonesia | Perlu uji |
| ScrollTrigger dalam paket `gsap` | Cek ke docs GSAP sebelum dipakai sebagai contoh | [BELUM TERVERIFIKASI] |

Catatan cakupan: semua angka studi di atas berasal dari abstrak atau ringkasan paper. Gloaguen dkk. melaporkan efek yang kecil dan tidak semuanya signifikan secara statistik. Jadi kutip arah temuannya ("umumnya tidak menaikkan keberhasilan tugas", "biaya lebih dari 20%"), bukan sebagai bukti bahwa semua AGENTS.md merugikan. Kebijakan proyek open source juga berubah cepat (QEMU, curl). Setiap kutipan kebijakan di SKILL.md sebaiknya diberi tanggal akses, sesuai C-5.
