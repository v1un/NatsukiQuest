# 🌟 Natsuki Quest: A Re:Zero Adventure

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.17.0-2D3748.svg)](https://www.prisma.io/)
[![Firebase Genkit](https://img.shields.io/badge/Firebase%20Genkit-1.13.0-FFA611.svg)](https://firebase.google.com/products/genkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An immersive AI-powered visual novel inspired by Re:Zero, featuring dynamic storytelling, character relationships, and the iconic "Return by Death" mechanic. Experience Subaru's journey with intelligent narrative generation powered by Google's Gemini AI.

## ✨ Key Features

- **🤖 Dynamic AI Storytelling**: Real-time narrative generation using Firebase Genkit and Google Gemini 2.0 Flash
- **⏰ Return by Death**: Authentic checkpoint system allowing players to rewind time upon failure
- **👥 Character Relationships**: Build and manage affinity levels with Re:Zero characters
- **📚 Advanced Lorebook**: AI-powered contextual lore injection for rich world-building
- **💾 Save/Load System**: Persistent game states with user authentication
- **🎮 Adaptive Encounters**: Dynamic situations based on player progress and world lore
- **🔐 Discord Authentication**: Secure login using NextAuth with Discord provider
- **📖 Memory System**: AI remembers past events and choices across game loops

## 🛠️ Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Frontend** | Next.js | 15.3.3 | React framework with App Router |
| **Language** | TypeScript | 5.0 | Type-safe development |
| **Styling** | Tailwind CSS | 3.4.1 | Utility-first CSS framework |
| **UI Components** | Radix UI | Various | Accessible component primitives |
| **AI/ML** | Firebase Genkit | 1.13.0 | AI application framework |
| **LLM** | Google Gemini | 2.0 Flash | Large language model |
| **Database** | PostgreSQL | - | Primary database |
| **ORM** | Prisma | 5.17.0 | Database toolkit |
| **Authentication** | NextAuth.js | 5.0 Beta | Authentication solution |
| **Validation** | Zod | 3.24.2 | Schema validation |
| **Icons** | Lucide React | 0.475.0 | Icon library |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm/pnpm/yarn
- PostgreSQL database
- Google AI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/NatsukiQuest.git
cd NatsukiQuest

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up the database
npx prisma migrate dev
npx prisma generate

# Start the development server
npm run dev
# or
pnpm dev
```

### Development with AI

```bash
# Start Genkit development server (in separate terminal)
npm run genkit:dev
# or
pnpm genkit:dev

# Access Genkit UI at http://localhost:4000
```

## 🎮 Usage Guide

### Starting a New Game
1. Sign in with Discord authentication
2. Click "New Game" to begin Subaru's journey
3. Experience the carefully crafted opening sequence

### Making Choices
- Read the narrative carefully for context clues
- Choose from 1-4 available options
- Watch character relationships evolve based on your decisions
- Monitor your inventory and skills as they develop

### Save & Load
- Use "Save Game" to preserve your progress
- "Load Game" restores your most recent save
- Each user has one save slot (automatically overwrites)

### Return by Death
- When you reach a "Game Over" state, the Return by Death option appears
- Rewind to your last checkpoint with retained memories
- Learn from previous loops to make better choices
- Loop counter tracks your death/revival cycles

## 📸 Screenshots

> **TODO**: Add gameplay screenshots showing:
> - Main narrative interface with story text and choice buttons
> - Character relationship panel with affinity levels
> - Return by Death sequence animation
> - Inventory and skills management
> - Save/load game interface

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Pull Request Process
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with clear, descriptive commits
4. Add tests if applicable
5. Submit a pull request with a detailed description

### Code Style
- Use TypeScript for all new code
- Follow the existing Prettier/ESLint configuration
- Use descriptive variable and function names
- Comment complex AI prompt logic

### Commit Convention
```
feat: add new character interaction system
fix: resolve save game data corruption
docs: update API documentation
style: format code with prettier
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

For detailed technical documentation, see:

- [Setup Guide](docs/setup.md) - Complete local development setup
- [Architecture Overview](docs/architecture.md) - System design and component relationships  
- [AI System Documentation](docs/ai-system.md) - Genkit flows and prompt engineering
- [Database Schema](docs/database.md) - Prisma models and relationships
- [API Reference](docs/api.md) - Server actions and endpoints
- [Development Guide](docs/development.md) - Coding standards and workflow
- [Deployment Guide](docs/deployment.md) - Production deployment instructions

---

*"I will save everyone. No matter how many times it takes."* - Natsuki Subaru
