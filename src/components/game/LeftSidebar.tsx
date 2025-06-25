'use client';

import { 
    FilePlus, 
    Save, 
    FolderOpen, 
    ClockRewind, 
    Flag, 
    Settings,
    Github,
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

// Dummy context values for now. This would be replaced by real context/state management.
const handleStartNewGame = () => console.log("Start New Game");
const handleReturnByDeath = () => console.log("Return by Death");
const handleSetCheckpoint = () => console.log("Set Checkpoint");

export default function LeftSidebar() {
    const { toast } = useToast();

    const showToast = (title: string) => {
        toast({
            title: "Feature Not Implemented",
            description: `${title} functionality is not available in this demo.`,
        });
    }

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://placehold.co/40x40.png" alt="Subaru Natsuki" data-ai-hint="anime character" />
            <AvatarFallback>SN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">Natsuki Subaru</span>
            <span className="text-xs text-muted-foreground">Player</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => window.location.reload()} tooltip="Start a fresh adventure from the beginning.">
              <FilePlus />
              <span>New Game</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => showToast('Save Game')} tooltip="Save your current progress. (Not Implemented)">
              <Save />
              <span>Save Game</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => showToast('Load Game')} tooltip="Load a previously saved game. (Not Implemented)">
              <FolderOpen />
              <span>Load Game</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-4" />

        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={() => showToast('Set Checkpoint')} tooltip="Set the current moment as your return point.">
                    <Flag />
                    <span>Set Checkpoint</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={() => showToast('Return by Death')} className="text-destructive-foreground bg-destructive hover:bg-destructive/90" tooltip="Rewind time to your last checkpoint.">
                    <ClockRewind />
                    <span>Return by Death</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="my-2"/>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={() => showToast('Settings')} tooltip="Adjust game settings. (Not Implemented)">
                    <Settings/>
                    <span>Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={() => showToast('Logout')} tooltip="Logout of your account. (Not Implemented)">
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
