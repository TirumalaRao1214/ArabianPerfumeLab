/**
 * Arabian Perfume Lab — Product Catalogue (v7)
 *
 * SINGLE SOURCE OF TRUTH for all product data including prices.
 * The cart module reads prices exclusively from here.
 *
 * Schema:
 *   id       {string}  URL-safe unique identifier
 *   name     {string}  Product display name
 *   category {string}  Slug — one of the CATEGORIES keys below
 *   notes    {string[]} Fragrance note tags (used by scent quiz)
 *   description {string}
 *   sizes    {object}  Composite variant keys → { type, label, price }
 *
 * CATEGORY SLUGS (customer-facing labels in parentheses):
 *   french-attars              → French Attars
 *   arabic-attars              → Arabic Attars
 *   floral-attars              → Floral Attars
 *   french-arabic-mix-attars   → French & Arabic Mix Attars
 *   french-perfumes            → French Perfumes  (virtual — maps to french-attars products)
 *   arabic-perfumes            → Arabic Perfumes  (virtual — maps to arabic-attars products)
 *   floral-perfumes            → Floral Perfumes  (virtual — maps to floral-attars products)
 *
 * Composite variant key format:  "type:sizeLabel"
 *   attar:3ml | attar:6ml | attar:12ml
 *   perfume:20ml | perfume:50ml | perfume:100ml
 *   solid:10g
 *
 * The cart stores: { id, size (composite key), qty }
 * Cart price is looked up as: product.sizes[size].price
 *
 * Image is determined at render-time by selected variant composite key:
 *   attar:3ml   → assets/images/products/Attar-3ml.png
 *   attar:6ml   → assets/images/products/Attar-6ml.png
 *   attar:12ml  → assets/images/products/Attar-12ml.png
 *   perfume:20ml → assets/images/products/Perfume-20ml.png
 *   perfume:50ml → assets/images/products/Perfume-50ml.png
 *   perfume:100ml → assets/images/products/Perfume-100ml.png
 *   solid:10g   → assets/images/Body-cream.png
 *
 * Each variant key maps directly to its own individual image file.
 * No sprite cropping, no background-position, no scale transforms.
 */

/**
 * CATEGORIES — canonical mapping of subcategory slug → display label.
 * Only real product slugs live here. "all", parent group IDs and
 * body-care group ID are UI sentinels — intentionally absent.
 */
const CATEGORIES = Object.freeze({
    // ── Attar sub-categories ──────────────────────────────────────
    'french-attars':            'French Attars',
    'arabic-attars':            'Arabic Attars',
    'floral-attars':            'Floral Attars',
    'french-arabic-mix-attars': 'French & Arabic Mix Attars',
    // ── Perfume sub-categories ────────────────────────────────────
    'french-perfumes':              'French Perfumes',
    'arabic-perfumes':              'Arabic Perfumes',
    'floral-perfumes':              'Floral Perfumes',
    'french-arabic-mix-perfumes':   'French & Arabic Mix Perfumes',
    // ── Body Care ─────────────────────────────────────────────────
    'body-creams-solid-perfumes': 'Body Creams / Solid Perfumes'
});

/**
 * CATEGORY_GROUPS — parent group slug → array of child subcategory slugs.
 * Used to populate the Subcategory dropdown and for group-level filtering.
 * body-care has no sub-selection — it is a leaf category itself.
 */
const CATEGORY_GROUPS = Object.freeze({
    'attars': [
        'french-attars', 'arabic-attars', 'floral-attars', 'french-arabic-mix-attars'
    ],
    'perfumes': [
        'french-perfumes', 'arabic-perfumes', 'floral-perfumes', 'french-arabic-mix-perfumes'
    ],
    'body-care': []   // leaf — no subcategories
});

/**
 * SUBCATEGORY_LABELS — display label for each parent group option.
 */
const SUBCATEGORY_LABELS = Object.freeze({
    'attars':    'Attars',
    'perfumes':  'Perfumes',
    'body-care': 'Body Care'
});

/**
 * CATEGORY_TYPE_MAP — maps each subcategory slug (or parent group) to the
 * product type that should be automatically activated.
 * "all" is intentionally absent — no type is forced.
 */
const CATEGORY_TYPE_MAP = Object.freeze({
    // Parent groups
    'attars':    'attar',
    'perfumes':  'perfume',
    'body-care': 'solid',

    // Attar sub-categories
    'french-attars':            'attar',
    'arabic-attars':            'attar',
    'floral-attars':            'attar',
    'french-arabic-mix-attars': 'attar',

    // Perfume sub-categories
    'french-perfumes':            'perfume',
    'arabic-perfumes':            'perfume',
    'floral-perfumes':            'perfume',
    'french-arabic-mix-perfumes': 'perfume',

    // Body Care
    'body-creams-solid-perfumes': 'solid'
});

/* ---------- Individual bottle image map ---------- */
const BOTTLE_IMAGES = Object.freeze({
    'attar:3ml':    'assets/images/products/Attar-3ml.png',
    'attar:6ml':    'assets/images/products/Attar-6ml.png',
    'attar:12ml':   'assets/images/products/Attar-12ml.png',
    'perfume:20ml': 'assets/images/products/Perfume-20ml.png',
    'perfume:50ml': 'assets/images/products/Perfume-50ml.png',
    'perfume:100ml':'assets/images/products/Perfume-100ml.png',
    'solid:10g':    'assets/images/Body-cream.png'
});

/**
 * Return the image path for a given composite size key (or type + sizeKey).
 * Accepts both composite keys ('attar:3ml') and separate type + bare key ('attar', '3ml').
 * Falls back to a placeholder if the key is not recognised.
 *
 * @param {string} typeOrComposite  - 'attar' | 'perfume' | 'solid'  OR composite key 'attar:3ml'
 * @param {string} [sizeKey]        - composite key 'attar:3ml' or bare key '3ml' (optional)
 * @returns {string} image src path
 */
function getBottleImage(typeOrComposite, sizeKey) {
    // Normalise: accept composite key in either argument
    let composite = sizeKey
        ? (sizeKey.includes(':') ? sizeKey : typeOrComposite + ':' + sizeKey)
        : typeOrComposite;
    return BOTTLE_IMAGES[composite] || 'assets/images/products/Attar-3ml.png';
}

/** Returns the image src for a product type's default (smallest) variant */
function getProductImage(type) {
    const defaults = {
        attar:   'assets/images/products/Attar-3ml.png',
        perfume: 'assets/images/products/Perfume-20ml.png',
        solid:   'assets/images/Body-cream.png'
    };
    return defaults[type] || 'assets/images/products/Attar-3ml.png';
}

/* =============================================================
   PRICING PRESETS — one per category, covering both Attar and
   Perfume variants.  Each function returns a plain object that
   is merged together with the solid variant by _sz().
   ============================================================= */

/* ---- arabic-attars (oriental musk tier) ---- */
const ATTAR_ATTARS  = () => ({
    'attar:3ml':  { type:'attar',   label:'3 ml',   price:149 },
    'attar:6ml':  { type:'attar',   label:'6 ml',   price:299 },
    'attar:12ml': { type:'attar',   label:'12 ml',  price:599 }
});
const PERF_ATTARS   = () => ({
    'perfume:20ml':  { type:'perfume', label:'20 ml',  price:349 },
    'perfume:50ml':  { type:'perfume', label:'50 ml',  price:599 },
    'perfume:100ml': { type:'perfume', label:'100 ml', price:999 }
});

/* ---- arabic-attars (oud/amber tier) ---- */
const ATTAR_ARABIC  = () => ({
    'attar:3ml':  { type:'attar',   label:'3 ml',   price:199 },
    'attar:6ml':  { type:'attar',   label:'6 ml',   price:399 },
    'attar:12ml': { type:'attar',   label:'12 ml',  price:799 }
});
const PERF_ARABIC   = () => ({
    'perfume:20ml':  { type:'perfume', label:'20 ml',  price:499 },
    'perfume:50ml':  { type:'perfume', label:'50 ml',  price:999 },
    'perfume:100ml': { type:'perfume', label:'100 ml', price:1899 }
});

/* ---- french-arabic-mix-attars ---- */
const ATTAR_FA      = () => ({
    'attar:3ml':  { type:'attar',   label:'3 ml',   price:149 },
    'attar:6ml':  { type:'attar',   label:'6 ml',   price:299 },
    'attar:12ml': { type:'attar',   label:'12 ml',  price:599 }
});
const PERF_FA       = () => ({
    'perfume:20ml':  { type:'perfume', label:'20 ml',  price:499 },
    'perfume:50ml':  { type:'perfume', label:'50 ml',  price:999 },
    'perfume:100ml': { type:'perfume', label:'100 ml', price:1599 }
});

/* ---- floral-attars ---- */
const ATTAR_FLORAL  = () => ({
    'attar:3ml':  { type:'attar',   label:'3 ml',   price:199 },
    'attar:6ml':  { type:'attar',   label:'6 ml',   price:399 },
    'attar:12ml': { type:'attar',   label:'12 ml',  price:799 }
});
const PERF_FLORAL   = () => ({
    'perfume:20ml':  { type:'perfume', label:'20 ml',  price:499 },
    'perfume:50ml':  { type:'perfume', label:'50 ml',  price:899 },
    'perfume:100ml': { type:'perfume', label:'100 ml', price:1599 }
});

/* ---- french-attars ---- */
const ATTAR_FRENCH  = () => ({
    'attar:3ml':  { type:'attar',   label:'3 ml',   price:149 },
    'attar:6ml':  { type:'attar',   label:'6 ml',   price:299 },
    'attar:12ml': { type:'attar',   label:'12 ml',  price:599 }
});
const PERF_FRENCH   = () => ({
    'perfume:20ml':  { type:'perfume', label:'20 ml',  price:499 },
    'perfume:50ml':  { type:'perfume', label:'50 ml',  price:999 },
    'perfume:100ml': { type:'perfume', label:'100 ml', price:1599 }
});

/* ---- body-creams-solid-perfumes ---- */
const SOLID_BODY    = () => ({
    'solid:10g': { type:'solid', label:'10g', price:99 }
});

/** Merge variant presets and append the solid variant */
function _sz(...partials) {
    const merged = Object.assign({}, ...partials);
    merged['solid:10g'] = { type:'solid', label:'10g', price:99 };
    return Object.freeze(merged);
}

/* ============================================================
   PRODUCTS ARRAY  (68 products, slug-based categories)
   ============================================================ */
const products = Object.freeze([

    /* ===================================================
       ARABIC ATTARS — oriental musk group  (6 products)
       Attar pricing: ₹149 / ₹299 / ₹599
       Perfume pricing: ₹349 / ₹599 / ₹999
       =================================================== */
    { id:'white-musk',          name:'White Musk',          category:'arabic-attars', notes:['Musk','Soft','Powdery'],      description:'A clean, delicate white musk with a soft powdery finish.',              sizes:_sz(ATTAR_ATTARS(), PERF_ATTARS()) },
    { id:'red-musk',            name:'Red Musk',            category:'arabic-attars', notes:['Musk','Warm','Spicy'],        description:'Rich and warm red musk with a bold, lingering sillage.',                sizes:_sz(ATTAR_ATTARS(), PERF_ATTARS()) },
    { id:'purple-musk',         name:'Purple Musk',         category:'arabic-attars', notes:['Musk','Floral','Sweet'],      description:'A sweet and floral purple musk with an enchanting character.',           sizes:_sz(ATTAR_ATTARS(), PERF_ATTARS()) },
    { id:'chocolate-musk',      name:'Chocolate Musk',      category:'arabic-attars', notes:['Musk','Chocolate','Sweet'],   description:'Indulgent chocolate meets warm musk in this irresistible blend.',         sizes:_sz(ATTAR_ATTARS(), PERF_ATTARS()) },
    { id:'chocolate-vanilla',   name:'Chocolate Vanilla',   category:'arabic-attars', notes:['Vanilla','Chocolate','Sweet'],description:'Smooth chocolate and creamy vanilla form a comforting gourmand blend.',  sizes:_sz(ATTAR_ATTARS(), PERF_ATTARS()) },
    { id:'chocolate-temptation',name:'Chocolate Temptation',category:'arabic-attars', notes:['Chocolate','Sweet','Musk'],   description:'A deeply tempting blend of dark chocolate and musky sweetness.',          sizes:_sz(ATTAR_ATTARS(), PERF_ATTARS()) },

    /* ===================================================
       ARABIC ATTARS — oud/amber group  (9 products)
       Attar pricing: ₹199 / ₹399 / ₹799
       Perfume pricing: ₹499 / ₹999 / ₹1899
       =================================================== */
    { id:'oud-beauty',        name:'Oud Beauty',        category:'arabic-attars', notes:['Oud','Amber','Woody'],    description:'Precious oud wrapped in warm amber and sandalwood.',                      sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'amir-al-oud',       name:'Amir Al Oud',       category:'arabic-attars', notes:['Oud','Amber','Royal'],    description:'The prince of oud — a majestic Arabian oud composition.',                 sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'back-to-black-oud', name:'Back to Black Oud', category:'arabic-attars', notes:['Oud','Dark','Smoky'],     description:'Deep and smoky oud with an intense, captivating presence.',               sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'highness',          name:'Highness',          category:'arabic-attars', notes:['Oud','Rose','Floral'],    description:'Regal and floral — a royal oud composition fit for royalty.',             sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'don-black',         name:'Don Black',         category:'arabic-attars', notes:['Oud','Spicy','Woody'],    description:'Bold and commanding — dark oud with spicy accents.',                      sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'aseel',             name:'Aseel',             category:'arabic-attars', notes:['Amber','Musk','Oriental'],description:'A classic Arabian blend of amber and warm musk.',                         sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'royal-nights',      name:'Royal Nights',      category:'arabic-attars', notes:['Oud','Amber','Rich'],     description:'A rich and opulent Arabian night fragrance.',                             sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'arabian-pure',      name:'Arabian Pure',      category:'arabic-attars', notes:['Oud','Clean','Musk'],     description:'Pure Arabian essence — clean, refined and authentic.',                   sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'marrah',            name:'Marrah',            category:'arabic-attars', notes:['Floral','Amber','Musk'],  description:'Warm florals over a bed of amber and musk.',                              sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },

    /* ===================================================
       FRENCH & ARABIC MIX ATTARS  (17 products)
       Attar pricing: ₹149 / ₹299 / ₹599
       Perfume pricing: ₹499 / ₹999 / ₹1599
       =================================================== */
    { id:'black-opium',     name:'Black Opium',     category:'french-arabic-mix-attars', notes:['Coffee','Vanilla','Sweet'],  description:'Bold coffee and vanilla with dark florals.',                            sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'armani-si',       name:'Armani Si',       category:'french-arabic-mix-attars', notes:['Floral','Chypre','Fruity'],  description:'Blackcurrant and rose on a warm patchouli base.',                       sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'white-oud',       name:'White Oud',       category:'french-arabic-mix-attars', notes:['Oud','Clean','Floral'],      description:'Light and clean oud with a fresh floral character.',                    sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'khamra',          name:'Khamra',          category:'french-arabic-mix-attars', notes:['Oriental','Warm','Sweet'],   description:'Warm and intoxicating oriental blend.',                                 sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'br-540',          name:'BR 540',          category:'french-arabic-mix-attars', notes:['Amber','Floral','Woody'],    description:'The iconic saffron-amber woody composition.',                           sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'poison',          name:'Poison',          category:'french-arabic-mix-attars', notes:['Oriental','Floral','Spicy'], description:'Spellbinding oriental florals with a dark mystery.',                    sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'tobacco-vanilla', name:'Tobacco Vanilla', category:'french-arabic-mix-attars', notes:['Tobacco','Vanilla','Amber'], description:'Rich tobacco leaf meets sweet vanilla in a warm embrace.',               sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'tobacco-oud',     name:'Tobacco Oud',     category:'french-arabic-mix-attars', notes:['Tobacco','Oud','Woody'],     description:'Bold tobacco intertwined with precious Arabian oud.',                   sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'intoxicated',     name:'Intoxicated',     category:'french-arabic-mix-attars', notes:['Coffee','Cardamom','Sweet'], description:'An intoxicating blend of coffee, cardamom and spice.',                  sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'blue-dc',         name:'Blue D C',        category:'french-arabic-mix-attars', notes:['Fresh','Aquatic','Citrus'],  description:'Fresh aquatic citrus — the signature sporty blue accord.',              sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'vph',             name:'VPH',             category:'french-arabic-mix-attars', notes:['Woody','Aromatic','Fresh'],  description:'Aromatic woody freshness with a masculine depth.',                      sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'lacoste-1212',    name:'Lacoste 1212',    category:'french-arabic-mix-attars', notes:['Fresh','Citrus','Clean'],    description:'Clean and vibrant citrus freshness.',                                   sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'tam-dao',         name:'Tam Dao',         category:'french-arabic-mix-attars', notes:['Sandalwood','Cedar','Woody'],description:'Serene sandalwood and cedar in a temple-like composition.',              sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'icon',            name:'Icon',            category:'french-arabic-mix-attars', notes:['Spicy','Woody','Amber'],     description:'Iconic spicy woody accord with an amber drydown.',                      sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'mb-legend',       name:'MB Legend',       category:'french-arabic-mix-attars', notes:['Fougere','Woody','Fresh'],   description:'A reliable and elegant fougère with fresh bergamot.',                   sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'l-homme',         name:'L-Homme',         category:'french-arabic-mix-attars', notes:['Citrus','Woody','Spicy'],    description:'Crisp citrus and spice over a warm woody base.',                        sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'paradox',         name:'Paradox',         category:'french-arabic-mix-attars', notes:['Floral','Citrus','Musk'],    description:'Neroli, white musk and cedarwood — the scent of contradiction.',         sizes:_sz(ATTAR_FA(), PERF_FA()) },

    /* ===================================================
       FLORAL ATTARS  (7 products)
       Attar pricing: ₹199 / ₹399 / ₹799
       Perfume pricing: ₹499 / ₹899 / ₹1599
       =================================================== */
    { id:'musk-rose',    name:'Musk Rose',    category:'floral-attars', notes:['Rose','Musk','Floral'],    description:'Delicate rose petals over a soft musky base.',                    sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'pure-rose',    name:'Pure Rose',    category:'floral-attars', notes:['Rose','Floral','Fresh'],   description:'The pure, undiluted essence of a fresh-bloomed rose.',            sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'lily-jasmine', name:'Lily Jasmine', category:'floral-attars', notes:['Lily','Jasmine','Floral'], description:'A feminine blend of lily and jasmine blossoms.',                  sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'lavender',     name:'Lavender',     category:'floral-attars', notes:['Lavender','Herbal','Calm'],description:'Calming and aromatic pure lavender.',                            sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'gucci-flora',  name:'Gucci Flora',  category:'floral-attars', notes:['Floral','Citrus','Musk'],  description:'Citrus blossoms, peony and rose on a sandalwood base.',           sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'blue-lady',    name:'Blue Lady',    category:'floral-attars', notes:['Floral','Fresh','Aquatic'], description:'Fresh and feminine — florals with a breezy aquatic edge.',       sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'y-by-ysl',     name:'Y by YSL',     category:'floral-attars', notes:['Fruity','Floral','Woody'],  description:'Apple, ginger and sage over a warm amber base.',                  sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },

    /* ===================================================
       FRENCH ATTARS  (12 products)
       Attar pricing: ₹149 / ₹299 / ₹599
       Perfume pricing: ₹499 / ₹999 / ₹1599
       =================================================== */
    { id:'polo',         name:'Polo',         category:'french-attars', notes:['Green','Herbal','Woody'],   description:'Crisp herbal greens and rich woods — a timeless classic.',          sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'aqua-gio',     name:'Aqua Gio',     category:'french-attars', notes:['Aquatic','Citrus','Fresh'],  description:'The definitive aquatic — bergamot and sea spray over musk.',        sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'cr-7',         name:'CR-7',         category:'french-attars', notes:['Fresh','Spicy','Woody'],    description:'Energetic and bold — fresh citrus with spicy heart notes.',         sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'m-rehab',      name:'M-Rehab',      category:'french-attars', notes:['Oriental','Sweet','Warm'],  description:'Warm and sweet oriental blend with a comforting drydown.',          sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'fruity-musk',  name:'Fruity Musk',  category:'french-attars', notes:['Fruity','Musk','Sweet'],    description:'Bright fruit notes layered over a clean soft musk.',                sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'hawas',        name:'Hawas',        category:'french-attars', notes:['Aquatic','Spicy','Fresh'],  description:'Mint, cardamom and sea notes over vetiver and sandalwood.',         sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'lucky',        name:'Lucky',        category:'french-attars', notes:['Fresh','Citrus','Floral'],  description:'A light and fresh lucky charm with uplifting citrus florals.',      sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'stronger',     name:'Stronger',     category:'french-attars', notes:['Spicy','Amber','Woody'],    description:'Chestnut, cardamom and vanilla — warmth and strength combined.',    sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'aventus',      name:'Aventus',      category:'french-attars', notes:['Fruity','Smoky','Woody'],   description:'Pineapple, birch and oakmoss — the scent of success.',              sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'sauvage',      name:'Sauvage',      category:'french-attars', notes:['Fresh','Spicy','Woody'],    description:'Bold raw freshness — bergamot and ambroxan over mineral woods.',    sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'eros-versace', name:'Eros Versace', category:'french-attars', notes:['Minty','Vanilla','Woody'],  description:'Mint, green apple and vanilla on tonka and vetiver.',               sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'most-wanted',  name:'Most Wanted',  category:'french-attars', notes:['Spicy','Amber','Woody'],    description:'Cardamom, juniper berry and coumarin — the fragrance of audacity.', sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },

    /* ===================================================
       BUILD YOUR OWN BOX products (16)
       category:'byob-only' — excluded from the main catalogue.
       These records exist solely so BYOB can look up names for
       WhatsApp orders. They are never shown in the Collection grid.
       =================================================== */
    { id:'cool-water',              name:'Cool Water',              category:'byob-only', notes:['Aquatic','Fresh','Citrus'],    description:'', sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'jpg-le-male',             name:'JPG Le Male',             category:'byob-only', notes:['Fresh','Minty','Vanilla'],    description:'', sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'polo-sports',             name:'Polo Sports',             category:'byob-only', notes:['Fresh','Aquatic','Citrus'],   description:'', sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'erose-flame',             name:'Erose Flame',             category:'byob-only', notes:['Minty','Vanilla','Spicy'],    description:'', sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'paris-ocean',             name:'Paris Ocean',             category:'byob-only', notes:['Aquatic','Fresh','Marine'],   description:'', sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'lemon-lavender',          name:'Lemon Lavender',          category:'byob-only', notes:['Citrus','Lavender','Fresh'],  description:'', sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'lemon-blast',             name:'Lemon Blast',             category:'byob-only', notes:['Citrus','Fresh','Zesty'],     description:'', sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'white-tea',               name:'White Tea',               category:'byob-only', notes:['Fresh','Tea','Clean'],        description:'', sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'my-way-yalang',           name:'My Way Yalang',           category:'byob-only', notes:['Floral','Ylang','Vanilla'],   description:'', sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'libre-flowers-and-flame', name:'Libre Flowers and Flame', category:'byob-only', notes:['Floral','Lavender','Vanilla'],description:'', sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'honey-suckle',            name:'Honey Suckle',            category:'byob-only', notes:['Floral','Honey','Sweet'],     description:'', sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'jasmine',                 name:'Jasmine',                 category:'byob-only', notes:['Jasmine','Floral','Sweet'],   description:'', sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'pink-peach',              name:'Pink Peach',              category:'byob-only', notes:['Fruity','Peach','Sweet'],     description:'', sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'pink-luxica',             name:'Pink Luxica',             category:'byob-only', notes:['Fruity','Floral','Sweet'],    description:'', sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'zidaan-classic',          name:'Zidaan Classic',          category:'byob-only', notes:['Oud','Amber','Oriental'],     description:'', sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'blue-musk',               name:'Blue Musk',               category:'byob-only', notes:['Musk','Fresh','Aquatic'],    description:'', sizes:_sz(ATTAR_ATTARS(), PERF_ATTARS()) },

]);
