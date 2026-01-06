export type ContractName =
  | 'MachineRegistry'
  | 'UsageManager'
  | 'EscrowVault'
  | 'ReputationEngine';

export function getContractAddress(name: ContractName): string {
  const key = `${name.toUpperCase()}_ADDRESS`;
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing contract address env: ${key}`);
  }

  return value;
}
