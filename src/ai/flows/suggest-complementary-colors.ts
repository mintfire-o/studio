// src/ai/flows/suggest-complementary-colors.ts
'use server';

/**
 * @fileOverview Suggests complementary colors based on a user-selected color and a photo of their room.
 *
 * - suggestComplementaryColors - A function that handles the suggestion of complementary colors.
 * - SuggestComplementaryColorsInput - The input type for the suggestComplementaryColors function.
 * - SuggestComplementaryColorsOutput - The return type for the suggestComplementaryColors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestComplementaryColorsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the room, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  selectedColor: z.string().describe('The color selected by the user (e.g., hex code or color name).'),
});
export type SuggestComplementaryColorsInput = z.infer<typeof SuggestComplementaryColorsInputSchema>;

const SuggestComplementaryColorsOutputSchema = z.object({
  complementaryColors: z
    .array(z.string())
    .describe('An array of suggested complementary colors (e.g., hex codes or color names).'),
  reasoning: z.string().describe('The AI reasoning behind the color suggestions.'),
});
export type SuggestComplementaryColorsOutput = z.infer<typeof SuggestComplementaryColorsOutputSchema>;

export async function suggestComplementaryColors(
  input: SuggestComplementaryColorsInput
): Promise<SuggestComplementaryColorsOutput> {
  return suggestComplementaryColorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestComplementaryColorsPrompt',
  input: {schema: SuggestComplementaryColorsInputSchema},
  output: {schema: SuggestComplementaryColorsOutputSchema},
  prompt: `You are an interior design assistant who suggests complementary colors based on a user's selected color and a photo of their room.

  Analyze the photo and consider the selected color to suggest a palette of complementary colors.
  Return an array of complementary colors and your reasoning for selecting these colors.

  Photo: {{media url=photoDataUri}}
  Selected Color: {{{selectedColor}}}
  `,
});

const suggestComplementaryColorsFlow = ai.defineFlow(
  {
    name: 'suggestComplementaryColorsFlow',
    inputSchema: SuggestComplementaryColorsInputSchema,
    outputSchema: SuggestComplementaryColorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
