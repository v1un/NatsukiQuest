'use client';

import React, { useContext, useState, useEffect } from 'react';
import { 
    FilePlus, 
    Save, 
    FolderOpen, 
    RotateCcw, 
    Flag, 
    LogIn,
    LogOut,
    BookOpen,
    Scroll,
    Compass
} from 'lucide-react';
import { 
    SidebarHeader, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton, 
    SidebarContent,
    SidebarFooter, 
    SidebarSeparator
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSession, signIn, signOut } from 'next-auth/react';
import { GameContext } from '@/contexts/GameContext';
import LorebookViewer from './LorebookViewer';
import QuestJournal from './QuestJournal';
import type { LoreEntry } from '@/lib/types';

// Placeholder lore data - in production this would come from a database
const sampleLoreEntries: LoreEntry[] = [
  {
    id: 'lore_1',
    title: 'Return by Death',
    content: 'Subaru\'s unique ability to return to a specific point in time upon death. Only he retains memories of previous loops.',
    category: 'Magic',
    tags: ['subaru', 'time', 'death', 'ability'],
    isDiscovered: true,
    discoveredAt: new Date(),
    characters: ['Subaru']
  },
  {
    id: 'lore_2', 
    title: 'Royal Selection',
    content: 'The process to choose the next ruler of Lugunica. Five candidates compete for the throne.',
    category: 'Politics',
    tags: ['throne', 'candidates', 'lugunica'],
    isDiscovered: true,
    discoveredAt: new Date(),
    characters: ['Emilia', 'Felt', 'Priscilla', 'Crusch', 'Anastasia']
  }
];

export default function LeftSidebar() {
    const { toast } = useToast();
    const { data: session, status } = useSession();
    const gameContext = useContext(GameContext);
    const [isLorebookOpen, setIsLorebookOpen] = useState(false);
    const [isQuestJournalOpen, setIsQuestJournalOpen] = useState(false);
    
    if (!gameContext) {
        return null;
    }

    const { 
        handleStartNewGame, 
        handleLoadGame, 
        handleSaveGame,
        handleSetCheckpoint,
        handleReturnByDeath,
        handleGenerateQuest,
     } = gameContext;

    const isAuthenticated = status === 'authenticated';

    const onSave = async () => {
        if (!isAuthenticated) {
            toast({ variant: 'destructive', title: "Not logged in", description: "You must be logged in to save." });
            return;
        }
        await handleSaveGame();
    }

    const onLoad = async () => {
        if (!isAuthenticated) {
            toast({ variant: 'destructive', title: "Not logged in", description: "You must be logged in to load." });
            return;
        }
        await handleLoadGame();
    }

    // Keyboard shortcuts for modals
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only trigger if no input fields are focused and no modifiers except shift
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return;
            }
            
            if (event.ctrlKey || event.altKey || event.metaKey) {
                return;
            }
            
            switch (event.key.toLowerCase()) {
                case 'l':
                    event.preventDefault();
                    setIsLorebookOpen(true);
                    break;
                case 'q':
                    event.preventDefault();
                    setIsQuestJournalOpen(true);
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

  return (
    <>
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="ring-2 ring-sidebar-border/30">
              <AvatarImage 
                src={session?.user?.image ?? `https://placehold.co/40x40.png`} 
                alt={session?.user?.name ?? "User"} 
                data-ai-hint="user avatar"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                {session?.user?.name?.substring(0, 2).toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            {isAuthenticated && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-sidebar-background rounded-full"></div>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-semibold text-sidebar-foreground truncate">
              {session?.user?.name ?? 'Guest'}
            </span>
            <span className={`text-xs font-medium ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
              {isAuthenticated ? 'Connected' : 'Not Logged In'}
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-3 space-y-4">
        {/* Game Management Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-2">
            Game Management
          </h3>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleStartNewGame} 
                tooltip="Start a fresh adventure from the beginning."
                className="hover:bg-sidebar-accent/10 hover:text-sidebar-accent transition-colors"
              >
                <FilePlus className="w-4 h-4" />
                <span>New Game</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={onSave} 
                disabled={!isAuthenticated} 
                tooltip={isAuthenticated ? "Save your current progress." : "Login to save."}
                className="hover:bg-sidebar-accent/10 hover:text-sidebar-accent transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save Game</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={onLoad} 
                disabled={!isAuthenticated} 
                tooltip={isAuthenticated ? "Load your most recent game." : "Login to load."}
                className="hover:bg-sidebar-accent/10 hover:text-sidebar-accent transition-colors disabled:opacity-50"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Load Game</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <SidebarSeparator className="bg-sidebar-border/30" />

        {/* Exploration Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-2">
            Exploration
          </h3>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => setIsLorebookOpen(true)} 
                tooltip="View discovered lore and world knowledge [L]"
                className="hover:bg-sidebar-accent/10 hover:text-sidebar-accent transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Lorebook</span>
                <span className="text-xs opacity-60 ml-auto">L</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => setIsQuestJournalOpen(true)} 
                tooltip="Track active and completed quests [Q]"
                className="hover:bg-sidebar-accent/10 hover:text-sidebar-accent transition-colors"
              >
                <Scroll className="w-4 h-4" />
                <span>Quest Journal</span>
                <span className="text-xs opacity-60 ml-auto">Q</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => handleGenerateQuest('AUTO')} 
                disabled={!isAuthenticated}
                tooltip={isAuthenticated ? "Generate a new side quest based on your current situation" : "Login to generate quests"}
                className="hover:bg-sidebar-accent/10 hover:text-sidebar-accent transition-colors disabled:opacity-50"
              >
                <Compass className="w-4 h-4" />
                <span>Generate Quest</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <SidebarSeparator className="bg-sidebar-border/30" />

        {/* Time Magic Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-2">
            Time Magic
          </h3>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleSetCheckpoint} 
                tooltip="Set the current moment as your return point."
                className="hover:bg-sidebar-accent/10 hover:text-sidebar-accent transition-colors"
              >
                <Flag className="w-4 h-4" />
                <span>Set Checkpoint</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleReturnByDeath} 
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group"
                tooltip="Rewind time to your last checkpoint."
              >
                <RotateCcw className="w-4 h-4 group-hover:animate-spin" />
                <span>Return by Death</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border/50">
        <SidebarMenu>
          {isAuthenticated ? (
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => signOut()} 
                tooltip="Logout of your account."
                className="hover:bg-red-500/10 hover:text-red-400 transition-colors text-sidebar-foreground/80"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => signIn('discord')} 
                tooltip="Login with Discord."
                className="hover:bg-sidebar-accent/10 hover:text-sidebar-accent transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        
        {/* Version/Credits */}
        <div className="mt-2 pt-2 border-t border-sidebar-border/30">
          <p className="text-xs text-sidebar-foreground/40 text-center">
            Natsuki Quest v1.0
          </p>
        </div>
      </SidebarFooter>
      
      {/* Lorebook Modal */}
      <Dialog open={isLorebookOpen} onOpenChange={setIsLorebookOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Lorebook
            </DialogTitle>
          </DialogHeader>
          {gameContext.gameState && (
            <LorebookViewer 
              loreEntries={sampleLoreEntries}
              discoveredLoreIds={gameContext.gameState.discoveredLore}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Quest Journal Modal */}
      <Dialog open={isQuestJournalOpen} onOpenChange={setIsQuestJournalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scroll className="h-5 w-5" />
              Quest Journal
            </DialogTitle>
          </DialogHeader>
          {gameContext.gameState && (
            <QuestJournal 
              activeQuests={gameContext.gameState.activeQuests}
              completedQuests={gameContext.gameState.completedQuests}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
