'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameState } from '@/lib/types';
import { startNewGame, makeChoice, triggerReturnByDeath } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, Dices, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

export default function GameClient() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRewinding, setIsRewinding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { setOpen: setLeftSidebarOpen } = useSidebar();
  const { setOpenMobile: setRightSidebarOpen } = useSidebar();


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

  useEffect(() => {
    handleStartNewGame();
  }, [handleStartNewGame]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [gameState?.narrative]);

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
  }
  
  const handleSetCheckpoint = () => {
    if (!gameState) return;
    setGameState(prev => prev ? {...prev, checkpoint: JSON.parse(JSON.stringify(prev))} : null);
    toast({
        title: "Checkpoint Set",
        description: "Your current state has been saved as a checkpoint for 'Return by Death'.",
    });
  }
  
  // This is a placeholder for context, actual state is managed in the parent GameClient
  const GameContext = {
    gameState,
    handleStartNewGame,
    handleReturnByDeath,
    handleSetCheckpoint,
    setRightSidebarOpen,
    setLeftSidebarOpen
  };

  if (isLoading && !gameState) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="font-headline text-lg">Loading the threads of fate...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-destructive">
            <AlertTriangle className="h-12 w-12" />
            <p className="font-headline text-lg">A fatal error has occurred.</p>
            <p className="text-sm">{error}</p>
            <Button onClick={handleStartNewGame}>Restart Adventure</Button>
        </div>
    );
  }
  
  if (!gameState) return null;

  return (
    <div className={cn("relative flex flex-col h-full max-h-screen overflow-hidden", isRewinding && "rewinding")}>
       <header className="flex-shrink-0 p-4 border-b flex justify-between items-center bg-background/80 backdrop-blur-sm">
         <div className="flex items-center gap-2">
           <Dices className="w-6 h-6 text-primary" />
           <h1 className="font-headline text-xl font-bold">Natsuki Quest</h1>
         </div>
         <div className="text-sm text-muted-foreground font-medium">Loop: {gameState.currentLoop}</div>
       </header>

      <ScrollArea className="flex-grow" ref={scrollAreaRef}>
        <div className="prose prose-lg dark:prose-invert max-w-none p-8 md:p-12 leading-relaxed font-body">
            <AnimatePresence mode="wait">
                <motion.div
                    key={gameState.narrative}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    dangerouslySetInnerHTML={{ __html: gameState.narrative.replace(/\n/g, '<br />') }}
                />
            </AnimatePresence>
        </div>
      </ScrollArea>

      <footer className="flex-shrink-0 p-4 md:p-6 border-t bg-background/80 backdrop-blur-sm">
        <AnimatePresence>
            <motion.div
                key={gameState.isGameOver ? 'dead' : 'alive'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center gap-4"
            >
                {isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>The AI is writing your fate...</span>
                    </div>
                ) : gameState.isGameOver ? (
                    <div className="text-center">
                        <p className="font-bold text-destructive mb-2">You have met a terrible end.</p>
                        <Button onClick={handleReturnByDeath} className="bg-primary hover:bg-primary/90">
                           Return by Death
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
                    {gameState.choices.map((choice, index) => (
                        <Button
                        key={index}
                        variant="outline"
                        className="text-base p-6 text-left justify-start w-full whitespace-normal h-auto hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleMakeChoice(choice)}
                        disabled={isLoading}
                        >
                        {choice}
                        </Button>
                    ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
      </footer>
    </div>
  );
}
