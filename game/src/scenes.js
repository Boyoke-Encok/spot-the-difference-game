// The three scenes. Each scene is one function that paints the same picture twice:
// once plain (the left panel) and once with its differences applied (the right
// panel). A difference is a small, local variant — an added bird, a recoloured
// flower, a missing duck — drawn exactly where its hotspot says it is, so a click
// on either panel tests the same spot. Decoration (grass, stars, pebbles) comes
// from a seeded generator, so both panels agree on every blade and the same seed
// always paints the same picture.

import { sceneRandom, range } from './random.js';

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function bird(ctx, x, y, color) {
  ctx.beginPath();
  ctx.moveTo(x - 12, y);
  ctx.quadraticCurveTo(x - 5, y - 9, x, y);
  ctx.quadraticCurveTo(x + 5, y - 9, x + 12, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function cloud(ctx, x, y, s, fill) {
  circle(ctx, x, y, 22 * s, fill);
  circle(ctx, x + 20 * s, y - 8 * s, 18 * s, fill);
  circle(ctx, x + 42 * s, y, 20 * s, fill);
  ellipse(ctx, x + 20 * s, y + 8 * s, 34 * s, 14 * s, fill);
}

function tulip(ctx, x, y, petal, stem = '#2f7d4f') {
  line(ctx, x, y, x, y + 26, stem, 4);
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 4);
  ctx.quadraticCurveTo(x - 12, y - 20, x - 5, y - 14);
  ctx.quadraticCurveTo(x, y - 24, x, y - 14);
  ctx.quadraticCurveTo(x, y - 24, x + 5, y - 14);
  ctx.quadraticCurveTo(x + 12, y - 20, x + 10, y - 4);
  ctx.closePath();
  ctx.fillStyle = petal;
  ctx.fill();
}

function clipPanel(ctx, ox, oy, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(ox, oy, w, h, 14);
  ctx.clip();
  ctx.translate(ox, oy);
}

/* ------------------------------------------------------------------ */
/* 1 — Sunny Park                                                      */
/* ------------------------------------------------------------------ */

function drawPark(ctx, ox, oy, w, h, applied, seed) {
  const rng = sceneRandom(seed, 1);
  clipPanel(ctx, ox, oy, w, h);
  const sky = ctx.createLinearGradient(0, 0, 0, 320);
  sky.addColorStop(0, '#8ec9ee');
  sky.addColorStop(1, '#d8f0ff');
  rect(ctx, 0, 0, w, 320, sky);
  rect(ctx, 0, 300, w, 200, '#69b455');
  rect(ctx, 0, 300, w, 10, '#57a047');
  // Sun, top left — with sunglasses when the difference applies.
  circle(ctx, 90, 80, 42, '#ffd94d');
  circle(ctx, 90, 80, 34, '#ffe98a');
  if (applied.has('sun-glasses')) {
    ellipse(ctx, 74, 76, 13, 9, '#22242e');
    ellipse(ctx, 106, 76, 13, 9, '#22242e');
    line(ctx, 87, 76, 93, 76, '#22242e', 3);
    line(ctx, 61, 72, 52, 66, '#22242e', 3);
    line(ctx, 119, 72, 128, 66, '#22242e', 3);
  } else {
    circle(ctx, 78, 74, 4, '#7a5b00');
    circle(ctx, 102, 74, 4, '#7a5b00');
    ctx.beginPath();
    ctx.arc(90, 84, 12, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.strokeStyle = '#7a5b00';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  cloud(ctx, 210, 66, 1, '#ffffff');
  cloud(ctx, 430, 52, 0.8, '#ffffff');
  cloud(ctx, 520, 128, 0.6, '#f4faff');
  bird(ctx, 300, 92, '#33415c');
  bird(ctx, 356, 122, '#33415c');
  if (applied.has('extra-bird')) bird(ctx, 430, 95, '#33415c');
  // Kite with a tail; the difference adds a red bow to the tail.
  ctx.beginPath();
  ctx.moveTo(330, 150);
  ctx.lineTo(362, 182);
  ctx.lineTo(330, 214);
  ctx.lineTo(298, 182);
  ctx.closePath();
  ctx.fillStyle = '#ef6461';
  ctx.fill();
  line(ctx, 330, 150, 330, 182, '#ffffff', 3);
  line(ctx, 298, 182, 362, 182, '#ffffff', 3);
  line(ctx, 330, 214, 330, 252, '#5b4a3a', 2);
  if (applied.has('kite-bow')) {
    circle(ctx, 330, 232, 6, '#c1121f');
    circle(ctx, 324, 232, 5, '#c1121f');
    circle(ctx, 336, 232, 5, '#c1121f');
  }
  // Tree, right side — apples appear when the difference applies.
  rect(ctx, 458, 240, 24, 90, '#7a5230');
  circle(ctx, 470, 205, 58, '#3f8f4f');
  circle(ctx, 425, 225, 40, '#4da45e');
  circle(ctx, 515, 225, 40, '#4da45e');
  circle(ctx, 470, 175, 42, '#57b368');
  if (applied.has('apples')) {
    circle(ctx, 445, 200, 8, '#d62828');
    circle(ctx, 495, 215, 8, '#d62828');
    circle(ctx, 470, 235, 8, '#d62828');
  }
  // Pond, bottom right — the duck is the difference.
  ellipse(ctx, 500, 442, 92, 34, '#5aa9e6');
  ellipse(ctx, 500, 438, 78, 26, '#7cc0f0');
  if (applied.has('duck')) {
    ellipse(ctx, 500, 438, 16, 11, '#ffffff');
    circle(ctx, 512, 428, 8, '#ffffff');
    circle(ctx, 515, 426, 2, '#22242e');
    ctx.beginPath();
    ctx.moveTo(519, 428);
    ctx.lineTo(528, 430);
    ctx.lineTo(519, 432);
    ctx.closePath();
    ctx.fillStyle = '#f4a259';
    ctx.fill();
  }
  // Bench — two slats normally, three when the difference applies.
  rect(ctx, 108, 372, 96, 10, '#8d5a2b');
  rect(ctx, 108, 388, 96, 10, '#8d5a2b');
  if (applied.has('bench-slat')) rect(ctx, 108, 404, 96, 10, '#8d5a2b');
  rect(ctx, 116, 382, 8, 44, '#6b4423');
  rect(ctx, 188, 382, 8, 44, '#6b4423');
  // Dog by the bench.
  ellipse(ctx, 258, 432, 30, 16, '#c98f4e');
  circle(ctx, 284, 416, 13, '#c98f4e');
  circle(ctx, 292, 404, 6, '#c98f4e');
  circle(ctx, 288, 412, 2, '#22242e');
  line(ctx, 258, 448, 246, 462, '#c98f4e', 6);
  line(ctx, 258, 448, 272, 462, '#c98f4e', 6);
  // Flowers along the bottom — one tulip changes colour.
  const spots = [58, 108, 158, 208, 258, 308];
  for (let i = 0; i < spots.length; i += 1) {
    const x = spots[i];
    const isTarget = x === 158;
    const color = isTarget && applied.has('tulip') ? '#ffd166' : '#e63946';
    tulip(ctx, x, 452, color);
  }
  // Seeded grass tufts, identical on both panels.
  ctx.strokeStyle = '#4c9a45';
  ctx.lineWidth = 2;
  for (let i = 0; i < 26; i += 1) {
    const x = range(rng, 12, 588);
    const y = range(rng, 330, 488);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y - 8);
    ctx.moveTo(x + 3, y);
    ctx.lineTo(x + 6, y - 9);
    ctx.stroke();
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* 2 — Cozy Kitchen                                                    */
/* ------------------------------------------------------------------ */

function drawKitchen(ctx, ox, oy, w, h, applied, seed) {
  const rng = sceneRandom(seed, 2);
  clipPanel(ctx, ox, oy, w, h);
  rect(ctx, 0, 0, w, 380, '#f6e3c5');
  rect(ctx, 0, 380, w, 120, '#b08968');
  rect(ctx, 0, 372, w, 10, '#8d6b4a');
  // Window with sky; the curtain covers half of it when the difference applies.
  rect(ctx, 66, 66, 190, 170, '#7ec8e3');
  circle(ctx, 210, 110, 24, '#ffd94d');
  cloud(ctx, 110, 100, 0.55, '#ffffff');
  cloud(ctx, 170, 150, 0.45, '#f4faff');
  rect(ctx, 66, 66, 190, 170, 'rgba(0,0,0,0)');
  ctx.strokeStyle = '#8d6b4a';
  ctx.lineWidth = 8;
  ctx.strokeRect(66, 66, 190, 170);
  line(ctx, 161, 66, 161, 236, '#8d6b4a', 6);
  line(ctx, 66, 151, 256, 151, '#8d6b4a', 6);
  rect(ctx, 58, 236, 206, 12, '#8d6b4a');
  if (applied.has('curtain')) {
    rect(ctx, 66, 66, 78, 170, '#e07a5f');
    line(ctx, 78, 70, 78, 232, '#c25e46', 3);
    line(ctx, 96, 70, 96, 232, '#c25e46', 3);
    line(ctx, 118, 70, 118, 232, '#c25e46', 3);
  } else {
    rect(ctx, 58, 58, 26, 178, '#e07a5f');
    rect(ctx, 238, 58, 26, 178, '#e07a5f');
  }
  // Wall clock — the minute hand points up, or right when it differs.
  circle(ctx, 420, 96, 42, '#fffdf5');
  ctx.strokeStyle = '#5b4a3a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(420, 96, 42, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 12; i += 1) {
    const a = (i * Math.PI) / 6;
    line(ctx, 420 + Math.sin(a) * 34, 96 - Math.cos(a) * 34, 420 + Math.sin(a) * 38, 96 - Math.cos(a) * 38, '#5b4a3a', 2);
  }
  line(ctx, 420, 96, 420, 74, '#22242e', 4);
  if (applied.has('clock-hand')) line(ctx, 420, 96, 444, 96, '#22242e', 4);
  else line(ctx, 420, 96, 420, 70, '#22242e', 4);
  circle(ctx, 420, 96, 4, '#c1121f');
  // Shelf with three mugs — the middle one changes colour.
  rect(ctx, 300, 196, 260, 12, '#8d6b4a');
  const mugColors = ['#4fc3f7', applied.has('mug') ? '#57b368' : '#4fc3f7', '#ef6461'];
  const mugX = [330, 420, 505];
  for (let i = 0; i < 3; i += 1) {
    rect(ctx, mugX[i], 158, 44, 38, mugColors[i]);
    ctx.beginPath();
    ctx.arc(mugX[i] + 48, 177, 10, -Math.PI / 2, Math.PI / 2);
    ctx.strokeStyle = mugColors[i];
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  // Teapot on the counter — steam curls when the difference applies.
  ellipse(ctx, 150, 372, 46, 26, '#5b8def');
  circle(ctx, 150, 344, 26, '#5b8def');
  rect(ctx, 142, 312, 16, 14, '#5b8def');
  ctx.beginPath();
  ctx.moveTo(176, 344);
  ctx.quadraticCurveTo(200, 330, 192, 312);
  ctx.strokeStyle = '#5b8def';
  ctx.lineWidth = 8;
  ctx.stroke();
  if (applied.has('steam')) {
    ctx.beginPath();
    ctx.moveTo(140, 300);
    ctx.quadraticCurveTo(128, 282, 140, 266);
    ctx.quadraticCurveTo(152, 250, 140, 236);
    ctx.strokeStyle = 'rgba(120,120,120,0.7)';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(162, 300);
    ctx.quadraticCurveTo(174, 284, 162, 268);
    ctx.quadraticCurveTo(150, 254, 162, 240);
    ctx.stroke();
  }
  // Fruit bowl — two apples normally, three when the difference applies.
  ellipse(ctx, 380, 372, 58, 16, '#8d6b4a');
  circle(ctx, 362, 352, 14, '#d62828');
  circle(ctx, 392, 352, 14, '#f4a259');
  if (applied.has('apple-count')) circle(ctx, 377, 336, 14, '#d62828');
  // Plant on the counter — a pink flower blooms when the difference applies.
  rect(ctx, 506, 348, 34, 30, '#c96f4a');
  line(ctx, 523, 348, 523, 306, '#2f7d4f', 4);
  ellipse(ctx, 510, 322, 12, 7, '#3f8f4f');
  ellipse(ctx, 536, 322, 12, 7, '#3f8f4f');
  if (applied.has('plant-flower')) {
    circle(ctx, 523, 300, 8, '#ff8fab');
    circle(ctx, 516, 296, 5, '#ff8fab');
    circle(ctx, 530, 296, 5, '#ff8fab');
    circle(ctx, 523, 306, 5, '#ffb3c1');
  }
  // Cat napping on the counter — present, or gone when the difference applies.
  if (!applied.has('cat')) {
    ellipse(ctx, 122, 362, 34, 16, '#e8b04b');
    circle(ctx, 150, 348, 14, '#e8b04b');
    circle(ctx, 142, 336, 5, '#e8b04b');
    circle(ctx, 154, 336, 5, '#e8b04b');
    line(ctx, 92, 360, 66, 344, '#e8b04b', 7);
    circle(ctx, 154, 346, 2, '#22242e');
  }
  // Seeded tiles on the wall, identical on both panels.
  ctx.strokeStyle = 'rgba(141,107,74,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i += 1) {
    const x = range(rng, 280, 580);
    const y = range(rng, 250, 350);
    ctx.strokeRect(x, y, 14, 14);
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* 3 — Harbour at Dusk                                                 */
/* ------------------------------------------------------------------ */

function drawHarbour(ctx, ox, oy, w, h, applied, seed) {
  const rng = sceneRandom(seed, 3);
  clipPanel(ctx, ox, oy, w, h);
  const sky = ctx.createLinearGradient(0, 0, 0, 310);
  sky.addColorStop(0, '#2b2d5c');
  sky.addColorStop(0.6, '#7a4a7e');
  sky.addColorStop(1, '#e07a5f');
  rect(ctx, 0, 0, w, 310, sky);
  rect(ctx, 0, 300, w, 200, '#274156');
  // Moon and stars; one bright star appears near the moon when it differs.
  circle(ctx, 500, 72, 30, '#f4f1de');
  circle(ctx, 492, 66, 26, '#e9e4c8');
  if (applied.has('star')) {
    line(ctx, 448, 52, 448, 72, '#fff3b0', 3);
    line(ctx, 438, 62, 458, 62, '#fff3b0', 3);
    circle(ctx, 448, 62, 4, '#fff3b0');
  }
  bird(ctx, 300, 82, '#1d2233');
  bird(ctx, 356, 112, '#1d2233');
  if (applied.has('gull')) bird(ctx, 250, 96, '#1d2233');
  // Lighthouse — its beam shines when the difference applies.
  rect(ctx, 76, 150, 52, 180, '#f4f1de');
  rect(ctx, 76, 190, 52, 14, '#c1121f');
  rect(ctx, 76, 240, 52, 14, '#c1121f');
  rect(ctx, 76, 290, 52, 14, '#c1121f');
  rect(ctx, 68, 128, 68, 24, '#3a415c');
  circle(ctx, 102, 140, 10, '#ffd166');
  rect(ctx, 92, 118, 20, 12, '#22242e');
  if (applied.has('beam')) {
    ctx.beginPath();
    ctx.moveTo(136, 140);
    ctx.lineTo(330, 96);
    ctx.lineTo(330, 186);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 209, 102, 0.35)';
    ctx.fill();
  }
  // Pier along the bottom.
  rect(ctx, 0, 428, w, 72, '#6b4423');
  rect(ctx, 0, 428, w, 8, '#8d5a2b');
  for (let x = 20; x < w; x += 90) rect(ctx, x, 436, 10, 56, '#54341c');
  // Crates and lantern on the pier — the lantern glows when it differs.
  rect(ctx, 170, 392, 40, 36, '#a9713f');
  rect(ctx, 212, 404, 34, 24, '#8d5a2b');
  line(ctx, 170, 404, 210, 404, '#7a5230', 2);
  line(ctx, 190, 392, 190, 428, '#7a5230', 2);
  rect(ctx, 146, 400, 16, 28, '#3a415c');
  if (applied.has('lantern')) {
    circle(ctx, 154, 400, 16, 'rgba(255, 209, 102, 0.45)');
    circle(ctx, 154, 400, 6, '#ffd166');
  } else {
    circle(ctx, 154, 400, 6, '#8d99ae');
  }
  // Sailboat — its flag changes colour.
  line(ctx, 300, 300, 300, 380, '#5b4a3a', 5);
  ctx.beginPath();
  ctx.moveTo(300, 300);
  ctx.lineTo(300, 352);
  ctx.lineTo(344, 352);
  ctx.closePath();
  ctx.fillStyle = '#f4f1de';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(300, 300);
  ctx.lineTo(326, 312);
  ctx.lineTo(300, 324);
  ctx.closePath();
  ctx.fillStyle = applied.has('flag') ? '#ffd166' : '#c1121f';
  ctx.fill();
  ellipse(ctx, 306, 382, 46, 10, '#7a5230');
  // Rowboat.
  ellipse(ctx, 470, 430, 40, 9, '#8d5a2b');
  line(ctx, 452, 424, 452, 402, '#5b4a3a', 3);
  // Buoy in the sea — present or gone.
  if (!applied.has('buoy')) {
    ellipse(ctx, 380, 446, 14, 9, '#ef6461');
    rect(ctx, 376, 428, 8, 12, '#ef6461');
  }
  // Fish jumping — present or gone.
  if (applied.has('fish')) {
    ctx.beginPath();
    ctx.moveTo(408, 408);
    ctx.quadraticCurveTo(420, 388, 436, 402);
    ctx.quadraticCurveTo(424, 412, 408, 408);
    ctx.closePath();
    ctx.fillStyle = '#7cc0f0';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(436, 402);
    ctx.lineTo(446, 394);
    ctx.lineTo(446, 410);
    ctx.closePath();
    ctx.fillStyle = '#7cc0f0';
    ctx.fill();
  }
  // Seeded wave lines and stars, identical on both panels.
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 12; i += 1) {
    const x = range(rng, 150, 570);
    const y = range(rng, 320, 420);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 12, y - 4, x + 26, y);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 20; i += 1) {
    const x = range(rng, 180, 580);
    const y = range(rng, 12, 130);
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.restore();
}

/** Every scene: its painter and the hotspots a click can land on. */
export const SCENES = {
  park: {
    draw: drawPark,
    diffs: [
      { id: 'sun-glasses', x: 90, y: 80, r: 48, label: 'The sun put on sunglasses' },
      { id: 'extra-bird', x: 430, y: 95, r: 26, label: 'An extra bird in the sky' },
      { id: 'tulip', x: 158, y: 452, r: 26, label: 'A tulip changed colour' },
      { id: 'apples', x: 470, y: 210, r: 44, label: 'Apples grew on the tree' },
      { id: 'bench-slat', x: 156, y: 392, r: 44, label: 'The bench gained a slat' },
      { id: 'kite-bow', x: 330, y: 232, r: 30, label: 'A bow appeared on the kite tail' },
      { id: 'duck', x: 500, y: 438, r: 32, label: 'A duck swam into the pond' },
    ],
  },
  kitchen: {
    draw: drawKitchen,
    diffs: [
      { id: 'clock-hand', x: 420, y: 96, r: 44, label: 'The clock shows a different time' },
      { id: 'cat', x: 122, y: 355, r: 38, label: 'The cat wandered off' },
      { id: 'steam', x: 150, y: 268, r: 32, label: 'Steam rises from the teapot' },
      { id: 'apple-count', x: 377, y: 336, r: 36, label: 'An apple joined the bowl' },
      { id: 'plant-flower', x: 523, y: 300, r: 28, label: 'A flower bloomed on the plant' },
      { id: 'mug', x: 442, y: 177, r: 28, label: 'A mug changed colour' },
      { id: 'curtain', x: 105, y: 150, r: 42, label: 'The curtain slid across the window' },
    ],
  },
  harbour: {
    draw: drawHarbour,
    diffs: [
      { id: 'beam', x: 200, y: 140, r: 48, label: 'The lighthouse beam switched on' },
      { id: 'flag', x: 313, y: 312, r: 26, label: 'The sailboat flag changed colour' },
      { id: 'gull', x: 250, y: 96, r: 24, label: 'An extra gull in the dusk sky' },
      { id: 'lantern', x: 154, y: 400, r: 28, label: 'The pier lantern lit up' },
      { id: 'fish', x: 424, y: 400, r: 28, label: 'A fish jumped out of the sea' },
      { id: 'star', x: 448, y: 62, r: 22, label: 'A bright star appeared by the moon' },
      { id: 'buoy', x: 380, y: 440, r: 26, label: 'The red buoy drifted away' },
    ],
  },
};

/** The ids of one scene's differences, in a fixed order. */
export function diffIds(sceneId) {
  return SCENES[sceneId].diffs.map((d) => d.id);
}
