# Changelog

All notable changes to the Portfolio 2026 project will be documented in this file.

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
