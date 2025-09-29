
// Load the header logo
document.addEventListener('DOMContentLoaded', function() {
  const logo = document.getElementById('header-logo');
  if (logo && chrome.runtime) {
    logo.src = chrome.runtime.getURL('icons/long-logo.png');
  }

  // Listen for storage changes to update shortcuts display
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.customShortcuts) {
      // Refresh shortcuts display when custom shortcuts change
      updateShortcutsDisplay(changes.customShortcuts.newValue);
    }
  });
});

function populateDropdowns(stories) {
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
  
    storySelect.dispatchEvent(new Event("change"));
  }
  
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    populateDropdowns(stories);
  });

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

  // Size and position toggle logic
  let currentSize = 'small';
  let currentPosition = 'bottom-right';
  
  const sizeOptions = ['small', 'large'];
  const positionOptions = ['bottom-right', 'bottom-left'];
  
  // Load saved settings
  chrome.storage.local.get(['overlaySize', 'overlayPosition', 'shortcutsEnabled', 'customShortcuts'], (result) => {
    if (result.overlaySize) {
      currentSize = result.overlaySize;
      updateSizeDisplay();
    }
    if (result.overlayPosition) {
      // Only use the saved position if it's one of the popup options
      if (positionOptions.includes(result.overlayPosition)) {
        currentPosition = result.overlayPosition;
      } else {
        // If saved position is fullscreen or pinned-content, default to bottom-right
        currentPosition = 'bottom-right';
      }
      updatePositionDisplay();
    }
    if (result.shortcutsEnabled !== undefined) {
      document.getElementById('shortcuts-enabled').checked = result.shortcutsEnabled;
      
      // Initialize instruction groups based on saved setting
      const shortcutInstructions = document.getElementById('shortcut-instructions');
      const buttonInstructions = document.getElementById('button-instructions');
      
      if (result.shortcutsEnabled) {
        shortcutInstructions.style.display = 'block';
        buttonInstructions.style.display = 'none';
        
        // Update shortcuts display with custom shortcuts if available
        updateShortcutsDisplay(result.customShortcuts);
      } else {
        shortcutInstructions.style.display = 'none';
        buttonInstructions.style.display = 'block';
      }
    }
  });

  // Check overlay state and disable buttons if in fullscreen mode
  function checkOverlayState() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            const overlay = document.getElementById('demoOverlay');
            if (overlay) {
              const isFullscreen = overlay.classList.contains('fullscreen');
              return { isFullscreen: isFullscreen };
            }
            return { isFullscreen: false };
          }
        }, (results) => {
          if (results && results[0] && results[0].result) {
            const isFullscreen = results[0].result.isFullscreen;
            updateButtonStates(isFullscreen);
          }
        });
      }
    });
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

  // Check overlay state when popup opens
  checkOverlayState();

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
    checkOverlayState();
    
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
    checkOverlayState();
    
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
              overlay.className = `size-${size} position-${position}`;
              // Update stored variables for persistence
              if (typeof currentOverlaySize !== 'undefined') currentOverlaySize = size;
              if (typeof currentOverlayPosition !== 'undefined') currentOverlayPosition = position;
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
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.storage.local.get(["stories", "overlayPosition"], (result) => {
      const stories = result.stories || [];
      const storyIdx = document.getElementById("story").value;
      const personaIdx = document.getElementById("persona").value;
      const chapterIdx = document.getElementById("chapter").value;
      
      if (!storyIdx || !personaIdx || !chapterIdx) return;
      
      const story = stories[storyIdx];
      const persona = story.personas[personaIdx];
      const chapter = persona.chapters[chapterIdx];
      
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (persona, chapter, story, personaIndex, chapterIndex, allPersonaChapters, allStoryPersonas, size, position) => {
          // Reset completed chapters when applying new overlay
          if (typeof completedChapters !== 'undefined') {
            completedChapters.clear();
            chrome.storage.local.remove(['completedChapters'], () => {
              console.log('Reset completed chapters on overlay apply');
            });
          }
          
          document.dispatchEvent(new CustomEvent("overlayUpdate", {
            detail: {
              persona: persona.name,
              chapter: chapter.title,
              valueDrivers: chapter.valueDrivers,
              personaTitle: persona.businessTitle,
              headshot: persona.headshot,
              story: story.name,
              personaIndex: personaIndex,
              chapterIndex: chapterIndex,
              allPersonaChapters: allPersonaChapters,
              allStoryPersonas: allStoryPersonas,
              size: size,
              position: position
            }
          }));
        },
        args: [persona, chapter, story, parseInt(personaIdx), parseInt(chapterIdx), story.personas[personaIdx].chapters, story.personas, currentSize, result.overlayPosition || 'bottom-right']
      });
      
      // Close the popup after applying overlay
      window.close();
    });
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
      'toggle-overlay': 'Shift + H',
      'toggle-fullscreen': 'Shift + O',
      'next-chapter': 'Shift + →',
      'prev-chapter': 'Shift + ←',
      'next-persona': 'Shift + ↓',
      'prev-persona': 'Shift + ↑',
      'save-url': 'Shift + S',
      'toggle-shift': 'Shift + P'
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
  