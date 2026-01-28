# Smeet Kumar Patel | Data & AI Leader - Portfolio 2026

A modern, interactive portfolio website built with **Next.js**, **React**, and **TypeScript**. It features a unique dual-mode interface: a sleek "Professional Mode" for recruiters and a gamified "Retro Mode" for a fun, immersive experience.

## 🌟 Features

### 🏢 Professional Mode
- **Clean, Modern UI**: Built with Tailwind CSS and Shadcn/UI principles.
- **Data-Driven Content**: Dynamically loads profile, skills, and experience data.
- **Responsive Design**: Optimized for all devices.

### 🎮 Retro Mode (Super Mario Style)
- **Custom Game Engine**: A lightweight 2D physics engine built from scratch in TypeScript (`RetroEngine.ts`).
- **Interactive Level**: The portfolio content is generated as a playable level.
  - **About Me**: Hit the first question block.
  - **Skills**: Jump to hit bricks labeled with skill categories (CODE, TOOL, TECH, etc.).
  - **Experience**: Traverse a pyramid of steps representing career progression.
  - **Contact**: Reach the Castle to find the contact info.
- **Physics & Gameplay**:
  - AABB Collision Detection.
  - Gravity, Velocity, and Friction.
  - Particle System (Fireworks, Floating Text).
  - Dynamic Camera Follow.
- **Audio**: Retro sound effects (Jump, Coin, Bump, Victory) synthesized via Web Audio API.

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Font**: Geist Sans (Modern), Press Start 2P (Retro)
- **State Management**: React Hooks (`useRef` for game loop)

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## 🎮 Controls (Retro Mode)

| Action | Keyboard | Mobile |
| :--- | :--- | :--- |
| **Move** | Arrow Keys / WASD | D-Pad |
| **Jump** | Space / Up | Button |
| **Interact** | Enter | Auto |
| **Reset** | R | Menu |

## 📂 Project Structure

- `src/components/retro/`: Contains the Game Engine and Level Generator.
- `src/data/`: JSON files containing portfolio content.
- `src/hooks/`: Custom hooks for audio and content loading.
- `src/app/`: Next.js App Router pages.
