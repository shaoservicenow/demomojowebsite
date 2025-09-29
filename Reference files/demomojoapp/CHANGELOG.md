# Changelog

All notable changes to the Demo Persona Overlay extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **Version Display**: Updated setup page version to v1.1.0

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

## [1.1.0] - 2024-12-19

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
- **v1.2.0** - Added custom keyboard shortcuts with full configuration UI
