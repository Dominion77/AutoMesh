import { z } from 'zod';

export const MachineMetadataSchema = z.object({
  name: z.string().min(2),
  type: z.enum([
    'EV_CHARGER',
    'WEATHER_SENSOR',
    'PARKING_SENSOR',
    'CUSTOM'
  ]),
  location: z.string().optional(),
 specs: z
  .record(z.string(), z.union([z.string(), z.number()]))
  .optional()
});
