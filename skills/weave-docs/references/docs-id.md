<!-- Detail for the weave-docs skill: documentation in Bahasa Indonesia. Sources: EYD Edisi V (Badan Bahasa, 2022), Mozilla Indonesian localization style guide (research 2026-10-30). -->

# Documentation in Bahasa Indonesia

## References

- **EYD Edisi V** has been the spelling standard since 16 August 2022 (decree 0424/I/BS.00.01/2022). It replaces PUEBI (2015); online at ejaan.kemdikbud.go.id. Guides that still cite PUEBI are out of date.
- **Mozilla's Indonesian style guide** uses "Anda", avoids slang, and checks terms against KBBI daring and established glossaries ("Create" becomes "Buat", not "Ciptakan").

## Kamu or Anda

Pick one per document and state it in the project's docs: "kamu" suits developer-to-developer docs, "Anda" suits formal clients and institutions. Mixing both in one document, or putting "Anda" in every sentence like machine translation, is the tell.

## Patterns

| Pattern | Before | After |
| --- | --- | --- |
| "Silakan" on every step | Silakan klik tombol Simpan. | Klik **Simpan**. |
| Bureaucratic passive | Pengaturan dapat dilakukan melalui menu Settings. | Buka **Settings** untuk mengatur... |
| Word-for-word translation | Ini akan memungkinkan Anda untuk... | Dengan ini kamu bisa... |
| Formal filler | Adapun langkah-langkahnya adalah sebagai berikut: | Langkah: |
| Inconsistent terms | "unggah" in one step, "upload" in the next | Pick one; record it in the glossary |
| Self-translated UI labels | Klik Terbitkan (the dashboard says Publish) | Klik **Publish** |

## Terms

1. UI labels exactly as on screen.
2. Common terms in their established Indonesian form: unduh, unggah, tautan, pengaturan, kata sandi. Check KBBI daring before adding one to the glossary.
3. Developer terms without an established equivalent stay in English and are italicized as foreign words per EYD: *hook*, *slug*, *repeater*, *build*, *deploy*.
4. Every decision goes in the project glossary.
