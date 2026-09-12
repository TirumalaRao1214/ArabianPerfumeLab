/**
 * Arabian Perfume Lab — Business Configuration
 *
 * Edit this file to update business contact information, social links,
 * and operational hours. This is the single source of truth for all
 * business metadata used across the website.
 *
 * WhatsApp number must contain digits only (no +, spaces, or dashes).
 * Example: "919030547400" for +91 90305 47400
 */

const BUSINESS = Object.freeze({
    name:        "Arabian Perfume Lab",
    tagline:     "The Art of Arabian Perfumery",
    subTagline:  "Maison de Haute Parfumerie",

    // WhatsApp: digits only, include country code (no +, spaces, dashes)
    whatsapp:    "919030547400",

    // Phone for tel: links
    phone:       "09030547400",
    phoneDisplay: "+91 90305 47400",

    // Social & Maps — normal external links, no APIs
    instagram:   "https://www.instagram.com/arabian__perfume_lab/",
    youtube:     "https://www.youtube.com/channel/UCqRcW2Npl2-jANwU5u1naQA",
    maps:        "https://maps.google.com/?q=Besides+Lalitha+Hospital+Kothapeta+Guntur+Andhra+Pradesh",

    // Physical address
    address:     "Besides Lalitha Hospital, Opposite Vijay Theatre, Kothapeta, Guntur, Andhra Pradesh 522001",
    city:        "Guntur, Andhra Pradesh, India",

    // Business hours
    hours:       "Mon – Sat: 10:00 AM – 9:00 PM",
    hoursSunday: "Sunday: 11:00 AM – 7:00 PM",

    // Email (display only — no mailto backend)
    email:       "contact@arabianperfumelab.com",

    // Announcement bar offer
    offer:       "50ml Perfumes from ₹899 · 100ml from ₹1,599 · Attars ₹400/₹800 · Free Shipping on WhatsApp Orders"
});
