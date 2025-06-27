'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  Heart, 
  Globe, 
  Package, 
  Sparkles, 
  BookOpen, 
  Users, 
  MapPin,
  ChevronDown,
  Star
} from 'lucide-react';
import CharacterBonds from './CharacterBonds';
import Inventory from './Inventory';
import Skills from './Skills';
import Reputation from './Reputation';
import EnvironmentalDetails from './EnvironmentalDetails';
import { motion, AnimatePresence } from 'framer-motion';

export default function RightSidebar() {
  const [activeTab, setActiveTab] = useState('progress');

  return (
    <>
      <SidebarHeader className="border-b border-border/50 bg-sidebar/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-1">
          <div className="relative">
            <BookOpen className="w-6 h-6 text-primary"/>
            <div className="absolute inset-0 w-6 h-6 bg-primary/20 rounded-full blur-sm animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-headline font-bold text-sidebar-foreground">
              Player Status
            </h2>
            <p className="text-xs text-muted-foreground">
              Track your journey
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          {/* Improved Tab Navigation */}
          <div className="p-4 pb-2">
            <TabsList className="grid w-full grid-cols-3 bg-sidebar-accent/50 border border-border/30 rounded-lg p-1 h-12">
              <TabsTrigger 
                value="progress" 
                className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
              <TabsTrigger 
                value="bonds" 
                className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Bonds</span>
              </TabsTrigger>
              <TabsTrigger 
                value="world" 
                className="flex items-center gap-2 text-sm font-medium rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">World</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-grow"
            >
              {/* Progress Tab - Skills + Inventory */}
              <TabsContent value="progress" className="flex-grow mt-0 h-full">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-6">
                    {/* Skills Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm text-foreground">Skills & Abilities</h3>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <div className="bg-card/30 backdrop-blur-sm rounded-lg border border-border/50 overflow-hidden">
                        <Skills />
                      </div>
                    </div>

                    <Separator className="bg-border/50" />

                    {/* Inventory Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm text-foreground">Inventory</h3>
                        <Badge variant="outline" className="ml-auto text-xs">
                          Items
                        </Badge>
                      </div>
                      <div className="bg-card/30 backdrop-blur-sm rounded-lg border border-border/50 overflow-hidden">
                        <Inventory />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Bonds Tab - Character Relationships */}
              <TabsContent value="bonds" className="flex-grow mt-0 h-full">
                <div className="p-4 pb-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <Heart className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">Character Relationships</h3>
                  </div>
                </div>
                <CharacterBonds />
              </TabsContent>

              {/* World Tab - Reputation + Environment */}
              <TabsContent value="world" className="flex-grow mt-0 h-full">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-6">
                    {/* Reputation Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm text-foreground">Reputation</h3>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Status
                        </Badge>
                      </div>
                      <div className="bg-card/30 backdrop-blur-sm rounded-lg border border-border/50 overflow-hidden">
                        <Reputation />
                      </div>
                    </div>

                    <Separator className="bg-border/50" />

                    {/* Environment Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-md">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm text-foreground">Environment</h3>
                        <Badge variant="outline" className="ml-auto text-xs">
                          Current
                        </Badge>
                      </div>
                      <div className="bg-card/30 backdrop-blur-sm rounded-lg border border-border/50 overflow-hidden">
                        <EnvironmentalDetails />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 bg-sidebar/95 backdrop-blur-sm">
        <div className="px-4 py-3 text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            Your choices define your path
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground/60">
            <Star className="w-3 h-3" />
            <span>Every decision matters</span>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
}
