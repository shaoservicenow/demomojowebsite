
// Cache for popup data
let popupDataCache = null;

// Load the header logo
document.addEventListener('DOMContentLoaded', function() {
  const logo = document.getElementById('header-logo');
  if (logo && chrome.runtime) {
    logo.src = chrome.runtime.getURL('icons/long-logo.png');
  }

  // Load all popup data in a single storage call (non-blocking)
  loadAllPopupData();
  
  // Defer non-critical operations to improve initial load time
  // Make overlay state check non-blocking and optional
  setTimeout(() => {
    checkOverlayStateAsync();
  }, 200);

  // Listen for storage changes to update shortcuts display
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      // Clear cache when data changes
      if (changes.stories || changes.overlaySize || changes.overlayPosition || changes.customShortcuts || changes.lastSelectedStory || changes.lastSelectedPersona || changes.lastSelectedChapter) {
        popupDataCache = null;
        console.log('Popup cache cleared due to storage changes');
      }
      
      if (changes.customShortcuts) {
        // Refresh shortcuts display when custom shortcuts change
        updateShortcutsDisplay(changes.customShortcuts.newValue);
      }
    }
  });
});

// Load all popup data in a single optimized call
function loadAllPopupData() {
  // Use cached data if available
  if (popupDataCache) {
    console.log('Using cached popup data');
    processPopupData(popupDataCache);
    return;
  }

  console.log('Loading popup data from storage');
  // Use Promise-based approach for better performance
  chrome.storage.local.get([
    'stories',
    'overlaySize', 
    'overlayPosition', 
    'shortcutsEnabled', 
    'customShortcuts',
    'lastSelectedStory',
    'lastSelectedPersona', 
    'lastSelectedChapter',
    'screenshotModeEnabled'
  ]).then((result) => {
    popupDataCache = result; // Cache the data
    processPopupData(result);
  }).catch((error) => {
    console.error('Failed to load popup data:', error);
    // Fallback to empty data
    processPopupData({});
  });
}

function processPopupData(data) {
  // Process stories data
  const stories = data.stories || [];
  const lastSelected = {
    story: data.lastSelectedStory,
    persona: data.lastSelectedPersona,
    chapter: data.lastSelectedChapter
  };
  populateDropdowns(stories, lastSelected);

  // Process settings data
  setupSizeAndPositionControls(data);
  setupShortcutsDisplay(data);
}

function populateDropdowns(stories, lastSelected = {}) {
    const storySelect = document.getElementById("story");
    const personaSelect = document.getElementById("persona");
    const chapterSelect = document.getElementById("chapter");
  
    storySelect.innerHTML = "";
    personaSelect.innerHTML = "";
    chapterSelect.innerHTML = "";
  
    // Populate stories dropdown
    stories.forEach((story, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = story.name;
      storySelect.appendChild(opt);
    });
  
    function loadPersonas() {
      personaSelect.innerHTML = "";
      chapterSelect.innerHTML = "";
      const story = stories[storySelect.value];
      if (!story) return;
      story.personas.forEach((p, idx) => {
        const opt = document.createElement("option");
        opt.value = idx;
        opt.textContent = p.businessTitle ? `${p.name} - ${p.businessTitle}` : p.name;
        personaSelect.appendChild(opt);
      });
      loadChapters();
    }
  
    function loadChapters() {
      chapterSelect.innerHTML = "";
      const story = stories[storySelect.value];
      const persona = story.personas[personaSelect.value];
      if (!persona) return;
      persona.chapters.forEach((c, idx) => {
        const opt = document.createElement("option");
        opt.value = idx;
        opt.textContent = c.title;
        chapterSelect.appendChild(opt);
      });
    }
  
    storySelect.addEventListener("change", loadPersonas);
    personaSelect.addEventListener("change", loadChapters);
  
    // Restore last selected values if they exist
    if (lastSelected.story !== undefined && lastSelected.story !== null && lastSelected.story !== '') {
      storySelect.value = lastSelected.story;
      storySelect.dispatchEvent(new Event("change"));
      
      // Set persona after a short delay to ensure personas are loaded
      setTimeout(() => {
        if (lastSelected.persona !== undefined && lastSelected.persona !== null && lastSelected.persona !== '') {
          personaSelect.value = lastSelected.persona;
          personaSelect.dispatchEvent(new Event("change"));
          
          // Set chapter after another short delay to ensure chapters are loaded
          setTimeout(() => {
            if (lastSelected.chapter !== undefined && lastSelected.chapter !== null && lastSelected.chapter !== '') {
              chapterSelect.value = lastSelected.chapter;
            }
          }, 50);
        }
      }, 50);
    } else {
      // If no last selected values, trigger the default behavior
      storySelect.dispatchEvent(new Event("change"));
    }
  }

// Global variables for size and position
let currentSize = 'small';
let currentPosition = 'bottom-right';
const sizeOptions = ['small', 'large'];
const positionOptions = ['bottom-right', 'bottom-left'];

// Setup size and position controls with cached data
function setupSizeAndPositionControls(data) {

  // Use cached data
  if (data.overlaySize) {
    currentSize = data.overlaySize;
    updateSizeDisplay();
  }
  if (data.overlayPosition) {
    // Only use the saved position if it's one of the popup options
    if (positionOptions.includes(data.overlayPosition)) {
      currentPosition = data.overlayPosition;
      updatePositionDisplay();
    }
  }

  // Rest of the size/position logic...
  setupSizePositionEventListeners(currentSize, currentPosition);
}

function setupSizePositionEventListeners(currentSize, currentPosition) {
  // Size toggle functionality
  const sizeToggle = document.getElementById('size-toggle');
  if (sizeToggle) {
    sizeToggle.addEventListener('click', () => {
      const sizeIndex = sizeOptions.indexOf(currentSize);
      currentSize = sizeOptions[(sizeIndex + 1) % sizeOptions.length];
      updateSizeDisplay();
      saveOverlaySize(currentSize);
    });
  }

  // Position toggle functionality
  const positionToggle = document.getElementById('position-toggle');
  if (positionToggle) {
    positionToggle.addEventListener('click', () => {
      const positionIndex = positionOptions.indexOf(currentPosition);
      currentPosition = positionOptions[(positionIndex + 1) % positionOptions.length];
      updatePositionDisplay();
      saveOverlayPosition(currentPosition);
    });
  }
}

function setupShortcutsDisplay(data) {
  // Default to true if shortcutsEnabled is undefined (first load)
  if (data.shortcutsEnabled !== false) {
    const buttonInstructions = document.getElementById('button-instructions');
    if (buttonInstructions) {
      buttonInstructions.style.display = 'none';
    }
    
    // Use cached custom shortcuts
    updateShortcutsDisplay(data.customShortcuts);
  }
}

  // Handle settings link click to open setup page in new tab
  document.getElementById("settings-link").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('setup.html') });
  });

  // Settings button event listener
  document.getElementById("settings-btn").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  });

  // Size and position toggle logic - now handled by setupSizeAndPositionControls()
  
  // Load screenshot mode setting
  chrome.storage.local.get(['screenshotModeEnabled'], (result) => {
    if (result.screenshotModeEnabled !== undefined) {
      document.getElementById('screenshot-mode-enabled').checked = result.screenshotModeEnabled;
    }
  });

  // Handle screenshot mode toggle
  document.getElementById('screenshot-mode-enabled').addEventListener('change', (e) => {
    const enabled = e.target.checked;
    chrome.storage.local.set({ screenshotModeEnabled: enabled });
    
    // Notify content script of the change
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (enabled) => {
            // Dispatch event to notify content script
            document.dispatchEvent(new CustomEvent('screenshotModeToggle', {
              detail: { enabled: enabled }
            }));
          },
          args: [enabled]
        });
      }
    });
  });

  // Settings are now loaded via loadAllPopupData() - this is just for the shortcuts checkbox
  chrome.storage.local.get(['shortcutsEnabled'], (result) => {
    if (result.shortcutsEnabled !== undefined) {
      document.getElementById('shortcuts-enabled').checked = result.shortcutsEnabled;
      
      // Initialize instruction groups based on saved setting
      const shortcutInstructions = document.getElementById('shortcut-instructions');
      const buttonInstructions = document.getElementById('button-instructions');
      
      if (result.shortcutsEnabled) {
        shortcutInstructions.style.display = 'block';
        buttonInstructions.style.display = 'none';
      } else {
        shortcutInstructions.style.display = 'none';
        buttonInstructions.style.display = 'block';
      }
    }
  });

  // Check overlay state asynchronously without blocking popup load
  async function checkOverlayStateAsync() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;
      
      // Use a timeout to prevent hanging if the script execution is slow
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 1000)
      );
      
      const scriptPromise = chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const overlay = document.getElementById('demoOverlay');
          if (overlay) {
            const isFullscreen = overlay.classList.contains('fullscreen');
            return { isFullscreen: isFullscreen };
          }
          return { isFullscreen: false };
        }
      });
      
      const results = await Promise.race([scriptPromise, timeoutPromise]);
      
      if (results && results[0] && results[0].result) {
        const isFullscreen = results[0].result.isFullscreen;
        updateButtonStates(isFullscreen);
      }
    } catch (error) {
      // Silently fail - this is non-critical functionality
      console.log('Overlay state check failed (non-critical):', error.message);
      // Default to enabled state if check fails
      updateButtonStates(false);
    }
  }

  function updateButtonStates(isFullscreen) {
    const sizeToggle = document.getElementById('size-toggle');
    const positionToggle = document.getElementById('position-toggle');
    
    // Only disable controls when actually in fullscreen mode
    if (isFullscreen) {
      sizeToggle.disabled = true;
      positionToggle.disabled = true;
      sizeToggle.style.opacity = '0.5';
      positionToggle.style.opacity = '0.5';
      sizeToggle.title = 'Size controls disabled in fullscreen mode';
      positionToggle.title = 'Position controls disabled in fullscreen mode';
    } else {
      sizeToggle.disabled = false;
      positionToggle.disabled = false;
      sizeToggle.style.opacity = '1';
      positionToggle.style.opacity = '1';
      sizeToggle.title = 'Toggle overlay size';
      positionToggle.title = 'Toggle overlay position';
    }
  }

  // Check overlay state when popup opens (now handled by checkOverlayStateAsync)

  // Handle shortcuts toggle
  document.getElementById('shortcuts-enabled').addEventListener('change', (e) => {
    const enabled = e.target.checked;
    chrome.storage.local.set({ shortcutsEnabled: enabled });
    
    // Update the toggle label
    const label = document.querySelector('.toggle-label');
    label.textContent = enabled ? 'Enable' : 'Disable';
    
    // Show/hide instruction groups based on toggle state
    const shortcutInstructions = document.getElementById('shortcut-instructions');
    const buttonInstructions = document.getElementById('button-instructions');
    
    if (enabled) {
      shortcutInstructions.style.display = 'block';
      buttonInstructions.style.display = 'none';
      
      // Load and display custom shortcuts if available
      chrome.storage.local.get(['customShortcuts'], (result) => {
        updateShortcutsDisplay(result.customShortcuts);
      });
    } else {
      shortcutInstructions.style.display = 'none';
      buttonInstructions.style.display = 'block';
    }
    
    // Notify content script of the change
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (enabled) => {
            // Dispatch event to notify content script
            document.dispatchEvent(new CustomEvent('shortcutsToggle', {
              detail: { enabled: enabled }
            }));
          },
          args: [enabled]
        });
      }
    });
  });

  // Handle recording button click
  document.getElementById('start-recording').addEventListener('click', async () => {
    // Open recording setup page
    chrome.tabs.create({ url: chrome.runtime.getURL('recording-setup.html') });
    window.close();
  });

  function updateSizeDisplay() {
    const sizeText = document.getElementById('size-text');
    sizeText.textContent = currentSize.charAt(0).toUpperCase() + currentSize.slice(1);
  }

  function updatePositionDisplay() {
    const positionText = document.getElementById('position-text');
    let displayText;
    
    switch(currentPosition) {
      case 'bottom-right':
        displayText = 'Bottom Right';
        break;
      case 'bottom-left':
        displayText = 'Bottom Left';
        break;
      default:
        // Fallback to bottom-right if position is not in popup options
        displayText = 'Bottom Right';
        currentPosition = 'bottom-right';
    }
    
    positionText.textContent = displayText;
  }

  document.getElementById('size-toggle').addEventListener('click', async () => {
    // Check if button is disabled (in fullscreen mode)
    if (document.getElementById('size-toggle').disabled) {
      return;
    }
    
    const currentIndex = sizeOptions.indexOf(currentSize);
    const nextIndex = (currentIndex + 1) % sizeOptions.length;
    currentSize = sizeOptions[nextIndex];
    updateSizeDisplay();
    chrome.storage.local.set({ overlaySize: currentSize });
    
    // Update button states based on current overlay state
    checkOverlayStateAsync();
    
    // Immediately update overlay if it exists
    await updateOverlaySettings();
  });

  document.getElementById('position-toggle').addEventListener('click', async () => {
    // Check if button is disabled (in fullscreen mode)
    if (document.getElementById('position-toggle').disabled) {
      return;
    }
    
    // Cycle through all position options
    const currentIndex = positionOptions.indexOf(currentPosition);
    const nextIndex = (currentIndex + 1) % positionOptions.length;
    currentPosition = positionOptions[nextIndex];
    updatePositionDisplay();
    chrome.storage.local.set({ overlayPosition: currentPosition });
    
    // Update button states based on current overlay state
    checkOverlayStateAsync();
    
    // Immediately update overlay if it exists
    await updateOverlaySettings();
  });

  // Function to immediately update overlay settings
  async function updateOverlaySettings() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (size, position) => {
          const overlay = document.getElementById('demoOverlay');
          if (overlay) {
            // Only update size and position if not in fullscreen mode
            if (!overlay.classList.contains('fullscreen')) {
              // Ensure DOM is ready before applying positioning
              const applyPositioning = () => {
                if (overlay && overlay.parentNode) {
                  overlay.className = `size-${size} position-${position}`;
                  // Update stored variables for persistence
                  if (typeof currentOverlaySize !== 'undefined') currentOverlaySize = size;
                  if (typeof currentOverlayPosition !== 'undefined') currentOverlayPosition = position;
                  
                  // Force a reflow to ensure positioning is applied
                  overlay.offsetHeight;
                  
                  // Apply color scheme after positioning
                  setTimeout(() => {
                    if (typeof applyColorScheme === 'function') {
                      applyColorScheme();
                    }
                  }, 50);
                } else {
                  // Retry if DOM isn't ready
                  setTimeout(applyPositioning, 50);
                }
              };
              
              // Start positioning process
              if (document.readyState === 'complete') {
                applyPositioning();
              } else {
                setTimeout(applyPositioning, 100);
              }
            }
          }
        },
        args: [currentSize, currentPosition]
      });
    } catch (error) {
      // Overlay might not exist yet, that's okay
    }
  }
  
  document.getElementById("apply").addEventListener("click", async () => {
    console.log('Apply button clicked');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Active tab:', tab);
    
    // Use cached stories data
    const stories = popupDataCache?.stories || [];
    const storyIdx = document.getElementById("story").value;
    const personaIdx = document.getElementById("persona").value;
      const chapterIdx = document.getElementById("chapter").value;
      
      console.log('Selected indices:', { storyIdx, personaIdx, chapterIdx });
      console.log('Available stories:', stories.length);
      
      if (!storyIdx || !personaIdx || !chapterIdx) {
        console.log('Missing selection, aborting');
        return;
      }
      
      const story = stories[storyIdx];
      const persona = story.personas[personaIdx];
      const chapter = persona.chapters[chapterIdx];
      
      // Get the current overlay settings to ensure correct positioning
      const overlaySettings = await new Promise((resolve) => {
        chrome.storage.local.get(['overlayPosition', 'overlaySize', 'overlayOpacity', 'screenshotModeEnabled'], (result) => {
          console.log('Popup loading overlay settings from storage:', result);
          resolve({
            position: result.overlayPosition || 'bottom-right',
            size: result.overlaySize || 'small',
            opacity: result.overlayOpacity || 0.75,
            screenshotMode: result.screenshotModeEnabled || false
          });
        });
      });
      
      console.log('Popup applying overlay with settings:', overlaySettings);
      
      // Save the current selection as last selected for next time
      chrome.storage.local.set({
        lastSelectedStory: storyIdx,
        lastSelectedPersona: personaIdx,
        lastSelectedChapter: chapterIdx
      }, () => {
        console.log('Saved last selected values:', { storyIdx, personaIdx, chapterIdx });
      });
      
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (persona, chapter, story, storyIndex, personaIndex, chapterIndex, allPersonaChapters, allStoryPersonas, size, position, opacity, screenshotMode) => {
          // Reset completed chapters when applying new overlay
          if (typeof completedChapters !== 'undefined') {
            completedChapters.clear();
            chrome.storage.local.remove(['completedChapters'], () => {
              console.log('Reset completed chapters on overlay apply');
            });
          }
          
          // Update global overlay opacity if it exists
          if (typeof overlayOpacity !== 'undefined') {
            overlayOpacity = opacity;
          }
          
          document.dispatchEvent(new CustomEvent("overlayUpdate", {
            detail: {
              persona: persona.name,
              chapter: chapter.title,
              valueDrivers: chapter.valueDrivers,
              personaTitle: persona.businessTitle || persona.title,
              headshot: persona.headshot,
              story: story.name,
              storyIndex: storyIndex,
              personaIndex: personaIndex,
              chapterIndex: chapterIndex,
              allPersonaChapters: allPersonaChapters,
              allStoryPersonas: allStoryPersonas,
              size: size,
              position: position,
              opacity: opacity,
              screenshotMode: screenshotMode
            }
          }));
        },
        args: [persona, chapter, story, parseInt(storyIdx), parseInt(personaIdx), parseInt(chapterIdx), story.personas[personaIdx].chapters, story.personas, overlaySettings.size, overlaySettings.position, overlaySettings.opacity, overlaySettings.screenshotMode]
      });
      
      // Close the popup after applying overlay
      window.close();
    });
  
  document.getElementById("clear").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        document.dispatchEvent(new CustomEvent("overlayClear"));
      }
    });
  });

  // Function to update shortcuts display with custom shortcuts
  function updateShortcutsDisplay(customShortcuts) {
    const defaultShortcuts = {
      'toggle-overlay': 'Ctrl + Shift + H',
      'toggle-fullscreen': 'Ctrl + Shift + O',
      'next-chapter': 'Ctrl + Shift + →',
      'prev-chapter': 'Ctrl + Shift + ←',
      'next-persona': 'Ctrl + Shift + ↓',
      'prev-persona': 'Ctrl + Shift + ↑',
      'save-url': 'Ctrl + Shift + S',
      'toggle-shift': 'Ctrl + Shift + P'
    };

    // Update each shortcut item with custom or default values
    Object.keys(defaultShortcuts).forEach(action => {
      const customShortcut = customShortcuts && customShortcuts[action];
      const shortcutToUse = customShortcut || defaultShortcuts[action];
      
      // Get the shortcut item element by ID
      const shortcutItem = document.getElementById(`shortcut-${action}`);
      if (shortcutItem) {
        const keyElement = shortcutItem.querySelector('.shortcut-key');
        if (keyElement) {
          // Format the shortcut for display (replace + with space and +)
          const displayShortcut = shortcutToUse.replace(/\+/g, ' + ');
          keyElement.textContent = displayShortcut;
          
          // Add a visual indicator if it's a custom shortcut
          if (customShortcut) {
            keyElement.style.backgroundColor = 'rgba(99, 223, 78, 0.2)';
            keyElement.style.border = '1px solid rgba(99, 223, 78, 0.4)';
            keyElement.title = 'Custom shortcut';
          } else {
            keyElement.style.backgroundColor = 'rgba(99, 223, 78, 0.1)';
            keyElement.style.border = 'none';
            keyElement.title = 'Default shortcut';
          }
        }
      }
    });
  }
  