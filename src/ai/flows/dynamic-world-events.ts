// src/ai/flows/dynamic-world-events.ts
'use server';
/**
 * @fileOverview Dynamic World Events System
 * 
 * Creates and manages background events that happen independently of player actions:
 * - World-state changes that occur over time
 * - NPC activities and movements
 * - Political developments and faction changes
 * - Natural events and environmental changes
 * - Economic fluctuations and market changes
 * - Seasonal events and celebrations
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// World event types and categories
const WorldEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum([
    'POLITICAL', 
    'ECONOMIC', 
    'SOCIAL', 
    'ENVIRONMENTAL', 
    'FACTION', 
    'CHARACTER', 
    'SEASONAL',
    'RELIGIOUS',
    'MAGICAL',
    'CULTURAL'
  ]),
  severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']),
  location: z.string().optional(),
  affectedFactions: z.array(z.string()),
  affectedCharacters: z.array(z.string()),
  duration: z.object({
    startTime: z.string(),
    endTime: z.string().optional(),
    ongoing: z.boolean(),
  }),
  prerequisites: z.array(z.string()).describe("Conditions that must be met for this event to occur"),
  consequences: z.array(z.object({
    type: z.enum(['REPUTATION', 'ECONOMY', 'AVAILABILITY', 'RELATIONSHIP', 'QUEST', 'WORLD_STATE']),
    target: z.string(),
    effect: z.string(),
    value: z.number().optional(),
  })),
  playerAwareness: z.enum(['UNKNOWN', 'RUMORS', 'PARTIAL', 'FULL']),
  discoveryMethod: z.enum(['AUTOMATIC', 'EXPLORATION', 'NPC_DIALOGUE', 'QUEST', 'NEWS']),
  repeatability: z.object({
    canRepeat: z.boolean(),
    cooldownDays: z.number().optional(),
    variations: z.array(z.string()).optional(),
  }),
});

const DynamicWorldEventsInputSchema = z.object({
  userId: z.string(),
  currentGameState: z.object({
    day: z.number(),
    location: z.string(),
    completedQuests: z.array(z.string()),
    activeQuests: z.array(z.string()),
    relationships: z.record(z.number()),
    reputations: z.record(z.number()),
    worldState: z.record(z.any()),
  }),
  timeElapsed: z.number().describe("Time elapsed since last check (in game hours)"),
  playerActions: z.array(z.string()).describe("Recent player actions that might influence world events"),
  currentEvents: z.array(WorldEventSchema).describe("Currently active world events"),
  eventHistory: z.array(z.string()).describe("Recently concluded events"),
  seasonalContext: z.object({
    season: z.enum(['SPRING', 'SUMMER', 'AUTUMN', 'WINTER']),
    month: z.string(),
    day: z.number(),
    specialDays: z.array(z.string()),
  }),
  economicState: z.object({
    prosperity: z.number().describe("Economic prosperity level (0-100)"),
    tradeRoutes: z.array(z.string()),
    marketDemand: z.record(z.number()),
  }),
  politicalState: z.object({
    stability: z.number().describe("Political stability (0-100)"),
    tensions: z.array(z.string()),
    alliances: z.array(z.string()),
  }),
});

export type DynamicWorldEventsInput = z.infer<typeof DynamicWorldEventsInputSchema>;

const DynamicWorldEventsOutputSchema = z.object({
  newEvents: z.array(WorldEventSchema).describe("New events that have begun"),
  updatedEvents: z.array(WorldEventSchema).describe("Existing events that have changed"),
  concludedEvents: z.array(z.string()).describe("Events that have ended"),
  worldStateChanges: z.record(z.any()).describe("Changes to world state due to events"),
  economicChanges: z.object({
    prosperityChange: z.number(),
    priceChanges: z.record(z.number()),
    newTradeRoutes: z.array(z.string()),
    closedTradeRoutes: z.array(z.string()),
  }),
  politicalChanges: z.object({
    stabilityChange: z.number(),
    newTensions: z.array(z.string()),
    resolvedTensions: z.array(z.string()),
    newAlliances: z.array(z.string()),
    brokenAlliances: z.array(z.string()),
  }),
  characterMovements: z.array(z.object({
    character: z.string(),
    fromLocation: z.string(),
    toLocation: z.string(),
    reason: z.string(),
    duration: z.string(),
  })),
  newsAndRumors: z.array(z.object({
    source: z.string(),
    content: z.string(),
    reliability: z.enum(['RUMOR', 'UNCONFIRMED', 'CONFIRMED', 'OFFICIAL']),
    spread: z.enum(['LOCAL', 'REGIONAL', 'KINGDOM_WIDE', 'INTERNATIONAL']),
  })),
  playerImpact: z.object({
    directEffects: z.array(z.string()),
    indirectEffects: z.array(z.string()),
    newOpportunities: z.array(z.string()),
    newChallenges: z.array(z.string()),
  }),
  futurePredictions: z.array(z.object({
    event: z.string(),
    probability: z.number(),
    timeframe: z.string(),
    conditions: z.array(z.string()),
  })),
});

export type DynamicWorldEventsOutput = z.infer<typeof DynamicWorldEventsOutputSchema>;

export async function generateDynamicWorldEvents(input: DynamicWorldEventsInput): Promise<DynamicWorldEventsOutput> {
  return dynamicWorldEventsFlow(input);
}

const dynamicWorldEventsPrompt = ai.definePrompt({
  name: 'dynamicWorldEventsPrompt',
  input: { schema: DynamicWorldEventsInputSchema },
  output: { schema: DynamicWorldEventsOutputSchema },
  prompt: `You are the Dynamic World Events Generator for Natsuki Quest: A Re:Zero Adventure.

Your role is to create a living, breathing world where events happen independently of the player's direct actions, making the game world feel alive and reactive.

**CORE PRINCIPLES:**
1. **Autonomous Events** - Events occur based on world logic, not just player actions
2. **Cascading Effects** - Events trigger other events and create ripple effects
3. **Temporal Consistency** - Events unfold over realistic timeframes
4. **Lore Accuracy** - All events must fit within Re:Zero universe
5. **Player Integration** - Events create opportunities and challenges for the player

**CURRENT WORLD STATE:**
- **Day:** {{{currentGameState.day}}}
- **Location:** {{{currentGameState.location}}}
- **Time Elapsed:** {{{timeElapsed}}} hours
- **Season:** {{{seasonalContext.season}}} - {{{seasonalContext.month}}} {{{seasonalContext.day}}}

**GAME STATE CONTEXT:**
- **Completed Quests:** {{{currentGameState.completedQuests}}}
- **Active Quests:** {{{currentGameState.activeQuests}}}
- **Relationships:** {{json currentGameState.relationships}}
- **Reputations:** {{json currentGameState.reputations}}

**ECONOMIC STATE:**
- **Prosperity:** {{{economicState.prosperity}}}/100
- **Trade Routes:** {{{economicState.tradeRoutes}}}
- **Market Demand:** {{json economicState.marketDemand}}

**POLITICAL STATE:**
- **Stability:** {{{politicalState.stability}}}/100
- **Current Tensions:** {{{politicalState.tensions}}}
- **Active Alliances:** {{{politicalState.alliances}}}

**RECENT PLAYER ACTIONS:**
{{#each playerActions}}
- {{{this}}}
{{/each}}

**CURRENT ACTIVE EVENTS:**
{{#each currentEvents}}
- **{{{title}}}** ({{{category}}}, {{{severity}}})
  Description: {{{description}}}
  Location: {{{location}}}
  Ongoing: {{{duration.ongoing}}}
{{/each}}

**RECENT EVENT HISTORY:**
{{#each eventHistory}}
- {{{this}}}
{{/each}}

**EVENT GENERATION GUIDELINES:**

**Political Events:**
- Royal Selection developments
- Noble house conflicts
- Diplomatic missions
- Border tensions
- Trade negotiations
- Legal changes

**Economic Events:**
- Market fluctuations
- Trade route changes
- Resource discoveries
- Merchant guild activities
- Crop yields
- Seasonal demand changes

**Social Events:**
- Festivals and celebrations
- Religious ceremonies
- Cultural exchanges
- Population movements
- Crime waves
- Public unrest

**Environmental Events:**
- Weather patterns
- Natural disasters
- Seasonal changes
- Magical phenomena
- Wildlife migrations
- Resource depletion

**Faction Events:**
- Witch Cult activities
- Knight order missions
- Merchant guild policies
- Religious movements
- Resistance activities
- International relations

**Character Events:**
- NPC travels and movements
- Personal relationships
- Career changes
- Health issues
- Family events
- Skill development

**EVENT PROBABILITY FACTORS:**
- **High Probability:** Seasonal events, economic cycles, routine activities
- **Medium Probability:** Political tensions, social movements, character developments
- **Low Probability:** Major disasters, magical events, international conflicts
- **Very Low Probability:** World-changing events, divine interventions

**EVENT DURATION GUIDELINES:**
- **MINOR:** 1-3 days (local celebrations, weather changes)
- **MODERATE:** 1-2 weeks (market fluctuations, small conflicts)
- **MAJOR:** 1-3 months (political developments, seasonal changes)
- **CRITICAL:** 3+ months (wars, major disasters, regime changes)

**CASCADING EFFECT RULES:**
1. Economic events affect trade and prices
2. Political events affect faction relationships
3. Social events affect character availability
4. Environmental events affect travel and resources
5. Character events affect quest availability

**PLAYER AWARENESS LEVELS:**
- **UNKNOWN:** Player has no knowledge of the event
- **RUMORS:** Player hears whispers and speculation
- **PARTIAL:** Player knows some details but not the full picture
- **FULL:** Player is completely informed about the event

**DISCOVERY METHODS:**
- **AUTOMATIC:** Player learns through main story progression
- **EXPLORATION:** Player discovers through travel and investigation
- **NPC_DIALOGUE:** NPCs share information in conversations
- **QUEST:** Player learns through quest-related activities
- **NEWS:** Player hears through official announcements or reports

**Re:Zero Specific Events:**
- Witch Cult movements and attacks
- Royal Selection candidate activities
- Dragon prophecy developments
- Magical research discoveries
- Inter-dimensional phenomena
- Return by Death timeline effects

**OUTPUT REQUIREMENTS:**
1. Generate 1-3 new events appropriate to current context
2. Update existing events with new developments
3. Conclude events that have run their course
4. Apply world state changes from event consequences
5. Create news and rumors that NPCs might share
6. Predict future events based on current trends
7. Ensure events create both opportunities and challenges for the player

Create events that make the world feel alive and independent while still providing meaningful interactions for the player's story.`,
});

const dynamicWorldEventsFlow = ai.defineFlow(
  {
    name: 'dynamicWorldEventsFlow',
    inputSchema: DynamicWorldEventsInputSchema,
    outputSchema: DynamicWorldEventsOutputSchema,
  },
  async (input) => {
    const { output } = await dynamicWorldEventsPrompt(input);
    return output!;
  }
);