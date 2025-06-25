export interface Character {
  name: string;
  affinity: number; // 0-100
  status: string;
  description: string;
  avatar: string; // URL to placeholder
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
  narrative: string;
  choices: string[];
  characters: Character[];
  inventory: Item[];
  skills: Skill[];
  currentLoop: number;
  isGameOver: boolean;
  checkpoint: GameState | null;
  lastOutcome: string;
}
