"use strict";

(function initRev08Flats(global) {
  const svg = (view, label, body, viewBox = "0 0 240 260") => `
    <svg class="technical-svg" data-view="${view}" role="img" aria-label="${label}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
      <title>${label}</title>
      ${body}
    </svg>`;

  const label = (x, y, text, anchor = "start") =>
    `<text class="flat-label" x="${x}" y="${y}" text-anchor="${anchor}">${text}</text>`;

  const front = () => svg("front", "Front construction flat", `
    <g class="flat-lines" data-panel="front-body" data-construction="set-in" data-sleeve-length="full" data-body-length-cm="70" data-half-chest-cm="59" data-sleeve-cm="58" data-shoulder-cm="19" data-hem-rib-cm="6" data-cuff-rib-cm="6">
      <path d="M58 74 L7 176 L28 198 L62 124 L62 228 L178 228 L178 124 L212 198 L233 176 L182 74 L146 58 Q120 69 94 58 Z"/>
    </g>
    <g class="flat-lines" data-location="neckline"><path d="M94 58 Q120 78 146 58"/></g>
    <g class="flat-lines dashed" data-location="hood-attachment"><path d="M91 61 Q120 84 149 61"/></g>
    <g class="flat-lines" data-panel="front-hood"><path d="M91 62 Q83 34 99 16 Q120 2 141 16 Q157 34 149 62 Q120 79 91 62 Z"/><path d="M99 17 Q120 29 141 17"/></g>
    <g class="flat-lines" data-location="shoulder"><path d="M58 74 L94 58"/><path d="M146 58 L182 74"/></g>
    <g class="flat-lines" data-location="armhole" data-seam-origin="shoulder-point"><path d="M58 74 C61 88 63 106 62 124"/><path d="M182 74 C179 88 177 106 178 124"/></g>
    <g class="flat-lines" data-location="sleeve"><path d="M58 74 L7 176 L28 198 L62 124"/><path d="M182 74 L233 176 L212 198 L178 124"/></g>
    <g class="flat-lines" data-location="side-seam"><path d="M62 124 L62 213"/><path d="M178 124 L178 213"/></g>
    <g class="flat-lines" data-location="cuff"><path d="M7 176 L28 198"/><path d="M212 198 L233 176"/></g>
    <g class="flat-lines" data-location="hem"><path d="M62 228 L178 228"/></g>
    <g class="flat-lines" data-location="rib-boundary"><path d="M62 213 L178 213"/><path d="M14 163 L35 185"/><path d="M205 185 L226 163"/></g>
    ${label(120, 250, "Front view", "middle")}
    ${label(21, 183, "C1", "middle")}
    ${label(120, 223, "C2", "middle")}
  `);

  const back = () => svg("back", "Back construction flat", `
    <g class="flat-lines" data-panel="back-body" data-construction="set-in" data-sleeve-length="full" data-body-length-cm="70" data-half-chest-cm="59" data-sleeve-cm="58" data-shoulder-cm="19" data-hem-rib-cm="6" data-cuff-rib-cm="6">
      <path d="M58 74 L7 176 L28 198 L62 124 L62 228 L178 228 L178 124 L212 198 L233 176 L182 74 L146 58 Q120 63 94 58 Z"/>
    </g>
    <g class="flat-lines" data-location="neckline"><path d="M94 58 Q120 68 146 58"/></g>
    <g class="flat-lines dashed" data-location="hood-attachment"><path d="M91 61 Q120 72 149 61"/></g>
    <g class="flat-lines" data-panel="back-hood"><path d="M86 63 Q86 31 101 17 Q120 6 139 17 Q154 31 154 63 Q120 83 86 63 Z"/><path data-panel="hood-center-gusset" d="M111 12 Q120 8 129 12 L133 68 Q120 74 107 68 Z"/></g>
    <g class="flat-lines" data-location="shoulder"><path d="M58 74 L94 58"/><path d="M146 58 L182 74"/></g>
    <g class="flat-lines" data-location="armhole" data-seam-origin="shoulder-point"><path d="M58 74 C61 88 63 106 62 124"/><path d="M182 74 C179 88 177 106 178 124"/></g>
    <g class="flat-lines" data-location="sleeve"><path d="M58 74 L7 176 L28 198 L62 124"/><path d="M182 74 L233 176 L212 198 L178 124"/></g>
    <g class="flat-lines" data-location="side-seam"><path d="M62 124 L62 213"/><path d="M178 124 L178 213"/></g>
    <g class="flat-lines" data-location="cuff"><path d="M7 176 L28 198"/><path d="M212 198 L233 176"/></g>
    <g class="flat-lines" data-location="hem"><path d="M62 228 L178 228"/></g>
    <g class="flat-lines" data-location="rib-boundary"><path d="M62 213 L178 213"/><path d="M14 163 L35 185"/><path d="M205 185 L226 163"/></g>
    ${label(120, 250, "Back view", "middle")}
    ${label(120, 88, "C3", "middle")}
  `);

  const side = () => svg("side", "Side construction flat", `
    <g class="flat-lines" data-panel="side-body" data-construction="set-in" data-sleeve-length="full" data-body-length-cm="70" data-half-chest-cm="59" data-sleeve-cm="58" data-shoulder-cm="19" data-hem-rib-cm="6" data-cuff-rib-cm="6">
      <path d="M103 60 L142 72 L64 178 L83 196 L134 126 L134 228 L164 228 L164 112 Q165 84 147 65 L134 58 Z"/>
    </g>
    <g class="flat-lines" data-panel="side-hood"><path d="M103 60 Q92 34 105 14 Q132 1 149 23 Q158 43 147 65 Q130 76 103 60 Z"/><path data-panel="hood-side-panel" d="M109 17 Q133 7 147 25 Q154 44 145 61 Q126 70 105 59 Q97 35 109 17 Z"/></g>
    <g class="flat-lines" data-location="shoulder"><path d="M103 60 L142 72"/></g>
    <g class="flat-lines" data-location="armhole" data-seam-origin="shoulder-point"><path d="M142 72 C145 88 143 108 134 126"/></g>
    <g class="flat-lines" data-location="sleeve"><path d="M142 72 L64 178 L83 196 L134 126"/></g>
    <g class="flat-lines" data-location="side-seam"><path d="M134 126 L134 213"/></g>
    <g class="flat-lines" data-location="neckline"><path d="M103 60 Q119 69 134 58"/></g>
    <g class="flat-lines dashed" data-location="hood-attachment"><path d="M101 62 Q119 72 137 60"/></g>
    <g class="flat-lines" data-location="cuff"><path d="M64 178 L83 196"/></g>
    <g class="flat-lines" data-location="rib-boundary"><path d="M134 213 L164 213"/><path d="M73 166 L92 184"/></g>
    <g class="flat-lines" data-location="hem"><path d="M134 228 L164 228"/></g>
    ${label(149, 250, "Side view", "middle")}
    ${label(79, 184, "C1", "middle")}
    ${label(149, 223, "C2", "middle")}
  `);

  const hoodUp = () => svg("hood-up", "Hood-up construction view", `
    <g class="flat-lines" data-panel="hood-up-body"><path d="M73 100 L47 118 L31 200 L209 200 L193 118 L167 100 L151 91 Q120 100 89 91 Z"/></g>
    <g class="flat-lines" data-panel="hood-up-side-left"><path d="M92 96 Q72 69 82 31 Q95 7 116 9 L111 92 Z"/></g>
    <g class="flat-lines" data-panel="hood-up-side-right"><path d="M148 96 Q168 69 158 31 Q145 7 124 9 L129 92 Z"/></g>
    <g class="flat-lines" data-panel="hood-center-gusset"><path d="M116 9 Q120 5 124 9 L129 92 Q120 97 111 92 Z"/></g>
    <g class="flat-lines" data-location="neckline"><path d="M89 91 Q120 107 151 91"/></g>
    <g class="flat-lines dashed" data-location="hood-attachment"><path d="M86 95 Q120 114 154 95"/></g>
    <g class="flat-lines" data-location="shoulder"><path d="M73 100 L89 91"/><path d="M151 91 L167 100"/></g>
    <g class="flat-lines" data-location="armhole"><path d="M73 100 Q58 108 59 132"/><path d="M167 100 Q182 108 181 132"/></g>
    ${label(120, 221, "Hood-up view", "middle")}
    ${label(120, 70, "C4", "middle")}
  `);

  const hoodDown = () => svg("hood-down", "Hood-down construction view", `
    <g class="flat-lines" data-panel="hood-down-body"><path d="M73 82 L47 100 L31 200 L209 200 L193 100 L167 82 L151 73 Q120 81 89 73 Z"/></g>
    <g class="flat-lines" data-panel="hood-down-left"><path d="M70 82 Q84 40 119 35 L116 112 Q87 111 70 82 Z"/></g>
    <g class="flat-lines" data-panel="hood-down-right"><path d="M170 82 Q156 40 121 35 L124 112 Q153 111 170 82 Z"/></g>
    <g class="flat-lines" data-panel="hood-center-gusset"><path d="M119 35 Q120 33 121 35 L124 112 Q120 116 116 112 Z"/></g>
    <g class="flat-lines" data-location="neckline"><path d="M89 73 Q120 88 151 73"/></g>
    <g class="flat-lines dashed" data-location="hood-attachment"><path d="M86 77 Q120 94 154 77"/></g>
    <g class="flat-lines" data-location="shoulder"><path d="M73 82 L89 73"/><path d="M151 73 L167 82"/></g>
    <g class="flat-lines" data-location="armhole"><path d="M73 82 Q58 91 59 115"/><path d="M167 82 Q182 91 181 115"/></g>
    ${label(120, 221, "Hood-down view", "middle")}
    ${label(120, 127, "C5", "middle")}
  `);

  global.REV08_FLATS = { front, back, side, hoodUp, hoodDown };
})(window);
