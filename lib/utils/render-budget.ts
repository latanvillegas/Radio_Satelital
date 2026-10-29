/** Limits decorative animation. Audio playback itself is never throttled. */
export function visualizerFrameInterval({ saveData, mobile }: { saveData: boolean; mobile: boolean }): number {
  return saveData ? 100 : mobile ? 50 : 34
}
