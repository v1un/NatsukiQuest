'use client';

import { useContext, useEffect, useRef } from 'react';
import { GameContext } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, Dices, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';

export default function GameScreen() {
    const context = useContext(GameContext);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { setOpen: setLeftSidebarOpen } = useSidebar();
    const { setOpenMobile: setRightSidebarOpen } = useSidebar();

    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [context?.gameState?.narrative]);


    if (!context) {
        return <div className="flex h-full items-center justify-center">Context not available</div>;
    }

    const { gameState, isLoading, isRewinding, error, handleStartNewGame, handleMakeChoice, handleReturnByDeath } = context;

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

    if (!gameState) return (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
            <Dices className="h-12 w-12 text-primary" />
            <p className="font-headline text-lg">Start your adventure!</p>
            <Button onClick={handleStartNewGame}>New Game</Button>
        </div>
    );

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
