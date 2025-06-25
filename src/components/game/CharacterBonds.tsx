'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { initialGameState } from '@/lib/initial-game-state'; // Using initial state as placeholder

// This component would ideally receive gameState as a prop
export default function CharacterBonds() {
  const characters = initialGameState.characters; // Placeholder data

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {characters.map((char) => (
          <Card key={char.name} className="bg-background/50 border-border/50">
            <CardHeader className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={char.avatar} alt={char.name} data-ai-hint="anime character portrait" />
                  <AvatarFallback>{char.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base font-bold font-headline">{char.name}</CardTitle>
                  <CardDescription className="text-xs">{char.status}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground mb-2">{char.description}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>Affinity</span>
                  <span className="text-primary">{char.affinity}%</span>
                </div>
                <Progress value={char.affinity} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
