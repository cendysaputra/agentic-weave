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
