const BEEP_FREQUENCIES = [880, 988, 880];
const BEEP_DURATION_S = 0.18;
const BEEP_GAP_S = 0.14;
const PATTERN_PERIOD_MS = 2200;
const MAX_RING_MS = 60000;
const BEEP_GAIN = 0.25;

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    audioContext ??= new AudioContext();
    return audioContext;
  } catch {
    return null;
  }
}

export function unlockAlarmSound(): void {
  void getContext()?.resume();
}

function playPattern(context: AudioContext): void {
  BEEP_FREQUENCIES.forEach((frequency, index) => {
    const start = context.currentTime + index * (BEEP_DURATION_S + BEEP_GAP_S);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(BEEP_GAIN, start + 0.02);
    gain.gain.linearRampToValueAtTime(0, start + BEEP_DURATION_S);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + BEEP_DURATION_S + 0.02);
  });
}

export function startAlarmSound(): () => void {
  const context = getContext();
  if (!context) return () => undefined;
  void context.resume();
  const play = () => playPattern(context);
  play();
  const interval = window.setInterval(play, PATTERN_PERIOD_MS);
  const timeout = window.setTimeout(() => window.clearInterval(interval), MAX_RING_MS);
  return () => {
    window.clearInterval(interval);
    window.clearTimeout(timeout);
  };
}
