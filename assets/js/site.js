/* ============================================================
   rajadhanda.me — shared scripts
   Theme toggle + subpage fade transitions. Loaded with `defer`.
   The FOUC-prevention theme snippet stays inline in each <head>.
   ============================================================ */

// Theme toggle (persisted to localStorage)
(function () {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  const html = document.documentElement;
  const syncButton = () => {
    const dark = html.getAttribute("data-theme") === "midnight";
    btn.setAttribute("aria-pressed", String(dark));
    btn.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to midnight mode",
    );
  };
  syncButton();
  btn.addEventListener("click", () => {
    if (html.getAttribute("data-theme") === "midnight") {
      html.removeAttribute("data-theme");
      try {
        localStorage.setItem("theme", "light");
      } catch (_) {}
    } else {
      html.setAttribute("data-theme", "midnight");
      try {
        localStorage.setItem("theme", "midnight");
      } catch (_) {}
    }
    syncButton();
  });
})();

// Subpage fade transition on internal navigation
(function () {
  if (!document.body.classList.contains("subpage")) return;
  const overlay = document.getElementById("pageTransition");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Reset overlay on load and on bfcache restore (back navigation)
  function reset() {
    if (overlay) {
      overlay.classList.remove("active");
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
    }
    document.body.style.overflow = "";
  }
  reset();
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) reset();
  });
  if (!overlay || reducedMotion) return;

  document
    .querySelectorAll('a[href^="/"], a[href^="./"], a.nav-back')
    .forEach((link) => {
      link.addEventListener("click", function (e) {
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          this.target === "_blank" ||
          this.hasAttribute("download")
        )
          return;
        const href = this.getAttribute("href");
        if (!href || href === "#" || /^(mailto|tel):/.test(href)) return;
        try {
          const u = new URL(href, window.location.origin);
          if (u.hostname && u.hostname !== window.location.hostname) return;
        } catch (_) {}
        e.preventDefault();
        overlay.classList.add("active");
        setTimeout(() => window.location.assign(href), 300);
      });
    });
})();
