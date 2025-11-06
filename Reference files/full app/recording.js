// Recording controls logic
let mediaRecorder;
let recordedChunks = [];
let startTime;
let pauseTime = 0;
let timerInterval;
let stream;
let isPaused = false;
let totalPausedTime = 0;
let pauseStartTime = 0;

document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Load recording config
    const result = await chrome.storage.local.get(['recordingConfig']);
    const config = result.recordingConfig;
    
    if (!config) {
      showError('No recording configuration found. Please restart from the setup page.');
      return;
    }
    
    // Start recording
    await startScreenCapture(config);
    
    // Setup buttons
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('stopBtn').addEventListener('click', stopRecording);
    
    // Start timer
    startTimer();
    
  } catch (error) {
    console.error('Error initializing recording:', error);
    showError('Failed to start recording: ' + error.message);
  }
});

async function startScreenCapture(config) {
  try {
    // Request desktop capture
    const streamId = await getStreamId(config.captureType);
    
    // Get desktop capture stream (video only)
    const desktopStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: streamId
        }
      }
    });
    
    // Apply frame rate to the track after getting the stream
    const frameRate = config.videoOptions?.frameRate || 30;
    desktopStream.getVideoTracks().forEach(track => {
      try {
        track.applyConstraints({ frameRate });
      } catch (e) {
        console.warn('Could not apply frame rate constraint:', e);
      }
    });
    
    // Get desktop video track
    const desktopVideoTrack = desktopStream.getVideoTracks()[0];
    
    // Create combined stream
    stream = new MediaStream();
    
    // Add desktop video
    if (desktopVideoTrack) {
      stream.addTrack(desktopVideoTrack);
    }
    
    // Add microphone audio if enabled
    const needsMic = config.enableMic || false;
    
    if (needsMic) {
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
        const audioTrack = micStream.getAudioTracks()[0];
        if (audioTrack) {
          stream.addTrack(audioTrack);
        }
      } catch (micError) {
        console.warn('Could not access microphone:', micError);
      }
    }
    
    // Setup media recorder
    // Choose mimeType based on user selection
    const preferredMime = config.videoOptions?.codec && config.videoOptions.codec !== 'auto' ? config.videoOptions.codec : null;
    let mimeType = getSupportedMimeType();
    if (preferredMime && MediaRecorder.isTypeSupported(preferredMime)) {
      mimeType = preferredMime;
    }
    const options = {
      mimeType: mimeType,
      videoBitsPerSecond: config.videoOptions?.videoBitsPerSecond || 2500000
    };
    
    mediaRecorder = new MediaRecorder(stream, options);
    recordedChunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = async () => {
      await saveRecording();
    };
    
    mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
      showError('Recording error occurred');
    };
    
    // Start recording
    mediaRecorder.start(1000); // Collect data every second
    
  } catch (error) {
    console.error('Error starting screen capture:', error);
    throw error;
  }
}

function getStreamId(captureType) {
  return new Promise((resolve, reject) => {
    const sources = {
      'tab': 'tab',
      'window': 'window', 
      'screen': 'screen'
    };
    
    chrome.desktopCapture.chooseDesktopMedia(
      [sources[captureType]],
      (streamId) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (!streamId) {
          reject(new Error('User cancelled screen capture'));
        } else {
          resolve(streamId);
        }
      }
    );
  });
}

function getSupportedMimeType() {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8'
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  
  return 'video/webm'; // Fallback
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    if (isPaused) {
      return; // Don't update timer when paused
    }
    
    const elapsed = Date.now() - startTime - totalPausedTime;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    document.getElementById('timer').textContent = 
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, 1000);
}

function togglePause() {
  const pauseBtn = document.getElementById('pauseBtn');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  
  if (isPaused) {
    // Resume recording
    isPaused = false;
    totalPausedTime += Date.now() - pauseStartTime;
    
    pauseBtn.textContent = 'Pause';
    pauseBtn.className = 'btn-pause';
    
    // Update status indicator
    statusIndicator.innerHTML = '<div class="pulsing-dot"></div><span style="font-weight: 600; color: #dc2626;">Recording</span>';
    statusText.textContent = 'Your screen is being recorded';
    
    // Resume MediaRecorder
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
    }
  } else {
    // Pause recording
    isPaused = true;
    pauseStartTime = Date.now();
    
    pauseBtn.textContent = 'Resume';
    pauseBtn.className = 'btn-resume';
    
    // Update status indicator
    statusIndicator.innerHTML = '<div class="paused-indicator"></div><span style="font-weight: 600; color: #f59e0b;">Paused</span>';
    statusText.textContent = 'Recording is paused';
    
    // Pause MediaRecorder
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
    }
  }
}

function stopRecording() {
  // Disable all buttons
  document.getElementById('pauseBtn').disabled = true;
  document.getElementById('stopBtn').disabled = true;
  document.getElementById('stopBtn').textContent = 'Saving...';
  
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}

async function saveRecording() {
  try {
    // Show processing state
    document.getElementById('recordingState').classList.add('hidden');
    document.getElementById('downloadingState').classList.remove('hidden');
    
    // Create blob from recorded chunks
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const arrayBuffer = await blob.arrayBuffer();
    
    // Open editor tab
    const editorUrl = chrome.runtime.getURL('video-editor.html');
    const channel = new BroadcastChannel('demomoj-editor');
    let acknowledged = false;
    
    channel.onmessage = (evt) => {
      if (evt.data && evt.data.type === 'ready') {
        acknowledged = true;
        channel.postMessage({
          type: 'video',
          buffer: arrayBuffer,
          mime: blob.type
        });
        // Close this window after send
        setTimeout(() => {
          window.close();
        }, 300);
      }
    };
    
    await chrome.tabs.create({ url: editorUrl });
    
    // Fallback: if no ack in 2s, still try send once
    setTimeout(() => {
      if (!acknowledged) {
        try {
          channel.postMessage({ type: 'video', buffer: arrayBuffer, mime: blob.type });
          setTimeout(() => window.close(), 300);
        } catch (e) {}
      }
    }, 2000);
    
  } catch (error) {
    console.error('Error saving recording:', error);
    showError('Failed to save recording: ' + error.message);
  }
}

function showError(message) {
  document.getElementById('recordingState').classList.add('hidden');
  document.getElementById('downloadingState').classList.add('hidden');
  document.getElementById('errorState').classList.remove('hidden');
  document.getElementById('errorMessage').textContent = message;
}

// Handle window close
window.addEventListener('beforeunload', () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    stopRecording();
  }
});

