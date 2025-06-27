'use client';

import React, { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { GameContext } from '@/contexts/GameContext';
import { Skeleton } from '../ui/skeleton';
import { Shield, Crown, Swords, Heart, Users } from 'lucide-react';

// Helper function to get reputation title based on level
const getReputationTitle = (faction: string, level: number): string => {
  const absLevel = Math.abs(level);
  
  if (level >= 80) return 'Revered';
  if (level >= 60) return 'Honored';
  if (level >= 40) return 'Friendly';
  if (level >= 20) return 'Liked';
  if (level >= 10) return 'Known';
  if (level >= -10) return 'Neutral';
  if (level >= -20) return 'Disliked';
  if (level >= -40) return 'Unfriendly';
  if (level >= -60) return 'Hostile';
  if (level >= -80) return 'Hated';
  return 'Despised';
};

// Helper function to get color based on reputation level
const getReputationColor = (level: number): string => {
  if (level >= 60) return 'text-green-500';
  if (level >= 20) return 'text-blue-500';
  if (level >= -20) return 'text-yellow-500';
  if (level >= -60) return 'text-orange-500';
  return 'text-red-500';
};

// Helper function to get faction icon
const getFactionIcon = (faction: string) => {
  const factionLower = faction.toLowerCase();
  if (factionLower.includes('royal') || factionLower.includes('kingdom')) return Crown;
  if (factionLower.includes('guard') || factionLower.includes('military')) return Shield;
  if (factionLower.includes('guild') || factionLower.includes('merchant')) return Users;
  if (factionLower.includes('knight') || factionLower.includes('warrior')) return Swords;
  if (factionLower.includes('romance') || factionLower.includes('relationship')) return Heart;
  return Users; // Default icon
};

export default function Reputation() {
  const context = useContext(GameContext);

  if (!context) {
    return null;
  }

  const { gameState } = context;

  if (!gameState) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-background/50 border-border/50">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
                <Skeleton className="h-5 w-[60px] rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const reputations = gameState.reputations || [];

  if (reputations.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full text-center">
        <Users className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-headline font-semibold text-foreground mb-2">
          No Faction Relations
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          As you interact with different groups and make choices, your reputation with various factions will appear here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {reputations.map((reputation) => {
          const IconComponent = getFactionIcon(reputation.faction);
          const title = getReputationTitle(reputation.faction, reputation.level);
          const colorClass = getReputationColor(reputation.level);
          const progressValue = ((reputation.level + 100) / 200) * 100; // Convert -100/100 to 0-100 scale

          return (
            <Card key={reputation.id} className="bg-background/50 border-border/50 hover:bg-background/70 transition-colors">
              <CardHeader className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded bg-primary/10">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base font-bold font-headline">{reputation.faction}</CardTitle>
                    <CardDescription className="text-xs">{title}</CardDescription>
                  </div>
                  <Badge 
                    variant={reputation.level >= 0 ? 'default' : 'destructive'} 
                    className="text-xs px-2 py-1"
                  >
                    {reputation.level > 0 ? '+' : ''}{reputation.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Standing</span>
                    <span className={`font-medium ${colorClass}`}>{title}</span>
                  </div>
                  <Progress 
                    value={progressValue} 
                    className="h-2" 
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Despised</span>
                    <span>Neutral</span>
                    <span>Revered</span>
                  </div>
                  {reputation.history && reputation.history.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Recent Activity:</p>
                      <p className="text-xs text-foreground">
                        {reputation.history[reputation.history.length - 1].reason}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
