// Spot the Difference entry (Node 22, standard library only): the game is this
// directory's game/ folder — plain static files a desktop browser loads offline
// (game/index.html and its ES modules, no library, no network request) — and
// this program hands it in. It copies game/ and screenshots/ from beside this
// file to /output and writes /output/dossier.json, the summary the judge reads,
// with the vendored make.fun library.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of
// game files, in all, or a path under game/ over 1000 bytes: game/ counts
// beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

// The game is static files, so the entry is useless without its entrypoint:
// refuse to ship if game/index.html did not survive the copy, and report a
// deterministic summary (file count + total bytes) so two runs can be compared
// byte-for-byte instead of trusting silence.
const gameDir = join(out, 'game');
if (!existsSync(join(gameDir, 'index.html'))) {
  throw new Error('game/index.html is missing from /output/game');
}
let gameFiles = 0;
let gameBytes = 0;
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else { gameFiles += 1; gameBytes += statSync(p).size; }
  }
};
walk(gameDir);
console.log(`game OK: ${gameFiles} files, ${gameBytes} bytes, entrypoint game/index.html present`);

// Validate what we just wrote: the judge reads dossier.json, so a missing
// key or an over-cap screenshot must fail loudly here instead of shipping a
// broken entry. Re-read the file from disk (not the in-memory string) so a
// truncated or partial write is caught too.
const dossier = JSON.parse(readFileSync(join(out, 'dossier.json'), 'utf8'));
for (const key of ['cover', 'images', 'schema', 'text']) {
  if (!(key in dossier)) throw new Error(`dossier.json is missing required key: ${key}`);
}
const shotDir = join(out, 'screenshots');
const shotFiles = existsSync(shotDir) ? readdirSync(shotDir) : [];
if (shotFiles.length === 0) throw new Error('no screenshots were copied to /output/screenshots');
for (const name of shotFiles) {
  const bytes = statSync(join(shotDir, name)).size;
  if (bytes > 262144) throw new Error(`screenshot ${name} is ${bytes} bytes, over the 256 KiB cap`);
}
console.log(`dossier OK: keys cover/images/schema/text, ${shotFiles.length} screenshots, ${statSync(join(out, 'dossier.json')).size} bytes`);
