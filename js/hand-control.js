/**
 * Arabian Perfume Lab — Hand Control Module
 *
 * Provides optional hand-gesture navigation using MediaPipe Tasks Vision
 * Hand Landmarker (loaded from jsDelivr CDN, blocked until user opt-in).
 *
 * Privacy:
 *   - Camera never starts on page load.
 *   - Camera starts ONLY after explicit user click + permission grant.
 *   - Stream is fully released (all tracks stopped) when disabled.
 *   - No frames are sent to any server; all processing is local/WASM.
 *
 * Gestures:
 *   SWIPE LEFT  → next product card
 *   SWIPE RIGHT → previous product card
 *   OPEN PALM   → neutral (no action)
 *   PINCH       → open highlighted product modal
 *   FIST        → close open modal
 *   POINT DOWN  → scroll down
 *   POINT UP    → scroll up
 *
 * Integration:
 *   Reuses openProductModal() / closeProductModal() from app.js.
 *   Reuses CATALOGUE state from app.js for card navigation.
 *   Does NOT duplicate product/catalog logic.
 *
 * Load order: must load AFTER app.js (depends on openProductModal etc.)
 */

(function () {
    'use strict';

    /* -----------------------------------------------------------------------
       CONSTANTS & CONFIG
    ----------------------------------------------------------------------- */
    const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/hand_landmarker.task';

    const CFG = {
        // Landmark detection
        numHands:           1,
        minDetectConf:      0.6,
        minTrackConf:       0.5,
        minPresenceConf:    0.5,

        // Gesture debounce: a gesture must hold for this many ms before firing
        holdMs:             380,

        // Cooldown after a gesture fires before the same gesture can fire again
        cooldownMs:         900,

        // Swipe detection: min horizontal displacement (normalised 0–1)
        swipeMinDx:         0.18,
        // Max frames to complete a swipe
        swipeMaxFrames:     22,

        // Scroll amount per point-up/down trigger (px)
        scrollStep:         260,

        // Camera constraints
        cameraConstraints: {
            video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' }
        }
    };

    /* -----------------------------------------------------------------------
       STATE
    ----------------------------------------------------------------------- */
    let _active       = false;   // hand control on/off
    let _landmarker   = null;    // MediaPipe HandLandmarker instance
    let _stream       = null;    // MediaStream
    let _rafId        = null;    // requestAnimationFrame ID
    let _lastVideoTs  = -1;      // last video timestamp processed

    // Gesture hold tracking
    let _holdGesture  = null;    // name of gesture currently being held
    let _holdStart    = 0;       // timestamp when hold started

    // Per-gesture cooldown timestamps
    const _lastFired  = {};

    // Swipe tracking
    let _swipeStartX  = null;
    let _swipeFrames  = 0;

    // Currently "highlighted" product index (for pinch-to-open)
    let _highlightIdx = 0;

    /* -----------------------------------------------------------------------
       DOM REFERENCES  (resolved once on init)
    ----------------------------------------------------------------------- */
    let _btn, _statusEl, _statusLabel, _offBtn, _hintEl, _cursorEl;
    let _video, _canvas, _ctx;

    /* -----------------------------------------------------------------------
       ENTRY POINT — called by app.js after DOMContentLoaded
    ----------------------------------------------------------------------- */
    function initHandControl() {
        _btn         = document.getElementById('hand-ctrl-btn');
        _statusEl    = document.getElementById('hc-status');
        _statusLabel = document.getElementById('hc-status-label');
        _offBtn      = document.getElementById('hc-off-btn');
        _hintEl      = document.getElementById('hc-hint');
        _cursorEl    = document.getElementById('hc-cursor');
        _video       = document.getElementById('hc-video');
        _canvas      = document.getElementById('hc-canvas');

        if (!_btn || !_video || !_canvas) return; // elements missing

        // Check bare minimum: getUserMedia supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            _btn.style.display = 'none'; // hide gracefully on unsupported browsers
            return;
        }

        _ctx = _canvas.getContext('2d');

        _btn.addEventListener('click', _onToggle);
        if (_offBtn) _offBtn.addEventListener('click', _disable);

        // Keyboard shortcut: H key toggles when not typing
        document.addEventListener('keydown', (e) => {
            if (e.key === 'h' || e.key === 'H') {
                const tag = document.activeElement && document.activeElement.tagName;
                if (tag === 'INPUT' || tag === 'TEXTAREA') return;
                _onToggle();
            }
        });

        // Release camera on page unload
        window.addEventListener('pagehide', _disable);
        window.addEventListener('beforeunload', _disable);
    }

    /* -----------------------------------------------------------------------
       TOGGLE
    ----------------------------------------------------------------------- */
    function _onToggle() {
        if (_active) _disable();
        else         _enable();
    }

    async function _enable() {
        if (_active) return;

        _setButtonState('loading');

        // 1. Request camera permission
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia(CFG.cameraConstraints);
        } catch (err) {
            // Permission denied or no camera — fail gracefully
            _setButtonState('off');
            _showHint('Camera access denied — hand control unavailable.', 3000);
            return;
        }

        // 2. Load MediaPipe (lazy — only when user opts in)
        if (!_landmarker) {
            try {
                await _loadMediaPipe();
            } catch (err) {
                console.warn('[HandControl] MediaPipe load failed:', err);
                _releaseStream(stream);
                _setButtonState('off');
                _showHint('Hand tracking unavailable. Please try again.', 3000);
                return;
            }
        }

        // 3. Wire video
        _stream = stream;
        _video.srcObject = stream;
        await new Promise((resolve) => {
            _video.onloadedmetadata = () => { _video.play().then(resolve).catch(resolve); };
        });

        _canvas.width  = _video.videoWidth  || 320;
        _canvas.height = _video.videoHeight || 240;

        // 4. Activate
        _active = true;
        _lastVideoTs = -1;
        _holdGesture = null;
        _holdStart   = 0;
        _swipeStartX = null;
        _swipeFrames = 0;

        _setButtonState('on');
        if (_statusEl)  _statusEl.removeAttribute('hidden');
        if (_cursorEl)  _cursorEl.removeAttribute('hidden');

        _showHint('Hand Control active · Swipe, Pinch, Fist, Point', 2800);
        _rafId = requestAnimationFrame(_detectLoop);
    }

    function _disable() {
        if (!_active && !_stream) return;
        _active = false;

        // Stop RAF
        if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }

        // Release camera
        _releaseStream(_stream);
        _stream = null;
        _video.srcObject = null;

        // Hide UI
        if (_statusEl)  _statusEl.setAttribute('hidden', '');
        if (_cursorEl)  { _cursorEl.setAttribute('hidden', ''); _cursorEl.style.transform = ''; }
        if (_hintEl)    _hintEl.setAttribute('hidden', '');

        _setButtonState('off');
        _holdGesture = null;
    }

    function _releaseStream(stream) {
        if (stream) stream.getTracks().forEach(t => t.stop());
    }

    /* -----------------------------------------------------------------------
       MEDIAPIPE LAZY LOAD
    ----------------------------------------------------------------------- */
    async function _loadMediaPipe() {
        // vision_bundle.js exposes window.vision or window.VisionTasks
        // Tasks Vision API: HandLandmarker
        const vision = window.vision || window.VisionTasks;
        if (!vision || !vision.HandLandmarker) {
            throw new Error('MediaPipe Tasks Vision not available.');
        }

        const filesetResolver = await vision.FilesetResolver.forVisionTasks(WASM_BASE);
        _landmarker = await vision.HandLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
                modelAssetPath: MODEL_URL,
                delegate: 'GPU'
            },
            runningMode:         'VIDEO',
            numHands:            CFG.numHands,
            minHandDetectionConfidence:  CFG.minDetectConf,
            minHandPresenceConfidence:   CFG.minPresenceConf,
            minTrackingConfidence:       CFG.minTrackConf
        });
    }

    /* -----------------------------------------------------------------------
       DETECTION LOOP
    ----------------------------------------------------------------------- */
    function _detectLoop(timestamp) {
        if (!_active) return;

        _rafId = requestAnimationFrame(_detectLoop);

        if (_video.readyState < 2) return; // video not ready
        if (timestamp === _lastVideoTs)    return; // same frame
        _lastVideoTs = timestamp;

        // Draw video frame to canvas (needed for some MediaPipe paths)
        _ctx.drawImage(_video, 0, 0, _canvas.width, _canvas.height);

        let result;
        try {
            result = _landmarker.detectForVideo(_video, timestamp);
        } catch (e) {
            return; // transient error — skip frame
        }

        if (!result || !result.landmarks || result.landmarks.length === 0) {
            // No hand visible
            if (_cursorEl) _cursorEl.setAttribute('hidden', '');
            _holdGesture = null;
            _swipeStartX = null;
            _swipeFrames = 0;
            return;
        }

        const lm = result.landmarks[0]; // first hand landmarks (21 points)
        _updateCursor(lm);
        _processGesture(lm, timestamp);
    }

    /* -----------------------------------------------------------------------
       CURSOR
    ----------------------------------------------------------------------- */
    function _updateCursor(lm) {
        if (!_cursorEl) return;
        // Index finger tip = landmark 8
        const tip = lm[8];
        // Landmarks are normalised 0–1 (x mirrored for selfie view)
        const x = (1 - tip.x) * window.innerWidth;
        const y = tip.y * window.innerHeight;
        _cursorEl.removeAttribute('hidden');
        _cursorEl.style.transform = `translate(${x}px, ${y}px)`;
    }

    /* -----------------------------------------------------------------------
       GESTURE CLASSIFICATION
    ----------------------------------------------------------------------- */
    /**
     * Classify the current hand pose from 21 landmarks.
     * Returns one of: 'open_palm' | 'fist' | 'pinch' | 'point_up' |
     *                 'point_down' | 'neutral'
     */
    function _classify(lm) {
        // Landmark indices (MediaPipe Hand):
        //  0=wrist  4=thumb_tip  8=index_tip  12=middle_tip  16=ring_tip  20=pinky_tip
        //  3=thumb_ip  6=index_pip  10=middle_pip  14=ring_pip  18=pinky_pip
        //  5=index_mcp  9=middle_mcp

        const wrist      = lm[0];
        const thumbTip   = lm[4];
        const indexTip   = lm[8];
        const middleTip  = lm[12];
        const ringTip    = lm[16];
        const pinkyTip   = lm[20];

        const indexPip   = lm[6];
        const middlePip  = lm[10];
        const ringPip    = lm[14];
        const pinkyPip   = lm[18];
        const indexMcp   = lm[5];

        // Helper: is fingertip extended (tip higher = smaller y than its PIP)?
        // In MediaPipe normalised coords, y=0 is top, y=1 is bottom.
        const ext = (tip, pip) => tip.y < pip.y - 0.03;
        const curl = (tip, pip) => tip.y > pip.y + 0.02;

        const indexExt  = ext(indexTip,  indexPip);
        const middleExt = ext(middleTip, middlePip);
        const ringExt   = ext(ringTip,   ringPip);
        const pinkyExt  = ext(pinkyTip,  pinkyPip);

        const indexCurl  = curl(indexTip,  indexPip);
        const middleCurl = curl(middleTip, middlePip);
        const ringCurl   = curl(ringTip,   ringPip);
        const pinkyCurl  = curl(pinkyTip,  pinkyPip);

        // PINCH: thumb tip close to index tip
        const pinchDist = _dist(thumbTip, indexTip);
        if (pinchDist < 0.07) return 'pinch';

        // FIST: all four fingers curled
        if (indexCurl && middleCurl && ringCurl && pinkyCurl) return 'fist';

        // OPEN PALM: all four fingers extended
        if (indexExt && middleExt && ringExt && pinkyExt) return 'open_palm';

        // POINT UP: only index extended upward, others curled
        // index tip significantly above wrist (smaller y), rest curled
        if (indexExt && middleCurl && ringCurl && pinkyCurl) {
            if (indexTip.y < wrist.y - 0.12) return 'point_up';
        }

        // POINT DOWN: only index extended downward (tip below MCP), others curled
        // Hand oriented downward: tip.y > mcp.y (larger y = lower on screen)
        if (!indexExt && middleCurl && ringCurl && pinkyCurl) {
            if (indexTip.y > indexMcp.y + 0.06) return 'point_down';
        }

        return 'neutral';
    }

    function _dist(a, b) {
        const dx = a.x - b.x, dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /* -----------------------------------------------------------------------
       GESTURE PROCESSING
    ----------------------------------------------------------------------- */
    function _processGesture(lm, now) {
        const gesture = _classify(lm);

        // --- Swipe detection (horizontal wrist/palm movement) ---
        const palmX = lm[0].x; // wrist x (normalised, 0=left 1=right in raw cam)

        if (_swipeStartX === null) {
            _swipeStartX  = palmX;
            _swipeFrames  = 0;
        } else {
            _swipeFrames++;
            const dx = palmX - _swipeStartX; // positive = moved right in raw cam

            if (_swipeFrames > CFG.swipeMaxFrames) {
                // Reset — took too long
                _swipeStartX = palmX;
                _swipeFrames = 0;
            } else if (Math.abs(dx) >= CFG.swipeMinDx) {
                // Camera is mirrored: moving hand right = dx positive = "swipe left" visually
                const dir = dx > 0 ? 'swipe_left' : 'swipe_right';
                _swipeStartX = palmX;
                _swipeFrames = 0;
                _triggerIfReady(dir, now, () => _onSwipe(dir));
                return;
            }
        }

        // --- Hold-based gestures ---
        if (gesture === _holdGesture) {
            if (now - _holdStart >= CFG.holdMs) {
                _triggerIfReady(gesture, now, () => _onGesture(gesture));
                _holdGesture = null; // reset after firing
            }
        } else {
            _holdGesture = gesture;
            _holdStart   = now;
        }
    }

    /** Only fire if enough cooldown has passed since last fire of this gesture */
    function _triggerIfReady(name, now, fn) {
        const last = _lastFired[name] || 0;
        if (now - last < CFG.cooldownMs) return;
        _lastFired[name] = now;
        fn();
    }

    /* -----------------------------------------------------------------------
       GESTURE ACTIONS — delegate entirely to existing app.js functions
    ----------------------------------------------------------------------- */
    function _onSwipe(dir) {
        if (dir === 'swipe_left')  _nextProduct();
        if (dir === 'swipe_right') _prevProduct();
    }

    function _onGesture(gesture) {
        switch (gesture) {
            case 'pinch':      _selectProduct();  break;
            case 'fist':       _closeModal();      break;
            case 'point_up':   _scrollUp();        break;
            case 'point_down': _scrollDown();      break;
            // open_palm / neutral — no action
        }
    }

    /* -----------------------------------------------------------------------
       PRODUCT NAVIGATION  (uses existing CATALOGUE + openProductModal)
    ----------------------------------------------------------------------- */
    function _getVisibleCards() {
        return Array.from(document.querySelectorAll('#product-grid .product-card'));
    }

    function _nextProduct() {
        const cards = _getVisibleCards();
        if (!cards.length) return;
        _highlightIdx = (_highlightIdx + 1) % cards.length;
        _highlightCard(cards, _highlightIdx);
        _showHint('→ Next product', 900);
    }

    function _prevProduct() {
        const cards = _getVisibleCards();
        if (!cards.length) return;
        _highlightIdx = (_highlightIdx - 1 + cards.length) % cards.length;
        _highlightCard(cards, _highlightIdx);
        _showHint('← Previous product', 900);
    }

    function _highlightCard(cards, idx) {
        cards.forEach((c, i) => c.classList.toggle('hc-highlighted', i === idx));
        // Scroll highlighted card into view gently
        cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function _selectProduct() {
        // If modal already open — ignore (prevent accidental re-fire)
        const modal = document.getElementById('product-modal');
        if (modal && modal.classList.contains('open')) return;

        const cards = _getVisibleCards();
        if (!cards.length) return;

        const idx  = Math.max(0, Math.min(_highlightIdx, cards.length - 1));
        const card = cards[idx];
        const id   = card.getAttribute('data-id');
        if (id && typeof openProductModal === 'function') {
            openProductModal(id);
            _showHint('✦ Product opened', 1200);
        }
    }

    function _closeModal() {
        const modal = document.getElementById('product-modal');
        if (modal && modal.classList.contains('open')) {
            if (typeof closeProductModal === 'function') closeProductModal();
            _showHint('Modal closed', 900);
        }
    }

    function _scrollDown() {
        window.scrollBy({ top: CFG.scrollStep, behavior: 'smooth' });
        _showHint('↓ Scroll down', 700);
    }

    function _scrollUp() {
        window.scrollBy({ top: -CFG.scrollStep, behavior: 'smooth' });
        _showHint('↑ Scroll up', 700);
    }

    /* -----------------------------------------------------------------------
       UI HELPERS
    ----------------------------------------------------------------------- */
    function _setButtonState(state) {
        if (!_btn) return;
        if (state === 'on') {
            _btn.setAttribute('aria-pressed', 'true');
            _btn.classList.add('hc-active');
            _btn.classList.remove('hc-loading');
            _btn.setAttribute('aria-label', 'Disable hand gesture control');
        } else if (state === 'loading') {
            _btn.classList.add('hc-loading');
            _btn.setAttribute('aria-label', 'Loading hand tracking…');
        } else {
            _btn.setAttribute('aria-pressed', 'false');
            _btn.classList.remove('hc-active', 'hc-loading');
            _btn.setAttribute('aria-label', 'Enable hand gesture control');
        }
    }

    let _hintTimer = null;
    function _showHint(text, duration) {
        if (!_hintEl) return;
        _hintEl.textContent = text;
        _hintEl.removeAttribute('hidden');
        _hintEl.classList.add('hc-hint-visible');
        if (_hintTimer) clearTimeout(_hintTimer);
        _hintTimer = setTimeout(() => {
            _hintEl.classList.remove('hc-hint-visible');
            setTimeout(() => _hintEl.setAttribute('hidden', ''), 400);
        }, duration);
    }

    /* -----------------------------------------------------------------------
       SELF-INIT
       Script loads after app.js at bottom of <body>, so DOM is already ready.
       DOMContentLoaded has already fired — call directly.
    ----------------------------------------------------------------------- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHandControl);
    } else {
        initHandControl();
    }

})();
