# antislop-copywriting-id

> Anti Slop: Rules for AI Coding Agents. Bahasa Indonesia copy skill

> Part of the antislop system. Read together with `antislop.md` (the core) and `antislop-copywriting`. This skill deep-dives the Bahasa Indonesia copy concern: the AI tells that only appear in Indonesian text. It references core rules by number and never duplicates or renumbers them. Load it when the task writes or edits Indonesian copy.

## How to use this skill

- Load together with `antislop.md` and `antislop-copywriting` whenever the task is Indonesian copy or text work.
- Every entry has the same shape: **The pattern** / **Why it reads as AI** / **Before** / **After**, with the governing core rule cited as R-XX.
- Two rules apply to everything below: never invent facts (R-17, R-36, R-38), and do not over-sterilize (R-37). Indonesian reads about 20-30% longer than English, so wordiness is the default enemy.
- The Delivery Gate in the core remains the gate. The checklist at the end supplements it.

## Tone & Voice

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

## What NOT to flag

### Particle Wordplay

- **The pattern:** *kok*, *sih*, *dong*, *kan*, *ya* used naturally in a sentence.
- **Why it is human:** these particles are signs of a native voice. Strip them and the copy flattens into a sterile default.
- **Do:** keep them. They are not slop.

### Register Mixing

- **The pattern:** a writer switching between *Anda* (formal) and *kamu* (casual) deliberately.
- **Why it is human:** register mixing is a real person's habit, not a defect.
- **Do:** keep it.

### Local Specificity

- **The pattern:** real place names, prices in Rupiah, and local references.
- **Why it is human:** hard-to-fabricate local detail is evidence of a real person.
- **Do:** keep it.

## Copywriting-ID Skill Checklist

Run these alongside the core Delivery Gate. Every line below must be true:

- [ ] No fabricated numbers, names, dates, or claims in the Indonesian copy (R-17, R-18, R-36, R-38)
- [ ] Empty Indonesian AI vocabulary (dapat/secara/serta, dengan mudah, solusi, optimal) replaced with specific language (R-16)
- [ ] No "Tak hanya... tetapi juga..." or other negative parallelism used for false emphasis (R-36)
- [ ] No chatbot closers (semoga bermanfaat, jika ada pertanyaan) or generic positive conclusions (R-36)
- [ ] No English buzzwords mixed into Indonesian copy (R-16)
- [ ] No em dashes; spaced hyphens and trailing ellipsis caught too (R-02)
- [ ] Human particles (kok, sih, dong) and local detail preserved, not stripped (R-37)
