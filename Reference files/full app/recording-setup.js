// Recording setup page logic
let selectedCaptureType = 'tab';
let selectedPreset = 'current';
let isCustomSize = false;

const presetDimensions = {
  '16:9': { width: 1920, height: 1080 },
  '4:3': { width: 1600, height: 1200 },
  '21:9': { width: 2560, height: 1080 },
  '16:10': { width: 1920, height: 1200 },
  '1:1': { width: 1080, height: 1080 },
  '9:16': { width: 1080, height: 1920 }
};

document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI
  setupCaptureTypeSelection();
  setupPresetSelection();
  setupDevicePresets();
  setupCustomSize();
  
  // Button handlers
  document.getElementById('startBtn').addEventListener('click', startRecording);
  document.getElementById('cancelBtn').addEventListener('click', () => {
    window.close();
  });
});

function setupCaptureTypeSelection() {
  const cards = document.querySelectorAll('.option-card');
  
  // Function to update UI based on capture type
  const updateCaptureUI = (captureType) => {
    const sizeSection = document.getElementById('sizeSection');
    const screenInfo = document.getElementById('screenInfo');
    
    if (captureType === 'screen') {
      sizeSection.classList.add('hidden');
      screenInfo.classList.remove('hidden');
    } else {
      sizeSection.classList.remove('hidden');
      screenInfo.classList.add('hidden');
    }
  };
  
  // Initialize with default capture type (tab)
  updateCaptureUI('tab');
  
  cards.forEach(card => {
    card.addEventListener('click', function() {
      // Remove selected class from all cards
      cards.forEach(c => c.classList.remove('selected'));
      // Add selected class to clicked card
      this.classList.add('selected');
      
      selectedCaptureType = this.dataset.type;
      updateCaptureUI(selectedCaptureType);
    });
  });
}

function setupDevicePresets() {
  const select = document.getElementById('devicePreset');
  if (!select) return;
  select.addEventListener('change', function() {
    if (!this.value) return;
    const [name, w, h] = this.value.split('|');
    const width = parseInt(w);
    const height = parseInt(h);
    // Switch to custom preset and reveal inputs
    selectedPreset = 'custom';
    isCustomSize = true;
    const customSize = document.getElementById('customSize');
    customSize.classList.remove('hidden');
    // Update inputs
    const widthInput = document.getElementById('customWidth');
    const heightInput = document.getElementById('customHeight');
    widthInput.value = width;
    heightInput.value = height;
    // Update preset button selection UI
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(b => b.classList.remove('selected'));
    const customBtn = Array.from(presetButtons).find(b => b.dataset.preset === 'custom');
    if (customBtn) customBtn.classList.add('selected');
  });
}

function setupPresetSelection() {
  const presetButtons = document.querySelectorAll('.preset-btn');
  presetButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove selected class from all buttons
      presetButtons.forEach(b => b.classList.remove('selected'));
      // Add selected class to clicked button
      this.classList.add('selected');
      
      const preset = this.dataset.preset;
      selectedPreset = preset;
      
      // Show/hide custom size inputs
      const customSize = document.getElementById('customSize');
      if (preset === 'custom') {
        customSize.classList.remove('hidden');
        isCustomSize = true;
      } else {
        customSize.classList.add('hidden');
        isCustomSize = false;
      }
    });
  });
}

function setupCustomSize() {
  const widthInput = document.getElementById('customWidth');
  const heightInput = document.getElementById('customHeight');
  
  widthInput.addEventListener('blur', function() {
    // Only validate when input loses focus (user finished typing)
    const value = parseInt(this.value);
    if (isNaN(value) || value < 320) {
      this.value = 320;
    } else if (value > 3840) {
      this.value = 3840;
    }
  });
  
  heightInput.addEventListener('blur', function() {
    // Only validate when input loses focus (user finished typing)
    const value = parseInt(this.value);
    if (isNaN(value) || value < 240) {
      this.value = 240;
    } else if (value > 2160) {
      this.value = 2160;
    }
  });
}

function getSelectedDimensions() {
  if (selectedPreset === 'current') {
    return null; // Signal to skip resize
  }
  
  if (isCustomSize) {
    const width = parseInt(document.getElementById('customWidth').value) || 1920;
    const height = parseInt(document.getElementById('customHeight').value) || 1080;
    return { width, height };
  } else {
    return presetDimensions[selectedPreset] || presetDimensions['16:9'];
  }
}

async function startRecording() {
  const startBtn = document.getElementById('startBtn');
  startBtn.disabled = true;
  startBtn.textContent = 'Starting...';
  
  try {
    const dimensions = getSelectedDimensions();
    
    // Get audio option
    const enableMic = document.getElementById('enableMic').checked;
    // Quality options
    const frameRate = parseInt(document.getElementById('framerateSelect')?.value || '30');
    const videoBitsPerSecond = parseInt(document.getElementById('bitrateSelect')?.value || '2500000');
    const codec = document.getElementById('codecSelect')?.value || 'auto';
    
    // Save recording config to storage
    await chrome.storage.local.set({
      recordingConfig: {
        captureType: selectedCaptureType,
        dimensions: dimensions,
        timestamp: Date.now(),
        enableMic: enableMic,
        videoOptions: {
          frameRate: frameRate,
          videoBitsPerSecond: videoBitsPerSecond,
          codec: codec
        }
      }
    });
    
    // Resize window for Tab/Window mode (unless current size selected)
    if (selectedCaptureType !== 'screen' && dimensions !== null) {
      // Get current window to get its position
      const currentWindow = await chrome.windows.getCurrent();
      
      // Calculate desired window size (accounting for browser UI and tab sharing bar)
      const toolbarHeight = 95; // Approximate toolbar height
      const shareBarHeight = selectedCaptureType === 'tab' ? 40 : 0; // Compensate for Chrome's sharing bar in tab capture
      const desiredWidth = dimensions.width;
      const desiredHeight = dimensions.height + toolbarHeight + shareBarHeight;
      
      // Get available screen space
      let availableWidth = 1920; // Default fallback
      let availableHeight = 1080;
      
      try {
        // Get screen dimensions from the tab
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
          const screenInfo = await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => ({ width: screen.availWidth, height: screen.availHeight })
          });
          
          if (screenInfo && screenInfo[0] && screenInfo[0].result) {
            availableWidth = screenInfo[0].result.width;
            availableHeight = screenInfo[0].result.height;
          }
        }
      } catch (e) {
        console.log('Could not get screen dimensions, using defaults');
      }
      
      // Calculate scaling factor to maintain aspect ratio
      let scaleWidth = 1;
      let scaleHeight = 1;
      
      // Check if we need to scale down width
      if (desiredWidth > availableWidth) {
        scaleWidth = (availableWidth * 0.9) / desiredWidth; // Leave 10% margin
      }
      
      // Check if we need to scale down height
      if (desiredHeight > availableHeight) {
        scaleHeight = (availableHeight * 0.9) / desiredHeight; // Leave 10% margin
      }
      
      // Use the smaller scaling factor to ensure both dimensions fit
      const scale = Math.min(scaleWidth, scaleHeight);
      
      let newWidth = desiredWidth;
      let newHeight = desiredHeight;
      
      // Only scale if necessary
      if (scale < 1) {
        newWidth = desiredWidth * scale;
        newHeight = desiredHeight * scale;
        console.log(`Scaling window to fit screen: ${Math.round(newWidth)}x${Math.round(newHeight)} (scale: ${scale.toFixed(2)})`);
      }
      
      // Apply the resize
      await chrome.windows.update(currentWindow.id, {
        width: Math.round(newWidth),
        height: Math.round(newHeight),
        state: 'normal'
      });
      
      // Small delay to allow resize to complete
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Open recording controls window
    const recordingWindow = await chrome.windows.create({
      url: chrome.runtime.getURL('recording.html'),
      type: 'popup',
      width: 420,
      height: 360,
      focused: true
    });
    
    // Close setup window
    window.close();
    
  } catch (error) {
    console.error('Error starting recording:', error);
    alert('Failed to start recording: ' + error.message);
    startBtn.disabled = false;
    startBtn.textContent = 'Start Recording';
  }
}

