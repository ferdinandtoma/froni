"use strict";

(function initRev08Diagrams(global) {
  const svg = (view, label, body, viewBox = "0 0 520 270") => `
    <svg class="diagram-svg" data-view="${view}" role="img" aria-label="${label}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
      <title>${label}</title>
      ${body}
    </svg>`;

  const hoodExploded = () => svg("hood-exploded", "Exploded three-panel hood", `
    <defs>
      <marker id="assemblyArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" class="arrow-fill"/>
      </marker>
    </defs>
    <g class="diagram-lines" data-panel="hood-side-left">
      <path d="M24 60 Q56 20 118 28 Q148 52 143 112 Q118 171 40 188 Q12 132 24 60 Z"/>
      <path class="label-leader" d="M83 188 L83 201"/>
      <text x="83" y="214" text-anchor="middle" data-label-position="outside">Left side panel</text>
    </g>
    <g class="diagram-lines" data-panel="hood-center-gusset">
      <path d="M222 24 Q260 15 298 24 L311 205 Q260 218 209 205 Z"/>
      <path class="label-leader" d="M260 207 L260 225"/>
      <text x="260" y="239" text-anchor="middle" data-label-position="outside">Center gusset</text>
    </g>
    <g class="diagram-lines" data-panel="hood-side-right">
      <path d="M496 60 Q464 20 402 28 Q372 52 377 112 Q402 171 480 188 Q508 132 496 60 Z"/>
      <path class="label-leader" d="M437 188 L437 201"/>
      <text x="437" y="214" text-anchor="middle" data-label-position="outside">Right side panel</text>
    </g>
    <g class="assembly-arrows">
      <path d="M152 111 L201 111" marker-end="url(#assemblyArrow)"/>
      <path d="M368 111 L319 111" marker-end="url(#assemblyArrow)"/>
    </g>
    <text class="diagram-note" x="260" y="258" text-anchor="middle">Outer and inner geometry, control points, and notches are derived from the approved pattern</text>
  `);

  const hoodCrossSection = () => svg("hood-cross-section", "Double-layer hood cross-section", `
    <defs>
      <marker id="crossArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" class="arrow-fill"/>
      </marker>
    </defs>
    <g data-layer="outer-self-fabric">
      <path class="layer outer" d="M58 50 Q260 8 462 50 L447 86 Q260 50 73 86 Z"/>
      <path class="label-leader" d="M127 25 L174 42"/>
      <text x="12" y="22" data-label-position="outside">Outer self-fabric layer</text>
    </g>
    <g data-layer="embroidery-zone">
      <path class="layer stitch" d="M179 74 Q260 55 341 74"/>
      <circle class="stitch-dot" cx="206" cy="68" r="2"/><circle class="stitch-dot" cx="233" cy="62" r="2"/><circle class="stitch-dot" cx="260" cy="59" r="2"/><circle class="stitch-dot" cx="287" cy="62" r="2"/><circle class="stitch-dot" cx="314" cy="68" r="2"/>
      <path class="label-leader" d="M260 77 L260 94"/>
      <text x="260" y="108" text-anchor="middle" data-label-position="outside">Embroidery back concealed inside assembly</text>
    </g>
    <g data-layer="inner-self-fabric">
      <path class="layer inner" d="M73 127 Q260 91 447 127 L462 163 Q260 121 58 163 Z"/>
      <path class="label-leader" d="M260 163 L260 178"/>
      <text x="260" y="192" text-anchor="middle" data-label-position="outside">Inner self-fabric layer</text>
    </g>
    <g class="assembly-arrows">
      <path d="M115 91 L115 119" marker-end="url(#crossArrow)"/>
      <path d="M405 91 L405 119" marker-end="url(#crossArrow)"/>
    </g>
    <g class="diagram-lines" data-location="hood-attachment"><path d="M55 214 L465 214"/><path class="label-leader" d="M260 214 L260 226"/><text x="260" y="241" text-anchor="middle" data-label-position="outside">Finished hood assembly attaches to approved neckline seam</text></g>
  `);

  const bodyPom = () => svg("body-pom", "Body and sleeve measurement methods", `
    <defs>
      <marker id="pomArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" class="measure-fill"/>
      </marker>
    </defs>
    <g class="pom-outline"><path d="M186 46 L139 61 L63 119 L84 142 L159 92 L159 231 L361 231 L361 92 L436 142 L457 119 L381 61 L334 46 L306 35 Q260 53 214 35 Z"/><path d="M214 35 Q260 64 306 35"/><path d="M159 204 L361 204"/></g>
    <g class="pom-line" data-pom="A"><path d="M378 44 L378 231" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="389" y="140">A</text></g>
    <g class="pom-line" data-pom="B"><path d="M159 96 L361 96" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="260" y="88" text-anchor="middle">B</text></g>
    <g class="pom-line" data-pom="C"><path d="M180 52 Q151 69 159 92" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="145" y="70">C</text></g>
    <g class="pom-line" data-pom="D"><path d="M63 119 L84 142" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="55" y="142">D</text></g>
    <g class="pom-line" data-pom="E"><path d="M188 49 L72 127" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="119" y="76">E</text></g>
    <g class="pom-line" data-pom="F"><path d="M214 35 L186 46" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="191" y="27">F</text></g>
    <g class="pom-line" data-pom="G"><path d="M214 30 L306 30" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="260" y="20" text-anchor="middle">G</text></g>
    <g class="pom-line" data-pom="H"><path d="M159 239 L361 239" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="260" y="256" text-anchor="middle">H</text></g>
    <g class="pom-line" data-pom="I"><path d="M149 204 L149 231" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="136" y="221">I</text></g>
    <g class="pom-line" data-pom="J"><path d="M69 112 L90 135" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="82" y="109">J</text></g>
    <g class="pom-line new-method" data-pom-method="front-neck-drop"><path d="M205 27 L205 45" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="192" y="19">N1</text></g>
    <g class="pom-line new-method" data-pom-method="back-neck-drop"><path d="M315 27 L315 43" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="323" y="20">N2</text></g>
    <g class="pom-line new-method" data-pom-method="across-shoulder"><path d="M186 43 L334 43" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="260" y="57" text-anchor="middle">N3</text></g>
    <g class="pom-line new-method" data-pom-method="half-bicep"><path d="M369 69 L410 101" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="405" y="72">N4</text></g>
    <g class="pom-line new-method" data-pom-method="sleeve-width-defined-points"><path d="M390 88 L419 111"/><path d="M409 111 L435 131"/><text x="444" y="107">N5</text></g>
    <g class="pom-line new-method" data-pom-method="armhole-measurement-method"><path d="M334 47 Q368 61 361 94" marker-start="url(#pomArrow)" marker-end="url(#pomArrow)"/><text x="372" y="58">N6</text></g>
  `);

  const hoodRibPom = () => svg("hood-rib-pom", "Hood and rib measurement methods", `
    <defs>
      <marker id="hoodPomArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 Z" class="measure-fill"/>
      </marker>
    </defs>
    <g class="pom-outline" data-panel="hood-side-panel"><path d="M57 42 Q122 6 177 30 Q219 73 186 177 Q124 218 59 186 Q29 111 57 42 Z"/></g>
    <g class="pom-outline" data-panel="hood-center-gusset"><path d="M250 30 Q290 20 330 30 L342 197 Q290 210 238 197 Z"/></g>
    <g class="pom-outline" data-panel="rib-samples"><path d="M386 52 L492 52 L492 102 L386 102 Z"/><path d="M374 143 L504 143 L504 205 L374 205 Z"/></g>
    <g class="pom-line" data-pom="K"><path d="M39 36 L39 190" marker-start="url(#hoodPomArrow)" marker-end="url(#hoodPomArrow)"/><text x="25" y="117">K</text></g>
    <g class="pom-line" data-pom="L"><path d="M54 221 L190 221" marker-start="url(#hoodPomArrow)" marker-end="url(#hoodPomArrow)"/><text x="122" y="242" text-anchor="middle">L</text></g>
    <g class="pom-line" data-pom="M"><path d="M244 218 L336 218" marker-start="url(#hoodPomArrow)" marker-end="url(#hoodPomArrow)"/><text x="290" y="240" text-anchor="middle">M</text></g>
    <g class="pom-line new-method" data-pom-method="hood-face-opening"><path d="M64 63 Q34 114 65 171" marker-start="url(#hoodPomArrow)" marker-end="url(#hoodPomArrow)"/><text x="82" y="119">N7</text></g>
    <g class="pom-line new-method" data-pom-method="hood-depth"><path d="M72 111 L186 111" marker-start="url(#hoodPomArrow)" marker-end="url(#hoodPomArrow)"/><text x="129" y="101" text-anchor="middle">N8</text></g>
    <g class="pom-line new-method" data-pom-method="hood-side-panel-geometry"><path d="M57 42 Q122 6 177 30 Q219 73 186 177 Q124 218 59 186 Q29 111 57 42 Z" stroke-dasharray="4 3"/><text x="169" y="25">N9</text></g>
    <g class="pom-line new-method" data-pom-method="center-gusset-geometry"><path d="M250 30 Q290 20 330 30 L342 197 Q290 210 238 197 Z" stroke-dasharray="4 3"/><text x="337" y="27">N10</text></g>
    <g class="pom-line new-method" data-pom-method="hood-neckline-seam-length"><path d="M66 184 Q123 214 183 177" marker-start="url(#hoodPomArrow)" marker-end="url(#hoodPomArrow)"/><text x="146" y="200">N11</text></g>
    <text x="439" y="80" text-anchor="middle">R1</text><text x="439" y="179" text-anchor="middle">R2</text>
    <g class="pom-line new-method" data-pom-method="cuff-rib-width"><path d="M500 52 L500 102" marker-start="url(#hoodPomArrow)" marker-end="url(#hoodPomArrow)"/><text x="495" y="80" text-anchor="end">N12</text></g>
    <g class="pom-line new-method" data-pom-method="cuff-relaxed-opening"><path d="M379 112 L499 112" marker-start="url(#hoodPomArrow)" marker-end="url(#hoodPomArrow)"/><text x="439" y="128" text-anchor="middle">N13</text></g>
    <g class="pom-line new-method" data-pom-method="hem-rib-dimensions"><path d="M366 137 L512 137" marker-start="url(#hoodPomArrow)" marker-end="url(#hoodPomArrow)"/><path d="M512 143 L512 205" marker-start="url(#hoodPomArrow)" marker-end="url(#hoodPomArrow)"/><text x="499" y="176" text-anchor="end">N14</text></g>
    <g class="pom-line new-method" data-pom-method="hem-relaxed-width"><path d="M366 214 L512 214" marker-start="url(#hoodPomArrow)" marker-end="url(#hoodPomArrow)"/><text x="439" y="235" text-anchor="middle">N15</text></g>
  `);

  const placementLocator = (view) => {
    const isFront = view === "front";
    return svg(`${view}-artwork-locator`, `${isFront ? "Front" : "Back"} artwork placement locator`, `
      <g class="locator-outline"><path d="M186 47 L139 63 L69 119 L89 141 L159 94 L159 232 L361 232 L361 94 L431 141 L451 119 L381 63 L334 47 L306 36 Q260 54 214 36 Z"/></g>
      <g class="locator-box" data-artwork-locator="${view}">
        ${isFront
          ? '<rect x="186" y="82" width="148" height="121" rx="3"/><path d="M260 82 L260 203" class="center-guide"/><text x="260" y="139" text-anchor="middle">Production vector pending</text><text x="260" y="156" text-anchor="middle">Cross centered in authority</text>'
          : '<rect x="212" y="70" width="96" height="145" rx="3"/><path d="M260 70 L260 215" class="center-guide"/><text x="260" y="137" text-anchor="middle">Artwork authority scan</text><text x="260" y="154" text-anchor="middle">No back join</text>'}
      </g>
    `);
  };

  global.REV08_DIAGRAMS = {
    hoodExploded,
    hoodCrossSection,
    bodyPom,
    hoodRibPom,
    placementLocator,
  };
})(window);
