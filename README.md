# Pump Explainer

A 1080 × 1920, 30 fps Remotion video about pressure-tank short-cycling. The
composition reads its runtime and narration from `public/voiceover.mp3`. Six
scenes begin at 00:00, 00:16, 00:30, 00:46, 01:00, and 01:16; the last scene
runs to the end of the narration. `src/EngineeringVisuals.tsx` contains
frame-driven pump, pressure-tank, pressure-switch, motor, and repair cutaways.
The original hardware images remain unchanged in `public/assets/` and appear
as supporting references beside the animated engineering illustrations.

The tank cutaway models a flexible water bladder with compressed air outside
it. Its normal-cycle animation uses 30 PSI cut-in, 50 PSI cut-out, and identifies
28 PSI as a setup pre-charge measured with the water side drained to zero.
Failure visuals distinguish lost pre-charge from a ruptured bladder. The motor
current and cycle-rate examples are illustrative, not universal specifications.
The repair sequence isolates and verifies power, drains the water side before
air adjustment, and treats a damaged bladder as a tank-replacement condition.

The pump photo is by Elsie esq. (CC BY 2.0; thumbnail sourced via Openverse):
https://www.flickr.com/photos/61132483@N00/4869331575
The pressure-tank photo is by The RedBurn (CC BY-SA 4.0):
https://commons.wikimedia.org/wiki/File:Diaphragm_expansion_tank,_stopcock_and_drain_valve.jpg
The breaker-panel photo is by FuriousYogi (CC BY-SA 4.0):
https://commons.wikimedia.org/wiki/File:Electrical_panel_opened.jpg

License texts: https://creativecommons.org/licenses/by/2.0/ and
https://creativecommons.org/licenses/by-sa/4.0/

Regenerate the pressure-switch and motor renders with
`python3 scripts/generate-hardware-assets.py` (requires Pillow).
This script only regenerates `pressure-switch-gauge.jpg` and
`electric-motor.jpg`; it does not modify the original hardware photographs.

## Run

1. Add the narration file at `public/voiceover.mp3`.
2. Install dependencies with `npm install`.
3. Preview with `npm run dev`, or render with `npm run build`.

The render command writes `out/pump-explainer.mp4`. The narration audio is
required for the composition metadata and render.