# antislop-ui-id

> Anti Slop: Rules for AI Coding Agents. Indonesian UI localization skill

> Part of the antislop system. Read together with `antislop.md` (the core) and `antislop-ui`. This skill deep-dives Indonesian UI localization: currency, numbers, dates, time, phone, address, and the overflow that translation causes. It references core rules by number and never duplicates or renumbers them. Load it when the task builds or edits an Indonesian interface.

## How to use this skill

- Load together with `antislop.md` and `antislop-ui` whenever the task is an Indonesian product or interface.
- Every entry has the same shape: **Tell** / **Why** / **Fix**, with the governing core rule cited as R-XX.
- The Delivery Gate in the core remains the gate. The checklist at the end supplements it.

## Localization: Indonesia

Indonesian products follow local conventions for currency, numbers, dates, and time. Generated UI that uses US or English defaults on an Indonesian product is a slop signal the same way a generic gradient is: it shows no one localized the screen for the real user.

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

## UI-ID Skill Checklist

Run these alongside the core Delivery Gate. Every line below must be true:

- [ ] Currency formatted as Rupiah (`Rp1.500.000`), never `$` or `USD` (R-31, C-2)
- [ ] Numbers use dot thousands and comma decimals; percent has no space before the sign (R-31)
- [ ] Dates are `DD/MM/YYYY` or Indonesian long form; time is 24-hour (R-31, C-4)
- [ ] Phone accepts `+62`/`08xx`; address follows `Jl.`/RT-RW/kode pos structure (C-2, C-4)
- [ ] No labels clip or overflow after translation; layout sized for the Indonesian string (R-03, C-4)
- [ ] No half-translated UI strings; one language per screen, including empty/loading/error states (R-27, R-31)
- [ ] Placeholder data is localized or an honest `[REAL DATA]` (R-23, R-38)
