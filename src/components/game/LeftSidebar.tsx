'use client';

import React, { useContext } from 'react';
import { 
    FilePlus, 
    Save, 
    FolderOpen, 
    RotateCcw, 
    Flag, 
    LogIn,
    LogOut
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
import { useToast } from '@/hooks/use-toast';
import { useSession, signIn, signOut } from 'next-auth/react';
import { GameContext } from '@/contexts/GameContext';


export default function LeftSidebar() {
    const { toast } = useToast();
    const { data: session, status } = useSession();
    const gameContext = useContext(GameContext);
    
    if (!gameContext) {
        return null;
    }

    const { 
        handleStartNewGame, 
        handleLoadGame, 
        handleSaveGame,
        handleSetCheckpoint,
        handleReturnByDeath,
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
    </>
  );
}
