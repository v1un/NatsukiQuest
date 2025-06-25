# 🔌 API Documentation

This document details the server actions, authentication, and data flow patterns for Natsuki Quest's API layer.

## Overview

Natsuki Quest uses Next.js Server Actions for type-safe client-server communication. All game logic is handled server-side to ensure security and consistency.

## Server Actions

All server actions are located in `src/app/actions.ts` and are marked with `'use server'` directive.

### Authentication Middleware

All game actions require user authentication:

```typescript
import { auth } from '@/lib/auth';

// Example pattern used in all actions
export async function protectedAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Authentication required');
  }
  // ... action logic
}
```

## Game Actions API

### 1. Start New Game

**Function**: `startNewGame()`

**Purpose**: Initialize a new game session with the default starting state

**Authentication**: Not required (stateless)

**Input**: None

**Output**: `Promise<GameState>`

```typescript
export async function startNewGame(): Promise<GameState> {
  const newGame = { 
    ...initialGameState, 
    checkpoint: { 
      ...initialGameState, 
      checkpoint: null, 
      memory: "" 
    }, 
    memory: "" 
  };
  return newGame;
}
```

**Example Usage**:
```typescript
// In React component
const handleNewGame = async () => {
  const newState = await startNewGame();
  setGameState(newState);
};
```

**Response Structure**:
```typescript
interface GameState {
  narrative: string;           // Opening story text
  choices: string[];          // Initial available choices
  characters: Character[];    // Starting characters list
  inventory: Item[];          // Empty starting inventory
  skills: Skill[];           // Starting skills
  currentLoop: number;        // Starts at 1
  isGameOver: boolean;        // Always false for new game
  checkpoint: GameState | null; // Initially null
  lastOutcome: string;        // Empty string
  memory: string;             // Empty string
}
```

### 2. Make Choice

**Function**: `makeChoice(currentState: GameState, choice: string)`

**Purpose**: Process a player's choice and generate the next game state

**Authentication**: Not required (stateless)

**Input**: 
- `currentState`: Current game state
- `choice`: Player's selected choice string

**Output**: `Promise<GameState>`

```typescript
export async function makeChoice(
  currentState: GameState,
  choice: string
): Promise<GameState> {
  try {
    // 1. Fetch contextual lore
    const loreContext = await fetchAndInjectLore({
      gameSituation: `Previous: ${currentState.narrative}\nChoice: ${choice}`,
      existingNarrativeContext: currentState.narrative,
    });

    // 2. Process through AI Game Master
    const aiResponse = await aiGameMaster({
      playerChoice: choice,
      currentNarrative: currentState.narrative,
      characters: currentState.characters,
      inventory: currentState.inventory,
      skills: currentState.skills,
      memory: currentState.memory,
      injectedLore: loreContext.updatedNarrativeContext,
    });
    
    // 3. Update memory and construct new state
    const newMemory = `${currentState.memory}\n- Chose '${choice}': ${aiResponse.lastOutcome}`;

    return {
      ...currentState,
      narrative: aiResponse.newNarrative,
      choices: aiResponse.newChoices,
      characters: aiResponse.updatedCharacters,
      inventory: aiResponse.updatedInventory ?? currentState.inventory,
      isGameOver: aiResponse.isGameOver,
      lastOutcome: aiResponse.lastOutcome,
      memory: newMemory.slice(-2000), // Limit memory size
    };

  } catch (error) {
    // Graceful error handling
    return {
      ...currentState,
      narrative: currentState.narrative + "\n\n[Error occurred. Try different choice.]",
      choices: currentState.choices.length > 0 ? currentState.choices : ["Try again"],
    };
  }
}
```

**Example Usage**:
```typescript
// In React component
const handleChoice = async (choice: string) => {
  setIsLoading(true);
  try {
    const newState = await makeChoice(gameState, choice);
    setGameState(newState);
  } catch (error) {
    console.error('Choice processing failed:', error);
  } finally {
    setIsLoading(false);
  }
};
```

**AI Integration Flow**:
1. **Lore Injection**: Contextual information added based on current situation
2. **AI Processing**: Gemini AI generates narrative response
3. **State Updates**: Characters, inventory, and game flags updated
4. **Memory Management**: Event history compressed and stored

### 3. Trigger Return by Death

**Function**: `triggerReturnByDeath(currentState: GameState)`

**Purpose**: Handle death scenarios and revert to last checkpoint

**Authentication**: Not required (stateless)

**Input**: 
- `currentState`: Current game state (usually in game over condition)

**Output**: `Promise<GameState>`

```typescript
export async function triggerReturnByDeath(
  currentState: GameState
): Promise<GameState> {
  try {
    // Use checkpoint or initial state as fallback
    const checkpoint = currentState.checkpoint || initialGameState;

    // Generate rewind narrative
    const aiResponse = await returnByDeath({
      scenarioDescription: checkpoint.narrative,
      playerChoices: [], // Not tracked yet
      outcome: currentState.lastOutcome || "Subaru met a terrible fate.",
    });

    return {
      ...checkpoint, // Restore checkpoint state
      narrative: aiResponse.newScenario,
      choices: aiResponse.availableChoices,
      currentLoop: currentState.currentLoop + 1,
      isGameOver: false,
      // Retain death memory
      memory: checkpoint.memory + `\n[Loop #${currentState.currentLoop} Failed: ${currentState.lastOutcome}]`,
    };
  } catch (error) {
    // Fallback to checkpoint with error message
    return {
      ...(currentState.checkpoint || initialGameState),
      currentLoop: currentState.currentLoop + 1,
      isGameOver: false,
      narrative: (currentState.checkpoint?.narrative || initialGameState.narrative) + 
                "\n\n[Painful rewind... You are back at your last checkpoint.]"
    };
  }
}
```

**Example Usage**:
```typescript
// In React component
const handleReturnByDeath = async () => {
  if (gameState.isGameOver) {
    const rewindState = await triggerReturnByDeath(gameState);
    setGameState(rewindState);
  }
};
```

**Return by Death Mechanics**:
- **Checkpoint Restoration**: Game state reverts to last checkpoint
- **Memory Retention**: Subaru remembers the failed loop
- **Loop Counter**: Tracks number of deaths/rewinds
- **Narrative Adaptation**: AI generates contextual rewind story

### 4. Save Game

**Function**: `saveGame(gameState: GameState)`

**Purpose**: Persist current game state to database

**Authentication**: **Required** - User must be logged in

**Input**: 
- `gameState`: Current game state to save

**Output**: `Promise<{ success: boolean; message: string }>`

```typescript
export async function saveGame(gameState: GameState): Promise<{ success: boolean; message: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: 'You must be logged in to save the game.' };
    }
    
    try {
        // Upsert pattern - create or update save slot
        await prisma.gameSave.upsert({
            where: { userId: session.user.id },
            update: { state: gameState },
            create: {
                userId: session.user.id,
                state: gameState,
            }
        });
        return { success: true, message: 'Game saved successfully!' };
    } catch (error) {
        console.error('Error saving game:', error);
        return { success: false, message: 'Failed to save the game.' };
    }
}
```

**Example Usage**:
```typescript
// In React component
const handleSaveGame = async () => {
  const result = await saveGame(gameState);
  if (result.success) {
    toast.success(result.message);
  } else {
    toast.error(result.message);
  }
};
```

**Save Behavior**:
- **Single Save Slot**: One save per user (overwrites existing)
- **Automatic Timestamps**: Database tracks creation/update time
- **JSON Storage**: Complete game state serialized to JSON
- **Cascading Deletes**: Save deleted if user account deleted

### 5. Load Most Recent Game

**Function**: `loadMostRecentGame()`

**Purpose**: Retrieve user's saved game state from database

**Authentication**: **Required** - User must be logged in

**Input**: None (uses session user ID)

**Output**: `Promise<GameState | null>`

```typescript
export async function loadMostRecentGame(): Promise<GameState | null> {
    const session = await auth();
    if (!session?.user?.id) {
        console.log("No session found, cannot load game.");
        return null;
    }

    try {
        const savedGame = await prisma.gameSave.findUnique({
            where: { userId: session.user.id },
        });

        if (savedGame && savedGame.state) {
            // Cast JsonValue to GameState
            return savedGame.state as unknown as GameState;
        }
        return null;
    } catch (error) {
        console.error('Error loading game:', error);
        return null;
    }
}
```

**Example Usage**:
```typescript
// In React component
const handleLoadGame = async () => {
  const loadedState = await loadMostRecentGame();
  if (loadedState) {
    setGameState(loadedState);
    toast.success('Game loaded successfully!');
  } else {
    toast.error('No saved game found.');
  }
};
```

**Load Behavior**:
- **User Isolation**: Only loads saves for authenticated user
- **Type Safety**: Prisma JSON cast to GameState interface
- **Null Handling**: Returns null if no save exists
- **Error Recovery**: Graceful handling of database errors

## Type Definitions

### Core Game Types

```typescript
// src/lib/types.ts
export interface Character {
  name: string;
  affinity: number;     // 0-100 relationship level
  status: string;       // Current emotional/physical state
  description: string;  // Character description
  avatar: string;       // Placeholder image URL
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;         // Lucide React icon name
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;         // Lucide React icon name
}

export interface GameState {
  narrative: string;           // Current story text
  choices: string[];          // Available player choices
  characters: Character[];    // All characters and relationships
  inventory: Item[];          // Player's items
  skills: Skill[];           // Player's abilities
  currentLoop: number;        // Return by Death counter
  isGameOver: boolean;        // Death/ending state
  checkpoint: GameState | null; // Saved checkpoint for Return by Death
  lastOutcome: string;        // Result of last choice
  memory: string;             // Compressed event history
}
```

### Action Response Types

```typescript
// Save/Load responses
interface SaveResponse {
  success: boolean;
  message: string;
}

interface LoadResponse {
  gameState: GameState | null;
}

// Error handling
interface ActionError {
  error: string;
  code: 'AUTH_REQUIRED' | 'VALIDATION_ERROR' | 'SERVER_ERROR';
}
```

## Error Handling

### Client-Side Error Handling

```typescript
// Recommended pattern for calling server actions
async function callServerAction<T>(
  action: () => Promise<T>,
  onSuccess?: (result: T) => void,
  onError?: (error: Error) => void
) {
  try {
    const result = await action();
    onSuccess?.(result);
    return result;
  } catch (error) {
    console.error('Server action failed:', error);
    onError?.(error instanceof Error ? error : new Error('Unknown error'));
    throw error;
  }
}

// Usage
await callServerAction(
  () => makeChoice(gameState, selectedChoice),
  (newState) => setGameState(newState),
  (error) => toast.error(error.message)
);
```

### Server-Side Error Handling

```typescript
// Error wrapper for server actions
function withErrorHandling<T extends any[], R>(
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await action(...args);
    } catch (error) {
      console.error('Server action error:', error);
      
      // Different error types
      if (error instanceof z.ZodError) {
        throw new Error('Invalid input data');
      }
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new Error('Database operation failed');
      }
      
      throw new Error('Internal server error');
    }
  };
}
```

## Performance Considerations

### Response Time Optimization

- **AI Requests**: 2-4 seconds average (Gemini 2.0 Flash)
- **Database Operations**: <100ms for typical queries
- **Memory Management**: Automatic compression of game memory

### Caching Strategy

```typescript
// Example: Cache initial game state
let cachedInitialState: GameState | null = null;

export async function startNewGame(): Promise<GameState> {
  if (!cachedInitialState) {
    cachedInitialState = { ...initialGameState /* ... */ };
  }
  return { ...cachedInitialState };
}
```

### Rate Limiting (Future Enhancement)

```typescript
// TODO: Implement rate limiting for AI-intensive actions
const rateLimiter = new Map<string, number>();

export async function makeChoice(currentState: GameState, choice: string) {
  const userId = (await auth())?.user?.id;
  if (userId) {
    const lastCall = rateLimiter.get(userId) || 0;
    if (Date.now() - lastCall < 5000) { // 5 second cooldown
      throw new Error('Please wait before making another choice');
    }
    rateLimiter.set(userId, Date.now());
  }
  
  // ... rest of action
}
```

## Security Measures

### Input Validation

```typescript
// Validate choice is from available options
export async function makeChoice(currentState: GameState, choice: string) {
  if (!currentState.choices.includes(choice)) {
    throw new Error('Invalid choice selected');
  }
  // ... continue processing
}
```

### Authentication Checks

```typescript
// Consistent auth pattern
async function requireAuth(): Promise<{ userId: string; user: User }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Authentication required');
  }
  return { userId: session.user.id, user: session.user };
}
```

### Data Sanitization

```typescript
// Sanitize game state before saving
function sanitizeGameState(state: GameState): GameState {
  return {
    ...state,
    narrative: state.narrative.slice(0, 10000), // Limit narrative length
    memory: state.memory.slice(0, 2000),        // Limit memory size
    choices: state.choices.slice(0, 4),         // Max 4 choices
  };
}
```

## API Testing

### Unit Tests

```typescript
// Example test for makeChoice action
import { makeChoice } from '@/app/actions';
import { initialGameState } from '@/lib/initial-game-state';

describe('makeChoice', () => {
  test('processes valid choice', async () => {
    const mockState = {
      ...initialGameState,
      choices: ['Approach the mansion', 'Walk away'],
    };
    
    const result = await makeChoice(mockState, 'Approach the mansion');
    
    expect(result.narrative).toBeTruthy();
    expect(result.choices.length).toBeGreaterThan(0);
    expect(result.lastOutcome).toBeTruthy();
  });
  
  test('handles invalid choice gracefully', async () => {
    const mockState = {
      ...initialGameState,
      choices: ['Valid choice'],
    };
    
    await expect(makeChoice(mockState, 'Invalid choice')).rejects.toThrow();
  });
});
```

### Integration Tests

```typescript
// Test full game flow
describe('Game Flow Integration', () => {
  test('complete game cycle', async () => {
    // 1. Start new game
    const newGame = await startNewGame();
    expect(newGame.currentLoop).toBe(1);
    
    // 2. Make choice
    const afterChoice = await makeChoice(newGame, newGame.choices[0]);
    expect(afterChoice.narrative).not.toBe(newGame.narrative);
    
    // 3. Save game (requires auth mock)
    // 4. Load game (requires auth mock)
    // 5. Return by death (if applicable)
  });
});
```

## Related Documentation

- 🏗️ [Architecture Overview](architecture.md) - How server actions fit into the system architecture
- 🤖 [AI System](ai-system.md) - AI flows called by server actions
- 🗄️ [Database Schema](database.md) - Data models used in API responses
- 👩‍💻 [Development Guide](development.md) - API development and testing practices
- 🛠️ [Setup Guide](setup.md) - Local API development setup

## Type Definitions Reference

All TypeScript interfaces are defined in:
- [`src/lib/types.ts`](../src/lib/types.ts) - Core game types
- `src/ai/flows/` - AI flow input/output schemas
- [`@prisma/client`](../prisma/schema.prisma) - Database model types

---

This API design prioritizes type safety, error handling, and maintainability while providing a clean interface for the AI-powered narrative system.