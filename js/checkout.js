/**
 * Arabian Perfume Lab — Checkout Module (v2)
 *
 * Multi-step checkout flow:
 *   Cart → Customer Details → Order Summary → WhatsApp
 *
 * New in v2:
 *   - Pincode field (6-digit Indian pincode, required)
 *   - Conditional delivery charge: FREE above ₹1,000; ₹99 otherwise
 *   - Dynamic free-delivery progress message (also exported for cart use)
 *
 * Security:
 *   - Customer PII kept only in module-scoped _session (not localStorage/URLs)
 *   - Prices sourced exclusively from Cart.getItems() / Cart.getTotal()
 *   - WhatsApp number from config.js (BUSINESS.whatsapp)
 *
 * Depends on: config.js, products.js, cart.js
 *             app.js globals used at call-time: formatINR, formatSizeKey, showToast, openCartDrawer
 */

const Checkout = (() => {

    /* ── Delivery constants ─────────────────────────────────────── */

    const FREE_DELIVERY_THRESHOLD  = 1000;   // subtotal must be ABOVE this for free delivery
    const STANDARD_DELIVERY_CHARGE = 99;

    /* ── In-memory session (never written to storage/URLs) ──────── */

    let _session = {
        name:    '',
        phone:   '',
        address: '',
        pincode: ''
    };

    /* ── DOM helper ─────────────────────────────────────────────── */

    function _el(id) { return document.getElementById(id); }

    /* ── Formatting helpers (call app.js versions at runtime) ───── */

    function _fmt(amount) {
        if (typeof formatINR === 'function') return formatINR(amount);
        return '\u20B9' + Number(amount).toLocaleString('en-IN');
    }

    function _fmtSize(sizeKey) {
        if (typeof formatSizeKey === 'function') return formatSizeKey(sizeKey);
        return sizeKey;
    }

    /* ── Delivery charge calculator ─────────────────────────────── */

    /**
     * Returns the delivery charge for a given subtotal.
     * subtotal > FREE_DELIVERY_THRESHOLD  → 0  (free)
     * subtotal ≤ FREE_DELIVERY_THRESHOLD  → STANDARD_DELIVERY_CHARGE (₹99)
     */
    function calcDelivery(subtotal) {
        return subtotal > FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_CHARGE;
    }

    /**
     * Returns a human-readable free-delivery progress message.
     * Exported so the cart drawer can also call it.
     */
    function deliveryMessage(subtotal) {
        if (subtotal > FREE_DELIVERY_THRESHOLD) {
            return '\uD83C\uDF89 You qualify for FREE delivery!';
        }
        const needed = FREE_DELIVERY_THRESHOLD + 1 - subtotal;  // ₹1 above the threshold
        return 'Add ' + _fmt(needed) + ' more to get FREE delivery.';
    }

    /* ── Phone validation ───────────────────────────────────────── */

    /**
     * Normalises an Indian mobile number.
     * Accepts: 9876543210 | +91 9876543210 | 919876543210
     * Returns 10-digit string or null.
     */
    function _normalisePhone(raw) {
        if (typeof raw !== 'string') return null;
        let s = raw.trim();
        if (s.startsWith('+91')) s = s.slice(3).trim();
        else if (s.startsWith('91') && s.length > 10) s = s.slice(2).trim();
        s = s.replace(/\D/g, '');
        if (s.length !== 10) return null;
        if (!/^[6-9]/.test(s)) return null;
        return s;
    }

    /* ── Pincode validation ─────────────────────────────────────── */

    function _validatePincode(raw) {
        if (typeof raw !== 'string') return false;
        const s = raw.trim();
        return /^\d{6}$/.test(s);
    }

    /* ── Field error helpers ────────────────────────────────────── */

    function _clearError(fieldId, errorId) {
        const input = _el(fieldId);
        const err   = _el(errorId);
        if (input) input.classList.remove('invalid');
        if (err)   err.textContent = '';
    }

    function _showError(fieldId, errorId, message) {
        const input = _el(fieldId);
        const err   = _el(errorId);
        if (input) input.classList.add('invalid');
        if (err)   err.textContent = message;
    }

    /* ── Form validation ────────────────────────────────────────── */

    function _validateDetails() {
        const name     = _el('checkout-name')    ? _el('checkout-name').value.trim()    : '';
        const phoneRaw = _el('checkout-phone')   ? _el('checkout-phone').value.trim()   : '';
        const address  = _el('checkout-address') ? _el('checkout-address').value.trim() : '';
        const pincode  = _el('checkout-pincode') ? _el('checkout-pincode').value.trim() : '';

        _clearError('checkout-name',    'checkout-name-error');
        _clearError('checkout-phone',   'checkout-phone-error');
        _clearError('checkout-address', 'checkout-address-error');
        _clearError('checkout-pincode', 'checkout-pincode-error');

        let valid = true;

        if (!name) {
            _showError('checkout-name', 'checkout-name-error', 'Please enter your name.');
            valid = false;
        }

        const normPhone = _normalisePhone(phoneRaw);
        if (!phoneRaw) {
            _showError('checkout-phone', 'checkout-phone-error', 'Please enter your mobile number.');
            valid = false;
        } else if (!normPhone) {
            _showError('checkout-phone', 'checkout-phone-error', 'Please enter a valid 10-digit mobile number.');
            valid = false;
        }

        if (!address) {
            _showError('checkout-address', 'checkout-address-error', 'Please enter your delivery address.');
            valid = false;
        }

        if (!pincode) {
            _showError('checkout-pincode', 'checkout-pincode-error', 'Please enter your pincode.');
            valid = false;
        } else if (!_validatePincode(pincode)) {
            _showError('checkout-pincode', 'checkout-pincode-error', 'Please enter a valid 6-digit pincode.');
            valid = false;
        }

        return valid;
    }

    /* ── Step navigation ────────────────────────────────────────── */

    function _showStep(stepId) {
        ['checkout-step-details', 'checkout-step-summary'].forEach(id => {
            const el = _el(id);
            if (el) el.style.display = (id === stepId) ? '' : 'none';
        });
        const dialog = document.querySelector('#checkout-modal .modal-dialog');
        if (dialog) dialog.scrollTop = 0;
    }

    /* ── Populate order summary step ────────────────────────────── */

    function _populateSummary() {
        const cartItems    = Cart.getItems();
        const subtotal     = Cart.getTotal();
        const delivery     = calcDelivery(subtotal);
        const total        = subtotal + delivery;
        const isFree       = delivery === 0;

        // Products list
        const container = _el('checkout-summary-items');
        if (container) {
            container.innerHTML = '';
            cartItems.forEach(({ product, size, qty, lineTotal }) => {
                const row = document.createElement('div');
                row.className = 'checkout-summary-item';

                const left = document.createElement('div');
                const nameEl = document.createElement('div');
                nameEl.className = 'checkout-summary-item-name';
                nameEl.textContent = product.name;
                const sub = document.createElement('div');
                sub.className = 'checkout-summary-item-sub';
                sub.textContent = _fmtSize(size) + ' \u00D7 ' + qty;
                left.appendChild(nameEl);
                left.appendChild(sub);

                const priceEl = document.createElement('div');
                priceEl.className = 'checkout-summary-item-price';
                priceEl.textContent = _fmt(lineTotal);

                row.appendChild(left);
                row.appendChild(priceEl);
                container.appendChild(row);
            });
        }

        // Pricing
        const subtotalEl  = _el('checkout-subtotal-amount');
        const deliveryEl  = _el('checkout-delivery-amount');
        const totalEl     = _el('checkout-total-amount');
        const deliveryRow = _el('checkout-delivery-row');

        if (subtotalEl) subtotalEl.textContent = _fmt(subtotal);
        if (deliveryEl) {
            deliveryEl.textContent = isFree ? 'FREE' : _fmt(delivery);
            deliveryEl.className   = 'checkout-delivery-value' + (isFree ? ' free-delivery-badge' : '');
        }
        if (deliveryRow) deliveryRow.className = 'checkout-price-row' + (isFree ? ' delivery-free-row' : '');
        if (totalEl) totalEl.textContent = _fmt(total);

        // Free-delivery banner in summary
        const bannerEl = _el('checkout-summary-delivery-banner');
        if (bannerEl) {
            bannerEl.textContent  = deliveryMessage(subtotal);
            bannerEl.className    = 'checkout-delivery-banner' + (isFree ? ' is-free' : '');
        }

        // Customer recap
        if (_el('summary-name'))    _el('summary-name').textContent    = _session.name;
        if (_el('summary-phone'))   _el('summary-phone').textContent   = _session.phone;
        if (_el('summary-address')) _el('summary-address').textContent = _session.address;
        if (_el('summary-pincode')) _el('summary-pincode').textContent = _session.pincode;
    }

    /* ── WhatsApp message ───────────────────────────────────────── */

    function _buildWhatsAppMessage() {
        const cartItems = Cart.getItems();
        const subtotal  = Cart.getTotal();
        const delivery  = calcDelivery(subtotal);
        const total     = subtotal + delivery;
        const isFree    = delivery === 0;

        const sep = '\u2500'.repeat(25);

        const lines = [
            '*NEW ORDER - ' + (BUSINESS.name || 'ARABIAN PERFUME LAB').toUpperCase() + '*',
            '',
            '*Customer Details*',
            '',
            'Name: ' + _session.name,
            'Phone: ' + _session.phone,
            '',
            'Delivery Address:',
            _session.address,
            '',
            'Pincode: ' + _session.pincode,
            '',
            sep,
            '*Order Details*',
            sep,
            ''
        ];

        cartItems.forEach((item, index) => {
            lines.push((index + 1) + '. ' + item.product.name);
            lines.push('   Size: ' + _fmtSize(item.size));
            lines.push('   Quantity: ' + item.qty);
            lines.push('   Price: ' + _fmt(item.lineTotal));
            lines.push('');
        });

        lines.push(sep);
        lines.push('*Order Summary*');
        lines.push('');
        lines.push('Subtotal: ' + _fmt(subtotal));
        lines.push('Delivery Charges: ' + (isFree ? 'FREE' : _fmt(delivery)));
        lines.push('*Total: ' + _fmt(total) + '*');
        lines.push('');
        lines.push('Please confirm the order and delivery details.');

        return lines.join('\n');
    }

    /* ── Open / Close ───────────────────────────────────────────── */

    function _updateDetailsPreview() {
        const subtotal = Cart.getTotal();
        const isFree   = calcDelivery(subtotal) === 0;

        const previewEl  = _el('checkout-details-subtotal');
        const bannerEl   = _el('checkout-details-delivery-banner');

        if (previewEl)  previewEl.textContent = _fmt(subtotal);
        if (bannerEl) {
            bannerEl.textContent = deliveryMessage(subtotal);
            bannerEl.className   = 'checkout-cart-preview-banner' + (isFree ? ' is-free' : '');
        }
    }

    function openCheckout() {
        if (!Cart.getItems().length) {
            if (typeof showToast === 'function') showToast('Your cart is empty. Add a fragrance first.');
            return;
        }

        _showStep('checkout-step-details');
        _updateDetailsPreview();

        // Pre-fill from session so "Back" preserves input
        const fields = ['checkout-name', 'checkout-phone', 'checkout-address', 'checkout-pincode'];
        const keys   = ['name', 'phone', 'address', 'pincode'];
        fields.forEach((id, i) => {
            const el = _el(id);
            if (el) el.value = _session[keys[i]];
        });

        // Clear stale errors
        fields.forEach(id => _clearError(id, id + '-error'));

        const modal = _el('checkout-modal');
        if (modal) {
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            const first = _el('checkout-name');
            if (first) setTimeout(() => first.focus(), 120);
        }
    }

    function closeCheckout() {
        const modal = _el('checkout-modal');
        if (modal) {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    /* ── Event wiring ───────────────────────────────────────────── */

    function init() {
        /* Close button */
        const closeBtn = _el('checkout-modal-close');
        if (closeBtn) closeBtn.addEventListener('click', closeCheckout);

        /* Backdrop click */
        const modal = _el('checkout-modal');
        if (modal) {
            modal.addEventListener('click', e => { if (e.target === modal) closeCheckout(); });
            modal.addEventListener('keydown', e => { if (e.key === 'Escape') closeCheckout(); });
        }

        /* "Review Order" → validate → go to summary */
        const reviewBtn = _el('checkout-review-btn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                if (!_validateDetails()) return;

                _session.name    = _el('checkout-name').value.trim();
                _session.phone   = _normalisePhone(_el('checkout-phone').value) || _el('checkout-phone').value.trim();
                _session.address = _el('checkout-address').value.trim();
                _session.pincode = _el('checkout-pincode').value.trim();

                _populateSummary();
                _showStep('checkout-step-summary');
            });
        }

        /* "← Back to Cart" from details step */
        const backBtn1 = _el('checkout-back-to-cart-btn');
        if (backBtn1) {
            backBtn1.addEventListener('click', () => {
                closeCheckout();
                if (typeof openCartDrawer === 'function') openCartDrawer();
            });
        }

        /* "← Edit Details" from summary step */
        const editBtn = _el('checkout-edit-details-btn');
        if (editBtn) editBtn.addEventListener('click', () => {
            _showStep('checkout-step-details');
            _updateDetailsPreview();
        });

        /* "Back to Cart" from summary step */
        const backBtn2 = _el('checkout-back-to-cart-btn-2');
        if (backBtn2) {
            backBtn2.addEventListener('click', () => {
                closeCheckout();
                if (typeof openCartDrawer === 'function') openCartDrawer();
            });
        }

        /* "Confirm & Order on WhatsApp" */
        const confirmBtn = _el('checkout-confirm-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (!Cart.getItems().length) {
                    if (typeof showToast === 'function') showToast('Your cart is empty.');
                    return;
                }

                const message = _buildWhatsAppMessage();
                const number  = String(BUSINESS.whatsapp).replace(/\D/g, '');
                const url     = 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);

                // Clear PII from session after handoff
                _session = { name: '', phone: '', address: '', pincode: '' };
                // Clear the cart after the order is sent
                Cart.clear();
                closeCheckout();
                window.open(url, '_blank', 'noopener,noreferrer');
            });
        }

        /* Live clear-on-input for all four fields */
        ['checkout-name', 'checkout-phone', 'checkout-address', 'checkout-pincode'].forEach(id => {
            const input = _el(id);
            if (input) input.addEventListener('input', () => _clearError(id, id + '-error'));
        });

        /* Pincode: restrict to digits only while typing */
        const pincodeInput = _el('checkout-pincode');
        if (pincodeInput) {
            pincodeInput.addEventListener('keypress', e => {
                if (!/\d/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                }
            });
            pincodeInput.addEventListener('input', () => {
                // Strip non-digits silently
                pincodeInput.value = pincodeInput.value.replace(/\D/g, '').slice(0, 6);
            });
        }
    }

    return Object.freeze({ init, openCheckout, closeCheckout, calcDelivery, deliveryMessage });
})();

// Auto-initialise
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Checkout.init());
} else {
    Checkout.init();
}
