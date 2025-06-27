'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { aiGameMaster } from '@/ai/flows/ai-game-master';
import { fetchAndInjectLore } from '@/ai/flows/advanced-lorebook';
import { returnByDeath } from '@/ai/flows/return-by-death';
import { analyzeLoopIntelligence as analyzeLoopIntelligenceFlow } from '@/ai/flows/loop-intelligence';
import { initialGameState } from '@/lib/initial-game-state';
import type { GameState, RbDLoss, LoopIntelligence } from '@/lib/types';

export async function startNewGame(): Promise<GameState> {
  const newGame = { ...initialGameState, checkpoint: { ...initialGameState, checkpoint: null, memory: "" }, memory: "" };
  return newGame;
}

export async function makeChoice(
  currentState: GameState,
  choice: string
): Promise<GameState & { aiCheckpointSet?: boolean; aiRbdTriggered?: boolean; checkpointReason?: string; rbdReason?: string }> {
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
      currentLocation: currentState.currentLocation,
      previousLocation: currentState.currentLocation, // Will be used to detect location changes
      environmentalDetails: currentState.environmentalDetails,
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

    // 5. Handle automatic checkpoint setting by AI Game Master
    let stateWithCheckpoint = updatedGameState;
    if (aiResponse.shouldSetCheckpoint) {
      // Create a deep copy of current state for checkpoint
      stateWithCheckpoint = {
        ...updatedGameState,
        checkpoint: JSON.parse(JSON.stringify({
          ...updatedGameState,
          checkpoint: null, // Don't nest checkpoints
        })),
        checkpointReason: aiResponse.checkpointReason || 'Strategic save point set by AI Game Master'
      };
      console.log(`AI Game Master set checkpoint: ${aiResponse.checkpointReason || 'Strategic save point'}`);
    }

    // 6. Construct the new game state, merging AI responses with database updates.
    const newState: GameState = {
      ...stateWithCheckpoint, // Use the state with potential checkpoint (includes updated characters from tools)
      narrative: aiResponse.newNarrative,
      choices: aiResponse.newChoices,
      // Characters are now managed through AI tools, not through updatedCharacters response
      inventory: aiResponse.updatedInventory ?? stateWithCheckpoint.inventory, // Use updated inventory if provided
      isGameOver: aiResponse.isGameOver,
      lastOutcome: aiResponse.lastOutcome,
      memory: newMemory.slice(-2000), // Keep memory from getting too long
    };

    // 7. Handle automatic Return by Death triggered by AI Game Master
    if (aiResponse.shouldTriggerReturnByDeath && !aiResponse.isGameOver) {
      console.log(`AI Game Master triggered Return by Death: ${aiResponse.rbdReason || 'Narrative death occurred'}`);
      const rbdState = await triggerReturnByDeath(newState);
      return {
        ...rbdState,
        aiRbdTriggered: true,
        rbdReason: aiResponse.rbdReason || 'The AI Game Master determined this death required immediate return.',
        rbdTrigger: 'ai_narrative' // Override the default trigger type
      };
    }

    // 8. Return state with checkpoint information if AI set one
    return {
      ...newState,
      aiCheckpointSet: aiResponse.shouldSetCheckpoint,
      checkpointReason: aiResponse.checkpointReason
    };

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

// Helper function to calculate what was lost during Return by Death
function calculateRbDLosses(currentState: GameState, checkpointState: GameState): RbDLoss[] {
  const losses: RbDLoss[] = [];

  // Calculate inventory losses
  const lostItems = currentState.inventory.filter(item => 
    !checkpointState.inventory.some(checkItem => checkItem.id === item.id)
  );
  if (lostItems.length > 0) {
    losses.push({
      type: 'inventory',
      description: `${lostItems.length} item${lostItems.length > 1 ? 's' : ''} lost`,
      details: lostItems.map(item => item.name).join(', '),
      severity: lostItems.length > 3 ? 'major' : lostItems.length > 1 ? 'moderate' : 'minor'
    });
  }

  // Calculate relationship losses
  const relationshipLosses = currentState.characters.filter(char => {
    const checkpointChar = checkpointState.characters.find(c => c.name === char.name);
    return checkpointChar && char.affinity > checkpointChar.affinity + 5;
  });
  if (relationshipLosses.length > 0) {
    losses.push({
      type: 'relationship',
      description: `${relationshipLosses.length} relationship${relationshipLosses.length > 1 ? 's' : ''} reset`,
      details: relationshipLosses.map(char => {
        const checkChar = checkpointState.characters.find(c => c.name === char.name);
        return `${char.name} (${char.affinity - (checkChar?.affinity || 0)} affinity lost)`;
      }).join(', '),
      severity: relationshipLosses.some(c => {
        const checkChar = checkpointState.characters.find(cc => cc.name === c.name);
        return checkChar && c.affinity - checkChar.affinity > 20;
      }) ? 'major' : 'moderate'
    });
  }

  // Calculate quest progress losses
  const lostQuests = currentState.activeQuests?.filter(quest =>
    !checkpointState.activeQuests?.some(checkQuest => checkQuest.id === quest.id)
  ) || [];
  if (lostQuests.length > 0) {
    losses.push({
      type: 'quest',
      description: `${lostQuests.length} quest${lostQuests.length > 1 ? 's' : ''} reset`,
      details: lostQuests.map(quest => quest.title).join(', '),
      severity: 'moderate'
    });
  }

  // Calculate skill losses
  const lostSkills = currentState.skills.filter(skill =>
    !checkpointState.skills.some(checkSkill => checkSkill.id === skill.id)
  );
  if (lostSkills.length > 0) {
    losses.push({
      type: 'skill',
      description: `${lostSkills.length} skill${lostSkills.length > 1 ? 's' : ''} lost`,
      details: lostSkills.map(skill => skill.name).join(', '),
      severity: lostSkills.length > 2 ? 'major' : 'moderate'
    });
  }

  // Calculate location/progress losses
  if (currentState.currentLocation !== checkpointState.currentLocation) {
    losses.push({
      type: 'location',
      description: 'Location reset',
      details: `From ${currentState.currentLocation} back to ${checkpointState.currentLocation}`,
      severity: 'minor'
    });
  }

  // Calculate knowledge/lore losses
  const lostLore = currentState.discoveredLore?.filter(loreId =>
    !checkpointState.discoveredLore?.includes(loreId)
  ) || [];
  if (lostLore.length > 0) {
    losses.push({
      type: 'knowledge',
      description: `${lostLore.length} lore entr${lostLore.length > 1 ? 'ies' : 'y'} forgotten`,
      details: `${lostLore.length} piece${lostLore.length > 1 ? 's' : ''} of knowledge lost`,
      severity: lostLore.length > 3 ? 'major' : 'moderate'
    });
  }

  return losses;
}

export async function triggerReturnByDeath(
  currentState: GameState
): Promise<GameState> {
  try {
    // A checkpoint is a full GameState object. If it's null, use the initial state.
    const checkpoint = currentState.checkpoint || initialGameState;
    
    // Calculate what will be lost
    const rbdLosses = calculateRbDLosses(currentState, checkpoint);

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
      // Track what was lost in this RbD
      lastRbDLosses: rbdLosses,
      rbdTrigger: 'ai_automatic', // This will be overridden if triggered by AI narrative
      lastDeathCause: currentState.lastOutcome || "Unknown cause of death"
    };
  } catch (error) {
    console.error('Error in triggerReturnByDeath action:', error);
    return {
        ...(currentState.checkpoint || initialGameState),
        currentLoop: currentState.currentLoop + 1,
        isGameOver: false,
        narrative: (currentState.checkpoint?.narrative || initialGameState.narrative) + "\n\n[A painful rewind... The world stabilizes, but the path is unclear. You are back at your last checkpoint.]",
        lastRbDLosses: [],
        rbdTrigger: 'ai_automatic',
        lastDeathCause: "System error during Return by Death"
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

export async function analyzeLoopIntelligence(
  gameState: GameState
): Promise<LoopIntelligence> {
  try {
    // Extract information for analysis
    const lastLoopMemory = gameState.memory || '';
    const deathCause = gameState.lastDeathCause || gameState.lastOutcome || 'Unknown cause';
    const currentScenario = gameState.narrative;
    const charactersInvolved = gameState.characters.map(char => char.name);
    const availableChoices = gameState.choices;

    // Call the AI flow to analyze the loop
    const intelligence = await analyzeLoopIntelligenceFlow({
      lastLoopMemory,
      deathCause,
      currentScenario,
      charactersInvolved,
      availableChoices
    });

    if (!intelligence) {
      throw new Error('Loop intelligence analysis failed.');
    }

    return intelligence;
  } catch (error) {
    console.error('Error in analyzeLoopIntelligence action:', error);
    
    // Return a fallback intelligence object
    return {
      keyInsights: [{
        category: 'strategic_opportunity',
        insight: 'Previous loop knowledge retained',
        actionableAdvice: 'Use your memory of past events to make better decisions',
        confidence: 'medium'
      }],
      strategicRecommendations: [
        'Consider what went wrong in the previous loop',
        'Look for alternative approaches to the same situations',
        'Pay attention to character reactions and timing'
      ],
      warningsToAvoid: [
        'Avoid repeating the exact same actions that led to death'
      ],
      optimalTiming: [],
      characterIntel: gameState.characters.map(char => ({
        characterName: char.name,
        behaviorPattern: `Affinity level: ${char.affinity}`,
        trustworthiness: char.affinity > 70 ? 'high' : char.affinity > 30 ? 'medium' : 'low' as const
      })),
      hiddenOpportunities: [
        'Explore dialogue options not tried before',
        'Consider the timing of your actions more carefully'
      ],
      criticalMistakes: [{
        mistake: 'Previous approach led to failure',
        consequence: 'Loop reset via Return by Death',
        avoidanceStrategy: 'Try a different strategy this time'
      }]
    };
  }
}
