// src/ai/tools/index.ts
/**
 * @fileOverview Central export point for all AI tools
 */

export * from './game-tools';
export * from './advanced-game-tools';
export * from './character-management-tools';
export * from './quest-generator';
export * from './conversation-tools';
export * from './world-event-tools';

// Comprehensive tool collections
import { gameTools } from './game-tools';
import { advancedGameTools } from './advanced-game-tools';
import { characterManagementTools } from './character-management-tools';
import { generateProceduralQuest } from './quest-generator';
import { conversationTools } from './conversation-tools';
import { worldEventTools } from './world-event-tools';

// All tools combined for easy use in AI flows
export const allGameTools = [
  ...gameTools,
  ...advancedGameTools,
  ...characterManagementTools,
  generateProceduralQuest,
  ...conversationTools,
  ...worldEventTools,
];