'use server';
/**
 * @fileOverview A Genkit flow to "repaint" the walls in a room image with a selected color using AI image generation.
 *
 * - repaintWall - A function that handles the wall repainting process.
 * - RepaintWallInput - The input type for the repaintWall function.
 * - RepaintWallOutput - The return type for the repaintWall function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RepaintWallInputSchema = z.object({
  originalPhotoDataUri: z
    .string()
    .describe(
      "The original photo of the room, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  selectedColorHex: z
    .string()
    .describe(
      'The hex color code (e.g., "#FF0000") to paint the walls.'
    ),
});
export type RepaintWallInput = z.infer<typeof RepaintWallInputSchema>;

const RepaintWallOutputSchema = z.object({
  repaintedImageDataUri: z
    .string()
    .describe(
      'The data URI of the newly generated image with repainted walls. Expected format: \'data:image/png;base64,<encoded_data>\' or similar.'
    ),
});
export type RepaintWallOutput = z.infer<typeof RepaintWallOutputSchema>;

export async function repaintWall(input: RepaintWallInput): Promise<RepaintWallOutput> {
  return repaintWallFlow(input);
}

const repaintWallFlow = ai.defineFlow(
  {
    name: 'repaintWallFlow',
    inputSchema: RepaintWallInputSchema,
    outputSchema: RepaintWallOutputSchema,
  },
  async (input: RepaintWallInput) => {
    const {media, text} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Must use this model for image generation
      prompt: [
        {media: {url: input.originalPhotoDataUri}},
        {
          text: `You are an expert interior design AI. Your task is to repaint the large, primary wall surfaces in the provided room image using a specific color.
The user wants to see how it would look if these walls were painted with the color ${input.selectedColorHex}.

Instructions:
1. Analyze the provided image to identify the most prominent, large wall surfaces that would typically be painted (e.g., excluding small accent areas unless they are the clear focus, trim, or areas primarily covered by large fixtures). These are the 'target walls'.
2. Generate a new image of the *exact same room*, preserving all furniture, decor, windows, lighting, shadows, and overall room structure as accurately as possible. Non-target wall surfaces should also remain unchanged.
3. The *only* significant change should be that the 'target walls' are now painted with the color ${input.selectedColorHex}.
4. Maintain realistic lighting, shadows, and textures on the repainted walls, consistent with the original image and the new color.
5. Output *only* the repainted image. Do not include any descriptive text unless the image generation fails. If you cannot perform the repaint accurately, explain why in text and do not generate an image.`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE
         // Looser safety settings might be needed if colors or scenes are flagged
        safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      },
    });

    if (!media?.url) {
      console.error('AI Repaint: No image generated. AI response text:', text);
      throw new Error(
        `AI failed to generate repainted image. Reason: ${text || 'Unknown error from AI.'}`
      );
    }

    return { repaintedImageDataUri: media.url };
  }
);
