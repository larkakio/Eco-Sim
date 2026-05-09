import { createConfig, http, createStorage, cookieStorage } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { injected, baseAccount, walletConnect } from "wagmi/connectors";
import { getWalletConnectProjectId } from "@/lib/env/public";

const projectId = getWalletConnectProjectId();

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
              url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost",
              icons: [],
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
