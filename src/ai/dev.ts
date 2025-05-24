import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-complementary-colors.ts';
import '@/ai/flows/suggest-paint-sheen.ts';
import '@/ai/flows/generate-color-palette.ts';
import '@/ai/flows/repaint-wall-flow.ts'; // Added new flow
