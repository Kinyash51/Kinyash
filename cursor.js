(() => {
  "use strict";

  const supportsPointer = window.matchMedia("(pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!supportsPointer || reducedMotion) {
    return;
  }

  const style = document.createElement("style");
  style.textContent = `
    .trevor-cursor-ring,
    .trevor-cursor-dot {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transform: translate(-50%, -50%);
      transition:
        width 180ms ease,
        height 180ms ease,
        opacity 160ms ease,
        background 180ms ease,
        border-color 180ms ease;
    }

    .trevor-cursor-ring {
      width: 28px;
      height: 28px;
      border: 1px solid rgba(47, 111, 88, 0.68);
      border-radius: 50%;
      background: rgba(248, 250, 247, 0.08);
    }

    .trevor-cursor-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #b46a3c;
    }

    .trevor-cursor-ring.is-visible,
    .trevor-cursor-dot.is-visible {
      opacity: 1;
    }

    .trevor-cursor-ring.is-interactive {
      width: 42px;
      height: 42px;
      border-color: rgba(180, 106, 60, 0.72);
      background: rgba(180, 106, 60, 0.08);
    }

    .trevor-cursor-ring.is-pressed {
      width: 20px;
      height: 20px;
      background: rgba(47, 111, 88, 0.14);
    }

    .trevor-click-ring {
      position: fixed;
      z-index: 9998;
      width: 24px;
      height: 24px;
      border: 1px solid rgba(180, 106, 60, 0.65);
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%) scale(0.5);
      animation: trevor-click-ring 420ms ease-out forwards;
    }

    @keyframes trevor-click-ring {
      to {
        opacity: 0;
        transform: translate(-50%, -50%) scale(2.2);
      }
    }
  `;
  document.head.appendChild(style);

  const ring = document.createElement("span");
  ring.className = "trevor-cursor-ring";
  ring.setAttribute("aria-hidden", "true");
  const dot = document.createElement("span");
  dot.className = "trevor-cursor-dot";
  dot.setAttribute("aria-hidden", "true");
  document.body.append(ring, dot);

  let pointerX = -100;
  let pointerY = -100;
  let ringX = -100;
  let ringY = -100;

  const animate = () => {
    ringX += (pointerX - ringX) * 0.18;
    ringY += (pointerY - ringY) * 0.18;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    window.requestAnimationFrame(animate);
  };

  document.addEventListener("mousemove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    dot.style.left = `${pointerX}px`;
    dot.style.top = `${pointerY}px`;
    ring.classList.add("is-visible");
    dot.classList.add("is-visible");
  });

  document.addEventListener("mouseover", (event) => {
    const interactive = event.target.closest(
      "a, button, input, textarea, select, summary, [role='button']",
    );
    ring.classList.toggle("is-interactive", Boolean(interactive));
  });

  document.addEventListener("mousedown", () => ring.classList.add("is-pressed"));
  document.addEventListener("mouseup", () => ring.classList.remove("is-pressed"));

  document.addEventListener("click", (event) => {
    const clickRing = document.createElement("span");
    clickRing.className = "trevor-click-ring";
    clickRing.style.left = `${event.clientX}px`;
    clickRing.style.top = `${event.clientY}px`;
    document.body.appendChild(clickRing);
    window.setTimeout(() => clickRing.remove(), 450);
  });

  document.addEventListener("mouseleave", () => {
    ring.classList.remove("is-visible");
    dot.classList.remove("is-visible");
  });

  animate();
})();
