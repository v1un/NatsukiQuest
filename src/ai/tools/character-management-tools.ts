// src/ai/tools/character-management-tools.ts
/**
 * @fileOverview Character management tools for the AI Game Master.
 * Provides functionality to track characters dynamically as they're encountered,
 * manage relationships, and handle location-based character interactions.
 */

import { ai } from '@/ai/genkit';
import { prisma } from '@/lib/prisma';
import { z } from 'genkit';
import type { Character, CharacterBond } from '@/lib/types';

// ============================================================================
// CHARACTER DISCOVERY AND TRACKING TOOLS
// ============================================================================

export const introduceCharacter = ai.defineTool(
  {
    name: 'introduceCharacter',
    description: 'Introduce a new character that the player encounters for the first time. This adds them to the character tracking system.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      name: z.string().describe('Character\'s full name'),
      description: z.string().describe('Physical appearance and personality description'),
      currentLocation: z.string().describe('Where the character is currently located'),
      status: z.string().default('Met').describe('Initial status (e.g., "Met", "Friendly", "Hostile")'),
      initialAffinity: z.number().min(0).max(100).default(10).describe('Starting affinity level (0-100)'),
      avatar: z.string().optional().describe('Avatar URL (will use placeholder if not provided)'),
      isImportant: z.boolean().default(false).describe('Whether this is a major story character'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      character: z.object({
        name: z.string(),
        affinity: z.number(),
        status: z.string(),
        currentLocation: z.string(),
        description: z.string(),
      }).optional(),
    }),
  },
  async (input) => {
    try {
      // Get current game state
      const gameSave = await prisma.gameSave.findUnique({
        where: { userId: input.userId },
      });

      if (!gameSave) {
        return {
          success: false,
          message: 'No game save found for this player',
        };
      }

      const gameState = gameSave.state as any;
      const characters: Character[] = gameState.characters || [];
      
      // Check if character already exists
      const existingCharacter = characters.find(char => char.name === input.name);
      if (existingCharacter) {
        return {
          success: false,
          message: `Character ${input.name} is already known to the player`,
        };
      }

      // Create new character
      const newCharacter: Character = {
        name: input.name,
        affinity: input.initialAffinity,
        status: input.status,
        description: input.description,
        avatar: input.avatar || "https://placehold.co/100x100.png",
        currentLocation: input.currentLocation,
        isImportant: input.isImportant,
        bonds: [],
        firstMetAt: input.currentLocation,
        lastSeenAt: new Date(),
      };

      // Add to characters array
      characters.push(newCharacter);

      // Update game state
      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: {
          state: {
            ...gameState,
            characters,
          },
        },
      });

      return {
        success: true,
        message: `${input.name} has been added to your character relationships!`,
        character: {
          name: newCharacter.name,
          affinity: newCharacter.affinity,
          status: newCharacter.status,
          currentLocation: newCharacter.currentLocation,
          description: newCharacter.description,
        },
      };
    } catch (error) {
      console.error('Error introducing character:', error);
      return {
        success: false,
        message: 'Failed to introduce character due to database error',
      };
    }
  }
);

// ============================================================================
// CHARACTER AFFINITY MANAGEMENT TOOLS
// ============================================================================

export const updateCharacterAffinity = ai.defineTool(
  {
    name: 'updateCharacterAffinity',
    description: 'Update a character\'s affinity towards the player based on actions or dialogue.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      characterName: z.string().describe('Name of the character whose affinity to update'),
      affinityChange: z.number().describe('Amount to change affinity by (positive for increase, negative for decrease)'),
      reason: z.string().describe('Reason for the affinity change'),
      statusChange: z.string().optional().describe('New status if it should change (e.g., "Friend", "Rival", "Hostile")'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      newAffinity: z.number().optional(),
      oldAffinity: z.number().optional(),
      statusChanged: z.boolean().optional(),
    }),
  },
  async (input) => {
    try {
      const gameSave = await prisma.gameSave.findUnique({
        where: { userId: input.userId },
      });

      if (!gameSave) {
        return {
          success: false,
          message: 'No game save found for this player',
        };
      }

      const gameState = gameSave.state as any;
      const characters: Character[] = gameState.characters || [];
      
      const characterIndex = characters.findIndex(char => char.name === input.characterName);
      if (characterIndex === -1) {
        return {
          success: false,
          message: `Character ${input.characterName} not found. They may need to be introduced first.`,
        };
      }

      const character = characters[characterIndex];
      const oldAffinity = character.affinity;
      const newAffinity = Math.max(0, Math.min(100, oldAffinity + input.affinityChange));
      
      // Update affinity
      characters[characterIndex] = {
        ...character,
        affinity: newAffinity,
        status: input.statusChange || character.status,
        lastInteractionReason: input.reason,
        lastSeenAt: new Date(),
      };

      // Update game state
      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: {
          state: {
            ...gameState,
            characters,
          },
        },
      });

      const direction = input.affinityChange > 0 ? 'increased' : 'decreased';
      const statusChanged = !!(input.statusChange && input.statusChange !== character.status);

      return {
        success: true,
        message: `${input.characterName}'s affinity ${direction} by ${Math.abs(input.affinityChange)} (${oldAffinity} → ${newAffinity}). Reason: ${input.reason}`,
        newAffinity,
        oldAffinity,
        statusChanged,
      };
    } catch (error) {
      console.error('Error updating character affinity:', error);
      return {
        success: false,
        message: 'Failed to update character affinity due to database error',
      };
    }
  }
);

// ============================================================================
// CHARACTER BOND MANAGEMENT TOOLS
// ============================================================================

export const createCharacterBond = ai.defineTool(
  {
    name: 'createCharacterBond',
    description: 'Create a relationship bond between two characters (not involving the player directly).',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      character1Name: z.string().describe('First character in the relationship'),
      character2Name: z.string().describe('Second character in the relationship'),
      relationshipType: z.string().describe('Type of relationship (e.g., "Family", "Friends", "Rivals", "Lovers", "Enemies")'),
      strength: z.number().min(0).max(100).describe('Strength of the bond (0-100)'),
      description: z.string().optional().describe('Additional context about their relationship'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      bondsCreated: z.number().optional(),
    }),
  },
  async (input) => {
    try {
      const gameSave = await prisma.gameSave.findUnique({
        where: { userId: input.userId },
      });

      if (!gameSave) {
        return {
          success: false,
          message: 'No game save found for this player',
        };
      }

      const gameState = gameSave.state as any;
      const characters: Character[] = gameState.characters || [];
      
      const char1Index = characters.findIndex(char => char.name === input.character1Name);
      const char2Index = characters.findIndex(char => char.name === input.character2Name);
      
      if (char1Index === -1 || char2Index === -1) {
        return {
          success: false,
          message: `One or both characters not found. Both characters must be introduced first.`,
        };
      }

      // Create reciprocal bonds
      const bond1: CharacterBond = {
        characterName: input.character2Name,
        relationship: input.relationshipType,
        strength: input.strength,
        description: input.description,
      };

      const bond2: CharacterBond = {
        characterName: input.character1Name,
        relationship: input.relationshipType,
        strength: input.strength,
        description: input.description,
      };

      // Add bonds to characters (avoid duplicates)
      if (!characters[char1Index].bonds) characters[char1Index].bonds = [];
      if (!characters[char2Index].bonds) characters[char2Index].bonds = [];

      const existingBond1 = characters[char1Index].bonds!.find(b => b.characterName === input.character2Name);
      const existingBond2 = characters[char2Index].bonds!.find(b => b.characterName === input.character1Name);

      let bondsCreated = 0;
      if (!existingBond1) {
        characters[char1Index].bonds!.push(bond1);
        bondsCreated++;
      } else {
        // Update existing bond
        Object.assign(existingBond1, bond1);
      }

      if (!existingBond2) {
        characters[char2Index].bonds!.push(bond2);
        bondsCreated++;
      } else {
        // Update existing bond
        Object.assign(existingBond2, bond2);
      }

      // Update game state
      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: {
          state: {
            ...gameState,
            characters,
          },
        },
      });

      return {
        success: true,
        message: `Created/updated ${input.relationshipType} bond between ${input.character1Name} and ${input.character2Name}`,
        bondsCreated,
      };
    } catch (error) {
      console.error('Error creating character bond:', error);
      return {
        success: false,
        message: 'Failed to create character bond due to database error',
      };
    }
  }
);

// ============================================================================
// CHARACTER LOCATION MANAGEMENT TOOLS
// ============================================================================

export const updateCharacterLocation = ai.defineTool(
  {
    name: 'updateCharacterLocation',
    description: 'Update a character\'s current location when they move or are encountered elsewhere.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      characterName: z.string().describe('Name of the character to move'),
      newLocation: z.string().describe('New location for the character'),
      reason: z.string().optional().describe('Reason for the location change'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      oldLocation: z.string().optional(),
      newLocation: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      const gameSave = await prisma.gameSave.findUnique({
        where: { userId: input.userId },
      });

      if (!gameSave) {
        return {
          success: false,
          message: 'No game save found for this player',
        };
      }

      const gameState = gameSave.state as any;
      const characters: Character[] = gameState.characters || [];
      
      const characterIndex = characters.findIndex(char => char.name === input.characterName);
      if (characterIndex === -1) {
        return {
          success: false,
          message: `Character ${input.characterName} not found`,
        };
      }

      const character = characters[characterIndex];
      const oldLocation = character.currentLocation;
      
      // Update location
      characters[characterIndex] = {
        ...character,
        currentLocation: input.newLocation,
        lastSeenAt: new Date(),
        locationHistory: [
          ...(character.locationHistory || []),
          {
            location: oldLocation,
            leftAt: new Date(),
            reason: input.reason,
          }
        ],
      };

      // Update game state
      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: {
          state: {
            ...gameState,
            characters,
          },
        },
      });

      return {
        success: true,
        message: `${input.characterName} moved from ${oldLocation} to ${input.newLocation}`,
        oldLocation,
        newLocation: input.newLocation,
      };
    } catch (error) {
      console.error('Error updating character location:', error);
      return {
        success: false,
        message: 'Failed to update character location due to database error',
      };
    }
  }
);

// ============================================================================
// CHARACTER QUERY TOOLS
// ============================================================================

export const getCharactersInLocation = ai.defineTool(
  {
    name: 'getCharactersInLocation',
    description: 'Get all characters currently in a specific location.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      location: z.string().describe('Location to search for characters'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      characters: z.array(z.object({
        name: z.string(),
        affinity: z.number(),
        status: z.string(),
        description: z.string(),
      })).optional(),
    }),
  },
  async (input) => {
    try {
      const gameSave = await prisma.gameSave.findUnique({
        where: { userId: input.userId },
      });

      if (!gameSave) {
        return {
          success: false,
          message: 'No game save found for this player',
        };
      }

      const gameState = gameSave.state as any;
      const characters: Character[] = gameState.characters || [];
      
      const charactersInLocation = characters.filter(char => 
        char.currentLocation === input.location
      );

      return {
        success: true,
        message: `Found ${charactersInLocation.length} character(s) in ${input.location}`,
        characters: charactersInLocation.map(char => ({
          name: char.name,
          affinity: char.affinity,
          status: char.status,
          description: char.description,
        })),
      };
    } catch (error) {
      console.error('Error getting characters in location:', error);
      return {
        success: false,
        message: 'Failed to get characters due to database error',
      };
    }
  }
);

// Export all character management tools
export const characterManagementTools = [
  introduceCharacter,
  updateCharacterAffinity,
  createCharacterBond,
  updateCharacterLocation,
  getCharactersInLocation,
];