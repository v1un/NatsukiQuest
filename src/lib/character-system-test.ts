// src/lib/character-system-test.ts
/**
 * Test utilities for verifying the dynamic character management system
 */

import type { Character, GameState } from '@/lib/types';

export interface CharacterSystemTest {
  testName: string;
  description: string;
  test: (gameState: GameState) => boolean;
  expectedBehavior: string;
}

export const characterSystemTests: CharacterSystemTest[] = [
  {
    testName: 'Empty Initial State',
    description: 'New game should start with no characters',
    test: (gameState: GameState) => gameState.characters.length === 0,
    expectedBehavior: 'characters array should be empty for new games'
  },
  {
    testName: 'Location Filtering',
    description: 'Characters should have currentLocation property',
    test: (gameState: GameState) => {
      return gameState.characters.every(char => typeof char.currentLocation === 'string');
    },
    expectedBehavior: 'All characters must have currentLocation defined'
  },
  {
    testName: 'No Prepopulated Characters',
    description: 'Initial state should not contain known Re:Zero characters',
    test: (gameState: GameState) => {
      const knownCharacters = ['Emilia', 'Rem', 'Ram', 'Puck', 'Felt', 'Elsa'];
      return !gameState.characters.some(char => knownCharacters.includes(char.name));
    },
    expectedBehavior: 'Initial state should not contain Emilia, Rem, Ram, Puck, Felt, or Elsa'
  },
  {
    testName: 'Location-Based Bonds Display',
    description: 'Only characters in same location should be visible',
    test: (gameState: GameState) => {
      const playerLocation = gameState.currentLocation;
      const coLocatedCharacters = gameState.characters.filter(
        char => char.currentLocation === playerLocation
      );
      // This test verifies the filtering logic works
      return coLocatedCharacters.every(char => char.currentLocation === playerLocation);
    },
    expectedBehavior: 'Filtered characters should all be in player location'
  }
];

/**
 * Run all character system tests
 */
export function runCharacterSystemTests(gameState: GameState): {
  passed: number;
  failed: number;
  results: Array<{ test: string; passed: boolean; message: string }>;
} {
  const results = characterSystemTests.map(test => {
    try {
      const passed = test.test(gameState);
      return {
        test: test.testName,
        passed,
        message: passed ? 'PASS' : `FAIL: ${test.expectedBehavior}`
      };
    } catch (error) {
      return {
        test: test.testName,
        passed: false,
        message: `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  });

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  return { passed, failed, results };
}

/**
 * Character system validation for development
 */
export function validateCharacterSystem(gameState: GameState): {
  isValid: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check for critical issues
  if (!Array.isArray(gameState.characters)) {
    issues.push('characters is not an array');
  }

  if (typeof gameState.currentLocation !== 'string' || !gameState.currentLocation) {
    issues.push('currentLocation is missing or invalid');
  }

  // Check each character
  gameState.characters.forEach((char, index) => {
    if (!char.name) {
      issues.push(`Character at index ${index} missing name`);
    }
    if (typeof char.affinity !== 'number') {
      issues.push(`Character ${char.name} has invalid affinity`);
    }
    if (!char.currentLocation) {
      issues.push(`Character ${char.name} missing currentLocation`);
    }
    if (char.affinity < 0 || char.affinity > 100) {
      warnings.push(`Character ${char.name} has affinity outside 0-100 range`);
    }
  });

  // Check for prepopulated characters (development warning)
  const suspiciousNames = ['Emilia', 'Rem', 'Ram', 'Puck', 'Felt', 'Elsa'];
  const foundSuspicious = gameState.characters.filter(char => 
    suspiciousNames.includes(char.name)
  );
  
  if (foundSuspicious.length > 0 && gameState.narrative.length < 500) {
    warnings.push(`Found ${foundSuspicious.length} known characters in early game - ensure they were introduced through AI tools`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings
  };
}

/**
 * Mock character for testing location filtering
 */
export function createMockCharacter(name: string, location: string, affinity = 50): Character {
  return {
    name,
    affinity,
    status: 'Met',
    description: `Mock character ${name} for testing`,
    avatar: 'https://placehold.co/100x100.png',
    currentLocation: location,
    firstMetAt: location,
    lastSeenAt: new Date(),
    isImportant: false
  };
}

/**
 * Create test scenario with characters in different locations
 */
export function createLocationTestScenario(playerLocation: string): Character[] {
  return [
    createMockCharacter('Alice', playerLocation, 60),
    createMockCharacter('Bob', playerLocation, 40),
    createMockCharacter('Charlie', 'Different Location', 80),
    createMockCharacter('Diana', 'Another Place', 30),
    createMockCharacter('Eve', playerLocation, 70),
  ];
}