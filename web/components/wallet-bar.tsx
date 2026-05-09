"use client";

import {
  useConnect,
  useConnection,
  useDisconnect,
  useConnectors,
  useSwitchChain,
} from "wagmi";
import { base } from "wagmi/chains";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function WalletBar() {
  const { address, isConnected, chainId } = useConnection();
  const connectors = useConnectors();
  const { connectAsync, isPending: isConnecting, error: connectError } =
    useConnect();
  const { disconnectAsync, isPending: isDisconnecting } = useDisconnect();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mount gate for document.body portal; intentional after paint.
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  const wrongNetwork = isConnected && chainId !== base.id;

  const handleConnectPick = useCallback(
    async (connector: (typeof connectors)[number]) => {
      await connectAsync({
        connector,
        chainId: base.id,
      });
      setSheetOpen(false);
    },
    [connectAsync],
  );

  const handleSwitch = useCallback(async () => {
    await switchChainAsync({ chainId: base.id });
  }, [switchChainAsync]);

  const sheet =
    mounted && sheetOpen
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/70 backdrop-blur-sm"
            role="presentation"
            aria-hidden={!sheetOpen}
          >
            <button
              type="button"
              className="absolute inset-0 cursor-default"
              aria-label="Close wallet picker"
              onClick={() => setSheetOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Connect a wallet"
              className="neon-panel relative mx-2 mb-[max(0.5rem,env(safe-area-inset-bottom))] flex max-h-[min(70dvh,520px)] flex-col rounded-t-2xl border border-cyan-400/40 bg-[#070514]/98 p-4 shadow-[0_0_40px_rgba(0,255,255,0.15)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-cyan-200">
                  Connect wallet
                </h2>
                <button
                  type="button"
                  className="rounded-lg border border-fuchsia-500/40 px-3 py-1 font-mono text-xs text-fuchsia-200 transition hover:bg-fuchsia-500/20"
                  aria-label="Close"
                  onClick={() => setSheetOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pb-2">
                {connectors.length === 0 ? (
                  <p className="font-mono text-xs text-zinc-400">
                    No wallet connectors available in this environment. Open in
                    a browser with an injected wallet or use the Base app.
                  </p>
                ) : (
                  connectors.map((c) => (
                    <button
                      key={c.uid}
                      type="button"
                      disabled={isConnecting}
                      className="flex w-full items-center justify-between rounded-xl border border-cyan-500/25 bg-cyan-950/30 px-4 py-3 text-left font-mono text-sm text-cyan-100 transition hover:border-cyan-400/50 hover:shadow-[0_0_18px_rgba(34,211,238,0.2)] disabled:opacity-50"
                      onClick={() => void handleConnectPick(c)}
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] uppercase tracking-wider text-cyan-400/70">
                        {c.type}
                      </span>
                    </button>
                  ))
                )}
              </div>
              {connectError ? (
                <p className="mt-2 font-mono text-xs text-rose-400">
                  {connectError.message}
                </p>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {wrongNetwork ? (
        <div className="neon-banner mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-400/50 bg-amber-950/40 px-3 py-2 font-mono text-xs text-amber-100">
          <span>Wrong network. Switch to Base to use on-chain check-in.</span>
          <button
            type="button"
            disabled={isSwitching}
            className="shrink-0 rounded-lg border border-amber-300/60 px-3 py-1 text-amber-50 transition hover:bg-amber-500/20 disabled:opacity-50"
            onClick={() => void handleSwitch()}
          >
            {isSwitching ? "Switching…" : "Switch to Base"}
          </button>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {isConnected && address ? (
          <>
            <span className="font-mono text-xs text-cyan-200/90">
              {truncateAddress(address)}
            </span>
            <button
              type="button"
              disabled={isDisconnecting}
              className="rounded-xl border border-fuchsia-500/40 px-4 py-2 font-mono text-xs uppercase tracking-wide text-fuchsia-100 transition hover:bg-fuchsia-500/15 disabled:opacity-50"
              onClick={() => void disconnectAsync()}
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            className="rounded-xl border border-cyan-400/60 bg-cyan-500/10 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.25)] transition hover:bg-cyan-400/20"
            onClick={() => setSheetOpen(true)}
          >
            Connect wallet
          </button>
        )}
      </div>
      {sheet}
    </>
  );
}
