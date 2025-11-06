# Screen Capture Feature

## Overview
The Screen Capture feature allows users to take screenshots of the current page and associate them with specific chapters in their demo stories. These screenshots can be previewed directly in the setup page.

## Features

### 1. Capture Screenshots
- Click the **Capture** button next to any chapter in the setup page
- The extension will capture the currently visible area of the active tab
- Screenshots are automatically compressed and resized (max 800x600px) for optimal storage
- A success notification will appear when the capture is complete

### 2. Preview Screenshots
- Captured screenshots appear below the chapter's value drivers
- Shows a thumbnail preview of the screenshot
- Displays the capture timestamp
- Click on the thumbnail to view the full-size image in a modal

### 3. Manage Screenshots
- **View**: Click the "View" button or the thumbnail to see the full-size screenshot
- **Delete**: Click the "Delete" button to remove a screenshot from a chapter
- Screenshots are stored in Chrome's local storage along with the story data

## Technical Implementation

### Files Created/Modified

#### New Files:
1. **screen-capture.js** - Core functionality for capturing, compressing, and managing screenshots
   - `ScreenCapture` class with methods for:
     - `captureCurrentTab()` - Captures the visible tab area
     - `compressImage()` - Compresses images to reduce storage size
     - `saveScreenshot()` - Saves screenshot to storage
     - `deleteScreenshot()` - Removes screenshot from storage
     - `getScreenshot()` - Retrieves screenshot from storage

#### Modified Files:
1. **manifest.json** - Added `tabCapture` permission and registered `screen-capture.js` as a web-accessible resource
2. **setup.html** - Added:
   - CSS styles for screenshot preview containers, buttons, and modal
   - Screenshot modal for full-size viewing
   - Script tag to include `screen-capture.js`
3. **setup.js** - Added:
   - Screenshot preview rendering in chapter display
   - Event handlers for capture, view, and delete actions
   - Modal controls for viewing screenshots
   - Notification system for user feedback

### Data Structure

Screenshots are stored within the chapter object:
```javascript
{
  title: "Chapter Title",
  url: "https://example.com",
  valueDrivers: ["Driver 1", "Driver 2"],
  screenshot: "data:image/jpeg;base64,/9j/4AAQ...", // Base64 encoded image
  screenshotTimestamp: 1696800000000 // Unix timestamp
}
```

### Storage Considerations

- Screenshots are compressed to JPEG format at 80% quality
- Maximum dimensions: 800x600 pixels
- Typical screenshot size: 50-200KB (compressed)
- Chrome local storage limit: ~5-10MB per extension
- Recommend monitoring storage usage for stories with many screenshots

## User Guide

### How to Capture a Screenshot

1. Open the DemoMojo Setup page (right-click extension icon → Options)
2. Navigate to the story and chapter where you want to add a screenshot
3. In a different tab, navigate to the page you want to capture
4. Return to the DemoMojo Setup page
5. Click the **Capture** button (camera icon) next to the chapter
6. The screenshot will be captured and displayed below the chapter

### How to View a Screenshot

1. Click the thumbnail image in the screenshot preview
2. OR click the **View** button
3. The screenshot will open in a full-screen modal
4. Click the X button or click outside the image to close the modal

### How to Delete a Screenshot

1. Click the **Delete** button in the screenshot preview
2. Confirm the deletion when prompted
3. The screenshot will be permanently removed from the chapter

## Troubleshooting

### Screenshot Capture Fails
- **Cause**: Extension doesn't have permission to capture the tab
- **Solution**: Make sure the extension has the "activeTab" permission enabled

### Screenshot Doesn't Appear
- **Cause**: The setup page didn't refresh after capture
- **Solution**: The page should auto-refresh. If not, click the Refresh button

### Storage Quota Exceeded
- **Cause**: Too many screenshots stored
- **Solution**: Delete unused screenshots or consider exporting/backing up stories

### Screenshot Quality Issues
- **Cause**: Image compression reducing quality
- **Solution**: Adjust quality settings in `screen-capture.js` (increase `this.quality` value)

## Future Enhancements

Potential improvements for future versions:
- [ ] Add ability to annotate screenshots
- [ ] Support for multiple screenshots per chapter
- [ ] Export screenshots separately from story data
- [ ] Adjustable compression settings in UI
- [ ] Screenshot comparison view
- [ ] Screenshot gallery view for entire story
- [ ] Cloud storage integration for larger screenshots

## API Reference

### ScreenCapture Class

#### Methods

**`captureCurrentTab()`**
- Returns: `Promise<string>` - Base64 encoded image data URL
- Captures the visible area of the current active tab
- Automatically compresses the image

**`compressImage(dataUrl)`**
- Parameters: 
  - `dataUrl` (string) - Original image data URL
- Returns: `Promise<string>` - Compressed image data URL
- Resizes and compresses image to reduce storage size

**`saveScreenshot(storyIndex, personaIndex, chapterIndex, dataUrl)`**
- Parameters:
  - `storyIndex` (number) - Index of the story
  - `personaIndex` (number) - Index of the persona
  - `chapterIndex` (number) - Index of the chapter
  - `dataUrl` (string) - Screenshot data URL
- Returns: `Promise<void>`
- Saves screenshot to Chrome storage

**`deleteScreenshot(storyIndex, personaIndex, chapterIndex)`**
- Parameters:
  - `storyIndex` (number) - Index of the story
  - `personaIndex` (number) - Index of the persona
  - `chapterIndex` (number) - Index of the chapter
- Returns: `Promise<void>`
- Removes screenshot from Chrome storage

**`getScreenshot(storyIndex, personaIndex, chapterIndex)`**
- Parameters:
  - `storyIndex` (number) - Index of the story
  - `personaIndex` (number) - Index of the persona
  - `chapterIndex` (number) - Index of the chapter
- Returns: `Promise<string|null>` - Screenshot data URL or null
- Retrieves screenshot from Chrome storage

## Version History

### v1.0.0 (Initial Release)
- Basic screenshot capture functionality
- Screenshot preview in setup page
- Full-size screenshot viewing modal
- Screenshot deletion capability
- Automatic image compression
- Timestamp tracking
