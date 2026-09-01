# Front ornament structure pass, working state

31 July 2026; foot calibrated 28 August 2026; foliage rebuilt and canvas composed 31 August 2026. Model work under SoT section 10. Nothing here is approved artwork; the carving photograph governs the drawing, the accepted render governs the curl-back form, renders govern placement and size on the chest.

## What stands

- `vine_rectified.png`: the carving photograph perspective-rectified to the inner frame, 1951 x 2835. Corners fitted by RANSAC on the frame grooves, verified by eye. The calibration ground for all drawing.
- Symmetry axis at x = 965 by left-right correlation.
- `construct_ornament.py`: the generator. One half drawn, mirrored about the axis. Three layers at uniform stroke: armature (black), foliage (blue), incised (red). Border absent. Deterministic: edit parameters, rerun, inspect the overlay.
- `ornament_structure.svg`: current panel-space output. `ornament_composed_40x48.svg`: the same drawing composed onto the 40 x 48 working canvas, 50 px per cm, with the 30 mm join corridor marked.
- `calibration_overlay4.jpg`: the current drawing over the dimmed photograph. `foot_calibration_28Aug2026.jpg`: render foot beside the calibrated foot. (`calibration_overlay2.jpg` and `3` superseded, kept.)

## Foot calibration, 28 Aug 2026

Measured on the accepted render (`Froni_Edition_One_Front_Render.jpg`, 1024 px, axis x ~503): foot volute eyes at +-70 from the axis, y 795; outer band radius ~62 against a core volute of ~45 to 48 and an arm terminal volute of ~45. Wind: counterclockwise, and the carving agrees, verified on the rectified photograph; the 2 Aug construction wound the lyre clockwise and was corrected. The outer runs form no separate outboard spirals in the render; the outermost run wraps the volute as its outer lamina, ~1.28x the volute radius, tucking over the eye; the 2 Aug outboard spirals at +-455 were removed. Arch low point raised from 2745 to 2702 (~1.08 volute radii below the eye, not 1.37).

## Foliage rebuild, 31 Aug 2026

Measured on labeled grids over the rectified photograph, replacing the 2 Aug indicative foliage. The 10 Aug rebuild recorded in the SoT's 24 Aug entry left no surviving artifact on disk or in the repository; this rebuild supersedes that claim from the 2 Aug base.

Palmette, per side: main rib springs at (705, 955), bows through (470, 760) and (225, 415) to the corner tip at (88, 88), small CCW tip curl. Five outboard lobes, cupped, terminal CCW eyes at (105, 295) r52, (140, 480) r45, (172, 618) r40, (208, 748) r35, (128, 930) r55. Two upper inboard lobes with eyes at (250, 148) r48 and (415, 298) r44, then the lanceolate pair flanking the sheaf, springs (330, 530) and (400, 660), tips curling at (610, 700) r26 and (680, 855) r22, twin parallel veins each. One vein per curled lobe.

Chains, per side: chain-top curl at (170, 1400) r90 under the arm volute; outer edge stalk from (160, 2430) rising to it. Two pointed calyx pairs under the arm at tips (452, 1348) and (688, 1352). Three clusters, primary eyes at (505, 1600) r95, (195, 1885) r90, (350, 2120) r85, four cupped blades each, two minor eyes each (nine incised spiral eyes per side in total). Stems link the clusters; the lowest stem runs (432, 2252) to the foot wrap entry at (642, 2392), so the 28 Aug standalone vine curl at (638, 2365) was removed. Two sheath runs flank the shaft, (720, 1380) and (792, 1442) descending to the foot region.

Caveat for the Photopea pass: this is centerline structure at uniform weight; the carved acanthus is far fatter than its centerlines. Blade counts, eye positions and sweep directions are measured; mass and final line spacing are the pass and the digitizing.

## Composition, 31 Aug 2026

`ornament_composed_40x48.svg`: canvas 2000 x 2400 px at 50 px per cm (40 x 48 cm at 1:1). Scale 0.80 panel px per canvas px, centered horizontally, panel y 1520 mapped to canvas mid-height 1200 so the 30 mm corridor (dashed marks, canvas y 1125 to 1275) sits in the clear band under the lower arm volutes with every spiral eye outside it. Crossing the corridor: the shaft (allowed), the sheath runs, the outer stalks, the calyx blade ends and one cluster blade tip, all simple lines a production join can pass through; no eye, volute or curl sits inside it. Ornament on canvas: 43.8 cm tall, 29.3 cm wide. Physical size on the chest locks from the renders and the shop mockup at pack time, not here.

## What remains

1. Ferdinand corrects the structure in Photopea (both SVGs open layered: armature, foliage, incised, canvas-marks).
2. The corrected vector goes to Lee for her own price against the 60,000 stitch plan. She digitizes; she does not redraw.
3. Optional refinement if wanted before the pass: per-element masking for tighter groove fits (the method-note tool), and stroke-weight trials for the bean-stitch line spacing.
4. The vector lands in Rev 13 with the heat press instruction and the stitch-cap reconcile.

## Method note

Scanline groove sampling (dark minima) works on the arms and shaft but is noisy where elements overlap; per-element masking is the next calibration tool. The pipeline is deterministic: edit parameters in the generator, rerun, inspect the overlay.
