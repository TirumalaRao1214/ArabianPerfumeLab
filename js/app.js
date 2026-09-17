/**
 * Arabian Perfume Lab — Application Logic (v2)
 *
 * Supports the full catalogue: standard + premium + celebrity collections.
 * New in v2:
 *   - Search by name, brand, notes, celebrity
 *   - Filter by collection, brand, gender
 *   - Size selector on cards and modal
 *   - Pagination (24 products per page)
 *   - Image fallback for missing/broken images
 *   - Brand disclaimer and celebrity disclaimer
 *
 * No inline event handlers. All DOM manipulation uses safe APIs.
 * No eval(), no new Function().
 * Load order: config.js → products.js → cart.js → whatsapp.js → app.js
 */

document.addEventListener('DOMContentLoaded', () => {
    injectIconSprite();
    initFallbackImages();     // wire data-fallback on static HTML images
    initLogoFallbacks();      // CSP-safe logo error fallback (no onerror= attrs)
    initAnnounceBar();
    initHeader();
    initMobileDrawer();
    initHeroCanvas();
    initScrollReveal();
    initCatalogueSection();   // search + filters + grid + pagination
    initPricingCards();       // wire pricing strip CTAs to filter catalogue
    initProductModal();
    initCartDrawer();
    initStickyOrderBar();
    initFloatingWhatsApp();
    initSocialSection();
    initHeroCartBtn();
    initNavWhatsApp();
    initScentFinderQuiz();    // 5-step scent quiz with product recommendations
    initSprayEffect();        // perfume spray particles on click
    initBackgroundMusic();    // ambient audio toggle
    // Hand control is initialised by hand-control.js (loaded after app.js)
    // It calls window.initHandControl() directly — no coupling needed here.

    Cart.onChange(updateAllCartIndicators);
    updateAllCartIndicators();
});

/* ==========================================================================
   ICON SPRITE INJECTION
   ========================================================================== */
function injectIconSprite() {
    // Fetch only from the same origin; reject any cross-origin or non-SVG response
    fetch('assets/icons/icons.svg', { credentials: 'same-origin' })
        .then(r => {
            // Guard: only accept same-origin successful responses
            if (!r.ok || !r.url.startsWith(location.origin)) throw new Error('bad response');
            const ct = r.headers.get('content-type') || '';
            if (!ct.includes('svg') && !ct.includes('xml') && !ct.includes('text')) throw new Error('unexpected content-type');
            return r.text();
        })
        .then(svgText => {
            // Sanity check: must start with an SVG tag (strips any injected preamble)
            const trimmed = svgText.trim();
            if (!trimmed.startsWith('<svg') && !trimmed.startsWith('<?xml') && !trimmed.startsWith('<!--')) return;
            const div = document.createElement('div');
            div.setAttribute('aria-hidden', 'true');
            div.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
            div.innerHTML = trimmed; // safe: validated same-origin SVG file
            document.body.insertBefore(div, document.body.firstChild);
        })
        .catch(() => {});
}

/* ==========================================================================
   HELPERS
   ========================================================================== */
function buildIcon(id, extraClass) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.className.baseVal = 'icon' + (extraClass ? ' ' + extraClass : '');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', 'assets/icons/icons.svg#icon-' + id);
    svg.appendChild(use);
    return svg;
}

function formatINR(n) {
    return '\u20B9' + Number(n).toLocaleString('en-IN');
}

function showToast(message) {
    const toast    = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
}

/* ==========================================================================
   FALLBACK IMAGES — wire data-fallback on all static HTML <img> tags
   Handles both: images that error before DOMContentLoaded AND after.
   No inline event handlers — fully CSP-compliant.
   ========================================================================== */
function initFallbackImages() {
    document.querySelectorAll('img[data-fallback]').forEach(img => {
        const applyFallback = () => {
            const fb = img.getAttribute('data-fallback');
            if (fb && img.getAttribute('src') !== fb) {
                img.setAttribute('src', fb);
            }
        };

        // Attach error listener for future failures
        img.addEventListener('error', applyFallback);

        // Also check immediately — image may have already failed
        // (complete=true AND naturalWidth=0 means broken image)
        if (img.complete && img.naturalWidth === 0) {
            applyFallback();
        }
    });
}

/* ==========================================================================
   LOGO FALLBACKS — no inline onerror handlers; CSP-safe JS fallback
   ========================================================================== */
function initLogoFallbacks() {
    // Nav header logo
    const navLogo = document.getElementById('nav-logo-img');
    const navFallback = document.getElementById('nav-logo-fallback');
    if (navLogo && navFallback) {
        const applyNavFallback = () => {
            navLogo.style.display = 'none';
            navFallback.style.display = 'flex';
        };
        navLogo.addEventListener('error', applyNavFallback);
        if (navLogo.complete && navLogo.naturalWidth === 0) applyNavFallback();
    }

    // Mobile drawer logo
    const drawerLogo = document.getElementById('drawer-logo-img');
    const drawerFallback = document.getElementById('drawer-logo-fallback');
    if (drawerLogo && drawerFallback) {
        const applyDrawerFallback = () => {
            drawerLogo.style.display = 'none';
            drawerFallback.style.display = 'inline';
        };
        drawerLogo.addEventListener('error', applyDrawerFallback);
        if (drawerLogo.complete && drawerLogo.naturalWidth === 0) applyDrawerFallback();
    }
}

/** Safe image with fallback on error */
function buildImg(src, alt, w, h, cls, svgFallback) {
    const img      = document.createElement('img');
    const ph       = Cart.getPlaceholderImage();
    const fallback = svgFallback || ph;
    img.src        = src || fallback;
    img.alt        = alt || '';
    if (w) img.width  = w;
    if (h) img.height = h;
    if (cls) img.className = cls;
    img.loading = 'lazy';
    img.addEventListener('error', () => {
        if (img.src !== fallback) {
            img.src = fallback;           // first try the SVG fallback
        } else if (img.src !== ph) {
            img.src = ph;                 // ultimate fallback: placeholder.svg
        }
    });
    return img;
}

/** Return the lowest price across all variants of a product */
function lowestPrice(product) {
    if (!product.sizes) return 0;
    const vals = Object.values(product.sizes).map(v => (typeof v === 'object' ? v.price : v));
    return vals.length ? Math.min(...vals) : 0;
}

/** Return first size key for a product (first non-solid variant if possible) */
function firstSize(product) {
    if (!product.sizes) return '';
    // Prefer first attar or perfume variant over solid
    const keys = Object.keys(product.sizes);
    const nonSolid = keys.find(k => !k.startsWith('solid:'));
    return nonSolid || keys[0] || '';
}

/** Return first type available on a product ('attar'|'perfume'|'solid') */
function firstType(product) {
    const key = firstSize(product);
    if (!key) return 'attar';
    return key.split(':')[0];
}

/**
 * Return the unique product types available on a product.
 * Ordered: attar → perfume → solid
 */
function getProductTypes(product) {
    if (!product.sizes) return [];
    const typeSet = new Set();
    Object.values(product.sizes).forEach(v => { if (v && v.type) typeSet.add(v.type); });
    const order = ['attar', 'perfume', 'solid'];
    return order.filter(t => typeSet.has(t));
}

/** Return all size variants for a given type on a product */
function getVariantsForType(product, type) {
    if (!product.sizes) return [];
    return Object.entries(product.sizes)
        .filter(([, v]) => v && v.type === type)
        .map(([key, v]) => ({ key, ...v }));
}

/**
 * Format a composite size key like "attar:3ml" into a human-readable label.
 * Used in the cart drawer display.
 */
function formatSizeKey(sizeKey) {
    if (!sizeKey) return sizeKey;
    const [type, size] = sizeKey.split(':');
    const typeLabel = type === 'attar' ? 'Attar' : type === 'perfume' ? 'Perfume' : 'Solid';
    return typeLabel + ' · ' + (size || '');
}

/* ==========================================================================
   CATALOGUE STATE
   ========================================================================== */
const CATALOGUE = {
    PAGE_SIZE: 12,
    _page: 1,
    _query: '',
    _category:    'all',  // 'all' | 'attars' | 'perfumes' | 'body-care'
    _subcategory: 'all',  // 'all' | exact subcategory slug
    _notes: 'all',
    _sort: 'default',
    _filtered: [],
    _forcedType: null     // null | 'attar' | 'perfume' | 'solid'
};

/**
 * PERFUME_SUBCATEGORY_MAP
 * Perfume sub-categories are virtual — their products live under the matching
 * attar slug.  This map tells filterProducts() which attar slug to use.
 */
const PERFUME_SUBCATEGORY_MAP = Object.freeze({
    'french-perfumes':            'french-attars',
    'arabic-perfumes':            'arabic-attars',
    'floral-perfumes':            'floral-attars',
    'french-arabic-mix-perfumes': 'french-arabic-mix-attars'
});

/**
 * Derive the forced product type from the current category + subcategory state.
 * Subcategory takes priority over parent category.
 */
function _deriveForcedType() {
    const map = (typeof CATEGORY_TYPE_MAP !== 'undefined') ? CATEGORY_TYPE_MAP : {};
    if (CATALOGUE._subcategory !== 'all') return map[CATALOGUE._subcategory] || null;
    if (CATALOGUE._category    !== 'all') return map[CATALOGUE._category]    || null;
    return null;
}

/** Run the filter + search + sort pipeline and return matching products */
function filterProducts() {
    // Exclude BYOB-only products from the catalogue at all times
    let list = Array.from(products).filter(p => p.category !== 'byob-only');

    const cat    = CATALOGUE._category;
    const subcat = CATALOGUE._subcategory;

    if (cat === 'body-care') {
        // Body Care: show ALL 51 fragrances that have a solid variant
        list = list.filter(p =>
            typeof p.sizes === 'object' &&
            Object.keys(p.sizes).some(k => k.startsWith('solid:'))
        );
    } else if (cat !== 'all') {
        if (subcat !== 'all') {
            // Specific subcategory selected
            const mirroredAttar = PERFUME_SUBCATEGORY_MAP[subcat];
            if (mirroredAttar) {
                // Perfume subcategory: show products from matching attar slug
                // that have perfume variants
                list = list.filter(p => p.category === mirroredAttar &&
                    typeof p.sizes === 'object' &&
                    Object.keys(p.sizes).some(k => k.startsWith('perfume:')));
            } else {
                list = list.filter(p => p.category === subcat);
            }
        } else {
            // Parent category, no subcategory — show all products in that group
            const children = (typeof CATEGORY_GROUPS !== 'undefined' && CATEGORY_GROUPS[cat]) || [];
            if (cat === 'perfumes') {
                // Perfume group: show products that have perfume variants
                // (same underlying products as attar group)
                const perfSubcats = children; // ['french-perfumes','arabic-perfumes','floral-perfumes']
                const attarSlugs  = perfSubcats.map(s => PERFUME_SUBCATEGORY_MAP[s]).filter(Boolean);
                list = list.filter(p =>
                    attarSlugs.indexOf(p.category) !== -1 &&
                    typeof p.sizes === 'object' &&
                    Object.keys(p.sizes).some(k => k.startsWith('perfume:'))
                );
            } else {
                // Attars group: show products belonging to any attar sub-category
                list = list.filter(p => children.indexOf(p.category) !== -1);
            }
        }
    }

    // Notes/family filter
    if (CATALOGUE._notes !== 'all') {
        const n = CATALOGUE._notes.toLowerCase();
        list = list.filter(p => p.notes && p.notes.some(note => note.toLowerCase().includes(n)));
    }

    // Search query
    if (CATALOGUE._query) {
        const q = CATALOGUE._query.toLowerCase();
        list = list.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.notes && p.notes.some(n => n.toLowerCase().includes(q))) ||
            (p.description && p.description.toLowerCase().includes(q))
        );
    }

    // Sort
    switch (CATALOGUE._sort) {
        case 'price-asc':  list.sort((a, b) => lowestPrice(a) - lowestPrice(b)); break;
        case 'price-desc': list.sort((a, b) => lowestPrice(b) - lowestPrice(a)); break;
        case 'az':         list.sort((a, b) => a.name.localeCompare(b.name));    break;
        case 'za':         list.sort((a, b) => b.name.localeCompare(a.name));    break;
        default:           break;
    }

    CATALOGUE._filtered = list;
    return list;
}

/* ==========================================================================
   SUBCATEGORY DROPDOWN — dynamic population based on parent category
   ========================================================================== */

/**
 * Rebuild the #filter-subcategory <select> options based on the selected parent.
 * Hides the subcategory dropdown when the parent has no subcategories.
 */
function _rebuildSubcategoryDropdown(parentCategory) {
    const sel = document.getElementById('filter-subcategory');
    if (!sel) return;

    // Clear all options
    while (sel.firstChild) sel.removeChild(sel.firstChild);

    const groups  = (typeof CATEGORY_GROUPS !== 'undefined') ? CATEGORY_GROUPS : {};
    const catMap  = (typeof CATEGORIES      !== 'undefined') ? CATEGORIES      : {};
    const children = groups[parentCategory] || [];

    // Build "All …" option
    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    if (parentCategory === 'all')       allOpt.textContent = 'All Subcategories';
    else if (parentCategory === 'attars')    allOpt.textContent = 'All Attars';
    else if (parentCategory === 'perfumes')  allOpt.textContent = 'All Perfumes';
    else if (parentCategory === 'body-care') allOpt.textContent = 'Body Creams / Solid Perfumes';
    else                                     allOpt.textContent = 'All';
    sel.appendChild(allOpt);

    // Add subcategory options
    children.forEach(slug => {
        const opt = document.createElement('option');
        opt.value = slug;
        opt.textContent = catMap[slug] || slug;
        sel.appendChild(opt);
    });

    // Show/hide the dropdown group
    const group = sel.closest('.filter-group');
    if (group) {
        group.style.display = (parentCategory === 'all' || parentCategory === 'body-care') ? 'none' : '';
    }
}

/* ==========================================================================
   CATALOGUE SECTION (search + filters + grid + pagination)
   ========================================================================== */
function initCatalogueSection() {
    if (typeof products === 'undefined') return;

    // Hide subcategory dropdown initially
    _rebuildSubcategoryDropdown('all');

    // Wire search input
    const searchInput = document.getElementById('catalogue-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            CATALOGUE._query = searchInput.value.trim();
            CATALOGUE._page  = 1;
            renderGrid();
        });
    }

    // Wire Category dropdown
    const catSel = document.getElementById('filter-category');
    if (catSel) {
        catSel.addEventListener('change', () => {
            CATALOGUE._category    = catSel.value;
            CATALOGUE._subcategory = 'all';
            CATALOGUE._forcedType  = _deriveForcedType();
            CATALOGUE._page        = 1;
            _rebuildSubcategoryDropdown(catSel.value);
            renderGrid();
        });
    }

    // Wire Subcategory dropdown
    const subSel = document.getElementById('filter-subcategory');
    if (subSel) {
        subSel.addEventListener('change', () => {
            CATALOGUE._subcategory = subSel.value;
            CATALOGUE._forcedType  = _deriveForcedType();
            CATALOGUE._page        = 1;
            renderGrid();
        });
    }

    // Wire Notes + Sort selects
    ['notes', 'sort'].forEach(key => {
        const el = document.getElementById('filter-' + key);
        if (el) {
            el.addEventListener('change', () => {
                CATALOGUE['_' + key] = el.value;
                CATALOGUE._page = 1;
                renderGrid();
            });
        }
    });

    // Wire clear filters button
    const clearBtn = document.getElementById('filter-clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            CATALOGUE._query       = '';
            CATALOGUE._category    = 'all';
            CATALOGUE._subcategory = 'all';
            CATALOGUE._notes       = 'all';
            CATALOGUE._sort        = 'default';
            CATALOGUE._forcedType  = null;
            CATALOGUE._page        = 1;
            if (searchInput) searchInput.value = '';
            if (catSel)  catSel.value  = 'all';
            if (subSel)  subSel.value  = 'all';
            const notesEl = document.getElementById('filter-notes');
            const sortEl  = document.getElementById('filter-sort');
            if (notesEl) notesEl.value = 'all';
            if (sortEl)  sortEl.value  = 'default';
            _rebuildSubcategoryDropdown('all');
            renderGrid();
        });
    }

    // Initial render
    renderGrid();
}

/** No-op: brand filter removed; categories replace it */
function populateBrandFilter() {}

/** Full grid render based on current filter/page state */
function renderGrid() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const filtered = filterProducts();
    const total    = filtered.length;
    const pages    = Math.ceil(total / CATALOGUE.PAGE_SIZE);
    CATALOGUE._page = Math.max(1, Math.min(CATALOGUE._page, pages || 1));

    const start = (CATALOGUE._page - 1) * CATALOGUE.PAGE_SIZE;
    const end   = Math.min(start + CATALOGUE.PAGE_SIZE, total);
    const page  = filtered.slice(start, end);

    // Clear grid safely
    while (grid.firstChild) grid.removeChild(grid.firstChild);

    // Update count display
    const countEl = document.getElementById('catalogue-count');
    if (countEl) {
        countEl.textContent = total + ' fragrance' + (total !== 1 ? 's' : '');
    }

    if (total === 0) {
        const empty = document.createElement('div');
        empty.className = 'catalogue-empty';
        const msg = document.createElement('p');
        msg.textContent = 'No fragrances found. Try adjusting your search or filters.';
        empty.appendChild(msg);
        const btn = document.createElement('button');
        btn.className = 'btn btn-outline-gold';
        btn.textContent = 'Clear Filters';
        btn.addEventListener('click', () => {
            const clearBtn = document.getElementById('filter-clear-btn');
            if (clearBtn) clearBtn.click();
        });
        empty.appendChild(btn);
        grid.appendChild(empty);
        renderPagination(0, 0);
        return;
    }

    const fragment = document.createDocumentFragment();
    const forcedType = CATALOGUE._forcedType || null;
    page.forEach((p, idx) => fragment.appendChild(buildProductCard(p, idx, forcedType)));
    grid.appendChild(fragment);

    // Re-apply tilt to new cards
    initCardTilt();
    // Re-observe new cards for scroll reveal
    document.querySelectorAll('.product-card.reveal:not(.visible)').forEach(el => {
        el.classList.add('visible'); // immediately visible since they may be in view
    });

    renderPagination(CATALOGUE._page, pages);
}

function renderPagination(currentPage, totalPages) {
    const pag = document.getElementById('pagination');
    if (!pag) return;
    while (pag.firstChild) pag.removeChild(pag.firstChild);
    if (totalPages <= 1) return;

    const prev = document.createElement('button');
    prev.className = 'pagination-btn';
    prev.textContent = '← Prev';
    prev.disabled = currentPage === 1;
    prev.setAttribute('aria-label', 'Previous page');
    prev.addEventListener('click', () => {
        CATALOGUE._page--;
        renderGrid();
        document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
    });
    pag.appendChild(prev);

    const info = document.createElement('span');
    info.className = 'pagination-info';
    info.textContent = 'Page ' + currentPage + ' of ' + totalPages;
    pag.appendChild(info);

    const next = document.createElement('button');
    next.className = 'pagination-btn';
    next.textContent = 'Next →';
    next.disabled = currentPage === totalPages;
    next.setAttribute('aria-label', 'Next page');
    next.addEventListener('click', () => {
        CATALOGUE._page++;
        renderGrid();
        document.getElementById('collection').scrollIntoView({ behavior: 'smooth' });
    });
    pag.appendChild(next);
}

/* ==========================================================================
   PRODUCT CARD — built from catalog, no unsafe HTML
   ========================================================================== */
function buildProductCard(product, index, forcedType) {
    const delayClass = ['', 'delay-1', 'delay-2', 'delay-3'][index % 4];

    const article = document.createElement('article');
    article.className = 'product-card reveal ' + delayClass;
    article.setAttribute('data-id',       product.id);
    article.setAttribute('data-category', product.category || '');
    article.setAttribute('tabindex',      '0');
    article.setAttribute('role',          'button');
    article.setAttribute('aria-label',    'View details for ' + product.name);

    /* ---- Determine initial state ---- */
    const types    = getProductTypes(product);
    // If a category forces a specific type and this product has that type, use it.
    // Otherwise fall back to the first available type.
    const resolvedType = (forcedType && types.indexOf(forcedType) !== -1) ? forcedType : (types[0] || 'attar');
    let selType    = resolvedType;
    let selVariants = getVariantsForType(product, selType);
    let selKey     = selVariants.length ? selVariants[0].key : firstSize(product);
    let selVariant = product.sizes[selKey];

    /* ---- Image area (fixed height container) ---- */
    const imgContainer = document.createElement('div');
    imgContainer.className = 'product-img-container';

    const qvBtn = document.createElement('button');
    qvBtn.className = 'quick-view-btn';
    qvBtn.setAttribute('aria-label', 'Quick view ' + product.name);
    qvBtn.appendChild(buildIcon('eye'));
    imgContainer.appendChild(qvBtn);

    const bottleImg = document.createElement('img');
    bottleImg.className = 'product-img-bottle';
    bottleImg.alt = product.name;

    function _updateImage() {
        bottleImg.src = getBottleImage(selType, selKey);
    }
    _updateImage();
    imgContainer.appendChild(bottleImg);

    /* ---- Body ---- */
    const body = document.createElement('div');
    body.className = 'product-body';

    const catEl = document.createElement('p');
    catEl.className = 'product-cat';
    // Use the most specific active filter label available.
    // Subcategory > parent category > product's own category slug label.
    const displayCategoryLabel = (function() {
        const catMap = (typeof CATEGORIES !== 'undefined') ? CATEGORIES : {};
        const subcat = CATALOGUE._subcategory;
        const cat    = CATALOGUE._category;
        if (subcat && subcat !== 'all' && catMap[subcat]) return catMap[subcat];
        if (cat === 'body-care')  return 'Body Creams / Solid Perfumes';
        if (cat === 'attars')     return 'Attars';
        if (cat === 'perfumes')   return 'Perfumes';
        return catMap[product.category] || product.category || '';
    }());
    catEl.textContent = displayCategoryLabel;
    body.appendChild(catEl);

    const nameEl = document.createElement('h3');
    nameEl.className = 'product-name';
    nameEl.textContent = product.name;
    body.appendChild(nameEl);

    /* ---- Type selector ---- */
    if (types.length > 1) {
        const typeLabel = document.createElement('p');
        typeLabel.className = 'variant-label';
        typeLabel.textContent = 'Type:';
        body.appendChild(typeLabel);

        const typeRow = document.createElement('div');
        typeRow.className = 'card-type-selector';

        const TYPE_LABELS = { attar: 'Attar', perfume: 'Perfume', solid: 'Solid' };

        types.forEach(t => {
            const btn = document.createElement('button');
            btn.className = 'type-chip' + (t === selType ? ' active' : '');
            btn.dataset.type = t;
            btn.textContent = TYPE_LABELS[t] || t;
            btn.setAttribute('aria-label', 'Select ' + (TYPE_LABELS[t] || t));
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                selType     = t;
                selVariants = getVariantsForType(product, selType);
                selKey      = selVariants.length ? selVariants[0].key : selKey;
                selVariant  = product.sizes[selKey];
                // Update active type button
                typeRow.querySelectorAll('.type-chip').forEach(c =>
                    c.classList.toggle('active', c.dataset.type === t)
                );
                _rebuildSizeRow();
                _updateImage();
                _updatePrice();
            });
            typeRow.appendChild(btn);
        });
        body.appendChild(typeRow);
    }

    /* ---- Size selector ---- */
    const sizeLabelEl = document.createElement('p');
    sizeLabelEl.className = 'variant-label';
    sizeLabelEl.textContent = 'Size:';
    body.appendChild(sizeLabelEl);

    const sizeRow = document.createElement('div');
    sizeRow.className = 'card-size-selector';
    body.appendChild(sizeRow);

    function _rebuildSizeRow() {
        while (sizeRow.firstChild) sizeRow.removeChild(sizeRow.firstChild);
        const variants = getVariantsForType(product, selType);
        variants.forEach(v => {
            const btn = document.createElement('button');
            btn.className = 'size-chip' + (v.key === selKey ? ' active' : '');
            btn.textContent = v.label;
            btn.setAttribute('aria-label', 'Select size ' + v.label);
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                selKey     = v.key;
                selVariant = product.sizes[selKey];
                sizeRow.querySelectorAll('.size-chip').forEach(sc =>
                    sc.classList.toggle('active', sc.textContent === v.label)
                );
                _updateImage();
                _updatePrice();
            });
            sizeRow.appendChild(btn);
        });
    }
    _rebuildSizeRow();

    /* ---- Price ---- */
    const footer = document.createElement('div');
    footer.className = 'product-footer';

    const priceWrap = document.createElement('div');
    priceWrap.className = 'product-price';

    const priceAmt = document.createElement('span');
    priceAmt.className = 'product-price-amount';
    priceWrap.appendChild(priceAmt);
    footer.appendChild(priceWrap);

    function _updatePrice() {
        priceAmt.textContent = selVariant ? formatINR(selVariant.price) : '';
    }
    _updatePrice();

    /* ---- Quantity selector ---- */
    let cardQty = 1;
    const qtyRow = document.createElement('div');
    qtyRow.className = 'card-qty-row';

    const qtyDec = document.createElement('button');
    qtyDec.className = 'card-qty-btn';
    qtyDec.textContent = '−';
    qtyDec.setAttribute('aria-label', 'Decrease quantity');

    const qtyNum = document.createElement('span');
    qtyNum.className = 'card-qty-num';
    qtyNum.textContent = '1';

    const qtyInc = document.createElement('button');
    qtyInc.className = 'card-qty-btn';
    qtyInc.textContent = '+';
    qtyInc.setAttribute('aria-label', 'Increase quantity');

    qtyDec.addEventListener('click', (e) => {
        e.stopPropagation();
        if (cardQty > 1) { cardQty--; qtyNum.textContent = String(cardQty); }
    });
    qtyInc.addEventListener('click', (e) => {
        e.stopPropagation();
        if (cardQty < 99) { cardQty++; qtyNum.textContent = String(cardQty); }
    });

    qtyRow.appendChild(qtyDec);
    qtyRow.appendChild(qtyNum);
    qtyRow.appendChild(qtyInc);
    footer.appendChild(qtyRow);

    /* ---- Add to Cart ---- */
    const addBtn = document.createElement('button');
    addBtn.className = 'product-add-btn';
    addBtn.textContent = 'Add to Cart';
    addBtn.setAttribute('aria-label', 'Add ' + product.name + ' to cart');
    footer.appendChild(addBtn);

    body.appendChild(footer);
    article.appendChild(imgContainer);
    article.appendChild(body);

    /* ---- Events ---- */
    article.addEventListener('click', (e) => {
        if (e.target.closest('.product-add-btn') ||
            e.target.closest('.size-chip') ||
            e.target.closest('.type-chip') ||
            e.target.closest('.card-qty-btn') ||
            e.target.closest('.quick-view-btn')) return;
        openProductModal(product.id, selKey);
    });
    article.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') &&
            !e.target.closest('.product-add-btn') &&
            !e.target.closest('.quick-view-btn') &&
            !e.target.closest('.size-chip') &&
            !e.target.closest('.card-qty-btn') &&
            !e.target.closest('.type-chip')) {
            e.preventDefault();
            openProductModal(product.id, selKey);
        }
    });
    addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        for (let i = 0; i < cardQty; i++) Cart.add(product.id, selKey);
        showToast(cardQty + '× ' + product.name + ' (' + formatSizeKey(selKey) + ') added to cart.');
        cardQty = 1;
        qtyNum.textContent = '1';
    });
    qvBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openProductModal(product.id, selKey);
    });

    return article;
}

/* ==========================================================================
   3D CARD TILT (desktop only)
   ========================================================================== */
function initCardTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.product-card:not([data-tilt])').forEach(card => {
        card.setAttribute('data-tilt', '1');
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width  - 0.5;
            const y = (e.clientY - rect.top)  / rect.height - 0.5;
            card.style.transform =
                `perspective(1200px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateZ(6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

/* ==========================================================================
   PRODUCT DETAIL MODAL
   ========================================================================== */
function initProductModal() {
    const backdrop = document.getElementById('product-modal');
    const closeBtn = document.getElementById('modal-close');
    if (!backdrop) return;

    closeBtn.addEventListener('click', closeProductModal);
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeProductModal();
    });
    backdrop.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeProductModal();
    });
}

let _modalQty  = 1;
let _modalSize = '';
let _modalType = '';

function openProductModal(productId, preferredSize) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    _modalQty  = 1;
    _modalSize = (preferredSize && product.sizes && product.sizes[preferredSize])
                    ? preferredSize
                    : firstSize(product);
    _modalType = _modalSize ? _modalSize.split(':')[0] : firstType(product);

    const backdrop = document.getElementById('product-modal');
    const imgEl    = document.getElementById('modal-img');
    const nameEl   = document.getElementById('modal-name');
    const concEl   = document.getElementById('modal-conc');
    const tagEl    = document.getElementById('modal-tagline');
    const descEl   = document.getElementById('modal-desc');
    const priceEl  = document.getElementById('modal-price');
    const qtyNumEl = document.getElementById('modal-qty-num');

    // Populate basic fields
    imgEl.alt = product.name;

    nameEl.textContent  = product.name;
    concEl.textContent  = (typeof CATEGORIES !== 'undefined' && CATEGORIES[product.category])
        ? CATEGORIES[product.category]
        : (product.category || '');
    tagEl.textContent   = product.description ? (product.description.split('.')[0] + '.') : '';
    descEl.textContent  = product.description || '';
    qtyNumEl.textContent = '1';

    // Update bottle image (called whenever type/size changes)
    function _modalUpdateImage() {
        imgEl.src = getBottleImage(_modalType, _modalSize);
    }
    _modalUpdateImage();

    // Notes chips
    const notesRow = document.getElementById('modal-notes-row');
    if (notesRow) {
        while (notesRow.firstChild) notesRow.removeChild(notesRow.firstChild);
        (product.notes || []).forEach(note => {
            const chip = document.createElement('span');
            chip.className = 'note-chip';
            chip.textContent = note;
            notesRow.appendChild(chip);
        });
    }

    // Update price display
    function _modalUpdatePrice() {
        if (priceEl) {
            const v = product.sizes[_modalSize];
            priceEl.textContent = v ? formatINR(v.price) : '';
        }
        const mrpEl = document.getElementById('modal-price-mrp');
        if (mrpEl) mrpEl.style.display = 'none';
    }
    _modalUpdatePrice();

    // Type selector in modal (reuse / rebuild modal-size-container area)
    const sizeContainer = document.getElementById('modal-size-container');
    if (sizeContainer) {
        while (sizeContainer.firstChild) sizeContainer.removeChild(sizeContainer.firstChild);
        sizeContainer.style.display = '';

        const types = getProductTypes(product);
        const TYPE_LABELS = { attar: 'Attar', perfume: 'Perfume', solid: 'Solid' };

        // Type selector row
        if (types.length > 1) {
            const typeLabel = document.createElement('p');
            typeLabel.className = 'variant-label';
            typeLabel.textContent = 'Type:';
            sizeContainer.appendChild(typeLabel);

            const typeRow = document.createElement('div');
            typeRow.className = 'card-type-selector';

            types.forEach(t => {
                const btn = document.createElement('button');
                btn.className = 'type-chip' + (t === _modalType ? ' active' : '');
                btn.dataset.type = t;
                btn.textContent = TYPE_LABELS[t] || t;
                btn.addEventListener('click', () => {
                    _modalType = t;
                    const variants = getVariantsForType(product, _modalType);
                    _modalSize = variants.length ? variants[0].key : _modalSize;
                    typeRow.querySelectorAll('.type-chip').forEach(c =>
                        c.classList.toggle('active', c.textContent === (TYPE_LABELS[t] || t))
                    );
                    _rebuildModalSizeRow();
                    _modalUpdateImage();
                    _modalUpdatePrice();
                });
                typeRow.appendChild(btn);
            });
            sizeContainer.appendChild(typeRow);
        }

        // Size selector row
        const sizeLabel = document.createElement('p');
        sizeLabel.className = 'variant-label';
        sizeLabel.textContent = 'Size:';
        sizeContainer.appendChild(sizeLabel);

        const modalSizeRow = document.createElement('div');
        modalSizeRow.className = 'card-size-selector';
        sizeContainer.appendChild(modalSizeRow);

        function _rebuildModalSizeRow() {
            while (modalSizeRow.firstChild) modalSizeRow.removeChild(modalSizeRow.firstChild);
            const variants = getVariantsForType(product, _modalType);
            variants.forEach(v => {
                const btn = document.createElement('button');
                btn.className = 'size-chip' + (v.key === _modalSize ? ' active' : '');
                btn.textContent = v.label + ' — ' + formatINR(v.price);
                btn.setAttribute('aria-label', 'Select ' + v.label);
                btn.addEventListener('click', () => {
                    _modalSize = v.key;
                    modalSizeRow.querySelectorAll('.size-chip').forEach(sc =>
                        sc.classList.toggle('active', sc.textContent.startsWith(v.label))
                    );
                    _modalUpdateImage();
                    _modalUpdatePrice();
                });
                modalSizeRow.appendChild(btn);
            });
        }
        _rebuildModalSizeRow();
    }

    // Qty buttons
    const qtyDecBtn = document.getElementById('modal-qty-dec');
    const qtyIncBtn = document.getElementById('modal-qty-inc');
    const newDec = qtyDecBtn.cloneNode(true);
    const newInc = qtyIncBtn.cloneNode(true);
    qtyDecBtn.replaceWith(newDec);
    qtyIncBtn.replaceWith(newInc);
    newDec.addEventListener('click', () => {
        if (_modalQty > 1) { _modalQty--; qtyNumEl.textContent = String(_modalQty); }
    });
    newInc.addEventListener('click', () => {
        if (_modalQty < 99) { _modalQty++; qtyNumEl.textContent = String(_modalQty); }
    });

    // Action buttons
    const addBtn   = document.getElementById('modal-add-btn');
    const orderBtn = document.getElementById('modal-order-btn');
    const newAdd   = addBtn.cloneNode(true);
    const newOrder = orderBtn.cloneNode(true);
    addBtn.replaceWith(newAdd);
    orderBtn.replaceWith(newOrder);

    newOrder.style.display = '';
    newAdd.addEventListener('click', () => {
        for (let i = 0; i < _modalQty; i++) Cart.add(product.id, _modalSize);
        showToast(_modalQty + '× ' + product.name + ' (' + formatSizeKey(_modalSize) + ') added to cart.');
        closeProductModal();
        openCartDrawer();
    });
    newOrder.addEventListener('click', () => {
        for (let i = 0; i < _modalQty; i++) Cart.add(product.id, _modalSize);
        closeProductModal();
        openCartDrawer();
    });

    // Disclaimer
    const discEl = document.getElementById('modal-disclaimer');
    if (discEl) {
        discEl.style.display = 'none';
    }

    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    nameEl.focus();
}

function closeProductModal() {
    const backdrop = document.getElementById('product-modal');
    if (!backdrop) return;
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/* ==========================================================================
   CART DRAWER
   ========================================================================== */
function initCartDrawer() {
    const cartBtn   = document.getElementById('cart-btn');
    const overlay   = document.getElementById('cart-overlay');
    const closeBtn  = document.getElementById('cart-close');
    const shopBtn   = document.getElementById('cart-shop-btn');
    const clearBtn  = document.getElementById('cart-clear-btn');
    const orderBtn  = document.getElementById('cart-order-btn');
    const drawer    = document.getElementById('cart-drawer');

    if (cartBtn)  cartBtn.addEventListener('click', openCartDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
    if (overlay)  overlay.addEventListener('click', closeCartDrawer);
    if (shopBtn)  shopBtn.addEventListener('click', closeCartDrawer);

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            Cart.clear();
            showToast('Cart cleared.');
        });
    }

    if (orderBtn) {
        orderBtn.addEventListener('click', () => {
            if (Cart.getTotalQty() === 0) {
                showToast('Your cart is empty. Add a fragrance first.');
                return;
            }
            // Close cart drawer then open checkout flow
            closeCartDrawer();
            if (typeof Checkout !== 'undefined') {
                Checkout.openCheckout();
            } else {
                // Fallback: direct WhatsApp (should not happen in normal flow)
                const opened = WhatsApp.openOrder();
                if (opened) showToast('Opening WhatsApp with your order...');
            }
        });
    }

    if (drawer) {
        drawer.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeCartDrawer();
        });
    }
}

function openCartDrawer() {
    const drawer  = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!drawer) return;
    renderCartContents();
    drawer.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    const closeBtn = drawer.querySelector('.cart-close');
    if (closeBtn) closeBtn.focus();
}

function closeCartDrawer() {
    const drawer  = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!drawer) return;
    drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function renderCartContents() {
    const body   = document.getElementById('cart-body');
    const footer = document.getElementById('cart-foot');
    if (!body) return;

    const items = Cart.getItems();
    const total = Cart.getTotal();

    while (body.firstChild) body.removeChild(body.firstChild);

    if (items.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'cart-empty';
        emptyDiv.appendChild(buildIcon('flask', 'icon-2xl'));

        const emptyTitle = document.createElement('p');
        emptyTitle.className = 'cart-empty-title';
        emptyTitle.textContent = 'Your fragrance collection is waiting.';
        emptyDiv.appendChild(emptyTitle);

        const emptySub = document.createElement('p');
        emptySub.className = 'cart-empty-sub';
        emptySub.textContent = 'Explore our collection and find your signature scent.';
        emptyDiv.appendChild(emptySub);

        const shopBtn = document.createElement('button');
        shopBtn.className = 'btn btn-outline-gold';
        shopBtn.textContent = 'Explore Perfumes';
        shopBtn.addEventListener('click', closeCartDrawer);
        emptyDiv.appendChild(shopBtn);

        body.appendChild(emptyDiv);
        if (footer) footer.style.display = 'none';
        return;
    }

    if (footer) footer.style.display = '';

    items.forEach(({ product, size, qty, unitPrice, lineTotal }) => {
        const row = document.createElement('div');
        row.className = 'cart-item';

        // Thumbnail — show the exact bottle for the selected size
        const thumbWrap = document.createElement('div');
        thumbWrap.className = 'cart-item-img-wrap';
        const thumbImg = document.createElement('img');
        thumbImg.className = 'product-img-bottle cart-item-img';
        thumbImg.alt = product.name;
        thumbImg.src = getBottleImage(size);
        thumbWrap.appendChild(thumbImg);
        row.appendChild(thumbWrap);

        // Info
        const info = document.createElement('div');
        info.className = 'cart-item-info';

        const itemCat = document.createElement('p');
        itemCat.className = 'cart-item-size'; // muted style
        itemCat.textContent = (typeof CATEGORIES !== 'undefined' && CATEGORIES[product.category])
            ? CATEGORIES[product.category]
            : (product.category || '');
        info.appendChild(itemCat);

        const itemName = document.createElement('p');
        itemName.className = 'cart-item-name';
        itemName.textContent = product.name;
        info.appendChild(itemName);

        const itemDetails = document.createElement('p');
        itemDetails.className = 'cart-item-size';
        itemDetails.textContent = formatSizeKey(size) + ' · ' + formatINR(unitPrice) + ' each';
        info.appendChild(itemDetails);

        // Qty controls
        const controls = document.createElement('div');
        controls.className = 'cart-item-controls';

        const qtyWrap = document.createElement('div');
        qtyWrap.className = 'cart-item-qty';

        const decBtn = document.createElement('button');
        decBtn.className = 'cart-qty-btn';
        decBtn.setAttribute('aria-label', 'Decrease qty for ' + product.name);
        decBtn.appendChild(buildIcon('minus', 'icon-sm'));
        decBtn.addEventListener('click', () => {
            Cart.setQuantity(product.id, size, qty - 1);
            renderCartContents();
        });

        const qtyNum = document.createElement('span');
        qtyNum.className = 'cart-qty-num';
        qtyNum.textContent = String(qty);

        const incBtn = document.createElement('button');
        incBtn.className = 'cart-qty-btn';
        incBtn.setAttribute('aria-label', 'Increase qty for ' + product.name);
        incBtn.appendChild(buildIcon('plus', 'icon-sm'));
        incBtn.addEventListener('click', () => {
            Cart.setQuantity(product.id, size, qty + 1);
            renderCartContents();
        });

        qtyWrap.appendChild(decBtn);
        qtyWrap.appendChild(qtyNum);
        qtyWrap.appendChild(incBtn);

        const lineEl = document.createElement('span');
        lineEl.className = 'cart-item-line-total';
        lineEl.textContent = formatINR(lineTotal);

        controls.appendChild(qtyWrap);
        controls.appendChild(lineEl);
        info.appendChild(controls);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'cart-item-remove';
        removeBtn.textContent = 'Remove';
        removeBtn.setAttribute('aria-label', 'Remove ' + product.name + ' from cart');
        removeBtn.addEventListener('click', () => {
            Cart.remove(product.id, size);
            renderCartContents();
            showToast(product.name + ' removed from cart.');
        });
        info.appendChild(removeBtn);

        row.appendChild(info);
        body.appendChild(row);
    });

    const totalEl = document.getElementById('cart-total-amount');
    if (totalEl) totalEl.textContent = formatINR(total);

    // Delivery charge row + grand total row in cart footer
    if (typeof Checkout !== 'undefined') {
        const delivery      = Checkout.calcDelivery(total);
        const grandTotal    = total + delivery;
        const isFree        = delivery === 0;

        const deliveryRow   = document.getElementById('cart-delivery-row');
        const deliveryAmt   = document.getElementById('cart-delivery-amount');
        const grandRow      = document.getElementById('cart-grand-total-row');
        const grandAmt      = document.getElementById('cart-grand-total-amount');

        if (deliveryRow) deliveryRow.style.display = '';
        if (deliveryAmt) {
            deliveryAmt.textContent = isFree ? 'FREE' : formatINR(delivery);
            deliveryAmt.className   = 'cart-total-amount cart-delivery-amount' + (isFree ? ' cart-delivery-free' : '');
        }
        if (grandRow)  grandRow.style.display  = '';
        if (grandAmt)  grandAmt.textContent    = formatINR(grandTotal);

        // Free-delivery progress banner — updates live on every cart change
        const bannerEl = document.getElementById('cart-delivery-banner');
        if (bannerEl) {
            const msg = Checkout.deliveryMessage(total);
            bannerEl.textContent = msg;
            bannerEl.className   = 'cart-delivery-banner' + (isFree ? ' is-free' : '');
        }
    }
}

/* ==========================================================================
   CART COUNT INDICATORS
   ========================================================================== */
function updateAllCartIndicators() {
    const qty   = Cart.getTotalQty();
    const total = Cart.getTotal();

    const countEl = document.getElementById('cart-count');
    if (countEl) {
        countEl.textContent = String(qty);
        countEl.classList.toggle('visible', qty > 0);
    }

    const drawerCountEl = document.getElementById('cart-drawer-count');
    if (drawerCountEl) drawerCountEl.textContent = String(qty);

    const drawer = document.getElementById('cart-drawer');
    if (drawer && drawer.classList.contains('open')) renderCartContents();

    updateStickyBar(qty, total);
}

/* ==========================================================================
   MOBILE STICKY ORDER BAR
   ========================================================================== */
function initStickyOrderBar() {
    const viewBtn = document.getElementById('sticky-view-cart-btn');
    if (viewBtn) viewBtn.addEventListener('click', openCartDrawer);
}

function updateStickyBar(qty, total) {
    const bar     = document.getElementById('sticky-order-bar');
    const countEl = document.getElementById('sticky-count');
    const totalEl = document.getElementById('sticky-total');
    if (!bar) return;
    bar.classList.toggle('visible', qty > 0);
    if (countEl) countEl.textContent = qty;
    if (totalEl) totalEl.textContent = formatINR(total);
}

/* ==========================================================================
   FLOATING WHATSAPP BUTTON
   ========================================================================== */
function initFloatingWhatsApp() {
    if (typeof BUSINESS === 'undefined') return;
    const number = String(BUSINESS.whatsapp).replace(/\D/g, '');
    const msg    = encodeURIComponent('Hello ' + BUSINESS.name + ', I would like to know more about your fragrances.');
    const url    = 'https://wa.me/' + number + '?text=' + msg;
    const btn    = document.getElementById('float-whatsapp');
    if (btn) btn.href = url;
}

/* ==========================================================================
   SOCIAL / BUSINESS INFO
   ========================================================================== */
function initSocialSection() {
    if (typeof BUSINESS === 'undefined') return;

    const number = String(BUSINESS.whatsapp).replace(/\D/g, '');
    const waMsg  = encodeURIComponent('Hello ' + BUSINESS.name + ', I would like to inquire about your fragrances.');

    document.querySelectorAll('[data-ig-link]').forEach(el => {
        if (el.tagName === 'A') el.href = BUSINESS.instagram;
    });
    document.querySelectorAll('[data-yt-link]').forEach(el => {
        if (el.tagName === 'A') el.href = BUSINESS.youtube;
    });
    document.querySelectorAll('[data-maps-link]').forEach(el => {
        if (el.tagName === 'A') el.href = BUSINESS.maps;
    });
    document.querySelectorAll('[data-tel-link]').forEach(el => {
        if (el.tagName === 'A') el.href = 'tel:' + BUSINESS.phone;
    });
    document.querySelectorAll('[data-address]').forEach(el => { el.textContent = BUSINESS.address; });
    document.querySelectorAll('[data-hours]').forEach(el => { el.textContent = BUSINESS.hours; });
    document.querySelectorAll('[data-hours-sun]').forEach(el => { el.textContent = BUSINESS.hoursSunday; });
    document.querySelectorAll('[data-phone]').forEach(el => { el.textContent = BUSINESS.phoneDisplay; });
    document.querySelectorAll('[data-address-short]').forEach(el => { el.textContent = BUSINESS.city; });
}

/* ==========================================================================
   ANNOUNCE BAR
   ========================================================================== */
function initAnnounceBar() {
    const el = document.getElementById('announce-text');
    if (el && typeof BUSINESS !== 'undefined') el.textContent = BUSINESS.offer;
}

/* ==========================================================================
   STICKY HEADER + SCROLL SPY
   ========================================================================== */
function initHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    if (sections.length && navLinks.length) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    const link = document.querySelector('.nav-link[data-section="' + entry.target.id + '"]');
                    if (link) link.classList.add('active');
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px' });
        sections.forEach(s => spy.observe(s));
    }
}

/* ==========================================================================
   MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileDrawer() {
    const drawer      = document.getElementById('mobile-drawer');
    const overlay     = document.getElementById('drawer-overlay');
    const openBtn     = document.getElementById('hamburger-btn');
    const closeBtn    = document.getElementById('drawer-close');
    const drawerLinks = document.querySelectorAll('.drawer-nav-link');
    if (!drawer) return;

    function openDrawer() {
        drawer.classList.add('open');
        if (overlay) overlay.classList.add('active');
        openBtn.setAttribute('aria-expanded', 'true');
        if (closeBtn) closeBtn.focus();
    }
    function closeDrawer() {
        drawer.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        openBtn.setAttribute('aria-expanded', 'false');
        openBtn.focus();
    }

    openBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);
    drawerLinks.forEach(l => l.addEventListener('click', closeDrawer));
    drawer.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
}

/* ==========================================================================
   HERO CANVAS — lightweight particle & smoke
   ========================================================================== */
function initHeroCanvas() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = canvas.width  = canvas.parentElement.offsetWidth;
    let H = canvas.height = canvas.parentElement.offsetHeight;

    window.addEventListener('resize', () => {
        W = canvas.width  = canvas.parentElement.offsetWidth;
        H = canvas.height = canvas.parentElement.offsetHeight;
        stars.forEach(s => s.reset());
    }, { passive: true });

    /* ── Sand grain — drifts horizontally across dune area ── */
    class SandGrain {
        constructor() { this.reset(true); }
        reset(initial) {
            // Start off left edge (or random position on init)
            this.x   = initial ? Math.random() * W : -4;
            this.y   = H * 0.62 + Math.random() * H * 0.38; // lower 38% = dune zone
            this.sz  = Math.random() * 2.2 + 0.4;
            this.vx  = Math.random() * 1.1 + 0.35;          // blowing right
            this.vy  = (Math.random() - 0.5) * 0.18;        // slight vertical drift
            this.op  = Math.random() * 0.38 + 0.06;
            // warm sand colour: amber/gold range
            const r  = 190 + Math.floor(Math.random() * 40);
            const g  = 120 + Math.floor(Math.random() * 50);
            const b  = 20  + Math.floor(Math.random() * 30);
            this.col = `${r},${g},${b}`;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x > W + 6) this.reset(false);
        }
        draw() {
            ctx.fillStyle = `rgba(${this.col},${this.op})`;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.sz, this.sz * 0.5, 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /* ── Sand wisp — a soft blowing streak of fine sand ── */
    class SandWisp {
        constructor() { this.reset(true); }
        reset(initial) {
            this.x   = initial ? Math.random() * W : -30;
            this.y   = H * 0.55 + Math.random() * H * 0.3;
            this.len = Math.random() * 55 + 20;
            this.vx  = Math.random() * 0.9 + 0.5;
            this.a   = Math.random() * 0.07 + 0.02;
            this.w   = Math.random() * 1.8 + 0.5;
        }
        update() {
            this.x += this.vx;
            if (this.x > W + this.len) this.reset(false);
        }
        draw() {
            const g = ctx.createLinearGradient(this.x, this.y, this.x + this.len, this.y);
            g.addColorStop(0,   `rgba(212,168,55,0)`);
            g.addColorStop(0.3, `rgba(212,168,55,${this.a})`);
            g.addColorStop(0.7, `rgba(212,168,55,${this.a * 0.6})`);
            g.addColorStop(1,   `rgba(212,168,55,0)`);
            ctx.strokeStyle = g;
            ctx.lineWidth   = this.w;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.len, this.y + (Math.random() - 0.5) * 3);
            ctx.stroke();
        }
    }

    /* ── Twinkling star — subtle pulse in the upper sky zone ── */
    class StarTwinkle {
        constructor() { this.reset(); }
        reset() {
            this.x    = Math.random() * W;
            this.y    = Math.random() * H * 0.48;   // sky zone only
            this.r    = Math.random() * 1.4 + 0.4;
            this.op   = Math.random() * 0.5 + 0.1;
            this.dop  = (Math.random() * 0.006 + 0.002) * (Math.random() < 0.5 ? 1 : -1);
            this.minO = 0.05;
            this.maxO = 0.72;
        }
        update() {
            this.op += this.dop;
            if (this.op >= this.maxO || this.op <= this.minO) this.dop *= -1;
        }
        draw() {
            ctx.fillStyle = `rgba(247,228,160,${this.op})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /* ── Embers / incense sparks — rise slowly from lower centre ── */
    class Ember {
        constructor() { this.reset(true); }
        reset(initial) {
            this.x   = W * 0.35 + (Math.random() - 0.5) * W * 0.25;
            this.y   = initial ? Math.random() * H : H + 10;
            this.r   = Math.random() * 1.5 + 0.4;
            this.vx  = (Math.random() - 0.5) * 0.35;
            this.vy  = -(Math.random() * 0.55 + 0.2);
            this.a   = Math.random() * 0.5 + 0.1;
            this.da  = 0.0012 + Math.random() * 0.001;
        }
        update() {
            this.x  += this.vx + Math.sin(this.y * 0.04) * 0.18;
            this.y  += this.vy;
            this.a  -= this.da;
            if (this.a <= 0 || this.y < H * 0.1) this.reset(false);
        }
        draw() {
            const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3);
            g.addColorStop(0,   `rgba(255,200,80,${this.a})`);
            g.addColorStop(0.5, `rgba(212,140,30,${this.a * 0.4})`);
            g.addColorStop(1,   `rgba(212,100,10,0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const grains = Array.from({ length: 80 },  () => new SandGrain());
    const wisps  = Array.from({ length: 18 },  () => new SandWisp());
    const stars  = Array.from({ length: 55 },  () => new StarTwinkle());
    const embers = Array.from({ length: 18 },  () => new Ember());

    function frame() {
        ctx.clearRect(0, 0, W, H);
        stars.forEach(s  => { s.update(); s.draw(); });
        wisps.forEach(w  => { w.update(); w.draw(); });
        grains.forEach(g => { g.update(); g.draw(); });
        embers.forEach(e => { e.update(); e.draw(); });
        requestAnimationFrame(frame);
    }
    frame();
}

/* ==========================================================================
   SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ==========================================================================
   HERO CART BUTTON
   ========================================================================== */
function initHeroCartBtn() {
    const btn = document.getElementById('hero-cart-btn');
    if (btn) btn.addEventListener('click', openCartDrawer);
}

/* ==========================================================================
   NAV WHATSAPP BUTTON
   ========================================================================== */
function initNavWhatsApp() {
    if (typeof BUSINESS === 'undefined') return;
    const number = String(BUSINESS.whatsapp).replace(/\D/g, '');
    const msg    = encodeURIComponent('Hello ' + BUSINESS.name + ', I would like to order fragrances.');
    const url    = 'https://wa.me/' + number + '?text=' + msg;
    const navBtn = document.getElementById('nav-whatsapp-btn');
    const annBtn = document.getElementById('float-whatsapp-announce');
    if (navBtn) navBtn.href = url;
    if (annBtn) annBtn.href = url;
}

/* ==========================================================================
   PRICING CARDS — wire "Shop X" CTAs to filter the catalogue section
   ========================================================================== */
function initPricingCards() {
    // data-filter-collection — jump to a specific parent category
    // Values: 'attars' | 'perfumes' | 'body-care'  (or legacy subcategory slugs)
    document.querySelectorAll('[data-filter-collection]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const col = el.getAttribute('data-filter-collection');
            if (!col) return;

            // Map legacy subcategory slugs to their parent group
            const PARENT_MAP = {
                'french-attars': 'attars', 'arabic-attars': 'attars',
                'floral-attars': 'attars', 'french-arabic-mix-attars': 'attars',
                'french-perfumes': 'perfumes', 'arabic-perfumes': 'perfumes',
                'floral-perfumes': 'perfumes', 'french-arabic-mix-perfumes': 'perfumes',
                'body-creams-solid-perfumes': 'body-care',
                'attars': 'attars', 'perfumes': 'perfumes', 'body-care': 'body-care'
            };
            const parent = PARENT_MAP[col] || 'all';
            const subcat = (parent !== col && col !== parent) ? col : 'all';

            CATALOGUE._category    = parent;
            CATALOGUE._subcategory = subcat;
            CATALOGUE._forcedType  = _deriveForcedType();
            CATALOGUE._page        = 1;
            renderGrid();

            const catSel = document.getElementById('filter-category');
            if (catSel) catSel.value = parent;
            _rebuildSubcategoryDropdown(parent);
            const subSel = document.getElementById('filter-subcategory');
            if (subSel) subSel.value = subcat;

            const section = document.getElementById('collection');
            if (section) section.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // data-filter-type — force a specific product type on all visible cards
    document.querySelectorAll('[data-filter-type]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const type = el.getAttribute('data-filter-type');
            if (!type) return;

            CATALOGUE._category    = 'all';
            CATALOGUE._subcategory = 'all';
            CATALOGUE._forcedType  = null;
            CATALOGUE._page        = 1;
            renderGrid();

            const catSel = document.getElementById('filter-category');
            if (catSel) catSel.value = 'all';
            _rebuildSubcategoryDropdown('all');

            const section = document.getElementById('collection');
            if (section) section.scrollIntoView({ behavior: 'smooth' });

            requestAnimationFrame(() => {
                document.querySelectorAll('.type-chip[data-type="' + type + '"]').forEach(chip => {
                    if (!chip.classList.contains('active')) chip.click();
                });
            });
        });
    });
}

/* ==========================================================================
   SCENT FINDER QUIZ — Full Implementation
   5 questions → weighted note scoring → top 3 product recommendations
   Triggered by: #open-quiz-btn (index-new.html) or #openQuizBtn (index.html)
   Modal: #quiz-modal with #quiz-steps-container and #quiz-results-container
   ========================================================================== */

/* ---- Quiz question definitions ---- */
const QUIZ_QUESTIONS = [
    {
        id: 'q1',
        question: 'What atmosphere inspires you most?',
        options: [
            { label: 'Midnight in a spice bazaar with velvet smoke',         scores: { Oud: 3, Spicy: 2, Amber: 1 } },
            { label: 'Taif mountain morning with blooming dew roses',         scores: { Rose: 3, Floral: 2, Fresh: 1 } },
            { label: 'Warm desert bonfire beneath amber constellations',       scores: { Amber: 3, Woody: 2, Vanilla: 1 } },
            { label: 'Ocean at dawn — salty air and sea spray',               scores: { Aquatic: 3, Fresh: 2, Citrus: 1 } },
        ]
    },
    {
        id: 'q2',
        question: 'Which word best describes your personal style?',
        options: [
            { label: 'Bold & Intense — I make a statement',                  scores: { Oud: 2, Spicy: 2, Leather: 2 } },
            { label: 'Fresh & Effortless — clean, modern, confident',        scores: { Fresh: 3, Citrus: 2, Aquatic: 1 } },
            { label: 'Romantic & Sensual — warm, floral, captivating',       scores: { Floral: 2, Rose: 2, Musk: 2 } },
            { label: 'Elegant & Timeless — classic, refined, understated',   scores: { Woody: 2, Amber: 2, Vanilla: 1 } },
        ]
    },
    {
        id: 'q3',
        question: 'When do you wear fragrance most?',
        options: [
            { label: 'Evening events & special occasions',                    scores: { Oud: 2, Amber: 2, Spicy: 2 } },
            { label: 'Every day — office, college, casual outings',          scores: { Fresh: 3, Citrus: 2, Musk: 1 } },
            { label: 'Date nights & romantic moments',                        scores: { Rose: 2, Floral: 2, Vanilla: 2 } },
            { label: 'Adventure, travel, outdoors',                           scores: { Aquatic: 2, Woody: 2, Citrus: 2 } },
        ]
    },
    {
        id: 'q4',
        question: 'Which scent family feels most like home to you?',
        options: [
            { label: 'Rich Orientals — oud, amber, incense, resins',         scores: { Oud: 3, Amber: 2, Spicy: 1 } },
            { label: 'Fresh & Aquatics — citrus, green, ozonic notes',       scores: { Fresh: 3, Citrus: 2, Aquatic: 2 } },
            { label: 'Florals — rose, jasmine, lily, soft musk',             scores: { Floral: 3, Rose: 2, Musk: 1 } },
            { label: 'Woody & Smoky — cedar, sandalwood, leather, tobacco',  scores: { Woody: 3, Leather: 2, Tobacco: 1 } },
        ]
    },
    {
        id: 'q5',
        question: 'Which fragrance experience do you prefer?',
        options: [
            { label: 'Intense & long-lasting — lasts all day and night',     scores: { Oud: 2, Amber: 2, Spicy: 1 } },
            { label: 'Light & refreshing — subtle, clean, effortless',       scores: { Fresh: 3, Citrus: 2, Aquatic: 1 } },
            { label: 'Warm & comforting — like a second skin',               scores: { Vanilla: 3, Musk: 2, Woody: 1 } },
            { label: 'Unique & complex — evolves on your skin',              scores: { Oud: 1, Leather: 2, Tobacco: 1, Amber: 1 } },
        ]
    }
];

/* ---- Quiz state ---- */
let _quizStep     = 0;           // current question index
let _quizScores   = {};          // accumulated note scores
let _quizAnswers  = [];          // chosen option per question
const TOTAL_STEPS = QUIZ_QUESTIONS.length;

/* ---- Open quiz modal ---- */
function openQuizModal() {
    const modal = document.getElementById('quiz-modal');
    if (!modal) return;

    // Reset
    _quizStep    = 0;
    _quizScores  = {};
    _quizAnswers = [];

    const stepsEl   = document.getElementById('quiz-steps-container');
    const resultsEl = document.getElementById('quiz-results-container');
    if (stepsEl)   { while (stepsEl.firstChild)   stepsEl.removeChild(stepsEl.firstChild); stepsEl.style.display = ''; }
    if (resultsEl) { while (resultsEl.firstChild) resultsEl.removeChild(resultsEl.firstChild); resultsEl.style.display = 'none'; }

    renderQuizStep();

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const title = document.getElementById('quiz-modal-title');
    if (title) title.focus();
}

/* ---- Close quiz modal ---- */
function closeQuizModal() {
    const modal = document.getElementById('quiz-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/* ---- Render current question ---- */
function renderQuizStep() {
    const stepsEl = document.getElementById('quiz-steps-container');
    if (!stepsEl) return;

    // Update progress
    updateQuizProgress();

    // Clear & build the step
    while (stepsEl.firstChild) stepsEl.removeChild(stepsEl.firstChild);

    if (_quizStep >= TOTAL_STEPS) {
        showQuizResults();
        return;
    }

    const q = QUIZ_QUESTIONS[_quizStep];

    const stepDiv = document.createElement('div');
    stepDiv.className = 'quiz-step';

    const qText = document.createElement('h3');
    qText.className = 'quiz-question';
    qText.textContent = (_quizStep + 1) + '. ' + q.question;
    stepDiv.appendChild(qText);

    const optsDiv = document.createElement('div');
    optsDiv.className = 'quiz-options';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt-btn';
        btn.textContent = opt.label;
        btn.setAttribute('aria-label', opt.label);

        // Mark previously selected answer
        if (_quizAnswers[_quizStep] === idx) {
            btn.classList.add('selected');
        }

        btn.addEventListener('click', () => {
            // Accumulate scores (replace previous answer's scores if revisiting)
            if (_quizAnswers[_quizStep] !== undefined) {
                const prevOpt = q.options[_quizAnswers[_quizStep]];
                Object.entries(prevOpt.scores).forEach(([note, val]) => {
                    _quizScores[note] = (_quizScores[note] || 0) - val;
                });
            }
            _quizAnswers[_quizStep] = idx;
            Object.entries(opt.scores).forEach(([note, val]) => {
                _quizScores[note] = (_quizScores[note] || 0) + val;
            });

            // Move to next step
            _quizStep++;
            renderQuizStep();
        });

        optsDiv.appendChild(btn);
    });

    stepDiv.appendChild(optsDiv);

    // Back button (not on first step)
    if (_quizStep > 0) {
        const backBtn = document.createElement('button');
        backBtn.className = 'quiz-back-btn';
        backBtn.textContent = '← Back';
        backBtn.addEventListener('click', () => {
            _quizStep--;
            renderQuizStep();
        });
        stepDiv.appendChild(backBtn);
    }

    stepsEl.appendChild(stepDiv);

    // Focus the question for accessibility
    qText.setAttribute('tabindex', '-1');
    qText.focus();
}

/* ---- Update progress bar and text ---- */
function updateQuizProgress() {
    const bar  = document.getElementById('quiz-progress-bar');
    const text = document.getElementById('quiz-progress-text');
    const pct  = Math.round((_quizStep / TOTAL_STEPS) * 100);
    if (bar)  bar.style.width  = pct + '%';
    if (text) {
        if (_quizStep >= TOTAL_STEPS) {
            text.textContent = 'Your Results';
        } else {
            text.textContent = 'Step ' + (_quizStep + 1) + ' of ' + TOTAL_STEPS;
        }
    }
}

/* ---- Show quiz results ---- */
function showQuizResults() {
    updateQuizProgress();

    const stepsEl   = document.getElementById('quiz-steps-container');
    const resultsEl = document.getElementById('quiz-results-container');
    if (stepsEl)   stepsEl.style.display   = 'none';
    if (!resultsEl) return;
    resultsEl.style.display = '';

    // Score all products
    const scored = Array.from(products).map(p => {
        let score = 0;
        (p.notes || []).forEach(note => {
            const noteKey = note.charAt(0).toUpperCase() + note.slice(1).toLowerCase();
            // Try exact match, then partial match
            if (_quizScores[note])     score += _quizScores[note];
            if (_quizScores[noteKey])  score += _quizScores[noteKey];
        });
        return { product: p, score };
    });

    // Sort descending, deduplicate by id, take top 3
    scored.sort((a, b) => b.score - a.score);
    const top3 = [];
    const seen = new Set();
    for (const item of scored) {
        if (!seen.has(item.product.id)) {
            seen.add(item.product.id);
            top3.push(item.product);
            if (top3.length === 3) break;
        }
    }

    // Determine dominant note profile for the summary line
    const topNotes = Object.entries(_quizScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([note]) => note);

    // Build results UI
    while (resultsEl.firstChild) resultsEl.removeChild(resultsEl.firstChild);

    // Heading
    const heading = document.createElement('div');
    heading.className = 'quiz-result-heading';

    const title = document.createElement('h3');
    title.className = 'quiz-result-title';
    title.textContent = 'Your Olfactive Signature';
    heading.appendChild(title);

    const profile = document.createElement('p');
    profile.className = 'quiz-result-profile';
    profile.textContent = 'Your scent profile: ' + topNotes.join(' · ');
    heading.appendChild(profile);

    resultsEl.appendChild(heading);

    // Product cards grid
    const grid = document.createElement('div');
    grid.className = 'quiz-result-grid';
    grid.setAttribute('role', 'list');

    top3.forEach((product, i) => {
        const card = document.createElement('div');
        card.className = 'quiz-result-card';
        card.setAttribute('role', 'listitem');

        // Rank badge
        const rank = document.createElement('div');
        rank.className = 'quiz-rank-badge';
        rank.textContent = i === 0 ? '★ TOP MATCH' : '#' + (i + 1);
        card.appendChild(rank);

        // Image — use the first non-solid type for the quiz result card (default to smallest size)
        const imgWrap = document.createElement('div');
        imgWrap.className = 'quiz-result-img-wrap';
        const _qType = firstType(product);
        const _qFirstVariants = getVariantsForType(product, _qType);
        const _qKey = _qFirstVariants.length ? _qFirstVariants[0].key : (_qType + ':3ml');
        const quizBottleImg = document.createElement('img');
        quizBottleImg.className = 'product-img-bottle quiz-result-img';
        quizBottleImg.alt = product.name;
        quizBottleImg.src = getBottleImage(_qType, _qKey);
        imgWrap.appendChild(quizBottleImg);
        card.appendChild(imgWrap);

        // Info
        const info = document.createElement('div');
        info.className = 'quiz-result-info';

        const brand = document.createElement('p');
        brand.className = 'quiz-result-brand';
        brand.textContent = (typeof CATEGORIES !== 'undefined' && CATEGORIES[product.category])
            ? CATEGORIES[product.category]
            : (product.category || '');
        info.appendChild(brand);

        const name = document.createElement('h4');
        name.className = 'quiz-result-name';
        name.textContent = product.name;
        info.appendChild(name);

        const notesRow = document.createElement('div');
        notesRow.className = 'quiz-result-notes';
        (product.notes || []).slice(0, 3).forEach(note => {
            const chip = document.createElement('span');
            chip.className = 'note-chip';
            chip.textContent = note;
            notesRow.appendChild(chip);
        });
        info.appendChild(notesRow);

        const price = document.createElement('p');
        price.className = 'quiz-result-price';
        price.textContent = 'From ' + formatINR(lowestPrice(product));
        info.appendChild(price);

        // Action buttons
        const actions = document.createElement('div');
        actions.className = 'quiz-result-actions';

        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-gold';
        addBtn.textContent = 'Add to Cart';
        addBtn.addEventListener('click', () => {
            const sz = firstSize(product);
            Cart.add(product.id, sz);
            showToast(product.name + ' added to cart.');
            closeQuizModal();
            openCartDrawer();
        });
        actions.appendChild(addBtn);

        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-outline-gold';
        viewBtn.textContent = 'View Details';
        viewBtn.addEventListener('click', () => {
            closeQuizModal();
            openProductModal(product.id, firstSize(product));
        });
        actions.appendChild(viewBtn);

        info.appendChild(actions);
        card.appendChild(info);
        grid.appendChild(card);
    });

    resultsEl.appendChild(grid);

    // Retake button
    const retakeBtn = document.createElement('button');
    retakeBtn.className = 'quiz-retake-btn';
    retakeBtn.textContent = 'Retake Quiz';
    retakeBtn.addEventListener('click', () => {
        _quizStep    = 0;
        _quizScores  = {};
        _quizAnswers = [];
        resultsEl.style.display = 'none';
        const stepsEl = document.getElementById('quiz-steps-container');
        if (stepsEl) stepsEl.style.display = '';
        renderQuizStep();
    });
    resultsEl.appendChild(retakeBtn);

    // Focus for accessibility
    title.setAttribute('tabindex', '-1');
    title.focus();
}

/* ---- Wire quiz triggers ---- */
function initScentFinderQuiz() {
    // Open buttons: all quiz trigger IDs
    ['open-quiz-btn', 'openQuizBtn', 'hero-quiz-btn', 'nav-quiz-btn', 'drawer-quiz-btn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', openQuizModal);
    });

    // Close button
    const closeBtn = document.getElementById('quiz-close');
    if (closeBtn) closeBtn.addEventListener('click', closeQuizModal);

    // Click outside to close
    const modal = document.getElementById('quiz-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeQuizModal();
        });
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeQuizModal();
        });
    }

    // Expose for footer/inline links — read-only, non-configurable
    Object.defineProperty(window, 'openQuizModal', {
        value: openQuizModal,
        writable: false,
        configurable: false
    });
}

/* ==========================================================================
   PERFUME SPRAY EFFECT
   On every click a burst of golden mist droplets fans out from the cursor
   position, physics-animate, then remove themselves from the DOM.
   ========================================================================== */
function initSprayEffect() {
    // Colours cycle through the brand gold palette
    const COLOURS = ['#d4af37', '#f0d882', '#f7e7b4', '#997d1e', '#c8a020', '#ffe066'];
    // Number of droplets per burst
    const PARTICLE_COUNT = 18;

    document.addEventListener('click', sprayBurst);

    function sprayBurst(e) {
        const x = e.clientX;
        const y = e.clientY;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            createDroplet(x, y, i);
        }
    }

    function createDroplet(originX, originY, index) {
        const el = document.createElement('span');
        el.className = 'spray-droplet';

        // Random angle spread — skewed slightly upward (spray cone)
        const angleBase = -90; // pointing upward
        const spread    = 110; // ± degrees
        const angle     = angleBase + (Math.random() * spread - spread / 2);
        const rad       = angle * (Math.PI / 180);

        // Random travel distance
        const dist = 40 + Math.random() * 90;
        const tx   = Math.cos(rad) * dist;
        const ty   = Math.sin(rad) * dist;

        // Random size: small mist dots
        const size = 3 + Math.random() * 7;

        // Random colour from palette
        const colour = COLOURS[Math.floor(Math.random() * COLOURS.length)];

        // Slight stagger so they don't all launch simultaneously
        const delay = index * 12;

        // Duration varies so some droplets linger
        const duration = 500 + Math.random() * 400;

        el.style.cssText = [
            'position:fixed',
            'pointer-events:none',
            'z-index:99999',
            'border-radius:50%',
            'will-change:transform,opacity',
            `left:${originX}px`,
            `top:${originY}px`,
            `width:${size}px`,
            `height:${size}px`,
            `background:${colour}`,
            `box-shadow:0 0 ${size * 1.5}px ${colour}`,
            `opacity:0.9`,
            `transition:transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms,`
                + `opacity ${duration * 0.6}ms ease ${delay + duration * 0.3}ms`,
            'transform:translate(-50%,-50%)',
        ].join(';');

        document.body.appendChild(el);

        // Trigger animation on next frame
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0.4)`;
                el.style.opacity   = '0';
            });
        });

        // Remove from DOM after animation completes
        setTimeout(() => el.remove(), delay + duration + 100);
    }
}

/* ==========================================================================
   BACKGROUND MUSIC
   - Starts muted/paused (browser autoplay policy)
   - User toggles with the nav Music button
   - Preference persisted in localStorage (key: 'apl_music')
   ========================================================================== */
function initBackgroundMusic() {
    const audio = document.getElementById('bg-music');
    const btn   = document.getElementById('music-toggle-btn');
    if (!audio || !btn) return;

    // Low ambient volume
    audio.volume = 0.18;

    // Restore saved preference (default: off) — strictly validate stored value
    let savedRaw;
    try { savedRaw = localStorage.getItem('apl_music'); } catch (_) { savedRaw = null; }
    let playing = (typeof savedRaw === 'string' && savedRaw.length <= 3 && savedRaw === 'on');

    function _applyState() {
        if (playing) {
            audio.play().catch(() => {
                // Browser blocked autoplay — silently fall back to muted state
                playing = false;
                _applyState();
            });
            btn.setAttribute('aria-label',   'Disable background music');
            btn.setAttribute('aria-pressed', 'true');
            btn.classList.remove('is-muted');
        } else {
            audio.pause();
            btn.setAttribute('aria-label',   'Enable background music');
            btn.setAttribute('aria-pressed', 'false');
            btn.classList.add('is-muted');
        }
        localStorage.setItem('apl_music', playing ? 'on' : 'off');
    }

    btn.addEventListener('click', () => {
        playing = !playing;
        _applyState();
    });

    // Initialise visual state immediately; attempt play if saved pref was 'on'
    _applyState();
}
