'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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
      choices: [], 
    });

    const lorebookString = JSON.stringify(currentState.skills.map(s => s.description).concat(currentState.inventory.map(i => i.description)));

    const aiResponse = await aiGameMaster({
      playerChoices: choice,
      gameState: gameStateString,
      lorebook: lorebookString,
    });

    const updatedGameState = safeJsonParse(JSON.stringify(aiResponse.updatedGameState), currentState);
    
    return {
      ...currentState,
      ...updatedGameState,
      narrative: aiResponse.narrative,
      lastOutcome: aiResponse.narrative.slice(-200),
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
      playerChoices: [],
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
    return {
        ...(currentState.checkpoint || initialGameState),
        currentLoop: currentState.currentLoop + 1,
        narrative: (currentState.checkpoint?.narrative || initialGameState.narrative) + "\n\n[A painful rewind... The world stabilizes, but the path is unclear. You are back at your last checkpoint.]"
    }
  }
}

export async function saveGame(gameState: GameState): Promise<{ success: boolean; message: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: 'You must be logged in to save the game.' };
    }
    
    try {
        await prisma.gameSave.create({
            data: {
                userId: session.user.id,
                state: gameState,
            }
        });
        return { success: true, message: 'Game saved successfully!' };
    } catch (error) {
        console.error('Error saving game:', error);
        return { success: false, message: 'Failed to save the game.' };
    }
}

export async function loadMostRecentGame(): Promise<GameState | null> {
    const session = await auth();
    if (!session?.user?.id) {
        console.log("No session found, cannot load game.");
        return null;
    }

    try {
        const savedGame = await prisma.gameSave.findFirst({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                updatedAt: 'desc',
            }
        });

        if (savedGame && savedGame.state) {
            // Prisma returns state as a JsonValue, we need to cast it.
            return savedGame.state as unknown as GameState;
        }
        return null;
    } catch (error) {
        console.error('Error loading game:', error);
        return null;
    }
}
