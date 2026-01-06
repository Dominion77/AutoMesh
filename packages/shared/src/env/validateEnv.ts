export function requireEnv(keys: string[]): void {
  const missing = keys.filter(k => !process.env[k]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required env vars: ${missing.join(', ')}`
    );
  }
}
