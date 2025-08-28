/**
 * @file TouchControls.js
 * @description An engine-agnostic, direct-touch virtual mouse for web games.
 * This script provides an intuitive touch interface for games that primarily
 * use mouse input, creating a seamless experience on mobile and touch devices.
 *
 * --- HOW IT WORKS ---
 * 1. Direct Hovering: The script maps touch movement directly to cursor
 *    movement. The game's cursor is always positioned exactly under the
 *    user's finger, providing precise, 1:1 control.
 *
 * 2. Dedicated Click Buttons: To prevent accidental actions (e.g., shooting
 *    while trying to aim), clicking is handled by two dedicated on-screen
 *    buttons for left and right mouse clicks.
 *
 * 3. Responsive Layout: The buttons automatically resize and reposition to
 *    provide a comfortable experience in both portrait and landscape modes.
 *
 * 4. First-Time User Tutorial: A welcoming overlay greets new players,
 *    explains the simple control scheme, and is then permanently dismissed.
 */

(function() {
    'use strict';

    //================================================================================
    // SECTION 1: INITIAL CHECK & CONFIGURATION
    //================================================================================

    // The script will only execute on devices that support touch events.
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouchDevice) {
        return;
    }

    /**
     * Top-level configuration object. Modify these values to easily
     * fine-tune the control layout and feel for your specific game.
     */
    const CONFIG = {
        /**
         * A master scale multiplier for the click buttons.
         * Default: 1.0 (100% size). Use 0.8 for 80% size, 1.2 for 120%, etc.
         * @type {number}
         */
        scale: 1.0,

        /**
         * The distance of the controls from the screen edges, calculated as a
         * percentage of the screen's shortest dimension (e.g., width in portrait).
         * @type {number}
         */
        paddingPercent: 4
    };

    //================================================================================
    // SECTION 2: STATE MANAGEMENT
    //================================================================================

    /**
     * A central object to hold the current state of the virtual controls.
     */
    let state = {
        // The last known coordinates of the virtual cursor.
        cursorX: window.innerWidth / 2,
        cursorY: window.innerHeight / 2,

        // The identifier of the single touch being tracked for cursor movement.
        touchIdentifier: null
    };

    //================================================================================
    // SECTION 3: DOM & STYLES SETUP
    //================================================================================

    /**
     * Creates and injects all necessary HTML elements into the document body
     * when the script first initializes.
     */
    function buildControls() {
        const container = document.createElement('div');
        container.id = 'virtual-controls-container';
        container.innerHTML = `
            <!-- This div captures all touch movement for the cursor -->
            <div id="trackpad-area" class="virtual-trackpad"></div>

            <!-- These are the dedicated buttons for mouse clicks -->
            <div id="left-click-button" class="virtual-button">L</div>
            <div id="right-click-button" class="virtual-button">R</div>

            <!-- This overlay greets new players and explains the controls -->
            <div id="touch-tutorial-overlay">
                <div id="touch-tutorial-content">
                    <h2>Welcome! Touch Controls:</h2>
                    <ul>
                        <li><b>Move Cursor:</b> Drag anywhere on screen. The cursor will follow your finger directly.</li>
                        <li><b>Left Click:</b> Tap the 'L' button.</li>
                        <li><b>Right Click:</b> Tap the 'R' button.</li>
                    </ul>
                    <button id="touch-tutorial-dismiss">Start Playing</button>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    /**
     * Injects the base CSS. This styles the appearance of the controls
     * but leaves their size and position to be calculated dynamically.
     */
    function addBaseStyles() {
        const styles = `
            /* Base styles for all virtual control elements */
            .virtual-trackpad, .virtual-button {
                position: absolute;
                box-sizing: border-box;
                /* Prevents the default blue tap highlight on iOS/Android */
                -webkit-tap-highlight-color: transparent;
                /* Prevents text selection when interacting with controls */
                user-select: none;
            }
            .virtual-button {
                background-color: rgba(100, 100, 110, 0.45);
                border: 1px solid rgba(255, 255, 255, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-family: sans-serif;
                font-weight: bold;
                border-radius: 50%;
                /* Ensure buttons are drawn above the game canvas */
                z-index: 10001;
            }
            .virtual-button:active {
                /* Provide visual feedback when a button is pressed */
                background-color: rgba(255, 220, 0, 0.7);
            }

            /* Styles for the tutorial overlay */
            #touch-tutorial-overlay {
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                background-color: rgba(0, 0, 0, 0.85);
                /* Ensure tutorial is on top of everything */
                z-index: 10002;
                display: none; /* Hidden by default */
                align-items: center;
                justify-content: center;
                color: white;
                font-family: sans-serif;
            }
            #touch-tutorial-content {
                text-align: center;
                padding: 20px;
                max-width: 90%;
            }
            #touch-tutorial-content h2 { margin-top: 0; }
            #touch-tutorial-content ul { list-style: none; padding: 0; margin: 20px 0; text-align: left; }
            #touch-tutorial-content li { margin-bottom: 12px; font-size: 1.1em; line-height: 1.4; }
            #touch-tutorial-dismiss {
                padding: 12px 24px;
                font-size: 1.2em;
                border-radius: 8px;
                border: none;
                background-color: #007bff;
                color: white;
                cursor: pointer;
            }
        `;
        const styleSheet = document.createElement("style");
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }

    //================================================================================
    // SECTION 4: DYNAMIC LAYOUT ENGINE
    //================================================================================

    /**
     * Calculates and applies the size and position of all control elements.
     * This function runs on startup and whenever the screen is resized or rotated,
     * ensuring the layout is always optimal.
     */
    function calculateAndApplyLayout() {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const isLandscape = screenW > screenH;
        const shortSide = Math.min(screenW, screenH);

        // Intelligently scale buttons to be larger in landscape for better ergonomics.
        const smartScale = CONFIG.scale * (isLandscape ? 1.2 : 1.0);

        // Calculate all sizes in pixels based on screen dimensions and config.
        const padding = shortSide * CONFIG.paddingPercent / 100;
        const rightClickSize = (shortSide * 0.12) * smartScale;
        const leftClickSize = (shortSide * 0.18) * smartScale;

        // Helper function to apply CSS styles to an element.
        const applyStyle = (id, styles) => {
            const el = document.getElementById(id);
            if (el) Object.assign(el.style, styles);
        };
        
        // The trackpad area should always cover the entire screen.
        applyStyle('trackpad-area', { width: '100vw', height: '100vh', top: '0', left: '0' });

        // Position the click buttons in the bottom-right corner.
        applyStyle('right-click-button', {
            width: `${rightClickSize}px`, height: `${rightClickSize}px`,
            bottom: `${padding}px`, right: `${padding}px`,
            fontSize: `${rightClickSize * 0.5}px`
        });
        applyStyle('left-click-button', {
            width: `${leftClickSize}px`, height: `${leftClickSize}px`,
            bottom: `${padding}px`, right: `${padding + rightClickSize + padding}px`,
            fontSize: `${leftClickSize * 0.5}px`
        });
    }

    //================================================================================
    // SECTION 5: EVENT HANDLING
    //================================================================================

    /**
     * Creates and dispatches a standard MouseEvent that the game engine can understand.
     * @param {string} type - The event type (e.g., 'mousedown', 'mousemove').
     * @param {number} button - The mouse button code (0=Left, 2=Right).
     */
    function simulateMouseEvent(type, button) {
        // Clamp cursor coordinates to ensure they are always within the window bounds.
        const x = Math.max(0, Math.min(window.innerWidth, state.cursorX));
        const y = Math.max(0, Math.min(window.innerHeight, state.cursorY));

        const event = new MouseEvent(type, {
            bubbles: true, cancelable: true, view: window,
            clientX: x, clientY: y, button: button, buttons: button === 0 ? 1 : 2
        });
        // Dispatch on the game canvas if found, otherwise fall back to the document.
        const canvas = document.getElementsByTagName('canvas')[0] || document;
        canvas.dispatchEvent(event);
    }

    /**
     * Attaches all necessary touch event listeners to the control elements.
     */
    function setupEventListeners() {
        const trackpad = document.getElementById('trackpad-area');
        const leftClick = document.getElementById('left-click-button');
        const rightClick = document.getElementById('right-click-button');

        // --- Trackpad (Direct Hover) Logic ---
        const handleTouchStartOrMove = (e) => {
            let touch;
            // If we are already tracking a finger, find it in the event.
            if (state.touchIdentifier !== null) {
                touch = Array.from(e.touches).find(t => t.identifier === state.touchIdentifier);
            } else {
                // Otherwise, start tracking the new finger that just touched down.
                touch = e.changedTouches[0];
                state.touchIdentifier = touch.identifier;
            }
            
            if (touch) {
                // Prevent default browser actions like scrolling or zooming.
                e.preventDefault();
                // Update the cursor position to be directly under the finger.
                state.cursorX = touch.clientX;
                state.cursorY = touch.clientY;
                // Simulate a `mousemove` event to update the game's cursor.
                // The button code -1 signifies that no buttons are being held down.
                simulateMouseEvent('mousemove', -1);
            }
        };

        trackpad.addEventListener('touchstart', handleTouchStartOrMove, { passive: false });
        trackpad.addEventListener('touchmove', handleTouchStartOrMove, { passive: false });
        trackpad.addEventListener('touchend', (e) => {
            const touch = Array.from(e.changedTouches).find(t => t.identifier === state.touchIdentifier);
            if (touch) {
                // When the finger is lifted, stop tracking it.
                state.touchIdentifier = null;
            }
        });

        // --- Click Button Logic ---
        leftClick.addEventListener('touchstart', (e) => { e.preventDefault(); simulateMouseEvent('mousedown', 0); }, { passive: false });
        leftClick.addEventListener('touchend', (e) => { e.preventDefault(); simulateMouseEvent('mouseup', 0); });
        rightClick.addEventListener('touchstart', (e) => { e.preventDefault(); simulateMouseEvent('mousedown', 2); }, { passive: false });
        rightClick.addEventListener('touchend', (e) => { e.preventDefault(); simulateMouseEvent('mouseup', 2); });
    }
    
    //================================================================================
    // SECTION 6: INITIALIZATION & TUTORIAL
    //================================================================================

    /**
     * Checks localStorage to see if the player has dismissed the tutorial before.
     * If not, it displays the tutorial overlay.
     */
    function showTutorialIfNeeded() {
        // Versioning the key ensures that if you update the tutorial,
        // even previous players will see the new instructions once.
        const tutorialKey = 'directTouchControlsTutorialDismissed_v1';
        if (localStorage.getItem(tutorialKey) === 'true') {
            return;
        }

        const overlay = document.getElementById('touch-tutorial-overlay');
        const dismissButton = document.getElementById('touch-tutorial-dismiss');

        overlay.style.display = 'flex';

        dismissButton.addEventListener('click', () => {
            overlay.style.display = 'none';
            // Save the dismissal so it doesn't show again for this user.
            localStorage.setItem(tutorialKey, 'true');
        }, { once: true }); // The listener removes itself after being clicked once.
    }

    /**
     * The main execution function that orchestrates the script setup.
     */
    function init() {
        // The order of these calls is important.
        buildControls();
        addBaseStyles();
        setupEventListeners();
        calculateAndApplyLayout();
        showTutorialIfNeeded();
        
        // Add listeners to recalculate the layout on screen changes.
        window.addEventListener('resize', calculateAndApplyLayout);
        window.addEventListener('orientationchange', calculateAndApplyLayout);
    }

    // Defer script execution until the main document has been fully loaded.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();