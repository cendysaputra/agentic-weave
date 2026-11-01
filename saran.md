Pemisahan ke deflow (saran 1 November 2026) sudah dikerjakan. Yang masih menunggu Cendy:

- Tag rilis: setelah PR 2.0.0 di-merge, pasang `v2.0.0` dan `v2` di commit itu di `main`, lalu `git push origin v2.0.0 v2`. Sampai tag `v2` ada, contoh Action `@v2` di README belum bisa dipakai.
- `npm publish` versi 2.0.0 dari akun Cendy.
- Demo online: pilih GitHub Pages atau subdomain ruangartefak.com (perlu DNS). Belum ada perubahan di repo.
- Opsional, PR terpisah: gabung `weave-commit`, `weave-pr`, dan `weave-changelog` jadi `weave-git`. Path di `bin/agentic-weave.mjs` untuk `check` dan `hook` ikut diganti.
