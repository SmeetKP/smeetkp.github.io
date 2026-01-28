# Retro Engine Documentation

## Overview
`RetroEngine.ts` is a custom-built 2D physics and rendering engine designed specifically for the interactive portfolio. It handles the game loop, physics simulation, collision detection, and HTML5 Canvas rendering.

## Core Components

### 1. RetroEngine Class
The main controller class that manages the game state.
- **Input**: Handles keyboard events (`handleInput`).
- **Update**: Physics integration (Euler), collision resolution, and entity lifecycle.
- **Render**: Draws sprites, geometry, text, and UI to the Canvas context.

### 2. LevelGenerator
`LevelGenerator.ts` procedurally generates the game world based on the portfolio content (JSON).
- **Mapping**: Converts text content (Skills, Experience) into game entities (Bricks, Platforms).
- **Layout**: Calculates positions to ensure the level is traversable (e.g., staircase generation).

### 3. Entity System
All game objects are `Entity` types with properties:
- `x, y, w, h`: Spatial dimensions (AABB).
- `vx, vy`: Velocity vector.
- `type`: 'player', 'ground', 'brick', 'particle', etc.
- `solid`: Whether it blocks movement.
- `gravity`: Whether it falls.

## Key Mechanics

### Physics Loop
The engine uses a fixed timestep approach for consistency (clamped `dt`).
1.  Apply Gravity (`vy += GRAVITY * dt`).
2.  Apply Friction (`vx *= FRICTION`).
3.  Update Position (`x += vx * dt`, `y += vy * dt`).
4.  Resolve Collisions per axis to prevent tunneling.

### Particle System
Used for visual flair (Fireworks, debris).
- **Fireworks**: Spawns multiple particles with radial velocity upon level completion.
- **Floating Text**: Spawns text entities that float upwards when blocks are hit.
- **Optimization**: Particles are automatically culled when `life <= 0` or off-screen.

### HUD System
Renders overlay information (Score, Coins, Messages).
- **Message Box**: Dynamically calculates height based on text content to prevent overlapping with the score display. Uses a top-down rendering flow.

## Recent Fixes (Jan 2026)
- **Infinite Loop Fix**: Corrected particle update loop to properly remove dead particles.
- **Layout Fix**: Added defensive resizing to prevent 0-width initialization bugs.
- **Text Polish**: Switched from outline strokes to drop shadows for better readability.
