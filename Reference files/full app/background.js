chrome.runtime.onInstalled.addListener(() => {
    console.log("DemoMojo installed!");
  });

// Handle screenshot capture requests from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureTab') {
    // Capture the visible tab
    chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error('Error capturing tab:', chrome.runtime.lastError);
        sendResponse(null);
      } else {
        // Compress the image before sending back
        compressImage(dataUrl).then(compressed => {
          sendResponse(compressed);
        }).catch(error => {
          console.error('Error compressing image:', error);
          sendResponse(dataUrl); // Send original if compression fails
        });
      }
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'closeAllOverlays') {
    // Broadcast close message to all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: 'closeOverlay' }, (response) => {
          // Ignore errors for tabs that don't have the content script
          if (chrome.runtime.lastError) {
            console.log(`Tab ${tab.id} doesn't have content script or couldn't receive message`);
          }
        });
      });
    });
    sendResponse({ success: true });
    return true;
  }
});

/**
 * Compress an image to reduce storage size
 */
async function compressImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = new OffscreenCanvas(1, 1);
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions while maintaining aspect ratio
      const maxWidth = 800;
      const maxHeight = 600;
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG for better compression
      canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 }).then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }).catch(reject);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = dataUrl;
  });
}
  