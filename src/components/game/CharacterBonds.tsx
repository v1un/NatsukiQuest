'use client';

import React, { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { GameContext } from '@/contexts/GameContext';
import { Skeleton } from '../ui/skeleton';
import { useLocationAwareCharacters, useCharacterLocationStats } from '@/hooks/useLocationAwareCharacters';


export default function CharacterBonds() {
  const context = useContext(GameContext);

  if (!context) {
    return null; // Or some loading state
  }

  const { gameState } = context;

  if (!gameState) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                </div>
            </div>
        ))}
      </div>
    );
  }

  // Use the location-aware characters hook
  const { charactersInLocation, locationSummary } = useLocationAwareCharacters(gameState);
  const { otherLocations } = useCharacterLocationStats(gameState);

  // Helper function to get character-specific color
  const getCharacterColor = (name: string, affinity: number) => {
    const colors = {
      'Emilia': 'from-blue-400 to-blue-600',
      'Rem': 'from-blue-500 to-purple-500', 
      'Ram': 'from-pink-400 to-red-400',
      'Beatrice': 'from-yellow-400 to-orange-500',
      'Roswaal': 'from-purple-500 to-indigo-600',
      'Puck': 'from-cyan-300 to-blue-400'
    };
    return colors[name as keyof typeof colors] || 'from-primary to-accent';
  };

  const getAffinityLabel = (affinity: number) => {
    if (affinity >= 80) return { label: 'Devoted', color: 'text-green-500' };
    if (affinity >= 60) return { label: 'Close', color: 'text-blue-500' };
    if (affinity >= 40) return { label: 'Friendly', color: 'text-purple-500' };
    if (affinity >= 20) return { label: 'Neutral', color: 'text-gray-500' };
    return { label: 'Distant', color: 'text-red-500' };
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        {/* Location header */}
        <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">📍 {locationSummary.currentLocation}</p>
              <p className="text-xs text-muted-foreground">
                {locationSummary.charactersHere === 0 
                  ? "No characters here" 
                  : `${locationSummary.charactersHere} character${locationSummary.charactersHere !== 1 ? 's' : ''} present`
                }
              </p>
            </div>
            {locationSummary.totalCharacters > locationSummary.charactersHere && (
              <Badge variant="outline" className="text-xs">
                {locationSummary.charactersElsewhere} elsewhere
              </Badge>
            )}
          </div>
        </div>
        {charactersInLocation.map((char, index) => {
          const affinityInfo = getAffinityLabel(char.affinity);
          return (
            <Card 
              key={char.name} 
              className="bg-card/80 backdrop-blur-sm border-border/60 hover:bg-card/90 transition-all duration-200 hover:shadow-md group"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-14 h-14 ring-2 ring-border/50 group-hover:ring-primary/30 transition-all duration-200">
                      <AvatarImage 
                        src={char.avatar} 
                        alt={char.name} 
                        data-ai-hint={`${char.name} anime character portrait from Re:Zero`}
                        className="object-cover"
                      />
                      <AvatarFallback className={`bg-gradient-to-br ${getCharacterColor(char.name, char.affinity)} text-white font-bold`}>
                        {char.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {/* Affinity glow effect */}
                    <div 
                      className="absolute inset-0 rounded-full opacity-20 blur-sm animate-pulse"
                      style={{
                        background: char.affinity >= 60 ? 'hsl(var(--primary))' : 
                                   char.affinity >= 30 ? 'hsl(var(--muted-foreground))' : 
                                   'hsl(var(--destructive))'
                      }}
                    ></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="character-name text-lg truncate">
                      {char.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground truncate">
                      {char.status}
                    </CardDescription>
                    <div className={`text-xs font-medium ${affinityInfo.color} mt-1`}>
                      {affinityInfo.label}
                    </div>
                    {char.currentLocation && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        📍 {char.currentLocation}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="narrative-text text-sm text-foreground/80 mb-3 line-clamp-2">
                  {char.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Affinity</span>
                    <span className={`font-bold ${affinityInfo.color}`}>
                      {char.affinity}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={char.affinity} 
                      className="h-2.5 bg-muted/50"
                    />
                    {/* Custom gradient overlay for progress bar */}
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r opacity-80 transition-all duration-500"
                      style={{
                        width: `${char.affinity}%`,
                        background: char.affinity >= 60 ? 
                          'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))' :
                          char.affinity >= 30 ?
                          'linear-gradient(90deg, hsl(var(--muted-foreground)), hsl(var(--primary)))' :
                          'linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--muted-foreground)))'
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {charactersInLocation.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No characters in this location.</p>
            <p className="text-xs mt-1">
              {locationSummary.totalCharacters === 0 
                ? "Interact with characters to build bonds."
                : `Characters you know are in other locations. Current: ${locationSummary.currentLocation}`
              }
            </p>
            {locationSummary.charactersElsewhere > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium mb-2">Characters elsewhere ({locationSummary.charactersElsewhere}):</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {otherLocations.slice(0, 3).map(location => (
                    <Badge key={location} variant="outline" className="text-xs">
                      {location}
                    </Badge>
                  ))}
                  {otherLocations.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{otherLocations.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
