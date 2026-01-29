# Portfolio 2026 - Technical Architecture

## Overview

This is a dual-mode portfolio website for **Smeet Kumar Patel**, a Data & AI Leader. It features:
1. **Professional Mode** - Clean, modern UI for recruiters
2. **Retro Mode** - A Super Mario-style gamified experience

---

## Project Structure

```
smeetkp.github.io/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Landing page (mode selection)
│   │   ├── layout.tsx          # Root layout with fonts
│   │   └── globals.css         # Tailwind + custom styles
│   │
│   ├── components/
│   │   ├── retro/              # 🎮 RETRO MODE ENGINE
│   │   │   ├── RetroEngine.ts  # Core game engine (physics, rendering, collision)
│   │   │   ├── LevelGenerator.ts # Converts portfolio data → game entities
│   │   │   ├── TextureManager.ts # Sprite/texture generation & caching
│   │   │   ├── types.ts        # Entity, GameState interfaces
│   │   │   └── GamifiedMode.tsx # React wrapper component
│   │   │
│   │   ├── professional/       # 🏢 PROFESSIONAL MODE
│   │   │   └── ProfessionalMode.tsx
│   │   │
│   │   └── ui/                 # Shared UI components
│   │
│   ├── data/                   # 📊 CONTENT (JSON)
│   │   ├── experience-detailed.json  # Main experience data
│   │   ├── profile.json        # Name, title, location
│   │   ├── skills.json         # Technical skills
│   │   └── contact.json        # Contact information
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useContent.ts       # Loads portfolio content
│   │   └── useRetroAudio.ts    # Web Audio API sound effects
│   │
│   └── types/                  # TypeScript interfaces
│       └── content.ts          # PortfolioContent type
│
├── public/                     # Static assets
├── docs/                       # Documentation
└── package.json
```

---

## Retro Mode Architecture

### Core Files

#### 1. `RetroEngine.ts` - Game Engine (~1300 lines)

The heart of the game. Handles:

| System | Description |
|--------|-------------|
| **Physics** | Gravity, velocity, friction, AABB collision |
| **Rendering** | Canvas 2D drawing, camera follow, parallax |
| **Entities** | Player, coins, goombas, billboards, flags, boss |
| **Particles** | Floating text, sparkles, fireworks |
| **Game State** | Score, achievements, sections visited |
| **HUD** | Score display, message bar, progress tracker |

**Key Methods:**
```typescript
update(dt: number)      // Physics & collision per frame
render()                // Draw all entities & HUD
spawnFloatingText()     // Achievement popups (stacked, no overlap)
showMessage()           // HUD message bar (5 second display)
```

#### 2. `LevelGenerator.ts` - Content → Game (~450 lines)

Converts `experience-detailed.json` into playable game entities.

**Data Flow:**
```
experience-detailed.json
    ↓
LevelGenerator.generateLevel()
    ↓
Entity[] (coins, goombas, billboards, flags, boss)
    ↓
RetroEngine.loadLevel()
```

**Key Constants:**
```typescript
SECTION_CHALLENGES      // Goomba labels & defeat messages
HIDDEN_ACHIEVEMENTS     // Question block secrets
SECTION_FULL_CONTENT    // Billboard text content
JURISDICTION_FLAGS      // Data governance compliance flags
```

#### 3. `TextureManager.ts` - Sprite Generation (~800 lines)

Generates all game sprites programmatically (no external images).

**Sprites Generated:**
- `hero_idle`, `hero_run_1`, `hero_run_2`, `hero_jump`
- `coin`, `metricCoin`, `goomba`, `mushroom`, `hammer`
- `brick`, `questionBlock`, `ground`, `pipe`, `castle`
- `flag`, `bowser` (final boss)

#### 4. `types.ts` - Type Definitions

```typescript
interface Entity {
  id: string;
  type: 'player' | 'coin' | 'goomba' | 'billboard' | 'flag' | 'bowser' | ...;
  x, y, w, h: number;           // Position & size
  vx, vy: number;               // Velocity
  active: boolean;              // Visible/collidable
  label?: string;               // Display text
  content?: string;             // Full message on collect
  defeatMessage?: string;       // Goomba defeat text
  metricValue?: string;         // Coin value (e.g., "75%")
  metricLabel?: string;         // Coin context (e.g., "FTE Reduction")
}

interface GameState {
  score: number;
  coins: number;
  achievements: number;
  totalAchievements: number;
  flagsCollected: number;
  totalFlags: number;
  metricsCollected: string[];
  challengesOvercome: string[];
  sectionsVisited: string[];
  message: string;
  messageTimer: number;
}
```

---

## Game Flow

### Level Structure (Left → Right)

```
[START] → [HERO BILLBOARD] → [SONOVA BILLBOARD] → [SECTION ZONES] → [BOSS] → [CASTLE]

Each SECTION ZONE contains:
├── Billboard (section title + key metrics)
├── Metric Coins (2 per section, collectible achievements)
├── Goomba (challenge to defeat)
├── Question Block (hidden achievement)
└── Pipe (visual separator)
```

### Entity Types & Behavior

| Entity | Behavior | On Interact |
|--------|----------|-------------|
| **Coin** | Bobs up/down | +100 score, floating text with full metric |
| **Goomba** | Walks left/right | Stomp = defeat message, Side = knockback |
| **Billboard** | Static | Displays section info (adaptive size) |
| **Question Block** | Static | Hit from below = hidden achievement |
| **Flag** | Static | Collect for jurisdiction compliance |
| **Hammer** | Bobs | Collect to defeat final boss |
| **Bowser** | Static | Hit with hammer = victory |

---

## Text Display System

### Billboard Rendering (Adaptive Size)

```typescript
// RetroEngine.ts - renderBillboard()
// 1. Measure actual text width using measureText()
// 2. Calculate required billboard dimensions
// 3. Render with clipping to prevent overflow
```

### Floating Text (No Overlap)

```typescript
// RetroEngine.ts - spawnFloatingText()
// 1. Count existing text particles
// 2. Offset new text vertically (25px per existing)
// 3. Show full text in HUD message bar
// 4. Fade out over last 1 second of 3-second life
```

### Content Sources

| Display | Source | Example |
|---------|--------|---------|
| Coin label | `metricValue` + `metricLabel` | "75%" + "FTE Reduction" |
| Coin popup | `content` | "75% FTE Time Reduction achieved!" |
| Goomba label | `label` | "KPI" |
| Goomba defeat | `defeatMessage` | "Standardized KPIs across 20 markets!" |
| Billboard | `SECTION_FULL_CONTENT` | Title + 3-line content |

---

## Data Files

### `experience-detailed.json`

The authoritative source for all portfolio content.

```json
{
  "company": "Sonova Group",
  "role": "Manager, Data Engineering, Analytics & GenAI",
  "sections": [
    {
      "id": "enterprise-bi",
      "title": "Enterprise BI & Executive Reporting",
      "content": {
        "metrics": [
          { "value": "2.1%", "label": "QoQ Sales Increase" },
          { "value": "60%", "label": "Engagement Boost" }
        ]
      }
    }
  ]
}
```

---

## Audio System

`useRetroAudio.ts` uses Web Audio API to synthesize retro sounds:

| Sound | Trigger |
|-------|---------|
| `jump` | Player jumps |
| `coin` | Coin/flag collected |
| `bump` | Goomba defeated |
| `powerup` | Mushroom/hammer collected |
| `die` | Player hit by goomba (side) |
| `victory` | Boss defeated / game complete |

---

## Key Design Decisions

1. **No External Images** - All sprites generated via Canvas API for fast loading
2. **Data-Driven Levels** - Game content comes from JSON, not hardcoded
3. **Adaptive Billboards** - Size calculated from actual text width
4. **Stacked Floating Text** - Prevents overlap when collecting items quickly
5. **HUD Message Bar** - Always shows full text for recruiter readability
6. **Meaningful Messages** - Every popup has context (not just "75%" but "75% FTE Reduction achieved!")

---

## Common Modifications

### Adding a New Section

1. Add section to `experience-detailed.json`
2. Add entry to `SECTION_FULL_CONTENT` in `LevelGenerator.ts`
3. Add challenges to `SECTION_CHALLENGES` in `LevelGenerator.ts`

### Changing Billboard Content

Edit `SECTION_FULL_CONTENT` in `LevelGenerator.ts`:
```typescript
'section-id': { 
  title: 'SECTION TITLE',
  content: 'Line 1\nLine 2\nLine 3'
}
```

### Changing Defeat Messages

Edit `SECTION_CHALLENGES` in `LevelGenerator.ts`:
```typescript
'section-id': [
  { label: 'CHALLENGE', defeatMessage: 'Full achievement message!' }
]
```

---

## Debugging Tips

1. **Text Overflow** - Check `renderBillboard()` in RetroEngine.ts
2. **Collision Issues** - Check `rectIntersect()` and entity bounds
3. **Missing Sprites** - Check `TextureManager.ts` initialization
4. **Sound Issues** - Check browser autoplay policy (user interaction required)
5. **Performance** - Check particle count in update loop

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `next` | React framework |
| `react` | UI library |
| `typescript` | Type safety |
| `tailwindcss` | Styling |
| `@fontsource/press-start-2p` | Retro pixel font |

---

*Last Updated: January 29, 2026*
