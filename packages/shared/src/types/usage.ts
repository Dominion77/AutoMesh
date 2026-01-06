export interface UsagePayload {
  machineDid: string;
  user: string;
  startTime: number;
  endTime: number;
  units: number;
  nonce: string;
}

export interface SignedUsagePayload {
  payload: UsagePayload;
  signature: string;
}
