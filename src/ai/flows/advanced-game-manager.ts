// src/ai/flows/advanced-game-manager.ts
'use server';
/**
 * @fileOverview Advanced Game Manager flow for handling complex game systems
 * like reputation management, quest generation, relationship conflicts, and
 * environmental storytelling.
 * 
 * This flow specializes in the deeper game mechanics while the main AI Game Master
 * handles narrative and basic interactions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { advancedGameTools, generateProceduralQuest } from '@/ai/tools';
import type { GameState, Quest, Reputation, RelationshipConflict } from '@/lib/types';

const AdvancedGameManagerInputSchema = z.object({
  userId: z.string().describe('The user ID for database operations'),
  action: z.enum([
    'GENERATE_QUEST',
    'MANAGE_REPUTATION', 
    'RESOLVE_CONFLICT',
    'ADD_ENVIRONMENTAL_DETAIL',
    'DISCOVER_LORE',
    'AUTO_MANAGE'
  ]).describe('The type of advanced action to perform'),
  gameState: z.object({
    currentLocation: z.string(),
    characters: z.array(z.any()),
    reputations: z.array(z.any()),
    activeQuests: z.array(z.any()),
    relationshipConflicts: z.array(z.any()),
    discoveredLore: z.array(z.string()),
  }).describe('Current game state context'),
  context: z.object({
    playerChoice: z.string().optional(),
    narrative: z.string().optional(),
    targetCharacter: z.string().optional(),
    targetFaction: z.string().optional(),
    questType: z.string().optional(),
    conflictType: z.string().optional(),
  }).optional().describe('Additional context for the action'),
});

const AdvancedGameManagerOutputSchema = z.object({
  success: z.boolean().describe('Whether the operation was successful'),
  message: z.string().describe('Result message for the player'),
  gameStateUpdates: z.object({
    newQuests: z.array(z.any()).optional(),
    reputationChanges: z.array(z.any()).optional(),
    resolvedConflicts: z.array(z.string()).optional(),
    discoveredLore: z.array(z.string()).optional(),
    environmentalUpdates: z.array(z.any()).optional(),
  }).optional().describe('Updates to apply to the game state'),
  narrativeImpact: z.string().optional().describe('How this affects the ongoing story'),
});

const advancedGameManagerPrompt = ai.definePrompt(
  {
    name: 'advancedGameManager',
  },
  `
You are the Advanced Game Manager for NatsukiQuest, a Re:Zero-inspired adventure game. Your role is to handle complex game mechanics and systems that create a rich, interconnected gameplay experience.

## Your Responsibilities:

### Quest Generation
- Create contextually appropriate side quests based on player progress, relationships, and world state
- Ensure quests feel meaningful and connected to the main narrative
- Balance difficulty and rewards appropriately

### Reputation Management  
- Track and update faction standings based on player actions
- Create meaningful consequences for reputation changes
- Suggest story beats that acknowledge reputation levels

### Relationship Conflicts
- Identify when character relationships create tension or conflict
- Resolve conflicts based on player choices and actions
- Create dramatic moments that affect multiple characters

### Environmental Storytelling
- Add discoverable details that enhance world-building
- Connect environmental elements to lore, quests, and character development
- Create immersive moments of discovery

### Lore Management
- Determine when lore should be discovered based on player actions
- Ensure lore discoveries feel earned and meaningful
- Connect new lore to existing knowledge

## Current Situation:
Action Type: {{action}}
Current Location: {{gameState.currentLocation}}
Active Quests: {{gameState.activeQuests.length}}
Known Factions: {{gameState.reputations.length}}
Active Conflicts: {{gameState.relationshipConflicts.length}}

{{#if context}}
Player Context:
{{#if context.playerChoice}}Player Choice: {{context.playerChoice}}{{/if}}
{{#if context.narrative}}Current Narrative: {{context.narrative}}{{/if}}
{{#if context.targetCharacter}}Target Character: {{context.targetCharacter}}{{/if}}
{{#if context.targetFaction}}Target Faction: {{context.targetFaction}}{{/if}}
{{/if}}

## Instructions:
Based on the action type and current game state, use the appropriate tools to:

1. **For GENERATE_QUEST**: Create a meaningful side quest that fits the current context
2. **For MANAGE_REPUTATION**: Update faction standings and create appropriate consequences  
3. **For RESOLVE_CONFLICT**: Handle relationship conflicts based on player actions
4. **For ADD_ENVIRONMENTAL_DETAIL**: Add discoverable story elements to the current location
5. **For DISCOVER_LORE**: Unlock lore entries and connect them to the ongoing narrative
6. **For AUTO_MANAGE**: Analyze the current state and automatically perform needed management

Always consider:
- How your actions affect the overall narrative
- Whether changes feel natural and earned
- The interconnected nature of all game systems
- Player agency and meaningful choice consequences

Use the available tools to implement your decisions and provide clear feedback about what has changed in the game world.
`
);

export const advancedGameManager = ai.defineFlow(
  {
    name: 'advancedGameManager',
    inputSchema: AdvancedGameManagerInputSchema,
    outputSchema: AdvancedGameManagerOutputSchema,
  },
  async (input) => {
    const { output } = await advancedGameManagerPrompt(input, {
      tools: [...advancedGameTools, generateProceduralQuest],
      maxTurns: 5,
    });
    return output!;
  }
);

// Helper function for common quest generation scenarios
export const generateContextualQuest = async (
  userId: string,
  gameState: GameState,
  questType?: 'ROMANCE' | 'FACTION' | 'EXPLORATION' | 'SIDE' | 'AUTO',
  targetCharacter?: string
) => {
  return await advancedGameManager({
    userId,
    action: 'GENERATE_QUEST',
    gameState: {
      currentLocation: gameState.currentLocation,
      characters: gameState.characters,
      reputations: gameState.reputations,
      activeQuests: gameState.activeQuests,
      relationshipConflicts: gameState.relationshipConflicts,
      discoveredLore: gameState.discoveredLore,
    },
    context: {
      questType: questType || 'AUTO',
      targetCharacter,
    },
  });
};

// Helper function for reputation management
export const manageReputation = async (
  userId: string,
  gameState: GameState,
  faction: string,
  change: number,
  reason: string
) => {
  return await advancedGameManager({
    userId,
    action: 'MANAGE_REPUTATION',
    gameState: {
      currentLocation: gameState.currentLocation,
      characters: gameState.characters,
      reputations: gameState.reputations,
      activeQuests: gameState.activeQuests,
      relationshipConflicts: gameState.relationshipConflicts,
      discoveredLore: gameState.discoveredLore,
    },
    context: {
      targetFaction: faction,
      narrative: `Reputation change: ${change > 0 ? '+' : ''}${change} with ${faction} - ${reason}`,
    },
  });
};

// Helper function for conflict resolution
export const resolveConflict = async (
  userId: string,
  gameState: GameState,
  conflictId: string,
  playerAction: string
) => {
  return await advancedGameManager({
    userId,
    action: 'RESOLVE_CONFLICT',
    gameState: {
      currentLocation: gameState.currentLocation,
      characters: gameState.characters,
      reputations: gameState.reputations,
      activeQuests: gameState.activeQuests,
      relationshipConflicts: gameState.relationshipConflicts,
      discoveredLore: gameState.discoveredLore,
    },
    context: {
      playerChoice: playerAction,
      conflictType: conflictId,
    },
  });
};