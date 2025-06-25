// src/ai/flows/adaptive-encounters.ts
'use server';
/**
 * @fileOverview This file implements the AdaptiveEncounters flow, which dynamically generates encounters and situations based on player progress and discovered lore.
 *
 * - adaptiveEncounter - A function that generates adaptive encounters.
 * - AdaptiveEncounterInput - The input type for the adaptiveEncounter function.
 * - AdaptiveEncounterOutput - The return type for the adaptiveEncounter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveEncounterInputSchema = z.object({
  playerProgress: z.string().describe('Description of the player\'s current progress in the game.'),
  discoveredLore: z.string().describe('Summary of the lore the player has discovered.'),
  availableSkills: z.string().describe('List of the player\'s available skills.'),
});
export type AdaptiveEncounterInput = z.infer<typeof AdaptiveEncounterInputSchema>;

const AdaptiveEncounterOutputSchema = z.object({
  encounterDescription: z.string().describe('A description of the generated encounter.'),
  requiredSkills: z.string().describe('Skills that would be helpful in this encounter.'),
});
export type AdaptiveEncounterOutput = z.infer<typeof AdaptiveEncounterOutputSchema>;

export async function adaptiveEncounter(input: AdaptiveEncounterInput): Promise<AdaptiveEncounterOutput> {
  return adaptiveEncounterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptiveEncounterPrompt',
  input: {schema: AdaptiveEncounterInputSchema},
  output: {schema: AdaptiveEncounterOutputSchema},
  prompt: `You are the AI Game Master for a Re:Zero adventure. Generate an encounter based on the player's progress, discovered lore, and available skills.

Player Progress: {{{playerProgress}}}
Discovered Lore: {{{discoveredLore}}}
Available Skills: {{{availableSkills}}}

Create an interesting and challenging encounter that aligns with the Re:Zero world. Suggest which skills would be helpful to overcome the encounter.
\nEncounter Description: \nRequired Skills:`, // Enforce newline
});

const adaptiveEncounterFlow = ai.defineFlow(
  {
    name: 'adaptiveEncounterFlow',
    inputSchema: AdaptiveEncounterInputSchema,
    outputSchema: AdaptiveEncounterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
