// Settings page functionality
let originalSettings = {};
let hasUnsavedChanges = false;

document.addEventListener('DOMContentLoaded', function() {
  // Check if chrome.storage is available
  if (typeof chrome === 'undefined' || !chrome.storage) {
    showStatusMessage('Extension context required. Please open through the extension options.', 'error');
    return;
  }

  // Load header logo
  const logo = document.querySelector('.logo');
  if (logo && chrome.runtime) {
    logo.src = chrome.runtime.getURL('icons/logo-solo.png');
  }

  // Load current settings
  loadSettings();

  // Add event listeners
  addEventListeners();

  // Initialize custom color picker
  initCustomColorPicker();

  // Initialize UI elements
  initializeUI();
});

function loadSettings() {
  chrome.storage.local.get([
    'shortcutsEnabled',
    'overlaySize',
    'overlayPosition',
    'overlayOpacity',
    'colorScheme',
    'customColors',
    'savedCustomThemes',
    'autoHighlightChapter',
    'showProgressIndicators',
    'crossTabChapterSync',
    'crossTabHighlightingSync',
    'closeOverlayAllTabs',
    'crossPersonaNavigation',
    'minimalPaddingPinned',
    'collapseButtonEnabled',
    'customShortcuts',
    'openaiApiKey',
    'openaiModel',
    'openaiMaxTokens',
    'defaultGuidelines',
    'pdfFileSizeLimit',
    'customLogo'
  ], (result) => {
    // Store original settings for comparison
    originalSettings = {
      shortcutsEnabled: result.shortcutsEnabled !== false,
      overlaySize: result.overlaySize || 'small',
      overlayPosition: result.overlayPosition || 'bottom-right',
      overlayOpacity: result.overlayOpacity || 0.75,
      colorScheme: result.colorScheme || 'default',
      customColors: result.customColors || {},
      savedCustomThemes: result.savedCustomThemes || {},
      autoHighlightChapter: result.autoHighlightChapter || false,
      showProgressIndicators: result.showProgressIndicators !== false,
      crossTabChapterSync: result.crossTabChapterSync !== false,
      crossTabHighlightingSync: result.crossTabHighlightingSync !== false,
      closeOverlayAllTabs: result.closeOverlayAllTabs !== false,
      crossPersonaNavigation: result.crossPersonaNavigation || false,
      minimalPaddingPinned: result.minimalPaddingPinned || false,
      collapseButtonEnabled: result.collapseButtonEnabled !== false,
      openaiApiKey: result.openaiApiKey || '',
      openaiModel: result.openaiModel || 'gpt-4',
      openaiMaxTokens: result.openaiMaxTokens || 2000,
      defaultGuidelines: result.defaultGuidelines || '',
      pdfFileSizeLimit: result.pdfFileSizeLimit || 500,
      customShortcuts: result.customShortcuts || {},
      customLogo: result.customLogo || null
    };

    // Update global color theme variables
    customColors = originalSettings.customColors;
    savedCustomThemes = originalSettings.savedCustomThemes;

    // Set form values
    document.getElementById('shortcuts-enabled').checked = originalSettings.shortcutsEnabled;
    document.getElementById('default-overlay-size').value = originalSettings.overlaySize;
    document.getElementById('default-overlay-position').value = originalSettings.overlayPosition;
    document.getElementById('overlay-opacity').value = originalSettings.overlayOpacity;
    document.getElementById('color-scheme').value = originalSettings.colorScheme;
    document.getElementById('auto-highlight-chapter').checked = originalSettings.autoHighlightChapter;
    document.getElementById('show-progress-indicators').checked = originalSettings.showProgressIndicators;
    document.getElementById('cross-tab-chapter-sync').checked = originalSettings.crossTabChapterSync;
    document.getElementById('cross-tab-highlighting-sync').checked = originalSettings.crossTabHighlightingSync;
    document.getElementById('close-overlay-all-tabs').checked = originalSettings.closeOverlayAllTabs;
    document.getElementById('cross-persona-navigation').checked = originalSettings.crossPersonaNavigation;
    document.getElementById('minimal-padding-pinned').checked = originalSettings.minimalPaddingPinned;
    document.getElementById('collapse-button-enabled').checked = originalSettings.collapseButtonEnabled;

    // OpenAI settings
    document.getElementById('openai-api-key').value = originalSettings.openaiApiKey;
    document.getElementById('openai-model').value = originalSettings.openaiModel;
    document.getElementById('openai-max-tokens').value = originalSettings.openaiMaxTokens;
    document.getElementById('default-guidelines').value = originalSettings.defaultGuidelines;
    document.getElementById('pdf-file-size-limit').value = originalSettings.pdfFileSizeLimit;

    // Update opacity display
    updateOpacityDisplay(originalSettings.overlayOpacity);

    // Load custom shortcuts
    loadCustomShortcuts(originalSettings.customShortcuts);

    // Load custom logo
    loadCustomLogo(originalSettings.customLogo);

    // Reset unsaved changes flag
    hasUnsavedChanges = false;
    updateFloatingSaveButton();
  });
}

function addEventListeners() {
  // Floating save button
  document.getElementById('floating-save-button').addEventListener('click', saveSettings);

  // Reset to defaults button
  document.getElementById('reset-to-defaults').addEventListener('click', resetToDefaults);

  // Test notification button
  document.getElementById('test-notification').addEventListener('click', () => {
    console.log('Test notification button clicked');
    notifyAllTabsOfSettingsUpdate();
  });

  // Opacity slider
  document.getElementById('overlay-opacity').addEventListener('input', function() {
    updateOpacityDisplay(this.value);
    checkForChanges();
  });

  // Export data button
  document.getElementById('export-data').addEventListener('click', exportData);

  // Import data button
  document.getElementById('import-data').addEventListener('click', function() {
    document.getElementById('import-file').click();
  });

  // Import file input
  document.getElementById('import-file').addEventListener('change', importData);

  // Reset data button
  document.getElementById('reset-data').addEventListener('click', resetAllData);

  // Logo upload
  document.getElementById('logo-upload-input').addEventListener('change', handleLogoUpload);
  document.getElementById('reset-logo-btn').addEventListener('click', resetLogo);

  // Shortcuts customization
  document.getElementById('customize-shortcuts').addEventListener('click', toggleShortcutsConfig);
  document.getElementById('save-shortcuts').addEventListener('click', saveShortcuts);
  document.getElementById('reset-all-shortcuts').addEventListener('click', async () => {
    resetAllShortcuts();
    // Automatically save after resetting to defaults
    await saveShortcuts();
  });

  // OpenAI settings
  document.getElementById('test-openai-key').addEventListener('click', testOpenAIKey);
  document.getElementById('test-story-generation').addEventListener('click', testStoryGeneration);
  document.getElementById('show-api-key').addEventListener('change', toggleApiKeyVisibility);

  // Add change detection listeners to all form elements
  addChangeDetectionListeners();
}

function initializeUI() {
  // Set up any initial UI state
  console.log('Settings page initialized');
}

// Change detection functions
function addChangeDetectionListeners() {
  // Checkboxes
  const checkboxes = [
    'shortcuts-enabled',
    'auto-highlight-chapter',
    'show-progress-indicators',
    'cross-tab-chapter-sync',
    'cross-tab-highlighting-sync',
    'close-overlay-all-tabs',
    'cross-persona-navigation',
    'minimal-padding-pinned',
    'collapse-button-enabled',
    'show-api-key'
  ];
  
  checkboxes.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', checkForChanges);
    }
  });

  // Select dropdowns
  const selects = [
    'default-overlay-size',
    'default-overlay-position',
    'color-scheme',
    'openai-model'
  ];
  
  selects.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', checkForChanges);
    }
  });

  // Text inputs
  const inputs = [
    'openai-api-key',
    'openai-max-tokens',
    'default-guidelines',
    'pdf-file-size-limit'
  ];
  
  inputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', checkForChanges);
    }
  });

  // Range inputs
  const rangeInputs = ['overlay-opacity'];
  rangeInputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', checkForChanges);
    }
  });
}

function checkForChanges() {
  const currentSettings = getCurrentSettings();
  hasUnsavedChanges = !areSettingsEqual(originalSettings, currentSettings);
  updateFloatingSaveButton();
}

function getCurrentSettings() {
  return {
    shortcutsEnabled: document.getElementById('shortcuts-enabled').checked,
    overlaySize: document.getElementById('default-overlay-size').value,
    overlayPosition: document.getElementById('default-overlay-position').value,
    overlayOpacity: parseFloat(document.getElementById('overlay-opacity').value),
    colorScheme: document.getElementById('color-scheme').value,
    autoHighlightChapter: document.getElementById('auto-highlight-chapter').checked,
    showProgressIndicators: document.getElementById('show-progress-indicators').checked,
    crossTabChapterSync: document.getElementById('cross-tab-chapter-sync').checked,
    crossTabHighlightingSync: document.getElementById('cross-tab-highlighting-sync').checked,
    closeOverlayAllTabs: document.getElementById('close-overlay-all-tabs').checked,
    crossPersonaNavigation: document.getElementById('cross-persona-navigation').checked,
    minimalPaddingPinned: document.getElementById('minimal-padding-pinned').checked,
    collapseButtonEnabled: document.getElementById('collapse-button-enabled').checked,
    openaiApiKey: document.getElementById('openai-api-key').value.trim(),
    openaiModel: document.getElementById('openai-model').value,
    openaiMaxTokens: parseInt(document.getElementById('openai-max-tokens').value),
    defaultGuidelines: document.getElementById('default-guidelines').value.trim(),
    pdfFileSizeLimit: parseInt(document.getElementById('pdf-file-size-limit').value),
    customShortcuts: getCurrentCustomShortcuts()
  };
}

function getCurrentCustomShortcuts() {
  const customShortcuts = {};
  Object.keys(shortcutIds).forEach(shortcutKey => {
    const inputId = shortcutIds[shortcutKey];
    const input = document.getElementById(inputId);
    const defaultShortcut = defaultShortcuts[shortcutKey];
    
    if (input && input.value && input.value !== defaultShortcut) {
      customShortcuts[shortcutKey] = input.value;
    }
  });
  return customShortcuts;
}

function areSettingsEqual(original, current) {
  // Compare all settings except customShortcuts
  const keysToCompare = [
    'shortcutsEnabled', 'overlaySize', 'overlayPosition', 'overlayOpacity',
    'colorScheme', 'autoHighlightChapter', 'showProgressIndicators',
    'crossTabChapterSync', 'crossTabHighlightingSync', 'closeOverlayAllTabs', 'crossPersonaNavigation',
    'minimalPaddingPinned', 'collapseButtonEnabled', 'openaiApiKey', 'openaiModel', 'openaiMaxTokens', 'defaultGuidelines', 'pdfFileSizeLimit'
  ];
  
  for (let key of keysToCompare) {
    if (original[key] !== current[key]) {
      return false;
    }
  }
  
  // Compare custom shortcuts
  const originalShortcuts = original.customShortcuts || {};
  const currentShortcuts = current.customShortcuts || {};
  
  const originalKeys = Object.keys(originalShortcuts);
  const currentKeys = Object.keys(currentShortcuts);
  
  if (originalKeys.length !== currentKeys.length) {
    return false;
  }
  
  for (let key of originalKeys) {
    if (originalShortcuts[key] !== currentShortcuts[key]) {
      return false;
    }
  }
  
  return true;
}

function updateFloatingSaveButton() {
  const button = document.getElementById('floating-save-button');
  if (hasUnsavedChanges) {
    button.classList.add('show');
  } else {
    button.classList.remove('show');
  }
}

// Function to notify all tabs with overlay open about settings changes
function notifyAllTabsOfSettingsUpdate() {
  console.log('Notifying all tabs of settings update...');
  
  // Try messaging approach first (more reliable)
  chrome.tabs.query({}, (tabs) => {
    console.log(`Found ${tabs.length} tabs to check`);
    
    tabs.forEach(tab => {
      // Skip chrome:// and extension pages
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
        return;
      }
      
      console.log(`Checking tab: ${tab.url}`);
      
      // Try messaging first
      chrome.tabs.sendMessage(tab.id, { action: 'showSettingsNotification' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log(`Messaging failed for tab ${tab.url}, trying script injection:`, chrome.runtime.lastError.message);
          
          // Fallback to script injection
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              console.log('Script injected into tab, checking for overlay...');
              
              // Check if overlay elements exist on the page
              const overlayExists = document.querySelector('#demoOverlay');
              console.log('Overlay exists:', !!overlayExists);
              
              if (overlayExists) {
                console.log('Showing notification on tab with overlay');
                showSettingsNotification();
              } else {
                console.log('No overlay found on this tab');
              }
            }
          }).catch((error) => {
            console.log(`Failed to inject script into tab ${tab.url}:`, error);
          });
        } else {
          console.log(`Messaging successful for tab ${tab.url}`);
        }
      });
    });
  });
}

// Function to show the notification (used by both messaging and script injection)
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
  console.log('Notification added to page');
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
          console.log('Notification auto-removed');
        }
      }, 300);
    }
  }, 10000);
}

function updateOpacityDisplay(value) {
  const percentage = Math.round(value * 100);
  document.getElementById('opacity-value').textContent = percentage + '%';
}

function saveSettings() {
  const settings = {
    shortcutsEnabled: document.getElementById('shortcuts-enabled').checked,
    overlaySize: document.getElementById('default-overlay-size').value,
    overlayPosition: document.getElementById('default-overlay-position').value,
    overlayOpacity: parseFloat(document.getElementById('overlay-opacity').value),
    colorScheme: document.getElementById('color-scheme').value,
    customColors: customColors,
    savedCustomThemes: savedCustomThemes,
    autoHighlightChapter: document.getElementById('auto-highlight-chapter').checked,
    showProgressIndicators: document.getElementById('show-progress-indicators').checked,
    crossTabChapterSync: document.getElementById('cross-tab-chapter-sync').checked,
    crossTabHighlightingSync: document.getElementById('cross-tab-highlighting-sync').checked,
    closeOverlayAllTabs: document.getElementById('close-overlay-all-tabs').checked,
    crossPersonaNavigation: document.getElementById('cross-persona-navigation').checked,
    minimalPaddingPinned: document.getElementById('minimal-padding-pinned').checked,
    collapseButtonEnabled: document.getElementById('collapse-button-enabled').checked,
    openaiApiKey: document.getElementById('openai-api-key').value.trim(),
    openaiModel: document.getElementById('openai-model').value,
    openaiMaxTokens: parseInt(document.getElementById('openai-max-tokens').value),
    defaultGuidelines: document.getElementById('default-guidelines').value.trim(),
    pdfFileSizeLimit: parseInt(document.getElementById('pdf-file-size-limit').value),
    customShortcuts: getCurrentCustomShortcuts()
  };

  // Show loading overlay
  showLoadingOverlay();

  chrome.storage.local.set(settings, () => {
    // Update original settings to match current settings
    originalSettings = { ...settings };
    
    // Reset unsaved changes flag
    hasUnsavedChanges = false;
    updateFloatingSaveButton();
    
    // Update loading overlay to show success message after 0.5 seconds
    setTimeout(() => {
      showLoadingSuccess('Settings saved successfully!');
      
      // Hide loading overlay after another 0.8 seconds
      setTimeout(() => {
        hideLoadingOverlay();
      }, 800);
    }, 500);
    
    // Notify all tabs with overlay open about settings changes
    notifyAllTabsOfSettingsUpdate();
  });
}

function resetToDefaults() {
  if (confirm('Are you sure you want to reset all settings to their default values?')) {
    const defaultSettings = {
      shortcutsEnabled: true,
      overlaySize: 'small',
      overlayPosition: 'bottom-right',
      overlayOpacity: 0.75,
      colorScheme: 'default',
      autoHighlightChapter: false,
      showProgressIndicators: true,
      crossTabChapterSync: true,
      crossTabHighlightingSync: true
    };

    chrome.storage.local.set(defaultSettings, () => {
      loadSettings();
      showStatusMessage('Settings reset to defaults!', 'success');
    });
  }
}

function exportData() {
  chrome.storage.local.get(null, (data) => {
    // Include localStorage data for complete backup
    const localStorageData = {};
    const localStorageKeys = [
      'demoOverlayWidth',
      'demoOverlayWidthMinimalPadding', 
      'urlBasedSelection',
      'wasContentShifted',
      'wasFullscreenMode',
      'theme'
    ];
    
    localStorageKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        localStorageData[key] = value;
      }
    });
    
    const exportData = {
      version: '1.4.0',
      exportDate: new Date().toISOString(),
      data: data,
      localStorageData: localStorageData
    };

    // Log what's being exported for debugging
    console.log('Exporting data:', {
      stories: data.stories?.length || 0,
      colorScheme: data.colorScheme,
      hasCustomColors: !!data.customColors,
      customThemeCount: Object.keys(data.savedCustomThemes || {}).length,
      allKeys: Object.keys(data)
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `demo-persona-overlay-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show more detailed success message
    const themeCount = Object.keys(data.savedCustomThemes || {}).length;
    const storyCount = data.stories?.length || 0;
    const hasCustomShortcuts = data.customShortcuts && Object.keys(data.customShortcuts).length > 0;
    const hasOpenAISettings = !!data.openaiApiKey;
    
    let message = 'Data exported successfully!';
    const details = [];
    
    if (storyCount > 0) {
      details.push(`${storyCount} story${storyCount > 1 ? 's' : ''}`);
    }
    if (themeCount > 0) {
      details.push(`${themeCount} custom theme${themeCount > 1 ? 's' : ''}`);
    }
    if (hasCustomShortcuts) {
      details.push('custom shortcuts');
    }
    if (hasOpenAISettings) {
      details.push('OpenAI settings');
    }
    
    if (details.length > 0) {
      message += ` Includes: ${details.join(', ')}.`;
    }
    
    showStatusMessage(message, 'success');
  });
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importData = JSON.parse(e.target.result);
      
      // Validate import data structure
      if (!importData.data) {
        throw new Error('Invalid backup file format - missing data section');
      }
      
      // Check version compatibility
      const importVersion = importData.version || '1.0.0';
      const currentVersion = '1.4.0';
      
      // Log what's being imported for debugging
      console.log('Importing data:', {
        stories: importData.data.stories?.length || 0,
        colorScheme: importData.data.colorScheme,
        hasCustomColors: !!importData.data.customColors,
        customThemeCount: Object.keys(importData.data.savedCustomThemes || {}).length,
        allKeys: Object.keys(importData.data)
      });
      
      if (confirm(`This will overwrite your current data.\n\nImport file version: ${importVersion}\nCurrent version: ${currentVersion}\n\nAre you sure you want to continue?`)) {
        // Clear Chrome storage and restore data
        chrome.storage.local.clear(() => {
          chrome.storage.local.set(importData.data, () => {
            // Restore localStorage data if available
            if (importData.localStorageData) {
              Object.entries(importData.localStorageData).forEach(([key, value]) => {
                localStorage.setItem(key, value);
              });
              console.log('Restored localStorage data:', importData.localStorageData);
            }
            
            // Update global color theme variables from imported data
            if (importData.data.customColors) {
              customColors = importData.data.customColors;
              console.log('Restored custom colors:', customColors);
            }
            if (importData.data.savedCustomThemes) {
              savedCustomThemes = importData.data.savedCustomThemes;
              console.log('Restored custom themes:', Object.keys(savedCustomThemes));
            }
            
            // Reload custom themes dropdown
            loadSavedCustomThemes();
            
            // Reload settings to reflect imported data
            loadSettings();
            
            // Show success message with details about what was restored
            const themeCount = Object.keys(importData.data.savedCustomThemes || {}).length;
            const storyCount = importData.data.stories?.length || 0;
            const hasCustomShortcuts = importData.data.customShortcuts && Object.keys(importData.data.customShortcuts).length > 0;
            const hasOpenAISettings = !!importData.data.openaiApiKey;
            
            let message = 'Data imported successfully!';
            const details = [];
            
            if (storyCount > 0) {
              details.push(`${storyCount} story${storyCount > 1 ? 's' : ''}`);
            }
            if (themeCount > 0) {
              details.push(`${themeCount} custom theme${themeCount > 1 ? 's' : ''}`);
            }
            if (hasCustomShortcuts) {
              details.push('custom shortcuts');
            }
            if (hasOpenAISettings) {
              details.push('OpenAI settings');
            }
            
            if (details.length > 0) {
              message += ` Restored: ${details.join(', ')}.`;
            } else {
              message += ' All settings have been restored.';
            }
            
            showStatusMessage(message, 'success');
          });
        });
      }
    } catch (error) {
      showStatusMessage('Error importing data: ' + error.message, 'error');
      console.error('Import error:', error);
    }
  };
  
  reader.readAsText(file);
  
  // Reset file input
  event.target.value = '';
}

function resetAllData() {
  if (confirm('Are you sure you want to delete ALL data? This includes all stories, personas, chapters, and settings. This action cannot be undone.')) {
    chrome.storage.local.clear(() => {
      // Also clear localStorage data
      const localStorageKeys = [
        'demoOverlayWidth',
        'demoOverlayWidthMinimalPadding', 
        'urlBasedSelection',
        'wasContentShifted',
        'wasFullscreenMode',
        'theme'
      ];
      
      localStorageKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('Cleared chrome.storage.local and localStorage');
      
      loadSettings();
      showStatusMessage('All data has been reset!', 'success');
    });
  }
}

function showStatusMessage(message, type) {
  const statusDiv = document.getElementById('status-message');
  statusDiv.textContent = message;
  statusDiv.className = `status-message status-${type}`;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusDiv.textContent = '';
    statusDiv.className = '';
  }, 5000);
}

// Alias for showStatusMessage - used for theme export/import
function showNotification(message, type) {
  showStatusMessage(message, type);
}

// Loading overlay functions
function showLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.add('active');
}

function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  const spinner = overlay.querySelector('.loading-spinner');
  const successMessage = overlay.querySelector('.loading-success');
  
  overlay.classList.remove('active');
  
  // Reset spinner and hide success message
  if (spinner) {
    spinner.style.display = 'block';
  }
  if (successMessage) {
    successMessage.style.display = 'none';
  }
}

function showLoadingSuccess(message) {
  const overlay = document.getElementById('loading-overlay');
  const spinner = overlay.querySelector('.loading-spinner');
  
  if (spinner) {
    // Replace spinner with success message
    spinner.style.display = 'none';
    
    // Create success message element if it doesn't exist
    let successMessage = overlay.querySelector('.loading-success');
    if (!successMessage) {
      successMessage = document.createElement('div');
      successMessage.className = 'loading-success';
      successMessage.style.cssText = `
        color: white;
        font-size: 16px;
        font-weight: 500;
        text-align: center;
        padding: 20px;
      `;
      overlay.appendChild(successMessage);
    }
    
    successMessage.textContent = message;
    successMessage.style.display = 'block';
  }
}

// Listen for settings updates from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'settingsUpdated') {
    loadSettings();
  }
});

// Default shortcuts mapping
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

// Shortcut mapping to input IDs
const shortcutIds = {
  'toggle-overlay': 'shortcut-toggle-overlay',
  'toggle-fullscreen': 'shortcut-toggle-fullscreen',
  'next-chapter': 'shortcut-next-chapter',
  'prev-chapter': 'shortcut-prev-chapter',
  'next-persona': 'shortcut-next-persona',
  'prev-persona': 'shortcut-prev-persona',
  'save-url': 'shortcut-save-url',
  'toggle-shift': 'shortcut-toggle-shift'
};

// Current recording state
let currentlyRecording = null;
let recordingTimeout = null;

function toggleShortcutsConfig() {
  const configDiv = document.getElementById('shortcuts-config');
  const customizeBtn = document.getElementById('customize-shortcuts');
  
  if (configDiv.style.display === 'none') {
    configDiv.style.display = 'block';
    customizeBtn.textContent = 'Hide Customization';
    setupShortcutInputs();
  } else {
    configDiv.style.display = 'none';
    customizeBtn.textContent = 'Customize';
    stopRecording();
  }
}

function setupShortcutInputs() {
  // Load current shortcuts and display them
  chrome.storage.local.get(['customShortcuts'], (result) => {
    const customShortcuts = result.customShortcuts || {};
    
    // Add event listeners for shortcut inputs and populate current values
    Object.keys(shortcutIds).forEach(shortcutKey => {
      const inputId = shortcutIds[shortcutKey];
      const input = document.getElementById(inputId);
      const resetBtnId = `reset-${shortcutKey}`;
      const resetBtn = document.getElementById(resetBtnId);
      
      if (input) {
        // Set current shortcut value
        const currentShortcut = customShortcuts[shortcutKey] || defaultShortcuts[shortcutKey];
        input.value = currentShortcut;
        
        input.addEventListener('click', () => startRecording(inputId, shortcutKey));
        input.addEventListener('keydown', (e) => handleShortcutKeydown(e, inputId, shortcutKey));
      }
      
      if (resetBtn) {
        resetBtn.addEventListener('click', () => resetShortcut(shortcutKey));
      }
    });
    
    // Update button states based on current shortcuts
    updateShortcutButtonStates();
  });
}

function loadCustomShortcuts(customShortcuts) {
  if (!customShortcuts) return;
  
  Object.keys(shortcutIds).forEach(shortcutKey => {
    const inputId = shortcutIds[shortcutKey];
    const input = document.getElementById(inputId);
    const customShortcut = customShortcuts[shortcutKey];
    
    if (input && customShortcut) {
      input.value = customShortcut;
    }
  });
  
  // Update button states after loading
  setTimeout(() => {
    updateShortcutButtonStates();
  }, 100);
}

function startRecording(inputId, shortcutKey) {
  stopRecording(); // Stop any existing recording
  
  const input = document.getElementById(inputId);
  if (!input) return;
  
  currentlyRecording = { inputId, shortcutKey };
  input.classList.add('recording');
  input.value = 'Recording...';
  input.focus();
  
  // Set timeout to stop recording after 10 seconds
  recordingTimeout = setTimeout(() => {
    stopRecording();
    showStatusMessage('Recording timeout. Please try again.', 'error');
  }, 10000);
}

function stopRecording() {
  if (currentlyRecording) {
    const input = document.getElementById(currentlyRecording.inputId);
    if (input) {
      input.classList.remove('recording');
      if (input.value === 'Recording...') {
        input.value = '';
      }
    }
    currentlyRecording = null;
  }
  
  if (recordingTimeout) {
    clearTimeout(recordingTimeout);
    recordingTimeout = null;
  }
}

function handleShortcutKeydown(e, inputId, shortcutKey) {
  if (!currentlyRecording || currentlyRecording.inputId !== inputId) {
    return;
  }
  
  e.preventDefault();
  e.stopPropagation();
  
  // Allow Escape to clear the shortcut
  if (e.key === 'Escape') {
    const input = document.getElementById(inputId);
    if (input) {
      input.value = '';
      input.classList.remove('recording');
    }
    stopRecording();
    showStatusMessage('Shortcut cleared', 'success');
    return;
  }
  
  // Only process the shortcut when a non-modifier key is pressed
  if (e.key === 'Control' || e.key === 'Meta' || e.key === 'Alt' || e.key === 'Shift') {
    return;
  }
  
  const keys = [];
  
  // Check for modifier keys
  if (e.ctrlKey) keys.push('Ctrl');
  if (e.metaKey) keys.push('Cmd');
  if (e.altKey) keys.push('Alt');
  if (e.shiftKey) keys.push('Shift');
  
  // Add the main key
  if (e.key) {
    // Handle special keys
    let key = e.key;
    if (key === ' ') key = 'Space';
    else if (key.startsWith('Arrow')) key = key.replace('Arrow', '');
    else if (key.length === 1) key = key.toUpperCase();
    
    keys.push(key);
  }
  
  // Validate shortcut (maximum 3 keys)
  if (keys.length > 3) {
    showStatusMessage('Maximum 3 keys allowed in shortcuts', 'error');
    return;
  }
  
  if (keys.length === 0) {
    return;
  }
  
  // Check for conflicts
  const newShortcut = keys.join('+');
  if (checkShortcutConflict(newShortcut, shortcutKey)) {
    showStatusMessage('This shortcut is already in use', 'error');
    return;
  }
  
  // Set the shortcut
  const input = document.getElementById(inputId);
  if (input) {
    input.value = newShortcut;
    input.classList.remove('recording');
  }
  
  stopRecording();
  updateShortcutButtonStates();
  checkForChanges(); // Add change detection
  showStatusMessage(`Shortcut set: ${newShortcut}`, 'success');
}

function checkShortcutConflict(newShortcut, excludeShortcut) {
  // Check against default shortcuts
  Object.keys(defaultShortcuts).forEach(key => {
    if (key !== excludeShortcut && defaultShortcuts[key] === newShortcut) {
      return true;
    }
  });
  
  // Check against other custom shortcuts
  const inputs = document.querySelectorAll('.shortcut-input');
  for (let input of inputs) {
    if (input.value === newShortcut && input.id !== `shortcut-${excludeShortcut}`) {
      return true;
    }
  }
  
  return false;
}

function resetShortcut(shortcutKey) {
  const inputId = shortcutIds[shortcutKey];
  const input = document.getElementById(inputId);
  if (input) {
    input.value = defaultShortcuts[shortcutKey] || '';
    updateShortcutButtonStates();
    checkForChanges(); // Add change detection
  }
}

function resetAllShortcuts() {
  if (confirm('Are you sure you want to reset all shortcuts to their default values?')) {
    Object.keys(shortcutIds).forEach(shortcutKey => {
      resetShortcut(shortcutKey);
    });
    updateShortcutButtonStates();
    showStatusMessage('All shortcuts reset to defaults!', 'success');
  }
}

function updateShortcutButtonStates() {
  // Check if any shortcuts are different from defaults
  let hasCustomShortcuts = false;
  let hasChanges = false;
  
  chrome.storage.local.get(['customShortcuts'], (result) => {
    const customShortcuts = result.customShortcuts || {};
    
    Object.keys(shortcutIds).forEach(shortcutKey => {
      const input = document.getElementById(shortcutIds[shortcutKey]);
      const currentValue = input ? input.value : '';
      const defaultValue = defaultShortcuts[shortcutKey];
      
      if (customShortcuts[shortcutKey]) {
        hasCustomShortcuts = true;
      }
      
      if (currentValue !== defaultValue) {
        hasChanges = true;
      }
    });
    
    // Show/hide reset all button
    const resetAllBtn = document.getElementById('reset-all-shortcuts');
    if (resetAllBtn) {
      resetAllBtn.style.display = hasCustomShortcuts ? 'block' : 'none';
    }
    
    // Show/hide save button
    const saveBtn = document.getElementById('save-shortcuts');
    if (saveBtn) {
      saveBtn.style.display = hasChanges ? 'block' : 'none';
    }
  });
}

function saveShortcuts() {
  const customShortcuts = {};
  let hasChanges = false;
  
  Object.keys(shortcutIds).forEach(shortcutKey => {
    const inputId = shortcutIds[shortcutKey];
    const input = document.getElementById(inputId);
    const defaultShortcut = defaultShortcuts[shortcutKey];
    
    if (input && input.value && input.value !== defaultShortcut) {
      customShortcuts[shortcutKey] = input.value;
      hasChanges = true;
    }
  });
  
  // Show loading overlay
  showLoadingOverlay();
  
  // Save to storage
  chrome.storage.local.set({ customShortcuts }, () => {
    // Update original settings to include the new shortcuts
    originalSettings.customShortcuts = { ...customShortcuts };
    
    // Update loading overlay to show success message after 0.5 seconds
    setTimeout(() => {
      if (hasChanges) {
        showLoadingSuccess('Custom shortcuts saved successfully!');
        
        // Notify all tabs with overlay open about shortcuts changes
        notifyAllTabsOfSettingsUpdate();
      } else {
        showLoadingSuccess('No changes to save');
      }
      
      // Hide loading overlay after another 0.8 seconds
      setTimeout(() => {
        hideLoadingOverlay();
        updateShortcutButtonStates();
        checkForChanges(); // Update floating button state
      }, 800);
    }, 500);
  });
}

// OpenAI API Key Functions
function testOpenAIKey() {
  const apiKey = document.getElementById('openai-api-key').value.trim();
  const statusDiv = document.getElementById('openai-status');
  
  if (!apiKey) {
    showOpenAIStatus('Please enter an API key first', 'error');
    return;
  }
  
  if (!apiKey.startsWith('sk-')) {
    showOpenAIStatus('API key should start with "sk-"', 'error');
    return;
  }
  
  showOpenAIStatus('Testing API key...', 'info');
  
  // Test the API key with a simple request
  fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      showOpenAIStatus('API key is valid! ✅', 'success');
      // Auto-save the API key
      chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
        console.log('OpenAI API key saved');
      });
    } else {
      return response.json().then(data => {
        throw new Error(data.error?.message || 'Invalid API key');
      });
    }
  })
  .catch(error => {
    console.error('OpenAI API test failed:', error);
    showOpenAIStatus(`API test failed: ${error.message}`, 'error');
  });
}

function toggleApiKeyVisibility() {
  const apiKeyInput = document.getElementById('openai-api-key');
  const showToggle = document.getElementById('show-api-key');
  
  if (showToggle.checked) {
    apiKeyInput.type = 'text';
  } else {
    apiKeyInput.type = 'password';
  }
}

function showOpenAIStatus(message, type) {
  const statusDiv = document.getElementById('openai-status');
  statusDiv.textContent = message;
  statusDiv.className = `status-message status-${type}`;
  statusDiv.style.display = 'block';
  
  // Auto-hide after 5 seconds for success/info messages
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 5000);
  }
}

async function testStoryGeneration() {
  const apiKey = document.getElementById('openai-api-key').value.trim();
  const model = document.getElementById('openai-model').value;
  const maxTokens = parseInt(document.getElementById('openai-max-tokens').value);
  
  if (!apiKey) {
    showOpenAIStatus('Please enter an API key first', 'error');
    return;
  }
  
  showOpenAIStatus('Testing story generation...', 'info');
  
  const testContent = `# Test Demo Script

## Personas
**Marketing Manager - Lisa**
- Manages digital marketing campaigns
- Needs to track campaign performance
- Wants automated reporting

**Sales Director - John**
- Oversees sales team operations
- Needs pipeline visibility
- Wants forecast accuracy

## Demo Flow

### Chapter 1: Overview
- Show dashboard with key metrics
- Display recent activity
- Highlight important alerts

### Chapter 2: Campaign Management
- Create new marketing campaign
- Set targeting parameters
- Launch campaign

### Chapter 3: Analytics
- View campaign performance
- Analyze conversion rates
- Generate reports

## Value Drivers
- Increase campaign ROI by 25%
- Reduce manual reporting time
- Improve targeting accuracy`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing demo scripts and creating structured demo stories with personas and chapters. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: `Analyze the following demo script and create a structured story for "Test Story":

Content:
${testContent}

Please create a JSON response with the following structure:
{
  "name": "Test Story",
  "personas": [
    {
      "name": "Persona Name",
      "title": "Job Title",
      "description": "Brief description of this persona",
      "chapters": [
        {
          "title": "Chapter Title",
          "valueDrivers": ["Key value proposition 1", "Key value proposition 2"],
          "url": null
        }
      ]
    }
  ]
}

Extract personas from the content. Look for:
- Different user types, roles, or buyer personas
- Job titles, departments, or user segments
- Different pain points or use cases

Extract chapters from the content. Look for:
- Different sections, phases, or steps in the demo
- Feature demonstrations or workflows
- Value propositions or benefits

Guidelines:
- Create 1-3 personas maximum
- Create 3-8 chapters maximum
- Each chapter should have 1-3 value drivers
- Use clear, concise titles and descriptions
- Focus on business value and user benefits
- Return only valid JSON, no additional text`
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });
    
    console.log('Test API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Test API error response:', errorData);
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Test API response data:', data);
    
    const aiResponse = data.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from OpenAI API');
    }
    
    console.log('Test AI response:', aiResponse);
    
    // Try to parse the response
    const storyData = JSON.parse(aiResponse);
    console.log('Test parsed story data:', storyData);
    
    showOpenAIStatus(`✅ Story generation test successful!\n\nGenerated ${storyData.personas?.length || 0} personas and ${storyData.personas?.[0]?.chapters?.length || 0} chapters.`, 'success');
    
  } catch (error) {
    console.error('Test story generation failed:', error);
    
    let errorMessage = `❌ Story generation test failed: ${error.message}`;
    
    if (error.message.includes('quota') || error.message.includes('insufficient_quota')) {
      errorMessage += `\n\n🔴 QUOTA EXCEEDED\nYour OpenAI account has run out of credits.\n\nTo fix this:\n1. Go to https://platform.openai.com/\n2. Add payment method or increase quota\n3. Check your billing details`;
    } else if (error.message.includes('API key')) {
      errorMessage += `\n\n🔴 INVALID API KEY\nPlease check your API key.`;
    }
    
    showOpenAIStatus(errorMessage, 'error');
  }
}

// Custom Color Picker Functionality
let customColors = {};
let isCustomizing = false;
let savedCustomThemes = {};

// Initialize custom color picker
function initCustomColorPicker() {
  const customizeBtn = document.getElementById('customize-colors-btn');
  const colorPanel = document.getElementById('custom-color-panel');
  const colorSchemeSelect = document.getElementById('color-scheme');
  
  if (!customizeBtn || !colorPanel) {
    console.error('Required elements not found for custom color picker');
    return;
  }
  
  // Load saved custom themes
  loadSavedCustomThemes();
  
  // Initialize delete button visibility
  updateDeleteButtonVisibility(colorSchemeSelect.value);
  
  // Show/hide custom color panel
  customizeBtn.addEventListener('click', () => {
    if (colorPanel.style.display === 'none' || colorPanel.style.display === '') {
      try {
        loadCurrentThemeColors();
        setupColorPickerListeners();
        colorPanel.style.display = 'block';
        isCustomizing = true;
        updateActionButtonsVisibility();
      } catch (error) {
        console.error('Error opening color panel:', error);
      }
    } else {
      colorPanel.style.display = 'none';
      isCustomizing = false;
      updateActionButtonsVisibility();
    }
  });
  
  // Handle color scheme change
  colorSchemeSelect.addEventListener('change', () => {
    const selectedValue = colorSchemeSelect.value;
    updateDeleteButtonVisibility(selectedValue);
    updateActionButtonsVisibility();
    
    if (selectedValue.startsWith('custom-')) {
      // Load a saved custom theme
      loadSavedCustomTheme(selectedValue);
      // Keep panel open and update colors
      if (isCustomizing) {
        loadCurrentThemeColors();
      }
    } else {
      // Apply the selected built-in theme
      applyBuiltInTheme(selectedValue);
      // Keep panel open and update colors
      if (isCustomizing) {
        loadCurrentThemeColors();
      }
    }
  });
  
  // Color picker event listeners will be attached when panel opens
  
  // Action buttons
  document.getElementById('export-custom-theme').addEventListener('click', exportCustomTheme);
  document.getElementById('import-custom-theme').addEventListener('click', () => {
    document.getElementById('import-theme-file').click();
  });
  document.getElementById('import-theme-file').addEventListener('change', importCustomTheme);
  document.getElementById('save-custom-colors').addEventListener('click', saveCustomTheme);
  document.getElementById('delete-custom-theme-btn').addEventListener('click', deleteCustomTheme);
}

// Set up color picker event listeners
function setupColorPickerListeners() {
  const colorPickers = document.querySelectorAll('.color-picker');
  colorPickers.forEach(picker => {
    // Remove existing listeners to avoid duplicates
    picker.removeEventListener('input', updateColorPreview);
    picker.removeEventListener('change', markAsCustom);
    
    // Add new listeners
    picker.addEventListener('input', updateColorPreview);
    picker.addEventListener('change', markAsCustom);
  });
  
  // Theme name input validation
  const themeNameInput = document.getElementById('custom-theme-name');
  themeNameInput.addEventListener('input', validateThemeName);
}

// Load current theme colors into color pickers
function loadCurrentThemeColors() {
  const currentScheme = document.getElementById('color-scheme').value;
  
  // If it's a custom theme, load from saved themes
  if (currentScheme.startsWith('custom-') && savedCustomThemes[currentScheme]) {
    const theme = savedCustomThemes[currentScheme];
    document.getElementById('primary-bg-color').value = theme.colors.primary;
    document.getElementById('secondary-bg-color').value = theme.colors.secondary;
    document.getElementById('accent-color').value = theme.colors.accent;
    document.getElementById('primary-text-color').value = theme.colors.primaryText;
    document.getElementById('secondary-text-color').value = theme.colors.secondaryText;
    document.getElementById('persona-highlight-color').value = theme.colors.personaHighlight || '#63df4e';
    document.getElementById('chapter-highlight-color').value = theme.colors.chapterHighlight || '#ffc107';
  } else {
    // Load built-in theme colors
    const schemes = {
      default: {
        primary: '#032d42',
        secondary: '#7661ff',
        accent: '#52b8ff',
        primaryText: '#ffffff',
        secondaryText: '#e6f3ff',
        personaHighlight: '#63df4e',
        chapterHighlight: '#ffc107'
      },
      'blue-green': {
        primary: '#032d42',
        secondary: '#225219',
        accent: '#63df4e',
        primaryText: '#ffffff',
        secondaryText: '#f0fff0',
        personaHighlight: '#63df4e',
        chapterHighlight: '#ffc107'
      },
      purple: {
        primary: '#4b0082',
        secondary: '#8a2be2',
        accent: '#ba55d3',
        primaryText: '#ffffff',
        secondaryText: '#ba55d3',
        personaHighlight: '#63df4e',
        chapterHighlight: '#ffc107'
      },
      orange: {
        primary: '#cc5500',
        secondary: '#993300',
        accent: '#ffa500',
        primaryText: '#ffffff',
        secondaryText: '#fff5e6',
        personaHighlight: '#63df4e',
        chapterHighlight: '#ffc107'
      },
      dark: {
        primary: '#141414',
        secondary: '#282828',
        accent: '#3c3c3c',
        primaryText: '#ffffff',
        secondaryText: '#3c3c3c',
        personaHighlight: '#63df4e',
        chapterHighlight: '#ffc107'
      },
      rogers: {
        primary: '#032d42',
        secondary: '#007a9c',
        accent: '#0c1517',
        primaryText: '#ffffff',
        secondaryText: '#e6f3ff',
        personaHighlight: '#ffffff',
        chapterHighlight: '#4fb040'
      }
    };
    
    const colors = schemes[currentScheme] || schemes.default;
    
    document.getElementById('primary-bg-color').value = colors.primary;
    document.getElementById('secondary-bg-color').value = colors.secondary;
    document.getElementById('accent-color').value = colors.accent;
    document.getElementById('primary-text-color').value = colors.primaryText;
    document.getElementById('secondary-text-color').value = colors.secondaryText;
    document.getElementById('persona-highlight-color').value = colors.personaHighlight || '#63df4e';
    document.getElementById('chapter-highlight-color').value = colors.chapterHighlight || '#ffc107';
  }
  
  updateAllColorPreviews();
  updatePreviewMockup();
}

// Update color preview
function updateColorPreview(event) {
  // Update the mockup preview in real-time
  updatePreviewMockup();
}

// Update all color previews
function updateAllColorPreviews() {
  // No longer needed since we removed color preview bars
  // This function is kept for compatibility but does nothing
}

// Update preview mockup with current colors
function updatePreviewMockup() {
  const mockup = document.getElementById('color-preview-mockup');
  if (!mockup) return;
  
  // Get current color values
  const primaryBg = document.getElementById('primary-bg-color')?.value || '#032d42';
  const secondaryBg = document.getElementById('secondary-bg-color')?.value || '#7661ff';
  const accentColor = document.getElementById('accent-color')?.value || '#52b8ff';
  const primaryText = document.getElementById('primary-text-color')?.value || '#ffffff';
  const secondaryText = document.getElementById('secondary-text-color')?.value || '#52b8ff';
  
  // Convert hex to rgba for background
  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  // Update mockup background
  mockup.style.background = `linear-gradient(135deg, ${hexToRgba(primaryBg, 0.75)} 0%, ${hexToRgba(secondaryBg, 0.75)} 100%)`;
  
  // Update persona name color
  const personaName = mockup.querySelector('.preview-persona-name');
  if (personaName) {
    personaName.style.color = primaryText;
  }
  
  // Update persona highlight - apply to entire preview box
  const personaHighlight = document.getElementById('persona-highlight-color')?.value || '#63df4e';
  mockup.style.borderColor = personaHighlight;
  mockup.style.boxShadow = `0 0 20px ${hexToRgba(personaHighlight, 0.4)}, 0 8px 24px rgba(0, 0, 0, 0.15)`;
  
  // Update persona name color to match highlight
  if (personaName) {
    personaName.style.color = personaHighlight;
  }
  
  // Update persona title color
  const personaTitle = mockup.querySelector('.preview-persona-title');
  if (personaTitle) {
    personaTitle.style.color = secondaryText;
  }
  
  // Update current chapter highlight
  const chapterHighlight = document.getElementById('chapter-highlight-color')?.value || '#ffc107';
  const currentChapter = mockup.querySelector('.preview-chapter-item.current');
  if (currentChapter) {
    currentChapter.style.background = hexToRgba(chapterHighlight, 0.3);
    currentChapter.style.borderColor = hexToRgba(chapterHighlight, 0.8);
    currentChapter.style.boxShadow = `0 0 0 3px ${hexToRgba(chapterHighlight, 0.4)}`;
    
    // Update chapter title color
    const chapterTitle = currentChapter.querySelector('.preview-chapter-title');
    if (chapterTitle) {
      chapterTitle.style.color = chapterHighlight;
    }
  }
  
  // Update non-current chapter title color
  const nonCurrentChapterTitles = mockup.querySelectorAll('.preview-chapter-item:not(.current) .preview-chapter-title');
  nonCurrentChapterTitles.forEach(title => {
    title.style.color = primaryText;
  });
  
  // Update value drivers background, border, and text color
  const drivers = mockup.querySelectorAll('.preview-driver');
  drivers.forEach(driver => {
    driver.style.background = hexToRgba(accentColor, 0.2);
    driver.style.borderLeftColor = hexToRgba(accentColor, 0.6);
    driver.style.color = primaryText;
  });
  
  // Update checkbox accent color
  const checkboxes = mockup.querySelectorAll('.preview-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.style.accentColor = accentColor;
  });
}

// Mark as custom when colors are changed
function markAsCustom() {
  if (isCustomizing) {
    // Don't change the dropdown selection, just update the custom colors
    updateCustomColors();
    
    // Save the custom colors to storage and apply them immediately
    chrome.storage.local.set({
      customColors: customColors,
      colorScheme: 'custom'
    }, () => {
      console.log('Custom colors saved and applied:', customColors);
      
      // Trigger color scheme application in content script
      // Send a message to all tabs to apply the new color scheme
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'applyColorScheme',
            colorScheme: 'custom',
            customColors: customColors
          }, (response) => {
            if (chrome.runtime.lastError) {
              // Ignore errors for tabs that don't have the content script
            }
          });
        });
      });
    });
  }
}

// Update custom colors object
function updateCustomColors() {
  customColors = {
    primary: document.getElementById('primary-bg-color')?.value || '#032d42',
    secondary: document.getElementById('secondary-bg-color')?.value || '#7661ff',
    accent: document.getElementById('accent-color')?.value || '#52b8ff',
    primaryText: document.getElementById('primary-text-color')?.value || '#ffffff',
    secondaryText: document.getElementById('secondary-text-color')?.value || '#52b8ff',
    personaHighlight: document.getElementById('persona-highlight-color')?.value || '#63df4e',
    chapterHighlight: document.getElementById('chapter-highlight-color')?.value || '#ffc107'
  };
}

// Export custom theme
function exportCustomTheme() {
  const colorSchemeSelect = document.getElementById('color-scheme');
  const selectedThemeId = colorSchemeSelect.value;
  
  if (!selectedThemeId || !selectedThemeId.startsWith('custom-')) {
    showNotification('Please select a custom theme to export', 'error');
    return;
  }
  
  const theme = savedCustomThemes[selectedThemeId];
  if (!theme) {
    showNotification('Theme not found', 'error');
    return;
  }
  
  // Create export data
  const exportData = {
    name: theme.name,
    colors: theme.colors,
    createdAt: theme.createdAt,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  // Create and download file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `theme-${theme.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showNotification(`Theme "${theme.name}" exported successfully!`, 'success');
}

// Import custom theme
function importCustomTheme(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importData = JSON.parse(e.target.result);
      
      // Validate theme data
      if (!importData.name || !importData.colors) {
        throw new Error('Invalid theme file format - missing required fields');
      }
      
      // Validate colors object
      const requiredColors = ['primary', 'secondary', 'accent', 'primaryText', 'secondaryText'];
      for (const color of requiredColors) {
        if (!importData.colors[color]) {
          throw new Error(`Invalid theme file - missing color: ${color}`);
        }
      }
      
      const colorSchemeSelect = document.getElementById('color-scheme');
      const selectedThemeId = colorSchemeSelect.value;
      
      // If a custom theme is selected, ask to replace or create new
      if (selectedThemeId && selectedThemeId.startsWith('custom-')) {
        const choice = confirm(`Replace current theme "${savedCustomThemes[selectedThemeId].name}" with "${importData.name}"?\n\nClick OK to replace, or Cancel to create a new theme.`);
        
        if (choice) {
          // Replace existing theme
          savedCustomThemes[selectedThemeId] = {
            id: selectedThemeId,
            name: importData.name,
            colors: importData.colors,
            createdAt: importData.createdAt || new Date().toISOString(),
            importedAt: new Date().toISOString()
          };
          
          // Save to storage
          chrome.storage.local.set({
            savedCustomThemes: savedCustomThemes,
            customColors: importData.colors,
            colorScheme: selectedThemeId
          }, () => {
            // Update the dropdown
            updateThemeDropdown();
            
            // Load the imported colors
            loadCurrentThemeColors();
            updatePreviewMockup();
            
            showNotification(`Theme "${importData.name}" imported and replaced existing theme!`, 'success');
          });
        } else {
          // Create new theme
          createNewThemeFromImport(importData);
        }
      } else {
        // No custom theme selected, create new theme
        createNewThemeFromImport(importData);
      }
    } catch (error) {
      showNotification('Error importing theme: ' + error.message, 'error');
      console.error('Import error:', error);
    }
  };
  
  reader.readAsText(file);
  
  // Reset file input
  event.target.value = '';
}

// Helper function to create a new theme from imported data
function createNewThemeFromImport(importData) {
  // Generate unique theme ID
  const themeId = `custom-${Date.now()}`;
  
  // Create theme object
  const theme = {
    id: themeId,
    name: importData.name,
    colors: importData.colors,
    createdAt: importData.createdAt || new Date().toISOString(),
    importedAt: new Date().toISOString()
  };
  
  // Add to saved themes
  savedCustomThemes[themeId] = theme;
  
  // Save to storage
  chrome.storage.local.set({
    savedCustomThemes: savedCustomThemes,
    customColors: importData.colors,
    colorScheme: themeId
  }, () => {
    // Update the dropdown
    updateThemeDropdown();
    
    // Select the new theme
    document.getElementById('color-scheme').value = themeId;
    
    // Load the imported colors
    loadCurrentThemeColors();
    updatePreviewMockup();
    
    // Update button visibility
    updateActionButtonsVisibility();
    updateDeleteButtonVisibility(themeId);
    
    showNotification(`Theme "${importData.name}" imported as new theme!`, 'success');
  });
}

// Load saved custom themes from storage
function loadSavedCustomThemes() {
  chrome.storage.local.get(['savedCustomThemes'], (result) => {
    if (result.savedCustomThemes) {
      savedCustomThemes = result.savedCustomThemes;
      updateThemeDropdown();
    }
  });
}

// Update theme dropdown with saved custom themes
function updateThemeDropdown() {
  const colorSchemeSelect = document.getElementById('color-scheme');
  const currentValue = colorSchemeSelect.value;
  
  // Remove existing custom themes (keep built-in ones)
  const existingOptions = Array.from(colorSchemeSelect.options);
  existingOptions.forEach(option => {
    if (option.value.startsWith('custom-')) {
      option.remove();
    }
  });
  
  // Add saved custom themes
  Object.keys(savedCustomThemes).forEach(themeId => {
    const theme = savedCustomThemes[themeId];
    const option = document.createElement('option');
    option.value = themeId;
    option.textContent = `🎨 ${theme.name}`;
    colorSchemeSelect.appendChild(option);
  });
  
  // Restore the previously selected value
  colorSchemeSelect.value = currentValue;
  
  // Update button visibility
  updateDeleteButtonVisibility(currentValue);
  updateActionButtonsVisibility();
}

// Update delete button visibility based on selected theme
function updateDeleteButtonVisibility(selectedValue) {
  const deleteBtn = document.getElementById('delete-custom-theme-btn');
  
  if (selectedValue && selectedValue.startsWith('custom-')) {
    deleteBtn.style.display = 'flex';
  } else {
    deleteBtn.style.display = 'none';
  }
}

// Update export/import buttons visibility
function updateActionButtonsVisibility() {
  const exportBtn = document.getElementById('export-custom-theme');
  const importBtn = document.getElementById('import-custom-theme');
  const colorSchemeSelect = document.getElementById('color-scheme');
  const selectedValue = colorSchemeSelect.value;
  
  // Import is always available when customization panel is open
  if (isCustomizing) {
    importBtn.style.display = 'flex';
  } else {
    importBtn.style.display = 'none';
  }
  
  // Export is only available when a saved custom theme is selected AND panel is open
  if (isCustomizing && selectedValue && selectedValue.startsWith('custom-')) {
    exportBtn.style.display = 'flex';
  } else {
    exportBtn.style.display = 'none';
  }
}

// Apply built-in theme
function applyBuiltInTheme(themeName) {
  chrome.storage.local.set({
    colorScheme: themeName,
    customColors: {} // Clear custom colors when using built-in theme
  });
}

// Load a saved custom theme
function loadSavedCustomTheme(themeId) {
  if (savedCustomThemes[themeId]) {
    const theme = savedCustomThemes[themeId];
    
    // Apply the colors to the color pickers
    document.getElementById('primary-bg-color').value = theme.colors.primary;
    document.getElementById('secondary-bg-color').value = theme.colors.secondary;
    document.getElementById('accent-color').value = theme.colors.accent;
    document.getElementById('primary-text-color').value = theme.colors.primaryText;
    document.getElementById('secondary-text-color').value = theme.colors.secondaryText;
    document.getElementById('persona-highlight-color').value = theme.colors.personaHighlight || '#63df4e';
    document.getElementById('chapter-highlight-color').value = theme.colors.chapterHighlight || '#ffc107';
    
    updateAllColorPreviews();
    updatePreviewMockup();
    
    // Save as current color scheme
    chrome.storage.local.set({
      customColors: theme.colors,
      colorScheme: themeId
    });
  }
}

// Validate theme name
function validateThemeName() {
  const themeNameInput = document.getElementById('custom-theme-name');
  const saveBtn = document.getElementById('save-custom-colors');
  const themeName = themeNameInput.value.trim();
  
  if (themeName.length === 0) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Enter Theme Name';
    return false;
  }
  
  // Check if theme name already exists
  const existingTheme = Object.values(savedCustomThemes).find(theme => 
    theme.name.toLowerCase() === themeName.toLowerCase()
  );
  
  if (existingTheme) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Name Already Exists';
    return false;
  }
  
  saveBtn.disabled = false;
  saveBtn.textContent = 'Save Theme';
  return true;
}

// Save custom theme with name
function saveCustomTheme() {
  const themeNameInput = document.getElementById('custom-theme-name');
  const themeName = themeNameInput.value.trim();
  
  if (!themeName) {
    showNotification('Please enter a theme name', 'error');
    return;
  }
  
  if (!validateThemeName()) {
    return;
  }
  
  updateCustomColors();
  
  // Generate unique theme ID
  const themeId = `custom-${Date.now()}`;
  
  // Create theme object
  const theme = {
    id: themeId,
    name: themeName,
    colors: customColors,
    createdAt: new Date().toISOString()
  };
  
  // Add to saved themes
  savedCustomThemes[themeId] = theme;
  
  // Save to storage
  chrome.storage.local.set({
    savedCustomThemes: savedCustomThemes,
    customColors: customColors,
    colorScheme: themeId
  }, () => {
    // Update the dropdown
    updateThemeDropdown();
    
    // Select the new theme
    document.getElementById('color-scheme').value = themeId;
    
    // Clear the theme name input
    themeNameInput.value = '';
    
    // Hide the panel
    document.getElementById('custom-color-panel').style.display = 'none';
    isCustomizing = false;
    
    // Update button visibility
    updateActionButtonsVisibility();
    updateDeleteButtonVisibility(themeId);
    
    // Show success message
    showNotification(`Theme "${themeName}" saved successfully!`, 'success');
  });
}

// Delete custom theme
function deleteCustomTheme() {
  const colorSchemeSelect = document.getElementById('color-scheme');
  const selectedThemeId = colorSchemeSelect.value;
  
  if (!selectedThemeId || !selectedThemeId.startsWith('custom-')) {
    showNotification('Please select a custom theme to delete', 'error');
    return;
  }
  
  const theme = savedCustomThemes[selectedThemeId];
  if (!theme) {
    showNotification('Theme not found', 'error');
    return;
  }
  
  // Confirm deletion
  if (confirm(`Are you sure you want to delete the theme "${theme.name}"? This action cannot be undone.`)) {
    // Remove from saved themes
    delete savedCustomThemes[selectedThemeId];
    
    // Save updated themes to storage
    chrome.storage.local.set({
      savedCustomThemes: savedCustomThemes
    }, () => {
      // If the deleted theme was currently selected, switch to default
      if (colorSchemeSelect.value === selectedThemeId) {
        colorSchemeSelect.value = 'default';
        applyBuiltInTheme('default');
      }
      
      // Update the dropdown
      updateThemeDropdown();
      
      // Show success message
      showNotification(`Theme "${theme.name}" deleted successfully!`, 'success');
    });
  }
}

// Logo Upload Functions
function loadCustomLogo(customLogo) {
  const logoPreview = document.getElementById('logo-preview');
  
  if (customLogo) {
    // Load custom logo in preview only
    logoPreview.src = customLogo;
  } else {
    // Load default logo in preview
    const defaultLogoPath = chrome.runtime ? chrome.runtime.getURL('icons/logo-solo.png') : 'icons/logo-solo.png';
    logoPreview.src = defaultLogoPath;
  }
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  
  if (!file) {
    return;
  }
  
  // Validate file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    showNotification('Please upload a valid image file (PNG, JPG, or SVG)', 'error');
    return;
  }
  
  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes
  if (file.size > maxSize) {
    showNotification('Image file size must be less than 2MB', 'error');
    return;
  }
  
  // Read the file as data URL
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    
    // Update preview only (not the header logo)
    const logoPreview = document.getElementById('logo-preview');
    logoPreview.src = dataUrl;
    
    // Save to storage
    chrome.storage.local.set({ customLogo: dataUrl }, () => {
      originalSettings.customLogo = dataUrl;
      showNotification('Logo uploaded successfully! The new logo will appear in the side panel.', 'success');
      notifyAllTabsOfSettingsUpdate();
    });
  };
  
  reader.onerror = function() {
    showNotification('Error reading image file. Please try again.', 'error');
  };
  
  reader.readAsDataURL(file);
  
  // Clear the file input so the same file can be uploaded again
  event.target.value = '';
}

function resetLogo() {
  if (!confirm('Are you sure you want to reset to the default logo?')) {
    return;
  }
  
  // Clear custom logo from storage
  chrome.storage.local.set({ customLogo: null }, () => {
    originalSettings.customLogo = null;
    
    // Reset to default logo in preview only
    const defaultLogoPath = chrome.runtime ? chrome.runtime.getURL('icons/logo-solo.png') : 'icons/logo-solo.png';
    const logoPreview = document.getElementById('logo-preview');
    logoPreview.src = defaultLogoPath;
    
    showNotification('Logo reset to default', 'success');
    notifyAllTabsOfSettingsUpdate();
  });
}

