/**
 * Arabian Perfume Lab — Checkout Module
 *
 * Implements the multi-step checkout flow:
 *   Cart → Customer Details → Order Summary → WhatsApp
 *
 * Security notes:
 *   - Customer details are kept in a module-scoped variable (_session) only
 *     for the duration of the checkout session.
 *   - No customer PII is written to localStorage, URLs, or DOM attributes.
 *   - Prices are sourced exclusively from Cart.getItems() / Cart.getTotal().
 *   - The WhatsApp number is read from config.js (BUSINESS.whatsapp).
 *
 * Depends on: config.js, products.js, cart.js, app.js (formatINR, formatSizeKey)
 */

const Checkout = (() => {

    /* ── Constants ─────────────────────────────────────────────── */

    const DELIVERY_CHARGE = 99;

    /* ── In-memory session (cleared on close) ──────────────────── */

    let _session = {
        name:    '',
        phone:   '',
        address: ''
    };

    /* ── DOM helpers ───────────────────────────────────────────── */

    function _el(id) { return document.getElementById(id); }

    function _formatINR(amount) {
        // Mirror app.js formatINR; works even before app.js runs
        if (typeof formatINR === 'function') return formatINR(amount);
        return '\u20B9' + Number(amount).toLocaleString('en-IN');
    }

    function _formatSizeKey(sizeKey) {
        if (typeof formatSizeKey === 'function') return formatSizeKey(sizeKey);
        return sizeKey;
    }

    /* ── Phone validation ──────────────────────────────────────── */

    /**
     * Normalise an Indian phone number input.
     * Accepts:
     *   9876543210
     *   +91 9876543210   (with optional space after country code)
     *   919876543210
     * Returns the raw 10-digit number or null if invalid.
     */
    function _normalisePhone(raw) {
        if (typeof raw !== 'string') return null;
        let s = raw.trim();

        // Strip leading +91 or 91 (country code)
        if (s.startsWith('+91')) s = s.slice(3).trim();
        else if (s.startsWith('91') && s.length > 10) s = s.slice(2).trim();

        // Remove remaining non-digit characters
        s = s.replace(/\D/g, '');

        // Must be exactly 10 digits
        if (s.length !== 10) return null;

        // Indian mobile numbers start with 6-9
        if (!/^[6-9]/.test(s)) return null;

        return s;
    }

    /* ── Validation ────────────────────────────────────────────── */

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

    /**
     * Validate the customer-details form.
     * Returns true if valid; false with inline errors if not.
     */
    function _validateDetails() {
        const name    = (_el('checkout-name')    ? _el('checkout-name').value.trim()    : '');
        const phoneRaw = (_el('checkout-phone')   ? _el('checkout-phone').value.trim()   : '');
        const address = (_el('checkout-address') ? _el('checkout-address').value.trim() : '');

        _clearError('checkout-name',    'checkout-name-error');
        _clearError('checkout-phone',   'checkout-phone-error');
        _clearError('checkout-address', 'checkout-address-error');

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

        return valid;
    }

    /* ── Step navigation ───────────────────────────────────────── */

    function _showStep(stepId) {
        const steps = ['checkout-step-details', 'checkout-step-summary'];
        steps.forEach(id => {
            const el = _el(id);
            if (el) el.style.display = (id === stepId) ? '' : 'none';
        });
        // Scroll dialog to top
        const dialog = document.querySelector('#checkout-modal .modal-dialog');
        if (dialog) dialog.scrollTop = 0;
    }

    /* ── Build order summary step ──────────────────────────────── */

    function _populateSummary() {
        const cartItems = Cart.getItems();
        const subtotal  = Cart.getTotal();
        const total     = subtotal + DELIVERY_CHARGE;

        // Products list
        const container = _el('checkout-summary-items');
        if (container) {
            container.innerHTML = '';
            cartItems.forEach(({ product, size, qty, unitPrice, lineTotal }) => {
                const row = document.createElement('div');
                row.className = 'checkout-summary-item';

                const left = document.createElement('div');
                const nameEl = document.createElement('div');
                nameEl.className = 'checkout-summary-item-name';
                nameEl.textContent = product.name;
                const sub = document.createElement('div');
                sub.className = 'checkout-summary-item-sub';
                sub.textContent = _formatSizeKey(size) + ' \u00D7 ' + qty;
                left.appendChild(nameEl);
                left.appendChild(sub);

                const priceEl = document.createElement('div');
                priceEl.className = 'checkout-summary-item-price';
                priceEl.textContent = _formatINR(lineTotal);

                row.appendChild(left);
                row.appendChild(priceEl);
                container.appendChild(row);
            });
        }

        // Pricing
        const subtotalEl  = _el('checkout-subtotal-amount');
        const deliveryEl  = _el('checkout-delivery-amount');
        const totalEl     = _el('checkout-total-amount');

        if (subtotalEl) subtotalEl.textContent = _formatINR(subtotal);
        if (deliveryEl) deliveryEl.textContent = _formatINR(DELIVERY_CHARGE);
        if (totalEl)    totalEl.textContent    = _formatINR(total);

        // Customer recap
        const summaryName    = _el('summary-name');
        const summaryPhone   = _el('summary-phone');
        const summaryAddress = _el('summary-address');

        if (summaryName)    summaryName.textContent    = _session.name;
        if (summaryPhone)   summaryPhone.textContent   = _session.phone;
        if (summaryAddress) summaryAddress.textContent = _session.address;
    }

    /* ── WhatsApp message builder ──────────────────────────────── */

    function _buildWhatsAppMessage() {
        const cartItems = Cart.getItems();
        const subtotal  = Cart.getTotal();
        const total     = subtotal + DELIVERY_CHARGE;

        const sep = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500';

        const lines = [
            '*NEW ORDER - ' + (BUSINESS.name || 'ARABIAN PERFUME LAB').toUpperCase() + '*',
            '',
            '*Customer Details*',
            'Name: ' + _session.name,
            'Phone: ' + _session.phone,
            'Delivery Address:',
            _session.address,
            '',
            sep,
            '*Order Details*',
            sep,
            ''
        ];

        cartItems.forEach((item, index) => {
            const sizeLabel = _formatSizeKey(item.size);
            lines.push((index + 1) + '. ' + item.product.name);
            lines.push('   Size: ' + sizeLabel);
            lines.push('   Quantity: ' + item.qty);
            lines.push('   Price: ' + _formatINR(item.lineTotal));
            lines.push('');
        });

        lines.push(sep);
        lines.push('*Order Summary*');
        lines.push('');
        lines.push('Subtotal: ' + _formatINR(subtotal));
        lines.push('Delivery Charges: ' + _formatINR(DELIVERY_CHARGE));
        lines.push('*Total: ' + _formatINR(total) + '*');
        lines.push('');
        lines.push('Please confirm the order and delivery details.');

        return lines.join('\n');
    }

    /* ── Open / Close modal ────────────────────────────────────── */

    function openCheckout() {
        const cartItems = Cart.getItems();
        if (!cartItems.length) {
            if (typeof showToast === 'function') {
                showToast('Your cart is empty. Add a fragrance first.');
            }
            return;
        }

        // Reset to step 1 every time
        _showStep('checkout-step-details');

        // Pre-fill fields from session (retains values if user went back)
        const nameInput    = _el('checkout-name');
        const phoneInput   = _el('checkout-phone');
        const addressInput = _el('checkout-address');

        if (nameInput)    nameInput.value    = _session.name;
        if (phoneInput)   phoneInput.value   = _session.phone;
        if (addressInput) addressInput.value = _session.address;

        // Clear stale validation state
        _clearError('checkout-name',    'checkout-name-error');
        _clearError('checkout-phone',   'checkout-phone-error');
        _clearError('checkout-address', 'checkout-address-error');

        // Show modal
        const modal = _el('checkout-modal');
        if (modal) {
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            // Focus first field
            if (nameInput) setTimeout(() => nameInput.focus(), 120);
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

    /* ── Wire up event listeners ───────────────────────────────── */

    function init() {
        /* Close button */
        const closeBtn = _el('checkout-modal-close');
        if (closeBtn) closeBtn.addEventListener('click', closeCheckout);

        /* Backdrop click closes */
        const modal = _el('checkout-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeCheckout();
            });
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeCheckout();
            });
        }

        /* "Review Order" — validate details and advance to summary */
        const reviewBtn = _el('checkout-review-btn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                if (!_validateDetails()) return;

                // Persist to session
                _session.name    = _el('checkout-name').value.trim();
                _session.phone   = _normalisePhone(_el('checkout-phone').value) || _el('checkout-phone').value.trim();
                _session.address = _el('checkout-address').value.trim();

                _populateSummary();
                _showStep('checkout-step-summary');
            });
        }

        /* "Back to Cart" from details step — close checkout, open cart */
        const backToCartBtn = _el('checkout-back-to-cart-btn');
        if (backToCartBtn) {
            backToCartBtn.addEventListener('click', () => {
                closeCheckout();
                if (typeof openCartDrawer === 'function') openCartDrawer();
            });
        }

        /* "Edit Details" — go back to step 1 */
        const editBtn = _el('checkout-edit-details-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => _showStep('checkout-step-details'));
        }

        /* "Back to Cart" from summary step */
        const backToCartBtn2 = _el('checkout-back-to-cart-btn-2');
        if (backToCartBtn2) {
            backToCartBtn2.addEventListener('click', () => {
                closeCheckout();
                if (typeof openCartDrawer === 'function') openCartDrawer();
            });
        }

        /* "Confirm & Order on WhatsApp" */
        const confirmBtn = _el('checkout-confirm-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                // Guard: cart must still have items
                if (Cart.getItems().length === 0) {
                    if (typeof showToast === 'function') showToast('Your cart is empty.');
                    return;
                }

                const message = _buildWhatsAppMessage();
                const number  = String(BUSINESS.whatsapp).replace(/\D/g, '');
                const url     = 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);

                // Clear session after sending
                _session = { name: '', phone: '', address: '' };
                closeCheckout();

                window.open(url, '_blank', 'noopener,noreferrer');
            });
        }

        /* Live validation — clear error as soon as user starts typing */
        ['checkout-name', 'checkout-phone', 'checkout-address'].forEach(fieldId => {
            const input = _el(fieldId);
            const errorId = fieldId + '-error';
            if (input) {
                input.addEventListener('input', () => {
                    _clearError(fieldId, errorId);
                });
            }
        });
    }

    return Object.freeze({ init, openCheckout, closeCheckout });
})();

// Auto-initialise when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Checkout.init());
} else {
    Checkout.init();
}
