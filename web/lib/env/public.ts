export function getBaseAppId(): string {
  return process.env.NEXT_PUBLIC_BASE_APP_ID ?? "pending-registration";
}

export function getBuilderCode(): string | null {
  const c = process.env.NEXT_PUBLIC_BUILDER_CODE;
  return c && c.length > 0 ? c : null;
}

export function getBuilderCodeSuffixHex(): `0x${string}` | null {
  const raw = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX;
  if (!raw || raw.length === 0) return null;
  return raw.startsWith("0x") ? (raw as `0x${string}`) : (`0x${raw}` as `0x${string}`);
}

export function getCheckInAddress(): `0x${string}` | null {
  const a = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS;
  if (!a || !/^0x[a-fA-F0-9]{40}$/.test(a)) return null;
  return a as `0x${string}`;
}

export function getWalletConnectProjectId(): string | null {
  const id = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  return id && id.length > 0 ? id : null;
}
