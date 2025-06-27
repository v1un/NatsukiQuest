// New types for advanced systems
export interface WorldState {
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  weather: 'Clear' | 'Cloudy' | 'Rainy' | 'Stormy' | 'Sunny';
  majorEvents: Array<{
    id: string;
    name: string;
    description: string;
    isActive: boolean;
  }>;
}

export interface CharacterBond {
  characterName: string;
  relationship: string; // e.g., "Friend", "Rival", "Family"
  strength: number; // 0-100
  description?: string; // Optional description of the relationship
}

export interface Character {
  name: string;
  affinity: number; // 0-100
  status: string;
  description: string;
  avatar: string; // URL to placeholder
  bonds?: CharacterBond[];
  currentLocation: string; // Where the character is currently located
  firstMetAt?: string; // Where the player first encountered this character
  lastSeenAt?: Date; // When the character was last encountered
  lastInteractionReason?: string; // Reason for last affinity change
  isImportant?: boolean; // Whether this is a major story character
  locationHistory?: Array<{
    location: string;
    leftAt: Date;
    reason?: string;
  }>;
}

// Database model interfaces to match Prisma schema
export interface User {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  gameSaves: GameSave[];
  loreEntries: LoreEntry[];
  quests: Quest[];
  reputations: Reputation[];
  environmentalDetails: EnvironmentalDetail[];
  relationshipConflicts: RelationshipConflict[];
}

export interface GameSave {
  id: string;
  state: GameState;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
  quantity?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
}

export interface RbDLoss {
  type: 'inventory' | 'relationship' | 'progress' | 'knowledge' | 'location' | 'quest' | 'skill';
  description: string;
  details: string;
  severity: 'minor' | 'moderate' | 'major';
}

export interface LoopIntelligence {
  keyInsights: Array<{
    category: 'character_behavior' | 'environmental_hazard' | 'timing' | 'dialogue_clue' | 'hidden_mechanic' | 'strategic_opportunity';
    insight: string;
    actionableAdvice: string;
    confidence: 'high' | 'medium' | 'low';
  }>;
  strategicRecommendations: string[];
  warningsToAvoid: string[];
  optimalTiming: Array<{
    action: string;
    timing: string;
    reason: string;
  }>;
  characterIntel: Array<{
    characterName: string;
    behaviorPattern: string;
    exploitableWeakness?: string;
    trustworthiness: 'high' | 'medium' | 'low' | 'hostile';
  }>;
  hiddenOpportunities: string[];
  criticalMistakes: Array<{
    mistake: string;
    consequence: string;
    avoidanceStrategy: string;
  }>;
}

export interface GameState {
  userId?: string; // Added to track user
  narrative: string;
  currentText?: string; // Added for backwards compatibility
  choices: string[];
  characters: Character[];
  inventory: Item[];
  skills: Skill[];
  currentLoop: number;
  isGameOver: boolean;
  checkpoint: GameState | null;
  lastOutcome: string;
  memory: string;
  // New system additions
  discoveredLore: string[]; // Array of discovered lore entry IDs
  activeQuests: Quest[];
  completedQuests: Quest[];
  reputations: Reputation[];
  currentLocation: string;
  environmentalDetails: EnvironmentalDetail[];
  relationshipConflicts: RelationshipConflict[];
  // RbD tracking
  lastRbDLosses?: RbDLoss[]; // What was lost in the most recent Return by Death
  rbdTrigger?: 'ai_automatic' | 'ai_narrative' | 'manual'; // How RbD was triggered
  checkpointReason?: string; // Why the current checkpoint was set
  // Loop Intelligence
  loopIntelligence?: LoopIntelligence; // Strategic analysis of previous loop
  lastDeathCause?: string; // What caused the most recent death
  worldState?: WorldState;
}

// Lorebook system
export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isDiscovered: boolean;
  discoveredAt?: Date;
  location?: string;
  characters: string[];
}

// Quest system
export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'MAIN' | 'SIDE' | 'ROMANCE' | 'FACTION' | 'EXPLORATION';
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  objectives: QuestObjective[];
  rewards?: QuestReward[];
  startedAt: Date;
  completedAt?: Date;
  location?: string;
  npcsInvolved: string[];
  prerequisites: string[];
}

export interface QuestObjective {
  id: string;
  description: string;
  isCompleted: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface QuestReward {
  type: 'ITEM' | 'SKILL' | 'REPUTATION' | 'RELATIONSHIP';
  itemId?: string;
  skillId?: string;
  faction?: string;
  character?: string;
  amount: number;
}

// Reputation system
export interface Reputation {
  id: string;
  faction: string;
  level: number; // -100 to 100
  title?: string;
  history: ReputationChange[];
}

export interface ReputationChange {
  amount: number;
  reason: string;
  timestamp: Date;
  location?: string;
}

// Environmental storytelling
export interface EnvironmentalDetail {
  id: string;
  location: string;
  description: string;
  interactionType: 'EXAMINE' | 'INTERACT' | 'LORE' | 'QUEST' | 'MOVE';
  loreId?: string;
  questId?: string;
  isDiscovered: boolean;
  discoveredAt?: Date;
}

// Relationship conflict system
export interface RelationshipConflict {
  id: string;
  charactersInvolved: string[]; // Characters involved in conflict
  description: string;
  status: 'ACTIVE' | 'RESOLVED' | 'DORMANT';
  type?: 'JEALOUSY' | 'RIVALRY' | 'ROMANCE' | 'POLITICAL' | 'PERSONAL';
  severity?: number; // 1-10 scale
  triggers?: string[]; // Actions that can escalate/resolve
  consequences?: ConflictConsequence[];
  startedAt?: Date;
  resolvedAt?: Date;
}

export interface ConflictConsequence {
  character: string;
  affinityChange: number;
  dialogue?: string;
  questImpact?: string;
  storyBranching?: string;
}
