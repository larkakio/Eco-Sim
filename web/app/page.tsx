import { CheckInPanel } from "@/components/check-in-panel";
import { EcoSimGame } from "@/components/eco-sim-game";
import { WalletBar } from "@/components/wallet-bar";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col px-4 pb-10 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
      <header className="mb-6 shrink-0 border-b border-cyan-500/20 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-cyan-400/70">
              Base · standard web
            </p>
            <h1 className="font-orbitron mt-1 bg-gradient-to-r from-cyan-200 via-fuchsia-200 to-amber-200 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl animate-neon-flash">
              Eco Sim
            </h1>
            <p className="mt-2 max-w-xl font-mono text-xs leading-relaxed text-cyan-100/70">
              Swipe the neon field to spread biomes, harvest ion clusters, and
              purge slag cores — then anchor your streak on Base.
            </p>
          </div>
          <div className="shrink-0 sm:pt-1">
            <WalletBar />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 sm:max-w-2xl">
        <section className="neon-panel rounded-2xl border border-cyan-500/25 bg-[#08051a]/85 p-4 sm:p-6">
          <EcoSimGame />
        </section>
        <section>
          <CheckInPanel />
        </section>
      </main>
    </div>
  );
}
