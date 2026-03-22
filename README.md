# AlgoViz — Pathfinding & Maze Algorithm Visualizer

An interactive web application for visualizing maze generation and pathfinding algorithms in real time, with AI-powered explanations and audio feedback.

Built with Angular 18 and HTML5 Canvas.

## Features

- **4 Pathfinding Algorithms** — BFS, Dijkstra's, A* (Manhattan heuristic), DFS
- **3 Maze Generators** — Randomized DFS Backtracking, Prim's, Binary Tree
- **Real-time Animation** — Step-by-step visualization with adjustable speed
- **Audio Effects** — Synthesized sounds via Web Audio API that react to each algorithm step
- **AI Explanations** — Automatic natural-language breakdown of what the algorithm did, powered by an external AI backend
- **Interactive Grid** — Click and drag to draw walls, Shift+click for start node, Alt+click for end node
- **Run Statistics** — Tracks visited nodes, path length, and runtime per execution
- **Dark Theme** — Deep navy-indigo-cyan palette designed for extended use

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 18 (standalone components) |
| Language | TypeScript 5.5 |
| Rendering | HTML5 Canvas |
| Styling | SCSS with CSS custom properties |
| Fonts | Inter, JetBrains Mono (Google Fonts) |
| Audio | Web Audio API (no external libraries) |
| Reactive | RxJS 7 |
| AI | External REST API (Vercel-hosted backend) |
| Deployment | GitHub Pages via GitHub Actions |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app reloads automatically on file changes.

### Production Build

```bash
npm run build
```

Build artifacts are output to `dist/graph-visualizer-app/`.

## Usage

1. **Generate a maze** — Select a maze algorithm from the dropdown and click **Generate Maze**
2. **Set endpoints** — Hold **Shift** and click to place the start node (green), hold **Alt** and click for the end node (red)
3. **Draw walls** — Click and drag on the grid to toggle walls manually
4. **Visualize** — Select a pathfinding algorithm and click **Visualize** to watch it explore the grid
5. **Adjust speed** — Use the speed slider to control animation pace
6. **Toggle audio** — Click the speaker icon in the header to mute/unmute sound effects
7. **Read AI analysis** — After a run completes, an AI-generated explanation appears in the sidebar

## Project Structure

```
src/
├── index.html                    # Entry HTML with favicon and font imports
├── main.ts                       # Angular bootstrap
├── styles.scss                   # Global CSS variables and base styles
└── app/
    ├── app.component.*           # Root shell — header, layout, audio toggle
    ├── app.config.ts             # Angular providers
    ├── app.routes.ts             # Router config
    ├── components/
    │   ├── controls/             # Algorithm selectors, speed slider, action buttons
    │   ├── grid/                 # Canvas-based grid with mouse interaction
    │   ├── stats/                # Run statistics display
    │   ├── legend/               # Color legend for cell types
    │   └── explanation/          # AI-generated explanation panel
    ├── models/
    │   ├── cell.model.ts         # Cell interface and types
    │   └── grid.model.ts         # Grid data structure
    └── services/
        ├── ai-explainer.service.ts   # AI backend integration
        ├── animation.service.ts      # RxJS-based animation sequencer
        ├── audio.service.ts          # Web Audio API sound effects
        ├── maze-generator.service.ts # Maze generation algorithms
        └── pathfinding.service.ts    # Pathfinding algorithms
```

## License

MIT
