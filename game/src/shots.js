// The screenshot scenes behind ?shot=start|play|end. Each one sets the world to
// a fixed, honest state — no faked pixels, no overlay drawn for the camera:
// the play scene really finds three differences through the world's own click
// handler, so the frame is what a short game looks like: markers on the three
// found, four still unfound, and the counter reading Found 3/7. The same seed
// always gives the same frame.

import { SCREEN_CLEAR, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { EVENT_FOUND } from './world.js';

/** The three differences the play shot finds, by their panel-local spots. */
const PLAY_FINDS = [
  { x: 90, y: 80 },
  { x: 430, y: 95 },
  { x: 500, y: 438 },
];

/**
 * Set `world` to the named scene and return the screen to draw over it and the
 * best score to show. Any other name is the title scene.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'end') {
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'play') {
    for (const spot of PLAY_FINDS) {
      const events = world.clickAt(spot.x, spot.y);
      if (!(events & EVENT_FOUND)) throw new Error(`play shot: click at ${spot.x},${spot.y} found nothing`);
    }
    world.state.timeLeft = 62;
    world.state.elapsed = 38;
    world.state.message = 'Found it! A duck swam into the pond.';
    return { screen: SCREEN_PLAY, best: 300 };
  }
  // The end scene: every level cleared through the real rules, so the win
  // screen shows a true total.
  for (let level = 0; level < 3; level += 1) {
    const diffs = world.scene().diffs;
    for (const d of diffs) world.clickAt(d.x, d.y);
    if (level < 2) world.nextLevel();
  }
  world.state.message = 'You found them all!';
  return { screen: SCREEN_WIN, best: world.state.score };
}

export { SCREEN_CLEAR, SCREEN_OVER };
