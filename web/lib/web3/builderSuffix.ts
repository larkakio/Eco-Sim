import { Attribution } from "ox/erc8021";
import type { Hex } from "viem";
import { getBuilderCode, getBuilderCodeSuffixHex } from "@/lib/env/public";

/**
 * ERC-8021 calldata suffix for Base Builder Code attribution (ox → viem `dataSuffix`).
 * @see https://docs.base.org/base-chain/builder-codes/builder-codes
 */
export function getCheckInDataSuffix(): Hex | undefined {
  const override = getBuilderCodeSuffixHex();
  if (override) return override;

  const code = getBuilderCode();
  if (!code) return undefined;

  return Attribution.toDataSuffix({
    codes: [code],
  }) as Hex;
}
