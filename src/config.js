/**
 * Central site configuration.
 *
 * CHECKOUT — swap for production:
 *   The live checkout redirect is controlled in TWO layers, in priority order:
 *     1. site_settings.checkout_url in Supabase (editable in the Admin Panel →
 *        System tab, updates every open session in real time), which overrides
 *     2. DEFAULT_CHECKOUT_URL below (or the VITE_CHECKOUT_URL env var), used as
 *        the fallback before the settings row loads or if the field is blank.
 *   To go live with Stripe/PayPal, paste your Payment Link into either layer,
 *   e.g. https://buy.stripe.com/xxxx or https://www.paypal.com/ncp/payment/xxxx
 */
export const DEFAULT_CHECKOUT_URL =
  import.meta.env.VITE_CHECKOUT_URL || 'https://example.com/checkout-placeholder'

/** Fallbacks used until site_settings loads (admin-editable at runtime). */
export const DEFAULTS = {
  site_name: 'SPECTRA',
  announcement: 'Free shipping on orders over $999 — every machine ships spec-verified.',
  hero_title: 'Machines, measured.',
  hero_subtitle:
    'Fifty laptops. Real silicon, real specs, straight answers. Filter by what actually matters and check out in seconds.',
  cta_text: 'Browse the lineup',
  banner_image_url: '',
  tax_rate: 0.08,
  shipping_flat: 19,
  free_shipping_threshold: 999,
}

/** Route the admin panel lives on — deliberately non-obvious, never linked publicly. */
export const ADMIN_ROUTE = '/portal-management'
export const ADMIN_SETUP_ROUTE = '/admin-setup'

/** localStorage key for the persistent cart. */
export const CART_STORAGE_KEY = 'spectra_cart_v1'
