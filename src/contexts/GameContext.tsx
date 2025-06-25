'use client';

import React, { createContext, useState, useCallback, ReactNode } from 'react';
import type { GameState } from '@/lib/types';
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
    };

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
};
