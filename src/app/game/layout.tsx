import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import LeftSidebar from "@/components/game/LeftSidebar";
import RightSidebar from "@/components/game/RightSidebar";
import { GameProvider } from "@/contexts/GameContext";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <GameProvider>
      <SidebarProvider>
        <Sidebar side="left" collapsible="icon" className="w-64">
          <LeftSidebar />
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
        <Sidebar side="right" collapsible="offcanvas" className="w-80">
          <RightSidebar />
        </Sidebar>
      </SidebarProvider>
    </GameProvider>
  );
}
