/**
 * Shared audio utility — math-synthesized tick for tactile UI feedback.
 * Uses Web Audio API to generate a short, high-frequency click sound.
 */

let audioCtx: AudioContext | null = null;

export function playTick(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(1800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(3600, audioCtx.currentTime + 0.003);

    gain.gain.setValueAtTime(0.010, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.003);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.004);
  } catch {
    // Silently fail if audio is blocked
  }
}
