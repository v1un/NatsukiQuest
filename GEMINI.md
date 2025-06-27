# Gemini Code Assistant Guide for NatsukiQuest

This document provides a comprehensive guide for the Gemini code assistant to effectively contribute to the NatsukiQuest project.

## 1. Project Overview

NatsukiQuest is a web-based, AI-powered role-playing game (RPG). It utilizes a Next.js frontend, a Genkit-based AI backend for dynamic storytelling and game mechanics, and a PostgreSQL database managed with Prisma. The game features an interactive narrative where player choices and actions influence the story, powered by advanced AI flows.

## 2. Core Technologies

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **AI**: [Genkit](https://firebase.google.com/docs/genkit)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Linting**: [ESLint](https://eslint.org/) (via `next lint`)
- **Type Checking**: [TypeScript](https://www.typescriptlang.org/) (`tsc`)

## 3. Getting Started & Key Commands

### 3.1. Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Database Setup**:
    - Ensure you have a local PostgreSQL instance running.
    - Create a `.env` file based on `.env.example` (if it exists) and configure your `DATABASE_URL`.
    - Run database migrations:
      ```bash
      npx prisma migrate dev # NOTE: This command requires user interaction and should be run manually.
      ```

### 3.2. Development

- **Run the web application**:
  ```bash
  npm run dev
  ```
  This starts the Next.js development server on `http://localhost:9002`.

- **Run the Genkit AI server**:
  ```bash
  npm run genkit:dev
  ```
  This starts the Genkit development server for testing and interacting with AI flows.

- **Run Genkit in watch mode**:
  ```bash
  npm run genkit:watch
  ```

### 3.3. Code Quality & Verification

- **Linting**:
  ```bash
  npm run lint
  ```
- **Type Checking**:
  ```bash
  npm run typecheck
  ```
- **Run all checks before committing**:
  ```bash
  npm run typecheck && npm run lint
  ```

### 3.4. Building for Production

- **Build the application**:
  ```bash
  npm run build
  ```
- **Start the production server**:
  ```bash
  npm run start
  ```

## 4. Project Structure

```
/
├── prisma/                 # Database schema and migrations
│   └── schema.prisma       # Main Prisma schema file
├── public/                 # Static assets
├── src/
│   ├── ai/                 # Genkit AI flows and configuration
│   │   ├── flows/          # Individual AI-powered game mechanics
│   │   └── genkit.ts       # Genkit plugin configuration
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── api/            # API routes (e.g., NextAuth)
│   │   └── (game)/         # Main game interface routes
│   ├── components/         # Reusable React components
│   │   ├── game/           # Components specific to the game UI
│   │   └── ui/             # Generic UI components (from shadcn/ui)
│   ├── contexts/           # React contexts (e.g., GameContext)
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Core utilities, auth, and types
│       ├── auth.ts         # Authentication configuration
│       ├── prisma.ts       # Prisma client instance
│       └── types.ts        # Core TypeScript types
├── next.config.ts          # Next.js configuration
└── package.json            # Project dependencies and scripts
```

## 5. Coding Conventions & Best Practices

### 5.1. TypeScript

- **Strict Typing**: Adhere to strict TypeScript rules. Use `any` as a last resort.
- **Type Definitions**: Define shared types in `src/lib/types.ts`. For component-specific props, define them within the component file.
- **ESM Imports**: Use ES Module `import`/`export` syntax.

### 5.2. React

- **Functional Components**: Use functional components with hooks.
- **Component Structure**:
    - Place reusable UI components in `src/components/ui`.
    - Place game-specific components in `src/components/game`.
    - Keep components small and focused on a single responsibility.
- **State Management**:
    - For simple, local state, use `useState` and `useReducer`.
    - For global game state, use the `GameContext` in `src/contexts/GameContext.tsx`.
- **Hooks**: Create custom hooks in `src/hooks` for reusable logic (e.g., `use-mobile.tsx`).

### 5.3. Styling

- **Tailwind CSS**: Use Tailwind CSS utility classes for all styling.
- **`clsx` and `tailwind-merge`**: Use the `cn` utility from `src/lib/utils.ts` to conditionally apply and merge Tailwind classes.
- **Component Variants**: Use `class-variance-authority` for components with multiple styles (see `src/components/ui/button.tsx` for an example).

### 5.4. Database

- **Schema Changes**: All database schema changes must be made in `prisma/schema.prisma`.
- **Migrations**: After modifying the schema, create a new migration file:
  ```bash
  npx prisma migrate dev --name <migration_name>
  ```
- **Database Client**: Use the singleton Prisma client instance from `src/lib/prisma.ts` for all database queries.

### 5.5. AI (Genkit)

- **Flows**: Each distinct AI capability should be implemented as a separate flow in `src/ai/flows/`.
- **Configuration**: Genkit plugins and tools are configured in `src/ai/genkit.ts`.
- **Development**: Use the Genkit developer UI (started with `npm run genkit:dev`) to test and debug flows.

### 5.6. Commits & Version Control

- **Commit Messages**: Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
- **Branching**: Use feature branches (e.g., `feat/new-inventory-system`, `fix/login-bug`).
- **Pull Requests**: All changes should be submitted via pull requests with clear descriptions. Ensure all checks (`lint`, `typecheck`) pass before requesting a review.

## 6. Deployment

The project is configured for deployment on Google Cloud App Hosting via the `apphosting.yaml` file. The `build` and `start` scripts in `package.json` are used by the hosting service.
