import { createConfig, http, createStorage, cookieStorage } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { injected, baseAccount, walletConnect } from "wagmi/connectors";
import { getWalletConnectProjectId } from "@/lib/env/public";

const DEFAULT_SITE_URL = "https://eco-sim-peach.vercel.app";

const projectId = getWalletConnectProjectId();

function walletConnectSiteUrl(): string {
  const u =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    DEFAULT_SITE_URL;
  return u.startsWith("http") ? u : `https://${u}`;
}

function walletConnectIcons(): string[] {
  const base = walletConnectSiteUrl();
  return [`${base}/app-icon.jpg`];
}

export const config = createConfig({
  chains: [base, mainnet],
  connectors: [
    injected(),
    baseAccount({ appName: "Eco Sim" }),
    ...(projectId
      ? [
          walletConnect({
            projectId,
            showQrModal: true,
            metadata: {
              name: "Eco Sim",
              description: "Eco Sim — cyberpunk ecology puzzle on Base",
              url: walletConnectSiteUrl(),
              icons: walletConnectIcons(),
            },
          }),
        ]
      : []),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
