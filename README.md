# ChessLite

[![CI](https://img.shields.io/github/actions/workflow/status/celio-mozes-rocha/ChessLite/deploy.yml?branch=main)](https://github.com/celio-mozes-rocha/ChessLite/actions)
[![License](https://img.shields.io/github/license/celio-mozes-rocha/ChessLite)](https://github.com/celio-mozes-rocha/ChessLite/blob/dev/LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/celio-mozes-rocha/ChessLite)](https://github.com/celio-mozes-rocha/ChessLite/commits/dev)

A modern chess application built with **React**, **TypeScript**, and **chess.js**.

The project focuses on building a responsive chess interface while exploring application architecture, state management, and board interaction. Beyond a simple chessboard, the application implements custom navigation, synchronized move history, advanced highlighting, and multiple interaction modes.

---

# Live Demo

Coming soon.

---

# Preview

*Screenshots and GIFs will be added as the project evolves.*

---

# Features

- Complete chess game powered by **chess.js**
- Drag & Drop
- Click-to-Move
- Legal move validation
- Illegal move prevention
- Interactive move history
- Move navigation
  - First move
  - Previous move
  - Next move
  - Last move
- Undo last move
- Selected piece highlighting
- Legal moves highlighting
- Capture highlighting
- Last move highlighting
- History move highlighting
- Check detection
- Checkmate detection
- King highlighting when in check or checkmate

---

# Technical Highlights

Rather than relying solely on the features provided by **react-chessboard**, the application implements several custom interaction layers to improve the playing experience.

Key implementation topics include:

- Board reconstruction from move history
- Separation between UI and game logic
- State synchronization between React and chess.js
- Click-to-Move implementation
- Drag & Drop support
- Interactive move history
- Dynamic board highlighting
- Modular styling system
- Reusable custom hooks

The objective is to build a clean, maintainable architecture rather than simply displaying a chessboard.

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- TailwindCSS

## Libraries

- chess.js
- react-chessboard

## Tooling

- ESLint
- Git
- GitHub

---

# Application Architecture

The application follows a clear separation between presentation, game state and rendering.

```text
User
 │
 ▼
ChessBoard
 │
 ▼
useChessGame
 │
 ▼
chess.js
```

The current board position is never mutated directly.

Instead, it is reconstructed by replaying the move history until the selected move index.

This approach guarantees synchronization between:

- Board position
- Move history
- Navigation controls
- Highlight system

---

# Project Structure

```text
src/
│
├── components/
│   └── ChessBoard.tsx
│
├── hooks/
│   └── useChessGame.ts
│
├── utils/
│   └── chessStyles.ts
│
├── assets/
│
└── ...
```

---

# Interesting Implementations

## Move History Navigation

The board state is rebuilt from the move history rather than mutating a single game instance.

This makes navigation deterministic and greatly simplifies synchronization.

---

## Board Highlight System

All board decorations are generated dynamically inside a dedicated utility.

Several highlight types may coexist simultaneously:

- Selected piece
- Possible moves
- Capture moves
- Last played move
- Selected move from history
- King in check
- King in checkmate

Styles are merged dynamically to avoid conflicts between multiple visual states.

---

## Click-to-Move

The application implements a complete Click-to-Move interaction:

1. Select a piece.
2. Display all legal destinations.
3. Execute the move by clicking a highlighted square.
4. Cancel the selection by clicking elsewhere.

---

## History Synchronization

Selecting a move from the move history immediately:

- Reconstructs the corresponding board position
- Highlights the selected move
- Updates the board state
- Synchronizes the navigation controls

---

# Future Improvements

Planned features include:

- PGN import/export
- FEN import/export
- Game save/load
- Stockfish integration
- Move analysis
- Opening explorer
- Chess clocks
- Online multiplayer
- Responsive mobile improvements
- Docker deployment
- CI/CD pipeline
- VPS deployment

---

# Local Development

Clone the repository:

```bash
git clone https://github.com/celio-mozes-rocha/ChessLite.git
cd ChessLite
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

---

# Docker

Docker support will be added in a future version.

The project is designed to be containerized using:

- Multi-stage Docker builds
- Docker Compose
- Nginx
- Production VPS deployment

---

# Continuous Integration & Deployment

A GitHub Actions workflow will be added to automate:

- Build
- Code quality checks
- Docker image creation
- Automatic VPS deployment

---

# Project Goals

This project was built to:

- Practice advanced React and TypeScript patterns
- Build reusable custom hooks
- Explore clean state management
- Design modular UI components
- Implement complex board interactions
- Prepare the application for Docker and CI/CD deployment

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.