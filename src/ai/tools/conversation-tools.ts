// src/ai/tools/conversation-tools.ts
/**
 * @fileOverview Tools for managing multi-character conversations
 * 
 * Provides AI tools for:
 * - Managing conversation state
 * - Character relationship updates
 * - Dialogue history tracking
 * - Conversation triggers and scheduling
 */

import { ai } from '@/ai/genkit';
import { prisma } from '@/lib/prisma';
import { z } from 'genkit';

// ============================================================================
// CONVERSATION STATE MANAGEMENT
// ============================================================================

export const startMultiCharacterConversation = ai.defineTool(
  {
    name: 'startMultiCharacterConversation',
    description: 'Initiate a new multi-character conversation and set up the conversation state.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      conversationId: z.string().describe('Unique identifier for this conversation'),
      participantNames: z.array(z.string()).describe('Names of characters participating'),
      topic: z.string().describe('Main topic or trigger for the conversation'),
      location: z.string().describe('Where the conversation takes place'),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).describe('Conversation priority level'),
      timeLimit: z.number().optional().describe('Conversation time limit in minutes'),
      isPrivate: z.boolean().describe('Whether this is a private conversation'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      conversationId: z.string().optional(),
      participantIds: z.array(z.string()).optional(),
    }),
  },
  async (input) => {
    try {
      // Get game save
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
      
      // Initialize conversation state
      const conversations = gameState.activeConversations || [];
      const characters = gameState.characters || [];
      
      // Find participant characters
      const participants = characters.filter((char: any) => 
        input.participantNames.includes(char.name)
      );

      if (participants.length === 0) {
        return {
          success: false,
          message: 'No valid participants found for conversation',
        };
      }

      const newConversation = {
        id: input.conversationId,
        participants: participants.map((p: any) => p.name),
        topic: input.topic,
        location: input.location,
        priority: input.priority,
        timeLimit: input.timeLimit,
        isPrivate: input.isPrivate,
        startTime: new Date().toISOString(),
        phase: 'OPENING',
        history: [],
        isActive: true,
      };

      conversations.push(newConversation);

      // Update game state
      const updatedGameState = {
        ...gameState,
        activeConversations: conversations,
      };

      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: { state: updatedGameState },
      });

      return {
        success: true,
        message: `Started conversation "${input.topic}" with ${participants.length} participants`,
        conversationId: input.conversationId,
        participantIds: participants.map((p: any) => p.name),
      };
    } catch (error) {
      console.error('Error starting multi-character conversation:', error);
      return {
        success: false,
        message: 'Failed to start conversation due to database error',
      };
    }
  }
);

export const updateConversationState = ai.defineTool(
  {
    name: 'updateConversationState',
    description: 'Update the state of an ongoing multi-character conversation.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      conversationId: z.string().describe('Conversation identifier'),
      speaker: z.string().describe('Character who spoke'),
      dialogue: z.string().describe('What was said'),
      reactions: z.record(z.string()).describe('How other characters reacted'),
      newPhase: z.enum(['OPENING', 'DISCUSSION', 'CONFLICT', 'RESOLUTION', 'CONCLUSION']).optional(),
      affinityChanges: z.record(z.number()).optional().describe('Character affinity changes'),
      isEnding: z.boolean().optional().describe('Whether the conversation is ending'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      updatedConversation: z.any().optional(),
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
      const conversations = gameState.activeConversations || [];
      const characters = gameState.characters || [];
      
      // Find conversation
      const conversationIndex = conversations.findIndex(
        (conv: any) => conv.id === input.conversationId
      );

      if (conversationIndex === -1) {
        return {
          success: false,
          message: 'Conversation not found',
        };
      }

      const conversation = conversations[conversationIndex];
      
      // Add dialogue to history
      conversation.history.push({
        speaker: input.speaker,
        dialogue: input.dialogue,
        timestamp: new Date().toISOString(),
        reactions: input.reactions,
      });

      // Update conversation phase
      if (input.newPhase) {
        conversation.phase = input.newPhase;
      }

      // Apply affinity changes
      if (input.affinityChanges) {
        for (const [characterName, change] of Object.entries(input.affinityChanges)) {
          const charIndex = characters.findIndex((char: any) => char.name === characterName);
          if (charIndex >= 0) {
            characters[charIndex].affinity = Math.max(0, Math.min(100, 
              (characters[charIndex].affinity || 50) + change
            ));
          }
        }
      }

      // Mark as ending if specified
      if (input.isEnding) {
        conversation.isActive = false;
        conversation.endTime = new Date().toISOString();
      }

      // Update game state
      const updatedGameState = {
        ...gameState,
        activeConversations: conversations,
        characters: characters,
      };

      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: { state: updatedGameState },
      });

      return {
        success: true,
        message: 'Conversation state updated successfully',
        updatedConversation: conversation,
      };
    } catch (error) {
      console.error('Error updating conversation state:', error);
      return {
        success: false,
        message: 'Failed to update conversation state due to database error',
      };
    }
  }
);

// ============================================================================
// CONVERSATION TRIGGERS AND SCHEDULING
// ============================================================================

export const scheduleConversation = ai.defineTool(
  {
    name: 'scheduleConversation',
    description: 'Schedule a future conversation to be triggered by specific conditions.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      conversationId: z.string().describe('Unique identifier for the scheduled conversation'),
      participants: z.array(z.string()).describe('Character names that will participate'),
      topic: z.string().describe('Conversation topic'),
      trigger: z.object({
        type: z.enum(['TIME', 'LOCATION', 'QUEST', 'AFFINITY', 'EVENT', 'ITEM']),
        condition: z.string(),
        value: z.any().optional(),
      }).describe('What triggers this conversation'),
      location: z.string().optional().describe('Where the conversation will take place'),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).describe('Conversation priority'),
      expiresAfter: z.number().optional().describe('Days after which this scheduled conversation expires'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      scheduledId: z.string().optional(),
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
      const scheduledConversations = gameState.scheduledConversations || [];

      const newScheduledConversation = {
        id: input.conversationId,
        participants: input.participants,
        topic: input.topic,
        trigger: input.trigger,
        location: input.location,
        priority: input.priority,
        scheduledAt: new Date().toISOString(),
        expiresAt: input.expiresAfter ? 
          new Date(Date.now() + input.expiresAfter * 24 * 60 * 60 * 1000).toISOString() : 
          null,
        isTriggered: false,
      };

      scheduledConversations.push(newScheduledConversation);

      // Update game state
      const updatedGameState = {
        ...gameState,
        scheduledConversations: scheduledConversations,
      };

      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: { state: updatedGameState },
      });

      return {
        success: true,
        message: `Scheduled conversation "${input.topic}" with trigger: ${input.trigger.type}`,
        scheduledId: input.conversationId,
      };
    } catch (error) {
      console.error('Error scheduling conversation:', error);
      return {
        success: false,
        message: 'Failed to schedule conversation due to database error',
      };
    }
  }
);

export const checkConversationTriggers = ai.defineTool(
  {
    name: 'checkConversationTriggers',
    description: 'Check if any scheduled conversations should be triggered based on current game state.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      currentLocation: z.string().describe('Player\'s current location'),
      recentEvents: z.array(z.string()).describe('Recent events that occurred'),
      questUpdates: z.array(z.string()).describe('Recently updated quests'),
      affinityChanges: z.record(z.number()).describe('Recent character affinity changes'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      triggeredConversations: z.array(z.object({
        id: z.string(),
        topic: z.string(),
        participants: z.array(z.string()),
        location: z.string().optional(),
        priority: z.string(),
      })),
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
          triggeredConversations: [],
        };
      }

      const gameState = gameSave.state as any;
      const scheduledConversations = gameState.scheduledConversations || [];
      const triggeredConversations = [];

      for (const conversation of scheduledConversations) {
        if (conversation.isTriggered) continue;

        let shouldTrigger = false;

        switch (conversation.trigger.type) {
          case 'LOCATION':
            shouldTrigger = input.currentLocation === conversation.trigger.condition;
            break;
          case 'EVENT':
            shouldTrigger = input.recentEvents.includes(conversation.trigger.condition);
            break;
          case 'QUEST':
            shouldTrigger = input.questUpdates.includes(conversation.trigger.condition);
            break;
          case 'AFFINITY':
            const [character, threshold] = conversation.trigger.condition.split(':');
            const change = input.affinityChanges[character];
            shouldTrigger = change !== undefined && Math.abs(change) >= parseInt(threshold);
            break;
          case 'TIME':
            // Time-based triggers would need additional logic
            break;
        }

        if (shouldTrigger) {
          conversation.isTriggered = true;
          triggeredConversations.push({
            id: conversation.id,
            topic: conversation.topic,
            participants: conversation.participants,
            location: conversation.location,
            priority: conversation.priority,
          });
        }
      }

      // Update game state with triggered conversations
      if (triggeredConversations.length > 0) {
        await prisma.gameSave.update({
          where: { userId: input.userId },
          data: { state: { ...gameState, scheduledConversations: scheduledConversations } },
        });
      }

      return {
        success: true,
        message: `Checked conversation triggers, found ${triggeredConversations.length} ready to start`,
        triggeredConversations,
      };
    } catch (error) {
      console.error('Error checking conversation triggers:', error);
      return {
        success: false,
        message: 'Failed to check conversation triggers due to database error',
        triggeredConversations: [],
      };
    }
  }
);

// Export conversation tools
export const conversationTools = [
  startMultiCharacterConversation,
  updateConversationState,
  scheduleConversation,
  checkConversationTriggers,
];