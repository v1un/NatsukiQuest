'use client';

import React, { useContext, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { GameContext } from '@/contexts/GameContext';
import { Skeleton } from '../ui/skeleton';
import { Eye, Hand, MapPin, Book, Compass, Search, Loader2 } from 'lucide-react';

// Helper function to get interaction type icon
const getInteractionIcon = (interactionType: string) => {
  switch (interactionType) {
    case 'EXAMINE':
      return Eye;
    case 'INTERACT':
      return Hand;
    case 'LORE':
      return Book;
    case 'QUEST':
      return Compass;
    default:
      return Search;
  }
};

// Helper function to get interaction type color
const getInteractionColor = (interactionType: string) => {
  switch (interactionType) {
    case 'EXAMINE':
      return 'text-blue-500';
    case 'INTERACT':
      return 'text-green-500';
    case 'LORE':
      return 'text-purple-500';
    case 'QUEST':
      return 'text-orange-500';
    default:
      return 'text-gray-500';
  }
};

export default function EnvironmentalDetails() {
  const context = useContext(GameContext);
  const [interactingWith, setInteractingWith] = useState<string | null>(null);

  if (!context) {
    return null;
  }

  const { gameState, handleEnvironmentInteract, isLoading } = context;

  if (!gameState) {
    return (
      <div className="p-4 space-y-4">
        <Card className="bg-background/50 border-border/50">
          <CardHeader className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-5 w-[140px]" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Skeleton className="h-16 w-full mb-3" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-background/50 border-border/50">
            <CardHeader className="p-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-5 w-[60px] rounded-full ml-auto" />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const currentLocation = gameState.currentLocation || 'Unknown Location';
  const environmentalDetails = gameState.environmentalDetails || [];
  
  // Filter environmental details for current location
  const currentLocationDetails = environmentalDetails.filter(
    detail => detail.location === currentLocation
  );

  const handleInteraction = async (environmentId: string, interactionType: string) => {
    setInteractingWith(environmentId);
    try {
      await handleEnvironmentInteract(environmentId, interactionType);
    } finally {
      setInteractingWith(null);
    }
  };

  return (
    <div className="max-h-64 overflow-y-auto">
      <div className="p-3 space-y-3">
        {/* Current Location Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-semibold font-headline truncate">{currentLocation}</CardTitle>
                <CardDescription className="text-xs">Current Location</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-xs h-7"
                onClick={() => {
                  console.log('Examining current location:', currentLocation);
                }}
              >
                <Eye className="w-3 h-3" />
                Look
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 text-xs h-7"
                onClick={() => {
                  console.log('Searching current location:', currentLocation);
                }}
              >
                <Search className="w-3 h-3" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Details */}
        {currentLocationDetails.length > 0 ? (
          <>
            {currentLocationDetails.map((detail) => {
              const IconComponent = getInteractionIcon(detail.interactionType);
              const iconColor = getInteractionColor(detail.interactionType);

              return (
                <Card 
                  key={detail.id} 
                  className={`bg-card/50 border-border/30 hover:bg-card/70 transition-all duration-200 shadow-sm ${
                    detail.isDiscovered ? 'border-l-2 border-l-primary/60' : ''
                  } ${
                    interactingWith === detail.id ? 'ring-1 ring-primary/50' : ''
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className={`w-4 h-4 ${iconColor}`} />
                      <CardTitle className="text-sm font-medium flex-1 truncate">
                        {detail.interactionType.charAt(0) + detail.interactionType.slice(1).toLowerCase()}
                      </CardTitle>
                      <Badge 
                        variant={detail.isDiscovered ? 'default' : 'secondary'} 
                        className="text-xs px-1.5 py-0.5"
                      >
                        {detail.isDiscovered ? '✓' : '?'}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {detail.isDiscovered 
                        ? detail.description 
                        : 'Something catches your attention here.'
                      }
                    </p>
                    
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 text-xs h-6 px-2"
                        onClick={() => handleInteraction(detail.id, 'EXAMINE')}
                        disabled={(detail.isDiscovered && detail.interactionType === 'EXAMINE') || interactingWith === detail.id || isLoading}
                      >
                        {interactingWith === detail.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        Examine
                      </Button>
                      {detail.interactionType !== 'EXAMINE' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 text-xs h-6 px-2"
                          onClick={() => handleInteraction(detail.id, detail.interactionType)}
                          disabled={(detail.interactionType === 'LORE' && detail.isDiscovered) || interactingWith === detail.id || isLoading}
                        >
                          {interactingWith === detail.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <IconComponent className="w-3 h-3" />
                          )}
                          {detail.interactionType.charAt(0) + detail.interactionType.slice(1).toLowerCase()}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </>
        ) : (
          <div className="text-center py-6 px-4 text-muted-foreground">
            <div className="p-3 bg-muted/20 rounded-full w-fit mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">Nothing obvious here</p>
            <p className="text-xs mt-1">Try looking around more carefully</p>
          </div>
        )}
      </div>
    </div>
  );
}
