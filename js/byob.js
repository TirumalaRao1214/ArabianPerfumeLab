/**
 * Arabian Perfume Lab — Build Your Own Box (BYOB) Module
 *
 * Allows customers to select a box size and choose eligible perfumes,
 * then generate a WhatsApp order message.
 *
 * Security contract:
 *   - Box prices are NEVER editable by the user — they come from BOX_DEALS only.
 *   - Product IDs selected are validated against the products array before ordering.
 *   - No prices, totals, or customer data are stored in localStorage.
 *   - WhatsApp message is assembled from BOX_DEALS config — price is not user-supplied.
 *
 * Depends on: config.js, products.js (products array + CATEGORIES + BOTTLE_IMAGES)
 */

/* -----------------------------------------------------------------------
 * BOX_DEALS — SINGLE SOURCE OF TRUTH for box pricing.
 * Do NOT duplicate these prices elsewhere.
 * Do NOT allow users to modify these values.
 * ----------------------------------------------------------------------- */
const BOX_DEALS = Object.freeze([
    Object.freeze({ size: '20ml',  perfumeType: 'perfume:20ml',  maxItems: 3, price: 999, label: '20 ml' }),
    Object.freeze({ size: '50ml',  perfumeType: 'perfume:50ml',  maxItems: 2, price: 999, label: '50 ml' }),
    Object.freeze({ size: '100ml', perfumeType: 'perfume:100ml', maxItems: 1, price: 999, label: '100 ml' })
]);

/* -----------------------------------------------------------------------
 * Eligible product categories for Build Your Own Box.
 * Only perfume-family products are eligible; body creams are excluded.
 * ----------------------------------------------------------------------- */
const BYOB_ELIGIBLE_CATEGORIES = Object.freeze([
    'french-attars',
    'arabic-attars',
    'floral-attars',
    'fruity-attars',
    'aquatic-attars',
    'french-arabic-mix-attars',
    'french-perfumes',
    'arabic-perfumes',
    'floral-perfumes',
    'fruity-perfumes',
    'aquatic-perfumes'
]);

const BYOB = (() => {

    let _activeDeal  = null;  // currently selected BOX_DEALS entry
    let _selectedIds = [];    // validated product IDs chosen by user

    /* ------------------------------------------------------------------
     * Private helpers
     * ------------------------------------------------------------------ */

    /** Return all eligible products for a given deal (must have that perfume variant). */
    function _eligibleProducts(deal) {
        if (!deal) return [];
        return products.filter(function(p) {
            if (BYOB_ELIGIBLE_CATEGORIES.indexOf(p.category) === -1) return false;
            if (!p.sizes || !p.sizes[deal.perfumeType]) return false;
            return true;
        });
    }

    /** Get category display label safely. */
    function _catLabel(slug) {
        if (typeof CATEGORIES !== 'undefined' && CATEGORIES[slug]) return CATEGORIES[slug];
        return slug || '';
    }

    /* ------------------------------------------------------------------
     * Rendering
     * ------------------------------------------------------------------ */

    function _renderDealSelector() {
        const container = document.getElementById('byob-deal-selector');
        if (!container) return;
        while (container.firstChild) container.removeChild(container.firstChild);

        BOX_DEALS.forEach(function(deal) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'byob-deal-btn' + (_activeDeal && _activeDeal.size === deal.size ? ' active' : '');
            btn.setAttribute('data-byob-size', deal.size);
            btn.setAttribute('aria-pressed', (_activeDeal && _activeDeal.size === deal.size) ? 'true' : 'false');

            const sizeEl = document.createElement('span');
            sizeEl.className = 'byob-deal-size';
            sizeEl.textContent = deal.label;

            const offerEl = document.createElement('span');
            offerEl.className = 'byob-deal-offer';
            offerEl.textContent = 'Any ' + deal.maxItems + ' @ \u20B9' + deal.price.toLocaleString('en-IN');

            btn.appendChild(sizeEl);
            btn.appendChild(offerEl);

            btn.addEventListener('click', function() {
                _activeDeal  = deal;
                _selectedIds = [];
                _renderDealSelector();
                _renderProductGrid();
                _renderSummary();
            });

            container.appendChild(btn);
        });
    }

    function _renderProductGrid() {
        const container  = document.getElementById('byob-product-grid');
        const placeholder = document.getElementById('byob-select-size-msg');
        if (!container) return;

        while (container.firstChild) container.removeChild(container.firstChild);

        if (!_activeDeal) {
            if (placeholder) placeholder.style.display = '';
            return;
        }
        if (placeholder) placeholder.style.display = 'none';

        const eligible = _eligibleProducts(_activeDeal);
        const maxItems = _activeDeal.maxItems;

        eligible.forEach(function(product) {
            const isSelected = _selectedIds.indexOf(product.id) !== -1;
            const isMaxed    = !isSelected && _selectedIds.length >= maxItems;

            const card = document.createElement('div');
            card.className = 'byob-product-card' +
                (isSelected ? ' selected' : '') +
                (isMaxed    ? ' maxed'    : '');
            card.setAttribute('data-byob-id', product.id);
            card.setAttribute('role', 'checkbox');
            card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
            card.setAttribute('tabindex', isMaxed ? '-1' : '0');
            card.setAttribute('aria-disabled', isMaxed ? 'true' : 'false');

            // Thumbnail
            const img = document.createElement('img');
            const sizeKey = _activeDeal.perfumeType;
            img.src = (typeof BOTTLE_IMAGES !== 'undefined' && BOTTLE_IMAGES[sizeKey])
                ? BOTTLE_IMAGES[sizeKey]
                : 'assets/images/products/Perfume-20ml.png';
            img.alt = "Arabian Perfumer's " + product.name + ' inspired perfume';
            img.className = 'byob-product-img';
            img.width  = 60;
            img.height = 90;
            img.addEventListener('error', function() {
                this.src = 'assets/images/products/placeholder.svg';
            });

            const nameEl = document.createElement('span');
            nameEl.className = 'byob-product-name';
            nameEl.textContent = product.name;

            const catEl = document.createElement('span');
            catEl.className = 'byob-product-cat';
            catEl.textContent = _catLabel(product.category);

            const tick = document.createElement('span');
            tick.className = 'byob-product-tick';
            tick.setAttribute('aria-hidden', 'true');
            tick.textContent = isSelected ? '\u2713' : '';

            card.appendChild(img);
            card.appendChild(nameEl);
            card.appendChild(catEl);
            card.appendChild(tick);

            function _toggle() {
                if (isMaxed) return;
                if (isSelected) {
                    _selectedIds = _selectedIds.filter(function(id) { return id !== product.id; });
                } else {
                    if (_selectedIds.length < maxItems) _selectedIds.push(product.id);
                }
                _renderProductGrid();
                _renderSummary();
            }

            card.addEventListener('click', _toggle);
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _toggle(); }
            });

            container.appendChild(card);
        });
    }

    function _renderSummary() {
        const summaryEl = document.getElementById('byob-summary');
        const orderBtn  = document.getElementById('byob-order-btn');
        const countEl   = document.getElementById('byob-selected-count');
        const maxEl     = document.getElementById('byob-max-count');
        const priceEl   = document.getElementById('byob-box-price');
        const listEl    = document.getElementById('byob-selected-list');

        if (!summaryEl) return;

        if (!_activeDeal) { summaryEl.classList.add('hidden'); return; }
        summaryEl.classList.remove('hidden');

        if (countEl) countEl.textContent = _selectedIds.length;
        if (maxEl)   maxEl.textContent   = _activeDeal.maxItems;
        if (priceEl) priceEl.textContent = '\u20B9' + _activeDeal.price.toLocaleString('en-IN');

        if (listEl) {
            while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
            _selectedIds.forEach(function(id, index) {
                const p = products.find(function(pr) { return pr.id === id; });
                if (!p) return;
                const li = document.createElement('li');
                li.textContent = (index + 1) + '. ' + p.name;
                listEl.appendChild(li);
            });
        }

        if (orderBtn) {
            const ready = _selectedIds.length === _activeDeal.maxItems;
            orderBtn.disabled = !ready;
            orderBtn.setAttribute('aria-disabled', ready ? 'false' : 'true');
        }
    }

    /* ------------------------------------------------------------------
     * WhatsApp order generation for BYOB
     * ------------------------------------------------------------------ */

    function _generateBoxOrder() {
        if (!_activeDeal) return null;
        if (_selectedIds.length !== _activeDeal.maxItems) return null;

        // Validate all IDs against eligible products
        const eligible  = _eligibleProducts(_activeDeal);
        const validated = _selectedIds.filter(function(id) {
            return eligible.some(function(p) { return p.id === id; });
        });
        if (validated.length !== _activeDeal.maxItems) return null;

        const separator  = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500';
        const bizName    = (typeof BUSINESS !== 'undefined') ? BUSINESS.name : 'Arabian Perfume Lab';
        const lines = [
            'Hello ' + bizName + ',',
            '',
            '\uD83C\uDF81 BUILD YOUR OWN BOX ORDER',
            '(This is a request \u2014 not a confirmed order.)',
            '',
            separator,
            'Box Size:  ' + _activeDeal.label,
            'Box Price: \u20B9' + _activeDeal.price.toLocaleString('en-IN'),
            '',
            'Selected Fragrances:'
        ];

        validated.forEach(function(id, index) {
            const p = products.find(function(pr) { return pr.id === id; });
            if (p) lines.push('  ' + (index + 1) + '. ' + p.name);
        });

        lines.push('');
        lines.push(separator);
        lines.push('');
        lines.push('IMPORTANT: Final availability and delivery charges will');
        lines.push('be confirmed by ' + bizName + ' through WhatsApp.');
        lines.push('');
        lines.push('Please share your delivery details:');
        lines.push('Name:');
        lines.push('Phone:');
        lines.push('Address:');
        lines.push('Pincode:');
        lines.push('');
        lines.push('Thank you.');

        const number = (typeof BUSINESS !== 'undefined')
            ? String(BUSINESS.whatsapp).replace(/\D/g, '')
            : '';
        if (!number) return null;

        return 'https://wa.me/' + number + '?text=' + encodeURIComponent(lines.join('\n'));
    }

    /* ------------------------------------------------------------------
     * Public init
     * ------------------------------------------------------------------ */

    function init() {
        if (!document.getElementById('byob-section')) return;

        _renderDealSelector();
        _renderProductGrid();
        _renderSummary();

        const orderBtn = document.getElementById('byob-order-btn');
        if (orderBtn) {
            orderBtn.addEventListener('click', function() {
                const url = _generateBoxOrder();
                if (url) window.open(url, '_blank', 'noopener,noreferrer');
            });
        }

        const resetBtn = document.getElementById('byob-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                _activeDeal  = null;
                _selectedIds = [];
                _renderDealSelector();
                _renderProductGrid();
                _renderSummary();
            });
        }
    }

    return Object.freeze({ init: init });
})();

// Auto-initialise after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { BYOB.init(); });
} else {
    BYOB.init();
}
