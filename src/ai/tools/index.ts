// src/ai/tools/index.ts
/**
 * @fileOverview Central export point for all AI tools
 */

export * from './game-tools';
export * from './advanced-game-tools';
export * from './quest-generator';

// Comprehensive tool collections
import { gameTools } from './game-tools';
import { advancedGameTools } from './advanced-game-tools';
import { generateProceduralQuest } from './quest-generator';

// All tools combined for easy use in AI flows
export const allGameTools = [
  ...gameTools,
  ...advancedGameTools,
  generateProceduralQuest,
];