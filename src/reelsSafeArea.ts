export const REELS_SAFE_AREA = {
  top: 180,
  bottom: 360,
  left: 72,
  right: 150,
} as const;

export const reelsSafeFrame = {
  position: "absolute" as const,
  top: REELS_SAFE_AREA.top,
  bottom: REELS_SAFE_AREA.bottom,
  left: REELS_SAFE_AREA.left,
  right: REELS_SAFE_AREA.right,
};

export const REELS_SAFE_GUIDE = {
  note:
    "Keep important equipment, gauges, labels, captions, and graphics inside this area to avoid Reels UI overlap.",
};