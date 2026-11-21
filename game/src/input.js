// Mouse, touch and keyboard input, translated into game actions. The canvas is
// scaled to the window, so a click is mapped back into the 1280x720 logical
// field before the world sees it. Clicks land on a panel; keys drive the rest.

import { FIELD, PANEL } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_MUTE = 8;

/** Map a client (x, y) on the canvas to logical field coordinates. */
export function toLogical(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(rect.width / FIELD.width, rect.height / FIELD.height);
  const offsetX = (rect.width - FIELD.width * scale) / 2;
  const offsetY = (rect.height - FIELD.height * scale) / 2;
  return { x: (clientX - rect.left - offsetX) / scale, y: (clientY - rect.top - offsetY) / scale };
}

/**
 * Which panel a logical point is on, and its panel-local coordinates — or null
 * when the point is outside both pictures.
 */
export function panelAt(x, y) {
  if (y < PANEL.y || y > PANEL.y + PANEL.height) return null;
  if (x >= PANEL.leftX && x <= PANEL.leftX + PANEL.width) {
    return { side: 'left', x: x - PANEL.leftX, y: y - PANEL.y };
  }
  if (x >= PANEL.rightX && x <= PANEL.rightX + PANEL.width) {
    return { side: 'right', x: x - PANEL.rightX, y: y - PANEL.y };
  }
  return null;
}

export function createInput(canvas) {
  const clicks = [];
  const actions = { flags: 0 };

  function onPointer(event) {
    event.preventDefault();
    const point = toLogical(canvas, event.clientX, event.clientY);
    clicks.push(point);
  }

  function onKey(event) {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'enter') {
      actions.flags |= ACTION_CONFIRM;
      event.preventDefault();
    } else if (key === 'p' || key === 'escape') {
      actions.flags |= ACTION_PAUSE;
    } else if (key === 'h') {
      actions.flags |= ACTION_HINT;
    } else if (key === 'm') {
      actions.flags |= ACTION_MUTE;
    }
  }

  canvas.addEventListener('pointerdown', onPointer);
  window.addEventListener('keydown', onKey);

  return {
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
    takeActions() {
      const flags = actions.flags;
      actions.flags = 0;
      return flags;
    },
  };
}
