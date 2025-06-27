'use client';

import { useContext, useEffect, useRef, useState } from 'react';
import { GameContext } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, Dices, AlertTriangle, Bug, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import CharacterSystemStatus from '@/components/dev/CharacterSystemStatus';

export default function GameScreen() {
    const context = useContext(GameContext);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { setOpen: setLeftSidebarOpen } = useSidebar();
    const { setOpenMobile: setRightSidebarOpen } = useSidebar();
    
    // Development debug UI toggle
    const [showDebugUI, setShowDebugUI] = useState(false);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [context?.gameState?.narrative]);

    // Add keyboard shortcut for debug UI toggle (Ctrl+D in development)
    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;
        
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'd' && !event.altKey && !event.shiftKey) {
                event.preventDefault();
                setShowDebugUI(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


    if (!context) {
        return <div className="flex h-full items-center justify-center">Context not available</div>;
    }

    const { gameState, isLoading, isRewinding, error, handleStartNewGame, handleMakeChoice } = context;

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
        <div className="flex h-full flex-col items-center justify-center gap-6 text-muted-foreground bg-gradient-to-br from-background via-rezero-mansion/5 to-background">
            <div className="relative">
                <Dices className="h-16 w-16 text-primary drop-shadow-lg" />
                <div className="absolute inset-0 h-16 w-16 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <div className="text-center space-y-3">
                <p className="font-headline text-2xl font-bold text-primary">Ready to begin?</p>
                <p className="text-muted-foreground max-w-md">
                    Your story awaits in the world of Re:Zero. Every choice matters, every death teaches.
                </p>
            </div>
            <Button 
                onClick={handleStartNewGame}
                className="choice-button bg-gradient-to-r from-primary to-rezero-royal hover:from-primary/90 hover:to-rezero-royal/90 text-primary-foreground px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl"
            >
                Begin New Adventure
            </Button>
        </div>
    );

    return (
        <div className={cn("relative flex flex-col h-full max-h-screen overflow-hidden bg-gradient-to-b from-background to-rezero-mansion/10", isRewinding && "rewinding")}>
            {/* Enhanced Header */}
            <header className="flex-shrink-0 p-4 border-b border-border/50 flex justify-between items-center bg-background/95 backdrop-blur-md shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Dices className="w-7 h-7 text-primary drop-shadow-sm" />
                        <div className="absolute inset-0 w-7 h-7 bg-primary/20 rounded-full blur-md animate-pulse"></div>
                    </div>
                    <h1 className="font-headline text-xl font-bold bg-gradient-to-r from-primary to-rezero-royal bg-clip-text text-transparent">
                        Natsuki Quest
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground font-medium bg-muted/50 px-3 py-1 rounded-full">
                        Loop: <span className="font-bold text-primary">{gameState.currentLoop}</span>
                    </div>
                </div>
            </header>

            {/* Enhanced Story Area */}
            <ScrollArea className="flex-grow" ref={scrollAreaRef}>
                <div className="relative min-h-full">
                    {/* Background gradient for story area */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/5 to-background/10 pointer-events-none"></div>
                    
                    <div className="prose-game relative z-10 p-8 md:p-12">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={gameState.narrative}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="space-y-4"
                                dangerouslySetInnerHTML={{ 
                                    __html: gameState.narrative
                                        .replace(/\n/g, '<br />')
                                        .replace(/\*([^*]+)\*/g, '<em class="magic-text">$1</em>')
                                        .replace(/\*\*([^*]+)\*\*/g, '<strong class="character-name">$1</strong>')
                                }}
                            />
                        </AnimatePresence>
                    </div>
                </div>
            </ScrollArea>

            {/* Enhanced Footer with Choice System */}
            <footer className="flex-shrink-0 p-4 md:p-6 border-t border-border/50 bg-background/95 backdrop-blur-md shadow-lg">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={gameState.isGameOver ? 'dead' : 'alive'}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex flex-col items-center justify-center gap-4"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-3 text-muted-foreground p-4">
                                <Loader className="h-5 w-5 animate-spin text-primary" />
                                <span className="font-medium">The AI is weaving your fate...</span>
                            </div>
                        ) : gameState.isGameOver ? (
                            <div className="text-center space-y-4 p-4">
                                <div className="space-y-2">
                                    <p className="danger-text text-lg font-bold">You have met a terrible end.</p>
                                    <p className="text-muted-foreground text-sm">The AI Game Master will determine your fate...</p>
                                </div>
                                <div className="text-muted-foreground text-sm space-y-1">
                                    <p>⟲ Return by Death is now controlled by the AI Narrator</p>
                                    <p>The story will continue based on narrative needs</p>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full max-w-5xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                    {gameState.choices.map((choice, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <Button
                                                variant="outline"
                                                className="choice-button text-base p-4 md:p-6 text-left justify-start w-full whitespace-normal h-auto min-h-[4rem] border-2 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200 group relative overflow-hidden"
                                                onClick={() => handleMakeChoice(choice)}
                                                disabled={isLoading}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                <span className="relative z-10">{choice}</span>
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>
                                {gameState.choices.length > 0 && (
                                    <p className="text-xs text-muted-foreground text-center mt-4 opacity-60">
                                        Choose wisely. Every decision shapes your destiny.
                                    </p>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </footer>
            
            {/* Development-only debug UI toggle button */}
            {process.env.NODE_ENV === 'development' && (
                <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-1">
                    <Button
                        size="sm"
                        variant={showDebugUI ? "default" : "outline"}
                        className="bg-background/90 backdrop-blur-sm border shadow-lg"
                        onClick={() => setShowDebugUI(!showDebugUI)}
                        title="Toggle Debug UI (Ctrl+D)"
                    >
                        {showDebugUI ? <X className="h-4 w-4" /> : <Bug className="h-4 w-4" />}
                        <span className="ml-2 text-xs">DEBUG</span>
                    </Button>
                    {!showDebugUI && (
                        <div className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded border text-right">
                            Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+D</kbd>
                        </div>
                    )}
                </div>
            )}

            {/* Development-only character system status */}
            {process.env.NODE_ENV === 'development' && (
                <AnimatePresence>
                    {showDebugUI && (
                        <motion.div
                            initial={{ opacity: 0, x: 300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 300 }}
                            transition={{ duration: 0.3 }}
                            className="fixed top-20 right-4 max-w-md max-h-[calc(100vh-6rem)] overflow-y-auto z-40"
                        >
                            <CharacterSystemStatus onClose={() => setShowDebugUI(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}
