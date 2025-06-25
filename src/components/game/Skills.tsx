'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { initialGameState } from '@/lib/initial-game-state';
import * as LucideIcons from 'lucide-react';

type IconName = keyof typeof LucideIcons;

const Icon = ({ name, className }: { name: IconName, className?: string }) => {
  const LucideIcon = LucideIcons[name] as React.ElementType;
  if (!LucideIcon) return <LucideIcons.HelpCircle className={className} />;
  return <LucideIcon className={className} />;
};

export default function Skills() {
  const skills = initialGameState.skills; // Placeholder data

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        {skills.map((skill) => (
          <Card key={skill.id} className="bg-transparent border-0 shadow-none">
            <CardContent className="p-2 flex items-start gap-3">
              <div className="p-2 bg-accent/10 rounded-md">
                 <Icon name={skill.icon as IconName} className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">{skill.name}</h4>
                <p className="text-xs text-muted-foreground">{skill.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
