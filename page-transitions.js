const transitionDuration = 180;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const restorePage = () => {
  document.body.classList.remove("page-leaving");
};

const isTransitionLink = (link, event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    link.target ||
    link.hasAttribute("download")
  ) {
    return false;
  }

  const destination = new URL(link.href, window.location.href);
  const current = new URL(window.location.href);

  if (destination.origin !== current.origin) return false;
  if (destination.href === current.href) return false;
  if (
    destination.pathname === current.pathname &&
    destination.search === current.search &&
    destination.hash
  ) {
    return false;
  }

  return destination.pathname.endsWith(".html") || destination.pathname.endsWith("/");
};

document.body.classList.add("page-entering");
window.setTimeout(() => {
  document.body.classList.remove("page-entering");
}, 420);

window.addEventListener("animationend", (event) => {
  if (event.animationName === "page-fade-in") {
    document.body.classList.remove("page-entering");
  }
});

window.addEventListener("pageshow", restorePage);

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || !isTransitionLink(link, event) || reduceMotion.matches) return;

  event.preventDefault();
  document.body.classList.remove("page-entering");
  document.body.classList.add("page-leaving");

  window.setTimeout(() => {
    window.location.assign(link.href);
  }, transitionDuration);
});
