import { z } from 'zod';

export const ReputationSchema = z.object({
  successfulSessions: z.number().int().nonnegative(),
  failedSessions: z.number().int().nonnegative(),
  uptimePoints: z.number().int().nonnegative(),
  score: z.number()
});
