Review 30 Oktober 2026 sudah dikerjakan; item yang selesai dihapus dari file ini. Yang tersisa:

## Tidak perlu diubah

- Item 3, pesan merge dan revert: dicek ulang dengan `lintCommit`. `Merge branch 'main'`, `Merge pull request #12 from ...`, dan `Revert "Update code"` kembali tanpa temuan karena keluar lebih awal lewat `SKIP`. Hook juga menerima keduanya (ada tesnya di `scripts/test-installer.mjs`).
- Item 7, sapaan di README: peringatan `sapaan` datang dari kutipan contoh Indonesia dan teks `mixed *kamu* and *Anda*`, bukan dari kode. Hanya peringatan, skor 97, dan Action repo ini gagal hanya pada error.

## Menunggu Cendy

- Tag rilis: setelah PR rilis 1.1.0 di-merge, tag `v1.1.0` dan `v1` dipasang di commit itu di `main`, lalu `git push origin v1.1.0 v1`. Sampai tag `v1` ada, contoh `@v1` di README belum bisa dipakai.
- `npm publish` versi 1.1.0 dari akun Cendy.
- Item 12, demo online: pilih GitHub Pages atau subdomain ruangartefak.com (perlu DNS). Belum ada perubahan di repo.
