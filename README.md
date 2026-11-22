# Pump Explainer

A 1080 × 1920, 30 fps Remotion video about pressure-tank short-cycling. The
composition reads its runtime and narration from `public/voiceover.mp3`, then
divides the audio evenly across six animated scenes.

## Run

1. Add the narration file at `public/voiceover.mp3`.
2. Install dependencies with `npm install`.
3. Preview with `npm run dev`, or render with `npm run build`.

The render command writes `out/pump-explainer.mp4`. The narration audio is
required for the composition metadata and render.