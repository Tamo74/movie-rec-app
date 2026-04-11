// ===============================
// LOAD ON PAGE START
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  loadSettings();
  setupSizeButtons("textSizeOptions", "textSize");
  setupSizeButtons("iconSizeOptions", "iconSize");
});

// ===============================
// SECTION NAVIGATION
// ===============================
function setupNavigation() {
  const links = document.querySelectorAll(".settings-nav-link");
  const sections = document.querySelectorAll(".settings-section");

  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();

      // Remove active from all links
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const target = link.dataset.section;

      // Switch visible section
      sections.forEach(sec => {
        sec.classList.remove("active");
        if (sec.id === `section-${target}`) {
          sec.classList.add("active");
        }
      });
    });
  });
}

// ===============================
// SAVE SETTINGS
// ===============================
function saveChanges() {
  const settings = {
    // Account
    firstName: getValue("firstName"),
    surname: getValue("surname"),
    email: getValue("email"),
    password: getValue("password"),
    birthday: getValue("birthday"),
    pronouns: getValue("pronouns"),

    // Accessibility
    textSize: getActiveSize("textSizeOptions"),
    iconSize: getActiveSize("iconSizeOptions"),
    colourFilter: getValue("colourFilter"),
    darkMode: getChecked("darkMode"),
    autoScroll: getChecked("autoScroll"),
    textToSpeech: getChecked("textToSpeech"),

    // Preferences
    favouriteGenre: getValue("favouriteGenre"),
    language: getValue("language")
  };

  localStorage.setItem("userSettings", JSON.stringify(settings));
  applySettings(settings);
  showToast();
}

// ===============================
// LOAD SETTINGS
// ===============================
function loadSettings() {
  const saved = JSON.parse(localStorage.getItem("userSettings"));
  if (!saved) return;

  // Account
  setValue("firstName", saved.firstName);
  setValue("surname", saved.surname);
  setValue("email", saved.email);
  setValue("password", saved.password);
  setValue("birthday", saved.birthday);
  setValue("pronouns", saved.pronouns);

  // Sidebar name
  document.getElementById("sidebarFirstName").textContent = saved.firstName || "First name";
  document.getElementById("sidebarSurname").textContent = saved.surname || "Surname";

  // Accessibility
  setActiveSize("textSizeOptions", saved.textSize);
  setActiveSize("iconSizeOptions", saved.iconSize);
  setValue("colourFilter", saved.colourFilter);
  setChecked("darkMode", saved.darkMode);
  setChecked("autoScroll", saved.autoScroll);
  setChecked("textToSpeech", saved.textToSpeech);

  // Preferences
  setValue("favouriteGenre", saved.favouriteGenre);
  setValue("language", saved.language);

  applySettings(saved);
}

// ===============================
// APPLY SETTINGS TO PAGE
// ===============================
function applySettings(s) {
  document.body.style.fontSize = sizeToRem(s.textSize);
  document.documentElement.style.setProperty("--icon-scale", sizeToScale(s.iconSize));

  // Colour filter overlay
  document.body.classList.remove("filter-red", "filter-blue", "filter-yellow", "filter-green");
  if (s.colourFilter && s.colourFilter !== "none") {
    document.body.classList.add(`filter-${s.colourFilter}`);
  }

  // Dark mode
  document.body.classList.toggle("dark-mode", s.darkMode);
}

// ===============================
// HELPERS
// ===============================
function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : "";
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined) el.value = value;
}

function getChecked(id) {
  const el = document.getElementById(id);
  return el ? el.checked : false;
}

function setChecked(id, value) {
  const el = document.getElementById(id);
  if (el) el.checked = value;
}

function setupSizeButtons(containerId, key) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

function getActiveSize(containerId) {
  const active = document.querySelector(`#${containerId} .size-btn.active`);
  return active ? active.dataset.value : "m";
}

function setActiveSize(containerId, value) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll(".size-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.value === value);
  });
}

function sizeToRem(size) {
  return {
    xs: "0.8rem",
    s: "0.9rem",
    m: "1rem",
    l: "1.1rem",
    xl: "1.25rem"
  }[size] || "1rem";
}

function sizeToScale(size) {
  return {
    xs: "0.8",
    s: "0.9",
    m: "1",
    l: "1.2",
    xl: "1.4"
  }[size] || "1";
}

// ===============================
// SAVE TOAST
// ===============================
function showToast() {
  const toast = document.getElementById("saveToast");
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 2000);
}
