Sumbernya review Claudy, Gluu, Cloud, dan Artify tanggal 30 Oktober 2026. Kerjakan satu commit kecil per item, conventional commit (`fix:`, `feat:`, `docs:`, `chore:`). Item "Tidak perlu" sudah dicek di kode; jangan buat commit untuk item itu.

Nomor baris dari `main` pada 30 Oktober 2026. Cocokkan lagi sebelum mengedit. `npm test` harus lolos setelah tiap item. Jangan `npm publish` (Cendy yang menerbitkan dari akunnya). Item 11 dikerjakan sebelum item 9, karena keduanya mengubah `CHANGELOG.md`. Item 10 setelah item 9.

## Perbaikan `check`, `hook`, dan Action

### 1. Skor rata-rata per file

File: `bin/agentic-weave.mjs` (baris 472-475), `action/run.mjs` (baris 75-78), `README.md` (baris 132), `scripts/test-action.mjs` (baris 67), `scripts/test-installer.mjs` (tes `check` sekitar baris 128).

Masalah: skor `Math.max(0, 100 - errors * 10 - warnings * 3)` menjumlahkan temuan semua item. Satu error di banyak file (atau banyak peringatan) menjatuhkan skor ke 0.

Perubahan: skor tiap item (satu file Markdown, satu pesan commit, atau judul PR) tetap `Math.max(0, 100 - error * 10 - warning * 3)`. Skor yang dicetak, yang masuk `GITHUB_OUTPUT`, dan yang masuk ringkasan job adalah rata-ratanya, dibulatkan dengan `Math.round`. Nol item tetap 100. Jumlah error dan peringatan tetap dijumlahkan. Kode keluar tidak berubah: satu error tetap gagal bila `fail-on` adalah `error`, meski rata-rata masih tinggi. `demo/index.html` baris 134 menilai satu teks, rumusnya tetap, jangan diubah. Perbarui kalimat di `README.md` baris 132 supaya skor disebut rata-rata per item, bukan potongan tunggal untuk seluruh repo.

Cek selesai: di `scripts/test-action.mjs`, tes yang sekarang mengunci `score=90` punya empat item (judul PR bersih 100, commit `Update code` 90, commit spesifik 100, `docs/guide.md` bersih 100). Rata-rata 390/4 = 97,5, dibulatkan 98, dan status tetap 1. Tambah tes dua file Markdown lewat `paths`: satu em dash (90) dan satu bersih (100), skor 95. Tambah tes satu file dengan 11 error (skor item 0) plus satu file bersih: skor tercetak 50, bukan 0, status tetap 1. Tes setara di `scripts/test-installer.mjs` untuk CLI.

### 2. Samakan ekstensi `check` dan Action

File: `bin/agentic-weave.mjs` baris 466, `action/run.mjs` baris 45, `skills/weave-docs/scripts/lint-docs.mjs` baris 34.

Masalah: `collect` di CLI memakai `\.(md|markdown|mdx|txt)`. Action dan `lint-docs.mjs` memakai `\.(md|markdown|mdx)`. Bantuan CLI (baris 256) dan deskripsi Action sama-sama menyebut Markdown.

Perubahan: hapus `.txt` dari CLI supaya ketiganya sama: `.md`, `.markdown`, `.mdx`. Jangan menambah `.txt` ke Action. Pesan commit tetap lewat `--commit` dan `--commit-file`. File `examples/commit/*.txt` adalah pesan commit, bukan Markdown.

Cek selesai: di `scripts/test-installer.mjs`, folder berisi `notes.txt` (ada em dash) dan `page.mdx` (ada em dash). `check` pada folder itu hanya melaporkan `page.mdx`. Di `scripts/test-action.mjs`, `paths` ke folder yang sama: `.txt` tidak masuk, `.mdx` masuk.

### 3. Pesan merge dan revert git (tidak perlu)

File: `skills/weave-commit/scripts/lint-commit-core.mjs` baris 16 dan 29, `skills/weave-commit/scripts/lint-commit.mjs` baris 19-21.

Sudah dicek 30 Oktober 2026 dengan `lintCommit`. `Merge branch 'main'`, `Merge branch 'main' into feature`, `Merge pull request #12 from ...`, `Merge remote-tracking branch 'origin/main'`, `Revert "Fix bug"`, `Revert "Update code"`, dan `Revert "fix: ..."` plus badan `This reverts commit ...` kembali tanpa temuan. Subjek yang diawali `Merge ` atau `Revert "` keluar lebih awal lewat `SKIP`, jadi tidak sampai ke `generic-subject`. Hook hanya menolak error. Jangan diubah.

### 4. Hook ikut versi paket, dengan cadangan offline

File: `bin/agentic-weave.mjs` baris 495-531, `README.md` baris 140, `scripts/test-installer.mjs` tes hook sekitar baris 138.

Masalah: `hook` menyalin `lint-commit.mjs` dan `lint-commit-core.mjs` ke `.git/hooks/agentic-weave/`. Versi hanya tertulis di komentar `commit-msg` (baris 531) dan tidak pernah dibandingkan. Upgrade paket tidak menyalin ulang. Menjalankan `npx agentic-weave hook` lagi memang menimpa salinan, tetapi tidak ada yang memberi tahu bahwa salinan itu basi.

Perubahan: `commit-msg` mencoba dulu paket yang terpasang, tanpa jaringan: `npx --offline --no-install agentic-weave check --commit-file "$1"`. Kalau itu berhasil dijalankan, teruskan kode keluarnya (1 tetap menolak commit). Kalau paket tidak ada, atau `npx` tidak ada, jalankan salinan di `.git/hooks/agentic-weave/` seperti sekarang, dan tulis satu baris ke stderr bahwa salinan itu yang dipakai dan `npx agentic-weave hook` memperbaruinya. Kegagalan "paket tidak ada" tidak boleh menolak commit. Commit offline tetap jalan. Jangan sampai hook menunggu registry: `npm test` tidak punya jaringan.

Cek selesai: perluas tes hook di `scripts/test-installer.mjs`. (1) Tanpa paket, commit `Update code` tetap ditolak dan commit `feat: add the first sample file` tetap lolos. (2) Letakkan `npx` palsu di depan `PATH` yang selalu keluar 0 untuk `check`. Rusak salinan `lint-commit.mjs` supaya selalu `process.exit(1)`. Commit spesifik tetap lolos: yang jalan adalah paket, bukan salinan. (3) `npx` palsu gagal. Salinan yang menolak subjek generik tetap menolak, stderr memuat kalimat peringatan, commit spesifik tetap lolos. Pesan `Merge branch 'main'` dan `Revert "Update code"` tetap diterima (item 3).

### 5. Push tanpa `paths` ikut memeriksa Markdown

File: `action/run.mjs` baris 52-64, `action.yml` baris 9-16, `.github/workflows/weave-check.yml` baris 6, `scripts/test-action.mjs`.

Masalah: klaim "maksimum 20 commit" tidak berlaku di sini. `github.event` pada Actions adalah payload webhook. Dokumen GitHub [Webhook events and payloads](https://docs.github.com/en/webhooks/webhook-events-and-payloads), dibaca 30 Oktober 2026, menulis maksimum 2048 commit pada `push.commits`. Angka 20 adalah batas Events API, bukan webhook. Jangan menulis kode untuk batas 20.

Yang benar: baris 59-62 hanya mengisi `paths` dari API pull request. Di luar PR, `paths` kosong berarti tidak ada Markdown yang dibaca (baris 63-64). Workflow repo ini hanya `pull_request`, jadi CI repo ini tidak kena, tetapi `action.yml` baris 16 menawarkan pemeriksaan pada push.

Perubahan: bila bukan PR, `paths` kosong, dan push tidak menghapus ref (`deleted` bukan true), kumpulkan file Markdown yang berubah. Cek dulu contoh payload push di dokumen webhook: kalau tiap commit memuat `added`, `modified`, dan `removed`, pakai itu dan lewati `removed`. Kalau field itu tidak ada, panggil Compare API `GET /repos/{owner}/{repo}/compare/{before}...{after}`, pakai `files`, lewati yang statusnya `removed`, filter ekstensi sama dengan `collect` (baris 45). Kalau `event.commits.length === 2048`, atau respons Compare terpotong, tulis di ringkasan job bahwa daftar tidak lengkap. Jangan diam. Perbarui deskripsi input `paths` di `action.yml` baris 10-11: kosong pada PR memeriksa file yang berubah, kosong pada push memeriksa file di push itu. Token yang sudah ada (`github-token`) dipakai untuk API. Tes tetap lewat server HTTP lokal di `scripts/test-action.mjs`, bukan ke api.github.com.

Cek selesai: tambah tes event push tanpa `pull_request` dan tanpa `paths`. Ada commit generik, file `.md` berubah yang berisi em dash, file `.txt`, dan file `.md` yang dihapus. Action menandai subjek generik dan em dash di `.md`, tidak membaca `.txt`, tidak membaca file yang dihapus, dan gagal karena error. Push `deleted: true` tidak memeriksa file.

### 6. Path yang tidak ada

File: `bin/agentic-weave.mjs` baris 458 (`--commit-file`), baris 463 (`stat` di `collect`), baris 553-556 (`main().catch`).

Masalah: `node bin/agentic-weave.mjs check does-not-exist.md` keluar 1 dengan `Error: ENOENT: no such file or directory, stat 'does-not-exist.md'`. `--commit-file` ke path yang tidak ada sama: `readFile` melempar ENOENT mentah.

Perubahan: tangkap `error.code === 'ENOENT'` di kedua jalur dan lempar pesan tanpa kode `ENOENT` dan tanpa nama syscall. Sertakan path-nya, dalam bahasa Inggris seperti pesan CLI yang lain, misalnya `No such file or directory: does-not-exist.md`.

Cek selesai: di `scripts/test-installer.mjs`, `check` ke path yang tidak ada keluar 1, stderr memuat path itu, dan tidak memuat `ENOENT`. Sama untuk `--commit-file` ke path yang tidak ada. `check` ke file yang ada tidak berubah.

### 7. Sapaan di README (tidak perlu)

File: `skills/weave-docs/scripts/lint-core.mjs` baris 20-52, `skills/weave-docs/scripts/lint-docs.mjs` baris 3, `skills/weave-docs/references/tooling.md` baris 14, `README.md` baris 9, 11, dan 124.

Sudah dicek 30 Oktober 2026: `node bin/agentic-weave.mjs check README.md` memberi satu peringatan `sapaan`, `Anda` (3) dan `kamu` (1), skor 97. Blok kode dan inline code sudah dibuang di `proseLines` (pagar di baris 29-40, backtick di baris 52). Yang terhitung bukan kode: kutipan di baris 9 dan 11, serta huruf miring di baris 124 (`mixed *kamu* and *Anda*`). Melewati backtick dan blok kode tidak menghapus peringatan ini. Jangan diubah.

### 8. Contoh `weave-slides` yang ikut dites

File: `skills/weave-slides/SKILL.md` baris 36-47, `skills/weave-docs/scripts/lint-core.mjs`, `examples/cases.json`, `examples/README.md` baris 6-7, `scripts/test-examples.mjs` baris 18.

Masalah: `cases.json` berisi 15 pasangan, semuanya `docs` atau `commit`. Tidak ada `weave-slides`. `test-examples.mjs` hanya memanggil `lintCommit` atau `lintMarkdown`. Tanpa rule baru, file contoh slide tidak akan gagalkan `npm test`.

Perubahan: tambah peringatan `label-title` di `lintMarkdown`, pada baris prosa (pagar dan inline code sudah terlewati). Kena bila satu heading isinya persis, tanpa membedakan huruf besar, salah satu label di skill: `Introduction`, `Overview`, `Key Benefits`, `Our Solution`, `Conclusion`, `Q&A`, `Thank you`, `Any questions`. Tanda baca di ujung (`.` `!` `?`) diabaikan. `Overview of the API` tidak kena. Tambah `examples/slides/slides-label-title.before.md` dan `.after.md`, plus entri `cases.json` dengan `expect: ["label-title"]`. File after tidak boleh memicu rule apa pun (jangan ada em dash, frasa stok, atau heading label). Sebut folder `slides/` di `examples/README.md`.

Cek selesai: `node scripts/test-examples.mjs` mencetak `ok` untuk id baru, dan `npm test` lolos. `node bin/agentic-weave.mjs check README.md` tidak menambah temuan `label-title` (heading repo ini tidak persis label itu).

## Rilis

### 9. Versi 1.1.0

File: `package.json` baris 3 (sekarang `1.0.1`), `.claude-plugin/plugin.json` baris 11, `scripts/sync-version.mjs`, `CHANGELOG.md` baris 5-14, `package.json` skrip `version`.

Masalah: paket npm `agentic-weave` yang terbit adalah `1.0.1` (`npm view agentic-weave version`, 30 Oktober 2026). `gitHead` terbitan itu `90a0778`, yaitu merge rename, belum memuat `check`, hook, Action, `examples/`, `weave-slides`, dan demo. Butir-butir itu masih di bagian `Unreleased`. Tidak ada heading `1.1.0`.

Perubahan: kerjakan item 11 lebih dulu. Pindahkan isi `Unreleased` ke `## 1.1.0 (YYYY-MM-DD)` dengan tanggal commit rilis, format sama seperti `## 1.0.0 (2026-10-29)`. Tambahkan butir untuk perbaikan item 1, 2, 4, 5, 6, dan 8 yang sudah masuk. Hanya kategori yang ada isinya. Jangan tulis seolah `npm publish` sudah terjadi. Stage `CHANGELOG.md`, lalu dari pohon kerja yang bersih selain file itu:

```bash
npm version 1.1.0 -m "chore: release 1.1.0"
```

Hook `version` menjalankan `scripts/sync-version.mjs` dan men-stage `.claude-plugin/plugin.json`. Jangan sunting versi plugin dengan tangan. Jangan `npm publish`. Tag git `v1.0.1` menunjuk `6178ce7` (saat itu nama paket masih `anti-ai-skills`), bukan `agentic-weave@1.0.1`. Jangan pindahkan tag itu.

Cek selesai: `package.json` dan `plugin.json` sama-sama `1.1.0`. `npm test` lolos. `git tag -l` memuat `v1.1.0` pada commit rilis ini. Tidak ada versi baru di registry (`npm view agentic-weave version` masih `1.0.1` sampai Cendy menerbitkan).

### 10. Tag Action `v1` dan README

File: `README.md` baris 155 dan 161. Tag git `v1.1.0` (dari item 9) dan `v1` (belum ada; `git tag -l` pada 30 Oktober 2026 hanya `v1.0.1`).

Masalah: contoh Action memakai `cendysaputra/agentic-weave@main`. Baris 161 menyuruh menyematkan `@main` ke SHA.

Perubahan: di README, ganti `cendysaputra/agentic-weave@main` menjadi `cendysaputra/agentic-weave@v1`. Ganti kalimat baris 161: tag `v1` ikut rilis 1.x, dan SHA tetap cara menyematkan satu commit. Workflow `.github/workflows/weave-check.yml` memakai `uses: ./`, jangan diubah.

Tag: `v1` dan `v1.1.0` menunjuk commit rilis yang sudah ada di `main`. Repo ini mengizinkan merge commit, rebase, dan squash. Squash mengganti SHA, jadi jangan push tag dari branch PR. Kalau `npm version` sudah membuat `v1.1.0` di branch dan PR di-squash, buang tag lokal itu dan buat ulang pada SHA di `main`. `v1` baru, bukan pemindahan `v1.0.1`. Push: `git push origin v1.1.0 v1`. Jangan `npm publish`.

Cek selesai: `git ls-remote --tags origin` memuat `v1.1.0` dan `v1` pada SHA yang sama, dan SHA itu ada di `main`. README tidak lagi menyebut `@main` untuk Action ini. `npm view agentic-weave version` masih `1.0.1`.

### 11. Kalimat versi di CHANGELOG

File: `CHANGELOG.md` baris 3.

Masalah: kalimatnya `Versions match the anti-ai-skills package on npm.` Paket itu sudah tidak ada. `npm view anti-ai-skills` pada 30 Oktober 2026 keluar 404, `Unpublished on 2026-10-30T03:36:05.133Z`.

Perubahan: ganti kalimat kedua itu. Fakta yang dicek: nomor versi di file ini adalah versi paket `agentic-weave`, dan `anti-ai-skills` di-unpublish pada 2026-10-30. Jangan mengembalikan nama paket lama sebagai acuan versi. Kerjakan sebelum item 9.

Cek selesai: `CHANGELOG.md` tidak lagi mengatakan versi mengikuti `anti-ai-skills`. `npm test` lolos.

## Opsional

### 12. Demo online (menunggu Cendy)

File: `demo/index.html`. Tidak ada `vercel.json`, `netlify.toml`, atau `render.yaml`. `README.md` baris 163 menyuruh menyajikan repo secara lokal.

Jangan deploy, jangan menambah konfigurasi hosting, dan jangan membuat commit, sampai Cendy setuju (subdomain ruangartefak.com butuh DNS yang hanya dia yang punya). Selesai untuk sekarang berarti repo tidak berubah karena item ini.
