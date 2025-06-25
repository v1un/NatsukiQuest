# 🤖 AI System Documentation

This document details the AI-powered narrative generation system built with Firebase Genkit and Google Gemini AI.

## Table of Contents

1. [Overview](#overview)
2. [Genkit Configuration](#genkit-configuration)
3. [AI Flows Deep Dive](#ai-flows-deep-dive)
4. [Prompt Engineering Guidelines](#prompt-engineering-guidelines)
5. [Schema Validation with Zod](#schema-validation-with-zod)
6. [Model Configuration and Swapping](#model-configuration-and-swapping)
7. [Testing AI Flows](#testing-ai-flows)
8. [Performance Optimization](#performance-optimization)
9. [Extending the AI System](#extending-the-ai-system)
10. [Troubleshooting](#troubleshooting)

## Overview

Natsuki Quest uses a sophisticated AI system to create dynamic, contextually-aware narratives that respond to player choices while maintaining consistency with Re:Zero lore.

### Core AI Components

```
src/ai/
├── genkit.ts                 # Genkit configuration
├── dev.ts                    # Development server entry
└── flows/
    ├── ai-game-master.ts     # Main narrative generation
    ├── advanced-lorebook.ts  # Contextual lore injection
    ├── return-by-death.ts    # Death/revival mechanics
    ├── memory-system.ts      # Long-term memory management
    ├── dynamic-narrative.ts  # Adaptive storytelling
    └── adaptive-encounters.ts # Dynamic encounter generation
```

## Genkit Configuration

### Basic Setup

```typescript
// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
```

### Development Server

```typescript
// src/ai/dev.ts
import { startFlows } from 'genkit';
import './flows/ai-game-master';
import './flows/advanced-lorebook';
import './flows/return-by-death';
// ... other flows

startFlows();
```

**Access**: `http://localhost:4000` when running `npm run genkit:dev`

## AI Flows Deep Dive

### 1. AI Game Master Flow

**Purpose**: Primary narrative generation and game state management

```typescript
// Input Schema
const AiGameMasterInputSchema = z.object({
  playerChoice: z.string(),
  currentNarrative: z.string(),
  characters: z.array(CharacterSchema),
  inventory: z.array(ItemSchema),
  skills: z.array(SkillSchema),
  memory: z.string().optional(),
  injectedLore: z.string().optional(),
});

// Output Schema
const AiGameMasterOutputSchema = z.object({
  newNarrative: z.string(),
  newChoices: z.array(z.string()).min(1).max(4),
  updatedCharacters: z.array(CharacterSchema),
  updatedInventory: z.array(ItemSchema).optional(),
  isGameOver: z.boolean(),
  lastOutcome: z.string(),
});
```

#### Prompt Engineering

The AI Game Master uses a comprehensive prompt template:

```typescript
const prompt = `You are the ultimate Game Master for "Natsuki Quest: A Re:Zero Adventure". 

**Core Directives:**
1. **Advance the Narrative:** Write engaging, lore-accurate story progression
2. **Manage Characters:** Update affinities, statuses, introduce new characters
3. **Manage Encounters:** Create challenges, grant/remove items
4. **Determine Fate:** Decide if choices lead to death/game over
5. **Provide Choices:** Offer 1-4 compelling next actions

**Game Context:**
- Previous Narrative: {{{currentNarrative}}}
- Player's Choice: "{{{playerChoice}}}"
- Memory: {{{memory}}}
- Relevant Lore: {{{injectedLore}}}

**Current State:**
- Characters: {{json characters}}
- Inventory: {{json inventory}}
- Skills: {{json skills}}
`;
```

#### Character Management

The AI has full control over character relationships:

```typescript
interface Character {
  name: string;
  affinity: number;      // 0-100 relationship level
  status: string;        // Current status/mood
  description: string;   // Physical/personality description
  avatar: string;        // Placeholder avatar URL
}
```

**Character Update Logic**:
- AI automatically adjusts affinity based on player choices
- New characters are introduced organically
- Status reflects current emotional state or situation
- Complete character list is returned with each update

### 2. Advanced Lorebook System

**Purpose**: Contextual lore injection based on current game situation

```typescript
// Flow Process
1. Extract keywords from current game situation
2. Match keywords to relevant lore database
3. Inject contextual information into narrative
4. Return enriched narrative context
```

#### Keyword Extraction

```typescript
const extractKeywordsPrompt = `Analyze the game situation and extract relevant keywords:

Game Situation: {{{gameSituation}}}

Return keywords that could trigger lore information about:
- Locations (Roswaal Manor, Royal Capital, etc.)
- Characters (Emilia, Rem, Ram, Beatrice, etc.)
- Magic/Abilities (Return by Death, Spirit Arts, etc.)
- Events (Royal Selection, Witch Cult, etc.)
`;
```

#### Lore Database Structure

```typescript
const RE_ZERO_LORE = {
  locations: {
    "roswaal_manor": "A grand mansion in the countryside...",
    "royal_capital": "The heart of the Kingdom of Lugunica...",
  },
  characters: {
    "emilia": "A half-elf with silver hair and violet eyes...",
    "rem": "A blue-haired oni maid who serves at Roswaal Manor...",
  },
  concepts: {
    "return_by_death": "Subaru's mysterious ability to return from death...",
    "royal_selection": "The process to choose the next ruler...",
  }
};
```

### 3. Return by Death Flow

**Purpose**: Handle death scenarios and checkpoint revival

```typescript
const ReturnByDeathInputSchema = z.object({
  scenarioDescription: z.string(),
  playerChoices: z.array(z.string()),
  outcome: z.string(),
});

const ReturnByDeathOutputSchema = z.object({
  newScenario: z.string(),
  availableChoices: z.array(z.string()),
  revealedInformation: z.string().optional(),
});
```

#### Prompt Strategy

```typescript
const prompt = `Subaru has experienced Return by Death. Create a narrative that:

1. **Acknowledges the Loop**: Reference the pain and trauma of death
2. **Maintains Continuity**: The world has reset, but Subaru remembers
3. **Provides Hints**: Subtle clues based on previous loop knowledge
4. **Creates Tension**: The urgency of avoiding the same fate

Previous Scenario: {{{scenarioDescription}}}
Death Outcome: {{{outcome}}}

Generate a scenario that feels both familiar and different, with Subaru having 
knowledge from the previous loop while the world remains unchanged.
`;
```

### 4. Memory System

**Purpose**: Long-term memory management and continuity

```typescript
interface MemoryEntry {
  timestamp: Date;
  event: string;
  importance: number;    // 1-10 scale
  characters: string[];  // Associated characters
  location?: string;     // Where it happened
}
```

#### Memory Compression Algorithm

```typescript
function compressMemory(memory: string, maxLength: number = 2000): string {
  if (memory.length <= maxLength) return memory;
  
  // Priority: Recent events > Important events > Character interactions
  const lines = memory.split('\n');
  const prioritized = prioritizeMemoryLines(lines);
  
  return prioritized
    .slice(0, maxLength / 50)  // Rough line count
    .join('\n');
}
```

## Prompt Engineering Guidelines

### 1. Consistent Voice and Tone

**Re:Zero Narrative Style**:
- Dark fantasy with moments of hope
- Internal monologue focus
- Detailed environmental descriptions
- Character-driven emotional beats

### 2. Choice Generation Principles

**Good Choices**:
```typescript
// ✅ Specific and actionable
"Approach Rem cautiously and ask about her sister"

// ✅ Clear consequences implied
"Use your knowledge from the previous loop to warn Emilia"

// ✅ Character-appropriate
"Rely on your determination to push through the fear"
```

**Poor Choices**:
```typescript
// ❌ Too vague
"Do something"

// ❌ Out of character
"Use magic you don't have"

// ❌ Breaking narrative consistency
"Ignore the Re:Zero world rules"
```

### 3. Character Consistency

**Affinity System Guidelines**:
- Small actions: ±1-3 points
- Significant choices: ±5-10 points
- Major story beats: ±10-20 points
- Never exceed 0-100 bounds

**Status Updates**:
- Reflect immediate emotional state
- Consider recent player interactions
- Maintain character personality
- Use evocative, brief descriptions

## Schema Validation with Zod

### Type Safety Benefits

```typescript
// Compile-time type checking
type GameMasterInput = z.infer<typeof AiGameMasterInputSchema>;
type GameMasterOutput = z.infer<typeof AiGameMasterOutputSchema>;

// Runtime validation
const validatedInput = AiGameMasterInputSchema.parse(userInput);
const validatedOutput = AiGameMasterOutputSchema.parse(aiResponse);
```

### Error Handling

```typescript
try {
  const result = await aiGameMaster(input);
  return AiGameMasterOutputSchema.parse(result);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('AI response validation failed:', error.errors);
    return fallbackResponse();
  }
  throw error;
}
```

## Model Configuration and Swapping

### Current Model: Gemini 2.0 Flash

**Characteristics**:
- Fast response times (2-4 seconds)
- Good instruction following
- Strong creative writing capabilities
- Effective with structured outputs

### Switching Models

```typescript
// Update genkit.ts
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-pro',  // Alternative model
});

// Or use multiple models
const creativeAi = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

const analyticalAi = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-pro',
});
```

### Model Comparison

| Model | Speed | Creativity | Accuracy | Cost |
|-------|-------|------------|----------|------|
| Gemini 2.0 Flash | Fast | High | Good | Low |
| Gemini 1.5 Pro | Medium | Medium | High | Medium |
| GPT-4 (via plugin) | Slow | High | High | High |

## Testing AI Flows

### Genkit UI Testing

> **TODO**: Add screenshots of Genkit UI showing flow testing interface

1. Start development server: `npm run genkit:dev`
2. Navigate to `http://localhost:4000`
3. Select flow to test
4. Input test data
5. Examine output and prompt traces

### Unit Testing Flows

```typescript
// Example test for AI Game Master
describe('aiGameMaster', () => {
  test('generates valid narrative response', async () => {
    const input = {
      playerChoice: "Approach the mansion",
      currentNarrative: "You stand before Roswaal Manor...",
      characters: [],
      inventory: [],
      skills: [],
    };
    
    const result = await aiGameMaster(input);
    
    expect(result.newNarrative).toBeTruthy();
    expect(result.newChoices.length).toBeGreaterThan(0);
    expect(result.newChoices.length).toBeLessThanOrEqual(4);
  });
});
```

## Performance Optimization

### Response Time Optimization

```typescript
// Parallel lore fetching
const [aiResponse, loreContext] = await Promise.all([
  aiGameMaster(baseInput),
  fetchAndInjectLore(loreInput)
]);
```

### Token Usage Monitoring

```typescript
// Track token usage for cost optimization
const response = await ai.generateText({
  prompt: gamePrompt,
  config: {
    maxOutputTokens: 1000,  // Limit response length
    temperature: 0.7,       // Balance creativity vs consistency
  }
});
```

## Extending the AI System

### Adding New Flows

1. Create new flow file in `src/ai/flows/`
2. Define input/output schemas with Zod
3. Create prompt template
4. Implement flow logic
5. Export and import in `dev.ts`
6. Add to server actions as needed

### Example: Quest Generation Flow

```typescript
// src/ai/flows/quest-generator.ts
const QuestInputSchema = z.object({
  currentLocation: z.string(),
  playerLevel: z.number(),
  completedQuests: z.array(z.string()),
});

const QuestOutputSchema = z.object({
  questTitle: z.string(),
  questDescription: z.string(),
  objectives: z.array(z.string()),
  rewards: z.array(ItemSchema),
});

export const questGenerator = ai.defineFlow(
  {
    name: 'questGenerator',
    inputSchema: QuestInputSchema,
    outputSchema: QuestOutputSchema,
  },
  async (input) => {
    const prompt = `Generate a Re:Zero appropriate quest...`;
    const { output } = await ai.generate({ prompt, input });
    return output;
  }
);
```

## Troubleshooting

### Common Issues

1. **API Key Errors**: Verify GOOGLE_API_KEY in environment
2. **Schema Validation Failures**: Check AI response format
3. **Timeout Errors**: Increase request timeout or reduce prompt complexity
4. **Inconsistent Responses**: Adjust temperature or add more specific instructions

### Debug Mode

```bash
# Enable verbose logging
GENKIT_DEBUG=true npm run genkit:dev

# Check AI request/response logs
tail -f ~/.genkit/logs/genkit.log
```

## Related Documentation

- 🏗️ [Architecture Overview](architecture.md) - System design and component relationships
- 🔌 [API Documentation](api.md) - How AI flows integrate with server actions
- 🛠️ [Setup Guide](setup.md) - Configuring Genkit and Google AI locally
- 👩‍💻 [Development Guide](development.md) - AI development workflow and testing
- 🚀 [Deployment Guide](deployment.md) - Production AI configuration

## External Resources

- [Firebase Genkit Documentation](https://firebase.google.com/docs/genkit) - Official Genkit docs
- [Google AI Studio](https://makersuite.google.com/) - API key management and testing
- [Zod Documentation](https://zod.dev/) - Schema validation library

---

The AI system is designed to be modular and extensible. Each flow serves a specific purpose while maintaining consistency across the entire narrative experience.