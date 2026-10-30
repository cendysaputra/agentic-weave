<!-- Detail for the weave-docs skill: docblocks and code comments. Sources: PEP 257, WordPress PHP Documentation Standards, PHP-FIG PSR list (research 2026-10-30). -->

# Docblocks and Comments

## The test

Write a docblock only when it adds something the name and types do not already say (R-45):

- unit or format (cents or rupiah, UTC or local time)
- valid range, and what happens outside it
- when it returns null, false, or an empty value
- side effects: queries, cache writes, hooks fired, files touched
- why it is built this way, when the reason is not obvious
- array shapes the language cannot express (`array<int, WP_Post>`)

## Standards

- **Python, PEP 257:** a one-line docstring is a command ("Return the price."), not a description ("Returns..."), and must not restate the signature.
- **WordPress PHP:** summary, description, `@since x.x.x` (three digits), `@param`, `@return`. Every action and filter hook is documented where it is first defined; repeats point to that file in one line. In themes and plugins that follow WPCS, `@since` and hook docs stay required even with full type hints.
- **PHPDoc:** PSR-5 (PHPDoc) and PSR-19 (PHPDoc tags) are still drafts at PHP-FIG, so follow the project's existing style.
- **JSDoc, TSDoc, Laravel:** not verified in the research yet; follow the project's existing convention.

## Example

Before:

```php
/**
 * Get the price.
 *
 * @param int $product_id The product ID.
 * @return float The price.
 */
```

After:

```php
/**
 * Hitung harga akhir produk setelah diskon member.
 *
 * Mengembalikan harga reguler bila user belum login. Hasil di-cache per
 * request lewat wp_cache, jadi panggilan berikutnya tidak memicu query.
 *
 * @since 1.4.0
 *
 * @param int $product_id ID produk WooCommerce.
 * @return float Harga dalam mata uang toko, belum termasuk pajak.
 */
```
