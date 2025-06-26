'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Users, 
  Tag,
  Sparkles,
  Crown,
  Swords,
  Heart,
  Globe
} from 'lucide-react';
import { LoreEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LorebookViewerProps {
  loreEntries: LoreEntry[];
  discoveredLoreIds: string[];
  onLoreSelect?: (lore: LoreEntry) => void;
}

const categoryIcons = {
  'Characters': Users,
  'Locations': MapPin,
  'Politics': Crown,
  'Magic': Sparkles,
  'History': Clock,
  'Combat': Swords,
  'Romance': Heart,
  'World': Globe,
};

const categoryColors = {
  'Characters': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Locations': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Politics': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Magic': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'History': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'Combat': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Romance': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  'World': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

export default function LorebookViewer({ loreEntries, discoveredLoreIds, onLoreSelect }: LorebookViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLore, setSelectedLore] = useState<LoreEntry | null>(null);

  // Filter discovered lore entries
  const discoveredLore = useMemo(() => {
    return loreEntries.filter(entry => discoveredLoreIds.includes(entry.id));
  }, [loreEntries, discoveredLoreIds]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(discoveredLore.map(entry => entry.category))];
    return ['all', ...cats];
  }, [discoveredLore]);

  // Filter and search lore entries
  const filteredLore = useMemo(() => {
    return discoveredLore.filter(entry => {
      const matchesSearch = searchTerm === '' || 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [discoveredLore, searchTerm, selectedCategory]);

  const handleLoreClick = (lore: LoreEntry) => {
    setSelectedLore(lore);
    onLoreSelect?.(lore);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 p-4 border-b">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg">Lorebook</h2>
        <Badge variant="secondary" className="ml-auto">
          {discoveredLore.length} entries discovered
        </Badge>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Lore List */}
        <div className="w-1/2 border-r flex flex-col">
          {/* Search and Filters */}
          <div className="p-4 space-y-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lore entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category === 'all' ? 'All' : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Lore Entries List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {filteredLore.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No lore entries found</p>
                  <p className="text-sm">Explore the world to discover new lore!</p>
                </div>
              ) : (
                filteredLore.map(entry => {
                  const IconComponent = categoryIcons[entry.category as keyof typeof categoryIcons] || Tag;
                  const isSelected = selectedLore?.id === entry.id;
                  
                  return (
                    <Card 
                      key={entry.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        isSelected && "ring-2 ring-primary"
                      )}
                      onClick={() => handleLoreClick(entry)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm font-medium">
                              {entry.title}
                            </CardTitle>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", categoryColors[entry.category as keyof typeof categoryColors])}
                          >
                            {entry.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {entry.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {entry.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{entry.location}</span>
                            </div>
                          )}
                          {entry.discoveredAt && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(entry.discoveredAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {entry.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{entry.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Lore Details */}
        <div className="w-1/2 flex flex-col">
          {selectedLore ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const IconComponent = categoryIcons[selectedLore.category as keyof typeof categoryIcons] || Tag;
                      return <IconComponent className="h-5 w-5 text-primary" />;
                    })()}
                    <h3 className="text-lg font-semibold">{selectedLore.title}</h3>
                  </div>
                  <Badge 
                    className={cn(categoryColors[selectedLore.category as keyof typeof categoryColors])}
                  >
                    {selectedLore.category}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                  {selectedLore.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedLore.location}</span>
                    </div>
                  )}
                  {selectedLore.discoveredAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Discovered {new Date(selectedLore.discoveredAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {selectedLore.characters.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Related Characters:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedLore.characters.map(character => (
                        <Badge key={character} variant="outline" className="text-xs">
                          {character}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLore.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedLore.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {selectedLore.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div className="text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a lore entry to view details</p>
                <p className="text-sm">Discover the rich world of Re:Zero</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}