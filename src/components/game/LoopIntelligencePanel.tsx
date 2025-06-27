'use client';

import React, { useState } from 'react';
import { 
    Brain, 
    Eye, 
    Clock, 
    Users, 
    Target, 
    AlertTriangle, 
    Lightbulb, 
    ChevronDown, 
    ChevronRight,
    Zap,
    Shield,
    Search
} from 'lucide-react';
import { LoopIntelligence } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface LoopIntelligencePanelProps {
    intelligence: LoopIntelligence;
    onAnalyze: () => void;
    isAnalyzing?: boolean;
}

const LoopIntelligencePanel: React.FC<LoopIntelligencePanelProps> = ({ 
    intelligence, 
    onAnalyze, 
    isAnalyzing = false 
}) => {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['insights']));

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'character_behavior': return <Users className="w-3 h-3" />;
            case 'environmental_hazard': return <AlertTriangle className="w-3 h-3" />;
            case 'timing': return <Clock className="w-3 h-3" />;
            case 'dialogue_clue': return <Eye className="w-3 h-3" />;
            case 'hidden_mechanic': return <Search className="w-3 h-3" />;
            case 'strategic_opportunity': return <Target className="w-3 h-3" />;
            default: return <Brain className="w-3 h-3" />;
        }
    };

    const getConfidenceBadge = (confidence: string) => {
        const variant = confidence === 'high' ? 'default' : confidence === 'medium' ? 'secondary' : 'outline';
        return <Badge variant={variant} className="text-xs">{confidence}</Badge>;
    };

    const getTrustworthinessBadge = (trustworthiness: string) => {
        const variant = trustworthiness === 'high' ? 'default' : 
                      trustworthiness === 'medium' ? 'secondary' : 
                      trustworthiness === 'low' ? 'outline' : 'destructive';
        return <Badge variant={variant} className="text-xs">{trustworthiness}</Badge>;
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <Card className="bg-sidebar-card border-sidebar-border/50 border-purple-500/30">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2 text-purple-400">
                            <Brain className="w-4 h-4" />
                            Loop Intelligence
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onAnalyze}
                            disabled={isAnalyzing}
                            className="h-6 px-2 text-xs"
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="text-xs text-sidebar-foreground/60">
                        Strategic insights from your previous loop death
                    </div>
                </CardContent>
            </Card>

            {/* Key Insights */}
            <Card className="bg-sidebar-card border-sidebar-border/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-3 h-3" />
                            Key Insights ({intelligence.keyInsights.length})
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection('insights')}
                            className="h-4 w-4 p-0"
                        >
                            {expandedSections.has('insights') ? 
                                <ChevronDown className="w-3 h-3" /> : 
                                <ChevronRight className="w-3 h-3" />
                            }
                        </Button>
                    </CardTitle>
                </CardHeader>
                {expandedSections.has('insights') && (
                    <CardContent className="pt-0 space-y-3">
                        {intelligence.keyInsights.map((insight, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs">
                                        {getCategoryIcon(insight.category)}
                                        <span className="font-medium text-sidebar-foreground/80">
                                            {insight.insight}
                                        </span>
                                    </div>
                                    {getConfidenceBadge(insight.confidence)}
                                </div>
                                <div className="text-xs text-sidebar-foreground/60 ml-5">
                                    💡 {insight.actionableAdvice}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                )}
            </Card>

            {/* Strategic Recommendations */}
            {intelligence.strategicRecommendations.length > 0 && (
                <Card className="bg-sidebar-card border-sidebar-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Target className="w-3 h-3" />
                                Strategy ({intelligence.strategicRecommendations.length})
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSection('strategy')}
                                className="h-4 w-4 p-0"
                            >
                                {expandedSections.has('strategy') ? 
                                    <ChevronDown className="w-3 h-3" /> : 
                                    <ChevronRight className="w-3 h-3" />
                                }
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.has('strategy') && (
                        <CardContent className="pt-0 space-y-2">
                            {intelligence.strategicRecommendations.map((rec, index) => (
                                <div key={index} className="text-xs text-sidebar-foreground/70 flex items-start gap-2">
                                    <Zap className="w-3 h-3 mt-0.5 text-green-400 flex-shrink-0" />
                                    <span>{rec}</span>
                                </div>
                            ))}
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Warnings */}
            {intelligence.warningsToAvoid.length > 0 && (
                <Card className="bg-sidebar-card border-sidebar-border/50 border-red-500/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-400">
                                <Shield className="w-3 h-3" />
                                Avoid ({intelligence.warningsToAvoid.length})
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSection('warnings')}
                                className="h-4 w-4 p-0"
                            >
                                {expandedSections.has('warnings') ? 
                                    <ChevronDown className="w-3 h-3" /> : 
                                    <ChevronRight className="w-3 h-3" />
                                }
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.has('warnings') && (
                        <CardContent className="pt-0 space-y-2">
                            {intelligence.warningsToAvoid.map((warning, index) => (
                                <div key={index} className="text-xs text-red-300 flex items-start gap-2">
                                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>{warning}</span>
                                </div>
                            ))}
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Character Intel */}
            {intelligence.characterIntel.length > 0 && (
                <Card className="bg-sidebar-card border-sidebar-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                Character Intel ({intelligence.characterIntel.length})
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSection('characters')}
                                className="h-4 w-4 p-0"
                            >
                                {expandedSections.has('characters') ? 
                                    <ChevronDown className="w-3 h-3" /> : 
                                    <ChevronRight className="w-3 h-3" />
                                }
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.has('characters') && (
                        <CardContent className="pt-0 space-y-3">
                            {intelligence.characterIntel.map((char, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-sidebar-foreground/80">
                                            {char.characterName}
                                        </span>
                                        {getTrustworthinessBadge(char.trustworthiness)}
                                    </div>
                                    <div className="text-xs text-sidebar-foreground/60">
                                        {char.behaviorPattern}
                                    </div>
                                    {char.exploitableWeakness && (
                                        <div className="text-xs text-amber-300">
                                            🎯 {char.exploitableWeakness}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Hidden Opportunities */}
            {intelligence.hiddenOpportunities.length > 0 && (
                <Card className="bg-sidebar-card border-sidebar-border/50 border-green-500/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium flex items-center justify-between">
                            <div className="flex items-center gap-2 text-green-400">
                                <Search className="w-3 h-3" />
                                Opportunities ({intelligence.hiddenOpportunities.length})
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSection('opportunities')}
                                className="h-4 w-4 p-0"
                            >
                                {expandedSections.has('opportunities') ? 
                                    <ChevronDown className="w-3 h-3" /> : 
                                    <ChevronRight className="w-3 h-3" />
                                }
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    {expandedSections.has('opportunities') && (
                        <CardContent className="pt-0 space-y-2">
                            {intelligence.hiddenOpportunities.map((opp, index) => (
                                <div key={index} className="text-xs text-green-300 flex items-start gap-2">
                                    <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>{opp}</span>
                                </div>
                            ))}
                        </CardContent>
                    )}
                </Card>
            )}
        </div>
    );
};

export default LoopIntelligencePanel;