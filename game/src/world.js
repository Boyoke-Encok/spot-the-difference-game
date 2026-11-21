// The game's state: which level, which differences are found, the clock, the
// score and the hints. Pure logic, no drawing and no DOM: the renderer reads
// this, the input feeds clicks into it, and the shot stager drives it directly.

import { DIFFS_PER_LEVEL, LEVELS, SCORE } from './config.js';
import { SCENES, diffIds } from './scenes.js';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_LEVEL_CLEAR = 4;
export const EVENT_GAME_OVER = 8;
export const EVENT_WIN = 16;
export const EVENT_HINT = 32;

export function createWorld() {
  const state = {
    levelIndex: 0,
    found: new Set(),
    foundOrder: [],
    hinted: null,
    hintUntil: 0,
    timeLeft: LEVELS[0].time,
    score: 0,
    levelScore: 0,
    wrong: 0,
    hintsUsed: 0,
    elapsed: 0,
    message: '',
    lastFoundLabel: '',
    levelClearAt: 0,
    totalFound: 0,
  };

  function level() {
    return LEVELS[state.levelIndex];
  }

  function scene() {
    return SCENES[level().id];
  }

  function resetLevel(index) {
    state.levelIndex = index;
    state.found = new Set();
    state.foundOrder = [];
    state.hinted = null;
    state.hintUntil = 0;
    state.timeLeft = LEVELS[index].time;
    state.levelScore = 0;
    state.wrong = 0;
    state.hintsUsed = 0;
    state.message = `Find ${DIFFS_PER_LEVEL} differences in ${LEVELS[index].name}!`;
    state.lastFoundLabel = '';
  }

  function reset() {
    state.score = 0;
    state.totalFound = 0;
    state.elapsed = 0;
    resetLevel(0);
  }

  /** Advance the clock by dt seconds. Returns an event flag. */
  function step(dt) {
    state.elapsed += dt;
    if (state.hinted !== null && state.elapsed > state.hintUntil) state.hinted = null;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.message = 'Time ran out! Try this scene again.';
      return EVENT_GAME_OVER;
    }
    return EVENT_NONE;
  }

  /**
   * A click at panel-local coordinates (x, y) on either panel. A hit marks the
   * difference found on both panels; a miss costs time. Returns an event flag.
   */
  function clickAt(x, y) {
    const diffs = scene().diffs;
    for (let i = 0; i < diffs.length; i += 1) {
      const d = diffs[i];
      const dx = x - d.x;
      const dy = y - d.y;
      if (dx * dx + dy * dy <= d.r * d.r) {
        if (state.found.has(d.id)) return EVENT_NONE;
        state.found.add(d.id);
        state.foundOrder.push(d.id);
        state.totalFound += 1;
        state.levelScore += SCORE.found;
        state.score += SCORE.found;
        state.lastFoundLabel = d.label;
        state.message = `Found it! ${d.label}.`;
        if (state.hinted === d.id) state.hinted = null;
        if (state.found.size >= DIFFS_PER_LEVEL) {
          const bonus = Math.round(state.timeLeft) * SCORE.timeBonusPerSecond + SCORE.levelClearBonus;
          state.score += bonus;
          state.levelClearAt = state.elapsed;
          state.message = `Scene complete! Time bonus +${bonus}.`;
          if (state.levelIndex + 1 >= LEVELS.length) return EVENT_FOUND | EVENT_WIN;
          return EVENT_FOUND | EVENT_LEVEL_CLEAR;
        }
        return EVENT_FOUND;
      }
    }
    state.wrong += 1;
    state.timeLeft = Math.max(0, state.timeLeft - SCORE.wrongClickSeconds);
    state.message = 'Not quite — look closer! (−5s)';
    if (state.timeLeft <= 0) return EVENT_WRONG | EVENT_GAME_OVER;
    return EVENT_WRONG;
  }

  /** Spend a hint: reveal one unfound difference for a few seconds, at a time cost. */
  function useHint() {
    if (state.hintsUsed >= level().hints) {
      state.message = 'No hints left on this scene.';
      return EVENT_NONE;
    }
    const remaining = diffIds(level().id).filter((id) => !state.found.has(id));
    if (remaining.length === 0) return EVENT_NONE;
    const pick = remaining[Math.floor(remaining.length / 2)];
    state.hinted = pick;
    state.hintUntil = state.elapsed + 2.5;
    state.hintsUsed += 1;
    state.timeLeft = Math.max(0, state.timeLeft - SCORE.hintSeconds);
    state.message = 'Hint: follow the pulsing ring! (−10s)';
    if (state.timeLeft <= 0) return EVENT_HINT | EVENT_GAME_OVER;
    return EVENT_HINT;
  }

  function nextLevel() {
    resetLevel(state.levelIndex + 1);
  }

  function remaining() {
    return DIFFS_PER_LEVEL - state.found.size;
  }

  return { state, level, scene, reset, resetLevel, step, clickAt, useHint, nextLevel, remaining };
}
