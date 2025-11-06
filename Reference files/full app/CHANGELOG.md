# Changelog

All notable changes to the Demo Persona Overlay extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.6] - 2025-01-15

### Added
- **Collapse Button Feature**: Added collapsible personas in side panel view
  - **Toggle Setting**: New setting to enable/disable collapse button functionality
  - **Icon-Based Design**: Clean icon-only collapse button positioned in top-left corner of persona cards
  - **Smooth Animations**: Rotating arrow icon with smooth transitions when collapsing/expanding
  - **Individual Control**: Each persona can be independently collapsed to show/hide chapters
  - **Persistent State**: Collapse state maintained during navigation and page reloads
  - **Space Efficient**: Compact icon design with hover effects for better visual feedback

### Changed
- **Persona Card Layout**: Added spacing for collapse button to prevent overlap with persona picture
- **Settings Integration**: Added "Collapse Persona Chapters" toggle in Display Preferences section

### Fixed
- **Settings Change Detection**: Collapse button setting now properly triggers floating save button
- **Button Visibility**: Collapse button only appears when setting is enabled

### Technical
- **New Functions in content.js**:
  - `handleCollapseClick()` - Handles collapse/expand functionality for persona chapters
- **CSS Enhancements**: Added comprehensive styling for collapse icon with absolute positioning
- **Settings Management**: Added `collapseButtonEnabled` setting with change detection support
- **Event Handling**: Conditional event listener attachment based on setting state

## [1.3.5] - 2025-01-15

### Added
- **Session Notes Feature**: New note-taking capability at the story level for demo sessions
  - **Notes Button**: Added 📝 icon button in fullscreen overlay header for quick access
  - **Checkable Notes Modal**: Beautiful modal interface for adding and managing session notes
  - **Check/Uncheck Notes**: Mark notes as complete/incomplete during demos
  - **Delete Notes**: Remove individual notes with × button
  - **Clear All Function**: Bulk delete all notes with confirmation dialog
  - **Persistent Storage**: Notes saved per story in Chrome storage
  - **Live Display in Setup Page**: View all session notes directly in story management page
  - **Setup Page Clear All**: Clear all notes for a story from the setup page
  - **Auto-Save**: All note changes automatically saved in real-time
  - **XSS Protection**: All note text properly escaped to prevent script injection

### Changed
- **Session Notes Modal Positioning**: Modal now centers over entire viewport in pinned content mode
- **Session Notes Button Styling**: Changed from emoji to clean SVG icon without border
- **Export Exclusion**: Session notes explicitly excluded from story JSON exports
- **Import Filtering**: Session notes automatically stripped from imported story files
- **Version Numbers**: Updated to v1.3.5 across all files

### Fixed
- **Modal Centering in Pinned Mode**: Session notes modal now properly centers when content is pinned
- **Content Shift Exclusion**: Modal excluded from all content shift operations in pinned view
- **Export/Import Privacy**: Session notes no longer exported or imported with stories
- **Clear All Button Visibility**: Button dynamically shows/hides based on note count

### Technical
- **New Functions in content.js**: 
  - `openSessionNotesModal()` - Display notes modal
  - `closeSessionNotesModal()` - Close modal
  - `addSessionNote()` - Add new note
  - `toggleNoteChecked()` - Toggle note completion
  - `deleteSessionNote()` - Delete single note
  - `clearAllNotes()` - Delete all notes
  - `loadSessionNotes()` - Load notes from storage
  - `saveSessionNotes()` - Save notes to storage
  - `escapeHtml()` - Sanitize note text
- **New Functions in setup.js**:
  - `clearSessionNotes()` - Clear all notes for a story
  - `escapeHtml()` - Sanitize note text for display
- **Session Notes Data Structure**: Added `sessionNotes` array to story object
- **CSS Enhancements**: Added comprehensive styling for modal and setup page display
- **Event Handling**: Escape key, click outside, and button click support for modal
- **Storage Updates**: Enhanced storage management for note persistence

### Security
- **XSS Prevention**: All user-generated note text escaped before display
- **Storage Safety**: Atomic updates prevent data corruption
- **Privacy Protection**: Notes never included in exports or imports

## [1.3.1] - 2025-01-10

### Added
- **PowerPoint Export Feature**: Complete story export to PowerPoint presentations
  - **PPT Generation**: Export entire story narratives (personas, chapters, value drivers, and screenshots) to .pptx files
  - **Theme Integration**: PowerPoint colors follow extension theme settings (default, predefined, or custom themes)
  - **Screenshot Integration**: Screenshots automatically included in chapter slides with proper proportional scaling
  - **Professional Layout**: Clean, centered slide designs with proper spacing and typography
  - **Story Overview**: Dedicated overview slide with hierarchical persona and chapter listing
  - **Persona Introduction Slides**: Individual slides for each persona with headshots and business titles
  - **Chapter Detail Slides**: Comprehensive chapter slides with value drivers and screenshots
  - **Export Button**: "Export to PPT" button in setup page story actions
  - **Progress Indicators**: Visual feedback during PowerPoint generation process

### Changed
- **Title Slide Design**: Simplified title slide with story name and "Created with DemoMojo" branding
- **Overview Slide Layout**: Hierarchical bullet point structure showing personas and their chapters
- **Persona Slide Layout**: Clean, centered design with headshot at top, name and title below
- **Chapter Slide Layout**: Improved spacing, removed "Screenshot:" titles and timestamps
- **Image Handling**: Screenshots maintain original dimensions with proportional scaling
- **Text Overflow Prevention**: Enhanced text box sizing and wrapping to prevent content overflow

### Fixed
- **Screenshot Proportional Scaling**: Fixed screenshot distortion by calculating actual image dimensions
- **Text Box Overflow**: Resolved text extending beyond slide boundaries with proper height calculations
- **Slide Spacing**: Optimized spacing between elements for better visual balance
- **Color Scheme Application**: Ensured PowerPoint colors properly reflect extension theme settings

### Technical
- **New File**: Added `ppt-export.js` with `PPTExporter` class for PowerPoint generation
- **Library Integration**: Integrated PptxGenJS library for PowerPoint file creation
- **Image Processing**: Enhanced image dimension calculation and proportional scaling algorithms
- **Theme Color Extraction**: Dynamic color scheme extraction from extension settings
- **Error Handling**: Comprehensive error handling for PowerPoint generation process
- **File Management**: Automatic file naming with sanitized story names

## [1.2.6] - 2025-10-08

### Added
- **Screenshot Capture Feature**: New ability to capture and save screenshots for chapters
  - **Screenshot Mode Toggle**: Added toggle in popup to enable/disable screenshot mode
  - **Capture Button in Overlay**: Purple gradient capture button appears in overlay when mode is enabled
  - **Automatic Hiding**: Overlay automatically hides during screenshot capture to avoid appearing in the captured image
  - **Image Compression**: Screenshots automatically compressed to JPEG (80% quality, max 800x600px) for optimal storage
  - **Screenshot Preview**: Thumbnails displayed in setup page below chapters with view/delete buttons
  - **Full-Size Viewer**: Modal viewer for viewing screenshots at full resolution
  - **Timestamp Tracking**: Records when each screenshot was captured
  - **Screenshot Management**: Delete screenshots with confirmation dialog
  - **Smart Replacement**: New screenshots automatically replace old ones for the same chapter
  - **Notification System**: Success/error notifications for capture operations
  - **Auto-Refresh Setup Page**: Setup page automatically refreshes when screenshots are captured, no manual sync needed

### Changed
- **Permissions**: Added `tabCapture` permission for screenshot functionality
- **Background Worker**: Enhanced to handle tab capture requests and image compression using OffscreenCanvas
- **Content Script**: Added screenshot capture integration with overlay display logic
- **Popup UI**: Added Screenshot Mode section with toggle control and description
- **Setup Page**: Added screenshot preview sections with view/delete controls and modal viewer
- **State Management**: Added `currentStoryIndex` to overlay state for screenshot functionality

### Technical
- **New Functions in content.js**:
  - `captureScreenshotForCurrentChapter()` - Handles screenshot capture workflow
  - `saveScreenshotToChapter()` - Saves screenshot to Chrome storage
  - `showCaptureNotification()` - Displays capture status notifications
- **New Functions in background.js**:
  - `captureTab` message handler - Captures visible tab
  - `compressImage()` - Compresses images for efficient storage
- **New Functions in setup.js**:
  - `viewScreenshot()` - Opens full-size screenshot modal
  - `deleteScreenshotFromChapter()` - Removes screenshots from chapters
- **Enhanced Overlay State**: Added `currentStoryIndex` to persist correct indices across page navigation
- **CSS Additions**: Added ~200 lines of styles for capture buttons, previews, and modal viewer
- **Settings Integration**: Screenshot mode setting persists across sessions and syncs with overlay

### Fixed
- **Overlay Persistence**: Fixed state restoration to include `currentStoryIndex` for proper screenshot functionality
- **Settings Loading**: Ensured settings are loaded before overlay state restoration to prevent race conditions

## [1.2.5] - 2025-10-08

### Added
- **Clickable Chapter Title in Small Overlay**: Chapter title in small overlay mode is now clickable and restores the previous fullscreen view
- **Smart View Restoration**: Clicking chapter title intelligently returns to either large overlay or pinned content view, depending on which mode was last used
- **Visual Feedback**: Chapter title shows hover effects (background highlight, color change to green, subtle transform) to indicate it's clickable

### Changed
- **Chapter Title Styling**: Added interactive styling with cursor pointer and smooth transitions for better UX

### Technical
- **View Mode Tracking**: Added `lastFullscreenMode` variable to track whether user last used 'large' or 'pinned' mode
- **New Function**: Implemented `expandToPreviousView()` to handle intelligent view restoration from small overlay
- **State Management**: Enhanced toggle functions to track and restore correct fullscreen view mode

## [1.2.4] - 2025-10-08

### Added
- **URL-Based Overlay Limiting**: New setting to limit overlays to tabs with the same parent URL (enabled by default)
- **Chapter URL Matching**: Overlay now persists when navigating to chapter URLs via direct click or Ctrl+click to open in new tab
- **Enhanced Content Shifting**: Improved content shifting for sites with fixed-width layouts (YouTube, etc.) with comprehensive container targeting
- **Cleanup Function**: Added dedicated cleanup function to properly reset content shifting styles across all modified elements

### Changed
- **Default Keyboard Shortcuts**: Updated all letter-based shortcuts to use Ctrl+Shift combinations for consistency
  - Hide/Show Overlay: `Shift+H` → `Ctrl+Shift+H`
  - Toggle Fullscreen: `Shift+O` → `Ctrl+Shift+O`
  - Save URL: `Shift+S` → `Ctrl+Shift+S`
  - Toggle Pin Content: `Shift+P` → `Ctrl+Shift+P`
- **Default Arrow Shortcuts**: Updated arrow key shortcuts to use Ctrl+Shift as well
  - Next Chapter: `Shift+→` → `Ctrl+Shift+→`
  - Previous Chapter: `Shift+←` → `Ctrl+Shift+←`
  - Next Persona: `Shift+↓` → `Ctrl+Shift+↓`
  - Previous Persona: `Shift+↑` → `Ctrl+Shift+↑`
- **Ultra Slim Mode Padding**: Reduced left padding from 12px to 8px for more compact layout
- **Persona Card Spacing**: Reduced padding (20px → 12px), header margin (16px → 10px), chapters list margin (16px → 10px), and grid gap (16px → 10px) in ultra slim mode
- **Resize Handle Width**: Reduced from 8px to 4px for more subtle appearance
- **Normal Pinned Panel Padding**: Reduced horizontal padding from 40px to 20px for better space utilization

### Fixed
- **Small Overlay Dimensions**: Fixed issue where small overlay inherited width from pinned panel, now consistently uses CSS-defined dimensions
- **YouTube Content Shifting**: Fixed pinned content panel not shifting page content on sites like YouTube with fixed-width containers
- **Cross-Tab URL Filtering**: Overlay state now checks both parent URL and all chapter URLs for proper cross-tab synchronization

### Technical
- **URL Matching Algorithm**: Enhanced to check current URL against parent URL and all chapter URLs from the demo
- **Helper Functions**: Added `getParentUrl()`, `getParentUrlFromString()`, `matchesParentUrl()`, and `collectChapterUrls()`
- **State Management**: Added `parentUrl` and `chapterUrls` to saved overlay state for URL-based filtering
- **Container Detection**: JavaScript now dynamically finds and shifts main containers on stubborn sites
- **Style Cleanup**: Comprehensive cleanup of all injected styles when exiting pinned content mode

## [1.2.3] - 2024-12-19

### Fixed
- **Color Theme Import/Export**: Fixed import/export functionality to properly include and restore color themes and selection
- **Custom Theme Restoration**: Custom theme dropdown now properly refreshes after importing data
- **Global Variable Synchronization**: Fixed issue where color theme global variables weren't updated after import

### Changed
- **Enhanced Export Messages**: Export now shows count of custom themes being exported
- **Enhanced Import Messages**: Import now shows count of custom themes being restored
- **Improved Debugging**: Added comprehensive logging for color theme export/import operations

### Technical
- **Settings Loading**: Updated `loadSettings()` to properly sync global color theme variables
- **Import Process**: Enhanced `importData()` to explicitly update color theme variables and reload dropdown
- **Export Process**: Added detailed logging to track what color data is being exported

## [1.2.2] - 2024-12-19

### Added
- **Headshot Cropping Feature**: Added 1:1 aspect ratio cropping functionality for persona headshots
- **Inline Cropper Integration**: Cropper now appears directly in the persona modal after image upload
- **Drag and Resize Controls**: Interactive crop box with corner handles for precise positioning and sizing
- **Cropping Validation**: Users must crop uploaded images before saving personas
- **Canvas-Based Image Processing**: High-quality image cropping using HTML5 Canvas API

### Fixed
- **Modal Close Behavior**: Cropper close button now only closes cropper section, not entire persona modal
- **Event Bubbling**: Prevented cropper clicks from bubbling to modal close handlers
- **Image Display Issues**: Fixed cropper canvas sizing and positioning to fit images properly
- **Crop Box Positioning**: Crop overlay now appears only within image boundaries
- **Resize Handle Functionality**: Corner handles now properly resize crop box with correct direction handling

### Changed
- **Upload Workflow**: Image upload now requires cropping step before saving
- **Cropper UI**: Removed zoom functionality and preview features for simplified interface
- **Container Sizing**: Cropper container now dynamically sizes to fit image dimensions
- **Event Handling**: Enhanced mouse event handling for smooth dragging and resizing

### Technical
- **Canvas Integration**: Added headshot-cropper.js with comprehensive image manipulation
- **Event Management**: Implemented stopPropagation() to prevent modal conflicts
- **File Processing**: Removed fallback to original file processing, enforcing cropping requirement
- **State Management**: Enhanced cropper state handling and validation

## [1.2.1] - 2024-12-19

### Fixed
- **Overlay Positioning Race Condition**: Fixed critical issue where overlay would appear in wrong position (bottom-right) on first apply instead of user's saved default position
- **Settings Loading Timing**: Resolved race condition between settings loading and overlay positioning that caused inconsistent behavior
- **Non-Default Selection Issues**: Fixed overlay positioning specifically for non-default persona/chapter selections from popup
- **Apply Button Functionality**: Restored apply button functionality that was broken during previous positioning fixes

### Changed
- **Direct Settings Passing**: Popup now loads settings directly from storage and passes them to content script, eliminating cache dependency
- **Synchronous Settings Loading**: Overlay positioning now uses settings loaded synchronously in popup instead of asynchronous content script loading
- **Enhanced Debugging**: Added comprehensive logging for overlay positioning, settings loading, and apply button functionality

### Technical
- **Settings Architecture**: Modified popup to load overlay position, size, and opacity settings before script injection
- **Parameter Passing**: Enhanced script injection to pass complete overlay settings as parameters
- **Race Condition Elimination**: Removed complex retry mechanisms in favor of direct settings passing
- **Error Handling**: Improved error handling and debugging for overlay application process

## [1.2.0] - 2024-12-19

### Added
- **Complete Export/Import**: Enhanced export/import functionality to include all Chrome storage and localStorage data
- **Version Compatibility**: Added version checking and compatibility warnings during import
- **localStorage Backup**: Export now includes overlay width preferences, navigation state, and theme settings
- **Enhanced Import Validation**: Improved data structure validation and error handling for import operations

### Fixed
- **Export Data Coverage**: Fixed missing localStorage data in export/import functionality
- **Version Mismatch**: Updated export version from 1.1.2 to 1.2.0 for consistency
- **State Restoration**: Import now properly restores all extension state including UI preferences

### Changed
- **Export Format**: Updated export format to include separate localStorage data section
- **Import Process**: Enhanced import confirmation dialog with version information
- **Data Management**: Complete backup and restore of all extension data and settings

## [1.1.7] - 2024-12-19

### Added
- **Auto-Scroll Navigation**: Added automatic scrolling to center selected chapters during keyboard navigation
- **URL Navigation Highlighting**: Enhanced chapter highlighting when navigating between personas via URL links
- **Pinned Content State Preservation**: Added persistent state management for pinned content view across hide/show cycles

### Fixed
- **Chapter Highlighting Persistence**: Fixed issue where chapters weren't highlighted after URL navigation between personas
- **Persona Highlighting**: Fixed persona highlighting to show correct persona as emphasized when navigating via URLs
- **Ctrl+Click Navigation**: Fixed issue where Ctrl+clicking chapter URLs caused original tab to navigate instead of opening new tab
- **Multiple Chapter Highlighting**: Fixed issue where all chapters were highlighted during keyboard navigation in pinned/large overlay views
- **Persona Navigation Highlighting**: Fixed chapter highlighting when navigating between personas with keyboard shortcuts
- **Pinned Content Hide/Show**: Fixed issue where pinned content view was lost when hiding/showing overlay with Shift+H
- **State Preservation**: Improved state management to preserve pinned content mode across overlay hide/show cycles

### Changed
- **Navigation Experience**: Enhanced keyboard navigation with smooth auto-scrolling to keep selected chapters visible
- **Highlighting Logic**: Improved chapter and persona highlighting consistency across different navigation methods
- **State Management**: Better preservation of overlay state including pinned content mode during hide/show operations

## [1.1.6] - 2024-12-19

### Changed
- **New Default Theme**: Updated default color scheme to use lighter bluish purple theme (matching popup interface)
- **Theme Reorganization**: 
  - Default theme now uses blue/purple gradient (rgba(3, 45, 66) to rgba(118, 97, 255))
  - Previous blue/green theme moved to "Blue/Green Theme" option
  - Classic purple theme remains as separate "Purple Theme" option
- **Settings UI Updates**: Updated color scheme dropdown to reflect new theme names and default

### Fixed
- **Theme Consistency**: Fixed issue where purple theme was showing instead of expected default
- **Color Scheme Logic**: Corrected default theme colors to match popup extension interface

## [1.1.5] - 2024-12-19

### Added
- **Immediate URL Button Updates**: URL buttons now appear instantly when URLs are saved in pinned content view
- **Automatic Overlay Refresh**: Overlay content refreshes automatically when URLs are edited in setup interface
- **Color-Coded Notifications**: Different notification colors for success (green/blue) vs user action required (orange/amber)

### Changed
- **URL Saving Restriction**: URL saving now only available in pinned content view, not in small overlay
- **Enhanced User Feedback**: Clear error messages when attempting URL saving outside pinned content view
- **Improved Notification System**: Automatic overlay refresh eliminates need to manually reapply overlay after story updates

### Fixed
- **URL Button Visibility**: Fixed issue where URL buttons wouldn't appear immediately after saving URLs
- **Cross-Tab Synchronization**: URLs edited in setup interface now immediately update all open overlay tabs

## [1.1.4] - 2024-12-19

### Added
- **Minimal Padding Mode**: New setting for reduced overlay width (25% smaller) in pinned content view
- **Enhanced Navigation for Large Overlay**: Improved chapter/persona navigation with proper state synchronization
- **Smart Width Management**: Automatic width adjustment and restoration based on minimal padding setting
- **Persistent Width Storage**: Separate storage for minimal padding width preferences

### Changed
- **Content Pin Logic**: Improved width calculation using actual rendered dimensions instead of CSS values
- **Navigation Behavior**: Enhanced keyboard shortcuts work differently based on overlay view (small vs large/pinned)
- **State Synchronization**: Better highlighting and selection consistency between overlay modes

### Fixed
- **Cross-Persona Navigation Bug**: Fixed navigation getting stuck when personas have only 1 chapter
- **Button Visibility**: Navigation buttons now appear correctly for single-chapter personas when cross-persona navigation is enabled
- **Width Calculation**: More accurate content shifting using actual rendered overlay width
- **Highlighted Chapter Persistence**: Fixed issue where highlighted chapter state was lost when transitioning from small overlay to pinned content view with Shift+P (now maintains highlighting consistently like Shift+O)

## [1.1.3] - 2024-12-19

### Added
- **Enhanced Keyboard Navigation**: Large overlay and pinned content views now support chapter/persona navigation with Shift+Left/Right for chapters and Shift+Up/Down for personas
- **Unified Navigation System**: Consistent navigation behavior across all overlay views (small, large, pinned content)
- **Smart State Synchronization**: Navigation in large overlay automatically syncs with small overlay state

### Changed
- **Keyboard Shortcut Behavior**: Shift+Left/Right and Shift+Up/Down now work differently based on overlay view mode
- **Highlighting System**: Improved chapter and persona highlighting consistency between overlay views
- **State Management**: Better synchronization of highlighted selections between large and small overlay modes

### Fixed
- **Duplicate Highlighting**: Fixed issue where multiple chapters could be highlighted simultaneously in large overlay
- **State Persistence**: Navigation changes in large overlay now properly reflect when switching back to small overlay
- **Initial Highlighting**: Proper single chapter highlighting when transitioning from small to large overlay

### Technical
- **Navigation Functions**: Added `navigateHighlightedChapter()` and `navigateHighlightedPersona()` functions for large overlay navigation
- **State Synchronization**: Enhanced `highlightCurrentChapterFromSmallOverlay()` to use proper highlighting system
- **Conditional Logic**: Keyboard shortcut handlers now detect overlay mode and apply appropriate navigation behavior

## [1.1.2] - 2024-12-19

### Added
- **Floating Save Button**: Settings page now has a floating green save button that appears only when changes are made
- **Smart Change Detection**: Real-time monitoring of all form elements to detect unsaved changes
- **Cross-Tab Notifications**: Settings changes now notify all pages with active overlays to refresh and reapply
- **Story Update Notifications**: Story modifications in setup page notify users to reapply overlay for latest changes
- **Dual Communication System**: Uses Chrome messaging API with script injection fallback for reliable notifications
- **Enhanced User Experience**: Notifications appear only on pages with active overlays, auto-dismiss after 10 seconds

### Changed
- **Settings Page Layout**: Removed static save button from overlay settings section
- **Notification Design**: Red notifications for settings updates, green notifications for story updates
- **Manifest Permissions**: Added "tabs" permission for cross-tab communication

### Fixed
- **Change Detection**: Comprehensive monitoring of checkboxes, selects, inputs, and range sliders
- **Notification Reliability**: Improved error handling and fallback mechanisms for cross-tab messaging
- **UI Consistency**: Floating save button follows user as they scroll through settings

### Technical
- **Chrome Extension API**: Enhanced use of chrome.tabs.query() and chrome.tabs.sendMessage()
- **Content Script Integration**: Proper message handling for both settings and story notifications
- **Error Handling**: Graceful handling of script injection failures and messaging errors
- **Performance**: Only shows notifications on relevant pages, not all tabs

## [1.3] - 2024-12-19

### Added
- **MojoAI Branding**: Renamed AI Integration section to "MojoAI" throughout the application
- **Configurable File Size Limits**: PDF upload size limit now configurable in settings (100-10000 KB)
- **Dynamic Upload Validation**: File size validation now uses user-configured limits
- **Enhanced JSON Parsing**: Robust parsing of AI responses wrapped in markdown code blocks
- **Gradient Button Styling**: New gradient button style for MojoAI features with sparkle icon
- **Dynamic Upload UI**: Upload area text updates based on configured file size limits

### Changed
- **Button Styling**: "Add Story" button now uses solid blue color instead of gradient
- **Tab Order**: Demo Script tab now appears first, Upload PDF tab second
- **File Size Messages**: All file size error messages now reference actual configured limits
- **AI Processing**: Updated all references from "GenAI" to "MojoAI" in user-facing text
- **Version Display**: Updated setup page version to v1.2.2

### Fixed
- **CSP Violations**: Removed inline event handlers to comply with Content Security Policy
- **JSON Parsing Errors**: Fixed parsing of AI responses that include markdown code blocks
- **File Upload Validation**: Improved error handling for file size validation
- **Event Handling**: Proper event listener attachment for file upload buttons

### Technical
- **Settings Storage**: Added `pdfFileSizeLimit` setting with default value of 500 KB
- **Async Functions**: Updated modal reset functions to handle dynamic settings loading
- **Error Handling**: Enhanced error messages with specific file size limit references
- **Code Cleanup**: Removed debug functions and sample script loading features

## [1.2] - 2024-12-19

### Added
- **Custom Keyboard Shortcuts**: Users can now customize all keyboard shortcuts with up to 3-key combinations
- **Shortcuts Configuration UI**: Interactive settings panel for customizing keyboard shortcuts
- **Real-time Shortcut Recording**: Click-to-record interface with visual feedback during shortcut capture
- **Shortcut Conflict Detection**: Prevents duplicate shortcuts across different actions
- **Dynamic Popup Display**: Extension popup now shows custom shortcuts with visual indicators
- **Shortcut Reset Options**: Individual and bulk reset functionality for shortcuts
- **Loading Overlay**: Visual feedback when saving shortcut configurations
- **Cross-platform Support**: Full support for Ctrl, Cmd, Alt, Shift, and special keys

### Changed
- **Popup Shortcuts Display**: Now dynamically updates to show custom shortcuts instead of static defaults
- **Settings Page**: Added comprehensive "Keyboard Shortcuts" section with expandable customization panel
- **Visual Indicators**: Custom shortcuts are highlighted with different styling in popup

### Fixed
- **Multi-key Input**: Fixed issue where only first key was captured during shortcut recording
- **Real-time Updates**: Popup and content script now immediately reflect shortcut changes

## [1.1.2] - 2024-12-19

### Added
- Conditional navigation buttons that only appear when shortcuts are disabled
- Dynamic popup instructions that change based on shortcuts toggle state
- Expand button (⛶) for opening full-screen view from small overlay
- Arrow navigation buttons (←/→) for chapter navigation in small overlay
- Shortcuts toggle switch in extension popup
- Automatic overlay content refresh when shortcuts are toggled
- Consistent fallback headshot assignment for personas without uploaded images
- Migration function to assign fallback headshots to existing personas
- Auto-selection of newly created stories in setup page
- Shift+S shortcut instruction in popup overlay
- Comprehensive settings page for user customizations
- Settings button in popup header for easy access
- Data export/import functionality for backup and restore
- Advanced overlay customization options (opacity, animation speed)
- Behavior settings (auto-save URLs, remember last story, progress indicators)

### Changed
- Navigation buttons positioned in bottom-right corner of small overlay
- Overlay padding increased to 60px to prevent content overlap with navigation buttons
- Arrow button size reduced to 24x24px for better fit
- Persona headshot selection now uses deterministic hash-based assignment instead of random selection
- Settings page navigation now routes to setup page instead of popup
- Settings button in popup is now icon-only with low opacity and hover effect
- Save button moved to top of first settings section for better accessibility
- Added loading overlay with 0.5s delay before showing save confirmation

### Fixed
- Navigation buttons no longer cut into overlay content
- Proper pointer events handling for interactive overlay elements
- Persona images now stay consistent across overlay updates instead of changing randomly
- Escape key now completely destroys overlay and prevents unhiding with Shift+H
- Overlay opacity setting now properly applies to overlay background

## [Unreleased]

### Added
- Full-screen and pinned content modes as default overlay position options
- Enhanced position toggle in popup to cycle through all four position modes

### Changed
- Default overlay position setting now includes full-screen and pinned content options
- Position display text updated to show proper names for new modes

### Fixed
- Full-screen mode now correctly shows complete story summary with all personas and chapters
- Full-screen mode now has proper draggable pane functionality and correct width (same as Shift+O)

## [Previous Versions]

### Initial Implementation
- Basic overlay functionality with persona and chapter display
- Keyboard shortcuts for navigation (Shift+Arrow keys, Shift+H, Shift+O, Shift+P)
- Multiple overlay sizes (small, large) and positions (bottom-right, bottom-left)
- Full-screen story view mode
- Content shift toggle functionality
- Progress indicators for multi-chapter stories
- Chrome extension popup interface
- Story management and chapter completion tracking

---

## Version History

- **v1.0.0** - Initial release with basic overlay functionality
- **v1.1.0** - Added shortcuts toggle and conditional navigation buttons
- **v1.1.2** - Added floating save button, smart change detection, and cross-tab notifications
- **v1.2.0** - Added custom keyboard shortcuts with full configuration UI
- **v1.2.1** - Fixed overlay positioning race conditions and settings loading timing
- **v1.2.2** - Added headshot cropping feature with inline cropper integration
