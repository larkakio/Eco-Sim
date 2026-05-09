"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  applySwipe,
  createInitialState,
  type Direction,
  type GameState,
} from "@/lib/game/engine";
import { LEVELS, getLevel } from "@/lib/game/levels";
import {
  loadMaxUnlocked,
  unlockAfterComplete,
} from "@/lib/game/storage";
import { GameField } from "@/components/game-field";
import type { Cell, LevelDef } from "@/lib/game/engine";

function subscribeStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function useHydratedMaxUnlocked(): number {
  return useSyncExternalStore(subscribeStorage, loadMaxUnlocked, () => 1);
}

function cellLabel(cell: Cell): string {
  switch (cell.t) {
    case "empty":
      return "∅";
    case "biome":
      return "❖";
    case "resource":
      return `+${cell.n}`;
    case "hazard":
      return cell.hp > 1 ? `☠${cell.hp}` : "☠";
  }
}

function cellClasses(cell: Cell, cursor: boolean): string {
  const base =
    "flex aspect-square min-h-[2.5rem] items-center justify-center rounded-xl border font-mono text-xs font-bold transition-all duration-300 ";
  if (cursor) {
    return (
      base +
      "neon-cursor z-10 border-fuchsia-400/90 bg-fuchsia-950/50 text-fuchsia-100 shadow-[0_0_26px_rgba(236,72,153,0.45)] ring-2 ring-cyan-400/60"
    );
  }
  switch (cell.t) {
    case "empty":
      return (
        base +
        "border-slate-700/60 bg-slate-950/40 text-slate-500 animate-cyber-dim"
      );
    case "biome":
      return (
        base +
        "neon-tile-life border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
      );
    case "resource":
      return (
        base +
        "neon-tile-ion border-amber-400/55 bg-amber-400/15 text-amber-200"
      );
    case "hazard":
      return (
        base +
        "neon-tile-tox border-violet-500/60 bg-violet-950/35 text-violet-200"
      );
  }
}

type LevelSessionProps = {
  level: LevelDef;
  onWinProgress: (completedLevelId: number) => void;
  canGoNext: boolean;
  onNextLevel: () => void;
};

function EcoSimLevelSession({
  level,
  onWinProgress,
  canGoNext,
  onNextLevel,
}: LevelSessionProps) {
  const [game, setGame] = useState<GameState>(() => createInitialState(level));
  const winHandledRef = useRef(false);

  const onSwipe = useCallback(
    (d: Direction) => {
      setGame((g) => {
        const next = applySwipe(g, level, d);
        if (next.status === "won" && !winHandledRef.current) {
          winHandledRef.current = true;
          onWinProgress(level.id);
        }
        return next;
      });
    },
    [level, onWinProgress],
  );

  const hazards = useMemo(() => {
    let n = 0;
    for (const row of game.grid)
      for (const c of row) if (c.t === "hazard") n++;
    return n;
  }, [game]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 font-mono text-[11px] text-cyan-200/90 sm:grid-cols-4">
        <div className="rounded-lg border border-emerald-400/30 bg-emerald-950/25 px-2 py-2">
          Biomass{" "}
          <span className="text-emerald-300">
            {game.biomass}/{level.targetBiomass}
          </span>
        </div>
        <div className="rounded-lg border border-violet-400/30 bg-violet-950/20 px-2 py-2">
          Hazards <span className="text-violet-200">{hazards}</span>
        </div>
        <div className="rounded-lg border border-amber-400/30 bg-amber-950/20 px-2 py-2">
          Turns <span className="text-amber-200">{game.turnsLeft}</span>
        </div>
        <div className="rounded-lg border border-fuchsia-400/30 bg-fuchsia-950/20 px-2 py-2">
          Sync lane{" "}
          <span className="text-fuchsia-200">
            {game.syncBonusAvailable ? "charged" : "idle"}
          </span>
        </div>
      </div>

      <GameField onSwipe={onSwipe} disabled={game.status !== "playing"}>
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${level.cols}, minmax(0,1fr))`,
          }}
        >
          {game.grid.map((row, r) =>
            row.map((cell, c) => {
              const cursorHere = game.cursor.r === r && game.cursor.c === c;
              return (
                <div
                  key={`${r}-${c}`}
                  className={cellClasses(cell, cursorHere)}
                >
                  {cellLabel(cell)}
                </div>
              );
            }),
          )}
        </div>
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-400/55">
          Swipe the field · U D L R
        </p>
      </GameField>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-xl border border-cyan-500/40 px-4 py-2 font-mono text-xs uppercase tracking-wide text-cyan-100 hover:bg-cyan-500/10"
          onClick={() => {
            winHandledRef.current = false;
            setGame(createInitialState(level));
          }}
        >
          Reset level
        </button>
      </div>

      {game.status === "won" ? (
        <div
          className="animate-neon-pulse mt-4 rounded-2xl border-2 border-emerald-400/60 bg-emerald-950/40 p-4 text-center"
          role="status"
        >
          <p className="font-orbitron text-base text-emerald-200">
            Sector stabilized
          </p>
          <p className="mt-1 font-mono text-xs text-emerald-100/80">
            Biomass synced. Next sector unlocked if available.
          </p>
          {canGoNext ? (
            <button
              type="button"
              className="mt-3 rounded-xl border border-emerald-300/50 bg-emerald-500/20 px-4 py-2 font-mono text-xs font-semibold text-emerald-50 transition hover:bg-emerald-500/35"
              onClick={onNextLevel}
            >
              Next level
            </button>
          ) : null}
        </div>
      ) : null}

      {game.status === "lost" ? (
        <div className="mt-4 rounded-2xl border border-rose-500/50 bg-rose-950/30 p-4 text-center">
          <p className="font-orbitron text-base text-rose-200">Cascade failed</p>
          <p className="mt-1 font-mono text-xs text-rose-100/75">
            Out of turns. Reset and remap your routes.
          </p>
        </div>
      ) : null}
    </>
  );
}

export function EcoSimGame() {
  const hydratedMax = useHydratedMaxUnlocked();
  const [maxUnlocked, setMaxUnlocked] = useState(1);
  const [activeLevelId, setActiveLevelId] = useState(1);

  const effectiveMax = Math.max(maxUnlocked, hydratedMax);

  const level = useMemo(() => getLevel(activeLevelId), [activeLevelId]);

  const bumpProgress = useCallback((completedLevelId: number) => {
    const next = unlockAfterComplete(completedLevelId);
    setMaxUnlocked(next);
  }, []);

  const goNextLevel = useCallback(() => {
    setActiveLevelId((id) => id + 1);
  }, []);

  if (!level) {
    return (
      <div className="rounded-xl border border-cyan-500/20 p-6 font-mono text-cyan-200/70">
        Unknown level.
      </div>
    );
  }

  const canGoNext =
    activeLevelId < LEVELS.length && activeLevelId + 1 <= effectiveMax;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => {
          const locked = l.id > effectiveMax;
          const active = l.id === activeLevelId;
          return (
            <button
              key={l.id}
              type="button"
              disabled={locked}
              onClick={() => setActiveLevelId(l.id)}
              className={
                "rounded-xl border px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition " +
                (active
                  ? "border-cyan-400/70 bg-cyan-500/20 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                  : locked
                    ? "cursor-not-allowed border-zinc-700/50 text-zinc-600"
                    : "border-fuchsia-500/35 bg-fuchsia-950/20 text-fuchsia-200 hover:border-fuchsia-400/60")
              }
            >
              {locked ? `Lv ${l.id} — locked` : `Level ${l.id}`}
            </button>
          );
        })}
      </div>

      <div>
        <h2 className="font-orbitron text-lg font-semibold tracking-wide text-cyan-100">
          {level.name}
        </h2>
        <p className="mt-1 max-w-prose font-mono text-[11px] leading-relaxed text-cyan-100/65">
          {level.description}
        </p>
      </div>

      <EcoSimLevelSession
        key={level.id}
        level={level}
        onWinProgress={bumpProgress}
        canGoNext={canGoNext}
        onNextLevel={goNextLevel}
      />
    </div>
  );
}
