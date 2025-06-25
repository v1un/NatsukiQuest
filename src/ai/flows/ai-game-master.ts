// src/ai/flows/ai-game-master.ts
'use server';
/**
 * @fileOverview The AI Game Master flow, responsible for dynamically generating
 * the story, world, character interactions, and managing game state based on
 * user choices in the Re:Zero adventure.
 *
 * - aiGameMaster - A function that initiates the game master flow.
 * - AiGameMasterInput - The input type for the aiGameMaster function.
 * - AiGameMasterOutput - The return type for the aiGameMaster function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schemas for structured data matching lib/types.ts
const CharacterSchema = z.object({
  name: z.string(),
  affinity: z.number(),
  status: z.string(),
  description: z.string(),
  avatar: z.string().describe("URL for a placeholder avatar, e.g., 'https://placehold.co/100x100.png'"),
});

const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
});

const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
});


const AiGameMasterInputSchema = z.object({
  playerChoice: z.string().describe("The choice the player just made."),
  currentNarrative: z.string().describe("The story narrative so far."),
  characters: z.array(CharacterSchema).describe("The current state of all characters."),
  inventory: z.array(ItemSchema).describe("The player's current inventory."),
  skills: z.array(SkillSchema).describe("The player's current skills."),
  memory: z.string().optional().describe("A summary of past critical events and choices to maintain continuity."),
  injectedLore: z.string().optional().describe("Contextually relevant lore injected by the lorebook system."),
});
export type AiGameMasterInput = z.infer<typeof AiGameMasterInputSchema>;

const AiGameMasterOutputSchema = z.object({
  newNarrative: z.string().describe("The next chapter of the story, describing the outcome of the player's choice and advancing the plot."),
  newChoices: z.array(z.string()).min(1).max(4).describe("A new set of 1 to 4 relevant choices for the player to make."),
  updatedCharacters: z.array(CharacterSchema).describe("The complete, updated list of all characters. This can include new characters introduced in the narrative, or characters whose affinity or status has changed. Return the full list of all characters that should be in the game state."),
  updatedInventory: z.array(ItemSchema).optional().describe("The player's full inventory, potentially updated with new or removed items."),
  isGameOver: z.boolean().describe("Set to true if the player's choice leads to their death or a story-ending failure."),
  lastOutcome: z.string().describe("A brief summary of the immediate outcome of the player's choice, especially if it leads to game over."),
});
export type AiGameMasterOutput = z.infer<typeof AiGameMasterOutputSchema>;


export async function aiGameMaster(input: AiGameMasterInput): Promise<AiGameMasterOutput> {
  return aiGameMasterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiGameMasterPrompt',
  input: {schema: AiGameMasterInputSchema},
  output: {schema: AiGameMasterOutputSchema},
  prompt: `You are the ultimate Game Master for "Natsuki Quest: A Re:Zero Adventure". Your role is to be a master storyteller, creating a dynamic, engaging, and lore-accurate narrative that responds to the player's choices. You have full control over the game state.

  **Core Directives:**
  1.  **Advance the Narrative:** Based on the player's choice, write the next part of the story. The narrative should be descriptive, engaging, and faithful to the tone of Re:Zero.
  2.  **Manage & Update Characters:** You are in full control of the character list. Based on the narrative, update affinities and statuses for existing characters. If a new character is introduced, add them to the list with a starting affinity, status, description, and a placeholder avatar URL ('https://placehold.co/100x100.png'). Return the complete, updated list of all characters in the 'updatedCharacters' field.
  3.  **Manage Encounters & Items:** Introduce challenges, puzzles, or combat encounters when narratively appropriate. You can grant or remove items from the player's inventory as part of the story.
  4.  **Determine Fate:** Decide if the player's choice leads to a "Game Over" state (i.e., death). If so, set 'isGameOver' to true.
  5.  **Provide New Choices:** Conclude your narrative by presenting 1-4 compelling and relevant choices for the player to make next.
  6.  **Maintain Continuity:** Use the 'memory' and 'injectedLore' to ensure the story is consistent and rich with detail.

  **Game Context:**
  - **Previous Narrative:** {{{currentNarrative}}}
  - **Player's Choice:** "{{{playerChoice}}}"
  - **Memory (Past Events):** {{{memory}}}
  - **Relevant Lore:** {{{injectedLore}}}
  
  **Current Player State:**
  - **Characters & Affinity:** {{json characters}}
  - **Inventory:** {{json inventory}}
  - **Skills:** {{json skills}}

  Now, based on the player's choice, generate the next state of the game.
  `,
});

const aiGameMasterFlow = ai.defineFlow(
  {
    name: 'aiGameMasterFlow',
    inputSchema: AiGameMasterInputSchema,
    outputSchema: AiGameMasterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
