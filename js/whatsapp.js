/**
 * Arabian Perfume Lab — WhatsApp Order Module (v2)
 *
 * Generates a properly formatted, URL-encoded WhatsApp click-to-chat URL
 * from the current cart state. Prices are derived from the cart module which
 * in turn reads them exclusively from products.js.
 *
 * No WhatsApp API is used — this is a plain wa.me click-to-chat link.
 * No API key is required.
 * The business WhatsApp number is read from config.js (BUSINESS.whatsapp).
 *
 * Depends on: config.js, products.js, cart.js
 */

const WhatsApp = (() => {

    /**
     * Format a number as Indian Rupee with locale formatting.
     * @param {number} amount
     * @returns {string}  e.g. "₹2,499"
     */
    function _formatPrice(amount) {
        return '\u20B9' + Number(amount).toLocaleString('en-IN');
    }

    /**
     * Build the plain-text order message from current cart contents.
     * All prices are sourced from Cart.getItems() → products.js.
     * @param {Array} cartItems  — result of Cart.getItems()
     * @param {number} total     — result of Cart.getTotal()
     * @returns {string}
     */
    function _buildMessage(cartItems, total) {
        const separator = '------------------------';

        // Header
        const lines = [
            'Hello ' + BUSINESS.name + ',',
            '',
            'I would like to place an order.',
            '',
            'ORDER DETAILS',
            separator
        ];

        // Line items
        cartItems.forEach((item, index) => {
            const p         = item.product;
            const unitPrice = _formatPrice(item.unitPrice);   // from catalog
            const lineTot   = _formatPrice(item.lineTotal);   // unitPrice × qty

            lines.push((index + 1) + '. ' + p.brand + ' — ' + p.name);
            lines.push(item.size + ' \u00D7 ' + item.qty);   // e.g. 50ml × 2
            lines.push(unitPrice + ' \u00D7 ' + item.qty + ' = ' + lineTot);
            lines.push('');
        });

        // Totals block
        lines.push(separator);
        lines.push('TOTAL: ' + _formatPrice(total));
        lines.push(separator);
        lines.push('');

        // Confirmation note — spec §14 / §6
        lines.push('Note: Prices are subject to confirmation by ' + BUSINESS.name + '.');
        lines.push('');
        lines.push('Please confirm my order.');
        lines.push('');
        lines.push('Thank you.');

        return lines.join('\n');
    }

    /**
     * Generate the complete WhatsApp wa.me URL for the current cart.
     * Returns null if the cart is empty.
     * @returns {string|null}
     */
    function generateURL() {
        const cartItems = Cart.getItems();
        if (cartItems.length === 0) return null;

        const total   = Cart.getTotal();
        const message = _buildMessage(cartItems, total);

        // BUSINESS.whatsapp must be digits only — sanitise defensively
        const number  = String(BUSINESS.whatsapp).replace(/\D/g, '');
        const encoded = encodeURIComponent(message);

        return 'https://wa.me/' + number + '?text=' + encoded;
    }

    /**
     * Open the WhatsApp order in a new tab.
     * safe window.open flags prevent opener access.
     * @returns {boolean} true if opened, false if cart was empty.
     */
    function openOrder() {
        const url = generateURL();
        if (!url) return false;
        window.open(url, '_blank', 'noopener,noreferrer');
        return true;
    }

    return Object.freeze({ generateURL, openOrder });
})();
