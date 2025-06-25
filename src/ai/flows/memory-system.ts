// src/ai/flows/memory-system.ts
'use server';
/**
 * @fileOverview Implements the memory system for the AI to remember past events,
 * player choices, and character interactions, influencing future story generation.
 *
 * - memorySystemFlow - The main flow function.
 * - MemorySystemInput - The input type for the memorySystemFlow function.
 * - MemorySystemOutput - The output type for the memorySystemFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MemorySystemInputSchema = z.object({
  currentEvent: z
    .string()
    .describe('Description of the current event in the game.'),
  playerChoice: z
    .string()
    .optional()
    .describe('The player choice made in the previous event.'),
  characterInteractions: z
    .array(z.string())
    .optional()
    .describe('List of descriptions of interactions with characters.'),
  pastEventsSummary: z
    .string()
    .optional()
    .describe('A summary of important past events.'),
});
export type MemorySystemInput = z.infer<typeof MemorySystemInputSchema>;

const MemorySystemOutputSchema = z.object({
  updatedPastEventsSummary: z
    .string()
    .describe('Updated summary of past events incorporating the new event and player choice.'),
  aiResponse: z
    .string()
    .describe('The AI response based on the updated memory and current event.'),
});
export type MemorySystemOutput = z.infer<typeof MemorySystemOutputSchema>;

export async function memorySystem(input: MemorySystemInput): Promise<MemorySystemOutput> {
  return memorySystemFlow(input);
}

const memorySystemPrompt = ai.definePrompt({
  name: 'memorySystemPrompt',
  input: {schema: MemorySystemInputSchema},
  output: {schema: MemorySystemOutputSchema},
  prompt: `You are the AI Game Master for a Re:Zero adventure.
Your primary task is to maintain a consistent world state by remembering past events, player choices, and character interactions.

Current Event: {{{currentEvent}}}
Player Choice (if any): {{{playerChoice}}}
Character Interactions (if any): {{#each characterInteractions}}{{{this}}}\n{{/each}}
Past Events Summary: {{{pastEventsSummary}}}

Based on the above information, update the Past Events Summary to include the current event and the player's choice.
Then, generate an AI response that reflects the updated memory and sets the stage for the next part of the adventure.  The AI response should set the stage and describe what happens next.

Output the new summary and the AI response as a JSON object.`,
});

const memorySystemFlow = ai.defineFlow(
  {
    name: 'memorySystemFlow',
    inputSchema: MemorySystemInputSchema,
    outputSchema: MemorySystemOutputSchema,
  },
  async input => {
    const {output} = await memorySystemPrompt(input);
    return output!;
  }
);
