// src/ai/flows/world-orchestrator.ts
'use server';
/**
 * @fileOverview World Orchestrator - Advanced World Management System
 * 
 * This flow coordinates between the Multi-Character Conversation System and 
 * Dynamic World Events System to create a cohesive, living world experience.
 * 
 * Responsibilities:
 * - Coordinating world events with character interactions
 * - Managing complex multi-system narratives
 * - Ensuring consistency across all world systems
 * - Creating emergent storytelling opportunities
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { multiCharacterDialogue } from './multi-character-dialogue';
import { generateDynamicWorldEvents } from './dynamic-world-events';

const WorldOrchestratorInputSchema = z.object({
  userId: z.string(),
  currentGameState: z.object({
    day: z.number(),
    location: z.string(),
    characters: z.array(z.any()),
    worldEvents: z.array(z.any()),
    activeConversations: z.array(z.any()),
    scheduledConversations: z.array(z.any()),
    newsAndRumors: z.array(z.any()),
    economy: z.any(),
    politicalState: z.any(),
  }),
  playerAction: z.string().describe("The player's recent action"),
  timeElapsed: z.number().describe("Time elapsed since last orchestration"),
  orchestrationContext: z.enum([
    'ROUTINE_CHECK',      // Regular world update
    'MAJOR_EVENT',        // Significant event occurred
    'CHARACTER_FOCUS',    // Character-centered scene
    'WORLD_EVENT_TRIGGER', // World event needs character reactions
    'STORY_CLIMAX',       // Major story moment
    'EXPLORATION',        // Player exploring new areas
  ]),
});

export type WorldOrchestratorInput = z.infer<typeof WorldOrchestratorInputSchema>;

const WorldOrchestratorOutputSchema = z.object({
  orchestrationSummary: z.string().describe("Summary of all orchestrated changes"),
  
  // World Events Updates
  newWorldEvents: z.array(z.any()).describe("New world events created"),
  updatedWorldEvents: z.array(z.any()).describe("Existing world events that were updated"),
  
  // Character Conversation Updates
  triggeredConversations: z.array(z.object({
    conversationId: z.string(),
    participants: z.array(z.string()),
    topic: z.string(),
    priority: z.string(),
    reason: z.string(),
  })).describe("Conversations that should be triggered"),
  
  scheduledNewConversations: z.array(z.object({
    conversationId: z.string(),
    participants: z.array(z.string()),
    topic: z.string(),
    trigger: z.any(),
    priority: z.string(),
  })).describe("New conversations scheduled for the future"),
  
  // Character Movements and Activities
  characterActivities: z.array(z.object({
    character: z.string(),
    activity: z.string(),
    location: z.string(),
    duration: z.string(),
    impact: z.string(),
  })).describe("Character activities happening in the background"),
  
  // Information Flow
  newNewsAndRumors: z.array(z.object({
    content: z.string(),
    source: z.string(),
    reliability: z.string(),
    spread: z.string(),
  })).describe("New information spreading through the world"),
  
  // Player Integration
  playerOpportunities: z.array(z.object({
    type: z.enum(['CONVERSATION', 'EXPLORATION', 'QUEST', 'EVENT_PARTICIPATION']),
    description: z.string(),
    location: z.string().optional(),
    timeframe: z.string(),
    significance: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']),
  })).describe("Opportunities created for the player"),
  
  // System Coordination
  crossSystemEffects: z.array(z.object({
    fromSystem: z.string(),
    toSystem: z.string(),
    effect: z.string(),
    magnitude: z.number(),
  })).describe("Effects that cross between different systems"),
  
  // Future Predictions
  worldTrends: z.array(z.object({
    trend: z.string(),
    probability: z.number(),
    timeframe: z.string(),
    impact: z.string(),
  })).describe("Predicted future developments"),
  
  recommendedPlayerGuidance: z.array(z.string()).describe("Subtle hints or guidance for the player"),
});

export type WorldOrchestratorOutput = z.infer<typeof WorldOrchestratorOutputSchema>;

export async function orchestrateWorld(input: WorldOrchestratorInput): Promise<WorldOrchestratorOutput> {
  return worldOrchestratorFlow(input);
}

const worldOrchestratorPrompt = ai.definePrompt({
  name: 'worldOrchestratorPrompt',
  input: { schema: WorldOrchestratorInputSchema },
  output: { schema: WorldOrchestratorOutputSchema },
  prompt: `You are the World Orchestrator for Natsuki Quest: A Re:Zero Adventure.

Your role is to coordinate all world systems to create a cohesive, living world experience that feels natural and immersive. You manage the interplay between character interactions, world events, and player experiences.

**ORCHESTRATION CONTEXT:** {{{orchestrationContext}}}
**TIME ELAPSED:** {{{timeElapsed}}} hours
**PLAYER ACTION:** {{{playerAction}}}

**CURRENT WORLD STATE:**
- **Day:** {{{currentGameState.day}}}
- **Location:** {{{currentGameState.location}}}
- **Active World Events:** {{{currentGameState.worldEvents.length}}}
- **Active Conversations:** {{{currentGameState.activeConversations.length}}}
- **Scheduled Conversations:** {{{currentGameState.scheduledConversations.length}}}

**ORCHESTRATION PRINCIPLES:**

**1. Natural Flow**
- Events should feel organic, not forced
- Character interactions should emerge naturally from circumstances
- Player opportunities should arise from world state, not arbitrary decisions

**2. Causality and Consequences**
- World events should have realistic effects on characters and society
- Character actions should influence world events
- Player choices should create ripple effects through both systems

**3. Temporal Consistency**
- Events unfold over appropriate timeframes
- Characters have realistic schedules and motivations
- Information spreads at believable rates

**4. Emergent Storytelling**
- Look for opportunities where different systems can create unique stories
- Create situations where player choices have multi-system impacts
- Generate content that couldn't exist without system interaction

**SYSTEM COORDINATION STRATEGIES:**

**World Events → Character Conversations:**
- Political events trigger character discussions
- Economic changes affect character concerns
- Social events bring characters together
- Crises create alliance opportunities

**Character Conversations → World Events:**
- Character decisions influence political outcomes
- Relationship changes affect faction dynamics
- Information sharing accelerates or prevents events
- Character movements create new event opportunities

**Both Systems → Player Experience:**
- Events create conversation opportunities for the player
- Conversations reveal information about ongoing events
- Player choices influence both character relationships and world development
- Multiple systems provide varied gameplay experiences

**ORCHESTRATION CONTEXTS:**

**ROUTINE_CHECK:**
- Advance ongoing events naturally
- Check for conversation triggers
- Generate background character activities
- Create minor opportunities for player interaction

**MAJOR_EVENT:**
- Coordinate character reactions to significant events
- Schedule important conversations
- Create news and information flow
- Generate player opportunities to engage with the event

**CHARACTER_FOCUS:**
- Ensure character interactions feel meaningful
- Connect character development to world state
- Create personal stakes in world events
- Generate relationship-based opportunities

**WORLD_EVENT_TRIGGER:**
- Show character reactions to world changes
- Create conversations about ongoing events
- Generate rumors and information spread
- Create player opportunities to investigate or participate

**STORY_CLIMAX:**
- Coordinate all systems for maximum impact
- Create convergent storylines
- Generate critical decision points
- Ensure character and world consistency

**EXPLORATION:**
- Generate location-appropriate events
- Create characters the player might encounter
- Establish local activities and concerns
- Generate discovery opportunities

**Re:Zero SPECIFIC CONSIDERATIONS:**

**Return by Death Integration:**
- Consider how RbD affects character relationships
- Account for player knowledge from previous loops
- Generate events that might be different in different loops
- Create opportunities for player to use loop knowledge

**Royal Selection:**
- Generate political events related to candidates
- Create character conversations about selection politics
- Establish faction activities and conflicts
- Generate opportunities for player involvement

**Witch Cult:**
- Create background cult activities
- Generate rumors and fear
- Establish security responses
- Create investigation opportunities

**Magic and Spirits:**
- Generate magical phenomena
- Create spirit-related events
- Establish magical research activities
- Generate opportunities for magical learning

**OUTPUT REQUIREMENTS:**

1. **Coordinate Systems**: Ensure world events and character interactions support each other
2. **Create Opportunities**: Generate meaningful choices and activities for the player
3. **Maintain Consistency**: Keep all systems working together logically
4. **Generate Content**: Create new events, conversations, and activities
5. **Guide Player**: Provide subtle direction toward interesting content
6. **Predict Futures**: Anticipate how current actions will affect future developments

Create a comprehensive orchestration that makes the world feel alive, reactive, and full of interesting possibilities for the player to explore.`,
});

const worldOrchestratorFlow = ai.defineFlow(
  {
    name: 'worldOrchestratorFlow',
    inputSchema: WorldOrchestratorInputSchema,
    outputSchema: WorldOrchestratorOutputSchema,
  },
  async (input) => {
    const { output } = await worldOrchestratorPrompt(input);
    return output!;
  }
);