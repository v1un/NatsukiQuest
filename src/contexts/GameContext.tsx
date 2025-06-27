'use client';

import React, { createContext, useState, useCallback, ReactNode } from 'react';
import type { GameState, Quest, Reputation, ReputationChange, EnvironmentalDetail } from '@/lib/types';
import { startNewGame, makeChoice, triggerReturnByDeath, saveGame, loadMostRecentGame } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { initialGameState } from '@/lib/initial-game-state';

interface GameContextType {
    gameState: GameState | null;
    isLoading: boolean;
    isRewinding: boolean;
    error: string | null;
    handleStartNewGame: () => Promise<void>;
    handleMakeChoice: (choice: string) => Promise<void>;
    handleReturnByDeath: () => Promise<void>;
    handleSetCheckpoint: () => void;
    handleSaveGame: () => Promise<void>;
    handleLoadGame: () => Promise<void>;
    handleQuestUpdate: (questId: string, updates: Partial<Quest>) => void;
    handleLoreDiscovery: (loreId: string) => void;
    handleReputationChange: (faction: string, amount: number, reason: string, location?: string) => void;
    handleEnvironmentInteract: (environmentId: string, interactionType?: string) => Promise<void>;
    handleGenerateQuest: (questType?: 'ROMANCE' | 'FACTION' | 'EXPLORATION' | 'SIDE' | 'AUTO', targetCharacter?: string) => Promise<void>;
    handleAdvancedGameAction: (action: string, context?: any) => Promise<void>;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRewinding, setIsRewinding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleStartNewGame = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const newGame = await startNewGame();
            setGameState(newGame);
        } catch (e) {
            setError('Failed to start a new game. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleMakeChoice = async (choice: string) => {
        if (!gameState) return;
        setIsLoading(true);
        setGameState(prev => prev ? { ...prev, choices: [] } : null);
        try {
            const newState = await makeChoice(gameState, choice);
            setGameState(newState);
            if (newState.isGameOver) {
                toast({
                    title: "A terrible fate...",
                    description: "You have died. Use 'Return by Death' to try again.",
                    variant: "destructive",
                });
            }
        } catch (e) {
            setError('An error occurred while processing your choice.');
            console.error(e);
            setGameState(prev => prev ? { ...prev, choices: gameState.choices } : null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReturnByDeath = async () => {
        if (!gameState) return;
        setIsLoading(true);
        setIsRewinding(true);
        try {
            const newState = await triggerReturnByDeath(gameState);
            setGameState(newState);
            toast({
                title: "You have Returned by Death!",
                description: `This is your loop #${newState.currentLoop}. The world doesn't remember, but you do.`,
                className: "bg-primary text-primary-foreground"
            });
        } catch (e) {
            setError('An error occurred while trying to return.');
            console.error(e);
        } finally {
            setTimeout(() => setIsRewinding(false), 800);
            setIsLoading(false);
        }
    };

    const handleSetCheckpoint = () => {
        if (!gameState) return;
        setGameState(prev => prev ? { ...prev, checkpoint: JSON.parse(JSON.stringify(prev)) } : null);
        toast({
            title: "Checkpoint Set",
            description: "Your current state has been saved as a checkpoint for 'Return by Death'.",
        });
    };

    const handleSaveGame = async () => {
        if (!gameState) {
            toast({ variant: 'destructive', title: 'Error', description: 'No game state to save.' });
            return;
        }
        setIsLoading(true);
        const result = await saveGame(gameState);
        if (result.success) {
            toast({ title: 'Game Saved', description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
        setIsLoading(false);
    };

    const handleLoadGame = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const loadedState = await loadMostRecentGame();
            if (loadedState) {
                setGameState(loadedState);
                toast({ title: 'Game Loaded', description: 'Your progress has been restored.' });
            } else {
                toast({ variant: 'destructive', title: 'Load Failed', description: 'No saved game found or could not be loaded.' });
                // If no save, start a new game instead
                const newGame = await startNewGame();
                setGameState(newGame);
            }
        } catch (e) {
            setError('Failed to load the game. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuestUpdate = useCallback((questId: string, updates: Partial<Quest>) => {
        if (!gameState) return;
        
        setGameState(prev => {
            if (!prev) return null;
            
            // Update active quests
            const updatedActiveQuests = prev.activeQuests.map(quest => {
                if (quest.id === questId) {
                    const updatedQuest = { ...quest, ...updates };
                    
                    // If quest is being completed, move it to completed quests
                    if (updates.status === 'COMPLETED' && quest.status !== 'COMPLETED') {
                        updatedQuest.completedAt = new Date();
                        toast({
                            title: 'Quest Completed!',
                            description: `You completed: ${updatedQuest.title}`,
                            className: "bg-green-500 text-white"
                        });
                    }
                    
                    return updatedQuest;
                }
                return quest;
            });
            
            // Move completed quests to completedQuests array
            const stillActiveQuests = updatedActiveQuests.filter(quest => quest.status !== 'COMPLETED' && quest.status !== 'FAILED');
            const newlyCompletedQuests = updatedActiveQuests.filter(quest => quest.status === 'COMPLETED' || quest.status === 'FAILED');
            const updatedCompletedQuests = [...prev.completedQuests, ...newlyCompletedQuests];
            
            return {
                ...prev,
                activeQuests: stillActiveQuests,
                completedQuests: updatedCompletedQuests
            };
        });
    }, [gameState, toast]);

    const handleLoreDiscovery = useCallback((loreId: string) => {
        if (!gameState) return;
        
        setGameState(prev => {
            if (!prev || prev.discoveredLore.includes(loreId)) return prev;
            
            toast({
                title: 'Lore Discovered!',
                description: 'New knowledge has been added to your understanding of this world.',
                className: "bg-blue-500 text-white"
            });
            
            return {
                ...prev,
                discoveredLore: [...prev.discoveredLore, loreId]
            };
        });
    }, [gameState, toast]);

    const handleReputationChange = useCallback((faction: string, amount: number, reason: string, location?: string) => {
        if (!gameState) return;
        
        setGameState(prev => {
            if (!prev) return null;
            
            const updatedReputations = prev.reputations.map(rep => {
                if (rep.faction === faction) {
                    const newLevel = Math.max(-100, Math.min(100, rep.level + amount));
                    const change: ReputationChange = {
                        amount,
                        reason,
                        timestamp: new Date(),
                        location
                    };
                    
                    // Show toast for significant reputation changes
                    if (Math.abs(amount) >= 10) {
                        const direction = amount > 0 ? 'increased' : 'decreased';
                        toast({
                            title: `Reputation ${direction}!`,
                            description: `Your standing with ${faction} has ${direction} (${amount > 0 ? '+' : ''}${amount}).`,
                            variant: amount > 0 ? 'default' : 'destructive'
                        });
                    }
                    
                    return {
                        ...rep,
                        level: newLevel,
                        history: [...rep.history, change]
                    };
                }
                return rep;
            });
            
            // If faction doesn't exist, create new reputation entry
            const factionExists = prev.reputations.some(rep => rep.faction === faction);
            if (!factionExists) {
                const newReputation: Reputation = {
                    id: `rep_${faction.toLowerCase().replace(/\s+/g, '_')}`,
                    faction,
                    level: Math.max(-100, Math.min(100, amount)),
                    history: [{
                        amount,
                        reason,
                        timestamp: new Date(),
                        location
                    }]
                };
                updatedReputations.push(newReputation);
                
                toast({
                    title: 'New Faction Encountered!',
                    description: `You now have a reputation with ${faction}.`,
                    className: "bg-purple-500 text-white"
                });
            }
            
            return {
                ...prev,
                reputations: updatedReputations
            };
        });
    }, [gameState, toast]);

    const handleEnvironmentInteract = useCallback(async (environmentId: string, interactionType?: string) => {
        if (!gameState) return;
        
        // Set loading state
        setIsLoading(true);
        
        try {
            // Find the environmental detail
            const environmentDetail = gameState.environmentalDetails.find(detail => detail.id === environmentId);
            if (!environmentDetail) {
                toast({
                    title: 'Error',
                    description: 'Environmental detail not found.',
                    variant: 'destructive'
                });
                return;
            }
            
            // Determine the actual interaction type (use parameter or detail's type)
            const actualInteractionType = interactionType || environmentDetail.interactionType;
            
            // Update the environmental detail to discovered first
            setGameState(prev => {
                if (!prev) return null;
                
                const updatedEnvironmentalDetails = prev.environmentalDetails.map(detail => {
                    if (detail.id === environmentId && !detail.isDiscovered) {
                        return {
                            ...detail,
                            isDiscovered: true,
                            discoveredAt: new Date()
                        };
                    }
                    return detail;
                });
                
                return {
                    ...prev,
                    environmentalDetails: updatedEnvironmentalDetails
                };
            });
            
            // Trigger appropriate AI tool based on interaction type
            switch (actualInteractionType) {
                case 'LORE':
                    // Trigger lore discovery AI tool
                    if (environmentDetail.loreId) {
                        // Import and call the lore discovery AI flow
                        const { fetchAndInjectLore } = await import('@/ai/flows/advanced-lorebook');
                        
                        const loreResult = await fetchAndInjectLore({
                            gameSituation: `Player is examining ${environmentDetail.description} at ${gameState.currentLocation}. This relates to lore: ${environmentDetail.loreId}`,
                            existingNarrativeContext: gameState.currentText || ''
                        });
                        
                        // Update discovered lore
                        handleLoreDiscovery(environmentDetail.loreId);
                        
                        toast({
                            title: 'Lore Discovered!',
                            description: 'Ancient knowledge has been uncovered. Check your lorebook for new information.',
                            className: "bg-purple-500 text-white"
                        });
                    }
                    break;
                    
                case 'QUEST':
                    // Trigger quest start AI tool
                    if (environmentDetail.questId) {
                        // Import and call the quest generation AI flow
                        const { aiGameMaster } = await import('@/ai/flows/ai-game-master');
                        
                        const questResult = await aiGameMaster({
                            userId: gameState.userId || 'player',
                            playerChoice: `Examine ${environmentDetail.description} to start quest`,
                            currentNarrative: gameState.currentText || '',
                            characters: gameState.characters || [],
                            inventory: gameState.inventory || [],
                            skills: gameState.skills || [],
                            memory: gameState.memory || '',
                            currentLocation: gameState.currentLocation,
                            environmentalDetails: gameState.environmentalDetails
                        });
                        
                        // Update game state with quest results
                        setGameState(prev => {
                            if (!prev) return null;
                            return {
                                ...prev,
                                currentText: questResult.newNarrative,
                                choices: questResult.newChoices,
                                characters: questResult.updatedCharacters,
                                inventory: questResult.updatedInventory || prev.inventory
                            };
                        });
                        
                        toast({
                            title: 'Quest Discovered!',
                            description: 'A new adventure awaits! Check your quest journal.',
                            className: "bg-green-500 text-white"
                        });
                    }
                    break;
                    
                case 'EXAMINE':
                case 'INTERACT':
                default:
                    // Standard examination/interaction
                    const { aiGameMaster } = await import('@/ai/flows/ai-game-master');
                    
                    const examineResult = await aiGameMaster({
                        userId: gameState.userId || 'player',
                        playerChoice: `${actualInteractionType.toLowerCase()} ${environmentDetail.description}`,
                        currentNarrative: gameState.currentText || '',
                        characters: gameState.characters || [],
                        inventory: gameState.inventory || [],
                        skills: gameState.skills || [],
                        memory: gameState.memory || '',
                        currentLocation: gameState.currentLocation,
                        environmentalDetails: gameState.environmentalDetails
                    });
                    
                    // Update game state with examination results
                    setGameState(prev => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            currentText: examineResult.newNarrative,
                            choices: examineResult.newChoices,
                            characters: examineResult.updatedCharacters,
                            inventory: examineResult.updatedInventory || prev.inventory
                        };
                    });
                    
                    toast({
                        title: 'Discovery!',
                        description: 'You notice something interesting about your surroundings.',
                        className: "bg-amber-500 text-white"
                    });
                    break;
            }
            
        } catch (error) {
            console.error('Error in environment interaction:', error);
            toast({
                title: 'Interaction Failed',
                description: 'Something went wrong while examining the environment.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    }, [gameState, toast, handleLoreDiscovery]);

    const handleGenerateQuest = useCallback(async (
        questType?: 'ROMANCE' | 'FACTION' | 'EXPLORATION' | 'SIDE' | 'AUTO',
        targetCharacter?: string
    ) => {
        if (!gameState) return;
        
        setIsLoading(true);
        
        try {
            const { generateContextualQuest } = await import('@/ai/flows/advanced-game-manager');
            
            const result = await generateContextualQuest(
                gameState.userId || 'player',
                gameState,
                questType,
                targetCharacter
            );
            
            if (result.success) {
                toast({
                    title: 'New Quest Available!',
                    description: result.message,
                    className: "bg-green-500 text-white"
                });
                
                // Refresh game state to pick up the new quest
                const updatedGameState = await loadMostRecentGame();
                if (updatedGameState) {
                    setGameState(updatedGameState);
                }
            } else {
                toast({
                    title: 'Quest Generation Failed',
                    description: result.message,
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error generating quest:', error);
            toast({
                title: 'Error',
                description: 'Failed to generate new quest',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    }, [gameState, toast]);

    const handleAdvancedGameAction = useCallback(async (action: string, context?: any) => {
        if (!gameState) return;
        
        setIsLoading(true);
        
        try {
            const { advancedGameManager } = await import('@/ai/flows/advanced-game-manager');
            
            const result = await advancedGameManager({
                userId: gameState.userId || 'player',
                action: action as any,
                gameState: {
                    currentLocation: gameState.currentLocation,
                    characters: gameState.characters,
                    reputations: gameState.reputations,
                    activeQuests: gameState.activeQuests,
                    relationshipConflicts: gameState.relationshipConflicts,
                    discoveredLore: gameState.discoveredLore,
                },
                context
            });
            
            if (result.success) {
                toast({
                    title: 'Action Completed',
                    description: result.message,
                    className: "bg-blue-500 text-white"
                });
                
                // Apply any game state updates
                if (result.gameStateUpdates) {
                    // Refresh game state to pick up changes
                    const updatedGameState = await loadMostRecentGame();
                    if (updatedGameState) {
                        setGameState(updatedGameState);
                    }
                }
            } else {
                toast({
                    title: 'Action Failed',
                    description: result.message,
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error in advanced game action:', error);
            toast({
                title: 'Error',
                description: 'Failed to perform advanced game action',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    }, [gameState, toast]);

    const contextValue = {
        gameState,
        isLoading,
        isRewinding,
        error,
        handleStartNewGame,
        handleMakeChoice,
        handleReturnByDeath,
        handleSetCheckpoint,
        handleSaveGame,
        handleLoadGame,
        handleQuestUpdate,
        handleLoreDiscovery,
        handleReputationChange,
        handleEnvironmentInteract,
        handleGenerateQuest,
        handleAdvancedGameAction,
    };

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
};
