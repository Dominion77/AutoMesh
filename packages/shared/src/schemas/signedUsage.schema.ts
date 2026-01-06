import { z } from 'zod';
import { UsagePayloadSchema } from './usage.schema';

export const SignedUsagePayloadSchema = z.object({
  payload: UsagePayloadSchema,
  signature: z.string().startsWith('0x')
});
