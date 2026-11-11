const KEY = "xixvi-dial-sound";

let ctx: AudioContext | null = null;
let enabled = false;

export function soundEnabled() {
  if (enabled) return true;
  if (typeof localStorage === "undefined") return false;
  enabled = localStorage.getItem(KEY) === "1";
  return enabled;
}

export function setSoundEnabled(on: boolean) {
  enabled = on;
  localStorage.setItem(KEY, on ? "1" : "0");
  if (on) unlock();
}

function unlock() {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType,
  gainValue: number,
  slideTo?: number,
) {
  if (!soundEnabled()) return;
  const audio = unlock();
  if (!audio || audio.state !== "running") return;
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
  gain.gain.setValueAtTime(gainValue, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playTick() {
  tone(880, 0.045, "triangle", 0.03);
}

export function playPreview() {
  tone(520, 0.16, "sine", 0.04, 740);
}

export function playConfirm() {
  tone(220, 0.22, "sine", 0.05, 140);
}

export function playPower() {
  tone(180, 0.38, "sawtooth", 0.025, 720);
}
