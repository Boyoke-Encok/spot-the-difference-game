// Sounds, synthesised with WebAudio — no audio files, no network. A short
// two-note chime for a find, a low thud for a miss, a soft blip for a hint and
// a little arpeggio when a scene clears. Everything is guarded: if the browser
// has no audio, or the player never interacted, the game simply stays quiet.

export function createSound() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext ?? window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      return null;
    }
    return ctx;
  }

  function tone(freq, start, dur, type, vol) {
    const ac = ensure();
    if (!ac || muted) return;
    try {
      if (ac.state === 'suspended') void ac.resume();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime + start);
      gain.gain.setValueAtTime(0.0001, ac.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(vol, ac.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(ac.currentTime + start);
      osc.stop(ac.currentTime + start + dur + 0.05);
    } catch {
      // Audio is decoration; a failure never stops the game.
    }
  }

  return {
    found() {
      tone(660, 0, 0.16, 'sine', 0.22);
      tone(990, 0.09, 0.22, 'sine', 0.22);
    },
    wrong() {
      tone(140, 0, 0.18, 'triangle', 0.2);
    },
    hint() {
      tone(520, 0, 0.1, 'sine', 0.15);
      tone(780, 0.08, 0.12, 'sine', 0.15);
    },
    clear() {
      tone(523, 0, 0.14, 'sine', 0.2);
      tone(659, 0.12, 0.14, 'sine', 0.2);
      tone(784, 0.24, 0.2, 'sine', 0.2);
      tone(1047, 0.36, 0.3, 'sine', 0.22);
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
  };
}
