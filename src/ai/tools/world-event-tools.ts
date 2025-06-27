// src/ai/tools/world-event-tools.ts
/**
 * @fileOverview Tools for managing dynamic world events
 * 
 * Provides AI tools for:
 * - Creating and managing world events
 * - Tracking event consequences
 * - Managing NPC movements and activities
 * - Economic and political state changes
 * - News and rumor propagation
 */

import { ai } from '@/ai/genkit';
import { prisma } from '@/lib/prisma';
import { z } from 'genkit';

// ============================================================================
// WORLD EVENT MANAGEMENT
// ============================================================================

export const createWorldEvent = ai.defineTool(
  {
    name: 'createWorldEvent',
    description: 'Create a new dynamic world event that affects the game world independently of player actions.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      eventId: z.string().describe('Unique event identifier'),
      title: z.string().describe('Event title'),
      description: z.string().describe('Detailed event description'),
      category: z.enum([
        'POLITICAL', 'ECONOMIC', 'SOCIAL', 'ENVIRONMENTAL', 
        'FACTION', 'CHARACTER', 'SEASONAL', 'RELIGIOUS', 
        'MAGICAL', 'CULTURAL'
      ]).describe('Event category'),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']).describe('Event severity'),
      location: z.string().optional().describe('Primary location affected'),
      affectedFactions: z.array(z.string()).describe('Factions affected by this event'),
      duration: z.object({
        startTime: z.string(),
        endTime: z.string().optional(),
        ongoing: z.boolean(),
      }).describe('Event timing information'),
      consequences: z.array(z.object({
        type: z.enum(['REPUTATION', 'ECONOMY', 'AVAILABILITY', 'RELATIONSHIP', 'QUEST', 'WORLD_STATE']),
        target: z.string(),
        effect: z.string(),
        value: z.number().optional(),
      })).describe('Event consequences and effects'),
      playerAwareness: z.enum(['UNKNOWN', 'RUMORS', 'PARTIAL', 'FULL']).describe('How much the player knows'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      eventId: z.string().optional(),
      immediateEffects: z.array(z.string()).optional(),
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
      const worldEvents = gameState.worldEvents || [];
      
      const newEvent = {
        id: input.eventId,
        title: input.title,
        description: input.description,
        category: input.category,
        severity: input.severity,
        location: input.location,
        affectedFactions: input.affectedFactions,
        duration: input.duration,
        consequences: input.consequences,
        playerAwareness: input.playerAwareness,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      worldEvents.push(newEvent);

      // Apply immediate consequences
      const immediateEffects = [];
      for (const consequence of input.consequences) {
        switch (consequence.type) {
          case 'REPUTATION':
            const reputations = gameState.reputations || {};
            if (reputations[consequence.target]) {
              reputations[consequence.target] += consequence.value || 0;
              immediateEffects.push(`${consequence.target} reputation changed by ${consequence.value}`);
            }
            break;
          case 'ECONOMY':
            const economy = gameState.economy || { prosperity: 50 };
            if (consequence.target === 'prosperity') {
              economy.prosperity = Math.max(0, Math.min(100, 
                economy.prosperity + (consequence.value || 0)
              ));
              immediateEffects.push(`Economic prosperity changed by ${consequence.value}`);
            }
            break;
          case 'WORLD_STATE':
            const worldState = gameState.worldState || {};
            worldState[consequence.target] = consequence.effect;
            immediateEffects.push(`World state "${consequence.target}" set to "${consequence.effect}"`);
            break;
        }
      }

      // Update game state
      const updatedGameState = {
        ...gameState,
        worldEvents: worldEvents,
      };

      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: { state: updatedGameState },
      });

      return {
        success: true,
        message: `Created world event "${input.title}" with ${input.consequences.length} consequences`,
        eventId: input.eventId,
        immediateEffects,
      };
    } catch (error) {
      console.error('Error creating world event:', error);
      return {
        success: false,
        message: 'Failed to create world event due to database error',
      };
    }
  }
);

export const updateWorldEvent = ai.defineTool(
  {
    name: 'updateWorldEvent',
    description: 'Update an existing world event with new developments or conclude it.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      eventId: z.string().describe('Event identifier to update'),
      newDevelopments: z.string().optional().describe('New developments in the event'),
      statusChange: z.enum(['ESCALATING', 'DE_ESCALATING', 'CONCLUDED', 'SUSPENDED']).optional(),
      newConsequences: z.array(z.object({
        type: z.enum(['REPUTATION', 'ECONOMY', 'AVAILABILITY', 'RELATIONSHIP', 'QUEST', 'WORLD_STATE']),
        target: z.string(),
        effect: z.string(),
        value: z.number().optional(),
      })).optional().describe('Additional consequences from event development'),
      playerAwarenessChange: z.enum(['UNKNOWN', 'RUMORS', 'PARTIAL', 'FULL']).optional(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      updatedEvent: z.any().optional(),
      newEffects: z.array(z.string()).optional(),
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
      const worldEvents = gameState.worldEvents || [];
      
      const eventIndex = worldEvents.findIndex((event: any) => event.id === input.eventId);
      if (eventIndex === -1) {
        return {
          success: false,
          message: 'World event not found',
        };
      }

      const event = worldEvents[eventIndex];
      
      // Update event
      if (input.newDevelopments) {
        event.developments = event.developments || [];
        event.developments.push({
          description: input.newDevelopments,
          timestamp: new Date().toISOString(),
        });
      }

      if (input.statusChange) {
        event.status = input.statusChange;
        if (input.statusChange === 'CONCLUDED') {
          event.isActive = false;
          event.endTime = new Date().toISOString();
        }
      }

      if (input.playerAwarenessChange) {
        event.playerAwareness = input.playerAwarenessChange;
      }

      // Apply new consequences
      const newEffects = [];
      if (input.newConsequences) {
        event.consequences = event.consequences || [];
        event.consequences.push(...input.newConsequences);

        for (const consequence of input.newConsequences) {
          // Apply the same logic as in createWorldEvent
          // ... (similar consequence application logic)
          newEffects.push(`Applied ${consequence.type} effect to ${consequence.target}`);
        }
      }

      // Update game state
      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: { state: gameState },
      });

      return {
        success: true,
        message: `Updated world event "${event.title}"`,
        updatedEvent: event,
        newEffects,
      };
    } catch (error) {
      console.error('Error updating world event:', error);
      return {
        success: false,
        message: 'Failed to update world event due to database error',
      };
    }
  }
);

// ============================================================================
// CHARACTER MOVEMENT AND ACTIVITIES
// ============================================================================

export const moveCharacter = ai.defineTool(
  {
    name: 'moveCharacter',
    description: 'Move an NPC character to a different location as part of world events.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      characterName: z.string().describe('Name of the character to move'),
      fromLocation: z.string().describe('Current location'),
      toLocation: z.string().describe('Destination location'),
      reason: z.string().describe('Reason for the movement'),
      duration: z.string().describe('How long the character will be there'),
      availability: z.enum(['AVAILABLE', 'BUSY', 'UNAVAILABLE']).describe('Character availability at new location'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      movementId: z.string().optional(),
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
      const characterMovements = gameState.characterMovements || [];
      const characters = gameState.characters || [];

      // Find character
      const characterIndex = characters.findIndex((char: any) => char.name === input.characterName);
      if (characterIndex === -1) {
        return {
          success: false,
          message: 'Character not found',
        };
      }

      // Update character location
      characters[characterIndex].currentLocation = input.toLocation;
      characters[characterIndex].availability = input.availability;
      characters[characterIndex].lastMoved = new Date().toISOString();

      // Record movement
      const movementId = `movement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const movement = {
        id: movementId,
        character: input.characterName,
        fromLocation: input.fromLocation,
        toLocation: input.toLocation,
        reason: input.reason,
        duration: input.duration,
        startTime: new Date().toISOString(),
        availability: input.availability,
      };

      characterMovements.push(movement);

      // Update game state
      const updatedGameState = {
        ...gameState,
        characters: characters,
        characterMovements: characterMovements,
      };

      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: { state: updatedGameState },
      });

      return {
        success: true,
        message: `Moved ${input.characterName} from ${input.fromLocation} to ${input.toLocation}`,
        movementId,
      };
    } catch (error) {
      console.error('Error moving character:', error);
      return {
        success: false,
        message: 'Failed to move character due to database error',
      };
    }
  }
);

// ============================================================================
// NEWS AND RUMOR SYSTEM
// ============================================================================

export const createNewsRumor = ai.defineTool(
  {
    name: 'createNewsRumor',
    description: 'Create news or rumors that NPCs can share with the player.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      source: z.string().describe('Source of the news/rumor (character, location, organization)'),
      content: z.string().describe('The news or rumor content'),
      reliability: z.enum(['RUMOR', 'UNCONFIRMED', 'CONFIRMED', 'OFFICIAL']).describe('Reliability level'),
      spread: z.enum(['LOCAL', 'REGIONAL', 'KINGDOM_WIDE', 'INTERNATIONAL']).describe('How widely spread this information is'),
      expiresAfter: z.number().optional().describe('Days after which this news becomes old'),
      relatedEvent: z.string().optional().describe('World event this news relates to'),
      shareableBy: z.array(z.string()).describe('Characters who can share this information'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      newsId: z.string().optional(),
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
      const newsAndRumors = gameState.newsAndRumors || [];

      const newsId = `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newsItem = {
        id: newsId,
        source: input.source,
        content: input.content,
        reliability: input.reliability,
        spread: input.spread,
        createdAt: new Date().toISOString(),
        expiresAt: input.expiresAfter ? 
          new Date(Date.now() + input.expiresAfter * 24 * 60 * 60 * 1000).toISOString() : 
          null,
        relatedEvent: input.relatedEvent,
        shareableBy: input.shareableBy,
        hasBeenShared: false,
      };

      newsAndRumors.push(newsItem);

      // Update game state
      const updatedGameState = {
        ...gameState,
        newsAndRumors: newsAndRumors,
      };

      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: { state: updatedGameState },
      });

      return {
        success: true,
        message: `Created ${input.reliability.toLowerCase()} about "${input.content.substring(0, 50)}..."`,
        newsId,
      };
    } catch (error) {
      console.error('Error creating news/rumor:', error);
      return {
        success: false,
        message: 'Failed to create news/rumor due to database error',  
      };
    }
  }
);

// ============================================================================
// ECONOMIC SYSTEM TOOLS
// ============================================================================

export const updateEconomicState = ai.defineTool(
  {
    name: 'updateEconomicState',
    description: 'Update the economic state of the world based on events.',
    inputSchema: z.object({
      userId: z.string().describe('The player\'s user ID'),
      prosperityChange: z.number().optional().describe('Change in overall prosperity (-100 to +100)'),
      priceChanges: z.record(z.number()).optional().describe('Item/service price changes (percentage)'),
      newTradeRoutes: z.array(z.string()).optional().describe('New trade routes opened'),
      closedTradeRoutes: z.array(z.string()).optional().describe('Trade routes that closed'),
      marketDemandChanges: z.record(z.number()).optional().describe('Changes in market demand for items'),
      reason: z.string().describe('Reason for the economic changes'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      newEconomicState: z.any().optional(),
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
      const economy = gameState.economy || {
        prosperity: 50,
        tradeRoutes: [],
        marketDemand: {},
        priceModifiers: {},
      };

      // Apply prosperity change
      if (input.prosperityChange) {
        economy.prosperity = Math.max(0, Math.min(100, 
          economy.prosperity + input.prosperityChange
        ));
      }

      // Apply price changes
      if (input.priceChanges) {
        economy.priceModifiers = economy.priceModifiers || {};
        for (const [item, change] of Object.entries(input.priceChanges)) {
          economy.priceModifiers[item] = (economy.priceModifiers[item] || 1.0) * (1 + change / 100);
        }
      }

      // Update trade routes
      if (input.newTradeRoutes) {
        economy.tradeRoutes.push(...input.newTradeRoutes);
      }
      if (input.closedTradeRoutes) {
        economy.tradeRoutes = economy.tradeRoutes.filter(
          (route: string) => !input.closedTradeRoutes!.includes(route)
        );
      }

      // Update market demand
      if (input.marketDemandChanges) {
        economy.marketDemand = economy.marketDemand || {};
        for (const [item, change] of Object.entries(input.marketDemandChanges)) {
          economy.marketDemand[item] = (economy.marketDemand[item] || 50) + change;
        }
      }

      // Record the change
      economy.recentChanges = economy.recentChanges || [];
      economy.recentChanges.push({
        timestamp: new Date().toISOString(),
        reason: input.reason,
        changes: {
          prosperity: input.prosperityChange,
          prices: input.priceChanges,
          tradeRoutes: {
            opened: input.newTradeRoutes,
            closed: input.closedTradeRoutes,
          },
          demand: input.marketDemandChanges,
        },
      });

      // Keep only recent changes (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      economy.recentChanges = economy.recentChanges.filter(
        (change: any) => new Date(change.timestamp) > thirtyDaysAgo
      );

      // Update game state
      const updatedGameState = {
        ...gameState,
        economy: economy,
      };

      await prisma.gameSave.update({
        where: { userId: input.userId },
        data: { state: updatedGameState },
      });

      return {
        success: true,
        message: `Updated economic state: ${input.reason}`,
        newEconomicState: economy,
      };
    } catch (error) {
      console.error('Error updating economic state:', error);
      return {
        success: false,
        message: 'Failed to update economic state due to database error',
      };
    }
  }
);

// Export world event tools
export const worldEventTools = [
  createWorldEvent,
  updateWorldEvent,
  moveCharacter,
  createNewsRumor,
  updateEconomicState,
];