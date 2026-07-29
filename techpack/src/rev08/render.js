"use strict";

(function renderRev08(global) {
  const C = global.REV08_CONFIG;
  const F = global.REV08_FLATS;
  const D = global.REV08_DIAGRAMS;
  const A = global.REV08_ASSETS || { manifest: {}, data: {} };

  if (!C || !F || !D) {
    throw new Error("Revision 08 source modules did not load");
  }

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const list = (items, className = "compact-list") =>
    `<ul class="${className}">${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;

  const table = (headers, rows, className = "") => `
    <table class="${className}">
      <thead><tr>${headers.map((header) => `<th>${esc(header)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;

  const specTable = (rows, className = "") =>
    `<table class="spec-table ${className}"><tbody>${rows.map(([key, value]) => `<tr><td>${esc(key)}</td><td>${esc(value)}</td></tr>`).join("")}</tbody></table>`;

  const pageShell = (page, content) => {
    const constructionOnly = ["flatsFrontBack", "flatsViews", "hoodAssembly"].includes(page.type);
    return `
      <section class="page page-${page.number}" data-page-number="${page.number}" data-page-type="${page.type}"${constructionOnly ? ' data-construction-only="true"' : ""}>
        <header class="page-header">
          <div class="doc-kicker">Froni | FRN-001 | ${esc(C.meta.classification)}</div>
          <h1 class="page-title">${esc(page.title)}</h1>
          <div class="header-meta">
            <span>Revision<br><strong>${esc(C.meta.revision)}</strong></span>
            <span>Date<br><strong>${esc(C.meta.buildDate)}</strong></span>
            <span>Page<br><strong>${page.number} / ${C.pages.length}</strong></span>
          </div>
        </header>
        <div class="page-content" data-audit-box="content">${content}</div>
        <footer class="page-footer">
          <span>Froni FRN-001 | Revision 08 | Factory development and quotation</span>
          <span>All measurements in cm unless stated</span>
        </footer>
      </section>`;
  };

  const renderControl = () => `
    <div class="control-grid">
      <div class="stack">
        <section class="card accent">
          <h2>Document control</h2>
          <div class="kv"><span>Document</span><span>${esc(C.meta.documentId)}</span></div>
          <div class="kv"><span>Revision</span><span>${esc(C.meta.revision)}</span></div>
          <div class="kv"><span>Build date</span><span>${esc(C.meta.buildDate)}</span></div>
          <div class="kv"><span>Classification</span><span>${esc(C.meta.classification)}</span></div>
          <div class="kv"><span>Purpose</span><span>Factory feasibility, development pricing, sampling, embroidery setup, lead time, and provisional bulk pricing</span></div>
        </section>
        <section class="card soft">
          <h2>Project contact</h2>
          <div class="kv"><span>Name</span><span>${esc(C.contact.name)}</span></div>
          <div class="kv"><span>Email</span><span>${esc(C.contact.email)}</span></div>
          <div class="kv"><span>Order basis</span><span>${C.order.quantity} garments</span></div>
          <div class="kv"><span>Size split</span><span>${esc(C.order.sizeSplit)}</span></div>
        </section>
      </div>
      <section class="status-panel">
        <h2>Development status</h2>
        <p><strong>${esc(C.developmentStatus)}</strong></p>
        <ol class="number-list">
          ${C.approvalsBeforeBulkCutting.map((item) => `<li>${esc(item)}</li>`).join("")}
        </ol>
        <p style="margin-top:3mm">The factory may use this pack to decide whether to accept the fully custom cut-and-sew development and to quote development, sampling, embroidery setup, lead times, and a provisional bulk unit price.</p>
        <p>${esc(C.order.factoryDateRequest)}</p>
      </section>
      <div class="stack">
        <section class="card">
          <h2>Revision record</h2>
          ${list(C.revisionRecord)}
        </section>
        <section class="card soft">
          <h2>Factory decision required</h2>
          <p>Confirm yes or no on accepting a fully custom cut-and-sew development that includes pattern development, sampling, embroidery coordination, and bulk manufacture under the garment factory's responsibility.</p>
          <p>No stock blank is authorized as the garment basis.</p>
        </section>
      </div>
    </div>`;

  const renderSpecification = () => `
    <div class="three-col" style="height:100%">
      <div class="stack">
        <section class="card accent">
          <h2>Fixed garment specification</h2>
          <div class="kv"><span>Garment</span><span>${esc(C.garment.name)}</span></div>
          <div class="kv"><span>Pattern</span><span>${esc(C.garment.patternBasis)}</span></div>
          <div class="kv"><span>Silhouette</span><span>${esc(C.garment.silhouette)}</span></div>
          <div class="kv"><span>Hood</span><span>${esc(C.garment.hood)}</span></div>
          <div class="kv"><span>Neck</span><span>${esc(C.garment.neck)}</span></div>
          <div class="kv"><span>Colorway</span><span>${esc(C.order.colorway)}</span></div>
        </section>
        <section class="card soft">
          <h2>Excluded features</h2>
          ${list(C.garment.exclusions)}
        </section>
        <section class="card" data-decoration-count="${C.decorations.length}">
          <h2>Four decoration placements</h2>
          <ul class="clean-list">
            ${C.decorations.map((item) => `<li data-decoration-id="${esc(item.id)}"><strong>${esc(item.name)}</strong><br><span style="color:var(--muted)">${esc(item.placement)}</span></li>`).join("")}
          </ul>
        </section>
      </div>
      <section class="card">
        <h2>Body fabric</h2>
        ${specTable(C.materials.body, "dense")}
        <h3 style="margin-top:2mm">Evidence with quotation and sampling</h3>
        ${list(C.materials.evidence)}
      </section>
      <div class="stack">
        <section class="card">
          <h2>Rib</h2>
          ${specTable(C.materials.rib)}
        </section>
        <section class="card">
          <h2>Care wording</h2>
          ${list(C.materials.care)}
        </section>
        <section class="card soft">
          <h2>Printed tape and blank neck</h2>
          ${list(C.materials.tape)}
          <div class="placeholder" data-missing-asset="careTapeArtwork" style="margin-top:2mm"><strong>Production artwork unavailable</strong>Final printed tape artwork has not been supplied.</div>
        </section>
        <section class="card accent">
          <h2>Panel sequence</h2>
          <p>${esc(C.embroidery.sequence)}</p>
        </section>
      </div>
    </div>`;

  const constructionLegend = () => `
    <div class="construction-key" aria-label="Construction line legend">
      <div class="construction-key-row">
        <span class="construction-line-sample solid" aria-hidden="true"></span>
        <strong>Solid construction lines</strong>
        <span class="construction-location" data-visible-location="shoulder">Shoulder</span>
        <span class="construction-location" data-visible-location="armhole">Armhole</span>
        <span class="construction-location" data-visible-location="sleeve">Sleeve / underarm</span>
        <span class="construction-location" data-visible-location="side-seam">Body side seam</span>
        <span class="construction-location" data-visible-location="cuff">Cuff</span>
        <span class="construction-location" data-visible-location="hem">Hem</span>
        <span class="construction-location" data-visible-location="rib-boundary">Rib boundary</span>
        <span class="construction-location" data-visible-location="neckline">Neckline</span>
      </div>
      <div class="construction-key-row">
        <span class="construction-line-sample dashed" aria-hidden="true"></span>
        <strong>Dashed attachment line</strong>
        <span class="construction-location" data-visible-location="hood-attachment">Hood attachment at neckline</span>
      </div>
    </div>`;

  const renderFrontBackFlats = () => `
    <div style="display:grid;grid-template-rows:minmax(0,1fr) auto;height:100%;min-height:0">
      <div class="technical-layout two">
        <figure class="flat-panel" data-audit-box="front-flat">${F.front()}</figure>
        <figure class="flat-panel" data-audit-box="back-flat">${F.back()}</figure>
      </div>
      <div class="flat-footer">
        ${constructionLegend()}
        <div class="flat-callout-key"><strong>Coded callouts:</strong> C1 Cuff rib; C2 Hem rib; C3 Center gusset.</div>
        <p class="flat-note">${esc(C.garment.flatNote)} Construction locations and panel boundaries are identified for factory review.</p>
      </div>
    </div>`;

  const renderViewFlats = () => `
    <div style="display:grid;grid-template-rows:minmax(0,1fr) auto;height:100%;min-height:0">
      <div class="technical-layout three">
        <figure class="flat-panel" data-audit-box="side-flat">${F.side()}</figure>
        <figure class="flat-panel" data-audit-box="hood-up-flat">${F.hoodUp()}</figure>
        <figure class="flat-panel" data-audit-box="hood-down-flat">${F.hoodDown()}</figure>
      </div>
      <div class="flat-footer">
        ${constructionLegend()}
        <div class="flat-callout-key"><strong>Coded callouts:</strong> C1 Cuff rib; C2 Hem rib; C4 Three-panel hood; C5 Hood attachment line.</div>
        <p class="flat-note">${esc(C.garment.flatNote)} Hood volume and drape are finalized from the approved physical fit sample.</p>
      </div>
    </div>`;

  const renderHoodAssembly = () => `
    <div style="display:grid;grid-template-rows:minmax(0,1fr) auto;height:100%;min-height:0">
      <div class="technical-layout two">
        <figure class="diagram-panel" data-audit-box="hood-exploded">
          <h2>Exploded three-panel hood</h2>
          ${D.hoodExploded()}
        </figure>
        <figure class="diagram-panel" data-audit-box="hood-cross-section">
          <h2>Double-layer assembly cross-section</h2>
          ${D.hoodCrossSection()}
        </figure>
      </div>
      <p class="flat-note">${esc(C.garment.flatNote)} Factory proposes seams, allowances, notches, turning sequence, and bulk control before development approval.</p>
    </div>`;

  const renderConstruction = () => `
    <div class="stack" style="height:100%">
      <section class="card soft" data-construction-engineering-baseline="true"><p style="margin:0"><strong>Engineering proposal baseline:</strong> ${esc(C.constructionEngineeringBaseline)}</p></section>
      <table class="matrix micro">
        <thead><tr><th>Construction area</th><th>Fixed client requirement</th><th>Factory engineering proposal required</th><th>Approved at first fit sample</th><th>Approved at pre-production sample</th></tr></thead>
        <tbody>${C.construction.map((row) => `<tr><td><strong>${esc(row.area)}</strong></td><td>${esc(row.fixed)}</td><td>${esc(row.factoryProposal)}</td><td>${esc(row.firstFit)}</td><td>${esc(row.pps)}</td></tr>`).join("")}</tbody>
      </table>
    </div>`;

  const renderBodyPom = () => {
    const headers = ["Code", "Point", "Method", ...C.pom.sizes, "Tolerance"];
    const rows = C.pom.existing.map((row) => [row.code, row.name, row.method, ...row.targets, row.tolerance]);
    return `
      <div class="pom-layout">
        <div class="stack">
          <figure class="diagram-panel" style="flex:1">${D.bodyPom()}</figure>
          <section class="card soft">
            <h2>Method notes</h2>
            <p>Lay the sample flat without stretch. Retained values are first-fit targets. Record actual sample values beside the factory's confirmed method.</p>
            <p><strong>New method key:</strong> ${C.pom.new.slice(0, 6).map((row, index) => `N${index + 1} ${esc(row.name)} (${esc(row.disposition)})`).join("; ")}. No target values are assigned.</p>
            <p>${esc(C.garment.flatNote)}</p>
          </section>
        </div>
        <div class="stack">
          ${table(headers, rows, "pom-table micro")}
          <section class="card accent">
            <p style="margin:0"><strong>Development tolerance:</strong> Every retained A-M target carries +/- 1 cm. Final production control uses the approved graded pattern and measurement chart.</p>
          </section>
        </div>
      </div>`;
  };

  const renderHoodPom = () => {
    const rows = C.pom.new.map((row, index) => [`N${index + 1}`, row.name, row.method, row.disposition]);
    return `
      <div class="pom-layout hood">
        <div class="stack">
          <figure class="diagram-panel" style="flex:1">${D.hoodRibPom()}<figcaption class="diagram-code-key"><strong>Rib key:</strong> R1 Cuff rib; R2 Hem rib.</figcaption></figure>
          <section class="card soft">
            <h2>Retained hood targets</h2>
            <p>K hood length: ${C.pom.existing.find((row) => row.code === "K").targets.join(" / ")}</p>
            <p>L hood width: ${C.pom.existing.find((row) => row.code === "L").targets.join(" / ")}</p>
            <p>M gusset width: ${C.pom.existing.find((row) => row.code === "M").targets.join(" / ")}</p>
            <p style="margin:0">Order: S / M / L / XL. Each retained target uses +/- 1 cm at development sample.</p>
          </section>
          <section class="card">
            <h2>New method key</h2>
            <p style="margin:0">${C.pom.new.slice(6).map((row, index) => `N${index + 7} ${esc(row.name)} (${esc(row.disposition)})`).join("; ")}. No target values are assigned.</p>
          </section>
        </div>
        <div class="stack">
          <section class="card soft"><p style="margin:0"><strong>Schematic map:</strong> N1-N6 are drawn on the body and sleeve schematic on page 7. N7-N15 are drawn on the hood and rib schematic on this page.</p></section>
          ${table(["Key", "Missing pattern-defining point of measurement", "Measurement method", "Value disposition"], rows, "new-pom micro")}
          <section class="card accent">
            <p style="margin:0"><strong>No new target number is authorized.</strong> ${esc(C.pom.missingTolerance)}</p>
          </section>
        </div>
      </div>`;
  };

  const renderBom = () => `
    <div class="stack" style="height:100%">
      <table class="bom-table micro">
        <thead><tr><th>Item</th><th>Fixed specification</th><th>Sourcing party</th><th>Approval evidence required</th><th>Approval stage</th></tr></thead>
        <tbody>${C.bom.map((row) => `<tr><td><strong>${esc(row.item)}</strong></td><td>${esc(row.fixedSpec)}</td><td>${esc(row.sourcingParty)}</td><td>${esc(row.approvalEvidence)}</td><td>${esc(row.approvalStage)}</td></tr>`).join("")}</tbody>
      </table>
      <section class="card soft">
        <p style="margin:0">The polybag and cartons on this page are protective materials for factory shipment only. House presentation components are outside the garment manufacturing bill of materials.</p>
      </section>
    </div>`;

  const assetCard = (key, title) => {
    const item = A.manifest[key] || {};
    const src = A.data[key];
    const copiedFilename = (item.embeddedPath || "").split(/[\\/]/).pop();
    return `
      <section class="authority-card" data-asset-key="${esc(key)}">
        ${src ? `<img class="authority-image" src="${src}" alt="${esc(title)}">` : `<div class="placeholder"><strong>Authority image unavailable</strong>Build input is missing.</div>`}
        <div class="authority-copy">
          <h2>${esc(title)}</h2>
          <p><strong>Role:</strong> ${esc(item.role)}</p>
          <p><strong>Pixels:</strong> ${esc(item.width)} x ${esc(item.height)}</p>
          <p class="source-path"><strong>Authority file:</strong> ${esc(copiedFilename)}</p>
        </div>
      </section>`;
  };

  const renderArtwork = () => {
    const frontLines = [
      C.artwork.front.authority,
      C.artwork.front.placement,
      ...C.artwork.front.stitch,
      ...C.artwork.front.hooping,
      C.artwork.front.stabilizer,
    ];
    const backLines = [
      C.artwork.back.authority,
      ...C.artwork.back.placement,
      ...C.artwork.back.execution,
      C.artwork.back.stabilizer,
    ];
    return `
      <div class="raster-grid">
        <div class="raster-column">
          ${assetCard("frontAuthority", "Front visual authority")}
          <div class="artwork-lower">
            <div class="artwork-top">
              <figure class="diagram-panel">${D.placementLocator("front")}</figure>
              <section class="placeholder" data-missing-asset="frontProductionVector"><strong>Production artwork unavailable</strong>The front ornament vector has not been supplied. Do not trace or reconstruct it from this raster.</section>
            </div>
            <section class="card artwork-spec-card"><h2>Front placement and execution</h2>${list(frontLines, "artwork-list")}</section>
          </div>
        </div>
        <div class="raster-column">
          ${assetCard("backArtworkAuthority", "Saint Catherine's scan")}
          <div class="artwork-lower">
            <div class="artwork-top">
              <figure class="diagram-panel">${D.placementLocator("back")}</figure>
              <div class="stack" style="gap:1.2mm">
                <section class="placeholder" data-missing-asset="mirrorComposite"><strong>Acceptance sheet unavailable</strong>The face mirror-composite sheet is not present. The physical mirror test remains required.</section>
                <section class="placeholder" data-missing-asset="approvedAsymmetryMap"><strong>Approved map unavailable</strong>The final approved back-icon asymmetry map has not been supplied.</section>
              </div>
            </div>
            <section class="card artwork-spec-card"><h2>Back placement and execution</h2>${list(backLines, "artwork-list")}</section>
          </div>
        </div>
      </div>`;
  };

  const renderHoodArtwork = () => `
    <div class="hood-art-grid">
      <div class="stack">
        <section class="card accent">
          <h2>Exterior hood locator and reference</h2>
          <div class="hood-reference-grid" data-asset-key="hoodExteriorReference">
            <div class="greek-locator" lang="el" data-greek-stack="true">
              ${C.artwork.hoodExterior.string.split(/\s+/).map((glyph) => `<span>${esc(glyph)}</span>`).join("")}
            </div>
            <div>
              ${A.data.hoodExteriorReference
                ? `<img class="hood-reference-image" src="${A.data.hoodExteriorReference}" alt="Exterior hood embroidery reference photograph">`
                : `<div class="placeholder"><strong>Reference unavailable</strong>The supplied hood photograph is missing.</div>`}
              <p class="hood-reference-file"><strong>Reference:</strong> ${esc((A.manifest.hoodExteriorReference?.embeddedPath || "").split(/[\\/]/).pop())}</p>
            </div>
          </div>
          <p>${esc(C.artwork.hoodExterior.placement)}</p>
          <p>${esc(C.artwork.hoodExterior.color)}</p>
          <p>${esc(C.artwork.hoodExterior.reference)}</p>
          <p><strong>${esc(C.artwork.hoodExterior.note)}</strong></p>
        </section>
        <section class="placeholder" data-missing-asset="hoodExteriorLettering"><strong>Production artwork unavailable</strong>Approved exterior hood letterform artwork has not been supplied.</section>
        <section class="card">
          <h2>Interior hood locator</h2>
          <div class="hood-reference-grid hood-reference-grid-interior" data-asset-key="hoodInteriorReference">
            <p class="verse-locator">${esc(C.artwork.hoodInterior.unit)}</p>
            <div>
              ${A.data.hoodInteriorReference
                ? `<img class="hood-reference-image" src="${A.data.hoodInteriorReference}" alt="Interior hood verse placement reference photograph">`
                : `<div class="placeholder"><strong>Reference unavailable</strong>The supplied interior hood photograph is missing.</div>`}
              <p class="hood-reference-file"><strong>Reference:</strong> ${esc((A.manifest.hoodInteriorReference?.embeddedPath || "").split(/[\\/]/).pop())}</p>
            </div>
          </div>
          <p>${esc(C.artwork.hoodInterior.placement)}</p>
          ${list(C.artwork.hoodInterior.lettering)}
          <p>${esc(C.artwork.hoodInterior.reference)}</p>
          <p><strong>${esc(C.artwork.hoodInterior.note)}</strong></p>
        </section>
        <section class="placeholder" data-missing-asset="hoodInteriorLettering"><strong>Production artwork unavailable</strong>Approved interior verse production artwork has not been supplied.</section>
      </div>
      <div class="stack">
        <section class="card">
          <h2>Embroidery setup</h2>
          ${specTable(C.embroidery.setup, "dense")}
          <p style="margin-top:2mm"><strong>${esc(C.embroidery.sequence)}</strong></p>
        </section>
        <section class="card">
          <h2>Back stitch plan</h2>
          ${specTable(C.embroidery.backBudget, "dense")}
          <p style="margin-top:2mm">${esc(C.embroidery.budgetNote)}</p>
        </section>
        <section class="card soft">
          <h2>Digitizer file package</h2>
          ${list(C.embroidery.filePackage)}
          <div class="placeholder" data-missing-asset="digitizedMasters" style="margin-top:2mm"><strong>Production files unavailable</strong>Final native masters and graded production outputs have not been supplied.</div>
        </section>
      </div>
      <div class="stack">
        <section class="card accent">
          <h2>Production-cloth acceptance checks</h2>
          ${list(C.embroidery.acceptance, "number-list")}
        </section>
        <section class="card soft">
          <h2>Ownership and responsibility</h2>
          ${list(C.embroidery.ownership)}
        </section>
      </div>
    </div>`;

  const renderResponsibility = () => `
    <table class="responsibility-table dense">
      <thead><tr><th>Scope</th><th>Responsible party</th><th>Required deliverable</th><th>Approval or contract boundary</th></tr></thead>
      <tbody>${C.responsibilities.map((row) => `<tr><td><strong>${esc(row.scope)}</strong></td><td>${esc(row.owner)}</td><td>${esc(row.deliverable)}</td><td>${esc(row.approval)}</td></tr>`).join("")}</tbody>
    </table>`;

  const renderSequence = () => `
    <div class="stage-grid">
      ${C.developmentStages.map((row, index) => `
        <section class="stage-card" data-stage-number="${index + 1}">
          <span class="stage-number">${index + 1}</span>
          <div><h3>${esc(row.stage)}</h3><p><strong>Approval output:</strong> ${esc(row.approvalOutput)}</p></div>
        </section>`).join("")}
    </div>`;

  const responseRow = (text) => `
    <div class="response-row"><span>${esc(text)}</span><span class="response-blank"></span></div>`;

  const renderResponse = () => {
    const fields = C.factoryResponse.slice(1);
    const midpoint = Math.ceil(fields.length / 2);
    return `
      <div class="response-layout">
        <div class="stack">
          <section class="card accent">
            <h2>Factory acceptance</h2>
            <p><strong>${esc(C.factoryResponse[0])}</strong></p>
            <p><span class="choice-box"></span> Yes <span class="choice-box" style="margin-left:8mm"></span> No</p>
            <div class="response-row"><span>Factory legal name</span><span class="response-blank"></span></div>
            <div class="response-row"><span>Authorized respondent</span><span class="response-blank"></span></div>
          </section>
          <section class="card" style="flex:1">
            <h2>Development and price response</h2>
            ${fields.slice(0, midpoint).map(responseRow).join("")}
          </section>
        </div>
        <div class="stack">
          <section class="card" style="flex:1">
            <h2>Capacity, terms, and logistics response</h2>
            ${fields.slice(midpoint).map(responseRow).join("")}
          </section>
          <section class="card soft">
            <p style="margin:0"><strong>Order basis:</strong> ${C.order.quantity} garments. ${esc(C.order.sizeSplit)} No delivery promise is established by this form.</p>
            <div class="signature-grid">
              <div class="signature-line">Authorized signature</div>
              <div class="signature-line">Date</div>
            </div>
          </section>
        </div>
      </div>`;
  };

  const renderers = {
    control: renderControl,
    specification: renderSpecification,
    flatsFrontBack: renderFrontBackFlats,
    flatsViews: renderViewFlats,
    hoodAssembly: renderHoodAssembly,
    construction: renderConstruction,
    pomBody: renderBodyPom,
    pomHood: renderHoodPom,
    bom: renderBom,
    artwork: renderArtwork,
    hoodArtwork: renderHoodArtwork,
    responsibility: renderResponsibility,
    sequence: renderSequence,
    response: renderResponse,
  };

  const documentRoot = document.getElementById("document");
  documentRoot.innerHTML = C.pages.map((page) => pageShell(page, renderers[page.type]())).join("");

  const describe = (element) => {
    const page = element.closest(".page");
    const number = page ? page.dataset.pageNumber : "?";
    const marker = element.getAttribute("data-audit-box") || element.className || element.tagName;
    return `page ${number}: ${marker}`;
  };

  global.__rev08Audit = function rev08Audit() {
    const pages = [...document.querySelectorAll(".page")];
    const overflowFailures = [];
    const safeMarginFailures = [];
    const markerFailures = [];
    const contentFailures = [];
    const auditedElements = [...document.querySelectorAll(".page, .page *")]
      .filter((element) => element instanceof HTMLElement);

    auditedElements.forEach((element) => {
      if (element.clientWidth === 0 || element.clientHeight === 0) return;
      if (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1) {
        overflowFailures.push(`${describe(element)} scroll ${element.scrollWidth}x${element.scrollHeight} exceeds ${element.clientWidth}x${element.clientHeight}`);
      }
    });

    pages.forEach((page) => {
      const pageRect = page.getBoundingClientRect();
      const style = getComputedStyle(page);
      const left = pageRect.left + parseFloat(style.paddingLeft) - 1;
      const right = pageRect.right - parseFloat(style.paddingRight) + 1;
      const top = pageRect.top + parseFloat(style.paddingTop) - 1;
      const bottom = pageRect.bottom - parseFloat(style.paddingBottom) + 1;
      page.querySelectorAll("*").forEach((element) => {
        if (!(element instanceof HTMLElement)) return;
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        if (rect.left < left || rect.right > right || rect.top < top || rect.bottom > bottom) {
          safeMarginFailures.push(`${describe(element)} crosses the safe print margin`);
        }
      });
    });

    if (pages.length !== C.pages.length) contentFailures.push(`expected ${C.pages.length} pages, found ${pages.length}`);
    if (document.querySelectorAll("[data-decoration-id]").length !== 4) contentFailures.push("decoration marker count is not four");

    const expectedViews = ["front", "back", "side", "hood-up", "hood-down", "hood-exploded", "hood-cross-section"];
    const foundViews = new Set([...document.querySelectorAll("[data-view]")].map((element) => element.dataset.view));
    expectedViews.forEach((view) => {
      if (!foundViews.has(view)) markerFailures.push(`missing required view marker: ${view}`);
      const element = document.querySelector(`[data-view='${view}']`);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) markerFailures.push(`required view has zero size: ${view}`);
      }
    });

    const expectedLocations = ["rib-boundary", "shoulder", "armhole", "sleeve", "side-seam", "cuff", "hem", "neckline", "hood-attachment"];
    const foundLocations = new Set([...document.querySelectorAll("[data-location]")].map((element) => element.dataset.location));
    expectedLocations.forEach((location) => {
      if (!foundLocations.has(location)) markerFailures.push(`missing construction marker: ${location}`);
    });

    const expectedPanels = ["front-body", "back-body", "hood-center-gusset", "hood-side-left", "hood-side-right"];
    const foundPanels = new Set([...document.querySelectorAll("[data-panel]")].map((element) => element.dataset.panel));
    expectedPanels.forEach((panel) => {
      if (!foundPanels.has(panel)) markerFailures.push(`missing panel marker: ${panel}`);
    });

    document.querySelectorAll("[data-construction-only='true']").forEach((page) => {
      if (page.querySelector("img, image")) contentFailures.push(`page ${page.dataset.pageNumber} contains a raster in a construction-only view`);
    });

    const requiredMissing = ["frontProductionVector", "mirrorComposite", "hoodExteriorLettering", "hoodInteriorLettering", "approvedAsymmetryMap", "careTapeArtwork", "digitizedMasters"];
    requiredMissing.forEach((key) => {
      if (!document.querySelector(`[data-missing-asset='${key}']`)) markerFailures.push(`missing production-artwork placeholder: ${key}`);
    });

    const bodyText = document.body.innerText;
    const registerFragments = [
      ["can", "onical"],
      ["ple", "ase"],
      ["kind", "ly"],
      ["it is im", "portant"],
      ["note ", "that"],
      ["in order ", "to"],
      ["ens", "ure"],
      ["compre", "hensive"],
      ["ro", "bust"],
      ["seam", "less"],
      ["lever", "age"],
      ["uti", "lize"],
    ];
    const registerTerms = registerFragments.map((parts) => parts.join(""));
    pages.forEach((page) => {
      const pageText = page.innerText;
      const lowerPageText = pageText.toLowerCase();
      registerTerms.forEach((term) => {
        if (lowerPageText.includes(term)) contentFailures.push(`page ${page.dataset.pageNumber} contains blocked register term: ${term}`);
      });
      const questionMarks = (pageText.match(/\?/g) || []).length;
      if (page.dataset.pageNumber !== "14" && questionMarks > 0) {
        contentFailures.push(`page ${page.dataset.pageNumber} contains ${questionMarks} question mark(s)`);
      }
    });
    const requiredText = [
      "Revision 08",
      "Final size split is supplied at order placement.",
      "Factory proposes at first pattern",
      "Maximum usable embroidery field",
      "This custom-development pack is not ready for bulk cutting",
      "Ο Ω Ν",
    ];
    requiredText.forEach((text) => {
      if (!bodyText.includes(text)) contentFailures.push(`missing required text: ${text}`);
    });
    if (bodyText.includes(String.fromCodePoint(0x2014))) contentFailures.push("document contains an em dash");

    document.querySelectorAll("h1, h2, h3, h4").forEach((heading) => {
      const letters = heading.textContent.replace(/[^A-Za-z]/g, "");
      if (letters.length > 3 && letters === letters.toUpperCase()) contentFailures.push(`all-caps heading: ${heading.textContent.trim()}`);
    });

    for (const key of ["frontAuthority", "backArtworkAuthority", "hoodExteriorReference", "hoodInteriorReference"]) {
      if (!A.data[key]) contentFailures.push(`embedded authority missing: ${key}`);
    }

    return {
      pageCount: pages.length,
      scannedBoxes: auditedElements.length,
      overflowFailures,
      safeMarginFailures,
      markerFailures,
      contentFailures,
      views: [...foundViews].sort(),
      locations: [...foundLocations].sort(),
    };
  };

  Promise.resolve(document.fonts ? document.fonts.ready : null).then(() => {
    global.__REV08_RENDER_DONE = true;
  });
})(window);
