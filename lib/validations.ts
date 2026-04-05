import { z } from 'zod';

export const zipCodeSchema = z
  .string()
  .regex(/^\d{5}$/, 'Please enter a valid 5-digit US ZIP code');

export const placesInputSchema = z.object({
  zip: zipCodeSchema,
  types: z.array(z.string()).min(1),
  radius: z.number().min(1000).max(50000).optional().default(16000),
});
export type PlacesInput = z.infer<typeof placesInputSchema>;

export const insightInputSchema = z.object({
  tool: z.string(),
  profile: z.record(z.string(), z.unknown()),
});
export type InsightInput = z.infer<typeof insightInputSchema>;

export const brightwatchInputSchema = z.object({
  age: z.string().min(1),
  context: z.string().min(1),
  medium: z.string().min(1),
});
export type BrightWatchInput = z.infer<typeof brightwatchInputSchema>;

export const nourishInputSchema = z.object({
  householdSize: z.string().min(1),
  budget: z.number().min(50).max(500),
  dietary: z.array(z.string()),
  cookingTime: z.string().min(1),
  zip: zipCodeSchema,
});
export type NourishInput = z.infer<typeof nourishInputSchema>;

export const leadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  tool: z.string().min(1),
  profileSummary: z.string().optional(),
});
export type LeadSchemaInput = z.infer<typeof leadSchema>;

export const emailInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  tool: z.string().min(1),
});
export type EmailSchemaInput = z.infer<typeof emailInputSchema>;
