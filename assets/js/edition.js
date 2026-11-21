(() => {
  const mastheadName = document.querySelector("[data-type-masthead]");
  const introMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let introFinished;
  const introReady = new Promise((resolve) => { introFinished = resolve; });

  if (mastheadName && !introMotion.matches && !document.hidden) {
    const name = mastheadName.textContent.trim();
    const letters = Array.from(name);
    const typedName = document.createElement("span");
    typedName.className = "masthead-typed";
    typedName.setAttribute("aria-hidden", "true");
    mastheadName.append(typedName);
    mastheadName.classList.add("is-typing");
    document.body.classList.add("edition-intro-pending");

    let timer;
    let index = 0;
    function finishTyping(event) {
      clearTimeout(timer);
      typedName.remove();
      mastheadName.classList.remove("is-typing");
      introMotion.removeEventListener("change", finishTyping);
      document.removeEventListener("visibilitychange", finishTyping);
      document.removeEventListener("focusin", finishTyping);
      document.body.classList.remove("edition-intro-pending");

      if (event) {
        introFinished();
        return;
      }
      document.body.classList.add("edition-entering");
      const lead = document.querySelector(".edition-lead");
      lead.addEventListener("animationend", finishIntro, { once: true });
      introMotion.addEventListener("change", finishIntro, { once: true });
      document.addEventListener("visibilitychange", finishIntro, { once: true });
      document.addEventListener("focusin", finishIntro, { once: true });
      timer = setTimeout(finishIntro, 1050);

      function finishIntro() {
        clearTimeout(timer);
        document.body.classList.remove("edition-entering");
        lead.removeEventListener("animationend", finishIntro);
        introMotion.removeEventListener("change", finishIntro);
        document.removeEventListener("visibilitychange", finishIntro);
        document.removeEventListener("focusin", finishIntro);
        introFinished();
      }
    }

    function typeNext() {
      index += 1;
      typedName.textContent = letters.slice(0, index).join("");
      if (index === letters.length) {
        timer = setTimeout(finishTyping, 160);
        return;
      }
      const pause = letters[index - 1] === " " ? 100 : 0;
      timer = setTimeout(typeNext, 62 + pause + Math.random() * 35);
    }

    introMotion.addEventListener("change", finishTyping);
    document.addEventListener("visibilitychange", finishTyping);
    document.addEventListener("focusin", finishTyping);
    timer = setTimeout(typeNext, 110);
  } else {
    introFinished();
  }

  const dateline = document.querySelector(".masthead-dateline");
  if (dateline) {
    const date = dateline.querySelector("time");
    const place = dateline.querySelector(".dateline-place");
    let midnightTimer;

    function updateDateline() {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-GB", { dateStyle: "full" });
      const zone = formatter.resolvedOptions().timeZone || "";
      // A time zone may cover many cities. Use its reference city as an edition label.
      const city = /^(Africa|America|Antarctica|Asia|Atlantic|Australia|Europe|Indian|Pacific)\//.test(zone)
        ? zone.split("/").pop().replaceAll("_", " ")
        : "";

      place.textContent = city;
      place.hidden = !city;
      date.textContent = formatter.format(now);
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      date.dateTime = now.getFullYear() + "-" + month + "-" + day;
      dateline.hidden = false;

      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      clearTimeout(midnightTimer);
      midnightTimer = setTimeout(updateDateline, nextMidnight - now + 50);
    }

    updateDateline();
    window.addEventListener("focus", updateDateline);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) updateDateline();
    });
  }

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

  // A little curiosity: the EyesOff pupils follow the pointer, then return to idle.
  const eyeMark = document.querySelector(".eyesoff-mark");
  const pupils = eyeMark.querySelector(".eo-pupils");
  const pointerMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let eyeFrame = 0;
  let eyeIdle = 0;
  let eyePointer = null;
  function resetEyes() {
    eyeMark.classList.remove("is-tracking");
    pupils.style.removeProperty("transform");
  }
  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch" || pointerMotion.matches) return;
      eyePointer = { x: event.clientX, y: event.clientY };
      clearTimeout(eyeIdle);
      if (!eyeFrame)
        eyeFrame = requestAnimationFrame(() => {
          eyeFrame = 0;
          const rect = eyeMark.getBoundingClientRect();
          const x = Math.max(
            -3.5,
            Math.min(3.5, (eyePointer.x - rect.left - rect.width / 2) / 50),
          );
          const y = Math.max(
            -4,
            Math.min(4, (eyePointer.y - rect.top - rect.height / 2) / 50),
          );
          eyeMark.classList.add("is-tracking");
          pupils.style.transform = `translate(${x}px,${y}px)`;
        });
      eyeIdle = setTimeout(resetEyes, 1800);
    },
    { passive: true },
  );
  pointerMotion.addEventListener("change", resetEyes);
  document.querySelectorAll(".socials a").forEach((link) => {
    link.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch" || pointerMotion.matches) return;
      const rect = link.getBoundingClientRect();
      link.style.setProperty(
        "--bubble-x",
        `${(event.clientX - rect.left - rect.width / 2) * 0.15}px`,
      );
      link.style.setProperty(
        "--bubble-y",
        `${(event.clientY - rect.top - rect.height / 2) * 0.15}px`,
      );
    });
    link.addEventListener("pointerleave", () => {
      link.style.removeProperty("--bubble-x");
      link.style.removeProperty("--bubble-y");
    });
  });

  const carousel = document.querySelector(".photo-carousel");
  const slides = [...carousel.querySelectorAll(".carousel-slide")];
  const status = carousel.querySelector(".carousel-status");
  const playButtons = [...carousel.querySelectorAll("[data-carousel-play]")];
  const dialog = document.getElementById("drawer");
  const content = document.getElementById("drawer-content");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const interval = 6000;
  let current = 0;
  let paused = reducedMotion.matches;
  let hovering = false;
  let focused = false;
  let visible = false;
  let timer = 0;
  let request = 0;
  let clearPhotoFade = () => {};

  function canRun() {
    return (
      !paused &&
      !hovering &&
      !focused &&
      visible &&
      !document.hidden &&
      !dialog.open
    );
  }
  function schedule() {
    clearTimeout(timer);
    carousel.dataset.playing = String(canRun());
    if (!canRun()) return;
    timer = setTimeout(async () => {
      await selectPhoto(current + 1);
      schedule();
    }, interval);
  }
  function imageReady(image) {
    image.loading = "eager";
    if (image.complete && image.naturalWidth) return Promise.resolve(true);
    return new Promise((resolve) => {
      const timeout = setTimeout(() => finish(false), 5000);
      const finish = (loaded) => {
        clearTimeout(timeout);
        image.removeEventListener("load", loadedHandler);
        image.removeEventListener("error", errorHandler);
        resolve(loaded);
      };
      const loadedHandler = () => finish(true);
      const errorHandler = () => {
        if (image.dataset.fallbackSrc && !image.dataset.fallbackTried) {
          image.dataset.fallbackTried = "true";
          image.src = image.dataset.fallbackSrc;
          image.addEventListener("error", errorHandler, { once: true });
        } else finish(false);
      };
      image.addEventListener("load", loadedHandler, { once: true });
      image.addEventListener("error", errorHandler, { once: true });
    });
  }
  function preloadNext() {
    slides[(current + 1) % slides.length].querySelector("img").loading =
      "eager";
  }
  async function selectPhoto(index, announce = false) {
    const target = (index + slides.length) % slides.length;
    const token = ++request;
    const incoming = slides[target];
    const image = incoming.querySelector("img");
    if (!await imageReady(image)) return false;
    try {
      await image.decode();
    } catch (_) {
      if (!image.naturalWidth) return false;
    }
    if (token !== request || target === current || (!announce && !canRun())) return false;

    clearPhotoFade();
    const outgoing = slides[current];
    const active = document.activeElement;
    const focusSelector = outgoing.contains(active)
      ? (active.matches(".frame-play") ? ".frame-play" : ".carousel-photo")
      : null;
    incoming.hidden = false;
    current = target;
    if (focusSelector) incoming.querySelector(focusSelector).focus({ preventScroll: true });

    if (reducedMotion.matches || dialog.open || !incoming.animate) {
      outgoing.hidden = true;
    } else {
      outgoing.classList.add("carousel-fading-frame");
      outgoing.inert = true;
      const incomingFade = incoming.animate({ opacity: [0, 1] }, {
        duration: 420,
        easing: "ease-in-out",
      });
      // Leave the decoded outgoing frame underneath until the new frame has settled.
      const outgoingFade = outgoing.animate({ opacity: [1, 1, 0] }, {
        duration: 420,
        easing: "ease-in-out",
        fill: "forwards",
      });
      clearPhotoFade = () => {
        outgoing.hidden = true;
        outgoing.inert = false;
        outgoing.classList.remove("carousel-fading-frame");
        incomingFade.cancel();
        outgoingFade.cancel();
        clearPhotoFade = () => {};
      };
      incomingFade.finished.then(clearPhotoFade, () => {});
    }
    status.setAttribute("aria-live", announce ? "polite" : "off");
    status.textContent = `${current + 1} of ${slides.length}`;
    preloadNext();
    return true;
  }
  function syncPlayButton() {
    playButtons.forEach((button) => {
      button.textContent = paused ? "Play" : "Pause";
      button.dataset.paused = String(paused);
      button.setAttribute(
        "aria-label",
        paused ? "Play photo carousel" : "Pause photo carousel",
      );
    });
    schedule();
  }
  playButtons.forEach((button) =>
    button.addEventListener("click", () => {
      paused = !paused;
      if (!paused) {
        hovering = false;
        focused = false;
      }
      syncPlayButton();
    }),
  );
  carousel.querySelectorAll("[data-carousel]").forEach((button) =>
    button.addEventListener("click", async () => {
      await selectPhoto(
        current + (button.dataset.carousel === "next" ? 1 : -1),
        true,
      );
      schedule();
    }),
  );
  carousel.addEventListener("keydown", async (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    await selectPhoto(current + (event.key === "ArrowRight" ? 1 : -1), true);
    schedule();
  });
  carousel.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch") {
      hovering = true;
      schedule();
    }
  });
  carousel.addEventListener("pointerleave", () => {
    hovering = false;
    schedule();
  });
  carousel.addEventListener("focusin", () => {
    focused = true;
    schedule();
  });
  carousel.addEventListener("focusout", () => {
    setTimeout(() => {
      focused = carousel.contains(document.activeElement);
      schedule();
    }, 0);
  });
  document.addEventListener("visibilitychange", schedule);
  new IntersectionObserver(
    (entries) => {
      visible =
        entries[0].isIntersecting && entries[0].intersectionRatio >= 0.25;
      schedule();
    },
    { threshold: 0.25 },
  ).observe(carousel);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      paused = true;
      clearPhotoFade();
    }
    syncPlayButton();
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
        selectPhoto(current + (dx < 0 ? 1 : -1), true).then(schedule);
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
    previous.addEventListener("click", async () => {
      if (await selectPhoto(current - 1, true)) showLargePhoto("previous");
    });
    next.addEventListener("click", async () => {
      if (await selectPhoto(current + 1, true)) showLargePhoto("next");
    });
    controls.append(previous, gallery, next);
    content.append(heading, image, caption, controls);
    if (focusControl) (focusControl === "previous" ? previous : next).focus();
  }
  carousel.querySelectorAll("[data-open-photo]").forEach((button) =>
    button.addEventListener("click", async () => {
      if (swiped) return;
      if (!(await selectPhoto(Number(button.dataset.openPhoto), true))) return;
      showLargePhoto();
      dialog.showModal();
      schedule();
    }),
  );
  document
    .querySelector(".drawer-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    slides[current].querySelector("button").focus();
    schedule();
  });
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
  dialog.addEventListener("keydown", async (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    if (
      await selectPhoto(current + (event.key === "ArrowRight" ? 1 : -1), true)
    )
      showLargePhoto(event.key === "ArrowRight" ? "next" : "previous");
  });
  status.setAttribute("aria-live", "off");
  preloadNext();
  syncPlayButton();

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
        .slice(0, 6);
      if (rendered.length && !notes.contains(document.activeElement)) {
        const currentLinks = [...notes.querySelectorAll(".front-note")];
        const changed = currentLinks.length !== rendered.length || rendered.some((note, i) =>
          note.href !== currentLinks[i]?.href ||
          note.querySelector("p").textContent !== currentLinks[i]?.querySelector("p").textContent
        );
        if (changed) notes.replaceChildren(...rendered);
      }
    } catch (_) {
      /* The pre-rendered notes stay available if the feed cannot be read. */
    }
  }
  const notesReady = refreshNotes();
  if (mastheadName && !introMotion.matches && Element.prototype.animate) {
    Promise.all([introReady, notesReady]).then(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (introMotion.matches || notes.contains(document.activeElement)) return;
        const cards = [...notes.querySelectorAll(".front-note")];
        const animations = cards.map((card, i) => card.animate([
          { opacity: 0, translate: "0 -11px", scale: "0.97" },
          { opacity: 1, translate: "0 2px", scale: "1", offset: 0.8 },
          { opacity: 1, translate: "0 0", scale: "1" },
        ], { duration: 310, delay: i * 105, fill: "backwards", easing: "ease-out" }));
        function unbind() {
          notes.removeEventListener("focusin", skipPinning);
          introMotion.removeEventListener("change", skipPinning);
        }
        function skipPinning() {
          animations.forEach((animation) => animation.cancel());
          unbind();
        }
        notes.addEventListener("focusin", skipPinning);
        introMotion.addEventListener("change", skipPinning);
        Promise.allSettled(animations.map((animation) => animation.finished)).then(unbind);
      }, { rootMargin: "0px 0px 45px" });
      observer.observe(notes);
    });
  }
})();
