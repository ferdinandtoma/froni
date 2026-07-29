# FRN-001 Revision 07 gap audit

Date: 16 July 2026  
Purpose: Internal source audit before building the FRN-001 custom-development technical pack, Revision 07.

## Authorities reviewed

Authority order used for this audit:

1. The user's 16 July 2026 instructions confirming the three files in `C:\froni\reference` as the exact front, back, and exterior hood reference photographs.
2. `C:\Users\tomaf\.codex\attachments\672ca419-b2b7-420f-b75c-6a443eee0277\pasted-text.txt`, the direct Revision 07 task brief supplied for this build.
3. `C:\Users\tomaf\.codex\attachments\ca14d2c7-16b2-472a-b91d-f08561e3fc81\pasted-text.txt`, Froni Source of Truth delta dated 15 July 2026.
4. `C:\froni\docs\Froni_Handover_2026-07-14.md`, Froni handover dated 14 July 2026.
5. `C:\froni\reference\Froni_FRN-001_Tech_Pack_Rev06.pdf`.
6. The Revision 06 generator at `C:\cipher\techpack\build.js`, `config.js`, and `techpack.html`, including its current reference images and placement data.

The July 15 delta and July 14 handover both refer to a Source of Truth dated 13 July 2026. No separate July 13 source document was supplied with this task or found in the Froni project, the tech-pack pipeline, Downloads, Documents, Desktop, OneDrive, or the supplied attachment directories. The direct Revision 07 brief therefore controls this build. An older decision is carried forward only when it is present in Revision 06 or the July 14 handover and is compatible with the direct brief and July 15 delta. This limitation is recorded so no unreviewed July 13 content is silently inferred.

The supplied Revision 06 PDF and `C:\cipher\techpack\dist\Froni_FRN-001_Tech_Pack_Rev06.pdf` are byte-identical. Their SHA-256 is `9B396AAF92C4BACB6A6511A7E0CDAD9B56A8C5858AA1E25653A68A1D658E8C2C`.

The user subsequently supplied `C:\froni\reference\Froni_Edition_One_Front.png` and `C:\froni\reference\pantocratorStCatherines_2023x3774.jpg` as the exact front and back design reference photographs. The front PNG is 500 by 603 pixels with SHA-256 `68AD1490D3502161214FE31EA9041F8C675671DD470AE1B7A581DC6AE81154BB`. The back JPG is 2023 by 3774 pixels with SHA-256 `FBD62B3D21150E672F00701B39DF304A3D5B9EFA648F7BBC95D73FD55AFB427B`. They now control photographic reference. The front PNG remains a raster photograph and does not resolve the missing production-vector requirement.

The user also supplied `C:\froni\reference\Froni_Edition_One_IAM.jpg` as the exact exterior hood embroidery reference photograph. It is 4096 by 4096 pixels with SHA-256 `5D09ADA81A689A51C88149AA5477A1FE5DD51A5B94CF22B7B3D19D838D65C600`. It controls intended visual appearance and confirms the upright `Ο Ω Ν` stack, but it is not editable production letterform artwork.

## 1. Information already present and usable in Revision 06

### Product and material requirements

- Internal product reference FRN-001.
- Relaxed drop-shoulder pullover hoodie with a straight set-in sleeve seam.
- No pocket, drawcord, eyelets, aglets, body gussets, or hardware.
- Three-panel, double-layer, self-fabric hood with two side panels and one center gusset.
- Body fabric: 100% combed ring-spun cotton, three-end unbrushed loopback French terry, 420 to 450 gsm.
- Reactive-dyed black. Sulfur black is not accepted.
- Body fabric has no elastane. Rib is 2x2, 95 to 98% cotton and 2 to 5% elastane.
- Enzyme pre-shrunk, compacted, open-width finished cloth with a dry, dense, firm, matte hand and minimal softener.
- Existing fabric performance limits for shrinkage, spirality, pilling, wash fastness, rubbing fastness, and light fastness.
- Fabric relaxation for at least 24 hours after finishing and before cutting.
- No aggressive garment wash after assembly.

### Existing target measurements

Revision 06 contains target values for sizes S, M, L, and XL for these points:

- A, body length.
- B, chest 1 cm below armhole.
- C, armhole.
- D, cuff opening.
- E, sleeve length.
- F, shoulder.
- G, neck opening.
- H, bottom width.
- I, bottom hem rib height.
- J, cuff rib length.
- K, hood length.
- L, hood width.
- M, hood gusset width.

Revision 06 applies a general development-sample tolerance of plus or minus 1 cm to these retained targets. The values remain usable as first-fit targets, but several measurement methods need factory clarification before they can control a graded production pattern.

### Embroidery requirements and acceptance tests

- All garment decoration is embroidery and is applied to flat panels before assembly.
- Back icon scale: 46 cm high for S and M, with a regenerated larger file for L and XL at approximately 48 to 50 cm, subject to the usable embroidery field.
- Back halo apex target 12 cm below the collar seam, with an accepted 11 to 13 cm window.
- Hood drape may cover the halo but must not cover the brow. This is checked on the physical fit sample.
- The back icon uses one field position. No joined embroidery is accepted on the back panel.
- Front embroidery permits one indexed frame advance and one horizontal routed join. Four-quadrant assembly and resizing to fit a smaller field are not accepted. Registration jog is limited to 1 mm.
- Front temporary stabilizer is tearaway or washaway only. No permanent front cutaway is accepted.
- Back permanent stabilizer is localized cutaway at the upper back, tapered into the drape zone. Full-panel cutaway is not accepted.
- Back face and hand detail uses 60 wt thread. Other embroidery uses 40 wt thread.
- Madeira Frosted Matt or an approved Gunold equivalent is tested for matte appearance on the production cloth.
- Existing stitch planning ranges and hard caps remain useful as digitizer constraints, but the digitizer must reconcile the planning ranges to the hard caps in the submitted stitch plan.
- The mirror-composite face test remains an acceptance test. If the two mirrored sew-out composites read as the same face, the sew-out is rejected.
- The full-size front join corridor, matte thread comparison, hood lettering legibility, wash cycling, and production-cloth strike-off tests remain usable.
- Editable native Wilcom `.EMB` masters and graded production files are delivered to and owned by Froni.
- Embroidery may be subcontracted, but the garment factory remains the single contracting and responsible party to Froni.

### Care and origin content

- Body and rib fibre content statements.
- Plain `Made in Portugal` origin wording.
- Existing care wording covering 30 C gentle washing, no tumble drying, no bleach, inside-out ironing with a pressing cloth, and no direct ironing on embroidery.

## 2. Information missing from Revision 06 but determinable from current Froni decisions

- The quote and production basis is 200 garments.
- No size curve is currently approved. The final size split is supplied at order placement.
- The neck is blank and has no applied label.
- FRONI may appear on the garment only on the legally required printed care, fibre, and origin tape.
- The garment carries four decoration placements only: the front ornamental embroidery, the back Christ Pantocrator embroidery, `Ο Ω Ν` on the exterior hood gusset, and the verse inside the hood.
- The repository front design photograph is the front ornament authority. The ornament remains uninterrupted and the cross remains centered by the current design decision.
- The active contact is Ferdinand Toma at `house@froni.co`. No confirmed telephone number is available and none may be added.
- Revision 07 is a custom-development technical pack for factory feasibility, development pricing, sampling pricing, embroidery setup, lead time, and a provisional 200-unit bulk price.
- The pack must not state that the garment is ready for bulk cutting before factory pattern development, fit-sample approval, final graded-pattern approval, production-fabric approval, embroidery strike-off approval, and PPS approval.
- There is no closing date for the sales window. No new delivery promise or calendar production promise may be introduced.
- The factory must state its earliest committed ex-factory date after approved PPS.
- The required twelve-stage development sequence and approval outputs can be stated from the current brief without garment-engineering invention.
- A construction matrix, bill of materials, responsibility matrix, expanded POM schedule, and factory response form can be created from the stated requirements and responsibility boundaries.
- The required construction-only view inventory is fully determined: front flat, back flat, side flat, hood-up view, hood-down view, exploded three-panel hood, and a double-layer hood cross-section or assembly schematic.
- The technical flats must identify front, back, and hood panel boundaries; rib boundaries; and the shoulder, armhole, sleeve, side-seam, cuff, hem, neckline, and hood-attachment locations. These are schematic line drawings for development review, not cutting patterns.

## 3. Information that must be proposed by the factory

The factory must provide these items before development approval where applicable:

- A feasibility decision on accepting the fully custom cut-and-sew project.
- A first pattern based on the fixed product requirements and retained target measurements.
- Construction engineering for every seam and attachment area, including proposed stitch class, stitches per inch, seam allowance, seam finish, sewing needle system, thread ticket, reinforcement, and any stabilization. These are proposals, not Froni decisions.
- Construction proposals suitable for 420 to 450 gsm unbrushed loopback French terry that preserve a clean exterior.
- Measurement methods where Revision 06 labels are ambiguous, especially the armhole, sleeve, shoulder, cuff opening, and hood measurements.
- Target values for every new pattern-defining POM that has no approved number.
- Production tolerances where none has been decided.
- Front and back neck drops, across-shoulder measurement, half bicep, sleeve widths at defined points, hood face opening, hood depth, hood side-panel geometry, center-gusset geometry, cuff relaxed opening, and hem relaxed width at the first pattern stage.
- Fabric and trim sourcing proposals, supporting mill data, swatches, and approval evidence.
- Neckline stabilization, if the factory considers it necessary.
- The maximum usable embroidery field in centimetres, embroidery machine make, and field configuration.
- Confirmation that embroidery remains under the garment factory's contract and responsibility.
- Physical embroidery strike-offs on proposed production fabric, including the front join test, matte-thread comparison, face test, hood-lettering test, and approval evidence. A subcontract embroidery house may execute them, but the garment factory submits them and remains responsible.
- Development and sample prices, embroidery setup and strike-off charges, provisional bulk price at 200 units, minimums, lead times, payment terms, Incoterm, and shipping estimate to Germany.

## 4. Information finalized only after pattern development or a physical fit sample

- Final front and back neck drops.
- Final across-shoulder, half-bicep, sleeve-width, and armhole measurement methods and values.
- Final hood face opening, hood depth, side-panel shape, center-gusset shape, and hood neckline seam length.
- Final cuff and hem rib pattern dimensions and relaxed openings.
- The approved fit, balance, shoulder position, armhole shape, sleeve pitch, neckline shape, hood volume, and hood drape.
- The exact interior verse position on the inner hood layer.
- The back icon placement under the approved hood drape, including confirmation that the brow remains visible.
- Any required changes to embroidery placement caused by approved pattern geometry.
- Final graded pattern and updated measurement chart.
- Production tolerances not already supported by the retained Revision 06 targets.
- Construction appearance and comfort at the first fit, followed by production-method confirmation at PPS.

## 5. Information supplied later by the embroidery digitizer

- Editable native `.EMB` masters and the graded production machine files.
- Four regenerated front files, one for each approved front-panel pattern.
- Two regenerated back files, one for S and M and one for L and XL, with densities retuned rather than simply scaled.
- One hood interior verse file and one exterior gusset lettering file.
- Stitch sequence, underlay, pull compensation, density, travel routing, trims, color map, and final stitch counts.
- The routed front join corridor and registration method within the fixed one-advance, one-horizontal-join rule.
- Exact digitized letterforms for `Ο Ω Ν` and the hood verse from approved artwork.
- Revised digitizing files and stitch-plan data after the included tuning round and review of the factory's production-cloth strike-offs.
- A final stitch plan that fits the established back hard caps.

The digitizer has not started as of the 15 July source document. Revision 07 must describe these as later deliverables and must not represent them as supplied files.

## 6. Missing source assets that cannot be fabricated

### Found authorities

- Front design reference photograph: `C:\froni\reference\Froni_Edition_One_Front.png`, confirmed by the user.
- Canonical Christ Pantocrator scan: `C:\froni\reference\pantocratorStCatherines_2023x3774.jpg`, confirmed by the user.
- Exterior hood embroidery reference photograph: `C:\froni\reference\Froni_Edition_One_IAM.jpg`, confirmed by the user.

### Missing assets

- The production front-ornament vector is not present in `C:\froni\reference` or `C:\cipher\techpack\reference`. No approved filename or source path has been supplied. Revision 07 must use an explicit production-artwork placeholder and the confirmed front design photograph as the visual authority. It must not trace, reconstruct, or present the photograph as production artwork.
- `C:\froni\reference\Froni_Icon_Mirror_Composites.png` is named in `C:\froni\reference\README.md` but is not present.
- The final approved asymmetry map is not present. `C:\froni\docs\Froni_Icon_Asymmetry_Overlay_Draft.md` is expressly a draft and cannot be presented as an approved production asset.
- Approved production letterform artwork for the exterior `Ο Ω Ν` is not present. The supplied hood photograph is the visual reference, not an editable production file. Revision 07 may show the decided Greek string and placement as a schematic locator, but must identify the production letterform file as pending and must not promote a generic document font into embroidery artwork.
- Approved production lettering artwork for the interior verse is not present. Revision 07 may state and show the decided wording for placement and legibility review, but the digitizer's production lettering file remains pending.
- Final digitized embroidery masters and production outputs do not exist yet.
- Final printed care, fibre, origin, and wordmark tape artwork is not present. Revision 07 may specify its required content and approval stage, but may not fabricate the artwork.

The Revision 06 file `C:\cipher\techpack\reference\front-linework.png` and the former Downloads worn mockup are not active Revision 07 design-source assets. Neither can be treated as the missing production vector.

## Revision 06 conflicts and handling in Revision 07

| Revision 06 issue | Revision 07 handling |
|---|---|
| An active 150-unit quote basis and indicative size curve | Replace with a 200-unit quote basis and state that the final split is supplied at order placement. Do not create a new curve. |
| Applied neck branding and a neck application | Specify a blank neck with no applied label. Put FRONI only on the printed care, fibre, and origin tape. |
| Blank email and telephone placeholders | Use `house@froni.co`; omit a telephone field. |
| Calendar strike-off, sample, ex-factory, and delivery promises | Replace with the development sequence and require the factory's lead times and earliest committed ex-factory date after approved PPS. |
| Front prose says edge to edge while the renderer and placement data show a centered rectangular ornament | Use the confirmed front design reference photograph as the visual authority. Do not state unsupported edge-to-edge panel coverage. Exact production geometry waits for the vector and approved pattern. |
| Back drape prose allows halo coverage while the Revision 06 drawing forces the full halo visible | Retain the measurable rule: the hood may cover the halo but never the brow, checked on the physical fit sample. Treat any styled mockup as non-controlling. |
| The HTML title still identifies an older revision | Update all active Revision 07 metadata, page labels, source constants, and output filenames consistently. |
| Styled composites and artwork share pages with construction information | Separate construction-only vector flats from artwork placement pages. |

## Implementation boundary

Revision 07 may define document structure, responsibility boundaries, proposal requests, approval evidence, and schematic line drawings. It may not define factory pattern geometry, new numeric measurements, stitch engineering, production tolerances, seam allowances, supplier identities, production dates, or missing artwork.
