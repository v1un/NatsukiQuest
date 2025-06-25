'use server';

/**
 * @fileOverview Implements the Return by Death ability from Re:Zero.
 *
 * - returnByDeath - Allows the player to rewind time and make different choices.
 * - ReturnByDeathInput - The input type for the returnByDeath function.
 * - ReturnByDeathOutput - The return type for the returnByDeath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReturnByDeathInputSchema = z.object({
  scenarioDescription: z
    .string()
    .describe('The current game scenario description.'),
  playerChoices: z
    .array(z.string())
    .describe('The choices the player made in the previous loop.'),
  outcome: z.string().describe('The outcome of the previous loop.'),
});
export type ReturnByDeathInput = z.infer<typeof ReturnByDeathInputSchema>;

const ReturnByDeathOutputSchema = z.object({
  newScenario: z.string().describe('The new scenario based on the player\' + "'s previous choices and outcome, incorporating the 'Return by Death' ability."),
  availableChoices: z.array(z.string()).describe('The available choices for the player in the new scenario.'),
});
export type ReturnByDeathOutput = z.infer<typeof ReturnByDeathOutputSchema>;

export async function returnByDeath(input: ReturnByDeathInput): Promise<ReturnByDeathOutput> {
  return returnByDeathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'returnByDeathPrompt',
  input: {schema: ReturnByDeathInputSchema},
  output: {schema: ReturnByDeathOutputSchema},
  prompt: `You are simulating Subaru\'s \'Return by Death\' ability from Re:Zero.

  The player has experienced a failed outcome and is now rewinding time to make different choices.
  Consider the previous scenario, the player\'s choices, and the resulting outcome.
  Generate a new scenario that reflects the consequences of the previous loop, while providing the player with new choices to navigate the situation.

  Previous Scenario: {{{scenarioDescription}}}
  Player Choices: {{#each playerChoices}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Outcome: {{{outcome}}}

  New Scenario:
  {{newScenario}}

  Available Choices:
  {{#each availableChoices}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}`,
});

const returnByDeathFlow = ai.defineFlow(
  {
    name: 'returnByDeathFlow',
    inputSchema: ReturnByDeathInputSchema,
    outputSchema: ReturnByDeathOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
