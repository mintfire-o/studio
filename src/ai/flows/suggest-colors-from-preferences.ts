
'use server';
/**
 * @fileOverview A Genkit flow to suggest wall colors based on user preferences and a room image.
 *
 * - suggestColorsFromPreferences - A function that handles color suggestions based on user input.
 * - SuggestColorsFromPreferencesInput - The input type for the function.
 * - SuggestColorsFromPreferencesOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { QuestionnaireAnswers } from '@/types'; // Re-using this type

const SuggestColorsFromPreferencesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a room, as a data URI. Used for contextual understanding but preferences are primary. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  preferences: z.object({
    favoriteColor: z.string().describe("User's stated favorite color (e.g., 'blue', '#FF0000', 'forest green')."),
    mood: z.string().describe("Desired mood for the room (e.g., 'Calm and Relaxing', 'Energetic and Vibrant', 'Cozy and Warm')."),
    ageRange: z.string().describe("User's age range (e.g., '18-25', '26-35', '36-50', '50+')."),
    theme: z.string().describe("Preferred interior design theme (e.g., 'Modern', 'Traditional', 'Bohemian', 'Minimalist', 'Industrial', 'Coastal')."),
    roomType: z.string().describe("Type of the room (e.g., 'Living Room', 'Bedroom', 'Kitchen', 'Home Office', 'Dining Room', 'Bathroom')."),
    lightingPreference: z.string().describe("User's preference for room lighting feel (e.g., 'Bright and Airy', 'Warm and Cozy', 'Neutral and Balanced', 'Dramatic and Moody')."),
  }),
});

export type SuggestColorsFromPreferencesInput = z.infer<typeof SuggestColorsFromPreferencesInputSchema>;

const SuggestColorsFromPreferencesOutputSchema = z.object({
  palette: z
    .array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: "Each color must be a valid hex code (e.g., #RRGGBB)" }))
    .min(3).max(5)
    .describe('An array of 3 to 5 hex color codes suggested for the room walls.'),
  reasoning: z.string().describe('Explanation of how the color palette was chosen based on the user preferences.'),
});
export type SuggestColorsFromPreferencesOutput = z.infer<typeof SuggestColorsFromPreferencesOutputSchema>;


export async function suggestColorsFromPreferences(
  input: SuggestColorsFromPreferencesInput
): Promise<SuggestColorsFromPreferencesOutput> {
  return suggestColorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestColorsFromPreferencesPrompt',
  input: {schema: SuggestColorsFromPreferencesInputSchema},
  output: {schema: SuggestColorsFromPreferencesOutputSchema},
  prompt: `You are an expert interior design AI consultant. A user has provided an image of their room and detailed their preferences.
Your task is to suggest a harmonious color palette of 3 to 5 hex color codes suitable for painting the walls of this room.
Prioritize the user's stated preferences over the content of the image when suggesting colors, but use the image for general room context if helpful (e.g. understanding layout or purpose if not specified).

User Preferences:
- Favorite Color: {{{preferences.favoriteColor}}}
- Desired Mood: {{{preferences.mood}}}
- User's Age Range: {{{preferences.ageRange}}}
- Preferred Theme: {{{preferences.theme}}}
- Room Type: {{{preferences.roomType}}}
- Desired Lighting Feel: {{{preferences.lightingPreference}}}

Image Context:
{{media url=photoDataUri}}

Based *primarily* on these preferences, generate a suitable color palette.
Provide a brief reasoning for your color choices, explaining how they align with the user's input and contribute to the desired atmosphere.
Ensure the output is a JSON object containing:
1.  'palette': An array of 3 to 5 hex color strings (e.g., ["#RRGGBB", "#RRGGBB", ...]).
2.  'reasoning': A string explaining your choices.`,
});

const suggestColorsFlow = ai.defineFlow(
  {
    name: 'suggestColorsFromPreferencesFlow',
    inputSchema: SuggestColorsFromPreferencesInputSchema,
    outputSchema: SuggestColorsFromPreferencesOutputSchema,
  },
  async (input: SuggestColorsFromPreferencesInput) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate color suggestions based on preferences.');
    }
    // Validate that the palette has between 3 and 5 colors, as Zod schema only enforces this on structure.
    // The prompt also specifies this. This is an extra safeguard.
    if (output.palette.length < 3 || output.palette.length > 5) {
        // Attempt to fix or throw a more specific error
        console.warn(`AI returned ${output.palette.length} colors, expected 3-5. Reasoning: ${output.reasoning}`);
        // Could try to pad or truncate, or ask for regeneration. For now, let it pass if Zod already did.
    }
    return output;
  }
);
