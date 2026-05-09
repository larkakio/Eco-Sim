export type Cell =
  | { t: "empty" }
  | { t: "biome" }
  | { t: "resource"; n: number }
  | { t: "hazard"; hp: number };

export type Direction = "up" | "down" | "left" | "right";

export type LevelDef = {
  id: number;
  name: string;
  rows: number;
  cols: number;
  cursor: { r: number; c: number };
  maxTurns: number;
  targetBiomass: number;
  description: string;
  initial: Cell[][];
};

export type GameStatus = "playing" | "won" | "lost";

export type GameState = {
  levelId: number;
  grid: Cell[][];
  cursor: { r: number; c: number };
  turnsLeft: number;
  biomass: number;
  status: GameStatus;
  lastMoveAt: number;
  syncBonusAvailable: boolean;
};

const DIR: Record<Direction, { r: number; c: number }> = {
  up: { r: -1, c: 0 },
  down: { r: 1, c: 0 },
  left: { r: 0, c: -1 },
  right: { r: 0, c: 1 },
};

function deepCopyGrid(g: Cell[][]): Cell[][] {
  return g.map((row) => row.map((c) => ({ ...c } as Cell)));
}

function countHazards(grid: Cell[][]): number {
  let n = 0;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c]!.t === "hazard") n++;
    }
  return n;
}

function applyLanding(cell: Cell): { cell: Cell; biomassDelta: number } {
  switch (cell.t) {
    case "empty":
      return { cell: { t: "biome" }, biomassDelta: 1 };
    case "biome":
      return { cell, biomassDelta: 1 };
    case "resource": {
      const gain = cell.n;
      return { cell: { t: "biome" }, biomassDelta: gain };
    }
    case "hazard": {
      const hp = cell.hp - 1;
      if (hp <= 0) return { cell: { t: "biome" }, biomassDelta: 0 };
      return { cell: { t: "hazard", hp }, biomassDelta: 0 };
    }
  }
}

export function createInitialState(level: LevelDef): GameState {
  return {
    levelId: level.id,
    grid: deepCopyGrid(level.initial),
    cursor: { ...level.cursor },
    turnsLeft: level.maxTurns,
    biomass: 0,
    status: "playing",
    lastMoveAt: 0,
    syncBonusAvailable: false,
  };
}

function checkWin(
  level: LevelDef,
  biomass: number,
  grid: Cell[][],
): boolean {
  return biomass >= level.targetBiomass && countHazards(grid) === 0;
}

export function applySwipe(
  state: GameState,
  level: LevelDef,
  direction: Direction,
): GameState {
  if (state.status !== "playing") return state;

  const { r: dr, c: dc } = DIR[direction];
  const nr = state.cursor.r + dr;
  const nc = state.cursor.c + dc;
  if (nr < 0 || nr >= level.rows || nc < 0 || nc >= level.cols) {
    return state;
  }

  const grid = deepCopyGrid(state.grid);
  const now = Date.now();
  const comboWindowMs = 420;
  const syncBonus =
    state.lastMoveAt > 0 && now - state.lastMoveAt < comboWindowMs ? 1 : 0;

  const landed = grid[nr][nc]!;

  const { cell: newCell, biomassDelta } = applyLanding(landed);
  grid[nr][nc] = newCell;

  const biomass = state.biomass + biomassDelta + syncBonus;
  const turnsLeft = state.turnsLeft - 1;

  const won = checkWin(level, biomass, grid);
  const lost = !won && turnsLeft <= 0;

  return {
    ...state,
    grid,
    cursor: { r: nr, c: nc },
    turnsLeft,
    biomass,
    lastMoveAt: now,
    syncBonusAvailable: syncBonus > 0,
    status: won ? "won" : lost ? "lost" : "playing",
  };
}

export function cloneGridForRender(grid: Cell[][]): Cell[][] {
  return deepCopyGrid(grid);
}
