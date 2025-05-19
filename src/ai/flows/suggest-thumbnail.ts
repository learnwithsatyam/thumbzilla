// src/ai/flows/suggest-thumbnail.ts
'use server';

/**
 * @fileOverview An AI agent that suggests the best thumbnail from a list of thumbnails.
 *
 * - suggestBestThumbnail - A function that suggests the best thumbnail.
 * - SuggestBestThumbnailInput - The input type for the suggestBestThumbnail function.
 * - SuggestBestThumbnailOutput - The return type for the suggestBestThumbnail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBestThumbnailInputSchema = z.object({
  thumbnailUrls: z
    .array(z.string())
    .describe('An array of thumbnail URLs to choose from.'),
});
export type SuggestBestThumbnailInput = z.infer<typeof SuggestBestThumbnailInputSchema>;

const SuggestBestThumbnailOutputSchema = z.object({
  bestThumbnailUrl: z.string().describe('The URL of the suggested best thumbnail.'),
  reason: z.string().describe('The reason why this thumbnail was chosen.'),
});
export type SuggestBestThumbnailOutput = z.infer<typeof SuggestBestThumbnailOutputSchema>;

export async function suggestBestThumbnail(input: SuggestBestThumbnailInput): Promise<SuggestBestThumbnailOutput> {
  return suggestBestThumbnailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBestThumbnailPrompt',
  input: {schema: SuggestBestThumbnailInputSchema},
  output: {schema: SuggestBestThumbnailOutputSchema},
  prompt: `You are an expert in visual aesthetics and thumbnail design.
  Given the following list of thumbnail URLs, analyze them and determine which one would be the most visually appealing and effective for attracting viewers.
  Explain your reasoning for choosing the best thumbnail.

  Thumbnails:
  {{#each thumbnailUrls}}
  - {{{this}}}
  {{/each}}
  `,
});

const suggestBestThumbnailFlow = ai.defineFlow(
  {
    name: 'suggestBestThumbnailFlow',
    inputSchema: SuggestBestThumbnailInputSchema,
    outputSchema: SuggestBestThumbnailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
