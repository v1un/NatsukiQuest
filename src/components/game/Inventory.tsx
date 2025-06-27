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
    <div className="max-h-64 overflow-y-auto">
      <div className="p-3 space-y-2">
        {inventory.length > 0 ? (
          inventory.map((item) => (
            <Card key={item.id} className="bg-card/50 border-border/30 hover:bg-card/70 transition-all duration-200 shadow-sm">
              <CardContent className="p-3 flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                  <Icon name={item.icon as IconName} className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate">{item.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
                  {item.quantity && item.quantity > 1 && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-medium">
                      × {item.quantity}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-6 px-4 text-muted-foreground">
            <div className="p-3 bg-muted/20 rounded-full w-fit mx-auto mb-3">
              <Icon name="Package" className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">No items in inventory</p>
            <p className="text-xs mt-1">Items will appear as you find them</p>
          </div>
        )}
      </div>
    </div>
  );
}
