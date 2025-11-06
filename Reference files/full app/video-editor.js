// Video Editor Logic
let sourceBlob = null;
let sourceUrl = null;
let originalBitrateBps = 0; // computed from source
let hasAudio = true;
let applyDenoise = false;
let hasExported = false; // Track if video has been exported
let cutSegments = []; // Array of {start, end} segments to cut

const bc = new BroadcastChannel('demomoj-editor');

function log(msg) {
  const el = document.getElementById('log');
  if (el) el.textContent = msg;
}

function setStatus(msg, progress = null) {
  const el = document.getElementById('loadStatus');
  if (el) {
    if (progress !== null && progress >= 0) {
      el.innerHTML = `<div style="display: flex; align-items: center; gap: 8px; min-width: 200px;">
        <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden;">
          <div style="height: 100%; background: #2563eb; width: ${progress}%; transition: width 0.3s;"></div>
        </div>
        <span>${Math.round(progress)}%</span>
      </div>`;
    } else {
      el.textContent = msg;
    }
  }
}

// Cleanup function to free memory
function cleanup() {
  if (sourceUrl) {
    URL.revokeObjectURL(sourceUrl);
    sourceUrl = null;
  }
  sourceBlob = null;
  bc.close();
}

// Check if user should be warned before closing
function shouldWarnBeforeClose() {
  return sourceBlob !== null && !hasExported;
}

document.addEventListener('DOMContentLoaded', () => {
  // Set logo path
  const logoImg = document.getElementById('logoImg');
  if (logoImg && chrome && chrome.runtime) {
    logoImg.src = chrome.runtime.getURL('icons/logo-solo.png');
  }
  
  // Announce ready to sender
  bc.postMessage({ type: 'ready' });
  
  // Warn before closing if video hasn't been exported
  window.addEventListener('beforeunload', (e) => {
    if (shouldWarnBeforeClose()) {
      e.preventDefault();
      // Modern browsers ignore the message, but we still need to set it
      e.returnValue = 'You have an unsaved video. Are you sure you want to leave?';
      return e.returnValue;
    } else {
      cleanup();
    }
  });
  
  // Cleanup on page hide (for mobile/background tabs)
  window.addEventListener('pagehide', () => {
    if (!shouldWarnBeforeClose()) {
      cleanup();
    }
  });

  bc.onmessage = async (evt) => {
    if (!evt.data) return;
    if (evt.data.type === 'video' && evt.data.buffer) {
      try {
        sourceBlob = new Blob([evt.data.buffer], { type: evt.data.mime || 'video/webm' });
        sourceUrl = URL.createObjectURL(sourceBlob);
        const video = document.getElementById('preview');
        video.preload = 'metadata'; // Prefer metadata loading
        video.src = sourceUrl;
        
        // Always start playback from trim start
        video.addEventListener('play', () => {
          const trimStart = parseFloat(document.getElementById('trimStart').value) || 0;
          // Always seek to trim start when play is clicked (unless already there)
          if (Math.abs(video.currentTime - trimStart) > 0.01) {
            video.currentTime = trimStart;
          }
        }, { once: false });
        
        // Helper function to restart playback from trim start
        window.restartPlayback = function() {
          const video = document.getElementById('preview');
          if (!video || !video.duration || !isFinite(video.duration)) return;
          const trimStart = parseFloat(document.getElementById('trimStart').value) || 0;
          video.pause();
          video.currentTime = trimStart;
        };
        
        // Initialize timeline and UI as soon as metadata is available
        const initializeVideoUI = (duration) => {
          if (duration && isFinite(duration) && duration > 0) {
            document.getElementById('videoInfo').textContent = `Duration: ${duration.toFixed(2)}s, Type: ${sourceBlob.type}`;
            document.getElementById('trimEnd').value = duration.toFixed(2);
            // Compute original bitrate (approx): size(bytes)*8 / duration(s)
            if (sourceBlob && sourceBlob.size) {
              originalBitrateBps = Math.floor((sourceBlob.size * 8) / Math.max(0.001, duration));
            }
            // Initialize timeline immediately
            updateTimeline();
            // Setup preview playback with cut skipping
            setupPreviewSkipCuts(video);
            // Setup timeline scrubbing
            setupTimelineScrubbing();
            // Update playhead on timeupdate
            video.addEventListener('timeupdate', updatePlayhead);
            // Update export button visibility
            updateExportButtons();
            setStatus('Video loaded');
          }
        };
        
        // Check if metadata is already available
        if (video.readyState >= 1) {
          // Metadata already loaded
          const duration = video.duration;
          if (duration && isFinite(duration) && duration > 0) {
            initializeVideoUI(duration);
          } else {
            // Duration not available yet, wait for it
            document.getElementById('videoInfo').textContent = `Type: ${sourceBlob.type} (loading duration...)`;
            const handleDurationAvailable = () => {
              const d = video.duration;
              if (d && isFinite(d) && d > 0) {
                initializeVideoUI(d);
                video.removeEventListener('durationchange', handleDurationAvailable);
                video.removeEventListener('loadedmetadata', handleDurationAvailable);
              }
            };
            video.addEventListener('durationchange', handleDurationAvailable, { once: true });
            video.addEventListener('loadedmetadata', handleDurationAvailable, { once: true });
            // Fallback: check periodically
            const checkInterval = setInterval(() => {
              const d = video.duration;
              if (d && isFinite(d) && d > 0) {
                clearInterval(checkInterval);
                initializeVideoUI(d);
              }
            }, 100);
            // Stop checking after 5 seconds
            setTimeout(() => clearInterval(checkInterval), 5000);
          }
        } else {
          // Wait for metadata to load
          document.getElementById('videoInfo').textContent = `Type: ${sourceBlob.type} (loading metadata...)`;
          
          const handleMetadataLoaded = () => {
            const duration = video.duration;
            if (duration && isFinite(duration) && duration > 0) {
              initializeVideoUI(duration);
            } else {
              // Duration still not available, wait for it
              document.getElementById('videoInfo').textContent = `Type: ${sourceBlob.type} (loading duration...)`;
              const handleDurationAvailable = () => {
                const d = video.duration;
                if (d && isFinite(d) && d > 0) {
                  initializeVideoUI(d);
                }
              };
              video.addEventListener('durationchange', handleDurationAvailable, { once: true });
              // Fallback: check periodically
              const checkInterval = setInterval(() => {
                const d = video.duration;
                if (d && isFinite(d) && d > 0) {
                  clearInterval(checkInterval);
                  initializeVideoUI(d);
                }
              }, 100);
              setTimeout(() => clearInterval(checkInterval), 3000);
            }
          };
          
          // Listen for loadedmetadata (fires earlier than loadeddata)
          video.addEventListener('loadedmetadata', handleMetadataLoaded, { once: true });
          
          // Fallback timeout - if metadata doesn't load quickly, try anyway
          setTimeout(() => {
            const duration = video.duration;
            if (duration && isFinite(duration) && duration > 0) {
              initializeVideoUI(duration);
            }
          }, 500);
        }
        
        // Don't wait for play - just load metadata in background
        // Try to play briefly to trigger metadata loading, then pause
        video.play().then(() => {
          video.pause();
          video.currentTime = 0;
        }).catch(() => {
          // Ignore play errors - metadata might still load
        });
      } catch (e) {
        setStatus('Failed to load video');
      }
    }
  };

  // Function to update button visual states
  function updateAudioButtons() {
    const removeBtn = document.getElementById('removeAudio');
    const cleanBtn = document.getElementById('cleanAudio');
    
    if (!hasAudio) {
      // Audio removed - highlight Remove Audio button
      removeBtn.classList.add('selected');
      cleanBtn.classList.remove('selected');
    } else if (applyDenoise) {
      // Audio cleaned - highlight Clean Up Audio button
      cleanBtn.classList.add('selected');
      removeBtn.classList.remove('selected');
    } else {
      // Normal audio - neither selected
      removeBtn.classList.remove('selected');
      cleanBtn.classList.remove('selected');
    }
  }

  document.getElementById('removeAudio').addEventListener('click', () => {
    // Toggle: if already selected, deselect it
    if (!hasAudio) {
      // Currently selected, deselect it
      hasAudio = true;
      applyDenoise = false;
      log('Audio will be kept on export');
    } else {
      // Not selected, select it
      hasAudio = false;
      applyDenoise = false;
      log('Audio will be removed on export');
    }
    updateAudioButtons();
    updateExportButtons();
  });

  document.getElementById('cleanAudio').addEventListener('click', () => {
    // Toggle: if already selected, deselect it
    if (applyDenoise) {
      // Currently selected, deselect it
      applyDenoise = false;
      hasAudio = true;
      log('Normal audio will be used on export');
    } else {
      // Not selected, select it
      applyDenoise = true;
      hasAudio = true;
      log('Audio denoise will be applied on export');
    }
    updateAudioButtons();
    updateExportButtons();
  });

  // Function to check if there are any edits
  function hasEdits() {
    const video = document.getElementById('preview');
    if (!video || !video.duration || !isFinite(video.duration)) return false;
    
    const duration = video.duration;
    const trimStart = parseFloat(document.getElementById('trimStart').value) || 0;
    const trimEnd = parseFloat(document.getElementById('trimEnd').value) || duration;
    
    const hasTrim = trimStart > 0.1 || (trimEnd < duration - 0.1);
    const hasCuts = cutSegments.length > 0;
    const hasAudioChange = !hasAudio || applyDenoise;
    
    return hasTrim || hasCuts || hasAudioChange;
  }
  
  // Function to update export button visibility
  function updateExportButtons() {
    const exportEditedBtn = document.getElementById('exportEditedBtn');
    if (hasEdits()) {
      exportEditedBtn.style.display = '';
    } else {
      exportEditedBtn.style.display = 'none';
    }
  }
  
  document.getElementById('resetBtn').addEventListener('click', () => {
    const video = document.getElementById('preview');
    hasAudio = true;
    applyDenoise = false;
    cutSegments = [];
    
    // Reset trim values
    if (video && video.duration && isFinite(video.duration)) {
      document.getElementById('trimStart').value = '0';
      document.getElementById('trimEnd').value = video.duration.toFixed(2);
    } else {
      document.getElementById('trimStart').value = '0';
      document.getElementById('trimEnd').value = '0';
    }
    
    updateAudioButtons();
    updateCutsDisplay();
    updateTimeline();
    updateExportButtons();
    if (video) {
      setupPreviewSkipCuts(video);
      restartPlayback();
    }
    log('Reset all options');
  });
  
  // Make trim marker draggable
  function makeMarkerDraggable(marker, timelineBar, duration) {
    let isDragging = false;
    let startX = 0;
    let startLeft = 0;
    const video = document.getElementById('preview');
    
    marker.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      const rect = timelineBar.getBoundingClientRect();
      startLeft = ((parseFloat(marker.style.left) / 100) * rect.width) + rect.left;
      // Pause video during drag
      if (video) {
        video.pause();
        skipInProgress = true; // Temporarily disable cut skipping during drag
      }
      e.preventDefault();
      e.stopPropagation();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const rect = timelineBar.getBoundingClientRect();
      const deltaX = e.clientX - startX;
      const newLeft = startLeft + deltaX - rect.left;
      const percent = Math.max(0, Math.min(100, (newLeft / rect.width) * 100));
      const newTime = (percent / 100) * duration;
      
      // Update marker position
      marker.style.left = `${percent}%`;
      
      // Update trim track
      const trimStart = parseFloat(document.getElementById('trimStart').value) || 0;
      const trimEnd = parseFloat(document.getElementById('trimEnd').value) || duration;
      
      if (marker.dataset.type === 'trim-start') {
        document.getElementById('trimStart').value = newTime.toFixed(2);
      } else if (marker.dataset.type === 'trim-end') {
        document.getElementById('trimEnd').value = newTime.toFixed(2);
      }
      
      // Prevent start > end
      if (marker.dataset.type === 'trim-start' && newTime >= trimEnd) {
        marker.style.left = `${(trimEnd / duration) * 100 - 0.1}%`;
        document.getElementById('trimStart').value = (trimEnd - 0.1).toFixed(2);
      } else if (marker.dataset.type === 'trim-end' && newTime <= trimStart) {
        marker.style.left = `${(trimStart / duration) * 100 + 0.1}%`;
        document.getElementById('trimEnd').value = (trimStart + 0.1).toFixed(2);
      }
      
      // Update timeline track immediately
      const newTrimStart = parseFloat(document.getElementById('trimStart').value) || 0;
      const newTrimEnd = parseFloat(document.getElementById('trimEnd').value) || duration;
      const timelineTrack = document.getElementById('timelineTrack');
      const trackStartPercent = (newTrimStart / duration) * 100;
      const trackEndPercent = (newTrimEnd / duration) * 100;
      timelineTrack.style.left = `${trackStartPercent}%`;
      timelineTrack.style.width = `${trackEndPercent - trackStartPercent}%`;
      
      // Scrub video to show position being dragged
      if (video && video.duration && isFinite(video.duration)) {
        const finalTime = marker.dataset.type === 'trim-start' ? 
          parseFloat(document.getElementById('trimStart').value) : 
          parseFloat(document.getElementById('trimEnd').value);
        video.currentTime = finalTime;
        updatePlayhead();
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        skipInProgress = false;         // Re-enable cut skipping
        updateTimeline(); // Full update after drag
        updateExportButtons();
        if (video) {
          setupPreviewSkipCuts(video);
          restartPlayback(); // Restart playback from trim start
        }
      }
    });
  }
  
  // Make cut segment draggable (moving whole cut)
  function makeCutDraggable(cutDiv, timelineBar, duration, cutIndex) {
    let isDragging = false;
    let startX = 0;
    let startLeft = 0;
    let originalCut = null;
    const video = document.getElementById('preview');
    
    cutDiv.addEventListener('mousedown', (e) => {
      // Don't drag if clicking on resize handles
      if (e.target.classList.contains('cut-resize-handle')) {
        return;
      }
      isDragging = true;
      startX = e.clientX;
      const rect = timelineBar.getBoundingClientRect();
      startLeft = ((parseFloat(cutDiv.style.left) / 100) * rect.width) + rect.left;
      originalCut = { ...cutSegments[cutIndex] };
      // Pause video during drag
      if (video) {
        video.pause();
        skipInProgress = true; // Temporarily disable cut skipping during drag
      }
      e.preventDefault();
      e.stopPropagation();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging || !originalCut) return;
      
      const rect = timelineBar.getBoundingClientRect();
      const deltaX = e.clientX - startX;
      const newLeft = startLeft + deltaX - rect.left;
      const percent = Math.max(0, Math.min(100, (newLeft / rect.width) * 100));
      const newStart = (percent / 100) * duration;
      
      const cutDuration = originalCut.end - originalCut.start;
      const newEnd = newStart + cutDuration;
      
      // Get trim boundaries
      const trimStart = parseFloat(document.getElementById('trimStart').value) || 0;
      const trimEnd = parseFloat(document.getElementById('trimEnd').value) || duration;
      
      // Clamp to trim boundaries
      let clampedStart = Math.max(trimStart, newStart);
      let clampedEnd = clampedStart + cutDuration;
      
      if (clampedEnd > trimEnd) {
        clampedEnd = trimEnd;
        clampedStart = clampedEnd - cutDuration;
      }
      
      // Check for overlaps with other cuts
      let hasOverlap = false;
      for (let i = 0; i < cutSegments.length; i++) {
        if (i === cutIndex) continue;
        const other = cutSegments[i];
        if ((clampedStart >= other.start && clampedStart < other.end) ||
            (clampedEnd > other.start && clampedEnd <= other.end) ||
            (clampedStart <= other.start && clampedEnd >= other.end)) {
          hasOverlap = true;
          break;
        }
      }
      
      if (!hasOverlap && clampedStart >= 0 && clampedEnd <= duration) {
        // Update cut position
        cutSegments[cutIndex].start = clampedStart;
        cutSegments[cutIndex].end = clampedEnd;
        
        // Update visual position
        const startPercent = (clampedStart / duration) * 100;
        const widthPercent = ((clampedEnd - clampedStart) / duration) * 100;
        cutDiv.style.left = `${startPercent}%`;
        cutDiv.style.width = `${widthPercent}%`;
        cutDiv.title = `Cut: ${clampedStart.toFixed(2)}s - ${clampedEnd.toFixed(2)}s (drag to move)`;
        
        // Update list display
        updateCutsDisplay();
        
        // Scrub video to show position being dragged (use center of cut)
        if (video && video.duration && isFinite(video.duration)) {
          const centerTime = clampedStart + (cutDuration / 2);
          video.currentTime = centerTime;
          updatePlayhead();
        }
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        skipInProgress = false; // Re-enable cut skipping
        updateTimeline(); // Full update after drag
        updateExportButtons();
        if (video) {
          setupPreviewSkipCuts(video);
          restartPlayback(); // Restart playback from trim start
        }
        originalCut = null;
      }
    });
  }
  
  // Make cut segment resizable (dragging start/end edges)
  function makeCutResizable(handle, timelineBar, duration, cutIndex, edge) {
    let isResizing = false;
    let startX = 0;
    let originalCut = null;
    const video = document.getElementById('preview');
    
    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      originalCut = { ...cutSegments[cutIndex] };
      // Pause video during drag
      if (video) {
        video.pause();
        skipInProgress = true; // Temporarily disable cut skipping during drag
      }
      e.preventDefault();
      e.stopPropagation();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isResizing || !originalCut) return;
      
      const rect = timelineBar.getBoundingClientRect();
      const deltaX = e.clientX - startX;
      const percentDelta = (deltaX / rect.width) * 100;
      const timeDelta = (percentDelta / 100) * duration;
      
      const trimStart = parseFloat(document.getElementById('trimStart').value) || 0;
      const trimEnd = parseFloat(document.getElementById('trimEnd').value) || duration;
      
      let newStart = originalCut.start;
      let newEnd = originalCut.end;
      
      if (edge === 'start') {
        newStart = originalCut.start + timeDelta;
        // Clamp to boundaries
        newStart = Math.max(trimStart, Math.min(newStart, originalCut.end - 0.1));
        // Check overlaps
        let hasOverlap = false;
        for (let i = 0; i < cutSegments.length; i++) {
          if (i === cutIndex) continue;
          const other = cutSegments[i];
          if ((newStart >= other.start && newStart < other.end) ||
              (newStart < other.start && newEnd > other.start)) {
            hasOverlap = true;
            break;
          }
        }
        if (hasOverlap) return;
      } else if (edge === 'end') {
        newEnd = originalCut.end + timeDelta;
        // Clamp to boundaries
        newEnd = Math.min(trimEnd, Math.max(newEnd, originalCut.start + 0.1));
        // Check overlaps
        let hasOverlap = false;
        for (let i = 0; i < cutSegments.length; i++) {
          if (i === cutIndex) continue;
          const other = cutSegments[i];
          if ((newEnd > other.start && newEnd <= other.end) ||
              (newStart < other.end && newEnd > other.end)) {
            hasOverlap = true;
            break;
          }
        }
        if (hasOverlap) return;
      }
      
      if (newStart < newEnd && newStart >= 0 && newEnd <= duration) {
        // Update cut
        cutSegments[cutIndex].start = newStart;
        cutSegments[cutIndex].end = newEnd;
        
        // Update visual
        const startPercent = (newStart / duration) * 100;
        const widthPercent = ((newEnd - newStart) / duration) * 100;
        const cutDiv = handle.parentElement;
        cutDiv.style.left = `${startPercent}%`;
        cutDiv.style.width = `${widthPercent}%`;
        cutDiv.title = `Cut: ${newStart.toFixed(2)}s - ${newEnd.toFixed(2)}s (drag to move, drag edges to resize)`;
        
        // Update list
        updateCutsDisplay();
        
        // Scrub video to show position being dragged (use the edge being dragged)
        if (video && video.duration && isFinite(video.duration)) {
          const scrubTime = edge === 'start' ? newStart : newEnd;
          video.currentTime = scrubTime;
          updatePlayhead();
        }
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        skipInProgress = false; // Re-enable cut skipping
        updateTimeline();
        updateExportButtons();
        if (video) {
          setupPreviewSkipCuts(video);
          restartPlayback(); // Restart playback from trim start
        }
        originalCut = null;
      }
    });
  }
  
  // Update timeline visualization
  function updateTimeline() {
    const video = document.getElementById('preview');
    const timelineBar = document.getElementById('timelineBar');
    const timelineTrack = document.getElementById('timelineTrack');
    const timelineCuts = document.getElementById('timelineCuts');
    const timelineMarkers = document.getElementById('timelineMarkers');
    const timelineStart = document.getElementById('timelineStart');
    const timelineEnd = document.getElementById('timelineEnd');
    
    if (!video || !video.duration || !isFinite(video.duration)) {
      return;
    }
    
    const duration = video.duration;
    const trimStart = parseFloat(document.getElementById('trimStart').value) || 0;
    const trimEnd = parseFloat(document.getElementById('trimEnd').value) || duration;
    
    // Update labels
    timelineStart.textContent = '0.00s';
    timelineEnd.textContent = `${duration.toFixed(2)}s`;
    
    // Clear existing markers and cuts
    timelineMarkers.innerHTML = '';
    timelineCuts.innerHTML = '';
    
    // Calculate positions as percentages
    const trimStartPercent = (trimStart / duration) * 100;
    const trimEndPercent = (trimEnd / duration) * 100;
    
    // Draw trim track (visible portion)
    timelineTrack.style.left = `${trimStartPercent}%`;
    timelineTrack.style.width = `${trimEndPercent - trimStartPercent}%`;
    
    // Draw trim start marker (draggable)
    const startMarker = document.createElement('div');
    startMarker.className = 'timeline-marker trim-start';
    startMarker.style.left = `${trimStartPercent}%`;
    startMarker.dataset.type = 'trim-start';
    makeMarkerDraggable(startMarker, timelineBar, duration);
    timelineMarkers.appendChild(startMarker);
    
    // Draw trim end marker (draggable)
    const endMarker = document.createElement('div');
    endMarker.className = 'timeline-marker trim-end';
    endMarker.style.left = `${trimEndPercent}%`;
    endMarker.dataset.type = 'trim-end';
    makeMarkerDraggable(endMarker, timelineBar, duration);
    timelineMarkers.appendChild(endMarker);
    
    // Draw cut segments (show all cuts, but highlight those within trim) - make draggable
    cutSegments.forEach((cut, index) => {
      // Calculate position relative to full video timeline
      const cutStartPercent = (cut.start / duration) * 100;
      const cutEndPercent = (cut.end / duration) * 100;
      const cutWidth = cutEndPercent - cutStartPercent;
      
      // Only show cuts that are at least partially within the visible trim area
      if (cut.end > trimStart && cut.start < trimEnd) {
        const cutDiv = document.createElement('div');
        cutDiv.className = 'timeline-cut';
        cutDiv.style.left = `${cutStartPercent}%`;
        cutDiv.style.width = `${cutWidth}%`;
        cutDiv.title = `Cut: ${cut.start.toFixed(2)}s - ${cut.end.toFixed(2)}s (drag to move, drag edges to resize)`;
        cutDiv.dataset.cutIndex = index;
        
        // Add resize handles
        const leftHandle = document.createElement('div');
        leftHandle.className = 'cut-resize-handle left';
        leftHandle.dataset.handle = 'start';
        leftHandle.dataset.cutIndex = index;
        
        const rightHandle = document.createElement('div');
        rightHandle.className = 'cut-resize-handle right';
        rightHandle.dataset.handle = 'end';
        rightHandle.dataset.cutIndex = index;
        
        cutDiv.appendChild(leftHandle);
        cutDiv.appendChild(rightHandle);
        
        makeCutDraggable(cutDiv, timelineBar, duration, index);
        makeCutResizable(leftHandle, timelineBar, duration, index, 'start');
        makeCutResizable(rightHandle, timelineBar, duration, index, 'end');
        
        timelineCuts.appendChild(cutDiv);
      }
    });
  }
  
  // Setup preview video to skip cuts automatically
  let skipInProgress = false;
  function setupPreviewSkipCuts(video) {
    if (!video) return;
    
    // Remove existing listener if any
    video.removeEventListener('timeupdate', handlePreviewTimeUpdate);
    
    // Add listener for skipping cuts during preview
    video.addEventListener('timeupdate', handlePreviewTimeUpdate);
  }
  
  function handlePreviewTimeUpdate() {
    if (skipInProgress) return;
    
    const video = document.getElementById('preview');
    if (!video || !video.duration || !isFinite(video.duration)) return;
    
    const currentTime = video.currentTime;
    const trimStart = parseFloat(document.getElementById('trimStart').value) || 0;
    const trimEnd = parseFloat(document.getElementById('trimEnd').value) || video.duration;
    
    // Check if we're outside trim boundaries
    if (currentTime < trimStart) {
      skipInProgress = true;
      video.currentTime = trimStart;
      video.addEventListener('seeked', () => { skipInProgress = false; }, { once: true });
      return;
    }
    
    if (currentTime >= trimEnd) {
      // Pause at trim end
      if (!video.paused) {
        video.pause();
        video.currentTime = trimEnd - 0.1; // Slightly before end
      }
      return;
    }
    
    // Check if we're in a cut segment
    for (const cut of cutSegments) {
      if (currentTime >= cut.start && currentTime < cut.end) {
        // We're in a cut segment, seek to its end
        skipInProgress = true;
        video.currentTime = cut.end;
        video.addEventListener('seeked', () => { skipInProgress = false; }, { once: true });
        return;
      }
    }
  }
  
  // Update playhead position on timeline
  function updatePlayhead() {
    const video = document.getElementById('preview');
    const playhead = document.getElementById('timelinePlayhead');
    
    if (!video || !playhead || !video.duration || !isFinite(video.duration)) {
      return;
    }
    
    const duration = video.duration;
    const currentTime = video.currentTime;
    const percent = (currentTime / duration) * 100;
    playhead.style.left = `${percent}%`;
  }
  
  // Make timeline bar and playhead draggable for scrubbing
  let timelineScrubbingSetup = false;
  function setupTimelineScrubbing() {
    if (timelineScrubbingSetup) return; // Already set up
    const timelineBar = document.getElementById('timelineBar');
    const playhead = document.getElementById('timelinePlayhead');
    const video = document.getElementById('preview');
    
    if (!timelineBar || !playhead || !video) return;
    
    timelineScrubbingSetup = true;
    let isDragging = false;
    let wasPlaying = false;
    
    // Mouse down on timeline bar or playhead
    const handleMouseDown = (e) => {
      // Don't scrub if clicking on markers or cuts
      if (e.target.classList.contains('timeline-marker') || 
          e.target.classList.contains('timeline-cut') ||
          e.target.classList.contains('cut-resize-handle')) {
        return;
      }
      
      isDragging = true;
      wasPlaying = !video.paused;
      if (wasPlaying) {
        video.pause();
      }
      
      // Seek to clicked position
      const rect = timelineBar.getBoundingClientRect();
      const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const duration = video.duration;
      if (duration && isFinite(duration)) {
        const newTime = (percent / 100) * duration;
        video.currentTime = newTime;
      }
      
      e.preventDefault();
      e.stopPropagation();
    };
    
    // Mouse move for dragging
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const rect = timelineBar.getBoundingClientRect();
      const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const duration = video.duration;
      if (duration && isFinite(duration)) {
        const newTime = (percent / 100) * duration;
        video.currentTime = newTime;
        updatePlayhead();
      }
    };
    
    // Mouse up
    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false;
        // Optionally resume playing if it was playing before
        // For now, we'll leave it paused so user can manually play
      }
    };
    
    timelineBar.addEventListener('mousedown', handleMouseDown);
    playhead.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  
  // Cut segments management
  function updateCutsDisplay() {
    const container = document.getElementById('cutsContainer');
    container.innerHTML = '';
    
    if (cutSegments.length === 0) {
      container.innerHTML = '<div style="color: #94a3b8; font-size: 12px; padding: 8px;">No cuts added</div>';
      return;
    }
    
    cutSegments.forEach((cut, index) => {
      const cutDiv = document.createElement('div');
      cutDiv.className = 'cut-item';
      
      const span = document.createElement('span');
      span.textContent = `${cut.start.toFixed(2)}s - ${cut.end.toFixed(2)}s`;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        cutSegments.splice(index, 1);
        updateCutsDisplay();
        updateTimeline();
        updateExportButtons();
        const video = document.getElementById('preview');
        if (video) {
          setupPreviewSkipCuts(video);
          restartPlayback(); // Restart playback from trim start
        }
        log(`Cut removed`);
      });
      
      cutDiv.appendChild(span);
      cutDiv.appendChild(removeBtn);
      container.appendChild(cutDiv);
    });
    
    updateTimeline();
  }
  
  document.getElementById('addCutBtn').addEventListener('click', () => {
    const video = document.getElementById('preview');
    const cutStartInput = document.getElementById('cutStart').value;
    const cutEndInput = document.getElementById('cutEnd').value;
    const trimStart = parseFloat(document.getElementById('trimStart').value) || 0;
    const trimEnd = parseFloat(document.getElementById('trimEnd').value) || 0;
    
    let cutStart, cutEnd;
    
    // If inputs are empty, use current playhead position for a 1-second cut
    if ((!cutStartInput || cutStartInput === '') && (!cutEndInput || cutEndInput === '')) {
      if (!video || !video.duration || !isFinite(video.duration)) {
        log('Please wait for video to load or enter cut times manually');
        return;
      }
      const currentTime = video.currentTime;
      // Ensure current time is within trim boundaries
      const clampedTime = Math.max(trimStart, Math.min(currentTime, trimEnd - 1));
      cutStart = clampedTime;
      cutEnd = Math.min(clampedTime + 1, trimEnd); // 1 second cut, clamped to trim end
      
      if (cutStart >= cutEnd) {
        log('Cannot add cut at current position (too close to trim end)');
        return;
      }
    } else {
      // Manual entry mode
      cutStart = parseFloat(cutStartInput);
      cutEnd = parseFloat(cutEndInput);
      
      if (!cutStart && cutStart !== 0 || !cutEnd) {
        log('Please enter both start and end times for the cut');
        return;
      }
      
      if (cutStart >= cutEnd) {
        log('Cut start must be less than cut end');
        return;
      }
    }
    
    // Validate cuts are within trim boundaries
    if (cutStart < trimStart || cutEnd > trimEnd) {
      log(`Cut must be within trim boundaries (${trimStart.toFixed(2)}s - ${trimEnd.toFixed(2)}s)`);
      return;
    }
    
    // Check for overlaps with existing cuts
    for (const existing of cutSegments) {
      if ((cutStart >= existing.start && cutStart < existing.end) ||
          (cutEnd > existing.start && cutEnd <= existing.end) ||
          (cutStart <= existing.start && cutEnd >= existing.end)) {
        log('Cut overlaps with existing cut segment');
        return;
      }
    }
    
    cutSegments.push({ start: cutStart, end: cutEnd });
    cutSegments.sort((a, b) => a.start - b.start); // Keep sorted by start time
    updateCutsDisplay();
    updateTimeline();
    updateExportButtons();
    if (video) {
      setupPreviewSkipCuts(video);
      restartPlayback(); // Restart playback from trim start
    }
    document.getElementById('cutStart').value = '';
    document.getElementById('cutEnd').value = '';
    log(`Cut added: ${cutStart.toFixed(2)}s - ${cutEnd.toFixed(2)}s`);
  });
  
  // Add listeners for trim inputs to update timeline
  document.getElementById('trimStart').addEventListener('input', () => {
    updateTimeline();
    updateExportButtons();
    const video = document.getElementById('preview');
    if (video) {
      setupPreviewSkipCuts(video);
      restartPlayback(); // Restart playback from trim start
    }
  });
  document.getElementById('trimEnd').addEventListener('input', () => {
    updateTimeline();
    updateExportButtons();
    const video = document.getElementById('preview');
    if (video) {
      setupPreviewSkipCuts(video);
      restartPlayback(); // Restart playback from trim start
    }
  });
  
  // Initialize button states on load
  updateAudioButtons();
  updateCutsDisplay();
  updateTimeline();
  updateExportButtons();

  // Export Full Video button - always exports full video without edits
  document.getElementById('exportFullBtn').addEventListener('click', async () => {
    if (!sourceBlob) return;

    const quality = (document.getElementById('qualitySelect')?.value) || 'original';

    setStatus('Preparing export...');
    // Export full video: start=0, end=duration, no cuts, original audio
    const video = document.getElementById('preview');
    const fullDuration = video && video.duration && isFinite(video.duration) ? video.duration : 0;
    await exportWebMCanvas(sourceBlob, { 
      start: 0, 
      end: fullDuration, 
      hasAudio: true, 
      applyDenoise: false, 
      quality, 
      cuts: [] 
    });
  });

  // Export Edited Video button - exports with current edits
  document.getElementById('exportEditedBtn').addEventListener('click', async () => {
    if (!sourceBlob) return;

    const start = parseFloat(document.getElementById('trimStart').value) || 0;
    const end = parseFloat(document.getElementById('trimEnd').value) || 0;
    const quality = (document.getElementById('qualitySelect')?.value) || 'original';

    setStatus('Preparing export...');
    await exportWebMCanvas(sourceBlob, { start, end, hasAudio, applyDenoise, quality, cuts: cutSegments });
  });
});

async function exportWebMCanvas(blob, opts) {
  try {
    setStatus('Exporting WebM...');
    log('Loading video...');

    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = !opts.hasAudio; // Mute to allow autoplay if needed
    video.src = URL.createObjectURL(blob);
    
    // Wait for video metadata to load
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        log('Video metadata loaded');
        resolve();
      };
      video.onerror = (e) => {
        log('Video load error: ' + (e.message || 'Unknown'));
        reject(e);
      };
      // Timeout after 5 seconds
      setTimeout(() => {
        if (!video.videoWidth) {
          reject(new Error('Video metadata timeout'));
        }
      }, 5000);
    });

    const start = Math.max(0, opts.start || 0);
    const fullDuration = video.duration;
    const end = opts.end && opts.end > start && opts.end <= fullDuration ? opts.end : fullDuration;
    const cuts = (opts.cuts || []).filter(c => c.start >= start && c.end <= end); // Filter cuts within trim boundaries
    
    // Check if no editing is needed - just download original
    const needsTrim = start > 0.1 || (end < fullDuration - 0.1);
    const needsAudioChange = !opts.hasAudio || opts.applyDenoise;
    const needsCuts = cuts.length > 0;
    
    if (!needsTrim && !needsAudioChange && !needsCuts) {
      log('No edits needed - using original video');
      setStatus('Preparing download...', 50);
      triggerDownload(blob, 'edited-video.webm');
      setStatus('Export complete', 100);
      setTimeout(() => setStatus('Export complete'), 1000);
      hasExported = true; // Mark as exported
      URL.revokeObjectURL(video.src);
      return;
    }

    const cutInfo = needsCuts ? ` (${cuts.length} cut${cuts.length > 1 ? 's' : ''} removed)` : '';
    log(`Exporting from ${start.toFixed(2)}s to ${end.toFixed(2)}s${needsTrim ? ' (trimmed)' : ''}${needsAudioChange ? (opts.applyDenoise ? ' (audio cleaned)' : ' (audio removed)') : ''}${cutInfo}`);

    const cw = video.videoWidth;
    const ch = video.videoHeight;

    if (!cw || !ch) {
      throw new Error('Invalid video dimensions');
    }

    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');

    log(`Canvas size: ${cw}x${ch}`);

    // Set video to start time and wait for it to be ready
    video.currentTime = start;
    await new Promise((resolve) => {
      video.onseeked = () => {
        log('Video seeked to start');
        resolve();
      };
      // Fallback timeout
      setTimeout(resolve, 500);
    });

    // Try to play the video
    try {
      await video.play();
      log('Video playing');
    } catch (e) {
      log('Autoplay blocked, continuing anyway: ' + e.message);
    }

    const stream = canvas.captureStream(30);
    let destStream = stream;

    // Handle audio
    if (opts.hasAudio) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaElementSource(video);
        let destination = audioCtx.createMediaStreamDestination();
        if (opts.applyDenoise) {
          log('Applying advanced noise reduction...');
          // Use advanced noise reduction chain
          createAdvancedNoiseReductionChain(audioCtx, source, destination, log);
        } else {
          source.connect(destination);
        }
        const mixed = new MediaStream([...stream.getVideoTracks(), ...destination.stream.getAudioTracks()]);
        destStream = mixed;
        log('Audio track added');
        video.muted = false; // Unmute now that we have audio context
      } catch (e) {
        log('Audio processing error: ' + e.message + ' - continuing without audio');
        // Continue without audio if there's an error
      }
    } else {
      log('Exporting without audio');
    }

    // Try different codecs in order of preference
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
        log('Falling back to default WebM codec');
      }
    }

    // Optimize MediaRecorder options for target quality, capped at original bitrate
    const recorderOptions = { mimeType };

    // Determine target bitrate from quality selection
    const q = (opts.quality || 'original');
    let desiredVideoBps;
    if (q === 'original') {
      desiredVideoBps = originalBitrateBps || 2500000;
    } else if (q === 'high') {
      desiredVideoBps = Math.floor((originalBitrateBps || 2500000) * 0.8);
    } else if (q === 'medium') {
      desiredVideoBps = Math.floor((originalBitrateBps || 2500000) * 0.5);
    } else { // 'low'
      desiredVideoBps = Math.floor((originalBitrateBps || 2500000) * 0.25);
    }

    // Safety bounds
    const maxCap = originalBitrateBps > 0 ? originalBitrateBps : 5000000; // do not exceed original
    const minCap = 400000; // keep above 400 kbps for reasonable quality
    recorderOptions.videoBitsPerSecond = Math.min(Math.max(desiredVideoBps, minCap), maxCap);
    if (opts.hasAudio) {
      recorderOptions.audioBitsPerSecond = 128000; // 128 kbps audio
    }

    const rec = new MediaRecorder(destStream, recorderOptions);
    const chunks = [];
    let totalSize = 0;
    const exportStartTime = start; // Capture trim start time
    
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
        totalSize += e.data.size;
        
        // Estimate progress based on video playback time vs trimmed duration
        const elapsed = video.currentTime - exportStartTime;
        const total = end - exportStartTime;
        const progress = total > 0 ? Math.min(95, Math.round((Math.max(0, elapsed) / total) * 100)) : 50;
        setStatus('Exporting...', progress);
        
        log(`Data chunk: ${(e.data.size / 1024).toFixed(2)} KB`);
      }
    };
    
    rec.onstop = () => {
      if (chunks.length === 0) {
        setStatus('Export failed - no data recorded');
        log('Error: No video chunks recorded');
        return;
      }
      setStatus('Finishing export...', 98);
      const out = new Blob(chunks, { type: mimeType });
      log(`Export complete: ${(out.size / 1024 / 1024).toFixed(2)} MB`);
      triggerDownload(out, 'edited-video.webm');
      setStatus('Export complete', 100);
      setTimeout(() => setStatus('Export complete'), 1000);
      hasExported = true; // Mark as exported
      URL.revokeObjectURL(video.src); // Clean up
    };

    rec.onerror = (e) => {
      log('MediaRecorder error: ' + (e.error?.message || 'Unknown'));
      setStatus('Export error');
    };

    log(`Starting recording with codec: ${mimeType}`);
    rec.start(100); // Collect data every 100ms for smoother export

    // Helper function to find if we're in a cut segment and get the end time
    function getCutSegmentEnd(currentTime) {
      for (const cut of cuts) {
        if (currentTime >= cut.start && currentTime < cut.end) {
          return cut.end;
        }
      }
      return null;
    }
    
    // Draw frames in loop
    let isRecording = true;
    let lastDrawTime = start;
    let seekingPastCut = false;
    
    const draw = () => {
      if (!isRecording) return;
      
      if (video.currentTime >= end || video.ended) {
        log('Reached end, stopping...');
        isRecording = false;
        setTimeout(() => rec.stop(), 100); // Give time for last frame
        return;
      }
      
      // Check if we're entering or in a cut segment
      const cutEnd = getCutSegmentEnd(video.currentTime);
      if (cutEnd !== null && !seekingPastCut) {
        // Skip this cut segment by seeking to its end
        seekingPastCut = true;
        log(`Skipping cut segment, seeking to ${cutEnd.toFixed(2)}s`);
        video.currentTime = cutEnd;
        video.addEventListener('seeked', function seekedHandler() {
          video.removeEventListener('seeked', seekedHandler);
          seekingPastCut = false;
          requestAnimationFrame(draw);
        }, { once: true });
        return;
      }
      
      // Normal drawing - not in a cut segment
      try {
        ctx.drawImage(video, 0, 0, cw, ch);
        lastDrawTime = video.currentTime;
      } catch (e) {
        log('Draw error: ' + e.message);
      }
      
      requestAnimationFrame(draw);
    };

    // Start drawing
    draw();
    
    // Ensure video is playing
    if (video.paused) {
      video.play().catch(e => {
        log('Play error: ' + e.message);
      });
    }

  } catch (e) {
    console.error('Export error:', e);
    log('Export failed: ' + e.message);
    setStatus('Export failed: ' + e.message);
  }
}

/**
 * Advanced noise reduction processor using Web Audio API
 * Implements gentle spectral subtraction and noise gate to preserve voice quality
 */
function createNoiseReductionProcessor(audioCtx, logCallback) {
  const bufferSize = 4096;
  const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1);
  
  // Noise reduction parameters
  let noiseProfile = null;
  let noiseProfileReady = false;
  const noiseSamples = [];
  let sampleCount = 0;
  const samplesNeeded = 15; // More samples for better noise profile
  
  // Noise gate parameters - more conservative to preserve voice
  const noiseGateThreshold = 0.005; // Lower threshold, only suppress very quiet noise
  const noiseGateRatio = 0.3; // Less aggressive suppression
  
  // Spectral subtraction parameters - gentler to avoid distortion
  const subtractionFactor = 1.2; // Less aggressive subtraction
  const minSignalThreshold = 0.02; // Minimum level before we treat as signal
  
  processor.onaudioprocess = function(e) {
    const inputBuffer = e.inputBuffer;
    const outputBuffer = e.outputBuffer;
    const inputData = inputBuffer.getChannelData(0);
    const outputData = outputBuffer.getChannelData(0);
    const length = inputData.length;
    
    // Initialize noise profile from first few silent samples only
    if (!noiseProfileReady && sampleCount < samplesNeeded) {
      // Calculate RMS (Root Mean Square) for this chunk
      let rms = 0;
      for (let i = 0; i < length; i++) {
        rms += inputData[i] * inputData[i];
      }
      rms = Math.sqrt(rms / length);
      
      // Only use very quiet segments to build noise profile (avoid voice)
      if (rms < noiseGateThreshold * 3) {
        noiseSamples.push(Array.from(inputData));
        sampleCount++;
        
        if (sampleCount === samplesNeeded) {
          // Calculate noise profile (average magnitude of quiet samples)
          noiseProfile = new Float32Array(length);
          for (let i = 0; i < length; i++) {
            let sum = 0;
            let count = 0;
            for (let j = 0; j < noiseSamples.length; j++) {
              const absValue = Math.abs(noiseSamples[j][i]);
              sum += absValue;
              count++;
            }
            noiseProfile[i] = count > 0 ? sum / count : 0;
          }
          noiseProfileReady = true;
          if (logCallback) logCallback('Noise profile estimated, applying gentle reduction...');
        }
      }
    }
    
    // Apply gentle noise reduction
    if (noiseProfileReady && noiseProfile) {
      for (let i = 0; i < length; i++) {
        let sample = inputData[i];
        const absSample = Math.abs(sample);
        
        // Only apply noise reduction if signal is above minimum threshold
        if (absSample > minSignalThreshold) {
          // Signal is strong, preserve it mostly intact
          // Apply very gentle noise reduction only
          const noiseLevel = noiseProfile[i];
          if (noiseLevel > 0 && absSample > noiseLevel * 2) {
            // Gentle reduction: only subtract small portion of noise
            const reduction = noiseLevel * subtractionFactor * 0.15; // Very conservative
            sample = Math.sign(sample) * Math.max(0, absSample - reduction);
          }
          // If signal is strong, mostly pass through
        } else {
          // Quiet signal - apply gentle noise gate
          const noiseLevel = noiseProfile[i];
          if (absSample < noiseGateThreshold) {
            // Very quiet - gentle suppression
            sample *= noiseGateRatio;
          } else if (absSample < noiseLevel * 1.5) {
            // Slightly above noise - moderate suppression
            sample *= 0.5;
          }
        }
        
        // Soft clipping protection
        outputData[i] = Math.max(-0.98, Math.min(0.98, sample));
      }
    } else {
      // Noise profile not ready yet, pass through unchanged
      for (let i = 0; i < length; i++) {
        outputData[i] = inputData[i];
      }
    }
  };
  
  return processor;
}

/**
 * Create an advanced audio processing chain with noise reduction
 * Reordered to apply filtering first, then gentle noise reduction
 */
function createAdvancedNoiseReductionChain(audioCtx, source, destination, logCallback) {
  try {
    // Highpass filter - remove low frequency rumble (gentler to preserve voice warmth)
    const highpass = audioCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 100; // Less aggressive to preserve voice
    highpass.Q.value = 0.7; // Gentler slope
    
    // Notch filter for 60Hz hum (power line noise) - narrow Q to only target hum
    const notch60 = audioCtx.createBiquadFilter();
    notch60.type = 'notch';
    notch60.frequency.value = 60;
    notch60.Q.value = 5; // Less aggressive
    
    // Notch filter for 50Hz hum (for international compatibility)
    const notch50 = audioCtx.createBiquadFilter();
    notch50.type = 'notch';
    notch50.frequency.value = 50;
    notch50.Q.value = 5; // Less aggressive
    
    // Lowpass filter - remove high frequency hiss while preserving voice clarity
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 12000; // Higher to preserve voice clarity
    lowpass.Q.value = 0.7; // Gentler
    
    // Noise reduction processor (applied after filtering for better results)
    const noiseProcessor = createNoiseReductionProcessor(audioCtx, logCallback);
    
    // Gentle compressor - normalize levels without aggressive compression
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -18; // Less aggressive threshold
    compressor.knee.value = 6; // Gentler knee
    compressor.ratio.value = 2.5; // Lower ratio to preserve dynamics
    compressor.attack.value = 0.01; // Slower attack to preserve transients
    compressor.release.value = 0.2; // Longer release for smoother sound
    
    // Connect: source -> filters -> noise processor -> compressor -> destination
    // Apply filtering first to clean up signal, then gentle noise reduction
    source.connect(highpass);
    highpass.connect(notch60);
    notch60.connect(notch50);
    notch50.connect(noiseProcessor);
    noiseProcessor.connect(lowpass);
    lowpass.connect(compressor);
    compressor.connect(destination);
    
    if (logCallback) logCallback('Advanced noise reduction chain created (preserving voice quality)');
    
    return { chain: [highpass, notch60, notch50, noiseProcessor, lowpass, compressor], processor: noiseProcessor };
  } catch (e) {
    if (logCallback) logCallback('Error creating noise reduction chain: ' + e.message);
    // Fallback to direct connection
    source.connect(destination);
    return { chain: [], processor: null };
  }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  if (chrome && chrome.downloads && chrome.downloads.download) {
    try {
      chrome.downloads.download({ url, filename, saveAs: true }, () => {
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      });
      return;
    } catch (e) {
      // fall through to anchor method
    }
  }
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
