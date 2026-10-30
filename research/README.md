# Riset agentic-weave

Folder ini menyimpan riset yang menjadi dasar pengembangan skill agentic-weave. Isinya bukan bagian dari skill yang dipasang (installer hanya menyalin `skills/`), jadi aman untuk tumbuh panjang.

> Catatan nama: repo ini dulu bernama `anti-ai`. Per 30 Oktober 2026 repo berganti nama menjadi `agentic-weave`, tapi nama folder skill (`antiai-*`), package npm (`anti-ai-skills`), dan installer (`bin/anti-ai.mjs`) belum diubah. File riset menyebut nama-nama itu apa adanya karena memang begitu kondisi repo saat riset ditulis.

## Cara membaca

Baca dari yang terbaru. File lama tetap disimpan sebagai jejak keputusan, dan setiap file yang sudah digantikan diberi catatan di bagian atasnya.

| File | Isi | Status |
|---|---|---|
| [`2026-10-30-01-dokumentasi-anti-slop.md`](2026-10-30-01-dokumentasi-anti-slop.md) | Dokumentasi anti-slop: bukti (paket halusinasi, evaluasi AGENTS.md), Diátaxis, docstring, ADR, runbook, handoff klien, llms.txt, EYD V, Vale/markdownlint | Acuan untuk `antiai-docs` |
| [`2026-10-29-04-tahap-1-deep.md`](2026-10-29-04-tahap-1-deep.md) | Tahap 1 mode Research: matriks 14 agent, AGENTS.md, plugin marketplace, riset skill smell, flow `.antiai/`, konversi WordPress/Elementor V4/Woo/Statamic, DTCG 2025.10, Tailwind v4, Playwright | **Acuan utama** |
| [`2026-10-29-03-tahap-1-websearch.md`](2026-10-29-03-tahap-1-websearch.md) | Tahap 1 versi web search | Digantikan sebagian oleh 04 |
| [`2026-10-29-02-gap-analysis.md`](2026-10-29-02-gap-analysis.md) | Review isi repo commit `ebe7cfe` dan daftar gap | Ada koreksi soal Cursor |
| [`2026-10-29-01-riset-awal.md`](2026-10-29-01-riset-awal.md) | Riset awal anti-slop: UI, copy EN/ID, kode, commit, pesan, crawl, library, format skill | Latar belakang |
| [`BACKLOG.md`](BACKLOG.md) | Antrean topik riset berikutnya | Diperbarui tiap sesi |

## Konvensi

- **Nama file:** `YYYY-MM-DD-NN-<slug>.md`. NN adalah nomor urut di hari yang sama.
- **Label klaim:** FAKTA (dengan sumber primer), REKOMENDASI (desain usulan), BELUM TERVERIFIKASI (jangan masuk skill sebelum dicek).
- **Sumber:** setiap bagian mencantumkan URL. Utamakan dokumentasi resmi, paper, dan repo sumber.
- **Tanggal verifikasi:** fakta soal tool dan agent cepat berubah, jadi tanggal di nama file adalah tanggal verifikasinya.
- **Gaya:** Bahasa Indonesia, tanpa em dash (R-02), tanpa emoji dekoratif (R-04).

## Alur kerja riset

Riset dikerjakan Claude (manual atau lewat sesi terjadwal harian sekitar 30 menit), lalu dikirim sebagai file Markdown. Cendi yang memasukkan file ke repo dan melakukan push sendiri. Sesi riset tidak pernah mengubah `skills/`, `bin/`, atau file lain di luar `research/`.

## Alur dari riset ke skill

1. Topik dipilih dari `BACKLOG.md`.
2. Hasil riset ditulis ke file baru di folder ini.
3. Fakta yang sudah terverifikasi dipindah ke `skills/<nama>/references/` dengan tanggal verifikasi.
4. Item backlog ditandai selesai dan menunjuk ke file hasilnya.
