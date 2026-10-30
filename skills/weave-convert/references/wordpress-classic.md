<!-- Detail for the weave-convert skill: classic (PHP template) WordPress themes. Sources: developer.wordpress.org and make.wordpress.org, checked 2026-10-29. -->

# WordPress Classic Theme

## Sections as ACF Flexible Content

One ATM section becomes one Flexible Content layout and one template part with the same name:

```php
<?php
// page.php or a page template
if ( have_rows( 'sections' ) ) :
    while ( have_rows( 'sections' ) ) : the_row();
        get_template_part( 'template-parts/sections/' . get_row_layout() );
    endwhile;
endif;
```

```php
<?php // template-parts/sections/hero.php ?>
<section class="hero">
  <h1><?php echo esc_html( get_sub_field( 'title' ) ); ?></h1>
  <a href="<?php echo esc_url( get_sub_field( 'link' ) ); ?>"><?php echo esc_html( get_sub_field( 'link_label' ) ); ?></a>
  <?php echo wp_kses_post( get_sub_field( 'body' ) ); ?>
</section>
```

Escape every output at the point it is printed: `esc_html()` for text, `esc_attr()` for attributes, `esc_url()` for links, `wp_kses_post()` for rich text.

## Loading scripts

Since WordPress 6.3, the fifth argument of `wp_enqueue_script()` takes an array with `strategy` (`defer` or `async`) and `in_footer`. WordPress 6.9 adds `fetchpriority`. Use `defer` for motion code: `async` runs as soon as it loads, so it breaks scripts that depend on each other.

```php
add_action( 'wp_enqueue_scripts', function () {
  $v = wp_get_theme()->get( 'Version' );
  wp_enqueue_script( 'gsap', get_theme_file_uri( 'assets/js/vendor/gsap.min.js' ), [], '3.15.0', [ 'strategy' => 'defer', 'in_footer' => true ] );
  wp_enqueue_script( 'lenis', get_theme_file_uri( 'assets/js/vendor/lenis.min.js' ), [], '1.3.27', [ 'strategy' => 'defer', 'in_footer' => true ] );
  wp_enqueue_script( 'theme-motion', get_theme_file_uri( 'assets/js/motion.js' ), [ 'gsap', 'lenis' ], $v, [ 'strategy' => 'defer', 'in_footer' => true ] );
} );
```

Wire page transitions with `gsap-lifecycle.md`.

## Tokens

Generate CSS variables from the project's tokens with weave-ui's build-tokens.mjs (`--to css`) and enqueue the file. `theme.json` output is not generated yet.

## Not verified yet

Do not write these into a project as fact until checked: `theme.json` changes in WordPress 6.8 and 6.9, ACF Blocks with `block.json`, and conflicts between cache or JS-optimization plugins and deferred scripts.
