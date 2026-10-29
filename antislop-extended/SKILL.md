# antislop-extended

> Anti Slop: Rules for AI Coding Agents. Indonesian + commit hygiene extension

> Part of the antislop system. Read together with `antislop.md` (the core) and the concern skills (`antislop-ui`, `antislop-copywriting`, `antislop-code`). This skill adds what the base skills do not cover: Bahasa Indonesia copywriting tells, Indonesian UI localization, and anti-slop commit messages. It references core rules by number and never duplicates or renumbers them.

## How to use this skill

- Load together with `antislop.md` whenever the task touches Indonesian copy, Indonesian UI, or commit messages.
- Copy entries use the shape **The pattern** / **Why it reads as AI** / **Before** / **After**. UI and commit entries use **Tell** / **Why** / **Fix**. The governing core rule is cited as R-XX on each entry.
- The Delivery Gate in the core remains the gate. The "Extended Checklist" at the end supplements it.

## Bahasa Indonesia (Copywriting)

Indonesian copy carries its own set of AI tells on top of the English ones in `antislop-copywriting`. The same two rules apply: never invent facts (R-17, R-36, R-38) and do not over-sterilize (R-37). Indonesian reads about 20-30% longer than English, so wordiness is the default enemy, and AI slop makes it worse.

### Empty AI Vocabulary (Bahasa Indonesia)

- **The pattern:** abstract verbs and nouns stacked to sound impressive without saying anything: *dapat, secara, serta, yakni, berbagai, tentunya, pastinya, dengan mudah, secara otomatis, secara efektif dan efisien, dalam rangka, guna, optimal, solusi, komprehensif, revolusioner, inovatif, terdepan, unggul*.
- **Why it reads as AI:** these are the Indonesian equivalent of *unlock, elevate, seamless*. They add ceremony and length, not meaning, and they cluster in machine-written text.
- **Before:**
  > Dengan menggunakan platform kami, Anda dapat dengan mudah meningkatkan produktivitas tim secara efektif dan efisien.
- **After:**
  > Platform kami memangkas waktu rapat status tim Anda.
- **Rule:** R-16, R-36.

### Verb-Noun Inflation (Nominalisasi)

- **The pattern:** turning a plain verb into a noun phrase to sound formal: *melakukan peningkatan* for *meningkatkan*, *memberikan solusi* for *menyelesaikan*, *melakukan pengiriman* for *mengirim*, *menawarkan berbagai fitur* for *memiliki fitur*.
- **Why it reads as AI:** the extra noun adds words without adding information, the same filler pattern as the English *in order to*.
- **Before:**
  > Aplikasi ini memberikan solusi untuk membantu Anda melakukan pengelolaan keuangan dengan lebih baik.
- **After:**
  > Aplikasi ini mencatat pemasukan dan pengeluaran Anda.
- **Rule:** R-36.

### "Tak Hanya... Tetapi Juga..." (Negative Parallelism)

- **The pattern:** the paired framing *"Tak hanya X, tetapi juga Y"*, *"Tidak hanya X, melainkan Y"*, *"Bukan sekadar X, namun Y"*.
- **Why it reads as AI:** it is the Indonesian form of *"It's not just X, it's Y"*: a formula that sounds emphatic whether or not the emphasis is earned.
- **Before:**
  > Tak hanya menghemat waktu, tetapi juga biaya. Bukan sekadar alat, namun sebuah solusi menyeluruh.
- **After:**
  > Menghemat waktu dan biaya. Menyelesaikan pekerjaan dari satu tempat.
- **Rule:** R-36.

### Signposting and Announcements

- **The pattern:** *"Berikut adalah..."*, *"Mari kita bahas..."*, *"Dalam artikel ini..."*, *"Perlu diketahui bahwa..."*, *"Tanpa basa-basi..."*.
- **Why it reads as AI:** announcing what you are about to say instead of saying it is meta-commentary that slows the reader.
- **Before:**
  > Berikut adalah beberapa fitur yang perlu Anda ketahui. Mari kita bahas satu per satu.
- **After:**
  > Fitur utama mencakup pencatatan otomatis, laporan mingguan, dan tagihan berulang.
- **Rule:** R-36.

### Chatbot Closers (Bahasa Indonesia)

- **The pattern:** *"Semoga bermanfaat!"*, *"Terima kasih telah membaca!"*, *"Jika ada pertanyaan, jangan ragu untuk menghubungi kami."*, *"Sekian dan terima kasih."*.
- **Why it reads as AI:** these are conversation artifacts pasted into a deliverable, not copy.
- **Before:**
  > Itulah penjelasan mengenai fitur kami. Semoga bermanfaat! Jika ada pertanyaan, jangan ragu untuk menghubungi kami.
- **After:**
  > Fitur utama mencakup pencatatan otomatis dan laporan mingguan.
- **Rule:** R-36.

### Generic Positive Conclusion

- **The pattern:** *"Masa depan yang cerah menanti"*, *"sebuah langkah maju yang signifikan"*, *"era baru"*, *"terus berinovasi menuju keunggulan"*.
- **Why it reads as AI:** an upbeat send-off that restates nothing and promises nothing.
- **Before:**
  > Masa depan yang cerah menanti para pelanggan kami seiring kami terus berinovasi.
- **After:**
  > (Cut the sentence. End on the last concrete fact, or state real plans.)
- **Rule:** R-36.

### Rule of Three Overuse

- **The pattern:** every list forced into three: *"cepat, aman, dan andal"*, *"mudah, fleksibel, dan terjangkau"*, *"hemat waktu, hemat biaya, dan hemat tenaga"*.
- **Why it reads as AI:** real lists have the number of items the content requires; the trio is a rhythm tell.
- **Before:**
  > Aplikasi kami cepat, aman, dan andal.
- **After:**
  > Aplikasi kami memuat halaman di bawah satu detik.
- **Rule:** R-36.

### English Mixing (Code-Switching)

- **The pattern:** dropping English buzzwords into Indonesian copy where an Indonesian word exists: *"AI-powered"*, *"seamless"*, *"best-in-class"*, *"all-in-one"*, *"game-changer"*.
- **Why it reads as AI:** the English insert is usually a buzzword doing the emphasis the Indonesian sentence should do, and it marks the text as translated or generated.
- **Before:**
  > Solusi all-in-one yang seamless untuk kebutuhan bisnis Anda, powered by AI.
- **After:**
  > Satu aplikasi untuk pencatatan, tagihan, dan laporan bisnis Anda.
- **Rule:** R-16, R-36.

### Em Dashes and Punctuation

- **The pattern:** the em dash (`—`) used as an aside, and its Indonesian relatives: spaced hyphens (` - `) and trailing ellipsis (`...`) used as a lingering pause.
- **Why it reads as AI:** R-02 bans the em dash in output; the spaced hyphen and the trailing ellipsis are the same tell wearing local clothes.
- **Before:**
  > Fitur ini — yang baru saja diluncurkan — mengubah cara Anda bekerja...
- **After:**
  > Fitur ini, yang baru saja diluncurkan, mengubah cara Anda bekerja.
- **Rule:** R-02.

### What NOT to flag (Bahasa Indonesia)

- **Particle wordplay.** A native speaker may use *kok*, *sih*, *dong*, *kan*, *ya* naturally. Do not strip these; they are signs of a human voice, not slop.
- **Register mixing.** A writer switching between *Anda* (formal) and *kamu* (casual) deliberately is a human tell, not a defect.
- **Local specificity.** Real place names, prices in Rupiah, and local references are evidence of a real person; keep them.

## Localization: Indonesia (UI)

Indonesian products follow local conventions for currency, numbers, dates, and time. Generated UI that uses US or English defaults on an Indonesian product is a slop signal the same way a generic gradient is: it shows no one localized the screen for the real user. The governing rules are the same (R-31, C-2, C-4); these are the specific tells.

### Currency Formatting

- **Tell:** prices shown in `$` or `USD`, US-style `$1,500.00`, or bare numbers with no currency marker on an Indonesian product.
- **Why:** an Indonesian user reads Rupiah. A dollar sign or a missing marker is either a translation miss or a fabricated default, and it breaks trust at the exact moment the user reaches for their wallet.
- **Fix:** use `Rp` with the Indonesian thousand separator (dot) and no decimals for Rupiah: `Rp1.500.000`, not `Rp 1,500,000.00` and not `$1,500`. In code, format with `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })` so the thousands and decimals are handled correctly.
- **Rule:** R-31, C-2.

### Number and Percentage Formatting

- **Tell:** US-style `1,500,000` for thousands, `.5` for decimals, or a space before the percent sign (`50 %`).
- **Why:** Indonesian uses a dot for thousands and a comma for decimals: `1.500.000` and `0,5`. Mixing US and Indonesian conventions on one screen is the tell that no one checked.
- **Fix:** dot for thousands (`1.500.000`), comma for decimals (`0,5`), and no space before percent (`50%`). Use `Intl.NumberFormat('id-ID')` for large numbers and percentages.
- **Rule:** R-31.

### Date and Time Formatting

- **Tell:** `MM/DD/YYYY` dates, `2:30 PM` times, or English month names on an Indonesian product.
- **Why:** Indonesian uses `DD/MM/YYYY` and 24-hour time. A US date format silently misreads `03/04/2025` as March 4 instead of April 3, and it reads as untranslated.
- **Fix:** `17/08/2025` for numeric dates, `17 Agustus 2025` for long form with Indonesian month names (Januari...Desember), and 24-hour time (`14.30`). Format with `Intl.DateTimeFormat('id-ID')`.
- **Rule:** R-31, C-4.

### Phone and Address Formatting

- **Tell:** US phone masks like `(555) 123-4567`, or an address form without the Indonesian structure on an Indonesian product.
- **Why:** Indonesian phone numbers start `+62` or `08xx`, and addresses carry `Jl.`, RT/RW, and a 5-digit postal code. A foreign mask forces the user to fight the form.
- **Fix:** accept `+62` and `08xx` phone formats, and structure addresses for `Jl.`, RT/RW, kelurahan/kecamatan, kota, and a 5-digit kode pos. Do not validate against a US zip-code pattern.
- **Rule:** C-2, C-4.

### Text Expansion and Overflow

- **Tell:** labels and buttons that truncate or overflow after being translated, because Indonesian is about 20-30% longer than English and the layout was sized for the English string.
- **Why:** a broken button label is a broken control (R-26); a design that fits English and clips Indonesian is unfinished (C-4).
- **Fix:** size the layout for the Indonesian string, not the English one, and check every label, button, and table header at the widest breakpoint. Allow labels to wrap; never let a translated label clip off-screen.
- **Rule:** R-03, C-4.

### Half-Translated UI Strings

- **Tell:** a mix of Indonesian and English in the interface: "Kirim Sekarang" next to "Submit", "Keluar" next to "Log out", error messages split between the two languages.
- **Why:** a half-translated screen is the visible trace of a template that was never finished. It reads as generated and confuses the user about what each control does.
- **Fix:** pick one language per screen and hold it. If the product is bilingual by design, that is a deliberate language toggle, not a mix (R-31). Translate the whole string set, including empty, loading, and error states (R-27).

### Localized Placeholder Data

- **Tell:** mock data that still uses `John Doe`, `johndoe@example.com`, `$1,234.56`, or US dates in an Indonesian product.
- **Why:** the filler belongs to nobody, and a foreign name or currency inside an Indonesian screen makes the fabrication twice as visible.
- **Fix:** placeholders follow the same localization as real content: `Budi Santoso`, `nama@email.com`, `Rp1.234.000`, `17/08/2025`, or an honest `[REAL DATA]` (R-23, R-38).

## Commit Messages (Code)

Commit messages are user-facing text the same way copy is. A commit that reads like an AI wrote it ("Update code", "Fix bug", "Minor changes") is slop with the same tells as a generic CTA, and it destroys the history's usefulness. This section governs the message, never the diff.

### Generic Commit Subjects

- **Tell:** `Update code`, `Fix bug`, `Improve performance`, `Add feature`, `Refactor`, `WIP`, `Fix issue`, `Update dependencies`, `Clean up code`, `Minor changes`.
- **Why:** the subject names no change. Ten commits that all say "Update code" are a history you cannot read or bisect.
- **Fix:** write the subject as a specific imperative that names what changed: `Fix: stop duplicate webhook processing on Stripe retry`, `Add: rate-limit the login endpoint to 5/min`, `Remove: dead billing report query`.
- **Rule:** R-31, C-1.

### Emoji and Decorative Prefixes

- **Tell:** `✨ feat: ...`, `🐛 fix: ...`, `🔥 ...`, `🚀 ...` leading every commit.
- **Why:** emoji is the same decorative noise in commits as it is in code comments and UI text; it carries no information the type line already carries.
- **Fix:** drop the emoji. If a type prefix helps, use a plain conventional-commit type (`fix:`, `feat:`, `docs:`, `test:`, `chore:`) and put the meaning in the words, not the glyph.

### Buzzword Subjects

- **Tell:** `optimize`, `enhance`, `streamline`, `refactor code for better performance`, `improve UX`, `make it more robust`, with no detail.
- **Why:** these are the commit-message form of AI buzzwords: a claim with no named change, so the reader cannot tell what happened.
- **Fix:** name the concrete change and, when it matters, why: `fix: cache the report query so the dashboard loads under 1s`.

### Vague and Over-Explained Bodies

- **Tell:** on one end, a body that only repeats the subject ("This commit updates the code."); on the other, a multi-paragraph body narrating every edit with reasons, history, and issue numbers.
- **Why:** both are filler. A body earns its place when it carries information the subject does not: the non-obvious why, a migration note, a breaking change.
- **Fix:** keep the body to one or two lines only when they add a real fact. Drop the rest. If the subject already says it, no body.

## Extended Checklist

Run these alongside the core Delivery Gate. Every line below must be true:

- [ ] Indonesian copy free of its own tells: dapat/secara/serta, tak hanya... tetapi juga, semoga bermanfaat, generic positive conclusions, and English buzzword mixing (R-16, R-36)
- [ ] Currency, number, date, time, phone, and address formatting is Indonesian (Rp, dot thousands, DD/MM/YYYY, 24-hour, +62), with no half-translated UI strings (R-31, C-2, C-4)
- [ ] Commit messages name a specific change, with no emoji, no buzzwords, and no AI-slop subjects (R-31)
