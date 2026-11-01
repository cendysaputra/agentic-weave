# Saran pemisahan agentic-weave dan deflow

Dicek di `main` agentic-weave commit `bff6a54`, 1 November 2026.

Tujuannya: agentic-weave cuma berisi skill anti-AI slop untuk tulisan dan tampilan. Semua yang berupa alur kerja proyek web dipindah ke repo baru `deflow`.

## Tetap di agentic-weave

| Skill | Kata di SKILL.md | Catatan |
|---|---|---|
| `weave-core` | 1.729 | Aturan R-XX dan C-X yang dipakai semua skill, plus Delivery Gate |
| `weave-commit` | 554 | Juga dipakai `bin/agentic-weave.mjs` baris 458 dan 538 untuk `check` dan hook |
| `weave-pr` | 672 | |
| `weave-changelog` | 400 | |
| `weave-chat` | 679 | |
| `weave-email` | 522 | |
| `weave-error` | 500 | |
| `weave-docs` | 1.749 | `lint-core.mjs` dipakai `bin/agentic-weave.mjs` baris 457 |
| `weave-copywriting-id` | 1.095 | |
| `weave-slides` | 1.242 | Baris 49 dan 98 merujuk ke `weave-ui`, jadi `weave-ui` versi ramping harus tetap ada |
| `weave-ui` (ramping) | sekitar 2.100 | Lihat bagian berikutnya |
| `weave-ui-id` | 841 | Udah fokus, biarkan |

## `weave-ui` dibelah

Yang tetap di `weave-ui`, karena ini katalog anti-slop:

- Bagian SKILL.md: Concept, Typography, Color, Layout, Components, Motion, UI Skill Checklist (baris 28 sampai akhir).
- Tambahan di UI Skill Checklist: aturan minimum aksesibilitas yang sekarang ada di `references/design-tokens.md`, yaitu kontras teks minimal 4,5:1, focus yang kelihatan, dan state yang gak cuma ngandelin warna. Disalin, bukan dirujuk, karena agent yang pakai `weave-ui` belum tentu buka deflow atau dicen-system.

Yang pindah ke deflow, karena ini toolkit proyek:

- Bagian SKILL.md "Reference Sites and ATM" (baris 20 sampai 27).
- `references/atm.md` (773), `references/reference-sites.md` (568, termasuk 6 galeri Jepang), `references/libraries.md` (1.559), `references/build-quality.md` (433).
- `references/design-tokens.md` (638) ikut pindah, jangan dihapus, karena `weave-flow` baris 81 dan `build-tokens.mjs` masih memakainya di tahap G2.
- `references/awwwards-rubric.md` (282) dan bagian "The Bar and How It Is Scored" (baris 16 sampai 19). Rubrik ini cocoknya buat landing dan portfolio, jadi masuk ke tahap QA di deflow.
- Semua script: `crawl-reference.mjs`, `snapshot-site.mjs`, `compare-build.mjs`, `build-tokens.mjs`, `lib.mjs`. Dengan begitu agentic-weave gak butuh Playwright lagi.
- Hapus "app UI" dari description kalau rubrik Awwwards masih disebut.

## Pindah ke deflow

| Isi | Dari | Catatan |
|---|---|---|
| `weave-flow` | `skills/weave-flow/` (12 file, termasuk `scripts/flow.mjs` dan template `.weave/`) | Jadi skill utama deflow |
| `weave-convert` | `skills/weave-convert/` (8 file, termasuk `validate-elementor.mjs`) | WordPress, Elementor, WooCommerce, Statamic, Laravel, Astro, React |
| Toolkit UI | Daftar di bagian `weave-ui` di atas | Bisa jadi satu skill sendiri, misalnya `deflow-ref` |

Nama skill di deflow sebaiknya gak pakai awalan `weave-` lagi biar gak ketuker, misalnya `deflow`, `deflow-convert`, `deflow-ref`.

## Yang harus diubah biar gak rusak

1. **Rujukan aturan.** `weave-flow` dan `weave-convert` merujuk ke aturan `weave-core` (R-XX dan C-X) sebanyak 32 kali. Saranku, deflow menyuruh agent install agentic-weave dan load `weave-core`, jangan salin aturannya, supaya aturannya gak bercabang dua.
2. **Rujukan antar-skill.** `weave-flow` baris 38, 42, 81, 83 merujuk ke crawler `weave-ui` dan ke `weave-convert`. Ganti ke nama skill baru di deflow.
3. **Installer** `bin/agentic-weave.mjs`:
   - Baris 93 dan 94 (teks instruksi untuk agent) masih menyebut `weave-flow`. Hapus baris 94.
   - Baris 400 sampai 401 menampilkan pesan Playwright untuk script `weave-ui`. Hapus kalau script-nya udah pindah.
   - Daftar skill dibaca otomatis dari folder `skills/` (baris 197), jadi gak perlu diubah.
4. **Test** `scripts/test-installer.mjs` baris 58 dan 61 mengecek `weave-ui`. Biarin aja selama `weave-ui` ramping masih ada.
5. **Dokumen:**
   - `README.md` baris 38, 39, 43 (keterangan Playwright), 171 (`.weave/`).
   - `AGENTS.md` baris 10, 42, 43, 44.
   - Description di `package.json` dan di `.claude-plugin/plugin.json` dan `marketplace.json` masih menyebut "gated web project flow" dan "award-grade UI".
6. **Versi.** Ini menghapus skill dari paket npm, jadi rilisnya 2.0.0. Tulis di CHANGELOG bahwa `weave-flow` dan `weave-convert` sekarang ada di deflow.

## Opsional

- Gabung `weave-commit`, `weave-pr`, `weave-changelog` jadi `weave-git` (total 1.626 kata). Kalau dilakukan, path di `bin/agentic-weave.mjs` baris 458 dan 538 ikut diganti. Sebaiknya dikerjakan di PR terpisah setelah pemisahan beres.

## Urutan kerja

1. Cendy bikin repo `deflow`, kosong aja.
2. Salin `weave-flow`, `weave-convert`, dan toolkit UI ke deflow, satu commit per skill.
3. Di agentic-weave, hapus yang udah pindah dan rapikan rujukannya, satu commit per langkah di atas, lewat satu PR.
4. `npm test` harus lulus sebelum merge, terus rilis 2.0.0.
