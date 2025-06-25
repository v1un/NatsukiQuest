# 🛠️ Development Guide

This guide covers coding standards, development workflow, and best practices for contributing to Natsuki Quest.

## Table of Contents

1. [Development Environment](#development-environment)
2. [Project Structure](#project-structure)
3. [Coding Standards](#coding-standards)
4. [AI Development Guidelines](#ai-development-guidelines)
5. [Testing Strategy](#testing-strategy)
6. [Development Workflow](#development-workflow)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)

## Development Environment

### Required Tools

- **Node.js**: 20.0.0 or higher
- **Package Manager**: pnpm (recommended), npm, or yarn
- **Editor**: VS Code (recommended) with extensions
- **Database**: PostgreSQL 12+
- **Git**: For version control

### Recommended VS Code Extensions

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    "Use custom class regex patterns for Tailwind IntelliSense"
  ]
}
```

## Project Structure

```
src/
├── ai/                     # AI flows and configuration
│   ├── genkit.ts          # Genkit setup
│   ├── dev.ts             # Development server
│   └── flows/             # AI flow definitions
├── app/                   # Next.js App Router
│   ├── actions.ts         # Server actions
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── api/               # API routes (NextAuth)
├── components/            # React components
│   ├── ui/                # Reusable UI components (Radix)
│   ├── game/              # Game-specific components
│   └── layout/            # Layout components
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
└── lib/                   # Utilities and configurations
    ├── auth.ts            # NextAuth configuration
    ├── prisma.ts          # Prisma client
    ├── types.ts           # TypeScript types
    └── utils.ts           # Utility functions
```

## Coding Standards

### TypeScript Guidelines

#### 1. Type Definitions

```typescript
// ✅ Good: Explicit interface definitions
interface GameState {
  narrative: string;
  choices: string[];
  characters: Character[];
}

// ❌ Bad: Any types
interface GameState {
  narrative: any;
  choices: any[];
}

// ✅ Good: Union types for constants
type GameStatus = 'playing' | 'paused' | 'game-over';

// ❌ Bad: String literals without constraints
type GameStatus = string;
```

#### 2. Function Signatures

```typescript
// ✅ Good: Clear input/output types
export async function makeChoice(
  currentState: GameState,
  choice: string
): Promise<GameState> {
  // ...
}

// ❌ Bad: Implicit any returns
export async function makeChoice(currentState, choice) {
  // ...
}
```

#### 3. Error Handling

```typescript
// ✅ Good: Specific error types
class GameError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_CHOICE' | 'AI_ERROR' | 'DATABASE_ERROR'
  ) {
    super(message);
    this.name = 'GameError';
  }
}

// ✅ Good: Type-safe error handling
try {
  const result = await makeChoice(state, choice);
  return result;
} catch (error) {
  if (error instanceof GameError) {
    console.error(`Game error [${error.code}]: ${error.message}`);
  }
  throw error;
}
```

### React Component Guidelines

#### 1. Component Structure

```typescript
// ✅ Good: Function component with proper typing
interface NarrativeDisplayProps {
  narrative: string;
  isLoading?: boolean;
  className?: string;
}

export function NarrativeDisplay({ 
  narrative, 
  isLoading = false, 
  className 
}: NarrativeDisplayProps) {
  // Component logic
  return (
    <div className={cn("narrative-container", className)}>
      {/* JSX */}
    </div>
  );
}
```

#### 2. Custom Hooks

```typescript
// ✅ Good: Custom hook for game state management
export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeChoice = useCallback(async (choice: string) => {
    if (!gameState) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newState = await makeChoiceAction(gameState, choice);
      setGameState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [gameState]);

  return {
    gameState,
    isLoading,
    error,
    makeChoice,
    // ... other methods
  };
}
```

#### 3. Component Composition

```typescript
// ✅ Good: Composable components
export function GameInterface() {
  const { gameState, isLoading, makeChoice } = useGameState();

  if (!gameState) {
    return <GameLoader />;
  }

  return (
    <div className="game-interface">
      <NarrativeDisplay 
        narrative={gameState.narrative} 
        isLoading={isLoading} 
      />
      <CharacterPanel characters={gameState.characters} />
      <ChoiceButtons 
        choices={gameState.choices} 
        onChoice={makeChoice}
        disabled={isLoading}
      />
    </div>
  );
}
```

### CSS and Styling Guidelines

#### 1. Tailwind CSS Best Practices

```typescript
// ✅ Good: Use cn() utility for conditional classes
import { cn } from '@/lib/utils';

export function Button({ variant, className, ...props }) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md font-medium transition-colors",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  );
}
```

#### 2. Custom CSS Variables

```css
/* globals.css */
:root {
  /* Re:Zero themed colors */
  --primary: 258 90% 30%;        /* Deep Indigo */
  --primary-foreground: 0 0% 98%;
  --accent: 285 85% 55%;         /* Vibrant Purple */
  --accent-foreground: 0 0% 98%;
  
  /* Game-specific variables */
  --narrative-max-width: 65ch;
  --choice-button-height: 3rem;
  --sidebar-width: 20rem;
}

/* Component-specific styles */
.narrative-text {
  font-family: 'Literata', serif;
  line-height: 1.8;
  font-size: 1.1rem;
}

.choice-button {
  @apply transition-all duration-200 hover:scale-105 active:scale-95;
}
```

#### 3. Responsive Design

```typescript
// ✅ Good: Mobile-first responsive design
export function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      min-h-screen bg-background
      grid grid-cols-1 lg:grid-cols-[1fr_300px]
      gap-4 p-4
    ">
      <main className="space-y-6">
        {children}
      </main>
      <aside className="
        order-first lg:order-last
        bg-card rounded-lg p-4
      ">
        <CharacterPanel />
      </aside>
    </div>
  );
}
```

## AI Development Guidelines

### 1. Prompt Engineering

```typescript
// ✅ Good: Structured prompt with clear instructions
const prompt = `You are the Game Master for Natsuki Quest.

**Core Directives:**
1. Advance the narrative based on player choice
2. Update character relationships appropriately
3. Maintain Re:Zero lore accuracy
4. Provide 2-4 meaningful choices

**Context:**
- Current situation: {{{currentNarrative}}}
- Player chose: "{{{playerChoice}}}"
- Character states: {{json characters}}

**Response Format:**
- Write engaging narrative (200-400 words)
- Update character affinities based on interactions
- Provide meaningful choices that advance the story`;
```

### 2. AI Flow Structure

```typescript
// ✅ Good: Consistent flow pattern
export async function createAIFlow<TInput, TOutput>(
  name: string,
  inputSchema: z.ZodSchema<TInput>,
  outputSchema: z.ZodSchema<TOutput>,
  promptTemplate: string
) {
  const prompt = ai.definePrompt({
    name: `${name}Prompt`,
    input: { schema: inputSchema },
    output: { schema: outputSchema },
    prompt: promptTemplate,
  });

  return ai.defineFlow(
    {
      name,
      inputSchema,
      outputSchema,
    },
    async (input: TInput) => {
      const { output } = await prompt(input);
      return output!;
    }
  );
}
```

### 3. Error Handling in AI Flows

```typescript
// ✅ Good: Robust error handling
export async function callAIFlow<T>(
  flowFn: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  try {
    return await flowFn();
  } catch (error) {
    console.error('AI flow error:', error);
    
    // Log for monitoring
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
    }
    
    return fallbackValue;
  }
}
```

## Testing Strategy

### 1. Unit Tests

```typescript
// Example: Component testing
import { render, screen, fireEvent } from '@testing-library/react';
import { ChoiceButtons } from '@/components/game/ChoiceButtons';

describe('ChoiceButtons', () => {
  const mockChoices = ['Approach carefully', 'Run away', 'Call for help'];
  const mockOnChoice = jest.fn();

  beforeEach(() => {
    mockOnChoice.mockClear();
  });

  test('renders all choices', () => {
    render(<ChoiceButtons choices={mockChoices} onChoice={mockOnChoice} />);
    
    mockChoices.forEach(choice => {
      expect(screen.getByText(choice)).toBeInTheDocument();
    });
  });

  test('calls onChoice when button clicked', () => {
    render(<ChoiceButtons choices={mockChoices} onChoice={mockOnChoice} />);
    
    fireEvent.click(screen.getByText('Approach carefully'));
    expect(mockOnChoice).toHaveBeenCalledWith('Approach carefully');
  });
});
```

### 2. Integration Tests

```typescript
// Example: Server action testing
import { makeChoice } from '@/app/actions';
import { initialGameState } from '@/lib/initial-game-state';

// Mock AI dependencies
jest.mock('@/ai/flows/ai-game-master');
jest.mock('@/ai/flows/advanced-lorebook');

describe('makeChoice integration', () => {
  test('processes choice and returns valid state', async () => {
    const mockState = {
      ...initialGameState,
      choices: ['Test choice'],
    };

    const result = await makeChoice(mockState, 'Test choice');

    expect(result).toMatchObject({
      narrative: expect.any(String),
      choices: expect.any(Array),
      characters: expect.any(Array),
    });
  });
});
```

### 3. AI Flow Testing

> **TODO**: Add example test data sets for consistent AI flow testing

```typescript
// Example: AI flow testing
import { aiGameMaster } from '@/ai/flows/ai-game-master';

describe('AI Game Master Flow', () => {
  test('generates valid response structure', async () => {
    const input = {
      playerChoice: 'Approach the mansion',
      currentNarrative: 'You stand before a grand manor...',
      characters: [],
      inventory: [],
      skills: [],
    };

    const result = await aiGameMaster(input);

    expect(result).toMatchObject({
      newNarrative: expect.any(String),
      newChoices: expect.arrayContaining([expect.any(String)]),
      updatedCharacters: expect.any(Array),
      isGameOver: expect.any(Boolean),
      lastOutcome: expect.any(String),
    });
  });
});
```

## Development Workflow

### 1. Feature Development Process

```bash
# 1. Create feature branch
git checkout -b feature/character-inventory-system

# 2. Implement feature with tests
# 3. Test locally
npm run dev
npm run test
npm run typecheck
npm run lint

# 4. Commit with conventional commits
git commit -m "feat: add character inventory management system"

# 5. Push and create PR
git push origin feature/character-inventory-system
```

### 2. Code Review Checklist

#### Before Submitting PR
- [ ] All tests pass
- [ ] TypeScript compilation successful
- [ ] ESLint/Prettier formatting applied
- [ ] AI flows tested in Genkit UI
- [ ] Database migrations tested
- [ ] README/docs updated if needed

#### Reviewing PRs
- [ ] Code follows established patterns
- [ ] Proper error handling implemented
- [ ] Types are well-defined
- [ ] Components are properly tested
- [ ] Performance considerations addressed
- [ ] Security implications reviewed

### 3. Debugging Tools

#### Next.js Development

```bash
# Enable debug mode
DEBUG=* npm run dev

# TypeScript checking
npm run typecheck

# Analyze bundle
npm run build -- --analyze
```

#### Genkit Debugging

```bash
# Start with debug logging
npm run genkit:dev -- --debug

# View request traces in UI
# http://localhost:4000
```

#### Database Debugging

```bash
# Prisma Studio
npx prisma studio

# Query logging
# Add to prisma client:
# log: ['query', 'info', 'warn', 'error']
```

## Performance Optimization

### 1. React Performance

```typescript
// ✅ Good: Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return processGameState(gameState);
}, [gameState]);

// ✅ Good: Memoize callbacks to prevent re-renders
const handleChoice = useCallback((choice: string) => {
  makeChoice(choice);
}, [makeChoice]);

// ✅ Good: Code splitting for heavy components
const CharacterDetailModal = lazy(() => import('./CharacterDetailModal'));
```

### 2. Bundle Optimization

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  webpack: (config) => {
    // Custom webpack optimizations
    return config;
  },
};
```

### 3. Database Performance

```typescript
// ✅ Good: Optimize queries with select
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    gameSaves: {
      select: {
        state: true,
        updatedAt: true,
      },
      take: 1,
      orderBy: { updatedAt: 'desc' },
    },
  },
});
```

## Troubleshooting

### Common Issues

#### 1. AI Flow Errors

```bash
# Check API key
echo $GOOGLE_API_KEY

# Verify Genkit installation
npm list genkit

# Check flow registration
npm run genkit:dev -- --list-flows
```

#### 2. Database Connection Issues

```bash
# Test connection
npx prisma db ping

# Reset database (development)
npx prisma migrate reset

# Generate client after schema changes
npx prisma generate
```

#### 3. Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
npm install

# Check TypeScript errors
npm run typecheck
```

### Debug Environment

Create `.env.local.debug`:

```bash
# Enable detailed logging
DEBUG=genkit:*,prisma:*
NEXT_PUBLIC_DEBUG=true
NODE_ENV=development

# AI debugging
GENKIT_DEBUG=true
GOOGLE_AI_DEBUG=true
```

## Code Style Configuration

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

## Related Documentation

- 🛠️ [Setup Guide](setup.md) - Getting started with local development
- 🏗️ [Architecture Overview](architecture.md) - Understanding the system design
- 🤖 [AI System](ai-system.md) - AI development and prompt engineering
- 🗄️ [Database Schema](database.md) - Database development practices
- 🔌 [API Documentation](api.md) - Server action development
- 🚀 [Deployment Guide](deployment.md) - Preparing for production

## Contributing Resources

- [GitHub Issues](https://github.com/yourusername/NatsukiQuest/issues) - Bug reports and feature requests
- [Discussion Forum](https://github.com/yourusername/NatsukiQuest/discussions) - Community discussions
- [Re:Zero Wiki](https://rezero.fandom.com/wiki/Re:Zero_Wiki) - Lore accuracy reference

---

This development guide ensures consistency, quality, and maintainability across the entire codebase while supporting both new contributors and experienced developers.