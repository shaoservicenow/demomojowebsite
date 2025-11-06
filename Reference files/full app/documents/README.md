# DemoMojo

A Chrome extension that provides an intelligent overlay system for demo storytelling, helping you present personas, chapters, and value drivers during live demonstrations.

## Features

### 🎭 **Persona Management**
- Visual persona cards with headshots and business titles
- Easy persona switching during demos
- Persona highlighting and selection system

### 📖 **Chapter Navigation**
- Chapter-by-chapter demo flow
- Progress tracking with completion checkboxes
- Value drivers for each chapter
- Keyboard shortcuts for quick navigation

### 🖥️ **Flexible Display Modes**
- **Small Overlay**: Compact floating overlay for quick reference
- **Large Overlay**: Full-screen side panel with complete story view
- **Content Shifting**: Move page content to accommodate the overlay

### ⌨️ **Keyboard Shortcuts**
- `Shift + H`: Toggle overlay visibility
- `Shift + O`: Toggle fullscreen mode
- `Shift + ←/→`: Navigate chapters
- `Shift + ↑/↓`: Switch personas
- `Escape`: Close overlay

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your Chrome toolbar

## GitHub Setup

To commit this project to GitHub:

1. **Install Xcode Command Line Tools** (if not already done):
   ```bash
   xcode-select --install
   ```

2. **Initialize Git Repository**:
   ```bash
   cd /path/to/demo-mojo
   git init
   git add .
   git commit -m "Initial commit: DemoMojo Chrome Extension"
   ```

3. **Create GitHub Repository**:
   - Go to [GitHub.com](https://github.com)
   - Click "New repository"
   - Name it `demo-mojo`
   - Don't initialize with README (we already have one)
   - Click "Create repository"

4. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/demo-mojo.git
   git branch -M main
   git push -u origin main
   ```

## Usage

### Setting Up Stories
1. Click the extension icon to open the popup
2. Use the setup page to create and manage demo stories
3. Add personas, chapters, and value drivers for each story
4. Save your configuration

### During Demos
1. Select your story and persona from the popup
2. The overlay will appear on your current page
3. Use keyboard shortcuts or click to navigate
4. Toggle fullscreen mode for complete story overview
5. Check off completed chapters as you progress

## File Structure

```
demo-mojo/
├── manifest.json          # Extension configuration
├── popup.html             # Main popup interface
├── popup.js               # Popup functionality
├── setup.html             # Story setup page
├── setup.js               # Setup functionality
├── content.js             # Overlay logic and interactions
├── overlay.css            # Overlay styling
├── background.js          # Background service worker
└── icons/                 # Extension icons and logos
    ├── icon48.png
    ├── logo-solo.png
    └── long-logo.png
```

## Development

### Key Components

- **Content Script**: Manages overlay display and interactions
- **Popup**: Story and persona selection interface
- **Setup Page**: Story creation and management
- **Background Script**: Handles extension lifecycle

### Styling
The overlay uses modern CSS with:
- Glass morphism effects
- Smooth animations and transitions
- Responsive design
- Dark/light theme support

## Browser Compatibility

- Chrome (recommended)
- Edge (Chromium-based)
- Other Chromium-based browsers

## License

This project is created by Shao (v1.2.2).

## Contributing

Feel free to submit issues and enhancement requests!

---

**Created with ❤️ for better demo storytelling with DemoMojo**
