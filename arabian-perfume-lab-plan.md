# Arabian Perfume Lab — Premium 3D Static Website Plan

## Top-Level Overview

**Goal:** Rebuild the Arabian Perfume Lab website as a fully self-contained static site — no CDN, no external libraries, no external fonts — while preserving and enhancing the existing premium luxury aesthetic.

**Current State:** The workspace contains a working prototype (`index.html`, `script.js`, `styles.css`) but it violates several requirements:
- Loads Google Fonts and Lucide Icons from external CDNs
- Monolithic file structure (no `config.js`, `products.js`, `cart.js`, `whatsapp.js`, `app.js`)
- Cart is in-memory only (no `localStorage` persistence)
- Product data is duplicated across HTML and JavaScript
- Uses `innerHTML` with interpolated data and inline `onclick=` handlers
- Cart does not re-derive prices from a central catalog
- No mobile sticky order bar
- WhatsApp message is incomplete and inconsistently formatted
- Uses external Unsplash images (must be local)
- Newsletter form uses inline `onsubmit=` handler

**Approach:** Build the new file structure from scratch, extracting and improving content from the existing prototype. Keep the dark luxury aesthetic, gold colour palette, Arabic geometric motifs, and CSS 3D effects. Replace all external dependencies with self-hosted equivalents (base64-embedded fonts or system font fallbacks, inline SVG icons).

**Deployment:** Final output is a folder of static files deployable on any static host or opened directly in a browser.

---

## Architecture

```
ArabianPerfumeLab/
├── index.html              ← Single-page application shell
├── css/
│   ├── style.css           ← Core design system, layout, 3D effects
│   └── responsive.css      ← All media query overrides (mobile-first)
├── js/
│   ├── config.js           ← Business config (WhatsApp, Instagram, Maps, etc.)
│   ├── products.js         ← Central product catalog
│   ├── cart.js             ← Cart state, localStorage persistence, quantity logic
│   ├── whatsapp.js         ← WhatsApp URL and message generation
│   └── app.js              ← UI orchestration, event binding, animations
└── assets/
    ├── images/             ← WebP product and hero images (placeholders initially)
    └── icons/              ← SVG icon sprites (self-hosted)
```

---

## Sub-Tasks

---

### Sub-Task 1 — Project Scaffold & Configuration Files

**Status:** [ ] pending

**Intent:** Create the folder structure and the two pure-data JavaScript files (`config.js` and `products.js`) that every other module depends on. No UI work here — just the authoritative data layer.

**Expected Outcomes:**
- `js/config.js` exists with the full `BUSINESS` configuration object (WhatsApp number, Instagram URL, Maps URL, phone, address, hours).
- `js/products.js` exists with an array of at least 6 products. Each product has: `id`, `name`, `price`, `size`, `image`, `notes` (array), `description`, `category`, `badge`, `tagline`, `topNotes`, `heartNotes`, `baseNotes`, `concentration`.
- `assets/images/` folder exists with placeholder `.webp` image files (or clearly named stand-in files).
- `assets/icons/` folder exists with an SVG sprite file (`icons.svg`) containing all required icons as `<symbol>` elements: cart, close, menu, whatsapp, instagram, phone, map-pin, arrow-right, plus, minus, trash, star, check, eye, chevron-right, compass, flask, hourglass, crown, flame, youtube.

**Todo List:**
- [ ] Create `js/config.js` with `BUSINESS` constant
- [ ] Create `js/products.js` with `products` array (6+ products, all fields filled)
- [ ] Create `assets/images/` directory with placeholder product images
- [ ] Create `assets/icons/icons.svg` with all required icon symbols

**Relevant Context:**
- Business details already present in existing `index.html` footer and `script.js`: WhatsApp `+91 90305 47400`, Instagram `@arabian__perfume_lab`, address at Kothapeta, Guntur AP.
- Existing product data lives in `FRAGRANCE_CATALOG` object in `script.js` (lines 277–334) — migrate and expand to `products.js` format.
- Never store prices anywhere except `products.js`.

---

### Sub-Task 2 — Cart Module (`cart.js`)

**Status:** [ ] pending

**Intent:** Implement a robust, localStorage-persisted, catalog-driven cart. All pricing is re-derived from `products.js` on every operation — the cart only stores `productId` and `quantity`.

**Expected Outcomes:**
- `js/cart.js` exists and exports a `Cart` object (or module pattern).
- Cart is loaded from `localStorage` on initialisation; invalid/corrupt data is safely discarded.
- `Cart.add(productId)` increments quantity or adds new entry.
- `Cart.remove(productId)` removes entry.
- `Cart.setQuantity(productId, qty)` validates quantity (positive integer, max 99).
- `Cart.clear()` empties the cart.
- `Cart.getItems()` returns an array of `{ product, qty, itemTotal }` derived from `products.js`.
- `Cart.getTotal()` returns the grand total calculated from `products.js`.
- `Cart.getTotalQty()` returns the sum of all quantities.
- `Cart.save()` persists only `[{ id, qty }]` to `localStorage`.
- On load, each stored `id` is validated against `products` array — unknown IDs are silently dropped.
- `Cart.onChange(callback)` allows registering UI update listeners.
- No `eval()`, no `new Function()`, no price stored in `localStorage`.

**Todo List:**
- [ ] Write `js/cart.js` with module pattern
- [ ] Implement `localStorage` load with validation against product catalog
- [ ] Implement `add`, `remove`, `setQuantity`, `clear`, `getItems`, `getTotal`, `getTotalQty`, `save`, `onChange`
- [ ] Validate quantity: must be positive integer, max 99
- [ ] Write `getItems()` to always derive price from `products.js`

**Relevant Context:**
- Existing cart logic in `script.js` lines 447–577 is in-memory only; use as inspiration but do not reuse directly.
- The spec explicitly prohibits storing price in `localStorage` or accepting it from user input.
- Cart must survive `location.reload()`.

---

### Sub-Task 3 — WhatsApp Module (`whatsapp.js`)

**Status:** [ ] pending

**Intent:** Generate a properly formatted, URL-encoded WhatsApp click-to-chat message from the current cart, using the business number from `config.js` and prices from `products.js`.

**Expected Outcomes:**
- `js/whatsapp.js` exists and exports `generateWhatsAppURL(cartItems, total)`.
- The generated message matches the exact format specified in requirement §13.
- The URL uses `https://wa.me/<number>?text=<encoded>`.
- The number comes from `BUSINESS.whatsapp` in `config.js`.
- Each line item shows: product name, size × quantity, price × quantity = line total.
- The grand total line is correct.
- The message ends with "Please confirm my order. Thank you."
- `encodeURIComponent()` is used for safe encoding.
- No price is sourced from DOM or localStorage — only from `Cart.getItems()`.
- If the cart is empty the function returns `null`.

**Todo List:**
- [ ] Write `js/whatsapp.js` with `generateWhatsAppURL` function
- [ ] Build message string from cart items (name, size, qty, price × qty = line total)
- [ ] Add total line and confirmation text
- [ ] URL-encode with `encodeURIComponent`
- [ ] Prepend `https://wa.me/` + sanitised number from `BUSINESS.whatsapp`
- [ ] Return `null` for empty cart

**Relevant Context:**
- Existing WhatsApp URL construction in `script.js` lines 491–496 is incomplete and uses manual `%0A` encoding instead of `encodeURIComponent`.
- WhatsApp number in `config.js` must be digits only (no `+`, spaces, dashes) for the `wa.me` URL.

---

### Sub-Task 4 — Core CSS Design System (`css/style.css`)

**Status:** [ ] pending

**Intent:** Create the complete design system stylesheet — CSS custom properties, typography (system/local font stack as fallback replacing Google Fonts), global resets, layout utilities, all component styles (header, hero, cards, modal, cart drawer, footer, animations). No external font URLs. All 3D effects are pure CSS.

**Expected Outcomes:**
- `css/style.css` exists and is self-contained (zero `@import url(...)` pointing to CDNs).
- CSS custom properties define the full colour palette (matte black, gold, ivory, amber).
- Typography uses a graceful system font stack for sans-serif body text, and a serif/display stack for headings — or alternatively embed a free OFL font as base64 `@font-face` if truly needed.
- All component styles are present: header, announcement bar, hero, intro section, product grid cards, product detail modal, ingredients grid, collections grid, testimonials, Instagram section, about section, contact section, visit-us section, footer, cart drawer, mobile sticky bar, toast notification, scroll animations, empty cart state.
- CSS 3D effects implemented for: product card tilt on hover (`perspective`, `rotateX`, `rotateY`), hero bottle float (`translateY` + `rotate3d` loop), modal entrance (`translateZ`), depth shadows, glassmorphism on cart drawer.
- `@media (prefers-reduced-motion: reduce)` disables or significantly reduces all animations and transforms.
- No inline styles in HTML; all states driven by class toggling.
- `rel="noopener noreferrer"` on all external links.

**Todo List:**
- [ ] Define CSS custom properties (colours, spacing, typography, transitions)
- [ ] Write global resets and base styles
- [ ] Implement system/local font stack (no CDN fonts)
- [ ] Create SVG icon sprite usage via `<use href="...">` in CSS context
- [ ] Style header: sticky, transparent-to-solid on scroll, logo, nav, cart icon
- [ ] Style announcement bar
- [ ] Style hero section: full-viewport, background image, overlay, floating bottle, particle canvas
- [ ] Style intro section: two-column, stats, editorial link
- [ ] Style product cards: 3D perspective tilt, image zoom, note chips, price, button
- [ ] Style product detail modal: large image, scent pyramid, quantity selector, actions
- [ ] Style ingredients grid
- [ ] Style philosophy section: full-width dark feature with Arabic pattern
- [ ] Style collections grid
- [ ] Style testimonials
- [ ] Style Instagram section
- [ ] Style about section: two-column desktop, stacked mobile
- [ ] Style visit-us / contact cards
- [ ] Style footer: four-column grid, socials
- [ ] Style cart drawer: slide-out desktop, full-screen mobile, glassmorphism
- [ ] Style mobile sticky order bar
- [ ] Style empty cart state
- [ ] Style toast notification
- [ ] Style scroll-reveal animation classes
- [ ] Add `prefers-reduced-motion` block

**Relevant Context:**
- Existing `styles.css` has extensive CSS from the prototype; extract and improve rather than start blank.
- Google Fonts used: Cinzel (headings), Cormorant Garamond (serif body/italic), Montserrat (body sans). Replace with system equivalents: `Georgia, 'Times New Roman', serif` for Cormorant; `Palatino Linotype, Palatino, serif` for Cinzel-like; `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` for Montserrat.
- Existing Tailwind-ish class names on `<body>` (e.g. `bg-matte-black`) must be removed — use only CSS classes defined in our stylesheets.
- Lucide icon `<i data-lucide="...">` elements must be replaced with `<svg><use href="assets/icons/icons.svg#icon-name"></use></svg>` pattern.

---

### Sub-Task 5 — Responsive CSS (`css/responsive.css`)

**Status:** [ ] pending

**Intent:** All mobile-first responsive overrides in one dedicated file. Cover every breakpoint from 320px to 1920px. Fix every layout-breaking issue at mobile sizes.

**Expected Outcomes:**
- `css/responsive.css` imports nothing external.
- Breakpoints covered: 320px, 480px, 768px, 1024px, 1280px, 1440px, 1920px.
- Mobile (≤768px): hamburger menu visible, desktop nav hidden; cart drawer is full-screen; hero text is readable; product grid is 1 column (or 2 if ≥480px); no horizontal scroll; hero 3D effects reduced.
- Tablet (768–1024px): product grid 2 columns; about section stacks vertically; nav collapses.
- Desktop (≥1024px): full nav visible; product grid 3–4 columns; cart drawer slides from right.
- Mobile sticky order bar is visible only on mobile when cart has items.
- Typography scales correctly (fluid or step-based).
- Images are `width:100%`, `max-width` constrained.
- No element overflows its container at any tested width.

**Todo List:**
- [ ] Write base mobile styles (≤480px): single column, full-width buttons, stacked sections
- [ ] Write 480px breakpoint: 2-column product grid
- [ ] Write 768px breakpoint: tablet nav, 2-col product grid, desktop cart drawer begins
- [ ] Write 1024px breakpoint: full desktop nav, 3-col product grid, side cart drawer
- [ ] Write 1280px breakpoint: 4-col product grid option, typography scaling
- [ ] Write 1440px+ breakpoint: max-width container locks, large display adjustments
- [ ] Write 1920px breakpoint: ensure no stretching on ultra-wide displays
- [ ] Ensure mobile sticky bar has correct z-index, height, padding
- [ ] Test (mentally walk through) each section at 320px

**Relevant Context:**
- The existing `styles.css` has some responsive CSS mixed in; extract it to `responsive.css`.
- The spec says "Do NOT simply shrink the desktop design. Create proper mobile layouts."

---

### Sub-Task 6 — Main Application Logic (`js/app.js`)

**Status:** [ ] pending

**Intent:** Wire everything together. `app.js` is the UI orchestration layer — it initialises all modules, binds all DOM events (using `addEventListener`, never inline `onclick`), renders dynamic content, and controls all UI state transitions.

**Expected Outcomes:**
- `js/app.js` exists.
- All event listeners use `addEventListener()` — zero inline `onclick=""` in HTML.
- Product grid is rendered dynamically from `products.js` array (no product HTML in `index.html`).
- Filter tabs work (All, Oud, Floral, Amber).
- Product card 3D tilt effect on hover (JS-driven `mousemove` + CSS transform).
- Product detail modal opens when card is clicked; shows large image, notes, quantity selector, Add to Cart, Order Now buttons.
- Quantity selector validates input (1–99, integers only).
- Cart drawer opens/closes; renders from `Cart.getItems()`; has increase/decrease/remove per item.
- "Order on WhatsApp" calls `generateWhatsAppURL()` and opens in new tab (`window.open(..., '_blank', 'noopener,noreferrer')`).
- "Continue Shopping" closes cart.
- Mobile sticky order bar shows/hides based on `Cart.getTotalQty() > 0`.
- Mobile sticky bar shows correct count and total.
- Scroll reveal animations via `IntersectionObserver`.
- Sticky header scrolled state toggled on scroll.
- Mobile nav hamburger open/close.
- Toast notification display.
- Canvas smoke/particle effect in hero (lightweight, respects `prefers-reduced-motion`).
- Custom cursor (desktop only, hidden on touch devices).
- On mobile, 3D card tilt is replaced with tap-to-see-notes interaction.
- `localStorage` cart loaded on page load via `Cart` module.
- `Cart.onChange()` callback updates all cart count indicators and the sticky bar.
- DOM manipulation uses `textContent` and `createElement` — not `innerHTML` with user-derived data.
- No `eval()`, no `new Function()`.
- Price disclaimer "Prices are subject to confirmation by Arabian Perfume Lab." is visible in cart drawer.

**Todo List:**
- [ ] Write `js/app.js` with `DOMContentLoaded` initialisation
- [ ] Dynamically render product cards from `products` array
- [ ] Implement fragrance filter tabs
- [ ] Implement 3D card hover tilt (mousemove → CSS transform)
- [ ] Implement product detail modal (open/close, content from `products.js`)
- [ ] Implement quantity selector in modal
- [ ] Implement Add to Cart from modal and from card button
- [ ] Implement cart drawer open/close
- [ ] Implement cart item rendering (qty controls, remove button)
- [ ] Implement "Order on WhatsApp" button
- [ ] Implement "Continue Shopping" button
- [ ] Implement mobile sticky order bar show/hide
- [ ] Implement scroll reveal IntersectionObserver
- [ ] Implement sticky header scroll state
- [ ] Implement mobile hamburger nav
- [ ] Implement toast notifications
- [ ] Implement Canvas hero particle effect (with reduced-motion check)
- [ ] Implement custom cursor (desktop only)
- [ ] Bind `Cart.onChange()` to re-render cart UI and update counts
- [ ] Add price disclaimer text in cart drawer

**Relevant Context:**
- Existing `script.js` has most of these features; refactor and clean up into `app.js`.
- The key security fix is: modal "Add to Cart" must NOT read price from a `data-price` attribute — it must call `Cart.add(productId)` and let `cart.js` look up the price from `products.js`.
- Same for the card "Add to Cart" button — remove `data-price` and `data-name` from HTML; look up everything from `products.js` by ID.

---

### Sub-Task 7 — HTML Shell (`index.html`)

**Status:** [ ] pending

**Intent:** Write the final clean `index.html` — semantic, accessible, CSP-friendly, SEO-ready, with no external CDN links, no inline event handlers, no product HTML (rendered by `app.js`), and correct script load order.

**Expected Outcomes:**
- `index.html` has correct `<meta>` tags: charset, viewport, description, Open Graph.
- `<title>` is descriptive.
- No `<link>` to any CDN.
- No `<script src="...">` pointing to any CDN.
- Local CSS files loaded: `css/style.css`, `css/responsive.css`.
- Local JS files loaded at end of `<body>` in order: `config.js`, `products.js`, `cart.js`, `whatsapp.js`, `app.js`.
- SVG icon sprite `assets/icons/icons.svg` is inlined or loaded via `<img>` fetch — icons used as `<svg><use href="...#icon-name"></use></svg>`.
- All icon `<i data-lucide="...">` references removed; replaced with SVG use pattern.
- Sections present: header, announcement bar, hero, intro, fragrances (empty container — JS fills it), experience/craftsmanship, ingredients, philosophy, collections, testimonials, Instagram, about, visit-us, contact, footer.
- Cart drawer HTML present (static shell — JS populates items).
- Product detail modal HTML present (static shell — JS populates content).
- Mobile sticky order bar HTML present (hidden by default).
- Toast notification HTML present.
- No `class="bg-matte-black text-ivory antialiased selection:bg-gold selection:text-black"` Tailwind utility classes on `<body>`.
- Semantic elements: `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`, `<article>`, `<aside>`.
- `aria-label` on icon-only buttons.
- `rel="noopener noreferrer"` on all `target="_blank"` links.
- Images have `alt` text, `loading="lazy"` (except hero), `width`/`height` attributes.
- No `onsubmit=""`, no `onclick=""` inline handlers.
- `<meta name="robots" content="index, follow">`.

**Todo List:**
- [ ] Write `<!DOCTYPE html>` shell with correct lang, charset, viewport
- [ ] Add SEO meta tags and Open Graph tags
- [ ] Link local CSS files only
- [ ] Write header HTML: logo, nav links, cart button, mobile hamburger
- [ ] Write mobile drawer HTML
- [ ] Write announcement bar HTML
- [ ] Write hero section HTML with canvas placeholder
- [ ] Write intro/brand section HTML
- [ ] Write fragrance section HTML with filter tabs and empty product grid container
- [ ] Write craftsmanship/experience timeline HTML
- [ ] Write ingredients grid HTML
- [ ] Write philosophy section HTML
- [ ] Write collections grid HTML
- [ ] Write testimonials HTML
- [ ] Write Instagram/social section HTML
- [ ] Write About section HTML
- [ ] Write Visit Us section HTML
- [ ] Write Contact section HTML
- [ ] Write footer HTML
- [ ] Write cart drawer HTML shell
- [ ] Write product detail modal HTML shell
- [ ] Write mobile sticky order bar HTML
- [ ] Write toast notification HTML
- [ ] Load JS files in correct order at bottom of body
- [ ] Replace all lucide `<i>` tags with SVG `<use>` pattern
- [ ] Verify zero CDN references

**Relevant Context:**
- Existing `index.html` is the best source for section copy, structure, and HTML patterns — extract content, remove CDN refs and inline handlers.
- The `<section id="fragrances">` product grid container should be empty in HTML; `app.js` renders all product cards.
- The hero section can keep its canvas element and background image (local path).

---

### Sub-Task 8 — Asset Preparation

**Status:** [ ] pending

**Intent:** Populate `assets/images/` with local WebP placeholder images for each product and the hero, and ensure `assets/icons/icons.svg` is complete and correct.

**Expected Outcomes:**
- Each product in `products.js` has a corresponding image file in `assets/images/`.
- Hero background image exists at `assets/images/hero-bg.webp` (or `.jpg` as fallback).
- About section image exists at `assets/images/about.webp`.
- If real photography is not available, create clearly named placeholder files or use embedded CSS gradients as fallbacks so the site renders without broken image icons.
- `assets/icons/icons.svg` has all needed symbol icons with correct `viewBox` values.

**Todo List:**
- [ ] Create `assets/images/` directory with documented placeholder image list
- [ ] Create `assets/icons/icons.svg` with all icon symbols (cart, close, menu, whatsapp, instagram, phone, map-pin, arrow-right, plus, minus, trash, star, check, eye, chevron-right, compass, flask, hourglass, crown, flame, youtube)
- [ ] Update `products.js` image paths to point to `assets/images/`
- [ ] Add CSS fallback for missing images (background-color gradient per product category)

**Relevant Context:**
- The spec says "Local WebP images" and "Local images". Since this is a new build with no photography yet, use gradient CSS fallback colours so the layout isn't broken by 404s.
- Icons must be self-hosted SVGs — not loaded from unpkg or any CDN.

---

### Sub-Task 9 — Integration Testing & Final Polish

**Status:** [ ] pending

**Intent:** Validate the complete integrated site against all 32 spec requirements. Fix any issues found. This is a review + fix pass, not new feature work.

**Expected Outcomes:**
- No external CDN references in any file (verify with grep).
- No `eval()` or `new Function()` in any JS file.
- No inline `onclick=`, `onsubmit=`, `onload=` in HTML.
- Cart survives page refresh (localStorage test).
- Price recalculated from catalog (not from DOM or localStorage stored price).
- WhatsApp URL generates correct message with all items, correct quantities, correct prices.
- Product filter tabs work.
- Product detail modal opens and closes.
- Cart: add, remove, increase, decrease, clear all work.
- Mobile sticky bar appears when cart has items.
- Empty cart state renders correctly.
- At 320px: no horizontal scroll, no overlapping elements, nav collapses correctly.
- `prefers-reduced-motion` CSS block exists and disables animations.
- All images have `alt` text.
- Price disclaimer is present in cart.
- All external links have `rel="noopener noreferrer"`.
- Semantic HTML structure is correct.
- ARIA labels on interactive elements.

**Todo List:**
- [ ] Grep for any `fonts.googleapis.com`, `unpkg.com`, `cdn.`, `cdnjs.` references — must be zero
- [ ] Grep for `eval(`, `new Function(`, `innerHTML` — review each usage
- [ ] Grep for `onclick=`, `onsubmit=`, `onload=` in HTML files — must be zero
- [ ] Verify localStorage round-trip: add product, reload page, verify cart restored
- [ ] Verify price integrity: cart total must match products.js prices × quantities
- [ ] Verify WhatsApp message format matches spec §13 exactly
- [ ] Verify all product filter tabs show/hide correct cards
- [ ] Verify modal opens with correct product data
- [ ] Verify quantity selector clamps to 1–99
- [ ] Verify mobile sticky bar visibility logic
- [ ] Verify reduced-motion CSS removes animations
- [ ] Check alt text on all images
- [ ] Check ARIA labels on cart button, modal close, hamburger
- [ ] Check `rel="noopener noreferrer"` on all `target="_blank"` links
- [ ] Final visual pass: does the site look premium, 3D, and Arabian?

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| External fonts | System font stack fallbacks | Spec forbids CDN; embedding large font files as base64 is impractical; system serif/sans-serif fonts render excellently at these weights |
| Icon library | Self-hosted SVG sprite | Spec forbids CDN; SVG use pattern is native, accessible, zero-dependency |
| Product images | Local files + CSS gradient fallback | Spec requires local images; placeholders allow layout to work before real photography |
| Cart storage | localStorage `[{id, qty}]` only | Spec §14 requires price never stored/accepted from client; always re-derived from catalog |
| 3D effects | CSS only (perspective, transform, keyframes) | Spec forbids Three.js / GSAP; CSS 3D is fast and sufficient |
| Product rendering | JavaScript DOM creation from products.js | Single source of truth; no product data duplicated in HTML |
| WhatsApp ordering | wa.me click-to-chat URL | Spec §13; no API key, no registration, works universally |
