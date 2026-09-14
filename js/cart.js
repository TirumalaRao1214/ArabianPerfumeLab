/**
 * Arabian Perfume Lab — Cart Module (v3)
 *
 * Security contract:
 *   - localStorage stores ONLY { id: string, size: string, qty: number } tuples.
 *   - Prices are NEVER stored in localStorage or read from DOM, URL params, or any
 *     client-supplied source.
 *   - All pricing is derived exclusively from products.js → product.sizes[size].
 *   - Cart key is composite: id + ':' + size  (e.g. "oud-royale:50ml").
 *   - Quantities are validated: positive integers 1–99 for retail; MOQ floor for wholesale.
 *   - Unknown product IDs or sizes are silently discarded on every load.
 *   - Wholesale / enquiry products are NOT added to the retail cart.
 *   - No eval(), no new Function(), no innerHTML for user-derived data.
 *   - Any tampered localStorage is caught, stripped, and reset gracefully.
 */

const Cart = (() => {
    const STORAGE_KEY = 'apl_cart_v3';  // v3 — security-hardened schema
    const MAX_QTY     = 99;
    const MIN_QTY     = 1;
    const PLACEHOLDER = 'assets/images/products/placeholder.svg';

    // Internal state: array of { id: string, size: string, qty: number }
    let _items = [];
    let _listeners = [];

    /* ------------------------------------------------------------------
     * Private helpers
     * ------------------------------------------------------------------ */

    /** Return the product object from the catalogue, or null if not found. */
    function _findProduct(id) {
        if (typeof id !== 'string' || !id || id.length > 128) return null;
        return products.find(p => p.id === id) || null;
    }

    /**
     * Return true if the product is purchasable via the retail cart.
     * Wholesale and enquiry-only products must not enter the cart.
     */
    function _isRetailProduct(product) {
        if (!product) return false;
        if (product.productType === 'wholesale') return false;
        if (product.productType === 'enquiry')   return false;
        if (!product.sizes || Object.keys(product.sizes).length === 0) return false;
        return true;
    }

    /** Validate that a given size exists in a product's sizes object. */
    function _validSize(product, size) {
        if (!product || !product.sizes) return false;
        if (typeof size !== 'string' || !size || size.length > 32) return false;
        return Object.prototype.hasOwnProperty.call(product.sizes, size);
    }

    /** Get the default (first) size key for a product. */
    function _defaultSize(product) {
        if (!product || !product.sizes) return null;
        return Object.keys(product.sizes)[0] || null;
    }

    /** Composite cart key to distinguish same product in different sizes. */
    function _key(id, size) {
        return id + ':' + size;
    }

    /**
     * Clamp and normalise a raw quantity value to a safe positive integer.
     * Rejects: NaN, Infinity, negative, zero, decimals, strings, objects.
     */
    function _clampQty(raw) {
        const n = parseInt(raw, 10);
        if (!Number.isFinite(n) || n !== Number(raw) && !Number.isInteger(Number(raw))) {
            return MIN_QTY;
        }
        return Math.max(MIN_QTY, Math.min(MAX_QTY, n));
    }

    /**
     * Strictly validate a raw quantity — returns MIN_QTY for any invalid input.
     * Separate from _clampQty so the intent is explicit at call sites.
     */
    function _safeQty(raw) {
        if (raw === null || raw === undefined) return MIN_QTY;
        const n = Number(raw);
        if (!Number.isFinite(n)) return MIN_QTY;   // rejects NaN, ±Infinity
        if (n !== Math.floor(n))  return MIN_QTY;   // rejects decimals
        if (n < MIN_QTY)          return MIN_QTY;   // rejects 0, negatives
        return Math.min(MAX_QTY, n);                // caps at MAX_QTY
    }

    /** Notify all registered onChange listeners. */
    function _notify() {
        _listeners.forEach(fn => {
            try { fn(); } catch (_) { /* never let a listener crash the cart */ }
        });
    }

    /* ------------------------------------------------------------------
     * Persistence
     * ------------------------------------------------------------------ */

    /**
     * Load cart from localStorage.
     * Security rules applied on every load:
     *   1. Parse JSON safely — catch any exception.
     *   2. Require array shape — reject any other structure.
     *   3. Validate productId exists in catalogue.
     *   4. Reject wholesale / enquiry products.
     *   5. Validate size exists for the product.
     *   6. Clamp quantity to [MIN_QTY, MAX_QTY].
     *   7. Silently discard all invalid entries.
     *   8. Never read or trust any price / total / subtotal fields.
     */
    function _load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;

            let parsed;
            try { parsed = JSON.parse(raw); } catch (_) { parsed = null; }
            if (!Array.isArray(parsed)) {
                try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
                return;
            }

            _items = parsed.reduce((acc, entry) => {
                // Must be a plain object with string id
                if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return acc;
                if (typeof entry.id !== 'string' || !entry.id) return acc;

                // Product must exist in catalogue
                const product = _findProduct(entry.id);
                if (!product) return acc;

                // Reject wholesale / enquiry products from retail cart
                if (!_isRetailProduct(product)) return acc;

                // Size must be valid for this product
                const size = _validSize(product, entry.size)
                    ? entry.size
                    : _defaultSize(product);
                if (!size) return acc;

                // Quantity — strict validation, no trust in stored value
                const qty = _safeQty(entry.qty);
                const k   = _key(entry.id, size);

                // Merge duplicates
                const existing = acc.find(i => _key(i.id, i.size) === k);
                if (existing) {
                    existing.qty = Math.min(MAX_QTY, existing.qty + qty);
                } else {
                    // Store ONLY id, size, qty — never price, mrp, total
                    acc.push({ id: entry.id, size, qty });
                }
                return acc;
            }, []);
        } catch (_) {
            // Corrupted / unexpected data — reset safely, no uncaught exception
            _items = [];
            try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
        }
    }

    /**
     * Persist current cart to localStorage.
     * ONLY stores: { id, size, qty }
     * NEVER stores: price, mrp, total, subtotal, customer data
     */
    function _save() {
        try {
            const payload = _items.map(i => ({
                id:   i.id,
                size: i.size,
                qty:  i.qty
                // price is intentionally OMITTED
            }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (_) {
            // Storage quota exceeded or private mode — degrade gracefully
        }
    }

    /* ------------------------------------------------------------------
     * Public API
     * ------------------------------------------------------------------ */

    /**
     * Add one unit of a product+size to the retail cart.
     * Validates: productId exists, product is retail (not wholesale/enquiry),
     *            size is valid, and qty won't exceed MAX_QTY.
     * @param {string} productId
     * @param {string} [size]  If omitted, uses the first available size.
     * @returns {boolean} true if the item was successfully added
     */
    function add(productId, size) {
        const product = _findProduct(productId);
        if (!product) return false;

        // Block wholesale / enquiry products from the retail cart
        if (!_isRetailProduct(product)) return false;

        const resolvedSize = (size && _validSize(product, size)) ? size : _defaultSize(product);
        if (!resolvedSize) return false;

        const k = _key(productId, resolvedSize);
        const existing = _items.find(i => _key(i.id, i.size) === k);
        if (existing) {
            existing.qty = Math.min(MAX_QTY, existing.qty + 1);
        } else {
            _items.push({ id: productId, size: resolvedSize, qty: 1 });
        }
        _save();
        _notify();
        return true;
    }

    /**
     * Remove a product+size entry entirely from the cart.
     * @param {string} productId
     * @param {string} size
     */
    function remove(productId, size) {
        const k = _key(productId, size);
        _items = _items.filter(i => _key(i.id, i.size) !== k);
        _save();
        _notify();
    }

    /**
     * Set an explicit quantity for a product+size.
     * If qty < MIN_QTY the item is removed.
     * Rejects: NaN, Infinity, decimals, negatives, zero.
     * @param {string} productId
     * @param {string} size
     * @param {number|string} qty
     */
    function setQuantity(productId, size, qty) {
        const n = _safeQty(qty);
        // _safeQty returns MIN_QTY for invalid values; treat original < MIN as remove
        const original = Number(qty);
        if (!Number.isFinite(original) || original < MIN_QTY) {
            remove(productId, size);
            return;
        }
        const k = _key(productId, size);
        const existing = _items.find(i => _key(i.id, i.size) === k);
        if (existing) {
            existing.qty = n;
            _save();
            _notify();
        }
    }

    /** Remove all items from the cart. */
    function clear() {
        _items = [];
        _save();
        _notify();
    }

    /**
     * Returns an array of enriched cart line items.
     * Prices are derived exclusively from products.js — never from stored data.
     * @returns {{ product: object, size: string, qty: number, unitPrice: number, lineTotal: number }[]}
     */
    function getItems() {
        return _items.reduce((acc, entry) => {
            const product = _findProduct(entry.id);
            if (!product) return acc;
            if (!_validSize(product, entry.size)) return acc;

            // sizes values are variant objects {type, label, price, scale} in v4
            const variantData = product.sizes[entry.size];
            const unitPrice   = (variantData && typeof variantData === 'object')
                                    ? variantData.price
                                    : (typeof variantData === 'number' ? variantData : 0);
            acc.push({
                product,
                size:      entry.size,
                qty:       entry.qty,
                unitPrice,
                lineTotal: unitPrice * entry.qty
            });
            return acc;
        }, []);
    }

    /**
     * Calculate and return the grand total.
     * Always computed from products.js × stored quantities.
     * @returns {number}
     */
    function getTotal() {
        return getItems().reduce((sum, item) => sum + item.lineTotal, 0);
    }

    /**
     * Return the total number of units across all cart entries.
     * @returns {number}
     */
    function getTotalQty() {
        return _items.reduce((sum, i) => sum + i.qty, 0);
    }

    /**
     * Register a listener to be called whenever the cart changes.
     * @param {Function} callback
     */
    function onChange(callback) {
        if (typeof callback === 'function') _listeners.push(callback);
    }

    /** Return the placeholder image path. */
    function getPlaceholderImage() { return PLACEHOLDER; }

    // Initialise by loading persisted data
    _load();

    return Object.freeze({
        add, remove, setQuantity, clear,
        getItems, getTotal, getTotalQty, onChange,
        getPlaceholderImage
    });
})();
