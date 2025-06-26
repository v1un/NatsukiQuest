'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiGameMaster } from '@/ai/flows/ai-game-master';
import { fetchAndInjectLore } from '@/ai/flows/advanced-lorebook';
import { returnByDeath } from '@/ai/flows/return-by-death';
import { initialGameState } from '@/lib/initial-game-state';
import type { GameState } from '@/lib/types';

export async function startNewGame(): Promise<GameState> {
  const newGame = { ...initialGameState, checkpoint: { ...initialGameState, checkpoint: null, memory: "" }, memory: "" };
  return newGame;
}

export async function makeChoice(
  currentState: GameState,
  choice: string
): Promise<GameState> {
  try {
    // Get the authenticated user session for database operations
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('You must be logged in to make choices');
    }

    // 1. Get relevant lore for the current situation.
    const loreContext = await fetchAndInjectLore({
      gameSituation: `Previous Narrative: ${currentState.narrative}\nPlayer Chose: ${choice}`,
      existingNarrativeContext: currentState.narrative,
    });

    // 2. Call the AI Game Master with the full game state and new context.
    const aiResponse = await aiGameMaster({
      userId: session.user.id, // Pass the user ID for tool operations
      playerChoice: choice,
      currentNarrative: currentState.narrative,
      characters: currentState.characters,
      inventory: currentState.inventory,
      skills: currentState.skills,
      memory: currentState.memory,
      injectedLore: loreContext.updatedNarrativeContext,
    });
    
    // 3. Retrieve the potentially updated game state from the database
    //    The AI tools may have modified inventory, stats, or world state
    let updatedGameState = currentState;
    try {
      const savedGame = await prisma.gameSave.findUnique({
        where: { userId: session.user.id },
      });
      if (savedGame && savedGame.state) {
        updatedGameState = savedGame.state as unknown as GameState;
      }
    } catch (dbError) {
      console.warn('Could not retrieve updated game state from database:', dbError);
      // Continue with current state if database read fails
    }

    // 4. Update memory log.
    const newMemory = `${updatedGameState.memory}\n- Chose '${choice}', which resulted in: ${aiResponse.lastOutcome}`;

    // 5. Construct the new game state, merging AI responses with database updates.
    const newState: GameState = {
      ...updatedGameState, // Use the database state as base (includes tool modifications)
      narrative: aiResponse.newNarrative,
      choices: aiResponse.newChoices,
      characters: aiResponse.updatedCharacters, // Directly use the AI's updated list
      inventory: aiResponse.updatedInventory ?? updatedGameState.inventory, // Use updated inventory if provided
      isGameOver: aiResponse.isGameOver,
      lastOutcome: aiResponse.lastOutcome,
      memory: newMemory.slice(-2000), // Keep memory from getting too long
    };

    return newState;

  } catch (error) {
    console.error('Error in makeChoice action:', error);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message.includes('logged in')) {
      return {
        ...currentState,
        narrative: currentState.narrative + "\n\n[You must be logged in to continue your adventure. Please sign in and try again.]",
        choices: ["Sign In"],
      };
    }
    
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
    // A checkpoint is a full GameState object. If it's null, use the initial state.
    const checkpoint = currentState.checkpoint || initialGameState;

    const aiResponse = await returnByDeath({
      scenarioDescription: checkpoint.narrative,
      playerChoices: [], // We don't have a good way to track choices within a loop yet
      outcome: currentState.lastOutcome || "Subaru met a terrible fate.",
    });

    return {
      ...checkpoint, // Rewind state to the checkpoint
      narrative: aiResponse.newScenario,
      choices: aiResponse.availableChoices,
      currentLoop: currentState.currentLoop + 1,
      isGameOver: false,
      // Memory of the previous failed loop is retained by Subaru, but the world's state is reset.
      memory: checkpoint.memory + `\n[Loop #${currentState.currentLoop} Failed: ${currentState.lastOutcome}]`,
    };
  } catch (error) {
    console.error('Error in triggerReturnByDeath action:', error);
    return {
        ...(currentState.checkpoint || initialGameState),
        currentLoop: currentState.currentLoop + 1,
        isGameOver: false,
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
        // Use upsert to create or update a save file. This simplifies to one save slot per user.
        await prisma.gameSave.upsert({
            where: {
                userId: session.user.id,
            },
            update: {
                state: gameState as any,
            },
            create: {
                userId: session.user.id,
                state: gameState as any,
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
        const savedGame = await prisma.gameSave.findUnique({
            where: {
                userId: session.user.id,
            },
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
