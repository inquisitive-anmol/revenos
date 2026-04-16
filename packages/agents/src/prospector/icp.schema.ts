import { z } from 'zod';

export const ICPSchema = z.object({
  industries: z.array(z.string()).min(1).max(10),
  titles: z.array(z.string()).min(1).max(20),
  companySizeMin: z.number().int().min(1).optional(),
  companySizeMax: z.number().int().max(100000).optional(),
  locations: z.array(z.string()).optional(),
  keywords: z.array(z.string()).max(10).optional(),
  excludeDomains: z.array(z.string()).optional(),
  maxLeads: z.number().int().min(1).max(500).default(50),
});

export type ICPInput = z.infer<typeof ICPSchema>;
