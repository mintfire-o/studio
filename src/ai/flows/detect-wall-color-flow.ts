'use server';
/**
 * @fileOverview A Genkit flow to detect the dominant wall color(s) in a room image.
 *
 * - detectWallColor - A function that handles the wall color detection process.
 * - DetectWallColorInput - The input type for the detectWallColor function.
 * - DetectWallColorOutput - The return type for the detectWallColor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectWallColorInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a room, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectWallColorInput = z.infer<typeof DetectWallColorInputSchema>;

const DetectedColorSchema = z.object({
  hex: z.string().describe("The hex code of a dominant wall color (e.g., '#RRGGBB')."),
  name: z.string().describe("A common descriptive name for the color (e.g., 'Light Beige', 'Off-white').")
});

const DetectWallColorOutputSchema = z.object({
  wallColors: z
    .array(DetectedColorSchema)
    .describe('An array of dominant wall colors detected in the image.'),
  reasoning: z
    .string()
    .describe('Explanation of how the wall colors were identified or any challenges encountered.'),
});
export type DetectWallColorOutput = z.infer<typeof DetectWallColorOutputSchema>;

export async function detectWallColor(input: DetectWallColorInput): Promise<DetectWallColorOutput> {
  return detectWallColorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectWallColorPrompt',
  input: {schema: DetectWallColorInputSchema},
  output: {schema: DetectWallColorOutputSchema},
  prompt: `You are an AI expert in interior design and image analysis.
Analyze the provided image of a room. Your task is to identify the primary wall surfaces.
When identifying walls, try to ignore trim, windows, doors, large furniture, and decor items unless they are indistinguishable from the wall color itself or cover a vast majority of a wall.
Focus on large, flat surfaces that are likely painted walls.

Determine the dominant color(s) of these identified wall surfaces.
If there are multiple distinct wall colors (e.g., an accent wall, or different colored walls), list each one you can confidently identify.
For each detected dominant wall color, provide:
1.  Its hex color code (e.g., "#RRGGBB").
2.  A common descriptive name for the color (e.g., "Light Beige", "Warm Gray", "Soft Blue").

Also, provide a brief reasoning for your color identification. Mention any challenges like shadows, lighting, complex textures, or if a color is difficult to determine accurately.

Image of the room:
{{media url=photoDataUri}}`,
});

const detectWallColorFlow = ai.defineFlow(
  {
    name: 'detectWallColorFlow',
    inputSchema: DetectWallColorInputSchema,
    outputSchema: DetectWallColorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
