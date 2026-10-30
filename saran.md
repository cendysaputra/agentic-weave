# Saran & Masukan

Kumpulan saran dari review repo [agentic-weave](https://github.com/cendysaputra/agentic-weave).

## Dari Cloud

- `weave-ui/SKILL.md` terlalu panjang (sekitar 6.800 token, sedangkan batas yang disarankan 5.000 token). Pindahkan detailnya ke folder `references/`.
- Belum ada contoh before/after. Tambahkan satu contoh teks "slop" vs hasil perbaikannya di README supaya nilai tool-nya langsung terasa.
- Nama marketplace masih `imajiner-agentic-weave`. Samakan menjadi `agentic-weave` agar tidak membingungkan saat install.

## Dari Artify

- Penggantian nama dari `anti-ai-skills` ke `agentic-weave` (skill `antiai-*` jadi `weave-*`, folder `.antiai/` jadi `.weave/`) adalah perubahan yang merusak setup lama (breaking change), tetapi versi hanya naik ke 1.0.1. Sebaiknya dirilis sebagai **2.0.0**.
- Paket lama `anti-ai-skills` sebaiknya ditandai deprecated di npm:
  ```bash
  npm deprecate anti-ai-skills "Pindah ke agentic-weave"
  ```
- Nama marketplace plugin Claude Code tidak konsisten: perintah pertama memakai `cendysaputra/agentic-weave`, sedangkan cara untuk versi lama memakai `agentic-weave@imajiner-agentic-weave`. Periksa `.claude-plugin` untuk memastikan mana yang benar.
- Typo kecil di bagian Install: "After a global install (...) Update with" seharusnya huruf kecil, menjadi "update with".

## Ide fitur

- **Perintah `npx agentic-weave check <file>`.** Menandai baris yang kena aturan R-XX, memberi skor singkat dan tiga saran perbaikan. Cara tercepat untuk mencoba tanpa memasang skill ke agent.
- **GitHub Action.** Mengecek judul PR, pesan commit, dan file Markdown memakai aturan `weave-commit`, `weave-pr`, dan `lint-docs.mjs`.
- **Hook pesan commit.** Misalnya `npx agentic-weave hook` (atau lewat `husky`) yang memasang pengecekan `weave-commit` sebelum commit tersimpan.
- **Folder `examples/` sebagai bahan tes.** Pasangan teks "sebelum" dan "sesudah" per skill dan per aturan R-XX, sebaiknya termasuk contoh slop asli dari komunitas. `npm test` mengecek apakah `check` menangkap semuanya dan tidak salah tandai.
- **Template issue "Laporkan tanda slop baru"** supaya orang lain bisa menyumbang contoh.
- **Skill `weave-slides`** untuk deck presentasi: teks kepanjangan, label tidak perlu, foto gepeng atau gelap, layout kaku seperti template.
- **Bahasa Indonesia sebagai pembeda.** Tonjolkan `weave-copywriting-id` dan `weave-ui-id` di bagian atas README, dengan satu contoh copy slop berbahasa Indonesia beserta perbaikannya.
- **Halaman demo** di subdomain ruangartefak.com: tempel teks, langsung terlihat before/after-nya.

## Temuan celah

Hasil bongkar `bin/agentic-weave.mjs` dan CI.

- **Install menimpa skill tanpa backup (prioritas utama).** Folder skill dengan nama sama dihapus dengan `rm` (`recursive`, `force`) lalu disalin ulang. Kalau pengguna sudah mengedit skill-nya, editannya hilang tanpa peringatan. Saran: bandingkan isinya dulu; kalau beda, tanya atau buat backup `.bak`.
- **Folder lama `antiai-*` ikut dihapus otomatis.** Masuk akal untuk migrasi, tapi kustomisasi bisa hilang. Minta konfirmasi dulu, kecuali pakai `-y`.
- **`remove` tanpa konfirmasi dan menyasar semua target.** Tanpa nama skill dan tanpa `-t`, semua skill di semua folder agent global ikut terhapus. Saran: minta konfirmasi atau flag `--yes`, dan catat target yang pernah di-install di file manifest kecil supaya `remove` hanya menyasar itu.
- **Blok AGENTS.md bisa dobel.** Kalau penanda `agentic-weave:end` hilang tapi penanda start masih ada, installer menambah blok kedua, dan `remove` tidak membersihkan blok yang rusak. Saran: kalau hanya satu penanda yang ketemu, berhenti dan beri tahu pengguna.
- **Installer belum punya tes.** `npm test` baru memeriksa isi skill, padahal installer yang menghapus folder di home pengguna adalah bagian paling berisiko.
- **Izin token CI.** `.github/workflows/lint-skills.yml` belum memakai `permissions: contents: read`, jadi token-nya masih memakai izin default.

## Status tindak lanjut (30 Oktober 2026)

| Saran | Status |
| --- | --- |
| `weave-ui/SKILL.md` terlalu panjang | Selesai. Rubrik juri, self-score, tell kualitas build dan konten, serta Library Soup dipindah ke `references/`. Linter tidak lagi memberi peringatan |
| Contoh before/after di README | Selesai. Contoh copy Indonesia, pesan commit, dan output asli `lint-docs.mjs` |
| Nama marketplace `imajiner-agentic-weave` | Selesai. Sekarang `agentic-weave`, install lama jadi `agentic-weave@agentic-weave` |
| Rilis sebagai 2.0.0 | Tidak dipakai. `agentic-weave` 1.0.1 adalah rilis pertama dengan nama baru, jadi di package ini belum ada yang rusak. Perubahan berikutnya cukup minor (1.1.0) |
| `npm deprecate anti-ai-skills` | Tidak bisa lagi. Package itu sudah di-unpublish pada 30 Oktober 2026, jadi tidak ada yang perlu ditandai |
| Marketplace tidak konsisten | Sebenarnya keduanya benar (yang pertama alamat repo, yang kedua `plugin@nama-marketplace`). Setelah rename, README menjelaskan bedanya |
| Typo "Update with" | Selesai. Ternyata kalimat terpotong sisa rename, bukan typo; kalimatnya ditulis ulang |
| Install menimpa skill tanpa backup | Selesai. Hash tiap skill dicatat di `~/.agentic-weave/installed.json`; skill yang diedit di-backup ke `~/.agentic-weave/backups/` (atau dipertahankan bila pengguna menolak) |
| Folder lama `antiai-*` dihapus otomatis | Selesai. Dipindah ke backups, dengan konfirmasi kecuali `-y` |
| `remove` tanpa konfirmasi, menyasar semua target | Selesai. Wajib konfirmasi atau `-y`, hanya menyasar folder yang tercatat di manifest, skill yang diedit masuk backups |
| Blok AGENTS.md bisa dobel | Selesai. Kalau hanya satu penanda yang ketemu, installer berhenti dan memberi tahu |
| Installer belum punya tes | Selesai. `scripts/test-installer.mjs`, 8 kasus, jalan di `npm test` dan CI |
| Izin token CI | Selesai. `permissions: contents: read` |
| Template issue "Laporkan tanda slop baru" | Selesai. `.github/ISSUE_TEMPLATE/tanda-slop-baru.yml` |
| Bahasa Indonesia sebagai pembeda | Selesai sebagian: contoh dan paragraf di bagian before/after README |
| `check`, GitHub Action, hook commit, `examples/`, `weave-slides`, halaman demo | Belum. Fitur baru yang butuh desain sendiri; masuk antrean |
