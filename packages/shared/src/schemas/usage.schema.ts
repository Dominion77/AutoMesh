import { z } from 'zod';

export const UsagePayloadSchema = z.object({
  machineDid: z.string().min(3),
  user: z.string().startsWith('0x'),
  startTime: z.number().int(),
  endTime: z.number().int(),
  units: z.number().positive(),
  nonce: z.string()
});
