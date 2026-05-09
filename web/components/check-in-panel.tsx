"use client";

import {
  useConnection,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { useCallback, useMemo, useState } from "react";
import { ecoCheckInAbi } from "@/lib/web3/checkInAbi";
import { getCheckInDataSuffix } from "@/lib/web3/builderSuffix";
import { getCheckInAddress } from "@/lib/env/public";

export function CheckInPanel() {
  const { address, isConnected, chainId } = useConnection();
  const contractAddress = getCheckInAddress();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const [lastError, setLastError] = useState<string | null>(null);

  const baseId = base.id;
  const wrongNetwork = isConnected && chainId !== baseId;

  const { data: streakOnChain } = useReadContract({
    address: contractAddress ?? undefined,
    abi: ecoCheckInAbi,
    functionName: "streak",
    args: address ? [address] : undefined,
    chainId: baseId,
    query: { enabled: Boolean(contractAddress && address && !wrongNetwork) },
  });

  const dataSuffix = useMemo(() => getCheckInDataSuffix(), []);

  const handleCheckIn = useCallback(async () => {
    setLastError(null);
    if (!contractAddress) {
      setLastError("Contract not configured (set NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS).");
      return;
    }
    if (!address) return;
    try {
      if (chainId !== baseId) {
        await switchChainAsync({ chainId: baseId });
      }
      await writeContractAsync({
        address: contractAddress,
        abi: ecoCheckInAbi,
        functionName: "checkIn",
        args: [],
        chainId: baseId,
        ...(dataSuffix ? { dataSuffix } : {}),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Check-in failed";
      setLastError(msg);
    }
  }, [
    address,
    chainId,
    baseId,
    contractAddress,
    dataSuffix,
    switchChainAsync,
    writeContractAsync,
  ]);

  const busy = isSwitching || isWriting;

  if (!contractAddress) {
    return (
      <div className="rounded-xl border border-zinc-600/50 bg-zinc-900/40 p-4 font-mono text-xs text-zinc-400">
        Deploy the check-in contract and set{" "}
        <span className="text-cyan-300">NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS</span>{" "}
        to enable daily on-chain check-in.
      </div>
    );
  }

  return (
    <div className="neon-panel rounded-xl border border-emerald-400/30 bg-emerald-950/20 p-4">
      <h3 className="mb-2 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
        Daily check-in
      </h3>
      <p className="mb-3 font-mono text-[11px] leading-relaxed text-emerald-100/70">
        One on-chain check-in per UTC day on Base. You only pay L gas — no tips
        sent to the contract.
      </p>
      {streakOnChain != null && address ? (
        <p className="mb-3 font-mono text-xs text-cyan-200/90">
          Current streak: <span className="text-cyan-100">{String(streakOnChain)}</span>
        </p>
      ) : null}
      <button
        type="button"
        disabled={!isConnected || busy}
        className="w-full rounded-xl border border-emerald-400/50 bg-emerald-500/15 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-emerald-100 transition hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => void handleCheckIn()}
      >
        {busy ? "Confirm in wallet…" : "Check in on Base"}
      </button>
      {lastError ? (
        <p className="mt-2 font-mono text-xs text-rose-400">{lastError}</p>
      ) : null}
    </div>
  );
}
