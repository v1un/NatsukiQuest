// src/ai/tools/advanced-game-tools.ts
/**
 * @fileOverview Advanced AI tools for managing complex game systems like
 * reputation, quests, relationship conflicts, and environmental storytelling.
 * 
 * These tools enable the AI to create dynamic, interconnected narrative experiences.
 */

import { ai } from '@/ai/genkit';
import { prisma } from '@/lib/prisma';
import { z } from 'genkit';
import type { 
  Quest, 
  QuestObjective, 
  QuestReward, 
  Reputation, 
  ReputationChange,
  RelationshipConflict,
  ConflictConsequence,
  EnvironmentalDetail
} from '@/lib/types';

// ============================================================================
// REPUTATION MANAGEMENT TOOLS
// ============================================================================

export const updateReputation = ai.defineTool(
  {
    name: 'updateReputation',
    description: 'Update player reputation with a faction or group. This affects how NPCs react and what quests/options are available.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      faction: z.string().describe('The faction/group name (e.g., "Royal Knights", "Merchant Guild", "Cultists")'),
      change: z.number().describe('Reputation change amount (-100 to +100)'),
      reason: z.string().describe('Reason for the reputation change'),
      location: z.string().optional().describe('Location where this reputation change occurred'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      newReputation: z.object({
        faction: z.string(),
        level: z.number(),
        title: z.string().optional(),
      }).optional(),
    }),
  },
  async (input) => {
    try {
      // First check if reputation record exists
      let reputation = await prisma.reputation.findFirst({
        where: {
          userId: input.userId,
          faction: input.faction,
        },
      });

      const newLevel = (reputation?.level || 0) + input.change;
      const cappedLevel = Math.max(-100, Math.min(100, newLevel));

      // Determine title based on reputation level
      let title: string | undefined;
      if (cappedLevel >= 75) title = 'Revered';
      else if (cappedLevel >= 50) title = 'Honored';
      else if (cappedLevel >= 25) title = 'Friendly';
      else if (cappedLevel >= -25) title = 'Neutral';
      else if (cappedLevel >= -50) title = 'Unfriendly';
      else if (cappedLevel >= -75) title = 'Hostile';
      else title = 'Hated';

      const reputationChange = {
        amount: input.change,
        reason: input.reason,
        timestamp: new Date(),
        location: input.location,
      };

      if (reputation) {
        // Update existing reputation
        const updatedHistory = [...(reputation.history as any[]), reputationChange];
        reputation = await prisma.reputation.update({
          where: { id: reputation.id },
          data: {
            level: cappedLevel,
            title,
            history: updatedHistory as any,
          },
        });
      } else {
        // Create new reputation record
        reputation = await prisma.reputation.create({
          data: {
            userId: input.userId,
            faction: input.faction,
            level: cappedLevel,
            title,
            history: [reputationChange] as any,
          },
        });
      }

      // Also update the game state
      const gameSave = await prisma.gameSave.findUnique({
        where: { userId: input.userId },
      });

      if (gameSave) {
        const gameState = gameSave.state as any;
        const reputations = gameState.reputations || [];
        const existingIndex = reputations.findIndex((r: Reputation) => r.faction === input.faction);
        
        const updatedRep: Reputation = {
          id: reputation.id,
          faction: reputation.faction,
          level: reputation.level,
          title: reputation.title || undefined,
          history: reputation.history as any[],
        };

        if (existingIndex >= 0) {
          reputations[existingIndex] = updatedRep;
        } else {
          reputations.push(updatedRep);
        }

        await prisma.gameSave.update({
          where: { userId: input.userId },
          data: {
            state: {
              ...gameState,
              reputations,
            },
          },
        });
      }

      return {
        success: true,
        message: `Reputation with ${input.faction} ${input.change > 0 ? 'increased' : 'decreased'} by ${Math.abs(input.change)}. Now ${title} (${cappedLevel})`,
        newReputation: {
          faction: reputation.faction,
          level: reputation.level,
          title: reputation.title || undefined,
        },
      };
    } catch (error) {
      console.error('Error updating reputation:', error);
      return {
        success: false,
        message: 'Failed to update reputation due to database error',
      };
    }
  }
);

// ============================================================================
// QUEST MANAGEMENT TOOLS
// ============================================================================

export const createQuest = ai.defineTool(
  {
    name: 'createQuest',
    description: 'Create a new quest for the player. Can be main story, side quest, romance, faction, or exploration based.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      title: z.string().describe('Quest title'),
      description: z.string().describe('Quest description'),
      category: z.enum(['MAIN', 'SIDE', 'ROMANCE', 'FACTION', 'EXPLORATION']).describe('Quest category'),
      objectives: z.array(z.object({
        description: z.string(),
        maxProgress: z.number().optional(),
      })).describe('Quest objectives'),
      rewards: z.array(z.object({
        type: z.enum(['ITEM', 'SKILL', 'REPUTATION', 'RELATIONSHIP']),
        itemId: z.string().optional(),
        skillId: z.string().optional(),
        faction: z.string().optional(),
        character: z.string().optional(),
        amount: z.number(),
      })).optional().describe('Quest rewards'),
      location: z.string().optional().describe('Quest location'),
      npcsInvolved: z.array(z.string()).optional().describe('NPCs involved in this quest'),
      prerequisites: z.array(z.string()).optional().describe('Required quest IDs that must be completed first'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      questId: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      // Generate quest ID
      const questId = `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create objectives with IDs
      const objectives: QuestObjective[] = input.objectives.map((obj, index) => ({
        id: `${questId}_obj_${index}`,
        description: obj.description,
        isCompleted: false,
        progress: 0,
        maxProgress: obj.maxProgress,
      }));

      // Create quest object
      const quest: Quest = {
        id: questId,
        title: input.title,
        description: input.description,
        category: input.category,
        status: 'ACTIVE',
        objectives,
        rewards: input.rewards as QuestReward[] || [],
        startedAt: new Date(),
        location: input.location,
        npcsInvolved: input.npcsInvolved || [],
        prerequisites: input.prerequisites || [],
      };

      // Save to database
      await prisma.quest.create({
        data: {
          id: questId,
          userId: input.userId,
          title: input.title,
          description: input.description,
          category: input.category,
          status: 'ACTIVE',
          objectives: objectives as any,
          rewards: (input.rewards || []) as any,
          startedAt: new Date(),
          location: input.location,
          npcsInvolved: input.npcsInvolved || [],
          prerequisites: input.prerequisites || [],
        },
      });

      // Update game state
      const gameSave = await prisma.gameSave.findUnique({
        where: { userId: input.userId },
      });

      if (gameSave) {
        const gameState = gameSave.state as any;
        const activeQuests = gameState.activeQuests || [];
        activeQuests.push(quest);

        await prisma.gameSave.update({
          where: { userId: input.userId },
          data: {
            state: {
              ...gameState,
              activeQuests,
            },
          },
        });
      }

      return {
        success: true,
        message: `Quest "${input.title}" has been added to your journal!`,
        questId,
      };
    } catch (error) {
      console.error('Error creating quest:', error);
      return {
        success: false,
        message: 'Failed to create quest due to database error',
      };
    }
  }
);

export const updateQuestProgress = ai.defineTool(
  {
    name: 'updateQuestProgress',
    description: 'Update progress on a specific quest objective or complete/fail the entire quest.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      questId: z.string().describe('The quest ID to update'),
      objectiveId: z.string().optional().describe('Specific objective ID to update progress for'),
      progressAmount: z.number().optional().describe('Amount to add to objective progress'),
      completeObjective: z.boolean().optional().describe('Mark objective as completed'),
      questStatus: z.enum(['ACTIVE', 'COMPLETED', 'FAILED', 'PAUSED']).optional().describe('New quest status'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      questCompleted: z.boolean().optional(),
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
      const activeQuests: Quest[] = gameState.activeQuests || [];
      const completedQuests: Quest[] = gameState.completedQuests || [];
      
      const questIndex = activeQuests.findIndex(q => q.id === input.questId);
      if (questIndex === -1) {
        return {
          success: false,
          message: 'Quest not found in active quests',
        };
      }

      const quest = { ...activeQuests[questIndex] };

      // Update objective progress if specified
      if (input.objectiveId) {
        const objIndex = quest.objectives.findIndex(obj => obj.id === input.objectiveId);
        if (objIndex >= 0) {
          if (input.completeObjective) {
            quest.objectives[objIndex].isCompleted = true;
            quest.objectives[objIndex].progress = quest.objectives[objIndex].maxProgress || 1;
          } else if (input.progressAmount !== undefined) {
            quest.objectives[objIndex].progress = (quest.objectives[objIndex].progress || 0) + input.progressAmount;
            if (quest.objectives[objIndex].maxProgress && 
                quest.objectives[objIndex].progress >= quest.objectives[objIndex].maxProgress!) {
              quest.objectives[objIndex].isCompleted = true;
            }
          }
        }
      }

      // Update quest status if specified
      if (input.questStatus) {
        quest.status = input.questStatus;
        if (input.questStatus === 'COMPLETED') {
          quest.completedAt = new Date();
          // Mark all objectives as completed
          quest.objectives.forEach(obj => obj.isCompleted = true);
        }
      }

      let questCompleted = false;

      // Move quest to completed if status is COMPLETED
      if (quest.status === 'COMPLETED') {
        activeQuests.splice(questIndex, 1);
        completedQuests.push(quest);
        questCompleted = true;
      } else {
        activeQuests[questIndex] = quest;
      }

      // Update database
      await prisma.quest.update({
        where: { id: input.questId },
        data: {
          status: quest.status,
          objectives: quest.objectives as any,
          completedAt: quest.completedAt,
        },
      });

      // Update game state
      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: {
          state: {
            ...gameState,
            activeQuests,
            completedQuests,
          },
        },
      });

      let message = 'Quest updated successfully';
      if (input.completeObjective) {
        message = 'Quest objective completed!';
      } else if (questCompleted) {
        message = `Quest "${quest.title}" completed!`;
      } else if (input.progressAmount) {
        message = `Quest progress updated (+${input.progressAmount})`;
      }

      return {
        success: true,
        message,
        questCompleted,
      };
    } catch (error) {
      console.error('Error updating quest progress:', error);
      return {
        success: false,
        message: 'Failed to update quest progress due to database error',
      };
    }
  }
);

// ============================================================================
// RELATIONSHIP CONFLICT TOOLS
// ============================================================================

export const createRelationshipConflict = ai.defineTool(
  {
    name: 'createRelationshipConflict',
    description: 'Create a new relationship conflict between characters that can affect story progression.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      characters: z.array(z.string()).describe('Characters involved in the conflict'),
      type: z.enum(['JEALOUSY', 'RIVALRY', 'ROMANCE', 'POLITICAL', 'PERSONAL']).describe('Type of conflict'),
      severity: z.number().min(1).max(10).describe('Conflict severity (1-10)'),
      description: z.string().describe('Description of the conflict'),
      triggers: z.array(z.string()).describe('Actions that can escalate or resolve the conflict'),
      consequences: z.array(z.object({
        character: z.string(),
        affinityChange: z.number(),
        dialogue: z.string().optional(),
        questImpact: z.string().optional(),
        storyBranching: z.string().optional(),
      })).describe('Potential consequences of the conflict'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      conflictId: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      const conflictId = `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const conflict: RelationshipConflict = {
        id: conflictId,
        characters: input.characters,
        type: input.type,
        severity: input.severity,
        description: input.description,
        triggers: input.triggers,
        consequences: input.consequences as ConflictConsequence[],
        isActive: true,
        startedAt: new Date(),
      };

      // Save to database
      await prisma.relationshipConflict.create({
        data: {
          id: conflictId,
          userId: input.userId,
          characters: input.characters,
          type: input.type,
          severity: input.severity,
          description: input.description,
          triggers: input.triggers,
          consequences: input.consequences as any,
          isActive: true,
          startedAt: new Date(),
        },
      });

      // Update game state
      const gameSave = await prisma.gameSave.findUnique({
        where: { userId: input.userId },
      });

      if (gameSave) {
        const gameState = gameSave.state as any;
        const relationshipConflicts = gameState.relationshipConflicts || [];
        relationshipConflicts.push(conflict);

        await prisma.gameSave.update({
          where: { userId: input.userId },
          data: {
            state: {
              ...gameState,
              relationshipConflicts,
            },
          },
        });
      }

      return {
        success: true,
        message: `Relationship conflict created between ${input.characters.join(' and ')}`,
        conflictId,
      };
    } catch (error) {
      console.error('Error creating relationship conflict:', error);
      return {
        success: false,
        message: 'Failed to create relationship conflict due to database error',
      };
    }
  }
);

export const resolveRelationshipConflict = ai.defineTool(
  {
    name: 'resolveRelationshipConflict',
    description: 'Resolve or escalate a relationship conflict based on player actions.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      conflictId: z.string().describe('The conflict ID to resolve'),
      resolution: z.enum(['RESOLVE', 'ESCALATE', 'TEMPORARY_CALM']).describe('How to handle the conflict'),
      playerAction: z.string().describe('The action the player took that triggered this resolution'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      consequences: z.array(z.object({
        character: z.string(),
        affinityChange: z.number(),
        dialogue: z.string().optional(),
      })).optional(),
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
      const relationshipConflicts: RelationshipConflict[] = gameState.relationshipConflicts || [];
      
      const conflictIndex = relationshipConflicts.findIndex(c => c.id === input.conflictId);
      if (conflictIndex === -1) {
        return {
          success: false,
          message: 'Conflict not found',
        };
      }

      const conflict = { ...relationshipConflicts[conflictIndex] };
      const appliedConsequences: any[] = [];

      if (input.resolution === 'RESOLVE') {
        conflict.isActive = false;
        conflict.resolvedAt = new Date();
        
        // Apply positive consequences
        for (const consequence of conflict.consequences) {
          if (consequence.affinityChange > 0) {
            appliedConsequences.push({
              character: consequence.character,
              affinityChange: consequence.affinityChange,
              dialogue: consequence.dialogue,
            });
          }
        }
      } else if (input.resolution === 'ESCALATE') {
        conflict.severity = Math.min(10, conflict.severity + 1);
        
        // Apply negative consequences
        for (const consequence of conflict.consequences) {
          if (consequence.affinityChange < 0) {
            appliedConsequences.push({
              character: consequence.character,
              affinityChange: consequence.affinityChange,
              dialogue: consequence.dialogue,
            });
          }
        }
      }
      // TEMPORARY_CALM doesn't change the conflict's active state but might reduce severity slightly

      relationshipConflicts[conflictIndex] = conflict;

      // Update database
      await prisma.relationshipConflict.update({
        where: { id: input.conflictId },
        data: {
          severity: conflict.severity,
          isActive: conflict.isActive,
          resolvedAt: conflict.resolvedAt,
        },
      });

      // Update game state
      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: {
          state: {
            ...gameState,
            relationshipConflicts,
          },
        },
      });

      let message = '';
      if (input.resolution === 'RESOLVE') {
        message = `Conflict resolved! ${conflict.characters.join(' and ')} have reconciled.`;
      } else if (input.resolution === 'ESCALATE') {
        message = `Conflict escalated! Tension between ${conflict.characters.join(' and ')} increases.`;
      } else {
        message = `Temporary calm achieved in the conflict between ${conflict.characters.join(' and ')}.`;
      }

      return {
        success: true,
        message,
        consequences: appliedConsequences,
      };
    } catch (error) {
      console.error('Error resolving relationship conflict:', error);
      return {
        success: false,
        message: 'Failed to resolve relationship conflict due to database error',
      };
    }
  }
);

// ============================================================================
// ENVIRONMENTAL STORYTELLING TOOLS
// ============================================================================

export const addEnvironmentalDetail = ai.defineTool(
  {
    name: 'addEnvironmentalDetail',
    description: 'Add environmental details that players can discover to enhance world-building and storytelling.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      location: z.string().describe('Location where this detail can be found'),
      description: z.string().describe('Description of what the player observes'),
      interactionType: z.enum(['EXAMINE', 'INTERACT', 'LORE', 'QUEST']).describe('How players can interact with this detail'),
      loreId: z.string().optional().describe('ID of lore entry this detail unlocks'),
      questId: z.string().optional().describe('ID of quest this detail relates to'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      detailId: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      const detailId = `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const environmentalDetail: EnvironmentalDetail = {
        id: detailId,
        location: input.location,
        description: input.description,
        interactionType: input.interactionType,
        loreId: input.loreId,
        questId: input.questId,
        isDiscovered: false,
      };

      // Save to database
      await prisma.environmentalDetail.create({
        data: {
          id: detailId,
          userId: input.userId,
          location: input.location,
          description: input.description,
          interactionType: input.interactionType,
          loreId: input.loreId,
          questId: input.questId,
          isDiscovered: false,
        },
      });

      // Update game state
      const gameSave = await prisma.gameSave.findUnique({
        where: { userId: input.userId },
      });

      if (gameSave) {
        const gameState = gameSave.state as any;
        const environmentalDetails = gameState.environmentalDetails || [];
        environmentalDetails.push(environmentalDetail);

        await prisma.gameSave.update({
          where: { userId: input.userId },
          data: {
            state: {
              ...gameState,
              environmentalDetails,
            },
          },
        });
      }

      return {
        success: true,
        message: `Environmental detail added to ${input.location}`,
        detailId,
      };
    } catch (error) {
      console.error('Error adding environmental detail:', error);
      return {
        success: false,
        message: 'Failed to add environmental detail due to database error',
      };
    }
  }
);

export const discoverEnvironmentalDetail = ai.defineTool(
  {
    name: 'discoverEnvironmentalDetail',
    description: 'Mark an environmental detail as discovered and potentially unlock related content.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      detailId: z.string().describe('The environmental detail ID to mark as discovered'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      unlockedContent: z.object({
        loreUnlocked: z.boolean(),
        questUpdated: z.boolean(),
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
      const environmentalDetails: EnvironmentalDetail[] = gameState.environmentalDetails || [];
      
      const detailIndex = environmentalDetails.findIndex(d => d.id === input.detailId);
      if (detailIndex === -1) {
        return {
          success: false,
          message: 'Environmental detail not found',
        };
      }

      const detail = { ...environmentalDetails[detailIndex] };
      detail.isDiscovered = true;
      detail.discoveredAt = new Date();

      environmentalDetails[detailIndex] = detail;

      let loreUnlocked = false;
      let questUpdated = false;

      // Handle unlocked content
      if (detail.loreId) {
        const discoveredLore = gameState.discoveredLore || [];
        if (!discoveredLore.includes(detail.loreId)) {
          discoveredLore.push(detail.loreId);
          gameState.discoveredLore = discoveredLore;
          loreUnlocked = true;
        }
      }

      if (detail.questId) {
        // This could trigger quest objective completion
        questUpdated = true;
      }

      // Update database
      await prisma.environmentalDetail.update({
        where: { id: input.detailId },
        data: {
          isDiscovered: true,
          discoveredAt: new Date(),
        },
      });

      // Update game state
      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: {
          state: {
            ...gameState,
            environmentalDetails,
          },
        },
      });

      let message = `You discover: ${detail.description}`;
      if (loreUnlocked) message += ' [New lore unlocked!]';
      if (questUpdated) message += ' [Quest updated!]';

      return {
        success: true,
        message,
        unlockedContent: {
          loreUnlocked,
          questUpdated,
        },
      };
    } catch (error) {
      console.error('Error discovering environmental detail:', error);
      return {
        success: false,
        message: 'Failed to discover environmental detail due to database error',
      };
    }
  }
);

// ============================================================================
// LORE MANAGEMENT TOOLS
// ============================================================================

export const addLoreEntry = ai.defineTool(
  {
    name: 'addLoreEntry',
    description: 'Add a new lore entry to the player\'s knowledge base.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      title: z.string().describe('Title of the lore entry'),
      content: z.string().describe('Content/description of the lore'),
      category: z.string().describe('Category (e.g., "Magic", "Politics", "Characters", "History")'),
      tags: z.array(z.string()).describe('Tags for easier searching'),
      characters: z.array(z.string()).optional().describe('Characters related to this lore'),
      location: z.string().optional().describe('Location where this lore was discovered'),
      autoDiscover: z.boolean().optional().describe('Whether to immediately mark as discovered'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      loreId: z.string().optional(),
    }),
  },
  async (input) => {
    try {
      const loreId = `lore_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Save to database
      await prisma.loreEntry.create({
        data: {
          id: loreId,
          userId: input.userId,
          title: input.title,
          content: input.content,
          category: input.category,
          tags: input.tags,
          characters: input.characters || [],
          location: input.location,
          isDiscovered: input.autoDiscover || false,
          discoveredAt: input.autoDiscover ? new Date() : undefined,
        },
      });

      // Update game state if auto-discovered
      if (input.autoDiscover) {
        const gameSave = await prisma.gameSave.findUnique({
          where: { userId: input.userId },
        });

        if (gameSave) {
          const gameState = gameSave.state as any;
          const discoveredLore = gameState.discoveredLore || [];
          discoveredLore.push(loreId);

          await prisma.gameSave.update({
            where: { userId: input.userId },
            data: {
              state: {
                ...gameState,
                discoveredLore,
              },
            },
          });
        }
      }

      return {
        success: true,
        message: input.autoDiscover 
          ? `New lore discovered: "${input.title}"`
          : `Lore entry "${input.title}" added (undiscovered)`,
        loreId,
      };
    } catch (error) {
      console.error('Error adding lore entry:', error);
      return {
        success: false,
        message: 'Failed to add lore entry due to database error',
      };
    }
  }
);

// Export all advanced tools as an array for easy importing
export const advancedGameTools = [
  updateReputation,
  createQuest,
  updateQuestProgress,
  createRelationshipConflict,
  resolveRelationshipConflict,
  addEnvironmentalDetail,
  discoverEnvironmentalDetail,
  addLoreEntry,
];