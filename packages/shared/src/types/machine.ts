export type MachineType =
  | 'EV_CHARGER'
  | 'WEATHER_SENSOR'
  | 'PARKING_SENSOR'
  | 'CUSTOM';

export interface MachineMetadata {
  name: string;
  type: MachineType;
  location?: string;
  specs?: Record<string, string | number>;
}

export interface RegisteredMachine {
  did: string;
  owner: string;
  metadataHash: string;
  active: boolean;
}
