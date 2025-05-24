// use server'

/**
 * @fileOverview This file defines a Genkit flow for generating a color palette based on an uploaded image.
 *
 * The flow takes an image of a room as input and returns a suggested color palette.
 * @param {GenerateColorPaletteInput} input - The input object containing the image data URI.
 * @returns {Promise<GenerateColorPaletteOutput>} - A promise that resolves to the generated color palette.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateColorPaletteInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of a room, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});

export type GenerateColorPaletteInput = z.infer<
  typeof GenerateColorPaletteInputSchema
>;

const GenerateColorPaletteOutputSchema = z.object({
  palette: z
    .array(z.string())
    .describe('An array of color hex codes suggested for the room.'),
});

export type GenerateColorPaletteOutput = z.infer<
  typeof GenerateColorPaletteOutputSchema
>;

export async function generateColorPalette(
  input: GenerateColorPaletteInput
): Promise<GenerateColorPaletteOutput> {
  return generateColorPaletteFlow(input);
}

const generateColorPalettePrompt = ai.definePrompt({
  name: 'generateColorPalettePrompt',
  input: {schema: GenerateColorPaletteInputSchema},
  output: {schema: GenerateColorPaletteOutputSchema},
  prompt: `You are an AI expert in interior design. Analyze the provided image of a room and suggest a color palette that complements the room's aesthetics.

  Return a JSON array of hex color codes.

  Here is the image of the room:
  {{media url=photoDataUri}}
  `,
});

const generateColorPaletteFlow = ai.defineFlow(
  {
    name: 'generateColorPaletteFlow',
    inputSchema: GenerateColorPaletteInputSchema,
    outputSchema: GenerateColorPaletteOutputSchema,
  },
  async input => {
    const {output} = await generateColorPalettePrompt(input);
    return output!;
  }
);
