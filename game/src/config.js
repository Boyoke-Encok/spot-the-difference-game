// Spot the Difference: Three Little Worlds — tuning, palettes and level list.
// One place for every number a designer would tweak, so no scene file hard-codes
// sizes, times or colours. The playfield is a fixed 1280x720 logical area; the
// renderer scales it to the window, so no rule here depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

// The two picture panels, in logical coordinates. Both panels draw the same scene
// at the same size, so a difference sits at the same spot in each one.
export const PANEL = { width: 600, height: 500, leftX: 24, rightX: 656, y: 92 };
export const PANEL_GAP = 32;

export const HUD = { height: 76, footerY: 612 };

/** Seconds on the clock for each level, and the hint allowance per level. */
export const LEVELS = [
  { id: 'park', name: 'Sunny Park', time: 100, seed: 11, hints: 3 },
  { id: 'kitchen', name: 'Cozy Kitchen', time: 85, seed: 23, hints: 3 },
  { id: 'harbour', name: 'Harbour at Dusk', time: 70, seed: 37, hints: 3 },
];

/** How many differences each scene hides. Every level has the same count, so the
 *  counter "Found n / 7" always means the same thing. */
export const DIFFS_PER_LEVEL = 7;

export const SCORE = {
  found: 100,
  timeBonusPerSecond: 10,
  wrongClickSeconds: 5,
  hintSeconds: 10,
  levelClearBonus: 250,
};

export const PALETTE = {
  backdrop: '#171a26',
  panelEdge: '#3a415c',
  panelEdgeFound: '#37c978',
  hudText: '#f2f0e6',
  muted: '#9aa3b8',
  accent: '#ffd166',
  accent2: '#4fc3f7',
  danger: '#ef6461',
  good: '#37c978',
  panelBg: '#0e1220',
  button: '#2b3350',
  buttonHover: '#3a4468',
  footerBg: '#1d2233',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best total score is kept between visits (this browser only). */
export const BEST_KEY = 'spot-the-difference.best';
