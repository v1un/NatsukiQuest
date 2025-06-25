import type { GameState } from '@/lib/types';

export const initialGameState: GameState = {
  narrative: `You blink, and the familiar sight of the convenience store dissolves into a riot of color and noise. A bustling street, filled with strange people and stranger creatures, stretches before you. A dragon-drawn carriage clatters past. The air smells of spices you can't name. This is definitely not Japan. You are Natsuki Subaru, and your adventure in another world has just begun. Before you can get your bearings, you spot a flash of silver hair and purple eyes in the crowd—a girl with an ethereal beauty, clearly in distress.`,
  choices: [
    "Try to help the silver-haired girl.",
    "Ignore her and explore the city.",
    "Look for someone who can explain what's happening."
  ],
  characters: [
    {
      name: "Emilia",
      affinity: 10,
      status: "Met",
      description: "A kind-hearted half-elf with a troubled past, currently a candidate for the royal selection.",
      avatar: "https://placehold.co/100x100.png",
    },
    {
      name: "Puck",
      affinity: 5,
      status: "Met",
      description: "Emilia's spirit companion, a powerful being in the form of a small, cat-like creature.",
      avatar: "https://placehold.co/100x100.png",
    }
  ],
  inventory: [
    {
      id: "item_1",
      name: "Flip Phone",
      description: "A relic from your old world. Mostly useless, but holds sentimental value.",
      icon: "Smartphone",
    },
    {
      id: "item_2",
      name: "Bag of Groceries",
      description: "Some snacks you bought. Might come in handy.",
      icon: "ShoppingBag",
    }
  ],
  skills: [
    {
      id: "skill_1",
      name: "Return by Death",
      description: "Upon death, you return to a previous 'save point' in time. You are the only one who remembers what happened.",
      icon: "ClockRewind",
    }
  ],
  currentLoop: 1,
  isGameOver: false,
  checkpoint: null,
  lastOutcome: "",
  memory: "",
};
