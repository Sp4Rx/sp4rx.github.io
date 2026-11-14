export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// Where one career card sits in the corridor. depth = card index minus scroll position:
// 0 is in focus, positive is still ahead, negative has flown past the camera.
export const cardPose = (depth: number) => ({
  z: -depth * 700, // px, under a 900px perspective
  spread: clamp01(depth), // cards ahead wait off to one side, then slide in
  opacity: depth >= 0 ? clamp01(1 - depth / 3) ** 2 : clamp01(1 + depth / 0.5),
  focused: Math.abs(depth) < 0.5,
});
