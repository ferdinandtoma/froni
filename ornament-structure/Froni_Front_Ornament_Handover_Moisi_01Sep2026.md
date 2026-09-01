# Front ornament, artwork pass

Handover for Moisi. 1 September 2026. Everything referenced sits in one folder: `C:\froni\ornament-structure`.

## What this is

Edition One is a black hoodie. Its front carries an ornament taken from a photograph of a carved marble panel: a cross with volute terminals, palmette sprays in the upper quadrants, acanthus chains below, a lyre-shaped foot. It will be embroidered as bean stitch linework, black matte thread on black fleece, so the finished front is literally a line drawing sunk into the cloth, read by shadow, not by color.

The line drawing is the artwork, and it is yours to finish. A machine-built structure pass exists: every line was measured off the photograph and generated from those numbers, so positions, proportions and the overall skeleton are right, but it reads as a wire frame. Your pass turns the skeleton into finished linework with a human hand. After you, Ferdinand approves, then the vector goes to Lee, the embroidery digitizer in the US. She converts supplied artwork into stitches; she does not redraw. What you hand over is what gets stitched.

## The files

| File | What it is |
|---|---|
| `Froni_Editions_One_Front_Vine.jpg` | The canon photograph of the carving, 2808 x 3388. The source of everything. |
| `vine_rectified.png` | The same photograph perspective-corrected to the panel frame, 1951 x 2835. The working ground; every coordinate below refers to it. Draw over this one. |
| `Froni_Edition_One_Front_Render.jpg` | The accepted AI render of the finished hoodie. It is the look target, confident weighted linework, and it governs the foot form. Never trace from it. |
| `ornament_structure.svg` | The current drawing in the photo's coordinates. Three layers: armature (black) is cross, shaft, volutes; foliage (blue) is leaves and stems; incised (red) is spiral eyes and veins. |
| `ornament_composed_40x48.svg` | The same drawing placed on the 40 x 48 cm production sheet, 50 px per cm, with the machine join corridor marked as dashed lines. |
| `calibration_overlay4.jpg` | The drawing stamped over the dimmed photograph. This is how fidelity is checked; anything you produce gets the same treatment. |
| `foot_calibration_28Aug2026.jpg` | The render's foot beside the drawn foot, the basis of the foot construction. |
| `construct_ornament.py` | The generator that produced the current drawing. You do not need it; it exists so any state can be rebuilt and so the measured coordinates are on record. |
| `ORNAMENT_NOTES.md` | The full working record: measurements, what was calibrated when, what remains. |

## Rules that bind the drawing

These are ruled decisions, not suggestions. If one blocks something you want to do, the override is Ferdinand's, not ours.

1. The carving governs the lines. When your eye and the photograph disagree, the photograph wins. The render is reference for weight and confidence only.
2. The panel's border and surrounding fillet are not drawn. The ornament floats free.
3. The foot is settled: with the border gone, every lower run that used to die into the frame closes into a spiral. The volutes wind counterclockwise, the outermost run wraps around the volute as its outer band, tucking over the eye. This form was measured from the accepted render and is already in the file. Refine its curves freely; do not change the form.
4. The output is vector line paths at one uniform width. A bean stitch line is one width by nature and cannot taper or fade. No fills, no gradients, no shading, no tapered brushwork. If you prefer drawing raster over the photo in Photoshop, keep every line a crisp single-width stroke; it will be auto-traced back to vector and overlay-checked afterward.
5. The join corridor on the 40 x 48 sheet, the 30 mm dashed band at mid-height, is where the machine joins two hoopings. Simple lines may cross it; no spiral eye, junction knot or dense detail inside it.
6. The panel is bilaterally symmetric and the current file draws the left half and mirrors it. Work a half or the whole as you prefer; introduce asymmetry only where the source itself has it, which is the open question below.
7. Detail floor: anything finer than about 1 mm at sheet scale will not survive a 2.5 mm bean stitch tripled into 420 gram fleece. Draw for that floor; stone texture and micro-wobble are wasted effort.

## What the pass actually is

The distance between the skeleton and the carving is three things. The carving is ribbon work, every band has two edges and a width, and the skeleton draws each band as a single centerline; where a band reads as a band, give it its two edges, with widths taken from the photograph. The carving's blades are individuals and the skeleton drew them from one formula; let each blade have its own life, from the photo. And the carving flows where the skeleton has construction joins; make lines meet tangentially, the worst offender being the long straight-ish sweep joining the outer stalk to the foot wrap, which should follow the carved scroll body it currently cuts across.

Numbers worth knowing: the skeleton is about 9 meters of line, roughly 11,000 stitches. With doubled ribbon edges the honest inventory lands around 25,000 to 35,000. The working plan says approximately 60,000; treat that as a ceiling, not a target. The count follows the drawing and Lee prices from what she receives.

If you want a head start, an edge-traced layer can be generated for you: the actual groove edges extracted from the photograph as smooth vector curves, to use as scaffolding under your pass. Say so before you start and it will be built; otherwise begin from the SVG and the photo.

## The one open decision

The panel carries real damage: chipping along the top edge and a diagonal fault at upper left. For the back of the hoodie the rule is fixed, damage is reproduced, never repaired. For the front nothing is ruled. Whether the ornament is drawn whole or carries the panel's damage is Ferdinand's call; ask him before you draw near those zones.

## When you are done

Put the final vector in this folder as `Froni_Front_Ornament_Artwork_Rev1` (SVG preferred; layered PSD alongside is welcome). It gets stamped over the photograph for the fidelity check, Ferdinand approves, and it goes to Lee for stitching. Questions of taste are yours and Ferdinand's; questions of rules go to him.
