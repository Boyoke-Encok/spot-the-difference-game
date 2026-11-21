# spot-the-difference-game

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Boyoke-Encok/spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Boyoke-Encok/spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Spot the Difference — Three Little Worlds: a cozy hidden-difference hunt in the browser. Two near-identical hand-drawn pictures side by side, seven sneaky differences in each of three original scenes (Sunny Park, Cozy Kitchen, Harbour at Dusk), a ticking clock, hints that cost time, and a satisfying ring on every find. Pure static HTML/JS — no build step, no network, no libraries.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 and click the differences — on either picture, it counts on both. Keys: H hint (−10s), P pause, M mute, Space start / continue.

## How it plays

- 3 scenes × 7 differences = 21 finds, with a shorter clock on each harder scene.
- Found differences get a green ring on both panels; the header counts "Found n/7 · n left".
- Wrong clicks cost 5 seconds; hints pulse a ring around one unfound difference for 10 seconds.
- Synthesised WebAudio chimes (no audio files); best score kept in the browser.

---

<sub>Entered on [make.fun](https://make.fun/?ref=m2s4yyfj&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
