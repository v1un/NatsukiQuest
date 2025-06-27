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
      <div className="text-center py-6 px-4 text-muted-foreground">
        <div className="p-3 bg-muted/20 rounded-full w-fit mx-auto mb-3">
          <Users className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium">No faction relations yet</p>
        <p className="text-xs mt-1">Your reputation will build as you interact with different groups</p>
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto">
      <div className="p-3 space-y-3">
        {reputations.map((reputation) => {
          const IconComponent = getFactionIcon(reputation.faction);
          const title = getReputationTitle(reputation.faction, reputation.level);
          const colorClass = getReputationColor(reputation.level);
          const progressValue = ((reputation.level + 100) / 200) * 100; // Convert -100/100 to 0-100 scale

          return (
            <Card key={reputation.id} className="bg-card/50 border-border/30 hover:bg-card/70 transition-all duration-200 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold font-headline truncate">{reputation.faction}</CardTitle>
                    <CardDescription className="text-xs">{title}</CardDescription>
                  </div>
                  <Badge 
                    variant={reputation.level >= 0 ? 'default' : 'destructive'} 
                    className="text-xs px-2 py-0.5"
                  >
                    {reputation.level > 0 ? '+' : ''}{reputation.level}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={progressValue} 
                    className="h-1.5" 
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Hostile</span>
                    <span className={`font-medium ${colorClass}`}>{title}</span>
                    <span>Revered</span>
                  </div>
                  
                  {reputation.history && reputation.history.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/30">
                      <p className="text-xs text-muted-foreground mb-1">Recent:</p>
                      <p className="text-xs text-foreground line-clamp-2">
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
    </div>
  );
}
