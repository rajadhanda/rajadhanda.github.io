(() => {
  const mode = document.querySelector(".mode");
  const syncMode = () => {
    const midnight = document.documentElement.dataset.theme === "midnight";
    mode.setAttribute("aria-pressed", String(midnight));
    mode.setAttribute(
      "aria-label",
      `Switch to ${midnight ? "Daylight" : "Midnight"} mode`,
    );
    mode.title = mode.getAttribute("aria-label");
  };
  mode.addEventListener("click", () => {
    const midnight = document.documentElement.dataset.theme !== "midnight";
    document.documentElement.dataset.theme = midnight ? "midnight" : "daylight";
    try {
      localStorage.setItem("theme", midnight ? "midnight" : "light");
    } catch (_) {}
    syncMode();
  });
  syncMode();

  const carousel = document.querySelector(".photo-carousel");
  const slides = [...carousel.querySelectorAll(".carousel-slide")];
  const status = carousel.querySelector(".carousel-status");
  let current = 0;
  function selectPhoto(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== current;
      if (i === current) slide.querySelector("img").loading = "eager";
    });
    status.textContent = `${current + 1} of ${slides.length}`;
  }
  carousel.querySelectorAll("[data-carousel]").forEach((button) =>
    button.addEventListener("click", () => {
      selectPhoto(current + (button.dataset.carousel === "next" ? 1 : -1));
    }),
  );
  carousel.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    selectPhoto(current + (event.key === "ArrowRight" ? 1 : -1));
  });
  let touch = null;
  let swiped = false;
  carousel.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType !== "touch") return;
      touch = { x: event.clientX, y: event.clientY };
      swiped = false;
    },
    { passive: true },
  );
  carousel.addEventListener(
    "pointerup",
    (event) => {
      if (!touch) return;
      const dx = event.clientX - touch.x,
        dy = event.clientY - touch.y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        swiped = true;
        selectPhoto(current + (dx < 0 ? 1 : -1));
        setTimeout(() => {
          swiped = false;
        }, 250);
      }
      touch = null;
    },
    { passive: true },
  );
  carousel.addEventListener("pointercancel", () => {
    touch = null;
  });

  const dialog = document.getElementById("drawer");
  const content = document.getElementById("drawer-content");
  function showLargePhoto(focusControl) {
    const slide = slides[current];
    content.replaceChildren();
    const heading = document.createElement("h2");
    heading.id = "drawer-title";
    heading.textContent = "Photographs";
    const image = slide.querySelector("img").cloneNode();
    image.removeAttribute("width");
    image.removeAttribute("height");
    image.loading = "eager";
    const caption = document.createElement("p");
    caption.className = "drawer-photo-caption";
    caption.textContent = slide.querySelector("figcaption").textContent;
    const controls = document.createElement("div");
    controls.className = "photo-controls";
    const previous = document.createElement("button");
    previous.type = "button";
    previous.textContent = "Previous";
    const next = document.createElement("button");
    next.type = "button";
    next.textContent = "Next";
    const gallery = document.createElement("a");
    gallery.href = document.querySelector(".carousel-heading a").href;
    gallery.textContent = "All photographs";
    previous.addEventListener("click", () => {
      selectPhoto(current - 1);
      showLargePhoto("previous");
    });
    next.addEventListener("click", () => {
      selectPhoto(current + 1);
      showLargePhoto("next");
    });
    controls.append(previous, gallery, next);
    content.append(heading, image, caption, controls);
    if (focusControl) (focusControl === "previous" ? previous : next).focus();
  }
  carousel.querySelectorAll("[data-open-photo]").forEach((button) =>
    button.addEventListener("click", () => {
      if (swiped) return;
      selectPhoto(Number(button.dataset.openPhoto));
      showLargePhoto();
      dialog.showModal();
    }),
  );
  document
    .querySelector(".drawer-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => slides[current].querySelector("button").focus());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      selectPhoto(current + (event.key === "ArrowRight" ? 1 : -1));
      showLargePhoto();
    }
  });

  const notes = document.querySelector(".front-notes");
  const formatDate = (date) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(date + "T00:00:00Z"));
  notes.querySelectorAll("time").forEach((time) => {
    try {
      time.textContent = formatDate(time.dateTime);
    } catch (_) {}
  });
  function createNote(note) {
    const link = new URL(note.link);
    if (
      link.protocol !== "https:" ||
      !(
        link.hostname === "substack.com" ||
        link.hostname.endsWith(".substack.com")
      )
    )
      return null;
    if (
      typeof note.text !== "string" ||
      !note.text.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(note.date)
    )
      return null;
    const a = document.createElement("a");
    a.className = "front-note";
    a.href = link.href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    const time = document.createElement("time");
    time.dateTime = note.date;
    time.textContent = formatDate(note.date);
    const text = document.createElement("p");
    text.textContent = note.text.trim();
    const label = document.createElement("span");
    label.textContent = "Read on Substack";
    a.append(time, text, label);
    return a;
  }
  async function refreshNotes() {
    try {
      const response = await fetch(notes.dataset.notesSource, {
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) return;
      const data = await response.json();
      if (!Array.isArray(data)) return;
      const rendered = data
        .filter((note) => note && typeof note.date === "string")
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((note) => {
          try {
            return createNote(note);
          } catch (_) {
            return null;
          }
        })
        .filter(Boolean)
        .slice(0, 3);
      if (rendered.length) notes.replaceChildren(...rendered);
    } catch (_) {
      /* The pre-rendered notes stay available if the feed cannot be read. */
    }
  }
  refreshNotes();
})();
