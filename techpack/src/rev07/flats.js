"use strict";

(function initRev07Flats(global) {
  const svg = (view, label, body, viewBox = "0 0 240 260") => `
    <svg class="technical-svg" data-view="${view}" role="img" aria-label="${label}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
      <title>${label}</title>
      ${body}
    </svg>`;

  const label = (x, y, text, anchor = "start") =>
    `<text class="flat-label" x="${x}" y="${y}" text-anchor="${anchor}">${text}</text>`;

  const front = () => svg("front", "Front construction flat", `
    <g class="flat-lines" data-panel="front-body">
      <path d="M76 66 L54 77 L24 126 L45 139 L66 106 L66 216 L174 216 L174 106 L195 139 L216 126 L186 77 L164 66 L146 58 Q120 69 94 58 Z"/>
    </g>
    <g class="flat-lines" data-location="neckline"><path d="M94 58 Q120 78 146 58"/></g>
    <g class="flat-lines dashed" data-location="hood-attachment"><path d="M91 61 Q120 84 149 61"/></g>
    <g class="flat-lines" data-panel="front-hood"><path d="M91 62 Q83 34 99 16 Q120 2 141 16 Q157 34 149 62 Q120 79 91 62 Z"/><path d="M99 17 Q120 29 141 17"/></g>
    <g class="flat-lines" data-location="shoulder"><path d="M76 66 L94 58"/><path d="M146 58 L164 66"/></g>
    <g class="flat-lines" data-location="armhole"><path d="M76 66 Q61 79 66 106"/><path d="M164 66 Q179 79 174 106"/></g>
    <g class="flat-lines" data-location="sleeve"><path d="M54 77 L24 126 L45 139 L66 106"/><path d="M186 77 L216 126 L195 139 L174 106"/></g>
    <g class="flat-lines" data-location="side-seam"><path d="M66 106 L66 197"/><path d="M174 106 L174 197"/></g>
    <g class="flat-lines" data-location="cuff"><path d="M24 126 L45 139"/><path d="M27 121 L48 134"/></g>
    <g class="flat-lines" data-location="hem"><path d="M66 216 L174 216"/></g>
    <g class="flat-lines" data-location="rib-boundary"><path d="M66 197 L174 197"/><path d="M27 121 L48 134"/><path d="M192 134 L213 121"/></g>
    ${label(120, 237, "Front view", "middle")}
    ${label(11, 153, "Cuff rib")}
    ${label(120, 211, "Hem rib", "middle")}
  `);

  const back = () => svg("back", "Back construction flat", `
    <g class="flat-lines" data-panel="back-body">
      <path d="M76 66 L54 77 L24 126 L45 139 L66 106 L66 216 L174 216 L174 106 L195 139 L216 126 L186 77 L164 66 L146 58 Q120 63 94 58 Z"/>
    </g>
    <g class="flat-lines" data-location="neckline"><path d="M94 58 Q120 68 146 58"/></g>
    <g class="flat-lines dashed" data-location="hood-attachment"><path d="M91 61 Q120 72 149 61"/></g>
    <g class="flat-lines" data-panel="back-hood"><path d="M86 63 Q86 31 101 17 Q120 6 139 17 Q154 31 154 63 Q120 83 86 63 Z"/><path data-panel="hood-center-gusset" d="M111 12 Q120 8 129 12 L133 68 Q120 74 107 68 Z"/></g>
    <g class="flat-lines" data-location="shoulder"><path d="M76 66 L94 58"/><path d="M146 58 L164 66"/></g>
    <g class="flat-lines" data-location="armhole"><path d="M76 66 Q61 79 66 106"/><path d="M164 66 Q179 79 174 106"/></g>
    <g class="flat-lines" data-location="sleeve"><path d="M54 77 L24 126 L45 139 L66 106"/><path d="M186 77 L216 126 L195 139 L174 106"/></g>
    <g class="flat-lines" data-location="side-seam"><path d="M66 106 L66 197"/><path d="M174 106 L174 197"/></g>
    <g class="flat-lines" data-location="cuff"><path d="M24 126 L45 139"/><path d="M195 139 L216 126"/></g>
    <g class="flat-lines" data-location="hem"><path d="M66 216 L174 216"/></g>
    <g class="flat-lines" data-location="rib-boundary"><path d="M66 197 L174 197"/><path d="M27 121 L48 134"/><path d="M192 134 L213 121"/></g>
    ${label(120, 237, "Back view", "middle")}
    ${label(120, 88, "Center gusset", "middle")}
  `);

  const side = () => svg("side", "Side construction flat", `
    <g class="flat-lines" data-panel="side-body">
      <path d="M103 59 Q91 67 91 83 L81 100 L65 145 L84 154 L99 119 L99 216 L157 216 L160 104 Q164 78 147 64 L134 58 Z"/>
    </g>
    <g class="flat-lines" data-panel="side-hood"><path d="M103 60 Q92 34 105 14 Q132 1 149 23 Q158 43 147 65 Q130 76 103 60 Z"/><path data-panel="hood-side-panel" d="M109 17 Q133 7 147 25 Q154 44 145 61 Q126 70 105 59 Q97 35 109 17 Z"/></g>
    <g class="flat-lines" data-location="shoulder"><path d="M103 60 L134 58"/></g>
    <g class="flat-lines" data-location="armhole"><path d="M134 58 Q164 73 160 104"/></g>
    <g class="flat-lines" data-location="sleeve"><path d="M91 83 L65 145 L84 154 L99 119"/></g>
    <g class="flat-lines" data-location="side-seam"><path d="M99 119 L99 197"/></g>
    <g class="flat-lines" data-location="neckline"><path d="M103 60 Q119 69 134 58"/></g>
    <g class="flat-lines dashed" data-location="hood-attachment"><path d="M101 62 Q119 72 137 60"/></g>
    <g class="flat-lines" data-location="cuff"><path d="M65 145 L84 154"/><path d="M68 139 L87 148"/></g>
    <g class="flat-lines" data-location="rib-boundary"><path d="M99 197 L158 197"/><path d="M68 139 L87 148"/></g>
    <g class="flat-lines" data-location="hem"><path d="M99 216 L157 216"/></g>
    ${label(125, 237, "Side view", "middle")}
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
    ${label(120, 70, "Three panels", "middle")}
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
    ${label(120, 127, "Attachment line", "middle")}
  `);

  global.REV07_FLATS = { front, back, side, hoodUp, hoodDown };
})(window);
