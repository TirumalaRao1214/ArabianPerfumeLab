/**
 * Arabian Perfume Lab — Product Catalogue (v6)
 *
 * SINGLE SOURCE OF TRUTH for all product data including prices.
 * The cart module reads prices exclusively from here.
 *
 * Schema:
 *   id       {string}  URL-safe unique identifier
 *   name     {string}  Product display name
 *   category {string}  One of: "Attars" | "Arabic" | "French & Arabic Mix" | "Floral" | "French"
 *   notes    {string[]} Fragrance note tags (used by scent quiz)
 *   description {string}
 *   sizes    {object}  Composite variant keys → { type, label, price }
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
 *   perfume:20ml → assets/images/products/perfume-20ml.png
 *   perfume:50ml → assets/images/products/perfume-50ml.png
 *   perfume:100ml → assets/images/products/perfume-100ml.png
 *   solid:10g   → assets/images/products/Solid-Perfumes.png
 *
 * Each variant key maps directly to its own individual image file.
 * No sprite cropping, no background-position, no scale transforms.
 */

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

/* ---- Attars category ---- */
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

/* ---- Arabic category ---- */
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

/* ---- French & Arabic Mix category ---- */
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

/* ---- Floral category ---- */
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

/* ---- French category ---- */
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

/** Merge variant presets and append the solid variant */
function _sz(...partials) {
    const merged = Object.assign({}, ...partials);
    merged['solid:10g'] = { type:'solid', label:'10g', price:99 };
    return Object.freeze(merged);
}

/* ============================================================
   PRODUCTS ARRAY  (51 products, 5 categories)
   Each product carries full Attar + Perfume + Solid variants.
   ============================================================ */
const products = Object.freeze([

    /* ===================================================
       1. ATTARS  (6 products)
       Attar pricing: ₹149 / ₹299 / ₹599
       Perfume pricing: ₹349 / ₹599 / ₹999
       =================================================== */
    { id:'white-musk',         name:'White Musk',          category:'Attars', notes:['Musk','Soft','Powdery'],      description:'A clean, delicate white musk with a soft powdery finish.',              sizes:_sz(ATTAR_ATTARS(), PERF_ATTARS()) },
    { id:'red-musk',           name:'Red Musk',            category:'Attars', notes:['Musk','Warm','Spicy'],        description:'Rich and warm red musk with a bold, lingering sillage.',                sizes:_sz(ATTAR_ATTARS(), PERF_ATTARS()) },
    { id:'purple-musk',        name:'Purple Musk',         category:'Attars', notes:['Musk','Floral','Sweet'],      description:'A sweet and floral purple musk with an enchanting character.',           sizes:_sz(ATTAR_ATTARS(), PERF_ATTARS()) },
    { id:'chocolate-musk',     name:'Chocolate Musk',      category:'Attars', notes:['Musk','Chocolate','Sweet'],   description:'Indulgent chocolate meets warm musk in this irresistible blend.',         sizes:_sz(ATTAR_ATTARS(), PERF_ATTARS()) },
    { id:'chocolate-vanilla',  name:'Chocolate Vanilla',   category:'Attars', notes:['Vanilla','Chocolate','Sweet'],description:'Smooth chocolate and creamy vanilla form a comforting gourmand blend.',  sizes:_sz(ATTAR_ATTARS(), PERF_ATTARS()) },
    { id:'chocolate-temptation',name:'Chocolate Temptation',category:'Attars',notes:['Chocolate','Sweet','Musk'],   description:'A deeply tempting blend of dark chocolate and musky sweetness.',          sizes:_sz(ATTAR_ATTARS(), PERF_ATTARS()) },

    /* ===================================================
       2. ARABIC  (9 products)
       Attar pricing: ₹199 / ₹399 / ₹799
       Perfume pricing: ₹499 / ₹999 / ₹1899
       =================================================== */
    { id:'oud-beauty',       name:'Oud Beauty',        category:'Arabic', notes:['Oud','Amber','Woody'],    description:'Precious oud wrapped in warm amber and sandalwood.',                      sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'amir-al-oud',      name:'Amir Al Oud',       category:'Arabic', notes:['Oud','Amber','Royal'],    description:'The prince of oud — a majestic Arabian oud composition.',                 sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'back-to-black-oud',name:'Back to Black Oud', category:'Arabic', notes:['Oud','Dark','Smoky'],     description:'Deep and smoky oud with an intense, captivating presence.',               sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'highness',         name:'Highness',          category:'Arabic', notes:['Oud','Rose','Floral'],    description:'Regal and floral — a royal oud composition fit for royalty.',             sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'don-black',        name:'Don Black',         category:'Arabic', notes:['Oud','Spicy','Woody'],    description:'Bold and commanding — dark oud with spicy accents.',                      sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'aseel',            name:'Aseel',             category:'Arabic', notes:['Amber','Musk','Oriental'],description:'A classic Arabian blend of amber and warm musk.',                         sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'royal-nights',     name:'Royal Nights',      category:'Arabic', notes:['Oud','Amber','Rich'],     description:'A rich and opulent Arabian night fragrance.',                             sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'arabian-pure',     name:'Arabian Pure',      category:'Arabic', notes:['Oud','Clean','Musk'],     description:'Pure Arabian essence — clean, refined and authentic.',                   sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },
    { id:'marrah',           name:'Marrah',            category:'Arabic', notes:['Floral','Amber','Musk'],  description:'Warm florals over a bed of amber and musk.',                              sizes:_sz(ATTAR_ARABIC(), PERF_ARABIC()) },

    /* ===================================================
       3. FRENCH & ARABIC MIX  (17 products)
       Attar pricing: ₹149 / ₹299 / ₹599
       Perfume pricing: ₹499 / ₹999 / ₹1599
       =================================================== */
    { id:'black-opium',     name:'Black Opium',     category:'French & Arabic Mix', notes:['Coffee','Vanilla','Sweet'],  description:'Bold coffee and vanilla with dark florals.',                            sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'armani-si',       name:'Armani Si',       category:'French & Arabic Mix', notes:['Floral','Chypre','Fruity'],  description:'Blackcurrant and rose on a warm patchouli base.',                       sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'white-oud',       name:'White Oud',       category:'French & Arabic Mix', notes:['Oud','Clean','Floral'],      description:'Light and clean oud with a fresh floral character.',                    sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'khamra',          name:'Khamra',          category:'French & Arabic Mix', notes:['Oriental','Warm','Sweet'],   description:'Warm and intoxicating oriental blend.',                                 sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'br-540',          name:'BR 540',          category:'French & Arabic Mix', notes:['Amber','Floral','Woody'],    description:'The iconic saffron-amber woody composition.',                           sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'poison',          name:'Poison',          category:'French & Arabic Mix', notes:['Oriental','Floral','Spicy'], description:'Spellbinding oriental florals with a dark mystery.',                    sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'tobacco-vanilla', name:'Tobacco Vanilla', category:'French & Arabic Mix', notes:['Tobacco','Vanilla','Amber'], description:'Rich tobacco leaf meets sweet vanilla in a warm embrace.',               sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'tobacco-oud',     name:'Tobacco Oud',     category:'French & Arabic Mix', notes:['Tobacco','Oud','Woody'],     description:'Bold tobacco intertwined with precious Arabian oud.',                   sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'intoxicated',     name:'Intoxicated',     category:'French & Arabic Mix', notes:['Coffee','Cardamom','Sweet'], description:'An intoxicating blend of coffee, cardamom and spice.',                  sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'blue-dc',         name:'Blue D C',        category:'French & Arabic Mix', notes:['Fresh','Aquatic','Citrus'],  description:'Fresh aquatic citrus — the signature sporty blue accord.',              sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'vph',             name:'VPH',             category:'French & Arabic Mix', notes:['Woody','Aromatic','Fresh'],  description:'Aromatic woody freshness with a masculine depth.',                      sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'lacoste-1212',    name:'Lacoste 1212',    category:'French & Arabic Mix', notes:['Fresh','Citrus','Clean'],    description:'Clean and vibrant citrus freshness.',                                   sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'tam-dao',         name:'Tam Dao',         category:'French & Arabic Mix', notes:['Sandalwood','Cedar','Woody'],description:'Serene sandalwood and cedar in a temple-like composition.',              sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'icon',            name:'Icon',            category:'French & Arabic Mix', notes:['Spicy','Woody','Amber'],     description:'Iconic spicy woody accord with an amber drydown.',                      sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'mb-legend',       name:'MB Legend',       category:'French & Arabic Mix', notes:['Fougere','Woody','Fresh'],   description:'A reliable and elegant fougère with fresh bergamot.',                   sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'l-homme',         name:'L-Homme',         category:'French & Arabic Mix', notes:['Citrus','Woody','Spicy'],    description:'Crisp citrus and spice over a warm woody base.',                        sizes:_sz(ATTAR_FA(), PERF_FA()) },
    { id:'paradox',         name:'Paradox',         category:'French & Arabic Mix', notes:['Floral','Citrus','Musk'],    description:'Neroli, white musk and cedarwood — the scent of contradiction.',         sizes:_sz(ATTAR_FA(), PERF_FA()) },

    /* ===================================================
       4. FLORAL  (7 products)
       Attar pricing: ₹199 / ₹399 / ₹799
       Perfume pricing: ₹499 / ₹899 / ₹1599
       =================================================== */
    { id:'musk-rose',    name:'Musk Rose',    category:'Floral', notes:['Rose','Musk','Floral'],    description:'Delicate rose petals over a soft musky base.',                    sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'pure-rose',    name:'Pure Rose',    category:'Floral', notes:['Rose','Floral','Fresh'],   description:'The pure, undiluted essence of a fresh-bloomed rose.',            sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'lily-jasmine', name:'Lily Jasmine', category:'Floral', notes:['Lily','Jasmine','Floral'], description:'A feminine blend of lily and jasmine blossoms.',                  sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'lavender',     name:'Lavender',     category:'Floral', notes:['Lavender','Herbal','Calm'],description:'Calming and aromatic pure lavender.',                            sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'gucci-flora',  name:'Gucci Flora',  category:'Floral', notes:['Floral','Citrus','Musk'],  description:'Citrus blossoms, peony and rose on a sandalwood base.',           sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'blue-lady',    name:'Blue Lady',    category:'Floral', notes:['Floral','Fresh','Aquatic'], description:'Fresh and feminine — florals with a breezy aquatic edge.',       sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },
    { id:'y-by-ysl',     name:'Y by YSL',     category:'Floral', notes:['Fruity','Floral','Woody'],  description:'Apple, ginger and sage over a warm amber base.',                  sizes:_sz(ATTAR_FLORAL(), PERF_FLORAL()) },

    /* ===================================================
       5. FRENCH  (12 products)
       Attar pricing: ₹149 / ₹299 / ₹599
       Perfume pricing: ₹499 / ₹999 / ₹1599
       =================================================== */
    { id:'polo',         name:'Polo',         category:'French', notes:['Green','Herbal','Woody'],   description:'Crisp herbal greens and rich woods — a timeless classic.',          sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'aqua-gio',     name:'Aqua Gio',     category:'French', notes:['Aquatic','Citrus','Fresh'],  description:'The definitive aquatic — bergamot and sea spray over musk.',        sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'cr-7',         name:'CR-7',         category:'French', notes:['Fresh','Spicy','Woody'],    description:'Energetic and bold — fresh citrus with spicy heart notes.',         sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'m-rehab',      name:'M-Rehab',      category:'French', notes:['Oriental','Sweet','Warm'],  description:'Warm and sweet oriental blend with a comforting drydown.',          sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'fruity-musk',  name:'Fruity Musk',  category:'French', notes:['Fruity','Musk','Sweet'],    description:'Bright fruit notes layered over a clean soft musk.',                sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'hawas',        name:'Hawas',        category:'French', notes:['Aquatic','Spicy','Fresh'],  description:'Mint, cardamom and sea notes over vetiver and sandalwood.',         sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'lucky',        name:'Lucky',        category:'French', notes:['Fresh','Citrus','Floral'],  description:'A light and fresh lucky charm with uplifting citrus florals.',      sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'stronger',     name:'Stronger',     category:'French', notes:['Spicy','Amber','Woody'],    description:'Chestnut, cardamom and vanilla — warmth and strength combined.',    sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'aventus',      name:'Aventus',      category:'French', notes:['Fruity','Smoky','Woody'],   description:'Pineapple, birch and oakmoss — the scent of success.',              sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'sauvage',      name:'Sauvage',      category:'French', notes:['Fresh','Spicy','Woody'],    description:'Bold raw freshness — bergamot and ambroxan over mineral woods.',    sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'eros-versace', name:'Eros Versace', category:'French', notes:['Minty','Vanilla','Woody'],  description:'Mint, green apple and vanilla on tonka and vetiver.',               sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) },
    { id:'most-wanted',  name:'Most Wanted',  category:'French', notes:['Spicy','Amber','Woody'],    description:'Cardamom, juniper berry and coumarin — the fragrance of audacity.', sizes:_sz(ATTAR_FRENCH(), PERF_FRENCH()) }
]);
