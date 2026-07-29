(() => {
  "use strict";

  const roadmap = window.FRONI_SITE_ROADMAP;
  const chapterNav = document.getElementById("chapter-nav");
  const decisionCard = document.getElementById("decision-card");
  const saveState = document.getElementById("save-state");
  const progressValue = document.getElementById("progress-value");
  const progressBar = document.getElementById("progress-bar");
  const progressDetail = document.getElementById("progress-detail");
  const toast = document.getElementById("toast");

  let session = null;
  let saveTimer = null;
  let version = null;

  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const allDecisions = () =>
    roadmap.chapters.flatMap((chapter) => chapter.decisions);

  const activeDraft = () => {
    const active = session.active;
    const key = `${active.roadmapId}:${active.round}`;
    return session.state.drafts?.[key] || {
      selection: "",
      note: "",
    };
  };

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  };

  const setSaveState = (message, kind = "") => {
    saveState.textContent = message;
    saveState.className = `save-state${kind ? ` is-${kind}` : ""}`;
  };

  const api = async (path, options = {}) => {
    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    if (!response.ok) {
      throw new Error((await response.text()) || "The local server did not respond.");
    }
    return response;
  };

  const renderRoadmap = () => {
    chapterNav.replaceChildren();
    const confirmed = session.state.confirmed || {};
    const total = allDecisions().length;
    const confirmedCount = Object.keys(confirmed).length;
    const percent = total ? Math.round((confirmedCount / total) * 100) : 0;

    progressValue.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
    progressDetail.textContent = `${confirmedCount} of ${total} decisions confirmed`;

    roadmap.chapters.forEach((chapter) => {
      const row = create("div", "chapter-nav-row");
      if (chapter.id === session.active.chapterId) {
        row.classList.add("is-current");
      }

      const number = create("span", "chapter-nav-number", chapter.number);
      const title = create("span", "chapter-nav-title", chapter.title);
      const count = chapter.decisions.filter((decision) => confirmed[decision.id]).length;
      const tally = create(
        "span",
        "chapter-nav-count",
        `${count}/${chapter.decisions.length}`,
      );

      row.append(number, title, tally);
      chapterNav.append(row);
    });
  };

  const previewShell = (variant) => {
    const preview = create("div", `variant-preview preview-${variant.preview}`);
    preview.setAttribute("aria-hidden", "true");

    if (variant.preview.startsWith("nav-")) {
      const image = document.createElement("img");
      image.src = "/assets/worn-back.jpg";
      image.alt = "";
      image.className = "preview-nav-image";
      preview.append(image);

      if (variant.preview === "nav-header") {
        const bar = create("div", "preview-nav-headerbar");
        const wordmark = document.createElement("img");
        wordmark.src = "/brand-wordmark.svg";
        wordmark.alt = "";

        const control = create("div", "preview-nav-control");
        const mark = document.createElement("img");
        mark.src = "/f-mark.svg";
        mark.alt = "";
        control.append(mark, create("span", "", "Menu"));
        bar.append(wordmark, control);
        preview.append(bar, create("span", "preview-nav-state", "Always visible"));
        return preview;
      }

      if (variant.preview === "nav-collapsed") {
        const state = create("span", "preview-nav-state", "After scroll");
        const control = create("div", "preview-nav-control is-floating");
        const mark = document.createElement("img");
        mark.src = "/f-mark.svg";
        mark.alt = "";
        control.append(mark, create("span", "", "Menu"));
        preview.append(state, control);
        return preview;
      }

      const shade = create("div", "preview-nav-shade");
      const drawer = create("div", "preview-nav-drawer-panel");
      const drawerTop = create("div", "preview-nav-drawer-top");
      const wordmark = document.createElement("img");
      wordmark.src = "/brand-wordmark.svg";
      wordmark.alt = "";
      const mark = document.createElement("img");
      mark.src = "/f-mark.svg";
      mark.alt = "";
      drawerTop.append(wordmark, mark);
      const links = create("div", "preview-nav-links");
      links.append(
        create("span", "", "Current work"),
        create("span", "", "Permanent record"),
        create("span", "", "House"),
      );
      drawer.append(drawerTop, links);
      preview.append(shade, drawer, create("span", "preview-nav-state", "Open menu"));
      return preview;
    }

    if (variant.preview.startsWith("f-")) {
      if (variant.preview === "f-system") {
        const browserBar = create("div", "preview-f-browserbar");
        const mark = document.createElement("img");
        mark.src = "/f-mark-square.svg";
        mark.alt = "";
        browserBar.append(mark, create("span", "", "froni.co"));

        const pageBar = create("div", "preview-f-pagebar");
        const wordmark = document.createElement("img");
        wordmark.src = "/brand-wordmark.svg";
        wordmark.alt = "";
        pageBar.append(wordmark);

        const image = document.createElement("img");
        image.src = "/assets/worn-back.jpg";
        image.alt = "";
        image.className = "preview-f-image";
        preview.append(
          browserBar,
          pageBar,
          image,
          create("span", "preview-f-state", "F only in the browser icon"),
        );
        return preview;
      }

      if (variant.preview === "f-record") {
        const image = document.createElement("img");
        image.src = "/assets/pantocrator-icon.jpg";
        image.alt = "";
        image.className = "preview-f-record-image";
        const plate = create("div", "preview-f-record-plate");
        const mark = document.createElement("img");
        mark.src = "/f-mark-on-bone.svg";
        mark.alt = "";
        plate.append(
          mark,
          create("span", "", "FRN 001"),
          create("strong", "", "Permanent record"),
          create("span", "", "22.11.2026 · 001–200"),
        );
        preview.append(image, plate);
        return preview;
      }

      const image = document.createElement("img");
      image.src = "/assets/worn-back.jpg";
      image.alt = "";
      image.className = "preview-f-image";
      const bar = create("div", "preview-f-pagebar is-dark");
      const wordmark = document.createElement("img");
      wordmark.src = "/brand-wordmark.svg";
      wordmark.alt = "";
      bar.append(wordmark);
      const closing = create("div", "preview-f-closing-bar");
      const mark = document.createElement("img");
      mark.src = "/f-mark-square.svg";
      mark.alt = "";
      closing.append(mark, create("span", "", "Continue to the permanent record"));
      preview.append(image, bar, closing);
      return preview;
    }

    if (variant.preview.startsWith("invariant-")) {
      const pair = create("div", "preview-invariant-pair");
      const sources = [
        ["/assets/worn-back.jpg", "Edition One", true],
        ["/assets/pantocrator-icon.jpg", "Edition Two", false],
      ];

      sources.forEach(([source, title, dark]) => {
        const page = create(
          "div",
          `preview-invariant-page${dark ? " is-dark" : ""}`,
        );
        const header = create("div", "preview-invariant-header");
        const wordmark = document.createElement("img");
        wordmark.src = "/brand-wordmark.svg";
        wordmark.alt = "";
        header.append(wordmark);

        const image = document.createElement("img");
        image.src = source;
        image.alt = "";
        image.className = "preview-invariant-image";

        const copy = create("div", "preview-invariant-copy");
        copy.append(
          create("span", "", "Current work"),
          create("strong", "", title),
        );

        const record = create("div", "preview-invariant-record");
        record.append(
          create("span", "", dark ? "FRN 001" : "FRN 002"),
          create("span", "", dark ? "001–200" : "001–120"),
        );
        page.append(header, image, copy, record);
        pair.append(page);
      });

      const stateLabels = {
        "invariant-structure": "Same skeleton",
        "invariant-type": "Skeleton + type roles",
        "invariant-surface": "Skeleton + surfaces",
      };
      preview.append(
        pair,
        create(
          "span",
          "preview-invariant-state",
          stateLabels[variant.preview],
        ),
      );
      return preview;
    }

    if (variant.preview.startsWith("inherit-")) {
      const pair = create("div", "preview-inherit-pair");
      const pages = [
        ["/assets/worn-back.jpg", "Edition One", true],
        ["/assets/pantocrator-icon.jpg", "Edition Two", false],
      ];

      pages.forEach(([source, title, dark], index) => {
        const page = create(
          "div",
          `preview-inherit-page${dark ? " is-dark" : ""}${index ? " is-second" : ""}`,
        );
        const header = create("div", "preview-inherit-header");
        const wordmark = document.createElement("img");
        wordmark.src = "/brand-wordmark.svg";
        wordmark.alt = "";
        header.append(wordmark);
        const image = document.createElement("img");
        image.src = source;
        image.alt = "";
        image.className = "preview-inherit-image";
        const titleNode = create("strong", "preview-inherit-title", title);
        page.append(header, image, titleNode);

        if (variant.preview === "inherit-utilities") {
          const utility = create("div", "preview-inherit-utility");
          utility.append(
            create("span", "", "Details"),
            create("span", "", "Fit"),
            create("span", "", "Delivery"),
          );
          page.append(utility);
        } else if (variant.preview === "inherit-default") {
          const record = create("div", "preview-inherit-record");
          record.append(
            create("span", "", index ? "FRN 002" : "FRN 001"),
            create("span", "", index ? "001–120" : "001–200"),
          );
          page.append(record);
        }

        pair.append(page);
      });

      const stateLabels = {
        "inherit-none": "Re-earn everything",
        "inherit-utilities": "Utilities survive",
        "inherit-default": "Current skeleton survives",
      };
      preview.append(
        pair,
        create("span", "preview-inherit-state", stateLabels[variant.preview]),
      );
      return preview;
    }

    if (variant.preview === "frame") {
      const bar = create("div", "preview-bar");
      const logo = document.createElement("img");
      logo.src =
        variant.previewMark === "f" ? "/f-mark.svg" : "/brand-wordmark.svg";
      logo.alt = "";
      if (variant.previewMark === "f") {
        logo.classList.add("is-f-mark");
      }
      const date = create("span", "", "22 November 2026");
      bar.append(logo, date);

      const grid = create("div", "preview-frame-grid");
      const image = document.createElement("img");
      image.src = "/assets/worn-back.jpg";
      image.alt = "";
      const copy = create("div", "preview-copy");
      copy.append(
        create("span", "preview-kicker", "Edition One"),
        create("strong", "", "Christ Pantocrator"),
        create("span", "", "001–200"),
      );
      grid.append(image, copy);
      preview.append(bar, grid);
      return preview;
    }

    if (variant.preview === "record") {
      const image = document.createElement("img");
      image.src = "/assets/pantocrator-icon.jpg";
      image.alt = "";
      const plate = create("div", "preview-record-plate");
      if (variant.previewMark === "f") {
        const mark = document.createElement("img");
        mark.src = "/f-mark.svg";
        mark.alt = "";
        mark.className = "preview-record-mark";
        plate.append(mark);
      }
      plate.append(
        create("span", "", "FRN 001"),
        create("strong", "", "Edition One"),
        create("span", "", "Sinai · sixth century"),
        create("span", "", "22.11.2026"),
      );
      preview.append(image, plate);
      return preview;
    }

    const rail = create("div", "preview-signature-rail");
    const mark = document.createElement("img");
    mark.src = "/f-mark.svg";
    mark.alt = "";
    rail.append(mark, create("span", "", "01"));

    const image = document.createElement("img");
    image.src = "/assets/worn-back.jpg";
    image.alt = "";
    const caption = create("div", "preview-signature-copy");
    caption.append(
      create("strong", "", "Christ Pantocrator"),
      create("span", "", "Edition One · 200"),
    );
    preview.append(rail, image, caption);
    return preview;
  };

  const renderDecision = () => {
    const active = session.active;
    const draft = activeDraft();
    const pending =
      session.state.pending?.decisionId === active.roadmapId &&
      session.state.pending?.round === active.round
        ? session.state.pending
        : null;

    decisionCard.replaceChildren();

    const header = create("header", "decision-header");
    const meta = create("div", "decision-meta");
    meta.append(
      create("span", "decision-number", active.number),
      create("span", "decision-round", `Round ${active.round}`),
      create("span", "decision-chapter", active.chapter),
    );
    header.append(
      meta,
      create("h2", "", active.question),
      create("p", "decision-context", active.context),
    );
    decisionCard.append(header);

    const boundary = create("div", "decision-boundary");
    boundary.append(
      create("strong", "", "Decision boundary"),
      create("span", "", active.boundary),
    );
    decisionCard.append(boundary);

    const form = create("form", "decision-form");
    form.noValidate = true;
    const variants = create("fieldset", "variants");
    variants.append(create("legend", "sr-only", "Choose one variant"));
    const variantsGrid = create("div", "variants-grid");

    active.variants.forEach((variant, index) => {
      const label = create("label", "variant-card");
      label.dataset.variantId = variant.id;

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "variant";
      input.value = variant.id;
      input.checked = draft.selection === variant.id;
      input.disabled = Boolean(pending);

      const top = create("div", "variant-topline");
      top.append(
        create("span", "variant-index", String.fromCharCode(65 + index)),
        create("span", "variant-title", variant.title),
      );
      if (variant.recommended) {
        top.append(create("span", "recommended-label", "Codex position"));
      }

      const copy = create("div", "variant-copy");
      copy.append(
        create("p", "variant-position", variant.position),
        create("p", "variant-fact", `Consequence: ${variant.consequence}`),
        create("p", "variant-risk", `Risk: ${variant.risk}`),
      );

      label.append(input, previewShell(variant), top, copy);
      variantsGrid.append(label);
    });

    variants.append(variantsGrid);
    form.append(variants);

    const guardrails = create("div", "guardrails");
    guardrails.append(create("strong", "", "All three must keep"));
    const guardrailList = create("ul");
    active.guardrails.forEach((item) => {
      guardrailList.append(create("li", "", item));
    });
    guardrails.append(guardrailList);
    form.append(guardrails);

    const response = create("div", "response-panel");
    const responseCopy = create("div", "response-copy");
    responseCopy.append(
      create("p", "eyebrow", "Your correction"),
      create(
        "h3",
        "",
        "Choose the closest variant, then change it if the choices are not exact.",
      ),
      create(
        "p",
        "",
        "Written instruction outranks the selected card. Leave the field empty to accept the selected variant.",
      ),
    );

    const noteLabel = create(
      "label",
      "note-label",
      "Correction, rejection, or missing condition",
    );
    const note = document.createElement("textarea");
    note.id = "decision-note";
    note.rows = 5;
    note.placeholder =
      "Write what should change. You may also reject all three and state the direction from first principles.";
    note.value = draft.note || "";
    note.disabled = Boolean(pending);
    noteLabel.htmlFor = note.id;

    const actions = create("div", "decision-actions");
    const help = create(
      "span",
      "decision-help",
      "Nothing advances until Codex absorbs this submission.",
    );
    const confirm = create("button", "confirm-button");
    confirm.type = "submit";
    confirm.disabled = Boolean(pending) || (!draft.selection && !draft.note);

    const setButtonLabel = () => {
      const currentSelection = form.querySelector('input[name="variant"]:checked');
      const hasNote = note.value.trim().length > 0;
      confirm.textContent = hasNote
        ? "Send revision and wake Codex"
        : "Confirm decision and wake Codex";
      confirm.disabled = Boolean(pending) || (!currentSelection && !hasNote);
    };

    setButtonLabel();
    actions.append(help, confirm);

    const fields = create("div", "response-fields");
    fields.append(noteLabel, note, actions);
    response.append(responseCopy, fields);
    form.append(response);

    if (pending) {
      const sent = create("div", "pending-panel");
      sent.append(
        create("strong", "", "Sent to Codex"),
        create(
          "p",
          "",
          pending.intent === "accept"
            ? "The decision is recorded. This page will change when the next decision is ready."
            : "The correction is recorded. This page will change when the revised variants are ready.",
        ),
      );
      form.append(sent);
    }

    form.addEventListener("change", () => {
      setButtonLabel();
      scheduleDraftSave(form, note);
    });
    note.addEventListener("input", () => {
      setButtonLabel();
      setSaveState("Not yet sent");
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (pending) return;

      const selected = form.querySelector('input[name="variant"]:checked');
      const payload = {
        decisionId: active.roadmapId,
        round: active.round,
        selection: selected?.value || "",
        note: note.value.trim(),
      };
      if (!payload.selection && !payload.note) return;

      confirm.disabled = true;
      confirm.textContent = "Sending";
      setSaveState("Sending decision", "saving");

      try {
        const result = await api("/api/confirm", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        session.state = await result.json();
        setSaveState("Decision sent");
        showToast("Codex has been woken.");
        renderRoadmap();
        renderDecision();
      } catch (error) {
        setSaveState("Could not send", "error");
        showToast(error.message);
        setButtonLabel();
      }
    });

    decisionCard.append(form);
  };

  const scheduleDraftSave = (form, note) => {
    window.clearTimeout(saveTimer);
    setSaveState("Saving", "saving");
    saveTimer = window.setTimeout(async () => {
      const selected = form.querySelector('input[name="variant"]:checked');
      try {
        const result = await api("/api/draft", {
          method: "POST",
          body: JSON.stringify({
            decisionId: session.active.roadmapId,
            round: session.active.round,
            selection: selected?.value || "",
            note: note.value,
          }),
        });
        session.state = await result.json();
        setSaveState("Saved locally");
      } catch (error) {
        setSaveState("Save failed", "error");
      }
    }, 350);
  };

  const loadSession = async () => {
    const response = await api("/api/session");
    session = await response.json();
    renderRoadmap();
    renderDecision();
    setSaveState("Saved locally");
  };

  const pollVersion = async () => {
    try {
      const response = await fetch("/api/version", { cache: "no-store" });
      const nextVersion = await response.text();
      if (version === null) {
        version = nextVersion;
      } else if (version !== nextVersion) {
        window.location.reload();
      }
    } catch {
      setSaveState("Server unavailable", "error");
    }
  };

  loadSession().catch((error) => {
    decisionCard.replaceChildren(
      create("div", "loading-panel is-error", error.message),
    );
    setSaveState("Could not load", "error");
  });

  window.setInterval(pollVersion, 1200);
  pollVersion();
})();
