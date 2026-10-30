<!-- Detail for the weave-convert skill: WooCommerce. Source: developer.woocommerce.com HPOS recipe book, checked 2026-10-29. -->

# WooCommerce

## Hooks before templates

Change the shop with actions and filters. Copy a template into `yourtheme/woocommerce/` only when no hook can do it, and record the template's version in the build log: every copied template must be rechecked when WooCommerce updates it.

## Orders and HPOS

Read and write orders through `wc_get_order()` and the order CRUD methods, never `get_post_meta()`: with High-Performance Order Storage, orders are not posts. Detect HPOS with `OrderUtil::custom_orders_table_usage_is_enabled()`. A plugin declares compatibility in its main file:

```php
add_action( 'before_woocommerce_init', function () {
  if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
    \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
  }
} );
```

## Not verified yet

Extending the Cart and Checkout blocks (Slot/Fill, Store API). Check the current WooCommerce docs before customizing block checkout.
