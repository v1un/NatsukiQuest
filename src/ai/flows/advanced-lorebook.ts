// src/ai/flows/advanced-lorebook.ts
'use server';

/**
 * @fileOverview An advanced lorebook system that automatically detects relevant information
 * based on the current game situation and injects it into the narrative context.
 *
 * - fetchAndInjectLore - A function that fetches relevant lore based on the game situation and injects it into the narrative context.
 * - FetchAndInjectLoreInput - The input type for the fetchAndInjectLore function.
 * - FetchAndInjectLoreOutput - The return type for the fetchAndInjectLore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FetchAndInjectLoreInputSchema = z.object({
  gameSituation: z
    .string()
    .describe('The current game situation, including location, characters present, and recent events.'),
  existingNarrativeContext: z
    .string()
    .optional()
    .describe('The existing narrative context to add lore to.'),
});
export type FetchAndInjectLoreInput = z.infer<typeof FetchAndInjectLoreInputSchema>;

const FetchAndInjectLoreOutputSchema = z.object({
  updatedNarrativeContext: z
    .string()
    .describe('The narrative context updated with relevant lore information.'),
  extractedKeywords: z.array(z.string()).describe('Keywords extracted from game situation.'),
});
export type FetchAndInjectLoreOutput = z.infer<typeof FetchAndInjectLoreOutputSchema>;

export async function fetchAndInjectLore(input: FetchAndInjectLoreInput): Promise<FetchAndInjectLoreOutput> {
  return fetchAndInjectLoreFlow(input);
}

const extractKeywordsPrompt = ai.definePrompt({
  name: 'extractKeywordsPrompt',
  input: {schema: FetchAndInjectLoreInputSchema},
  output: {schema: z.object({keywords: z.array(z.string())})},
  prompt: `You are an expert at identifying key concepts from a given text.

  Analyze the following game situation and extract the most relevant keywords that can be used to fetch lore information.
  Return the keywords as a JSON array.

  Game Situation: {{{gameSituation}}}`,
});

const injectLorePrompt = ai.definePrompt({
  name: 'injectLorePrompt',
  input: {schema: z.object({lore: z.string(), existingContext: z.string()})},
  output: {schema: z.object({updatedContext: z.string()})},
  prompt: `You are an expert at weaving lore information into existing narrative context.

  Use the following lore information to enhance the existing narrative context. Make the addition seamless and engaging.

  Lore Information: {{{lore}}}
  Existing Narrative Context: {{{existingContext}}}
  Updated Narrative Context:`,
});

const fetchAndInjectLoreFlow = ai.defineFlow(
  {
    name: 'fetchAndInjectLoreFlow',
    inputSchema: FetchAndInjectLoreInputSchema,
    outputSchema: FetchAndInjectLoreOutputSchema,
  },
  async input => {
    // Extract keywords from the game situation
    const keywordsResult = await extractKeywordsPrompt({
      gameSituation: input.gameSituation,
    });

    const extractedKeywords = keywordsResult.output!.keywords;

    // In a real application, this would involve fetching lore from a database or external source
    // based on the extracted keywords.
    // For this example, we'll use a placeholder lore.
    const fetchedLore = `Placeholder lore for keywords: ${extractedKeywords.join(', ')}`;

    // Inject the fetched lore into the existing narrative context
    const injectLoreResult = await injectLorePrompt({
      lore: fetchedLore,
      existingContext: input.existingNarrativeContext ?? '',
    });

    return {
      updatedNarrativeContext: injectLoreResult.output!.updatedContext,
      extractedKeywords: extractedKeywords,
    };
  }
);
