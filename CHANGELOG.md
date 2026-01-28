# Changelog

All notable changes to the Portfolio 2026 project will be documented in this file.

## [1.1.0] - 2026-01-28

### Fixed
- **SEO/Metadata**: Updated all domain references from `smeetkumarpatel.com` to `smeetkp.github.io`
- **LinkedIn URL**: Added missing `https://` protocol to contact.json
- **GamifiedMode Navigation**: Added Back button using `onBack` prop - users can now return to landing page
- **Sitemap**: Simplified to single root URL (removed non-functional mode query params)

### Added
- **ErrorBoundary**: Added React Error Boundary component for graceful error handling
- **ISSUES_CHECKLIST.json**: Comprehensive issue tracking document

### Removed
- **Placeholder Google Verification**: Removed `your-google-verification-code` placeholder
- **Unused Preconnect**: Removed `assets.aceternity.com` preconnect (not used)
- **Twitter Creator**: Removed `@smeetkumarpatel` (unverified handle)
- **Company Variants**: Removed placeholder company profiles (amazon, google, microsoft)
- **sharp-cli**: Removed unused dev dependency
- **Dead Code Cleanup**: Removed 37 unused files (demos, backups, dev artifacts)

### Changed
- **useContent Hook**: Simplified - removed variant loading logic
- **loader.ts**: Simplified - removed company variant imports

## [1.0.0] - 2026-01-27

### Added
- Initial deployment to GitHub Pages at `smeetkp.github.io`
- GitHub Actions CI/CD workflow

## [Unreleased] - 2026-01-21

### Fixed
- **Critical Game Hang**: Resolved an infinite loop issue in the particle system (RetroEngine) where particles were never removed, causing the game to freeze near the castle (fireworks trigger).
- **Layout & Rendering**:
  - Fixed a critical bug where `width/height` were 0 on initialization, causing all HUD elements and fireworks to collapse to the left side of the screen.
  - Added defensive resizing logic to ensure game dimensions always sync with the canvas.
- **HUD Visibility**:
  - Fixed Message Box overlapping with Score/Coins by implementing dynamic height calculation based on text content.
  - Changed text rendering to "Top-Down" flow to prevent upward expansion into the header area.
- **Text Readability**:
  - Replaced messy pixel-font outlines with crisp drop shadows for better legibility on brick labels.
- **Level Design**:
  - **Brick Position**: Moved the "Contact/Mail" brick from *above* the castle to *before* the castle for better accessibility.
  - **Staircase**: Redesigned the "Experience" section from a one-way wall to a symmetric pyramid, allowing bi-directional traversal.
  - **Labels**: Standardized brick labels to 4-letter codes (CODE, TOOL, TECH, ART) to fit the block size.

### Added
- **Retro Mode Polish**:
  - Restored the HUD system (Score, Coins, Messages).
  - Improved particle physics (gravity/velocity) so fireworks and floating text animate correctly.

### Removed
- **Red Block Artifact**: Removed debug code that was drawing a red rectangle over the player sprite.
- **Floating Labels**: Removed cluttered section labels ("IDENTITY", "ARSENAL") from the game world to improve visual clarity.
