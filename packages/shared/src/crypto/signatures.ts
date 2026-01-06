import {
  solidityPackedKeccak256,
  verifyMessage,
  getBytes
} from 'ethers';
import type { UsagePayload } from '../types/usage';

export function hashUsagePayload(payload: UsagePayload): string {
  return solidityPackedKeccak256(
    [
      'string',   
      'address',  
      'uint256',  
      'uint256',  
      'uint256',  
      'string'    
    ],
    [
      payload.machineDid,
      payload.user,
      BigInt(payload.startTime),
      BigInt(payload.endTime),
      BigInt(payload.units),
      payload.nonce
    ]
  );
}

export function verifyUsageSignature(
  payload: UsagePayload,
  signature: string,
  expectedSigner: string
): boolean {
  const hash = hashUsagePayload(payload);

  const recoveredAddress = verifyMessage(
    getBytes(hash),
    signature
  );

  return (
    recoveredAddress.toLowerCase() ===
    expectedSigner.toLowerCase()
  );
}
