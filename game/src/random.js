// A tiny seeded generator (mulberry32) plus the small helpers scenes use, so every
// decorative scatter — grass tufts, stars, pebbles — lands in the same place on
// every run and on both panels. Nothing in the game uses Math.random().

export function createRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh generator for one scene, so scenes never share a stream. */
export function sceneRandom(seed, salt) {
  return createRandom((seed * 2654435761 + salt * 40503) >>> 0);
}

/** A value in [min, max) from a generator. */
export function range(rng, min, max) {
  return min + rng() * (max - min);
}

/** Pick one item from a list, by the generator. */
export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}
