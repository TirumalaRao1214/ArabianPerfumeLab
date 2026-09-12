/**
 * Arabian Perfume Lab — Cart Module (v2)
 *
 * Security contract:
 *   - localStorage stores ONLY { id: string, size: string, qty: number } tuples.
 *   - Prices are NEVER stored in localStorage or read from DOM attributes.
 *   - All pricing is derived exclusively from products.js → product.sizes[size].
 *   - Cart key is composite: id + ':' + size (e.g. "dior-sauvage:50ml").
 *   - Quantities are validated: positive integers, 1–99 inclusive.
 *   - Unknown product IDs or sizes are silently discarded on load.
 *   - No eval(), no new Function(), no innerHTML for user-derived data.
 */

const Cart = (() => {
    const STORAGE_KEY = 'apl_cart_v2';  // v2 — new schema includes size
    const MAX_QTY     = 99;
    const MIN_QTY     = 1;
    const PLACEHOLDER = 'assets/images/products/placeholder.svg';

    // Internal state: array of { id: string, size: string, qty: number }
    let _items = [];
    let _listeners = [];

    /* ------------------------------------------------------------------
     * Private helpers
     * ------------------------------------------------------------------ */

    /** Return the product object from the catalog, or null if not found. */
    function _findProduct(id) {
        if (typeof id !== 'string' || !id) return null;
        return products.find(p => p.id === id) || null;
    }

    /** Validate that a given size exists in a product's sizes object. */
    function _validSize(product, size) {
        if (!product || !product.sizes) return false;
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

    /** Clamp and normalise a raw quantity value to a safe integer. */
    function _clampQty(raw) {
        const n = parseInt(raw, 10);
        if (!Number.isFinite(n)) return MIN_QTY;
        return Math.max(MIN_QTY, Math.min(MAX_QTY, n));
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

    /** Load cart from localStorage. Silently drops invalid entries. */
    function _load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return;

            _items = parsed.reduce((acc, entry) => {
                if (!entry || typeof entry.id !== 'string') return acc;
                const product = _findProduct(entry.id);
                if (!product) return acc; // unknown product — discard

                const size = typeof entry.size === 'string' && _validSize(product, entry.size)
                    ? entry.size
                    : _defaultSize(product);
                if (!size) return acc;

                const qty = _clampQty(entry.qty);
                const k = _key(entry.id, size);

                // Merge duplicates
                const existing = acc.find(i => _key(i.id, i.size) === k);
                if (existing) {
                    existing.qty = _clampQty(existing.qty + qty);
                } else {
                    acc.push({ id: entry.id, size, qty });
                }
                return acc;
            }, []);
        } catch (_) {
            // Corrupted data — reset safely
            _items = [];
            try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
        }
    }

    /** Persist current cart to localStorage. Stores id, size, qty only — no prices. */
    function _save() {
        try {
            const payload = _items.map(i => ({ id: i.id, size: i.size, qty: i.qty }));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (_) {
            // Storage quota exceeded or private mode — degrade gracefully
        }
    }

    /* ------------------------------------------------------------------
     * Public API
     * ------------------------------------------------------------------ */

    /**
     * Add one unit of a product+size to the cart.
     * @param {string} productId
     * @param {string} [size]  If omitted, uses the first available size.
     * @returns {boolean} true if the product+size exists and was added
     */
    function add(productId, size) {
        const product = _findProduct(productId);
        if (!product) return false;

        const resolvedSize = (size && _validSize(product, size)) ? size : _defaultSize(product);
        if (!resolvedSize) return false;

        const k = _key(productId, resolvedSize);
        const existing = _items.find(i => _key(i.id, i.size) === k);
        if (existing) {
            existing.qty = _clampQty(existing.qty + 1);
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
     * @param {string} productId
     * @param {string} size
     * @param {number|string} qty
     */
    function setQuantity(productId, size, qty) {
        const n = parseInt(qty, 10);
        if (!Number.isFinite(n) || n < MIN_QTY) {
            remove(productId, size);
            return;
        }
        const clamped = Math.min(MAX_QTY, n);
        const k = _key(productId, size);
        const existing = _items.find(i => _key(i.id, i.size) === k);
        if (existing) {
            existing.qty = clamped;
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

            const unitPrice = product.sizes[entry.size]; // from catalog only
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
