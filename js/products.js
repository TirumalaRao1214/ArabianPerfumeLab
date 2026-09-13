/**
 * Arabian Perfume Lab â€” Complete Product Catalogue
 *
 * SINGLE SOURCE OF TRUTH for all product data including prices.
 * The cart module reads prices exclusively from here.
 * Never store or accept prices from HTML, DOM, URL, or localStorage.
 *
 * Schema:
 *   id          {string}  URL-safe unique identifier (lowercase, hyphens only)
 *   brand       {string}  Original brand this is inspired by
 *   name        {string}  Product display name
 *   collection  {string}  "standard" | "premium" | "celebrity" | "attar" | "solid"
 *   gender      {string}  "men" | "women" | "unisex"
 *   sizes       {object}  { "50ml": price, "100ml": price } â€” prices from products.js only
 *   image       {string}  Local path to bottle image
 *   imageAlt    {string}  Accessible alt text
 *   notes       {string[]} Fragrance family tags for filtering
 *   description {string}  Short product description
 *   badge       {string}  Optional badge label
 *   celebrity   {string}  For celebrity collection â€” celebrity name
 *   inspiration {string}  For celebrity collection â€” fragrance reference
 *
 * â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
 * â•‘        REAL BUSINESS PRICING                â•‘
 * â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£
 * â•‘  Attars          starting â‚¹100              â•‘
 * â•‘  Solid Perfumes  starting â‚¹99               â•‘
 * â•‘  20ml Perfume    â‚¹333 (3 for â‚¹999)          â•‘
 * â•‘  50ml Perfume    starting â‚¹499              â•‘
 * â•‘  50ml Ã— 2 Bundle â‚¹999                       â•‘
 * â•‘  100ml Perfume   starting â‚¹999              â•‘
 * â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
 *
 * Image styles (local SVGs, Arabian bottle designs):
 *   bottle-amber.svg   â€” golden/amber liquid  â†’ masculine, oud, spicy
 *   bottle-blue.svg    â€” blue liquid          â†’ aquatic, fresh, sporty
 *   bottle-rose.svg    â€” rose/pink liquid     â†’ feminine, floral
 *   bottle-light.svg   â€” pale/clear liquid    â†’ fresh, light, unisex
 *   bottle-premium.svg â€” dark glass           â†’ niche, premium, intense
 *   placeholder.svg    â€” fallback
 */

/* ---------- Image path shortcuts ---------- */
const IMG = {
    /*
     * SVG bottle illustrations â€” mapped by scent/gender profile:
     *   gold    â†’ oud, woody, spicy, amber (men)         â€” bottle-amber.svg
     *   dome    â†’ oriental, luxe, Arabian, premium        â€” bottle-amber.svg
     *   noir    â†’ dark, intense, tobacco, leather         â€” bottle-premium.svg
     *   crystal â†’ light, musk, fresh, unisex, clean       â€” bottle-light.svg
     *   emerald â†’ green, woody, herbal, earthy             â€” bottle-amber.svg
     *   blue    â†’ aquatic, citrus, fresh, sporty (men)     â€” bottle-blue.svg
     *   rose    â†’ floral, feminine, rose, fruity (women)   â€” bottle-rose.svg
     *   white   â†’ white musk, powdery, soft, unisex        â€” bottle-light.svg
     *   ruby    â†’ warm oriental, balsamic (women)          â€” bottle-rose.svg
     *   purple  â†’ spicy, mysterious, bold, unisex/women    â€” bottle-rose.svg
     *   goldHero â†’ hero / feature display                  â€” bottle-amber.svg
     */
    gold:    'assets/images/products/bottle-amber.svg',
    dome:    'assets/images/products/bottle-amber.svg',
    noir:    'assets/images/products/bottle-premium.svg',
    crystal: 'assets/images/products/bottle-light.svg',
    emerald: 'assets/images/products/bottle-amber.svg',
    blue:    'assets/images/products/bottle-blue.svg',
    rose:    'assets/images/products/bottle-rose.svg',
    white:   'assets/images/products/bottle-light.svg',
    ruby:    'assets/images/products/bottle-rose.svg',
    purple:  'assets/images/products/bottle-rose.svg',
    goldHero:'assets/images/products/bottle-amber.svg',

    ph:      'assets/images/products/placeholder.svg',

    /* ---- SKU-specific mappings (formerly photos, now SVGs) ---- */
    diorSauvage:       'assets/images/products/bottle-blue.svg',
    creedAventus:      'assets/images/products/bottle-light.svg',
    creedVikings:      'assets/images/products/bottle-blue.svg',
    azzaroMostWanted:  'assets/images/products/bottle-amber.svg',
    armaniStronger:    'assets/images/products/bottle-premium.svg',
    ronaldo:           'assets/images/products/bottle-blue.svg',
    tamDaoSrk:         'assets/images/products/bottle-light.svg',
    tobaccoOudhi:      'assets/images/products/bottle-amber.svg',

    /* ---- Non-perfume product illustrations (SVGs) ---- */
    bodyCream:          'assets/images/products/body-cream-jar.svg',
    herbalSoap:         'assets/images/products/herbal-soap.svg',
    bakhoorBurner:      'assets/images/products/bakhoor-burner.svg',
    jawadhuPowder:      'assets/images/products/jawadhu-powder.svg',
    dhoopSticks:        'assets/images/products/dhoop-sticks.svg',
    aromaBurner:        'assets/images/products/aroma-burner.svg',
    reedDiffuser:       'assets/images/products/reed-diffuser.svg',
    carPerfume:         'assets/images/products/car-perfume.svg',
    attarBottlesDisplay:'assets/images/products/attar-bottles-display.svg',
    perfumeBottlesWholesale: 'assets/images/products/perfume-bottles-wholesale.svg',
    attarGiftPack:      'assets/images/products/attar-gift-pack.svg',
    wholesaleAttar:     'assets/images/products/wholesale-attar.svg',
    attarBottle:        'assets/images/products/attar-bottle.png',
    perfumeBottle:      'assets/images/products/perfume-bottle.png'
};

/* -------------------------------------------------------
   PRICING CONSTANTS â€” edit here to change default prices
   Individual products may override with their own sizes{}.
   ------------------------------------------------------- */

/** Standard inspired perfume: 20ml / 50ml / 100ml */
const STD = { '20ml': 349, '50ml': 549, '100ml': 999 };

/** Premium EDP / niche inspired */
const PRM = { '50ml': 999, '100ml': 1899 };

/** Attar / ittar oil-based â€” 3ml, 6ml & 12ml roll-ons */
const ATTAR = { '3ml': 149, '6ml': 299, '12ml': 599 };

/** Solid perfume â€” compact / balm format */
const SOLID = { '8g': 99, '15g': 199 };

/* ============================================================
   PRODUCTS ARRAY
   ============================================================ */
const products = Object.freeze([

    /* ===========================================================
       1. DIOR
       =========================================================== */
    {
        id: 'dior-sauvage', brand: 'Dior', name: 'Sauvage',
        collection: 'standard', gender: 'men',
        sizes: { '20ml': 349, '50ml': 549, '100ml': 999 },
        mrp:   { '20ml': 499, '50ml': 799, '100ml': 1299 },
        image: IMG.diorSauvage,
        searchName: 'Dior Sauvage',
        imageAlt: 'Arabian Perfumer\'s â€” Dior Sauvage inspired 50ml bottle on black gift box',
        notes: ['Fresh', 'Woody', 'Spicy'],
        description: 'Bold and raw, a fresh-fougÃ¨re built on bergamot, Sichuan pepper, and ambroxan. Inspired by Dior Sauvage.',
        badge: 'BESTSELLER'
    },
    {
        id: 'dior-sauvage-edp', brand: 'Dior', name: 'Sauvage EDP',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Dior Sauvage EDP',
        notes: ['Fresh', 'Woody', 'Vanilla'],
        description: 'Richer and warmer than the EDT â€” lavender and vanilla deepen the rugged bergamot opening. Inspired by Dior Sauvage EDP.',
        badge: ''
    },
    {
        id: 'dior-sauvage-parfum', brand: 'Dior', name: 'Sauvage Parfum',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Dior Sauvage Parfum',
        notes: ['Woody', 'Spicy', 'Amber'],
        description: 'The extrait concentration â€” sandalwood and tonka wrap wild bergamot for maximum intensity. Inspired by Dior Sauvage Parfum.',
        badge: ''
    },
    {
        id: 'dior-homme-edt', brand: 'Dior', name: 'Homme EDT',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Dior Homme EDT',
        notes: ['Iris', 'Woody', 'Powdery'],
        description: 'Elegant iris and violet leaf on a woody base â€” the definition of modern masculine grooming. Inspired by Dior Homme EDT.',
        badge: ''
    },
    {
        id: 'dior-homme-parfum', brand: 'Dior', name: 'Homme Parfum',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Dior Homme Parfum',
        notes: ['Iris', 'Leather', 'Amber'],
        description: 'Intense iris absolute on a warm leather and amber drydown. Inspired by Dior Homme Parfum.',
        badge: ''
    },
    {
        id: 'dior-miss-dior', brand: 'Dior', name: "Miss Dior",
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: "Arabian Perfume Lab inspired bottle â€” Miss Dior",
        notes: ['Floral', 'Rose', 'Fresh'],
        description: 'A sparkling chypre of Grasse rose, patchouli, and citrus â€” feminine elegance distilled. Inspired by Miss Dior.',
        badge: ''
    },
    {
        id: 'dior-joy', brand: 'Dior', name: 'Joy by Dior',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Joy by Dior',
        notes: ['Floral', 'Musk', 'Citrus'],
        description: 'Mandarin, rose, and white musk in a radiant, joyful composition. Inspired by Joy by Dior.',
        badge: ''
    },

    /* ===========================================================
       2. TOM FORD
       =========================================================== */
    {
        id: 'tomford-oud-wood', brand: 'Tom Ford', name: 'Oud Wood',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Tom Ford Oud Wood',
        notes: ['Oud', 'Woody', 'Spicy'],
        description: 'Rare oud wood, sandalwood, rosewood, and exotic spice â€” the fragrance that made oud mainstream luxury. Inspired by Tom Ford Oud Wood.',
        badge: 'ICONIC'
    },
    {
        id: 'tomford-black-orchid', brand: 'Tom Ford', name: 'Black Orchid',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Tom Ford Black Orchid',
        notes: ['Floral', 'Dark', 'Amber'],
        description: 'Dark and opulent â€” black orchid, truffle, blackcurrant and vetiver on a patchouli base. Inspired by Tom Ford Black Orchid.',
        badge: 'NICHE EXCLUSIVE'
    },
    {
        id: 'tomford-tobacco-vanille', brand: 'Tom Ford', name: 'Tobacco Vanille',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Tom Ford Tobacco Vanille',
        notes: ['Tobacco', 'Vanilla', 'Amber'],
        description: 'Rich tobacco leaf meets sweet vanilla and dried fruit in a warm, indulgent embrace. Inspired by Tom Ford Tobacco Vanille.',
        badge: ''
    },
    {
        id: 'tomford-ombre-leather', brand: 'Tom Ford', name: 'OmbrÃ© Leather',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Tom Ford OmbrÃ© Leather',
        notes: ['Leather', 'Floral', 'Woody'],
        description: 'Bold leather accord with jasmine, patchouli, and cardamom â€” power and seduction. Inspired by Tom Ford OmbrÃ© Leather.',
        badge: ''
    },
    {
        id: 'tomford-lost-cherry', brand: 'Tom Ford', name: 'Lost Cherry',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Tom Ford Lost Cherry',
        notes: ['Cherry', 'Vanilla', 'Sweet'],
        description: 'Maraschino cherry, Turkish rose, and almond enveloped in tonka and sandalwood. Inspired by Tom Ford Lost Cherry.',
        badge: ''
    },
    {
        id: 'tomford-neroli-portofino', brand: 'Tom Ford', name: 'Neroli Portofino',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Tom Ford Neroli Portofino',
        notes: ['Citrus', 'Fresh', 'Floral'],
        description: 'Italian neroli, mandarin, and aquatic notes â€” the smell of Mediterranean sunshine. Inspired by Tom Ford Neroli Portofino.',
        badge: ''
    },
    {
        id: 'tomford-rose-prick', brand: 'Tom Ford', name: 'Rose Prick',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Tom Ford Rose Prick',
        notes: ['Rose', 'Spicy', 'Amber'],
        description: 'Turkish rose absolute spiked with Indonesian vetiver and Sichuan pepper. Inspired by Tom Ford Rose Prick.',
        badge: ''
    },

    /* ===========================================================
       3. CHANEL
       =========================================================== */
    {
        id: 'chanel-bleu', brand: 'Chanel', name: 'Bleu de Chanel EDT',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Bleu de Chanel',
        notes: ['Woody', 'Aromatic', 'Fresh'],
        description: 'Citrus, labdanum, sandalwood, and incense â€” the urbane fragrance for the modern man. Inspired by Bleu de Chanel EDT.',
        badge: 'BESTSELLER'
    },
    {
        id: 'chanel-bleu-edp', brand: 'Chanel', name: 'Bleu de Chanel EDP',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Bleu de Chanel EDP',
        notes: ['Woody', 'Aromatic', 'Amber'],
        description: 'Deeper and richer than the EDT â€” ginger and labdanum add warmth to the iconic accord. Inspired by Bleu de Chanel EDP.',
        badge: ''
    },
    {
        id: 'chanel-bleu-parfum', brand: 'Chanel', name: 'Bleu de Chanel Parfum',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Bleu de Chanel Parfum',
        notes: ['Woody', 'Amber', 'Incense'],
        description: 'The concentrated parfum version â€” sandalwood and incense anchor the blue citrus brilliantly. Inspired by Bleu de Chanel Parfum.',
        badge: ''
    },
    {
        id: 'chanel-no5', brand: 'Chanel', name: 'No.5',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Chanel No.5',
        notes: ['Floral', 'Powdery', 'Aldehyde'],
        description: 'The world\'s most iconic fragrance â€” aldehydes, ylang-ylang, rose, jasmine, and sandalwood. Inspired by Chanel No.5.',
        badge: 'ICONIC'
    },
    {
        id: 'chanel-coco-mademoiselle', brand: 'Chanel', name: 'Coco Mademoiselle',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Coco Mademoiselle',
        notes: ['Floral', 'Oriental', 'Citrus'],
        description: 'Orange, rose, and jasmine on patchouli and vanilla â€” timeless feminine chic. Inspired by Coco Mademoiselle.',
        badge: ''
    },
    {
        id: 'chanel-allure-homme-sport', brand: 'Chanel', name: 'Allure Homme Sport',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Allure Homme Sport',
        notes: ['Fresh', 'Citrus', 'Woody'],
        description: 'Sea notes, citrus, and white musk â€” clean, sporty, and effortlessly stylish. Inspired by Allure Homme Sport.',
        badge: ''
    },
    {
        id: 'chanel-chance', brand: 'Chanel', name: 'Chance',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Chanel Chance',
        notes: ['Floral', 'Fresh', 'Woody'],
        description: 'Pink pepper, jasmine, and white musk in a playful, joyful chypre. Inspired by Chanel Chance.',
        badge: ''
    },

    /* ===========================================================
       4. CREED
       =========================================================== */
    {
        id: 'creed-aventus', brand: 'Creed', name: 'Aventus',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.creedAventus,
        imageAlt: 'Arabian Perfumer\'s â€” Creed Aventus inspired bottle with Arabic tile art label',
        notes: ['Fruity', 'Woody', 'Smoky'],
        description: 'Pineapple, blackcurrant, birch, and oakmoss â€” the scent of success and strength. Inspired by Creed Aventus.',
        badge: 'ICONIC'
    },
    {
        id: 'creed-viking', brand: 'Creed', name: 'Viking',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.creedVikings,
        imageAlt: 'Arabian Perfumer\'s â€” Creed Vikings inspired bottle with cricket silhouette red label',
        notes: ['Spicy', 'Woody', 'Fresh'],
        description: 'Pink pepper, lavender, and sandalwood channeling Norse warrior spirit. Inspired by Creed Viking.',
        badge: ''
    },
    {
        id: 'creed-silver-mountain-water', brand: 'Creed', name: 'Silver Mountain Water',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Creed Silver Mountain Water',
        notes: ['Aquatic', 'Green', 'Woody'],
        description: 'Green tea, neroli, and blackcurrant over sandalwood and musk. Inspired by Creed Silver Mountain Water.',
        badge: ''
    },
    {
        id: 'creed-himalaya', brand: 'Creed', name: 'Himalaya',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Creed Himalaya',
        notes: ['Fresh', 'Citrus', 'Woody'],
        description: 'Bergamot, apple, and sandalwood â€” clean freshness inspired by Himalayan glaciers. Inspired by Creed Himalaya.',
        badge: ''
    },
    {
        id: 'creed-love-in-white', brand: 'Creed', name: 'Love in White',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Creed Love in White',
        notes: ['Floral', 'Rice', 'Musk'],
        description: 'Rice, iris, magnolia and white musk â€” a purity and radiance for women. Inspired by Creed Love in White.',
        badge: ''
    },

    /* ===========================================================
       5. ARMANI
       =========================================================== */
    {
        id: 'armani-acqua-di-gio', brand: 'Armani', name: 'Acqua di GiÃ²',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Acqua di GiÃ²',
        notes: ['Aquatic', 'Citrus', 'Woody'],
        description: 'Sea notes, bergamot, and rosemary on a white musk drydown â€” the definitive aquatic fragrance. Inspired by Acqua di GiÃ².',
        badge: 'BESTSELLER'
    },
    {
        id: 'armani-acqua-di-gio-profumo', brand: 'Armani', name: 'Acqua di GiÃ² Profumo',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Acqua di GiÃ² Profumo',
        notes: ['Aquatic', 'Incense', 'Woody'],
        description: 'Aquatic marine with incense and patchouli â€” a deeper, darker dimension of the iconic ocean scent. Inspired by Acqua di GiÃ² Profumo.',
        badge: ''
    },
    {
        id: 'armani-code-homme', brand: 'Armani', name: 'Code Homme',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Armani Code Homme',
        notes: ['Oriental', 'Spicy', 'Amber'],
        description: 'Bergamot, star anise, and olive blossom on a tonka bean base. Inspired by Armani Code Homme.',
        badge: ''
    },
    {
        id: 'armani-code-profumo', brand: 'Armani', name: 'Code Profumo',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Armani Code Profumo',
        notes: ['Amber', 'Spicy', 'Tobacco'],
        description: 'Amber, cardamom, and apple create a rich oriental intensity. Inspired by Armani Code Profumo.',
        badge: ''
    },
    {
        id: 'armani-si', brand: 'Armani', name: 'SÃ¬',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Armani SÃ¬',
        notes: ['Floral', 'Chypre', 'Musk'],
        description: 'Blackcurrant, rose, and freesia on a warm patchouli and vanilla base. Inspired by Armani SÃ¬.',
        badge: ''
    },
    {
        id: 'armani-si-passione', brand: 'Armani', name: 'SÃ¬ Passione',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Armani SÃ¬ Passione',
        notes: ['Floral', 'Fruity', 'Woody'],
        description: 'Rose, peony, and peach over musk and patchouli â€” vibrant feminine intensity. Inspired by Armani SÃ¬ Passione.',
        badge: ''
    },
    {
        id: 'armani-stronger-with-u', brand: 'Armani', name: 'Stronger With You',
        collection: 'standard', gender: 'men',
        sizes: { '20ml': 349, '50ml': 549, '100ml': 999 },
        mrp:   { '20ml': 499, '50ml': 799, '100ml': 1299 },
        image: IMG.armaniStronger,
        searchName: 'Armani Stronger With You',
        imageAlt: 'Arabian Perfumer\'s â€” Armani Stronger With You 50ml inspired bottle, black and red label',
        notes: ['Spicy', 'Amber', 'Woody'],
        description: 'Chestnut, cardamom, and vanilla â€” warmth and strength combined. Inspired by Armani Stronger With You.',
        badge: 'POPULAR'
    },

    /* ===========================================================
       6. BYREDO
       =========================================================== */
    {
        id: 'byredo-bal-dafrique', brand: 'Byredo', name: "Bal d'Afrique",
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: "Arabian Perfume Lab inspired bottle â€” Byredo Bal d'Afrique",
        notes: ['Floral', 'Musk', 'Amber'],
        description: 'Neroli, violet, and African marigold over musk and cedar. Inspired by Bal d\'Afrique.',
        badge: ''
    },
    {
        id: 'byredo-mojave-ghost', brand: 'Byredo', name: 'Mojave Ghost',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Byredo Mojave Ghost',
        notes: ['Woody', 'Musk', 'Floral'],
        description: 'Desert magnolia, sandalwood, and ambrette â€” ethereal and clean. Inspired by Mojave Ghost.',
        badge: ''
    },
    {
        id: 'byredo-gypsy-water', brand: 'Byredo', name: 'Gypsy Water',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Byredo Gypsy Water',
        notes: ['Woody', 'Pine', 'Vanilla'],
        description: 'Incense, pine needles, and vanilla for a nomadic, adventurous spirit. Inspired by Gypsy Water.',
        badge: ''
    },
    {
        id: 'byredo-super-cedar', brand: 'Byredo', name: 'Super Cedar',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Byredo Super Cedar',
        notes: ['Woody', 'Rose', 'Musk'],
        description: 'Rose water, cedar, and vetiver â€” clean mineral elegance. Inspired by Super Cedar.',
        badge: ''
    },
    {
        id: 'byredo-rose-of-no-mans-land', brand: 'Byredo', name: "Rose of No Man's Land",
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: "Arabian Perfume Lab inspired bottle â€” Byredo Rose of No Man's Land",
        notes: ['Rose', 'Floral', 'Papyrus'],
        description: 'Turkish rose petals, raspberry blossom, and papyrus â€” delicate and powerful at once. Inspired by Rose of No Man\'s Land.',
        badge: ''
    },

    /* ===========================================================
       7. PACO RABANNE
       =========================================================== */
    {
        id: 'paco-1-million', brand: 'Paco Rabanne', name: '1 Million',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Paco Rabanne 1 Million',
        notes: ['Spicy', 'Leather', 'Amber'],
        description: 'Grapefruit, cinnamon, and leather with a patchouli base â€” pure olfactory gold. Inspired by 1 Million.',
        badge: 'BESTSELLER'
    },
    {
        id: 'paco-invictus', brand: 'Paco Rabanne', name: 'Invictus',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Paco Rabanne Invictus',
        notes: ['Aquatic', 'Fresh', 'Woody'],
        description: 'Grapefruit, sea notes, and guaiac wood â€” triumphant, unstoppable freshness. Inspired by Invictus.',
        badge: ''
    },
    {
        id: 'paco-invictus-legend', brand: 'Paco Rabanne', name: 'Invictus Legend',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Invictus Legend',
        notes: ['Woody', 'Spicy', 'Amber'],
        description: 'Neroli, pepper, and earthy vetiver in a bold, masculine drydown. Inspired by Invictus Legend.',
        badge: ''
    },
    {
        id: 'paco-lady-million', brand: 'Paco Rabanne', name: 'Lady Million',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Paco Rabanne Lady Million',
        notes: ['Floral', 'Honey', 'Woody'],
        description: 'Raspberry, orange blossom, jasmine and honey on a patchouli base. Inspired by Lady Million.',
        badge: ''
    },

    /* ===========================================================
       8. DAVIDOFF
       =========================================================== */
    {
        id: 'davidoff-cool-water', brand: 'Davidoff', name: 'Cool Water',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Davidoff Cool Water',
        notes: ['Aquatic', 'Fresh', 'Woody'],
        description: 'Mint, green nuances, and oakmoss â€” the original aquatic freshness. Inspired by Cool Water.',
        badge: ''
    },
    {
        id: 'davidoff-cool-water-women', brand: 'Davidoff', name: 'Cool Water Women',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Davidoff Cool Water Women',
        notes: ['Aquatic', 'Floral', 'Musk'],
        description: 'Quince, water lily, and sea spray with a musky sandalwood drydown. Inspired by Cool Water Women.',
        badge: ''
    },

    /* ===========================================================
       9. AZZARO
       =========================================================== */
    {
        id: 'azzaro-wanted', brand: 'Azzaro', name: 'Wanted',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Azzaro Wanted',
        notes: ['Spicy', 'Woody', 'Citrus'],
        description: 'Cardamom, vetiver, and guaiac wood â€” bold and magnetic. Inspired by Azzaro Wanted.',
        badge: ''
    },
    {
        id: 'azzaro-chrome', brand: 'Azzaro', name: 'Chrome',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Azzaro Chrome',
        notes: ['Citrus', 'Aquatic', 'Woody'],
        description: 'Bergamot, rosemary, and oakmoss â€” a timeless fresh-aromatic classic. Inspired by Azzaro Chrome.',
        badge: ''
    },
    {
        id: 'azzaro-most-wanted', brand: 'Azzaro', name: 'Most Wanted',
        collection: 'standard', gender: 'men',
        sizes: { '20ml': 349, '50ml': 549, '100ml': 999 },
        mrp:   { '20ml': 499, '50ml': 799, '100ml': 1299 },
        image: IMG.azzaroMostWanted,
        searchName: 'Azzaro Most Wanted',
        imageAlt: 'Arabian Perfumer\'s â€” Azzaro Most Wanted inspired bottle with colourful Arabian art label',
        notes: ['Spicy', 'Amber', 'Woody'],
        description: 'Cardamom, juniper berry, and coumarin â€” the fragrance of audacity and style. Inspired by Azzaro Most Wanted.',
        badge: 'POPULAR'
    },

    /* ===========================================================
       10. BVLGARI
       =========================================================== */
    {
        id: 'bvlgari-man-in-black', brand: 'Bvlgari', name: 'Man in Black',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Bvlgari Man in Black',
        notes: ['Amber', 'Tobacco', 'Spicy'],
        description: 'Rum, tobacco, and leather in a dark, confident oriental. Inspired by Man in Black.',
        badge: ''
    },
    {
        id: 'bvlgari-aqva', brand: 'Bvlgari', name: 'Aqva',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Bvlgari Aqva',
        notes: ['Aquatic', 'Citrus', 'Fresh'],
        description: 'Posidonia, trident marine accord, and amber wood â€” deep sea freshness. Inspired by Bvlgari Aqva.',
        badge: ''
    },
    {
        id: 'bvlgari-omnia-crystalline', brand: 'Bvlgari', name: 'Omnia Crystalline',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Bvlgari Omnia Crystalline',
        notes: ['Floral', 'Fresh', 'Woody'],
        description: 'Bamboo, lotus, and white woods â€” pure crystalline femininity. Inspired by Omnia Crystalline.',
        badge: ''
    },

    /* ===========================================================
       11. DOLCE & GABBANA
       =========================================================== */
    {
        id: 'dg-light-blue', brand: 'D&G', name: 'Light Blue',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” D&G Light Blue',
        notes: ['Citrus', 'Floral', 'Woody'],
        description: 'Sicilian lemon, apple, cedar, and white rose â€” Mediterranean summer in a bottle. Inspired by Light Blue.',
        badge: 'BESTSELLER'
    },
    {
        id: 'dg-light-blue-men', brand: 'D&G', name: 'Light Blue (Men)',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” D&G Light Blue Men',
        notes: ['Citrus', 'Aquatic', 'Woody'],
        description: 'Grapefruit, bergamot, and rosewood on a musk base. Inspired by Light Blue Men.',
        badge: ''
    },
    {
        id: 'dg-light-blue-intense', brand: 'D&G', name: 'Light Blue Intense',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” D&G Light Blue Intense',
        notes: ['Citrus', 'Floral', 'Amber'],
        description: 'An amplified, warmer version of the iconic Light Blue with added amber depth. Inspired by Light Blue Intense.',
        badge: ''
    },
    {
        id: 'dg-king', brand: 'D&G', name: 'King',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” D&G King',
        notes: ['Tobacco', 'Woody', 'Spicy'],
        description: 'Tobacco flower, sandalwood, and amber â€” regal and commanding. Inspired by D&G King.',
        badge: ''
    },
    {
        id: 'dg-queen', brand: 'D&G', name: 'Queen',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” D&G Queen',
        notes: ['Rose', 'Floral', 'Woody'],
        description: 'Raspberry, rose, and magnolia over a musk and cedarwood base. Inspired by D&G Queen.',
        badge: ''
    },

    /* ===========================================================
       12. VERSACE
       =========================================================== */
    {
        id: 'versace-eros', brand: 'Versace', name: 'Eros',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Versace Eros',
        notes: ['Minty', 'Woody', 'Vanilla'],
        description: 'Mint, green apple, and vanilla on tonka and vetiver. Inspired by Versace Eros.',
        badge: ''
    },
    {
        id: 'versace-dylan-blue', brand: 'Versace', name: 'Dylan Blue',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Versace Dylan Blue',
        notes: ['Aquatic', 'FougÃ¨re', 'Woody'],
        description: 'Aquozone, violet leaves, and papyrus on a musk drydown. Inspired by Dylan Blue.',
        badge: ''
    },
    {
        id: 'versace-bright-crystal', brand: 'Versace', name: 'Bright Crystal',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Versace Bright Crystal',
        notes: ['Floral', 'Fruity', 'Musk'],
        description: 'Pomegranate, yuzu, and water lily over musk and mahogany. Inspired by Bright Crystal.',
        badge: ''
    },
    {
        id: 'versace-crystal-noir', brand: 'Versace', name: 'Crystal Noir',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Versace Crystal Noir',
        notes: ['Floral', 'Oriental', 'Musk'],
        description: 'Ginger, cardamom, and gardenia on a musky amber. Inspired by Crystal Noir.',
        badge: ''
    },

    /* ===========================================================
       13. YSL
       =========================================================== */
    {
        id: 'ysl-la-nuit', brand: 'YSL', name: "La Nuit de L'Homme",
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: "Arabian Perfume Lab inspired bottle â€” YSL La Nuit de L'Homme",
        notes: ['Spicy', 'Woody', 'Cardamom'],
        description: 'Cardamom, cedar, and lavender in a dry, addictive Oriental. Inspired by La Nuit de L\'Homme.',
        badge: 'BESTSELLER'
    },
    {
        id: 'ysl-y-edp', brand: 'YSL', name: 'Y EDP',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” YSL Y EDP',
        notes: ['Fruity', 'Spicy', 'Woody'],
        description: 'Apple, ginger, and sage over ambergris â€” bold and contemporary. Inspired by YSL Y EDP.',
        badge: ''
    },
    {
        id: 'ysl-black-opium', brand: 'YSL', name: 'Black Opium',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” YSL Black Opium',
        notes: ['Coffee', 'Vanilla', 'Floral'],
        description: 'Black coffee, white flowers, and vanilla â€” edgy and addictive. Inspired by Black Opium.',
        badge: ''
    },
    {
        id: 'ysl-libre', brand: 'YSL', name: 'Libre',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” YSL Libre',
        notes: ['Floral', 'Lavender', 'Musk'],
        description: 'Lavender, mandarin, and jasmine on warm musk â€” freedom and femininity. Inspired by Libre.',
        badge: ''
    },

    /* ===========================================================
       14. CK (Calvin Klein)
       =========================================================== */
    {
        id: 'ck-one', brand: 'CK', name: 'CK One',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” CK One',
        notes: ['Citrus', 'Fresh', 'Musk'],
        description: 'Bergamot, cardamom, and jasmine on a clean skin musk. Inspired by CK One.',
        badge: ''
    },
    {
        id: 'ck-eternity', brand: 'CK', name: 'Eternity',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” CK Eternity',
        notes: ['Green', 'Floral', 'Woody'],
        description: 'Sage, lavender, and sandalwood â€” timeless simplicity. Inspired by CK Eternity.',
        badge: ''
    },
    {
        id: 'ck-euphoria', brand: 'CK', name: 'Euphoria',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” CK Euphoria',
        notes: ['Floral', 'Oriental', 'Fruity'],
        description: 'Black orchid, pomegranate, and lotus on amber and mahogany. Inspired by CK Euphoria.',
        badge: ''
    },

    /* ===========================================================
       15. HERMÃˆS
       =========================================================== */
    {
        id: 'hermes-terre', brand: 'Hermes', name: "Terre d'HermÃ¨s",
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: "Arabian Perfume Lab inspired bottle â€” Terre d'HermÃ¨s",
        notes: ['Woody', 'Citrus', 'Earthy'],
        description: 'Orange, cedar, and flint mineral accord â€” elemental and earthy. Inspired by Terre d\'HermÃ¨s.',
        badge: ''
    },
    {
        id: 'hermes-voyage', brand: 'Hermes', name: "Voyage d'HermÃ¨s",
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: "Arabian Perfume Lab inspired bottle â€” Voyage d'HermÃ¨s",
        notes: ['Fresh', 'Citrus', 'Woody'],
        description: 'Citrus, pepper, and woody notes â€” free and adventurous spirit. Inspired by Voyage d\'HermÃ¨s.',
        badge: ''
    },
    {
        id: 'hermes-twilly', brand: 'Hermes', name: "Twilly d'HermÃ¨s",
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: "Arabian Perfume Lab inspired bottle â€” Twilly d'HermÃ¨s",
        notes: ['Floral', 'Ginger', 'Tuberose'],
        description: 'Ginger, tuberose, and sandalwood â€” fresh young femininity. Inspired by Twilly d\'HermÃ¨s.',
        badge: ''
    },

    /* ===========================================================
       16. ISSEY MIYAKE
       =========================================================== */
    {
        id: 'issey-leau', brand: 'Issey Miyake', name: "L'Eau d'Issey",
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: "Arabian Perfume Lab inspired bottle â€” L'Eau d'Issey",
        notes: ['Aquatic', 'Fresh', 'Woody'],
        description: 'Yuzu, water lily, and cyclamen on a woody musk. Inspired by L\'Eau d\'Issey.',
        badge: ''
    },
    {
        id: 'issey-leau-women', brand: 'Issey Miyake', name: "L'Eau d'Issey (Women)",
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: "Arabian Perfume Lab inspired bottle â€” L'Eau d'Issey Women",
        notes: ['Aquatic', 'Floral', 'Musk'],
        description: 'Lotus, peony, and white cedar â€” pure aquatic femininity. Inspired by L\'Eau d\'Issey Women.',
        badge: ''
    },

    /* ===========================================================
       17. PRADA
       =========================================================== */
    {
        id: 'prada-luna-rossa', brand: 'Prada', name: 'Luna Rossa',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Prada Luna Rossa',
        notes: ['Aquatic', 'Herbal', 'Woody'],
        description: 'Labdanum, lavender, and ambrette â€” sporty aromatic elegance. Inspired by Luna Rossa.',
        badge: ''
    },
    {
        id: 'prada-luna-rossa-black', brand: 'Prada', name: 'Luna Rossa Black',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Prada Luna Rossa Black',
        notes: ['Spicy', 'Woody', 'Amber'],
        description: 'Black iris, angelica, and amber for a darker, more intense masculinity. Inspired by Luna Rossa Black.',
        badge: ''
    },
    {
        id: 'prada-candy', brand: 'Prada', name: 'Candy',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Prada Candy',
        notes: ['Sweet', 'Musk', 'Vanilla'],
        description: 'Caramel, benzoin, and musk â€” playful sweetness with sophistication. Inspired by Prada Candy.',
        badge: ''
    },
    {
        id: 'prada-paradoxe', brand: 'Prada', name: 'Paradoxe',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Prada Paradoxe',
        notes: ['Floral', 'Citrus', 'Musk'],
        description: 'Neroli, white musk, and cedarwood â€” the scent of contradiction. Inspired by Prada Paradoxe.',
        badge: 'NEW ARRIVAL'
    },

    /* ===========================================================
       18. CAROLINA HERRERA
       =========================================================== */
    {
        id: 'ch-good-girl', brand: 'Carolina Herrera', name: 'Good Girl',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Carolina Herrera Good Girl',
        notes: ['Floral', 'Coffee', 'Woody'],
        description: 'Jasmine, tuberose, and roasted tonka in a bold, seductive blend. Inspired by Good Girl.',
        badge: 'BESTSELLER'
    },
    {
        id: 'ch-bad-boy', brand: 'Carolina Herrera', name: 'Bad Boy',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Carolina Herrera Bad Boy',
        notes: ['Woody', 'Spicy', 'Fresh'],
        description: 'Green sage, vanilla, and cedar â€” rebellious masculine energy. Inspired by Bad Boy.',
        badge: ''
    },
    {
        id: 'ch-212-vip', brand: 'Carolina Herrera', name: '212 VIP',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Carolina Herrera 212 VIP',
        notes: ['Floral', 'Woody', 'Musk'],
        description: 'Gardenia, peony, and white musk â€” clubbing-ready glamour. Inspired by 212 VIP.',
        badge: ''
    },

    /* ===========================================================
       19. GUCCI
       =========================================================== */
    {
        id: 'gucci-guilty', brand: 'Gucci', name: 'Guilty',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Gucci Guilty',
        notes: ['Citrus', 'Woody', 'Leather'],
        description: 'Lemon, lavender, and patchouli with Italian amber. Inspired by Gucci Guilty.',
        badge: ''
    },
    {
        id: 'gucci-guilty-women', brand: 'Gucci', name: 'Guilty (Women)',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Gucci Guilty Women',
        notes: ['Floral', 'Citrus', 'Woody'],
        description: 'Pink pepper, lilac, and amber â€” rebellious feminine charm. Inspired by Gucci Guilty Women.',
        badge: ''
    },
    {
        id: 'gucci-bloom', brand: 'Gucci', name: 'Bloom',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Gucci Bloom',
        notes: ['Floral', 'White Flowers', 'Tuberose'],
        description: 'Tuberose, Rangoon creeper, and jasmine â€” a garden in full bloom. Inspired by Gucci Bloom.',
        badge: ''
    },
    {
        id: 'gucci-flora', brand: 'Gucci', name: 'Flora',
        collection: 'standard', gender: 'women',
        sizes: { '20ml': 349, '50ml': 549, '100ml': 999 },
        mrp:   { '20ml': 499, '50ml': 799, '100ml': 1299 },
        image: IMG.perfumeBottle,
        searchName: 'Gucci Flora',
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Gucci Flora',
        notes: ['Floral', 'Citrus', 'Musk'],
        description: 'Citrus blossoms, peony, and rose on a sandalwood base. Inspired by Gucci Flora.',
        badge: 'POPULAR'
    },
    {
        id: 'gucci-guilty-edp', brand: 'Gucci', name: 'Guilty Absolute EDP',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Gucci Guilty Absolute EDP',
        notes: ['Woody', 'Leather', 'Earthy'],
        description: 'Olibanum, leather, and woody vetiver â€” intense, raw, and unapologetic. Inspired by Guilty Absolute.',
        badge: ''
    },

    /* ===========================================================
       20. RASASI
       =========================================================== */
    {
        id: 'rasasi-la-yuqawam', brand: 'Rasasi', name: 'La Yuqawam',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Rasasi La Yuqawam',
        notes: ['Oud', 'Amber', 'Spicy'],
        description: 'Precious oud, sandalwood, and saffron in a magnificent Arabian composition. Inspired by La Yuqawam.',
        badge: ''
    },
    {
        id: 'rasasi-hawas', brand: 'Rasasi', name: 'Hawas',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Rasasi Hawas',
        notes: ['Aquatic', 'Spicy', 'Woody'],
        description: 'Mint, cardamom, and sea notes over vetiver and sandalwood. Inspired by Hawas.',
        badge: ''
    },

    /* ===========================================================
       21. MONT BLANC
       =========================================================== */
    {
        id: 'montblanc-legend', brand: 'Mont Blanc', name: 'Legend',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Mont Blanc Legend',
        notes: ['FougÃ¨re', 'Woody', 'Fresh'],
        description: 'Bergamot, lavender, and oakmoss â€” a reliable, elegant fougÃ¨re. Inspired by Legend.',
        badge: ''
    },
    {
        id: 'montblanc-legend-edp', brand: 'Mont Blanc', name: 'Legend EDP',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Mont Blanc Legend EDP',
        notes: ['Woody', 'Amber', 'FougÃ¨re'],
        description: 'Bergamot, cardamom, and Coumarin with warm amber. Inspired by Legend EDP.',
        badge: ''
    },
    {
        id: 'montblanc-explorer', brand: 'Mont Blanc', name: 'Explorer',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Mont Blanc Explorer',
        notes: ['Woody', 'Earthy', 'Spicy'],
        description: 'Bergamot, vetiver, and Amyris â€” for the adventurous spirit. Inspired by Explorer.',
        badge: ''
    },

    /* ===========================================================
       22. JEAN PAUL GAULTIER
       =========================================================== */
    {
        id: 'jpg-le-male', brand: 'JPG', name: 'Le Male',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” JPG Le Male',
        notes: ['Lavender', 'Vanilla', 'Mint'],
        description: 'Lavender, vanilla, and mint â€” iconic masculine contrast. Inspired by Le Male.',
        badge: 'ICONIC'
    },
    {
        id: 'jpg-scandal', brand: 'JPG', name: 'Scandal',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” JPG Scandal',
        notes: ['Honey', 'Floral', 'Woody'],
        description: 'Blood orange, gardenia, and honey on a patchouli base. Inspired by Scandal.',
        badge: ''
    },

    /* ===========================================================
       23. REPLICA (Maison Margiela)
       =========================================================== */
    {
        id: 'replica-beach-walk', brand: 'Replica', name: 'Beach Walk',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Replica Beach Walk',
        notes: ['Citrus', 'Coconut', 'Musk'],
        description: 'Bergamot, ylang-ylang, and coconut â€” sunscreen and sea breeze. Inspired by Beach Walk.',
        badge: ''
    },
    {
        id: 'replica-by-the-fireplace', brand: 'Replica', name: 'By the Fireplace',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Replica By the Fireplace',
        notes: ['Smoky', 'Vanilla', 'Woody'],
        description: 'Chestnut, guaiac wood smoke, and vanilla â€” the smell of a cosy winter fire. Inspired by By the Fireplace.',
        badge: 'BESTSELLER'
    },
    {
        id: 'replica-jazz-club', brand: 'Replica', name: 'Jazz Club',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Replica Jazz Club',
        notes: ['Tobacco', 'Rum', 'Vanilla'],
        description: 'Musk, rum, and pink pepper â€” late-night jazz bar atmosphere. Inspired by Jazz Club.',
        badge: ''
    },

    /* ===========================================================
       24. DIPTYQUE
       =========================================================== */
    {
        id: 'diptyque-tam-dao', brand: 'Diptyque', name: 'Tam Dao',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.tamDaoSrk,
        imageAlt: 'Arabian Perfumer\'s â€” Tam Dao inspired bottle, black and white minimalist label, 50ml',
        notes: ['Sandalwood', 'Cedar', 'Woody'],
        description: 'Pure sandalwood, cypress, and white musk â€” serene and temple-like. Inspired by Tam Dao.',
        badge: ''
    },
    {
        id: 'diptyque-do-son', brand: 'Diptyque', name: 'Do Son',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Diptyque Do Son',
        notes: ['Tuberose', 'Floral', 'Musk'],
        description: 'Tuberose and musky white flowers â€” the scent of a Vietnamese bay. Inspired by Do Son.',
        badge: ''
    },
    {
        id: 'diptyque-philosykos', brand: 'Diptyque', name: 'Philosykos',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Diptyque Philosykos',
        notes: ['Fig', 'Green', 'Woody'],
        description: 'Fig leaves, fig bark, and fresh fig â€” sunshine and a Grecian garden. Inspired by Philosykos.',
        badge: ''
    },

    /* ===========================================================
       25. HUGO BOSS
       =========================================================== */
    {
        id: 'boss-bottled', brand: 'Hugo Boss', name: 'Boss Bottled',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Boss Bottled',
        notes: ['Spicy', 'Woody', 'Apple'],
        description: 'Apple, cinnamon, and sandalwood â€” the classic office fragrance. Inspired by Boss Bottled.',
        badge: ''
    },
    {
        id: 'boss-alive', brand: 'Hugo Boss', name: 'Boss Alive',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Boss Alive',
        notes: ['Floral', 'Fruity', 'Woody'],
        description: 'Vanilla orchid, honeysuckle, and jack fruit in a warm, vibrant blend. Inspired by Boss Alive.',
        badge: ''
    },

    /* ===========================================================
       26. VICTORIA'S SECRET
       =========================================================== */
    {
        id: 'vs-bombshell', brand: "Victoria's Secret", name: 'Bombshell',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: "Arabian Perfume Lab inspired bottle â€” Victoria's Secret Bombshell",
        notes: ['Floral', 'Citrus', 'Fruity'],
        description: 'Purple passion fruit, vanilla orchid, and musk â€” gorgeous and playful. Inspired by Bombshell.',
        badge: ''
    },
    {
        id: 'vs-love-spell', brand: "Victoria's Secret", name: 'Love Spell',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: "Arabian Perfume Lab inspired bottle â€” Victoria's Secret Love Spell",
        notes: ['Fruity', 'Floral', 'Musk'],
        description: 'Cherry blossom, peach, and white musk â€” young, fresh, and romantic. Inspired by Love Spell.',
        badge: ''
    },

    /* ===========================================================
       27. LACOSTE
       =========================================================== */
    {
        id: 'lacoste-essential', brand: 'Lacoste', name: 'Essential',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Lacoste Essential',
        notes: ['Green', 'Woody', 'Musk'],
        description: 'Tomato leaf, tagette, and sandalwood â€” fresh and sporty everyday wear. Inspired by Essential.',
        badge: ''
    },
    {
        id: 'lacoste-blanc', brand: 'Lacoste', name: 'Blanc',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Lacoste Blanc',
        notes: ['Fresh', 'Citrus', 'Woody'],
        description: 'White tea, green fig, and petitgrain â€” clean, minimal freshness. Inspired by Lacoste Blanc.',
        badge: ''
    },

    /* ===========================================================
       28. RALPH LAUREN
       =========================================================== */
    {
        id: 'rl-polo-sports', brand: 'Ralph Lauren', name: 'Polo Sports',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Ralph Lauren Polo Sports',
        notes: ['Aquatic', 'Citrus', 'Fresh'],
        description: 'Sea notes, bergamot, and cedar â€” classic sporty freshness. Inspired by Polo Sports.',
        badge: ''
    },
    {
        id: 'rl-polo-blue', brand: 'Ralph Lauren', name: 'Polo Blue',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Ralph Lauren Polo Blue',
        notes: ['Aquatic', 'Cucumber', 'Woody'],
        description: 'Melon, cucumber, and suede on a woody musk â€” laid-back luxury. Inspired by Polo Blue.',
        badge: ''
    },
    {
        id: 'rl-ralph', brand: 'Ralph Lauren', name: 'Ralph',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Ralph Lauren Ralph',
        notes: ['Floral', 'Fruity', 'Fresh'],
        description: 'Marigold, freesia, and magnolia on a cedar base. Inspired by Ralph.',
        badge: ''
    },

    /* ===========================================================
       29. BENTLEY
       =========================================================== */
    {
        id: 'bentley-for-men', brand: 'Bentley', name: 'For Men',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Bentley For Men',
        notes: ['Leather', 'Woody', 'Spicy'],
        description: 'Clary sage, juniper berry, and leather â€” prestige behind the wheel. Inspired by Bentley For Men.',
        badge: ''
    },
    {
        id: 'bentley-intense', brand: 'Bentley', name: 'Intense',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Bentley Intense',
        notes: ['Woody', 'Amber', 'Spicy'],
        description: 'Pepper, oud, and amber in a more intense, opulent rendition. Inspired by Bentley Intense.',
        badge: ''
    },

    /* ===========================================================
       30. PENHALIGON'S
       =========================================================== */
    {
        id: 'penhaligons-halfeti', brand: "Penhaligon's", name: 'Halfeti',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.noir,
        imageAlt: "Arabian Perfume Lab inspired bottle â€” Penhaligon's Halfeti",
        notes: ['Rose', 'Oud', 'Amber'],
        description: 'Turkish rose, oud, and amber â€” inspired by the mystical black rose. Inspired by Halfeti.',
        badge: 'NICHE EXCLUSIVE'
    },

    /* ===========================================================
       31. NASEEM (Al Haramain)
       =========================================================== */
    {
        id: 'naseem-rose-oud', brand: 'Naseem', name: 'Rose & Oud',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Naseem Rose & Oud',
        notes: ['Rose', 'Oud', 'Musk'],
        description: 'Authentic Arabian rose and oud in a classic Gulf-style composition. Inspired by Naseem.',
        badge: ''
    },
    {
        id: 'naseem-gold', brand: 'Naseem', name: 'Gold',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Naseem Gold',
        notes: ['Amber', 'Musk', 'Oud'],
        description: 'Rich amber, musk safi, and precious oud â€” opulent Arabian luxury. Inspired by Naseem Gold.',
        badge: ''
    },

    /* ===========================================================
       32. JAGUAR
       =========================================================== */
    {
        id: 'jaguar-classic', brand: 'Jaguar', name: 'Classic',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Jaguar Classic',
        notes: ['Fresh', 'Citrus', 'Woody'],
        description: 'Grapefruit, geranium, and cedar â€” refined British motoring elegance. Inspired by Jaguar Classic.',
        badge: ''
    },

    /* ===========================================================
       33. LALIQUE
       =========================================================== */
    {
        id: 'lalique-encre-noire', brand: 'Lalique', name: 'Encre Noire',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Lalique Encre Noire',
        notes: ['Woody', 'Vetiver', 'Dark'],
        description: 'Pure vetiver, cypriol, and musk â€” deep, smoky, and hypnotic. Inspired by Encre Noire.',
        badge: ''
    },
    {
        id: 'lalique-lion', brand: 'Lalique', name: 'Lion',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Lalique Lion',
        notes: ['Spicy', 'Woody', 'Amber'],
        description: 'Saffron, amber, and sandalwood â€” regal and powerful. Inspired by Lalique Lion.',
        badge: ''
    },

    /* ===========================================================
       34. JO MALONE
       =========================================================== */
    {
        id: 'jomalone-wood-sage-sea-salt', brand: 'Jo Malone', name: 'Wood Sage & Sea Salt',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Jo Malone Wood Sage & Sea Salt',
        notes: ['Aquatic', 'Woody', 'Earthy'],
        description: 'Sea salt, driftwood, and sage â€” wild coastline in a bottle. Inspired by Wood Sage & Sea Salt.',
        badge: ''
    },
    {
        id: 'jomalone-peony-blush', brand: 'Jo Malone', name: 'Peony & Blush Suede',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Jo Malone Peony & Blush Suede',
        notes: ['Floral', 'Suede', 'Fruity'],
        description: 'Peony, red apple, and suede on a white musk drydown. Inspired by Peony & Blush Suede.',
        badge: ''
    },
    {
        id: 'jomalone-lime-basil-mandarin', brand: 'Jo Malone', name: 'Lime Basil & Mandarin',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Jo Malone Lime Basil & Mandarin',
        notes: ['Citrus', 'Herbal', 'Woody'],
        description: 'Lime, basil, and white thyme â€” crisp, herbal, and utterly British. Inspired by Lime Basil & Mandarin.',
        badge: ''
    },

    /* ===========================================================
       35. KILIAN
       =========================================================== */
    {
        id: 'kilian-angels-share', brand: 'Kilian', name: "Angel's Share",
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: "Arabian Perfume Lab inspired bottle â€” Kilian Angel's Share",
        notes: ['Cognac', 'Vanilla', 'Spicy'],
        description: 'Cognac, cinnamon, and oak wood â€” the intoxicating spirit of a whisky barrel. Inspired by Angel\'s Share.',
        badge: 'NICHE EXCLUSIVE'
    },
    {
        id: 'kilian-black-phantom', brand: 'Kilian', name: 'Black Phantom',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Kilian Black Phantom',
        notes: ['Coffee', 'Rum', 'Vanilla'],
        description: 'Rum, coffee, dark caramel, and guaiac wood â€” dangerous and delicious. Inspired by Black Phantom.',
        badge: ''
    },
    {
        id: 'kilian-love-dont-be-shy', brand: 'Kilian', name: "Love Don't Be Shy",
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: "Arabian Perfume Lab inspired bottle â€” Kilian Love Don't Be Shy",
        notes: ['Sweet', 'Musk', 'Marshmallow'],
        description: 'Orange blossom, neroli, and marshmallow musk â€” addictively sweet and sensual. Inspired by Love Don\'t Be Shy.',
        badge: ''
    },

    /* ===========================================================
       36. MFK (Maison Francis Kurkdjian)
       =========================================================== */
    {
        id: 'mfk-baccarat-rouge-540', brand: 'MFK', name: 'Baccarat Rouge 540',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” MFK Baccarat Rouge 540',
        notes: ['Amber', 'Floral', 'Woody'],
        description: 'Saffron, ambroxan, and cedarwood â€” the most complimented fragrance of the decade. Inspired by Baccarat Rouge 540.',
        badge: 'BESTSELLER'
    },
    {
        id: 'mfk-grand-soir', brand: 'MFK', name: 'Grand Soir',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” MFK Grand Soir',
        notes: ['Amber', 'Vanilla', 'Incense'],
        description: 'Amber, benzoin, and tonka â€” a grand evening dressing. Inspired by Grand Soir.',
        badge: ''
    },
    {
        id: 'mfk-oud-cashmere-mood', brand: 'MFK', name: 'Oud Cashmere Mood',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” MFK Oud Cashmere Mood',
        notes: ['Oud', 'Cashmere', 'Amber'],
        description: 'Oud accord, hazelwood, and cashmere musk â€” enveloping warmth. Inspired by Oud Cashmere Mood.',
        badge: ''
    },

    /* ===========================================================
       37. MONTALE
       =========================================================== */
    {
        id: 'montale-black-aoud', brand: 'Montale', name: 'Black Aoud',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Montale Black Aoud',
        notes: ['Oud', 'Rose', 'Amber'],
        description: 'Black aoud, rose, patchouli, and musk â€” the darkest rose in the garden. Inspired by Black Aoud.',
        badge: ''
    },
    {
        id: 'montale-intense-cafe', brand: 'Montale', name: 'Intense CafÃ©',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Montale Intense CafÃ©',
        notes: ['Coffee', 'Rose', 'Vanilla'],
        description: 'Coffee, rose, and vanilla â€” warm, sensual, and utterly unique. Inspired by Intense CafÃ©.',
        badge: 'BESTSELLER'
    },

    /* ===========================================================
       38. BURBERRY
       =========================================================== */
    {
        id: 'burberry-brit', brand: 'Burberry', name: 'Brit',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Burberry Brit',
        notes: ['Spicy', 'Woody', 'Ginger'],
        description: 'Grapefruit, cardamom, and tonka â€” British sophistication with a modern edge. Inspired by Brit.',
        badge: ''
    },
    {
        id: 'burberry-hero', brand: 'Burberry', name: 'Hero',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Burberry Hero',
        notes: ['Woody', 'Cedar', 'Pepper'],
        description: 'Bergamot, cedar, and black pepper â€” clean, confident, and ready for anything. Inspired by Hero.',
        badge: 'NEW ARRIVAL'
    },

    /* ===========================================================
       39. PARFUMS DE MARLY
       =========================================================== */
    {
        id: 'pdm-layton', brand: 'Parfums de Marly', name: 'Layton',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Parfums de Marly Layton',
        notes: ['Woody', 'Vanilla', 'Spicy'],
        description: 'Apple, lavender, and vanilla â€” sophisticated European opulence. Inspired by Layton.',
        badge: 'BESTSELLER'
    },
    {
        id: 'pdm-herod', brand: 'Parfums de Marly', name: 'Herod',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Parfums de Marly Herod',
        notes: ['Tobacco', 'Vanilla', 'Woody'],
        description: 'Tobacco, cinnamon, and sandalwood â€” baroque grandeur. Inspired by Herod.',
        badge: ''
    },
    {
        id: 'pdm-percival', brand: 'Parfums de Marly', name: 'Percival',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Parfums de Marly Percival',
        notes: ['Floral', 'Musk', 'Vanilla'],
        description: 'Bergamot, lavender, and white musk â€” effortless everyday nobility. Inspired by Percival.',
        badge: ''
    },
    {
        id: 'pdm-delina', brand: 'Parfums de Marly', name: 'Delina',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Parfums de Marly Delina',
        notes: ['Rose', 'Rhubarb', 'Musk'],
        description: 'Turkish rose, rhubarb, and cashmere musk â€” feminine, radiant, and modern. Inspired by Delina.',
        badge: 'BESTSELLER'
    },

    /* ===========================================================
       40. VIKTOR & ROLF
       =========================================================== */
    {
        id: 'vr-flowerbomb', brand: 'Viktor & Rolf', name: 'Flowerbomb',
        collection: 'standard', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Viktor & Rolf Flowerbomb',
        notes: ['Floral', 'Patchouli', 'Sweet'],
        description: 'Jasmine, rose, and orchid exploding on a warm patchouli base. Inspired by Flowerbomb.',
        badge: 'BESTSELLER'
    },
    {
        id: 'vr-spicebomb', brand: 'Viktor & Rolf', name: 'Spicebomb',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Viktor & Rolf Spicebomb',
        notes: ['Spicy', 'Tobacco', 'Leather'],
        description: 'Cinnamon, leather, and vetiver in an explosive oriental. Inspired by Spicebomb.',
        badge: ''
    },
    {
        id: 'vr-spicebomb-night-vision', brand: 'Viktor & Rolf', name: 'Spicebomb Night Vision',
        collection: 'standard', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Spicebomb Night Vision',
        notes: ['Herbal', 'Spicy', 'Woody'],
        description: 'Mint, cardamom, and vetiver â€” cool, dark, and electrifying. Inspired by Spicebomb Night Vision.',
        badge: ''
    },
    /* Musk Safi */
    {
        id: 'musk-safi', brand: 'Naseem', name: 'Musk Safi',
        collection: 'standard', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab inspired bottle â€” Musk Safi',
        notes: ['Musk', 'White', 'Powdery'],
        description: 'Pure white musk â€” clean, intimate, and universally wearable. Traditional Arabian musk composition.',
        badge: ''
    },

    /* ===========================================================
       PREMIUM EDP COLLECTION (100ml = â‚¹1,799)
       =========================================================== */
    {
        id: 'premium-paco-phantom', brand: 'Paco Rabanne', name: 'Phantom (Premium EDP)',
        collection: 'premium', gender: 'men',
        sizes: PRM, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Paco Rabanne Phantom',
        notes: ['Woody', 'Spicy', 'Vanilla'],
        description: 'Lavender, ginger, and robot-soul accord â€” futuristic fougÃ¨re. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-vr-spicebomb-extreme', brand: 'Viktor & Rolf', name: 'Spicebomb Extreme (Premium EDP)',
        collection: 'premium', gender: 'men',
        sizes: PRM, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Spicebomb Extreme',
        notes: ['Spicy', 'Vanilla', 'Tobacco'],
        description: 'Magnified cinnamon, tobacco, and amber â€” the ultimate cold-weather powerhouse. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-moschino-toyboy', brand: 'Moschino', name: 'Toy Boy (Premium EDP)',
        collection: 'premium', gender: 'men',
        sizes: PRM, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Moschino Toy Boy',
        notes: ['Spicy', 'Floral', 'Woody'],
        description: 'Black pepper, vetiver, and rose in a bold, avant-garde composition. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-le-labo-bergamot-22', brand: 'Le Labo', name: 'Bergamote 22 (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Le Labo Bergamote 22',
        notes: ['Citrus', 'Musk', 'Woody'],
        description: 'Bergamot, petitgrain, and neroli on a clean musk â€” effortlessly cool. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-le-labo-rose-31', brand: 'Le Labo', name: 'Rose 31 (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Le Labo Rose 31',
        notes: ['Rose', 'Woody', 'Spicy'],
        description: 'Rose deconstructed with cumin, cedar, and vetiver â€” androgynous rose masterpiece. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-dior-oud-ispahan', brand: 'Dior', name: 'Oud Ispahan (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Dior Oud Ispahan',
        notes: ['Oud', 'Rose', 'Amber'],
        description: 'Rose, oud, and labdanum â€” a Persian fantasy of extraordinary depth. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-tomford-grey-vetiver', brand: 'Tom Ford', name: 'Grey Vetiver (Premium EDP)',
        collection: 'premium', gender: 'men',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Tom Ford Grey Vetiver',
        notes: ['Vetiver', 'Woody', 'Earthy'],
        description: 'Vetiver, grapefruit, and white pepper â€” refined grooming at its peak. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-byredo-black-saffron', brand: 'Byredo', name: 'Black Saffron (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Byredo Black Saffron',
        notes: ['Saffron', 'Leather', 'Woody'],
        description: 'Saffron, violet, and leather with vetiver depth. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-hermes-h24', brand: 'Hermes', name: 'H24 (Premium EDP)',
        collection: 'premium', gender: 'men',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Hermes H24',
        notes: ['Green', 'Woody', 'Floral'],
        description: 'Sage, narcissus, and cedarwood â€” a modern herbaceous man. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-creed-green-irish-tweed', brand: 'Creed', name: 'Green Irish Tweed (Premium EDP)',
        collection: 'premium', gender: 'men',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Creed Green Irish Tweed',
        notes: ['Green', 'Floral', 'Woody'],
        description: 'Iris, green meadows, and violet leaves on sandalwood. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-mancera-red-tobacco', brand: 'Mancera', name: 'Red Tobacco (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Mancera Red Tobacco',
        notes: ['Tobacco', 'Rose', 'Amber'],
        description: 'Rose, tobacco, and vanilla â€” warm, opulent, and wonderfully smoky. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-gucci-voice-snake', brand: 'Gucci', name: 'Voice of the Snake (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Gucci Voice of the Snake',
        notes: ['Oriental', 'Floral', 'Amber'],
        description: 'Black rose, vetiver, and amber resin â€” dark and hypnotic. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-creed-royal-oud', brand: 'Creed', name: 'Royal Oud (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Creed Royal Oud',
        notes: ['Oud', 'Woody', 'Spicy'],
        description: 'Oud, cedar, and coriander â€” a regal, layered tribute to Arabian tradition. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-tomford-cafe-rose', brand: 'Tom Ford', name: 'CafÃ© Rose (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Tom Ford CafÃ© Rose',
        notes: ['Coffee', 'Rose', 'Spicy'],
        description: 'Turkish rose, cardamom, and coffee on a musk base. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-mancera-black-vanilla', brand: 'Mancera', name: 'Black Vanilla (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Mancera Black Vanilla',
        notes: ['Vanilla', 'Caramel', 'Woody'],
        description: 'Vanilla, caramel, and amber â€” the ultimate gourmand luxury. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-initio-side-effect', brand: 'Initio', name: 'Side Effect (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Initio Side Effect',
        notes: ['Vanilla', 'Tobacco', 'Woody'],
        description: 'Rum, tobacco, and vanilla for hedonistic pleasure. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-tomford-bleu-de-jour', brand: 'Tom Ford', name: 'Bleu de Jour (Premium EDP)',
        collection: 'premium', gender: 'men',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Tom Ford Bleu de Jour',
        notes: ['Aquatic', 'Citrus', 'Woody'],
        description: 'Citrus, aquatic notes, and oakwood â€” a refined Mediterranean freshness. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-mancera-aoud-lemon-mint', brand: 'Mancera', name: 'Aoud Lemon Mint (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Mancera Aoud Lemon Mint',
        notes: ['Oud', 'Citrus', 'Mint'],
        description: 'Oud, lemon, and mint in a refreshingly unusual Arabian blend. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-mancera-instant-crush', brand: 'Mancera', name: 'Instant Crush (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Mancera Instant Crush',
        notes: ['Rose', 'Musk', 'Amber'],
        description: 'Rose, bergamot, and sandalwood â€” elegantly addictive. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-mancera-rose-vanilla', brand: 'Mancera', name: 'Rose Vanilla (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Mancera Rose Vanilla',
        notes: ['Rose', 'Vanilla', 'Amber'],
        description: 'Turkish rose and Madagascar vanilla â€” an unapologetically sensual romance. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-ga-acqua-gio-essenza', brand: 'Armani', name: 'Acqua di GiÃ² Essenza (Premium EDP)',
        collection: 'premium', gender: 'men',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Acqua di GiÃ² Essenza',
        notes: ['Aquatic', 'Woody', 'Amber'],
        description: 'Citrus, incense, and patchouli â€” deeper aquatic elegance. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-creed-millesime-imperial', brand: 'Creed', name: 'MillÃ©sime ImpÃ©rial (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Creed MillÃ©sime ImpÃ©rial',
        notes: ['Aquatic', 'Citrus', 'Musk'],
        description: 'Sea lavender, ambrette, and iris â€” the fragrance of royal Mediterranean summers. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-fm-portrait-lady', brand: 'FrÃ©dÃ©ric Malle', name: 'Portrait of a Lady (Premium EDP)',
        collection: 'premium', gender: 'women',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Portrait of a Lady',
        notes: ['Rose', 'Patchouli', 'Raspberry'],
        description: 'Turkish rose, patchouli, and sandalwood â€” an overwhelming feminine masterpiece. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-fm-promise', brand: 'FrÃ©dÃ©ric Malle', name: 'Promise (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” FrÃ©dÃ©ric Malle Promise',
        notes: ['Musk', 'Iris', 'Amber'],
        description: 'Musks, iris, and amber â€” intimate, hypnotic, and skin-like. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-fm-rose-cuir', brand: 'FrÃ©dÃ©ric Malle', name: 'Rose & Cuir (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” FrÃ©dÃ©ric Malle Rose & Cuir',
        notes: ['Rose', 'Leather', 'Woody'],
        description: 'Rose absolute with dark leather and birchwood â€” a love story. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-amouage-jubilation', brand: 'Amouage', name: 'Jubilation 25 (Premium EDP)',
        collection: 'premium', gender: 'women',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Amouage Jubilation 25',
        notes: ['Oriental', 'Woody', 'Floral'],
        description: 'Incense, rose, and olibanum â€” Omani perfumery royalty. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-amouage-reflection', brand: 'Amouage', name: 'Reflection Man (Premium EDP)',
        collection: 'premium', gender: 'men',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Amouage Reflection Man',
        notes: ['Floral', 'Woody', 'Aromatic'],
        description: 'Neroli, jasmine, and sandalwood â€” contemplative masculine elegance. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-amouage-interlude-53', brand: 'Amouage', name: 'Interlude 53 (Premium EDP)',
        collection: 'premium', gender: 'men',
        sizes: PRM, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Amouage Interlude 53',
        notes: ['Incense', 'Oud', 'Amber'],
        description: 'Oud, incense, and amber â€” the fragrance equivalent of a Sufi trance. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-montale-honey-oud', brand: 'Montale', name: 'Honey Aoud (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Montale Honey Aoud',
        notes: ['Oud', 'Honey', 'Amber'],
        description: 'Oud, wild honey, and orange blossom â€” liquid gold. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-memo-irish-leather', brand: 'Memo Paris', name: 'Irish Leather (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Memo Paris Irish Leather',
        notes: ['Leather', 'Woody', 'Green'],
        description: 'Leather, birch, and green accords for a misty Irish countryside. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-memo-african-leather', brand: 'Memo Paris', name: 'African Leather (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Memo Paris African Leather',
        notes: ['Leather', 'Spicy', 'Smoky'],
        description: 'Leather, pepper, and vetiver â€” raw Africa captured in a bottle. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-xerjoff-40-knots', brand: 'Xerjoff', name: '40 Knots (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Xerjoff 40 Knots',
        notes: ['Aquatic', 'Woody', 'Citrus'],
        description: 'Sea breeze, driftwood, and white musk â€” luxury yachting in a bottle. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-bono9-bleecker-street', brand: 'Bond No. 9', name: 'Bleecker Street (Premium EDP)',
        collection: 'premium', gender: 'unisex',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Bond No. 9 Bleecker Street',
        notes: ['Citrus', 'Aromatic', 'Woody'],
        description: 'Bergamot, lavender, and iris root â€” New York downtown cool. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-guerlain-homme-cologne', brand: 'Guerlain', name: "L'Homme IdÃ©al Cologne (Premium EDP)",
        collection: 'premium', gender: 'men',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: "Arabian Perfume Lab Premium EDP â€” Guerlain L'Homme IdÃ©al Cologne",
        notes: ['Citrus', 'Herbal', 'Woody'],
        description: 'Lemon, lavender, and cedarwood â€” fresh French masculine refinement. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-valentino-uomo-intense', brand: 'Valentino', name: 'Uomo Intense (Premium EDP)',
        collection: 'premium', gender: 'men',
        sizes: PRM, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Valentino Uomo Intense',
        notes: ['Leather', 'Tobacco', 'Amber'],
        description: 'Leather, tobacco, and iris â€” Valentino couture in olfactory form. Premium inspired EDP.',
        badge: 'PREMIUM'
    },
    {
        id: 'premium-dunhill-alfred-icon', brand: 'Dunhill', name: 'Alfred Icon Absolute (Premium EDP)',
        collection: 'premium', gender: 'men',
        sizes: PRM, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab Premium EDP â€” Dunhill Alfred Icon Absolute',
        notes: ['Woody', 'Amber', 'Tobacco'],
        description: 'Tobacco blossom, amber, and sandalwood â€” a gentlemanly British classic. Premium inspired EDP.',
        badge: 'PREMIUM'
    },

    /* ===========================================================
       CELEBRITY-INSPIRED COLLECTION
       Same standard pricing. The 'celebrity' and 'inspiration' fields
       identify the association for display purposes only.
       No endorsement claimed.
       =========================================================== */
    {
        id: 'celeb-allu-arjun', brand: 'Creed', name: 'Aventus (Allu Arjun Style)',
        collection: 'celebrity', gender: 'men',
        sizes: { '20ml': 349, '50ml': 549, '100ml': 999 },
        mrp:   { '20ml': 499, '50ml': 799, '100ml': 1299 },
        image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Allu Arjun style',
        notes: ['Fruity', 'Woody', 'Smoky'],
        description: 'Pineapple, birch, and oakmoss â€” inspired by the signature scent reportedly favoured by Allu Arjun. Inspired by Creed Aventus.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Allu Arjun',
        inspiration: 'Creed Aventus'
    },
    {
        id: 'celeb-srk-tam-dao', brand: 'Diptyque', name: 'Tam Dao (Shah Rukh Khan Style)',
        collection: 'celebrity', gender: 'men',
        sizes: STD, image: IMG.tamDaoSrk,
        imageAlt: 'Arabian Perfumer\'s â€” Tam Dao SRK inspired bottle, black and white Diptyque label, 50ml',
        notes: ['Sandalwood', 'Cedar', 'Woody'],
        description: 'Serene sandalwood and cypress â€” reportedly a favourite of Shah Rukh Khan. Inspired by Diptyque Tam Dao.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Shah Rukh Khan',
        inspiration: 'Diptyque Tam Dao'
    },
    {
        id: 'celeb-ronaldo', brand: 'Cristiano Ronaldo', name: 'Ronaldo (CR7 Style)',
        collection: 'celebrity', gender: 'men',
        sizes: { '20ml': 349, '50ml': 549, '100ml': 999 },
        mrp:   { '20ml': 499, '50ml': 799, '100ml': 1299 },
        image: IMG.ronaldo,
        imageAlt: 'Arabian Perfumer\'s â€” Ronaldo inspired perfume bottle with footballer illustration',
        notes: ['Citrus', 'Fresh', 'Woody'],
        description: 'Bergamot, green apple, and cedarwood â€” a fresh, confident scent inspired by the Cristiano Ronaldo signature style.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Cristiano Ronaldo'
    },
    {
        id: 'celeb-srk-dunhill', brand: 'Dunhill', name: 'Alfred Icon Absolute (Shah Rukh Khan Style)',
        collection: 'celebrity', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Shah Rukh Khan Dunhill style',
        notes: ['Woody', 'Amber', 'Tobacco'],
        description: 'Tobacco blossom and amber â€” an icon\'s choice. Inspired by Dunhill Alfred Icon Absolute.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Shah Rukh Khan',
        inspiration: 'Dunhill Alfred Icon Absolute'
    },
    {
        id: 'celeb-esha-gupta-flora', brand: 'Gucci', name: 'Flora (Esha Gupta Style)',
        collection: 'celebrity', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Esha Gupta style',
        notes: ['Floral', 'Citrus', 'Musk'],
        description: 'Citrus blossom and peony on a sandalwood base â€” reported favourite of Esha Gupta. Inspired by Gucci Flora.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Esha Gupta',
        inspiration: 'Gucci Flora'
    },
    {
        id: 'celeb-hrithik-king', brand: 'D&G', name: 'King (Hrithik Roshan Style)',
        collection: 'celebrity', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Hrithik Roshan style',
        notes: ['Tobacco', 'Woody', 'Spicy'],
        description: 'Tobacco flower and amber â€” the regal choice. Inspired by D&G King.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Hrithik Roshan',
        inspiration: 'D&G King'
    },
    {
        id: 'celeb-harbhajan-musk-safi', brand: 'Naseem', name: 'Musk Safi (Harbhajan Singh Style)',
        collection: 'celebrity', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Harbhajan Singh style',
        notes: ['Musk', 'White', 'Powdery'],
        description: 'Pure white musk â€” reportedly worn by Harbhajan Singh. Traditional Arabian musk.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Harbhajan Singh',
        inspiration: 'Musk Safi'
    },
    {
        id: 'celeb-virat-viking', brand: 'Creed', name: 'Viking (Virat Kohli Style)',
        collection: 'celebrity', gender: 'men',
        sizes: { '20ml': 349, '50ml': 549, '100ml': 999 },
        mrp:   { '20ml': 499, '50ml': 799, '100ml': 1299 },
        image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Virat Kohli style',
        notes: ['Spicy', 'Woody', 'Fresh'],
        description: 'Pink pepper, lavender, and sandalwood â€” power and passion. Inspired by Creed Viking.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Virat Kohli',
        inspiration: 'Creed Viking'
    },
    {
        id: 'celeb-alia-bleu', brand: 'Chanel', name: 'Bleu de Chanel (Alia Bhatt Style)',
        collection: 'celebrity', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Alia Bhatt style',
        notes: ['Woody', 'Aromatic', 'Fresh'],
        description: 'Citrus and labdanum on sandalwood â€” reportedly favoured by Alia Bhatt. Inspired by Bleu de Chanel.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Alia Bhatt',
        inspiration: 'Bleu de Chanel'
    },
    {
        id: 'celeb-shahid-green-irish', brand: 'Creed', name: 'Green Irish Tweed (Shahid Kapoor Style)',
        collection: 'celebrity', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Shahid Kapoor style',
        notes: ['Green', 'Floral', 'Woody'],
        description: 'Iris and violet leaves on sandalwood â€” clean, iconic, and effortless. Inspired by Creed Green Irish Tweed.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Shahid Kapoor',
        inspiration: 'Creed Green Irish Tweed'
    },
    {
        id: 'celeb-sara-no5', brand: 'Chanel', name: 'No.5 (Sara Ali Khan Style)',
        collection: 'celebrity', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Sara Ali Khan style',
        notes: ['Floral', 'Powdery', 'Aldehyde'],
        description: 'Aldehydes, rose, and jasmine â€” the world\'s most iconic fragrance profile. Inspired by Chanel No.5.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Sara Ali Khan',
        inspiration: 'Chanel No.5'
    },
    {
        id: 'celeb-arjun-ombre-leather', brand: 'Tom Ford', name: 'OmbrÃ© Leather (Arjun Kapoor Style)',
        collection: 'celebrity', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Arjun Kapoor style',
        notes: ['Leather', 'Floral', 'Woody'],
        description: 'Bold leather and jasmine â€” raw masculinity. Inspired by Tom Ford OmbrÃ© Leather.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Arjun Kapoor',
        inspiration: 'Tom Ford OmbrÃ© Leather'
    },
    {
        id: 'celeb-sonam-gypsy-water', brand: 'Byredo', name: 'Gypsy Water (Sonam Kapoor Style)',
        collection: 'celebrity', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Sonam Kapoor style',
        notes: ['Woody', 'Pine', 'Vanilla'],
        description: 'Incense, pine, and vanilla â€” free-spirited and unforgettable. Inspired by Byredo Gypsy Water.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Sonam Kapoor',
        inspiration: 'Byredo Gypsy Water'
    },
    {
        id: 'celeb-alia-armani-code', brand: 'Armani', name: 'Code Profumo (Alia Bhatt Style)',
        collection: 'celebrity', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Alia Bhatt Armani style',
        notes: ['Amber', 'Spicy', 'Tobacco'],
        description: 'Amber and cardamom intensity â€” inspired by Alia Bhatt\'s noted preference. Inspired by Armani Code Profumo.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Alia Bhatt',
        inspiration: 'Armani Code Profumo'
    },
    {
        id: 'celeb-aditi-gucci-bloom', brand: 'Gucci', name: 'Bloom (Aditi Rao Hydari Style)',
        collection: 'celebrity', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Aditi Rao Hydari style',
        notes: ['Floral', 'White Flowers', 'Tuberose'],
        description: 'Tuberose, jasmine, and Rangoon creeper â€” a garden in full bloom. Inspired by Gucci Bloom.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Aditi Rao Hydari',
        inspiration: 'Gucci Bloom'
    },
    {
        id: 'celeb-beyonce-angels-share', brand: 'Kilian', name: "Angel's Share (BeyoncÃ© Style)",
        collection: 'celebrity', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” BeyoncÃ© style',
        notes: ['Cognac', 'Vanilla', 'Spicy'],
        description: 'Cognac, cinnamon, and oak â€” the spirit of royalty. Inspired by Kilian Angel\'s Share.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'BeyoncÃ©',
        inspiration: "Kilian Angel's Share"
    },
    {
        id: 'celeb-ranbir-le-male', brand: 'JPG', name: 'Le Male (Ranbir Kapoor Style)',
        collection: 'celebrity', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Ranbir Kapoor style',
        notes: ['Lavender', 'Vanilla', 'Mint'],
        description: 'Lavender and vanilla contrast â€” iconic bold masculinity. Inspired by JPG Le Male.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Ranbir Kapoor',
        inspiration: 'JPG Le Male'
    },
    {
        id: 'celeb-akshay-cool-water', brand: 'Davidoff', name: 'Cool Water (Akshay Kumar Style)',
        collection: 'celebrity', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Akshay Kumar style',
        notes: ['Aquatic', 'Fresh', 'Woody'],
        description: 'Mint, green accords, and oakmoss â€” the original refreshing aquatic. Inspired by Cool Water.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Akshay Kumar',
        inspiration: 'Davidoff Cool Water'
    },
    {
        id: 'celeb-saif-tiger-allure-sport', brand: 'Chanel', name: 'Allure Homme Sport (Saif & Tiger Style)',
        collection: 'celebrity', gender: 'men',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Saif Ali Khan & Tiger Shroff style',
        notes: ['Fresh', 'Citrus', 'Woody'],
        description: 'Sea notes and white musk â€” athletic and elegant. Inspired by Allure Homme Sport.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Saif Ali Khan & Tiger Shroff',
        inspiration: 'Chanel Allure Homme Sport'
    },
    {
        id: 'celeb-hrithik-rose-no-mans-land', brand: 'Byredo', name: "Rose of No Man's Land (Hrithik Style)",
        collection: 'celebrity', gender: 'unisex',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: "Arabian Perfume Lab celebrity inspired bottle â€” Hrithik Roshan Byredo style",
        notes: ['Rose', 'Floral', 'Papyrus'],
        description: 'Turkish rose and raspberry blossom â€” delicate, powerful, and unexpected. Inspired by Byredo Rose of No Man\'s Land.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Hrithik Roshan',
        inspiration: "Byredo Rose of No Man's Land"
    },
    {
        id: 'celeb-esha-dylan-blue', brand: 'Versace', name: 'Dylan Blue (Esha Gupta Style)',
        collection: 'celebrity', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Esha Gupta Versace style',
        notes: ['Aquatic', 'FougÃ¨re', 'Woody'],
        description: 'Aquozone and violet â€” the feminine version of Italian freshness. Inspired by Versace Dylan Blue.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Esha Gupta',
        inspiration: 'Versace Dylan Blue'
    },
    {
        id: 'celeb-ranveer-gucci-guilty', brand: 'Gucci', name: 'Guilty EDP (Ranveer Singh Style)',
        collection: 'celebrity', gender: 'men',
        sizes: STD, image: IMG.noir,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Ranveer Singh style',
        notes: ['Woody', 'Leather', 'Earthy'],
        description: 'Olibanum, leather, and vetiver â€” bold and unapologetic. Inspired by Gucci Guilty Absolute EDP.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Ranveer Singh',
        inspiration: 'Gucci Guilty EDP'
    },
    {
        id: 'celeb-anushka-light-blue', brand: 'D&G', name: 'Light Blue Intense (Anushka Sharma Style)',
        collection: 'celebrity', gender: 'women',
        sizes: STD, image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfume Lab celebrity inspired bottle â€” Anushka Sharma style',
        notes: ['Citrus', 'Floral', 'Amber'],
        description: 'Lemon, cedar, and amber â€” Mediterranean warmth amplified. Inspired by D&G Light Blue Intense.',
        badge: 'CELEBRITY INSPIRED',
        celebrity: 'Anushka Sharma',
        inspiration: 'D&G Light Blue Intense'
    },

    /* ===========================================================
       ORIGINAL CREATIONS â€” Arabian Perfumer's signature blends
       =========================================================== */
    {
        id: 'tobacco-oudhi', brand: 'Arabian Perfumer\'s', name: 'Tobacco Oudhi',
        collection: 'premium', gender: 'unisex',
        sizes: { '50ml': 999, '100ml': 1899 },
        mrp:   { '50ml': 1299, '100ml': 2299 },
        image: IMG.tobaccoOudhi,
        imageAlt: 'Arabian Perfumer\'s â€” Tobacco Oudhi original 50ml bottle with intricate Arabian art label',
        notes: ['Tobacco', 'Oud', 'Amber', 'Spicy'],
        description: 'A signature Arabian Perfumer\'s original â€” rich Cambodian oud entwined with aged tobacco leaf, amber resin, and warming spices. Smoky, deep, and unforgettable.',
        badge: 'ORIGINAL'
    },
    {
        id: 'madawi', brand: 'Arabian Oud', name: 'Madawi',
        collection: 'premium', gender: 'unisex',
        sizes: { '50ml': 1199, '100ml': 1899 },
        mrp:   { '50ml': 1499, '100ml': 2299 },
        image: IMG.perfumeBottle,
        searchName: 'Madawi Arabian Oud',
        imageAlt: 'Arabian Perfumer\'s â€” Madawi inspired bottle, deep amber and rose',
        notes: ['Rose', 'Oud', 'Amber', 'Musk'],
        description: 'A majestic composition of Taif rose and warm oud, layered with precious amber and musk. Rich, long-lasting, and deeply Arabian. Inspired by Arabian Oud Madawi.',
        badge: 'PREMIUM'
    },
    {
        id: 'le-homme', brand: 'Arabian Perfumer\'s', name: 'Le Homme',
        collection: 'premium', gender: 'men',
        sizes: { '50ml': 899, '100ml': 1599 },
        mrp:   { '50ml': 1299, '100ml': 1999 },
        image: IMG.noir,
        imageAlt: 'Arabian Perfumer\'s â€” Le Homme premium EDP bottle',
        notes: ['Woody', 'Spicy', 'Amber'],
        description: 'A bold masculine signature â€” cedarwood, black pepper, and warm amber resin. Confident, refined, and built to last. An Arabian Perfumer\'s exclusive.',
        badge: 'EXCLUSIVE'
    },

    /* ===========================================================
       ATTAR COLLECTION â€” Pure oil-based concentrated perfumes
       Starting â‚¹100 Â· Available in 3ml, 6ml, 12ml
       =========================================================== */
    {
        id: 'attar-oud-al-hindi', brand: 'Arabian Perfumer\'s', name: 'Oud Al Hindi Attar',
        collection: 'attar', gender: 'unisex',
        sizes: ATTAR,
        image: IMG.attarBottle,
        imageAlt: 'Arabian Perfumer\'s â€” Oud Al Hindi pure attar oil',
        notes: ['Oud', 'Woody', 'Earthy'],
        description: 'Pure concentrated Hindi oud attar â€” raw, earthy, and intensely woody. A traditional Indian agarwood oil that lasts all day on skin.',
        badge: 'ATTAR'
    },
    {
        id: 'attar-rose-taif', brand: 'Arabian Perfumer\'s', name: 'Rose Taif Attar',
        collection: 'attar', gender: 'women',
        sizes: ATTAR,
        image: IMG.attarBottle,
        imageAlt: 'Arabian Perfumer\'s â€” Rose Taif pure attar oil',
        notes: ['Rose', 'Floral', 'Honey'],
        description: 'Precious Taif rose absolute in a pure oil base. Rich, honeyed petals with a lingering rosy warmth. No alcohol, long-lasting.',
        badge: 'ATTAR'
    },
    {
        id: 'attar-musk-white', brand: 'Arabian Perfumer\'s', name: 'White Musk Attar',
        collection: 'attar', gender: 'unisex',
        sizes: ATTAR,
        image: IMG.attarBottle,
        imageAlt: 'Arabian Perfumer\'s â€” White Musk pure attar oil',
        notes: ['Musk', 'Powdery', 'Clean'],
        description: 'Soft white musk in a pure oil carrier â€” clean, powdery, and skin-like. A versatile everyday attar that blends beautifully with other fragrances.',
        badge: 'ATTAR'
    },
    {
        id: 'attar-amber-oud', brand: 'Arabian Perfumer\'s', name: 'Amber Oud Attar',
        collection: 'attar', gender: 'unisex',
        sizes: ATTAR,
        image: IMG.attarBottle,
        imageAlt: 'Arabian Perfumer\'s â€” Amber Oud pure attar oil',
        notes: ['Amber', 'Oud', 'Vanilla'],
        description: 'Rich amber resin blended with oud oil â€” warm, golden, and intoxicating. Ideal as a solo scent or layered over a spray perfume.',
        badge: 'ATTAR'
    },
    {
        id: 'attar-saffron-oud', brand: 'Arabian Perfumer\'s', name: 'Saffron Oud Attar',
        collection: 'attar', gender: 'men',
        sizes: ATTAR,
        image: IMG.attarBottle,
        imageAlt: 'Arabian Perfumer\'s â€” Saffron Oud pure attar oil',
        notes: ['Saffron', 'Oud', 'Spicy'],
        description: 'The legendary saffron-oud combination in its purest form â€” a spicy, leathery, deeply Arabic accord that commands every room.',
        badge: 'ATTAR'
    },
    {
        id: 'attar-jasmine', brand: 'Arabian Perfumer\'s', name: 'Jasmine Attar',
        collection: 'attar', gender: 'women',
        sizes: ATTAR,
        image: IMG.attarBottle,
        imageAlt: 'Arabian Perfumer\'s â€” Jasmine pure attar oil',
        notes: ['Jasmine', 'Floral', 'Musk'],
        description: 'Pure jasmine absolute with a soft musky base. Heady, intoxicating, and unmistakably feminine. Traditional Indian mogra jasmine.',
        badge: 'ATTAR'
    },
    {
        id: 'attar-kewda', brand: 'Arabian Perfumer\'s', name: 'Kewda Attar',
        collection: 'attar', gender: 'unisex',
        sizes: ATTAR,
        image: IMG.attarBottle,
        imageAlt: 'Arabian Perfumer\'s â€” Kewda pure attar oil',
        notes: ['Floral', 'Green', 'Fresh'],
        description: 'Distilled from the fragrant pandanus flower â€” uniquely Indian, fresh-floral, with a sweet grassy undertone. A rare traditional attar.',
        badge: 'ATTAR'
    },
    {
        id: 'attar-sandalwood', brand: 'Arabian Perfumer\'s', name: 'Mysore Sandalwood Attar',
        collection: 'attar', gender: 'unisex',
        sizes: ATTAR,
        image: IMG.attarBottle,
        imageAlt: 'Arabian Perfumer\'s â€” Mysore Sandalwood pure attar oil',
        notes: ['Sandalwood', 'Woody', 'Creamy'],
        description: 'Authentic Mysore sandalwood oil â€” creamy, milky, and deeply meditative. One of the finest traditional Indian attars. Skin-safe and long-lasting.',
        badge: 'ATTAR'
    },

    /* ===========================================================
       SOLID PERFUME COLLECTION â€” Compact wax-based balm perfumes
       Starting â‚¹99 Â· Available in 8g and 15g
       =========================================================== */
    {
        id: 'solid-oud-royale', brand: 'Arabian Perfumer\'s', name: 'Oud Royale Solid Perfume',
        collection: 'solid', gender: 'unisex',
        sizes: SOLID,
        image: IMG.noir,
        imageAlt: 'Arabian Perfumer\'s â€” Oud Royale solid perfume compact',
        notes: ['Oud', 'Amber', 'Musk'],
        description: 'All the richness of oud and amber in a convenient wax-based solid compact. TSA-friendly, travel-perfect, no spill. Apply directly to pulse points.',
        badge: 'SOLID PERFUME'
    },
    {
        id: 'solid-rose-musk', brand: 'Arabian Perfumer\'s', name: 'Rose Musk Solid Perfume',
        collection: 'solid', gender: 'women',
        sizes: SOLID,
        image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfumer\'s â€” Rose Musk solid perfume compact',
        notes: ['Rose', 'Musk', 'Floral'],
        description: 'A blooming rose heart softened by white musk in a silky solid balm. Perfect for a subtle daytime scent. Fits in any pocket or purse.',
        badge: 'SOLID PERFUME'
    },
    {
        id: 'solid-amber-vanilla', brand: 'Arabian Perfumer\'s', name: 'Amber Vanilla Solid Perfume',
        collection: 'solid', gender: 'unisex',
        sizes: SOLID,
        image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfumer\'s â€” Amber Vanilla solid perfume compact',
        notes: ['Amber', 'Vanilla', 'Woody'],
        description: 'Warm amber and sweet vanilla in a comforting solid perfume balm. Cozy, gourmand-adjacent, and irresistibly smooth on skin.',
        badge: 'SOLID PERFUME'
    },
    {
        id: 'solid-fresh-citrus', brand: 'Arabian Perfumer\'s', name: 'Fresh Citrus Solid Perfume',
        collection: 'solid', gender: 'unisex',
        sizes: SOLID,
        image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfumer\'s â€” Fresh Citrus solid perfume compact',
        notes: ['Citrus', 'Fresh', 'Woody'],
        description: 'Bergamot, lemon, and cedar in a clean solid format. Light, refreshing, and perfect for the office or daytime wear.',
        badge: 'SOLID PERFUME'
    },
    {
        id: 'solid-jasmine-sandalwood', brand: 'Arabian Perfumer\'s', name: 'Jasmine Sandalwood Solid Perfume',
        collection: 'solid', gender: 'women',
        sizes: SOLID,
        image: IMG.perfumeBottle,
        imageAlt: 'Arabian Perfumer\'s â€” Jasmine Sandalwood solid perfume compact',
        notes: ['Jasmine', 'Sandalwood', 'Floral'],
        description: 'Heady jasmine blooms grounded by creamy Mysore sandalwood. A classic Indian floral accord in convenient solid form.',
        badge: 'SOLID PERFUME'
    },

    /* ===========================================================
       PERSONAL CARE â€” Body creams, herbal soaps, crack creams
       =========================================================== */
    {
        id: 'body-cream-solid-perfume',
        brand: "Arabian Perfumer's", name: 'Solid Perfume Body Creams',
        collection: 'personal-care', gender: 'unisex',
        productType: 'retail',
        sizes: { '1 unit': 100 },
        mrp:   { '1 unit': 280 },
        image: IMG.bodyCream,
        imageAlt: 'Arabian Perfumer\'s â€” Solid Perfume Body Cream',
        notes: ['Floral', 'Musk', 'Fresh'],
        description: 'Rich moisturising body cream infused with our signature fragrance blends. Available in multiple fragrance types. Sale â‚¹100 Â· MRP â‚¹280.',
        badge: 'PERSONAL CARE'
    },
    {
        id: 'mogra-body-cream',
        brand: "Arabian Perfumer's", name: 'Mogra Body Cream',
        collection: 'personal-care', gender: 'women',
        productType: 'retail',
        sizes: { '1 unit': 100 },
        mrp:   { '1 unit': 299 },
        image: IMG.bodyCream,
        imageAlt: 'Arabian Perfumer\'s â€” Mogra Body Cream in rose fragrance',
        notes: ['Jasmine', 'Floral', 'Fresh'],
        description: 'Luxurious body cream with the intoxicating scent of fresh Mogra (jasmine) blooms. Sale â‚¹100 Â· MRP â‚¹299.',
        badge: 'PERSONAL CARE'
    },
    {
        id: 'handmade-herbal-soaps',
        brand: "Arabian Perfumer's", name: 'Handmade Herbal Soaps',
        collection: 'personal-care', gender: 'unisex',
        productType: 'retail',
        sizes: { '1 bar': 55 },
        image: IMG.herbalSoap,
        imageAlt: 'Arabian Perfumer\'s â€” Handmade Herbal Soaps',
        notes: ['Herbal', 'Fresh', 'Green'],
        description: 'Grade-1 quality handmade herbal soaps with TFM 80%. Available in 10 varieties: Papaya, Charcoal, Red Sandal, Aloe Vera, Neem, Tulsi and more. â‚¹55 per bar.',
        badge: 'HERBAL Â· â‚¹55'
    },
    {
        id: 'crack-cream',
        brand: "Arabian Perfumer's", name: 'Crack Cream',
        collection: 'personal-care', gender: 'unisex',
        productType: 'enquiry',
        sizes: {},
        image: IMG.bodyCream,
        imageAlt: 'Arabian Perfumer\'s â€” Crack Cream',
        notes: ['Herbal', 'Fresh'],
        description: 'Intensive heel and crack repair cream. Enquire on WhatsApp for pricing and availability.',
        badge: 'ENQUIRE',
        needsVerification: true
    },

    /* ===========================================================
       HOME FRAGRANCE â€” Burners, incense, diffusers, bakhoor
       =========================================================== */
    {
        id: 'wooden-bakhoor-burner',
        brand: "Arabian Perfumer's", name: 'Wooden Bakhoor Burner',
        collection: 'home-fragrance', gender: 'unisex',
        productType: 'retail',
        sizes: { '1 piece': 250 },
        image: IMG.bakhoorBurner,
        imageAlt: 'Arabian Perfumer\'s â€” Wooden Bakhoor Burner',
        notes: ['Oud', 'Woody', 'Amber'],
        description: 'Beautifully crafted wooden bakhoor burner for incense and bakhoor. Elegant Arabian design. â‚¹250 per piece.',
        badge: 'HOME FRAGRANCE'
    },
    {
        id: 'jawadhu-powder',
        brand: "Arabian Perfumer's", name: 'Jawadhu Powder',
        collection: 'home-fragrance', gender: 'unisex',
        productType: 'retail',
        sizes: { '10g': 150 },
        image: IMG.jawadhuPowder,
        imageAlt: 'Arabian Perfumer\'s â€” Jawadhu Powder 10g',
        notes: ['Oud', 'Spicy', 'Amber'],
        description: 'Traditional South Indian aromatic Jawadhu powder â€” a blend of precious woods, resins and spices. 10g Â· â‚¹150.',
        badge: 'HOME FRAGRANCE'
    },
    {
        id: 'premium-dhoop-sticks',
        brand: "Arabian Perfumer's", name: 'Premium Dhoop Sticks',
        collection: 'home-fragrance', gender: 'unisex',
        productType: 'enquiry',
        sizes: {},
        image: IMG.dhoopSticks,
        imageAlt: 'Arabian Perfumer\'s â€” Premium Dhoop Sticks',
        notes: ['Incense', 'Woody', 'Oud'],
        description: 'Premium quality dhoop sticks available in 6 fragrance types. Enquire on WhatsApp for pricing.',
        badge: 'ENQUIRE',
        needsVerification: true
    },
    {
        id: 'aroma-burner',
        brand: "Arabian Perfumer's", name: 'Aroma Burners',
        collection: 'home-fragrance', gender: 'unisex',
        productType: 'wholesale',
        sizes: {},
        moq: '32 pieces',
        image: IMG.aromaBurner,
        imageAlt: 'Arabian Perfumer\'s â€” Aroma Burners',
        notes: ['Oud', 'Amber', 'Spicy'],
        description: 'Decorative aroma burners for use with essential oils and attars. MOQ 32 pieces. Enquire on WhatsApp for wholesale pricing.',
        badge: 'WHOLESALE'
    },
    {
        id: 'electrical-bakhoor-burner',
        brand: "Arabian Perfumer's", name: 'Electrical Bakhoor Burner',
        collection: 'home-fragrance', gender: 'unisex',
        productType: 'enquiry',
        sizes: {},
        image: IMG.bakhoorBurner,
        imageAlt: 'Arabian Perfumer\'s â€” Electrical Bakhoor Burner',
        notes: ['Oud', 'Amber'],
        description: 'Modern electric bakhoor burner â€” no flame needed. Safe and convenient for home use. Enquire on WhatsApp for pricing.',
        badge: 'ENQUIRE',
        needsVerification: true
    },
    {
        id: 'non-electric-bakhoor-burner',
        brand: "Arabian Perfumer's", name: 'Non-Electric Bakhoor Burner',
        collection: 'home-fragrance', gender: 'unisex',
        productType: 'enquiry',
        sizes: {},
        image: IMG.bakhoorBurner,
        imageAlt: 'Arabian Perfumer\'s â€” Non-Electric Bakhoor Burner',
        notes: ['Oud', 'Amber', 'Woody'],
        description: 'Traditional non-electric bakhoor burner. Multiple models available. Enquire on WhatsApp for pricing.',
        badge: 'ENQUIRE',
        needsVerification: true
    },
    {
        id: 'car-hanging-perfume',
        brand: "Arabian Perfumer's", name: 'Car Hanging Perfumes',
        collection: 'home-fragrance', gender: 'unisex',
        productType: 'enquiry',
        sizes: {},
        image: IMG.carPerfume,
        imageAlt: 'Arabian Perfumer\'s â€” Car Hanging Perfumes',
        notes: ['Fresh', 'Citrus', 'Musk'],
        description: 'Elegant car hanging perfume diffusers in a variety of Arabian fragrances. Enquire on WhatsApp for pricing.',
        badge: 'ENQUIRE',
        needsVerification: true
    },
    {
        id: 'diffuser',
        brand: "Arabian Perfumer's", name: 'Reed Diffusers',
        collection: 'home-fragrance', gender: 'unisex',
        productType: 'enquiry',
        sizes: {},
        image: IMG.reedDiffuser,
        imageAlt: 'Arabian Perfumer\'s â€” Reed Diffusers',
        notes: ['Fresh', 'Floral', 'Oud'],
        description: 'Elegant reed diffusers to fragrance your home continuously. Enquire on WhatsApp for pricing and fragrance options.',
        badge: 'ENQUIRE',
        needsVerification: true
    },

    /* ===========================================================
       BOTTLES & PACKAGING â€” Attar bottles, perfume bottles, gift boxes
       =========================================================== */
    {
        id: 'display-attar-bottles',
        brand: "Arabian Perfumer's", name: 'Display Attar Bottles',
        collection: 'packaging', gender: 'unisex',
        productType: 'retail',
        sizes: { '1 piece': 390 },
        mrp:   { '1 piece': 450 },
        image: IMG.attarBottlesDisplay,
        imageAlt: 'Arabian Perfumer\'s â€” Display Attar Bottles',
        notes: ['Packaging'],
        description: 'Premium display attar bottle containers. Multiple models available. Sale â‚¹390 Â· MRP â‚¹450.',
        badge: 'PACKAGING'
    },
    {
        id: 'golden-attar-bottles',
        brand: "Arabian Perfumer's", name: 'Golden Attar Bottles',
        collection: 'packaging', gender: 'unisex',
        productType: 'enquiry',
        sizes: {},
        image: IMG.attarBottlesDisplay,
        imageAlt: 'Arabian Perfumer\'s â€” Golden Attar Bottles',
        notes: ['Packaging'],
        description: 'Elegant golden attar bottles in multiple models including 3ml. Perfect for gifting. Enquire on WhatsApp for pricing.',
        badge: 'ENQUIRE',
        needsVerification: true
    },
    {
        id: 'attar-bottles-wholesale',
        brand: "Arabian Perfumer's", name: 'Attar Bottles (6ml & 12ml)',
        collection: 'packaging', gender: 'unisex',
        productType: 'wholesale',
        sizes: {},
        moq: '240 pieces',
        image: IMG.attarBottlesDisplay,
        imageAlt: 'Arabian Perfumer\'s â€” Wholesale Attar Bottles 6ml 12ml',
        notes: ['Packaging'],
        description: 'Wholesale attar bottles available in 6ml and 12ml sizes. MOQ 240 pieces. Enquire on WhatsApp for bulk pricing.',
        badge: 'WHOLESALE'
    },
    {
        id: 'perfume-bottle-100ml',
        brand: "Arabian Perfumer's", name: '100ml Perfume Bottles',
        collection: 'packaging', gender: 'unisex',
        productType: 'wholesale',
        sizes: { '1 piece': 130 },
        moq: '2 boxes',
        image: IMG.perfumeBottlesWholesale,
        imageAlt: 'Arabian Perfumer\'s â€” 100ml Perfume Bottles',
        notes: ['Packaging'],
        description: 'Wholesale 100ml perfume bottles. MOQ 2 boxes. â‚¹130 per piece. Contact on WhatsApp for exact box quantities and pricing.',
        badge: 'WHOLESALE'
    },
    {
        id: 'perfume-bottle-50ml',
        brand: "Arabian Perfumer's", name: '50ml Perfume Bottles',
        collection: 'packaging', gender: 'unisex',
        productType: 'wholesale',
        sizes: { '1 piece': 100 },
        moq: '2 boxes',
        image: IMG.perfumeBottlesWholesale,
        imageAlt: 'Arabian Perfumer\'s â€” 50ml Perfume Bottles',
        notes: ['Packaging'],
        description: 'Wholesale 50ml perfume bottles. MOQ 2 boxes. â‚¹100 per piece. Enquire on WhatsApp for bulk orders.',
        badge: 'WHOLESALE'
    },
    {
        id: 'perfume-bottle-30ml',
        brand: "Arabian Perfumer's", name: '30ml Screw Neck Bottles',
        collection: 'packaging', gender: 'unisex',
        productType: 'wholesale',
        sizes: { '1 piece': 90 },
        moq: '2 boxes',
        image: IMG.perfumeBottlesWholesale,
        imageAlt: 'Arabian Perfumer\'s â€” 30ml Screw Neck Perfume Bottles',
        notes: ['Packaging'],
        description: 'Wholesale 30ml screw neck perfume bottles. MOQ 2 boxes. â‚¹90 per piece. Enquire on WhatsApp for bulk orders.',
        badge: 'WHOLESALE'
    },
    {
        id: 'attar-box-wholesale',
        brand: "Arabian Perfumer's", name: 'Attar Boxes (Wholesale)',
        collection: 'packaging', gender: 'unisex',
        productType: 'wholesale',
        sizes: {},
        moq: '120 pieces',
        image: IMG.attarGiftPack,
        imageAlt: 'Arabian Perfumer\'s â€” Attar Box Wholesale',
        notes: ['Packaging'],
        description: 'Attar gift boxes available in wholesale. MOQ 120 pieces. Enquire on WhatsApp for pricing.',
        badge: 'WHOLESALE',
        needsVerification: true
    },
    {
        id: 'attar-gift-box-12ml',
        brand: "Arabian Perfumer's", name: 'Attar Gift Box 12ml',
        collection: 'packaging', gender: 'unisex',
        productType: 'enquiry',
        sizes: {},
        image: IMG.attarGiftPack,
        imageAlt: 'Arabian Perfumer\'s â€” Attar Gift Box 12ml',
        notes: ['Packaging'],
        description: 'Elegant 12ml attar gift box â€” ideal for gifting and special occasions. Enquire on WhatsApp for pricing.',
        badge: 'ENQUIRE',
        needsVerification: true
    },
    {
        id: 'attar-gift-pack-3-6-12ml',
        brand: "Arabian Perfumer's", name: 'Attar Gift Pack (3ml / 6ml / 12ml)',
        collection: 'packaging', gender: 'unisex',
        productType: 'enquiry',
        sizes: {},
        image: IMG.attarGiftPack,
        imageAlt: 'Arabian Perfumer\'s â€” Attar Gift Pack 3ml 6ml 12ml',
        notes: ['Packaging'],
        description: 'Beautiful attar gift pack available in 3ml, 6ml, and 12ml sizes â€” perfect as a premium gift set. Enquire on WhatsApp for pricing.',
        badge: 'ENQUIRE',
        needsVerification: true
    },

    /* ===========================================================
       WHOLESALE â€” Raw attar materials & bulk fragrance supply
       =========================================================== */
    {
        id: 'wholesale-attar-raw',
        brand: "Arabian Perfumer's", name: 'Wholesale Attar (Raw Material)',
        collection: 'wholesale', gender: 'unisex',
        productType: 'wholesale',
        sizes: {},
        moq: '100g â€“ 50kg',
        image: IMG.wholesaleAttar,
        imageAlt: 'Arabian Perfumer\'s â€” Wholesale Attar Raw Material',
        notes: ['Oud', 'Amber', 'Musk', 'Rose'],
        description: 'Wholesale raw attar and fragrance oil supply available from 100g to 50kg. Suitable for businesses, perfumers, and manufacturers. Enquire on WhatsApp for pricing.',
        badge: 'WHOLESALE'
    },
    {
        id: 'wholesale-fragrance-service',
        brand: "Arabian Perfumer's", name: 'French, Arabic & Indian Perfume Supply',
        collection: 'wholesale', gender: 'unisex',
        productType: 'wholesale',
        sizes: {},
        image: IMG.wholesaleAttar,
        imageAlt: 'Arabian Perfumer\'s â€” Wholesale Fragrance Service',
        notes: ['Oud', 'Floral', 'Fresh', 'Spicy'],
        description: 'Business-to-business wholesale supply of French, Arabic and Indian inspired fragrances. Custom blending available. Enquire on WhatsApp.',
        badge: 'WHOLESALE'
    }

]); /* end of products array */
