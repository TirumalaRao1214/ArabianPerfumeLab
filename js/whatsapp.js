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
     * All prices are sourced from Cart.getItems() → products.js — never from
     * DOM values, URL parameters, or any client-supplied source.
     *
     * The message is labelled "ORDER REQUEST" (not "Order Confirmed") to make
     * clear that Arabian Perfume Lab must confirm price and availability.
     *
     * @param {Array}  cartItems — result of Cart.getItems()
     * @param {number} total     — result of Cart.getTotal()
     * @returns {string}
     */
    function _buildMessage(cartItems, total) {
        const separator = '─────────────────────────';

        // Header — clearly labelled as a REQUEST, not a confirmed order
        const lines = [
            'Hello ' + BUSINESS.name + ',',
            '',
            '🛒 ORDER REQUEST',
            '(This is a request — not a confirmed order.)',
            '',
            'ORDER DETAILS',
            separator
        ];

        // Line items — prices from catalogue (products.js) only
        cartItems.forEach((item, index) => {
            const p         = item.product;
            const unitPrice = _formatPrice(item.unitPrice);   // from catalogue
            const lineTot   = _formatPrice(item.lineTotal);   // unitPrice × qty

            lines.push((index + 1) + '. ' + p.brand + ' \u2014 ' + p.name);
            lines.push('   Size: ' + item.size);
            lines.push('   ' + unitPrice + ' \u00D7 ' + item.qty + ' = ' + lineTot);
            lines.push('');
        });

        // Totals block
        lines.push(separator);
        lines.push('CATALOGUE TOTAL: ' + _formatPrice(total));
        lines.push(separator);
        lines.push('');

        // Mandatory price disclaimer — §9 of the security specification
        lines.push('IMPORTANT:');
        lines.push('Prices shown are based on the current catalogue.');
        lines.push('Final price, availability and delivery charges will');
        lines.push('be confirmed by ' + BUSINESS.name + ' through WhatsApp.');
        lines.push('');
        lines.push('Please confirm availability and final price.');
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
