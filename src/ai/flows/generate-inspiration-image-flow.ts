
'use server';
/**
 * @fileOverview A Genkit flow to generate an inspirational room image based on a text prompt.
 *
 * - generateInspirationImage - A function that handles the image generation process.
 * - GenerateInspirationImageInput - The input type for the function.
 * - GenerateInspirationImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInspirationImageInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired room image.'),
});
export type GenerateInspirationImageInput = z.infer<typeof GenerateInspirationImageInputSchema>;

const GenerateInspirationImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      'The data URI of the generated image. Expected format: \'data:image/png;base64,<encoded_data>\' or similar.'
    ),
  revisedPrompt: z.string().optional().describe('The prompt that was actually used by the model, if revised.'),
});
export type GenerateInspirationImageOutput = z.infer<typeof GenerateInspirationImageOutputSchema>;

export async function generateInspirationImage(
  input: GenerateInspirationImageInput
): Promise<GenerateInspirationImageOutput> {
  return generateInspirationImageFlow(input);
}

const generateInspirationImageFlow = ai.defineFlow(
  {
    name: 'generateInspirationImageFlow',
    inputSchema: GenerateInspirationImageInputSchema,
    outputSchema: GenerateInspirationImageOutputSchema,
  },
  async (input: GenerateInspirationImageInput) => {
    const {media, text} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // IMPORTANT: Must use this model for image generation
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE
        safetySettings: [ // Looser safety settings might be needed for diverse scenes
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      },
    });

    if (!media?.url) {
      console.error('AI Image Generation: No image generated. AI response text:', text);
      throw new Error(
        `AI failed to generate image for prompt "${input.prompt}". Reason: ${text || 'Unknown error from AI.'}`
      );
    }

    return { imageDataUri: media.url, revisedPrompt: text };
  }
);
