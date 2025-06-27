'use client';

import React, { useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GameContext } from '@/contexts/GameContext';
import { runCharacterSystemTests, validateCharacterSystem, createLocationTestScenario } from '@/lib/character-system-test';
import { AlertTriangle, CheckCircle, Info, Users, MapPin, X } from 'lucide-react';

/**
 * Development component for monitoring character system health
 * Only shown in development environment
 */
export default function CharacterSystemStatus({ onClose }: { onClose?: () => void }) {
  const context = useContext(GameContext);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!context?.gameState) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Character System Status
          </CardTitle>
          <CardDescription>Development monitoring tool</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No game state available</p>
        </CardContent>
      </Card>
    );
  }

  const { gameState, devAddTestCharacters, devClearCharacters } = context;
  
  // Run system tests
  const testResults = runCharacterSystemTests(gameState);
  const validation = validateCharacterSystem(gameState);

  // Calculate statistics
  const totalCharacters = gameState.characters.length;
  const charactersInLocation = gameState.characters.filter(
    char => char.currentLocation === gameState.currentLocation
  ).length;
  const charactersElsewhere = totalCharacters - charactersInLocation;

  // Group characters by location
  const charactersByLocation = gameState.characters.reduce((acc, char) => {
    const location = char.currentLocation || 'Unknown';
    if (!acc[location]) acc[location] = [];
    acc[location].push(char);
    return acc;
  }, {} as Record<string, any[]>);

  const addTestCharacters = () => {
    if (devAddTestCharacters) {
      devAddTestCharacters();
    } else {
      console.log('devAddTestCharacters not available');
    }
  };

  const clearCharacters = () => {
    if (devClearCharacters) {
      devClearCharacters();
    } else {
      console.log('devClearCharacters not available');
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Character System Status
          <Badge variant="outline" className="ml-2">DEV</Badge>
        </h3>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={addTestCharacters}>
            Add Test Characters
          </Button>
          <Button size="sm" variant="destructive" onClick={clearCharacters}>
            Clear All
          </Button>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose} className="px-2">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              {validation.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tests Passed:</span>
              <Badge variant={testResults.passed === testResults.results.length ? "default" : "destructive"}>
                {testResults.passed}/{testResults.results.length}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Issues:</span>
              <Badge variant={validation.issues.length === 0 ? "default" : "destructive"}>
                {validation.issues.length}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Warnings:</span>
              <Badge variant={validation.warnings.length === 0 ? "default" : "secondary"}>
                {validation.warnings.length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Characters:</span>
              <Badge>{totalCharacters}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>In Current Location:</span>
              <Badge variant="default">{charactersInLocation}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Elsewhere:</span>
              <Badge variant="outline">{charactersElsewhere}</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Current: {gameState.currentLocation}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues and Warnings */}
      {validation.issues.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Issues:</strong>
            <ul className="list-disc list-inside mt-1">
              {validation.issues.map((issue, index) => (
                <li key={index} className="text-sm">{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Warnings:</strong>
            <ul className="list-disc list-inside mt-1">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Test Results */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {testResults.results.map((result, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>{result.test}</span>
                <Badge variant={result.passed ? "default" : "destructive"}>
                  {result.passed ? "PASS" : "FAIL"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Character Locations */}
      {Object.keys(charactersByLocation).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Characters by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(charactersByLocation).map(([location, chars]) => (
                <div key={location} className="flex items-center justify-between text-sm">
                  <span className={location === gameState.currentLocation ? "font-medium" : ""}>
                    {location === gameState.currentLocation && "📍 "}
                    {location}
                  </span>
                  <div className="flex gap-1">
                    <Badge variant={location === gameState.currentLocation ? "default" : "outline"}>
                      {chars.length}
                    </Badge>
                    {chars.slice(0, 3).map((char: any) => (
                      <Badge key={char.name} variant="secondary" className="text-xs">
                        {char.name}
                      </Badge>
                    ))}
                    {chars.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{chars.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}