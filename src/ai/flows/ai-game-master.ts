// src/ai/flows/ai-game-master.ts
'use server';

/**
 * @fileOverview The AI Game Master flow, responsible for dynamically generating
 * the story, world, and character interactions based on user choices in the
 * Re:Zero adventure.
 *
 * - aiGameMaster - A function that initiates the game master flow.
 * - AiGameMasterInput - The input type for the aiGameMaster function.
 * - AiGameMasterOutput - The return type for the aiGameMaster function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiGameMasterInputSchema = z.object({
  playerChoices: z
    .string()
    .describe('The choices made by the player in the current game loop.'),
  gameState: z.string().describe('The current state of the game.'),
  lorebook: z.string().describe('Relevant lore information.'),
});
export type AiGameMasterInput = z.infer<typeof AiGameMasterInputSchema>;

const AiGameMasterOutputSchema = z.object({
  narrative: z.string().describe('The generated narrative content.'),
  updatedGameState: z.string().describe('The updated game state.'),
});
export type AiGameMasterOutput = z.infer<typeof AiGameMasterOutputSchema>;

export async function aiGameMaster(input: AiGameMasterInput): Promise<AiGameMasterOutput> {
  return aiGameMasterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiGameMasterPrompt',
  input: {schema: AiGameMasterInputSchema},
  output: {schema: AiGameMasterOutputSchema},
  prompt: `You are the AI Game Master for a Re:Zero adventure.

  Your job is to dynamically generate the story, world, and character
  interactions based on user choices, Re:Zero lore, and Subaru's unique
  abilities and challenges.

  The player has made the following choices: {{{playerChoices}}}
  The current game state is: {{{gameState}}}
  Relevant lore information: {{{lorebook}}}

  Generate the next part of the narrative and update the game state accordingly.

  Output the updated narrative and game state in the following format:
  Narrative: [narrative content]
  Updated Game State: [updated game state]

  Make sure the response is valid JSON.
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
