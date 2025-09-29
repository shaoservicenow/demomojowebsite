let overlayDiv = null;

function createOverlay() {
  overlayDiv = document.createElement("div");
  overlayDiv.id = "demoOverlay";
  document.body.appendChild(overlayDiv);
  
  // Reset destroyed flag when overlay is created
  overlayDestroyed = false;
  
  // Add resize functionality for fullscreen mode
  addResizeFunctionality();
}

// Resize functionality for fullscreen overlay
function addResizeFunctionality() {
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;
  
  // Load saved width from localStorage
  const savedWidth = localStorage.getItem('demoOverlayWidth');
  if (savedWidth && overlayDiv) {
    overlayDiv.style.width = savedWidth + 'px';
  }
  
  // Add mouse event listeners for resize handle
  overlayDiv.addEventListener('mousedown', (e) => {
    // Check if clicking on the resize handle (right edge)
    const rect = overlayDiv.getBoundingClientRect();
    const handleWidth = 20; // Increased width of the resize handle area
    
    if (e.clientX >= rect.right - handleWidth && overlayDiv.classList.contains('fullscreen')) {
      e.preventDefault();
      e.stopPropagation();
      isResizing = true;
      startX = e.clientX;
      startWidth = rect.width;
      
      // Attach to document so dragging continues outside overlay
      // Use capture phase to intercept events before other elements
      document.addEventListener('mousemove', handleResize, { capture: true, passive: false });
      document.addEventListener('mouseup', stopResize, { capture: true, passive: false });
      
      // Add resizing class and prevent text selection
      overlayDiv.classList.add('resizing');
      document.body.classList.add('resizing');
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      overlayDiv.style.userSelect = 'none';
    }
  });
  
  function handleResize(e) {
    if (!isResizing || !overlayDiv.classList.contains('fullscreen')) return;
    
    // Prevent all default behaviors and event propagation
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Calculate new width based on mouse position
    const deltaX = e.clientX - startX;
    const newWidth = startWidth + deltaX;
    
    // Apply constraints
    const minWidth = 300;
    const maxWidth = window.innerWidth * 0.8; // 80% of viewport width
    
    const constrainedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    overlayDiv.style.width = constrainedWidth + 'px';
    
    // Update content pin if in responsive mode
    updateContentShift(constrainedWidth);
  }
  
  function stopResize() {
    if (!isResizing) return;
    
    isResizing = false;
    document.removeEventListener('mousemove', handleResize, { capture: true });
    document.removeEventListener('mouseup', stopResize, { capture: true });
    
    // Remove resizing class and restore body styles
    overlayDiv.classList.remove('resizing');
    document.body.classList.remove('resizing');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    overlayDiv.style.userSelect = '';
    
    // Save the new width to localStorage
    const currentWidth = overlayDiv.getBoundingClientRect().width;
    localStorage.setItem('demoOverlayWidth', currentWidth);
    
    // Final update to content pin
    updateContentShift(currentWidth);
  }
  
  // Also handle window resize to maintain constraints
  window.addEventListener('resize', () => {
    if (overlayDiv && overlayDiv.classList.contains('fullscreen')) {
      const currentWidth = overlayDiv.getBoundingClientRect().width;
      const maxWidth = window.innerWidth * 0.8;
      
      if (currentWidth > maxWidth) {
        overlayDiv.style.width = maxWidth + 'px';
        localStorage.setItem('demoOverlayWidth', maxWidth);
        updateContentShift(maxWidth);
      }
    }
  });
}

// Function to update content pin based on overlay width
function updateContentShift(overlayWidth) {
  if (document.body.classList.contains('responsive-mode')) {
    // Update CSS custom property for dynamic width
    document.documentElement.style.setProperty('--overlay-width', overlayWidth + 'px');
    
    // Also update body styles directly for immediate effect
    document.body.style.marginLeft = overlayWidth + 'px';
    document.body.style.width = `calc(100% - ${overlayWidth}px)`;
    
    // Update fixed positioned elements
    const fixedElements = document.querySelectorAll('[style*="position: fixed"]');
    fixedElements.forEach(element => {
      const currentLeft = element.style.left;
      if (currentLeft && currentLeft.includes('400px')) {
        element.style.left = overlayWidth + 'px';
      }
    });
  }
}

function injectStyles() {
  if (document.getElementById('demo-overlay-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'demo-overlay-styles';
  style.textContent = `
    #demoOverlay {
      position: fixed;
      background: linear-gradient(135deg, var(--primary-color, rgba(3, 45, 66, ${overlayOpacity})) 0%, var(--secondary-color, rgba(118, 97, 255, ${overlayOpacity})) 100%);
      color: white;
      border-radius: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      z-index: 999999;
      pointer-events: none;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(99, 223, 78, 0.3);
      padding-bottom: 60px;
    }

    /* Position classes */
    #demoOverlay.position-bottom-right {
      bottom: 24px;
      right: 24px;
    }

    #demoOverlay.position-bottom-left {
      bottom: 24px;
      left: 24px;
    }

    /* Size classes - more specific to override position */
    #demoOverlay.size-small {
      max-width: 320px !important;
      font-size: 14px !important;
      padding: 20px 24px !important;
    }

    #demoOverlay.size-large {
      max-width: 384px !important; /* 320px * 1.2 */
      font-size: 16.8px !important; /* 14px * 1.2 */
      padding: 24px 28.8px !important; /* 20px 24px * 1.2 */
    }

    /* Scale all elements within large overlay by 20% */
    #demoOverlay.size-large .persona-headshot {
      width: 48px !important; /* 40px * 1.2 */
      height: 48px !important; /* 40px * 1.2 */
    }

    #demoOverlay.size-large .persona-name {
      font-size: 16.8px !important; /* 14px * 1.2 */
    }

    #demoOverlay.size-large .persona-title {
      font-size: 13.2px !important; /* 11px * 1.2 */
    }

    #demoOverlay.size-large .chapter {
      font-size: 19.2px !important; /* 16px * 1.2 */
    }

    #demoOverlay.size-large .drivers li {
      font-size: 15.6px !important; /* 13px * 1.2 */
      padding: 9.6px 14.4px !important; /* 8px 12px * 1.2 */
      margin: 7.2px 0 !important; /* 6px 0 * 1.2 */
    }

    #demoOverlay.size-large .progress-indicator {
      font-size: 13.2px !important; /* 11px * 1.2 */
      padding: 4.8px 9.6px !important; /* 4px 8px * 1.2 */
    }


    #demoOverlay.hiding {
      animation: slideOutDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    

    @keyframes slideOutDown {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(20px);
      }
    }

    
    #demoOverlay .persona-info {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
    
    #demoOverlay .persona-headshot {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 12px;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }
    
    #demoOverlay .persona-details {
      flex: 1;
    }
    
    #demoOverlay .persona-name {
      font-weight: 600;
      font-size: 18px;
      color: #ffffff;
      margin-bottom: 2px;
    }
    
    #demoOverlay .persona-title {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      font-style: italic;
    }
    
    #demoOverlay .chapter {
      font-style: normal;
      font-weight: 600;
      margin-bottom: 12px;
      color: rgba(255, 255, 255, 0.95);
      font-size: 16px;
      cursor: pointer;
      transition: color 0.2s ease;
      pointer-events: auto;
    }

    #demoOverlay .chapter:hover {
      color: rgba(99, 223, 78, 0.9);
    }

    
    #demoOverlay .drivers {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    #demoOverlay .drivers li {
      background: rgba(99, 223, 78, 0.2);
      padding: 8px 12px;
      margin: 6px 0;
      border-radius: 8px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.95);
      border-left: 3px solid rgba(99, 223, 78, 0.6);
    }
    
    #demoOverlay .drivers li:first-child {
      margin-top: 0;
    }
    
    #demoOverlay .drivers li:last-child {
      margin-bottom: 0;
    }

    /* Expand button for small overlay */
    #demoOverlay .expand-button {
      position: absolute;
      top: 12px;
      left: 16px;
      width: 24px;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.9);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s ease;
      backdrop-filter: blur(5px);
      z-index: 10;
      pointer-events: auto;
    }

    #demoOverlay .expand-button:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(99, 223, 78, 0.5);
      transform: scale(1.05);
    }

    #demoOverlay .expand-button:active {
      transform: scale(0.95);
    }

    /* Arrow navigation buttons for small overlay */
    #demoOverlay .arrow-nav {
      position: absolute;
      bottom: 12px;
      right: 12px;
      display: flex;
      gap: 4px;
      z-index: 10;
    }

    #demoOverlay .arrow-button {
      width: 24px;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.9);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s ease;
      backdrop-filter: blur(5px);
      pointer-events: auto;
    }

    #demoOverlay .arrow-button:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(99, 223, 78, 0.5);
      transform: scale(1.05);
    }

    #demoOverlay .arrow-button:active {
      transform: scale(0.95);
    }

    #demoOverlay .arrow-button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Adjust progress indicator position when expand button is present */
    #demoOverlay .progress-indicator {
      position: absolute;
      top: 12px;
      right: 16px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);
      background: rgba(0, 0, 0, 0.2);
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: 500;
    }

    /* Full-screen overlay styles */
    #demoOverlay.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 400px;
      height: 100vh;
      max-width: none;
      max-height: none;
      border-radius: 0;
      padding: 40px;
      overflow-y: auto;
      z-index: 999999;
        background: linear-gradient(135deg, var(--primary-color, rgba(3, 45, 66, ${Math.min(overlayOpacity + 0.1, 1)})) 0%, var(--secondary-color, rgba(118, 97, 255, ${Math.min(overlayOpacity + 0.1, 1)})) 100%);
      backdrop-filter: blur(25px);
      pointer-events: auto;
      resize: horizontal;
      min-width: 300px;
      max-width: 80vw;
      /* Hide scrollbars */
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* Internet Explorer 10+ */
    }
    
    /* Hide scrollbar for Chrome, Safari and Opera */
    #demoOverlay.fullscreen::-webkit-scrollbar {
      display: none;
    }
    
    /* Prevent text selection during resize */
    #demoOverlay.fullscreen.resizing {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
    
    /* Prevent other elements from interfering during resize */
    body.resizing * {
      pointer-events: none !important;
    }
    
    body.resizing #demoOverlay {
      pointer-events: auto !important;
    }
    
    /* Resize handle for fullscreen overlay */
    #demoOverlay.fullscreen::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 8px;
      height: 100%;
      background: linear-gradient(180deg, transparent 0%, var(--accent-color, rgba(99, 223, 78, 0.2)) 20%, var(--accent-color, rgba(99, 223, 78, 0.4)) 50%, var(--accent-color, rgba(99, 223, 78, 0.2)) 80%, transparent 100%);
      cursor: ew-resize;
      z-index: 1000000;
    }
    
    /* Hover effect for resize handle */
    #demoOverlay.fullscreen:hover::before {
      background: linear-gradient(180deg, transparent 0%, var(--accent-color, rgba(99, 223, 78, 0.4)) 20%, var(--accent-color, rgba(99, 223, 78, 0.7)) 50%, var(--accent-color, rgba(99, 223, 78, 0.4)) 80%, transparent 100%);
    }

    #demoOverlay.fullscreen .story-summary {
      max-width: 1200px;
      margin: 0 auto;
      color: white;
    }

    #demoOverlay.fullscreen .story-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 20px;
      text-align: center;
      color: white;
      position: relative;
      z-index: 20;
    }

    #demoOverlay.fullscreen .return-instruction {
      text-align: center;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 20px;
      font-style: italic;
    }

    #demoOverlay.fullscreen .overlay-controls {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 40px;
    }

    #demoOverlay.fullscreen .control-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
      backdrop-filter: blur(10px);
    }

    #demoOverlay.fullscreen .control-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(99, 223, 78, 0.5);
      transform: translateY(-1px);
    }

    #demoOverlay.fullscreen .control-btn.active {
      background: rgba(99, 223, 78, 0.3);
      border-color: rgba(99, 223, 78, 0.6);
    }

    /* Responsive mode styles */
    :root {
      --overlay-width: 400px;
    }
    
    body {
      transition: margin-left 0.3s ease, width 0.3s ease;
    }
    
    body.responsive-mode {
      margin-left: var(--overlay-width) !important;
      overflow-x: hidden;
      width: calc(100% - var(--overlay-width)) !important;
    }
    
    /* Ensure all elements shift properly */
    body.responsive-mode * {
      box-sizing: border-box;
    }
    
    /* Fix for fixed positioned elements */
    body.responsive-mode [style*="position: fixed"] {
      left: var(--overlay-width) !important;
    }
    
    /* Ensure the overlay doesn't interfere with pinned content */
    body.responsive-mode #demoOverlay.fullscreen {
      z-index: 999999;
    }
    
    /* Persona highlighting styles */
    #demoOverlay.fullscreen .persona-card {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    #demoOverlay.fullscreen .persona-card:hover {
      transform: scale(1.02);
      box-shadow: 0 8px 25px rgba(99, 223, 78, 0.3);
    }
    
    #demoOverlay.fullscreen .persona-card.highlighted {
      background: rgba(99, 223, 78, 0.2);
      border-color: rgba(99, 223, 78, 0.6);
      box-shadow: 0 12px 30px rgba(99, 223, 78, 0.4);
      z-index: 10;
    }
    
    #demoOverlay.fullscreen .persona-card.greyed-out {
      opacity: 0.3;
      filter: grayscale(0.8);
      transform: scale(0.95);
    }
    
    #demoOverlay.fullscreen .persona-card.highlighted .persona-name {
      color: #63DF4E;
      font-weight: 700;
    }
    
    #demoOverlay.fullscreen .persona-card.highlighted .persona-title {
      color: #52B8FF;
    }
    
    /* Disable chapter clicks when content is pinned, but allow checkboxes */
    body.responsive-mode #demoOverlay.fullscreen .chapter-item {
      cursor: default;
    }
    
    /* Re-enable pointer events for checkboxes */
    body.responsive-mode #demoOverlay.fullscreen .chapter-checkbox {
      pointer-events: auto;
      cursor: pointer;
    }
    
    body.responsive-mode #demoOverlay.fullscreen .chapter-item .chapter-title {
      color: rgba(255, 255, 255, 0.6);
    }
    
    body.responsive-mode #demoOverlay.fullscreen .chapter-item .drivers-list {
      opacity: 0.7;
    }
    
    /* Handle potential layout issues */
    body.responsive-mode html {
      margin-left: 0 !important;
    }
    
    /* Ensure body takes full width when shifted */
    body.responsive-mode {
      min-width: 0 !important;
    }

    #demoOverlay.fullscreen .personas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    body.responsive-mode #demoOverlay.fullscreen .personas-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    #demoOverlay.fullscreen .persona-card {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 20px;
      backdrop-filter: blur(10px);
      position: relative;
      z-index: 1;
    }

    #demoOverlay.fullscreen .persona-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }

    #demoOverlay.fullscreen .persona-headshot {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-right: 12px;
      object-fit: cover;
    }

    #demoOverlay.fullscreen .persona-name {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    #demoOverlay.fullscreen .persona-title {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin: 4px 0 0 0;
    }

    #demoOverlay.fullscreen .chapters-list {
      margin-top: 16px;
    }

    #demoOverlay.fullscreen .chapter-item {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 12px;
      margin: 8px 0;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    #demoOverlay.fullscreen .chapter-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, var(--accent-color, rgba(99, 223, 78, 0.1)), transparent);
      transition: left 0.5s ease;
    }

    #demoOverlay.fullscreen .chapter-item:hover {
      background: rgba(99, 223, 78, 0.15);
      border-color: rgba(99, 223, 78, 0.5);
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 4px 12px rgba(99, 223, 78, 0.2);
    }

    #demoOverlay.fullscreen .chapter-item:hover::before {
      left: 100%;
    }

    #demoOverlay.fullscreen .chapter-item:hover .chapter-title {
      color: #63DF4E;
      transform: translateX(4px);
    }

    #demoOverlay.fullscreen .chapter-item:hover .drivers-list {
      opacity: 0.9;
    }

    #demoOverlay.fullscreen .chapter-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    #demoOverlay.fullscreen .chapter-checkbox {
      margin-right: 12px;
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #63DF4E;
    }

    #demoOverlay.fullscreen .chapter-title {
      font-size: 16px;
      font-weight: 500;
      margin: 0;
      flex: 1;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1;
    }

    #demoOverlay.fullscreen .chapter-item.completed {
      opacity: 0.6;
      background: rgba(99, 223, 78, 0.1);
      border-color: rgba(99, 223, 78, 0.3);
    }

    #demoOverlay.fullscreen .chapter-item.completed .chapter-title {
      text-decoration: line-through;
    }

    #demoOverlay.fullscreen .drivers-list {
      list-style: none;
      padding: 0;
      margin: 0;
      transition: opacity 0.3s ease;
      position: relative;
      z-index: 1;
    }

    #demoOverlay.fullscreen .drivers-list li {
      background: rgba(99, 223, 78, 0.2);
      padding: 6px 10px;
      margin: 4px 0;
      border-radius: 4px;
      font-size: 12px;
      border-left: 3px solid rgba(99, 223, 78, 0.6);
    }

  `;
  document.head.appendChild(style);
}

// Available headshot images for fallback
const availableHeadshots = [
  'blake.png',
  'elle.png', 
  'jim.png',
  'kate.png',
  'nick.png',
  'patty.png',
  'taylor.png'
];

function getRandomHeadshot() {
  const randomIndex = Math.floor(Math.random() * availableHeadshots.length);
  return chrome.runtime.getURL(`headshots/${availableHeadshots[randomIndex]}`);
}

function getConsistentHeadshot(personaName, personaIndex = null) {
  // Use persona name to generate a consistent index
  let hash = 0;
  for (let i = 0; i < personaName.length; i++) {
    const char = personaName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get a valid index
  const index = Math.abs(hash) % availableHeadshots.length;
  return chrome.runtime.getURL(`headshots/${availableHeadshots[index]}`);
}

// Global state for navigation
let currentStory = null;
let currentPersona = null;
let currentChapterIndex = 0;
let allChapters = [];
let allPersonas = [];
let currentPersonaIndex = 0;
let completedChapters = new Set(); // Track completed chapters
let isOverlayVisible = false;
let isFullscreenMode = false;
let isRestoringState = false;
let selectedChapterIndex = -1; // Track selected chapter in large overlay
let shortcutsEnabled = true; // Track whether shortcuts are enabled
let overlayOpacity = 0.75; // Track overlay opacity setting
let overlayDestroyed = false; // Track if overlay was destroyed (disables shortcuts)
let colorScheme = 'default'; // Track color scheme setting
let showProgressIndicators = true; // Track show progress indicators setting
let autoHighlightChapter = false; // Track auto-highlight chapter setting
let crossTabChapterSync = true; // Track cross-tab chapter sync setting
let crossTabHighlightingSync = true; // Track cross-tab highlighting sync setting
let customShortcuts = {}; // Track custom keyboard shortcuts

// Initialize completed chapters from Chrome storage on page load
function loadCompletedChapters() {
  if (!crossTabChapterSync) {
    console.log('Cross-tab chapter sync is disabled, initializing empty completed chapters');
    completedChapters = new Set();
    return;
  }
  
  chrome.storage.local.get(['completedChapters'], (result) => {
    const saved = result.completedChapters;
    console.log('Loading completed chapters from Chrome storage:', saved);
    if (saved) {
      try {
        const completedArray = JSON.parse(saved);
        completedChapters = new Set(completedArray);
        console.log('Loaded completed chapters:', [...completedChapters]);
      } catch (e) {
        console.log('Could not load completed chapters from Chrome storage:', e);
        completedChapters = new Set();
      }
    } else {
      completedChapters = new Set();
      console.log('No saved completed chapters found, initializing empty Set');
    }
    console.log('Current completedChapters Set after load:', [...completedChapters]);
  });
}

// Save overlay state to Chrome storage
function saveOverlayState() {
  const state = {
    isOverlayVisible,
    isFullscreenMode,
    currentStory,
    currentPersona,
    currentChapterIndex,
    allChapters,
    allPersonas,
    currentPersonaIndex,
    isContentShifted,
    currentOverlaySize,
    currentOverlayPosition,
    overlayScrollTop: overlayDiv ? overlayDiv.scrollTop : 0,
    timestamp: Date.now() // Add timestamp to ensure we get the most recent state
  };
  
  // Only include highlighting state if cross-tab highlighting sync is enabled
  if (crossTabHighlightingSync) {
    state.highlightedPersonaIndex = highlightedPersonaIndex;
    state.selectedChapterIndex = selectedChapterIndex;
  }
  
  chrome.storage.local.set({ overlayState: state }, () => {
    console.log('Overlay state saved:', state);
    if (crossTabHighlightingSync) {
      console.log('Saved selectedChapterIndex:', state.selectedChapterIndex, 'highlightedPersonaIndex:', state.highlightedPersonaIndex);
    } else {
      console.log('Cross-tab highlighting sync disabled, not saving highlighting state');
    }
  });
}

// Load overlay state from Chrome storage
function loadOverlayState() {
  chrome.storage.local.get(['overlayState'], (result) => {
    if (result.overlayState) {
      const state = result.overlayState;
      console.log('Loading overlay state:', state);
      
      // Set flag to prevent state from being overwritten
      isRestoringState = true;
      
      // Restore state variables
      isOverlayVisible = state.isOverlayVisible || false;
      isFullscreenMode = state.isFullscreenMode || false;
      currentStory = state.currentStory;
      currentPersona = state.currentPersona;
      currentChapterIndex = state.currentChapterIndex || 0;
      allChapters = state.allChapters || [];
      allPersonas = state.allPersonas || [];
      currentPersonaIndex = state.currentPersonaIndex || 0;
      isContentShifted = state.isContentShifted || false;
      currentOverlaySize = state.currentOverlaySize || 'small';
      currentOverlayPosition = state.currentOverlayPosition || 'bottom-right';
      
      // Only restore highlighting state if cross-tab highlighting sync is enabled
      if (crossTabHighlightingSync) {
        highlightedPersonaIndex = state.highlightedPersonaIndex !== undefined ? state.highlightedPersonaIndex : -1;
        selectedChapterIndex = state.selectedChapterIndex !== undefined ? state.selectedChapterIndex : -1;
      } else {
        highlightedPersonaIndex = -1;
        selectedChapterIndex = -1;
      }
      
      const savedScrollTop = state.overlayScrollTop || 0;
      
      console.log('State restored - isOverlayVisible:', isOverlayVisible, 'isFullscreenMode:', isFullscreenMode);
      console.log('State restored - currentStory:', currentStory, 'allPersonas length:', allPersonas.length);
      console.log('State restored - highlightedPersonaIndex:', highlightedPersonaIndex, 'selectedChapterIndex:', selectedChapterIndex);
      console.log('State restored - savedScrollTop:', savedScrollTop);
      console.log('State restored - timestamp:', state.timestamp, 'current time:', Date.now());
      
      // Restore overlay if it was visible
      if (isOverlayVisible) {
        console.log('Restoring overlay after page navigation');
        restoreOverlay(savedScrollTop);
      } else {
        console.log('Overlay was not visible, not restoring');
      }
      
      // Clear the flag after a delay
      setTimeout(() => {
        isRestoringState = false;
      }, 1000);
    } else {
      console.log('No overlay state found in storage');
    }
  });
}

// Restore overlay after page navigation
function restoreOverlay(savedScrollTop = 0) {
  console.log('restoreOverlay called - isFullscreenMode:', isFullscreenMode, 'isOverlayVisible:', isOverlayVisible);
  console.log('Current state - currentStory:', currentStory, 'currentPersona:', currentPersona, 'allChapters length:', allChapters.length);
  
  if (!overlayDiv) {
    console.log('Creating new overlay');
    injectStyles();
    createOverlay();
  }
  
  if (isFullscreenMode) {
    console.log('Restoring fullscreen mode');
    overlayDiv.classList.add('fullscreen');
    
    // Restore saved width
    const savedWidth = localStorage.getItem('demoOverlayWidth');
    if (savedWidth) {
      overlayDiv.style.width = savedWidth + 'px';
    }
    
    if (isContentShifted) {
      document.body.classList.add('responsive-mode');
      // Update content pin with current overlay width
      const currentWidth = overlayDiv.getBoundingClientRect().width;
      updateContentShift(currentWidth);
    }
    
    // Ensure we have the required data for fullscreen mode
    if (!currentStory || !allPersonas || allPersonas.length === 0) {
      console.log('Missing data for fullscreen mode, loading from storage');
      chrome.storage.local.get(['stories'], (result) => {
        const stories = result.stories || [];
        if (stories.length > 0) {
          const story = stories[0];
          currentStory = story; // Store the full story object, not just the name
          allPersonas = story.personas || [];
          showFullscreenSummary();
          // Restore highlighting after content is rendered
          setTimeout(() => {
            restoreFullscreenHighlighting();
          }, 100);
        } else {
          console.log('No stories available for fullscreen restoration');
        }
      });
    } else {
      showFullscreenSummary();
      // Restore highlighting after content is rendered
      setTimeout(() => {
        restoreFullscreenHighlighting();
      }, 100);
    }
  } else {
    console.log('Restoring small overlay mode');
    
    // If there's a selected chapter from large overlay, navigate to it in small overlay
    if (highlightedPersonaIndex >= 0 && selectedChapterIndex >= 0 && allPersonas && allPersonas[highlightedPersonaIndex]) {
      const selectedPersona = allPersonas[highlightedPersonaIndex];
      const selectedChapter = selectedPersona.chapters[selectedChapterIndex];
      
      if (selectedChapter) {
        // Update current persona and chapter to the selected ones
        currentPersonaIndex = highlightedPersonaIndex;
        currentChapterIndex = selectedChapterIndex;
        currentPersona = { 
          name: selectedPersona.name, 
          title: selectedPersona.businessTitle || selectedPersona.title, 
          headshot: selectedPersona.headshot,
          index: highlightedPersonaIndex 
        };
        allChapters = selectedPersona.chapters || [];
        
        console.log('Restoring small overlay to selected chapter:', selectedPersona.name, '- Chapter', selectedChapterIndex + 1);
      }
    }
    
    updateOverlayContent();
  }
  
  overlayDiv.style.display = 'block';
  
  // Restore scroll position after a short delay to ensure content is rendered
  setTimeout(() => {
    if (savedScrollTop > 0) {
      overlayDiv.scrollTop = savedScrollTop;
      console.log('Scroll position restored to:', savedScrollTop);
    }
    
        // Highlighting is now handled by restoreFullscreenHighlighting() for fullscreen mode
  }, 100);
  
  console.log('Overlay restored after page navigation');
}

// Save completed chapters to Chrome storage
function saveCompletedChapters() {
  if (!crossTabChapterSync) {
    console.log('Cross-tab chapter sync is disabled, not saving to Chrome storage');
    return;
  }
  
  const toSave = [...completedChapters];
  console.log('Saving completed chapters to Chrome storage:', toSave);
  chrome.storage.local.set({ completedChapters: JSON.stringify(toSave) }, () => {
    console.log('Completed chapters saved to Chrome storage');
  });
}

// Load shortcuts setting from Chrome storage
function loadShortcutsSetting() {
  chrome.storage.local.get(['shortcutsEnabled'], (result) => {
    if (result.shortcutsEnabled !== undefined) {
      shortcutsEnabled = result.shortcutsEnabled;
      console.log('Shortcuts enabled:', shortcutsEnabled);
    }
  });
}

function loadOverlayOpacitySetting() {
  chrome.storage.local.get(['overlayOpacity'], (result) => {
    if (result.overlayOpacity !== undefined) {
      overlayOpacity = result.overlayOpacity;
      console.log('Overlay opacity:', overlayOpacity);
    }
  });
}

function loadColorSchemeSetting() {
  chrome.storage.local.get(['colorScheme'], (result) => {
    if (result.colorScheme !== undefined) {
      colorScheme = result.colorScheme;
      console.log('Color scheme:', colorScheme);
      applyColorScheme();
    }
  });
}

function loadShowProgressIndicatorsSetting() {
  chrome.storage.local.get(['showProgressIndicators'], (result) => {
    if (result.showProgressIndicators !== undefined) {
      showProgressIndicators = result.showProgressIndicators;
      console.log('Show progress indicators:', showProgressIndicators);
    }
  });
}

function loadAutoHighlightChapterSetting() {
  chrome.storage.local.get(['autoHighlightChapter'], (result) => {
    if (result.autoHighlightChapter !== undefined) {
      autoHighlightChapter = result.autoHighlightChapter;
      console.log('Auto-highlight chapter:', autoHighlightChapter);
    }
  });
}

// Load cross-tab chapter sync setting from Chrome storage
function loadCrossTabChapterSyncSetting() {
  chrome.storage.local.get(['crossTabChapterSync'], (result) => {
    if (result.crossTabChapterSync !== undefined) {
      crossTabChapterSync = result.crossTabChapterSync;
      console.log('Cross-tab chapter sync setting loaded:', crossTabChapterSync);
      
      // Reload completed chapters if setting changed
      if (crossTabChapterSync) {
        loadCompletedChapters();
      } else {
        // Clear completed chapters if sync is disabled
        completedChapters = new Set();
        console.log('Cross-tab sync disabled, cleared completed chapters');
      }
    }
  });
}

// Load cross-tab highlighting sync setting from Chrome storage
function loadCrossTabHighlightingSyncSetting() {
  chrome.storage.local.get(['crossTabHighlightingSync'], (result) => {
    if (result.crossTabHighlightingSync !== undefined) {
      crossTabHighlightingSync = result.crossTabHighlightingSync;
      console.log('Cross-tab highlighting sync setting loaded:', crossTabHighlightingSync);
      
      // Clear highlighting state if sync is disabled
      if (!crossTabHighlightingSync) {
        highlightedPersonaIndex = -1;
        selectedChapterIndex = -1;
        console.log('Cross-tab highlighting sync disabled, cleared highlighting state');
      }
    }
  });
}

function loadCustomShortcutsSetting() {
  chrome.storage.local.get(['customShortcuts'], (result) => {
    if (result.customShortcuts) {
      customShortcuts = result.customShortcuts;
      console.log('Custom shortcuts loaded:', customShortcuts);
    }
  });
}

function checkCurrentPageForChapterMatch() {
  if (!autoHighlightChapter || !currentPersona || !allChapters || allChapters.length === 0) {
    return;
  }
  
  const currentUrl = window.location.href;
  console.log('Checking current page URL for chapter match:', currentUrl);
  
  // Find matching chapter within current persona
  const matchingChapterIndex = allChapters.findIndex(chapter => {
    if (!chapter.url || chapter.url.trim() === '') return false;
    
    // Check for exact match or if current URL contains chapter URL
    return currentUrl === chapter.url || currentUrl.includes(chapter.url);
  });
  
  if (matchingChapterIndex !== -1 && matchingChapterIndex !== currentChapterIndex) {
    console.log('Found matching chapter:', allChapters[matchingChapterIndex].title, 'at index:', matchingChapterIndex);
    
    // Update current chapter index
    currentChapterIndex = matchingChapterIndex;
    
    // Update overlay content based on mode
    if (overlayDiv && isOverlayVisible) {
      if (isFullscreenMode) {
        // In fullscreen mode, highlight the chapter in the large overlay
        highlightCurrentChapterFromSmallOverlay();
      } else {
        // In small overlay mode, update the content
        updateOverlayContent();
      }
    }
    
    // Save overlay state
    saveOverlayState();
  } else if (matchingChapterIndex === -1) {
    console.log('No matching chapter found for current URL');
  }
}

function setupAutoHighlightNavigation() {
  // Check for URL match when the page loads
  window.addEventListener('load', () => {
    console.log('Page loaded, checking for auto-highlight match');
    setTimeout(() => {
      checkCurrentPageForChapterMatch();
    }, 1000); // Small delay to ensure overlay is ready
  });
  
  // Check for URL match when navigating (for SPAs and regular navigation)
  let currentUrl = window.location.href;
  
  // Listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', () => {
    console.log('Popstate event, checking for auto-highlight match');
    setTimeout(() => {
      checkCurrentPageForChapterMatch();
    }, 500);
  });
  
  // Use MutationObserver to detect URL changes in SPAs
  const observer = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      console.log('URL changed via MutationObserver, checking for auto-highlight match');
      setTimeout(() => {
        checkCurrentPageForChapterMatch();
      }, 500);
    }
  });
  
  // Start observing
  observer.observe(document, { subtree: true, childList: true });
  
  console.log('Auto-highlight navigation listeners set up');
}

function applyColorScheme() {
  console.log('Applying color scheme:', colorScheme, 'overlayOpacity:', overlayOpacity);
  
  // Define color schemes
  const schemes = {
    default: {
      primary: 'rgba(3, 45, 66, ' + overlayOpacity + ')',
      secondary: 'rgba(118, 97, 255, ' + overlayOpacity + ')',
      accent: 'rgba(99, 223, 78, 0.3)',
      text: '#ffffff'
    },
    purple: {
      primary: 'rgba(75, 0, 130, ' + overlayOpacity + ')',
      secondary: 'rgba(138, 43, 226, ' + overlayOpacity + ')',
      accent: 'rgba(186, 85, 211, 0.3)',
      text: '#ffffff'
    },
    orange: {
      primary: 'rgba(255, 140, 0, ' + overlayOpacity + ')',
      secondary: 'rgba(255, 69, 0, ' + overlayOpacity + ')',
      accent: 'rgba(255, 165, 0, 0.3)',
      text: '#ffffff'
    },
    dark: {
      primary: 'rgba(20, 20, 20, ' + overlayOpacity + ')',
      secondary: 'rgba(40, 40, 40, ' + overlayOpacity + ')',
      accent: 'rgba(60, 60, 60, 0.3)',
      text: '#ffffff'
    }
  };

  const scheme = schemes[colorScheme] || schemes.default;
  console.log('Selected scheme:', scheme);
  
  // Apply color scheme to overlay if it exists
  if (overlayDiv) {
    console.log('Applying color scheme directly to overlay styles');
    
    // Apply background gradient directly
    overlayDiv.style.background = `linear-gradient(135deg, ${scheme.primary} 0%, ${scheme.secondary} 100%)`;
    
    // If it's fullscreen, also update the fullscreen background
    if (overlayDiv.classList.contains('fullscreen')) {
      const fullscreenOpacity = Math.min(overlayOpacity + 0.1, 1);
      const fullscreenPrimary = scheme.primary.replace(overlayOpacity, fullscreenOpacity);
      const fullscreenSecondary = scheme.secondary.replace(overlayOpacity, fullscreenOpacity);
      overlayDiv.style.background = `linear-gradient(135deg, ${fullscreenPrimary} 0%, ${fullscreenSecondary} 100%)`;
    }
    
    console.log('Color scheme applied successfully');
  } else {
    console.log('No overlay exists to apply color scheme to');
  }
}

// Load completed chapters when the script runs
loadCompletedChapters();
loadShortcutsSetting();
loadOverlayOpacitySetting();
loadColorSchemeSetting();
loadShowProgressIndicatorsSetting();
loadAutoHighlightChapterSetting();
loadCrossTabChapterSyncSetting();
loadCrossTabHighlightingSyncSetting();
loadCustomShortcutsSetting();

// Listen for storage changes to sync completed chapters and highlighting across tabs
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    // Handle completed chapters sync
    if (changes.completedChapters && crossTabChapterSync) {
      console.log('Completed chapters changed in another tab, updating local state');
      const newCompletedChapters = changes.completedChapters.newValue;
      if (newCompletedChapters) {
        try {
          const completedArray = JSON.parse(newCompletedChapters);
          completedChapters = new Set(completedArray);
          console.log('Updated completed chapters from storage change:', [...completedChapters]);
          
          // Update visual state if overlay is visible
          if (overlayDiv && isOverlayVisible) {
            updateChapterCompletionVisuals();
          }
        } catch (e) {
          console.log('Could not parse completed chapters from storage change:', e);
        }
      } else {
        completedChapters = new Set();
        console.log('Cleared completed chapters from storage change');
        
        // Update visual state if overlay is visible
        if (overlayDiv && isOverlayVisible) {
          updateChapterCompletionVisuals();
        }
      }
    }
    
    // Handle highlighting sync
    if (changes.overlayState && crossTabHighlightingSync) {
      console.log('Overlay state changed in another tab, updating highlighting');
      const newState = changes.overlayState.newValue;
      if (newState && newState.highlightedPersonaIndex !== undefined && newState.selectedChapterIndex !== undefined) {
        // Only update if the highlighting state is different
        if (highlightedPersonaIndex !== newState.highlightedPersonaIndex || selectedChapterIndex !== newState.selectedChapterIndex) {
          highlightedPersonaIndex = newState.highlightedPersonaIndex;
          selectedChapterIndex = newState.selectedChapterIndex;
          console.log('Updated highlighting from storage change:', highlightedPersonaIndex, selectedChapterIndex);
          
          // Update visual state if overlay is visible and in fullscreen mode
          if (overlayDiv && isOverlayVisible && isFullscreenMode) {
            clearChapterSelection();
            updateChapterSelection();
            updatePersonaHighlighting();
          }
        }
      }
    }
  }
});

// Set up automatic URL checking for auto-highlight
setupAutoHighlightNavigation();

// Migrate existing personas to have consistent fallback headshots
function migratePersonaFallbackHeadshots() {
  chrome.storage.local.get(['stories'], (result) => {
    const stories = result.stories || [];
    let needsUpdate = false;
    
    stories.forEach(story => {
      if (story.personas) {
        story.personas.forEach(persona => {
          if (!persona.headshot && !persona.fallbackHeadshot) {
            persona.fallbackHeadshot = getConsistentHeadshot(persona.name);
            needsUpdate = true;
          }
        });
      }
    });
    
    if (needsUpdate) {
      chrome.storage.local.set({ stories });
    }
  });
}

// Run migration
migratePersonaFallbackHeadshots();

// Listen for shortcuts toggle events
document.addEventListener('shortcutsToggle', (e) => {
  shortcutsEnabled = e.detail.enabled;
  
  // Refresh overlay content to show/hide buttons based on new state
  // Only update if overlay is visible and not in fullscreen mode
  if (isOverlayVisible && !isFullscreenMode) {
    updateOverlayContent();
  }
});

// Listen for settings updates
document.addEventListener('settingsUpdated', (e) => {
  const settings = e.detail;
  if (settings.overlayOpacity !== undefined) {
    overlayOpacity = settings.overlayOpacity;
    console.log('Overlay opacity updated:', overlayOpacity);
    
    // Re-inject styles with new opacity if overlay exists
    if (overlayDiv) {
      injectStyles();
    }
  }
  
  if (settings.colorScheme !== undefined) {
    colorScheme = settings.colorScheme;
    console.log('Color scheme updated via settingsUpdated event:', colorScheme);
    
    // Apply new color scheme if overlay exists
    if (overlayDiv) {
      console.log('Overlay exists, applying color scheme');
      applyColorScheme();
    } else {
      console.log('No overlay exists when color scheme updated');
    }
  }
  
  if (settings.showProgressIndicators !== undefined) {
    showProgressIndicators = settings.showProgressIndicators;
    console.log('Show progress indicators updated:', showProgressIndicators);
    
    // Refresh overlay content if it exists to apply the setting
    if (overlayDiv && isOverlayVisible && !isFullscreenMode) {
      updateOverlayContent();
    }
  }
  
  if (settings.autoHighlightChapter !== undefined) {
    autoHighlightChapter = settings.autoHighlightChapter;
    console.log('Auto-highlight chapter updated:', autoHighlightChapter);
    
    // If enabled, check current page URL for matches
    if (autoHighlightChapter) {
      checkCurrentPageForChapterMatch();
    }
  }
  
  if (settings.crossTabChapterSync !== undefined) {
    crossTabChapterSync = settings.crossTabChapterSync;
    console.log('Cross-tab chapter sync updated:', crossTabChapterSync);
    
    // Reload completed chapters if setting changed
    if (crossTabChapterSync) {
      loadCompletedChapters();
    } else {
      // Clear completed chapters if sync is disabled
      completedChapters = new Set();
      console.log('Cross-tab sync disabled, cleared completed chapters');
      
      // Update visual state if overlay is visible
      if (overlayDiv && isOverlayVisible) {
        updateChapterCompletionVisuals();
      }
    }
  }
  
  if (settings.crossTabHighlightingSync !== undefined) {
    crossTabHighlightingSync = settings.crossTabHighlightingSync;
    console.log('Cross-tab highlighting sync updated:', crossTabHighlightingSync);
    
    // Clear highlighting state if sync is disabled
    if (!crossTabHighlightingSync) {
      highlightedPersonaIndex = -1;
      selectedChapterIndex = -1;
      console.log('Cross-tab highlighting sync disabled, cleared highlighting state');
      
      // Update visual state if overlay is visible
      if (overlayDiv && isOverlayVisible) {
        clearChapterSelection();
        updatePersonaHighlighting();
      }
    }
  }
});

// Listen for shortcuts updates
document.addEventListener('shortcutsUpdated', (e) => {
  const shortcuts = e.detail;
  if (shortcuts.customShortcuts) {
    customShortcuts = shortcuts.customShortcuts;
    console.log('Custom shortcuts updated:', customShortcuts);
  }
});

document.addEventListener("overlayUpdate", (e) => {
  if (!overlayDiv) {
    injectStyles();
    createOverlay();
    applyColorScheme(); // Apply color scheme to new overlay
  }
  
  // Don't update state if we're in the middle of restoring
  if (isRestoringState) {
    console.log('Skipping overlayUpdate during state restoration');
    return;
  }
  
  const { persona, chapter, valueDrivers, personaTitle, headshot, story, personaIndex, chapterIndex, allPersonaChapters, allStoryPersonas, size, position } = e.detail;
  
  // Store current state for navigation
  currentStory = story;
  currentPersona = { name: persona, title: personaTitle, headshot, index: personaIndex };
  currentChapterIndex = chapterIndex;
  allChapters = allPersonaChapters || [];
  allPersonas = allStoryPersonas || [];
  currentPersonaIndex = personaIndex;
  
  // Store size and position for persistence across fullscreen toggles
  if (size) currentOverlaySize = size;
  if (position) currentOverlayPosition = position;
  
  // Use provided headshot, fallback headshot, or consistent headshot based on persona name
  const headshotSrc = headshot || getConsistentHeadshot(persona);
  
  const progressText = showProgressIndicators && allChapters.length > 1 ? `${currentChapterIndex + 1}/${allChapters.length}` : '';
  
  // Apply size and position classes
  const overlayPosition = position || 'bottom-right';
  overlayDiv.className = `size-${size || 'small'} position-${overlayPosition}`;
  
  // Handle special position modes
  if (overlayPosition === 'fullscreen') {
    // Use the same logic as toggleFullscreen() for proper fullscreen mode
    overlayDiv.classList.add('fullscreen');
    isFullscreenMode = true;
    // Clear any size/position classes when entering fullscreen
    overlayDiv.className = 'fullscreen';
    // Show the complete story summary
    showFullscreenSummary();
    return; // Exit early since showFullscreenSummary handles the content
  } else if (overlayPosition === 'pinned-content') {
    // Enter fullscreen mode first, then shift content
    overlayDiv.classList.add('fullscreen');
    isFullscreenMode = true;
    // Clear any size/position classes when entering fullscreen
    overlayDiv.className = 'fullscreen';
    // Shift the content to make room for the overlay
    toggleContentShift();
    // Show the complete story summary
    showFullscreenSummary();
    return; // Exit early since showFullscreenSummary handles the content
  }
  
  // Determine if arrow buttons should be shown (only if there are multiple chapters AND shortcuts are disabled)
  const showArrows = allChapters.length > 1 && !shortcutsEnabled;
  const isFirstChapter = currentChapterIndex === 0;
  const isLastChapter = currentChapterIndex === allChapters.length - 1;
  
  overlayDiv.innerHTML = `
    ${!shortcutsEnabled ? `<button class="expand-button" data-action="expand-overlay" title="Open full-screen view">⛶</button>` : ''}
    ${progressText ? `<div class="progress-indicator">${progressText}</div>` : ''}
    <div class="persona-info">
      <img src="${headshotSrc}" class="persona-headshot" alt="${persona}">
      <div class="persona-details">
        <div class="persona-name">${persona}</div>
        ${personaTitle ? `<div class="persona-title">${personaTitle}</div>` : ''}
      </div>
    </div>
    <div class="chapter" data-action="next-chapter">${chapter}</div>
    <ul class="drivers">
      ${valueDrivers.map(d => `<li>${d}</li>`).join("")}
    </ul>
    ${showArrows ? `
      <div class="arrow-nav">
        <button class="arrow-button" data-action="prev-chapter" title="Previous chapter" ${isFirstChapter ? 'disabled' : ''}>←</button>
        <button class="arrow-button" data-action="next-chapter" title="Next chapter" ${isLastChapter ? 'disabled' : ''}>→</button>
      </div>
    ` : ''}
  `;
  overlayDiv.style.display = "block";
  
  // Update and save state
  isOverlayVisible = true;
  isFullscreenMode = false;
  saveOverlayState();
  
  // Check for auto-highlight if setting is enabled
  if (autoHighlightChapter) {
    checkCurrentPageForChapterMatch();
  }
});

// Navigation functions

function nextChapter() {
  if (allChapters.length <= 1) return;
  // Don't go past the last chapter
  if (currentChapterIndex < allChapters.length - 1) {
    currentChapterIndex = currentChapterIndex + 1;
    updateOverlayContent();
  }
}

function previousChapter() {
  if (allChapters.length <= 1) return;
  // Don't go past the first chapter
  if (currentChapterIndex > 0) {
    currentChapterIndex = currentChapterIndex - 1;
    updateOverlayContent();
  }
}

function nextPersona() {
  if (allPersonas.length <= 1) return;
  currentPersonaIndex = (currentPersonaIndex + 1) % allPersonas.length;
  const persona = allPersonas[currentPersonaIndex];
  currentPersona = { 
    name: persona.name, 
    title: persona.businessTitle, 
    headshot: persona.headshot, 
    index: currentPersonaIndex 
  };
  currentChapterIndex = 0; // Reset to first chapter of new persona
  allChapters = persona.chapters || [];
  updateOverlayContent();
}

function previousPersona() {
  if (allPersonas.length <= 1) return;
  currentPersonaIndex = currentPersonaIndex === 0 ? allPersonas.length - 1 : currentPersonaIndex - 1;
  const persona = allPersonas[currentPersonaIndex];
  currentPersona = { 
    name: persona.name, 
    title: persona.businessTitle, 
    headshot: persona.headshot, 
    index: currentPersonaIndex 
  };
  currentChapterIndex = 0; // Reset to first chapter of new persona
  allChapters = persona.chapters || [];
  updateOverlayContent();
}

function goToChapter(index) {
  if (index >= 0 && index < allChapters.length) {
    currentChapterIndex = index;
    updateOverlayContent();
  }
}

function updateOverlayContent() {
  if (!overlayDiv || !currentStory || !currentPersona || allChapters.length === 0) return;
  
  const chapter = allChapters[currentChapterIndex];
  const headshotSrc = currentPersona.headshot || currentPersona.fallbackHeadshot || getConsistentHeadshot(currentPersona.name);
  
  
  // Simple progress calculation - show current chapter out of total chapters
  const progressText = showProgressIndicators && allChapters.length > 1 ? `${currentChapterIndex + 1}/${allChapters.length}` : '';
  
  // Only apply size and position classes if not in fullscreen mode
  if (!overlayDiv.classList.contains('fullscreen')) {
    overlayDiv.className = `size-${currentOverlaySize} position-${currentOverlayPosition}`;
  }
  
  // Ensure we only show the current chapter, not all chapters
  const chapterTitle = chapter ? chapter.title : 'No chapter';
  const chapterDrivers = chapter ? chapter.valueDrivers : [];
  
  // Determine if arrow buttons should be shown (only if there are multiple chapters AND shortcuts are disabled)
  const showArrows = allChapters.length > 1 && !shortcutsEnabled;
  const isFirstChapter = currentChapterIndex === 0;
  const isLastChapter = currentChapterIndex === allChapters.length - 1;
  
  
  overlayDiv.innerHTML = `
    ${!shortcutsEnabled ? `<button class="expand-button" data-action="expand-overlay" title="Open full-screen view">⛶</button>` : ''}
    ${progressText ? `<div class="progress-indicator">${progressText}</div>` : ''}
    <div class="persona-info">
      <img src="${headshotSrc}" class="persona-headshot" alt="${currentPersona.name}">
      <div class="persona-details">
        <div class="persona-name">${currentPersona.name}</div>
        ${currentPersona.title ? `<div class="persona-title">${currentPersona.title}</div>` : ''}
      </div>
    </div>
    <div class="chapter" data-action="next-chapter">${chapterTitle}</div>
    <ul class="drivers">
      ${chapterDrivers.map(d => `<li>${d}</li>`).join("")}
    </ul>
    ${showArrows ? `
      <div class="arrow-nav">
        <button class="arrow-button" data-action="prev-chapter" title="Previous chapter" ${isFirstChapter ? 'disabled' : ''}>←</button>
        <button class="arrow-button" data-action="next-chapter" title="Next chapter" ${isLastChapter ? 'disabled' : ''}>→</button>
      </div>
    ` : ''}
  `;
}

// Click event handlers
document.addEventListener('click', (e) => {
  if (!overlayDiv || overlayDiv.style.display === 'none') return;
  if (!e.target || typeof e.target.getAttribute !== 'function') return;
  
  const action = e.target.getAttribute('data-action');
  if (action === 'next-chapter') {
    nextChapter();
  } else if (action === 'prev-chapter') {
    previousChapter();
  } else if (action === 'expand-overlay') {
    toggleFullscreen();
  }
});

// Helper function to check if a key combination matches a shortcut
function matchesShortcut(e, shortcutString) {
  if (!shortcutString) return false;
  
  const keys = shortcutString.split('+');
  const modifiers = [];
  let mainKey = '';
  
  // Parse the shortcut string
  keys.forEach(key => {
    const trimmedKey = key.trim();
    if (trimmedKey === 'Ctrl') modifiers.push('ctrlKey');
    else if (trimmedKey === 'Cmd') modifiers.push('metaKey');
    else if (trimmedKey === 'Alt') modifiers.push('altKey');
    else if (trimmedKey === 'Shift') modifiers.push('shiftKey');
    else mainKey = trimmedKey;
  });
  
  // Check modifiers
  for (let modifier of modifiers) {
    if (!e[modifier]) return false;
  }
  
  // Check main key
  if (mainKey) {
    let expectedKey = mainKey;
    if (expectedKey === 'Space') expectedKey = ' ';
    else if (expectedKey === 'Up') expectedKey = 'ArrowUp';
    else if (expectedKey === 'Down') expectedKey = 'ArrowDown';
    else if (expectedKey === 'Left') expectedKey = 'ArrowLeft';
    else if (expectedKey === 'Right') expectedKey = 'ArrowRight';
    
    if (e.key.toLowerCase() !== expectedKey.toLowerCase()) return false;
  }
  
  // Ensure no extra modifiers are pressed
  const allModifiers = ['ctrlKey', 'metaKey', 'altKey', 'shiftKey'];
  for (let modifier of allModifiers) {
    if (e[modifier] && !modifiers.includes(modifier)) return false;
  }
  
  return true;
}

// Helper function to get the shortcut for an action
function getShortcutForAction(action) {
  const defaultShortcuts = {
    'toggle-overlay': 'Shift+H',
    'toggle-fullscreen': 'Shift+O',
    'next-chapter': 'Shift+ArrowRight',
    'prev-chapter': 'Shift+ArrowLeft',
    'next-persona': 'Shift+ArrowDown',
    'prev-persona': 'Shift+ArrowUp',
    'save-url': 'Shift+S',
    'toggle-shift': 'Shift+P'
  };
  
  return customShortcuts[action] || defaultShortcuts[action];
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Escape key always works regardless of shortcuts toggle state
  if (e.key === 'Escape') {
    e.preventDefault();
    destroyOverlay();
    return;
  }
  
  // If overlay was destroyed, disable all shortcuts until overlay is applied again
  if (overlayDestroyed) {
    return;
  }
  
  // Check if shortcuts are enabled
  if (!shortcutsEnabled) {
    return;
  }
  
  // Check for toggle overlay shortcut (works even when overlay is hidden)
  if (matchesShortcut(e, getShortcutForAction('toggle-overlay'))) {
    e.preventDefault();
    if (!overlayDiv) {
      // If overlay doesn't exist, create it and show it
      injectStyles();
      createOverlay();
      overlayDiv.style.display = 'block';
    } else if (overlayDiv.style.display === 'none') {
      // Show overlay
      overlayDiv.style.display = 'block';
    } else {
      // Hide overlay with animation
      hideOverlay();
    }
    return;
  }
  
  // Check for toggle fullscreen shortcut (works even when overlay is hidden)
  if (matchesShortcut(e, getShortcutForAction('toggle-fullscreen'))) {
    e.preventDefault();
    if (!overlayDiv) {
      // If overlay doesn't exist, create it and show it
      injectStyles();
      createOverlay();
      overlayDiv.style.display = 'block';
    } else if (overlayDiv.style.display === 'none') {
      // Show overlay
      overlayDiv.style.display = 'block';
    } else {
      // Toggle fullscreen mode
      toggleFullscreen();
    }
    return;
  }
  
  // Only process other shortcuts if overlay is visible
  if (!overlayDiv || overlayDiv.style.display === 'none') return;
  
  // Check for next chapter shortcut
  if (matchesShortcut(e, getShortcutForAction('next-chapter'))) {
    e.preventDefault();
    nextChapter();
    return;
  }
  
  // Check for previous chapter shortcut
  if (matchesShortcut(e, getShortcutForAction('prev-chapter'))) {
    e.preventDefault();
    previousChapter();
    return;
  }
  
  // Check for next persona shortcut
  if (matchesShortcut(e, getShortcutForAction('next-persona'))) {
    e.preventDefault();
    nextPersona();
    return;
  }
  
  // Check for previous persona shortcut
  if (matchesShortcut(e, getShortcutForAction('prev-persona'))) {
    e.preventDefault();
    previousPersona();
    return;
  }
  
  // Check for save URL shortcut
  if (matchesShortcut(e, getShortcutForAction('save-url'))) {
    e.preventDefault();
    saveCurrentPageUrlToChapter();
    return;
  }
  
  // Check for toggle content pin shortcut (fullscreen only)
  if (matchesShortcut(e, getShortcutForAction('toggle-shift'))) {
    // Only allow content pin in fullscreen mode
    if (overlayDiv && overlayDiv.classList.contains('fullscreen')) {
      e.preventDefault();
      toggleContentShift();
    }
    return;
  }
});

function hideOverlay() {
  if (!overlayDiv) return;
  
  // Add hiding animation class
  overlayDiv.classList.add('hiding');
  
  // Reset content pin state and remove responsive mode
  if (isContentShifted) {
    isContentShifted = false;
    document.body.classList.remove('responsive-mode');
    
    // Reset all dynamic body styles
    document.body.style.marginLeft = '';
    document.body.style.width = '';
    document.documentElement.style.removeProperty('--overlay-width');
  }
  
  // Update state
  isOverlayVisible = false;
  isFullscreenMode = false;
  saveOverlayState();
  
  // Hide after animation completes
  setTimeout(() => {
    overlayDiv.style.display = 'none';
    overlayDiv.classList.remove('hiding');
  }, 300);
}

function destroyOverlay() {
  if (!overlayDiv) return;
  
  // Reset content pin state and remove responsive mode
  if (isContentShifted) {
    isContentShifted = false;
    document.body.classList.remove('responsive-mode');
    
    // Reset all dynamic body styles
    document.body.style.marginLeft = '';
    document.body.style.width = '';
    document.documentElement.style.removeProperty('--overlay-width');
  }
  
  // Remove overlay from DOM
  overlayDiv.remove();
  overlayDiv = null;
  
  // Update state
  isOverlayVisible = false;
  isFullscreenMode = false;
  overlayDestroyed = true; // Disable shortcuts until overlay is applied again
  saveOverlayState();
}

// Restore highlighting in fullscreen mode after content is rendered
function restoreFullscreenHighlighting() {
  if (!isFullscreenMode || !overlayDiv) {
    console.log('restoreFullscreenHighlighting: Not in fullscreen mode or overlayDiv missing');
    return;
  }

  console.log('restoreFullscreenHighlighting: highlightedPersonaIndex:', highlightedPersonaIndex, 'selectedChapterIndex:', selectedChapterIndex);
  console.log('restoreFullscreenHighlighting: overlayDiv exists:', !!overlayDiv, 'isFullscreenMode:', isFullscreenMode);

  // Check for URL-based selection first (most recent)
  const urlBasedSelection = localStorage.getItem('urlBasedSelection');
  if (urlBasedSelection) {
    try {
      const selection = JSON.parse(urlBasedSelection);
      const now = Date.now();
      const timeDiff = now - selection.timestamp;
      
      // Only use URL-based selection if it's recent (within 10 seconds)
      if (timeDiff < 10000) {
        console.log('Restoring URL-based selection:', selection.personaIndex, selection.chapterIndex, 'from', timeDiff, 'ms ago');
        
        // Clear any existing highlighting first
        clearChapterSelection();
        
        // Update global variables
        highlightedPersonaIndex = selection.personaIndex;
        selectedChapterIndex = selection.chapterIndex;
        
        // Find the chapter element and highlight it
        const chapterElement = overlayDiv.querySelector(`[data-persona-index="${selection.personaIndex}"][data-chapter-index="${selection.chapterIndex}"]`);
        if (chapterElement) {
          // Add highlighting classes
          chapterElement.classList.add('current-chapter-highlight');
          
          // Also highlight the containing persona
          const personaCard = chapterElement.closest('.persona-card');
          if (personaCard) {
            personaCard.classList.add('current-persona-highlight', 'highlighted');
          }
          
          // Scroll to the chapter
          setTimeout(() => {
            chapterElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }, 100);
          
          console.log('Successfully restored URL-based chapter highlighting');
          
          // Clear the URL-based selection from localStorage after using it
          localStorage.removeItem('urlBasedSelection');
          
          return; // Exit early, we've handled the highlighting
        } else {
          console.log('URL-based chapter element not found for highlighting');
        }
      } else {
        console.log('URL-based selection too old, ignoring:', timeDiff, 'ms');
        // Clear old URL-based selection
        localStorage.removeItem('urlBasedSelection');
      }
    } catch (e) {
      console.log('Error parsing URL-based selection:', e);
      localStorage.removeItem('urlBasedSelection');
    }
  }

  // If there's a selected chapter from large overlay, prioritize it
  if (highlightedPersonaIndex >= 0 && selectedChapterIndex >= 0) {
    console.log('Restoring selected chapter from large overlay:', selectedChapterIndex, 'in persona:', highlightedPersonaIndex);
    
    // Find the chapter element and highlight it
    const chapterElement = overlayDiv.querySelector(`[data-persona-index="${highlightedPersonaIndex}"][data-chapter-index="${selectedChapterIndex}"]`);
    if (chapterElement) {
      // Add highlighting classes
      chapterElement.classList.add('current-chapter-highlight');
      
      // Also highlight the containing persona
      const personaCard = chapterElement.closest('.persona-card');
      if (personaCard) {
        personaCard.classList.add('current-persona-highlight', 'highlighted');
      }
      
      // Scroll to the chapter
      setTimeout(() => {
        chapterElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }, 100);
      
      console.log('Successfully restored chapter highlighting');
    } else {
      console.log('Chapter element not found for highlighting');
    }
  } else {
    // Only highlight current chapter from small overlay if no manual selection exists
    highlightCurrentChapterFromSmallOverlay();
  }
}

// Find and highlight the chapter that contains the given URL
function highlightChapterByUrl(url) {
  if (!allPersonas || !overlayDiv) {
    console.log('highlightChapterByUrl: Missing allPersonas or overlayDiv');
    return;
  }

  console.log('highlightChapterByUrl: Looking for URL:', url);

  // Search through all personas and chapters to find the one with this URL
  for (let personaIndex = 0; personaIndex < allPersonas.length; personaIndex++) {
    const persona = allPersonas[personaIndex];
    if (persona.chapters) {
      for (let chapterIndex = 0; chapterIndex < persona.chapters.length; chapterIndex++) {
        const chapter = persona.chapters[chapterIndex];
        if (chapter.url === url) {
          console.log('highlightChapterByUrl: Found chapter with URL:', persona.name, 'Chapter', chapterIndex + 1);
          
          // Clear any existing selection
          clearChapterSelection();
          
          // Set new selection
          selectedChapterIndex = chapterIndex;
          highlightedPersonaIndex = personaIndex;
          
          console.log('highlightChapterByUrl: Set selectedChapterIndex to:', selectedChapterIndex, 'highlightedPersonaIndex to:', highlightedPersonaIndex);
          
          // Store the URL-based selection in localStorage for immediate persistence
          localStorage.setItem('urlBasedSelection', JSON.stringify({
            personaIndex: personaIndex,
            chapterIndex: chapterIndex,
            url: url,
            timestamp: Date.now()
          }));
          
          // Update visual highlighting if in fullscreen mode
          if (isFullscreenMode) {
            // Find the chapter element and highlight it directly
            const chapterElement = overlayDiv.querySelector(`[data-persona-index="${personaIndex}"][data-chapter-index="${chapterIndex}"]`);
            if (chapterElement) {
              chapterElement.classList.add('current-chapter-highlight');
              
              // Also highlight the containing persona
              const personaCard = chapterElement.closest('.persona-card');
              if (personaCard) {
                personaCard.classList.add('current-persona-highlight', 'highlighted');
              }
              
              console.log('Successfully highlighted chapter from URL click');
            }
            
            updateChapterSelection();
            updatePersonaHighlighting();
          }
          
          return; // Found and highlighted, exit function
        }
      }
    }
  }
  
  console.log('highlightChapterByUrl: No chapter found with URL:', url);
}

// URL button handler
function handleUrlButtonClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const url = e.target.getAttribute('data-url');
  if (!url) return;
  
  // Find the chapter that contains this URL button by traversing the DOM
  const chapterItem = e.target.closest('.chapter-item');
  if (chapterItem && typeof chapterItem.getAttribute === 'function') {
    const personaIndex = parseInt(chapterItem.getAttribute('data-persona-index'));
    const chapterIndex = parseInt(chapterItem.getAttribute('data-chapter-index'));
    
    console.log('URL clicked in chapter:', personaIndex, chapterIndex, 'URL:', url);
    
    // Clear any existing selection
    clearChapterSelection();
    
    // Set new selection
    selectedChapterIndex = chapterIndex;
    highlightedPersonaIndex = personaIndex;
    
    console.log('Set selectedChapterIndex to:', selectedChapterIndex, 'highlightedPersonaIndex to:', highlightedPersonaIndex);
    
    // Store the URL-based selection in localStorage for immediate persistence
    localStorage.setItem('urlBasedSelection', JSON.stringify({
      personaIndex: personaIndex,
      chapterIndex: chapterIndex,
      url: url,
      timestamp: Date.now()
    }));
    
    // Update visual highlighting if in fullscreen mode
    if (isFullscreenMode) {
      // Find the chapter element and highlight it directly
      const chapterElement = overlayDiv.querySelector(`[data-persona-index="${personaIndex}"][data-chapter-index="${chapterIndex}"]`);
      if (chapterElement) {
        chapterElement.classList.add('current-chapter-highlight');
        
        // Also highlight the containing persona
        const personaCard = chapterElement.closest('.persona-card');
        if (personaCard) {
          personaCard.classList.add('current-persona-highlight', 'highlighted');
        }
        
        console.log('Successfully highlighted chapter from URL click');
      }
      
      updateChapterSelection();
      updatePersonaHighlighting();
    }
  } else {
    console.log('Could not find chapter item for URL button click');
    return;
  }
  
  // Ensure overlay is visible before saving state
  if (!isOverlayVisible) {
    isOverlayVisible = true;
    console.log('Setting isOverlayVisible to true for URL navigation');
  }
  
  // Save current state before navigation with a small delay to ensure it's saved
  saveOverlayState();
  
  // Add a small delay to ensure state is saved before navigation
  setTimeout(() => {
    // Check if Cmd (Mac) or Ctrl (Windows/Linux) is pressed
    if (e.metaKey || e.ctrlKey) {
      // Open in new tab
      window.open(url, '_blank');
    } else {
      // Navigate current page
      window.location.href = url;
    }
  }, 100);
}

// Update visual highlighting of personas in large overlay
function updatePersonaHighlighting() {
  if (!overlayDiv || !isFullscreenMode) {
    console.log('updatePersonaHighlighting: overlayDiv or isFullscreenMode not available');
    return;
  }
  
  console.log('updatePersonaHighlighting: highlightedPersonaIndex =', highlightedPersonaIndex);
  
  // Remove highlighting from all personas and add not-highlighted class
  const allPersonaCards = overlayDiv.querySelectorAll('.persona-card');
  console.log('Found', allPersonaCards.length, 'persona cards');
  allPersonaCards.forEach(card => {
    card.classList.remove('highlighted');
    card.classList.add('not-highlighted');
  });
  
  // Add highlighting to the selected persona
  if (highlightedPersonaIndex >= 0) {
    const selectedPersonaCard = overlayDiv.querySelector(`[data-persona-index="${highlightedPersonaIndex}"]`);
    if (selectedPersonaCard) {
      selectedPersonaCard.classList.add('highlighted');
      selectedPersonaCard.classList.remove('not-highlighted');
      console.log('Added highlighting to persona card with index', highlightedPersonaIndex);
    } else {
      console.log('Could not find persona card with index', highlightedPersonaIndex);
    }
  } else {
    console.log('No persona selected (highlightedPersonaIndex < 0)');
    // If no persona is selected, remove not-highlighted class from all
    allPersonaCards.forEach(card => {
      card.classList.remove('not-highlighted');
    });
  }
}

// Update visual selection of chapters in large overlay
function updateChapterSelection() {
  if (!overlayDiv || !isFullscreenMode) return;
  
  // Remove selected class from all chapters
  const allChapterItems = overlayDiv.querySelectorAll('.chapter-item');
  allChapterItems.forEach(item => {
    item.classList.remove('selected');
  });
  
  // Add selected class to the current selection
  if (highlightedPersonaIndex >= 0 && selectedChapterIndex >= 0) {
    const selectedChapterItem = overlayDiv.querySelector(`[data-persona-index="${highlightedPersonaIndex}"][data-chapter-index="${selectedChapterIndex}"]`);
    if (selectedChapterItem) {
      selectedChapterItem.classList.add('selected');
    }
  }
}

// Save URL to first chapter of selected persona in large overlay
function saveUrlToFirstChapterOfPersona(url) {
  if (highlightedPersonaIndex < 0 || !allPersonas) {
    console.log('No selected persona in large overlay');
    return;
  }
  
  const selectedPersona = allPersonas[highlightedPersonaIndex];
  if (!selectedPersona || !selectedPersona.chapters || selectedPersona.chapters.length === 0) {
    console.log('Selected persona has no chapters');
    return;
  }
  
  const firstChapter = selectedPersona.chapters[0];
  firstChapter.url = url;
  
  // Save to storage
  chrome.storage.local.get(['stories'], (result) => {
    const stories = result.stories || [];
    const storyIndex = stories.findIndex(story => story.name === currentStory);
    
    if (storyIndex !== -1) {
      const personaIndex = stories[storyIndex].personas.findIndex(persona => 
        persona.name === selectedPersona.name
      );
      
      if (personaIndex !== -1 && stories[storyIndex].personas[personaIndex].chapters.length > 0) {
        stories[storyIndex].personas[personaIndex].chapters[0].url = url;
        
        chrome.storage.local.set({ stories }, () => {
          console.log('URL saved to first chapter of selected persona:', url);
          showUrlSavedNotification(`URL saved to ${selectedPersona.name} - ${firstChapter.title}!`);
        });
      }
    }
  });
}

// Save URL to selected chapter in large overlay
function saveUrlToSelectedChapter(url) {
  if (highlightedPersonaIndex < 0 || selectedChapterIndex < 0 || !allPersonas) {
    console.log('No selected chapter in large overlay');
    return;
  }
  
  const selectedPersona = allPersonas[highlightedPersonaIndex];
  if (!selectedPersona || !selectedPersona.chapters || selectedChapterIndex >= selectedPersona.chapters.length) {
    console.log('Invalid selected chapter');
    return;
  }
  
  const selectedChapter = selectedPersona.chapters[selectedChapterIndex];
  selectedChapter.url = url;
  
  // Save to storage
  chrome.storage.local.get(['stories'], (result) => {
    const stories = result.stories || [];
    const storyIndex = stories.findIndex(story => story.name === currentStory);
    
    if (storyIndex !== -1) {
      const personaIndex = stories[storyIndex].personas.findIndex(persona => 
        persona.name === selectedPersona.name
      );
      
      if (personaIndex !== -1 && selectedChapterIndex < stories[storyIndex].personas[personaIndex].chapters.length) {
        stories[storyIndex].personas[personaIndex].chapters[selectedChapterIndex].url = url;
        
        chrome.storage.local.set({ stories }, () => {
          console.log('URL saved to selected chapter:', url);
          showUrlSavedNotification(`URL saved to ${selectedPersona.name} - ${selectedChapter.title}!`);
        });
      }
    }
  });
}

// Save current page URL to current chapter
function saveCurrentPageUrlToChapter() {
  const currentUrl = window.location.href;
  
  // Check if we're in large overlay mode with a selected persona
  if (isFullscreenMode && highlightedPersonaIndex >= 0) {
    if (selectedChapterIndex >= 0) {
      console.log('Saving URL to selected chapter in large overlay');
      saveUrlToSelectedChapter(currentUrl);
    } else {
      console.log('Saving URL to first chapter of selected persona in large overlay');
      saveUrlToFirstChapterOfPersona(currentUrl);
    }
    return;
  }
  
  // Small overlay mode - use current chapter
  if (!currentStory || !currentPersona || !allChapters || allChapters.length === 0) {
    console.log('No current chapter available to save URL to');
    return;
  }
  
  const currentChapter = allChapters[currentChapterIndex];
  
  if (!currentChapter) {
    console.log('No current chapter found');
    return;
  }
  
  // Update the chapter URL
  currentChapter.url = currentUrl;
  
  // Save to storage
  chrome.storage.local.get(['stories'], (result) => {
    const stories = result.stories || [];
    const storyIndex = stories.findIndex(story => story.name === currentStory);
    
    if (storyIndex !== -1) {
      const personaIndex = stories[storyIndex].personas.findIndex(persona => 
        persona.name === currentPersona.name
      );
      
      if (personaIndex !== -1) {
        const chapterIndex = stories[storyIndex].personas[personaIndex].chapters.findIndex(chapter => 
          chapter.title === currentChapter.title
        );
        
        if (chapterIndex !== -1) {
          stories[storyIndex].personas[personaIndex].chapters[chapterIndex].url = currentUrl;
          
          chrome.storage.local.set({ stories }, () => {
            console.log('URL saved to current chapter:', currentUrl);
            showUrlSavedNotification();
          });
        }
      }
    }
  });
}

// Show notification when URL is saved
function showUrlSavedNotification(message = 'URL saved to current chapter!') {
  // Create a temporary notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #63DF4E 0%, #52B8FF 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000000;
    animation: slideInRight 0.3s ease;
  `;
  
  notification.textContent = message;
  
  // Add animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 300);
  }, 3000);
}

function showFullscreenSummary() {
  console.log('showFullscreenSummary called - overlayDiv:', !!overlayDiv, 'currentStory:', currentStory, 'allPersonas length:', allPersonas ? allPersonas.length : 'null');
  if (!overlayDiv || !currentStory || !allPersonas) {
    console.log('showFullscreenSummary early return - missing required data');
    return;
  }
  
  // Ensure completed chapters are loaded from localStorage
  loadCompletedChapters();
  
  const storyName = (typeof currentStory === 'string') ? currentStory : (currentStory ? currentStory.name : 'Demo Story');
  
  const personasHTML = allPersonas.map(persona => {
    const headshotSrc = persona.headshot || persona.fallbackHeadshot || getConsistentHeadshot(persona.name);
    const personaTitle = persona.businessTitle || persona.title || '';
    
    const chaptersHTML = persona.chapters.map((chapter, index) => {
      const chapterId = `${persona.name}-${chapter.title}`;
      const isCompleted = completedChapters.has(chapterId);
      const valueDriversHTML = chapter.valueDrivers.map(driver => 
        `<li>${driver}</li>`
      ).join('');
      
      const urlButton = (chapter.url && chapter.url.trim()) ? 
        `<button class="url-button" data-url="${chapter.url}" title="Open URL (Cmd+click for new tab)">↗</button>` : '';
      
      const isSelected = highlightedPersonaIndex === allPersonas.findIndex(p => p.name === persona.name) && selectedChapterIndex === index;
      
      return `
        <div class="chapter-item ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" data-persona-index="${allPersonas.findIndex(p => p.name === persona.name)}" data-chapter-index="${index}">
          <div class="chapter-header">
            <input type="checkbox" class="chapter-checkbox" data-chapter-id="${chapterId}" ${isCompleted ? 'checked' : ''}>
            <div class="chapter-title">${chapter.title}</div>
            ${urlButton}
          </div>
          <ul class="drivers-list">
            ${valueDriversHTML}
          </ul>
        </div>
      `;
    }).join('');
    
    return `
      <div class="persona-card" data-persona-index="${allPersonas.findIndex(p => p.name === persona.name)}" data-persona-name="${persona.name}">
        <div class="persona-header">
          <img src="${headshotSrc}" class="persona-headshot" alt="${persona.name}">
          <div>
            <div class="persona-name">${persona.name}</div>
            ${personaTitle ? `<div class="persona-title">${personaTitle}</div>` : ''}
          </div>
        </div>
        <div class="chapters-list">
          ${chaptersHTML}
        </div>
      </div>
    `;
  }).join('');
  
  overlayDiv.innerHTML = `
    <div class="story-summary">
      <div class="header-row">
        <img src="${chrome.runtime.getURL('icons/logo-solo.png')}" alt="Logo" class="header-logo">
        <div class="button-group">
          <button class="control-btn" id="shiftContentToggle" title="Pin content">⌕</button>
          <button class="control-btn" id="backButton" title="Minimize overlay">−</button>
        </div>
      </div>
      <h1 class="story-title">${storyName}</h1>
      <div class="personas-grid">
        ${personasHTML}
      </div>
    </div>
  `;
  
  // Remove any existing event listeners to prevent duplicates
  overlayDiv.removeEventListener('change', handleCheckboxChange);
  overlayDiv.removeEventListener('click', handleChapterClick);
  
  // Add event listeners for checkboxes using event delegation
  overlayDiv.addEventListener('change', handleCheckboxChange);
  overlayDiv.addEventListener('click', handleChapterClick);
  overlayDiv.addEventListener('click', handlePersonaClick);
  
  // Add event listener for back button
  const backButton = overlayDiv.querySelector('#backButton');
  if (backButton) {
    backButton.addEventListener('click', toggleFullscreen);
  }
  
  // Add event listener for pin content toggle
  const shiftContentToggle = overlayDiv.querySelector('#shiftContentToggle');
  if (shiftContentToggle) {
    shiftContentToggle.addEventListener('click', toggleContentShift);
  }
  
  // Add event listeners for URL buttons
  const urlButtons = overlayDiv.querySelectorAll('.url-button');
  urlButtons.forEach(button => {
    button.addEventListener('click', handleUrlButtonClick);
  });
  
  // Set initial button state
  updateShiftContentButton();
  
  // Update persona and chapter selection if there's a selection
  console.log('Calling updatePersonaHighlighting from showFullscreenSummary');
  updatePersonaHighlighting();
  console.log('Calling updateChapterSelection from showFullscreenSummary');
  updateChapterSelection();
  
  // Highlight and scroll to current chapter from small overlay
  highlightCurrentChapterFromSmallOverlay();
}

// Persona highlighting functions
function highlightPersona(personaIndex) {
  // Clear any existing highlighting
  clearPersonaHighlighting();
  
  // Set the new highlighted persona
  highlightedPersonaIndex = personaIndex;
  
  // Get all persona cards
  const personaCards = overlayDiv.querySelectorAll('.persona-card');
  
  personaCards.forEach((card, index) => {
    if (index === personaIndex) {
      // Highlight the selected persona
      card.classList.add('highlighted');
    } else {
      // Grey out all other personas
      card.classList.add('greyed-out');
    }
  });
  
  console.log('Highlighted persona index:', personaIndex);
}

function clearPersonaHighlighting() {
  // Clear highlighting from all persona cards
  const personaCards = overlayDiv.querySelectorAll('.persona-card');
  personaCards.forEach(card => {
    card.classList.remove('highlighted', 'greyed-out', 'current-persona-highlight');
  });
  
  // Clear current chapter highlighting from large overlay
  const chapterItems = overlayDiv.querySelectorAll('.chapter-item');
  chapterItems.forEach(item => {
    item.classList.remove('current-chapter-highlight');
  });
  
  // Reset highlighted persona index
  highlightedPersonaIndex = -1;
  
  console.log('Cleared persona highlighting');
}

function clearChapterSelection() {
  // Clear selected class from all chapters
  const chapterItems = overlayDiv.querySelectorAll('.chapter-item');
  chapterItems.forEach(item => {
    item.classList.remove('selected', 'current-chapter-highlight');
  });
  
  // Also clear current persona highlighting
  const personaCards = overlayDiv.querySelectorAll('.persona-card');
  personaCards.forEach(card => {
    card.classList.remove('current-persona-highlight');
  });
  
  console.log('Cleared chapter selection');
}

// Highlight current chapter from small overlay when opening large overlay
function highlightCurrentChapterFromSmallOverlay() {
  if (!overlayDiv || !isFullscreenMode || !currentPersona || !allPersonas) {
    console.log('highlightCurrentChapterFromSmallOverlay: Missing required data');
    return;
  }
  
  console.log('highlightCurrentChapterFromSmallOverlay: currentPersona:', currentPersona.name, 'currentChapterIndex:', currentChapterIndex);
  
  // Clear any existing manual selections first
  clearChapterSelection();
  
  // Find the persona index in the large overlay
  const personaIndex = allPersonas.findIndex(p => p.name === currentPersona.name);
  if (personaIndex === -1) {
    console.log('highlightCurrentChapterFromSmallOverlay: Persona not found in large overlay');
    return;
  }
  
  // Find the chapter element in the large overlay
  const chapterElement = overlayDiv.querySelector(`[data-persona-index="${personaIndex}"][data-chapter-index="${currentChapterIndex}"]`);
  if (!chapterElement) {
    console.log('highlightCurrentChapterFromSmallOverlay: Chapter element not found');
    return;
  }
  
  console.log('highlightCurrentChapterFromSmallOverlay: Found chapter element, highlighting and scrolling');
  
  // Add highlighting class (permanent)
  chapterElement.classList.add('current-chapter-highlight');
  
  // Also highlight the containing persona and set it as the highlighted persona
  const personaCard = chapterElement.closest('.persona-card');
  if (personaCard) {
    personaCard.classList.add('current-persona-highlight', 'highlighted');
    // Set this as the highlighted persona for proper styling
    highlightedPersonaIndex = personaIndex;
    selectedChapterIndex = currentChapterIndex;
  }
  
  // Scroll to the chapter element
  setTimeout(() => {
    chapterElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'nearest'
    });
  }, 100);
}

// Event handler functions
function handleCheckboxChange(e) {
  if (e.target.classList.contains('chapter-checkbox')) {
    const chapterId = e.target.getAttribute('data-chapter-id');
    console.log('Checkbox changed for chapter:', chapterId);
    toggleChapterCompletion(chapterId);
    
    // Prevent the checkbox click from bubbling up to persona click handler
    e.stopPropagation();
  }
}

function handleChapterClick(e) {
  if (!e.target || typeof e.target.classList !== 'object' || typeof e.target.closest !== 'function') return;
  
  // Allow checkbox clicks even when content is pinned
  if (e.target.classList.contains('chapter-checkbox')) {
    return; // Let the checkbox change handler deal with this
  }
  
  const chapterItem = e.target.closest('.chapter-item');
  if (chapterItem && typeof chapterItem.getAttribute === 'function') {
    const personaIndex = parseInt(chapterItem.getAttribute('data-persona-index'));
    const chapterIndex = parseInt(chapterItem.getAttribute('data-chapter-index'));
    
    // Track selected chapter for Shift+S (both fullscreen and pinned content modes)
    if (isFullscreenMode) {
      // Clear previous chapter highlighting (both manual and current)
      clearChapterSelection();
      
      // Set new selection
      selectedChapterIndex = chapterIndex;
      highlightedPersonaIndex = personaIndex;
      
      console.log('Selected chapter for Shift+S:', chapterIndex, 'in persona:', personaIndex);
      console.log('isContentShifted:', isContentShifted, 'isFullscreenMode:', isFullscreenMode);
      
      // If we're in pinned content view, also update the small overlay variables
      if (isContentShifted && allPersonas && allPersonas[personaIndex]) {
        const selectedPersona = allPersonas[personaIndex];
        currentPersonaIndex = personaIndex;
        currentChapterIndex = chapterIndex;
        currentPersona = { 
          name: selectedPersona.name, 
          title: selectedPersona.businessTitle || selectedPersona.title, 
          headshot: selectedPersona.headshot,
          index: personaIndex 
        };
        allChapters = selectedPersona.chapters || [];
        
        console.log('Updated small overlay variables for pinned content view:', selectedPersona.name, '- Chapter', chapterIndex + 1);
      }
      
      updateChapterSelection();
      updatePersonaHighlighting();
      saveOverlayState(); // Save the selection
    } else if (isContentShifted) {
      // When content is pinned (small overlay), also track selection for persistence
      selectedChapterIndex = chapterIndex;
      highlightedPersonaIndex = personaIndex;
      
      // Update the current persona and chapter for the small overlay
      if (allPersonas && allPersonas[personaIndex]) {
        const selectedPersona = allPersonas[personaIndex];
        currentPersonaIndex = personaIndex;
        currentChapterIndex = chapterIndex;
        currentPersona = { 
          name: selectedPersona.name, 
          title: selectedPersona.businessTitle || selectedPersona.title, 
          headshot: selectedPersona.headshot,
          index: personaIndex 
        };
        allChapters = selectedPersona.chapters || [];
        
        console.log('Updated small overlay to selected chapter:', selectedPersona.name, '- Chapter', chapterIndex + 1);
        
        // Update the small overlay display to reflect the selected chapter
        setTimeout(() => {
          updateOverlayContent();
        }, 50);
      }
      
      console.log('Selected chapter in pinned content mode:', chapterIndex, 'in persona:', personaIndex);
      saveOverlayState(); // Save the selection
    }
    
    // Don't allow chapter navigation when content is pinned (fixed overlay mode)
    if (isContentShifted) return;
    
    navigateToChapter(personaIndex, chapterIndex);
    
    // Prevent the chapter click from bubbling up to persona click handler
    e.stopPropagation();
  }
}

function handlePersonaClick(e) {
  console.log('handlePersonaClick called, isFullscreenMode:', isFullscreenMode, 'isContentShifted:', isContentShifted);
  
  if (!e.target || typeof e.target.classList !== 'object' || typeof e.target.closest !== 'function') return;
  
  // Don't handle persona clicks if it's a checkbox or chapter click
  if (e.target.classList.contains('chapter-checkbox') || e.target.closest('.chapter-item')) {
    console.log('Persona click ignored - checkbox or chapter click');
    return;
  }
  
  const personaCard = e.target.closest('.persona-card');
  if (personaCard && typeof personaCard.getAttribute === 'function') {
    const personaIndex = parseInt(personaCard.getAttribute('data-persona-index'));
    const personaName = personaCard.getAttribute('data-persona-name');
    
    console.log('Persona clicked:', personaName, 'Index:', personaIndex);
    
    // In large overlay mode, handle persona selection for Shift+S
    if (isFullscreenMode) {
      highlightedPersonaIndex = personaIndex;
      selectedChapterIndex = -1; // Reset chapter selection when persona changes
      console.log('Selected persona for Shift+S:', personaIndex, 'Reset chapter selection');
      updatePersonaHighlighting();
      updateChapterSelection();
      saveOverlayState();
      return;
    }
    
    // Only work when content is pinned (fixed overlay mode) for small overlay
    if (!isContentShifted) return;
    
    // Toggle highlighting
    if (highlightedPersonaIndex === personaIndex) {
      // Clicking the same persona - remove highlighting
      clearPersonaHighlighting();
    } else {
      // Clicking a different persona - highlight it
      highlightPersona(personaIndex);
    }
  }
}

function navigateToChapter(personaIndex, chapterIndex) {
  if (!allPersonas || personaIndex < 0 || chapterIndex < 0) return;
  
  // Update current persona and chapter
  currentPersonaIndex = personaIndex;
  currentChapterIndex = chapterIndex;
  
  const persona = allPersonas[personaIndex];
  currentPersona = { 
    name: persona.name, 
    title: persona.businessTitle || persona.title, 
    headshot: persona.headshot, 
    index: personaIndex 
  };
  
  // Update allChapters to the new persona's chapters
  allChapters = persona.chapters;
  
  // Exit fullscreen mode
  overlayDiv.classList.remove('fullscreen');
  
  // Update the overlay content with the selected chapter
  updateOverlayContent();
  
  console.log(`Navigated to ${persona.name} - Chapter ${chapterIndex + 1}`);
  console.log('Updated allChapters to:', allChapters);
}

function toggleChapterCompletion(chapterId) {
  console.log('Toggling chapter completion for:', chapterId);
  console.log('Current completed chapters before toggle:', [...completedChapters]);
  
  if (completedChapters.has(chapterId)) {
    completedChapters.delete(chapterId);
    console.log('Removed from completed chapters');
  } else {
    completedChapters.add(chapterId);
    console.log('Added to completed chapters');
  }
  
  console.log('Current completed chapters after toggle:', [...completedChapters]);
  
  // Save to Chrome storage immediately
  saveCompletedChapters();
  
  // Update the visual state in the fullscreen view immediately
  updateChapterCompletionVisuals();
  
  console.log('Chapter completion toggled and saved immediately');
}

// Update visual state of all chapter checkboxes and completion classes
function updateChapterCompletionVisuals() {
  // Update all chapter checkboxes
  const checkboxes = document.querySelectorAll('.chapter-checkbox');
  checkboxes.forEach(checkbox => {
    const chapterId = checkbox.getAttribute('data-chapter-id');
    const isCompleted = completedChapters.has(chapterId);
    checkbox.checked = isCompleted;
    
    // Update the parent chapter item's completed class
    const chapterItem = checkbox.closest('.chapter-item');
    if (chapterItem) {
      if (isCompleted) {
        chapterItem.classList.add('completed');
      } else {
        chapterItem.classList.remove('completed');
      }
    }
  });
  
  console.log('Updated chapter completion visuals for all chapters');
}

// Content shift functionality
let isContentShifted = false;

// Store current size and position to persist across fullscreen toggles
let currentOverlaySize = 'small';
let currentOverlayPosition = 'bottom-right';

// Persona highlighting
let highlightedPersonaIndex = -1; // -1 means no persona highlighted

function toggleContentShift() {
  isContentShifted = !isContentShifted;
  
  if (isContentShifted) {
    document.body.classList.add('responsive-mode');
    // Update content pin with current overlay width
    const currentWidth = overlayDiv ? overlayDiv.getBoundingClientRect().width : 400;
    updateContentShift(currentWidth);
    console.log('Content will be pinned to make room for overlay');
  } else {
    document.body.classList.remove('responsive-mode');
    // Reset body styles when exiting responsive mode
    document.body.style.marginLeft = '';
    document.body.style.width = '';
    console.log('Overlay only - content stays in place');
  }
  
  updateShiftContentButton();
  saveOverlayState();
}

function updateShiftContentButton() {
  const shiftContentToggle = overlayDiv?.querySelector('#shiftContentToggle');
  
  if (shiftContentToggle) {
    if (isContentShifted) {
      shiftContentToggle.classList.add('active');
      shiftContentToggle.textContent = '⌕';
    } else {
      shiftContentToggle.classList.remove('active');
      shiftContentToggle.textContent = '⌕';
    }
  }
}

// Reset content pin when exiting fullscreen
function toggleFullscreen() {
  if (!overlayDiv) return;
  
  if (overlayDiv.classList.contains('fullscreen')) {
    // Exit fullscreen
    console.log('Exiting fullscreen mode');
    console.log('Before exit - currentChapterIndex:', currentChapterIndex);
    console.log('Before exit - allChapters length:', allChapters.length);
    console.log('Before exit - currentPersona:', currentPersona);
    console.log('Before exit - isContentShifted:', isContentShifted);
    
    // Check if we were in pinned content view BEFORE resetting flags
    const wasInShiftedContent = isContentShifted;
    
    overlayDiv.classList.remove('fullscreen');
    document.body.classList.remove('responsive-mode');
    
    // Reset all dynamic body styles when exiting fullscreen
    document.body.style.marginLeft = '';
    document.body.style.width = '';
    document.documentElement.style.removeProperty('--overlay-width');
    
    isFullscreenMode = false;
    isOverlayVisible = true; // Set overlay as visible when exiting fullscreen
    isContentShifted = false; // Reset the flag
    
    if (wasInShiftedContent) {
      console.log('Returning to small overlay from pinned content view');
      console.log('Selected chapter should be:', selectedChapterIndex, 'in persona:', highlightedPersonaIndex);
      
      // Force update the small overlay variables if they weren't updated during chapter selection
      if (highlightedPersonaIndex >= 0 && selectedChapterIndex >= 0 && allPersonas && allPersonas[highlightedPersonaIndex]) {
        const selectedPersona = allPersonas[highlightedPersonaIndex];
        currentPersonaIndex = highlightedPersonaIndex;
        currentChapterIndex = selectedChapterIndex;
        currentPersona = { 
          name: selectedPersona.name, 
          title: selectedPersona.businessTitle || selectedPersona.title, 
          headshot: selectedPersona.headshot,
          index: highlightedPersonaIndex 
        };
        allChapters = selectedPersona.chapters || [];
        
        console.log('Force updated small overlay variables:', selectedPersona.name, '- Chapter', selectedChapterIndex + 1);
      }
    } else {
      console.log('Returning to small overlay from regular fullscreen view');
    }
    
    // Clear persona highlighting when exiting fullscreen
    clearPersonaHighlighting();
    
    // If there's a selected chapter in large overlay, navigate to it
    if (highlightedPersonaIndex >= 0 && selectedChapterIndex >= 0 && allPersonas && allPersonas[highlightedPersonaIndex]) {
      const selectedPersona = allPersonas[highlightedPersonaIndex];
      const selectedChapter = selectedPersona.chapters[selectedChapterIndex];
      
      if (selectedChapter) {
        // Update current persona and chapter to the selected ones
        currentPersonaIndex = highlightedPersonaIndex;
        currentChapterIndex = selectedChapterIndex;
        currentPersona = { 
          name: selectedPersona.name, 
          title: selectedPersona.businessTitle || selectedPersona.title, 
          headshot: selectedPersona.headshot,
          index: highlightedPersonaIndex 
        };
        allChapters = selectedPersona.chapters || [];
        
        console.log('Navigating to selected chapter:', selectedPersona.name, '- Chapter', selectedChapterIndex + 1);
        console.log('Updated currentPersona:', currentPersona);
        console.log('Updated currentChapterIndex:', currentChapterIndex);
        console.log('Updated allChapters length:', allChapters.length);
      }
    } else {
      console.log('No selected chapter found - highlightedPersonaIndex:', highlightedPersonaIndex, 'selectedChapterIndex:', selectedChapterIndex);
    }
    
    // Save state
    saveOverlayState();
    
    console.log('After exit - currentChapterIndex:', currentChapterIndex);
    console.log('After exit - allChapters length:', allChapters.length);
    console.log('Using stored size:', currentOverlaySize, 'position:', currentOverlayPosition);
    
    // Apply the stored size and position classes
    overlayDiv.className = `size-${currentOverlaySize} position-${currentOverlayPosition}`;
    
    // Force a complete reset of the overlay content
    // Clear the overlay first
    overlayDiv.innerHTML = '';
    
    // Then update with current chapter content
    setTimeout(() => {
      console.log('Updating small overlay content after exiting fullscreen');
      console.log('Final currentPersona:', currentPersona);
      console.log('Final currentChapterIndex:', currentChapterIndex);
      console.log('Final allChapters length:', allChapters.length);
      updateOverlayContent();
    }, 50);
  } else {
    // Enter fullscreen (left side panel)
    overlayDiv.classList.add('fullscreen');
    isFullscreenMode = true;
    // Clear any size/position classes when entering fullscreen
    overlayDiv.className = 'fullscreen';
    
    // Restore saved width
    const savedWidth = localStorage.getItem('demoOverlayWidth');
    if (savedWidth) {
      overlayDiv.style.width = savedWidth + 'px';
    }
    
    // Save state when entering fullscreen
    saveOverlayState();
    
    // If we don't have story data, try to load it from storage
    if (!currentStory || !allPersonas || allPersonas.length === 0) {
      chrome.storage.local.get(['stories'], (result) => {
        const stories = result.stories || [];
        if (stories.length > 0) {
          // Use the first story as default
          const story = stories[0];
          currentStory = story; // Store the full story object, not just the name
          allPersonas = story.personas || [];
          showFullscreenSummary();
          // Highlight current chapter from small overlay after content is rendered
          setTimeout(() => {
            highlightCurrentChapterFromSmallOverlay();
          }, 100);
        } else {
          // Show a message if no stories are available
          overlayDiv.innerHTML = `
            <div class="story-summary">
              <div class="header-row">
                <img src="${chrome.runtime.getURL('icons/logo-solo.png')}" alt="Logo" class="header-logo">
                <div class="button-group">
                  <button class="control-btn" id="shiftContentToggle" title="Pin content">⌕</button>
                  <button class="control-btn" id="backButton" title="Minimize overlay">−</button>
                </div>
              </div>
              <h1 class="story-title">No Stories Available</h1>
              <p style="text-align: center; color: rgba(255, 255, 255, 0.7); margin-top: 20px;">
                Please create a story in the extension popup first.
              </p>
            </div>
          `;
          
          // Add event listeners for the buttons
          const backButton = overlayDiv.querySelector('#backButton');
          if (backButton) {
            backButton.addEventListener('click', toggleFullscreen);
          }
          
          const shiftContentToggle = overlayDiv.querySelector('#shiftContentToggle');
          if (shiftContentToggle) {
            shiftContentToggle.addEventListener('click', toggleContentShift);
          }
        }
      });
    } else {
      showFullscreenSummary();
      // Highlight current chapter from small overlay after content is rendered
      setTimeout(() => {
        highlightCurrentChapterFromSmallOverlay();
      }, 100);
      // Save state after showing fullscreen summary
      saveOverlayState();
    }
  }
}

document.addEventListener("overlayClear", () => {
  // Use destroyOverlay instead of hideOverlay to completely remove the overlay
  destroyOverlay();
  document.body.classList.remove('responsive-mode');
  
  // Reset all dynamic body styles
  document.body.style.marginLeft = '';
  document.body.style.width = '';
  document.documentElement.style.removeProperty('--overlay-width');
  
  isContentShifted = false;
});

// Load overlay state when content script starts
// Use a small delay to ensure DOM is ready
setTimeout(() => {
  loadOverlayState();
}, 500);
