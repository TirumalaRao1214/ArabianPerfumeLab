/**
 * Arabian Perfume Lab — Build Your Own Box (BYOB) v2
 *
 * Full-featured implementation:
 *   - Default 100ml selected on load
 *   - Per-product images with fallback
 *   - Search within the 16 eligible products
 *   - Box-full message when maxItems reached
 *   - Remove buttons in summary panel
 *   - Mobile sticky summary bar
 *   - Two-column desktop layout (grid + sidebar)
 *   - WhatsApp order with price from BOX_DEALS only
 *
 * Security contract:
 *   - Prices come exclusively from BOX_DEALS — never from DOM or user input
 *   - No price, total, or customer PII stored in localStorage
 *   - All selected product IDs validated against BYOB_ELIGIBLE_IDS before ordering
 *
 * Depends on: config.js, products.js (products, CATEGORIES, BOTTLE_IMAGES)
 */

/* -----------------------------------------------------------------------
 * BOX_DEALS — single source of truth for box sizes, quantities and prices.
 * Listed in display order: 100ml first (default), then 50ml, then 20ml.
 * ----------------------------------------------------------------------- */
const BOX_DEALS = Object.freeze([
    Object.freeze({ size: '100ml', perfumeType: 'perfume:100ml', maxItems: 1, price: 999, label: '100 ml' }),
    Object.freeze({ size: '50ml',  perfumeType: 'perfume:50ml',  maxItems: 2, price: 999, label: '50 ml'  }),
    Object.freeze({ size: '20ml',  perfumeType: 'perfume:20ml',  maxItems: 3, price: 999, label: '20 ml'  })
]);

/* -----------------------------------------------------------------------
 * BYOB_ELIGIBLE_IDS — the 16 confirmed products available in the box offer.
 * Edit this list to add/remove products. Do NOT change BOX_DEALS prices here.
 * ----------------------------------------------------------------------- */
const BYOB_ELIGIBLE_IDS = Object.freeze([
    'cool-water',
    'jpg-le-male',
    'zidaan-classic',
    'my-way-yalang',
    'erose-flame',
    'pink-peach',
    'lemon-lavender',
    'lemon-blast',
    'white-tea',
    'pink-luxica',
    'libre-flowers-and-flame',
    'paris-ocean',
    'honey-suckle',
    'blue-musk',
    'jasmine',
    'polo-sports'
]);

/* -----------------------------------------------------------------------
 * Per-product image map for the 16 BYOB products.
 * Falls back to a shared perfume bottle if a dedicated image is absent.
 * ----------------------------------------------------------------------- */
const BYOB_PRODUCT_IMAGES = Object.freeze({
    'cool-water':              'assets/images/products/cool-water.webp',
    'jpg-le-male':             'assets/images/products/jpg-le-male.webp',
    'zidaan-classic':          'assets/images/products/zidaan-classic.webp',
    'my-way-yalang':           'assets/images/products/my-way-yalang.webp',
    'erose-flame':             'assets/images/products/erose-flame.webp',
    'pink-peach':              'assets/images/products/pink-peach.webp',
    'lemon-lavender':          'assets/images/products/lemon-lavender.webp',
    'lemon-blast':             'assets/images/products/lemon-blast.webp',
    'white-tea':               'assets/images/products/white-tea.webp',
    'pink-luxica':             'assets/images/products/pink-luxica.webp',
    'libre-flowers-and-flame': 'assets/images/products/libre-flowers-and-flame.webp',
    'paris-ocean':             'assets/images/products/paris-ocean.webp',
    'honey-suckle':            'assets/images/products/honey-suckle.webp',
    'blue-musk':               'assets/images/products/blue-musk.webp',
    'jasmine':                 'assets/images/products/jasmine.webp',
    'polo-sports':             'assets/images/products/polo-sports.webp'
});

/* -----------------------------------------------------------------------
 * Fallback image when a product-specific image is missing.
 * ----------------------------------------------------------------------- */
const BYOB_FALLBACK_IMG = 'assets/images/products/Perfume-100ml.png';

/* =======================================================================
 * BYOB module — IIFE to keep state private
 * ======================================================================= */
const BYOB = (() => {

    // State
    let _activeDeal  = BOX_DEALS[0];  // default: 100ml
    let _selectedIds = [];
    let _searchQuery = '';

    /* ------------------------------------------------------------------
     * Helpers
     * ------------------------------------------------------------------ */

    function _eligibleProducts() {
        return products.filter(function(p) {
            return BYOB_ELIGIBLE_IDS.indexOf(p.id) !== -1;
        });
    }

    function _visibleProducts() {
        var list = _eligibleProducts();
        if (_searchQuery) {
            var q = _searchQuery.toLowerCase();
            list = list.filter(function(p) {
                return p.name.toLowerCase().indexOf(q) !== -1 ||
                       (p.notes && p.notes.some(function(n) { return n.toLowerCase().indexOf(q) !== -1; }));
            });
        }
        return list;
    }

    function _getProductImg(id) {
        return BYOB_PRODUCT_IMAGES[id] || BYOB_FALLBACK_IMG;
    }

    function _formatPrice(n) {
        return '\u20B9' + Number(n).toLocaleString('en-IN');
    }

    /* ------------------------------------------------------------------
     * Render: deal size buttons
     * ------------------------------------------------------------------ */
    function _renderDeals() {
        var container = document.getElementById('byob-deal-selector');
        if (!container) return;
        while (container.firstChild) container.removeChild(container.firstChild);

        BOX_DEALS.forEach(function(deal) {
            var isActive = _activeDeal && _activeDeal.size === deal.size;

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'byob-size-btn' + (isActive ? ' active' : '');
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
            btn.setAttribute('aria-label', deal.label + ' — Any ' + deal.maxItems + ' for ' + _formatPrice(deal.price));
            btn.setAttribute('data-byob-size', deal.size);

            // Active check icon
            var check = document.createElement('span');
            check.className = 'byob-size-check';
            check.setAttribute('aria-hidden', 'true');
            check.innerHTML = isActive ? '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,8 6,12 14,4"/></svg>' : '';

            var sizeSpan = document.createElement('span');
            sizeSpan.className = 'byob-size-label';
            sizeSpan.textContent = deal.size;

            var offerSpan = document.createElement('span');
            offerSpan.className = 'byob-size-offer';
            offerSpan.textContent = 'Any ' + deal.maxItems + ' @ ' + _formatPrice(deal.price);

            btn.appendChild(check);
            btn.appendChild(sizeSpan);
            btn.appendChild(offerSpan);

            btn.addEventListener('click', function() {
                _activeDeal  = deal;
                _selectedIds = [];
                _searchQuery = '';
                var searchEl = document.getElementById('byob-search');
                if (searchEl) searchEl.value = '';
                _renderAll();
            });

            container.appendChild(btn);
        });
    }

    /* ------------------------------------------------------------------
     * Render: product grid
     * ------------------------------------------------------------------ */
    function _renderGrid() {
        var container = document.getElementById('byob-product-grid');
        if (!container) return;
        while (container.firstChild) container.removeChild(container.firstChild);

        var visible  = _visibleProducts();
        var maxItems = _activeDeal ? _activeDeal.maxItems : 1;
        var isFull   = _selectedIds.length >= maxItems;

        // Box-full message
        var fullMsg = document.getElementById('byob-full-msg');
        if (fullMsg) fullMsg.hidden = !isFull;

        if (visible.length === 0) {
            var empty = document.createElement('p');
            empty.className = 'byob-no-results';
            empty.textContent = 'No fragrances match your search.';
            container.appendChild(empty);
            return;
        }

        visible.forEach(function(product) {
            var isSelected = _selectedIds.indexOf(product.id) !== -1;
            var isDisabled = !isSelected && isFull;

            var item = document.createElement('div');
            item.className = 'byob-card' + (isSelected ? ' byob-card--selected' : '') + (isDisabled ? ' byob-card--disabled' : '');
            item.setAttribute('role', 'listitem');

            // Image
            var imgWrap = document.createElement('div');
            imgWrap.className = 'byob-card-img-wrap';

            var img = document.createElement('img');
            img.src   = _getProductImg(product.id);
            img.alt   = "Arabian Perfumer's " + product.name + ' inspired perfume';
            img.className = 'byob-card-img';
            img.loading = 'lazy';
            img.width  = 100;
            img.height = 120;
            img.addEventListener('error', function() {
                if (this.src !== BYOB_FALLBACK_IMG) this.src = BYOB_FALLBACK_IMG;
            });

            // Selected overlay
            var overlay = document.createElement('div');
            overlay.className = 'byob-card-overlay';
            overlay.setAttribute('aria-hidden', 'true');
            overlay.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,12 9,17 20,6"/></svg>';

            imgWrap.appendChild(img);
            imgWrap.appendChild(overlay);

            // Name
            var name = document.createElement('span');
            name.className = 'byob-card-name';
            name.textContent = product.name;

            // Selected badge
            var badge = document.createElement('span');
            badge.className = 'byob-card-badge';
            badge.setAttribute('aria-hidden', 'true');
            badge.textContent = isSelected ? 'SELECTED' : '';

            // Action button
            var actionBtn = document.createElement('button');
            actionBtn.type = 'button';
            actionBtn.className = 'byob-card-btn' + (isSelected ? ' byob-card-btn--remove' : '');

            if (isSelected) {
                actionBtn.setAttribute('aria-label', 'Remove ' + product.name + ' from box');
                actionBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            } else {
                actionBtn.setAttribute('aria-label', 'Add ' + product.name + ' to box');
                actionBtn.disabled  = isDisabled;
                actionBtn.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
                actionBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
            }

            actionBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                _toggle(product.id);
            });

            // Card click also toggles (not just the button)
            item.addEventListener('click', function() {
                if (!isDisabled) _toggle(product.id);
            });
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!isDisabled) _toggle(product.id); }
            });
            item.setAttribute('tabindex', isDisabled ? '-1' : '0');

            item.appendChild(imgWrap);
            item.appendChild(name);
            item.appendChild(badge);
            item.appendChild(actionBtn);

            container.appendChild(item);
        });
    }

    /* ------------------------------------------------------------------
     * Render: summary panel + sticky bar
     * ------------------------------------------------------------------ */
    function _renderSummary() {
        if (!_activeDeal) return;

        var maxItems  = _activeDeal.maxItems;
        var count     = _selectedIds.length;
        var price     = _formatPrice(_activeDeal.price);
        var sizeLabel = _activeDeal.size + ' \u2014 Any ' + maxItems + ' @ ' + price;

        // Panel elements
        var panelSize  = document.getElementById('byob-panel-size');
        var countEl    = document.getElementById('byob-selected-count');
        var maxEl      = document.getElementById('byob-max-count');
        var priceEl    = document.getElementById('byob-box-price');
        var listEl     = document.getElementById('byob-selected-list');
        var emptyHint  = document.getElementById('byob-empty-hint');
        var orderBtn   = document.getElementById('byob-order-btn');

        if (panelSize) panelSize.textContent = sizeLabel;
        if (countEl)   countEl.textContent   = count;
        if (maxEl)     maxEl.textContent      = maxItems;
        if (priceEl)   priceEl.textContent    = price;

        // Selected list with Remove buttons
        if (listEl) {
            while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
            _selectedIds.forEach(function(id) {
                var p = products.find(function(pr) { return pr.id === id; });
                if (!p) return;
                var li = document.createElement('li');
                li.className = 'byob-summary-item';

                var checkIcon = document.createElement('span');
                checkIcon.className = 'byob-summary-check';
                checkIcon.setAttribute('aria-hidden', 'true');
                checkIcon.textContent = '\u2713';

                var nameSpan = document.createElement('span');
                nameSpan.className = 'byob-summary-name';
                nameSpan.textContent = p.name;

                var removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'byob-summary-remove';
                removeBtn.textContent = 'Remove';
                removeBtn.setAttribute('aria-label', 'Remove ' + p.name + ' from box');
                removeBtn.addEventListener('click', function() { _remove(id); });

                li.appendChild(checkIcon);
                li.appendChild(nameSpan);
                li.appendChild(removeBtn);
                listEl.appendChild(li);
            });
        }

        if (emptyHint) emptyHint.hidden = count > 0;

        var ready = count === maxItems;
        if (orderBtn) {
            orderBtn.disabled = !ready;
            orderBtn.setAttribute('aria-disabled', ready ? 'false' : 'true');
        }

        // Sticky bar (mobile)
        var stickyBar      = document.getElementById('byob-sticky-bar');
        var stickyCount    = document.getElementById('byob-sticky-count-val');
        var stickyMax      = document.getElementById('byob-sticky-max-val');
        var stickyPrice    = document.getElementById('byob-sticky-price');
        var stickyOrderBtn = document.getElementById('byob-sticky-order-btn');

        if (stickyBar)   stickyBar.hidden = false;
        if (stickyCount) stickyCount.textContent = count;
        if (stickyMax)   stickyMax.textContent   = maxItems;
        if (stickyPrice) stickyPrice.textContent = price;
        if (stickyOrderBtn) {
            stickyOrderBtn.disabled = !ready;
            stickyOrderBtn.setAttribute('aria-disabled', ready ? 'false' : 'true');
        }
    }

    /* ------------------------------------------------------------------
     * Toggle / remove helpers
     * ------------------------------------------------------------------ */
    function _toggle(productId) {
        var idx = _selectedIds.indexOf(productId);
        if (idx !== -1) {
            // deselect
            _selectedIds.splice(idx, 1);
        } else {
            // select — enforce max
            if (!_activeDeal || _selectedIds.length >= _activeDeal.maxItems) return;
            _selectedIds.push(productId);
        }
        _renderGrid();
        _renderSummary();
    }

    function _remove(productId) {
        _selectedIds = _selectedIds.filter(function(id) { return id !== productId; });
        _renderGrid();
        _renderSummary();
    }

    /* ------------------------------------------------------------------
     * Render all
     * ------------------------------------------------------------------ */
    function _renderAll() {
        _renderDeals();
        _renderGrid();
        _renderSummary();
    }

    /* ------------------------------------------------------------------
     * WhatsApp order generation
     * ------------------------------------------------------------------ */
    function _buildOrderUrl() {
        if (!_activeDeal) return null;
        if (_selectedIds.length !== _activeDeal.maxItems) return null;

        // Validate every ID is eligible
        var eligible  = _eligibleProducts();
        var validated = _selectedIds.filter(function(id) {
            return eligible.some(function(p) { return p.id === id; });
        });
        if (validated.length !== _activeDeal.maxItems) return null;

        var sep     = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500';
        var bizName = (typeof BUSINESS !== 'undefined') ? BUSINESS.name : 'Arabian Perfume Lab';
        var price   = _formatPrice(_activeDeal.price);

        var lines = [
            "ARABIAN PERFUMER'S",
            'BUILD YOUR OWN BOX',
            '',
            sep,
            '',
            'Box:',
            _activeDeal.size + ' \u2014 Any ' + _activeDeal.maxItems + ' @ ' + price,
            '',
            'Selected Fragrances:'
        ];

        validated.forEach(function(id, i) {
            var p = products.find(function(pr) { return pr.id === id; });
            if (p) lines.push((i + 1) + '. ' + p.name);
        });

        lines.push('');
        lines.push('Box Total: ' + price);
        lines.push('');
        lines.push(sep);
        lines.push('');
        lines.push('(This is a request \u2014 not a confirmed order.)');
        lines.push('Final availability and delivery charges will be');
        lines.push('confirmed by ' + bizName + ' via WhatsApp.');
        lines.push('');
        lines.push('Please share your delivery details:');
        lines.push('Name:');
        lines.push('Phone:');
        lines.push('Address:');
        lines.push('Pincode:');
        lines.push('');
        lines.push('Thank you!');

        var number = (typeof BUSINESS !== 'undefined')
            ? String(BUSINESS.whatsapp).replace(/\D/g, '')
            : '';
        if (!number) return null;

        return 'https://wa.me/' + number + '?text=' + encodeURIComponent(lines.join('\n'));
    }

    function _openOrder() {
        var url = _buildOrderUrl();
        if (!url) return;
        // Route through the customer details checkout modal so delivery
        // information is always collected before the order is sent.
        if (typeof Checkout !== 'undefined' && typeof Checkout.openCheckoutForBYOB === 'function') {
            Checkout.openCheckoutForBYOB(url);
        } else {
            // Fallback if checkout module is unavailable
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    /* ------------------------------------------------------------------
     * Public init
     * ------------------------------------------------------------------ */
    function init() {
        if (!document.getElementById('byob-section')) return;

        // Wire search
        var searchEl = document.getElementById('byob-search');
        if (searchEl) {
            searchEl.addEventListener('input', function() {
                _searchQuery = searchEl.value.trim();
                _renderGrid();
            });
        }

        // Wire order buttons (panel + sticky)
        ['byob-order-btn', 'byob-sticky-order-btn'].forEach(function(id) {
            var btn = document.getElementById(id);
            if (btn) btn.addEventListener('click', _openOrder);
        });

        // Wire reset button
        var resetBtn = document.getElementById('byob-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                _activeDeal  = BOX_DEALS[0]; // reset to 100ml default
                _selectedIds = [];
                _searchQuery = '';
                var searchEl = document.getElementById('byob-search');
                if (searchEl) searchEl.value = '';
                _renderAll();
            });
        }

        // Initial render with 100ml default
        _renderAll();
    }

    return Object.freeze({ init: init });
})();

// Initialise once DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { BYOB.init(); });
} else {
    BYOB.init();
}
