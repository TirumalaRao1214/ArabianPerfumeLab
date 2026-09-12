/**
 * Arabian Perfume Lab - Interactive Luxury Experience
 * Features:
 * - Subtle Canvas Smoke / Particle Ambience simulation
 * - Custom Cursor & Magnetic Hover physics
 * - Fragrance filtering & Modal Scent Pyramid viewer
 * - Interactive Bespoke Scent Finder Quiz
 * - Shopping Bag drawer state management
 * - Web Audio API gentle ambient atmospheric chords
 * - Smooth scroll reveal animations
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    initCustomCursor();
    initHeroSmoke();
    initStickyHeader();
    initScrollAnimations();
    initFragranceDataAndModals();
    initCartDrawer();
    initScentQuiz();
    initMobileNav();
    initAmbientAudio();
});

/* ==========================================================================
   1. CUSTOM CURSOR
   ========================================================================== */
function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function renderFollower() {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
        requestAnimationFrame(renderFollower);
    }
    renderFollower();

    const interactiveEls = document.querySelectorAll('a, button, input, .product-card, .ingredient-card, .collection-card');
    interactiveEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
            follower.style.width = '54px';
            follower.style.height = '54px';
            follower.style.borderColor = 'rgba(212, 175, 55, 0.8)';
            follower.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
        });
        el.addEventListener('mouseleave', () => {
            follower.style.width = '32px';
            follower.style.height = '32px';
            follower.style.borderColor = 'rgba(212, 175, 55, 0.25)';
            follower.style.backgroundColor = 'transparent';
        });
    });
}

/* ==========================================================================
   2. HERO SMOKE & GOLD PARTICLE AMBIENCE CANVAS
   ========================================================================== */
function initHeroSmoke() {
    const canvas = document.getElementById('heroSmokeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = canvas.parentElement.offsetWidth;
    let height = canvas.height = canvas.parentElement.offsetHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
    });

    const particles = [];
    const particleCount = 40;

    // Soft swirling warm smoke
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 50;
            this.radius = Math.random() * 90 + 45;
            this.vx = (Math.random() - 0.5) * 0.45;
            this.vy = -(Math.random() * 0.5 + 0.35);
            this.alpha = Math.random() * 0.05 + 0.015;
            // Warm tones: Gold, Amber, and soft Crimson velvet
            const palette = ['212, 175, 55', '245, 158, 11', '225, 29, 72', '244, 63, 94'];
            this.color = palette[Math.floor(Math.random() * palette.length)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.y < height * 0.2) {
                this.alpha -= 0.0003;
            }

            if (this.y < -this.radius || this.alpha <= 0) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            grad.addColorStop(0, `rgba(${this.color}, ${this.alpha})`);
            grad.addColorStop(1, `rgba(${this.color}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Floating Rose Petal Ember Particles (Love & Romance Feel)
    class FloatingPetal {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 80;
            this.size = Math.random() * 7 + 4;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = -(Math.random() * 0.6 + 0.35);
            this.rotation = Math.random() * Math.PI * 2;
            this.vRot = (Math.random() - 0.5) * 0.02;
            this.alpha = Math.random() * 0.45 + 0.2;
            this.color = Math.random() > 0.4 ? 'rgba(244, 63, 94, ' : 'rgba(225, 29, 72, ';
        }

        update() {
            this.x += this.vx + Math.sin(this.y * 0.008) * 0.4;
            this.y += this.vy;
            this.rotation += this.vRot;

            if (this.y < -30) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = `${this.color}${this.alpha})`;
            ctx.beginPath();
            // Delicate organic petal contour
            ctx.ellipse(0, 0, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Gilded micro sparks / dust
    class GoldDust {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.6;
            this.speedY = -(Math.random() * 0.25 + 0.12);
            this.speedX = (Math.random() - 0.5) * 0.25;
            this.opacity = Math.random() * 0.7 + 0.25;
            this.color = Math.random() > 0.3 ? '212, 175, 55' : '254, 205, 211';
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            if (this.y < 0) this.reset();
        }
        draw() {
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        const p = new Particle();
        p.y = Math.random() * height;
        particles.push(p);
    }

    const petals = [];
    for (let i = 0; i < 22; i++) {
        const petal = new FloatingPetal();
        petal.y = Math.random() * height;
        petals.push(petal);
    }

    const dusts = [];
    for (let i = 0; i < 40; i++) {
        dusts.push(new GoldDust());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        petals.forEach(pet => {
            pet.update();
            pet.draw();
        });
        dusts.forEach(d => {
            d.update();
            d.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================
   3. STICKY HEADER & SCROLL SPY
   ========================================== */
function initStickyHeader() {
    const header = document.getElementById('mainHeader');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* ==========================================
   4. SCROLL REVEAL ANIMATIONS
   ========================================== */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.reveal-on-scroll, .reveal-fade').forEach(el => {
        observer.observe(el);
    });
}

/* ==========================================
   5. FRAGRANCE DATA, FILTERING & MODAL
   ========================================== */
const FRAGRANCE_CATALOG = {
    'oud-royale': {
        name: 'OUD ROYALE',
        tagline: 'The Supreme Coronation of Agarwood',
        concentration: 'Extrait de Parfum (32% Oil)',
        volume: '100ml / 3.4 FL. OZ.',
        price: 2499,
        img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=85',
        story: 'Distilled using aged wild Cambodian agarwood matured for 18 years, enveloped in golden amber crystals and cold-pressed Kashmiri saffron. A scent created for leaders and kings.',
        topNotes: 'Kashmiri Saffron, Bergamot, Pink Peppercorn',
        heartNotes: 'Royal Taif Rose, Smoky Leather Accord, Smoked Cedar',
        baseNotes: '18-Year Cambodian Oud, Molten Amber, Civet Musk',
        sillage: 'Colossal (24h+ Presence)',
        season: 'Autumn / Winter / Evening Royalty'
    },
    'desert-rose': {
        name: 'DESERT ROSE',
        tagline: 'Velvet Petals in the Starlit Dunes',
        concentration: 'Extrait de Parfum (28% Oil)',
        volume: '100ml / 3.4 FL. OZ.',
        price: 2299,
        img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=85',
        story: 'A dawn celebration in the mountain roses of Taif. Crisp dew-drenched Damask petals grounded by smoldering frankincense and rich Bourbon vanilla absolute.',
        topNotes: 'Morning Dew, Taif Rose Petals, Mandarin Rind',
        heartNotes: 'Damask Rose Absolute, Frankincense tears, Cardamom',
        baseNotes: 'Smoky Assam Oud, Madagascar Vanilla, White Amber',
        sillage: 'Heavy & Intoxicating (18h+)',
        season: 'All Seasons / Nocturnal Elegance'
    },
    'amber-noir': {
        name: 'AMBER NOIR',
        tagline: 'The Hypnotic Dark Resin',
        concentration: 'Extrait de Parfum (30% Oil)',
        volume: '100ml / 3.4 FL. OZ.',
        price: 2399,
        img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=85',
        story: 'Fossilized amber resin infused with sacred Mysore sandalwood and velvet silk musk. A nocturnal elixir that warms with the wearer’s body heat.',
        topNotes: 'Cardamom Pods, Nutmeg, Golden Incense',
        heartNotes: 'Fossilized Amber, Benzoin Tears, Cistus Labdanum',
        baseNotes: 'Mysore Sandalwood, Silk Musk, Dark Patchouli',
        sillage: 'Intimate to Enveloping (20h+)',
        season: 'Year-Round Signature / Formal Occasions'
    },
    'midnight-oud': {
        name: 'MIDNIGHT OUD',
        tagline: 'The Silence of the Arabian Desert',
        concentration: 'Extrait de Parfum (35% Oil)',
        volume: '100ml / 3.4 FL. OZ.',
        price: 2699,
        img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=85',
        story: 'The scent of midnight under a sky of infinite stars. Raw, untamed Hindi agarwood intertwines with Tuscan leather and smoldering dark resins.',
        topNotes: 'Black Pepper, Italian Bergamot, Thyme',
        heartNotes: 'Aged Leather, Cumin, Birch Tar, Iris Root',
        baseNotes: 'Wild Hindi Oud, Castoreum Accord, Ambergris',
        sillage: 'Nuclear / Unforgettable Sillage',
        season: 'Winter Nights / Black Tie Events'
    }
};

function initFragranceDataAndModals() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;

            cards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Quick View / Scent Pyramid Triggers
    const modal = document.getElementById('productModal');
    const modalContent = document.getElementById('modalContent');
    const modalClose = document.getElementById('modalClose');

    document.querySelectorAll('.quick-view-btn, .product-visual').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-bag')) return;
            const card = trigger.closest('.product-card');
            const prodId = card.dataset.id;
            openProductPyramidModal(prodId);
        });
    });

    function openProductPyramidModal(id) {
        const item = FRAGRANCE_CATALOG[id];
        if (!item) return;

        modalContent.innerHTML = `
            <div class="pyramid-modal-layout">
                <div>
                    <img src="${item.img}" alt="${item.name}" class="pyramid-img">
                </div>
                <div>
                    <span class="text-xs text-gold tracking-widest uppercase font-semibold">${item.concentration}</span>
                    <h3 class="font-heading text-2xl text-cream mt-1">${item.name}</h3>
                    <p class="font-serif italic text-gold text-sm mb-3">${item.tagline}</p>
                    <p class="text-xs text-cream/70 leading-relaxed mb-4">${item.story}</p>
                    
                    <div class="pyramid-levels">
                        <div class="pyramid-level-box">
                            <span class="level-name">&#9650; Top Notes (First 30 Mins)</span>
                            <span class="level-notes">${item.topNotes}</span>
                        </div>
                        <div class="pyramid-level-box">
                            <span class="level-name">&#9654; Heart Notes (2 - 8 Hours)</span>
                            <span class="level-notes">${item.heartNotes}</span>
                        </div>
                        <div class="pyramid-level-box">
                            <span class="level-name">&#9660; Base Notes (8 - 24+ Hours)</span>
                            <span class="level-notes">${item.baseNotes}</span>
                        </div>
                    </div>

                    <div class="flex items-center justify-between mt-6 pt-4 border-t border-border-dark">
                        <div>
                            <span class="text-xl font-heading text-cream">₹${item.price.toLocaleString('en-IN')}</span>
                            <span class="text-xs text-cream/50 ml-1">INR</span>
                        </div>
                        <button class="btn btn-gold-sm add-modal-to-cart" data-id="${id}" data-name="${item.name}" data-price="${item.price}" data-img="${item.img}">
                            <span>Add To Vault</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');

        // Bind inner add-to-cart
        modalContent.querySelector('.add-modal-to-cart').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            addToCart({
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                img: btn.dataset.img
            });
            modal.classList.remove('active');
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
        }
    });
}

/* ==========================================
   6. SHOPPING BAG / CART STATE
   ========================================== */
let cart = [];

function initCartDrawer() {
    const cartBtn = document.getElementById('cartBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const shopNowBtn = document.getElementById('shopNowCartBtn');

    function openCart() {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('active');
    }

    function closeCart() {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('active');
    }

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (shopNowBtn) shopNowBtn.addEventListener('click', closeCart);

    // Bind Add to bag buttons across the site
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-bag');
        if (btn) {
            const item = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                img: btn.dataset.img
            };
            addToCart(item);
        }
    });

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            
            const itemsListText = cart.map(item => `• ${item.name} (₹${item.price.toLocaleString('en-IN')}) x ${item.qty}`).join('%0A');
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            const waText = `Hello Arabian Perfume Lab,%0A%0AI would like to order the following bespoke fragrances:%0A${itemsListText}%0A%0ATotal Value: ₹${subtotal.toLocaleString('en-IN')}%0A%0APlease assist with shipping to my address.`;
            
            window.open(`https://wa.me/919030547400?text=${waText}`, '_blank');
            showToast("Connecting you with our WhatsApp Concierge in Guntur...");
            cart = [];
            updateCartUI();
            closeCart();
        });
    }
}

function addToCart(item) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
    showToast(`Added ${item.name} to your olfactory vault.`);
    
    // Open drawer
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartDrawer && cartOverlay) {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('active');
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartDrawerCount = document.getElementById('cartDrawerCount');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartSubtotalAmount = document.getElementById('cartSubtotalAmount');

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (cartCount) cartCount.textContent = totalQty;
    if (cartDrawerCount) cartDrawerCount.textContent = totalQty;
    if (cartSubtotalAmount) cartSubtotalAmount.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

    if (!cartItemsList) return;

    if (cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="empty-cart-state">
                <i data-lucide="flask-conical" class="empty-icon"></i>
                <p>Your vault is currently empty.</p>
                <a href="#fragrances" class="btn btn-outline-gold-sm" onclick="document.getElementById('cartClose').click();">Explore Signature Fragrances</a>
            </div>
        `;
    } else {
        cartItemsList.innerHTML = cart.map(item => `
            <div class="cart-item-row">
                <img src="${item.img}" alt="${item.name}" class="cart-item-thumb">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')} &times; ${item.qty}</div>
                    <button class="cart-remove-btn" onclick="removeFromCart('${item.id}')">Remove from Vault</button>
                </div>
            </div>
        `).join('');
    }

    if (window.lucide) lucide.createIcons();
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast || !toastMessage) return;

    toastMessage.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3500);
}

/* ==========================================
   7. BESPOKE SCENT FINDER QUIZ (Full 5-step)
   ========================================== */
function initScentQuiz() {
    /* --- Quiz questions with weighted note scoring --- */
    const QUIZ_Q = [
        {
            q: 'What atmosphere inspires you most?',
            opts: [
                { label: 'Midnight in a spice bazaar with velvet smoke',     scores: { Oud: 3, Spicy: 2, Amber: 1 } },
                { label: 'Taif mountain morning with blooming dew roses',     scores: { Rose: 3, Floral: 2, Fresh: 1 } },
                { label: 'Warm desert bonfire beneath amber constellations',   scores: { Amber: 3, Woody: 2, Vanilla: 1 } },
                { label: 'Ocean at dawn — salty air and sea spray',           scores: { Aquatic: 3, Fresh: 2, Citrus: 1 } }
            ]
        },
        {
            q: 'Which word best describes your personal style?',
            opts: [
                { label: 'Bold & Intense — I make a statement',              scores: { Oud: 2, Spicy: 2, Leather: 2 } },
                { label: 'Fresh & Effortless — clean, modern, confident',    scores: { Fresh: 3, Citrus: 2, Aquatic: 1 } },
                { label: 'Romantic & Sensual — warm, floral, captivating',   scores: { Floral: 2, Rose: 2, Musk: 2 } },
                { label: 'Elegant & Timeless — classic, refined',            scores: { Woody: 2, Amber: 2, Vanilla: 1 } }
            ]
        },
        {
            q: 'When do you wear fragrance most?',
            opts: [
                { label: 'Evening events & special occasions',                scores: { Oud: 2, Amber: 2, Spicy: 2 } },
                { label: 'Every day — office, college, casual outings',      scores: { Fresh: 3, Citrus: 2, Musk: 1 } },
                { label: 'Date nights & romantic moments',                    scores: { Rose: 2, Floral: 2, Vanilla: 2 } },
                { label: 'Adventure, travel, outdoors',                       scores: { Aquatic: 2, Woody: 2, Citrus: 2 } }
            ]
        },
        {
            q: 'Which scent family feels most like home?',
            opts: [
                { label: 'Rich Orientals — oud, amber, incense, resins',     scores: { Oud: 3, Amber: 2, Spicy: 1 } },
                { label: 'Fresh & Aquatics — citrus, green, ozonic',         scores: { Fresh: 3, Citrus: 2, Aquatic: 2 } },
                { label: 'Florals — rose, jasmine, lily, soft musk',         scores: { Floral: 3, Rose: 2, Musk: 1 } },
                { label: 'Woody & Smoky — cedar, sandalwood, leather',       scores: { Woody: 3, Leather: 2, Tobacco: 1 } }
            ]
        },
        {
            q: 'Which fragrance experience do you prefer?',
            opts: [
                { label: 'Intense & long-lasting — lasts all day and night', scores: { Oud: 2, Amber: 2, Spicy: 1 } },
                { label: 'Light & refreshing — subtle, clean, effortless',   scores: { Fresh: 3, Citrus: 2, Aquatic: 1 } },
                { label: 'Warm & comforting — like a second skin',           scores: { Vanilla: 3, Musk: 2, Woody: 1 } },
                { label: 'Unique & complex — evolves on your skin',          scores: { Oud: 1, Leather: 2, Amber: 1 } }
            ]
        }
    ];

    const TOTAL = QUIZ_Q.length;
    let step    = 0;
    let scores  = {};
    let answers = [];

    /* --- Static product data for results (matches static HTML products) --- */
    const STATIC_PRODUCTS = [
        { id: 'oud-royale',   name: 'OUD ROYALE',   notes: ['Oud','Amber','Saffron'],         price: 2499 },
        { id: 'desert-rose',  name: 'DESERT ROSE',  notes: ['Rose','Oud','Floral'],            price: 2299 },
        { id: 'amber-noir',   name: 'AMBER NOIR',   notes: ['Amber','Musk','Woody'],           price: 2399 },
        { id: 'midnight-oud', name: 'MIDNIGHT OUD', notes: ['Oud','Spicy','Leather'],          price: 2699 },
        { id: 'golden-musk',  name: 'GOLDEN MUSK',  notes: ['Musk','Vanilla','Fresh'],         price: 2199 },
        { id: 'cedar-smoke',  name: 'CEDAR SMOKE',  notes: ['Woody','Smoky','Amber'],          price: 2299 },
        { id: 'saffron-noir', name: 'SAFFRON NOIR', notes: ['Saffron','Oud','Spicy'],          price: 2599 },
        { id: 'taif-blooms',  name: 'TAIF BLOOMS',  notes: ['Floral','Rose','Citrus'],         price: 2199 }
    ];

    function openModal() {
        const modal = document.getElementById('quiz-modal');
        if (!modal) return;
        step    = 0;
        scores  = {};
        answers = [];
        const stepsEl   = document.getElementById('quiz-steps-container');
        const resultsEl = document.getElementById('quiz-results-container');
        if (stepsEl)   { stepsEl.innerHTML   = ''; stepsEl.style.display   = ''; }
        if (resultsEl) { resultsEl.innerHTML = ''; resultsEl.style.display = 'none'; }
        updateProgress();
        renderStep();
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        const modal = document.getElementById('quiz-modal');
        if (!modal) return;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function updateProgress() {
        const bar  = document.getElementById('quiz-progress-bar');
        const txt  = document.getElementById('quiz-progress-text');
        const pct  = Math.round((step / TOTAL) * 100);
        if (bar) bar.style.width = pct + '%';
        if (txt) txt.textContent = step >= TOTAL ? 'Your Results' : 'Step ' + (step + 1) + ' of ' + TOTAL;
    }

    function renderStep() {
        updateProgress();
        const el = document.getElementById('quiz-steps-container');
        if (!el) return;
        el.innerHTML = '';
        if (step >= TOTAL) { showResults(); return; }

        const q = QUIZ_Q[step];
        const div = document.createElement('div');
        div.className = 'quiz-step';

        const qh = document.createElement('h3');
        qh.className = 'quiz-question';
        qh.textContent = (step + 1) + '. ' + q.q;
        div.appendChild(qh);

        const opts = document.createElement('div');
        opts.className = 'quiz-options';
        q.opts.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-opt-btn' + (answers[step] === idx ? ' selected' : '');
            btn.textContent = opt.label;
            btn.addEventListener('click', () => {
                // Replace previous answer
                if (answers[step] !== undefined) {
                    const prev = q.opts[answers[step]];
                    Object.entries(prev.scores).forEach(([n, v]) => { scores[n] = (scores[n] || 0) - v; });
                }
                answers[step] = idx;
                Object.entries(opt.scores).forEach(([n, v]) => { scores[n] = (scores[n] || 0) + v; });
                step++;
                renderStep();
            });
            opts.appendChild(btn);
        });
        div.appendChild(opts);

        if (step > 0) {
            const back = document.createElement('button');
            back.className = 'quiz-back-btn';
            back.textContent = '← Back';
            back.addEventListener('click', () => { step--; renderStep(); });
            div.appendChild(back);
        }

        el.appendChild(div);
        qh.setAttribute('tabindex', '-1');
        qh.focus();
    }

    function showResults() {
        updateProgress();
        const stepsEl   = document.getElementById('quiz-steps-container');
        const resultsEl = document.getElementById('quiz-results-container');
        if (stepsEl)  stepsEl.style.display  = 'none';
        if (!resultsEl) return;
        resultsEl.style.display = '';
        resultsEl.innerHTML = '';

        // Score static products
        const scored = STATIC_PRODUCTS.map(p => {
            let sc = 0;
            (p.notes || []).forEach(n => {
                if (scores[n]) sc += scores[n];
            });
            return { p, sc };
        }).sort((a, b) => b.sc - a.sc).slice(0, 3);

        const topNotes = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n);

        const heading = document.createElement('div');
        heading.className = 'quiz-result-heading';
        heading.innerHTML = '<h3 class="quiz-result-title">Your Olfactive Signature</h3>'
            + '<p class="quiz-result-profile">Your scent profile: ' + topNotes.join(' · ') + '</p>';
        resultsEl.appendChild(heading);

        const grid = document.createElement('div');
        grid.className = 'quiz-result-grid';
        scored.forEach(({ p }, i) => {
            const card = document.createElement('div');
            card.className = 'quiz-result-card';
            card.innerHTML =
                '<div class="quiz-rank-badge">' + (i === 0 ? '★ TOP MATCH' : '#' + (i + 1)) + '</div>' +
                '<div class="quiz-result-img-wrap">' +
                    '<img class="quiz-result-img" src="assets/images/' + p.id + '.svg" alt="' + p.name + '"' +
                    ' onerror="this.src=\'assets/images/products/bottle-amber.svg\'">' +
                '</div>' +
                '<div class="quiz-result-info">' +
                    '<p class="quiz-result-brand">ARABIAN PERFUME LAB</p>' +
                    '<h4 class="quiz-result-name">' + p.name + '</h4>' +
                    '<div class="quiz-result-notes">' +
                        (p.notes || []).map(n => '<span class="note-chip">' + n + '</span>').join('') +
                    '</div>' +
                    '<p class="quiz-result-price">From ₹' + p.price.toLocaleString('en-IN') + '</p>' +
                    '<div class="quiz-result-actions">' +
                        '<a href="#fragrances" class="btn btn-gold" style="font-size:0.72rem;padding:0.5rem;width:100%;justify-content:center;text-decoration:none;">View Collection</a>' +
                        '<a href="https://wa.me/919030547400?text=Hello%20Arabian%20Perfume%20Lab%2C%20I%20am%20interested%20in%20' + encodeURIComponent(p.name) + '" target="_blank" rel="noopener noreferrer" class="btn btn-outline-gold" style="font-size:0.72rem;padding:0.5rem;width:100%;justify-content:center;text-decoration:none;">Order on WhatsApp</a>' +
                    '</div>' +
                '</div>';
            grid.appendChild(card);
        });
        resultsEl.appendChild(grid);

        const retake = document.createElement('button');
        retake.className = 'quiz-retake-btn';
        retake.textContent = 'Retake Quiz';
        retake.addEventListener('click', () => {
            step = 0; scores = {}; answers = [];
            resultsEl.style.display = 'none';
            const se = document.getElementById('quiz-steps-container');
            if (se) { se.innerHTML = ''; se.style.display = ''; }
            renderStep();
        });
        resultsEl.appendChild(retake);

        const titleEl = resultsEl.querySelector('.quiz-result-title');
        if (titleEl) { titleEl.setAttribute('tabindex', '-1'); titleEl.focus(); }
    }

    // Expose
    window.openQuizModal = openModal;

    // Wire open buttons
    ['openQuizBtn', 'open-quiz-btn', 'scentFinderBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', openModal);
    });

    // Wire close button and backdrop
    const closeBtn = document.getElementById('quiz-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const modal = document.getElementById('quiz-modal');
    if (modal) {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    }
}

/* ==========================================
   8. MOBILE NAVIGATION DRAWER
   ========================================== */
function initMobileNav() {
    const trigger = document.getElementById('mobileMenuTrigger');
    const drawer = document.getElementById('mobileDrawer');
    const closeBtn = document.getElementById('drawerClose');
    const links = document.querySelectorAll('.drawer-link');

    if (trigger && drawer) {
        trigger.addEventListener('click', () => drawer.classList.add('open'));
    }
    if (closeBtn && drawer) {
        closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
    }
    links.forEach(l => {
        l.addEventListener('click', () => drawer.classList.remove('open'));
    });
}

/* ==========================================
   9. GENTLE AMBIENT LAB AUDIO (WEB AUDIO API)
   ========================================== */
function initAmbientAudio() {
    const soundToggle = document.getElementById('soundToggle');
    if (!soundToggle) return;

    let audioCtx = null;
    let isPlaying = false;
    let masterGain = null;

    soundToggle.addEventListener('click', () => {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();

            masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(0.04, audioCtx.currentTime); // very subtle
            masterGain.connect(audioCtx.destination);

            // Ambient drone chord (C minor golden overtone)
            const freqs = [130.81, 196.00, 261.63, 392.00]; // C3, G3, C4, G4
            freqs.forEach(f => {
                const osc = audioCtx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, audioCtx.currentTime);

                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(450, audioCtx.currentTime);

                osc.connect(filter);
                filter.connect(masterGain);
                osc.start();
            });
            isPlaying = true;
            soundToggle.innerHTML = `<i data-lucide="volume-2" class="w-3 h-3"></i><span class="text-[10px] tracking-wider uppercase ml-1">Sound: On</span>`;
            if (window.lucide) lucide.createIcons();
            showToast("Atmospheric soundscape activated.");
        } else {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
                isPlaying = true;
                soundToggle.innerHTML = `<i data-lucide="volume-2" class="w-3 h-3"></i><span class="text-[10px] tracking-wider uppercase ml-1">Sound: On</span>`;
            } else if (audioCtx.state === 'running') {
                audioCtx.suspend();
                isPlaying = false;
                soundToggle.innerHTML = `<i data-lucide="volume-x" class="w-3 h-3"></i><span class="text-[10px] tracking-wider uppercase ml-1">Sound: Off</span>`;
            }
            if (window.lucide) lucide.createIcons();
        }
    });
}

/* ==========================================
   10. NEWSLETTER SUBMISSION HANDLER
   ========================================== */
window.handleNewsletter = function(form) {
    const feedback = document.getElementById('newsletterSuccess');
    const input = form.querySelector('input');
    if (feedback && input) {
        feedback.classList.remove('hidden');
        input.value = '';
        if (window.lucide) lucide.createIcons();
        showToast("Welcome to Arabian Perfume Lab Private Circle.");
    }
};
