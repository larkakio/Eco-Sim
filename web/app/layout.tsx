import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";
import { config } from "@/lib/wagmi/config";
import { getBaseAppId } from "@/lib/env/public";

const shareTech = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-share-tech",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const baseAppId = getBaseAppId();

export const metadata: Metadata = {
  title: "Eco Sim — Base",
  description:
    "Cyberpunk ecology grid sim on Base. Swipe to heal the field, then check in on-chain.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const initialState = cookieToInitialState(config, cookieHeader);

  return (
    <html
      lang="en"
      className={`${shareTech.variable} ${orbitron.variable} h-full antialiased`}
    >
      <head>
        <meta name="base:app_id" content={baseAppId} />
      </head>
      <body className="relative min-h-dvh overflow-x-hidden">
        <div className="cyber-bg" aria-hidden />
        <AppProviders initialState={initialState}>
          <div className="relative flex min-h-dvh flex-col">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
