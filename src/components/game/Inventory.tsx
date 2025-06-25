'use client';

import React, { useContext } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as LucideIcons from 'lucide-react';
import { GameContext } from '@/contexts/GameContext';
import { Skeleton } from '../ui/skeleton';

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: IconName, className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.ElementType;
  if (!LucideIcon) return <LucideIcons.HelpCircle className={className} />;
  return <LucideIcon className={className} />;
};

export default function Inventory() {
  const context = useContext(GameContext);

  if (!context) {
    return null;
  }

  const { gameState } = context;

  if (!gameState) {
     return (
        <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            ))}
        </div>
     );
  }

  const inventory = gameState.inventory;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        {inventory.map((item) => (
          <Card key={item.id} className="bg-transparent border-0 shadow-none">
            <CardContent className="p-2 flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Icon name={item.icon as IconName} className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">{item.name}</h4>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
