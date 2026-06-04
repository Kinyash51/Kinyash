const navToggle = document.querySelector(".nav-toggle");
const navToggleIcon = navToggle.querySelector("i");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const sections = document.querySelectorAll("main section[id]");
const contactForm = document.querySelector("#contact-form");
const successNote = document.querySelector("#success-note");
const noteMessage = document.querySelector("#note-message");
const noteSignature = document.querySelector("#note-signature");
const supportModal = document.querySelector("#support-modal");
const supportSection = document.querySelector("#support");
const supportReveal = document.querySelector(".support-reveal");
const supportOptions = document.querySelector("#support-options");
const supportButtons = document.querySelectorAll(".support-open");
const modalBackdrop = document.querySelector(".modal-backdrop");
const modalClose = document.querySelector(".modal-close");
const modalIcon = document.querySelector("#modal-icon");
const modalTitle = document.querySelector("#modal-title");
const modalNote = document.querySelector("#modal-note");
const modalDetails = document.querySelector("#modal-details");
const modalAction = document.querySelector(".modal-action");
const revealItems = document.querySelectorAll(".reveal-item");
const formResetDelay = 60000;
let lastSupportButton = null;
let activeSupportDetails = "";

supportButtons.forEach((button) => {
  button.tabIndex = -1;
});

const supportContent = {
  mpesa: {
    icon: "fa-solid fa-mobile-screen-button",
    title: "M-Pesa",
    note: "M-Pesa support details will be added here.",
    rows: [
      ["Till", "coming soon"],
      ["Paybill", "coming soon"],
      ["Phone", "coming soon"],
    ],
  },
  paypal: {
    icon: "fa-brands fa-paypal",
    title: "PayPal",
    note: "PayPal support link will be added here.",
    rows: [
      ["Link", "coming soon"],
      ["Email", "coming soon"],
    ],
  },
  other: {
    icon: "fa-solid fa-circle-plus",
    title: "Other Methods",
    note: "More ways to support Trevor will be added here.",
    rows: [
      ["Card", "coming soon"],
      ["Crypto", "coming soon"],
      ["Bank", "coming soon"],
    ],
  },
};

const isCopyableValue = (value) => value && value.toLowerCase() !== "coming soon";

const updateModalAction = (rows) => {
  const details = rows
    .filter(([, value]) => isCopyableValue(value))
    .map(([label, value]) => `${label}: ${value}`);

  activeSupportDetails = details.join("\n");
  modalAction.disabled = !activeSupportDetails;
  modalAction.innerHTML = `<i class="fa-regular fa-copy" aria-hidden="true"></i>${
    activeSupportDetails ? "Copy details" : "Details coming soon"
  }`;
};

const showRevealItem = (item) => {
  item.classList.add("is-visible");
};

const setActiveNavLink = (sectionId) => {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${sectionId}`);
  });
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        showRevealItem(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -60px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach(showRevealItem);
}

if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveNavLink(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-38% 0px -52% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => navObserver.observe(section));
} else {
  setActiveNavLink("home");
}

navToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  navToggleIcon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-ellipsis";
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    navToggleIcon.className = "fa-solid fa-ellipsis";
  });
});

supportReveal.addEventListener("click", () => {
  const isReady = supportSection.classList.toggle("is-ready");

  supportReveal.setAttribute("aria-expanded", String(isReady));
  supportOptions.setAttribute("aria-hidden", String(!isReady));
  supportButtons.forEach((button) => {
    button.tabIndex = isReady ? 0 : -1;
  });

  if (isReady) {
    supportReveal.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i>Choose a method';
    setTimeout(() => {
      supportButtons[0]?.focus();
    }, 360);
  } else {
    supportReveal.innerHTML = '<i class="fa-solid fa-hand-holding-dollar" aria-hidden="true"></i>Support';
  }
});

const closeSupportModal = () => {
  supportModal.classList.remove("is-open");
  supportModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastSupportButton) {
    lastSupportButton.focus();
  }
};

supportButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const content = supportContent[button.dataset.support];

    if (!content) {
      return;
    }

    lastSupportButton = button;
    modalIcon.innerHTML = `<i class="${content.icon}" aria-hidden="true"></i>`;
    modalTitle.textContent = content.title;
    modalNote.textContent = content.note;
    modalDetails.innerHTML = content.rows
      .map(
        ([label, value]) =>
          `<div class="modal-detail-row"><span>${label}</span><span>${value}</span></div>`
      )
      .join("");
    updateModalAction(content.rows);

    supportModal.classList.add("is-open");
    supportModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modalClose.focus();
  });
});

modalBackdrop.addEventListener("click", closeSupportModal);
modalClose.addEventListener("click", closeSupportModal);

modalAction.addEventListener("click", async () => {
  if (!activeSupportDetails) {
    return;
  }

  try {
    await navigator.clipboard.writeText(activeSupportDetails);
    modalAction.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i>Copied';

    setTimeout(() => {
      if (supportModal.classList.contains("is-open")) {
        modalAction.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i>Copy details';
      }
    }, 1600);
  } catch {
    modalAction.innerHTML = '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>Copy failed';
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && supportModal.classList.contains("is-open")) {
    closeSupportModal();
  }
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (contactForm.classList.contains("is-sending")) {
    return;
  }

  const submitButton = contactForm.querySelector("button[type='submit']");
  submitButton.disabled = true;
  contactForm.classList.add("is-sending");

  setTimeout(() => {
    contactForm.hidden = true;
  }, 720);

  setTimeout(() => {
    successNote.removeAttribute("aria-hidden");
    successNote.classList.add("is-visible");
  }, 970);

  setTimeout(() => {
    const words = ["i", "will", "be", "right", "with", "you"];
    noteMessage.textContent = "";

    words.forEach((word, index) => {
      setTimeout(() => {
        const wordElement = document.createElement("span");
        wordElement.className = "typed-word";
        wordElement.textContent = word;
        noteMessage.appendChild(wordElement);
      }, index * 240);
    });

    setTimeout(() => {
      noteSignature.textContent = "- trevor";
      noteSignature.classList.add("is-visible");
    }, words.length * 240 + 180);
  }, 1270);

  setTimeout(() => {
    successNote.classList.add("is-leaving");
  }, formResetDelay);

  setTimeout(() => {
    contactForm.hidden = false;
    contactForm.reset();
    contactForm.classList.remove("is-sending");
    contactForm.classList.add("is-returning");
    submitButton.disabled = false;

    successNote.classList.remove("is-visible", "is-leaving");
    successNote.setAttribute("aria-hidden", "true");
    noteMessage.textContent = "";
    noteSignature.textContent = "";
    noteSignature.classList.remove("is-visible");
  }, formResetDelay + 650);

  setTimeout(() => {
    contactForm.classList.remove("is-returning");
  }, formResetDelay + 1350);
});
