(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const palette = ["#2f6f58", "#b46a3c", "#17201b", "#eef4f0"];
  let toastTimer;

  const showToast = (message) => {
    let toast = document.querySelector(".trevor-egg-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "trevor-egg-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  };

  const style = document.createElement("style");
  style.textContent = `
    .trevor-egg-toast {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 9997;
      max-width: min(330px, calc(100vw - 36px));
      border: 1px solid #dce5df;
      border-radius: 8px;
      padding: 12px 15px;
      color: #17201b;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 18px 38px rgba(26, 45, 36, 0.14);
      font: 700 0.82rem/1.45 "Inter", Arial, sans-serif;
      opacity: 0;
      pointer-events: none;
      transform: translateY(18px);
      transition: opacity 220ms ease, transform 260ms ease;
    }

    .trevor-egg-toast.is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    .trevor-confetti {
      position: fixed;
      top: -12px;
      z-index: 9996;
      width: 7px;
      height: 11px;
      border-radius: 2px;
      pointer-events: none;
      animation: trevor-confetti-fall var(--duration) ease-in forwards;
    }

    @keyframes trevor-confetti-fall {
      to {
        opacity: 0;
        transform: translate3d(var(--drift), 105vh, 0) rotate(540deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .trevor-egg-toast {
        transition: none;
      }
    }
  `;
  document.head.appendChild(style);

  const celebrate = () => {
    showToast("Secret unlocked. Curiosity suits you.");

    if (reducedMotion) {
      return;
    }

    for (let index = 0; index < 34; index += 1) {
      const piece = document.createElement("span");
      piece.className = "trevor-confetti";
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = palette[index % palette.length];
      piece.style.setProperty("--drift", `${Math.random() * 100 - 50}px`);
      piece.style.setProperty("--duration", `${1.7 + Math.random() * 1.2}s`);
      document.body.appendChild(piece);
      window.setTimeout(() => piece.remove(), 3200);
    }
  };

  const konami = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let konamiIndex = 0;
  let typed = "";
  let brandClicks = 0;
  let brandTimer;

  document.addEventListener("keydown", (event) => {
    if (event.target.matches("input, textarea, select, [contenteditable='true']")) {
      return;
    }

    if (event.key === konami[konamiIndex]) {
      konamiIndex += 1;
      if (konamiIndex === konami.length) {
        konamiIndex = 0;
        celebrate();
      }
    } else {
      konamiIndex = 0;
    }

    if (event.key.length === 1) {
      typed = `${typed}${event.key.toLowerCase()}`.slice(-6);
      if (typed === "trevor") {
        typed = "";
        showToast("You found Trevor's quiet little secret.");
      }
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".brand")) {
      return;
    }

    brandClicks += 1;
    window.clearTimeout(brandTimer);
    brandTimer = window.setTimeout(() => {
      brandClicks = 0;
    }, 1400);

    if (brandClicks === 5) {
      brandClicks = 0;
      showToast("Five clicks. You clearly pay attention.");
    }
  });

  window.setTimeout(() => {
    console.log(
      "%cTrevor | kinyash.site",
      "color:#2f6f58;font-size:18px;font-weight:800;",
    );
    console.log(
      "%cYou found the console. Try typing Trevor while you are not inside a form.",
      "color:#5d6a62;font-size:12px;",
    );
  }, 500);
})();
