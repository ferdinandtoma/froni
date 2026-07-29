/*
 * Froni FRN-001 Tech Pack - single source of content truth.
 * Layout code (techpack.html) renders exclusively from this object.
 * Editing content must never require touching layout code.
 * NOTE: no em dash characters anywhere in this file. Hyphens or commas only.
 */
window.TECHPACK_CONFIG = {
  meta: {
    docId: "FRN-001",
    revision: "06",
    outFile: "Froni_FRN-001_Tech_Pack_Rev06.pdf",
  },

  // Contact for the order. Email/phone render as [email]/[phone] placeholders
  // when unset, and the build warns. Set before sending to the factory.
  contact: {
    name: "Ferdinand Toma",
    email: "",
    phone: "",
  },

  // Width/height of the back icon artwork. The build measures this from the
  // artwork image in ./reference/ when present and overrides it at render
  // time; this value is the fallback when no artwork is found.
  iconAspect: 0.90,

  // Marigold is used ONLY for the theonym and where the budget table names
  // gold. The document otherwise stays monochrome + red dims + blue marks.
  palette: {
    marigold: "#C9A227",
  },

  header: {
    brand: "FRONI",
    brandSub: "TECH PACK",
    // 4 columns x 3 rows, label/value pairs. Cells wrap, never truncate.
    grid: [
      [
        { label: "Cliente/Client", value: "Froni" },
        { label: "Ref.", value: "FRN-001" },
        { label: "Modelo/Garment", value: "Drop shoulder pullover hoodie" },
      ],
      [
        { label: "Data/Date", value: "07 Jul 2026" },
        { label: "Cor/Color", value: "Black (reactive dyed)" },
        { label: "Fit", value: "Relaxed" },
      ],
      [
        { label: "Molde/Pattern", value: "Personalizado-Custom" },
        { label: "Fabric", value: "100% combed ring-spun cotton, 3-end loopback French terry, unbrushed" },
        { label: "GSM", value: "420-450" },
      ],
      [
        { label: "Revisao/Revision", value: "06" },
        { label: "Page", value: "{PAGE}" }, // {PAGE} replaced at render with NN/NN
        { label: "Prepared by", value: "Ferdinand Toma" },
      ],
    ],
  },

  footer: {
    left: "FRONI FRN-001 Rev 06 Confidential",
    right: "All measurements in cm unless stated",
  },

  // Points of measure. Values in cm, order S / M / L / XL.
  // The SVG flats derive ALL proportions from the size M column of this table.
  pom: {
    sizes: ["S", "M", "L", "XL"],
    extraCols: ["Sample(PPS)", "Pre-boarding"],
    rows: [
      { letter: "A", name: "Body length",              values: [68, 70, 72, 74] },
      { letter: "B", name: "Chest 1 cm below armhole", values: [57, 59, 61, 63] },
      { letter: "C", name: "Armhole",                  values: [24, 25, 26, 27] },
      { letter: "D", name: "Cuff opening",             values: [8, 8, 8.5, 9] },
      { letter: "E", name: "Sleeve length",            values: [57, 58, 59, 60] },
      { letter: "F", name: "Shoulder",                 values: [18, 19, 20, 21] },
      { letter: "G", name: "Neck opening",             values: [26, 26, 26, 26] },
      { letter: "H", name: "Bottom width",             values: [49, 51, 53, 55] },
      { letter: "I", name: "Bottom hem rib height",    values: [6, 6, 6, 6] },
      { letter: "J", name: "Cuff rib length",          values: [6, 6, 6, 6] },
      { letter: "K", name: "Hood length",              values: [38, 38, 38, 38] },
      { letter: "L", name: "Hood width",               values: [26.5, 26.5, 26.5, 26.5] },
      { letter: "M", name: "Hood gusset width",        values: [10, 10, 10, 10] },
    ],
    baseSize: "M", // flats derive from this column
    note: [
      "All values are TARGETS for the first fit sample, tolerance +/-1 cm.",
      "Final chart locked from approved fit-sample flat measurements.",
      "No pocket, no drawcord, no hardware.",
      "Hood is double-layer, three-panel (two side panels + center gusset). Measurements refer to the outer shell.",
      "Indicative size curve for quoting: S 30, M 52, L 45, XL 23 of 150. Final split at order placement.",
      "Note: all measurements are cm.",
    ],
  },

  // Flat drawing parameters not present as POM rows.
  flat: {
    dropShoulderCm: 5,
    sleeveAngleDeg: 36,
    shoulderSlopeDeg: 20,
    hoodThreePanel: true,
    gussetWidthCm: 10,
  },

  // Artwork placement dimensions (cm), consumed by the SVG overlay layer.
  placements: {
    backIcon: {
      haloApexBelowCollarCm: 12,
      windowText: "accepted window 11-13 cm",
      iconHeightSmCm: 46,
      iconHeightLxlText: "approx. 48-50 cm",
      drapeRule: "Drape rule: the hood drape may clip the halo, never the brow. Verified against actual drape on the physical fit sample.",
      boxTitle: "NEEDLE-PAINTED ICON",
      // {W} is replaced at render with round(iconHeightSmCm x iconAspect)
      widthLabel: "width per final artwork, approx. {W} cm at S/M",
      boxFooter: "centered on center back",
    },
    frontField: {
      label: "EDGE TO EDGE EMBROIDERY FIELD",
      panelText: "L panel approx. 58-60 x 68-72 cm",
      panelWidthLabel: "58-60 cm",   // L panel width, for the page-4 dim arrow
      panelHeightLabel: "68-72 cm",  // L panel height, for the page-4 dim arrow
      insetCm: 1.5, // drawn inset from panel silhouette
    },
  },

  // Internal rule (not rendered): these are the only two text placements on
  // the garment. Do not add sleeve placements.
  texts: {
    hood_interior_verse: {
      title: "HOOD INTERIOR LETTERING",
      language: "English",
      // The full repeating unit, verse and citation together, hyphen and
      // spacing verbatim. Rendered mixed case exactly as written, never
      // transformed to caps. Band lettering renders in true italic.
      unit: "Fear not, for I am with you - Isaiah 41:10",
      specLines: [
        "Inner shell layer. Stitch backside hidden between the two hood layers.",
        "Italic lettering per final artwork.",
        "X-height 7 mm minimum absolute, identical on every garment size.",
        "Italic apertures checked at strike-off. Escalates to 8-9 mm if counters close on production cloth.",
        "Repeating unit includes the citation. 2-3 repeats expected, digitizer maximizes clean fit.",
        "5-8k stitches.",
        "One file, fixed lettering size, variable repeat.",
        "Exact position inked at fit-sample stage.",
      ],
    },
    hood_exterior_theonym: {
      title: "HOOD EXTERIOR LETTERING",
      placement: "Hood exterior, center gusset panel. Three letters stacked upright, reading top to bottom, centered on the gusset. Marigold gold. Letterform (uncial omega) and letter height per final artwork package.",
      language: "Greek",
      string: "Ο ΩΝ", // Ο ΩΝ
      drawingNote: "Standard Greek capitals shown. Uncial omega per final artwork package.",
      files: "One file, fixed size on all garments.",
    },
  },

  // Stitch budgets, embroidery gates, file counts.
  embroidery: {
    backBudget: {
      title: "STITCH BUDGET S/M",
      rows: [
        { zone: "Face and hands, layered needle painting", value: "40-50k" },
        { zone: "Hair and beard, directional satin", value: "12-16k" },
        { zone: "Robe, medium fill", value: "50-65k" },
        { zone: "Halo and Gospel book, radiating satin, marigold gold", value: "26-34k" },
        { zone: "Edge feathering and details", value: "6-10k" },
        { zone: "Back total", value: "approx. 145-185k" },
        { zone: "Hard cap", value: "180k S/M, 200k L/XL" },
      ],
    },
    filePackage: [
      { item: "Graded fronts, one per size", count: 4 },
      { item: "Graded backs, regenerated per size group, S/M at 46 cm, L/XL at approx. 48-50 cm", count: 2 },
      { item: "Hood interior verse file", count: 1 },
      { item: "Hood exterior lettering file", count: 1 },
    ],
    filePackageTerms: [
      "Editable native Wilcom .EMB masters plus all graded production outputs are delivered to and remain the property of the client, condition of the order.",
      "One remote tuning round with the digitizer after the first strike-off on production cloth is included.",
    ],
    costClauses: [
      "Strike-offs repeated due to embroidery execution faults are at manufacturer's cost.",
      "Digitizing fee includes revisions until approved production sew-out on final fabric.",
    ],
  },

  // ---------------------------------------------------------------- pages --
  pages: [
    {
      type: "colorway",
      title: "COLORWAY 01 BLACK",
      captions: { front: "FRONT VIEW", back: "BACK VIEW" },
      lists: [
        {
          title: "CONSTRUCTION",
          items: [
            "Relaxed fit, moderate drop shoulder approx. 5 cm",
            "Straight clean set-in sleeve seam, no raglan, no body gussets",
            "Three-panel double-layer self-fabric hood (two side panels + center gusset), both layers shell fabric, no center seam",
            "NO drawcord, NO eyelets, NO aglets, NO hardware anywhere",
            "NO pockets",
            "NO exterior print or applied graphics of any kind",
            "2x2 rib at cuffs and hem, rib contains 2-5% elastane",
            "Standard side seams",
            "Woven neck label plus side-seam fiber-care-origin label",
          ],
        },
        {
          title: "DECORATION",
          items: [
            "All decoration is EMBROIDERY, no screen print anywhere",
            "Back: needle-painted icon (page 03)",
            "Front: tone-on-tone linework, edge to edge (page 04)",
            "Hood: interior lettering + exterior lettering (page 05)",
            "All embroidery on flat panels BEFORE assembly",
          ],
        },
        {
          title: "ORDER CONTEXT",
          items: [
            "Single colorway",
            "Sizes S-XL, 4 sizes",
            "Single production run, approx. 150 units",
            "Per-size quantity split confirmed at order placement",
            "Delivery DAP Germany",
            "Full package: factory sources fabric and trims to spec",
            "Packing: individually polybagged, folded; final packaging spec to follow",
          ],
          // contact line appended by the renderer from config.contact
          contactLine: true,
        },
        {
          title: "ORDER TIMELINE",
          items: [
            "Strike-offs: September 2026",
            "Fit sample: September-October 2026",
            "PPS golden sample: end October 2026",
            "Bulk ex-factory window: 10-20 January 2027",
            "Delivery: DAP Germany by end January 2027",
          ],
        },
      ],
    },

    {
      type: "fabric",
      title: "FABRIC AND MILL REQUIREMENTS",
      specTable: {
        title: "BODY FABRIC",
        rows: [
          { label: "Composition", value: "100% ring-spun COMBED cotton (combed, not carded)" },
          { label: "Knit", value: "3-end loopback French terry, unbrushed interior" },
          { label: "Weight", value: "420-450 gsm, tolerance +/-5%" },
          { label: "Elastane in body", value: "ZERO" },
          { label: "Dye class", value: "REACTIVE dyed black, sulfur black NOT accepted, dye class confirmed in writing" },
          { label: "Finish", value: "Enzyme pre-shrunk, compacted, open-width finished, minimal softener" },
          { label: "Hand", value: "Dry, dense, firm, matte" },
          { label: "Residual shrinkage", value: "Max 5%" },
          { label: "Spirality", value: "Max 5%" },
          { label: "Pilling", value: "ISO 12945-2 grade 4+" },
          { label: "Colorfastness, wash", value: "ISO 105-C06 grade 4-5+" },
          { label: "Colorfastness, rubbing", value: "Dry 4+, wet 3-4+" },
          { label: "Colorfastness, light", value: "4+" },
          { label: "Relaxation", value: "Fabric relaxed min 24h after finishing BEFORE cutting" },
          { label: "Shrinkage control", value: "Fully shrunk before cutting, NO aggressive garment wash after assembly" },
        ],
      },
      ribTable: {
        title: "RIB",
        rows: [
          { label: "Structure", value: "2x2" },
          { label: "Composition", value: "95-98% cotton, 2-5% elastane" },
          { label: "Color", value: "Matched black, same dye class" },
        ],
      },
      noteBox: [
        "Mill performance sheet required with quote.",
        "Brushed swatch of the same cloth requested at sampling as a hand-feel control only.",
      ],
    },

    {
      type: "artworkBack",
      title: "ART-WORK: BACK, EMBROIDERY ONLY",
      caption: "BACK VIEW",
      blocks: [
        {
          title: "PLACEMENT",
          lines: [
            "Halo apex 12 cm below collar seam (accepted window 11-13 cm).",
            "Icon height 46 cm on S/M. L/XL file regenerated at approx. 48-50 cm.",
            "Width follows the final artwork aspect, centered on center back.",
            "Drape rule: the hood drape may clip the halo, never the brow. Verified against actual drape on the physical fit sample.",
          ],
        },
        {
          title: "TECHNIQUE",
          lines: [
            "Hand-directed needle painting, stitch angles follow form.",
            "Automated photo-stitch with uniform parallel scan lines is grounds for strike-off rejection.",
            "Facial features in 60wt, all else 40wt.",
          ],
        },
        { title: "STITCH BUDGET S/M", budgetRef: "backBudget" },
        {
          title: "HOOPING AND STABILIZER",
          lines: [
            "Back panel embroidered in ONE field position. No join is permitted anywhere on the back panel. Factory confirms usable field dimensions of at least artwork size plus 2 cm hooping margin per side before quoting. If usable field width is 45 cm, icon width caps at 43 cm; L/XL height then follows the artwork aspect at that cap.",
            "Localized cutaway upper back only, tapering downward into the drape zone. No full-panel cutaway.",
          ],
        },
        {
          title: "FILES",
          lines: [
            "Two graded backs, regenerated per size group, S/M at 46 cm, L/XL at approx. 48-50 cm.",
            "Regeneration with re-tuned densities. Rescaling not accepted.",
          ],
        },
      ],
      noteBox: [
        "Artwork shown in place at scale. Production artwork files supplied separately. Icon master may be digitized by a nominated external specialist.",
        "An annotated asymmetry map accompanies the artwork. All marked left-right differences are deliberate and must not be corrected.",
      ],
    },

    {
      type: "artworkFront",
      title: "ART-WORK: FRONT, EMBROIDERY ONLY",
      caption: "FRONT VIEW",
      blocks: [
        {
          title: "DESIGN",
          lines: [
            "Tone-on-tone black-on-black ornamental linework, edge to edge.",
            "Line work only. Reveal by texture in raking light.",
          ],
        },
        {
          title: "STITCH",
          lines: [
            "Bean stitch, triple-pass, 2.5 mm, flat.",
            "Chain stitch not accepted.",
            "35-60k stitches.",
          ],
        },
        {
          title: "HOOPING, L PANEL APPROX. 58-60 x 68-72 CM",
          lines: [
            "ACCEPTED: large single-head field, panel sideways, two positions, ONE indexed frame advance, ONE horizontal join. Stitch file contains a routed join corridor where no stitch crosses the split. Registration jog max 1 mm.",
            "NOT ACCEPTED: four-quadrant patchwork. Resizing the design to fit a hoop.",
            "Subcontracting to a local bordados house acceptable, single contract with the factory, same gates apply.",
          ],
        },
        {
          title: "STABILIZER",
          lines: [
            "Tearaway or washaway ONLY.",
            "No cutaway anywhere on the front.",
          ],
        },
        {
          title: "FILES",
          lines: [
            "Four graded fronts, one per size, regenerated to exact panel dimensions.",
          ],
        },
        {
          title: "THREAD",
          lines: [
            "Madeira Frosted Matt 40wt or approved Gunold equivalent.",
            "A/B matte test at strike-off.",
          ],
        },
      ],
    },

    {
      type: "hoodLettering",
      title: "ART-WORK: HOOD LETTERING, EMBROIDERY ONLY",
      backCaption: "BACK VIEW",
      locatorCaption: "LOCATOR, FRONT VIEW",
      locatorLabel: "interior verse band, hidden between hood layers",
      stripLabel: "INTERIOR VERSE BAND, UNROLLED",
      exteriorCallout: "HOOD EXTERIOR LETTERING, marigold",
    },

    {
      type: "labelsCare",
      title: "LABELS AND CARE",
      labelsTable: {
        title: "LABELS",
        rows: [
          { label: "Neck label", value: "Woven christogram mark, artwork vector to follow, no brand text on garment exterior" },
          { label: "Side seam", value: "Fiber content per EU 1007/2011, care symbols, origin" },
          { label: "Fiber", value: "Body 100% cotton, rib 95-98% cotton 2-5% elastane" },
          { label: "Origin", value: "Made in Portugal, stated plainly" },
        ],
      },
      careBox: {
        title: "CARE WORDING, FIXED SPEC",
        lines: [
          "Machine wash 30 C inside out, gentle cycle",
          "Do not tumble dry",
          "Do not bleach",
          "Iron inside out only with pressing cloth",
          "Never iron directly on embroidery",
        ],
      },
    },

    {
      type: "measurements",
      title: "MEASUREMENTS",
    },

    {
      type: "process",
      title: "EMBROIDERY PROCESS, FILES, QC",
      materialsTable: {
        title: "MATERIALS AND SETUP",
        rows: [
          { label: "Thread, all zones", value: "Madeira Frosted Matt 40wt, Gunold equivalent on approval" },
          { label: "Detail", value: "60wt facial features" },
          { label: "Bobbin", value: "60-70wt poly" },
          { label: "Needles", value: "75/11 ballpoint" },
          { label: "Colors", value: "Max 15, single setup, no mid-run rethreading" },
          { label: "Gold", value: "Marigold family from approved palette" },
          { label: "Sequence", value: "All panels embroidered FLAT before assembly, inside cut-make" },
        ],
      },
      strikeOffs: {
        title: "STRIKE-OFFS AND ACCEPTANCE",
        items: [
          "Face strike-off on approx. 400 gsm fleece. Photograph straight-on, split vertically, mirror each half into two composites. If the two composites look like the same face the strike-off is REJECTED.",
          "Matte thread A/B on same swatch, raking light, client selects.",
          "Full-size front strike-off, raking light, join corridor inspected, max 1 mm jog.",
          "Lettering legibility at spec x-height on production cloth, italic apertures open.",
          "Wash protocol: one swatch 25-30 cycles at 40-60 C plus tumble, judged for pucker, fade, thread integrity. One full sample 5 industrial washes before production approval.",
        ],
      },
      pendingBox: {
        title: "PENDING AT THIS REVISION",
        header: "The following are scheduled, not missing.",
        lines: [
          "Production embroidery files: after digitizer commission, August 2026",
          "Front linework production vector: August 2026",
          "Interior verse position: inked at fit sample",
          "Final size chart: locked from approved fit sample",
          "Packaging specification: October 2026",
        ],
      },
    },
  ],
};
