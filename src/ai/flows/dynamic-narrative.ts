// src/ai/flows/dynamic-narrative.ts
'use server';

/**
 * @fileOverview A dynamic narrative generation AI agent for the Natsuki Quest: A Re:Zero Adventure.
 *
 * - generateDynamicNarrative - A function that generates the dynamic narrative.
 * - DynamicNarrativeInput - The input type for the generateDynamicNarrative function.
 * - DynamicNarrativeOutput - The return type for the generateDynamicNarrative function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DynamicNarrativeInputSchema = z.object({
  playerChoices: z.string().describe('The choices made by the player.'),
  currentGameState: z.string().describe('The current state of the game, including location, time, and character relationships.'),
  relevantLore: z.string().describe('Relevant lore information based on the current game situation.'),
  subaruAbilities: z.string().describe('Subaru	's unique abilities and their current status.'),
});
export type DynamicNarrativeInput = z.infer<typeof DynamicNarrativeInputSchema>;

const DynamicNarrativeOutputSchema = z.object({
  narrativeText: z.string().describe('The generated narrative text based on the inputs.'),
  newGameState: z.string().describe('The updated game state after the narrative event.'),
});
export type DynamicNarrativeOutput = z.infer<typeof DynamicNarrativeOutputSchema>;

export async function generateDynamicNarrative(input: DynamicNarrativeInput): Promise<DynamicNarrativeOutput> {
  return dynamicNarrativeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dynamicNarrativePrompt',
  input: {schema: DynamicNarrativeInputSchema},
  output: {schema: DynamicNarrativeOutputSchema},
  prompt: `You are the AI Game Master for Natsuki Quest: A Re:Zero Adventure. Generate the next part of the story based on the player's choices, the current game state, relevant Re:Zero lore, and Subaru's abilities.

Player Choices: {{{playerChoices}}}
Current Game State: {{{currentGameState}}}
Relevant Lore: {{{relevantLore}}}
Subaru's Abilities: {{{subaruAbilities}}}

Generate a narrative that dynamically adapts to these inputs, creating a unique and engaging narrative experience. Update the game state accordingly.

Narrative Text:
{{narrativeText}}

New Game State:
{{newGameState}}`,
});

const dynamicNarrativeFlow = ai.defineFlow(
  {
    name: 'dynamicNarrativeFlow',
    inputSchema: DynamicNarrativeInputSchema,
    outputSchema: DynamicNarrativeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
