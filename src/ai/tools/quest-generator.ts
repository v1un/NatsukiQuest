// src/ai/tools/quest-generator.ts
/**
 * @fileOverview AI-powered procedural quest generation system
 * 
 * This tool creates dynamic, contextually relevant quests based on:
 * - Current story state
 * - Player reputation
 * - Character relationships
 * - Location and available NPCs
 */

import { ai } from '@/ai/genkit';
import { prisma } from '@/lib/prisma';
import { z } from 'genkit';
import type { Quest, QuestObjective, QuestReward, GameState, Reputation } from '@/lib/types';

// Quest templates for different types
const QUEST_TEMPLATES = {
  ROMANCE: [
    {
      titlePattern: "A Gift for {character}",
      descriptionPattern: "Find something special to give to {character} to show your feelings.",
      objectives: [
        "Find a meaningful gift for {character}",
        "Present the gift at the right moment"
      ]
    },
    {
      titlePattern: "Rival's Challenge",
      descriptionPattern: "Another suitor is competing for {character}'s attention. Prove your worth.",
      objectives: [
        "Discover who your rival is",
        "Outperform them in a meaningful way",
        "Win {character}'s favor"
      ]
    }
  ],
  FACTION: [
    {
      titlePattern: "Proving Loyalty to {faction}",
      descriptionPattern: "Complete a task to prove your dedication to {faction}.",
      objectives: [
        "Speak with the {faction} leader",
        "Complete the assigned task",
        "Report back for recognition"
      ]
    },
    {
      titlePattern: "Faction Conflict Resolution",
      descriptionPattern: "Mediate a dispute between {faction} and a rival group.",
      objectives: [
        "Investigate the source of conflict",
        "Speak with both sides",
        "Find a diplomatic solution"
      ]
    }
  ],
  EXPLORATION: [
    {
      titlePattern: "Secrets of {location}",
      descriptionPattern: "Explore {location} and uncover its hidden mysteries.",
      objectives: [
        "Thoroughly explore {location}",
        "Find hidden areas or secrets",
        "Document your discoveries"
      ]
    },
    {
      titlePattern: "Lost and Found",
      descriptionPattern: "Someone has lost something important in {location}. Help them recover it.",
      objectives: [
        "Search {location} for the lost item",
        "Return the item to its owner"
      ]
    }
  ],
  SIDE: [
    {
      titlePattern: "The {character}'s Dilemma",
      descriptionPattern: "{character} needs help with a personal problem.",
      objectives: [
        "Listen to {character}'s problem",
        "Find a solution or gather required items",
        "Help resolve the situation"
      ]
    },
    {
      titlePattern: "Mysterious Request",
      descriptionPattern: "A stranger has made an unusual request that could lead to interesting discoveries.",
      objectives: [
        "Meet with the mysterious stranger",
        "Complete their unusual task",
        "Uncover the truth behind the request"
      ]
    }
  ]
};

export const generateProceduralQuest = ai.defineTool(
  {
    name: 'generateProceduralQuest',
    description: 'Generate a contextually appropriate side quest based on current game state, character relationships, and player progress.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      questType: z.enum(['ROMANCE', 'FACTION', 'EXPLORATION', 'SIDE', 'AUTO']).describe('Type of quest to generate, or AUTO to choose based on context'),
      targetCharacter: z.string().optional().describe('Specific character to focus the quest on'),
      location: z.string().optional().describe('Specific location for the quest'),
      difficultyLevel: z.enum(['EASY', 'MEDIUM', 'HARD']).optional().describe('Desired difficulty level'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      generatedQuest: z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        category: z.string(),
        objectives: z.array(z.object({
          id: z.string(),
          description: z.string(),
          isCompleted: z.boolean(),
          maxProgress: z.number().optional(),
        })),
        rewards: z.array(z.object({
          type: z.string(),
          amount: z.number(),
          faction: z.string().optional(),
          character: z.string().optional(),
        })),
        estimatedDuration: z.string(),
      }).optional(),
    }),
  },
  async (input) => {
    try {
      // Get current game state to understand context
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
      
      // Analyze context to determine quest type if AUTO
      let questType = input.questType;
      if (questType === 'AUTO') {
        questType = determineOptimalQuestType(gameState) as any;
      }

      // Get available characters and locations from game state
      const availableCharacters = gameState.characters || [];
      const currentLocation = gameState.currentLocation || 'Unknown Location';
      const reputations = gameState.reputations || [];

      // Select template based on quest type
      const templates = QUEST_TEMPLATES[questType as keyof typeof QUEST_TEMPLATES] || QUEST_TEMPLATES.SIDE;
      const template = templates[Math.floor(Math.random() * templates.length)];

      // Generate quest context
      const questContext = generateQuestContext(
        questType,
        availableCharacters,
        currentLocation,
        reputations,
        input.targetCharacter,
        input.location
      );

      // Create quest from template
      const questId = `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const title = fillTemplate(template.titlePattern, questContext);
      const description = fillTemplate(template.descriptionPattern, questContext);
      
      const objectives: QuestObjective[] = template.objectives.map((objTemplate, index) => ({
        id: `${questId}_obj_${index}`,
        description: fillTemplate(objTemplate, questContext),
        isCompleted: false,
        progress: 0,
        maxProgress: questType === 'EXPLORATION' ? Math.floor(Math.random() * 3) + 2 : undefined,
      }));

      // Generate appropriate rewards
      const rewards = generateQuestRewards(questType, questContext, input.difficultyLevel || 'MEDIUM');

      const quest: Quest = {
        id: questId,
        title,
        description,
        category: questType as Quest['category'],
        status: 'ACTIVE',
        objectives,
        rewards,
        startedAt: new Date(),
        location: questContext.location,
        npcsInvolved: questContext.character ? [questContext.character] : [],
        prerequisites: [],
      };

      // Save to database
      await prisma.quest.create({
        data: {
          id: questId,
          userId: input.userId,
          title,
          description,
          category: questType as Quest['category'],
          status: 'ACTIVE',
          objectives: objectives as any,
          rewards: rewards as any,
          startedAt: new Date(),
          location: questContext.location,
          npcsInvolved: questContext.character ? [questContext.character] : [],
          prerequisites: [],
        },
      });

      // Update game state
      const activeQuests = gameState.activeQuests || [];
      activeQuests.push(quest);

      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: {
          state: {
            ...gameState,
            activeQuests,
          } as any,
        },
      });

      // Estimate duration based on objectives and type
      const estimatedDuration = estimateQuestDuration(questType, objectives.length, input.difficultyLevel || 'MEDIUM');

      return {
        success: true,
        message: `New ${questType.toLowerCase()} quest generated: "${title}"`,
        generatedQuest: {
          id: questId,
          title,
          description,
          category: questType,
          objectives: objectives.map(obj => ({
            id: obj.id,
            description: obj.description,
            isCompleted: obj.isCompleted,
            maxProgress: obj.maxProgress,
          })),
          rewards: rewards.map(reward => ({
            type: reward.type,
            amount: reward.amount,
            faction: reward.faction,
            character: reward.character,
          })),
          estimatedDuration,
        },
      };
    } catch (error) {
      console.error('Error generating procedural quest:', error);
      return {
        success: false,
        message: 'Failed to generate quest due to system error',
      };
    }
  }
);

// Helper function to determine the best quest type based on game state
function determineOptimalQuestType(gameState: GameState): string {
  const reputations = gameState.reputations || [];
  const characters = gameState.characters || [];
  const activeQuests = gameState.activeQuests || [];

  // Count quest types in active quests
  const questTypeCounts = activeQuests.reduce((counts, quest) => {
    counts[quest.category] = (counts[quest.category] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // Prefer types that are underrepresented
  const priorities = [];

  // If player has high affinity with characters, suggest romance quests
  const highAffinityChars = characters.filter(char => char.affinity > 60);
  if (highAffinityChars.length > 0 && (questTypeCounts['ROMANCE'] || 0) < 2) {
    priorities.push('ROMANCE');
  }

  // If player has notable reputation with factions, suggest faction quests
  const significantReps = reputations.filter(rep => Math.abs(rep.level) > 25);
  if (significantReps.length > 0 && (questTypeCounts['FACTION'] || 0) < 3) {
    priorities.push('FACTION');
  }

  // If player hasn't explored much, suggest exploration
  const discoveredLore = gameState.discoveredLore || [];
  if (discoveredLore.length < 5 && (questTypeCounts['EXPLORATION'] || 0) < 2) {
    priorities.push('EXPLORATION');
  }

  // Default to side quest if no specific preference
  if (priorities.length === 0) {
    priorities.push('SIDE');
  }

  return priorities[Math.floor(Math.random() * priorities.length)];
}

// Helper function to generate quest context
function generateQuestContext(
  questType: string,
  availableCharacters: any[],
  currentLocation: string,
  reputations: Reputation[],
  targetCharacter?: string,
  targetLocation?: string
) {
  const context: any = {
    location: targetLocation || currentLocation,
  };

  if (questType === 'ROMANCE' || questType === 'SIDE') {
    const eligibleChars = availableCharacters.filter(char => 
      !targetCharacter || char.name === targetCharacter
    );
    if (eligibleChars.length > 0) {
      const char = targetCharacter 
        ? eligibleChars.find(c => c.name === targetCharacter) || eligibleChars[0]
        : eligibleChars[Math.floor(Math.random() * eligibleChars.length)];
      context.character = char.name;
    }
  }

  if (questType === 'FACTION') {
    const availableFactions = reputations.filter(rep => rep.level > -50);
    if (availableFactions.length > 0) {
      const faction = availableFactions[Math.floor(Math.random() * availableFactions.length)];
      context.faction = faction.faction;
    } else {
      context.faction = 'Local Guild';
    }
  }

  return context;
}

// Helper function to fill template placeholders
function fillTemplate(template: string, context: any): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return context[key] || match;
  });
}

// Helper function to generate appropriate rewards
function generateQuestRewards(questType: string, context: any, difficulty: string): QuestReward[] {
  const rewards: QuestReward[] = [];
  
  const difficultyMultiplier = {
    'EASY': 1,
    'MEDIUM': 1.5,
    'HARD': 2
  }[difficulty] || 1;

  switch (questType) {
    case 'ROMANCE':
      rewards.push({
        type: 'RELATIONSHIP',
        character: context.character,
        amount: Math.floor(10 * difficultyMultiplier),
      });
      break;
      
    case 'FACTION':
      rewards.push({
        type: 'REPUTATION',
        faction: context.faction,
        amount: Math.floor(15 * difficultyMultiplier),
      });
      break;
      
    case 'EXPLORATION':
      rewards.push({
        type: 'ITEM',
        itemId: 'exploration_token',
        amount: Math.floor(2 * difficultyMultiplier),
      });
      break;
      
    default: // SIDE quests
      rewards.push({
        type: 'ITEM',
        itemId: 'quest_reward_token',
        amount: Math.floor(5 * difficultyMultiplier),
      });
      break;
  }

  return rewards;
}

// Helper function to estimate quest duration
function estimateQuestDuration(questType: string, objectiveCount: number, difficulty: string): string {
  const baseMinutes = {
    'ROMANCE': 15,
    'FACTION': 20,
    'EXPLORATION': 25,
    'SIDE': 10,
  }[questType] || 10;

  const difficultyMultiplier = {
    'EASY': 0.8,
    'MEDIUM': 1.0,
    'HARD': 1.3,
  }[difficulty] || 1.0;

  const estimatedMinutes = Math.floor(baseMinutes * objectiveCount * difficultyMultiplier);
  
  if (estimatedMinutes < 5) return '5 minutes';
  if (estimatedMinutes < 60) return `${estimatedMinutes} minutes`;
  
  const hours = Math.floor(estimatedMinutes / 60);
  const minutes = estimatedMinutes % 60;
  
  if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${hours}h ${minutes}m`;
}