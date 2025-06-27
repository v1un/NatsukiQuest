import type { GameState } from '@/lib/types';

export const initialGameState: GameState = {
  narrative: `Sunlight stabs your eyes, a stark contrast to the fluorescent hum of the convenience store you were just in. The scent of roasted nuts and strange, sweet flowers overwhelms the lingering smell of instant noodles on your tracksuit. A cacophony of sounds—the clatter of wooden wheels on cobblestone, the chatter of voices in an unknown tongue, the distant cry of some winged beast—assaults your ears. You are Natsuki Subaru, a bewildered teenager clutching a plastic bag of groceries, suddenly and inexplicably standing in the heart of a bustling fantasy city. The market district around you thrums with life as merchants hawk their wares and people of various races go about their daily business. This strange new world feels both wondrous and overwhelming.`,
  choices: [
    "Approach the crowd that seems to be gathering around something important.",
    "Stay back and observe the situation from a safe distance.",
    "Find a quiet alley to try and make sense of what just happened.",
    "Examine the contents of your grocery bag for anything useful."
  ],
  characters: [], // Characters are now tracked dynamically as they're encountered
  inventory: [
    {
      id: "item_1",
      name: "Flip Phone",
      description: "Your trusty 'garakei'. No signal here, making it a glorified paperweight. The battery is at 82%.",
      icon: "Smartphone",
    },
    {
      id: "item_2",
      name: "Bag of Convenience Store Snacks",
      description: "A plastic bag containing a bag of potato chips, a cup of instant ramen, and a bottle of green tea. A taste of home.",
      icon: "ShoppingBag",
    },
    {
      id: "item_3",
      name: "Tracksuit",
      description: "The height of modern fashion (in your opinion). Not particularly durable or warm, but it's comfortable.",
      icon: "Shirt",
    }
  ],
  skills: [
    {
      id: "skill_1",
      name: "Return by Death",
      description: "Upon death, you are resurrected at a prior 'checkpoint' in time, with full memory of the events that led to your demise. A terrible and powerful curse.",
      icon: "ClockRewind",
    },
    {
      id: "skill_2",
      name: "Modern World Knowledge",
      description: "You know about things like germs, basic physics, and pop culture. It's unclear how useful this will be.",
      icon: "BrainCircuit",
    }
  ],
  currentLoop: 1,
  isGameOver: false,
  checkpoint: null,
  lastOutcome: "",
  memory: "Woke up in a fantasy world. Saw a silver-haired girl in trouble.",
  discoveredLore: [],
  activeQuests: [
    {
      id: "quest_main_1",
      title: "The Stolen Insignia",
      description: "The silver-haired girl, Emilia, has had her royal insignia stolen. Recovering it seems to be the first major event in this new world.",
      category: "MAIN",
      status: "ACTIVE",
      objectives: [
        {
          id: "obj_1",
          description: "Speak with Emilia to learn more about the theft.",
          isCompleted: false,
        },
        {
          id: "obj_2",
          description: "Track the thief to their hideout.",
          isCompleted: false
        },
        {
          id: "obj_3",
          description: "Recover the insignia.",
          isCompleted: false
        }
      ],
      rewards: [
        {
          type: "REPUTATION",
          faction: "Emilia Camp",
          amount: 25
        },
        {
          type: "ITEM",
          itemId: "emilia_favor",
          amount: 1
        }
      ],
      startedAt: new Date(),
      location: "Lugunica Capital",
      npcsInvolved: [], // NPCs will be added dynamically as they're encountered
      prerequisites: []
    }
  ],
  completedQuests: [],
  reputations: [
    {
      id: "rep_lugunica_royal_guard",
      faction: "Royal Guard of Lugunica",
      level: 0,
      history: []
    },
    {
      id: "rep_emilia_camp",
      faction: "Emilia Camp",
      level: 5,
      title: "Potential Ally",
      history: [
        {
          amount: 5,
          reason: "Initial encounter with Emilia",
          timestamp: new Date(),
          location: "Lugunica Capital"
        }
      ]
    },
    {
      id: "rep_slums",
      faction: "Slums of Lugunica",
      level: 0,
      history: []
    }
  ],
  currentLocation: "Lugunica Capital - Market District",
  environmentalDetails: [
    {
      id: "env_1",
      location: "Lugunica Capital - Market District",
      description: "The main thoroughfare is a vibrant, chaotic mix of species and commerce. Humans, demi-humans, and beast-men haggle over goods under the watchful eyes of the city guard. The architecture is a blend of medieval European and high fantasy.",
      interactionType: "EXAMINE",
      isDiscovered: true
    },
    {
      id: "env_2",
      location: "Lugunica Capital - Back Alley",
      description: "A maze of narrow, shadowy alleys behind the main market. The air is cooler here, and the sounds of the crowd are muffled. It feels like a place where secrets are traded and dangers lurk.",
      interactionType: "MOVE",
      isDiscovered: false
    }
  ],
  relationshipConflicts: [], // Conflicts will be created dynamically as characters are introduced
  worldState: {
      timeOfDay: "Afternoon",
      weather: "Sunny",
      majorEvents: [
          {
              id: "event_royal_selection",
              name: "The Royal Selection",
              description: "The Kingdom of Lugunica is in the process of selecting its next ruler from a pool of candidates.",
              isActive: true
          }
      ]
  }
};
