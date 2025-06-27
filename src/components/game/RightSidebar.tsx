'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { Heart, Package, Sparkles, BookOpen, Users, MapPin } from 'lucide-react';
import CharacterBonds from './CharacterBonds';
import Inventory from './Inventory';
import Skills from './Skills';
import Reputation from './Reputation';
import EnvironmentalDetails from './EnvironmentalDetails';

export default function RightSidebar() {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary"/>
          <h2 className="text-lg font-headline font-semibold text-sidebar-foreground">Player Status</h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-0">
        <Tabs defaultValue="bonds" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5 mx-2 self-center bg-sidebar-accent text-xs">
            <TabsTrigger value="bonds"><Heart className="w-4 h-4 mr-1" />Bonds</TabsTrigger>
            <TabsTrigger value="inventory"><Package className="w-4 h-4 mr-1"/>Inventory</TabsTrigger>
            <TabsTrigger value="skills"><Sparkles className="w-4 h-4 mr-1"/>Skills</TabsTrigger>
            <TabsTrigger value="reputation"><Users className="w-4 h-4 mr-1"/>Reputation</TabsTrigger>
            <TabsTrigger value="environment"><MapPin className="w-4 h-4 mr-1"/>Environment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bonds" className="flex-grow mt-0">
            <CharacterBonds />
          </TabsContent>
          <TabsContent value="reputation" className="flex-grow mt-0">
            <Reputation />
          </TabsContent>
          <TabsContent value="environment" className="flex-grow mt-0">
            <EnvironmentalDetails />
          </TabsContent>
          <TabsContent value="inventory" className="flex-grow mt-0">
            <Inventory />
          </TabsContent>
          <TabsContent value="skills" className="flex-grow mt-0">
            <Skills />
          </TabsContent>
        </Tabs>
      </SidebarContent>

      <SidebarFooter>
        <p className="text-xs text-muted-foreground text-center p-2">
          Your actions and relationships shape your journey.
        </p>
      </SidebarFooter>
    </>
  );
}
