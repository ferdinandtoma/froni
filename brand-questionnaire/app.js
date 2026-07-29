(() => {
  "use strict";

  const questionnaire = window.FRONI_QUESTIONNAIRE;
  const localAccessKey =
    new URLSearchParams(window.location.search).get("key") || "";
  const form = document.getElementById("questionnaire");
  const nav = document.getElementById("chapter-nav");
  const progressValue = document.getElementById("progress-value");
  const progressBar = document.getElementById("progress-bar");
  const progressDetail = document.getElementById("progress-detail");
  const saveState = document.getElementById("save-state");
  const toast = document.getElementById("toast");
  const importInput = document.getElementById("import-backup");
  const downloadButtons = [
    document.getElementById("download-backup"),
    document.getElementById("download-backup-bottom"),
  ];

  let state = {
    schemaVersion: 1,
    questionnaireVersion: questionnaire.version,
    startedAt: new Date().toISOString(),
    updatedAt: null,
    responses: {},
  };
  let saveTimer = null;
  let saveInFlight = false;
  let saveQueued = false;
  let dirty = false;
  let toastTimer = null;
  const questionMap = new Map();
  const cardMap = new Map();
  const navMap = new Map();
  const sectionMap = new Map();

  function localUrl(path) {
    if (!localAccessKey) return path;
    const url = new URL(path, window.location.origin);
    url.searchParams.set("key", localAccessKey);
    return `${url.pathname}${url.search}`;
  }

  function localFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (localAccessKey) headers.set("X-Froni-Local-Key", localAccessKey);
    return fetch(localUrl(path), { ...options, headers });
  }

  questionnaire.chapters.forEach((chapter) => {
    chapter.questions.forEach((item, index) => {
      questionMap.set(item.id, {
        question: item,
        chapter,
        index,
      });
    });
  });

  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function responseFor(id) {
    if (!state.responses[id] || typeof state.responses[id] !== "object") {
      state.responses[id] = {
        status: "unanswered",
        choice: null,
        choices: [],
        ranking: [],
        notes: "",
        links: [],
        attachments: [],
        supplemental: {},
        updatedAt: null,
      };
    }
    const response = state.responses[id];
    if (!Array.isArray(response.choices)) response.choices = [];
    if (!Array.isArray(response.ranking)) response.ranking = [];
    if (!Array.isArray(response.links)) response.links = [];
    if (!Array.isArray(response.attachments)) response.attachments = [];
    if (!response.supplemental || typeof response.supplemental !== "object") {
      response.supplemental = {};
    }
    if (!response.status) response.status = "unanswered";
    if (typeof response.notes !== "string") response.notes = "";
    return response;
  }

  function hasValue(response, value) {
    if (response.choice === value) return true;
    if (response.choices.includes(value)) return true;
    if (response.ranking.includes(value)) return true;
    return false;
  }

  function isVisible(item) {
    if (!item.when) return true;
    const dependency = responseFor(item.when.question);
    const matches = item.when.includes.some((value) =>
      hasValue(dependency, value),
    );
    return item.when.not ? !matches : matches;
  }

  function markAnswered(id) {
    const response = responseFor(id);
    response.status = "answered";
    response.updatedAt = new Date().toISOString();
    markDirty();
  }

  function markDirty() {
    dirty = true;
    saveState.textContent = "Saving locally";
    saveState.classList.add("is-saving");
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveNow, 650);
    updateVisibilityAndProgress();
  }

  async function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (saveInFlight) {
      saveQueued = true;
      return;
    }
    if (!dirty) return;

    saveInFlight = true;
    saveQueued = false;
    dirty = false;
    state.questionnaireVersion = questionnaire.version;

    try {
      const result = await localFetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      if (!result.ok) throw new Error(await result.text());
      const payload = await result.json();
      state.updatedAt = payload.updatedAt;
      saveState.textContent = `Saved locally ${formatTime(payload.updatedAt)}`;
      saveState.classList.remove("is-saving", "is-error");
    } catch (error) {
      dirty = true;
      saveState.textContent = "Save failed";
      saveState.classList.remove("is-saving");
      saveState.classList.add("is-error");
      showToast(error instanceof Error ? error.message : "Save failed", true);
    } finally {
      saveInFlight = false;
      if (saveQueued || dirty) {
        saveTimer = window.setTimeout(saveNow, dirty ? 900 : 50);
      }
    }
  }

  function formatTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function showToast(message, error = false) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.toggle("is-error", error);
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 4200);
  }

  function setStatus(id, status) {
    const response = responseFor(id);
    response.status =
      response.status === status
        ? responseHasContent(response)
          ? "answered"
          : "unanswered"
        : status;
    response.updatedAt = new Date().toISOString();
    syncCard(id);
    markDirty();
  }

  function responseHasContent(response) {
    const supplementalValues = Object.values(response.supplemental || {});
    return Boolean(
      response.choice ||
        response.choices.length ||
        response.ranking.length ||
        response.notes.trim() ||
        response.links.length ||
        response.attachments.length ||
        supplementalValues.some((value) =>
          Array.isArray(value) ? value.length > 0 : Boolean(value),
        ),
    );
  }

  function renderChoiceList(item, response) {
    const wrap = create(
      "div",
      item.type === "scale" ? "scale-control" : "choice-list",
    );

    if (item.type === "scale" && item.scaleLabels) {
      const low = create("span", "scale-end scale-end-low", item.scaleLabels.low);
      const high = create(
        "span",
        "scale-end scale-end-high",
        item.scaleLabels.high,
      );
      wrap.append(low, high);
    }

    item.options.forEach((option) => {
      const label = create(
        "label",
        item.type === "scale" ? "scale-choice" : "choice",
      );
      const input = document.createElement("input");
      input.type = item.type === "multi" ? "checkbox" : "radio";
      input.name =
        item.type === "multi"
          ? `question-${item.id}-${option.value}`
          : `question-${item.id}`;
      input.value = option.value;
      input.checked =
        item.type === "multi"
          ? response.choices.includes(option.value)
          : response.choice === option.value;

      const marker = create("span", "choice-marker");
      const copy = create("span", "choice-copy", option.label);
      label.append(input, marker, copy);

      input.addEventListener("change", () => {
        if (item.type === "multi") {
          const selected = new Set(responseFor(item.id).choices);
          if (input.checked) selected.add(option.value);
          else selected.delete(option.value);
          responseFor(item.id).choices = [...selected];
          if (selected.size > 0) markAnswered(item.id);
          else {
            const current = responseFor(item.id);
            if (!current.notes.trim() && current.status === "answered") {
              current.status = "unanswered";
              markDirty();
            } else {
              markDirty();
            }
          }
        } else {
          responseFor(item.id).choice = option.value;
          markAnswered(item.id);
        }
        syncCard(item.id);
      });

      wrap.append(label);
    });

    return wrap;
  }

  function renderRank(item, response) {
    const wrap = create("div", "rank-control");
    const help = create(
      "p",
      "control-help",
      "Move the most important item to the top. The initial order is not an answer.",
    );
    const list = create("ol", "rank-list");

    const renderRows = () => {
      list.textContent = "";
      const values =
        responseFor(item.id).ranking.length === item.options.length
          ? responseFor(item.id).ranking
          : item.options.map((option) => option.value);

      values.forEach((value, index) => {
        const option = item.options.find((candidate) => candidate.value === value);
        const row = create("li", "rank-row");
        const position = create("span", "rank-position", String(index + 1));
        const copy = create("span", "rank-copy", option.label);
        const actions = create("span", "rank-actions");
        const up = create("button", "rank-button", "Up");
        const down = create("button", "rank-button", "Down");
        up.type = "button";
        down.type = "button";
        up.disabled = index === 0;
        down.disabled = index === values.length - 1;
        up.setAttribute("aria-label", `Move ${option.label} up`);
        down.setAttribute("aria-label", `Move ${option.label} down`);

        const move = (direction) => {
          const next = [...values];
          const target = index + direction;
          [next[index], next[target]] = [next[target], next[index]];
          responseFor(item.id).ranking = next;
          markAnswered(item.id);
          renderRows();
          syncCard(item.id);
        };
        up.addEventListener("click", () => move(-1));
        down.addEventListener("click", () => move(1));
        actions.append(up, down);
        row.append(position, copy, actions);
        list.append(row);
      });
    };

    renderRows();
    wrap.append(help, list);
    return wrap;
  }

  function renderSupplemental(item, response) {
    if (!item.supplemental?.length) return null;
    const wrap = create("div", "supplemental");

    item.supplemental.forEach((group) => {
      const fieldset = create("fieldset", "supplemental-group");
      const legend = create("legend", "", group.label);
      fieldset.append(legend);
      const choices = create("div", "supplemental-choices");
      const saved = responseFor(item.id).supplemental[group.key];

      group.options.forEach((option) => {
        const label = create("label", "supplemental-choice");
        const input = document.createElement("input");
        input.type = group.type === "multi" ? "checkbox" : "radio";
        input.name =
          group.type === "multi"
            ? `question-${item.id}-${group.key}-${option.value}`
            : `question-${item.id}-${group.key}`;
        input.value = option.value;
        input.checked =
          group.type === "multi"
            ? Array.isArray(saved) && saved.includes(option.value)
            : saved === option.value;
        const marker = create("span", "choice-marker");
        const copy = create("span", "choice-copy", option.label);
        label.append(input, marker, copy);

        input.addEventListener("change", () => {
          const target = responseFor(item.id).supplemental;
          if (group.type === "multi") {
            const selected = new Set(
              Array.isArray(target[group.key]) ? target[group.key] : [],
            );
            if (input.checked) selected.add(option.value);
            else selected.delete(option.value);
            target[group.key] = [...selected];
          } else {
            target[group.key] = option.value;
          }
          markAnswered(item.id);
          syncCard(item.id);
        });
        choices.append(label);
      });

      fieldset.append(choices);
      wrap.append(fieldset);
    });
    return wrap;
  }

  function renderPreview(item) {
    if (!item.preview) return null;
    const preview = item.preview;
    const wrap = create("div", `diagnostic diagnostic-${preview.kind}`);
    wrap.setAttribute("aria-label", "Diagnostic visual examples");

    const selectionKinds = new Set([
      "layouts",
      "swatches",
      "typeFamilies",
      "typeDensity",
      "case",
      "photoModes",
      "paper",
    ]);

    const makeSelectable = (node, index) => {
      if (!selectionKinds.has(preview.kind) || !item.options[index]) return node;
      const button = create("button", `${node.className} diagnostic-selectable`);
      button.type = "button";
      button.dataset.previewValue = item.options[index].value;
      button.setAttribute(
        "aria-label",
        `Choose ${item.options[index].label}`,
      );
      while (node.firstChild) button.append(node.firstChild);
      button.addEventListener("click", () => {
        if (item.type === "multi") {
          const response = responseFor(item.id);
          const selected = new Set(response.choices);
          const value = item.options[index].value;
          if (selected.has(value)) selected.delete(value);
          else selected.add(value);
          response.choices = [...selected];
          if (selected.size) markAnswered(item.id);
          else markDirty();
        } else {
          responseFor(item.id).choice = item.options[index].value;
          markAnswered(item.id);
        }
        syncCard(item.id);
      });
      return button;
    };

    if (preview.kind === "swatches") {
      preview.palettes.forEach((colors, index) => {
        const card = create("div", "swatch-card");
        const chips = create("span", "swatch-chips");
        colors.forEach((color) => {
          const chip = create("span", "swatch-chip");
          chip.style.backgroundColor = color;
          chips.append(chip);
        });
        card.append(
          chips,
          create("span", "diagnostic-label", item.options[index].label),
        );
        wrap.append(makeSelectable(card, index));
      });
      return wrap;
    }

    if (preview.kind === "typeFamilies") {
      preview.samples.forEach((sample, index) => {
        const card = create("div", `type-sample ${sample.className}`);
        card.append(
          create("span", "type-sample-large", "Froni"),
          create("span", "type-sample-small", "A work, recorded in full"),
          create("span", "diagnostic-label", sample.label),
        );
        wrap.append(makeSelectable(card, index));
      });
      return wrap;
    }

    if (preview.kind === "layouts") {
      preview.labels.forEach((label, index) => {
        const card = create("div", `layout-sample layout-${index + 1}`);
        const canvas = create("span", "layout-canvas");
        for (let line = 0; line < 7; line += 1) {
          canvas.append(create("i", `layout-line line-${line + 1}`));
        }
        card.append(canvas, create("span", "diagnostic-label", label));
        wrap.append(makeSelectable(card, index));
      });
      return wrap;
    }

    if (preview.kind === "typeDensity") {
      preview.labels.forEach((label, index) => {
        const card = create("div", `density-sample density-${index + 1}`);
        card.append(
          create("b", "", index === 2 ? "Archive 001" : "The work"),
          create(
            "span",
            "",
            index === 2
              ? "Material. Source. Place. Maker. Date. Measure. Record."
              : "A short passage set at a different pace and measure.",
          ),
          create("span", "diagnostic-label", label),
        );
        wrap.append(makeSelectable(card, index));
      });
      return wrap;
    }

    if (preview.kind === "case") {
      const samples = [
        "Edition One",
        "Edition One",
        "EDITION ONE",
        "Edition ONE",
        "Edition one",
      ];
      preview.labels.forEach((label, index) => {
        const card = create("div", `case-sample case-${index + 1}`);
        card.append(
          create("span", "case-example", samples[index]),
          create("span", "diagnostic-label", label),
        );
        wrap.append(makeSelectable(card, index));
      });
      return wrap;
    }

    if (preview.kind === "photoModes") {
      preview.labels.forEach((label, index) => {
        const card = create("div", `photo-sample photo-${index + 1}`);
        const scene = create("span", "photo-scene");
        scene.append(
          create("i", "photo-object"),
          create("i", "photo-shadow"),
          create("i", "photo-human"),
        );
        card.append(scene, create("span", "diagnostic-label", label));
        wrap.append(makeSelectable(card, index));
      });
      return wrap;
    }

    if (preview.kind === "paper") {
      preview.labels.forEach((label, index) => {
        const card = create("div", `paper-sample paper-${index + 1}`);
        card.append(
          create("span", "paper-sheet", "F"),
          create("span", "diagnostic-label", label),
        );
        wrap.append(makeSelectable(card, index));
      });
      return wrap;
    }

    if (preview.kind === "density") {
      const sparse = create("div", "density-endpoint density-sparse");
      sparse.append(
        create("b", "", preview.labels[0]),
        create("i"),
        create("i"),
      );
      const dense = create("div", "density-endpoint density-dense");
      dense.append(
        create("b", "", preview.labels[1]),
        ...Array.from({ length: 9 }, () => create("i")),
      );
      wrap.append(sparse, dense);
      return wrap;
    }

    if (preview.kind === "symmetry") {
      preview.labels.forEach((label, index) => {
        const card = create("div", `symmetry-sample symmetry-${index + 1}`);
        card.append(
          create("i"),
          create("i"),
          create("i"),
          create("span", "diagnostic-label", label),
        );
        wrap.append(card);
      });
      return wrap;
    }

    if (preview.kind === "saturation") {
      const low = create("div", "saturation-endpoint saturation-low");
      const high = create("div", "saturation-endpoint saturation-high");
      low.append(create("i"), create("span", "", preview.labels[0]));
      high.append(create("i"), create("span", "", preview.labels[1]));
      wrap.append(low, high);
      return wrap;
    }

    if (preview.kind === "typeContrast") {
      const quiet = create("div", "contrast-endpoint contrast-quiet");
      quiet.append(
        create("b", "", "The work"),
        create("span", "", "Material and record"),
        create("em", "", preview.labels[0]),
      );
      const strong = create("div", "contrast-endpoint contrast-strong");
      strong.append(
        create("b", "", "The work"),
        create("span", "", "Material and record"),
        create("em", "", preview.labels[1]),
      );
      wrap.append(quiet, strong);
      return wrap;
    }

    if (preview.kind === "motion") {
      preview.labels.forEach((label, index) => {
        const card = create("div", `motion-sample motion-${index + 1}`);
        card.append(
          create("i"),
          create("i"),
          create("i"),
          create("span", "", label),
        );
        wrap.append(card);
      });
      return wrap;
    }

    return null;
  }

  function renderReferences(item, response) {
    if (!item.references) return null;
    const details = create("details", "references");
    const summary = create("summary", "", "Add links or local attachments");
    const body = create("div", "references-body");
    const linkRow = create("div", "link-entry");
    const linkInput = document.createElement("input");
    linkInput.type = "url";
    linkInput.placeholder = "https://";
    linkInput.setAttribute("aria-label", `Reference link for ${item.prompt}`);
    const linkButton = create("button", "small-button", "Add link");
    linkButton.type = "button";
    const linkList = create("ul", "reference-list");
    const fileLabel = create("label", "small-button file-button", "Attach file");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileInput.setAttribute("aria-label", `Attach files for ${item.prompt}`);
    const uploadStatus = create("span", "upload-status");
    const attachmentList = create("ul", "reference-list attachment-list");
    fileLabel.append(fileInput);
    linkRow.append(linkInput, linkButton);

    const renderLinks = () => {
      linkList.textContent = "";
      responseFor(item.id).links.forEach((entry, index) => {
        const row = create("li");
        const anchor = create("a", "", entry.url);
        anchor.href = entry.url;
        anchor.target = "_blank";
        anchor.rel = "noreferrer";
        const remove = create("button", "text-button", "Remove");
        remove.type = "button";
        remove.addEventListener("click", () => {
          responseFor(item.id).links.splice(index, 1);
          markDirty();
          renderLinks();
        });
        row.append(anchor, remove);
        linkList.append(row);
      });
    };

    const addLink = () => {
      const raw = linkInput.value.trim();
      if (!raw) return;
      let parsed;
      try {
        parsed = new URL(raw);
      } catch {
        showToast("Enter a complete link beginning with http or https.", true);
        return;
      }
      if (!["http:", "https:"].includes(parsed.protocol)) {
        showToast("Only http and https links can be added.", true);
        return;
      }
      responseFor(item.id).links.push({ url: parsed.href });
      linkInput.value = "";
      markAnswered(item.id);
      renderLinks();
    };

    linkButton.addEventListener("click", addLink);
    linkInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addLink();
      }
    });

    const renderAttachments = () => {
      attachmentList.textContent = "";
      responseFor(item.id).attachments.forEach((entry, index) => {
        const row = create("li");
        const anchor = create("a", "", entry.name);
        anchor.href = localUrl(
          `/api/attachment/${encodeURIComponent(entry.storedName)}`,
        );
        anchor.title = `${formatBytes(entry.size)}. Stored only on this computer.`;
        const remove = create("button", "text-button", "Remove from answer");
        remove.type = "button";
        remove.addEventListener("click", () => {
          responseFor(item.id).attachments.splice(index, 1);
          markDirty();
          renderAttachments();
          showToast("Reference removed. The local file was kept for safety.");
        });
        row.append(anchor, remove);
        attachmentList.append(row);
      });
    };

    fileInput.addEventListener("change", async () => {
      const files = [...fileInput.files];
      fileInput.value = "";
      for (const file of files) {
        if (file.size > 30 * 1024 * 1024) {
          showToast(`${file.name} is larger than the 30 MB limit.`, true);
          continue;
        }
        uploadStatus.textContent = `Saving ${file.name}`;
        try {
          const result = await localFetch("/api/upload", {
            method: "POST",
            headers: {
              "X-Question-Id": item.id,
              "X-File-Name": encodeURIComponent(file.name),
              "X-File-Type": file.type || "application/octet-stream",
            },
            body: file,
          });
          if (!result.ok) throw new Error(await result.text());
          const entry = await result.json();
          responseFor(item.id).attachments.push(entry);
          markAnswered(item.id);
          renderAttachments();
        } catch (error) {
          showToast(
            error instanceof Error ? error.message : `Could not save ${file.name}`,
            true,
          );
        }
      }
      uploadStatus.textContent = "";
    });

    renderLinks();
    renderAttachments();
    body.append(
      linkRow,
      linkList,
      create("p", "reference-separator", "Local file"),
      fileLabel,
      uploadStatus,
      attachmentList,
    );
    details.append(summary, body);
    return details;
  }

  function formatBytes(value) {
    const size = Number(value || 0);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }

  function renderQuestion(item, chapter, index) {
    const response = responseFor(item.id);
    const article = create("article", "question-card");
    article.id = `question-${item.id}`;
    article.dataset.questionId = item.id;
    cardMap.set(item.id, article);

    const header = create("header", "question-header");
    const number = create(
      "span",
      "question-number",
      `${chapter.number}.${String(index + 1).padStart(2, "0")}`,
    );
    const status = create("span", "question-status", "Unanswered");
    status.dataset.statusLabel = "";
    const title = create("h4", "", item.prompt);
    header.append(number, status, title);
    if (item.context) header.append(create("p", "question-context", item.context));

    const body = create("div", "question-body");
    const preview = renderPreview(item);
    if (preview) body.append(preview);
    body.append(
      item.type === "rank"
        ? renderRank(item, response)
        : renderChoiceList(item, response),
    );
    const supplemental = renderSupplemental(item, response);
    if (supplemental) body.append(supplemental);

    const notes = create("div", "notes-field");
    const notesLabel = create(
      "label",
      "",
      "Clarify, qualify, reject the options, or add what is missing",
    );
    notesLabel.htmlFor = `notes-${item.id}`;
    const textarea = document.createElement("textarea");
    textarea.id = `notes-${item.id}`;
    textarea.rows = 4;
    textarea.value = response.notes;
    textarea.placeholder =
      "Your own answer matters more than the choices. Nothing written here becomes a public decision.";
    textarea.addEventListener("input", () => {
      const current = responseFor(item.id);
      current.notes = textarea.value;
      current.updatedAt = new Date().toISOString();
      if (textarea.value.trim() && current.status === "unanswered") {
        current.status = "answered";
      } else if (
        !textarea.value.trim() &&
        current.status === "answered" &&
        !current.choice &&
        current.choices.length === 0 &&
        current.ranking.length === 0
      ) {
        current.status = "unanswered";
      }
      syncCard(item.id);
      markDirty();
    });
    notes.append(notesLabel, textarea);
    body.append(notes);

    const references = renderReferences(item, response);
    if (references) body.append(references);

    const resolution = create("div", "resolution");
    resolution.append(create("span", "resolution-label", "Or leave this as"));
    [
      ["undecided", "Undecided"],
      ["not_applicable", "Not applicable"],
      ["skipped", "Skip"],
    ].forEach(([value, label]) => {
      const button = create("button", "resolution-button", label);
      button.type = "button";
      button.dataset.statusValue = value;
      button.addEventListener("click", () => setStatus(item.id, value));
      resolution.append(button);
    });
    body.append(resolution);
    article.append(header, body);
    syncCard(item.id);
    return article;
  }

  function renderAll() {
    form.textContent = "";
    nav.textContent = "";

    questionnaire.chapters.forEach((chapter) => {
      const navLink = create("a", "chapter-nav-link");
      navLink.href = `#chapter-${chapter.id}`;
      const navNumber = create("span", "chapter-nav-number", chapter.number);
      const navTitle = create("span", "chapter-nav-title", chapter.title);
      const navCount = create("span", "chapter-nav-count", "0/0");
      navLink.append(navNumber, navTitle, navCount);
      navMap.set(chapter.id, { link: navLink, count: navCount });
      nav.append(navLink);

      const chapterNode = create("section", "chapter");
      chapterNode.id = `chapter-${chapter.id}`;
      chapterNode.dataset.chapterId = chapter.id;
      const header = create("header", "chapter-header");
      header.append(
        create("p", "chapter-kicker", `Chapter ${chapter.number}`),
        create("h2", "", chapter.title),
        create("p", "chapter-description", chapter.description),
      );
      chapterNode.append(header);

      let currentSection = null;
      let sectionNode = null;
      chapter.questions.forEach((item, index) => {
        if (item.section !== currentSection) {
          currentSection = item.section;
          sectionNode = create("section", "question-section");
          sectionNode.dataset.sectionKey = `${chapter.id}:${item.section}`;
          sectionNode.append(create("h3", "", item.section));
          sectionMap.set(`${chapter.id}:${item.section}`, sectionNode);
          chapterNode.append(sectionNode);
        }
        sectionNode.append(renderQuestion(item, chapter, index));
      });
      form.append(chapterNode);
    });

    updateVisibilityAndProgress();
    observeChapters();
  }

  function syncCard(id) {
    const card = cardMap.get(id);
    if (!card) return;
    const response = responseFor(id);
    const label = card.querySelector("[data-status-label]");
    const labels = {
      unanswered: "Unanswered",
      answered: "Answered",
      undecided: "Undecided",
      not_applicable: "Not applicable",
      skipped: "Skipped",
    };
    label.textContent = labels[response.status] || "Unanswered";
    card.dataset.status = response.status;

    card.querySelectorAll("[data-status-value]").forEach((button) => {
      const active = button.dataset.statusValue === response.status;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const meta = questionMap.get(id);
    if (meta) {
      card.querySelectorAll("input[type='radio'], input[type='checkbox']").forEach(
        (input) => {
          if (input.name.startsWith(`question-${id}-`) && meta.question.type === "multi") {
            input.checked = response.choices.includes(input.value);
          } else if (input.name === `question-${id}`) {
            input.checked = response.choice === input.value;
          }
        },
      );
    }

    card.querySelectorAll("[data-preview-value]").forEach((button) => {
      const selected = hasValue(response, button.dataset.previewValue);
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function updateVisibilityAndProgress() {
    let visibleTotal = 0;
    let addressedTotal = 0;

    questionnaire.chapters.forEach((chapter) => {
      let chapterVisible = 0;
      let chapterAddressed = 0;
      chapter.questions.forEach((item) => {
        const visible = isVisible(item);
        const card = cardMap.get(item.id);
        if (card) card.hidden = !visible;
        if (!visible) return;
        chapterVisible += 1;
        visibleTotal += 1;
        if (responseFor(item.id).status !== "unanswered") {
          chapterAddressed += 1;
          addressedTotal += 1;
        }
      });

      const navEntry = navMap.get(chapter.id);
      if (navEntry) {
        navEntry.count.textContent = `${chapterAddressed}/${chapterVisible}`;
        navEntry.link.classList.toggle(
          "is-complete",
          chapterVisible > 0 && chapterAddressed === chapterVisible,
        );
      }

      const sectionNames = new Set(
        chapter.questions.map((item) => item.section),
      );
      sectionNames.forEach((name) => {
        const sectionNode = sectionMap.get(`${chapter.id}:${name}`);
        if (!sectionNode) return;
        const visibleCard = [...sectionNode.querySelectorAll(".question-card")].some(
          (card) => !card.hidden,
        );
        sectionNode.hidden = !visibleCard;
      });
    });

    const percent =
      visibleTotal === 0 ? 0 : Math.round((addressedTotal / visibleTotal) * 100);
    progressValue.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
    progressDetail.textContent = `${addressedTotal} of ${visibleTotal} visible questions addressed`;
  }

  function observeChapters() {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        navMap.forEach(({ link }, id) => {
          link.classList.toggle(
            "is-current",
            id === visible.target.dataset.chapterId,
          );
        });
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.05, 0.25] },
    );
    document.querySelectorAll(".chapter").forEach((chapter) => {
      observer.observe(chapter);
    });
  }

  async function downloadBackup() {
    await saveNow();
    try {
      const result = await localFetch("/api/backup");
      if (!result.ok) throw new Error(await result.text());
      const blob = await result.blob();
      const date = new Date().toISOString().slice(0, 10);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `froni-foundation-questionnaire-${date}.json`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      showToast("Backup downloaded, including local attachments.");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Could not download backup",
        true,
      );
    }
  }

  async function importBackup(file) {
    if (!file) return;
    const confirmed = window.confirm(
      "Importing will replace the currently saved questionnaire answers. Existing attachment files are kept. Continue?",
    );
    if (!confirmed) {
      importInput.value = "";
      return;
    }
    saveState.textContent = "Importing backup";
    try {
      const result = await localFetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: file,
      });
      if (!result.ok) throw new Error(await result.text());
      window.location.reload();
    } catch (error) {
      saveState.textContent = "Import failed";
      saveState.classList.add("is-error");
      showToast(
        error instanceof Error ? error.message : "Could not import backup",
        true,
      );
      importInput.value = "";
    }
  }

  async function load() {
    try {
      const result = await localFetch("/api/state");
      if (!result.ok) throw new Error(await result.text());
      const loaded = await result.json();
      if (loaded && typeof loaded === "object") {
        state = {
          schemaVersion: 1,
          questionnaireVersion: questionnaire.version,
          startedAt: loaded.startedAt || new Date().toISOString(),
          updatedAt: loaded.updatedAt || null,
          responses:
            loaded.responses && typeof loaded.responses === "object"
              ? loaded.responses
              : {},
        };
      }
      renderAll();
      saveState.textContent = state.updatedAt
        ? `Saved locally ${formatTime(state.updatedAt)}`
        : "Ready. Answers save locally";
    } catch (error) {
      renderAll();
      saveState.textContent = "Could not load saved answers";
      saveState.classList.add("is-error");
      showToast(
        error instanceof Error ? error.message : "Could not load saved answers",
        true,
      );
    }
  }

  downloadButtons.forEach((button) => {
    button.addEventListener("click", downloadBackup);
  });
  importInput.addEventListener("change", () => {
    importBackup(importInput.files[0]);
  });
  window.addEventListener("beforeunload", (event) => {
    if (!dirty && !saveInFlight) return;
    event.preventDefault();
    event.returnValue = "";
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && dirty) saveNow();
  });

  load();
})();
