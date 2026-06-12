const navToggle = document.querySelector(".nav-toggle");
const navToggleIcon = navToggle.querySelector("i");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const exploreMenu = document.querySelector(".explore-menu");
const exploreToggle = document.querySelector(".explore-toggle");
const explorePreviewLinks = document.querySelectorAll(".explore-list a[data-preview-title]");
const explorePreview = document.querySelector("#explore-preview");
const explorePreviewIcon = document.querySelector("#explore-preview-icon");
const explorePreviewTitle = document.querySelector("#explore-preview-title");
const explorePreviewDescription = document.querySelector("#explore-preview-description");
const explorePreviewMeta = document.querySelector("#explore-preview-meta");
const sections = document.querySelectorAll("main section[id]");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
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
const toastRegion = document.querySelector("#toast-region");
const homeSpotifyStatus = document.querySelector("#home-spotify-status");
const homeSpotifyImage = document.querySelector("#home-spotify-image");
const homeSpotifyLabel = document.querySelector("#home-spotify-label");
const homeSpotifyTitle = document.querySelector("#home-spotify-title");
const homeSpotifyArtist = document.querySelector("#home-spotify-artist");
const homeSpotifyEqualizer = document.querySelector("#home-spotify-equalizer");
const revealItems = document.querySelectorAll(".reveal-item");
const focusableModalSelector =
  'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const formResetDelay = 60000;
let lastSupportButton = null;
let activeSupportDetails = "";
let toastTimer = null;
let spotifyRefreshTimer = null;
let explorePreviewTimer = null;

supportButtons.forEach((button) => {
  button.tabIndex = -1;
});

const supportContent = {
  pochi: {
    icon: "fa-solid fa-mobile-screen-button",
    title: "Pochi La Biashara",
    note: "Open M-PESA, choose Pochi La Biashara, select Pay to Pochi, then enter the number below.",
    rows: [
      ["Method", "Pochi La Biashara"],
      ["Number", "+254 748 524 534"],
    ],
  },
};

const isCopyableValue = (value) => value && value.toLowerCase() !== "coming soon";

const updateModalAction = (rows) => {
  const numberRow = rows.find(
    ([label, value]) => label.toLowerCase() === "number" && isCopyableValue(value)
  );

  activeSupportDetails = numberRow?.[1] || "";
  modalAction.disabled = !activeSupportDetails;
  modalAction.innerHTML = `<i class="fa-regular fa-copy" aria-hidden="true"></i>${
    activeSupportDetails ? "Copy number" : "Number unavailable"
  }`;
};

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through for browsers that block the Clipboard API.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Copy failed");
  }
};

const showToast = (message, type = "success") => {
  window.clearTimeout(toastTimer);
  toastRegion.innerHTML = "";

  const toast = document.createElement("div");
  toast.className = `toast is-${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.innerHTML = `
    <span class="toast-icon" aria-hidden="true">
      <i class="fa-solid fa-${type === "error" ? "triangle-exclamation" : "check"}"></i>
    </span>
    <span>${message}</span>
  `;
  toastRegion.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("is-visible"));
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => toast.remove(), 240);
  }, 2600);
};

const showRevealItem = (item) => {
  item.classList.add("is-visible");
};

const renderHomeSpotify = (track) => {
  homeSpotifyStatus.classList.remove("is-loading", "is-unavailable", "is-playing");

  if (!track) {
    homeSpotifyStatus.classList.add("is-unavailable");
    homeSpotifyImage.hidden = true;
    homeSpotifyImage.removeAttribute("src");
    homeSpotifyLabel.textContent = "Spotify";
    homeSpotifyTitle.textContent = "Nothing playing right now";
    homeSpotifyArtist.textContent = "See recent and top tracks";
    homeSpotifyEqualizer.hidden = true;
    return;
  }

  homeSpotifyStatus.classList.toggle("is-playing", Boolean(track.isPlaying));
  homeSpotifyLabel.textContent = track.isPlaying ? "Playing now" : "Recently paused";
  homeSpotifyTitle.textContent = track.title;
  homeSpotifyArtist.textContent = track.artist;
  homeSpotifyImage.hidden = !track.image;
  homeSpotifyImage.src = track.image || "";
  homeSpotifyEqualizer.hidden = !track.isPlaying;
};

const loadHomeSpotify = async () => {
  if (!homeSpotifyStatus || document.hidden) {
    return;
  }

  try {
    const response = await fetch("/api/spotify?range=short_term");
    if (!response.ok) {
      throw new Error("Spotify unavailable");
    }
    const data = await response.json();
    renderHomeSpotify(data.current);
  } catch {
    homeSpotifyStatus.classList.remove("is-loading", "is-playing");
    homeSpotifyStatus.classList.add("is-unavailable");
    homeSpotifyImage.hidden = true;
    homeSpotifyImage.removeAttribute("src");
    homeSpotifyLabel.textContent = "Spotify";
    homeSpotifyTitle.textContent = "Listening status unavailable";
    homeSpotifyArtist.textContent = "Open the full music page";
    homeSpotifyEqualizer.hidden = true;
  }
};

const scheduleHomeSpotify = () => {
  window.clearInterval(spotifyRefreshTimer);
  if (!document.hidden) {
    loadHomeSpotify();
    spotifyRefreshTimer = window.setInterval(loadHomeSpotify, 30000);
  }
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

const closeExploreMenu = () => {
  exploreMenu.classList.remove("is-open");
  exploreToggle.setAttribute("aria-expanded", "false");
};

const updateExplorePreview = (link) => {
  if (!explorePreview || window.matchMedia("(hover: none)").matches) return;

  window.clearTimeout(explorePreviewTimer);
  explorePreview.classList.add("is-changing");
  explorePreviewTimer = window.setTimeout(() => {
    explorePreview.className = `explore-preview theme-${link.dataset.previewTheme}`;
    explorePreviewIcon.className = link.dataset.previewIcon;
    explorePreviewTitle.textContent = link.dataset.previewTitle;
    explorePreviewDescription.textContent = link.dataset.previewCopy;
    explorePreviewMeta.textContent = link.dataset.previewMeta;
  }, 120);
};

explorePreviewLinks.forEach((link) => {
  link.addEventListener("mouseenter", () => updateExplorePreview(link));
  link.addEventListener("focus", () => updateExplorePreview(link));
});

navToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  navToggleIcon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-ellipsis";

  if (!isOpen) {
    closeExploreMenu();
  }
});

exploreToggle.addEventListener("click", () => {
  const isOpen = exploreMenu.classList.toggle("is-open");
  exploreToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("is-open");
    closeExploreMenu();
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    navToggleIcon.className = "fa-solid fa-ellipsis";
  });
});

document.addEventListener("click", (event) => {
  if (!exploreMenu.contains(event.target)) {
    closeExploreMenu();
  }
});

supportReveal.addEventListener("click", () => {
  const isReady = supportSection.classList.toggle("is-ready");

  supportReveal.setAttribute("aria-expanded", String(isReady));
  supportOptions.setAttribute("aria-hidden", String(!isReady));
  supportButtons.forEach((button) => {
    button.tabIndex = isReady ? 0 : -1;
  });

  if (isReady) {
    supportOptions.querySelectorAll(".reveal-item").forEach(showRevealItem);
    supportReveal.innerHTML =
      'Hide M-PESA details<i class="fa-solid fa-chevron-up" aria-hidden="true"></i>';
    setTimeout(() => {
      supportButtons[0]?.focus();
    }, 360);
  } else {
    supportReveal.innerHTML =
      'View M-PESA details<i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';
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
    window.setTimeout(() => modalClose.focus(), 80);
  });
});

modalBackdrop.addEventListener("click", closeSupportModal);
modalClose.addEventListener("click", closeSupportModal);

modalAction.addEventListener("click", async () => {
  if (!activeSupportDetails) {
    return;
  }

  try {
    await copyText(activeSupportDetails);
    showToast("Pochi number copied.");
  } catch {
    showToast("Could not copy the number.", "error");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeExploreMenu();
  }

  if (event.key === "Escape" && supportModal.classList.contains("is-open")) {
    closeSupportModal();
  }

  if (event.key === "Tab" && supportModal.classList.contains("is-open")) {
    const focusable = [...supportModal.querySelectorAll(focusableModalSelector)].filter(
      (element) => !element.hidden && element.offsetParent !== null
    );
    const first = focusable[0];
    const last = focusable.at(-1);

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
});

const setFormStatus = (message, type = "") => {
  formStatus.textContent = message;
  formStatus.classList.toggle("is-error", type === "error");
  formStatus.classList.toggle("is-success", type === "success");
};

const contactFields = [
  ...contactForm.querySelectorAll("input:not([type='hidden']):not(.botcheck), textarea"),
];

const getFieldMessage = (field) => {
  if (field.validity.valueMissing) {
    return field.name === "message" ? "Write a short message first." : `Enter your ${field.name}.`;
  }
  if (field.validity.typeMismatch) {
    return "Enter a valid email address.";
  }
  return "";
};

const validateContactField = (field) => {
  const message = getFieldMessage(field);
  const error = document.querySelector(`#${field.getAttribute("aria-describedby")}`);
  field.setAttribute("aria-invalid", String(Boolean(message)));
  if (error) error.textContent = message;
  return !message;
};

contactFields.forEach((field) => {
  field.addEventListener("blur", () => validateContactField(field));
  field.addEventListener("input", () => {
    if (field.getAttribute("aria-invalid") === "true") validateContactField(field);
  });
});

const playContactSuccess = (submitButton) => {
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
    contactFields.forEach((field) => {
      field.removeAttribute("aria-invalid");
      const error = document.querySelector(`#${field.getAttribute("aria-describedby")}`);
      if (error) error.textContent = "";
    });
    contactForm.classList.remove("is-sending");
    contactForm.classList.add("is-returning");
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
    submitButton.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i>Send Message';

    successNote.classList.remove("is-visible", "is-leaving");
    successNote.setAttribute("aria-hidden", "true");
    noteMessage.textContent = "";
    noteSignature.textContent = "";
    noteSignature.classList.remove("is-visible");
    setFormStatus("");
  }, formResetDelay + 650);

  setTimeout(() => {
    contactForm.classList.remove("is-returning");
  }, formResetDelay + 1350);
};

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (contactForm.classList.contains("is-sending")) {
    return;
  }

  const submitButton = contactForm.querySelector("button[type='submit']");
  const fieldResults = contactFields.map((field) => ({
    field,
    valid: validateContactField(field),
  }));
  const firstInvalidField = fieldResults.find((result) => !result.valid)?.field;
  if (firstInvalidField) {
    setFormStatus("Check the highlighted fields.", "error");
    firstInvalidField.focus();
    return;
  }

  const formData = new FormData(contactForm);
  const accessKey = String(formData.get("access_key") || "");

  if (!accessKey || accessKey === "YOUR_WEB3FORMS_ACCESS_KEY") {
    setFormStatus("Add your Web3Forms access key before this form can send.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  submitButton.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>Sending';
  setFormStatus("Sending your message...");

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Message could not be sent.");
    }

    setFormStatus("Message sent.", "success");
    showToast("Message sent successfully.");
    playContactSuccess(submitButton);
  } catch (error) {
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
    submitButton.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i>Send Message';
    setFormStatus(error.message || "Message could not be sent. Please try again.", "error");
    showToast(error.message || "Message could not be sent.", "error");
  }
});

document.addEventListener("visibilitychange", scheduleHomeSpotify);
scheduleHomeSpotify();
