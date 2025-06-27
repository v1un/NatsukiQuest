// src/ai/flows/multi-character-dialogue.ts
'use server';
/**
 * @fileOverview Multi-Character Conversation System
 * 
 * Handles complex group dialogues with multiple characters, managing:
 * - Character personality consistency
 * - Dialogue flow and turn management
 * - Conflict resolution between characters
 * - Dynamic character interactions
 * - Conversation state tracking
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Character conversation state
const ConversationCharacterSchema = z.object({
  name: z.string(),
  affinity: z.number(),
  status: z.string(),
  description: z.string(),
  avatar: z.string(),
  personalityTraits: z.array(z.string()).describe("Key personality traits that affect dialogue"),
  currentMood: z.string().describe("Current emotional state in this conversation"),
  relationshipToPlayer: z.string().describe("How this character currently views the player"),
  relationshipToOthers: z.record(z.string()).describe("Relationships with other characters present"),
  dialogueHistory: z.array(z.string()).describe("Recent dialogue from this character"),
  conversationGoals: z.array(z.string()).describe("What this character wants from this conversation"),
});

// Conversation context and state
const MultiCharacterDialogueInputSchema = z.object({
  userId: z.string().describe("The user ID for database operations"),
  conversationId: z.string().describe("Unique conversation identifier"),
  characters: z.array(ConversationCharacterSchema).describe("All characters participating in the conversation"),
  conversationTopic: z.string().describe("The main topic or subject of the conversation"),
  conversationContext: z.string().describe("The narrative context and setting"),
  playerStatement: z.string().optional().describe("What the player just said or did"),
  conversationHistory: z.array(z.object({
    speaker: z.string(),
    dialogue: z.string(),
    timestamp: z.string(),
    reactions: z.record(z.string()).describe("How other characters reacted to this line"),
  })).describe("Recent conversation history"),
  conversationPhase: z.enum(['OPENING', 'DISCUSSION', 'CONFLICT', 'RESOLUTION', 'CONCLUSION']).describe("Current phase of the conversation"),
  timeLimit: z.number().optional().describe("Conversation time limit in minutes"),
  location: z.string().describe("Where this conversation is taking place"),
  privateConversations: z.array(z.object({
    characters: z.array(z.string()),
    topic: z.string(),
    hidden: z.boolean(),
  })).optional().describe("Side conversations or secrets between characters"),
});

export type MultiCharacterDialogueInput = z.infer<typeof MultiCharacterDialogueInputSchema>;

const MultiCharacterDialogueOutputSchema = z.object({
  nextSpeaker: z.string().describe("The character who speaks next"),
  dialogue: z.string().describe("What the character says"),
  characterReactions: z.record(z.string()).describe("How each character reacts to the dialogue"),
  updatedCharacters: z.array(ConversationCharacterSchema).describe("Updated character states"),
  conversationPhase: z.enum(['OPENING', 'DISCUSSION', 'CONFLICT', 'RESOLUTION', 'CONCLUSION']).describe("Updated conversation phase"),
  atmosphereChange: z.string().describe("How the conversation atmosphere has changed"),
  playerChoices: z.array(z.string()).describe("Available responses for the player"),
  conversationEffects: z.object({
    affinityChanges: z.record(z.number()).describe("Affinity changes between characters"),
    newRelationships: z.record(z.string()).describe("New or changed relationships"),
    revealedInformation: z.array(z.string()).describe("Information revealed during conversation"),
    triggeredEvents: z.array(z.string()).describe("Events triggered by this conversation"),
  }).describe("Effects of this conversation turn"),
  isConversationEnding: z.boolean().describe("Whether the conversation is coming to an end"),
  nextConversationTrigger: z.string().optional().describe("What might trigger the next conversation"),
});

export type MultiCharacterDialogueOutput = z.infer<typeof MultiCharacterDialogueOutputSchema>;

export async function multiCharacterDialogue(input: MultiCharacterDialogueInput): Promise<MultiCharacterDialogueOutput> {
  return multiCharacterDialogueFlow(input);
}

const multiCharacterDialoguePrompt = ai.definePrompt({
  name: 'multiCharacterDialoguePrompt',
  input: { schema: MultiCharacterDialogueInputSchema },
  output: { schema: MultiCharacterDialogueOutputSchema },
  prompt: `You are the Multi-Character Dialogue Manager for Natsuki Quest: A Re:Zero Adventure.

Your role is to orchestrate complex group conversations with multiple characters, ensuring each character maintains their unique personality, relationships, and goals while creating engaging, dynamic dialogue.

**CORE RESPONSIBILITIES:**
1. **Character Consistency** - Each character must speak/act according to their personality traits and current mood
2. **Relationship Dynamics** - Characters react to each other based on their established relationships
3. **Dialogue Flow** - Manage natural conversation flow, interruptions, and turn-taking
4. **Conflict Management** - Handle disagreements, tensions, and character conflicts realistically
5. **Information Revelation** - Control what information is shared and when
6. **Atmosphere Control** - Adjust conversation tone and tension appropriately

**CONVERSATION CONTEXT:**
- **Conversation ID:** {{{conversationId}}}
- **Topic:** {{{conversationTopic}}}
- **Setting:** {{{location}}}
- **Context:** {{{conversationContext}}}
- **Current Phase:** {{{conversationPhase}}}
- **Player Statement:** {{{playerStatement}}}

**PARTICIPATING CHARACTERS:**
{{#each characters}}
- **{{{name}}}** (Affinity: {{{affinity}}}, Status: {{{status}}})
  - Personality: {{{personalityTraits}}}
  - Current Mood: {{{currentMood}}}
  - Relationship to Player: {{{relationshipToPlayer}}}
  - Goals: {{{conversationGoals}}}
{{/each}}

**RECENT CONVERSATION HISTORY:**
{{#each conversationHistory}}
**{{{speaker}}}:** "{{{dialogue}}}"
{{#each reactions}}
  - {{{@key}}}: {{{this}}}
{{/each}}
{{/each}}

**PRIVATE CONVERSATIONS:**
{{#each privateConversations}}
- Between {{{characters}}}: {{{topic}}} (Hidden: {{{hidden}}})
{{/each}}

**DIALOGUE MANAGEMENT RULES:**

**Character Speaking Priority:**
1. Characters with the strongest emotional reaction to recent dialogue
2. Characters whose goals are most relevant to current topic
3. Characters with relationship conflicts that need addressing
4. Characters who haven't spoken in a while

**Personality-Based Dialogue:**
- **Emilia:** Gentle, diplomatic, tries to mediate conflicts
- **Rem:** Loyal, protective, speaks directly when passionate
- **Ram:** Sarcastic, superior attitude, often dismissive
- **Beatrice:** Arrogant, cryptic, uses archaic speech patterns
- **Roswaal:** Theatrical, manipulative, speaks in riddles
- **Subaru:** Emotional, determined, sometimes awkward

**Conversation Flow Mechanics:**
- Natural interruptions when characters disagree
- Characters support allies and oppose enemies
- Private knowledge affects what characters reveal
- Emotional moments cause character mood changes
- Conflicts escalate unless mediated

**Relationship Dynamics:**
- Characters with high affinity support each other
- Characters with low affinity create tension
- Romantic interests show subtle favoritism
- Authority figures command respect or resentment
- Secrets create awkward pauses or deflections

**Advanced Features:**
1. **Subtext:** Characters may say one thing but mean another
2. **Non-Verbal Reactions:** Include gestures, expressions, body language
3. **Interruptions:** Characters cut each other off during heated moments
4. **Alliances:** Characters may team up against others in conversation
5. **Information Control:** Characters reveal or withhold information strategically

**Conversation Phase Guidelines:**
- **OPENING:** Characters establish positions and goals
- **DISCUSSION:** Active exchange of ideas and information
- **CONFLICT:** Disagreements escalate, tensions rise
- **RESOLUTION:** Characters work toward agreement or compromise
- **CONCLUSION:** Conversation winds down, decisions are made

**Output Requirements:**
1. Choose the most appropriate character to speak next
2. Write dialogue that fits their personality and current mood
3. Show how other characters react (verbally or non-verbally)
4. Update character states based on conversation effects
5. Provide meaningful player response options
6. Track conversation effects on relationships and world state

Generate the next turn of this multi-character conversation, ensuring each character feels distinct and authentic while advancing the narrative meaningfully.`,
});

const multiCharacterDialogueFlow = ai.defineFlow(
  {
    name: 'multiCharacterDialogueFlow',
    inputSchema: MultiCharacterDialogueInputSchema,
    outputSchema: MultiCharacterDialogueOutputSchema,
  },
  async (input) => {
    const { output } = await multiCharacterDialoguePrompt(input);
    return output!;
  }
);