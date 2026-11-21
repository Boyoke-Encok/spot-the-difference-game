// Boot and the one loop: input is read every frame, the world advances in fixed
// 1/60 s steps (several in a slow frame, none in a fast one), and the renderer
// paints what is there. The game moves between six screens: title, play,
// paused, scene clear, game over and win.
//
// ?shot=start|play|end stages that scene instead of running the loop, paints it
// twice and sets window.__shotReady for a screenshot.

import { BEST_KEY, STEP } from './config.js';
import { createWorld, EVENT_FOUND, EVENT_GAME_OVER, EVENT_HINT, EVENT_LEVEL_CLEAR, EVENT_WIN, EVENT_WRONG } from './world.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_PAUSE, createInput, panelAt } from './input.js';
import { createRenderer, SCREEN_CLEAR, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { createSound } from './sound.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld();
const renderer = createRenderer(canvas);
const sound = createSound();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world, scene.screen, scene.best, false, 1000);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  // Screen readers (and anyone watching the page's text) hear the screen
  // changes and each find.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Find 7 differences before the clock runs out.');
  }

  function endGame(win) {
    screen = win ? SCREEN_WIN : SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(win ? `You found them all! Score ${world.state.score}.` : `Time's up. Score ${world.state.score}.`);
  }

  function handleClicks() {
    if (screen !== SCREEN_PLAY) return;
    for (const point of input.takeClicks()) {
      const panel = panelAt(point.x, point.y);
      if (!panel) continue;
      const events = world.clickAt(panel.x, panel.y);
      if (events & EVENT_FOUND) {
        sound.found();
        announce(world.state.message);
      } else if (events & EVENT_WRONG) {
        sound.wrong();
        renderer.addMiss(point);
        announce(world.state.message);
      }
      if (events & EVENT_WIN) {
        sound.clear();
        endGame(true);
      } else if (events & EVENT_LEVEL_CLEAR) {
        sound.clear();
        screen = SCREEN_CLEAR;
        announce(world.state.message);
      } else if (events & EVENT_GAME_OVER) {
        endGame(false);
      }
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      const muted = sound.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      const events = world.useHint();
      if (events & EVENT_HINT) sound.hint();
      if (events & EVENT_GAME_OVER) endGame(false);
      else announce(world.state.message);
    }
    if (actions & ACTION_CONFIRM) {
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WIN) startGame();
      else if (screen === SCREEN_CLEAR) {
        world.nextLevel();
        screen = SCREEN_PLAY;
        announce(`Playing. ${world.level().name}.`);
      } else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
    } else if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
    }
    // A click anywhere also advances the non-play screens, like Space does.
    if (screen !== SCREEN_PLAY && input.takeClicks().length > 0) {
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WIN) startGame();
      else if (screen === SCREEN_CLEAR) {
        world.nextLevel();
        screen = SCREEN_PLAY;
      } else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
    }
  }

  function step() {
    if (screen !== SCREEN_PLAY) return;
    const events = world.step(STEP);
    if (events & EVENT_GAME_OVER) endGame(false);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    handleClicks();
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world, screen, best, sound.isMuted(), now);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Spot the Difference. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
