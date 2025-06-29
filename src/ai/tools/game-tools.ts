// src/ai/tools/game-tools.ts
/**
 * @fileOverview Game tools for the AI Game Master, providing the ability to
 * interact with the game state, inventory, and player stats directly.
 * 
 * These tools enable the AI to move from passive narration to active game management.
 */

import { ai } from '@/ai/genkit';
import { prisma } from '@/lib/prisma';
import { z } from 'genkit';

// ============================================================================
// INVENTORY MANAGEMENT TOOLS
// ============================================================================

export const updatePlayerInventory = ai.defineTool(
  {
    name: 'updatePlayerInventory',
    description: 'Add or remove items from the player\'s inventory. Use positive quantity to add items, negative to remove them.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      itemId: z.string().describe('Unique identifier for the item'),
      itemName: z.string().describe('The name of the item'),
      itemDescription: z.string().describe('Description of the item'),
      itemIcon: z.string().describe('Icon identifier for the item (e.g., "sword", "potion", "key")'),
      quantity: z.number().describe('Quantity to add (positive) or remove (negative)'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      updatedInventory: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        icon: z.string(),
        quantity: z.number().optional(),
      })).optional(),
    }),
  },
  async (input) => {
    try {
      // Fetch current game save
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
      let inventory = gameState.inventory || [];

      // Find existing item
      const existingItemIndex = inventory.findIndex((item: any) => item.id === input.itemId);

      if (input.quantity > 0) {
        // Adding items
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          inventory[existingItemIndex].quantity = (inventory[existingItemIndex].quantity || 1) + input.quantity;
        } else {
          // Add new item
          inventory.push({
            id: input.itemId,
            name: input.itemName,
            description: input.itemDescription,
            icon: input.itemIcon,
            quantity: input.quantity,
          });
        }
      } else {
        // Removing items
        if (existingItemIndex >= 0) {
          const currentQuantity = inventory[existingItemIndex].quantity || 1;
          const newQuantity = currentQuantity + input.quantity; // input.quantity is negative

          if (newQuantity <= 0) {
            // Remove item completely
            inventory.splice(existingItemIndex, 1);
          } else {
            // Update quantity
            inventory[existingItemIndex].quantity = newQuantity;
          }
        } else {
          return {
            success: false,
            message: `Cannot remove ${input.itemName} - item not found in inventory`,
          };
        }
      }

      // Update game state
      const updatedGameState = {
        ...gameState,
        inventory,
      };

      // Save to database
      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: { state: updatedGameState },
      });

      return {
        success: true,
        message: input.quantity > 0 
          ? `Added ${input.quantity} ${input.itemName}(s) to inventory`
          : `Removed ${Math.abs(input.quantity)} ${input.itemName}(s) from inventory`,
        updatedInventory: inventory,
      };
    } catch (error) {
      console.error('Error updating player inventory:', error);
      return {
        success: false,
        message: 'Failed to update inventory due to database error',
      };
    }
  }
);

// ============================================================================
// PLAYER STATS MANAGEMENT TOOLS
// ============================================================================

export const getPlayerStats = ai.defineTool(
  {
    name: 'getPlayerStats',
    description: 'Retrieve the current player stats including health, skills, and other attributes.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      stats: z.object({
        health: z.number(),
        maxHealth: z.number(),
        skills: z.array(z.object({
          id: z.string(),
          name: z.string(),
          value: z.number(),
          description: z.string(),
        })),
        attributes: z.record(z.number()).optional(),
      }).optional(),
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
      const stats = {
        health: gameState.health || 100,
        maxHealth: gameState.maxHealth || 100,
        skills: gameState.skills || [],
        attributes: gameState.attributes || {},
      };

      return {
        success: true,
        message: 'Player stats retrieved successfully',
        stats,
      };
    } catch (error) {
      console.error('Error retrieving player stats:', error);
      return {
        success: false,
        message: 'Failed to retrieve player stats due to database error',
      };
    }
  }
);

export const updatePlayerStats = ai.defineTool(
  {
    name: 'updatePlayerStats',
    description: 'Update player stats such as health, add new skills, or modify existing attributes.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      healthChange: z.number().optional().describe('Amount to change health by (positive for healing, negative for damage)'),
      newSkill: z.object({
        id: z.string(),
        name: z.string(),
        value: z.number(),
        description: z.string(),
      }).optional().describe('New skill to add to the player'),
      attributeChanges: z.record(z.number()).optional().describe('Changes to various attributes (e.g., {"strength": 1, "intelligence": -1})'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      updatedStats: z.object({
        health: z.number(),
        maxHealth: z.number(),
        skills: z.array(z.object({
          id: z.string(),
          name: z.string(),
          value: z.number(),
          description: z.string(),
        })),
        attributes: z.record(z.number()),
      }).optional(),
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
      
      // Update health
      if (input.healthChange !== undefined) {
        const currentHealth = gameState.health || 100;
        const maxHealth = gameState.maxHealth || 100;
        gameState.health = Math.max(0, Math.min(maxHealth, currentHealth + input.healthChange));
      }

      // Add new skill
      if (input.newSkill) {
        const skills = gameState.skills || [];
        const existingSkillIndex = skills.findIndex((skill: any) => skill.id === input.newSkill!.id);
        
        if (existingSkillIndex >= 0) {
          skills[existingSkillIndex] = input.newSkill;
        } else {
          skills.push(input.newSkill);
        }
        gameState.skills = skills;
      }

      // Update attributes
      if (input.attributeChanges) {
        const attributes = gameState.attributes || {};
        for (const [key, change] of Object.entries(input.attributeChanges)) {
          attributes[key] = (attributes[key] || 0) + change;
        }
        gameState.attributes = attributes;
      }

      // Save to database
      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: { state: gameState },
      });

      const updatedStats = {
        health: gameState.health || 100,
        maxHealth: gameState.maxHealth || 100,
        skills: gameState.skills || [],
        attributes: gameState.attributes || {},
      };

      return {
        success: true,
        message: 'Player stats updated successfully',
        updatedStats,
      };
    } catch (error) {
      console.error('Error updating player stats:', error);
      return {
        success: false,
        message: 'Failed to update player stats due to database error',
      };
    }
  }
);

// ============================================================================
// SKILL CHECK TOOLS
// ============================================================================

export const performSkillCheck = ai.defineTool(
  {
    name: 'performSkillCheck',
    description: 'Perform a skill check with dice rolling mechanics. Returns success/failure and the roll details.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      skillId: z.string().describe('The ID of the skill being tested'),
      difficulty: z.number().describe('The difficulty number to beat (typically 10-20)'),
      modifier: z.number().optional().describe('Additional modifier to add to the roll'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      rollResult: z.number(),
      skillValue: z.number(),
      totalRoll: z.number(),
      difficulty: z.number(),
      message: z.string(),
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
          rollResult: 0,
          skillValue: 0,
          totalRoll: 0,
          difficulty: input.difficulty,
          message: 'No game save found for this player',
        };
      }

      const gameState = gameSave.state as any;
      const skills = gameState.skills || [];
      const skill = skills.find((s: any) => s.id === input.skillId);
      
      if (!skill) {
        return {
          success: false,
          rollResult: 0,
          skillValue: 0,
          totalRoll: 0,
          difficulty: input.difficulty,
          message: `Skill ${input.skillId} not found`,
        };
      }

      // Roll a d20
      const rollResult = Math.floor(Math.random() * 20) + 1;
      const skillValue = skill.value || 0;
      const modifier = input.modifier || 0;
      const totalRoll = rollResult + skillValue + modifier;
      const success = totalRoll >= input.difficulty;

      return {
        success,
        rollResult,
        skillValue,
        totalRoll,
        difficulty: input.difficulty,
        message: success 
          ? `Success! Rolled ${rollResult} + ${skillValue} (skill) + ${modifier} (modifier) = ${totalRoll} vs DC ${input.difficulty}`
          : `Failed! Rolled ${rollResult} + ${skillValue} (skill) + ${modifier} (modifier) = ${totalRoll} vs DC ${input.difficulty}`,
      };
    } catch (error) {
      console.error('Error performing skill check:', error);
      return {
        success: false,
        rollResult: 0,
        skillValue: 0,
        totalRoll: 0,
        difficulty: input.difficulty,
        message: 'Failed to perform skill check due to database error',
      };
    }
  }
);

// ============================================================================
// WORLD STATE TOOLS
// ============================================================================

export const updateWorldState = ai.defineTool(
  {
    name: 'updateWorldState',
    description: 'Update world state variables such as quest progress, unlocked areas, or story flags.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      stateKey: z.string().describe('The key for the state variable to update'),
      stateValue: z.union([z.string(), z.number(), z.boolean()]).describe('The new value for the state variable'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      updatedState: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
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
      
      // Initialize world state if it doesn't exist
      if (!gameState.worldState) {
        gameState.worldState = {};
      }

      // Update the specific state variable
      gameState.worldState[input.stateKey] = input.stateValue;

      // Save to database
      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: { state: gameState },
      });

      return {
        success: true,
        message: `World state updated: ${input.stateKey} = ${input.stateValue}`,
        updatedState: gameState.worldState,
      };
    } catch (error) {
      console.error('Error updating world state:', error);
      return {
        success: false,
        message: 'Failed to update world state due to database error',
      };
    }
  }
);

// ============================================================================
// NEW AI TOOLS FOR GAME MANAGEMENT
// ============================================================================

export const reputationManager = ai.defineTool(
  {
    name: 'reputationManager',
    description: 'Adjusts faction standings and writes a reputation change log.',
    inputSchema: z.object({
      factionId: z.string().describe('ID of the faction whose reputation is to be adjusted'),
      userId: z.string().describe('The player\'s user ID'),
      change: z.number().describe('Amount to adjust reputation by'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      updatedReputation: z.number().describe('The new reputation value'),
    }),
  },
  async (input) => {
    // Placeholder for helper function
    const writeReputationChange = async (factionId: string, userId: string, change: number) => {
      // Logic to adjust and log the reputation change
      return { success: true, updatedReputation: 100 + change }; // Example logic
    };

    try {
      const result = await writeReputationChange(input.factionId, input.userId, input.change);
      return {
        success: result.success,
        message: `Reputation adjusted by ${input.change} for user ${input.userId} in faction ${input.factionId}`,
        updatedReputation: result.updatedReputation,
      };
    } catch (error) {
      console.error('Error managing reputation:', error);
      return {
        success: false,
        message: 'Failed to adjust reputation due to error',
        updatedReputation: 0,
      };
    }
  }
);

export const generateSideQuest = ai.defineTool(
  {
    name: 'generateSideQuest',
    description: 'Creates a quest with objectives and rewards.',
    inputSchema: z.object({
      location: z.string().describe('Location for the quest'),
      difficulty: z.number().optional().describe('Level of difficulty for the quest'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      quest: z.object({
        id: z.string(),
        name: z.string(),
        objectives: z.array(z.string()),
        rewards: z.array(z.string()),
      }).optional(),
    }),
  },
  async (input) => {
    // Placeholder for helper function
    const createQuest = async (location: string, difficulty?: number) => {
      // Logic to generate a quest
      return {
        success: true,
        quest: {
          id: 'quest_123',
          name: 'The Lost Treasure',
          objectives: ['Find the map', 'Reach the hidden cove', 'Defeat the guardian'],
          rewards: ['100 gold', 'Rare gem'],
        },
      };
    };

    try {
      const result = await createQuest(input.location, input.difficulty);
      return {
        success: result.success,
        message: result.success ? 'Quest generated successfully' : 'Failed to generate quest',
        quest: result.quest,
      };
    } catch (error) {
      console.error('Error generating side quest:', error);
      return {
        success: false,
        message: 'Failed to generate side quest due to error',
      };
    }
  }
);

export const basicRelationshipConflictResolver = ai.defineTool(
  {
    name: 'resolveRelationshipConflict',
    description: 'Resolves conflicts and adjusts relationships.',
    inputSchema: z.object({
      relationshipId: z.string().describe('ID of the relationship to check for conflicts'),
      resolutionMethod: z.string().describe('Method to resolve the conflict'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      updatedAffinities: z.record(z.string(), z.number()).optional(),
    }),
  },
  async (input) => {
    // Placeholder for helper function
    const resolveConflict = async (relationshipId: string, method: string) => {
      // Logic to resolve conflicts and adjust relationships
      return {
        success: true,
        updatedAffinities: { 'npc_123': 75 },
      };
    };

    try {
      const result = await resolveConflict(input.relationshipId, input.resolutionMethod);
      return {
        success: result.success,
        message: result.success ? 'Conflict resolved successfully' : 'Failed to resolve conflict',
        updatedAffinities: result.updatedAffinities,
      };
    } catch (error) {
      console.error('Error resolving relationship conflict:', error);
      return {
        success: false,
        message: 'Failed to resolve conflict due to error',
      };
    }
  }
);

export const environmentalStorytelling = ai.defineTool(
  {
    name: 'environmentalStorytelling',
    description: 'Creates or retrieves environmental detail snippets.',
    inputSchema: z.object({
      locationId: z.string().describe('ID of the location to get environmental details for'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      details: z.array(z.object({
        id: z.string(),
        description: z.string(),
      })).optional(),
    }),
  },
  async (input) => {
    // Placeholder for helper function
    const getEnvironmentalDetails = async (locationId: string) => {
      // Logic to get or create environmental details
      return {
        success: true,
        details: [
          { id: 'detail_001', description: 'An ancient mural telling the story of a forgotten hero.' },
        ],
      };
    };

    try {
      const result = await getEnvironmentalDetails(input.locationId);
      return {
        success: result.success,
        message: result.success ? 'Environmental details retrieved' : 'Failed to retrieve details',
        details: result.details,
      };
    } catch (error) {
      console.error('Error in retrieving environmental storytelling:', error);
      return {
        success: false,
        message: 'Failed to retrieve environmental details due to error',
      };
    }
  }
);

export const lorebookManager = ai.defineTool(
  {
    name: 'lorebookManager',
    description: 'Marks lore as discovered and returns the updated lorebook.',
    inputSchema: z.object({
      loreId: z.string().describe('ID of the lore to be marked as discovered'),
      userId: z.string().describe('The player\'s user ID'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      updatedLorebook: z.array(z.object({
        id: z.string(),
        name: z.string(),
        discovered: z.boolean(),
      })).optional(),
    }),
  },
  async (input) => {
    // Placeholder for helper function
    const markLoreAsDiscovered = async (loreId: string, userId: string) => {
      // Logic to mark lore and update lorebook
      return {
        success: true,
        updatedLorebook: [
          { id: loreId, name: 'Ancient Civilization', discovered: true },
        ],
      };
    };

    try {
      const result = await markLoreAsDiscovered(input.loreId, input.userId);
      return {
        success: result.success,
        message: result.success ? 'Lore marked as discovered' : 'Failed to mark lore',
        updatedLorebook: result.updatedLorebook,
      };
    } catch (error) {
      console.error('Error managing lorebook:', error);
      return {
        success: false,
        message: 'Failed to update lorebook due to error',
      };
    }
  }
);

// Export all tools as an array for easy importing
export const gameTools = [
  updatePlayerInventory,
  getPlayerStats,
  updatePlayerStats,
  performSkillCheck,
  updateWorldState,
  reputationManager,
  generateSideQuest,
  basicRelationshipConflictResolver,
  environmentalStorytelling,
  lorebookManager,
];
