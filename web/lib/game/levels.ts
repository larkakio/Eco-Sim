import type { Cell, LevelDef } from "./engine";

function row(...cells: Cell[]): Cell[] {
  return cells;
}

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: "First Bloom",
    description:
      "Swipe on the field to move. Heal wasteland, harvest ions, and purge toxins. Reach the biomass target with zero hazards left.",
    rows: 3,
    cols: 3,
    cursor: { r: 1, c: 1 },
    maxTurns: 14,
    targetBiomass: 6,
    initial: [
      row(
        { t: "hazard", hp: 1 },
        { t: "empty" },
        { t: "resource", n: 2 },
      ),
      row(
        { t: "empty" },
        { t: "empty" },
        { t: "hazard", hp: 1 },
      ),
      row({ t: "biome" }, { t: "empty" }, { t: "empty" }),
    ],
  },
  {
    id: 2,
    name: "Neon Canopy",
    description:
      "Larger grid, tighter deadline. Chain quick swipes within ~0.4s for a sync biomass bonus.",
    rows: 4,
    cols: 4,
    cursor: { r: 2, c: 1 },
    maxTurns: 22,
    targetBiomass: 14,
    initial: [
      row(
        { t: "hazard", hp: 2 },
        { t: "empty" },
        { t: "resource", n: 2 },
        { t: "empty" },
      ),
      row(
        { t: "empty" },
        { t: "hazard", hp: 1 },
        { t: "empty" },
        { t: "resource", n: 3 },
      ),
      row(
        { t: "biome" },
        { t: "empty" },
        { t: "empty" },
        { t: "hazard", hp: 1 },
      ),
      row(
        { t: "empty" },
        { t: "resource", n: 2 },
        { t: "hazard", hp: 1 },
        { t: "empty" },
      ),
    ],
  },
  {
    id: 3,
    name: "Spore Mainframe",
    description:
      "High-risk bloom. Double-stacked blight cores need multiple passes.",
    rows: 5,
    cols: 4,
    cursor: { r: 2, c: 2 },
    maxTurns: 30,
    targetBiomass: 22,
    initial: [
      row(
        { t: "empty" },
        { t: "hazard", hp: 2 },
        { t: "resource", n: 2 },
        { t: "empty" },
      ),
      row(
        { t: "hazard", hp: 1 },
        { t: "empty" },
        { t: "empty" },
        { t: "hazard", hp: 2 },
      ),
      row(
        { t: "biome" },
        { t: "empty" },
        { t: "empty" },
        { t: "resource", n: 3 },
      ),
      row(
        { t: "empty" },
        { t: "resource", n: 2 },
        { t: "hazard", hp: 1 },
        { t: "empty" },
      ),
      row(
        { t: "empty" },
        { t: "hazard", hp: 1 },
        { t: "empty" },
        { t: "empty" },
      ),
    ],
  },
];

export function getLevel(id: number): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}
