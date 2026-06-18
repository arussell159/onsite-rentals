const scriptUrl = new URL(document.currentScript.src);
const siteRoot = new URL("../", scriptUrl);

async function loadIncludes() {
  const includeTargets = document.querySelectorAll("[data-include]");

  await Promise.all(
    [...includeTargets].map(async (target) => {
      const includeName = target.dataset.include;
      const includeUrl = new URL(`includes/${includeName}.html`, siteRoot);

      try {
        const response = await fetch(includeUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        target.innerHTML = await response.text();
        resolveSharedPaths(target);
        target.replaceWith(...target.childNodes);
      } catch (error) {
        console.error(`Could not load ${includeName} include:`, error);
        target.innerHTML = `<p class="include-error">Could not load the ${includeName}.</p>`;
      }
    })
  );
}

function resolveSharedPaths(container) {
  container.querySelectorAll("[data-site-href]").forEach((element) => {
    element.href = new URL(element.dataset.siteHref, siteRoot);
    element.removeAttribute("data-site-href");
  });

  container.querySelectorAll("[data-site-src]").forEach((element) => {
    element.src = new URL(element.dataset.siteSrc, siteRoot);
    element.removeAttribute("data-site-src");
  });
}

function initializeSite() {
  const menuToggle = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  const megaMenuTrigger = document.querySelector(".mega-menu-trigger");
  const megaMenu = document.querySelector(".mega-menu");
  const siteHeader = document.querySelector(".site-header");
  const mobileBreakpoint = window.matchMedia("(max-width: 860px)");

  document.querySelectorAll("[data-current-year]").forEach((year) => {
    year.textContent = new Date().getFullYear();
  });

  function closeMegaMenu() {
    if (!megaMenuTrigger || !megaMenu) return;
    megaMenuTrigger.setAttribute("aria-expanded", "false");
    megaMenu.classList.remove("is-open");
  }

  function closeMobileMenu() {
    if (!menuToggle || !primaryNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    primaryNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    closeMegaMenu();
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    primaryNav?.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);

    if (!isOpen) {
      primaryNav?.querySelector("button, a")?.focus();
    }
  });

  megaMenuTrigger?.addEventListener("click", () => {
    const isOpen = megaMenuTrigger.getAttribute("aria-expanded") === "true";
    megaMenuTrigger.setAttribute("aria-expanded", String(!isOpen));
    megaMenu?.classList.toggle("is-open", !isOpen);
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) {
      if (mobileBreakpoint.matches) {
        closeMobileMenu();
      } else {
        closeMegaMenu();
      }
    }
  });

  primaryNav?.addEventListener("click", (event) => {
    const link = event.target.closest("a");

    if (link && mobileBreakpoint.matches) {
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
      menuToggle?.focus();
    }

    if (
      event.key === "Tab" &&
      mobileBreakpoint.matches &&
      primaryNav?.classList.contains("is-open")
    ) {
      const focusableElements = [
        menuToggle,
        ...primaryNav.querySelectorAll('a[href], button:not([disabled])')
      ].filter(Boolean);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      closeMobileMenu();
    }
  });

  function updateHeaderState() {
    siteHeader?.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  window.addEventListener("scroll", updateHeaderState, { passive: true });
  updateHeaderState();
}

loadIncludes().then(initializeSite);
