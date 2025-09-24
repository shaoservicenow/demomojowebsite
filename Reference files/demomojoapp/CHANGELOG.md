# Changelog

All notable changes to the Demo Persona Overlay extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Changed
- Navigation buttons positioned in bottom-right corner of small overlay
- Overlay padding increased to 60px to prevent content overlap with navigation buttons
- Arrow button size reduced to 24x24px for better fit
- Persona headshot selection now uses deterministic hash-based assignment instead of random selection

### Fixed
- Navigation buttons no longer cut into overlay content
- Proper pointer events handling for interactive overlay elements
- Persona images now stay consistent across overlay updates instead of changing randomly

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
