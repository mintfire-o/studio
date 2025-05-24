// 'use server';
/**
 * @fileOverview Suggests the optimal paint sheen (e.g., matte, silk) based on a selected color and wall photo.
 *
 * - suggestPaintSheen - A function that handles the paint sheen suggestion process.
 * - SuggestPaintSheenInput - The input type for the suggestPaintSheen function.
 * - SuggestPaintSheenOutput - The return type for the suggestPaintSheen function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPaintSheenInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the wall, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  selectedColor: z.string().describe('The selected color for the wall.'),
});
export type SuggestPaintSheenInput = z.infer<typeof SuggestPaintSheenInputSchema>;

const SuggestPaintSheenOutputSchema = z.object({
  suggestedSheen: z.string().describe('The suggested paint sheen (e.g., matte, silk).'),
  reasoning: z.string().describe('The reasoning behind the suggested sheen.'),
});
export type SuggestPaintSheenOutput = z.infer<typeof SuggestPaintSheenOutputSchema>;

export async function suggestPaintSheen(input: SuggestPaintSheenInput): Promise<SuggestPaintSheenOutput> {
  return suggestPaintSheenFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPaintSheenPrompt',
  input: {schema: SuggestPaintSheenInputSchema},
  output: {schema: SuggestPaintSheenOutputSchema},
  prompt: `You are an expert in interior design and paint finishes. Based on the photo of the wall and the selected color, suggest the most suitable paint sheen (e.g., matte, silk, satin, gloss). Provide a brief explanation for your suggestion.

Selected Color: {{{selectedColor}}}
Wall Photo: {{media url=photoDataUri}}

Consider factors such as wall texture, lighting conditions, and the desired aesthetic.

Output the suggested sheen and the reasoning behind it in the specified JSON format.`,
});

const suggestPaintSheenFlow = ai.defineFlow(
  {
    name: 'suggestPaintSheenFlow',
    inputSchema: SuggestPaintSheenInputSchema,
    outputSchema: SuggestPaintSheenOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
