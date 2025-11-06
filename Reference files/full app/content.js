let overlayDiv = null;
let currentSessionNotes = []; // Session notes for the current story
let currentStoryIndex = null; // Track current story index for notes
let sessionNotesEscapeHandler = null; // Track escape handler for notes modal

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showSettingsNotification') {
    console.log('Received showSettingsNotification message');
    
    // Check if overlay exists
    const overlayExists = document.querySelector('#demoOverlay');
    if (overlayExists) {
      console.log('Overlay exists, showing notification');
      showSettingsNotification();
      sendResponse({ success: true });
    } else {
      console.log('No overlay found, not showing notification');
      sendResponse({ success: false, reason: 'No overlay found' });
    }
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'showStoryUpdateNotification') {
    console.log('Received showStoryUpdateNotification message');
    
    // Check if overlay exists
    const overlayExists = document.querySelector('#demoOverlay');
    if (overlayExists) {
      console.log('Overlay exists, showing story update notification');
      showStoryUpdateNotification();
      sendResponse({ success: true });
    } else {
      console.log('No overlay found, not showing story update notification');
      sendResponse({ success: false, reason: 'No overlay found' });
    }
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'closeOverlay') {
    console.log('Received closeOverlay message - destroying overlay');
    destroyOverlay();
    sendResponse({ success: true });
    return true;
  }
});

// Function to show the settings notification
function showSettingsNotification() {
  // Remove any existing notifications first
  const existingNotification = document.querySelector('.settings-update-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Show notification to user
  const notification = document.createElement('div');
  notification.className = 'settings-update-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba(231, 76, 60, 0.3);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    animation: slideInRight 0.3s ease-out;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">Settings Updated!</div>
        <div style="font-size: 12px; opacity: 0.9;">Please refresh your browser and reapply the overlay to see changes.</div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        opacity: 0.7;
        transition: opacity 0.2s;
      " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  `;
  
  // Add CSS animation if not already added
  if (!document.querySelector('#settings-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'settings-notification-styles';
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
  }
  
  document.body.appendChild(notification);
  console.log('Settings notification added to page');
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
          console.log('Settings notification auto-removed');
        }
      }, 300);
    }
  }, 10000);
}

// Function to show the story update notification
function showStoryUpdateNotification() {
  // Remove any existing notifications first
  const existingNotification = document.querySelector('.story-update-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Show notification to user
  const notification = document.createElement('div');
  notification.className = 'story-update-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    animation: slideInRight 0.3s ease-out;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      <div>
        <div style="font-weight: 600; margin-bottom: 4px;">Story Updated!</div>
        <div style="font-size: 12px; opacity: 0.9;">Overlay content has been refreshed with the latest changes.</div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        opacity: 0.7;
        transition: opacity 0.2s;
      " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  `;
  
  // Add CSS animation if not already added
  if (!document.querySelector('#story-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'story-notification-styles';
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
  }
  
  document.body.appendChild(notification);
  console.log('Story update notification added to page');
  
  // Automatically refresh overlay content to show new URL buttons and navigation changes
  if (overlayDiv && isOverlayVisible) {
    console.log('Automatically refreshing overlay content after story update');
    if (isFullscreenMode) {
      // Refresh fullscreen overlay to show new URL buttons
      showFullscreenSummary();
    } else {
      // Refresh small overlay to show navigation buttons
      updateOverlayContent();
    }
  }
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
          console.log('Story update notification auto-removed');
        }
      }, 300);
    }
  }, 10000);
}

function createOverlay() {
  overlayDiv = document.createElement("div");
  overlayDiv.id = "demoOverlay";
  document.body.appendChild(overlayDiv);
  
  // Reset destroyed flag when overlay is created
  overlayDestroyed = false;
  
  // Apply color scheme immediately to set CSS variables
  applyColorScheme();
  
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
    const minWidth = minimalPaddingPinned ? 225 : 300; // 25% smaller minimum when minimal padding is enabled
    const maxWidth = window.innerWidth * 0.8; // 80% of viewport width
    
    const constrainedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    overlayDiv.style.width = constrainedWidth + 'px';
    
    // Update content pin if in responsive mode - use actual rendered width
    const actualRenderedWidth = overlayDiv.getBoundingClientRect().width;
    updateContentShift(actualRenderedWidth);
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
    
    // If minimal padding is enabled, also save the reduced width
    if (minimalPaddingPinned && isContentShifted) {
      localStorage.setItem('demoOverlayWidthMinimalPadding', currentWidth);
    }
    
    // Final update to content pin - use actual rendered width
    const actualRenderedWidth = overlayDiv.getBoundingClientRect().width;
    updateContentShift(actualRenderedWidth);
  }
  
  // Also handle window resize to maintain constraints
  window.addEventListener('resize', () => {
    if (overlayDiv && overlayDiv.classList.contains('fullscreen')) {
      const currentWidth = overlayDiv.getBoundingClientRect().width;
      const maxWidth = window.innerWidth * 0.8;
      
      if (currentWidth > maxWidth) {
        overlayDiv.style.width = maxWidth + 'px';
        localStorage.setItem('demoOverlayWidth', maxWidth);
        // Use actual rendered width after CSS transformations
        const actualRenderedWidth = overlayDiv.getBoundingClientRect().width;
        updateContentShift(actualRenderedWidth);
      }
    }
  });
}

// Function to clean up content shift styles
function cleanupContentShift() {
  // Disconnect the mutation observer
  if (contentShiftObserver) {
    contentShiftObserver.disconnect();
    contentShiftObserver = null;
  }
  
  // Clear the interval
  if (contentShiftInterval) {
    clearInterval(contentShiftInterval);
    contentShiftInterval = null;
  }
  
  // Reset html element overflow
  document.documentElement.style.removeProperty('overflow-x');
  document.documentElement.style.removeProperty('--overlay-width');
  
  // Reset body styles
  document.body.style.removeProperty('margin-left');
  document.body.style.removeProperty('width');
  document.body.style.removeProperty('max-width');
  document.body.style.removeProperty('overflow-x');
  document.body.style.removeProperty('box-sizing');
  document.body.style.marginLeft = '';
  document.body.style.width = '';
  document.body.style.maxWidth = '';
  
  // Clean up main container styles
  const mainContainerSelectors = [
    '#page-manager',
    'ytd-app',
    '#content',
    '#container',
    '#main',
    '.main',
    'main',
    '#primary',
    '[role="main"]',
    '#app',
    '.App',
    '#root > div:first-child',
    'ytd-masthead'
  ];
  
  mainContainerSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element && element !== overlayDiv && !element.closest('#demoOverlay') && 
          element.id !== 'sessionNotesModalOverlay' && !element.closest('#sessionNotesModalOverlay')) {
        element.style.marginLeft = '';
        element.style.width = '';
        element.style.maxWidth = '';
        element.style.left = '';
      }
    });
  });
  
  // Clean up all elements that we marked as shifted and restore original left/width values
  const shiftedElements = document.querySelectorAll('[data-demo-overlay-shifted="true"]');
  shiftedElements.forEach(element => {
    if (element !== overlayDiv && !element.closest('#demoOverlay') && 
        element.id !== 'sessionNotesModalOverlay' && !element.closest('#sessionNotesModalOverlay')) {
      
      // Restore original left value if it was stored
      const originalLeft = element.getAttribute('data-original-left');
      if (originalLeft) {
        if (originalLeft === 'auto' || originalLeft === '') {
          element.style.removeProperty('left');
        } else {
          element.style.setProperty('left', originalLeft);
        }
        element.removeAttribute('data-original-left');
      } else {
        element.style.removeProperty('left');
      }
      
      // Restore original width value if it was stored
      const originalWidth = element.getAttribute('data-original-width');
      if (originalWidth) {
        if (originalWidth === 'auto' || originalWidth === '') {
          element.style.removeProperty('width');
          element.style.removeProperty('max-width');
        } else {
          element.style.setProperty('width', originalWidth);
          element.style.removeProperty('max-width');
        }
        element.removeAttribute('data-original-width');
      } else {
        element.style.removeProperty('width');
        element.style.removeProperty('max-width');
      }
      
      // Remove the data attribute
      element.removeAttribute('data-demo-overlay-shifted');
      element.removeAttribute('data-original-transform');
      
      // Remove our styles (removeProperty removes both value and priority)
      element.style.removeProperty('margin-left');
      element.style.removeProperty('box-sizing');
    }
  });
  
  // Also clean up any remaining elements with calc patterns (fallback)
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    if (element !== overlayDiv && !element.closest('#demoOverlay') && 
        element.id !== 'sessionNotesModalOverlay' && !element.closest('#sessionNotesModalOverlay')) {
      // Check if we modified this element (has calc with overlay-width pattern)
      if (element.style.width && element.style.width.includes('calc(100% -')) {
        element.style.removeProperty('width');
        element.style.removeProperty('max-width');
      }
      if (element.style.marginLeft && element.style.marginLeft.includes('px')) {
        element.style.removeProperty('margin-left');
      }
    }
  });
  
  console.log('Demo Overlay: Content shift cleanup complete');
}

// Function to update content pin based on overlay width
// MutationObserver for handling dynamically added content
let contentShiftObserver = null;
let contentShiftInterval = null;

function updateContentShift(overlayWidth) {
  if (document.body.classList.contains('responsive-mode')) {
    // Use the passed width directly
    const widthToUse = overlayWidth;
    
    // Update CSS custom property for dynamic width
    document.documentElement.style.setProperty('--overlay-width', widthToUse + 'px');
    
    // Hybrid approach: constrain body width AND use transform for visual positioning
    // This ensures content is both shifted AND resized properly
    document.documentElement.style.setProperty('overflow-x', 'hidden', 'important');
    document.body.style.setProperty('overflow-x', 'hidden', 'important');
    
    // Set body width to account for overlay - this makes content resize
    document.body.style.setProperty('width', `calc(100vw - ${widthToUse}px)`, 'important');
    document.body.style.setProperty('max-width', `calc(100vw - ${widthToUse}px)`, 'important');
    document.body.style.setProperty('margin-left', `${widthToUse}px`, 'important');
    document.body.style.setProperty('box-sizing', 'border-box', 'important');
    
    // Track which elements we've already processed to avoid duplicates
    const shiftedElements = new Set();
    
    // Find all fixed positioned elements and adjust them
    // These need special handling because they're positioned relative to the viewport
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
      // Skip overlay and its children, and session notes modal
      if (element === overlayDiv || element.closest('#demoOverlay') || 
          element.id === 'sessionNotesModalOverlay' || element.closest('#sessionNotesModalOverlay')) {
        return;
      }
      
      // Skip if already processed
      if (shiftedElements.has(element)) {
        return;
      }
      
      try {
        const computedStyle = window.getComputedStyle(element);
        const position = computedStyle.position;
        
        // Handle fixed positioned elements
        if (position === 'fixed') {
          const left = computedStyle.left;
          const right = computedStyle.right;
          const width = computedStyle.width;
          
          // Store original left and width values if not already stored
          if (!element.hasAttribute('data-original-left')) {
            element.setAttribute('data-original-left', left);
          }
          if (!element.hasAttribute('data-original-width')) {
            element.setAttribute('data-original-width', width);
          }
          
          // Check if element is positioned on the left side or spans full width
          const isLeftPositioned = left !== 'auto' && left !== '';
          const isRightPositioned = right !== 'auto' && right !== '' && right !== '0px';
          const currentWidth = parseFloat(width);
          const isFullWidth = width === '100%' || currentWidth >= window.innerWidth * 0.8;
          
          // Only shift elements that are left-positioned
          // Don't shift elements that are right-positioned (like chat widgets)
          if (isLeftPositioned && !isRightPositioned) {
            // Mark this element as shifted
            element.setAttribute('data-demo-overlay-shifted', 'true');
            
            // Get original left value
            const originalLeft = element.getAttribute('data-original-left');
            const leftValue = parseFloat(originalLeft) || 0;
            
            // Shift the element to the right by the overlay width
            element.style.setProperty('left', `${leftValue + widthToUse}px`, 'important');
            
            // If it's a full-width element, reduce its width to account for the overlay
            if (isFullWidth) {
              element.style.setProperty('width', `calc(100vw - ${widthToUse}px)`, 'important');
              element.style.setProperty('max-width', `calc(100vw - ${widthToUse}px)`, 'important');
              element.style.setProperty('box-sizing', 'border-box', 'important');
            }
            
            shiftedElements.add(element);
          }
        }
      } catch (e) {
        // Ignore errors from cross-origin iframes or other restricted elements
      }
    });
    
    // Set up MutationObserver to watch for dynamically added elements
    setupContentShiftObserver(widthToUse);
    
    // Set up periodic re-check for sites with dynamic layout changes
    setupContentShiftInterval(widthToUse);
  }
}

// Function to apply shifts to elements (extracted for reuse)
function applyShiftToElement(element, widthToUse) {
  if (!element || element === overlayDiv || (element.closest && element.closest('#demoOverlay')) || 
      (element.id === 'sessionNotesModalOverlay') || (element.closest && element.closest('#sessionNotesModalOverlay'))) {
    return false;
  }
  
  try {
    const computedStyle = window.getComputedStyle(element);
    const position = computedStyle.position;
    
    // Only handle fixed positioned elements
    if (position === 'fixed') {
      const left = computedStyle.left;
      const right = computedStyle.right;
      const width = computedStyle.width;
      
      // Store original left and width values if not already stored
      if (!element.hasAttribute('data-original-left')) {
        element.setAttribute('data-original-left', left);
      }
      if (!element.hasAttribute('data-original-width')) {
        element.setAttribute('data-original-width', width);
      }
      
      // Check if element is positioned on the left side or spans full width
      const isLeftPositioned = left !== 'auto' && left !== '';
      const isRightPositioned = right !== 'auto' && right !== '' && right !== '0px';
      const currentWidth = parseFloat(width);
      const isFullWidth = width === '100%' || currentWidth >= window.innerWidth * 0.8;
      
      // Only shift elements that are left-positioned
      // Don't shift elements that are right-positioned (like chat widgets)
      if (isLeftPositioned && !isRightPositioned) {
        element.setAttribute('data-demo-overlay-shifted', 'true');
        
        // Get original left value
        const originalLeft = element.getAttribute('data-original-left');
        const leftValue = parseFloat(originalLeft) || 0;
        
        // Shift the element to the right by the overlay width
        element.style.setProperty('left', `${leftValue + widthToUse}px`, 'important');
        
        // If it's a full-width element, reduce its width to account for the overlay
        if (isFullWidth) {
          element.style.setProperty('width', `calc(100vw - ${widthToUse}px)`, 'important');
          element.style.setProperty('max-width', `calc(100vw - ${widthToUse}px)`, 'important');
          element.style.setProperty('box-sizing', 'border-box', 'important');
        }
        
        return true;
      }
    }
  } catch (e) {
    // Ignore errors from cross-origin iframes or other restricted elements
  }
  
  return false;
}

// Setup interval to periodically re-check and shift elements
function setupContentShiftInterval(widthToUse) {
  // Clear existing interval if any
  if (contentShiftInterval) {
    clearInterval(contentShiftInterval);
  }
  
  // Run every 2 seconds to catch dynamically positioned elements
  contentShiftInterval = setInterval(() => {
    if (!document.body.classList.contains('responsive-mode')) {
      clearInterval(contentShiftInterval);
      contentShiftInterval = null;
      return;
    }
    
    // Check for new fixed/sticky elements that haven't been shifted yet
    const allElements = document.querySelectorAll('*:not([data-demo-overlay-shifted])');
    let shiftedCount = 0;
    
    allElements.forEach(element => {
      if (applyShiftToElement(element, widthToUse)) {
        shiftedCount++;
      }
    });
    
    if (shiftedCount > 0) {
      console.log(`Demo Overlay: Re-checked and shifted ${shiftedCount} new elements`);
    }
  }, 2000);
}

// Function to setup MutationObserver for dynamic content
let observerTimeout = null;
function setupContentShiftObserver(widthToUse) {
  // Disconnect existing observer if any
  if (contentShiftObserver) {
    contentShiftObserver.disconnect();
  }
  
  contentShiftObserver = new MutationObserver((mutations) => {
    // Throttle the observer callback to avoid performance issues
    if (observerTimeout) return;
    
    observerTimeout = setTimeout(() => {
      observerTimeout = null;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          // Only process element nodes
          if (node.nodeType !== 1) return;
          
          // Skip our overlay
          if (node === overlayDiv || (node.closest && node.closest('#demoOverlay'))) return;
          
          // Only check elements that are likely to need shifting
          // This avoids checking every text node and inline element
          const elementsToCheck = [node];
          
          // Only query for specific selectors that are likely to be fixed/sticky
          if (node.querySelectorAll) {
            const targetSelectors = [
              'header', 'nav', '[role="banner"]', '[role="navigation"]',
              '.header', '.navbar', '.nav', '#header', '#navbar',
              '[style*="position"]', // Elements with inline position styles
              'div', 'section', 'aside' // Common containers that might be positioned
            ].join(',');
            
            try {
              const children = node.querySelectorAll(targetSelectors);
              elementsToCheck.push(...children);
            } catch (e) {
              // Ignore selector errors
            }
          }
          
          elementsToCheck.forEach((element) => {
            // Use the shared function to apply shifts
            applyShiftToElement(element, widthToUse);
          });
        });
      });
    }, 100); // 100ms throttle
  });
  
  // Start observing
  contentShiftObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Cache CSS to avoid re-parsing
let cssCache = null;

function injectStyles() {
  if (document.getElementById('demo-overlay-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'demo-overlay-styles';
  
  // Use cached CSS if available
  if (cssCache) {
    style.textContent = cssCache;
    document.head.appendChild(style);
    return;
  }
  
  // Generate and cache CSS
  cssCache = `
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
      border: 1px solid var(--accent-color, rgba(99, 223, 78, 0.3));
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
      width: 320px !important;
      max-width: calc(100vw - 48px) !important;
      font-size: 14px !important;
      padding: 20px 24px !important;
    }

    #demoOverlay.size-large {
      width: 384px !important; /* 480px * 1.2 */
      max-width: calc(100vw - 48px) !important;
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
      color: #e6f3ff;
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
      background: var(--accent-color-bg, rgba(99, 223, 78, 0.2));
      padding: 8px 12px;
      margin: 6px 0;
      border-radius: 8px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.95);
      border-left: 3px solid var(--accent-color-border, rgba(99, 223, 78, 0.6));
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

    /* Screenshot capture button styles */
    #demoOverlay .screenshot-capture-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      padding: 8px 12px;
      margin: 8px 0;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border: none;
      border-radius: 8px;
      color: white;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      backdrop-filter: blur(5px);
      pointer-events: auto;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
    }

    #demoOverlay .screenshot-capture-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
      background: linear-gradient(135deg, #5a5fd8 0%, #7c4fd8 100%);
    }

    #demoOverlay .screenshot-capture-btn:active {
      transform: translateY(0);
    }

    #demoOverlay .screenshot-capture-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    #demoOverlay .screenshot-capture-btn svg {
      width: 14px;
      height: 14px;
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
      padding: 40px 20px;
      overflow-y: auto;
      z-index: 999999;
        background: linear-gradient(135deg, var(--primary-color, rgba(3, 45, 66, ${Math.min(overlayOpacity + 0.1, 1)})) 0%, var(--secondary-color, rgba(118, 97, 255, ${Math.min(overlayOpacity + 0.1, 1)})) 100%);
      backdrop-filter: blur(25px);
      pointer-events: auto;
      resize: horizontal;
      min-width: ${minimalPaddingPinned ? '225px' : '300px'};
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
      width: 4px;
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

    #demoOverlay.fullscreen .control-btn.icon-btn {
      background: transparent;
      border: none;
      padding: 8px;
      opacity: 0.7;
    }

    #demoOverlay.fullscreen .control-btn.icon-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      opacity: 1;
      transform: translateY(-1px);
    }

    #demoOverlay.fullscreen .control-btn.icon-btn svg {
      display: block;
    }

    /* Responsive mode styles */
    :root {
      --overlay-width: 400px;
    }
    
    /* Smooth transitions for the content shift */
    html,
    body {
      transition: margin-left 0.3s ease, width 0.3s ease;
    }
    
    /* When in responsive mode, body is shifted and resized to make room for the pinned overlay */
    body.responsive-mode {
      overflow-x: hidden !important;
    }
    
    /* Ensure HTML element doesn't interfere */
    html {
      overflow-x: hidden !important;
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
      color: #e6f3ff;
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
      grid-template-columns: repeat(auto-fit, minmax(${minimalPaddingPinned ? '225px' : '300px'}, 1fr));
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

    #demoOverlay.fullscreen .persona-card:has(.collapse-btn) .persona-header {
      margin-top: 8px;
    }

    #demoOverlay.fullscreen .persona-header > div:first-of-type {
      flex: 1;
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
      color: #e6f3ff;
      margin: 4px 0 0 0;
    }

    #demoOverlay.fullscreen .collapse-btn {
      position: absolute;
      top: 4px;
      left: 12px;
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      transition: all 0.2s ease;
      pointer-events: auto;
      z-index: 10;
      width: 24px;
      height: 24px;
    }

    #demoOverlay.fullscreen .collapse-btn:hover {
      color: rgba(255, 255, 255, 1);
      transform: scale(1.15);
    }

    #demoOverlay.fullscreen .collapse-btn:active {
      transform: scale(0.9);
    }

    #demoOverlay.fullscreen .collapse-btn.collapsed {
      transform: rotate(180deg);
    }

    #demoOverlay.fullscreen .collapse-btn.collapsed:hover {
      transform: rotate(180deg) scale(1.15);
    }

    #demoOverlay.fullscreen .collapse-btn svg {
      width: 16px;
      height: 16px;
    }

    #demoOverlay.fullscreen .persona-card.collapsed .chapters-list {
      display: none;
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

    #demoOverlay.fullscreen .chapter-item.selected,
    #demoOverlay.fullscreen .chapter-item.current-chapter-highlight {
      background: var(--chapter-highlight-bg, rgba(255, 193, 7, 0.3)) !important;
      border-color: var(--chapter-highlight-border, rgba(255, 193, 7, 0.8)) !important;
      box-shadow: 0 0 0 3px var(--chapter-highlight-shadow, rgba(255, 193, 7, 0.4)) !important;
    }

    #demoOverlay.fullscreen .chapter-item.selected .chapter-title,
    #demoOverlay.fullscreen .chapter-item.current-chapter-highlight .chapter-title {
      color: var(--chapter-highlight-color, #ffc107) !important;
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
      background: var(--accent-color-bg, rgba(99, 223, 78, 0.2));
      padding: 6px 10px;
      margin: 4px 0;
      border-radius: 4px;
      font-size: 12px;
      border-left: 3px solid var(--accent-color-border, rgba(99, 223, 78, 0.6));
    }

    /* Session Notes Modal Styles */
    .session-notes-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      z-index: 10000000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease;
      margin-left: 0 !important;
      margin-right: 0 !important;
      transform: translateX(0) !important;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .session-notes-modal {
      background: linear-gradient(135deg, rgba(3, 45, 66, 0.95) 0%, rgba(118, 97, 255, 0.95) 100%);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      width: 90%;
      max-width: 650px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(99, 223, 78, 0.3);
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .session-notes-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 32px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .session-notes-header h2 {
      margin: 0;
      color: white;
      font-size: 18px;
      font-weight: 500;
    }

    .session-notes-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .clear-all-btn {
      background: #e74c3c;
      border: 1px solid #c0392b;
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .clear-all-btn:hover {
      background: #c0392b;
      border-color: #a93226;
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(231, 76, 60, 0.4);
    }

    .session-notes-close {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      width: 42px;
      height: 42px;
      border-radius: 10px;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .session-notes-close:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(99, 223, 78, 0.5);
      transform: scale(1.05);
    }

    .session-notes-body {
      padding: 26px 32px;
      overflow-y: auto;
      flex: 1;
    }

    .session-notes-list {
      margin-bottom: 26px;
      max-height: 520px;
      overflow-y: auto;
    }

    .session-note-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      margin-bottom: 10px;
      transition: all 0.2s ease;
    }

    .session-note-item:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(99, 223, 78, 0.4);
    }

    .session-note-item.checked {
      opacity: 0.6;
    }

    .session-note-item.checked .note-text {
      text-decoration: line-through;
    }

    .note-checkbox {
      width: 24px;
      height: 24px;
      cursor: pointer;
      accent-color: #63DF4E;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .note-text {
      flex: 1;
      color: white;
      font-size: 14px;
      word-break: break-word;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .note-delete-btn {
      background: #e74c3c;
      border: 1px solid #c0392b;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .note-delete-btn:hover {
      background: #c0392b;
      border-color: #a93226;
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(231, 76, 60, 0.4);
    }

    .note-copy-btn {
      background: rgba(82, 184, 255, 0.1);
      border: 1px solid rgba(82, 184, 255, 0.3);
      color: #52B8FF;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .note-copy-btn:hover {
      background: rgba(82, 184, 255, 0.2);
      border-color: rgba(82, 184, 255, 0.5);
      transform: scale(1.1);
    }

    .note-copy-btn:active {
      transform: scale(0.95);
    }

    .note-copy-btn.copied {
      background: rgba(99, 223, 78, 0.2);
      border-color: rgba(99, 223, 78, 0.5);
      color: #63DF4E;
    }

    .note-actions {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      margin-top: 2px;
    }

    .note-copy-btn svg {
      width: 16px;
      height: 16px;
    }

    .empty-notes {
      text-align: center;
      color: rgba(255, 255, 255, 0.6);
      font-style: italic;
      padding: 52px 26px;
      font-size: 14px;
    }

    .session-notes-input-container {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-top: 20px;
    }

    .session-note-input {
      flex: 1;
      padding: 16px 20px;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      color: white;
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      resize: vertical;
      min-height: 60px;
      max-height: 200px;
      line-height: 1.5;
    }

    .session-note-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .session-note-input:focus {
      border-color: #63DF4E;
      background: rgba(255, 255, 255, 0.15);
    }

    .add-note-btn {
      padding: 16px 26px;
      background: linear-gradient(135deg, #63DF4E 0%, #52B8FF 100%);
      border: none;
      border-radius: 10px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      align-self: flex-start;
      height: fit-content;
    }

    .add-note-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 223, 78, 0.4);
    }

    .add-note-btn:active {
      transform: translateY(0);
    }

    /* Copy notification toast */
    .copy-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 10px;
      box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
      z-index: 10000001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideInFromRight 0.3s ease-out;
    }

    @keyframes slideInFromRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOutToRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .copy-notification svg {
      flex-shrink: 0;
    }

  `;
  
  // Cache the CSS for future use
  style.textContent = cssCache;
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
let currentPersonaIndex = 0;
let currentChapterIndex = 0;
let allChapters = [];
let allPersonas = [];
let completedChapters = new Set(); // Track completed chapters
let isOverlayVisible = false;
let isFullscreenMode = false;
let lastFullscreenMode = 'large'; // Track last fullscreen mode: 'large' or 'pinned'
let isRestoringState = false;
let lastStateSaveTime = 0; // Track when we last saved state to avoid processing our own changes
let selectedChapterIndex = -1; // Track selected chapter in large overlay
let shortcutsEnabled = true; // Track whether shortcuts are enabled
let overlayOpacity = 0.75; // Track overlay opacity setting
let overlayDestroyed = false; // Track if overlay was destroyed (disables shortcuts)
let colorScheme = 'default'; // Track color scheme setting
let customLogo = null; // Track custom logo
let showProgressIndicators = true; // Track show progress indicators setting
let autoHighlightChapter = false; // Track auto-highlight chapter setting
let crossTabChapterSync = true; // Track cross-tab chapter sync setting
let crossTabHighlightingSync = true; // Track cross-tab highlighting sync setting
let crossPersonaNavigation = false; // Track cross-persona navigation setting
let minimalPaddingPinned = false; // Track minimal padding in pinned content setting
let collapseButtonEnabled = true; // Track collapse button setting (default enabled)
let screenshotModeEnabled = false; // Track screenshot mode setting
let customShortcuts = {}; // Track custom keyboard shortcuts
let isCrossPersonaNavigating = false; // Flag to prevent auto-highlight during cross-persona navigation

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
    currentStoryIndex,
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
    lastStateSaveTime = Date.now(); // Track when we saved
    if (crossTabHighlightingSync) {
      console.log('Saved selectedChapterIndex:', state.selectedChapterIndex, 'highlightedPersonaIndex:', state.highlightedPersonaIndex);
    } else {
      console.log('Cross-tab highlighting sync disabled, not saving highlighting state');
    }
  });
}

// Helper function to restore from state object
function restoreFromState(state) {
  if (!state) return;
  
  console.log('Restoring from state:', state);
  
  // Set flag to prevent state from being overwritten
  isRestoringState = true;
  
  // Restore state variables
  isOverlayVisible = state.isOverlayVisible || false;
  isFullscreenMode = state.isFullscreenMode || false;
  currentStory = state.currentStory;
  currentStoryIndex = state.currentStoryIndex || 0;
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
  
  console.log('State restored - isOverlayVisible:', isOverlayVisible, 'isFullscreenMode:', isFullscreenMode, 'isContentShifted:', isContentShifted);
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
}

// Load overlay state from Chrome storage with caching
function loadOverlayState() {
  // Check cache first
  if (overlayStateCache) {
    console.log('Using cached overlay state:', overlayStateCache);
    restoreFromState(overlayStateCache);
    return;
  }
  
  chrome.storage.local.get(['overlayState'], (result) => {
    if (result.overlayState) {
      const state = result.overlayState;
      overlayStateCache = state; // Cache the state
      console.log('Loading overlay state from storage:', state);
      restoreFromState(state);
      
      // Trigger auto-highlight check after state is restored
      setTimeout(() => {
        triggerAutoHighlightCheck();
      }, 1500);
      
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
    
    // Ensure DOM is ready before applying color scheme
    const applyColorSchemeWhenReady = () => {
      if (overlayDiv && overlayDiv.parentNode && document.readyState === 'complete') {
        applyColorScheme();
      } else {
        setTimeout(applyColorSchemeWhenReady, 50);
      }
    };
    
    setTimeout(applyColorSchemeWhenReady, 100);
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
      loadStoriesData(() => {
        showFullscreenSummary();
        // Restore highlighting after content is rendered
        setTimeout(() => {
          restoreFullscreenHighlighting();
        }, 100);
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

// Individual setting loaders removed - now using loadAllSettings() for better performance and reliability








function normalizeUrl(url) {
  if (!url) return '';
  
  try {
    // Create URL object to normalize
    const urlObj = new URL(url);
    
    // Remove trailing slash, hash, and common tracking parameters
    let normalizedUrl = urlObj.origin + urlObj.pathname;
    if (normalizedUrl.endsWith('/')) {
      normalizedUrl = normalizedUrl.slice(0, -1);
    }
    
    return normalizedUrl.toLowerCase();
  } catch (e) {
    // If URL parsing fails, just clean up basic issues
    return url.toLowerCase().replace(/\/$/, '').split('#')[0].split('?')[0];
  }
}

function checkCurrentPageForChapterMatch() {
  if (!autoHighlightChapter) {
    console.log('Auto-highlight chapter is disabled');
    return;
  }
  
  // Clear cross-persona navigation flag after a delay to allow URL-based highlighting
  if (isCrossPersonaNavigating) {
    console.log('Cross-persona navigation in progress, checking for URL-based selection');
    
    // Check if we have a URL-based selection that should override cross-persona navigation
    const urlBasedSelection = localStorage.getItem('urlBasedSelection');
    if (urlBasedSelection) {
      try {
        const selection = JSON.parse(urlBasedSelection);
        const now = Date.now();
        const timeDiff = now - selection.timestamp;
        
        // If URL-based selection is recent (within 10 seconds), use it instead
        if (timeDiff < 10000) {
          console.log('Found recent URL-based selection, overriding cross-persona navigation flag');
          isCrossPersonaNavigating = false;
        } else {
          // Clear old URL-based selection
          localStorage.removeItem('urlBasedSelection');
          return;
        }
      } catch (e) {
        console.log('Error parsing URL-based selection:', e);
        return;
      }
    } else {
      return;
    }
  }
  
  // Check if we have any story data at all
  if (!currentStory && (!allPersonas || allPersonas.length === 0)) {
    console.log('No story data available for auto-highlight');
    return;
  }
  
  const currentUrl = normalizeUrl(window.location.href);
  console.log('Checking current page URL for chapter match:', currentUrl);
  
  let matchFound = false;
  let matchingPersonaIndex = -1;
  let matchingChapterIndex = -1;
  let matchingChapter = null;
  
  // Search across all personas and chapters, not just current persona
  if (allPersonas && allPersonas.length > 0) {
    for (let personaIndex = 0; personaIndex < allPersonas.length; personaIndex++) {
      const persona = allPersonas[personaIndex];
      if (persona.chapters && persona.chapters.length > 0) {
        for (let chapterIndex = 0; chapterIndex < persona.chapters.length; chapterIndex++) {
          const chapter = persona.chapters[chapterIndex];
          if (!chapter.url || chapter.url.trim() === '') continue;
          
          const chapterUrl = normalizeUrl(chapter.url);
          console.log(`Comparing: "${currentUrl}" with chapter URL: "${chapterUrl}"`);
          
          // More precise URL matching
          if (currentUrl === chapterUrl || 
              (chapterUrl.length > 10 && currentUrl.includes(chapterUrl)) ||
              (currentUrl.length > 10 && chapterUrl.includes(currentUrl))) {
            
            matchFound = true;
            matchingPersonaIndex = personaIndex;
            matchingChapterIndex = chapterIndex;
            matchingChapter = chapter;
            console.log(`Found matching chapter: "${chapter.title}" in persona "${persona.name}" at indices [${personaIndex}, ${chapterIndex}]`);
            break;
          }
        }
        if (matchFound) break;
      }
    }
  } else if (currentPersona && allChapters && allChapters.length > 0) {
    // Fallback to current persona chapters if allPersonas not available
    for (let chapterIndex = 0; chapterIndex < allChapters.length; chapterIndex++) {
      const chapter = allChapters[chapterIndex];
      if (!chapter.url || chapter.url.trim() === '') continue;
      
      const chapterUrl = normalizeUrl(chapter.url);
      console.log(`Comparing: "${currentUrl}" with chapter URL: "${chapterUrl}"`);
      
      if (currentUrl === chapterUrl || 
          (chapterUrl.length > 10 && currentUrl.includes(chapterUrl)) ||
          (currentUrl.length > 10 && chapterUrl.includes(currentUrl))) {
        
        matchFound = true;
        matchingChapterIndex = chapterIndex;
        matchingChapter = chapter;
        console.log(`Found matching chapter in current persona: "${chapter.title}" at index ${chapterIndex}`);
        break;
      }
    }
  }
  
  if (matchFound) {
    // Update current state
    if (matchingPersonaIndex !== -1) {
      // Switch to the matching persona
      const matchingPersona = allPersonas[matchingPersonaIndex];
      if (currentPersona?.name !== matchingPersona.name) {
        console.log(`Switching to persona: "${matchingPersona.name}"`);
        currentPersona = { 
          name: matchingPersona.name, 
          title: matchingPersona.businessTitle || matchingPersona.title, 
          headshot: matchingPersona.headshot, 
          index: matchingPersonaIndex 
        };
        currentPersonaIndex = matchingPersonaIndex;
        allChapters = matchingPersona.chapters || [];
      }
    }
    
    // Update chapter index if it's different
    if (matchingChapterIndex !== currentChapterIndex) {
      console.log(`Updating chapter index from ${currentChapterIndex} to ${matchingChapterIndex}`);
      currentChapterIndex = matchingChapterIndex;
      
      // Always update overlay content when chapter changes via auto-highlight
      if (overlayDiv) {
        console.log('Auto-highlight: Force updating overlay for chapter change');
        console.log('  - New chapter:', allChapters[currentChapterIndex]?.title);
        console.log('  - New persona:', currentPersona?.name);
        console.log('  - isOverlayVisible:', isOverlayVisible);
        console.log('  - isFullscreenMode:', isFullscreenMode);
        
        if (isOverlayVisible) {
          if (isFullscreenMode) {
            // In fullscreen mode, highlight the chapter in the large overlay
            highlightCurrentChapterFromSmallOverlay();
          } else {
            // In small overlay mode, force update the content
            console.log('Auto-highlight: Force updating small overlay content');
            updateOverlayContent();
          }
        } else {
          // If overlay exists but isn't visible, still update the content for when it becomes visible
          console.log('Auto-highlight: Overlay not visible, but updating content for when it shows');
          if (!isFullscreenMode) {
            updateOverlayContent();
          }
        }
      }
      
      // Save overlay state
      saveOverlayState();
    } else {
      console.log(`Chapter index already matches (${currentChapterIndex}), but ensuring overlay is up to date`);
      
      // Even if the chapter index is the same, make sure the overlay reflects the current chapter
      // This handles cases where the overlay might be out of sync (back navigation)
      if (overlayDiv) {
        console.log('Auto-highlight: Refreshing overlay for same chapter index (back navigation case)');
        console.log('  - Current chapter:', allChapters[currentChapterIndex]?.title);
        console.log('  - Current persona:', currentPersona?.name);
        
        if (isOverlayVisible) {
          if (isFullscreenMode) {
            // In fullscreen mode, ensure proper highlighting
            highlightCurrentChapterFromSmallOverlay();
          } else {
            // In small overlay mode, force refresh content
            console.log('Auto-highlight: Force refreshing small overlay content (same index)');
            updateOverlayContent();
          }
        } else {
          // Even if not visible, update content for when it becomes visible
          if (!isFullscreenMode) {
            updateOverlayContent();
          }
        }
        
        // Save state to ensure persistence
        saveOverlayState();
      }
    }
  } else {
    console.log('No matching chapter found for current URL');
  }
}

let autoHighlightInitialized = false;
let urlChangeTimeout = null;

function setupAutoHighlightNavigation() {
  if (autoHighlightInitialized) {
    console.log('Auto-highlight navigation already initialized');
    return;
  }
  
  console.log('Setting up auto-highlight navigation listeners');
  
  // Check for URL match when the page loads
  window.addEventListener('load', () => {
    console.log('Page loaded, checking for auto-highlight match');
    // Try multiple times with increasing delays to catch data loading
    setTimeout(() => triggerAutoHighlightCheck(), 1000);
    setTimeout(() => triggerAutoHighlightCheck(), 3000);
    setTimeout(() => triggerAutoHighlightCheck(), 5000);
  });
  
  // Check immediately if page is already loaded
  if (document.readyState === 'complete') {
    console.log('Page already loaded, checking for auto-highlight match');
    setTimeout(() => triggerAutoHighlightCheck(), 500);
    setTimeout(() => triggerAutoHighlightCheck(), 2000);
  }
  
  // Check for URL match when navigating (for SPAs and regular navigation)
  let currentUrl = window.location.href;
  
  // Listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', () => {
    console.log('Popstate event detected - URL:', window.location.href);
    console.log('Current chapter before popstate check:', currentChapterIndex, currentPersona?.name);
    debounceUrlCheck();
  });
  
  // Use MutationObserver to detect URL changes in SPAs (with throttling)
  const observer = new MutationObserver(() => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      console.log('URL changed via MutationObserver, checking for auto-highlight match');
      debounceUrlCheck();
    }
  });
  
  // Start observing with less aggressive settings
  observer.observe(document, { 
    subtree: false, 
    childList: true,
    attributes: false
  });
  
  // Also listen for hashchange events
  window.addEventListener('hashchange', () => {
    console.log('Hash changed, checking for auto-highlight match');
    debounceUrlCheck();
  });
  
  autoHighlightInitialized = true;
  console.log('Auto-highlight navigation listeners set up');
}

function debounceUrlCheck() {
  // Clear existing timeout
  if (urlChangeTimeout) {
    clearTimeout(urlChangeTimeout);
  }
  
  // Set new timeout - use triggerAutoHighlightCheck for better data handling
  urlChangeTimeout = setTimeout(() => {
    triggerAutoHighlightCheck();
  }, 1000); // Debounce to avoid excessive checks
}

// Function to trigger auto-highlight check when overlay data is ready
function triggerAutoHighlightCheck() {
  if (!autoHighlightChapter) {
    console.log('Auto-highlight disabled, skipping check');
    return;
  }
  
  console.log('Triggering auto-highlight check after overlay data loaded');
  
  // If we don't have story data, try to load it first
  if (!currentStory && (!allPersonas || allPersonas.length === 0)) {
    console.log('No story data available, attempting to load from storage');
    chrome.storage.local.get(['stories'], (result) => {
      const stories = result.stories || [];
      if (stories.length > 0) {
        console.log('Loaded stories from storage for auto-highlight');
        // Use the first story as default if no current story
        if (!currentStory) {
          currentStory = stories[0];
          allPersonas = currentStory.personas || [];
          console.log('Set default story for auto-highlight:', currentStory.name);
        }
        
        // Now try the check again
        setTimeout(() => {
          checkCurrentPageForChapterMatch();
        }, 200);
      } else {
        console.log('No stories found in storage for auto-highlight');
      }
    });
  } else {
    // We have data, proceed with check
    setTimeout(() => {
      checkCurrentPageForChapterMatch();
    }, 200);
  }
}



// Load custom colors from storage
function loadCustomColors(callback) {
  chrome.storage.local.get(['customColors', 'savedCustomThemes'], (result) => {
    console.log('loadCustomColors - storage result:', result);
    console.log('loadCustomColors - current colorScheme:', colorScheme);
    
    if (result.customColors && Object.keys(result.customColors).length > 0) {
      console.log('Found customColors in storage:', result.customColors);
      callback(result.customColors);
    } else if (result.savedCustomThemes && colorScheme.startsWith('custom-')) {
      console.log('Looking for saved custom theme:', colorScheme);
      // Load from saved custom themes
      const theme = result.savedCustomThemes[colorScheme];
      if (theme && theme.colors) {
        console.log('Found saved custom theme:', theme.colors);
        callback(theme.colors);
      } else {
        console.log('No saved custom theme found for:', colorScheme);
        callback(null);
      }
    } else {
      console.log('No custom colors or saved themes found');
      callback(null);
    }
  });
}

function applyColorScheme() {
  console.log('=== APPLYING COLOR SCHEME ===');
  console.log('Color scheme:', colorScheme);
  console.log('Overlay opacity:', overlayOpacity);
  console.log('Overlay div exists:', !!overlayDiv);
  if (overlayDiv) {
    console.log('Overlay classes:', overlayDiv.className);
    console.log('Overlay innerHTML length:', overlayDiv.innerHTML.length);
  }
  
  // Define color schemes
  const schemes = {
    default: {
      primary: 'rgba(3, 45, 66, ' + overlayOpacity + ')',
      secondary: 'rgba(118, 97, 255, ' + overlayOpacity + ')',
      accent: 'rgba(82, 184, 255, 0.3)',
      primaryText: '#ffffff',
      secondaryText: '#e6f3ff',
      personaHighlight: '#63df4e',
      chapterHighlight: '#ffc107'
    },
    'blue-green': {
      primary: 'rgba(3, 45, 66, ' + overlayOpacity + ')',
      secondary: 'rgba(34, 82, 25, ' + overlayOpacity + ')',
      accent: 'rgba(99, 223, 78, 0.3)',
      primaryText: '#ffffff',
      secondaryText: '#f0fff0',
      personaHighlight: '#63df4e',
      chapterHighlight: '#ffc107'
    },
    purple: {
      primary: 'rgba(75, 0, 130, ' + overlayOpacity + ')',
      secondary: 'rgba(138, 43, 226, ' + overlayOpacity + ')',
      accent: 'rgba(186, 85, 211, 0.3)',
      primaryText: '#ffffff',
      secondaryText: '#ba55d3',
      personaHighlight: '#63df4e',
      chapterHighlight: '#ffc107'
    },
    orange: {
      primary: 'rgba(204, 85, 0, ' + overlayOpacity + ')',
      secondary: 'rgba(153, 51, 0, ' + overlayOpacity + ')',
      accent: 'rgba(255, 165, 0, 0.3)',
      primaryText: '#ffffff',
      secondaryText: '#fff5e6',
      personaHighlight: '#63df4e',
      chapterHighlight: '#ffc107'
    },
    dark: {
      primary: 'rgba(20, 20, 20, ' + overlayOpacity + ')',
      secondary: 'rgba(40, 40, 40, ' + overlayOpacity + ')',
      accent: 'rgba(60, 60, 60, 0.3)',
      primaryText: '#ffffff',
      secondaryText: '#3c3c3c',
      personaHighlight: '#63df4e',
      chapterHighlight: '#ffc107'
    },
    rogers: {
      primary: 'rgba(3, 45, 66, ' + overlayOpacity + ')',
      secondary: 'rgba(0, 122, 156, ' + overlayOpacity + ')',
      accent: 'rgba(12, 21, 23, 0.3)',
      primaryText: '#ffffff',
      secondaryText: '#e6f3ff',
      personaHighlight: '#ffffff',
      chapterHighlight: '#4fb040'
    }
  };

  let scheme = schemes[colorScheme] || schemes.default;
  
  // If custom scheme, load custom colors
  if (colorScheme === 'custom' || colorScheme.startsWith('custom-')) {
    console.log('Loading custom colors for scheme:', colorScheme);
    loadCustomColors((customColors) => {
      console.log('Custom colors loaded:', customColors);
      if (customColors) {
        // Convert hex colors to rgba with opacity
        const hexToRgba = (hex, opacity) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        };
        
        scheme = {
          primary: hexToRgba(customColors.primary, overlayOpacity),
          secondary: hexToRgba(customColors.secondary, overlayOpacity),
          accent: hexToRgba(customColors.accent, 0.3),
          primaryText: customColors.primaryText || '#ffffff',
          secondaryText: customColors.secondaryText || '#e6f3ff',
          personaHighlight: customColors.personaHighlight || '#63df4e',
          chapterHighlight: customColors.chapterHighlight || '#ffc107'
        };
        
        console.log('Custom colors loaded:', scheme);
        applySchemeToOverlay(scheme);
      } else {
        console.log('No custom colors found, using default');
        applySchemeToOverlay(scheme);
      }
    });
    return;
  }
  
  console.log('Selected scheme:', scheme);
  applySchemeToOverlay(scheme);
}

function applySchemeToOverlay(scheme) {
  // Apply color scheme to overlay if it exists
  if (overlayDiv) {
    console.log('applySchemeToOverlay called with scheme:', scheme);
    
    // Extract RGB values from accent color and create versions with different opacities
    const accentRgba = scheme.accent || 'rgba(99, 223, 78, 0.3)';
    const rgbMatch = accentRgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    let accentBg = accentRgba;
    let accentBorder = accentRgba;
    
    if (rgbMatch) {
      const r = rgbMatch[1];
      const g = rgbMatch[2];
      const b = rgbMatch[3];
      accentBg = `rgba(${r}, ${g}, ${b}, 0.2)`;
      accentBorder = `rgba(${r}, ${g}, ${b}, 0.6)`;
    }
    
    // Extract RGB values from chapter highlight color and create versions with different opacities
    const chapterHighlightHex = scheme.chapterHighlight || '#ffc107';
    const chapterHighlightRgba = hexToRgba(chapterHighlightHex, 1);
    const chapterRgbMatch = chapterHighlightRgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    let chapterHighlightBg = chapterHighlightRgba;
    let chapterHighlightBorder = chapterHighlightRgba;
    let chapterHighlightShadow = chapterHighlightRgba;
    
    if (chapterRgbMatch) {
      const r = chapterRgbMatch[1];
      const g = chapterRgbMatch[2];
      const b = chapterRgbMatch[3];
      chapterHighlightBg = `rgba(${r}, ${g}, ${b}, 0.3)`;
      chapterHighlightBorder = `rgba(${r}, ${g}, ${b}, 0.8)`;
      chapterHighlightShadow = `rgba(${r}, ${g}, ${b}, 0.4)`;
    }
    
    // Set CSS custom properties for colors that are used in var() references
    overlayDiv.style.setProperty('--accent-color', scheme.accent || 'rgba(99, 223, 78, 0.3)');
    overlayDiv.style.setProperty('--accent-color-bg', accentBg);
    overlayDiv.style.setProperty('--accent-color-border', accentBorder);
    overlayDiv.style.setProperty('--primary-color', scheme.primary);
    overlayDiv.style.setProperty('--secondary-color', scheme.secondary);
    overlayDiv.style.setProperty('--chapter-highlight-color', chapterHighlightHex);
    overlayDiv.style.setProperty('--chapter-highlight-bg', chapterHighlightBg);
    overlayDiv.style.setProperty('--chapter-highlight-border', chapterHighlightBorder);
    overlayDiv.style.setProperty('--chapter-highlight-shadow', chapterHighlightShadow);
    
    // Apply background gradient directly
    overlayDiv.style.background = `linear-gradient(135deg, ${scheme.primary} 0%, ${scheme.secondary} 100%)`;
    
    // If it's fullscreen, also update the fullscreen background
    if (overlayDiv.classList.contains('fullscreen')) {
      const fullscreenOpacity = Math.min(overlayOpacity + 0.1, 1);
      const fullscreenPrimary = scheme.primary.replace(overlayOpacity, fullscreenOpacity);
      const fullscreenSecondary = scheme.secondary.replace(overlayOpacity, fullscreenOpacity);
      overlayDiv.style.background = `linear-gradient(135deg, ${fullscreenPrimary} 0%, ${fullscreenSecondary} 100%)`;
    }
    
    // Apply text colors to overlay elements
    const personaNames = overlayDiv.querySelectorAll('.persona-name');
    personaNames.forEach(el => {
      el.style.color = scheme.primaryText || '#ffffff';
    });
    
    const personaTitles = overlayDiv.querySelectorAll('.persona-title');
    personaTitles.forEach(el => {
      el.style.color = scheme.secondaryText || '#e6f3ff';
    });
    
    // Apply chapter colors
    const chapterTitles = overlayDiv.querySelectorAll('.chapter-title');
    chapterTitles.forEach(el => {
      el.style.color = scheme.primaryText || '#ffffff';
    });
    
    // Apply value driver colors
    const valueDrivers = overlayDiv.querySelectorAll('.drivers li');
    valueDrivers.forEach(el => {
      el.style.color = scheme.primaryText || '#ffffff';
      el.style.background = accentBg;
      el.style.borderLeftColor = accentBorder;
    });
    
    // Apply accent colors only to URL buttons (not control buttons like pin/minimize)
    const urlButtons = overlayDiv.querySelectorAll('.url-button');
    urlButtons.forEach(el => {
      el.style.borderColor = scheme.personaHighlight || '#63df4e';
      el.style.color = scheme.personaHighlight || '#63df4e';
    });
    
    // Apply persona highlight colors for selected personas
    const highlightedPersonas = overlayDiv.querySelectorAll('.persona-card.highlighted, .persona-card.current-persona-highlight');
    console.log('Found highlighted personas:', highlightedPersonas.length, 'with personaHighlight:', scheme.personaHighlight);
    highlightedPersonas.forEach(el => {
      el.style.setProperty('border-color', scheme.personaHighlight || '#63df4e', 'important');
      el.style.setProperty('background', hexToRgba(scheme.personaHighlight || '#63df4e', 0.2), 'important');
      el.style.setProperty('box-shadow', `0 12px 30px ${hexToRgba(scheme.personaHighlight || '#63df4e', 0.4)}`, 'important');
      const personaName = el.querySelector('.persona-name');
      if (personaName) {
        personaName.style.setProperty('color', scheme.personaHighlight || '#63df4e', 'important');
      }
    });
    
    // Apply chapter highlight colors for selected chapters
    const highlightedChapters = overlayDiv.querySelectorAll('.chapter-item.selected, .chapter-item.current-chapter-highlight');
    console.log('Found highlighted chapters:', highlightedChapters.length, 'with chapterHighlight:', scheme.chapterHighlight);
    highlightedChapters.forEach(el => {
      el.style.setProperty('background', hexToRgba(scheme.chapterHighlight || '#ffc107', 0.3), 'important');
      el.style.setProperty('border-color', hexToRgba(scheme.chapterHighlight || '#ffc107', 0.8), 'important');
      el.style.setProperty('box-shadow', `0 0 0 3px ${hexToRgba(scheme.chapterHighlight || '#ffc107', 0.4)}`, 'important');
      const chapterTitle = el.querySelector('.chapter-title');
      if (chapterTitle) {
        chapterTitle.style.setProperty('color', scheme.chapterHighlight || '#ffc107', 'important');
      }
    });
    
  }
}

// Helper function to convert hex to rgba
function hexToRgba(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Load completed chapters when the script runs
loadCompletedChapters();

// Listen for messages from settings page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'applyColorScheme') {
    console.log('Received applyColorScheme message:', message);
    colorScheme = message.colorScheme;
    if (message.customColors) {
      // Store custom colors locally for immediate use
      chrome.storage.local.set({
        customColors: message.customColors
      });
    }
    applyColorScheme();
    sendResponse({success: true});
  }
});

// Cache for frequently accessed data
let settingsCache = {};
let storiesCache = null;
let overlayStateCache = null;

// Load all settings synchronously to ensure shortcuts work on first load
function loadAllSettings() {
  // Check cache first
  if (Object.keys(settingsCache).length > 0) {
    applyCachedSettings();
    return;
  }
  
  chrome.storage.local.get([
    'shortcutsEnabled',
    'overlayOpacity', 
    'overlayPosition',
    'overlaySize',
    'colorScheme',
    'customColors',
    'savedCustomThemes',
    'showProgressIndicators',
    'autoHighlightChapter',
    'crossTabChapterSync',
    'crossTabHighlightingSync',
    'crossPersonaNavigation',
    'minimalPaddingPinned',
    'collapseButtonEnabled',
    'customShortcuts',
    'screenshotModeEnabled',
    'customLogo'
  ], (result) => {
    // Cache the settings
    settingsCache = result;
    applyCachedSettings();
    
    // Load other settings
    if (result.overlayOpacity !== undefined) {
      overlayOpacity = result.overlayOpacity;
      console.log('Overlay opacity:', overlayOpacity);
    }
    
    if (result.colorScheme !== undefined) {
      colorScheme = result.colorScheme;
      console.log('Color scheme:', colorScheme);
      applyColorScheme();
    }
    
    if (result.showProgressIndicators !== undefined) {
      showProgressIndicators = result.showProgressIndicators;
      console.log('Show progress indicators:', showProgressIndicators);
    }
    
    if (result.autoHighlightChapter !== undefined) {
      autoHighlightChapter = result.autoHighlightChapter;
      console.log('Auto-highlight chapter:', autoHighlightChapter);
      
      // Set up navigation listeners if enabled
      if (autoHighlightChapter) {
        setupAutoHighlightNavigation();
      }
    }
    
    if (result.crossTabChapterSync !== undefined) {
      crossTabChapterSync = result.crossTabChapterSync;
      console.log('Cross-tab chapter sync:', crossTabChapterSync);
      
      // Reload completed chapters if setting changed
      if (crossTabChapterSync) {
        loadCompletedChapters();
      } else {
        // Clear completed chapters if sync is disabled
        completedChapters = new Set();
        console.log('Cross-tab chapter sync disabled, cleared completed chapters');
      }
    }
    
    if (result.crossTabHighlightingSync !== undefined) {
      crossTabHighlightingSync = result.crossTabHighlightingSync;
      console.log('Cross-tab highlighting sync:', crossTabHighlightingSync);
      
      // Clear highlighting state if sync is disabled
      if (!crossTabHighlightingSync) {
        highlightedPersonaIndex = -1;
        selectedChapterIndex = -1;
        console.log('Cross-tab highlighting sync disabled, cleared highlighting state');
      }
    }
    
    if (result.crossPersonaNavigation !== undefined) {
      crossPersonaNavigation = result.crossPersonaNavigation;
      console.log('Cross-persona navigation:', crossPersonaNavigation);
    }
    
    if (result.minimalPaddingPinned !== undefined) {
      minimalPaddingPinned = result.minimalPaddingPinned;
      console.log('Minimal padding pinned:', minimalPaddingPinned);
    }
    
    if (result.collapseButtonEnabled !== undefined) {
      collapseButtonEnabled = result.collapseButtonEnabled;
      console.log('Collapse button enabled:', collapseButtonEnabled);
    }
    
    if (result.screenshotModeEnabled !== undefined) {
      screenshotModeEnabled = result.screenshotModeEnabled;
      console.log('Screenshot mode enabled:', screenshotModeEnabled);
    }
    
    if (result.customShortcuts) {
      customShortcuts = result.customShortcuts;
      console.log('Custom shortcuts loaded:', customShortcuts);
    }
    
    if (result.customLogo !== undefined) {
      customLogo = result.customLogo;
      console.log('Custom logo loaded:', customLogo ? 'Yes' : 'No (using default)');
    }
    
    console.log('All settings loaded successfully');
  });
}

function applyCachedSettings() {
  // Load shortcuts setting
  if (settingsCache.shortcutsEnabled !== undefined) {
    shortcutsEnabled = settingsCache.shortcutsEnabled;
    console.log('Shortcuts enabled:', shortcutsEnabled);
  }
  
  // Load other settings
  if (settingsCache.overlayOpacity !== undefined) {
    overlayOpacity = settingsCache.overlayOpacity;
    console.log('Overlay opacity:', overlayOpacity);
  }
  
  if (settingsCache.colorScheme !== undefined) {
    colorScheme = settingsCache.colorScheme;
    console.log('Color scheme:', colorScheme);
    applyColorScheme();
  }
  
  if (settingsCache.showProgressIndicators !== undefined) {
    showProgressIndicators = settingsCache.showProgressIndicators;
    console.log('Show progress indicators:', showProgressIndicators);
  }
  
  if (settingsCache.autoHighlightChapter !== undefined) {
    autoHighlightChapter = settingsCache.autoHighlightChapter;
    console.log('Auto-highlight chapter:', autoHighlightChapter);
    
    // Set up navigation listeners if enabled
    if (autoHighlightChapter) {
      setupAutoHighlightNavigation();
    }
  }
  
  if (settingsCache.crossTabChapterSync !== undefined) {
    crossTabChapterSync = settingsCache.crossTabChapterSync;
    console.log('Cross-tab chapter sync:', crossTabChapterSync);
    
    // Reload completed chapters if setting changed
    if (crossTabChapterSync) {
      loadCompletedChapters();
    } else {
      // Clear completed chapters if sync is disabled
      completedChapters = new Set();
      console.log('Cross-tab chapter sync disabled, cleared completed chapters');
    }
  }
  
  if (settingsCache.crossTabHighlightingSync !== undefined) {
    crossTabHighlightingSync = settingsCache.crossTabHighlightingSync;
    console.log('Cross-tab highlighting sync:', crossTabHighlightingSync);
  }
  
  if (settingsCache.crossPersonaNavigation !== undefined) {
    crossPersonaNavigation = settingsCache.crossPersonaNavigation;
    console.log('Cross-persona navigation:', crossPersonaNavigation);
  }
  
  if (settingsCache.minimalPaddingPinned !== undefined) {
    minimalPaddingPinned = settingsCache.minimalPaddingPinned;
    console.log('Minimal padding pinned:', minimalPaddingPinned);
  }
  
  if (settingsCache.collapseButtonEnabled !== undefined) {
    collapseButtonEnabled = settingsCache.collapseButtonEnabled;
    console.log('Collapse button enabled:', collapseButtonEnabled);
  }
  
  if (settingsCache.screenshotModeEnabled !== undefined) {
    screenshotModeEnabled = settingsCache.screenshotModeEnabled;
    console.log('Screenshot mode enabled:', screenshotModeEnabled);
  }
  
  // Load custom shortcuts
  if (settingsCache.customShortcuts) {
    customShortcuts = settingsCache.customShortcuts;
    console.log('Custom shortcuts loaded:', customShortcuts);
  }
  
  // Load custom logo
  if (settingsCache.customLogo !== undefined) {
    customLogo = settingsCache.customLogo;
    console.log('Custom logo loaded:', customLogo ? 'Yes' : 'No (using default)');
  }
}

// Optimized stories loading with caching
function loadStoriesData(callback) {
  if (storiesCache) {
    console.log('Using cached stories data');
    const story = storiesCache[0];
    if (story) {
      currentStory = story;
      allPersonas = story.personas || [];
    }
    if (callback) callback();
    return;
  }
  
  console.log('Loading stories from storage');
  chrome.storage.local.get(['stories'], (result) => {
    const stories = result.stories || [];
    storiesCache = stories; // Cache the data
    
    if (stories.length > 0) {
      const story = stories[0];
      currentStory = story;
      allPersonas = story.personas || [];
    } else {
      console.log('No stories available');
    }
    
    if (callback) callback();
  });
}

// Clear cache when settings change
function clearCache() {
  settingsCache = {};
  storiesCache = null;
  overlayStateCache = null;
  cssCache = null;
  console.log('Cache cleared');
}

// Initialize settings immediately to ensure they're available for overlay positioning
loadAllSettings();

// Also ensure settings are loaded on DOM ready as a backup
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Double-check settings are loaded
    if (Object.keys(settingsCache).length === 0) {
      console.log('Settings not loaded on DOM ready, loading now...');
      loadAllSettings();
    }
  });
} else {
  // DOM is already ready, ensure settings are loaded
  if (Object.keys(settingsCache).length === 0) {
    console.log('Settings not loaded, loading now...');
    loadAllSettings();
  }
}

// Listen for storage changes to sync completed chapters and highlighting across tabs
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    // Clear cache when stories or settings change
    if (changes.stories || changes.customShortcuts || changes.overlayOpacity || changes.colorScheme) {
      clearCache();
    }
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
      const newState = changes.overlayState.newValue;
      
      // Ignore if this change is from our own tab (within 500ms of saving)
      if (newState && newState.timestamp && (Date.now() - lastStateSaveTime < 500)) {
        console.log('Ignoring highlighting sync - this is our own state change');
        return;
      }
      
      console.log('Overlay state changed in another tab, checking for highlighting update');
      
      if (newState && newState.highlightedPersonaIndex !== undefined && newState.selectedChapterIndex !== undefined) {
        // Only sync if both tabs are viewing the same story
        const isSameStory = currentStory && newState.currentStory && 
                           currentStory.name === newState.currentStory.name;
        
        if (!isSameStory) {
          console.log('Ignoring highlighting sync - different stories:', currentStory?.name, 'vs', newState.currentStory?.name);
          return;
        }
        
        // Only update if the highlighting state is different
        if (highlightedPersonaIndex !== newState.highlightedPersonaIndex || selectedChapterIndex !== newState.selectedChapterIndex) {
          highlightedPersonaIndex = newState.highlightedPersonaIndex;
          selectedChapterIndex = newState.selectedChapterIndex;
          console.log('Updated highlighting from storage change:', highlightedPersonaIndex, selectedChapterIndex);
          
          // Update visual state if overlay is visible (works in both fullscreen and small overlay modes)
          if (overlayDiv && isOverlayVisible) {
            clearChapterSelection();
            updateChapterSelection();
            updatePersonaHighlighting();
            
            // Update current persona/chapter state for consistency
            if (allPersonas && allPersonas[highlightedPersonaIndex]) {
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
              
              console.log('Updated state from cross-tab sync:', selectedPersona.name, '- Chapter', selectedChapterIndex + 1);
              
              // Only update overlay content if NOT in fullscreen mode (small overlay only)
              if (!isFullscreenMode) {
                console.log('Updating small overlay content from cross-tab sync');
                updateOverlayContent();
              } else {
                console.log('In fullscreen mode, highlighting already updated - not calling updateOverlayContent()');
              }
            }
            
            // Apply color scheme after highlighting is updated
            setTimeout(() => {
              applyColorScheme();
            }, 50);
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

// Listen for screenshot mode toggle events
document.addEventListener('screenshotModeToggle', (e) => {
  screenshotModeEnabled = e.detail.enabled;
  console.log('Screenshot mode toggled:', screenshotModeEnabled);
  
  // Refresh overlay content to show/hide capture button based on new state
  if (isOverlayVisible && !isFullscreenMode) {
    updateOverlayContent();
  }
  if (isFullscreenMode) {
    showFullscreenSummary();
  }
});

// Listen for settings updates
document.addEventListener('settingsUpdated', (e) => {
  const settings = e.detail;
  
  if (settings.shortcutsEnabled !== undefined) {
    shortcutsEnabled = settings.shortcutsEnabled;
    console.log('Shortcuts enabled updated:', shortcutsEnabled);
    
    // Refresh overlay content if it exists to show/hide buttons based on new state
    if (overlayDiv && isOverlayVisible && !isFullscreenMode) {
      updateOverlayContent();
    }
  }
  
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
      // Set up navigation listeners if not already done
      setupAutoHighlightNavigation();
      // Trigger immediate check
      triggerAutoHighlightCheck();
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
  
  if (settings.crossPersonaNavigation !== undefined) {
    crossPersonaNavigation = settings.crossPersonaNavigation;
    console.log('Cross-persona navigation updated:', crossPersonaNavigation);
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
  console.log('overlayUpdate event received:', e.detail);
  
  // Extract position and size FIRST before creating overlay
  const { persona, chapter, valueDrivers, personaTitle, headshot, story, storyIndex, personaIndex, chapterIndex, allPersonaChapters, allStoryPersonas, size, position, opacity, screenshotMode } = e.detail;
  
  // Set current story index for session notes
  currentStoryIndex = storyIndex;
  console.log('Set currentStoryIndex:', currentStoryIndex);
  
  if (!overlayDiv) {
    console.log('Creating new overlay with position:', position, 'size:', size);
    injectStyles();
    createOverlay();
    
    // Apply initial positioning immediately to prevent flash of wrong position
    // Prioritize position from event detail (which comes from storage via popup)
    const initialPosition = position || settingsCache.overlayPosition || 'bottom-right';
    const initialSize = size || settingsCache.overlaySize || 'small';
    overlayDiv.className = `size-${initialSize} position-${initialPosition}`;
    console.log('Applied initial overlay classes:', overlayDiv.className);
    
    // Apply color scheme after overlay is created, ensuring settings are loaded
    setTimeout(() => {
      applyColorScheme();
    }, 100);
  }
  
  // Don't update state if we're in the middle of restoring
  if (isRestoringState) {
    console.log('Skipping overlayUpdate during state restoration');
    return;
  }
  
  // Update screenshot mode if provided
  if (screenshotMode !== undefined) {
    screenshotModeEnabled = screenshotMode;
  }
  
  // Since we're now passing settings directly from popup, we can proceed immediately
  const proceedWithOverlayUpdate = () => {
    processOverlayUpdate();
  };
  
  const processOverlayUpdate = () => {
    // Store current state for navigation
    currentStory = story;
    currentStoryIndex = storyIndex !== undefined ? storyIndex : 0;
    currentPersona = { name: persona, title: personaTitle, headshot, index: personaIndex };
    currentPersonaIndex = personaIndex;
    currentChapterIndex = chapterIndex;
    allChapters = allPersonaChapters || [];
    allPersonas = allStoryPersonas || [];
    
    // Store size, position, and opacity for persistence across fullscreen toggles
    if (size) currentOverlaySize = size;
    if (position) currentOverlayPosition = position;
    if (opacity !== undefined) overlayOpacity = opacity;
    
    // Use provided headshot, fallback headshot, or consistent headshot based on persona name
    const headshotSrc = headshot || getConsistentHeadshot(persona);
    
    const progressText = showProgressIndicators && allChapters.length > 1 ? `${currentChapterIndex + 1}/${allChapters.length}` : '';
    
    // Apply size and position classes with DOM ready check
    // Use the position from the event detail (passed from popup with loaded settings), or fall back to cached settings, or default to bottom-right
    const overlayPosition = position || settingsCache.overlayPosition || 'bottom-right';
    
    console.log('Overlay positioning - Event position (from popup):', position, 'Cached position:', settingsCache.overlayPosition, 'Final position:', overlayPosition);
    console.log('Settings cache contents:', settingsCache);
    
    // If we have a position from the event, use it directly (it comes from popup with fresh settings)
    if (position) {
      console.log('Using position from popup (loaded from storage):', position);
    }
  
  // Ensure DOM is ready before applying positioning
  const applyPositioning = (retryCount = 0) => {
    if (overlayDiv && overlayDiv.parentNode) {
      overlayDiv.className = `size-${size || 'small'} position-${overlayPosition}`;
      
      // Verify positioning was applied correctly
      const hasPositionClass = overlayDiv.classList.contains(`position-${overlayPosition}`);
      const hasSizeClass = overlayDiv.classList.contains(`size-${size || 'small'}`);
      
      if (!hasPositionClass || !hasSizeClass) {
        // Positioning didn't apply correctly, retry
        if (retryCount < 3) {
          console.log(`Positioning retry ${retryCount + 1} for overlay`);
          setTimeout(() => applyPositioning(retryCount + 1), 100);
          return;
        } else {
          console.warn('Failed to apply overlay positioning after 3 retries');
        }
      }
      
      // Apply color scheme after positioning is set
      setTimeout(() => {
        applyColorScheme();
      }, 100);
      
      // Force a reflow to ensure positioning is applied
      overlayDiv.offsetHeight;
      
      console.log(`Overlay positioned successfully: size-${size || 'small'} position-${overlayPosition}`);
    } else {
      // Retry if DOM isn't ready
      if (retryCount < 5) {
        setTimeout(() => applyPositioning(retryCount + 1), 50);
      } else {
        console.warn('Failed to apply overlay positioning: DOM not ready after 5 retries');
      }
    }
  };
  
  // Start positioning process
  if (document.readyState === 'complete') {
    applyPositioning();
  } else {
    // Wait for DOM to be ready
    setTimeout(() => applyPositioning(), 100);
  }
  
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
  
  // Determine if arrow buttons should be shown
  // Show arrows if: multiple chapters OR (cross-persona navigation enabled AND multiple personas)
  const showArrows = (allChapters.length > 1 || (crossPersonaNavigation && allPersonas.length > 1)) && !shortcutsEnabled;
  const isFirstChapter = currentChapterIndex === 0;
  const isLastChapter = currentChapterIndex === allChapters.length - 1;
  
  // For cross-persona navigation, allow navigation even at first/last chapter
  const canGoPrevious = !isFirstChapter || (crossPersonaNavigation && allPersonas.length > 1);
  const canGoNext = !isLastChapter || (crossPersonaNavigation && allPersonas.length > 1);
  
  // Check if current chapter has a screenshot for button text
  const currentChapter = allChapters[currentChapterIndex];
  const hasExistingScreenshot = currentChapter && currentChapter.screenshot && currentChapter.screenshot.startsWith('data:image');
  const screenshotButtonText = hasExistingScreenshot ? 'Replace current screenshot' : 'Capture Screenshot';
  const screenshotButtonClass = hasExistingScreenshot ? 'screenshot-capture-btn screenshot-replace-btn' : 'screenshot-capture-btn';
  
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
    <div class="chapter">${chapter}</div>
    ${screenshotModeEnabled ? `
      <button class="${screenshotButtonClass}" data-action="capture-screenshot" title="${screenshotButtonText}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        ${screenshotButtonText}
      </button>
    ` : ''}
    <ul class="drivers">
      ${valueDrivers.map(d => `<li>${d}</li>`).join("")}
    </ul>
    ${showArrows ? `
      <div class="arrow-nav">
        <button class="arrow-button" data-action="prev-chapter" title="Previous chapter" ${!canGoPrevious ? 'disabled' : ''}>←</button>
        <button class="arrow-button" data-action="next-chapter" title="Next chapter" ${!canGoNext ? 'disabled' : ''}>→</button>
      </div>
    ` : ''}
  `;
  overlayDiv.style.display = "block";
  
  // Fallback: Ensure overlay is visible with default positioning if classes didn't apply
  setTimeout(() => {
    if (overlayDiv && !overlayDiv.classList.contains(`position-${overlayPosition}`)) {
      console.log('Applying fallback positioning for overlay');
      overlayDiv.style.position = 'fixed';
      overlayDiv.style.zIndex = '999999';
      
      // Apply default bottom-right positioning as fallback
      if (overlayPosition === 'bottom-right' || overlayPosition === 'bottom-left') {
        overlayDiv.style.bottom = '24px';
        overlayDiv.style.right = overlayPosition === 'bottom-right' ? '24px' : 'auto';
        overlayDiv.style.left = overlayPosition === 'bottom-left' ? '24px' : 'auto';
      }
    }
  }, 200);
  
  // Update and save state
  isOverlayVisible = true;
  isFullscreenMode = false;
  saveOverlayState();
  
    // Check for auto-highlight if setting is enabled
    if (autoHighlightChapter) {
      checkCurrentPageForChapterMatch();
    }
  };
  
  // Start the overlay update process
  proceedWithOverlayUpdate();
});

// Navigation functions

function nextChapter() {
  // Only return early if there's 1 chapter AND cross-persona navigation is disabled
  if (allChapters.length <= 1 && (!crossPersonaNavigation || allPersonas.length <= 1)) return;
  
  // Check if we're at the last chapter of current persona
  if (currentChapterIndex < allChapters.length - 1) {
    // Normal case: move to next chapter in current persona
    currentChapterIndex = currentChapterIndex + 1;
    updateOverlayContent();
  } else if (crossPersonaNavigation && allPersonas.length > 1) {
    // Cross-persona navigation: move to first chapter of next persona
    const nextPersonaIndex = (currentPersonaIndex + 1) % allPersonas.length;
    const nextPersona = allPersonas[nextPersonaIndex];
    
    if (nextPersona && nextPersona.chapters && nextPersona.chapters.length > 0) {
      
      // Set flag to prevent auto-highlight interference
      isCrossPersonaNavigating = true;
      
      // Update persona and chapter indices
      currentPersonaIndex = nextPersonaIndex;
      currentPersona = { 
        name: nextPersona.name, 
        title: nextPersona.businessTitle || nextPersona.title, 
        headshot: nextPersona.headshot, 
        index: currentPersonaIndex 
      };
      allChapters = nextPersona.chapters;
      currentChapterIndex = 0; // Start at first chapter of new persona
      
      updateOverlayContent();
      
      // Clear flag after a short delay to allow overlay to update
      setTimeout(() => {
        isCrossPersonaNavigating = false;
      }, 500);
    }
  }
}

function previousChapter() {
  // Only return early if there's 1 chapter AND cross-persona navigation is disabled
  if (allChapters.length <= 1 && (!crossPersonaNavigation || allPersonas.length <= 1)) return;
  
  // Check if we're at the first chapter of current persona
  if (currentChapterIndex > 0) {
    // Normal case: move to previous chapter in current persona
    currentChapterIndex = currentChapterIndex - 1;
    updateOverlayContent();
  } else if (crossPersonaNavigation && allPersonas.length > 1) {
    // Cross-persona navigation: move to last chapter of previous persona
    const prevPersonaIndex = currentPersonaIndex === 0 ? allPersonas.length - 1 : currentPersonaIndex - 1;
    const prevPersona = allPersonas[prevPersonaIndex];
    
    if (prevPersona && prevPersona.chapters && prevPersona.chapters.length > 0) {
      
      // Set flag to prevent auto-highlight interference
      isCrossPersonaNavigating = true;
      
      // Update persona and chapter indices
      currentPersonaIndex = prevPersonaIndex;
      currentPersona = { 
        name: prevPersona.name, 
        title: prevPersona.businessTitle || prevPersona.title, 
        headshot: prevPersona.headshot, 
        index: currentPersonaIndex 
      };
      allChapters = prevPersona.chapters;
      currentChapterIndex = prevPersona.chapters.length - 1; // Start at last chapter of previous persona
      
      updateOverlayContent();
      
      // Clear flag after a short delay to allow overlay to update
      setTimeout(() => {
        isCrossPersonaNavigating = false;
      }, 500);
    }
  }
}

function nextPersona() {
  if (allPersonas.length <= 1) return;
  currentPersonaIndex = (currentPersonaIndex + 1) % allPersonas.length;
  const persona = allPersonas[currentPersonaIndex];
  currentPersona = { 
    name: persona.name, 
    title: persona.businessTitle || persona.title, 
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
    title: persona.businessTitle || persona.title, 
    headshot: persona.headshot, 
    index: currentPersonaIndex 
  };
  currentChapterIndex = 0; // Reset to first chapter of new persona
  allChapters = persona.chapters || [];
  updateOverlayContent();
}

// Navigation functions for large overlay and pinned content view
function navigateHighlightedChapter(direction) {
  if (!overlayDiv || !isFullscreenMode || !allPersonas || allPersonas.length === 0) {
    return;
  }
  
  // If no persona is highlighted, highlight the first persona
  if (highlightedPersonaIndex < 0) {
    highlightedPersonaIndex = 0;
    updatePersonaHighlighting();
  }
  
  const currentPersona = allPersonas[highlightedPersonaIndex];
  if (!currentPersona || !currentPersona.chapters || currentPersona.chapters.length === 0) {
    return;
  }
  
  const chapters = currentPersona.chapters;
  
  if (direction === 'next') {
    if (selectedChapterIndex < chapters.length - 1) {
      selectedChapterIndex++;
    } else {
      // Wrap to first chapter
      selectedChapterIndex = 0;
    }
  } else if (direction === 'prev') {
    if (selectedChapterIndex > 0) {
      selectedChapterIndex--;
    } else {
      // Wrap to last chapter
      selectedChapterIndex = chapters.length - 1;
    }
  }
  
  // Sync the small overlay state with the highlighted selection
  if (highlightedPersonaIndex !== currentPersonaIndex) {
    currentPersonaIndex = highlightedPersonaIndex;
    currentPersona = { 
      name: currentPersona.name, 
      title: currentPersona.businessTitle || currentPersona.title, 
      headshot: currentPersona.headshot, 
      index: currentPersonaIndex 
    };
    allChapters = currentPersona.chapters || [];
  }
  
  currentChapterIndex = selectedChapterIndex;
  
  // Clear any existing highlighting first, then update the visual highlighting
  clearChapterSelection();
  updateChapterSelection();
  
  // Apply color scheme after highlighting is updated
  setTimeout(() => {
    applyColorScheme();
  }, 50);
  
  // Scroll to the selected chapter to ensure it's visible
  setTimeout(() => {
    const selectedChapterItem = overlayDiv.querySelector(`[data-persona-index="${highlightedPersonaIndex}"][data-chapter-index="${selectedChapterIndex}"]`);
    if (selectedChapterItem) {
      selectedChapterItem.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, 100);
  
  saveOverlayState();
  
  console.log(`Navigated to chapter ${selectedChapterIndex + 1} in persona ${currentPersona.name}`);
}

function navigateHighlightedPersona(direction) {
  if (!overlayDiv || !isFullscreenMode || !allPersonas || allPersonas.length === 0) {
    return;
  }
  
  if (direction === 'next') {
    if (highlightedPersonaIndex < allPersonas.length - 1) {
      highlightedPersonaIndex++;
    } else {
      // Wrap to first persona
      highlightedPersonaIndex = 0;
    }
  } else if (direction === 'prev') {
    if (highlightedPersonaIndex > 0) {
      highlightedPersonaIndex--;
    } else {
      // Wrap to last persona
      highlightedPersonaIndex = allPersonas.length - 1;
    }
  }
  
  // Reset chapter selection to first chapter of new persona
  const newPersona = allPersonas[highlightedPersonaIndex];
  if (newPersona && newPersona.chapters && newPersona.chapters.length > 0) {
    selectedChapterIndex = 0;
  } else {
    selectedChapterIndex = -1;
  }
  
  // Sync the small overlay state with the highlighted selection
  currentPersonaIndex = highlightedPersonaIndex;
  currentPersona = { 
    name: newPersona.name, 
    title: newPersona.businessTitle || newPersona.title, 
    headshot: newPersona.headshot, 
    index: currentPersonaIndex 
  };
  allChapters = newPersona.chapters || [];
  currentChapterIndex = selectedChapterIndex;
  
  // Update the visual highlighting
  updatePersonaHighlighting();
  clearChapterSelection();
  updateChapterSelection();
  
  // Apply color scheme after highlighting is updated
  setTimeout(() => {
    applyColorScheme();
  }, 50);
  
  // Scroll to the selected chapter to ensure it's visible
  setTimeout(() => {
    const selectedChapterItem = overlayDiv.querySelector(`[data-persona-index="${highlightedPersonaIndex}"][data-chapter-index="${selectedChapterIndex}"]`);
    if (selectedChapterItem) {
      selectedChapterItem.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, 100);
  
  saveOverlayState();
  
  console.log(`Navigated to persona ${newPersona.name}, chapter ${selectedChapterIndex + 1}`);
}

function goToChapter(index) {
  if (index >= 0 && index < allChapters.length) {
    currentChapterIndex = index;
    updateOverlayContent();
    // Color scheme will be applied by updateOverlayContent
  }
}

function updateOverlayContent() {
  if (!overlayDiv || !currentStory || !currentPersona || allChapters.length === 0) {
    console.log('updateOverlayContent: Missing required data', {
      overlayDiv: !!overlayDiv,
      currentStory: !!currentStory,
      currentPersona: !!currentPersona,
      allChaptersLength: allChapters.length
    });
    return;
  }
  
  const chapter = allChapters[currentChapterIndex];
  const headshotSrc = currentPersona.headshot || currentPersona.fallbackHeadshot || getConsistentHeadshot(currentPersona.name);
  
  console.log('updateOverlayContent: Updating with', {
    chapterIndex: currentChapterIndex,
    chapterTitle: chapter?.title,
    personaName: currentPersona.name,
    headshotSrc: headshotSrc
  });
  
  
  // Simple progress calculation - show current chapter out of total chapters
  const progressText = showProgressIndicators && allChapters.length > 1 ? `${currentChapterIndex + 1}/${allChapters.length}` : '';
  
  // Only apply size and position classes if not in fullscreen mode
  if (!overlayDiv.classList.contains('fullscreen')) {
    overlayDiv.className = `size-${currentOverlaySize} position-${currentOverlayPosition}`;
  }
  
  // Ensure we only show the current chapter, not all chapters
  const chapterTitle = chapter ? chapter.title : 'No chapter';
  const chapterDrivers = chapter ? chapter.valueDrivers : [];
  
  // Determine if arrow buttons should be shown
  // Show arrows if: multiple chapters OR (cross-persona navigation enabled AND multiple personas)
  const showArrows = (allChapters.length > 1 || (crossPersonaNavigation && allPersonas.length > 1)) && !shortcutsEnabled;
  const isFirstChapter = currentChapterIndex === 0;
  const isLastChapter = currentChapterIndex === allChapters.length - 1;
  
  // For cross-persona navigation, allow navigation even at first/last chapter
  const canGoPrevious = !isFirstChapter || (crossPersonaNavigation && allPersonas.length > 1);
  const canGoNext = !isLastChapter || (crossPersonaNavigation && allPersonas.length > 1);
  
  // Check if current chapter has a screenshot
  const hasExistingScreenshot = chapter && chapter.screenshot && chapter.screenshot.startsWith('data:image');
  const screenshotButtonText = hasExistingScreenshot ? 'Replace current screenshot' : 'Capture Screenshot';
  const screenshotButtonClass = hasExistingScreenshot ? 'screenshot-capture-btn screenshot-replace-btn' : 'screenshot-capture-btn';
  
  
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
    <div class="chapter clickable-chapter" data-action="expand-to-previous-view" title="Expand to previous view">${chapterTitle}</div>
    ${screenshotModeEnabled ? `
      <button class="${screenshotButtonClass}" data-action="capture-screenshot" title="${screenshotButtonText}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        ${screenshotButtonText}
      </button>
    ` : ''}
    <ul class="drivers">
      ${chapterDrivers.map(d => `<li>${d}</li>`).join("")}
    </ul>
    ${showArrows ? `
      <div class="arrow-nav">
        <button class="arrow-button" data-action="prev-chapter" title="Previous chapter" ${!canGoPrevious ? 'disabled' : ''}>←</button>
        <button class="arrow-button" data-action="next-chapter" title="Next chapter" ${!canGoNext ? 'disabled' : ''}>→</button>
      </div>
    ` : ''}
  `;
  
  // Force display update and ensure visibility
  overlayDiv.style.display = "block";
  console.log('updateOverlayContent: Content updated and display forced');
  
  // Apply color scheme after content is updated
  setTimeout(() => {
    applyColorScheme();
  }, 10);
}

// Click event handlers
document.addEventListener('click', (e) => {
  if (!overlayDiv || overlayDiv.style.display === 'none') return;
  if (!e.target || typeof e.target.getAttribute !== 'function') return;
  
  const action = e.target.closest('[data-action]')?.getAttribute('data-action');
  if (action === 'next-chapter') {
    nextChapter();
  } else if (action === 'prev-chapter') {
    previousChapter();
  } else if (action === 'expand-overlay') {
    toggleFullscreen();
  } else if (action === 'expand-to-previous-view') {
    expandToPreviousView();
  } else if (action === 'capture-screenshot') {
    captureScreenshotForCurrentChapter(e.target.closest('[data-action]'));
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
    'toggle-overlay': 'Ctrl+Shift+H',
    'toggle-fullscreen': 'Ctrl+Shift+O',
    'next-chapter': 'Ctrl+Shift+ArrowRight',
    'prev-chapter': 'Ctrl+Shift+ArrowLeft',
    'next-persona': 'Ctrl+Shift+ArrowDown',
    'prev-persona': 'Ctrl+Shift+ArrowUp',
    'save-url': 'Ctrl+Shift+S',
    'toggle-shift': 'Ctrl+Shift+P'
  };
  
  return customShortcuts[action] || defaultShortcuts[action];
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Escape key always works regardless of shortcuts toggle state
  if (e.key === 'Escape') {
    e.preventDefault();
    // Check if close overlay all tabs setting is enabled
    chrome.storage.local.get(['closeOverlayAllTabs'], (result) => {
      const closeAllTabs = result.closeOverlayAllTabs !== false; // Default to true
      if (closeAllTabs) {
        // Send message to close all overlays across tabs
        chrome.runtime.sendMessage({ action: 'closeAllOverlays' });
      } else {
        // Just close the current tab's overlay
        destroyOverlay();
      }
    });
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
      
      // Restore pinned content state if it was active before hiding
      const wasContentShifted = localStorage.getItem('wasContentShifted') === 'true';
      const wasFullscreenMode = localStorage.getItem('wasFullscreenMode') === 'true';
      const wasMinimalPadding = localStorage.getItem('wasMinimalPadding') === 'true';
      if (wasContentShifted) {
        isContentShifted = true;
        // Also restore fullscreen mode if it was active (pinned content view uses fullscreen class)
        if (wasFullscreenMode) {
          isFullscreenMode = true;
          overlayDiv.classList.add('fullscreen');
          overlayDiv.className = 'fullscreen';
        }
        document.body.classList.add('responsive-mode');
        
        // Apply minimal padding if it was active before hiding
        if (wasMinimalPadding) {
          overlayDiv.classList.add('minimal-padding');
        }
        
        // Restore content pin with stored overlay width for precise restoration
        const storedWidth = localStorage.getItem('storedOverlayWidth');
        if (storedWidth) {
          // Set the exact width that was stored
          overlayDiv.style.width = storedWidth + 'px';
          setTimeout(() => {
            const actualWidth = overlayDiv.getBoundingClientRect().width;
            updateContentShift(actualWidth);
          }, 0);
        } else {
          // Fallback to current width if stored width not available
          const currentWidth = overlayDiv.getBoundingClientRect().width;
          updateContentShift(currentWidth);
        }
        
        // Clear the stored state
        localStorage.removeItem('wasContentShifted');
        localStorage.removeItem('wasFullscreenMode');
        localStorage.removeItem('storedOverlayWidth');
        localStorage.removeItem('wasMinimalPadding');
      }
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
      // Toggle between small overlay and large overlay view
      if (overlayDiv.classList.contains('fullscreen')) {
        // Currently in large overlay, switch to small overlay
        toggleFullscreen();
      } else {
        // Currently in small overlay, switch to large overlay
        toggleFullscreen();
      }
    }
    return;
  }
  
  // Only process other shortcuts if overlay is visible
  if (!overlayDiv || overlayDiv.style.display === 'none') return;
  
  // Check for next chapter shortcut
  if (matchesShortcut(e, getShortcutForAction('next-chapter'))) {
    e.preventDefault();
    if (overlayDiv.classList.contains('fullscreen')) {
      // In large overlay or pinned content view, navigate highlighted chapter
      navigateHighlightedChapter('next');
    } else {
      // In small overlay view, use existing behavior
      nextChapter();
    }
    return;
  }
  
  // Check for previous chapter shortcut
  if (matchesShortcut(e, getShortcutForAction('prev-chapter'))) {
    e.preventDefault();
    if (overlayDiv.classList.contains('fullscreen')) {
      // In large overlay or pinned content view, navigate highlighted chapter
      navigateHighlightedChapter('prev');
    } else {
      // In small overlay view, use existing behavior
      previousChapter();
    }
    return;
  }
  
  // Check for next persona shortcut
  if (matchesShortcut(e, getShortcutForAction('next-persona'))) {
    e.preventDefault();
    if (overlayDiv.classList.contains('fullscreen')) {
      // In large overlay or pinned content view, navigate highlighted persona
      navigateHighlightedPersona('next');
    } else {
      // In small overlay view, use existing behavior
      nextPersona();
    }
    return;
  }
  
  // Check for previous persona shortcut
  if (matchesShortcut(e, getShortcutForAction('prev-persona'))) {
    e.preventDefault();
    if (overlayDiv.classList.contains('fullscreen')) {
      // In large overlay or pinned content view, navigate highlighted persona
      navigateHighlightedPersona('prev');
    } else {
      // In small overlay view, use existing behavior
      previousPersona();
    }
    return;
  }
  
  // Check for save URL shortcut
  if (matchesShortcut(e, getShortcutForAction('save-url'))) {
    e.preventDefault();
    saveCurrentPageUrlToChapter();
    return;
  }
  
  // Check for toggle content pin shortcut
  if (matchesShortcut(e, getShortcutForAction('toggle-shift'))) {
    e.preventDefault();
    
    if (overlayDiv && overlayDiv.classList.contains('fullscreen')) {
      // Currently in large overlay, toggle content shift (existing behavior)
      toggleContentShift();
    } else if (overlayDiv && !overlayDiv.classList.contains('fullscreen')) {
      // Currently in small overlay, switch to pinned sidepanel view
      // First enter fullscreen mode, then shift content
      overlayDiv.classList.add('fullscreen');
      isFullscreenMode = true;
      overlayDiv.className = 'fullscreen';
      
      // Enter pinned content mode
      isContentShifted = true;
      lastFullscreenMode = 'pinned'; // Track that user entered pinned mode
      document.body.classList.add('responsive-mode');
      
      // Apply minimal padding if setting is enabled
      if (minimalPaddingPinned) {
        overlayDiv.classList.add('minimal-padding');
        // Try to restore saved minimal padding width first
        const savedMinimalWidth = localStorage.getItem('demoOverlayWidthMinimalPadding');
        if (savedMinimalWidth) {
          overlayDiv.style.width = savedMinimalWidth + 'px';
          setTimeout(() => {
            const actualWidth = overlayDiv.getBoundingClientRect().width;
            updateContentShift(actualWidth);
          }, 0);
        } else {
          // Apply 25% width reduction if no saved width
          const currentWidth = overlayDiv.getBoundingClientRect().width;
          const reducedWidth = currentWidth * 0.75;
          overlayDiv.style.width = reducedWidth + 'px';
          setTimeout(() => {
            const actualWidth = overlayDiv.getBoundingClientRect().width;
            updateContentShift(actualWidth);
          }, 0);
        }
      } else {
        const currentWidth = overlayDiv.getBoundingClientRect().width;
        updateContentShift(currentWidth);
      }
      
      updateShiftContentButton();
      saveOverlayState();
      
      // Show the complete story summary (same as Shift+O)
      showFullscreenSummary();
      
      // Highlight current chapter from small overlay after content is rendered
      setTimeout(() => {
        highlightCurrentChapterFromSmallOverlay();
      }, 100);
    }
    return;
  }
});

function hideOverlay() {
  if (!overlayDiv) return;
  
  // Add hiding animation class
  overlayDiv.classList.add('hiding');
  
  // Store the pinned state before hiding
  const wasContentShifted = isContentShifted;
  const wasFullscreenMode = isFullscreenMode;
  
  // Store the pinned state for restoration
  if (wasContentShifted) {
    localStorage.setItem('wasContentShifted', 'true');
    // Also store fullscreen mode state if it was active
    if (wasFullscreenMode) {
      localStorage.setItem('wasFullscreenMode', 'true');
    }
    // Store the current overlay width for precise restoration
    const currentWidth = overlayDiv.getBoundingClientRect().width;
    localStorage.setItem('storedOverlayWidth', currentWidth.toString());
    // Store minimal padding state for proper restoration
    if (minimalPaddingPinned) {
      localStorage.setItem('wasMinimalPadding', 'true');
    }
  }
  
  // Update state
  isOverlayVisible = false;
  isFullscreenMode = false;
  saveOverlayState();
  
  // Hide after animation completes, then unpin content
  setTimeout(() => {
    overlayDiv.style.display = 'none';
    overlayDiv.classList.remove('hiding');
    
    // Now unpin content after overlay is hidden to prevent visual resizing
    if (wasContentShifted) {
      document.body.classList.remove('responsive-mode');
      cleanupContentShift();
    }
  }, 300);
}

function destroyOverlay() {
  if (!overlayDiv) return;
  
  // Reset content pin state and remove responsive mode
  if (isContentShifted) {
    isContentShifted = false;
    document.body.classList.remove('responsive-mode');
    cleanupContentShift();
  }
  
  // Clear any stored pinned state
  localStorage.removeItem('wasContentShifted');
  
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
          
          // Update persona highlighting to ensure all other personas are greyed out
          updatePersonaHighlighting();
          
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
    
    // Clear any existing highlighting first
    clearChapterSelection();
    
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
      
      // Update persona highlighting to ensure all other personas are greyed out
      updatePersonaHighlighting();
      
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
    
    // Apply color scheme after highlighting is restored
    setTimeout(() => {
      applyColorScheme();
    }, 50);
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
            // Clear any existing chapter highlighting first
            clearChapterSelection();
            
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
            
            // Apply color scheme after highlighting is updated
            setTimeout(() => {
              applyColorScheme();
            }, 50);
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
      // Clear any existing chapter highlighting first
      clearChapterSelection();
      
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
      
      // Apply color scheme after highlighting is updated
      setTimeout(() => {
        applyColorScheme();
      }, 50);
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
      // Clear cross-persona navigation flag before navigating to allow highlighting
      isCrossPersonaNavigating = false;
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
  
  
  // Remove both selected and current-chapter-highlight classes from all chapters
  const allChapterItems = overlayDiv.querySelectorAll('.chapter-item');
  allChapterItems.forEach(item => {
    item.classList.remove('selected', 'current-chapter-highlight');
  });
  
  // Add selected class to the current selection
  if (highlightedPersonaIndex >= 0 && selectedChapterIndex >= 0) {
    const selectedChapterItem = overlayDiv.querySelector(`[data-persona-index="${highlightedPersonaIndex}"][data-chapter-index="${selectedChapterIndex}"]`);
    if (selectedChapterItem) {
      selectedChapterItem.classList.add('selected');
      
      // Also ensure the containing persona is highlighted
      const personaCard = selectedChapterItem.closest('.persona-card');
      if (personaCard) {
        personaCard.classList.add('highlighted');
        personaCard.classList.remove('not-highlighted');
      }
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
      // Use the highlightedPersonaIndex directly instead of findIndex
      const personaIndex = highlightedPersonaIndex;
      
      if (personaIndex !== -1 && personaIndex < stories[storyIndex].personas.length && stories[storyIndex].personas[personaIndex].chapters.length > 0) {
        stories[storyIndex].personas[personaIndex].chapters[0].url = url;
        
        chrome.storage.local.set({ stories }, () => {
          console.log('URL saved to first chapter of selected persona:', url);
          showUrlSavedNotification(`URL saved to ${selectedPersona.name} - ${firstChapter.title}!`);
          
          // Update overlay content to refresh navigation buttons and URL buttons
          if (overlayDiv && isOverlayVisible) {
            if (isFullscreenMode) {
              // Refresh fullscreen overlay to show new URL buttons
              showFullscreenSummary();
            } else {
              // Refresh small overlay to show navigation buttons
              updateOverlayContent();
            }
          }
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
      // Use the highlightedPersonaIndex directly instead of findIndex
      const personaIndex = highlightedPersonaIndex;
      
      if (personaIndex !== -1 && personaIndex < stories[storyIndex].personas.length && selectedChapterIndex < stories[storyIndex].personas[personaIndex].chapters.length) {
        stories[storyIndex].personas[personaIndex].chapters[selectedChapterIndex].url = url;
        
        chrome.storage.local.set({ stories }, () => {
          console.log('URL saved to selected chapter:', url);
          showUrlSavedNotification(`URL saved to ${selectedPersona.name} - ${selectedChapter.title}!`);
          
          // Update overlay content to refresh navigation buttons and URL buttons
          if (overlayDiv && isOverlayVisible) {
            if (isFullscreenMode) {
              // Refresh fullscreen overlay to show new URL buttons
              showFullscreenSummary();
            } else {
              // Refresh small overlay to show navigation buttons
              updateOverlayContent();
            }
          }
        });
      }
    }
  });
}

// Save current page URL to current chapter (only works in fullscreen mode)
function saveCurrentPageUrlToChapter() {
  const currentUrl = window.location.href;
  
  // Only allow URL saving in pinned content view
  if (!isFullscreenMode) {
    console.log('URL saving is only available in pinned content view. Please expand the overlay first.');
    showUrlSavedNotification('URL saving is only available in pinned content view. Please expand the overlay first.');
    return;
  }
  
  // Check if we're in large overlay mode with a selected persona
  if (highlightedPersonaIndex >= 0) {
    if (selectedChapterIndex >= 0) {
      console.log('Saving URL to selected chapter in large overlay');
      saveUrlToSelectedChapter(currentUrl);
    } else {
      console.log('Saving URL to first chapter of selected persona in large overlay');
      saveUrlToFirstChapterOfPersona(currentUrl);
    }
    return;
  }
  
  // If no persona is selected in fullscreen mode, show error
  console.log('No persona selected in fullscreen mode. Please select a persona first.');
  showUrlSavedNotification('Please select a persona first, then a chapter to save the URL to.');
}

// Show notification when URL is saved
function showUrlSavedNotification(message = 'URL saved to current chapter!') {
  // Create a temporary notification
  const notification = document.createElement('div');
  
  // Determine if this is an error message requiring user action
  const isError = message.includes('only available') || message.includes('Please select') || message.includes('Please expand');
  
  // Use different colors for success vs error messages
  const backgroundColor = isError 
    ? 'linear-gradient(135deg, #FF9500 0%, #FF6B35 100%)'  // Orange/amber for errors
    : 'linear-gradient(135deg, #63DF4E 0%, #52B8FF 100%)'; // Green/blue for success
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${backgroundColor};
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

// Helper function to get logo URL (custom or default)
function getLogoUrl() {
  return customLogo || chrome.runtime.getURL('icons/logo-solo.png');
}

function showFullscreenSummary() {
  console.log('showFullscreenSummary called - overlayDiv:', !!overlayDiv, 'currentStory:', currentStory, 'allPersonas length:', allPersonas ? allPersonas.length : 'null');
  if (!overlayDiv || !currentStory || !allPersonas) {
    console.log('showFullscreenSummary early return - missing required data');
    return;
  }
  
  // Apply minimal padding class if setting is enabled and in pinned content mode
  if (minimalPaddingPinned && isContentShifted) {
    overlayDiv.classList.add('minimal-padding');
    // Try to restore saved minimal padding width first
    const savedMinimalWidth = localStorage.getItem('demoOverlayWidthMinimalPadding');
    if (savedMinimalWidth) {
      overlayDiv.style.width = savedMinimalWidth + 'px';
      setTimeout(() => {
        const actualWidth = overlayDiv.getBoundingClientRect().width;
        updateContentShift(actualWidth);
      }, 0);
    } else {
      // Apply 25% width reduction if no saved width
      const currentWidth = overlayDiv.getBoundingClientRect().width;
      const reducedWidth = currentWidth * 0.75;
      overlayDiv.style.width = reducedWidth + 'px';
      setTimeout(() => {
        const actualWidth = overlayDiv.getBoundingClientRect().width;
        updateContentShift(actualWidth);
      }, 0);
    }
  } else {
    overlayDiv.classList.remove('minimal-padding');
    // Restore normal width
    const savedWidth = localStorage.getItem('demoOverlayWidth');
    if (savedWidth) {
      overlayDiv.style.width = savedWidth + 'px';
      setTimeout(() => {
        const actualWidth = overlayDiv.getBoundingClientRect().width;
        updateContentShift(actualWidth);
      }, 0);
    } else {
      const currentWidth = overlayDiv.getBoundingClientRect().width;
      updateContentShift(currentWidth);
    }
  }
  
  // Ensure completed chapters are loaded from localStorage
  loadCompletedChapters();
  
  const storyName = (typeof currentStory === 'string') ? currentStory : (currentStory ? currentStory.name : 'Demo Story');
  
  const personasHTML = allPersonas.map((persona, personaIndex) => {
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
      
      const isSelected = highlightedPersonaIndex === personaIndex && selectedChapterIndex === index;
      
      return `
        <div class="chapter-item ${isCompleted ? 'completed' : ''} ${isSelected ? 'selected' : ''}" data-persona-index="${personaIndex}" data-chapter-index="${index}">
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
      <div class="persona-card" data-persona-index="${personaIndex}" data-persona-name="${persona.name}">
        ${collapseButtonEnabled ? `
        <button class="collapse-btn" data-persona-index="${personaIndex}" title="Collapse/Expand chapters">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
        ` : ''}
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
        <img src="${getLogoUrl()}" alt="Logo" class="header-logo">
        <div class="button-group">
          <button class="control-btn icon-btn" id="sessionNotesBtn" title="Session Notes">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
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
  
  // Add event listener for session notes button
  const sessionNotesBtn = overlayDiv.querySelector('#sessionNotesBtn');
  if (sessionNotesBtn) {
    sessionNotesBtn.addEventListener('click', openSessionNotesModal);
  }
  
  // Add event listener for back button
  const backButton = overlayDiv.querySelector('#backButton');
  if (backButton) {
    backButton.addEventListener('click', toggleFullscreen);
  }
  
  // Add event listener for pin content toggle
  const shiftContentToggle = overlayDiv.querySelector('#shiftContentToggle');
  if (shiftContentToggle) {
    shiftContentToggle.addEventListener('click', togglePinContent);
  }
  
  // Add event listeners for URL buttons
  const urlButtons = overlayDiv.querySelectorAll('.url-button');
  urlButtons.forEach(button => {
    button.addEventListener('click', handleUrlButtonClick);
  });
  
  // Add event listeners for collapse buttons (only if enabled)
  if (collapseButtonEnabled) {
    const collapseButtons = overlayDiv.querySelectorAll('.collapse-btn');
    collapseButtons.forEach(button => {
      button.addEventListener('click', handleCollapseClick);
    });
  }
  
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

// Session Notes Functions
async function openSessionNotesModal() {
  console.log('Opening session notes modal');
  
  // Load session notes for current story
  await loadSessionNotes();
  
  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'sessionNotesModalOverlay';
  modalOverlay.className = 'session-notes-modal-overlay';
  
  // Create modal content
  const notesHTML = currentSessionNotes.map((note, index) => `
    <div class="session-note-item ${note.checked ? 'checked' : ''}">
      <input type="checkbox" class="note-checkbox" data-note-index="${index}" ${note.checked ? 'checked' : ''}>
      <span class="note-text">${escapeHtml(note.text)}</span>
      <div class="note-actions">
        <button class="note-copy-btn" data-note-index="${index}" data-note-text="${escapeHtml(note.text).replace(/"/g, '&quot;')}" title="Copy note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button class="note-delete-btn" data-note-index="${index}" title="Delete note">×</button>
      </div>
    </div>
  `).join('');
  
  modalOverlay.innerHTML = `
    <div class="session-notes-modal">
      <div class="session-notes-header">
        <h2>Session Notes</h2>
        <div class="session-notes-header-actions">
          ${currentSessionNotes.length > 0 ? '<button class="clear-all-btn" id="clearAllNotesBtn" title="Clear all notes">Clear All</button>' : ''}
          <button class="session-notes-close" id="closeSessionNotesModal">×</button>
        </div>
      </div>
      <div class="session-notes-body">
        <div class="session-notes-list" id="sessionNotesList">
          ${notesHTML || '<div class="empty-notes">No notes yet. Add your first note below!</div>'}
        </div>
        <div class="session-notes-input-container">
          <textarea id="newNoteInput" class="session-note-input" placeholder="Enter a new note... (Shift+Enter for new line, Enter to add)"></textarea>
          <button id="addNoteBtn" class="add-note-btn">Add Note</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modalOverlay);
  
  // Add event listeners
  document.getElementById('closeSessionNotesModal').addEventListener('click', closeSessionNotesModal);
  
  const clearAllBtn = document.getElementById('clearAllNotesBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAllNotes);
  }
  
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeSessionNotesModal();
    }
  });
  
  // Add Escape key listener with stop propagation
  sessionNotesEscapeHandler = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeSessionNotesModal();
    }
  };
  // Use capture phase to intercept before overlay's listener
  document.addEventListener('keydown', sessionNotesEscapeHandler, true);
  
  document.getElementById('addNoteBtn').addEventListener('click', addSessionNote);
  document.getElementById('newNoteInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addSessionNote();
    }
    // Shift+Enter allows new line (default behavior)
  });
  
  // Add event delegation for checkboxes and delete buttons
  const notesList = document.getElementById('sessionNotesList');
  notesList.addEventListener('change', (e) => {
    if (e.target.classList.contains('note-checkbox')) {
      const index = parseInt(e.target.dataset.noteIndex);
      toggleNoteChecked(index);
    }
  });
  
  notesList.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.note-copy-btn');
    const deleteBtn = e.target.closest('.note-delete-btn');
    
    if (copyBtn) {
      const index = parseInt(copyBtn.dataset.noteIndex);
      copyNoteToClipboard(index, copyBtn);
    } else if (deleteBtn) {
      const index = parseInt(deleteBtn.dataset.noteIndex);
      deleteSessionNote(index);
    }
  });
  
  // Focus input
  setTimeout(() => {
    document.getElementById('newNoteInput').focus();
  }, 100);
}

function closeSessionNotesModal() {
  const modalOverlay = document.getElementById('sessionNotesModalOverlay');
  if (modalOverlay) {
    modalOverlay.remove();
  }
  
  // Remove escape key listener
  if (sessionNotesEscapeHandler) {
    document.removeEventListener('keydown', sessionNotesEscapeHandler, true);
    sessionNotesEscapeHandler = null;
  }
}

function addSessionNote() {
  const input = document.getElementById('newNoteInput');
  const noteText = input.value.trim();
  
  if (!noteText) {
    return;
  }
  
  // Add note to current session notes
  currentSessionNotes.push({
    text: noteText,
    checked: false,
    timestamp: Date.now()
  });
  
  // Save to storage
  saveSessionNotes();
  
  // Clear input
  input.value = '';
  
  // Refresh modal content
  refreshSessionNotesModal();
  
  // Focus input again
  input.focus();
}

function toggleNoteChecked(index) {
  if (index >= 0 && index < currentSessionNotes.length) {
    currentSessionNotes[index].checked = !currentSessionNotes[index].checked;
    saveSessionNotes();
    refreshSessionNotesModal();
  }
}

function deleteSessionNote(index) {
  if (index >= 0 && index < currentSessionNotes.length) {
    currentSessionNotes.splice(index, 1);
    saveSessionNotes();
    refreshSessionNotesModal();
  }
}

function copyNoteToClipboard(index, buttonElement) {
  if (index >= 0 && index < currentSessionNotes.length) {
    const noteText = currentSessionNotes[index].text;
    
    // Use the Clipboard API
    navigator.clipboard.writeText(noteText).then(() => {
      // Show visual feedback on button
      buttonElement.classList.add('copied');
      const originalTitle = buttonElement.title;
      buttonElement.title = 'Copied!';
      
      // Show toast notification
      showCopyNotification();
      
      // Reset button after 2 seconds
      setTimeout(() => {
        buttonElement.classList.remove('copied');
        buttonElement.title = originalTitle;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy note:', err);
      alert('Failed to copy note to clipboard');
    });
  }
}

function showCopyNotification() {
  // Remove any existing notification
  const existingNotification = document.querySelector('.copy-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = 'copy-notification';
  notification.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
    <span>Note copied to clipboard!</span>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 2 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideOutToRight 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }
  }, 2000);
}

function clearAllNotes() {
  if (currentSessionNotes.length === 0) return;
  
  if (confirm(`Are you sure you want to delete all ${currentSessionNotes.length} note(s)?`)) {
    currentSessionNotes = [];
    saveSessionNotes();
    refreshSessionNotesModal();
  }
}

function refreshSessionNotesModal() {
  const notesList = document.getElementById('sessionNotesList');
  if (!notesList) return;
  
  const notesHTML = currentSessionNotes.map((note, index) => `
    <div class="session-note-item ${note.checked ? 'checked' : ''}">
      <input type="checkbox" class="note-checkbox" data-note-index="${index}" ${note.checked ? 'checked' : ''}>
      <span class="note-text">${escapeHtml(note.text)}</span>
      <div class="note-actions">
        <button class="note-copy-btn" data-note-index="${index}" data-note-text="${escapeHtml(note.text).replace(/"/g, '&quot;')}" title="Copy note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button class="note-delete-btn" data-note-index="${index}" title="Delete note">×</button>
      </div>
    </div>
  `).join('');
  
  notesList.innerHTML = notesHTML || '<div class="empty-notes">No notes yet. Add your first note below!</div>';
  
  // Update Clear All button visibility
  const headerActions = document.querySelector('.session-notes-header-actions');
  if (headerActions) {
    const existingClearBtn = document.getElementById('clearAllNotesBtn');
    if (currentSessionNotes.length > 0 && !existingClearBtn) {
      // Add Clear All button if notes exist and button doesn't
      const clearBtn = document.createElement('button');
      clearBtn.className = 'clear-all-btn';
      clearBtn.id = 'clearAllNotesBtn';
      clearBtn.title = 'Clear all notes';
      clearBtn.textContent = 'Clear All';
      clearBtn.addEventListener('click', clearAllNotes);
      headerActions.insertBefore(clearBtn, headerActions.firstChild);
    } else if (currentSessionNotes.length === 0 && existingClearBtn) {
      // Remove Clear All button if no notes
      existingClearBtn.remove();
    }
  }
}

function loadSessionNotes() {
  return new Promise((resolve) => {
    if (currentStoryIndex === null) {
      resolve();
      return;
    }
    
    chrome.storage.local.get(['stories'], (result) => {
      const stories = result.stories || [];
      if (stories[currentStoryIndex]) {
        currentSessionNotes = stories[currentStoryIndex].sessionNotes || [];
        console.log('Loaded session notes:', currentSessionNotes);
      }
      resolve();
    });
  });
}

function saveSessionNotes() {
  if (currentStoryIndex === null) return;
  
  chrome.storage.local.get(['stories'], (result) => {
    const stories = result.stories || [];
    if (stories[currentStoryIndex]) {
      stories[currentStoryIndex].sessionNotes = currentSessionNotes;
      chrome.storage.local.set({ stories }, () => {
        console.log('Session notes saved:', currentSessionNotes);
      });
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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
    
    // Clear inline styles that were applied by custom themes
    item.style.removeProperty('background');
    item.style.removeProperty('border-color');
    item.style.removeProperty('box-shadow');
    
    // Clear chapter title inline styles
    const chapterTitle = item.querySelector('.chapter-title');
    if (chapterTitle) {
      chapterTitle.style.removeProperty('color');
    }
  });
  
  // Note: We don't clear persona highlighting here because it should be preserved
  // when a chapter within that persona is selected
}

// Highlight current chapter from small overlay when opening large overlay
function highlightCurrentChapterFromSmallOverlay() {
  if (!overlayDiv || !isFullscreenMode || !currentPersona || !allPersonas) {
    return;
  }
  
  
  // Clear any existing manual selections first
  clearChapterSelection();
  
  // Find the persona index in the large overlay using actual array index
  const personaIndex = allPersonas.indexOf(currentPersona);
  if (personaIndex === -1) {
    return;
  }
  
  // Set the highlighted indices to match the small overlay state
  highlightedPersonaIndex = personaIndex;
  selectedChapterIndex = currentChapterIndex;
  
      // Update the visual highlighting using the proper functions
      updatePersonaHighlighting();
      updateChapterSelection();
      
      // Apply color scheme after highlighting classes are applied
      setTimeout(() => {
        applyColorScheme();
      }, 50);
  
  // Find the chapter element for scrolling
  const chapterElement = overlayDiv.querySelector(`[data-persona-index="${personaIndex}"][data-chapter-index="${currentChapterIndex}"]`);
  if (chapterElement) {
    
    // Scroll to the chapter element
    setTimeout(() => {
      chapterElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
    }, 100);
  }
  
  // Save the state to ensure consistency
  saveOverlayState();
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
  
  // Don't handle chapter clicks if it's a URL button click
  if (e.target.classList.contains('url-button') || e.target.closest('.url-button')) {
    console.log('Chapter click ignored - URL button click');
    return;
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
      
      // Also update currentChapterIndex to match selectedChapterIndex to prevent storage conflicts
      currentChapterIndex = chapterIndex;
      
      
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
        
      }
      
      updateChapterSelection();
      updatePersonaHighlighting();
      
      // Also add current-chapter-highlight class for consistency with initial highlighting
      const selectedChapterItem = overlayDiv.querySelector(`[data-persona-index="${personaIndex}"][data-chapter-index="${chapterIndex}"]`);
      if (selectedChapterItem) {
        selectedChapterItem.classList.add('current-chapter-highlight');
      }
      
      // Apply color scheme after highlighting is updated
      setTimeout(() => {
        applyColorScheme();
      }, 50);
      
      
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
    if (isContentShifted) {
      // Prevent the chapter click from bubbling up to persona click handler
      e.stopPropagation();
      return;
    }
    
    navigateToChapter(personaIndex, chapterIndex);
  }
}

function handleCollapseClick(e) {
  e.stopPropagation(); // Prevent bubbling to persona card
  
  const button = e.target.closest('.collapse-btn');
  if (!button) return;
  
  const personaIndex = button.getAttribute('data-persona-index');
  const personaCard = button.closest('.persona-card');
  
  if (personaCard) {
    // Toggle collapsed class on the persona card
    personaCard.classList.toggle('collapsed');
    
    // Toggle collapsed class on the button
    button.classList.toggle('collapsed');
    
    console.log('Persona card collapsed:', personaCard.classList.contains('collapsed'));
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
      
      // Apply color scheme after highlighting is updated
      setTimeout(() => {
        applyColorScheme();
      }, 50);
      
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
    lastFullscreenMode = 'pinned'; // Track that user entered pinned mode
    document.body.classList.add('responsive-mode');
    
    // Apply minimal padding if setting is enabled
    if (minimalPaddingPinned) {
      overlayDiv.classList.add('minimal-padding');
      // Try to restore saved minimal padding width first
      const savedMinimalWidth = localStorage.getItem('demoOverlayWidthMinimalPadding');
      if (savedMinimalWidth) {
        overlayDiv.style.width = savedMinimalWidth + 'px';
        setTimeout(() => {
          const actualWidth = overlayDiv.getBoundingClientRect().width;
          updateContentShift(actualWidth);
        }, 0);
      } else {
        // Apply 25% width reduction if no saved width
        const currentWidth = overlayDiv ? overlayDiv.getBoundingClientRect().width : 400;
        const reducedWidth = currentWidth * 0.75;
        overlayDiv.style.width = reducedWidth + 'px';
        setTimeout(() => {
          const actualWidth = overlayDiv.getBoundingClientRect().width;
          updateContentShift(actualWidth);
        }, 0);
      }
    } else {
      // Update content pin with current overlay width
      const currentWidth = overlayDiv ? overlayDiv.getBoundingClientRect().width : 400;
      updateContentShift(currentWidth);
    }
    console.log('Content will be pinned to make room for overlay');
  } else {
    // If we're in fullscreen mode and unshifting content, return to small overlay
    if (overlayDiv && overlayDiv.classList.contains('fullscreen')) {
      console.log('Returning to small overlay from pinned sidepanel view');
      
      // Remove minimal padding class if it was applied
      overlayDiv.classList.remove('minimal-padding');
      
      // Restore original width if minimal padding was applied
      if (minimalPaddingPinned) {
        const savedWidth = localStorage.getItem('demoOverlayWidth');
        if (savedWidth) {
          overlayDiv.style.width = savedWidth + 'px';
        }
      }
      
      // Store the current state before exiting
      const wasInShiftedContent = true;
      
      // Exit fullscreen mode
      overlayDiv.classList.remove('fullscreen');
      document.body.classList.remove('responsive-mode');
      cleanupContentShift();
      
      isFullscreenMode = false;
      isOverlayVisible = true;
      isContentShifted = false;
      
      // Force update the small overlay variables if there's a selected chapter
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
      
      // Clear persona highlighting when exiting fullscreen
      clearPersonaHighlighting();
      
      // Save state
      saveOverlayState();
      
      // Apply the stored size and position classes
      overlayDiv.className = `size-${currentOverlaySize} position-${currentOverlayPosition}`;
      
      // Clear inline width style to let CSS classes control the small overlay dimensions
      overlayDiv.style.width = '';
      
      // Force a complete reset of the overlay content
      overlayDiv.innerHTML = '';
      
      // Then update with current chapter content
      setTimeout(() => {
        console.log('Updating small overlay content after Shift+P from pinned view');
        updateOverlayContent();
        // Apply color scheme after content is updated
        applyColorScheme();
      }, 50);
    } else {
      document.body.classList.remove('responsive-mode');
      cleanupContentShift();
      console.log('Overlay only - content stays in place');
    }
  }
  
  updateShiftContentButton();
  saveOverlayState();
}

// Toggle between large overlay and pinned content view (pin button behavior)
function togglePinContent() {
  if (!overlayDiv || !overlayDiv.classList.contains('fullscreen')) {
    return; // Only works in fullscreen mode
  }
  
  // Simply toggle the content shift state without exiting fullscreen
  isContentShifted = !isContentShifted;
  
  if (isContentShifted) {
    document.body.classList.add('responsive-mode');
    
    // Apply minimal padding if setting is enabled
    if (minimalPaddingPinned) {
      overlayDiv.classList.add('minimal-padding');
      // Try to restore saved minimal padding width first
      const savedMinimalWidth = localStorage.getItem('demoOverlayWidthMinimalPadding');
      if (savedMinimalWidth) {
        overlayDiv.style.width = savedMinimalWidth + 'px';
        setTimeout(() => {
          const actualWidth = overlayDiv.getBoundingClientRect().width;
          updateContentShift(actualWidth);
        }, 0);
      } else {
        // Apply 25% width reduction if no saved width
        const currentWidth = overlayDiv ? overlayDiv.getBoundingClientRect().width : 400;
        const reducedWidth = currentWidth * 0.75;
        overlayDiv.style.width = reducedWidth + 'px';
        setTimeout(() => {
          const actualWidth = overlayDiv.getBoundingClientRect().width;
          updateContentShift(actualWidth);
        }, 0);
      }
    } else {
      // Update content pin with current overlay width
      const currentWidth = overlayDiv ? overlayDiv.getBoundingClientRect().width : 400;
      updateContentShift(currentWidth);
    }
    console.log('Switched to pinned content view');
  } else {
    document.body.classList.remove('responsive-mode');
    cleanupContentShift();
    
    // Restore saved width if available
    const savedWidth = localStorage.getItem('demoOverlayWidth');
    if (savedWidth) {
      overlayDiv.style.width = savedWidth + 'px';
    }
    
    // Remove minimal padding class
    overlayDiv.classList.remove('minimal-padding');
    console.log('Switched to large overlay view');
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
// Expand from small overlay to the previous fullscreen view (large overlay or pinned content)
function expandToPreviousView() {
  if (!overlayDiv) return;
  
  console.log('Expanding to previous view:', lastFullscreenMode);
  
  if (lastFullscreenMode === 'pinned') {
    // Restore pinned content view
    // First enter fullscreen mode
    overlayDiv.classList.add('fullscreen');
    isFullscreenMode = true;
    overlayDiv.className = 'fullscreen';
    
    // Enter pinned content mode
    isContentShifted = true;
    document.body.classList.add('responsive-mode');
    
    // Apply minimal padding if setting is enabled
    if (minimalPaddingPinned) {
      overlayDiv.classList.add('minimal-padding');
      // Try to restore saved minimal padding width first
      const savedMinimalWidth = localStorage.getItem('demoOverlayWidthMinimalPadding');
      if (savedMinimalWidth) {
        overlayDiv.style.width = savedMinimalWidth + 'px';
        setTimeout(() => {
          const actualWidth = overlayDiv.getBoundingClientRect().width;
          updateContentShift(actualWidth);
        }, 0);
      } else {
        // Apply 25% width reduction if no saved width
        const currentWidth = overlayDiv.getBoundingClientRect().width;
        const reducedWidth = currentWidth * 0.75;
        overlayDiv.style.width = reducedWidth + 'px';
        setTimeout(() => {
          const actualWidth = overlayDiv.getBoundingClientRect().width;
          updateContentShift(actualWidth);
        }, 0);
      }
    } else {
      const currentWidth = overlayDiv.getBoundingClientRect().width;
      updateContentShift(currentWidth);
    }
    
    updateShiftContentButton();
    saveOverlayState();
    
    // Show the complete story summary
    showFullscreenSummary();
    
    // Highlight current chapter from small overlay after content is rendered
    setTimeout(() => {
      highlightCurrentChapterFromSmallOverlay();
    }, 100);
  } else {
    // Restore large overlay view (default)
    toggleFullscreen();
  }
}

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
    cleanupContentShift();
    
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
    
    // Clear inline width style to let CSS classes control the small overlay dimensions
    overlayDiv.style.width = '';
    
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
      // Apply color scheme after content is updated
      applyColorScheme();
    }, 50);
  } else {
    // Enter fullscreen (left side panel)
    overlayDiv.classList.add('fullscreen');
    isFullscreenMode = true;
    lastFullscreenMode = 'large'; // Track that user entered large overlay mode
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
                <img src="${getLogoUrl()}" alt="Logo" class="header-logo">
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
            shiftContentToggle.addEventListener('click', togglePinContent);
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
  // Check if close overlay all tabs setting is enabled
  chrome.storage.local.get(['closeOverlayAllTabs'], (result) => {
    const closeAllTabs = result.closeOverlayAllTabs !== false; // Default to true
    if (closeAllTabs) {
      // Send message to close all overlays across tabs
      chrome.runtime.sendMessage({ action: 'closeAllOverlays' });
    } else {
      // Just close the current tab's overlay
      destroyOverlay();
    }
  });
  document.body.classList.remove('responsive-mode');
  cleanupContentShift();
  
  isContentShifted = false;
});

// =======================
// Screenshot Capture Functions
// =======================

/**
 * Capture screenshot for the current chapter
 */
async function captureScreenshotForCurrentChapter(button) {
  if (!currentStory || !currentPersona || !allChapters[currentChapterIndex]) {
    console.error('Cannot capture: missing story/persona/chapter data');
    return;
  }

  // Store original button content
  const originalHTML = button.innerHTML;
  
  // Show loading state
  button.disabled = true;
  button.innerHTML = `
    <svg class="capture-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>
    Capturing...
  `;
  
  try {
    // Hide the overlay before capturing
    const wasVisible = overlayDiv.style.display !== 'none';
    if (wasVisible) {
      overlayDiv.style.display = 'none';
    }
    
    // Wait a brief moment for the DOM to update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Use chrome.tabs.captureVisibleTab to capture the screenshot
    const dataUrl = await chrome.runtime.sendMessage({
      action: 'captureTab'
    });
    
    // Show the overlay again
    if (wasVisible) {
      overlayDiv.style.display = 'block';
    }
    
    if (!dataUrl) {
      throw new Error('Failed to capture screenshot');
    }
    
    // Use the stored indices directly
    console.log('Saving screenshot with indices:', {
      storyIndex: currentStoryIndex,
      personaIndex: currentPersonaIndex,
      chapterIndex: currentChapterIndex
    });
    
    // Save screenshot using the stored indices
    await saveScreenshotToChapter(currentStoryIndex, currentPersonaIndex, currentChapterIndex, dataUrl);
    
    // Show success message
    showCaptureNotification('Screenshot captured successfully!', 'success');
    
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    showCaptureNotification('Failed to capture screenshot: ' + error.message, 'error');
    
    // Make sure overlay is visible again even if there's an error
    if (overlayDiv && overlayDiv.style.display === 'none') {
      overlayDiv.style.display = 'block';
    }
  } finally {
    // Restore button
    button.disabled = false;
    button.innerHTML = originalHTML;
  }
}

/**
 * Save screenshot to chapter in storage
 */
async function saveScreenshotToChapter(storyIndex, personaIndex, chapterIndex, dataUrl) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['stories'], (result) => {
      const stories = result.stories || [];
      
      if (!stories[storyIndex] || 
          !stories[storyIndex].personas[personaIndex] || 
          !stories[storyIndex].personas[personaIndex].chapters[chapterIndex]) {
        reject(new Error('Invalid story/persona/chapter index'));
        return;
      }
      
      // Add screenshot to chapter
      stories[storyIndex].personas[personaIndex].chapters[chapterIndex].screenshot = dataUrl;
      stories[storyIndex].personas[personaIndex].chapters[chapterIndex].screenshotTimestamp = Date.now();
      
      chrome.storage.local.set({ stories }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  });
}

/**
 * Show capture notification
 */
function showCaptureNotification(message, type = 'info') {
  // Remove any existing notifications
  const existingNotification = document.querySelector('.screenshot-capture-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = 'screenshot-capture-notification';
  
  const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 350px;
    animation: slideInRight 0.3s ease-out;
  `;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ⓘ';
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 18px;">${icon}</span>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }
  }, 3000);
}

// Load all settings first to ensure screenshotModeEnabled is set
loadAllSettings();

// Load overlay state when content script starts
// Use a small delay to ensure DOM is ready
setTimeout(() => {
  loadOverlayState();
}, 500);
