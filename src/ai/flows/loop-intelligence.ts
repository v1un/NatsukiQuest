import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema for loop intelligence analysis
const LoopIntelligenceSchema = z.object({
    keyInsights: z.array(z.object({
      category: z.enum(['character_behavior', 'environmental_hazard', 'timing', 'dialogue_clue', 'hidden_mechanic', 'strategic_opportunity']),
      insight: z.string(),
      actionableAdvice: z.string(),
      confidence: z.enum(['high', 'medium', 'low'])
    })),
    strategicRecommendations: z.array(z.string()),
    warningsToAvoid: z.array(z.string()),
    optimalTiming: z.array(z.object({
      action: z.string(),
      timing: z.string(),
      reason: z.string()
    })),
    characterIntel: z.array(z.object({
      characterName: z.string(),
      behaviorPattern: z.string(),
      exploitableWeakness: z.string().optional(),
      trustworthiness: z.enum(['high', 'medium', 'low', 'hostile'])
    })),
    hiddenOpportunities: z.array(z.string()),
    criticalMistakes: z.array(z.object({
      mistake: z.string(),
      consequence: z.string(),
      avoidanceStrategy: z.string()
    }))
});

// Schema for the input data
const LoopAnalysisInputSchema = z.object({
    lastLoopMemory: z.string(),
    deathCause: z.string(),
    currentScenario: z.string(),
    charactersInvolved: z.array(z.string()),
    availableChoices: z.array(z.string())
});

export async function analyzeLoopIntelligence(input: {
  lastLoopMemory: string;
  deathCause: string;
  currentScenario: string;
  charactersInvolved: string[];
  availableChoices: string[];
}) {
    const prompt = `You are Subaru's Return by Death intelligence analyzer. Analyze the previous loop to extract actionable intelligence for the current loop.

**PREVIOUS LOOP MEMORY:**
${input.lastLoopMemory}

**HOW LAST LOOP ENDED:**
${input.deathCause}

**CURRENT SITUATION:**
${input.currentScenario}

**CHARACTERS PRESENT:**
${input.charactersInvolved.join(', ')}

**AVAILABLE CHOICES:**
${input.availableChoices.join('\n- ')}

**YOUR TASK:**
As Subaru's strategic memory analyst, provide actionable intelligence that leverages knowledge from the previous loop. Focus on:

1. **Key Insights**: What patterns, behaviors, or mechanics were revealed?
2. **Strategic Recommendations**: Specific actions to take this loop
3. **Warnings**: What to absolutely avoid based on last loop's failure
4. **Optimal Timing**: When to do certain actions for maximum effect
5. **Character Intel**: Behavioral patterns and trustworthiness of each character
6. **Hidden Opportunities**: Things that were missed or could be exploited
7. **Critical Mistakes**: What went wrong and how to avoid it

**ANALYSIS GUIDELINES:**
- Be specific and actionable, not vague
- Focus on information that can only be known through Return by Death
- Consider butterfly effects - small changes can have big impacts
- Prioritize insights that directly help avoid the previous death
- Look for patterns in dialogue, timing, character reactions
- Identify environmental hazards or mechanics that were discovered

**RESPONSE FORMAT:**
Provide detailed analysis in the specified schema format, categorizing insights and providing confidence levels.`;

    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
      output: { 
        schema: LoopIntelligenceSchema,
      },
      config: {
        temperature: 0.3, // Lower temperature for more analytical responses
        topK: 40,
        topP: 0.8,
      }
    });

    return response.output;
}

