# DemoMojo Screen Recording Feature

## Overview
A standalone screen recording feature that allows users to record their screen and download it as a video file, independent of the chapter workflow.

## User Flow
1. Click "Start Recording" button in `popup.html`
2. Opens `recording-setup.html` where user selects:
   - **Capture Type**: Tab Only, Chrome Window, or Full Screen
   - **Window Size**: Preset aspect ratios, device presets, custom, or current size
   - **Audio Options**: Microphone (toggle on/off)
   - **Quality Options**: Framerate, bitrate, codec
3. For Tab/Window: Chrome window resizes to selected dimensions (with compensation for sharing bar)
4. For Desktop: Full screen capture (no resize)
5. Chrome's native capture dialog appears to confirm what to record
6. Recording begins with timer/controls in `recording.html` popup
7. Video downloads as `.webm` file when stopped

## Files Structure

### Created Files
- **recording-setup.html** - Setup page for selecting capture type, size, audio, and quality options
- **recording-setup.js** - Setup logic, window resizing, and configuration management
- **recording.html** - Recording controls UI with timer, pause/resume, stop buttons
- **recording.js** - MediaRecorder implementation, stream management, pause/resume logic

### Modified Files
- **manifest.json** - Added `desktopCapture` permission and `host_permissions`
- **popup.html** - Added "Start Recording" button
- **popup.js** - Added recording button handler
- **web_accessible_resources** - Added all new recording files

## Features Implemented

### 1. Capture Types
- **Tab Only**: Records just the active tab content (no browser UI)
- **Chrome Window**: Records the entire Chrome window (includes browser UI, omnibox, toolbars, overlays)
- **Full Screen**: Records the entire desktop screen (all monitors, all windows)

### 2. Window Sizing Options

#### Preset Aspect Ratios
- **Current Size**: Keeps window as-is, no resize
- **16:9** (1920×1080) - Standard widescreen
- **4:3** (1600×1200) - Traditional
- **21:9** (2560×1080) - Ultrawide
- **16:10** (1920×1200) - Professional
- **1:1** (1080×1080) - Square
- **9:16** (1080×1920) - Vertical/Portrait
- **Custom**: User-specified width/height inputs

#### Device Presets
- iPhone 15 Pro (393×852)
- iPhone 15 (393×852)
- iPhone SE 2nd (375×667)
- Pixel 7 (412×915)
- Galaxy S23 (360×780)
- iPad Pro 12.9 (1024×1366)
- iPad Air 10.9 (820×1180)
- Surface Duo (540×720)
- Galaxy Fold (280×653)

### 3. Window Resizing Logic
- Calculates scaling to fit screen dimensions
- Maintains aspect ratio when scaling
- Uses 10% margin for user flexibility
- Applies toolbar height compensation (95px)
- **Tab Capture Special**: Adds 40px compensation for Chrome's sharing indicator bar
  - This ensures the actual video content matches selected dimensions

### 4. Audio Options
- **Microphone Audio**: Toggle switch (enabled by default)
  - Chrome will prompt for microphone permission
  - Falls back gracefully if permission denied

### 5. Quality Options

#### Framerate
- 15 fps - Lower quality, smaller files
- 24 fps - Cinematic
- 30 fps (default) - Standard
- 60 fps - High quality, larger files

#### Video Bitrate
- 1.5 Mbps - Low quality
- 2.5 Mbps (default) - Medium quality
- 5 Mbps - High quality
- 8 Mbps - Very high quality

#### Codec
- Auto (default) - Best available codec
- VP8 - Widely compatible
- VP9 - Better compression

**Note**: Frame rate is applied via `track.applyConstraints()` after stream acquisition to avoid getUserMedia constraint conflicts.

### 6. Recording Controls

#### Pause/Resume
- Orange "Pause" button - Pauses recording and timer
- Green "Resume" button - Resumes recording and timer
- Tracks total paused time separately from recording time
- UI updates: indicator changes from pulsing red dot to static orange dot
- Status text updates: "Recording" → "Paused"

#### Stop & Save
- Red "Stop & Save" button
- Stops recording, disables controls
- Downloads video as `.webm` file
- Filename: `demomoj-recording-[timestamp].webm`
- Auto-closes window after download

#### Timer
- Displays elapsed time in HH:MM:SS format
- Freezes when paused
- Continues from where it left off when resumed

### 7. Technical Implementation

#### MediaRecorder API
- Uses Chrome's desktopCapture API for screen/window/tab capture
- Combines desktop video with optional microphone audio
- Handles single audio track (mic) to avoid conflicts
- Supports pause/resume states

#### Stream Management
- Creates MediaStream combining desktop video + mic audio
- Properly stops all tracks on completion
- Handles errors gracefully

#### Window Management
- Resizes Chrome window using `chrome.windows.update()`
- Gets screen dimensions via `chrome.scripting.executeScript()`
- Uses "popup" type for recording controls window

## Configuration Storage
Stored in `chrome.storage.local` as `recordingConfig`:
```javascript
{
  captureType: 'tab' | 'window' | 'screen',
  dimensions: { width, height } | null,
  enableMic: boolean,
  videoOptions: {
    frameRate: number,
    videoBitsPerSecond: number,
    codec: string
  }
}
```

## Known Behaviors

### Chrome Sharing Indicator
- When recording tabs, Chrome displays "Sharing this tab to DemoMojo" bar
- Automatic 40px compensation added for Tab capture mode
- Window/Screen capture not affected
- This ensures recorded video maintains exact selected dimensions

### Screen Fitting
- Calculates available screen space
- Scales down proportionally if requested dimensions too large
- Maintains aspect ratio
- Adds 10% margin for window management

### Browser UI Compensation
- Adds 95px for Chrome toolbar (address bar, tabs, etc.)
- This ensures content area matches selected dimensions

## Usage Examples

### Recording a Mobile App Demo
1. Select "Tab Only"
2. Choose device preset (e.g., "iPhone 15 Pro")
3. Enable microphone if doing voice-over
4. Click "Start Recording"
5. Window resizes to 393×892 (accounting for toolbar + sharing bar)
6. Record demo
7. Stop and download

### Recording in Current Size
1. Select "Chrome Window"
2. Select "Current Size"
3. Window stays as-is
4. Records at current dimensions

### High Quality Desktop Recording
1. Select "Full Screen"
2. Set framerate to 60 fps
3. Set bitrate to 5 Mbps
4. Codec: Auto
5. Record full desktop with high quality

## Future Enhancement Ideas
- Crop selection tool for specific screen regions
- Multiple audio source mixing
- Audio level meter/preview
- Recording duration limits
- Auto-stop after certain duration
- Upload to cloud storage options
- Live thumbnail preview in controls window
- Multiple output formats (WebM)
- Watermark support
- Keyboard shortcuts for pause/stop

## Error Handling
- Gracefully handles microphone permission denial
- Provides clear error messages in recording window
- Falls back to best available codec if selected codec not supported
- Validates custom dimensions (320-3840 width, 240-2160 height)
- Shows proper UI states (recording, paused, downloading, error)

