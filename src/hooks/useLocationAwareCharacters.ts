// src/hooks/useLocationAwareCharacters.ts
/**
 * Custom hook for filtering characters based on player location
 */

import { useMemo } from 'react';
import type { Character, GameState } from '@/lib/types';

export interface LocationAwareCharacters {
  /** Characters in the same location as the player */
  charactersInLocation: Character[];
  /** All known characters regardless of location */
  allCharacters: Character[];
  /** Characters in other locations */
  charactersElsewhere: Character[];
  /** Summary of character distribution */
  locationSummary: {
    currentLocation: string;
    charactersHere: number;
    charactersElsewhere: number;
    totalCharacters: number;
  };
}

export function useLocationAwareCharacters(gameState: GameState | null): LocationAwareCharacters {
  return useMemo(() => {
    if (!gameState) {
      return {
        charactersInLocation: [],
        allCharacters: [],
        charactersElsewhere: [],
        locationSummary: {
          currentLocation: 'Unknown',
          charactersHere: 0,
          charactersElsewhere: 0,
          totalCharacters: 0,
        },
      };
    }

    const currentLocation = gameState.currentLocation;
    const allCharacters = gameState.characters || [];
    
    const charactersInLocation = allCharacters.filter(char => 
      char.currentLocation === currentLocation
    );
    
    const charactersElsewhere = allCharacters.filter(char => 
      char.currentLocation !== currentLocation
    );

    return {
      charactersInLocation,
      allCharacters,
      charactersElsewhere,
      locationSummary: {
        currentLocation,
        charactersHere: charactersInLocation.length,
        charactersElsewhere: charactersElsewhere.length,
        totalCharacters: allCharacters.length,
      },
    };
  }, [gameState?.characters, gameState?.currentLocation]);
}

/**
 * Hook specifically for getting characters that should be visible in the bonds screen
 * (only characters in the same location as the player)
 */
export function useVisibleCharacters(gameState: GameState | null): Character[] {
  const { charactersInLocation } = useLocationAwareCharacters(gameState);
  return charactersInLocation;
}

/**
 * Hook for getting location-based character statistics
 */
export function useCharacterLocationStats(gameState: GameState | null) {
  const { locationSummary, charactersElsewhere } = useLocationAwareCharacters(gameState);
  
  // Group characters by their locations
  const charactersByLocation = useMemo(() => {
    if (!gameState?.characters) return {};
    
    return gameState.characters.reduce((acc, char) => {
      const location = char.currentLocation || 'Unknown';
      if (!acc[location]) {
        acc[location] = [];
      }
      acc[location].push(char);
      return acc;
    }, {} as Record<string, Character[]>);
  }, [gameState?.characters]);

  return {
    ...locationSummary,
    charactersByLocation,
    otherLocations: Object.keys(charactersByLocation).filter(
      location => location !== locationSummary.currentLocation
    ),
  };
}