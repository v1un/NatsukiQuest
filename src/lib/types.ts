export interface Character {
  name: string;
  affinity: number; // 0-100
  status: string;
  description: string;
  avatar: string; // URL to placeholder
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
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide-react icon name
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
  interactionType: 'EXAMINE' | 'INTERACT' | 'LORE' | 'QUEST';
  loreId?: string;
  questId?: string;
  isDiscovered: boolean;
  discoveredAt?: Date;
}

// Relationship conflict system
export interface RelationshipConflict {
  id: string;
  characters: string[]; // Characters involved in conflict
  type: 'JEALOUSY' | 'RIVALRY' | 'ROMANCE' | 'POLITICAL' | 'PERSONAL';
  severity: number; // 1-10 scale
  description: string;
  triggers: string[]; // Actions that can escalate/resolve
  consequences: ConflictConsequence[];
  isActive: boolean;
  startedAt: Date;
  resolvedAt?: Date;
}

export interface ConflictConsequence {
  character: string;
  affinityChange: number;
  dialogue?: string;
  questImpact?: string;
  storyBranching?: string;
}
