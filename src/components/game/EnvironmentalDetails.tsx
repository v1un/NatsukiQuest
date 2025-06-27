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
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Current Location Header */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold font-headline">{currentLocation}</CardTitle>
                <CardDescription className="text-sm">Current Location</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground mb-3">
              Take a moment to observe your surroundings. There may be hidden details, 
              interesting objects, or opportunities waiting to be discovered.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => {
                  // This could trigger a general examination of the area
                  console.log('Examining current location:', currentLocation);
                }}
              >
                <Eye className="w-3 h-3" />
                Look Around
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => {
                  // This could trigger searching for hidden details
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
            <div className="flex items-center gap-2 px-1">
              <h3 className="text-sm font-semibold text-foreground">Points of Interest</h3>
              <Badge variant="secondary" className="text-xs">
                {currentLocationDetails.length}
              </Badge>
            </div>
            
            {currentLocationDetails.map((detail) => {
              const IconComponent = getInteractionIcon(detail.interactionType);
              const iconColor = getInteractionColor(detail.interactionType);

              return (
                <Card 
                  key={detail.id} 
                  className={`bg-background/50 border-border/50 hover:bg-background/70 transition-all duration-300 ${
                    detail.isDiscovered ? 'border-l-4 border-l-primary/50' : ''
                  } ${
                    interactingWith === detail.id ? 'ring-2 ring-primary/50 animate-pulse scale-[1.02]' : ''
                  }`}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-4 h-4 ${iconColor}`} />
                      <CardTitle className="text-sm font-medium flex-1">
                        {detail.interactionType.charAt(0) + detail.interactionType.slice(1).toLowerCase()} Opportunity
                      </CardTitle>
                      <Badge 
                        variant={detail.isDiscovered ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {detail.isDiscovered ? 'Discovered' : 'Hidden'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-muted-foreground mb-3">
                      {detail.isDiscovered 
                        ? detail.description 
                        : 'Something catches your attention here. Investigate to learn more.'
                      }
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-1 text-xs"
                        onClick={() => handleInteraction(detail.id, 'EXAMINE')}
                        disabled={(detail.isDiscovered && detail.interactionType === 'EXAMINE') || interactingWith === detail.id || isLoading}
                      >
                        {interactingWith === detail.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        {interactingWith === detail.id ? 'Examining...' : 'Examine'}
                      </Button>
                      {detail.interactionType !== 'EXAMINE' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 text-xs"
                          onClick={() => handleInteraction(detail.id, detail.interactionType)}
                          disabled={(detail.interactionType === 'LORE' && detail.isDiscovered) || interactingWith === detail.id || isLoading}
                        >
                          {interactingWith === detail.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <IconComponent className="w-3 h-3" />
                          )}
                          {interactingWith === detail.id 
                            ? `${detail.interactionType.charAt(0) + detail.interactionType.slice(1).toLowerCase()}...`
                            : detail.interactionType.charAt(0) + detail.interactionType.slice(1).toLowerCase()
                          }
                        </Button>
                      )}
                    </div>
                    {detail.isDiscovered && detail.discoveredAt && (
                      <div className="mt-2 pt-2 border-t border-border/30">
                        <p className="text-xs text-muted-foreground">
                          Discovered: {new Date(detail.discoveredAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </>
        ) : (
          <Card className="bg-background/30 border-dashed border-border/50">
            <CardContent className="p-6 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-medium text-foreground mb-2">
                Nothing Obvious
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                You don't notice anything particularly interesting at first glance. 
                Perhaps a closer look around might reveal hidden details.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Help Text */}
        <Card className="bg-muted/30 border-muted/50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Tip:</strong> Environmental details can reveal lore, trigger quests, 
              or provide useful items. Take time to explore your surroundings!
            </p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
