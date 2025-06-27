'use client';

import React from 'react';
import { useGameContext } from '@/hooks/use-game-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

export const QuestManager = () => {
  const { 
    gameState, 
    handleQuestUpdate, 
    handleLoreDiscovery, 
    handleReputationChange, 
    handleEnvironmentInteract 
  } = useGameContext();

  if (!gameState) return null;

  const { activeQuests, completedQuests, reputations, discoveredLore, environmentalDetails } = gameState;

  const completeObjective = (questId: string, objectiveId: string) => {
    const quest = activeQuests.find(q => q.id === questId);
    if (!quest) return;

    const updatedObjectives = quest.objectives.map(obj => 
      obj.id === objectiveId ? { ...obj, isCompleted: true } : obj
    );

    const allCompleted = updatedObjectives.every(obj => obj.isCompleted);
    
    handleQuestUpdate(questId, {
      objectives: updatedObjectives,
      ...(allCompleted && { status: 'COMPLETED' as const })
    });
  };

  const testHandlers = () => {
    // Test lore discovery
    handleLoreDiscovery('test_lore_1');
    
    // Test reputation change
    handleReputationChange('Test Faction', 15, 'Helped with demonstration');
    
    // Test environment interaction
    const envDetail = environmentalDetails.find(env => !env.isDiscovered);
    if (envDetail) {
      handleEnvironmentInteract(envDetail.id);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quest Manager</CardTitle>
          <CardDescription>
            Manage your active quests and track progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="space-y-3">
              {activeQuests.map(quest => (
                <div key={quest.id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{quest.title}</h4>
                    <Badge variant={quest.category === 'MAIN' ? 'default' : 'secondary'}>
                      {quest.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{quest.description}</p>
                  
                  <div className="space-y-2">
                    {quest.objectives.map(objective => (
                      <div key={objective.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={objective.isCompleted}
                          onChange={() => completeObjective(quest.id, objective.id)}
                          className="rounded"
                        />
                        <span className={`text-sm ${objective.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {objective.description}
                        </span>
                        {objective.progress !== undefined && objective.maxProgress && (
                          <Progress 
                            value={(objective.progress / objective.maxProgress) * 100} 
                            className="flex-1 max-w-20"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reputations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reputations.map(rep => (
              <div key={rep.id} className="flex items-center justify-between">
                <span className="font-medium">{rep.faction}</span>
                <div className="flex items-center gap-2">
                  <Progress value={Math.max(0, (rep.level + 100) / 2)} className="w-24" />
                  <span className="text-sm min-w-8 text-right">{rep.level}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discovery Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Lore Discovered:</strong> {discoveredLore.length}
            </div>
            <div>
              <strong>Quests Completed:</strong> {completedQuests.length}
            </div>
            <div>
              <strong>Environmental Details:</strong> {environmentalDetails.filter(env => env.isDiscovered).length}/{environmentalDetails.length}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={testHandlers} variant="outline" className="w-full">
        Test New Handlers
      </Button>
    </div>
  );
};
