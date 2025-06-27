'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Scroll, 
  Target, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  Crown,
  Heart,
  Swords,
  Compass,
  XCircle,
  PauseCircle,
  Gift,
  Search,
  Filter,
  ArrowUpDown,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Quest, QuestObjective } from '@/lib/types';
import { cn } from '@/lib/utils';

interface QuestJournalProps {
  activeQuests: Quest[];
  completedQuests: Quest[];
  onQuestSelect?: (quest: Quest) => void;
}

type SortOption = 'title' | 'startedAt' | 'category' | 'completedAt' | 'progress';
type SortDirection = 'asc' | 'desc';

const questTypeIcons = {
  'MAIN': Crown,
  'SIDE': Target,
  'ROMANCE': Heart,
  'FACTION': Swords,
  'EXPLORATION': Compass,
};

const questTypeColors = {
  'MAIN': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'SIDE': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'ROMANCE': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'FACTION': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'EXPLORATION': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const statusIcons = {
  'ACTIVE': Clock,
  'COMPLETED': CheckCircle,
  'FAILED': XCircle,
  'PAUSED': PauseCircle,
};

const statusColors = {
  'ACTIVE': 'text-blue-600',
  'COMPLETED': 'text-green-600',
  'FAILED': 'text-red-600',
  'PAUSED': 'text-yellow-600',
};

export default function QuestJournal({ activeQuests, completedQuests, onQuestSelect }: QuestJournalProps) {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('startedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Get unique categories from all quests
  const categories = useMemo(() => {
    const allQuests = [...activeQuests, ...completedQuests];
    const cats = [...new Set(allQuests.map(quest => quest.category))];
    return ['all', ...cats];
  }, [activeQuests, completedQuests]);

  const handleQuestClick = (quest: Quest) => {
    setSelectedQuest(quest);
    onQuestSelect?.(quest);
  };

  const handleSort = (field: SortOption) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const sortQuests = (quests: Quest[]) => {
    return [...quests].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'startedAt':
          aValue = new Date(a.startedAt).getTime();
          bValue = new Date(b.startedAt).getTime();
          break;
        case 'completedAt':
          aValue = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          bValue = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'progress':
          aValue = getQuestProgress(a);
          bValue = getQuestProgress(b);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Filter and sort quests
  const filterAndSortQuests = (quests: Quest[]) => {
    const filtered = quests.filter(quest => {
      const matchesSearch = searchTerm === '' || 
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || quest.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
    
    return sortQuests(filtered);
  };

  const filteredActiveQuests = filterAndSortQuests(activeQuests);
  const filteredCompletedQuests = filterAndSortQuests(completedQuests);
  const currentQuests = activeTab === 'active' ? filteredActiveQuests : filteredCompletedQuests;

  const getQuestProgress = (quest: Quest) => {
    const totalObjectives = quest.objectives.length;
    const completedObjectives = quest.objectives.filter(obj => obj.isCompleted).length;
    return totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;
  };

  const getObjectiveProgress = (objective: QuestObjective) => {
    if (objective.maxProgress && objective.progress !== undefined) {
      return Math.round((objective.progress / objective.maxProgress) * 100);
    }
    return objective.isCompleted ? 100 : 0;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b">
        <Scroll className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg">Quest Journal</h2>
        <div className="ml-auto flex gap-2">
          <Badge variant="secondary">
            {activeQuests.length} active
          </Badge>
          <Badge variant="outline">
            {completedQuests.length} completed
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'completed')} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 w-fit">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active Quests
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed
          </TabsTrigger>
        </TabsList>

        {/* Desktop View */}
        <div className="flex-1 hidden md:flex">
          {/* Left Panel - Quest List */}
          <div className="w-1/2 border-r flex flex-col">
            {/* Search and Filters */}
            <div className="p-4 space-y-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {categories.map(category => {
                  const IconComponent = questTypeIcons[category as keyof typeof questTypeIcons] || Target;
                  return (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs"
                    >
                      <IconComponent className="h-3 w-3 mr-1" />
                      {category === 'all' ? 'All' : category}
                    </Button>
                  );
                })}
              </div>
              
              {/* Sort Controls */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Sort by:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('title')}
                  className={cn(
                    "h-6 px-2 text-xs",
                    sortBy === 'title' && "bg-accent"
                  )}
                >
                  Title
                  {sortBy === 'title' && (
                    sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('startedAt')}
                  className={cn(
                    "h-6 px-2 text-xs",
                    sortBy === 'startedAt' && "bg-accent"
                  )}
                >
                  Date
                  {sortBy === 'startedAt' && (
                    sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('progress')}
                  className={cn(
                    "h-6 px-2 text-xs",
                    sortBy === 'progress' && "bg-accent"
                  )}
                >
                  Progress
                  {sortBy === 'progress' && (
                    sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            
            <TabsContent value="active" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {filteredActiveQuests.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No active quests found</p>
                      <p className="text-sm">{searchTerm || selectedCategory !== 'all' ? 'Try adjusting your filters' : 'Explore the world to find new adventures!'}</p>
                    </div>
                  ) : (
                    filteredActiveQuests.map(quest => {
                      const IconComponent = questTypeIcons[quest.category];
                      const StatusIconComponent = statusIcons[quest.status];
                      const isSelected = selectedQuest?.id === quest.id;
                      const progress = getQuestProgress(quest);
                      
                      return (
                        <Card 
                          key={quest.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md",
                            isSelected && "ring-2 ring-primary"
                          )}
                          onClick={() => handleQuestClick(quest)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4 text-primary" />
                                <CardTitle className="text-sm font-medium">
                                  {quest.title}
                                </CardTitle>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusIconComponent className={cn("h-4 w-4", statusColors[quest.status])} />
                                <Badge 
                                  variant="secondary" 
                                  className={cn("text-xs", questTypeColors[quest.category])}
                                >
                                  {quest.category}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                              {quest.description}
                            </p>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-1" />
                            </div>

                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {quest.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{quest.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                <span>{quest.objectives.filter(obj => obj.isCompleted).length}/{quest.objectives.length} objectives</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="completed" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {filteredCompletedQuests.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No completed quests found</p>
                      <p className="text-sm">{searchTerm || selectedCategory !== 'all' ? 'Try adjusting your filters' : 'Complete your first quest to see it here!'}</p>
                    </div>
                  ) : (
                    filteredCompletedQuests.map(quest => {
                      const IconComponent = questTypeIcons[quest.category];
                      const isSelected = selectedQuest?.id === quest.id;
                      
                      return (
                        <Card 
                          key={quest.id}
                          className={cn(
                            "cursor-pointer transition-all hover:shadow-md opacity-75",
                            isSelected && "ring-2 ring-primary opacity-100"
                          )}
                          onClick={() => handleQuestClick(quest)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4 text-primary" />
                                <CardTitle className="text-sm font-medium">
                                  {quest.title}
                                </CardTitle>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <Badge 
                                  variant="secondary" 
                                  className={cn("text-xs", questTypeColors[quest.category])}
                                >
                                  {quest.category}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {quest.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {quest.completedAt && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Completed {new Date(quest.completedAt).toLocaleDateString()}</span>
                                </div>
                              )}
                              {quest.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{quest.location}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>

          {/* Right Panel - Quest Details */}
          <div className="w-1/2 hidden md:flex flex-col">
            {selectedQuest ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = questTypeIcons[selectedQuest.category];
                        return <IconComponent className="h-5 w-5 text-primary" />;
                      })()}
                      <h3 className="text-lg font-semibold">{selectedQuest.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const StatusIconComponent = statusIcons[selectedQuest.status];
                        return <StatusIconComponent className={cn("h-5 w-5", statusColors[selectedQuest.status])} />;
                      })()}
                      <Badge 
                        className={cn(questTypeColors[selectedQuest.category])}
                      >
                        {selectedQuest.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedQuest.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    {selectedQuest.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedQuest.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Started {new Date(selectedQuest.startedAt).toLocaleDateString()}</span>
                    </div>
                    {selectedQuest.completedAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completed {new Date(selectedQuest.completedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {selectedQuest.npcsInvolved.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">NPCs Involved:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedQuest.npcsInvolved.map(npc => (
                          <Badge key={npc} variant="outline" className="text-xs">
                            {npc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Objectives
                        </h4>
                        <div className="space-y-3">
                          {selectedQuest.objectives.map(objective => {
                            const progress = getObjectiveProgress(objective);
                            
                            return (
                              <Card key={objective.id} className={cn(
                                "transition-all",
                                objective.isCompleted && "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                              )}>
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2">
                                    {objective.isCompleted ? (
                                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    ) : (
                                      <div className="h-4 w-4 border-2 border-muted-foreground rounded-full mt-0.5 flex-shrink-0" />
                                    )}
                                    <div className="flex-1">
                                      <p className={cn(
                                        "text-sm",
                                        objective.isCompleted && "line-through text-muted-foreground"
                                      )}>
                                        {objective.description}
                                      </p>
                                      {objective.maxProgress && objective.progress !== undefined && (
                                        <div className="mt-2 space-y-1">
                                          <div className="flex items-center justify-between text-xs">
                                            <span>Progress</span>
                                            <span>{objective.progress}/{objective.maxProgress}</span>
                                          </div>
                                          <Progress value={progress} className="h-1" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>

                      {selectedQuest.rewards && selectedQuest.rewards.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            Rewards
                          </h4>
                          <div className="space-y-2">
                            {selectedQuest.rewards.map((reward, index) => (
                              <Card key={index}>
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Gift className="h-4 w-4 text-primary" />
                                    <span>
                                      {reward.type === 'ITEM' && `Item: ${reward.itemId}`}
                                      {reward.type === 'SKILL' && `Skill: ${reward.skillId}`}
                                      {reward.type === 'REPUTATION' && `Reputation with ${reward.faction}: +${reward.amount}`}
                                      {reward.type === 'RELATIONSHIP' && `Relationship with ${reward.character}: +${reward.amount}`}
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div className="text-muted-foreground">
                  <Scroll className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a quest to view details</p>
                  <p className="text-sm">Track your adventures and objectives</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile View */}
        <div className="flex-1 md:hidden">
          {/* Search and Filters */}
          <div className="p-4 space-y-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {categories.map(category => {
                const IconComponent = questTypeIcons[category as keyof typeof questTypeIcons] || Target;
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="text-xs"
                  >
                    <IconComponent className="h-3 w-3 mr-1" />
                    {category === 'all' ? 'All' : category}
                  </Button>
                );
              })}
            </div>
          </div>
          
          <TabsContent value="active" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {filteredActiveQuests.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No active quests found</p>
                    <p className="text-sm">{searchTerm || selectedCategory !== 'all' ? 'Try adjusting your filters' : 'Explore the world to find new adventures!'}</p>
                  </div>
                ) : (
                  filteredActiveQuests.map(quest => {
                    const IconComponent = questTypeIcons[quest.category];
                    const progress = getQuestProgress(quest);
                    
                    return (
                      <Sheet key={quest.id}>
                        <SheetTrigger asChild>
                          <Card className="cursor-pointer transition-all hover:shadow-md">
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4 text-primary" />
                                  <CardTitle className="text-sm font-medium">
                                    {quest.title}
                                  </CardTitle>
                                </div>
                                <Badge 
                                  variant="secondary" 
                                  className={cn("text-xs", questTypeColors[quest.category])}
                                >
                                  {quest.category}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                {quest.description}
                              </p>
                              
                              <div className="space-y-2 mb-3">
                                <div className="flex items-center justify-between text-xs">
                                  <span>Progress</span>
                                  <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-1" />
                              </div>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {quest.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{quest.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  <span>{quest.objectives.filter(obj => obj.isCompleted).length}/{quest.objectives.length} objectives</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:max-w-md">
                          <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                              <IconComponent className="h-5 w-5 text-primary" />
                              {quest.title}
                            </SheetTitle>
                          </SheetHeader>
                          <ScrollArea className="flex-1 mt-4">
                            <div className="space-y-4">
                              <div>
                                <Badge className={cn(questTypeColors[quest.category])}>
                                  {quest.category}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground">
                                {quest.description}
                              </p>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                              
                              <div className="space-y-2 text-sm text-muted-foreground">
                                {quest.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{quest.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>Started {new Date(quest.startedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              {quest.npcsInvolved.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-2">NPCs Involved:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {quest.npcsInvolved.map(npc => (
                                      <Badge key={npc} variant="outline" className="text-xs">
                                        {npc}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  Objectives
                                </h4>
                                <div className="space-y-3">
                                  {quest.objectives.map(objective => {
                                    const objProgress = getObjectiveProgress(objective);
                                    
                                    return (
                                      <Card key={objective.id} className={cn(
                                        "transition-all",
                                        objective.isCompleted && "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                                      )}>
                                        <CardContent className="p-3">
                                          <div className="flex items-start gap-2">
                                            {objective.isCompleted ? (
                                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            ) : (
                                              <div className="h-4 w-4 border-2 border-muted-foreground rounded-full mt-0.5 flex-shrink-0" />
                                            )}
                                            <div className="flex-1">
                                              <p className={cn(
                                                "text-sm",
                                                objective.isCompleted && "line-through text-muted-foreground"
                                              )}>
                                                {objective.description}
                                              </p>
                                              {objective.maxProgress && objective.progress !== undefined && (
                                                <div className="mt-2 space-y-1">
                                                  <div className="flex items-center justify-between text-xs">
                                                    <span>Progress</span>
                                                    <span>{objective.progress}/{objective.maxProgress}</span>
                                                  </div>
                                                  <Progress value={objProgress} className="h-1" />
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </div>
                              </div>
                              
                              {quest.rewards && quest.rewards.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Gift className="h-4 w-4" />
                                    Rewards
                                  </h4>
                                  <div className="space-y-2">
                                    {quest.rewards.map((reward, index) => (
                                      <Card key={index}>
                                        <CardContent className="p-3">
                                          <div className="flex items-center gap-2 text-sm">
                                            <Gift className="h-4 w-4 text-primary" />
                                            <span>
                                              {reward.type === 'ITEM' && `Item: ${reward.itemId}`}
                                              {reward.type === 'SKILL' && `Skill: ${reward.skillId}`}
                                              {reward.type === 'REPUTATION' && `Reputation with ${reward.faction}: +${reward.amount}`}
                                              {reward.type === 'RELATIONSHIP' && `Relationship with ${reward.character}: +${reward.amount}`}
                                            </span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </SheetContent>
                      </Sheet>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="completed" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {filteredCompletedQuests.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No completed quests found</p>
                    <p className="text-sm">{searchTerm || selectedCategory !== 'all' ? 'Try adjusting your filters' : 'Complete your first quest to see it here!'}</p>
                  </div>
                ) : (
                  filteredCompletedQuests.map(quest => {
                    const IconComponent = questTypeIcons[quest.category];
                    
                    return (
                      <Sheet key={quest.id}>
                        <SheetTrigger asChild>
                          <Card className="cursor-pointer transition-all hover:shadow-md opacity-75">
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4 text-primary" />
                                  <CardTitle className="text-sm font-medium">
                                    {quest.title}
                                  </CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <Badge 
                                    variant="secondary" 
                                    className={cn("text-xs", questTypeColors[quest.category])}
                                  >
                                    {quest.category}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {quest.description}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {quest.completedAt && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Completed {new Date(quest.completedAt).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {quest.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{quest.location}</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:max-w-md">
                          <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                              <IconComponent className="h-5 w-5 text-primary" />
                              {quest.title}
                              <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                            </SheetTitle>
                          </SheetHeader>
                          <ScrollArea className="flex-1 mt-4">
                            <div className="space-y-4">
                              <div>
                                <Badge className={cn(questTypeColors[quest.category])}>
                                  {quest.category}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground">
                                {quest.description}
                              </p>
                              
                              <div className="space-y-2 text-sm text-muted-foreground">
                                {quest.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{quest.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>Started {new Date(quest.startedAt).toLocaleDateString()}</span>
                                </div>
                                {quest.completedAt && (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Completed {new Date(quest.completedAt).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                              
                              {quest.npcsInvolved.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-2">NPCs Involved:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {quest.npcsInvolved.map(npc => (
                                      <Badge key={npc} variant="outline" className="text-xs">
                                        {npc}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  Completed Objectives
                                </h4>
                                <div className="space-y-2">
                                  {quest.objectives.map(objective => (
                                    <Card key={objective.id} className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                                      <CardContent className="p-3">
                                        <div className="flex items-start gap-2">
                                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                          <p className="text-sm line-through text-muted-foreground">
                                            {objective.description}
                                          </p>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                              
                              {quest.rewards && quest.rewards.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <Gift className="h-4 w-4" />
                                    Rewards Earned
                                  </h4>
                                  <div className="space-y-2">
                                    {quest.rewards.map((reward, index) => (
                                      <Card key={index}>
                                        <CardContent className="p-3">
                                          <div className="flex items-center gap-2 text-sm">
                                            <Gift className="h-4 w-4 text-primary" />
                                            <span>
                                              {reward.type === 'ITEM' && `Item: ${reward.itemId}`}
                                              {reward.type === 'SKILL' && `Skill: ${reward.skillId}`}
                                              {reward.type === 'REPUTATION' && `Reputation with ${reward.faction}: +${reward.amount}`}
                                              {reward.type === 'RELATIONSHIP' && `Relationship with ${reward.character}: +${reward.amount}`}
                                            </span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </SheetContent>
                      </Sheet>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
