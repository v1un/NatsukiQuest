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
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={session?.user?.image ?? `https://placehold.co/40x40.png`} alt={session?.user?.name ?? "User"} data-ai-hint="user avatar" />
            <AvatarFallback>{session?.user?.name?.substring(0, 2).toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">{session?.user?.name ?? 'Guest'}</span>
            <span className="text-xs text-muted-foreground">{isAuthenticated ? 'Player' : 'Not Logged In'}</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleStartNewGame} tooltip="Start a fresh adventure from the beginning.">
              <FilePlus />
              <span>New Game</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onSave} disabled={!isAuthenticated} tooltip={isAuthenticated ? "Save your current progress." : "Login to save."}>
              <Save />
              <span>Save Game</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLoad} disabled={!isAuthenticated} tooltip={isAuthenticated ? "Load your most recent game." : "Login to load."}>
              <FolderOpen />
              <span>Load Game</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-4" />

        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIsLorebookOpen(true)} tooltip="View discovered lore and world knowledge [L]">
                    <BookOpen />
                    <span>Lorebook</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setIsQuestJournalOpen(true)} tooltip="Track active and completed quests [Q]">
                    <Scroll />
                    <span>Quest Journal</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton 
                    onClick={() => handleGenerateQuest('AUTO')} 
                    disabled={!isAuthenticated}
                    tooltip={isAuthenticated ? "Generate a new side quest based on your current situation" : "Login to generate quests"}
                >
                    <Compass />
                    <span>Generate Quest</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-4" />

        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSetCheckpoint} tooltip="Set the current moment as your return point.">
                    <Flag />
                    <span>Set Checkpoint</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleReturnByDeath} className="text-destructive-foreground bg-destructive hover:bg-destructive/90" tooltip="Rewind time to your last checkpoint.">
                    <RotateCcw />
                    <span>Return by Death</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="my-2"/>
        <SidebarMenu>
            {isAuthenticated ? (
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => signOut()} tooltip="Logout of your account.">
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ) : (
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => signIn('discord')} tooltip="Login with Discord.">
                        <LogIn />
                        <span>Login</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
        </SidebarMenu>
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
