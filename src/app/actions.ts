'use server';

import { aiGameMaster } from '@/ai/flows/ai-game-master';
import { returnByDeath } from '@/ai/flows/return-by-death';
import { initialGameState } from '@/lib/initial-game-state';
import type { GameState } from '@/lib/types';

// Helper function to safely parse JSON
function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return defaultValue;
  }
}

export async function startNewGame(): Promise<GameState> {
  // The initial game state is hard-coded for a lore-accurate start.
  // We can set the first checkpoint to be the very beginning.
  const newGame = { ...initialGameState, checkpoint: { ...initialGameState, checkpoint: null } };
  return newGame;
}

export async function makeChoice(
  currentState: GameState,
  choice: string
): Promise<GameState> {
  try {
    const gameStateString = JSON.stringify({
      ...currentState,
      choices: [], // Clear choices while AI is thinking
    });

    const lorebookString = JSON.stringify(currentState.skills.map(s => s.description).concat(currentState.inventory.map(i => i.description)));

    const aiResponse = await aiGameMaster({
      playerChoices: choice,
      gameState: gameStateString,
      lorebook: lorebookString,
    });

    const updatedGameState = safeJsonParse(aiResponse.updatedGameState, currentState);
    
    return {
      ...currentState,
      ...updatedGameState,
      narrative: aiResponse.narrative,
      lastOutcome: aiResponse.narrative.slice(-200), // Store the last few sentences as the outcome
    };

  } catch (error) {
    console.error('Error in makeChoice action:', error);
    return {
      ...currentState,
      narrative: currentState.narrative + "\n\n[An error occurred. The threads of fate are tangled. Please try a different choice or start a new loop.]",
      choices: currentState.choices.length > 0 ? currentState.choices : ["Try again"],
    };
  }
}

export async function triggerReturnByDeath(
  currentState: GameState
): Promise<GameState> {
  try {
    const checkpoint = currentState.checkpoint || initialGameState;

    const aiResponse = await returnByDeath({
      scenarioDescription: checkpoint.narrative,
      playerChoices: [], // In a more complex system, we'd track choices made in the loop
      outcome: currentState.lastOutcome || "Subaru met a terrible fate.",
    });

    return {
      ...checkpoint,
      narrative: aiResponse.newScenario,
      choices: aiResponse.availableChoices,
      currentLoop: currentState.currentLoop + 1,
      isGameOver: false,
    };
  } catch (error) {
    console.error('Error in triggerReturnByDeath action:', error);
    // Fallback to the last checkpoint if AI fails
    return {
        ...(currentState.checkpoint || initialGameState),
        currentLoop: currentState.currentLoop + 1,
        narrative: (currentState.checkpoint?.narrative || initialGameState.narrative) + "\n\n[A painful rewind... The world stabilizes, but the path is unclear. You are back at your last checkpoint.]"
    }
  }
}
