'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Bookmark, RotateCcw, TrendingDown, ChevronDown, ChevronRight, AlertTriangle, Package, Heart, MapPin, Scroll, Award } from 'lucide-react';
import { GameState, RbDLoss } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface CheckpointStatusProps {
    gameState: GameState | null;
}

const CheckpointStatusSimple: React.FC<CheckpointStatusProps> = ({ gameState }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [showLosses, setShowLosses] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Card className="bg-sidebar-card border-sidebar-border/50">
                <CardContent className="p-3">
                    <div className="text-xs text-sidebar-foreground/60">
                        Loading checkpoint status...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!gameState) {
        return (
            <Card className="bg-sidebar-card border-sidebar-border/50">
                <CardContent className="p-3">
                    <div className="text-xs text-sidebar-foreground/60">
                        No active game session
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Calculate what would be lost if RbD triggered now
    const calculatePotentialLosses = (): RbDLoss[] => {
        if (!gameState || !gameState.checkpoint) return [];
        
        const losses: RbDLoss[] = [];
        const checkpoint = gameState.checkpoint;
        
        try {
            // Check inventory changes
            const newItems = gameState.inventory?.filter(item => 
                !checkpoint.inventory?.some(checkItem => checkItem.id === item.id)
            ) || [];
            if (newItems.length > 0) {
                losses.push({
                    type: 'inventory',
                    description: `${newItems.length} item${newItems.length > 1 ? 's' : ''} gained`,
                    details: newItems.map(item => item.name).join(', '),
                    severity: newItems.length > 3 ? 'major' : newItems.length > 1 ? 'moderate' : 'minor'
                });
            }

            // Check relationship changes
            const relationshipChanges = gameState.characters?.filter(char => {
                const checkpointChar = checkpoint.characters?.find(c => c.name === char.name);
                return checkpointChar && Math.abs(char.affinity - checkpointChar.affinity) > 5;
            }) || [];
            if (relationshipChanges.length > 0) {
                losses.push({
                    type: 'relationship',
                    description: `${relationshipChanges.length} relationship${relationshipChanges.length > 1 ? 's' : ''} changed`,
                    details: relationshipChanges.map(char => {
                        const checkChar = checkpoint.characters?.find(c => c.name === char.name);
                        const diff = char.affinity - (checkChar?.affinity || 0);
                        return `${char.name} (${diff > 0 ? '+' : ''}${diff})`;
                    }).join(', '),
                    severity: relationshipChanges.some(c => {
                        const checkChar = checkpoint.characters?.find(cc => cc.name === c.name);
                        return checkChar && Math.abs(c.affinity - checkChar.affinity) > 20;
                    }) ? 'major' : 'moderate'
                });
            }

            // Check location changes
            if (gameState.currentLocation !== checkpoint.currentLocation) {
                losses.push({
                    type: 'location',
                    description: 'Location changed',
                    details: `From ${checkpoint.currentLocation} to ${gameState.currentLocation}`,
                    severity: 'minor'
                });
            }
        } catch (error) {
            console.warn('Error calculating potential losses:', error);
        }

        return losses;
    };

    const potentialLosses = calculatePotentialLosses();
    const hasCheckpoint = !!(gameState && gameState.checkpoint);
    const checkpointAge = (gameState && gameState.checkpoint) ? 
        (gameState.memory?.split('\n')?.length || 0) - (gameState.checkpoint.memory?.split('\n')?.length || 0) : 0;
    
    const getLossIcon = (type: string) => {
        switch (type) {
            case 'inventory': return <Package className="w-3 h-3" />;
            case 'relationship': return <Heart className="w-3 h-3" />;
            case 'location': return <MapPin className="w-3 h-3" />;
            case 'knowledge': return <Scroll className="w-3 h-3" />;
            case 'quest': return <Scroll className="w-3 h-3" />;
            case 'skill': return <Award className="w-3 h-3" />;
            default: return <AlertTriangle className="w-3 h-3" />;
        }
    };

    return (
        <div className="space-y-3">
            {/* Current Status */}
            <Card className="bg-sidebar-card border-sidebar-border/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Loop #{gameState?.currentLoop || 0}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetails(!showDetails)}
                            className="h-4 w-4 p-0"
                        >
                            {showDetails ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-sidebar-foreground/60">Checkpoint:</span>
                        <Badge variant={hasCheckpoint ? "default" : "destructive"} className="text-xs px-2 py-0">
                            {hasCheckpoint ? "Active" : "None"}
                        </Badge>
                    </div>
                    
                    {hasCheckpoint && (
                        <div className="text-xs text-sidebar-foreground/60">
                            <div className="flex items-center gap-1">
                                <Bookmark className="w-3 h-3" />
                                <span>{checkpointAge} action{checkpointAge !== 1 ? 's' : ''} ago</span>
                            </div>
                            {gameState?.checkpointReason && (
                                <div className="text-xs text-sidebar-foreground/50 mt-1 italic">
                                    "{gameState.checkpointReason}"
                                </div>
                            )}
                        </div>
                    )}

                    {showDetails && (
                        <div className="space-y-2 mt-2">
                            <Separator className="bg-sidebar-border/30" />
                            
                            {/* Current vs Checkpoint Comparison */}
                            <div className="space-y-1">
                                <div className="text-xs font-medium text-sidebar-foreground/80">Current State:</div>
                                <div className="text-xs text-sidebar-foreground/60 space-y-1">
                                    <div>• Items: {gameState?.inventory?.length || 0}</div>
                                    <div>• Characters: {gameState?.characters?.length || 0}</div>
                                    <div>• Active Quests: {gameState?.activeQuests?.length || 0}</div>
                                    <div>• Skills: {gameState?.skills?.length || 0}</div>
                                    <div>• Location: {gameState?.currentLocation || 'Unknown'}</div>
                                </div>
                            </div>

                            {hasCheckpoint && (
                                <div className="space-y-1">
                                    <div className="text-xs font-medium text-sidebar-foreground/80">Checkpoint State:</div>
                                    <div className="text-xs text-sidebar-foreground/60 space-y-1">
                                        <div>• Items: {gameState?.checkpoint?.inventory?.length || 0}</div>
                                        <div>• Characters: {gameState?.checkpoint?.characters?.length || 0}</div>
                                        <div>• Active Quests: {gameState?.checkpoint?.activeQuests?.length || 0}</div>
                                        <div>• Skills: {gameState?.checkpoint?.skills?.length || 0}</div>
                                        <div>• Location: {gameState?.checkpoint?.currentLocation || 'Unknown'}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Last RbD Losses */}
            {gameState?.lastRbDLosses && gameState.lastRbDLosses.length > 0 && (
                <Card className="bg-sidebar-card border-sidebar-border/50 border-red-500/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium flex items-center justify-between">
                            <div className="flex items-center gap-2 text-red-400">
                                <RotateCcw className="w-3 h-3" />
                                Last RbD Losses
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowLosses(!showLosses)}
                                className="h-4 w-4 p-0"
                            >
                                {showLosses ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="text-xs text-sidebar-foreground/60 mb-2">
                            {gameState?.lastRbDLosses?.length || 0} thing{(gameState?.lastRbDLosses?.length || 0) > 1 ? 's' : ''} lost in loop #{(gameState?.currentLoop || 1) - 1}
                        </div>
                        
                        {showLosses && (
                            <div className="space-y-2">
                                {(gameState?.lastRbDLosses || []).map((loss, index) => (
                                    <div key={index} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs">
                                                {getLossIcon(loss.type)}
                                                <span className="text-sidebar-foreground/80">{loss.description}</span>
                                            </div>
                                            <Badge 
                                                variant={
                                                    loss.severity === 'major' ? 'destructive' : 
                                                    loss.severity === 'moderate' ? 'outline' : 'secondary'
                                                }
                                                className="text-xs px-1 py-0"
                                            >
                                                {loss.severity}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-sidebar-foreground/50 ml-5">
                                            {loss.details}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Potential RbD Losses */}
            {potentialLosses.length > 0 && (
                <Card className="bg-sidebar-card border-sidebar-border/50 border-amber-500/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-medium flex items-center gap-2 text-amber-400">
                            <TrendingDown className="w-3 h-3" />
                            Would be Lost
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                        {potentialLosses.slice(0, 3).map((loss, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    {getLossIcon(loss.type)}
                                    <span className="text-sidebar-foreground/80">{loss.description}</span>
                                </div>
                                <Badge 
                                    variant={
                                        loss.severity === 'major' ? 'destructive' : 
                                        loss.severity === 'moderate' ? 'outline' : 'secondary'
                                    }
                                    className="text-xs px-1 py-0"
                                >
                                    {loss.severity}
                                </Badge>
                            </div>
                        ))}
                        {potentialLosses.length > 3 && (
                            <div className="text-xs text-sidebar-foreground/50">
                                +{potentialLosses.length - 3} more...
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* AI Control Notice */}
            <Card className="bg-sidebar-card border-sidebar-border/50 border-blue-500/30">
                <CardContent className="p-3">
                    <div className="text-xs text-blue-400 flex items-center gap-2">
                        <RotateCcw className="w-3 h-3" />
                        <span>AI-Controlled System</span>
                    </div>
                    <div className="text-xs text-sidebar-foreground/60 mt-1">
                        Checkpoints and RbD are fully managed by the AI Game Master based on narrative needs.
                    </div>
                    {gameState?.rbdTrigger && (
                        <div className="text-xs text-sidebar-foreground/50 mt-1">
                            Last trigger: {gameState.rbdTrigger === 'ai_narrative' ? 'AI Narrative Decision' : 'AI Automatic'}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CheckpointStatusSimple;