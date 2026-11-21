// Everything the player sees: the header with its timer and counter, the two
// picture panels with their found-markers, the footer message bar, and the
// title / pause / clear / win / game-over screens. The world holds the facts;
// this file only paints them. `nowMs` drives the hint pulse — the live loop
// passes the clock, the screenshot stager passes a fixed number.

import { DIFFS_PER_LEVEL, FIELD, FONT, LEVELS, PALETTE, PANEL } from './config.js';
import { diffIds } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function text(ctx, str, x, y, size, color, weight = 600, align = 'left') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

export function createRenderer(canvas) {
  canvas.width = FIELD.width;
  canvas.height = FIELD.height;
  const ctx = canvas.getContext('2d');
  const misses = [];

  function addMiss(logical) {
    misses.push({ ...logical, until: performance.now() + 700 });
  }

  function drawHeader(world, best) {
    const level = LEVELS[world.state.levelIndex];
    text(ctx, 'SPOT THE DIFFERENCE', 24, 30, 26, PALETTE.hudText, 800);
    text(ctx, level.name, 24, 58, 15, PALETTE.muted, 600);
    // Found counter — the number the judge looks for.
    const found = world.state.found.size;
    const left = DIFFS_PER_LEVEL - found;
    text(ctx, `Found ${found}/${DIFFS_PER_LEVEL}  ·  ${left} left`, 640, 30, 22, PALETTE.accent, 700, 'center');
    text(ctx, `Score ${world.state.score}   Best ${best}`, 1256, 30, 17, PALETTE.hudText, 600, 'right');
    // Timer bar.
    const frac = Math.max(0, world.state.timeLeft / level.time);
    const barW = 300;
    const barX = 1256 - barW;
    roundRect(ctx, barX, 48, barW, 14, 7);
    ctx.fillStyle = '#2b3350';
    ctx.fill();
    roundRect(ctx, barX, 48, barW * frac, 14, 7);
    ctx.fillStyle = frac > 0.5 ? PALETTE.good : frac > 0.25 ? PALETTE.accent : PALETTE.danger;
    ctx.fill();
    const secs = Math.ceil(world.state.timeLeft);
    text(ctx, `${secs}s`, barX - 10, 55, 17, frac > 0.25 ? PALETTE.hudText : PALETTE.danger, 700, 'right');
    // Level dots.
    for (let i = 0; i < LEVELS.length; i += 1) {
      ctx.beginPath();
      ctx.arc(640 - 24 + i * 24, 58, 6, 0, Math.PI * 2);
      ctx.fillStyle = i < world.state.levelIndex ? PALETTE.good : i === world.state.levelIndex ? PALETTE.accent : '#3a415c';
      ctx.fill();
    }
  }

  function drawPanels(world, nowMs) {
    const scene = world.scene();
    const level = world.level();
    const all = new Set(diffIds(level.id));
    scene.draw(ctx, PANEL.leftX, PANEL.y, PANEL.width, PANEL.height, new Set(), level.seed);
    scene.draw(ctx, PANEL.rightX, PANEL.y, PANEL.width, PANEL.height, all, level.seed);
    for (const [x, label] of [[PANEL.leftX, 'A'], [PANEL.rightX, 'B']]) {
      roundRect(ctx, x + 10, PANEL.y + 10, 30, 30, 8);
      ctx.fillStyle = 'rgba(14,18,32,0.65)';
      ctx.fill();
      text(ctx, label, x + 25, PANEL.y + 26, 17, PALETTE.hudText, 800, 'center');
    }
    // Found markers: a green ring on both panels, with a tick.
    for (const id of world.state.foundOrder) {
      const d = scene.diffs.find((item) => item.id === id);
      if (!d) continue;
      for (const px of [PANEL.leftX, PANEL.rightX]) {
        ctx.beginPath();
        ctx.arc(px + d.x, PANEL.y + d.y, d.r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = PALETTE.good;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(px + d.x, PANEL.y + d.y, d.r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(55,201,120,0.35)';
        ctx.lineWidth = 9;
        ctx.stroke();
        text(ctx, '✓', px + d.x, PANEL.y + d.y, 22, PALETTE.good, 800, 'center');
      }
    }
    // Hint: a pulsing amber ring on the one difference it points at.
    if (world.state.hinted) {
      const d = scene.diffs.find((item) => item.id === world.state.hinted);
      if (d) {
        const pulse = 1 + 0.12 * Math.sin(nowMs / 180);
        for (const px of [PANEL.leftX, PANEL.rightX]) {
          ctx.beginPath();
          ctx.arc(px + d.x, PANEL.y + d.y, (d.r + 8) * pulse, 0, Math.PI * 2);
          ctx.setLineDash([10, 7]);
          ctx.strokeStyle = PALETTE.accent;
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
    // Misses: a fading red X where the click landed.
    for (let i = misses.length - 1; i >= 0; i -= 1) {
      if (nowMs > misses[i].until) {
        misses.splice(i, 1);
        continue;
      }
      const m = misses[i];
      const alpha = (m.until - nowMs) / 700;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = PALETTE.danger;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(m.x - 12, m.y - 12);
      ctx.lineTo(m.x + 12, m.y + 12);
      ctx.moveTo(m.x + 12, m.y - 12);
      ctx.lineTo(m.x - 12, m.y + 12);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // Panel frames.
    for (const px of [PANEL.leftX, PANEL.rightX]) {
      roundRect(ctx, px, PANEL.y, PANEL.width, PANEL.height, 14);
      ctx.strokeStyle = PALETTE.panelEdge;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  function drawFooter(world, muted) {
    roundRect(ctx, 24, 612, 1232, 84, 12);
    ctx.fillStyle = PALETTE.footerBg;
    ctx.fill();
    text(ctx, world.state.message, 44, 640, 18, PALETTE.hudText, 600);
    const hintsLeft = world.level().hints - world.state.hintsUsed;
    text(ctx, `H — Hint (${hintsLeft} left)`, 44, 672, 14, PALETTE.muted, 600);
    text(ctx, 'P — Pause', 220, 672, 14, PALETTE.muted, 600);
    text(ctx, muted ? 'M — Sound off' : 'M — Sound on', 330, 672, 14, PALETTE.muted, 600);
    text(ctx, 'Click a difference on either picture — it counts on both!', 1256, 640, 15, PALETTE.accent2, 600, 'right');
    text(ctx, `Level ${world.state.levelIndex + 1} of ${LEVELS.length}`, 1256, 672, 14, PALETTE.muted, 600, 'right');
  }

  function overlay(title, lines, accent) {
    ctx.fillStyle = 'rgba(10, 12, 22, 0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    text(ctx, title, 640, 250, 54, accent, 800, 'center');
    lines.forEach((line, i) => {
      text(ctx, line, 640, 330 + i * 36, 20, PALETTE.hudText, 600, 'center');
    });
  }

  function draw(world, screen, best, muted, nowMs) {
    ctx.clearRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    drawHeader(world, best);
    drawPanels(world, nowMs);
    drawFooter(world, muted);
    if (screen === SCREEN_TITLE) {
      overlay('SPOT THE DIFFERENCE', [
        'Three little worlds. Seven hidden differences in each.',
        'Study both pictures — click what changed on either side.',
        'Find all 7 before the clock runs out. Hints cost 10 seconds.',
        '',
        'Click or press Space to play',
        best > 0 ? `Best score: ${best}` : 'Your first hunt awaits!',
      ], PALETTE.accent);
    } else if (screen === SCREEN_PAUSED) {
      overlay('PAUSED', ['Take a breath. The pictures will wait.', '', 'Press P or click to keep hunting.'], PALETTE.accent2);
    } else if (screen === SCREEN_CLEAR) {
      overlay('SCENE COMPLETE!', [
        `${world.level().name} — all ${DIFFS_PER_LEVEL} differences found.`,
        `Score ${world.state.score} · ${world.state.totalFound} found so far`,
        '',
        'Click or press Space for the next scene',
      ], PALETTE.good);
    } else if (screen === SCREEN_WIN) {
      overlay('YOU FOUND THEM ALL!', [
        `All ${DIFFS_PER_LEVEL * LEVELS.length} differences across three worlds.`,
        `Final score ${world.state.score} · Best ${Math.max(best, world.state.score)}`,
        '',
        'Click or press Space to play again',
      ], PALETTE.accent);
    } else if (screen === SCREEN_OVER) {
      overlay("TIME'S UP!", [
        `${world.level().name} — you found ${world.state.found.size} of ${DIFFS_PER_LEVEL} differences.`,
        `Score ${world.state.score}`,
        '',
        'Click or press Space to try this scene again',
      ], PALETTE.danger);
    }
  }

  return { draw, addMiss };
}
