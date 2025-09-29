// Settings page functionality
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
    'autoHighlightChapter',
    'showProgressIndicators',
    'crossTabChapterSync',
    'crossTabHighlightingSync',
    'customShortcuts',
    'openaiApiKey',
    'openaiModel',
    'openaiMaxTokens',
    'defaultGuidelines',
    'pdfFileSizeLimit'
  ], (result) => {
    // Set form values
    document.getElementById('shortcuts-enabled').checked = result.shortcutsEnabled !== false;
    document.getElementById('default-overlay-size').value = result.overlaySize || 'small';
    document.getElementById('default-overlay-position').value = result.overlayPosition || 'bottom-right';
    document.getElementById('overlay-opacity').value = result.overlayOpacity || 0.75;
    document.getElementById('color-scheme').value = result.colorScheme || 'default';
    document.getElementById('auto-highlight-chapter').checked = result.autoHighlightChapter || false;
    document.getElementById('show-progress-indicators').checked = result.showProgressIndicators !== false;
    document.getElementById('cross-tab-chapter-sync').checked = result.crossTabChapterSync !== false;
    document.getElementById('cross-tab-highlighting-sync').checked = result.crossTabHighlightingSync !== false;

    // OpenAI settings
    document.getElementById('openai-api-key').value = result.openaiApiKey || '';
    document.getElementById('openai-model').value = result.openaiModel || 'gpt-4';
    document.getElementById('openai-max-tokens').value = result.openaiMaxTokens || 2000;
    document.getElementById('default-guidelines').value = result.defaultGuidelines || '';
    document.getElementById('pdf-file-size-limit').value = result.pdfFileSizeLimit || 500;

    // Update opacity display
    updateOpacityDisplay(result.overlayOpacity || 0.75);

    // Load custom shortcuts
    loadCustomShortcuts(result.customShortcuts);
  });
}

function addEventListeners() {
  // Save settings button
  document.getElementById('save-settings').addEventListener('click', saveSettings);

  // Reset to defaults button
  document.getElementById('reset-to-defaults').addEventListener('click', resetToDefaults);

  // Opacity slider
  document.getElementById('overlay-opacity').addEventListener('input', function() {
    updateOpacityDisplay(this.value);
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
}

function initializeUI() {
  // Set up any initial UI state
  console.log('Settings page initialized');
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
    autoHighlightChapter: document.getElementById('auto-highlight-chapter').checked,
    showProgressIndicators: document.getElementById('show-progress-indicators').checked,
    crossTabChapterSync: document.getElementById('cross-tab-chapter-sync').checked,
    crossTabHighlightingSync: document.getElementById('cross-tab-highlighting-sync').checked,
    openaiApiKey: document.getElementById('openai-api-key').value.trim(),
    openaiModel: document.getElementById('openai-model').value,
    openaiMaxTokens: parseInt(document.getElementById('openai-max-tokens').value),
    defaultGuidelines: document.getElementById('default-guidelines').value.trim(),
    pdfFileSizeLimit: parseInt(document.getElementById('pdf-file-size-limit').value)
  };

  // Show loading overlay
  showLoadingOverlay();

  chrome.storage.local.set(settings, () => {
    // Update loading overlay to show success message after 0.5 seconds
    setTimeout(() => {
      showLoadingSuccess('Settings saved successfully!');
      
      // Hide loading overlay after another 0.8 seconds
      setTimeout(() => {
        hideLoadingOverlay();
      }, 800);
    }, 500);
    
    // Notify content script of settings changes
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (settings) => {
            // Dispatch event to notify content script
            document.dispatchEvent(new CustomEvent('settingsUpdated', {
              detail: settings
            }));
          },
          args: [settings]
        });
      }
    });
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
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: data
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `demo-persona-overlay-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showStatusMessage('Data exported successfully!', 'success');
  });
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importData = JSON.parse(e.target.result);
      
      if (!importData.data) {
        throw new Error('Invalid backup file format');
      }

      if (confirm('This will overwrite your current data. Are you sure you want to continue?')) {
        chrome.storage.local.clear(() => {
          chrome.storage.local.set(importData.data, () => {
            loadSettings();
            showStatusMessage('Data imported successfully!', 'success');
          });
        });
      }
    } catch (error) {
      showStatusMessage('Error importing data: ' + error.message, 'error');
    }
  };
  
  reader.readAsText(file);
  
  // Reset file input
  event.target.value = '';
}

function resetAllData() {
  if (confirm('Are you sure you want to delete ALL data? This includes all stories, personas, chapters, and settings. This action cannot be undone.')) {
    chrome.storage.local.clear(() => {
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
  'toggle-overlay': 'Shift+H',
  'toggle-fullscreen': 'Shift+O',
  'next-chapter': 'Shift+ArrowRight',
  'prev-chapter': 'Shift+ArrowLeft',
  'next-persona': 'Shift+ArrowDown',
  'prev-persona': 'Shift+ArrowUp',
  'save-url': 'Shift+S',
  'toggle-shift': 'Shift+P'
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
    // Update loading overlay to show success message after 0.5 seconds
    setTimeout(() => {
      if (hasChanges) {
        showLoadingSuccess('Custom shortcuts saved successfully!');
        
        // Notify content script of shortcuts changes
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: (shortcuts) => {
                // Dispatch event to notify content script
                document.dispatchEvent(new CustomEvent('shortcutsUpdated', {
                  detail: { customShortcuts: shortcuts }
                }));
              },
              args: [customShortcuts]
            });
          }
        });
      } else {
        showLoadingSuccess('No changes to save');
      }
      
      // Hide loading overlay after another 0.8 seconds
      setTimeout(() => {
        hideLoadingOverlay();
        updateShortcutButtonStates();
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
